import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const viewer = await clerk.users.getUser(userId);
  if (viewer.publicMetadata.role === "student") {
    await ensureSchema();
    const results = await sql`
      SELECT s.id, s.assignment_id, s.status, s.total_final, s.teacher_feedback, s.published_at,
        a.title, a.paper_mode, COALESCE(SUM(q.marks), 0)::int AS maximum
      FROM submissions s JOIN assignments a ON a.id = s.assignment_id
      LEFT JOIN assignment_questions q ON q.assignment_id = a.id
      WHERE s.student_id = ${userId} AND s.status = 'published'
      GROUP BY s.id, s.assignment_id, a.title, a.paper_mode ORDER BY s.published_at DESC
    `;
    const published = await Promise.all(
      results.map(async (result) => ({
        ...result,
        marks: await sql`
          SELECT q.label, q.marks AS maximum, m.final_mark,
            m.teacher_feedback
          FROM submission_marks m
          JOIN assignment_questions q ON q.id = m.question_id
          WHERE m.submission_id = ${result.id}
          ORDER BY q.position
        `,
      })),
    );
    return NextResponse.json(published);
  }
  if (viewer.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  await ensureSchema();
  const submissions = await sql`
    SELECT s.id, s.assignment_id, s.student_id, s.answer_text, s.status,
      s.submitted_at, s.total_proposed, s.total_final, s.teacher_feedback,
      s.published_at, s.handwritten_url, a.title, a.paper_mode
    FROM submissions s JOIN assignments a ON a.id = s.assignment_id
    WHERE a.teacher_id = ${userId} ORDER BY s.submitted_at DESC
  `;
  const result = await Promise.all(
    submissions.map(async (submission) => {
      const [student, marks] = await Promise.all([
        clerk.users.getUser(String(submission.student_id)),
        sql`
          SELECT q.id AS question_id, q.position, q.label, q.page_number, q.marks AS maximum,
            q.response_type, q.expected_answer, q.mark_scheme_notes, q.topic,
            q.draft_answer, q.draft_confidence,
            m.proposed_mark, m.final_mark, m.confidence,
            m.rationale, m.teacher_feedback
          FROM assignment_questions q
          LEFT JOIN submission_marks m ON m.question_id = q.id AND m.submission_id = ${submission.id}
          WHERE q.assignment_id = ${submission.assignment_id} ORDER BY q.position
        `,
      ]);
      const parsedAnswers: any[] = (() => {
        try {
          return JSON.parse(String(submission.answer_text || "[]"));
        } catch {
          return [];
        }
      })();
      const handwrittenFiles: Array<{ type?: string }> = (() => {
        const stored = String(submission.handwritten_url || "").trim();
        if (!stored) return [];
        try {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? parsed : [{}];
        } catch {
          return [{}];
        }
      })();
      const detectedPages = [...new Set(marks.map((mark) => Number(mark.page_number || 1)))].sort((a, b) => a - b);
      const singlePdf = handwrittenFiles.length === 1 && (handwrittenFiles[0].type === "application/pdf" || String(submission.handwritten_url || "").toLowerCase().includes(".pdf"));
      const normalizedLabel = (value: unknown) => String(value || "").toLowerCase().replace(/\s+/g, "");
      const answerRows = parsedAnswers.length
        ? parsedAnswers
        : marks.map((mark) => ({ question: String(mark.label), answer: "" }));
      const answers = handwrittenFiles.length
        ? answerRows.map((answer) => {
            if (answer.handwrittenPageAssigned) return answer;
            const mark = marks.find((item) => normalizedLabel(item.label) === normalizedLabel(answer.question));
            if (!mark) return answer;
            const paperPage = Math.max(1, Number(mark.page_number || 1));
            const compactPageIndex = detectedPages.indexOf(paperPage);
            return {
              ...answer,
              handwrittenPageAssigned: true,
              handwrittenUploadMode: "whole_paper",
              handwrittenFileIndex: singlePdf
                ? 0
                : handwrittenFiles.length === detectedPages.length && compactPageIndex >= 0
                  ? compactPageIndex
                  : Math.min(handwrittenFiles.length - 1, paperPage - 1),
              handwrittenPdfPage: singlePdf ? paperPage : undefined,
            };
          })
        : answerRows;
      return {
        ...submission,
        handwritten_url: undefined,
        handwritten_count: (() => {
          const stored = String(submission.handwritten_url || "").trim();
          if (!stored) return 0;
          try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed.length : 1;
          } catch {
            return 1;
          }
        })(),
        student_name:
          [student.firstName, student.lastName].filter(Boolean).join(" ") ||
          student.username ||
          "Student",
        answers,
        marks,
      };
    }),
  );
  return NextResponse.json(result);
}
