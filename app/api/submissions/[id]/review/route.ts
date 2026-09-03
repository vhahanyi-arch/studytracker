import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const teacher = await clerk.users.getUser(userId);
  if (teacher.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
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
  for (const mark of marks) {
    if (!mark.reviewed) continue;
    const questionId = String(mark.questionId || "");
    const maximum = await sql`
      SELECT q.marks FROM assignment_questions q JOIN submissions s ON s.assignment_id = q.assignment_id
      WHERE q.id = ${questionId} AND s.id = ${id}
    `;
    if (!maximum.length) continue;
    const finalMark = Math.max(
      0,
      Math.min(Number(maximum[0].marks || 0), Number(mark.finalMark) || 0),
    );
    await sql`
      UPDATE submission_marks SET final_mark = ${finalMark}, teacher_feedback = ${String(mark.feedback || "").slice(0, 1000)}
      WHERE submission_id = ${id} AND question_id = ${questionId}
    `;
  }
  const publish = Boolean(body.publish);
  const outstanding = await sql`
    SELECT COUNT(*)::int AS count FROM submission_marks
    WHERE submission_id = ${id} AND final_mark IS NULL
  `;
  const outstandingCount = Number(outstanding[0]?.count || 0);
  if (publish && outstandingCount > 0)
    return NextResponse.json(
      { error: "Confirm every question before publishing the result." },
      { status: 400 },
    );
  const totals = await sql`
    SELECT COALESCE(SUM(final_mark), 0)::int AS total
    FROM submission_marks WHERE submission_id = ${id}
  `;
  const total = Number(totals[0]?.total || 0);
  const nextStatus = publish
    ? "published"
    : outstandingCount === 0
      ? "reviewed"
      : "awaiting_review";
  await sql`
    UPDATE submissions SET total_final = ${total}, teacher_feedback = ${String(body.feedback || "").slice(0, 2000)},
      status = ${nextStatus}, published_at = ${publish ? new Date().toISOString() : null}
    WHERE id = ${id}
  `;
  return NextResponse.json({
    saved: true,
    published: publish,
    ready: !publish && outstandingCount === 0,
    outstanding: outstandingCount,
    total,
  });
}
