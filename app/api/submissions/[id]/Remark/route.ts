import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { gradeQuestion, normalizeAnswer } from "@/lib/grade-question";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
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

  const clerk = await clerkClient();
  const viewer = await clerk.users.getUser(userId);
  if (viewer.publicMetadata.role !== "teacher" || String(submission.teacher_id) !== userId)
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
  let updated = 0;
  let proposedTotal = 0;

  for (const question of questions) {
    const answer = answerRows.find(
      (row) => normalizeAnswer(String(row.question || "")) === normalizeAnswer(String(question.label)),
    );
    const { proposed, confidence, rationale } = gradeQuestion(question, answer);
    if (proposed !== null) proposedTotal += proposed;

    if (multipleChoice) {
      await sql`
        UPDATE submission_marks
        SET proposed_mark = ${proposed}, final_mark = ${proposed}, confidence = 'high', rationale = ${rationale}
        WHERE submission_id = ${id} AND question_id = ${question.id}
      `;
    } else {
      // Only touches marks the teacher has not already confirmed — a
      // re-mark should never silently override a human decision.
      await sql`
        UPDATE submission_marks
        SET proposed_mark = ${proposed}, confidence = ${confidence}, rationale = ${rationale}
        WHERE submission_id = ${id} AND question_id = ${question.id} AND final_mark IS NULL
      `;
    }
    updated += 1;
  }

  await sql`UPDATE submissions SET total_proposed = ${proposedTotal} WHERE id = ${id}`;

  return NextResponse.json({ ok: true, questionsRemarked: updated });
}
