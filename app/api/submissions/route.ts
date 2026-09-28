import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { questionPages, storedHandwrittenFiles, wholePaperLink } from "@/lib/handwritten-pages";
import { questionKey } from "@/lib/paper-questions";
import { currentViewer } from "@/lib/session";
import { studentNames, type UserLister } from "@/lib/students";

// Rows from one query over many submissions, split back per submission in the
// query's order, without the grouping column.
function bySubmission(rows: Record<string, unknown>[]) {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const { submission_id, ...row } of rows) {
    const key = String(submission_id);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return (id: unknown) => groups.get(String(id)) ?? [];
}

export async function GET() {
  const viewer = await currentViewer();
  if (!viewer)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, clerk } = viewer;
  if (viewer.role === "student") {
    await ensureSchema();
    const results = await sql`
      SELECT s.id, s.assignment_id, s.status, s.total_final, s.teacher_feedback, s.published_at,
        a.title, a.paper_mode, COALESCE(SUM(q.marks), 0)::int AS maximum
      FROM submissions s JOIN assignments a ON a.id = s.assignment_id
      LEFT JOIN assignment_questions q ON q.assignment_id = a.id
      WHERE s.student_id = ${userId} AND s.status = 'published'
      GROUP BY s.id, s.assignment_id, a.title, a.paper_mode ORDER BY s.published_at DESC
    `;
    const marksOf = bySubmission(await sql`
      SELECT m.submission_id, q.label, q.marks AS maximum, m.final_mark,
        m.teacher_feedback
      FROM submission_marks m
      JOIN assignment_questions q ON q.id = m.question_id
      WHERE m.submission_id = ANY(${results.map((result) => result.id)}::uuid[])
      ORDER BY q.position
    `);
    return NextResponse.json(results.map((result) => ({ ...result, marks: marksOf(result.id) })));
  }
  if (viewer.role !== "teacher")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await ensureSchema();
  const submissions = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.answer_text, s.status,
      s.submitted_at, s.total_proposed, s.total_final, s.teacher_feedback,
      s.published_at, s.handwritten_url, a.title, a.paper_mode
    FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE a.teacher_id = ${userId} ORDER BY s.submitted_at DESC
  `;
  // Every question of every listed paper, with this submission's mark if any:
  // one query and one batched name lookup, rather than two calls per row.
  const [allMarks, nameOf] = await Promise.all([
    sql`
      SELECT s.id AS submission_id, q.id AS question_id, q.position, q.label, q.page_number, q.marks AS maximum,
        q.response_type, q.expected_answer, q.mark_scheme_notes, q.topic,
        q.draft_answer, q.draft_confidence,
        m.proposed_mark, m.final_mark, m.confidence,
        m.rationale, m.teacher_feedback
      FROM submissions s
      JOIN assignment_questions q ON q.assignment_id = s.assignment_id
      LEFT JOIN submission_marks m ON m.question_id = q.id AND m.submission_id = s.id
      WHERE s.id = ANY(${submissions.map((submission) => submission.id)}::uuid[])
      ORDER BY q.position
    `,
    studentNames(clerk.users as unknown as UserLister, submissions.map((submission) => submission.student_id)),
  ]);
  const marksOf = bySubmission(allMarks);
  const result = submissions.map((submission) => {
    const marks = marksOf(submission.id);
    // Whatever the student's client stored, read back as opaque records:
    // only `question` and `handwrittenPageAssigned` are inspected here.
    const parsedAnswers: Record<string, unknown>[] = (() => {
      try {
        return JSON.parse(String(submission.answer_text || "[]"));
      } catch {
        return [];
      }
    })();
    const handwrittenFiles = storedHandwrittenFiles(submission.handwritten_url);
    const pages = questionPages(marks);
    const singlePdf = handwrittenFiles.length === 1 && (handwrittenFiles[0].type === "application/pdf" || String(submission.handwritten_url || "").toLowerCase().includes(".pdf"));
    const answerRows: Record<string, unknown>[] = parsedAnswers.length
      ? parsedAnswers
      : marks.map((mark) => ({ question: String(mark.label), answer: "" }));
    // Submissions saved before answers carried their handwritten page get one
    // worked out here, the same way a new submission is given it.
    const answers = handwrittenFiles.length
      ? answerRows.map((answer) => {
          if (answer.handwrittenPageAssigned) return answer;
          const mark = marks.find((item) => questionKey(item.label) === questionKey(answer.question));
          if (!mark) return answer;
          return { ...answer, ...wholePaperLink(mark.page_number, pages, handwrittenFiles.length, singlePdf) };
        })
      : answerRows;
    return {
      ...submission,
      handwritten_url: undefined,
      handwritten_count: handwrittenFiles.length,
      student_name: nameOf(submission.student_id),
      answers,
      marks,
    };
  });
  return NextResponse.json(result);
}
