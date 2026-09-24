// Reads a structured Cambridge physics paper (9702 Paper 2, 0625 Paper 3/4…)
// straight from its PDFs' text, without AI: every part the mark scheme lists,
// its marks and marking points, where it sits on the question paper, and, for
// a calculation, its final answer so a correct one is marked automatically.
//
// Nothing uncertain is guessed. A part is only marked automatically when a
// correct final answer is certain to earn all its marks (one A mark, the rest
// compensation C marks, no special guidance); every other part is marked by
// the teacher, who still sees the expected answer. Anything the reader could
// not confirm becomes an issue on the part for the teacher's review.
import {
  analysePaperWithMarkScheme, parseMarkScheme,
  type PdfPageData, type PdfWord, type SchemeRow, type DetectedQuestion,
} from "./cambridge-analysis";
import { questionCrops } from "./exam-paper-layout";
import { parseQuantity } from "./physics-marking-engine";
import { validateExtraction } from "./physics-exam-extraction-validation";
import type { Extraction, MarkingPoint, QuestionCrop, Scheme } from "./physics-extraction-schema";

// ── Marking points ─────────────────────────────────────────────────────────

// alternative: part of a second, alternative method ("OR alternative route"),
// whose marks are not added to the part's total.
export type SchemeMark = { code: string; type: string; marks: number; text: string; alternative: boolean };

const MARK_CODE = /\b([ABCM])([1-9])\b/g;
const PAGE_FOOTER = /^Page \d+ of \d+$/i;

/**
 * The marking points of one part, from the scheme's visual rows. A row with a
 * mark code (C1, A1, B1, M1…) starts a point; rows without one continue it.
 * Text before the first code belongs to the first point. A point whose text
 * starts "OR" begins an alternative method, as do all the points after it.
 */
export function schemeMarks(row: SchemeRow): SchemeMark[] {
  const marks: SchemeMark[] = [];
  let lead: string[] = [];
  let alternative = false;
  for (const point of row.points) {
    const text = point.answer.trim();
    if (PAGE_FOOTER.test(text)) continue;
    const codes = [...point.marks.matchAll(MARK_CODE)];
    if (!codes.length) {
      if (marks.length) marks[marks.length - 1].text = [marks[marks.length - 1].text, text].filter(Boolean).join("\n");
      else if (text) lead.push(text);
      continue;
    }
    if (marks.length && /^OR\b/i.test(text)) alternative = true;
    // Several codes in one cell ("B1 B1") are several points with one text.
    codes.forEach((code, i) => marks.push({
      code: code[0], type: code[1], marks: Number(code[2]), alternative,
      text: i ? "" : [...lead, text].filter(Boolean).join("\n"),
    }));
    lead = [];
  }
  return marks;
}

// ── A calculation's final answer ───────────────────────────────────────────

export type FinalAnswer = { accepted: string[]; range: [number, number] | null; shown: string; partial: boolean };

const DASH = /[–−—]/g;
const NUMBER = String.raw`-?(?:\d+(?:\.\d+)?|\.\d+)`;

/**
 * One value and unit rewritten into the form the marking engine reads:
 * "1.8 × 10 –2 J" → "1.8*10^-2 J", "m / s 2" → "m / s^2", "41 000 kg" →
 * "41000 kg", "3.0 × 10 8 (J)" → "3.0*10^8 J". Null unless it is exactly a
 * number with a unit the engine understands.
 */
function engineValue(raw: string): string | null {
  let value = raw.trim()
    .replace(/^-\s+(?=\d)/, "-")
    .replace(/^(-?\d{1,3})((?:\s\d{3})+)(?![\d.])/, (_, head: string, groups: string) => head + groups.replace(/\s/g, ""))
    .replace(/\(\s*([^()]*?)\s*\)\s*$/, "$1")
    .replace(/\s*[×x*]\s*10\s*(-?)\s*(\d+)/, "*10^$1$2")
    .replace(/([A-Za-zΩμµ°])\s*(-?)\s*(\d)(?![\d.])/g, (_, unit: string, sign: string, power: string) => `${unit}^${sign}${power}`)
    .replace(/(\d)\s*°/, "$1 °")
    .replace(/\s+/g, " ");
  // "Give your answer in wavelengths": the paper prints λ on the answer line,
  // so the student gives the number. Any other unit is wrong.
  value = value.replace(new RegExp(`^(${NUMBER})\\s*λ$`), "$1");
  if (!new RegExp(`^${NUMBER}(?:\\*10\\^-?\\d+)?(?: [A-Za-zΩμµ°][A-Za-zΩμµ°^\\-\\d /]*)?$`).test(value)) return null;
  try {
    parseQuantity(value);
  } catch {
    return null;
  }
  return value;
}

/**
 * The final answer on a scheme line: what follows its last "=" (or the whole
 * line when it has none, as 0625 schemes often do), with any "( I =)" label
 * dropped. "X OR Y" accepts either; "in range 0.30 to 0.45 m / s 2" accepts
 * anything between. Null when it is not plainly a value: a flattened fraction,
 * "e.g.", a temperature, words.
 */
export function finalAnswer(text: string): FinalAnswer | null {
  const flat = text.replace(/\s+/g, " ").replace(/\s*Page \d+ of \d+\s*$/i, "").trim().replace(DASH, "-");
  // "( I =) 3.4 × 10 –9 A" leaves ") 3.4…"; "(2 × 10 14 atoms remain after) 940 yrs"
  // starts with a note in brackets. Either way the answer follows the bracket.
  const tail = flat.slice(flat.lastIndexOf("=") + 1).replace(/^\s*\)\s*/, "").replace(/^\([^()]*\)\s*(?=[-\d.])/, "").trim();
  if (!tail || /°\s*C\b/.test(tail)) return null; // temperatures: scales and differences need a teacher
  // "acceleration in range 0.30 to 0.45 m / s 2", "330–350 m / s"
  const range = tail.match(new RegExp(`^(?:[A-Za-z ]*\\bin (?:the )?range\\s+)?(${NUMBER})\\s*(?:to|-)\\s*(${NUMBER})(\\s*[^\\d\\s].*)?$`, "i"));
  if (range) {
    const unit = range[3] ?? "";
    const low = engineValue(range[1] + unit), high = engineValue(range[2] + unit);
    if (!low || !high || Number(range[1]) >= Number(range[2])) return null;
    return { accepted: [low], range: [Number(range[1]), Number(range[2])], shown: `${range[1]} to ${high}`, partial: false };
  }
  const alternatives = tail.split(/\s+OR\s+/i).map(engineValue);
  const values = alternatives.filter((a): a is string => !!a);
  if (!values.length) return null;
  // "940 yrs or 2 half-lives": only the values are checked; partial says the
  // other forms were not, so a miss must go to the teacher.
  return { accepted: values, range: null, shown: values.join(" or "), partial: values.length < alternatives.length };
}

/**
 * Accept anything that rounds to the published answer: half a unit in its
 * last written digit, in the answer's own unit ("0.87 s" → ±0.005 s).
 */
export function roundingTolerance(value: string): number {
  const mantissa = value.match(/^-?(\d+(?:\.(\d+))?)/);
  const exponent = Number(value.match(/\*10\^(-?\d+)/)?.[1] ?? 0);
  const decimals = mantissa?.[2]?.length ?? 0;
  return 0.5 * 10 ** (exponent - decimals);
}

// Guidance or wording that means a correct final answer is not the whole
// story, so a teacher marks the part. RESTRICTED blocks automatic marking
// outright; WIDENED ("allow 0.9") only accepts more, so it blocks it only on
// one-mark parts, where a miss would otherwise score 0 with no teacher.
// "not", "reject" and "max" count only in the guidance column: in an answer
// they are words of the answer ("F MAX = 0.45 N").
const RESTRICTED = /\b(ecf|e\.c\.f|error carried|sig(?:nificant)? ?fig|s\.f\.|levels? of response|any (?:two|three|[2-9])|show (?:your )?working)\b/i;
const RESTRICTED_GUIDANCE = /\b(not|reject|max(?:imum)?)\b/i;
const WIDENED = /\b(allow|accept|ignore|e\.g\.)\b/i;
const NOT_A_BARE_ANSWER = /\b(show that|estimate|explain|describe|suggest|sketch|draw|plot)\b/i;
// "Use your answer in (a)", "using your value for…"; not "give your answer in terms of λ".
const USES_OWN_ANSWER = /\b(?:use|using)\s+your\s+(?:answers?|values?)\b|\byour (?:answers?|values?) (?:to|from|in) (?:\(|part|question)/i;

export function schemeFor(row: SchemeRow, all: SchemeMark[], questionText: string, schemePage = 1): { scheme: Scheme; issues: string[] } {
  const marks = all.filter((m) => !m.alternative);
  const total = marks.reduce((n, m) => n + m.marks, 0);
  const issues: string[] = [];
  if (!total) issues.push("No marks (C1, A1, B1, M1…) were read for this part in the mark scheme. Check its marks.");
  const answers = marks.filter((m) => m.type === "A");
  // The answer mark: the one A mark, or a part's only mark (a one-mark B1 value).
  const answerMark = answers.length === 1 && marks.every((m) => m === answers[0] || m.type === "C") ? answers[0]
    : marks.length === 1 && (marks[0].type === "A" || marks[0].type === "B") ? marks[0] : null;
  const final = answerMark ? finalAnswer(answerMark.text) : null;
  const guidance = row.points.map((p) => p.guidance).filter(Boolean);
  const wording = [...guidance, answerMark?.text ?? ""];
  // On a one-mark part a miss scores 0 with no teacher, so anything that could
  // make a right answer miss keeps it with the teacher: widened guidance, an
  // answer built on the student's own earlier one, forms not checked, or a
  // value like "6000" whose precision is unclear.
  const oneMarkSafe = !wording.some((g) => WIDENED.test(g)) && !USES_OWN_ANSWER.test(questionText)
    && !!final && !final.partial && final.accepted.every((a) => !/^-?\d*[1-9]00+(?![\d.])/.test(a));
  const automatic = !!final
    && !wording.some((g) => RESTRICTED.test(g))
    && !guidance.some((g) => RESTRICTED_GUIDANCE.test(g))
    && !NOT_A_BARE_ANSWER.test(questionText)
    && (total > 1 || oneMarkSafe);
  const points: MarkingPoint[] = all.map((m, i) => ({
    id: `p${i + 1}`, description: `${m.alternative ? "(alternative) " : ""}${m.code} ${m.text}`.trim(), marks: m.marks,
    kind: "manual", accepted: [], numeric: null, dependsOn: [],
  }));
  // A part the teacher marks shows the scheme's own words, not a number taken
  // from them: "…continues to t = 1.5 s" is a graph, not an answer of 1.5 s.
  const expected = automatic ? final!.shown : (answers.at(-1)?.text ?? marks.map((m) => m.text).join(" ")).replace(/\s+/g, " ");
  return {
    issues,
    scheme: {
      questionId: row.label,
      raw: all.map((m) => `${m.alternative ? "(alternative) " : ""}${m.code}  ${m.text.replace(/\n/g, " ")}`).join("\n") || row.guidance,
      expected: expected.slice(0, 500),
      marks: total || 1,
      kind: automatic ? "numeric" : "manual",
      numeric: automatic ? {
        accepted: final!.accepted, unitRequired: false, relativeTolerance: 0,
        absoluteTolerance: final!.range ? 0 : roundingTolerance(final!.accepted[0]), range: final!.range,
      } : null,
      accepted: automatic ? final!.accepted : [],
      points,
      notes: guidance,
      unresolvedRules: [],
      finalAnswerAwardsAll: automatic,
      sourcePages: [...new Set((row.spans ?? []).map((s) => s.page))].sort((a, b) => a - b).concat(row.spans?.length ? [] : [schemePage]),
    },
  };
}

// ── Where each part sits on the question paper ─────────────────────────────

const PAGE_TOP = 0.055;
const PAGE_BOTTOM = 0.95;
const band = (page: number, top: number, bottom: number): QuestionCrop =>
  ({ page, x: 0.025, y: Math.max(0.02, top - 0.006), width: 0.95, height: bottom - top });

const isBlank = (page: PdfPageData) => /\bBLANK PAGE\b/.test(page.words.map((w) => w.text).join(" "));

/**
 * A part that runs past the foot of its page continues until the next part
 * starts: the top of that part's page, and any whole pages between (blank
 * pages skipped). The last part stops at its own page.
 */
function continuation(hit: DetectedQuestion, next: DetectedQuestion | undefined, pages: PdfPageData[]): QuestionCrop[] {
  if (!next || next.page_number <= hit.page_number) return [];
  const crops: QuestionCrop[] = [];
  for (let page = hit.page_number + 1; page < next.page_number; page++) {
    const data = pages.find((p) => p.pageNumber === page);
    if (data && !isBlank(data)) crops.push({ page, x: 0, y: 0, width: 1, height: 1 });
  }
  // Up to where the next part's own screenshot starts, which for the first
  // part of a question is its number and opening, not its "(a)".
  const y = next.crop_y + 0.006;
  if (y > 0.12) crops.push(band(next.page_number, PAGE_TOP, y - 0.006));
  return crops;
}

const wordsIn = (page: PdfPageData | undefined, crop: QuestionCrop): PdfWord[] =>
  !page ? [] : page.words.filter((w) => {
    const top = w.top / page.height;
    return w.horizontal !== false && top >= crop.y && top <= crop.y + crop.height;
  });

function textOf(words: PdfWord[]): string {
  return [...words]
    .sort((a, b) => a.top - b.top || a.x - b.x)
    .map((w) => w.text)
    .filter((t) => !/^\.{4,}$/.test(t) && !/^_{4,}$/.test(t))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

const printedMarks = (words: PdfWord[]) =>
  // "[2]" alone (9702) or at the end of the answer line, "…………… [2]" (0625).
  words.map((w) => w.text.match(/(?:^|[\s.])\[(\d{1,2})\]$/)?.[1]).filter(Boolean).reduce((n, m) => n + Number(m), 0);

// ── The whole paper ────────────────────────────────────────────────────────

function looksScanned(pages: PdfPageData[]) {
  // A scan has no text layer, or a stray word or two per page; a real paper
  // has hundreds of words a page.
  return pages.reduce((n, p) => n + p.words.length, 0) < 5 * pages.length;
}

/**
 * A whole structured paper from its question paper and mark scheme, without
 * AI. For one combined PDF, pass the same pages as both.
 */
export function structuredPaper(paperPages: PdfPageData[], schemePages: PdfPageData[]): { extraction: Extraction; crops: Record<string, QuestionCrop[]> } {
  if (looksScanned(paperPages))
    throw Error("This question paper has no selectable text; it looks like a scan. Upload the original Cambridge PDF, or read it with AI.");
  const rows = parseMarkScheme(schemePages, "Physics", "structured");
  if (!rows.length)
    throw Error("No mark scheme table was found. Check it is the structured paper's scheme, with a Question / Answer / Marks table.");

  // In a combined PDF the scheme follows the questions; look for parts only before it.
  const firstSchemePage = Math.min(...rows.flatMap((r) => (r.spans ?? []).map((s) => s.page)));
  const questionPages = paperPages === schemePages && Number.isFinite(firstSchemePage)
    ? paperPages.filter((p) => p.pageNumber < firstSchemePage)
    : paperPages;

  const hits = analysePaperWithMarkScheme(questionPages, rows, "Physics", "structured").questions;
  const hitOf = new Map(hits.map((h) => [h.label, h]));
  const ordered = rows.map((r) => hitOf.get(r.label)).filter((h): h is DetectedQuestion => !!h);
  const located = questionCrops(questionPages, rows.map((r) => ({ id: r.label, marks: r.marks ?? 1, sourcePages: hitOf.has(r.label) ? [hitOf.get(r.label)!.page_number] : [] })));

  const crops: Record<string, QuestionCrop[]> = {};
  const warnings: string[] = [];
  let lastPage = questionPages[1]?.pageNumber ?? 1;
  const extraction: Extraction = { syllabus: syllabusOf(paperPages), warnings, questions: [], schemes: [] };

  for (const row of rows) {
    const hit = hitOf.get(row.label);
    const issues: string[] = [];
    let own: QuestionCrop[] = [];
    if (hit) {
      lastPage = hit.page_number;
      const next = ordered[ordered.indexOf(hit) + 1];
      crops[row.label] = [...located[row.label], ...continuation(hit, next, questionPages)];
      own = crops[row.label].filter((c) => c.page > hit.page_number || (c.page === hit.page_number && c.y + 0.001 >= hit.crop_y));
    } else {
      crops[row.label] = [{ page: lastPage, x: 0, y: 0, width: 1, height: 1 }];
      issues.push("This part was not found on the question paper. Check its screenshot.");
    }
    const words = own.flatMap((c) => wordsIn(questionPages.find((p) => p.pageNumber === c.page), c));
    const text = textOf(words);
    const marks = schemeMarks(row);
    const { scheme, issues: schemeIssues } = schemeFor(row, marks, text, schemePages[0]?.pageNumber ?? 1);
    issues.push(...schemeIssues);
    const printed = printedMarks(words);
    if (hit && printed && printed !== scheme.marks)
      issues.push(`The paper prints [${printed}] for this part but the mark scheme gives ${scheme.marks}. Check its marks.`);
    extraction.questions.push({
      id: row.label, text: text.slice(0, 2000) || `Question ${row.label}`, context: "",
      marks: scheme.marks, topic: hit?.topic || "General skills",
      sourcePages: [...new Set(crops[row.label].map((c) => c.page))].sort((a, b) => a - b),
      references: [], issues,
    });
    extraction.schemes.push(scheme);
  }

  const total = paperTotal(paperPages);
  const sum = extraction.schemes.reduce((n, s) => n + s.marks, 0);
  if (total && total !== sum) warnings.push(`The paper's total is ${total} marks, but the parts read add up to ${sum}. Check for a missing or misread part.`);
  return { extraction: validateExtraction(extraction), crops };
}

function syllabusOf(pages: PdfPageData[]): Extraction["syllabus"] {
  const text = pages.slice(0, 2).flatMap((p) => p.words.map((w) => w.text)).join(" ");
  const code = text.match(/\b(0625|9702)\b/)?.[1];
  return code === "0625" || code === "9702" ? code : "unknown";
}

function paperTotal(pages: PdfPageData[]): number | null {
  const text = pages.slice(0, 2).flatMap((p) => p.words.map((w) => w.text)).join(" ").replace(/\s+/g, " ");
  const found = text.match(/total mark for this paper is (\d{1,3})/i);
  return found ? Number(found[1]) : null;
}
