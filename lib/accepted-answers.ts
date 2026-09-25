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
