import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { studentPaper } from "@/lib/paper-access";
import { cleanQuestion, planQuestionSave, type SavedQuestion } from "@/lib/question-save";
import { currentViewer } from "@/lib/session";

async function viewerFor(assignmentId: string) {
  const viewer = await currentViewer();
  if (!viewer) return null;
  const { userId, role } = viewer;
  await ensureSchema();
  const access =
    role === "teacher"
      ? await sql`SELECT id FROM assignments WHERE id = ${assignmentId} AND teacher_id = ${userId}`
      : role === "student"
        ? (await studentPaper(assignmentId, userId)) ? [{ id: assignmentId }] : []
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
  const cleaned = questions.map((question: Record<string, unknown>, index: number) => cleanQuestion(question, index));
  const [existing, submitted] = await Promise.all([
    sql`SELECT id, position, label FROM assignment_questions WHERE assignment_id = ${id}`,
    sql`SELECT 1 FROM submissions WHERE assignment_id = ${id} LIMIT 1`,
  ]);
  const plan = planQuestionSave(existing as SavedQuestion[], cleaned, submitted.length > 0);
  if (!plan.ok)
    return NextResponse.json({ error: plan.error }, { status: plan.status });
  const rows = plan.rows;
  const column = <K extends keyof (typeof rows)[number]>(key: K) => rows.map((row) => row[key]);
  // One transaction: a failure part-way leaves the previous setup untouched.
  // Rows keep their ids, so marks already given stay attached to them.
  await sql.transaction([
    sql`DELETE FROM assignment_questions WHERE assignment_id = ${id} AND id = ANY(${plan.removed}::uuid[])`,
    sql`
      INSERT INTO assignment_questions
      (id, assignment_id, position, label, marks, page_number, crop_x, crop_y, crop_width, crop_height, response_type, answer_slots, response_layout, expected_answer, mark_scheme_notes, topic, draft_answer, draft_accepted_answer, draft_confidence, extracted_question_text)
      SELECT q.id, ${id}::uuid, q.position, q.label, q.marks, q.page, q.x, q.y, q.width, q.height, q.response_type, q.answer_slots, q.response_layout, q.expected_answer, q.mark_scheme_notes, q.topic, q.draft_answer, q.draft_accepted_answer, q.draft_confidence, q.extracted_question_text
      FROM unnest(
        ${column("id")}::uuid[], ${column("position")}::int[], ${column("label")}::text[], ${column("marks")}::int[], ${column("page")}::int[],
        ${column("x")}::float8[], ${column("y")}::float8[], ${column("width")}::float8[], ${column("height")}::float8[],
        ${column("responseType")}::text[], ${column("answerSlots")}::int[], ${column("responseLayout")}::text[],
        ${column("expectedAnswer")}::text[], ${column("markSchemeNotes")}::text[], ${column("topic")}::text[],
        ${column("draftAnswer")}::text[], ${column("draftAcceptedAnswer")}::text[], ${column("draftConfidence")}::text[], ${column("extractedQuestionText")}::text[]
      ) AS q(id, position, label, marks, page, x, y, width, height, response_type, answer_slots, response_layout, expected_answer, mark_scheme_notes, topic, draft_answer, draft_accepted_answer, draft_confidence, extracted_question_text)
      ON CONFLICT (id) DO UPDATE SET
        position = EXCLUDED.position, label = EXCLUDED.label, marks = EXCLUDED.marks, page_number = EXCLUDED.page_number,
        crop_x = EXCLUDED.crop_x, crop_y = EXCLUDED.crop_y, crop_width = EXCLUDED.crop_width, crop_height = EXCLUDED.crop_height,
        response_type = EXCLUDED.response_type, answer_slots = EXCLUDED.answer_slots, response_layout = EXCLUDED.response_layout,
        expected_answer = EXCLUDED.expected_answer, mark_scheme_notes = EXCLUDED.mark_scheme_notes, topic = EXCLUDED.topic,
        draft_answer = EXCLUDED.draft_answer, draft_accepted_answer = EXCLUDED.draft_accepted_answer,
        draft_confidence = EXCLUDED.draft_confidence, extracted_question_text = EXCLUDED.extracted_question_text
    `,
    sql`UPDATE assignments SET status = 'assigned' WHERE id = ${id}`,
  ]);
  return NextResponse.json({ saved: rows.length });
}
