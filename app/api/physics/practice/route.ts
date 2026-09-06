import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import {
  answerMatches,
  answerFormatFor,
  makePhysicsQuestions,
  supportsPhysicsUnit,
  type PhysicsQuestion,
} from "@/lib/physics-question-engine";

function levelFrom(value: unknown) {
  const level = String(value || "");
  return level === "as" ? "as" : "igcse";
}

async function teacherFor(studentId: string) {
  const enrollment = await sql`
    SELECT teacher_id FROM lower_secondary_enrollments
    WHERE student_id=${studentId}
    ORDER BY enrolled_at DESC LIMIT 1
  `;
  if (enrollment.length) return String(enrollment[0].teacher_id);
  const linked = await sql`
    SELECT a.teacher_id FROM assignment_students ast
    JOIN assignments a ON a.id=ast.assignment_id
    WHERE ast.student_id=${studentId}
    ORDER BY ast.assigned_at DESC LIMIT 1
  `;
  return linked.length ? String(linked[0].teacher_id) : null;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  await ensureSchema();
  const url = new URL(request.url);
  const level = levelFrom(url.searchParams.get("level"));

  if (user.publicMetadata.role === "teacher") {
    const rows = await sql`
      SELECT student_id,chapter_id,COUNT(*)::int attempts,
        COALESCE(ROUND(AVG(score)),0)::int average,
        COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
      FROM physics_practice_sessions
      WHERE teacher_id=${userId} AND level=${level} AND status='completed'
      GROUP BY student_id,chapter_id
      ORDER BY last_active DESC
    `;
    const studentIds = Array.from(new Set(rows.map((row) => String(row.student_id))));
    const names: Record<string,string> = {};
    await Promise.all(studentIds.map(async (id) => {
      try {
        const student = await clerk.users.getUser(id);
        names[id] = student.fullName || student.username || "Student";
      } catch { names[id] = "Student"; }
    }));
    return NextResponse.json({
      level,
      students: rows.map((row) => ({
        ...row, student_name: names[String(row.student_id)] || "Student",
        mastered: Number(row.strong_sets) >= 2,
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
      units: units.map((row) => ({ ...row, mastered: Number(row.strong_sets) >= 2 })),
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
  return NextResponse.json({ ...row, level, chapter, mastered: Number(row.strong_sets) >= 2 });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "student")
    return NextResponse.json({ error: "Student access is required." }, { status: 403 });
  await ensureSchema();
  const body = await request.json();
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
    const difficulty = strong === 0 ? "foundational" : strong === 1 ? "application" : "reasoning";
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
    const rows = await sql`
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
    const answers = Array.isArray(body.answers) ? body.answers.map(String) : [];
    const hints = Array.isArray(body.hints) ? body.hints.map(Boolean) : [];
    const results = questions.map((question, index) => {
      const accepted = question.answers;
      return {
        templateId: question.templateId,
        objective: question.objective,
        difficulty: question.difficulty,
        prompt: question.prompt, answer: answers[index] || "",
        correct: answerMatches(answers[index], accepted),
        expected: accepted.join(" or "), solution: question.solution,
      };
    });
    const score = Math.round(results.filter((result) => result.correct).length * 100 / questions.length);
    const hintsUsed = hints.filter(Boolean).length;
    const id = String(body.id);
    const savedLevel = String(rows[0].level);
    const savedChapter = String(rows[0].chapter_id);
    await sql`
      UPDATE physics_practice_sessions
      SET answers_json=${JSON.stringify(answers)},hints_used=${hintsUsed},score=${score},
        status='completed',completed_at=NOW() WHERE id=${id}
    `;
    const strongRows = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM physics_practice_sessions
      WHERE student_id=${userId} AND level=${savedLevel}
        AND chapter_id=${savedChapter} AND status='completed'
    `;
    const strong = Number(strongRows[0]?.strong || 0);
    return NextResponse.json({
      score, level: savedLevel, hints_used: hintsUsed,
      strong_sets: strong, mastered: strong >= 2, results,
    });
  }
  return NextResponse.json({ error: "Unknown practice action." }, { status: 400 });
}
