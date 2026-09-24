import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { PAST_PAPER } from "@/lib/past-paper-practice";
import type { PracticeSession } from "@/lib/progress";

// The signed-in student's own completed practice sets, one row per set, so the
// portal can show whether they are improving rather than only where they stand.
// All the arithmetic lives in lib/progress.ts, which is tested directly; this
// route only loads rows and names their columns.

// A student's real history is far smaller than this. The cap exists so the
// query cannot grow without bound over years of use.
const MAX_SESSIONS = 500;

type Row = {
  track: unknown;
  difficulty?: unknown;
  chapter_id: unknown;
  score: unknown;
  hints_used: unknown;
  questions: unknown;
  completed_at: unknown;
};

const toSession = (source: "maths" | "physics") => (row: Row): PracticeSession => ({
  source,
  track: String(row.track ?? ""),
  chapterId: String(row.chapter_id ?? ""),
  score: Number(row.score ?? 0),
  hints: Number(row.hints_used ?? 0),
  // 0 means "length unknown", which hintRate() reports as no rate rather than
  // as a perfect one. That is also what the fallback query below produces.
  questions: Number(row.questions ?? 0),
  completedAt: new Date(String(row.completed_at)).toISOString(),
  pastPaper: row.difficulty === PAST_PAPER,
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "student")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await ensureSchema();

  // A set's length varies by unit and difficulty, so hint counts are only
  // comparable once divided by it. questions_json is written by this app and
  // is always a JSON array, but casting it is the one part of this query that
  // could fail on a single malformed row -- and a student's progress page is
  // not worth losing over that. If the cast errors, the same rows are read
  // without the length and the page simply omits hint rates.
  const load = async (withLength: boolean) =>
    Promise.all([
      withLength
        ? sql`
            SELECT stage::text AS track, chapter_id, difficulty, score, hints_used,
              json_array_length(questions_json::json) AS questions, completed_at
            FROM lower_secondary_practice_sessions
            WHERE student_id=${userId} AND status='completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC LIMIT ${MAX_SESSIONS}
          `
        : sql`
            SELECT stage::text AS track, chapter_id, difficulty, score, hints_used,
              0 AS questions, completed_at
            FROM lower_secondary_practice_sessions
            WHERE student_id=${userId} AND status='completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC LIMIT ${MAX_SESSIONS}
          `,
      withLength
        ? sql`
            SELECT level AS track, chapter_id, score, hints_used,
              json_array_length(questions_json::json) AS questions, completed_at
            FROM physics_practice_sessions
            WHERE student_id=${userId} AND status='completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC LIMIT ${MAX_SESSIONS}
          `
        : sql`
            SELECT level AS track, chapter_id, score, hints_used,
              0 AS questions, completed_at
            FROM physics_practice_sessions
            WHERE student_id=${userId} AND status='completed' AND completed_at IS NOT NULL
            ORDER BY completed_at DESC LIMIT ${MAX_SESSIONS}
          `,
    ]);

  let rows: Awaited<ReturnType<typeof load>>;
  try {
    rows = await load(true);
  } catch {
    rows = await load(false);
  }
  const [maths, physics] = rows;

  const sessions: PracticeSession[] = [
    ...(maths as Row[]).map(toSession("maths")),
    ...(physics as Row[]).map(toSession("physics")),
  ];
  return NextResponse.json({ sessions });
}
