import type { NumericRule, MarkingPoint, Scheme, Question, Answer, Grade } from "./physics-extraction-schema";
export type { NumericRule, MarkingPoint, Scheme, Question, Answer, Grade } from "./physics-extraction-schema";

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
  "⁻": "-", "⁺": "+",
};

export function normalizeMath(input: string): string {
  return input
    .replace(/[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (s) => "^" + [...s].map((c) => SUPERSCRIPT_MAP[c]).join(""))
    .normalize("NFKC")
    .replace(/[−–—]/g, "-")
    .replace(/[×✕✖·⋅□■]/g, "*")
    .replace(/(?<=\d)\s*[xX]\s*(?=\d)/g, "*")
    .replace(/(?<=\d)\s{2,}(?=\d)/g, "*")
    .replace(/(?<=\d)\s+(?=10\s*(?:\^|[-+]))/g, "*")
    .replace(/10\s*(?:\^\s*\(?|\(\s*)([+-]?\s*\d+)\)?/g, (_, e: string) => "10^" + e.replace(/\s/g, ""))
    .replace(/(?<=\*\s*)10\s*([+-]\s*\d+)/g, (_, e: string) => "10^" + e.replace(/\s/g, ""))
    .replace(/\^\s*\(\s*([+-]?\d+)\s*\)/g, "^$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeText(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;]$/, "");
}

export function finalExpression(input: string): string {
  const lines = input.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const last = lines.at(-1) ?? "";
  return normalizeMath(last.slice(last.lastIndexOf("=") + 1));
}

type Unit = { scale: number; dims: number[] };
const u = (scale: number, ...dims: number[]): Unit => ({ scale, dims });

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
  // Angles in degrees ("θ = 30°"), converted through radians.
  "°": u(Math.PI / 180, 0, 0, 0, 0, 0, 0, 0),
  deg: u(Math.PI / 180, 0, 0, 0, 0, 0, 0, 0),
  min: u(60, 0, 0, 1, 0, 0, 0, 0),
  h: u(3600, 0, 0, 1, 0, 0, 0, 0),
  // Half-lives ("940 yrs"): a Julian year.
  yr: u(31557600, 0, 0, 1, 0, 0, 0, 0),
  yrs: u(31557600, 0, 0, 1, 0, 0, 0, 0),
  year: u(31557600, 0, 0, 1, 0, 0, 0, 0),
  years: u(31557600, 0, 0, 1, 0, 0, 0, 0),
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

export function parseUnit(raw: string): Unit {
  // Degrees Celsius is a scale with an offset, not a unit to multiply through;
  // without this "°C" would read as degrees of angle times coulombs.
  if (/°\s*C\b/.test(raw)) throw new Error("Temperature units need interpretation");
  const s = normalizeMath(raw)
    .replace(/\./g, "*")
    .replace(/\bper\b/g, "/")
    .replace(/\s*([*/^()])\s*/g, "$1")
    .replace(/\s+/g, "*");
  if (!s) return BASE_UNITS["1"];
  const tokens = s.match(/[A-Za-zΩμµ]+|°|[+-]?\d+|[*/^()]/g) ?? [];
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
  if (value === 10 && !power && !missing && !/[eE]/.test(match[1])) {
    const bareCaret = tail.match(/^\^\s*([+-]?\d+)(.*)$/);
    if (bareCaret) { value = 10 ** Number(bareCaret[1]); tail = bareCaret[2].trim(); }
  }
  if (!Number.isFinite(value)) throw new Error("Non-finite number");
  const unit = parseUnit(tail);
  return { value, unit, hasUnit: tail.length > 0 };
}

export type Comparison = { result: "match" | "miss" | "review"; reason: string };

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

export function reviewReason(q: Question, s: Scheme): string | null {
  if (/\b(explain|describe|discuss|justify|evaluate|compare|suggest|outline)\b/i.test(q.text))
    return "This question asks for an explanation or judgment and requires teacher review.";
  if (s.notes.some((n) => /\b(ecf|error carried|significant figures?|levels? of response|any (?:two|three|[2-9])|show (?:your )?working)\b/i.test(n)))
    return "Special marking notes require teacher interpretation.";
  return null;
}

export function markAnswer(q: Question, s: Scheme | undefined, a: Answer, selfPractice = false): Grade {
  const grade: Grade = {
    questionId: q.id, proposed: null, final: null, status: "needs_review",
    reason: "Teacher review required.", points: [], expected: s?.expected ?? "No matching mark scheme.", history: [],
  };
  const review = (reason: string): Grade => ({ ...grade, reason });

  if (a.mode === "handwritten")
    return review("Handwritten answers are stored for teacher review. No handwriting recognition is used.");
  if (!s || s.marks !== q.marks) return review("Missing or inconsistent mark scheme.");
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
    if (q.marks > 1 && (!s.finalAnswerAwardsAll || result.result === "miss"))
      return review("Working or partial credit must be reviewed.");
    grade.points = [{ id: "answer", description: s.expected, marks: q.marks, hit: result.result === "match" }];
    return finish(result.result === "match" ? q.marks : 0, result.reason);
  }

  if (s.kind === "exact") {
    const hit = s.accepted.some((x) => normalizeText(x) === normalizeText(a.text));
    // A multiple-choice key is one letter, so there are no alternatives for a
    // teacher to weigh: another letter, or none, is simply wrong.
    const choice = /^[a-d]$/;
    const multipleChoice = s.accepted.length > 0 && s.accepted.every((x) => choice.test(normalizeText(x)));
    if (!hit && multipleChoice && (choice.test(normalizeText(a.text)) || !a.text.trim())) {
      grade.points = [{ id: "answer", description: s.expected, marks: q.marks, hit: false }];
      return finish(0, a.text.trim() ? "Not the correct option." : "No option was chosen.");
    }
    if (!hit) return review("Not an explicit accepted short answer; a teacher will check alternatives.");
    grade.points = [{ id: "answer", description: s.expected, marks: q.marks, hit: true }];
    return finish(q.marks, "Matches an explicit accepted alternative.");
  }

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
    const hit = result.result === "match" && p.dependsOn.every((id) => hits.get(id));
    hits.set(p.id, hit);
    if (hit) total += p.marks;
    grade.points.push({ id: p.id, description: p.description, marks: p.marks, hit });
  }
  return finish(total, "Each supported marking point was assessed against its own evidence.");
}
