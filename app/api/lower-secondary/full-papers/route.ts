import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { cleanAnswerLabels, withAnswerLabel } from "@/lib/answer-lines";
import { questionKey } from "@/lib/paper-questions";
import { currentViewer } from "@/lib/session";
import { studentNames, type UserLister } from "@/lib/students";

// Stage 8/9 full past papers: library papers the teacher has set for a stage's
// class to sit whole, as often as they like (see lib/paper-access.ts). The
// sitting itself goes through the ordinary answering screen and the submit
// route; this route lists the papers and attempts, sets and unsets a paper,
// and shows a student one finished attempt.

const stageOf = (value: unknown) => {
  const stage = Number(value);
  return stage === 8 || stage === 9 ? stage : null;
};

// The sitting a student chose, as saved with their draft by the draft route.
function draftSitting(draftData: unknown) {
  if (draftData === null || draftData === undefined) return null;
  try {
    const sitting = JSON.parse(String(draftData))?.sitting;
    return sitting && typeof sitting === "object"
      ? { practice: Boolean(sitting.practice), timerMinutes: sitting.timerMinutes ?? null, startedAt: String(sitting.startedAt || "") }
      : null;
  } catch {
    return null;
  }
}

const attemptRow = (row: Record<string, unknown>) => ({
  id: row.id,
  attempt: Number(row.attempt),
  practice: Boolean(row.self_practice),
  status: row.status,
  total_final: row.total_final,
  submitted_at: row.submitted_at,
  published_at: row.published_at,
  timer_minutes: row.timer_minutes,
});

export async function GET(request: Request) {
  const viewer = await currentViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, role, clerk } = viewer;
  const params = new URL(request.url).searchParams;
  await ensureSchema();

  if (role === "student" && params.get("attempt")) return attemptDetail(String(params.get("attempt")), userId);

  const stage = stageOf(params.get("stage"));
  if (!stage) return NextResponse.json({ error: "Choose Stage 8 or Stage 9." }, { status: 400 });

  if (role === "student") {
    const papers = await sql`
      SELECT a.id, a.title, a.lower_secondary_stage AS stage, a.source_year, a.due_date, a.paper_mode,
        (SELECT COUNT(*) FROM assignment_questions q WHERE q.assignment_id = a.id)::int AS questions,
        (SELECT COALESCE(SUM(q.marks), 0) FROM assignment_questions q WHERE q.assignment_id = a.id)::int AS maximum,
        d.draft_data
      FROM assignments a
      JOIN lower_secondary_enrollments e
        ON e.teacher_id = a.teacher_id AND e.stage = a.lower_secondary_stage AND e.student_id = ${userId}
      LEFT JOIN student_answer_drafts d ON d.assignment_id = a.id AND d.student_id = ${userId}
      WHERE a.is_practice_library AND a.full_paper_set_at IS NOT NULL AND a.status = 'assigned'
        AND a.lower_secondary_stage = ${stage}
      ORDER BY a.full_paper_set_at DESC
    `;
    const attempts = await sql`
      SELECT id, assignment_id, attempt, self_practice, status, total_final, submitted_at, published_at, timer_minutes
      FROM submissions
      WHERE student_id = ${userId} AND assignment_id = ANY(${papers.map((paper) => paper.id)}::uuid[])
      ORDER BY attempt
    `;
    return NextResponse.json({
      papers: papers.map(({ draft_data, ...paper }) => ({
        ...paper,
        in_progress: draft_data !== null && draft_data !== undefined,
        sitting: draftSitting(draft_data),
        attempts: attempts.filter((row) => String(row.assignment_id) === String(paper.id)).map(attemptRow),
      })),
    });
  }

  if (role !== "teacher") return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const papers = await sql`
    SELECT a.id, a.full_paper_set_at, a.due_date,
      (SELECT COALESCE(SUM(q.marks), 0) FROM assignment_questions q WHERE q.assignment_id = a.id)::int AS maximum
    FROM assignments a
    WHERE a.teacher_id = ${userId} AND a.is_practice_library AND a.lower_secondary_stage = ${stage}
  `;
  const attempts = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.attempt, s.self_practice, s.status, s.total_final,
      s.total_proposed, s.submitted_at, s.published_at, s.timer_minutes
    FROM submissions s
    WHERE s.assignment_id = ANY(${papers.map((paper) => paper.id)}::uuid[])
    ORDER BY s.submitted_at DESC
  `;
  const nameOf = await studentNames(clerk.users as unknown as UserLister, attempts.map((row) => row.student_id));
  return NextResponse.json({
    papers: papers.map((paper) => ({
      ...paper,
      attempts: attempts
        .filter((row) => String(row.assignment_id) === String(paper.id))
        .map((row) => ({ ...attemptRow(row), student_id: row.student_id, student_name: nameOf(row.student_id), total_proposed: row.total_proposed })),
    })),
  });
}

// One finished attempt, for the student who sat it. A practice attempt also
// shows each question's accepted answer; one marked by the teacher shows the
// teacher's marks and feedback, as a published result always has.
async function attemptDetail(submissionId: string, studentId: string) {
  const [submission] = await sql`
    SELECT s.id, s.assignment_id, s.attempt, s.self_practice, s.total_final, s.teacher_feedback,
      s.answer_text, s.submitted_at, s.timer_minutes, a.title
    FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ${submissionId} AND s.student_id = ${studentId} AND s.status = 'published' AND a.is_practice_library
  `;
  if (!submission) return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  const practice = Boolean(submission.self_practice);
  const questions = await sql`
    SELECT q.label, q.marks, q.expected_answer, q.answer_labels, m.proposed_mark, m.final_mark, m.teacher_feedback
    FROM assignment_questions q
    LEFT JOIN submission_marks m ON m.question_id = q.id AND m.submission_id = ${submissionId}
    WHERE q.assignment_id = ${submission.assignment_id}
    ORDER BY q.position
  `;
  const rows: Array<Record<string, unknown>> = (() => {
    try {
      const parsed = JSON.parse(String(submission.answer_text || "[]"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  // Each box as it reads on the printed line: "x = 3", "12 cm".
  const answerTo = (question: Record<string, unknown>) => {
    const row = rows.find((item) => questionKey(item.question) === questionKey(question.label));
    if (!row) return "";
    const labels = cleanAnswerLabels(question.answer_labels);
    const answers = (Array.isArray(row.answers) ? row.answers.map(String) : [String(row.answer ?? "")])
      .map((answer, index) => withAnswerLabel(answer, labels[index]))
      .filter(Boolean);
    return answers.join(" | ");
  };
  return NextResponse.json({
    id: submission.id,
    title: submission.title,
    attempt: Number(submission.attempt),
    practice,
    total: Number(submission.total_final ?? 0),
    maximum: questions.reduce((total, question) => total + Number(question.marks || 0), 0),
    feedback: submission.teacher_feedback,
    timer_minutes: submission.timer_minutes,
    submitted_at: submission.submitted_at,
    questions: questions.map((question) => ({
      label: question.label,
      marks: Number(question.marks || 0),
      mark: question.final_mark === null ? null : Number(question.final_mark),
      // Practice only: a question the marker could not decide scored nothing.
      automatic: question.proposed_mark !== null,
      feedback: question.teacher_feedback,
      answer: answerTo(question),
      accepted: practice ? question.expected_answer : undefined,
    })),
  });
}

export async function POST(request: Request) {
  const viewer = await currentViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (viewer.role !== "teacher") return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const set = Boolean(body?.set);
  const dueDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body?.dueDate || "")) ? String(body.dueDate) : null;
  await ensureSchema();
  const [paper] = await sql`
    SELECT status FROM assignments
    WHERE id = ${id} AND teacher_id = ${viewer.userId} AND is_practice_library AND lower_secondary_stage IN (8, 9)
  `;
  if (!paper) return NextResponse.json({ error: "Library paper not found." }, { status: 404 });
  if (set && paper.status !== "assigned")
    return NextResponse.json({ error: "Approve every question in question setup before setting this paper." }, { status: 409 });
  // Setting a paper again only changes its due date; its set date is kept.
  // Unsetting keeps every attempt, and hides the paper from students.
  const [row] = set
    ? await sql`
        UPDATE assignments SET full_paper_set_at = COALESCE(full_paper_set_at, NOW()), due_date = ${dueDate}
        WHERE id = ${id} RETURNING full_paper_set_at, due_date
      `
    : await sql`
        UPDATE assignments SET full_paper_set_at = NULL, due_date = NULL
        WHERE id = ${id} RETURNING full_paper_set_at, due_date
      `;
  return NextResponse.json({ id, full_paper_set_at: row.full_paper_set_at, due_date: row.due_date });
}
