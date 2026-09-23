import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { sql, ensureSchema } from '@/lib/db';
import {
  papersForTeacher, papersForStudent, getPaperWithOwner, insertPaper, updatePaper,
  submissionsForStudent, submissionsForTeacher, getSubmissionWithOwner, insertSubmission, updateSubmission,
  teacherFor, insertExtractionJob, extractionJobsForTeacher, getExtractionJob, claimExtractionJob,
} from '@/lib/physics-exam-repository';
import { demoPaper } from '@/lib/physics-exam-demo';
import { approvePaper, makeSubmission, overrideGrade, SubmitSchema } from '@/lib/physics-exam-workflows';
import { startExtraction, checkExtraction, cancelExtraction } from '@/lib/physics-exam-extraction';
import { getFile, storeFile } from '@/lib/physics-exam-storage';
import type { Paper, Answer } from '@/lib/physics-extraction-schema';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_EXTRACTION_MS = 30 * 60 * 1000;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  await ensureSchema();
  try {
    if (user.publicMetadata.role === 'teacher') {
      const [papers, submissions, jobs] = await Promise.all([papersForTeacher(userId), submissionsForTeacher(userId), extractionJobsForTeacher(userId)]);
      return NextResponse.json({
        papers, submissions, config: { vision: !!process.env.OPENAI_API_KEY },
        jobs: jobs.map(({ id, title, createdAt }) => ({ id, title, createdAt })),
      });
    }
    if (user.publicMetadata.role !== 'student')
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    const teacherId = await teacherFor(userId);
    const [papers, submissions] = await Promise.all([papersForStudent(teacherId), submissionsForStudent(userId)]);
    return NextResponse.json({ papers, submissions, config: { vision: !!process.env.OPENAI_API_KEY } });
  } catch {
    return NextResponse.json({ error: 'Cannot read storage. Check the database connection and migrations.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata.role;
  await ensureSchema();
  try {
    // Compare the browser's own Origin and Host headers directly, rather than
    // against new URL(request.url).origin -- that value is reconstructed
    // internally by Next.js and does not reliably reflect the hostname the
    // browser actually connected to.
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) throw Error('Cross-origin write rejected.');

    if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
      const form = await request.formData();
      const action = form.get('action');

      if (action === 'attachment') {
        const file = form.get('file');
        if (!(file instanceof File)) throw Error('Choose an answer file.');
        return NextResponse.json({ file: await storeFile(file, 'answer') });
      }

      if (action !== 'extract') throw Error('Unknown upload action.');
      if (role !== 'teacher') return NextResponse.json({ error: 'Teacher access is required.' }, { status: 403 });
      if (!process.env.OPENAI_API_KEY) throw Error('Configure OPENAI_API_KEY in .env before uploading papers.');
      const combined = form.get('combined') === 'true';
      const question = form.get('questions'), scheme = form.get('scheme');
      if (!(question instanceof File) || (!combined && !(scheme instanceof File)))
        throw Error('Select both PDFs, or choose a combined PDF.');
      const q = await storeFile(question, 'pdf');
      const m = !combined ? await storeFile(scheme as File, 'pdf') : null;
      const files: Paper['files'] = [{ role: combined ? 'combined' : 'questions', file: q }, ...(m ? [{ role: 'scheme' as const, file: m }] : [])];
      // Only starts the extraction: the model's reading of a whole paper runs
      // past this function's time limit, so the page polls extraction-status.
      const started = await startExtraction(await Promise.all(files.map(async (f) => ({ role: f.role, bytes: new Uint8Array((await getFile(f.file.id)).bytes) }))));
      const job = { id: crypto.randomUUID(), teacherId: userId, title: String(form.get('title') || question.name).slice(0, 200), responseId: started.responseId, files, pages: started.pages };
      await insertExtractionJob(job);
      return NextResponse.json({ job: { id: job.id, title: job.title, createdAt: new Date().toISOString() } }, { status: 202 });
    }

    const body = await request.json();

    if (body.action === 'extraction-status') {
      if (role !== 'teacher') return NextResponse.json({ error: 'Teacher access is required.' }, { status: 403 });
      const job = await getExtractionJob(String(body.jobId || ''));
      // Already collected, by an earlier check or another open tab.
      if (!job || job.teacherId !== userId) return NextResponse.json({ status: 'gone' });
      try {
        if (Date.now() - Date.parse(job.createdAt) > MAX_EXTRACTION_MS) {
          await cancelExtraction(job.responseId);
          throw Error('The extraction took longer than 30 minutes and was stopped. Upload fewer pages at a time.');
        }
        const state = await checkExtraction(job.responseId, job.pages);
        if (state.state === 'running') return NextResponse.json({ status: 'running' });
        if (!(await claimExtractionJob(job.id))) return NextResponse.json({ status: 'gone' });
        const paper: Paper = { ...state.extraction, id: crypto.randomUUID(), title: job.title, status: 'draft', files: job.files, revision: 0, createdAt: new Date().toISOString() };
        await insertPaper(userId, paper);
        return NextResponse.json({ status: 'done', paper });
      } catch (e) {
        // A failed job is reported once and then removed, so it is not retried forever.
        await claimExtractionJob(job.id);
        throw e;
      }
    }

    if (body.action === 'demo') {
      if (role !== 'teacher') return NextResponse.json({ error: 'Teacher access is required.' }, { status: 403 });
      const paper = demoPaper();
      await insertPaper(userId, paper);
      return NextResponse.json({ paper });
    }

    if (body.action === 'approve') {
      if (role !== 'teacher') return NextResponse.json({ error: 'Teacher access is required.' }, { status: 403 });
      const input = z.object({ paperId: z.string(), revision: z.number().int(), extraction: z.unknown() }).parse(body);
      const owner = await getPaperWithOwner(input.paperId);
      if (!owner || owner.teacherId !== userId) throw Error('Paper not found.');
      if (owner.paper.revision !== input.revision) throw Error('This paper changed. Reload before saving.');
      const existingSubmissions = await sql`SELECT 1 FROM physics_exam_submissions WHERE paper_id=${input.paperId} LIMIT 1`;
      if (existingSubmissions.length) throw Error('This paper already has submissions. Upload a new revision to preserve grading history.');
      const paper = approvePaper(owner.paper, input.extraction);
      await updatePaper(paper);
      return NextResponse.json({ paper });
    }

    if (body.action === 'submit') {
      if (role !== 'student') return NextResponse.json({ error: 'Student access is required.' }, { status: 403 });
      const input = SubmitSchema.parse(body);
      const owner = await getPaperWithOwner(input.paperId);
      if (!owner) throw Error('Paper not found.');
      const myTeacherId = await teacherFor(userId);
      if (!myTeacherId || myTeacherId !== owner.teacherId) throw Error('Paper not found.');
      const answers: Answer[] = await Promise.all(input.answers.map(async (a) => ({ ...a, file: a.fileId ? (await getFile(a.fileId)).meta : null })));
      const wholePaperFiles = input.wholePaperFiles?.length
        ? await Promise.all(input.wholePaperFiles.map(async (id) => (await getFile(id)).meta))
        : undefined;
      const submission = makeSubmission(owner.paper, user.fullName || user.username || 'Student', input.selfPractice, answers, wholePaperFiles);
      await insertSubmission(userId, submission);
      return NextResponse.json({ submission });
    }

    if (body.action === 'review') {
      if (role !== 'teacher') return NextResponse.json({ error: 'Teacher access is required.' }, { status: 403 });
      const input = z.object({ submissionId: z.string(), questionId: z.string(), score: z.number().int(), note: z.string().max(5000) }).parse(body);
      const owner = await getSubmissionWithOwner(input.submissionId);
      if (!owner) throw Error('Submission not found.');
      const paperOwner = await getPaperWithOwner(owner.submission.paperId);
      if (!paperOwner || paperOwner.teacherId !== userId) throw Error('Submission not found.');
      const submission = overrideGrade(owner.submission, input.questionId, input.score, input.note, paperOwner.paper);
      await updateSubmission(submission);
      return NextResponse.json({ submission });
    }

    throw Error('Unknown action.');
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unable to complete this action.' }, { status: 400 });
  }
}
