import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  canonicalQuestionLabel,
  parseMarkScheme,
  type CambridgePaperMode,
  type CambridgeSubject,
} from "@/lib/cambridge-analysis";
import { ensureSchema, sql } from "@/lib/db";
import { extractPdfPages, readPrivatePdf } from "@/lib/server-pdf";

export const maxDuration = 60;

type Question = {
  label: string;
  response_type?: string;
  marks?: number | null;
  expected_answer?: string | null;
  mark_scheme_notes?: string | null;
  [key: string]: unknown;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "teacher")
    return NextResponse.json({ error: "Teacher access only." }, { status: 403 });

  const body = await request.json();
  const questions: Question[] = Array.isArray(body.questions)
    ? body.questions.slice(0, 100)
    : [];
  if (!questions.length)
    return NextResponse.json(
      { error: "Detect or add the questions before extracting answers." },
      { status: 400 },
    );

  await ensureSchema();
  const { id } = await context.params;
  const assignments = await sql`
    SELECT mark_scheme_url, subject, paper_mode
    FROM assignments
    WHERE id = ${id} AND teacher_id = ${userId}
    LIMIT 1
  `;
  const assignment = assignments[0];
  if (!assignment)
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  try {
    const schemePages = await extractPdfPages(
      await readPrivatePdf(String(assignment.mark_scheme_url)),
    );
    const subject = (["Mathematics", "Physics"].includes(String(assignment.subject))
      ? String(assignment.subject)
      : "Cambridge") as CambridgeSubject;
    const paperMode = (assignment.paper_mode === "multiple_choice"
      ? "multiple_choice"
      : "structured") as CambridgePaperMode;
    const rows = parseMarkScheme(schemePages, subject, paperMode);
    if (!rows.length) {
      return NextResponse.json(
        {
          error:
            "The official answer table could not be found. Check that the uploaded PDF is the Cambridge mark scheme for this paper.",
        },
        { status: 422 },
      );
    }

    const byLabel = new Map(
      rows.map((row) => [canonicalQuestionLabel(row.label), row]),
    );
    let matched = 0;
    const enriched = questions.map((question) => {
      const row = byLabel.get(canonicalQuestionLabel(question.label));
      if (!row) return question;
      matched += 1;
      const graphical = !row.answer && question.response_type === "drawing";
      return {
        ...question,
        marks: row.marks ?? question.marks ?? null,
        expected_answer:
          row.answer ||
          (graphical
            ? "Diagram response - teacher review required"
            : question.expected_answer || null),
        mark_scheme_notes:
          row.guidance ||
          (graphical
            ? "The accepted response is shown graphically in the mark scheme and must be checked by the teacher."
            : question.mark_scheme_notes || null),
      };
    });

    return NextResponse.json({
      questions: enriched,
      matched,
      total: questions.length,
      unmatched_labels: questions
        .filter((question) => !byLabel.has(canonicalQuestionLabel(question.label)))
        .map((question) => question.label),
    });
  } catch (error) {
    console.error("Mark-scheme extraction failed", error);
    return NextResponse.json(
      {
        error:
          "The mark scheme could not be read. No answers were changed; please try again.",
      },
      { status: 500 },
    );
  }
}
