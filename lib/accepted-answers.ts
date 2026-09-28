// Accepted answers for a word answer marked automatically, suggested from the
// mark scheme's own wording for the teacher to edit. A student's answer is
// accepted when it is one of them, ignoring capitals, spacing and a final
// full stop (normalizeText in the marking engine); anything else goes to the
// teacher, never to 0.
//
//   "rate of change of velocity or change in velocity / time (taken)"
//     → "rate of change of velocity", "change in velocity / time",
//       "change in velocity / time taken"
export function acceptedFromScheme(text: string): string[] {
  const clean = text.replace(/\s*Page \d+ of \d+\s*$/i, "").replace(/\s+/g, " ").trim();
  const variants = clean.split(/\s+or\s+/i).flatMap((alternative) => {
    const plain = alternative.trim().replace(/[.;,]+$/, "");
    if (!/\(/.test(plain)) return [plain];
    // Words in brackets are optional in Cambridge schemes: accept both.
    return [plain.replace(/\s*\([^()]*\)\s*/g, " "), plain.replace(/[()]/g, "")];
  });
  return [...new Set(variants.map((v) => v.replace(/\s+/g, " ").trim()).filter(Boolean))];
}

// A student types an answer word for word only when it is short: a term, a
// name, a short phrase. The first published paper had scheme sentences,
// equations and working lines as "accepted answers", which no student would
// ever type exactly, so every answer went to the teacher (2026-09-28).
const MAX_WORDS = 6;
const words = (answer: string) => answer.trim().split(/\s+/).filter(Boolean).length;
const isEquation = (answer: string) => answer.includes("=");
const hasNumbers = (answer: string) => /\d/.test(answer);

/** Suggestions to pre-fill: only the short ones a student could type exactly. */
export function suggestedAccepted(text: string): string[] {
  return acceptedFromScheme(text).filter((a) => words(a) <= MAX_WORDS && !isEquation(a));
}

/**
 * Why a list of accepted answers will rarely match, or null. Advice only: a
 * non-match goes to the teacher, never to 0, so nothing is blocked.
 */
export function wordAnswerWarning(accepted: string[]): string | null {
  const calculation = accepted.filter((a) => isEquation(a) || hasNumbers(a));
  const long = accepted.filter((a) => !calculation.includes(a) && words(a) > MAX_WORDS);
  if (!calculation.length && !long.length) return null;
  const parts: string[] = [];
  if (calculation.length)
    parts.push(`${quote(calculation)} ${calculation.length === 1 ? "looks" : "look"} like a calculation or equation. Students rarely type working exactly: for a final value, choose "a value with its unit".`);
  if (long.length)
    parts.push(`${quote(long)} ${long.length === 1 ? "is" : "are"} longer than ${MAX_WORDS} words. Students rarely type a whole sentence word for word: keep accepted answers to a short term or phrase.`);
  return `${parts.join(" ")} Answers that don't match exactly come to you.`;
}

const quote = (answers: string[]) =>
  answers.map((a) => `"${a.length > 40 ? a.slice(0, 40).trimEnd() + "…" : a}"`).join(", ");
