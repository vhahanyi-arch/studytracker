import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { gradeQuestion } from "@/lib/grade-question";
import { questionKey } from "@/lib/paper-questions";
import { currentViewer } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const viewer = await currentViewer();
  if (!viewer)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id } = await context.params;
  await ensureSchema();
  const rows = await sql`
    SELECT s.id, s.answer_text, s.assignment_id, a.teacher_id, a.paper_mode
    FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ${id} LIMIT 1
  `;
  if (!rows.length)
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  const submission = rows[0];
  if (viewer.role !== "teacher" || String(submission.teacher_id) !== viewer.userId)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const questions = await sql`
    SELECT id, label, marks, response_type, expected_answer
    FROM assignment_questions
    WHERE assignment_id = ${submission.assignment_id}
    ORDER BY position
  `;
  const answerRows: Array<{ question?: string; answer?: string; answers?: string[]; working?: string; handwrittenPageAssigned?: boolean; handwrittenFileIndex?: number }> = (() => {
    try {
      const parsed = JSON.parse(String(submission.answer_text || "[]"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const multipleChoice = String(submission.paper_mode) === "multiple_choice";
  const graded = questions.map((question) => ({
    questionId: String(question.id),
    ...gradeQuestion(question, answerRows.find((row) => questionKey(row.question) === questionKey(question.label))),
  }));
  const proposedTotal = graded.reduce((total, mark) => total + (mark.proposed ?? 0), 0);
  const column = {
    questionId: graded.map((mark) => mark.questionId),
    proposed: graded.map((mark) => mark.proposed),
    confidence: graded.map((mark) => mark.confidence),
    rationale: graded.map((mark) => mark.rationale),
  };
  await sql.transaction([
    multipleChoice
      ? sql`
          UPDATE submission_marks m
          SET proposed_mark = g.proposed, final_mark = g.proposed, confidence = 'high', rationale = g.rationale
          FROM unnest(${column.questionId}::uuid[], ${column.proposed}::int[], ${column.rationale}::text[]) AS g(question_id, proposed, rationale)
          WHERE m.submission_id = ${id} AND m.question_id = g.question_id
        `
      : // Only touches marks the teacher has not already confirmed — a
        // re-mark should never silently override a human decision.
        sql`
          UPDATE submission_marks m
          SET proposed_mark = g.proposed, confidence = g.confidence, rationale = g.rationale
          FROM unnest(${column.questionId}::uuid[], ${column.proposed}::int[], ${column.confidence}::text[], ${column.rationale}::text[]) AS g(question_id, proposed, confidence, rationale)
          WHERE m.submission_id = ${id} AND m.question_id = g.question_id AND m.final_mark IS NULL
        `,
    sql`UPDATE submissions SET total_proposed = ${proposedTotal} WHERE id = ${id}`,
  ]);
  return NextResponse.json({ ok: true, questionsRemarked: questions.length });
}
