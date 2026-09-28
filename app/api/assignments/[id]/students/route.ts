import { auth } from "@clerk/nextjs/server";
import { currentViewer } from "@/lib/session";
import { accountsById, type UserLister } from "@/lib/students";
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
  const session = await currentViewer();
  if (!session)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, clerk, user: teacher } = session;
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
  const accounts = await accountsById(clerk.users as unknown as UserLister, studentIds);
  if (studentIds.some((studentId) => accounts.get(studentId)?.publicMetadata?.role !== "student"))
    return NextResponse.json(
      { error: "Every selected account must be a student." },
      { status: 400 },
    );
  // Replaced as a whole, in one transaction. Each row is stamped a microsecond
  // after the last, so the roster keeps the order the teacher chose.
  await sql.transaction([
    sql`DELETE FROM assignment_students WHERE assignment_id = ${id}`,
    sql`
      INSERT INTO assignment_students (assignment_id, student_id, assigned_at)
      SELECT ${id}::uuid, s.student_id, NOW() + s.n * INTERVAL '1 microsecond'
      FROM unnest(${studentIds}::text[]) WITH ORDINALITY AS s(student_id, n)
    `,
  ]);
  return NextResponse.json({ assigned: studentIds.length });
}
