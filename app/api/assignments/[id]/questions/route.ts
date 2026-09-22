import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

async function viewerFor(assignmentId: string) {
  const { userId } = await auth();
  if (!userId) return null;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata.role;
  await ensureSchema();
  const access =
    role === "teacher"
      ? await sql`SELECT id FROM assignments WHERE id = ${assignmentId} AND teacher_id = ${userId}`
      : role === "student"
        ? await sql`SELECT a.id FROM assignments a JOIN assignment_students s ON s.assignment_id = a.id WHERE a.id = ${assignmentId} AND s.student_id = ${userId}`
        : [];
  return access.length ? { userId, role } : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const viewer = await viewerFor(id);
  if (!viewer)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  // Students are served the same rows without the answer key. Marking runs
  // server-side from the database, and every client-side reader of these
  // fields (QuestionSetup, FileReview, Submissions) is teacher-only, so
  // withholding them costs the student UI nothing -- whereas sending them
  // put the expected answers, the mark scheme notes and the AI's proposed
  // answer in the network response of the paper the student was about to sit.
  const questions =
    viewer.role === "teacher"
      ? await sql`
          SELECT id, position, label, marks, page_number, crop_x, crop_y, crop_width, crop_height, response_type, answer_slots, response_layout, expected_answer, mark_scheme_notes, topic,
            draft_answer, draft_accepted_answer, draft_confidence, extracted_question_text
          FROM assignment_questions WHERE assignment_id = ${id} ORDER BY position
        `
      : await sql`
          SELECT id, position, label, marks, page_number, crop_x, crop_y, crop_width, crop_height, response_type, answer_slots, response_layout, topic, extracted_question_text
          FROM assignment_questions WHERE assignment_id = ${id} ORDER BY position
        `;
  return NextResponse.json(questions);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const viewer = await viewerFor(id);
  if (!viewer || viewer.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 403 },
    );
  const body = await request.json();
  const questions = Array.isArray(body.questions) ? body.questions : [];
  if (!questions.length)
    return NextResponse.json(
      { error: "Add at least one question." },
      { status: 400 },
    );
  // The request body is unvalidated JSON, so each field is narrowed on the way
  // in. oneOf keeps a value only when it is one of the accepted literals.
  const oneOf = <T extends string, F>(value: unknown, allowed: readonly T[], fallback: F): T | F =>
    allowed.includes(value as T) ? (value as T) : fallback;

  const cleaned = questions.map((question: Record<string, unknown>, index: number) => ({
    id: crypto.randomUUID(),
    position: index + 1,
    label: String(question.label || index + 1)
      .trim()
      .slice(0, 30),
    marks: Math.max(0, Math.min(100, Number(question.marks) || 0)) || null,
    page: Math.max(1, Math.round(Number(question.page_number) || 1)),
    x: Math.max(0, Math.min(1, Number(question.crop_x) || 0)),
    y: Math.max(0, Math.min(1, Number(question.crop_y) || 0)),
    width: Math.max(0.05, Math.min(1, Number(question.crop_width) || 1)),
    height: Math.max(0.05, Math.min(1, Number(question.crop_height) || 1)),
    responseType: oneOf(question.response_type, ["drawing", "multiple_choice"] as const, "typed"),
    answerSlots: Math.max(1, Math.min(6, Number(question.answer_slots) || 1)),
    responseLayout: oneOf(question.response_layout, ["answer", "working", "formula"] as const, "answer"),
    expectedAnswer:
      String(question.expected_answer || "")
        .trim()
        .slice(0, 500) || null,
    markSchemeNotes:
      String(question.mark_scheme_notes || "")
        .trim()
        .slice(0, 2000) || null,
    topic: String(question.topic || "General skills").trim().slice(0, 80),
    draftAnswer: String(question.draft_answer || "").trim().slice(0, 4000) || null,
    draftAcceptedAnswer: String(question.draft_accepted_answer || "").trim().slice(0, 500) || null,
    draftConfidence: oneOf(question.draft_confidence, ["high", "medium", "review"] as const, null),
    extractedQuestionText: String(question.extracted_question_text || "").trim().slice(0, 6000) || null,
  }));
  await sql`DELETE FROM assignment_questions WHERE assignment_id = ${id}`;
  for (const question of cleaned)
    await sql`
      INSERT INTO assignment_questions
      (id, assignment_id, position, label, marks, page_number, crop_x, crop_y, crop_width, crop_height, response_type, answer_slots, response_layout, expected_answer, mark_scheme_notes, topic, draft_answer, draft_accepted_answer, draft_confidence, extracted_question_text)
      VALUES (${question.id}, ${id}, ${question.position}, ${question.label}, ${question.marks}, ${question.page}, ${question.x}, ${question.y}, ${question.width}, ${question.height}, ${question.responseType}, ${question.answerSlots}, ${question.responseLayout}, ${question.expectedAnswer}, ${question.markSchemeNotes}, ${question.topic}, ${question.draftAnswer}, ${question.draftAcceptedAnswer}, ${question.draftConfidence}, ${question.extractedQuestionText})
    `;
  await sql`
    UPDATE assignments SET status = 'assigned' WHERE id = ${id}
  `;
  return NextResponse.json({ saved: cleaned.length });
}
