import { NextResponse } from "next/server";
import { allStudents, type UserStore } from "@/lib/auth-rules";
import { ensureSchema, sql } from "@/lib/db";
import { currentViewer } from "@/lib/session";
import { displayName } from "@/lib/students";

async function teacherViewer() {
  const viewer = await currentViewer();
  return viewer?.role === "teacher" ? viewer : null;
}

function requestedStage(request: Request, bodyStage?: unknown) {
  const value = Number(bodyStage ?? new URL(request.url).searchParams.get("stage") ?? 7);
  return value === 8 || value === 9 ? value : 7;
}

export async function GET(request: Request) {
  const viewer = await teacherViewer();
  if (!viewer) return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
  const stage = requestedStage(request);
  await ensureSchema();
  const [students, enrolled] = await Promise.all([
    allStudents(viewer.clerk.users as unknown as UserStore),
    sql`SELECT student_id FROM lower_secondary_enrollments WHERE teacher_id=${viewer.userId} AND stage=${stage}`,
  ]);
  const ids = new Set(enrolled.map((row) => String(row.student_id)));
  return NextResponse.json(students.map((user) => ({ id: user.id, name: displayName(user), username: user.username, enrolled: ids.has(user.id) })));
}

export async function POST(request: Request) {
  const viewer = await teacherViewer();
  if (!viewer) return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
  const body = await request.json();
  const stage = requestedStage(request, body.stage);
  const requested = Array.from(new Set<string>(Array.isArray(body.studentIds) ? body.studentIds.map(String) : []));
  const valid = new Set((await allStudents(viewer.clerk.users as unknown as UserStore)).map((user) => user.id));
  const studentIds = requested.filter((id) => valid.has(id));
  await ensureSchema();
  // Replaced as a whole, in one transaction, so a failure keeps the old class.
  await sql.transaction([
    sql`DELETE FROM lower_secondary_enrollments WHERE teacher_id=${viewer.userId} AND stage=${stage}`,
    sql`
      INSERT INTO lower_secondary_enrollments (teacher_id, student_id, stage)
      SELECT ${viewer.userId}::text, student_id, ${stage}::int FROM unnest(${studentIds}::text[]) AS student_id
    `,
  ]);
  return NextResponse.json({ saved: true, enrolled: studentIds.length, stage });
}
