// The words printed around a paper's answer lines ("x = ......", "...... cm"),
// stored per answer box in assignment_questions.answer_labels and shown around
// the box the student types in. They are read from the PDF by
// answerLineLabel in lib/cambridge-analysis.ts (which, run on its own by a
// script, cannot import this file), and can be corrected in question review.
import { ANSWER_LABEL_MAX, type AnswerLabel } from "./cambridge-analysis";

export type { AnswerLabel };

const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

// Stored labels arrive as JSON text, or as an array in a request body. Keep
// well-formed entries only, trimmed and capped, one per possible answer box.
export function cleanAnswerLabels(value: unknown): AnswerLabel[] {
  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.slice(0, 6).map((entry) => {
    const source = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    return {
      before: tidy(String(source.before ?? "")).slice(0, ANSWER_LABEL_MAX),
      after: tidy(String(source.after ?? "")).slice(0, ANSWER_LABEL_MAX),
    };
  });
}

// What the student wrote, as it reads on the printed line: "x = 3", "12 cm".
export function withAnswerLabel(answer: string, label: AnswerLabel | undefined) {
  const value = String(answer ?? "").trim();
  if (!value || !label) return value;
  return tidy(`${label.before} ${value} ${label.after}`);
}
