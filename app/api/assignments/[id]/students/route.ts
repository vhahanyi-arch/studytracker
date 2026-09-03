import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

async function teacherAssignment(assignmentId: string, userId: string) {
  await ensureSchema();
  const assignment =
    await sql`SELECT id FROM assignments WHERE id = ${assignmentId} AND teacher_id = ${userId} LIMIT 1`;
  return assignment.length > 0;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id } = await context.params;
  if (!(await teacherAssignment(id, userId)))
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  const rows = await sql`
    SELECT ast.student_id, COALESCE(s.status, 'not_started') AS status,
      s.total_final, s.submitted_at
    FROM assignment_students ast
    LEFT JOIN submissions s ON s.assignment_id = ast.assignment_id
      AND s.student_id = ast.student_id
    WHERE ast.assignment_id = ${id}
    ORDER BY ast.assigned_at
  `;
  return NextResponse.json(rows);
}

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
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 403 },
    );
  const { id } = await context.params;
  const body = await request.json();
  const studentIds: string[] = Array.isArray(body.studentIds)
    ? body.studentIds.map(String)
    : [];
  if (new Set(studentIds).size !== studentIds.length)
    return NextResponse.json(
      { error: "A student was selected more than once." },
      { status: 400 },
    );
  if (!(await teacherAssignment(id, userId)))
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  const selected = await Promise.all(studentIds.map(async (studentId) => {
    try { return await clerk.users.getUser(studentId); } catch { return null; }
  }));
  if (selected.some((student) => student?.publicMetadata.role !== "student"))
    return NextResponse.json(
      { error: "Every selected account must be a student." },
      { status: 400 },
    );
  await sql`DELETE FROM assignment_students WHERE assignment_id = ${id}`;
  for (const studentId of studentIds)
    await sql`INSERT INTO assignment_students (assignment_id, student_id) VALUES (${id}, ${studentId})`;
  return NextResponse.json({ assigned: studentIds.length });
}
