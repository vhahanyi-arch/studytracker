import { currentViewer } from "@/lib/session";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { sittingTimer, studentPaper } from "@/lib/paper-access";

async function requireAssignedStudent(assignmentId: string) {
  const session = await currentViewer();
  if (!session) return null;
  const { userId, user } = session;
  if (user.publicMetadata.role !== "student") return null;
  await ensureSchema();
  return (await studentPaper(assignmentId, userId)) ? userId : null;
}

function cleanText(value: unknown, maximum: number) {
  return String(value ?? "").slice(0, maximum);
}

function cleanDraft(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  if (!Array.isArray(source.rows) || source.rows.length > 200) return null;
  const rows = source.rows.map((rowValue) => {
    const row =
      rowValue && typeof rowValue === "object"
        ? (rowValue as Record<string, unknown>)
        : {};
    const drawing = cleanText(row.drawing, 1_500_000);
    return {
      question: cleanText(row.question, 60),
      formula: cleanText(row.formula, 2_000),
      working: cleanText(row.working, 12_000),
      answer: cleanText(row.answer, 3_000),
      answers: Array.isArray(row.answers)
        ? row.answers.slice(0, 6).map((answer) => cleanText(answer, 3_000))
        : undefined,
      workMode: ["answer", "working", "formula"].includes(String(row.workMode))
        ? String(row.workMode)
        : "answer",
      drawing: drawing.startsWith("data:image/png;base64,") ? drawing : undefined,
      showDrawing: Boolean(row.showDrawing),
    };
  });
  const rawPages =
    source.paperPages && typeof source.paperPages === "object"
      ? (source.paperPages as Record<string, unknown>)
      : {};
  const paperPages = Object.fromEntries(
    Object.entries(rawPages)
      .slice(0, 40)
      .map(([page, drawing]) => [
        String(Math.max(1, Math.round(Number(page) || 1))),
        cleanText(drawing, 1_500_000),
      ])
      .filter(([, drawing]) => drawing.startsWith("data:image/png;base64,")),
  );
  const mode = ["typed", "handwritten", "both", "paper"].includes(
    String(source.mode),
  )
    ? String(source.mode)
    : "typed";
  return {
    rows,
    activeIndex: Math.max(
      0,
      Math.min(rows.length - 1, Math.round(Number(source.activeIndex) || 0)),
    ),
    mode,
    paperPages,
    paperPageNumber: Math.max(
      1,
      Math.min(100, Math.round(Number(source.paperPageNumber) || 1)),
    ),
    // How a full past paper is being sat, chosen on its start screen. Kept with
    // the answers so a refresh or another device resumes the same clock.
    sitting: cleanSitting(source.sitting),
    savedAt: new Date().toISOString(),
  };
}

function cleanSitting(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Record<string, unknown>;
  const startedAt = Date.parse(String(source.startedAt ?? ""));
  return {
    practice: Boolean(source.practice),
    timerMinutes: sittingTimer(source.timerMinutes),
    startedAt: Number.isFinite(startedAt) ? new Date(startedAt).toISOString() : new Date().toISOString(),
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const studentId = await requireAssignedStudent(id);
  if (!studentId)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const rows = await sql`
    SELECT draft_data, updated_at FROM student_answer_drafts
    WHERE assignment_id = ${id} AND student_id = ${studentId}
    LIMIT 1
  `;
  if (!rows.length) return NextResponse.json({ draft: null });
  try {
    return NextResponse.json({
      draft: JSON.parse(String(rows[0].draft_data)),
      updatedAt: rows[0].updated_at,
    });
  } catch {
    return NextResponse.json({ draft: null });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const studentId = await requireAssignedStudent(id);
  if (!studentId)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const draft = cleanDraft(body?.draft);
  if (!draft)
    return NextResponse.json({ error: "Invalid answer draft." }, { status: 400 });
  const draftData = JSON.stringify(draft);
  if (draftData.length > 3_500_000)
    return NextResponse.json(
      { error: "This draft is too large to save automatically." },
      { status: 413 },
    );
  await sql`
    INSERT INTO student_answer_drafts
      (assignment_id, student_id, draft_data, updated_at)
    VALUES (${id}, ${studentId}, ${draftData}, NOW())
    ON CONFLICT (assignment_id, student_id) DO UPDATE SET
      draft_data = EXCLUDED.draft_data,
      updated_at = NOW()
  `;
  return NextResponse.json({ saved: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const studentId = await requireAssignedStudent(id);
  if (!studentId)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await sql`
    DELETE FROM student_answer_drafts
    WHERE assignment_id = ${id} AND student_id = ${studentId}
  `;
  return NextResponse.json({ removed: true });
}
