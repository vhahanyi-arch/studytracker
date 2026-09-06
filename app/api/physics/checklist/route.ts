import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

function levelFrom(value: unknown) {
  const level = String(value || "");
  return level === "as" ? "as" : "igcse";
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  await ensureSchema();
  const url = new URL(request.url);
  const level = levelFrom(url.searchParams.get("level"));
  const rows = await sql`
    SELECT objective_id FROM physics_syllabus_checklist
    WHERE user_id=${userId} AND level=${level}
  `;
  return NextResponse.json({ level, checked: rows.map((row) => String(row.objective_id)) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  await ensureSchema();
  const body = await request.json();
  const level = levelFrom(body.level);
  const objectiveId = String(body.objectiveId || "");
  if (!objectiveId) return NextResponse.json({ error: "No objective specified." }, { status: 400 });

  const existing = await sql`
    SELECT 1 FROM physics_syllabus_checklist
    WHERE user_id=${userId} AND objective_id=${objectiveId} AND level=${level}
  `;
  if (existing.length) {
    await sql`
      DELETE FROM physics_syllabus_checklist
      WHERE user_id=${userId} AND objective_id=${objectiveId} AND level=${level}
    `;
    return NextResponse.json({ objectiveId, checked: false });
  }
  await sql`
    INSERT INTO physics_syllabus_checklist (user_id,objective_id,level)
    VALUES (${userId},${objectiveId},${level})
  `;
  return NextResponse.json({ objectiveId, checked: true });
}
