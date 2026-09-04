import { auth, clerkClient } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { gradeQuestion } from "@/lib/grade-question";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "student")
    return NextResponse.json(
      { error: "Student access is required." },
      { status: 403 },
    );
  const { id } = await context.params;
  await ensureSchema();
  const assigned = await sql`
    SELECT 1 FROM assignment_students s
    JOIN assignments a ON a.id = s.assignment_id
    WHERE s.assignment_id = ${id} AND s.student_id = ${userId}
      AND a.status = 'assigned'
    LIMIT 1
  `;
  if (!assigned.length)
    return NextResponse.json(
      { error: "This paper is not assigned to your account." },
      { status: 403 },
    );
  const questions = await sql`
    SELECT q.id, q.label, q.marks, q.page_number, q.response_type, q.expected_answer,
      a.subject, a.syllabus, a.paper_mode
    FROM assignment_questions q
    JOIN assignments a ON a.id = q.assignment_id
    WHERE q.assignment_id = ${id} ORDER BY q.position
  `;
  const form = await request.formData();
  const answerText = String(form.get("answers") ?? "").trim();
  const handwrittenFiles = form
    .getAll("handwritten")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const handwrittenMode = form.get("handwrittenMode") === "question_specific"
    ? "question_specific"
    : "whole_paper";
  const handwrittenAssignments: Array<{ question: string; fileIndex: number }> = (() => {
    try {
      const parsed = JSON.parse(String(form.get("handwrittenAssignments") || "[]"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  let hasTypedAnswer = false;
  let answerRows: Array<{
    question?: string;
    formula?: string;
    working?: string;
    answer?: string;
    answers?: string[];
    drawing?: string;
    drawingUrl?: string;
    handwrittenFileIndex?: number;
    handwrittenPdfPage?: number;
    handwrittenPageAssigned?: boolean;
    handwrittenUploadMode?: "whole_paper" | "question_specific";
  }> = [];
  try {
    answerRows = JSON.parse(answerText);
    hasTypedAnswer = answerRows.some(
      (row) =>
        String(row.formula ?? "").trim() ||
        String(row.working ?? "").trim() ||
        String(row.answer ?? "").trim() ||
        row.answers?.some((answer) => String(answer).trim()) ||
        String(row.drawing ?? "").startsWith("data:image/png;base64,"),
    );
  } catch {
    hasTypedAnswer = Boolean(answerText);
  }
  if (!hasTypedAnswer && !handwrittenFiles.length)
    return NextResponse.json(
      { error: "Add at least one typed answer or upload handwritten work." },
      { status: 400 },
    );
  let handwrittenUrl: string | null = null;
  let uploadedPages: Array<{ url: string; name: string; type: string }> = [];
  if (handwrittenFiles.length) {
    const totalSize = handwrittenFiles.reduce((total, file) => total + file.size, 0);
    if (handwrittenFiles.length > 20 || totalSize > 40_000_000)
      return NextResponse.json(
        { error: "Upload no more than 20 handwritten pages with a combined size below 40 MB." },
        { status: 400 },
      );
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (handwrittenFiles.some((file) => !allowed.includes(file.type)))
      return NextResponse.json(
        { error: "Upload a PDF, JPG, PNG or WebP file." },
        { status: 400 },
      );
    uploadedPages = await Promise.all(
      handwrittenFiles.map(async (file, index) => {
        const blob = await put(
          `submissions/${id}/${userId}/handwritten-page-${index + 1}-${Date.now()}-${file.name || "page"}`,
          file,
          { access: "private", addRandomSuffix: true },
        );
        return { url: blob.url, name: file.name || `Page ${index + 1}`, type: file.type };
      }),
    );
    handwrittenUrl = JSON.stringify(uploadedPages);
  }
  for (let index = 0; index < answerRows.length; index++) {
    const drawing = answerRows[index].drawing;
    if (drawing?.startsWith("data:image/png;base64,")) {
      const image = Buffer.from(drawing.split(",")[1], "base64");
      const blob = await put(
        `submissions/${id}/${userId}/drawing-${index + 1}-${Date.now()}.png`,
        image,
        { access: "private", addRandomSuffix: true, contentType: "image/png" },
      );
      answerRows[index].drawingUrl = blob.url;
      delete answerRows[index].drawing;
    }
  }
  if (uploadedPages.length && questions.length) {
    const labelKey = (value: unknown) => String(value || "").toLowerCase().replace(/\s+/g, "");
    if (handwrittenMode === "question_specific" && handwrittenAssignments.length) {
      for (const assignmentLink of handwrittenAssignments) {
        const question = questions.find((item) => labelKey(item.label) === labelKey(assignmentLink.question));
        if (!question) continue;
        const fileIndex = Math.max(0, Math.min(uploadedPages.length - 1, Number(assignmentLink.fileIndex) || 0));
        const existing = answerRows.find((row) => labelKey(row.question) === labelKey(question.label));
        const pageLink = {
          handwrittenFileIndex: fileIndex,
          handwrittenPdfPage: uploadedPages[fileIndex]?.type === "application/pdf" ? 1 : undefined,
          handwrittenPageAssigned: true,
          handwrittenUploadMode: "question_specific" as const,
        };
        if (existing) Object.assign(existing, pageLink);
        else answerRows.push({ question: String(question.label), answer: "", ...pageLink });
      }
    } else {
      const detectedPages = [...new Set(questions.map((question) => Number(question.page_number || 1)))].sort((a, b) => a - b);
      const singlePdf = uploadedPages.length === 1 && uploadedPages[0].type === "application/pdf";
      for (const question of questions) {
        const paperPage = Math.max(1, Number(question.page_number || 1));
        const compactPageIndex = detectedPages.indexOf(paperPage);
        const fileIndex = singlePdf
          ? 0
          : uploadedPages.length === detectedPages.length && compactPageIndex >= 0
            ? compactPageIndex
            : Math.min(uploadedPages.length - 1, paperPage - 1);
        const existing = answerRows.find((row) => labelKey(row.question) === labelKey(question.label));
        const pageLink = {
          handwrittenFileIndex: Math.max(0, fileIndex),
          handwrittenPdfPage: singlePdf ? paperPage : undefined,
          handwrittenPageAssigned: true,
          handwrittenUploadMode: "whole_paper" as const,
        };
        if (existing) Object.assign(existing, pageLink);
        else answerRows.push({ question: String(question.label), answer: "", ...pageLink });
      }
    }
  }
  const storedAnswers = answerRows.length
    ? JSON.stringify(answerRows)
    : answerText;
  const submissionId = crypto.randomUUID();
  const saved = await sql`
    INSERT INTO submissions (id, assignment_id, student_id, answer_text, handwritten_url, status)
    VALUES (${submissionId}, ${id}, ${userId}, ${storedAnswers || null}, ${handwrittenUrl}, 'awaiting_review')
    ON CONFLICT (assignment_id, student_id) DO UPDATE SET
      answer_text = EXCLUDED.answer_text,
      handwritten_url = COALESCE(EXCLUDED.handwritten_url, submissions.handwritten_url),
      status = 'awaiting_review',
      total_final = NULL,
      teacher_feedback = NULL,
      published_at = NULL,
      submitted_at = NOW()
    RETURNING id
  `;
  const savedId = String(saved[0].id);
  const normalize = (value: string) =>
    value.toLowerCase().replace(/\s+/g, "").replace(/,/g, ".");
  await sql`DELETE FROM submission_marks WHERE submission_id = ${savedId}`;
  let proposedTotal = 0;
  let maximumTotal = 0;
  const multipleChoice = String(questions[0]?.paper_mode) === "multiple_choice";
  for (const question of questions) {
    const answer = answerRows.find(
      (row) =>
        normalize(String(row.question || "")) ===
        normalize(String(question.label)),
    );
    const graded = gradeQuestion(question, answer);
    const { proposed, confidence, rationale, maximum } = graded;
    if (proposed !== null) {
      proposedTotal += proposed;
    }
    maximumTotal += maximum;
    await sql`
      INSERT INTO submission_marks
      (submission_id, question_id, proposed_mark, final_mark, confidence, rationale)
      VALUES (${savedId}, ${question.id}, ${proposed}, ${multipleChoice ? proposed : null}, ${multipleChoice ? "high" : confidence}, ${rationale})
    `;
  }
  if (multipleChoice) {
    await sql`
      UPDATE submissions SET total_proposed = ${proposedTotal}, total_final = ${proposedTotal},
        status = 'published', published_at = NOW()
      WHERE id = ${savedId}
    `;
    return NextResponse.json({
      submitted: true,
      status: "published",
      total: proposedTotal,
      maximum: maximumTotal,
    });
  }
  await sql`UPDATE submissions SET total_proposed = ${proposedTotal} WHERE id = ${savedId}`;
  return NextResponse.json({ submitted: true, status: "awaiting_review" });
}
