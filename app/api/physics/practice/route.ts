import { currentViewer } from "@/lib/session";
import { studentNames, type UserLister } from "@/lib/students";
// The same link the Exam papers use, so the two can never disagree.
import { teacherFor } from "@/lib/physics-exam-repository";
import { NextResponse } from "next/server";
import { studentsOf, type UserStore } from "@/lib/auth-rules";
import { ensureSchema, sql } from "@/lib/db";
import {
  answerMatches,
  answerFormatFor,
  expectedAnswerText,
  makePhysicsQuestions,
  supportsPhysicsUnit,
  type PhysicsQuestion,
} from "@/lib/physics-question-engine";
import { hintsUsed as countHints, isMastered, isSessionId, markPracticeSet, nextDifficulty } from "@/lib/practice-sessions";
import { readJsonObject, unreadableBody } from "@/lib/request-body";

function levelFrom(value: unknown) {
  const level = String(value || "");
  return level === "as" ? "as" : "igcse";
}

export async function GET(request: Request) {
  const session = await currentViewer();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, clerk, user } = session;
  await ensureSchema();
  const url = new URL(request.url);
  const level = levelFrom(url.searchParams.get("level"));

  if (user.publicMetadata.role === "teacher") {
    // A set started before the student had a class or an assigned paper is
    // saved with no teacher_id, because teacherFor() finds no link yet. The
    // student's account still names the teacher who created it, so those
    // sets count for that teacher rather than for nobody.
    const own = (await studentsOf(clerk.users as UserStore, userId)).map((student) => student.id);
    const rows = await sql`
      SELECT student_id,chapter_id,COUNT(*)::int attempts,
        COALESCE(ROUND(AVG(score)),0)::int average,
        COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
      FROM physics_practice_sessions
      WHERE (teacher_id=${userId} OR (teacher_id IS NULL AND student_id=ANY(${own}::text[])))
        AND level=${level} AND status='completed'
      GROUP BY student_id,chapter_id
      ORDER BY last_active DESC
    `;
    const nameOf = await studentNames(clerk.users as unknown as UserLister, rows.map((row) => row.student_id));
    return NextResponse.json({
      level,
      students: rows.map((row) => ({
        ...row, student_name: nameOf(row.student_id),
        mastered: isMastered(row.strong_sets),
      })),
    });
  }

  if (user.publicMetadata.role !== "student")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const chapterParam = url.searchParams.get("chapter");
  const wantsAll = url.searchParams.get("all") === "1" || !chapterParam;

  if (wantsAll) {
    const units = await sql`
      SELECT chapter_id,COUNT(*)::int attempts,COALESCE(ROUND(AVG(score)),0)::int average,
        COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
      FROM physics_practice_sessions
      WHERE student_id=${userId} AND level=${level} AND status='completed'
      GROUP BY chapter_id
    `;
    return NextResponse.json({
      level,
      units: units.map((row) => ({ ...row, mastered: isMastered(row.strong_sets) })),
    });
  }
  const chapter = String(chapterParam);
  const rows = await sql`
    SELECT COUNT(*)::int attempts,COALESCE(ROUND(AVG(score)),0)::int average,
      COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
    FROM physics_practice_sessions
    WHERE student_id=${userId} AND level=${level} AND chapter_id=${chapter} AND status='completed'
  `;
  const row = rows[0] || {};
  return NextResponse.json({ ...row, level, chapter, mastered: isMastered(row.strong_sets) });
}

export async function POST(request: Request) {
  const session = await currentViewer();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, user } = session;
  if (user.publicMetadata.role !== "student")
    return NextResponse.json({ error: "Student access is required." }, { status: 403 });
  await ensureSchema();
  const body = await readJsonObject(request);
  if (!body) return unreadableBody();
  const level = levelFrom(body.level);
  const chapter = String(body.chapter || "");

  if (body.action === "start") {
    if (!supportsPhysicsUnit(level, chapter))
      return NextResponse.json(
        { error: "This unit does not have a question engine yet." },
        { status: 400 },
      );
    const history = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM physics_practice_sessions
      WHERE student_id=${userId} AND level=${level}
        AND chapter_id=${chapter} AND status='completed'
    `;
    const strong = Number(history[0]?.strong || 0);
    const difficulty = nextDifficulty(strong);
    const questions = makePhysicsQuestions(level, chapter, difficulty);
    const id = crypto.randomUUID();
    const teacherId = await teacherFor(userId);
    await sql`
      INSERT INTO physics_practice_sessions
        (id,student_id,teacher_id,level,chapter_id,difficulty,questions_json)
      VALUES (${id},${userId},${teacherId},${level},${chapter},${difficulty},${JSON.stringify(questions)})
    `;
    return NextResponse.json({
      id, level, chapter, difficulty,
      questions: questions.map((question) => ({
        templateId: question.templateId,
        objective: question.objective,
        difficulty: question.difficulty || difficulty,
        answerFormat: answerFormatFor(question),
        prompt: question.prompt,
        hint: question.hint,
      })),
    });
  }

  if (body.action === "submit") {
    const rows = !isSessionId(body.id) ? [] : await sql`
      SELECT questions_json,level,chapter_id
      FROM physics_practice_sessions
      WHERE id=${String(body.id || "")} AND student_id=${userId} AND status='open'
    `;
    if (!rows.length)
      return NextResponse.json(
        { error: "Practice session not found or already submitted." },
        { status: 404 },
      );
    const questions = JSON.parse(String(rows[0].questions_json)) as PhysicsQuestion[];
    // Sessions saved before units were checked have no unit, and accept any real one.
    const { answers, results, score } = markPracticeSet(questions, body.answers, (question) => question.answers,
      (answer, accepted, question) => answerMatches(answer, accepted, question.unit), expectedAnswerText);
    const hintsUsed = countHints(body.hints);
    const id = String(body.id);
    const savedLevel = String(rows[0].level);
    const savedChapter = String(rows[0].chapter_id);
    // Completed once: a second submit racing this one finds nothing to update.
    const completed = await sql`
      UPDATE physics_practice_sessions
      SET answers_json=${JSON.stringify(answers)},hints_used=${hintsUsed},score=${score},
        status='completed',completed_at=NOW() WHERE id=${id} AND status='open'
      RETURNING id
    `;
    if (!completed.length)
      return NextResponse.json(
        { error: "Practice session not found or already submitted." },
        { status: 404 },
      );
    const strongRows = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM physics_practice_sessions
      WHERE student_id=${userId} AND level=${savedLevel}
        AND chapter_id=${savedChapter} AND status='completed'
    `;
    const strong = Number(strongRows[0]?.strong || 0);
    return NextResponse.json({
      score, level: savedLevel, hints_used: hintsUsed,
      strong_sets: strong, mastered: isMastered(strong), results,
    });
  }
  return NextResponse.json({ error: "Unknown practice action." }, { status: 400 });
}
