import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { buildProgressReportPdf } from "@/lib/report-pdf";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id } = await context.params;
  await ensureSchema();
  const rows = await sql`
    SELECT s.id, s.student_id, s.answer_text, s.total_final, s.status, s.published_at,
      s.teacher_feedback,
      a.teacher_id, a.title, a.syllabus, a.paper_mode
    FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE s.id = ${id} LIMIT 1
  `;
  if (!rows.length) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  const submission = rows[0];
  const clerk = await clerkClient();
  const viewer = await clerk.users.getUser(userId);
  const isTeacher = viewer.publicMetadata.role === "teacher" && String(submission.teacher_id) === userId;
  const isStudent = viewer.publicMetadata.role === "student" && String(submission.student_id) === userId;
  if (!isTeacher && !isStudent)
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  if (String(submission.status) !== "published")
    return NextResponse.json({ error: "A final report is available after the teacher publishes the result." }, { status: 400 });
  const student = await clerk.users.getUser(String(submission.student_id));
  const answers: Array<{ question?: string; formula?: string; working?: string; answer?: string; answers?: string[]; drawingUrl?: string; handwrittenPageAssigned?: boolean; handwrittenPdfPage?: number; handwrittenFileIndex?: number; handwrittenUploadMode?: "whole_paper" | "question_specific" }> = (() => {
    try { return JSON.parse(String(submission.answer_text || "[]")); } catch { return []; }
  })();
  const questions = await sql`
    SELECT q.label, q.marks, q.expected_answer, q.mark_scheme_notes,
      COALESCE(q.topic, 'General skills') AS topic,
      m.final_mark, m.teacher_feedback
    FROM submission_marks m JOIN assignment_questions q ON q.id = m.question_id
    WHERE m.submission_id = ${id} ORDER BY q.position
  `;
  const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/\s+/g, "");
  const reportQuestions = questions.map((question) => {
    const answer = answers.find((row) => normalize(row.question) === normalize(question.label));
    const isMultipleChoice = String(submission.paper_mode) === "multiple_choice";
    const responseParts = isMultipleChoice
      ? [String(answer?.answers?.[0] || answer?.answer || "").toUpperCase()]
      : [
          answer?.formula ? `Formula: ${answer.formula}` : "",
          answer?.working ? `Working: ${answer.working}` : "",
          answer?.answers?.length
            ? `Answer: ${answer.answers.filter(Boolean).join("; ")}`
            : answer?.answer
              ? `Answer: ${answer.answer}`
              : "",
          answer?.drawingUrl ? "Drawing or annotation submitted" : "",
          answer?.handwrittenPageAssigned
            ? `Handwritten response submitted${answer.handwrittenPdfPage ? ` on paper page ${answer.handwrittenPdfPage}` : ` on uploaded page ${Number(answer.handwrittenFileIndex || 0) + 1}`}`
            : "",
        ];
    const studentAnswer = responseParts.filter(Boolean).join(" | ");
    const correctAnswer = isMultipleChoice
      ? String(question.expected_answer || "").split("|")[0].trim().toUpperCase()
      : [question.expected_answer, question.mark_scheme_notes].filter(Boolean).join(" | ");
    const score = Number(question.final_mark || 0);
    const maximum = Number(question.marks || 0);
    return {
      label: String(question.label),
      topic: String(question.topic),
      studentAnswer,
      correctAnswer,
      correct: score === maximum,
      score,
      maximum,
      feedback: String(question.teacher_feedback || ""),
    };
  });
  const maximum = questions.reduce((total, question) => total + Number(question.marks || 0), 0);
  const studentName = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.username || "Student";
  const pdf = buildProgressReportPdf({
    student: studentName,
    title: String(submission.title),
    syllabus: String(submission.syllabus),
    date: new Date(String(submission.published_at)).toLocaleDateString("en-ZA"),
    score: Number(submission.total_final || 0),
    maximum,
    questions: reportQuestions,
    mode: String(submission.paper_mode) === "multiple_choice" ? "multiple_choice" : "structured",
    overallFeedback: String(submission.teacher_feedback || ""),
  });
  const filename = `${studentName}-${String(submission.title)}`.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 90);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename || "StudyTrack-report"}.pdf"`,
      "cache-control": "private, no-store",
    },
  });
}
