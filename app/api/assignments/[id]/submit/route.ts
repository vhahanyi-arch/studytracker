import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { gradeQuestion } from "@/lib/grade-question";
import { questionPages, wholePaperLink } from "@/lib/handwritten-pages";
import { sittingTimer, studentPaper } from "@/lib/paper-access";
import { questionKey } from "@/lib/paper-questions";
import { currentViewer } from "@/lib/session";

// A paper is submitted once, as the student screen already shows: after that
// it is the teacher's, and a published result is final. Checked before any
// file is uploaded, and again by the unique key when the row is written.
const ALREADY_SUBMITTED = "You have already submitted this paper.";
const STILL_WITH_TEACHER = "Your last attempt at this paper is still with your teacher. You can sit it again once it has been marked.";
const isUniqueViolation = (error: unknown) =>
  (error as { code?: unknown } | null)?.code === "23505";
const isForeignKeyViolation = (error: unknown) =>
  (error as { code?: unknown } | null)?.code === "23503";
const PAPER_CHANGED = "Your teacher changed this paper's questions just as you submitted. Reload the paper and submit again.";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const viewer = await currentViewer();
  if (!viewer)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (viewer.role !== "student")
    return NextResponse.json(
      { error: "Student access is required." },
      { status: 403 },
    );
  const { userId } = viewer;
  const { id } = await context.params;
  await ensureSchema();
  const access = await studentPaper(id, userId);
  if (!access)
    return NextResponse.json(
      { error: "This paper is not assigned to your account." },
      { status: 403 },
    );
  const [previous, questions] = await Promise.all([
    sql`SELECT attempt, status FROM submissions WHERE assignment_id = ${id} AND student_id = ${userId} ORDER BY attempt DESC`,
    sql`
      SELECT q.id, q.label, q.marks, q.page_number, q.response_type, q.expected_answer,
        a.subject, a.syllabus, a.paper_mode
      FROM assignment_questions q
      JOIN assignments a ON a.id = q.assignment_id
      WHERE q.assignment_id = ${id} ORDER BY q.position
    `,
  ]);
  // A full past paper can be sat again once the last attempt has a result;
  // any other paper only once.
  if (previous.length && !access.fullPaper)
    return NextResponse.json({ error: ALREADY_SUBMITTED }, { status: 409 });
  if (previous.length && previous[0].status !== "published")
    return NextResponse.json({ error: STILL_WITH_TEACHER }, { status: 409 });
  const attempt = previous.length ? Number(previous[0].attempt) + 1 : 1;
  const form = await request.formData();
  const practice = access.fullPaper && form.get("sitting") === "practice";
  const timerMinutes = access.fullPaper ? sittingTimer(form.get("timerMinutes")) : null;
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
  await Promise.all(
    answerRows.map(async (row, index) => {
      if (!row.drawing?.startsWith("data:image/png;base64,")) return;
      const image = Buffer.from(row.drawing.split(",")[1], "base64");
      const blob = await put(
        `submissions/${id}/${userId}/drawing-${index + 1}-${Date.now()}.png`,
        image,
        { access: "private", addRandomSuffix: true, contentType: "image/png" },
      );
      row.drawingUrl = blob.url;
      delete row.drawing;
    }),
  );
  const answerFor = (label: unknown) =>
    answerRows.find((row) => questionKey(row.question) === questionKey(label));
  if (uploadedPages.length && questions.length) {
    if (handwrittenMode === "question_specific" && handwrittenAssignments.length) {
      for (const assignmentLink of handwrittenAssignments) {
        const question = questions.find((item) => questionKey(item.label) === questionKey(assignmentLink.question));
        if (!question) continue;
        const fileIndex = Math.max(0, Math.min(uploadedPages.length - 1, Number(assignmentLink.fileIndex) || 0));
        const pageLink = {
          handwrittenFileIndex: fileIndex,
          handwrittenPdfPage: uploadedPages[fileIndex]?.type === "application/pdf" ? 1 : undefined,
          handwrittenPageAssigned: true,
          handwrittenUploadMode: "question_specific" as const,
        };
        const existing = answerFor(question.label);
        if (existing) Object.assign(existing, pageLink);
        else answerRows.push({ question: String(question.label), answer: "", ...pageLink });
      }
    } else {
      const pages = questionPages(questions);
      const singlePdf = uploadedPages.length === 1 && uploadedPages[0].type === "application/pdf";
      for (const question of questions) {
        const pageLink = wholePaperLink(question.page_number, pages, uploadedPages.length, singlePdf);
        const existing = answerFor(question.label);
        if (existing) Object.assign(existing, pageLink);
        else answerRows.push({ question: String(question.label), answer: "", ...pageLink });
      }
    }
  }
  const storedAnswers = answerRows.length
    ? JSON.stringify(answerRows)
    : answerText;
  const multipleChoice = String(questions[0]?.paper_mode) === "multiple_choice";
  const graded = questions.map((question) => ({
    questionId: String(question.id),
    ...gradeQuestion(question, answerFor(question.label)),
  }));
  const proposedTotal = graded.reduce((total, mark) => total + (mark.proposed ?? 0), 0);
  const maximumTotal = graded.reduce((total, mark) => total + mark.maximum, 0);
  // Multiple-choice marks are final at once, and the result is published. So
  // is a practice sitting of a full past paper: it never reaches the marking
  // queue, and a question the marker cannot decide (a drawing, handwriting, no
  // accepted answer) scores nothing, which the student is told.
  const final = multipleChoice || practice;
  const finalMark = (mark: (typeof graded)[number]) => (final ? mark.proposed ?? 0 : null);
  const finalTotal = graded.reduce((total, mark) => total + (finalMark(mark) ?? 0), 0);
  const submissionId = crypto.randomUUID();
  try {
    await sql.transaction([
      sql`
        INSERT INTO submissions (id, assignment_id, student_id, answer_text, handwritten_url, status, total_proposed, total_final, published_at, attempt, self_practice, timer_minutes)
        VALUES (${submissionId}, ${id}, ${userId}, ${storedAnswers || null}, ${handwrittenUrl},
          ${final ? "published" : "awaiting_review"}, ${proposedTotal},
          ${final ? finalTotal : null}, ${final ? new Date().toISOString() : null},
          ${attempt}, ${practice}, ${timerMinutes})
      `,
      sql`
        INSERT INTO submission_marks
        (submission_id, question_id, proposed_mark, final_mark, confidence, rationale)
        SELECT ${submissionId}::uuid, m.question_id, m.proposed, m.final, m.confidence, m.rationale
        FROM unnest(
          ${graded.map((mark) => mark.questionId)}::uuid[],
          ${graded.map((mark) => mark.proposed)}::int[],
          ${graded.map(finalMark)}::int[],
          ${graded.map((mark) => (multipleChoice ? "high" : mark.confidence))}::text[],
          ${graded.map((mark) => mark.rationale)}::text[]
        ) AS m(question_id, proposed, final, confidence, rationale)
      `,
    ]);
  } catch (error) {
    // A second tab submitted between the check above and this write, and took
    // this attempt's number.
    if (isUniqueViolation(error))
      return NextResponse.json({ error: access.fullPaper ? "This attempt was already submitted from another tab." : ALREADY_SUBMITTED }, { status: 409 });
    // The teacher's save removed a question between the read above and this
    // write (see the questions route), so a mark points at a question that is
    // gone. Nothing was written; the student submits again on the new paper.
    if (isForeignKeyViolation(error))
      return NextResponse.json({ error: PAPER_CHANGED }, { status: 409 });
    throw error;
  }
  const sitting = access.fullPaper ? { attempt, practice, submissionId } : {};
  if (final)
    return NextResponse.json({
      submitted: true,
      status: "published",
      total: finalTotal,
      maximum: maximumTotal,
      ...sitting,
    });
  return NextResponse.json({ submitted: true, status: "awaiting_review", ...sitting });
}
