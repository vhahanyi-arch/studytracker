import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { currentViewer } from "@/lib/session";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const viewer = await currentViewer();
  if (!viewer)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (viewer.role !== "teacher")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const { userId } = viewer;
  const { id } = await context.params;
  await ensureSchema();
  const owned = await sql`
    SELECT s.id FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ${id} AND a.teacher_id = ${userId}
  `;
  if (!owned.length)
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 },
    );
  const body = await request.json();
  const marks = Array.isArray(body.marks) ? body.marks : [];
  // Every mark on this submission with its question's maximum, read once; the
  // teacher's changes are applied here and written back in one statement.
  const current = await sql`
    SELECT m.question_id, m.final_mark, q.marks AS maximum
    FROM submission_marks m JOIN assignment_questions q ON q.id = m.question_id
    WHERE m.submission_id = ${id}
  `;
  const finals = new Map(current.map((row) => [String(row.question_id), row.final_mark as number | null]));
  const maximum = new Map(current.map((row) => [String(row.question_id), Number(row.maximum || 0)]));
  const changes = new Map<string, { finalMark: number; feedback: string }>();
  for (const mark of marks) {
    if (!mark.reviewed) continue;
    const questionId = String(mark.questionId || "");
    if (!maximum.has(questionId)) continue;
    const finalMark = Math.max(0, Math.min(maximum.get(questionId)!, Number(mark.finalMark) || 0));
    changes.set(questionId, { finalMark, feedback: String(mark.feedback || "").slice(0, 1000) });
    finals.set(questionId, finalMark);
  }
  const saveMarks = sql`
    UPDATE submission_marks m SET final_mark = c.final_mark, teacher_feedback = c.feedback
    FROM unnest(
      ${[...changes.keys()]}::uuid[],
      ${[...changes.values()].map((change) => change.finalMark)}::int[],
      ${[...changes.values()].map((change) => change.feedback)}::text[]
    ) AS c(question_id, final_mark, feedback)
    WHERE m.submission_id = ${id} AND m.question_id = c.question_id
  `;
  const publish = Boolean(body.publish);
  const outstandingCount = [...finals.values()].filter((mark) => mark === null).length;
  if (publish && outstandingCount > 0) {
    // The confirmed marks are kept even though the result cannot be published.
    await saveMarks;
    return NextResponse.json(
      { error: "Confirm every question before publishing the result." },
      { status: 400 },
    );
  }
  const total = [...finals.values()].reduce<number>((sum, mark) => sum + Number(mark ?? 0), 0);
  const nextStatus = publish
    ? "published"
    : outstandingCount === 0
      ? "reviewed"
      : "awaiting_review";
  await sql.transaction([
    saveMarks,
    sql`
      UPDATE submissions SET total_final = ${total}, teacher_feedback = ${String(body.feedback || "").slice(0, 2000)},
        status = ${nextStatus}, published_at = ${publish ? new Date().toISOString() : null}
      WHERE id = ${id}
    `,
  ]);
  return NextResponse.json({
    saved: true,
    published: publish,
    ready: !publish && outstandingCount === 0,
    outstanding: outstandingCount,
    total,
  });
}
