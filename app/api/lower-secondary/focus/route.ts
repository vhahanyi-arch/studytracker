import { currentViewer } from "@/lib/session";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { readJsonObject, unreadableBody } from "@/lib/request-body";

const stage7Allowed = new Set([
  "integers", "fractions", "ratio", "powers", "expressions", "equations",
  "sequences", "geometry", "measure", "transformations", "statistics", "probability",
]);

const stage8Allowed = new Set(Array.from({ length: 16 }, (_, index) => `s8-u${index + 1}`));
const stage9Allowed = new Set(Array.from({ length: 15 }, (_, index) => `s9-u${index + 1}`));

function requestedStage(request: Request, bodyStage?: unknown) {
  const value = Number(bodyStage ?? new URL(request.url).searchParams.get("stage") ?? 7);
  return value === 8 || value === 9 ? value : 7;
}

function allowedForStage(stage: number) {
  if (stage === 9)
    return new Set([...stage7Allowed, ...stage8Allowed, ...stage9Allowed]);
  if (stage === 8) return new Set([...stage7Allowed, ...stage8Allowed]);
  return stage7Allowed;
}

export async function GET(request: Request) {
  const session = await currentViewer();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, user } = session;
  const role = user.publicMetadata.role;
  if (role !== "teacher" && role !== "student")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await ensureSchema();
  const stage = requestedStage(request);
  let teacherId = role === "teacher" ? userId : String(user.publicMetadata.teacherId || "");
  let enrolled = role === "teacher";
  if (role === "student") {
    const enrollment = await sql`SELECT teacher_id FROM lower_secondary_enrollments WHERE student_id=${userId} AND stage=${stage} ORDER BY enrolled_at DESC LIMIT 1`;
    teacherId = String(enrollment[0]?.teacher_id || "");
    enrolled = Boolean(teacherId);
  }
  if (!teacherId && role === "student" && stage === 7) {
    const linked = await sql`
      SELECT a.teacher_id
      FROM assignment_students ast JOIN assignments a ON a.id = ast.assignment_id
      WHERE ast.student_id = ${userId}
      ORDER BY ast.assigned_at DESC LIMIT 1
    `;
    teacherId = String(linked[0]?.teacher_id || "");
  }
  if (!teacherId) return NextResponse.json({ stage, chapters: [], enrolled: false });
  const rows = await sql`
    SELECT chapter_id FROM lower_secondary_weekly_focus
    WHERE teacher_id = ${teacherId} AND stage = ${stage} ORDER BY updated_at, chapter_id
  `;
  return NextResponse.json({ stage, chapters: rows.map((row) => String(row.chapter_id)), enrolled });
}

export async function POST(request: Request) {
  const session = await currentViewer();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, user: teacher } = session;
  if (teacher.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
  const body = await readJsonObject(request);
  if (!body) return unreadableBody();
  const stage = requestedStage(request, body.stage);
  const allowed = allowedForStage(stage);
  const chapters = Array.from(new Set<string>(Array.isArray(body.chapters) ? body.chapters.map(String) : []))
    .filter((chapter) => allowed.has(chapter));
  if (chapters.length > 6)
    return NextResponse.json({ error: "Choose no more than six focus units for one week." }, { status: 400 });
  await ensureSchema();
  // Replaced as a whole, in one transaction. Each unit is stamped a
  // microsecond after the last, so the focus keeps the order it was chosen in.
  await sql.transaction([
    sql`DELETE FROM lower_secondary_weekly_focus WHERE teacher_id = ${userId} AND stage = ${stage}`,
    sql`
      INSERT INTO lower_secondary_weekly_focus (teacher_id, stage, chapter_id, updated_at)
      SELECT ${userId}::text, ${stage}::int, c.chapter_id, NOW() + c.n * INTERVAL '1 microsecond'
      FROM unnest(${chapters}::text[]) WITH ORDINALITY AS c(chapter_id, n)
    `,
  ]);
  return NextResponse.json({ saved: true, stage, chapters });
}
