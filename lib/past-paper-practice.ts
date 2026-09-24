// Past-paper practice: a Stage 8/9 set made of questions the teacher approved
// from real papers -- the past-paper library and homework books -- shown as
// the cropped question and marked instantly like any practice set.
//
// Deliberately practice only: these sets are saved and appear in progress,
// but never count toward mastery or choose the difficulty tier. A unit with
// two approved questions must not be masterable from two 2-question sets.
// Pure, so it can be tested without a database; the route only loads rows.

import type { MasteryQuestion } from "./lower-secondary-question-engine";

/** Stored as the session's difficulty, and filtered out of every mastery count. */
export const PAST_PAPER = "past_paper";

export const PAST_PAPER_SET_SIZE = 6;

export type PastPaperRow = {
  id: string;
  assignment_id: string;
  title: string;
  source_year: string | null;
  label: string;
  marks: number | null;
  page_number: number;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  expected_answer: string;
  mark_scheme_notes: string | null;
};

/**
 * The answers a student may give, from the teacher's accepted answer. Variants
 * are separated by "|", as in question setup. A variant that shows working
 * ("12 ÷ 4 = 3") also accepts its final result, as Papers & assignments does.
 */
export function acceptedAnswers(expected: string): string[] {
  const out: string[] = [];
  for (const variant of expected.split("|").map((v) => v.trim()).filter(Boolean)) {
    out.push(variant);
    const parts = variant.split("=");
    const final = parts[parts.length - 1].trim();
    if (parts.length > 1 && final) out.push(final);
  }
  return [...new Set(out)];
}

const paperName = (row: Pick<PastPaperRow, "title" | "source_year">) =>
  row.source_year ? `${row.title} (${row.source_year})` : row.title;

export function pastPaperQuestion(row: PastPaperRow): MasteryQuestion {
  const answers = acceptedAnswers(row.expected_answer);
  const marks = Number(row.marks) || 0;
  const notes = String(row.mark_scheme_notes || "").trim();
  return {
    templateId: `past:${row.id}`,
    objective: `Past paper · ${paperName(row)}`,
    prompt: `Answer question ${row.label} shown below. Give your final answer only.`,
    answers,
    hint: marks > 1
      ? `This question is worth ${marks} marks, so it usually takes more than one step. Work it out on paper, then enter only the final answer.`
      : "Read the question again and check what it asks for, including any units.",
    solution: [`Accepted answer: ${answers[0]}.`, notes ? `Marking notes: ${notes.slice(0, 600)}` : ""].filter(Boolean).join(" "),
    source: {
      assignmentId: row.assignment_id,
      label: row.label,
      pageNumber: row.page_number,
      cropX: row.crop_x,
      cropY: row.crop_y,
      cropWidth: row.crop_width,
      cropHeight: row.crop_height,
      title: paperName(row),
    },
  };
}

/** Up to six questions, in a random order, from those approved for the unit. */
export function pastPaperSet(rows: PastPaperRow[], random: () => number = Math.random): MasteryQuestion[] {
  const usable = rows.filter((row) => acceptedAnswers(String(row.expected_answer || "")).length);
  const order = [...usable];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, PAST_PAPER_SET_SIZE).map(pastPaperQuestion);
}
