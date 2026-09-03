import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import {
  answerMatches,
  answerFormatFor,
  makeUnitQuestions,
  supportsMasteryUnit,
  type MasteryQuestion,
} from "@/lib/lower-secondary-question-engine";

function stageFrom(value: unknown) {
  const stage = Number(value);
  return stage === 8 || stage === 9 ? stage : 7;
}

async function teacherFor(studentId: string, homeStage: number, metadataTeacher: unknown) {
  const enrollment = await sql`
    SELECT teacher_id FROM lower_secondary_enrollments
    WHERE student_id=${studentId} AND stage=${homeStage}
    ORDER BY enrolled_at DESC LIMIT 1
  `;
  if (enrollment.length) return String(enrollment[0].teacher_id);
  if (homeStage === 7 && metadataTeacher) return String(metadataTeacher);
  if (homeStage === 7) {
    const linked = await sql`
      SELECT a.teacher_id FROM assignment_students ast
      JOIN assignments a ON a.id=ast.assignment_id
      WHERE ast.student_id=${studentId}
      ORDER BY ast.assigned_at DESC LIMIT 1
    `;
    return String(linked[0]?.teacher_id || "") || null;
  }
  return null;
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  await ensureSchema();
  const url = new URL(request.url);
  const stage = stageFrom(url.searchParams.get("stage"));
  const chapterParam = url.searchParams.get("chapter");
  const chapter = String(chapterParam || (stage === 7 ? "integers" : ""));
  const wantsAll = url.searchParams.get("all") === "1" || (stage !== 7 && !chapterParam);

  if (user.publicMetadata.role === "teacher") {
    const rows = chapterParam
      ? await sql`
          SELECT student_id,stage AS source_stage,chapter_id,COUNT(*)::int attempts,
            COALESCE(ROUND(AVG(score)),0)::int average,
            COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
          FROM lower_secondary_practice_sessions
          WHERE teacher_id=${userId} AND COALESCE(home_stage,stage)=${stage}
            AND chapter_id=${chapter} AND status='completed'
          GROUP BY student_id,stage,chapter_id ORDER BY last_active DESC
        `
      : await sql`
          SELECT student_id,stage AS source_stage,chapter_id,COUNT(*)::int attempts,
            COALESCE(ROUND(AVG(score)),0)::int average,
            COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
          FROM lower_secondary_practice_sessions
          WHERE teacher_id=${userId} AND COALESCE(home_stage,stage)=${stage}
            AND status='completed'
          GROUP BY student_id,stage,chapter_id ORDER BY last_active DESC
        `;
    const students = await Promise.all(rows.map(async (row) => {
      let name = "Student";
      try {
        const student = await clerk.users.getUser(String(row.student_id));
        name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.username || name;
      } catch {}
      return { ...row, student_name: name, mastered: Number(row.strong_sets) >= 2 };
    }));
    return NextResponse.json({ stage, students });
  }

  if (user.publicMetadata.role !== "student")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  if (wantsAll) {
    const units = await sql`
      SELECT chapter_id,COUNT(*)::int attempts,COALESCE(ROUND(AVG(score)),0)::int average,
        COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
      FROM lower_secondary_practice_sessions
      WHERE student_id=${userId} AND stage=${stage} AND status='completed'
      GROUP BY chapter_id
    `;
    return NextResponse.json({
      stage,
      units: units.map((row) => ({ ...row, mastered: Number(row.strong_sets) >= 2 })),
    });
  }
  const rows = await sql`
    SELECT COUNT(*)::int attempts,COALESCE(ROUND(AVG(score)),0)::int average,
      COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
    FROM lower_secondary_practice_sessions
    WHERE student_id=${userId} AND stage=${stage} AND chapter_id=${chapter} AND status='completed'
  `;
  const row = rows[0] || {};
  return NextResponse.json({ ...row, stage, chapter, mastered: Number(row.strong_sets) >= 2 });
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
  const sourceStage = stageFrom(body.stage);
  const homeStage = stageFrom(body.homeStage ?? body.stage);
  const chapter = String(body.chapter || (sourceStage === 7 ? "integers" : ""));

  if (sourceStage > homeStage)
    return NextResponse.json(
      { error: "You can revise your current stage or an earlier stage." },
      { status: 400 },
    );

  if (body.action === "start") {
    if ((sourceStage === 7 && chapter !== "integers") || (sourceStage !== 7 && !supportsMasteryUnit(chapter)))
      return NextResponse.json(
        { error: "This unit does not have a question engine yet." },
        { status: 400 },
      );
    const teacherId = await teacherFor(userId, homeStage, user.publicMetadata.teacherId);
    if (!teacherId)
      return NextResponse.json(
        { error: `Your teacher must add you to the Stage ${homeStage} class before practice can begin.` },
        { status: 403 },
      );
    const history = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM lower_secondary_practice_sessions
      WHERE student_id=${userId} AND stage=${sourceStage}
        AND chapter_id=${chapter} AND status='completed'
    `;
    const strong = Number(history[0]?.strong || 0);
    const difficulty = strong === 0 ? "foundational" : strong === 1 ? "application" : "reasoning";
    const questions = sourceStage === 7
      ? makeUnitQuestions("s8-u1", difficulty)
      : makeUnitQuestions(chapter, difficulty);
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO lower_secondary_practice_sessions
        (id,teacher_id,student_id,stage,home_stage,chapter_id,difficulty,questions_json)
      VALUES (${id},${teacherId},${userId},${sourceStage},${homeStage},${chapter},${difficulty},${JSON.stringify(questions)})
    `;
    return NextResponse.json({
      id, stage: sourceStage, source_stage: sourceStage, home_stage: homeStage,
      chapter, difficulty,
      questions: questions.map((question) => ({
        templateId: question.templateId,
        objective: question.objective,
        difficulty: question.difficulty || difficulty,
        answerFormat: answerFormatFor(question),
        prompt: question.prompt,
        hint: question.hint,
        source: question.source,
      })),
    });
  }

  if (body.action === "submit") {
    const rows = await sql`
      SELECT questions_json,stage,home_stage,chapter_id
      FROM lower_secondary_practice_sessions
      WHERE id=${String(body.id || "")} AND student_id=${userId} AND status='open'
    `;
    if (!rows.length)
      return NextResponse.json(
        { error: "Practice session not found or already submitted." },
        { status: 404 },
      );
    const questions = JSON.parse(String(rows[0].questions_json)) as MasteryQuestion[];
    const answers = Array.isArray(body.answers) ? body.answers.map(String) : [];
    const hints = Array.isArray(body.hints) ? body.hints.map(Boolean) : [];
    const results = questions.map((question, index) => {
      const accepted = Array.isArray(question.answers)
        ? question.answers
        : [String((question as MasteryQuestion & { answer?: unknown }).answer ?? "")];
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
    const savedStage = Number(rows[0].stage);
    const savedChapter = String(rows[0].chapter_id);
    await sql`
      UPDATE lower_secondary_practice_sessions
      SET answers_json=${JSON.stringify(answers)},hints_used=${hintsUsed},score=${score},
        status='completed',completed_at=NOW() WHERE id=${id}
    `;
    const strongRows = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM lower_secondary_practice_sessions
      WHERE student_id=${userId} AND stage=${savedStage}
        AND chapter_id=${savedChapter} AND status='completed'
    `;
    const strong = Number(strongRows[0]?.strong || 0);
    return NextResponse.json({
      score, source_stage: savedStage, hints_used: hintsUsed,
      strong_sets: strong, mastered: strong >= 2, results,
    });
  }
  return NextResponse.json({ error: "Unknown practice action." }, { status: 400 });
}
