// physics-marking-engine.ts
//
// Auto-marking engine for uploaded Cambridge Physics answers.
// This consolidates the normalization, numeric comparison, unit handling,
// and marking-decision logic originally developed and verified in the
// standalone `physics-exam-studio` project. Every function here was
// independently tested (not just read) against real bug-triggering cases
// before being ported in. See the inline notes on each fix for why it
// exists — several of these guard against genuinely dangerous
// misinterpretations (e.g. subtraction being read as scientific notation),
// not just cosmetic formatting issues.

// ============================================================
// NORMALIZATION
// ============================================================

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁻": "-", "⁺": "+",
};

/**
 * Normalizes a mathematical expression extracted from a PDF or typed by a
 * student, fixing the specific corruption patterns Cambridge PDFs produce:
 * missing/corrupted multiplication symbols, inconsistent scientific
 * notation, and unicode superscripts.
 */
export function normalizeMath(input: string): string {
  return input
    // Convert unicode superscript runs (e.g. "⁻³") into "^-3"
    .replace(/[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (s) => "^" + [...s].map((c) => SUPERSCRIPT_MAP[c]).join(""))
    .normalize("NFKC")
    .replace(/[−–—]/g, "-")
    // × ✕ ✖ · ⋅ and the corrupted □ ■ glyphs PDF extraction sometimes produces
    // in place of a multiplication sign all become a plain "*"
    .replace(/[×✕✖·⋅□■]/g, "*")
    // "4.5 x 10" (lowercase x used as multiply, between two digits) -> "*"
    .replace(/(?<=\d)\s*[xX]\s*(?=\d)/g, "*")
    // A dropped multiplication symbol sometimes leaves just extra whitespace
    // between two numbers (e.g. "4.5  10^-3") — but NOT before a signed
    // number, since that's ambiguous with subtraction (e.g. "10  -3").
    .replace(/(?<=\d)\s{2,}(?=\d)/g, "*")
    .replace(/(?<=\d)\s+(?=10\s*(?:\^|[-+]))/g, "*")
    // "10^3", "10 ^ 3", "10^(3)", "10^(-3)" all become "10^N" — sign is
    // optional here (explicit ^ or ( already disambiguates from a bare number)
    .replace(/10\s*(?:\^\s*\(?|\(\s*)([+-]?\s*\d+)\)?/g, (_, e: string) => "10^" + e.replace(/\s/g, ""))
    // Caret-free scientific notation ("4.5×10-3", no explicit ^) is only
    // repaired when it directly follows a multiplication (the mantissa).
    // Genuine scientific notation always has one; plain subtraction like
    // "y = 10 - 3" never does. Without this guard, subtraction results get
    // silently misread as powers of ten (e.g. 7 misread as 10^-3 = 0.01).
    .replace(/(?<=\*\s*)10\s*([+-]\s*\d+)/g, (_, e: string) => "10^" + e.replace(/\s/g, ""))
    .replace(/\^\s*\(\s*([+-]?\d+)\s*\)/g, "^$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Normalizes a short text answer for case/whitespace/punctuation-insensitive comparison. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;]$/, "");
}

/**
 * Extracts the final answer from a (possibly multi-line) worked solution,
 * per Cambridge mark schemes storing the full derivation rather than an
 * isolated final value (e.g. "F = ma = 5 × 2 = 10 N" -> "10 N").
 */
export function finalExpression(input: string): string {
  const lines = input.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const last = lines.at(-1) ?? "";
  return normalizeMath(last.slice(last.lastIndexOf("=") + 1));
}

// ============================================================
// UNITS
// ============================================================

type Unit = { scale: number; dims: number[] };
const u = (scale: number, ...dims: number[]): Unit => ({ scale, dims });

// dims order: [mass, length, time, current, temperature, amount, luminosity]
const BASE_UNITS: Record<string, Unit> = {
  "1": u(1, 0, 0, 0, 0, 0, 0, 0),
  kg: u(1, 1, 0, 0, 0, 0, 0, 0),
  g: u(0.001, 1, 0, 0, 0, 0, 0, 0),
  m: u(1, 0, 1, 0, 0, 0, 0, 0),
  s: u(1, 0, 0, 1, 0, 0, 0, 0),
  A: u(1, 0, 0, 0, 1, 0, 0, 0),
  K: u(1, 0, 0, 0, 0, 1, 0, 0),
  mol: u(1, 0, 0, 0, 0, 0, 1, 0),
  cd: u(1, 0, 0, 0, 0, 0, 0, 1),
  N: u(1, 1, 1, -2, 0, 0, 0, 0),
  J: u(1, 1, 2, -2, 0, 0, 0, 0),
  W: u(1, 1, 2, -3, 0, 0, 0, 0),
  Pa: u(1, 1, -1, -2, 0, 0, 0, 0),
  Hz: u(1, 0, 0, -1, 0, 0, 0, 0),
  C: u(1, 0, 0, 1, 1, 0, 0, 0),
  V: u(1, 1, 2, -3, -1, 0, 0, 0),
  ohm: u(1, 1, 2, -3, -2, 0, 0, 0),
  Ω: u(1, 1, 2, -3, -2, 0, 0, 0),
  F: u(1, -1, -2, 4, 2, 0, 0, 0),
  T: u(1, 1, 0, -2, -1, 0, 0, 0),
  Wb: u(1, 1, 2, -2, -1, 0, 0, 0),
  Bq: u(1, 0, 0, -1, 0, 0, 0, 0),
  Gy: u(1, 0, 2, -2, 0, 0, 0, 0),
  rad: u(1, 0, 0, 0, 0, 0, 0, 0),
  min: u(60, 0, 0, 1, 0, 0, 0, 0),
  h: u(3600, 0, 0, 1, 0, 0, 0, 0),
  L: u(0.001, 0, 3, 0, 0, 0, 0, 0),
  eV: u(1.602176634e-19, 1, 2, -2, 0, 0, 0, 0),
};
const SI_PREFIXES: Record<string, number> = {
  da: 1e1, G: 1e9, M: 1e6, k: 1e3, h: 1e2, d: 1e-1, c: 1e-2,
  m: 1e-3, u: 1e-6, μ: 1e-6, µ: 1e-6, n: 1e-9, p: 1e-12,
};

function namedUnit(s: string): Unit {
  if (BASE_UNITS[s]) return BASE_UNITS[s];
  for (const [prefix, scale] of Object.entries(SI_PREFIXES)) {
    if (s.startsWith(prefix) && BASE_UNITS[s.slice(prefix.length)] && s.slice(prefix.length) !== "kg") {
      const base = BASE_UNITS[s.slice(prefix.length)];
      return { scale: scale * base.scale, dims: base.dims };
    }
  }
  throw new Error("Unsupported unit: " + s);
}
const combineUnits = (a: Unit, b: Unit, sign = 1): Unit => ({
  scale: a.scale * b.scale ** sign,
  dims: a.dims.map((d, i) => d + sign * b.dims[i]),
});

/** Parses a unit expression like "m/s^2" or "kg m^-3" into a dimension vector + scale factor. */
export function parseUnit(raw: string): Unit {
  const s = normalizeMath(raw)
    .replace(/\./g, "*")
    .replace(/\bper\b/g, "/")
    .replace(/\s*([*/^()])\s*/g, "$1")
    .replace(/\s+/g, "*");
  if (!s) return BASE_UNITS["1"];
  const tokens = s.match(/[A-Za-zΩμµ]+|[+-]?\d+|[*/^()]/g) ?? [];
  if (tokens.join("") !== s) throw new Error("Unsupported unit expression");
  let at = 0;
  function factor(): Unit {
    const token = tokens[at++];
    let value: Unit;
    if (token === "(") {
      value = expression();
      if (tokens[at++] !== ")") throw new Error("Unclosed unit group");
    } else if (token) value = namedUnit(token);
    else throw new Error("Missing unit");
    if (tokens[at] === "^" || /^[+-]?\d+$/.test(tokens[at] ?? "")) {
      if (tokens[at] === "^") at++;
      const power = Number(tokens[at++]);
      if (!Number.isInteger(power) || Math.abs(power) > 12) throw new Error("Invalid unit power");
      value = { scale: value.scale ** power, dims: value.dims.map((d) => d * power) };
    }
    return value;
  }
  function expression(): Unit {
    let value = factor();
    while (at < tokens.length && tokens[at] !== ")") {
      let sign = 1;
      if (tokens[at] === "/" || tokens[at] === "*") sign = tokens[at++] === "/" ? -1 : 1;
      value = combineUnits(value, factor(), sign);
    }
    return value;
  }
  const result = expression();
  if (at !== tokens.length) throw new Error("Unexpected unit token");
  return result;
}

export const sameDimensions = (a: Unit, b: Unit) => a.dims.every((x, i) => x === b.dims[i]);

// ============================================================
// NUMERIC COMPARISON
// ============================================================

export type NumericRule = {
  accepted: string[];
  unitRequired: boolean;
  relativeTolerance: number;
  absoluteTolerance: number;
  range: [number, number] | null;
};

/** Parses a final answer string into a {value, unit} pair. */
export function parseQuantity(raw: string) {
  const text = finalExpression(raw);
  const match = text.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(.*)$/);
  if (!match) throw new Error("No unambiguous numeric final answer");
  let value = Number(match[1]);
  let tail = match[2].trim();
  const power = tail.match(/^\*\s*10\s*\^\s*([+-]?\d+)(.*)$/);
  if (power) { value *= 10 ** Number(power[1]); tail = power[2].trim(); }
  const missing = tail.match(/^10\s*\^\s*([+-]?\d+)(.*)$/);
  if (missing) { value *= 10 ** Number(missing[1]); tail = missing[2].trim(); }
  // A bare power of ten with no explicit mantissa ("10^-3", not "1*10^-3") is
  // parsed by the leading-number regex as value=10 with tail starting at "^".
  // Only reinterpret when the parsed base is exactly 10, so this can never
  // touch an unrelated exponent expression like "25^2" (not scientific notation).
  // Also excluded: any value already produced by the scientific-notation
  // checks above, or written using "e" notation (1e1^2), which must not be
  // reread as a second, chained exponent.
  if (value === 10 && !power && !missing && !/[eE]/.test(match[1])) {
    const bareCaret = tail.match(/^\^\s*([+-]?\d+)(.*)$/);
    if (bareCaret) { value = 10 ** Number(bareCaret[1]); tail = bareCaret[2].trim(); }
  }
  // Any other unresolved exponent (e.g. "25^2") is deliberately left in the
  // tail; parseUnit will reject it, and compareNumeric routes that to
  // teacher review rather than guessing.
  if (!Number.isFinite(value)) throw new Error("Non-finite number");
  const unit = parseUnit(tail);
  return { value, unit, hasUnit: tail.length > 0 };
}

export type Comparison = { result: "match" | "miss" | "review"; reason: string };

/**
 * Compares a student's numeric answer against a mark scheme's accepted
 * value(s). Never guesses: any ambiguity in parsing the student's answer OR
 * any of the scheme's accepted alternatives routes to 'review', never to a
 * confident match or miss.
 */
export function compareNumeric(answer: string, rule: NumericRule): Comparison {
  let student: ReturnType<typeof parseQuantity>;
  try { student = parseQuantity(answer); }
  catch { return { result: "review", reason: "The numeric answer or its units need interpretation." }; }
  const expected: ReturnType<typeof parseQuantity>[] = [];
  try { for (const a of rule.accepted) expected.push(parseQuantity(a)); }
  catch { return { result: "review", reason: "The accepted answer is ambiguous; check the source mark scheme." }; }
  if (!expected.length || (rule.range && rule.range[0] > rule.range[1]))
    return { result: "review", reason: "Invalid numeric marking rule." };
  for (const target of expected) {
    if (rule.unitRequired && !student.hasUnit) continue;
    if (student.hasUnit && !sameDimensions(student.unit, target.unit)) continue;
    const actual = student.value * (student.hasUnit ? student.unit.scale : target.unit.scale);
    const wanted = target.value * target.unit.scale;
    const epsilon = Number.EPSILON * Math.max(Math.abs(actual), Math.abs(wanted), Number.MIN_VALUE) * 8;
    if (rule.range) {
      if (actual + epsilon >= rule.range[0] * target.unit.scale && actual - epsilon <= rule.range[1] * target.unit.scale)
        return { result: "match", reason: "Within the explicit accepted range, with compatible units." };
    } else if (Math.abs(actual - wanted) <= Math.max(rule.absoluteTolerance * target.unit.scale, Math.abs(wanted) * rule.relativeTolerance) + epsilon) {
      return { result: "match", reason: "Numeric value and units match the accepted answer." };
    }
  }
  return { result: "miss", reason: "The value or units do not match the accepted answer." };
}

// ============================================================
// MARKING DECISION
// ============================================================

export type Answer = { questionId: string; mode: "typed" | "handwritten"; text: string; steps: Record<string, string>; file: string | null };
export type Question = { id: string; marks: number; text: string; issues: string[] };
export type MarkingPoint = {
  id: string; marks: number; description: string; dependsOn: string[];
  kind: "numeric" | "exact" | "manual"; numeric?: NumericRule; accepted: string[];
};
export type Scheme = {
  marks: number; kind: "numeric" | "exact" | "manual" | "stepped"; expected: string;
  notes: string[]; unresolvedRules: string[]; finalAnswerAwardsAll?: boolean;
  numeric?: NumericRule; accepted: string[]; points: MarkingPoint[];
};
export type Grade = {
  questionId: string; proposed: number | null; final: number | null;
  status: "needs_review" | "proposed" | "self_practice"; reason: string;
  points: { id: string; description: string; marks: number; hit: boolean }[];
  expected: string; history: unknown[];
};

/**
 * Decides whether a question's mark scheme requires teacher review, based on
 * the question wording (open-ended verbs) or special marking notes (ECF,
 * significant figures, levels of response, "any N of the following", etc.)
 * that can't be safely auto-graded.
 */
export function reviewReason(q: Question, s: Scheme): string | null {
  if (/\b(explain|describe|discuss|justify|evaluate|compare|suggest|outline)\b/i.test(q.text))
    return "This question asks for an explanation or judgment and requires teacher review.";
  if (s.notes.some((n) => /\b(ecf|error carried|significant figures?|levels? of response|any (?:two|three|[2-9])|show (?:your )?working)\b/i.test(n)))
    return "Special marking notes require teacher interpretation.";
  return null;
}

/**
 * The central marking decision for one student answer against one question's
 * mark scheme. Defaults to 'needs_review' and only overrides that on an
 * explicit, safe success path — never the other way around. `selfPractice`
 * students get their proposed score immediately as their final score;
 * assigned-work students always get a teacher-reviewable proposal first.
 */
export function markAnswer(q: Question, s: Scheme | undefined, a: Answer, selfPractice = false): Grade {
  const grade: Grade = {
    questionId: q.id, proposed: null, final: null, status: "needs_review",
    reason: "Teacher review required.", points: [], expected: s?.expected ?? "No matching mark scheme.", history: [],
  };
  const review = (reason: string): Grade => ({ ...grade, reason });

  if (a.mode === "handwritten")
    return review("Handwritten answers are stored for teacher review. No handwriting recognition is used.");
  if (!s || s.marks !== q.marks) return review("Missing or inconsistent mark scheme.");
  // Reject any scheme kind outside the four known values before touching
  // anything kind-specific — a typo, null/undefined, or a future kind added
  // elsewhere without this function being updated must fail safely into
  // review, not silently fall through into stepped-marking logic (which
  // would then throw trying to read a nonexistent `points` array).
  if (!["numeric", "exact", "manual", "stepped"].includes(s.kind))
    return review("Unrecognized mark scheme type: " + String(s.kind));
  const policyReason = reviewReason(q, s);
  if (policyReason) return review(policyReason);
  if (q.issues.length) return review("Unresolved extraction issues.");
  if (s.kind === "manual") return review("Explanation, diagram or open-ended response: teacher judgment is required.");
  if (s.unresolvedRules.length) return review("Special marking rules need teacher interpretation: " + s.unresolvedRules.join("; "));

  function finish(score: number, reason: string): Grade {
    return { ...grade, proposed: score, final: selfPractice ? score : null, status: selfPractice ? "self_practice" : "proposed", reason };
  }

  if (s.kind === "numeric") {
    if (!s.numeric) return review("Missing numeric rule.");
    const result = compareNumeric(a.text, s.numeric);
    if (result.result === "review") return review(result.reason);
    // Multi-mark numeric questions require either an explicit
    // finalAnswerAwardsAll flag or route to review — a correct final answer
    // doesn't necessarily mean correct working, and a wrong final answer
    // doesn't necessarily mean zero method marks.
    if (q.marks > 1 && (!s.finalAnswerAwardsAll || result.result === "miss"))
      return review("Working or partial credit must be reviewed.");
    grade.points = [{ id: "answer", description: s.expected, marks: q.marks, hit: result.result === "match" }];
    return finish(result.result === "match" ? q.marks : 0, result.reason);
  }

  if (s.kind === "exact") {
    // Unlike numeric comparison, text matching only ever confidently
    // auto-grades a match. Anything that doesn't match an explicit accepted
    // alternative goes to review, not a confident miss — a student may have
    // used valid phrasing the scheme didn't anticipate.
    const hit = s.accepted.some((x) => normalizeText(x) === normalizeText(a.text));
    if (!hit) return review("Not an explicit accepted short answer; a teacher will check alternatives.");
    grade.points = [{ id: "answer", description: s.expected, marks: q.marks, hit: true }];
    return finish(q.marks, "Matches an explicit accepted alternative.");
  }

  // s.kind === 'stepped' from here (guaranteed by the exhaustiveness check above)
  const ids = new Set(s.points.map((p) => p.id));
  if (!s.points.length || ids.size !== s.points.length || s.points.reduce((n, p) => n + p.marks, 0) !== q.marks)
    return review("Invalid stepped marking allocation.");
  const hits = new Map<string, boolean>();
  let total = 0;
  for (const p of s.points) {
    if (p.dependsOn.some((id) => !hits.has(id))) return review("Unresolved or out-of-order marking dependency.");
    if (p.kind === "manual") return review("A marking point needs teacher judgment.");
    const evidence = a.steps[p.id] ?? "";
    const result = p.kind === "numeric" && p.numeric
      ? compareNumeric(evidence, p.numeric)
      : { result: p.accepted.some((x) => normalizeText(x) === normalizeText(evidence)) ? "match" as const : "review" as const, reason: "Step needs review." };
    if (result.result === "review") return review("Cannot safely assess step " + p.id + ".");
    // A step only counts as hit if its own check passed AND every step it
    // depends on was also hit — matches Cambridge error-carried-forward
    // marking, where a correct later step doesn't earn credit if it built
    // on an earlier wrong one.
    const hit = result.result === "match" && p.dependsOn.every((id) => hits.get(id));
    hits.set(p.id, hit);
    if (hit) total += p.marks;
    grade.points.push({ id: p.id, description: p.description, marks: p.marks, hit });
  }
  return finish(total, "Each supported marking point was assessed against its own evidence.");
}
