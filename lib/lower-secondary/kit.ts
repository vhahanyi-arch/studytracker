// Shared building blocks for the Stage 8 and 9 question templates: random
// choice, exact fraction arithmetic, prime factorisation and formatting.
//
// Most of the defects in the previous generators were formatting slips made
// inline -- "for 1 hours", "a equilateral triangle", `(-6)` beside `−6` in the
// same question, 0.30000000000000004 -- so the rules live here once, tested.

// ---- randomness ----------------------------------------------------------

/** Integer in [min, max], inclusive. */
export const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Random non-zero integer in [min, max]. */
export const rNonZero = (min: number, max: number) => { let v = 0; while (v === 0) v = r(min, max); return v; };

export const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** `count` different integers from [min, max]. */
export function distinct(count: number, min: number, max: number): number[] {
  if (max - min + 1 < count) throw new Error(`cannot draw ${count} distinct values from ${min}..${max}`);
  const seen = new Set<number>();
  while (seen.size < count) seen.add(r(min, max));
  return [...seen];
}

// ---- number theory ---------------------------------------------------------

export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function isPrime(n: number) {
  if (n < 2 || !Number.isInteger(n)) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** Prime factors in ascending order, with repeats: 60 -> [2, 2, 3, 5]. */
export function primeFactors(n: number): number[] {
  const out: number[] = [];
  for (let d = 2; d * d <= n; d++) while (n % d === 0) { out.push(d); n /= d; }
  if (n > 1) out.push(n);
  return out;
}

const SUPER: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
export const sup = (n: number | string) => String(n).split("").map((c) => SUPER[c] ?? c).join("");

/** "2³ × 3²" -> "2^3 × 3^2": the form students type. */
export const supToCaret = (s: string) => s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + [...m].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).join(""));

/** 60 -> "2² × 3 × 5" (index form). */
export function primeIndexForm(n: number) {
  const counts = new Map<number, number>();
  for (const p of primeFactors(n)) counts.set(p, (counts.get(p) || 0) + 1);
  return [...counts].map(([p, k]) => (k === 1 ? `${p}` : `${p}${sup(k)}`)).join(" × ");
}

/** 60 -> "2 × 2 × 3 × 5". */
export const primeProductForm = (n: number) => primeFactors(n).join(" × ");

// ---- exact fractions -------------------------------------------------------

export type Frac = { n: number; d: number };

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error("zero denominator");
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}
export const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
export const value = (f: Frac) => f.n / f.d;
export const eq = (a: Frac, b: Frac) => a.n === b.n && a.d === b.d;

/** "3/4", "−3/4", or a whole number when the denominator is 1. */
export function fracStr(f: Frac) {
  const g = frac(f.n, f.d);
  return g.d === 1 ? fmt(g.n) : `${g.n < 0 ? "−" : ""}${Math.abs(g.n)}/${g.d}`;
}

/** Mixed number in simplest form: 7/3 -> "2 1/3", 6/3 -> "2", 2/3 -> "2/3". */
export function mixedStr(f: Frac) {
  const g = frac(f.n, f.d);
  const sign = g.n < 0 ? "−" : "", n = Math.abs(g.n);
  const whole = Math.floor(n / g.d), rest = n % g.d;
  if (rest === 0) return `${sign}${whole}`;
  return whole === 0 ? `${sign}${rest}/${g.d}` : `${sign}${whole} ${rest}/${g.d}`;
}

/** Whole part plus proper fraction -> improper fraction. */
export const fromMixed = (whole: number, n: number, d: number) => frac(whole * d + n, d);

/**
 * Whether a fraction's decimal terminates: after simplifying, the denominator
 * has no prime factors other than 2 and 5.
 */
export function terminates(f: Frac) {
  return primeFactors(frac(f.n, f.d).d).every((p) => p === 2 || p === 5);
}

// ---- formatting --------------------------------------------------------------

/** Round away floating-point noise: 0.1 + 0.2 -> 0.3. */
export const tidyNum = (x: number, dp = 10) => Number(x.toFixed(dp)) + 0;

/**
 * Round to n significant figures, halves away from zero. The scaled value is
 * cleaned before rounding: 0.0045 is stored as 0.00449999..., which a plain
 * Math.round would send down to 0.004 instead of up to 0.005.
 */
export function roundSF(x: number, n: number) {
  if (x === 0) return 0;
  const k = Math.floor(Math.log10(Math.abs(x))) - n + 1;
  const scaled = tidyNum(Math.abs(x) / 10 ** k, 8);
  return Math.sign(x) * tidyNum(Math.round(scaled) * 10 ** k, 12);
}

/** Round to dp decimal places, halves away from zero, with the same care. */
export function roundDP(x: number, dp: number) {
  const scaled = tidyNum(Math.abs(x) * 10 ** dp, 8);
  return Math.sign(x) * tidyNum(Math.round(scaled) / 10 ** dp, 12);
}

/** Large numbers grouped in threes with spaces, as Cambridge prints them: 1846213 -> "1 846 213". */
export function big(x: number) {
  const [whole, dec] = fmt(x).replace("−", "").split(".");
  const grouped = whole.length > 4 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ") : whole;
  return (x < 0 ? "−" : "") + grouped + (dec ? "." + dec : "");
}

/** A number as text, with a true minus sign and no float noise: -0.3 -> "−0.3". */
export function fmt(x: number, dp = 10) {
  const v = tidyNum(x, dp);
  return (v < 0 ? "−" : "") + String(Math.abs(v));
}

/** A number as an answer: ASCII minus, since that is what students type. */
export const ans = (x: number, dp = 10) => String(tidyNum(x, dp));

/** Fixed decimal places for money and measurements: 4.5 -> "4.50". */
export const money = (x: number) => fmt(Math.round(x * 100) / 100).replace(/^(−?\d+)$/, "$1.00").replace(/^(−?\d+\.\d)$/, "$10");

/** Wrap a negative in brackets for use inside an expression: -3 -> "(−3)". */
export const br = (x: number) => (x < 0 ? `(${fmt(x)})` : fmt(x));

/** "1 hour", "3 hours". */
export const plural = (n: number, singular: string, pluralForm = singular + "s") => `${fmt(n)} ${n === 1 ? singular : pluralForm}`;

/** "a" or "an" for the word that follows. */
export const an = (word: string) => (/^(a|e|i|o|u|8|11|18)/i.test(word) && !/^(uni|use|one|eu)/i.test(word) ? "an" : "a");

/**
 * A linear expression in a variable: (3, -2) -> "3x − 2", (1, 0) -> "x",
 * (-1, 4) -> "−x + 4". Coefficients may be fractions.
 */
export function linear(a: number | Frac, b: number | Frac, v = "x") {
  const A = typeof a === "number" ? frac(a) : a, B = typeof b === "number" ? frac(b) : b;
  let head = "";
  if (A.n !== 0) {
    const mag = frac(Math.abs(A.n), A.d);
    const coef = mag.n === 1 && mag.d === 1 ? "" : mag.d === 1 ? String(mag.n) : `${mag.n}/${mag.d}`;
    head = `${A.n < 0 ? "−" : ""}${coef}${v}`;
  }
  if (B.n === 0) return head || "0";
  const bText = fracStr(frac(Math.abs(B.n), B.d));
  if (!head) return fracStr(B);
  return `${head} ${B.n < 0 ? "−" : "+"} ${bText}`;
}

/**
 * A polynomial from its coefficients, highest power first:
 * [3, -2, 0] -> "3x² − 2x", [1, 0, -4] -> "x² − 4", [0, 0, 0] -> "0".
 */
export function poly(coeffs: number[], v = "x") {
  const top = coeffs.length - 1;
  const parts: string[] = [];
  coeffs.forEach((c, i) => {
    if (c === 0) return;
    const p = top - i, mag = Math.abs(c);
    const body = (mag === 1 && p > 0 ? "" : fmt(mag)) + (p === 0 ? "" : p === 1 ? v : `${v}${sup(p)}`);
    parts.push(parts.length === 0 ? (c < 0 ? "−" : "") + body : (c < 0 ? " − " : " + ") + body);
  });
  return parts.join("") || "0";
}

/** The same expression as students would type it, without spaces or true minus. */
export const typed = (expr: string) => expr.replace(/−/g, "-").replace(/\s+/g, "");

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]));
}

/** Top-level terms of a canonical expression: "3x² − 2x + 5" -> ["3x²", "-2x", "+5"]. */
export function terms(expr: string): string[] {
  const out: string[] = [];
  let depth = 0, current = "";
  const text = expr.replace(/−/g, "-").replace(/\s+/g, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(") depth++;
    if (c === ")") depth--;
    if ((c === "+" || c === "-") && depth === 0 && i > 0 && current) { out.push(current); current = ""; }
    current += c;
  }
  if (current) out.push(current);
  return out.map((t) => (t.startsWith("-") || t.startsWith("+") ? t : "+" + t));
}

/**
 * Every order of an expression's terms, in both power notations, as students
 * might type them: "3x² − 2x" -> ["3x²-2x", "-2x+3x²", "3x^2-2x", "-2x+3x^2"].
 * Answer marking compares text, so each acceptable form must be listed.
 */
export function exprForms(expr: string): string[] {
  const parts = terms(expr);
  const orders = parts.length <= 4 ? permutations(parts) : [parts];
  const joined = orders.map((o) => o.join("").replace(/^\+/, ""));
  const carets = joined.map((f) => f.replace(/²/g, "^2").replace(/³/g, "^3"));
  return [...new Set([...joined, ...carets])];
}

/** A factorised form with its bracket's terms in either order: "3x(2x + 3)" and "3x(3 + 2x)". */
export function factorForms(outside: string, inside: string): string[] {
  const inner = exprForms(inside);
  const o = typed(outside);
  return [...new Set(inner.flatMap((i) => [`${o}(${i})`, `(${i})${o}`, `${o}×(${i})`]))];
}
