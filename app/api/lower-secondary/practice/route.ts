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
import { PAST_PAPER, pastPaperSet, type PastPaperRow } from "@/lib/past-paper-practice";

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

// Questions the teacher approved from a past-paper library paper or a homework
// book, for one unit. Only single-box typed questions with an accepted answer
// can be marked instantly; drawings, multi-part pages and unanswered questions
// stay with the teacher. The stage limit matches who may open the paper PDF in
// /api/assignments/[id]/paper, so every crop served here can be displayed.
async function pastPaperRows(teacherId: string, chapter: string, homeStage: number) {
  return (await sql`
    SELECT q.id, q.assignment_id, a.title, a.source_year, q.label, q.marks, q.page_number,
      q.crop_x, q.crop_y, q.crop_width, q.crop_height, q.expected_answer, q.mark_scheme_notes
    FROM assignment_questions q
    JOIN assignments a ON a.id = q.assignment_id
    WHERE a.teacher_id=${teacherId} AND a.status='assigned'
      AND (a.is_practice_library=TRUE OR a.resource_kind='homework')
      AND a.lower_secondary_stage <= ${homeStage}
      AND q.topic=${chapter} AND q.response_type='typed' AND q.answer_slots <= 1
      AND COALESCE(TRIM(q.expected_answer), '') <> ''
    ORDER BY q.id LIMIT 200
  `) as PastPaperRow[];
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
    // Past-paper sets are grouped apart from generated sets so they are shown
    // as practice activity and never counted toward a unit's mastery. Grouped
    // by position: a repeated ${} is a new parameter, which Postgres would not
    // treat as the same expression as the one selected.
    const rows = chapterParam
      ? await sql`
          SELECT student_id,stage AS source_stage,chapter_id,(difficulty=${PAST_PAPER}) past_paper,COUNT(*)::int attempts,
            COALESCE(ROUND(AVG(score)),0)::int average,
            COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
          FROM lower_secondary_practice_sessions
          WHERE teacher_id=${userId} AND COALESCE(home_stage,stage)=${stage}
            AND chapter_id=${chapter} AND status='completed'
          GROUP BY 1,2,3,4 ORDER BY last_active DESC
        `
      : await sql`
          SELECT student_id,stage AS source_stage,chapter_id,(difficulty=${PAST_PAPER}) past_paper,COUNT(*)::int attempts,
            COALESCE(ROUND(AVG(score)),0)::int average,
            COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
          FROM lower_secondary_practice_sessions
          WHERE teacher_id=${userId} AND COALESCE(home_stage,stage)=${stage}
            AND status='completed'
          GROUP BY 1,2,3,4 ORDER BY last_active DESC
        `;
    const students = await Promise.all(rows.map(async (row) => {
      let name = "Student";
      try {
        const student = await clerk.users.getUser(String(row.student_id));
        name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.username || name;
        // A deleted or unreachable account falls back to the default name
        // rather than failing the whole listing.
      } catch {}
      return { ...row, student_name: name, mastered: !row.past_paper && Number(row.strong_sets) >= 2 };
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
      WHERE student_id=${userId} AND stage=${stage} AND status='completed' AND difficulty<>${PAST_PAPER}
      GROUP BY chapter_id
    `;
    // How many approved past-paper questions each unit has, so a unit card can
    // offer a past-paper set only where one exists.
    const homeStage = stageFrom(url.searchParams.get("home") ?? stage);
    const teacherId = stage === 7 ? null : await teacherFor(userId, homeStage, user.publicMetadata.teacherId);
    const available = teacherId
      ? await sql`
          SELECT q.topic AS chapter_id, COUNT(*)::int questions
          FROM assignment_questions q
          JOIN assignments a ON a.id = q.assignment_id
          WHERE a.teacher_id=${teacherId} AND a.status='assigned'
            AND (a.is_practice_library=TRUE OR a.resource_kind='homework')
            AND a.lower_secondary_stage <= ${homeStage}
            AND q.topic LIKE ${`s${stage}-%`} AND q.response_type='typed' AND q.answer_slots <= 1
            AND COALESCE(TRIM(q.expected_answer), '') <> ''
          GROUP BY q.topic
        `
      : [];
    return NextResponse.json({
      stage,
      units: units.map((row) => ({ ...row, mastered: Number(row.strong_sets) >= 2 })),
      past_paper: Object.fromEntries(available.map((row) => [String(row.chapter_id), Number(row.questions)])),
    });
  }
  const rows = await sql`
    SELECT COUNT(*)::int attempts,COALESCE(ROUND(AVG(score)),0)::int average,
      COUNT(*) FILTER (WHERE score>=80)::int strong_sets,MAX(completed_at) last_active
    FROM lower_secondary_practice_sessions
    WHERE student_id=${userId} AND stage=${stage} AND chapter_id=${chapter} AND status='completed'
      AND difficulty<>${PAST_PAPER}
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
    const pastPaper = body.mode === PAST_PAPER;
    if (pastPaper && sourceStage === 7)
      return NextResponse.json(
        { error: "Past-paper practice is available for Stage 8 and 9 units." },
        { status: 400 },
      );
    if ((sourceStage === 7 && chapter !== "integers") || (sourceStage !== 7 && (!supportsMasteryUnit(chapter) || !chapter.startsWith(`s${sourceStage}-`))))
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
    let difficulty: string;
    let questions: MasteryQuestion[];
    if (pastPaper) {
      questions = pastPaperSet(await pastPaperRows(teacherId, chapter, homeStage));
      if (!questions.length)
        return NextResponse.json(
          { error: "Your teacher has not approved any past-paper questions for this unit yet." },
          { status: 404 },
        );
      difficulty = PAST_PAPER;
    } else {
      // The tier follows generated sets only: past-paper sets are practice.
      const history = await sql`
        SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
        FROM lower_secondary_practice_sessions
        WHERE student_id=${userId} AND stage=${sourceStage}
          AND chapter_id=${chapter} AND status='completed' AND difficulty<>${PAST_PAPER}
      `;
      const strong = Number(history[0]?.strong || 0);
      difficulty = strong === 0 ? "foundational" : strong === 1 ? "application" : "reasoning";
      questions = sourceStage === 7
        ? makeUnitQuestions("s7-integers", difficulty)
        : makeUnitQuestions(chapter, difficulty);
    }
    const id = crypto.randomUUID();
    await sql`
      INSERT INTO lower_secondary_practice_sessions
        (id,teacher_id,student_id,stage,home_stage,chapter_id,difficulty,questions_json)
      VALUES (${id},${teacherId},${userId},${sourceStage},${homeStage},${chapter},${difficulty},${JSON.stringify(questions)})
    `;
    return NextResponse.json({
      id, stage: sourceStage, source_stage: sourceStage, home_stage: homeStage,
      chapter, difficulty, past_paper: pastPaper,
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
      SELECT questions_json,stage,home_stage,chapter_id,difficulty
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
    const pastPaper = rows[0].difficulty === PAST_PAPER;
    await sql`
      UPDATE lower_secondary_practice_sessions
      SET answers_json=${JSON.stringify(answers)},hints_used=${hintsUsed},score=${score},
        status='completed',completed_at=NOW() WHERE id=${id}
    `;
    // Mastery comes from generated sets alone, whichever kind was just marked.
    const strongRows = await sql`
      SELECT COUNT(*) FILTER (WHERE score>=80)::int strong
      FROM lower_secondary_practice_sessions
      WHERE student_id=${userId} AND stage=${savedStage}
        AND chapter_id=${savedChapter} AND status='completed' AND difficulty<>${PAST_PAPER}
    `;
    const strong = Number(strongRows[0]?.strong || 0);
    return NextResponse.json({
      score, source_stage: savedStage, hints_used: hintsUsed, past_paper: pastPaper,
      strong_sets: strong, mastered: strong >= 2, results,
    });
  }
  return NextResponse.json({ error: "Unknown practice action." }, { status: 400 });
}
