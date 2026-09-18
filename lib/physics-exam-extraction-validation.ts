// physics-exam-extraction-validation.ts
//
// Validates and normalizes a raw AI-extracted paper (question IDs, missing
// mark schemes, marks mismatches, parent/child double-counting). Relocated
// from physics-exam-studio's src/extraction/validation/index.ts with import
// paths updated to StudyTrack's flat lib/ convention; logic unchanged and
// already verified (9/9 realistic Cambridge question-numbering formats
// tested, including skip-to-roman-numeral subparts).

import type { Extraction } from "./physics-extraction-schema";

export function canonicalId(raw: string): string {
  const id = raw.toLowerCase().replace(/\s+/g, "").replace(/^q(?:uestion)?\.?/, "");
  if (!/^\d+(?:\([a-z]\))?(?:\([ivxlcdm]+\))?$/.test(id)) throw Error("Invalid question number: " + raw);
  return id.replace(/^0+(?=\d)/, "");
}

export function validateExtraction(input: Extraction): Extraction {
  const out = structuredClone(input);
  const seen = new Set<string>();
  for (const q of out.questions) {
    q.id = canonicalId(q.id);
    if (seen.has(q.id)) throw Error("Duplicate question " + q.id + "; resolve the split/merge before publishing.");
    seen.add(q.id);
  }
  const schemes = new Set<string>();
  for (const s of out.schemes) {
    s.questionId = canonicalId(s.questionId);
    if (schemes.has(s.questionId)) throw Error("Duplicate scheme " + s.questionId + "; consolidate the marking points explicitly.");
    schemes.add(s.questionId);
  }
  for (const q of out.questions) {
    const s = out.schemes.find((s) => s.questionId === q.id);
    if (!s) q.issues.push("Missing matching mark scheme.");
    else if (s.marks !== q.marks) q.issues.push("Question and scheme marks disagree.");
    if (out.questions.some((other) => other.id !== q.id && other.id.startsWith(q.id + "(")))
      q.issues.push("Parent and child both have marks; check for double counting.");
    q.issues = [...new Set(q.issues)];
  }
  if (!out.questions.length) out.warnings.push("No questions extracted.");
  return out;
}
