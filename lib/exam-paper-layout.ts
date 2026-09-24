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

// Bumped when crops are worked out differently, so saved papers get new ones.
// 2: roman subparts show their part's opening above them.
export const CROPS_VERSION = 2;

const MARGIN = 0.006;
const PAGE_TOP = 0.055;
// Where question crops end, above the page footer (as in cambridge-analysis).
const PAGE_BOTTOM = 0.95;
const band = (page: number, top: number, bottom: number): QuestionCrop =>
  ({ page, x: 0.025, y: Math.max(0.02, top - MARGIN), width: 0.95, height: bottom - top });

/**
 * The opening of a subpart's part: for 1(b)(ii), from "(b)" down to "(i)",
 * which holds the set-up and usually the diagram. Empty when the subpart's own
 * crop already starts there (the first subpart, on the same page as its part).
 * The opening may start on an earlier page, as when (b) begins at the foot
 * of one page and (i) is overleaf.
 */
function partOpening(hit: DetectedQuestion, all: DetectedQuestion[]): QuestionCrop[] {
  const start = hit.part_start;
  const part = hit.label.match(/^\d+\([a-z]\)/i)?.[0];
  if (!start || !part) return [];
  const shown = hit.page_number === start.page && hit.crop_y <= start.y;
  if (shown) return [];
  const first = all
    .filter((q) => q.label_y !== undefined && q.label.startsWith(`${part}(`))
    .sort((a, b) => a.page_number - b.page_number || a.label_y! - b.label_y!)[0];
  if (!first) return [];
  const end = { page: first.page_number, y: first.label_y! };
  if (end.page < start.page || (end.page === start.page && end.y - start.y < 0.02)) return [];
  if (end.page === start.page) return [band(start.page, start.y, end.y - MARGIN)];
  const crops = [band(start.page, start.y, PAGE_BOTTOM)];
  for (let page = start.page + 1; page < end.page; page++) crops.push(fullPage(page));
  // Text above (i) overleaf continues the opening; a page's first row sits
  // at about 0.09, so anything less is only the page header.
  if (end.y > 0.12) crops.push(band(end.page, PAGE_TOP + MARGIN, end.y - MARGIN));
  return crops;
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
  const analysed = analysePaperWithMarkScheme(pages, rows, "Physics", mode).questions;
  const found = new Map(analysed.map((q) => [q.label, q]));
  return Object.fromEntries(questions.map((q) => {
    const hit = found.get(q.id);
    if (!hit) return [q.id, (q.sourcePages.length ? q.sourcePages : [1]).map(fullPage)];
    return [q.id, [...partOpening(hit, analysed), ...withContinuations(cropOf(hit), q.sourcePages)]];
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
