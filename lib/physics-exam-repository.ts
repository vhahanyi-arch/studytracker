// physics-exam-repository.ts
//
// Data access for the physics paper upload / marking system, replacing
// physics-exam-studio's original readState()/mutate() (a single global
// JSON blob -- fine for a local single-user prototype, but StudyTrack
// needs every read scoped to the requesting teacher or student). Papers
// and submissions are stored as JSONB payloads (see db.ts), with
// ownership/filter columns pulled out for real SQL-level scoping.

import { sql } from "./db";
import type { Paper, Submission } from "./physics-extraction-schema";

// @neondatabase/serverless does not consistently pre-parse jsonb columns
// into objects across all query shapes, so this defensively handles both
// an already-parsed object and a raw JSON string.
function parsePayload<T>(value: unknown): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);
}

export async function papersForTeacher(teacherId: string): Promise<Paper[]> {
  const rows = await sql`
    SELECT payload FROM physics_exam_papers
    WHERE teacher_id=${teacherId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => parsePayload<Paper>(row.payload));
}

// Students only ever see papers from their own teacher (the same enrollment
// lookup pattern as teacherFor() in app/api/physics/practice/route.ts), and
// only once a teacher has verified and published them (status 'ready').
export async function papersForStudent(teacherId: string | null): Promise<Paper[]> {
  if (!teacherId) return [];
  const rows = await sql`
    SELECT payload FROM physics_exam_papers
    WHERE teacher_id=${teacherId} AND status='ready'
    ORDER BY created_at DESC
  `;
  return rows.map((row) => parsePayload<Paper>(row.payload));
}

export async function getPaperWithOwner(id: string): Promise<{ paper: Paper; teacherId: string } | null> {
  const rows = await sql`
    SELECT payload, teacher_id FROM physics_exam_papers WHERE id=${id}
  `;
  if (!rows.length) return null;
  return { paper: parsePayload<Paper>(rows[0].payload), teacherId: String(rows[0].teacher_id) };
}

export async function insertPaper(teacherId: string, paper: Paper): Promise<void> {
  await sql`
    INSERT INTO physics_exam_papers (id, teacher_id, title, syllabus, status, revision, payload)
    VALUES (${paper.id}, ${teacherId}, ${paper.title}, ${paper.syllabus}, ${paper.status}, ${paper.revision}, ${JSON.stringify(paper)})
  `;
}

export async function updatePaper(paper: Paper): Promise<void> {
  await sql`
    UPDATE physics_exam_papers
    SET title=${paper.title}, syllabus=${paper.syllabus}, status=${paper.status},
        revision=${paper.revision}, payload=${JSON.stringify(paper)}, updated_at=NOW()
    WHERE id=${paper.id}
  `;
}

export async function submissionsForStudent(studentId: string): Promise<Submission[]> {
  const rows = await sql`
    SELECT payload FROM physics_exam_submissions
    WHERE student_id=${studentId}
    ORDER BY created_at DESC
  `;
  return rows.map((row) => parsePayload<Submission>(row.payload));
}

// Every submission to any paper owned by this teacher, regardless of which
// student submitted it -- used for the teacher's review queue.
export async function submissionsForTeacher(teacherId: string): Promise<Submission[]> {
  const rows = await sql`
    SELECT s.payload FROM physics_exam_submissions s
    JOIN physics_exam_papers p ON p.id = s.paper_id
    WHERE p.teacher_id=${teacherId}
    ORDER BY s.created_at DESC
  `;
  return rows.map((row) => parsePayload<Submission>(row.payload));
}

export async function getSubmissionWithOwner(id: string): Promise<{ submission: Submission; studentId: string } | null> {
  const rows = await sql`
    SELECT payload, student_id FROM physics_exam_submissions WHERE id=${id}
  `;
  if (!rows.length) return null;
  return { submission: parsePayload<Submission>(rows[0].payload), studentId: String(rows[0].student_id) };
}

export async function insertSubmission(studentId: string, submission: Submission): Promise<void> {
  await sql`
    INSERT INTO physics_exam_submissions (id, paper_id, paper_revision, student_id, self_practice, payload)
    VALUES (${submission.id}, ${submission.paperId}, ${submission.paperRevision}, ${studentId}, ${submission.selfPractice}, ${JSON.stringify(submission)})
  `;
}

export async function updateSubmission(submission: Submission): Promise<void> {
  await sql`
    UPDATE physics_exam_submissions SET payload=${JSON.stringify(submission)} WHERE id=${submission.id}
  `;
}

// Same enrollment-lookup pattern as teacherFor() in app/api/physics/practice/route.ts:
// checks the direct enrollment table first, falling back to assignment-linkage.
// Shared here (rather than duplicated per-route, as it was before) so the main
// physics-exam route and the file-serving route can never drift out of sync on
// which students are linked to which teacher -- that drift was a real bug: a
// student linked only via the assignment fallback could see a paper but was
// then incorrectly denied access to that paper's own uploaded file.
export async function teacherFor(studentId: string): Promise<string | null> {
  const enrollment = await sql`
    SELECT teacher_id FROM lower_secondary_enrollments
    WHERE student_id=${studentId}
    ORDER BY enrolled_at DESC LIMIT 1
  `;
  if (enrollment.length) return String(enrollment[0].teacher_id);
  const linked = await sql`
    SELECT a.teacher_id FROM assignment_students ast
    JOIN assignments a ON a.id=ast.assignment_id
    WHERE ast.student_id=${studentId}
    ORDER BY ast.assigned_at DESC LIMIT 1
  `;
  return linked.length ? String(linked[0].teacher_id) : null;
}
