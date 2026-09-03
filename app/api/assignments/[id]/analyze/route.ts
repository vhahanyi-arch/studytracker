import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  analysePaperWithMarkScheme,
  parseMarkScheme,
  type CambridgePaperMode,
  type CambridgeSubject,
} from "@/lib/cambridge-analysis";
import { ensureSchema, sql } from "@/lib/db";
import { homeworkChapterForPage, stage8HomeworkBook2 } from "@/lib/lower-secondary-homework";
import { extractPdfPages, pdfPageCount, readPrivatePdf } from "@/lib/server-pdf";

export const maxDuration = 60;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Teacher access only." }, { status: 403 });

  await ensureSchema();
  const { id } = await context.params;
  const assignments = await sql`
    SELECT question_paper_url, mark_scheme_url, subject, paper_mode, lower_secondary_stage,
      resource_kind, content_start_page, content_end_page
    FROM assignments
    WHERE id = ${id} AND teacher_id = ${userId}
    LIMIT 1
  `;
  const assignment = assignments[0];
  if (!assignment)
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  try {
    if (String(assignment.resource_kind) === "homework") {
      const paperData = await readPrivatePdf(String(assignment.question_paper_url));
      const totalPages = await pdfPageCount(paperData);
      const startPage = Math.min(totalPages, Math.max(1, Number(assignment.content_start_page) || 1));
      const inferredEnd = totalPages === 114 && startPage === 5 ? 112 : totalPages;
      const endPage = Math.min(totalPages, Math.max(startPage, Number(assignment.content_end_page) || inferredEnd));
      const stage = Number(assignment.lower_secondary_stage) === 9 ? 9 : 8;
      const questions = Array.from({ length: endPage - startPage + 1 }, (_, index) => {
        const page = startPage + index;
        const chapter = homeworkChapterForPage(stage, totalPages, page);
        return {
          label: chapter ? `Ch ${chapter.number} · p${page}` : `Worksheet p${page}`,
          marks: 10,
          page_number: page,
          crop_x: 0,
          crop_y: 0,
          crop_width: 1,
          crop_height: 1,
          response_type: "typed",
          answer_slots: 4,
          response_layout: "working",
          expected_answer: null,
          mark_scheme_notes: chapter
            ? `${chapter.title}. No memo was supplied. Check the private draft answer before allowing this worksheet into automatic practice.`
            : "No memo was supplied. The teacher must review and mark this worksheet before publishing a result.",
          topic: chapter?.unitId || (stage === 8 ? "s8-u1" : "s9-u1"),
          draft_answer: null,
          draft_accepted_answer: null,
          draft_confidence: null,
          extracted_question_text: chapter?.title || null,
        };
      });
      const sections = stage8HomeworkBook2
        .filter((chapter) => chapter.lastPage >= startPage && chapter.firstPage <= endPage)
        .map((chapter) => ({
          number: chapter.number,
          title: chapter.title,
          unitId: chapter.unitId,
          firstPage: Math.max(startPage, chapter.firstPage),
          lastPage: Math.min(endPage, chapter.lastPage),
        }));
      return NextResponse.json({
        questions,
        matched: questions.length,
        total: questions.length,
        missing_labels: [],
        manual_marking: true,
        sections,
        detector: "Homework chapter detector v2",
      });
    }
    const [paperData, schemeData] = await Promise.all([
      readPrivatePdf(String(assignment.question_paper_url)),
      readPrivatePdf(String(assignment.mark_scheme_url)),
    ]);
    const [paperPages, schemePages] = await Promise.all([
      extractPdfPages(paperData),
      extractPdfPages(schemeData),
    ]);
    const subject = (["Mathematics", "Physics"].includes(String(assignment.subject))
      ? String(assignment.subject)
      : "Cambridge") as CambridgeSubject;
    const paperMode = (assignment.paper_mode === "multiple_choice"
      ? "multiple_choice"
      : "structured") as CambridgePaperMode;
    const schemeRows = parseMarkScheme(schemePages, subject, paperMode);

    if (!schemeRows.length) {
      return NextResponse.json(
        {
          error:
            "The official answer table could not be found in the uploaded mark scheme. Check that the second PDF is the Cambridge mark scheme, not another question paper.",
        },
        { status: 422 },
      );
    }

    const analysis = analysePaperWithMarkScheme(
      paperPages,
      schemeRows,
      subject,
      paperMode,
      assignment.lower_secondary_stage == null
        ? null
        : Number(assignment.lower_secondary_stage),
    );
    if (!analysis.questions.length) {
      return NextResponse.json(
        {
          error:
            "The question paper text could not be matched to the uploaded mark scheme. Check that both PDFs have the same paper code, variant and exam session.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      questions: analysis.questions,
      matched: analysis.questions.length,
      total: schemeRows.length,
      missing_labels: analysis.missingLabels,
      detector: "Cambridge table-guided detector v5",
    });
  } catch (error) {
    console.error("Cambridge paper analysis failed", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      {
        error:
          message === "PDF_NOT_FOUND"
            ? "One of the uploaded PDFs could not be opened. Replace the question paper or mark scheme and try again."
            : "The paper analysis could not finish. No questions were changed; please try again.",
      },
      { status: 500 },
    );
  }
}
