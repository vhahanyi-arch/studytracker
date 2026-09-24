// Reads a Cambridge physics paper from its PDF text layer, without AI: the
// question screenshots for any paper, and the whole of a multiple-choice paper
// (its questions and answer key). Built on lib/cambridge-analysis.ts, the
// reader behind Papers & assignments, which finds every question and answer
// letter on real 0625 and 9702 Paper 1 schemes.
import {
  analysePaperWithMarkScheme, parseMarkScheme,
  type PdfPageData, type SchemeRow, type DetectedQuestion,
} from "./cambridge-analysis";
import { validateExtraction } from "./physics-exam-extraction-validation";
import type { Extraction, QuestionCrop } from "./physics-extraction-schema";

const FULL_PAGE = { x: 0, y: 0, width: 1, height: 1 };
const fullPage = (page: number): QuestionCrop => ({ page, ...FULL_PAGE });

function cropOf(found: DetectedQuestion): QuestionCrop {
  return { page: found.page_number, x: found.crop_x, y: found.crop_y, width: found.crop_width, height: found.crop_height };
}

// A question that runs onto later pages gets those pages too, whole.
function withContinuations(first: QuestionCrop, sourcePages: number[]): QuestionCrop[] {
  return [first, ...[...new Set(sourcePages)].filter((p) => p > first.page).sort((a, b) => a - b).map(fullPage)];
}

/**
 * Screenshot crops for already-extracted questions, located by their printed
 * labels. A question whose label cannot be found (a scan with no text layer,
 * say) falls back to its whole source pages rather than to nothing.
 */
export function questionCrops(
  paperPages: PdfPageData[],
  questions: Array<{ id: string; marks: number; sourcePages: number[] }>,
  mode: "structured" | "multiple_choice" = "structured",
): Record<string, QuestionCrop[]> {
  // In a combined PDF the mark scheme follows the questions; its table labels
  // must not be mistaken for question numbers.
  const cited = questions.flatMap((q) => q.sourcePages);
  const pages = cited.length ? paperPages.filter((page) => page.pageNumber <= Math.max(...cited)) : paperPages;
  const rows: SchemeRow[] = questions.map((q) => ({ label: q.id, answer: "", marks: q.marks, guidance: "", points: [] }));
  const found = new Map(analysePaperWithMarkScheme(pages, rows, "Physics", mode).questions.map((q) => [q.label, q]));
  return Object.fromEntries(questions.map((q) => {
    const hit = found.get(q.id);
    return [q.id, hit ? withContinuations(cropOf(hit), q.sourcePages) : (q.sourcePages.length ? q.sourcePages : [1]).map(fullPage)];
  }));
}

function syllabusOf(pages: PdfPageData[]): Extraction["syllabus"] {
  const text = pages.slice(0, 2).flatMap((p) => p.words.map((w) => w.text)).join(" ");
  const code = text.match(/\b(0625|9702)\b/)?.[1];
  return code === "0625" || code === "9702" ? code : "unknown";
}

/**
 * A whole multiple-choice paper from its question paper and mark scheme. For
 * one combined PDF, pass the same pages as both.
 */
export function multipleChoicePaper(paperPages: PdfPageData[], schemePages: PdfPageData[]): { extraction: Extraction; crops: Record<string, QuestionCrop[]> } {
  const rows = parseMarkScheme(schemePages, "Physics", "multiple_choice");
  if (!rows.length) throw Error("No answer table was found in the mark scheme. Check it is the multiple-choice scheme, with a Question / Answer / Marks table.");
  const analysed = analysePaperWithMarkScheme(paperPages, rows, "Physics", "multiple_choice");
  const found = new Map(analysed.questions.map((q) => [q.label, q]));
  let lastPage = 1;
  const crops: Record<string, QuestionCrop[]> = {};
  const extraction: Extraction = {
    syllabus: syllabusOf([...paperPages, ...schemePages]),
    warnings: [],
    questions: rows.map((row) => {
      const hit = found.get(row.label);
      if (hit) lastPage = hit.page_number;
      crops[row.label] = [hit ? cropOf(hit) : fullPage(lastPage)];
      const issues: string[] = [];
      if (!/^[A-D]$/.test(row.answer)) issues.push("No answer letter was found for this question in the mark scheme.");
      if (!hit) issues.push("This question was not found on the question paper. Check its screenshot.");
      return {
        id: row.label, text: `Question ${row.label} (multiple choice)`, context: "",
        marks: row.marks || 1, topic: hit?.topic || "General skills",
        sourcePages: [hit?.page_number ?? lastPage], references: [], issues,
      };
    }),
    schemes: rows.map((row) => ({
      questionId: row.label, raw: row.guidance || row.answer, expected: row.answer, marks: row.marks || 1,
      kind: "exact" as const, numeric: null, accepted: /^[A-D]$/.test(row.answer) ? [row.answer] : [],
      points: [], notes: [], unresolvedRules: [], finalAnswerAwardsAll: false, sourcePages: [1],
    })),
  };
  return { extraction: validateExtraction(extraction), crops };
}
