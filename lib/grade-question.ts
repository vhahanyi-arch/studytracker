export type GradableQuestion = {
  response_type?: string | null;
  expected_answer?: string | null;
  marks?: number | string | null;
};

export type GradableAnswer = {
  answer?: string;
  answers?: string[];
  working?: string;
  handwrittenPageAssigned?: boolean;
  handwrittenFileIndex?: number;
} | undefined;

export function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/,/g, ".");
}

export function parseNumericAnswer(value: string): number {
  const cleaned = value
    .replace(/[−–—]/g, "-")
    .replace(/[×x*]\s*10\s*\^?\s*([+-]?\d+)/i, "e$1")
    .replace(
      /^(\s*[+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?).*$/,
      (_all, top, bottom) => String(Number(top) / Number(bottom)),
    );
  const match = cleaned.match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
  return match ? Number(match[0]) : Number.NaN;
}

export function gradeQuestion(question: GradableQuestion, answer: GradableAnswer) {
  const response = (
    answer?.answers?.filter((value) => String(value).trim()).join(" | ") ||
    String(answer?.answer || "")
  ).trim();
  const expected = String(question.expected_answer || "").trim();
  const maximum = Number(question.marks || 0);

  if (answer?.handwrittenPageAssigned && !response) {
    return {
      proposed: null as number | null,
      confidence: "review",
      rationale: `Handwritten response assigned from submitted page ${Number(answer.handwrittenFileIndex || 0) + 1}; teacher marking is required.`,
      maximum,
    };
  }
  if (question.response_type === "drawing") {
    return { proposed: null as number | null, confidence: "review", rationale: "Drawing response: inspect the submitted annotation.", maximum };
  }
  if (!expected) {
    return { proposed: null as number | null, confidence: "review", rationale: "No accepted answer has been configured for this question.", maximum };
  }

  // Each accepted variant is checked both as written, and as its final result
  // (the text after its last "="), so a mark scheme that shows full working
  // (e.g. "23 × 3.4 ... = (23+160)v ... v = 0.43 m s-1") still matches a
  // student who — correctly — just wrote the final answer.
  const rawVariants = expected.split("|").map((variant) => variant.trim());
  const accepted = rawVariants
    .flatMap((variant) => {
      const options = [variant];
      const equalsParts = variant.split("=");
      if (equalsParts.length > 1) options.push(equalsParts[equalsParts.length - 1].trim());
      return options;
    })
    .map(normalizeAnswer);

  const normalizedResponse = normalizeAnswer(response);
  const matches = accepted.some((option) => {
    if (option === normalizedResponse) return true;
    const optionNumber = parseNumericAnswer(option);
    const submittedNumber = parseNumericAnswer(normalizedResponse);
    return (
      Number.isFinite(submittedNumber) &&
      Number.isFinite(optionNumber) &&
      Math.abs(submittedNumber - optionNumber) <= Math.max(1e-9, Math.abs(optionNumber) * 1e-6)
    );
  });

  const proposed = matches ? maximum : 0;
  const confidence = matches ? "high" : answer?.working?.trim() ? "review" : "medium";
  const rationale = matches
    ? "The final answer matches an accepted answer exactly or is numerically equivalent."
    : answer?.working?.trim()
      ? "The final answer does not match; inspect the working for method marks."
      : "The final answer does not match an accepted answer.";

  return { proposed, confidence, rationale, maximum };
}
