// Stage 9, unit 8: Fractions (9Nf.01, 9Nf.02, 9Nf.03, 9Nf.04).
import { T, type Template } from "../engine";
import { r, pick, shuffle, gcd, frac, add, sub, mul, div, value, fracStr, mixedStr, fromMixed, terminates, fmt, ans, big, type Frac } from "../kit";

const U = "s9-u8";
const SIMPLEST = "Enter your answer in its simplest form. A mixed number (like 2 1/3) or an improper fraction is fine.";
const FRACTION = "Enter a fraction in its simplest form, for example 3/4.";

/** A proper fraction with denominator d, already in its simplest form. */
function proper(d: number) { let n = r(1, d - 1); while (gcd(n, d) !== 1) n = r(1, d - 1); return frac(n, d); }
const D = () => pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15]);
/** Mixed number whole + n/d. */
function mixed(lo: number, hi: number) { const d = pick([2, 3, 4, 5, 6, 8, 10]), p = proper(d), w = r(lo, hi); return { f: fromMixed(w, p.n, p.d), text: `${w} ${p.n}/${p.d}` }; }
/** Simplest-form answers: the mixed number and the improper fraction. */
const both = (f: Frac) => [...new Set([mixedStr(f), fracStr(f)].map((s) => s.replace("−", "-")))];
const show = (f: Frac) => mixedStr(f);

export const s9u8: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Nf.01"], "Decide whether a fraction's decimal terminates", () => {
    const d = pick([3, 6, 7, 8, 9, 11, 12, 15, 16, 20, 24, 25, 30, 32, 40, 45, 50, 80]), f = proper(d), t = terminates(f);
    const factors = (n: number) => { const out: number[] = []; for (let p = 2; n > 1; p++) while (n % p === 0) { out.push(p); n /= p; } return out; };
    return { prompt: `Does ${fracStr(f)} give a terminating or a recurring decimal?`, answers: [t ? "terminating" : "recurring"], hint: "In its simplest form, a fraction terminates only if its denominator has no prime factors other than 2 and 5.", solution: `${fracStr(f)} is in its simplest form and ${d} = ${factors(d).join(" × ")}. ${t ? "Only 2s and 5s, so it is terminating." : "There is a prime factor other than 2 or 5, so it is recurring."}`, answerFormat: "Enter terminating or recurring." };
  }),
  T(`${U}-f2`, "foundational", ["9Nf.02"], "Add fractions with different denominators", () => {
    const [a, b] = [proper(D()), proper(D())], s = add(a, b);
    if (a.d === b.d) return s9u8[1].make();
    return { prompt: `Work out ${fracStr(a)} + ${fracStr(b)}.`, answers: both(s), hint: "Write both fractions with a common denominator.", solution: `Common denominator ${a.d * b.d / gcd(a.d, b.d)}: ${fracStr(a)} + ${fracStr(b)} = ${fracStr(s)}${s.n > s.d ? ` = ${show(s)}` : ""}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-f3`, "foundational", ["9Nf.02"], "Subtract mixed numbers", () => {
    const a = mixed(3, 7), b = mixed(1, 2), s = sub(a.f, b.f);
    if (value(s) <= 0) return s9u8[2].make();
    return { prompt: `Work out ${a.text} − ${b.text}.`, answers: both(s), hint: "Change both to improper fractions (or subtract the whole numbers and fractions separately, borrowing if needed).", solution: `${a.text} = ${fracStr(a.f)} and ${b.text} = ${fracStr(b.f)}. ${fracStr(a.f)} − ${fracStr(b.f)} = ${fracStr(s)} = ${show(s)}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-f4`, "foundational", ["9Nf.03"], "Multiply fractions, cancelling first", () => {
    const [p, q, k] = [r(2, 9), r(2, 9), r(2, 5)], a = frac(r(1, 5), k * q), b = frac(k * r(1, 4), p), m = mul(a, b);
    return { prompt: `Work out ${fracStr(a)} × ${fracStr(b)}. Give your answer in its simplest form.`, answers: both(m), hint: "Cancel common factors between any numerator and any denominator before multiplying.", solution: `${fracStr(a)} × ${fracStr(b)} = ${a.n * b.n}/${a.d * b.d} = ${fracStr(m)}${m.n > m.d && m.d !== 1 ? ` = ${show(m)}` : ""}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-f5`, "foundational", ["9Nf.03"], "Divide fractions", () => {
    const [a, b] = [proper(D()), proper(D())], q = div(a, b);
    return { prompt: `Work out ${fracStr(a)} ÷ ${fracStr(b)}.`, answers: both(q), hint: "Multiply by the reciprocal of the second fraction.", solution: `${fracStr(a)} × ${b.d}/${b.n} = ${fracStr(q)}${q.n > q.d && q.d !== 1 ? ` = ${show(q)}` : ""}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-f6`, "foundational", ["9Nf.02"], "Add improper fractions", () => {
    const d1 = pick([2, 3, 4, 5, 6]), d2 = pick([3, 4, 5, 8, 10]), a = frac(d1 + r(1, 2 * d1), d1), b = frac(d2 + r(1, 2 * d2), d2), s = add(a, b);
    if (a.d === 1 || b.d === 1) return s9u8[5].make();
    return { prompt: `Work out ${fracStr(a)} + ${fracStr(b)}. Give your answer as a mixed number.`, answers: both(s), hint: "Use a common denominator, add, then convert to a mixed number.", solution: `${fracStr(a)} + ${fracStr(b)} = ${fracStr(s)} = ${show(s)}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-f7`, "foundational", ["9Nf.04"], "Use the distributive law to simplify", () => {
    const f = proper(pick([2, 3, 4, 5, 8])), total = f.d * r(2, 8), x = r(1, total - 1);
    return { prompt: `Work out ${fracStr(f)} × ${x} + ${fracStr(f)} × ${total - x} in the simplest way.`, answers: [String((f.n * total) / f.d)], hint: "Both products share the factor " + fracStr(f) + ": take it out as a common factor.", solution: `${fracStr(f)} × (${x} + ${total - x}) = ${fracStr(f)} × ${total} = ${(f.n * total) / f.d}.` };
  }),
  T(`${U}-f8`, "foundational", ["9Nf.01"], "Convert a fraction to a terminating decimal", () => {
    const f = proper(pick([4, 5, 8, 16, 20, 25, 40]));
    return { prompt: `Write ${fracStr(f)} as a decimal.`, answers: [ans(value(f))], hint: "Divide the numerator by the denominator, or make the denominator a power of 10.", solution: `${f.n} ÷ ${f.d} = ${fmt(value(f))}.` };
  }),
  T(`${U}-f9`, "foundational", ["9Nf.03"], "Multiply mixed numbers", () => {
    const a = mixed(1, 3), b = mixed(1, 2), m = mul(a.f, b.f);
    return { prompt: `Work out ${a.text} × ${b.text}.`, answers: both(m), hint: "Change each mixed number to an improper fraction first.", solution: `${fracStr(a.f)} × ${fracStr(b.f)} = ${fracStr(m)} = ${show(m)}.`, answerFormat: SIMPLEST };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Nf.01"], "Pick out the recurring decimal", () => {
    const recur = proper(pick([3, 6, 7, 9, 11, 12, 15])), others = shuffle([4, 5, 8, 16, 20, 25]).slice(0, 2).map((d) => proper(d));
    const options = shuffle([recur, ...others]), letter = "ABC"[options.indexOf(recur)];
    return { prompt: `Which of these fractions gives a recurring decimal? ${options.map((f, i) => `${"ABC"[i]}: ${fracStr(f)}`).join(", ")}.`, answers: [letter], hint: "Look at the prime factors of each denominator (in simplest form).", solution: `${letter}: ${fracStr(recur)} has a denominator with a prime factor other than 2 or 5, so it recurs.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a2`, "application", ["9Nf.03"], "Divide mixed numbers", () => {
    const a = mixed(2, 6), b = mixed(1, 2), q = div(a.f, b.f);
    return { prompt: `Work out ${a.text} ÷ ${b.text}.`, answers: both(q), hint: "Change to improper fractions, then multiply by the reciprocal.", solution: `${fracStr(a.f)} ÷ ${fracStr(b.f)} = ${fracStr(a.f)} × ${b.f.d}/${b.f.n} = ${fracStr(q)}${q.d !== 1 && q.n > q.d ? ` = ${show(q)}` : ""}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-a3`, "application", ["9Nf.02"], "Find what fraction is left", () => {
    const [a, b] = [proper(pick([3, 4, 5, 6])), proper(pick([4, 5, 8, 10]))], left = sub(frac(1), add(a, b));
    if (value(left) <= 0 || a.d === b.d) return s9u8.find((t) => t.id === `${U}-a3`)!.make();
    const [p1, p2, thing] = pick([["Ana", "Ben", "a pizza"], ["Sipho", "Lee", "a cake"], ["Maya", "Tom", "a bag of rice"]]);
    return { prompt: `${p1} uses ${fracStr(a)} of ${thing} and ${p2} uses ${fracStr(b)} of it. What fraction of ${thing} is left?`, answers: [fracStr(left)], hint: "Add the two fractions, then subtract from 1.", solution: `${fracStr(a)} + ${fracStr(b)} = ${fracStr(add(a, b))}, so 1 − ${fracStr(add(a, b))} = ${fracStr(left)} is left.`, answerFormat: FRACTION };
  }),
  T(`${U}-a4`, "application", ["9Nf.04"], "Use the laws of arithmetic with decimals", () => {
    const kind = pick(["commute", "factor"] as const);
    if (kind === "commute") {
      const [p, q] = pick([[2.5, 4], [0.25, 4], [1.25, 8], [0.5, 2], [0.2, 5]] as const), x = r(11, 99) / 10;
      return { prompt: `Work out ${fmt(p)} × ${fmt(x)} × ${q} in the simplest way.`, answers: [ans(p * q * x)], hint: `Multiply ${fmt(p)} × ${q} first: the order of multiplication does not matter.`, solution: `${fmt(p)} × ${q} = ${fmt(p * q)}, so the answer is ${fmt(p * q)} × ${fmt(x)} = ${fmt(p * q * x)}.` };
    }
    const x = r(11, 99) / 10, a = r(3, 30), b = pick([10 - (a % 10), 20 - (a % 10)]) ;
    return { prompt: `Work out ${fmt(x)} × ${a} + ${fmt(x)} × ${b} in the simplest way.`, answers: [ans(x * (a + b))], hint: `Take out the common factor ${fmt(x)}.`, solution: `${fmt(x)} × (${a} + ${b}) = ${fmt(x)} × ${a + b} = ${fmt(x * (a + b))}.` };
  }),
  T(`${U}-a5`, "application", ["9Nf.03"], "Find a fraction of a fraction of an amount", () => {
    const [a, b] = [proper(pick([2, 3, 4, 5, 6])), proper(pick([3, 4, 5, 8, 10]))], amount = a.d * b.d * r(2, 12), v = (amount * a.n * b.n) / (a.d * b.d);
    return { prompt: `Find ${fracStr(a)} of ${fracStr(b)} of ${big(amount)}.`, answers: [ans(v)], hint: "Multiply the fractions first, cancelling where you can, then multiply by the amount.", solution: `${fracStr(a)} × ${fracStr(b)} = ${fracStr(mul(a, b))}, and ${fracStr(mul(a, b))} of ${big(amount)} = ${big(v)}.` };
  }),
  T(`${U}-a6`, "application", ["9Nf.02"], "Add and subtract mixed numbers", () => {
    const [a, b, c] = [mixed(2, 5), mixed(1, 3), mixed(1, 2)], s = sub(add(a.f, b.f), c.f);
    return { prompt: `Work out ${a.text} + ${b.text} − ${c.text}.`, answers: both(s), hint: "Work with improper fractions and a common denominator.", solution: `${fracStr(a.f)} + ${fracStr(b.f)} − ${fracStr(c.f)} = ${fracStr(s)} = ${show(s)}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-a7`, "application", ["9Nf.01"], "Cancel before deciding whether a decimal terminates", () => {
    const base = pick([2, 4, 5, 8, 10, 16, 20]), k = pick([3, 7, 9]), n = r(1, base - 1) * k;
    const f = frac(n, base * k), t = terminates(f);
    return { prompt: `Does ${n}/${base * k} give a terminating or a recurring decimal?`, answers: [t ? "terminating" : "recurring"], hint: "Simplify the fraction first, then look at the denominator.", solution: `${n}/${base * k} = ${fracStr(f)}. ${t ? `Its denominator ${f.d} has only 2s and 5s as prime factors, so it is terminating.` : `Its denominator ${f.d} has another prime factor, so it is recurring.`}`, answerFormat: "Enter terminating or recurring." };
  }),
  T(`${U}-a8`, "application", ["9Nf.03"], "Find the reciprocal of a mixed number", () => {
    const m = mixed(1, 4), rec = frac(m.f.d, m.f.n);
    return { prompt: `What is the reciprocal of ${m.text}?`, answers: [fracStr(rec)], hint: "Write it as an improper fraction, then turn it upside down.", solution: `${m.text} = ${fracStr(m.f)}, so its reciprocal is ${fracStr(rec)}.`, answerFormat: FRACTION };
  }),
  T(`${U}-a9`, "application", ["9Nf.04"], "Use the order of operations with fractions", () => {
    const [a, b] = [proper(pick([2, 3, 4])), proper(pick([3, 5, 6]))], s = add(a, b), c = frac(s.d * r(1, 3), s.n), v = mul(s, c);
    return { prompt: `Work out (${fracStr(a)} + ${fracStr(b)}) × ${fracStr(c)}.`, answers: both(v), hint: "Brackets first, then multiply.", solution: `${fracStr(a)} + ${fracStr(b)} = ${fracStr(s)}, and ${fracStr(s)} × ${fracStr(c)} = ${fracStr(v)}.`, answerFormat: SIMPLEST };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Nf.01"], "Explain a terminating decimal hidden by a common factor", () => {
    const k = pick([3, 7, 9, 11]), d = pick([4, 5, 8, 20, 25]), n = r(1, d - 1) * k, whole = d * k;
    const f = frac(n, whole);
    return { prompt: `${whole} has a prime factor of ${k === 9 ? 3 : k}. Does ${n}/${whole} still give a terminating decimal? Answer yes or no.`, answers: [terminates(f) ? "yes" : "no"], hint: "What matters is the denominator in the fraction's simplest form.", solution: `${n}/${whole} simplifies to ${fracStr(f)}, whose denominator ${f.d} ${terminates(f) ? "has only 2s and 5s, so yes, it terminates" : "still has another prime factor, so no"}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r2`, "reasoning", ["9Nf.03"], "Find a missing fraction in a product", () => {
    const [a, x] = [proper(pick([2, 3, 4, 5])), proper(pick([3, 4, 5, 7]))], p = mul(a, x);
    return { prompt: `${fracStr(a)} × □ = ${fracStr(p)}. What fraction goes in the box?`, answers: [fracStr(x)], hint: "Divide the answer by the fraction you know.", solution: `□ = ${fracStr(p)} ÷ ${fracStr(a)} = ${fracStr(p)} × ${a.d}/${a.n} = ${fracStr(x)}.`, answerFormat: FRACTION };
  }),
  T(`${U}-r3`, "reasoning", ["9Nf.02"], "Find a missing mixed number in a sum", () => {
    const [x, b] = [mixed(1, 4), mixed(1, 3)], s = add(x.f, b.f);
    return { prompt: `□ + ${b.text} = ${show(s)}. What number goes in the box?`, answers: both(x.f), hint: "Subtract the number you know from the total.", solution: `□ = ${show(s)} − ${b.text} = ${fracStr(s)} − ${fracStr(b.f)} = ${fracStr(x.f)} = ${show(x.f)}.`, answerFormat: SIMPLEST };
  }),
  T(`${U}-r4`, "reasoning", ["9Nf.04"], "Use a known result to simplify a calculation", () => {
    const f = proper(pick([4, 5, 8])), N = f.d * r(3, 12) * 10, parts = r(1, 9) / 10, a = N * parts, b = N - a, v = (N * f.n) / f.d;
    return { prompt: `${fracStr(f)} of ${N} is ${fmt(v)}. Use this to work out ${fracStr(f)} × ${fmt(a)} + ${fracStr(f)} × ${fmt(b)}.`, answers: [ans(v)], hint: "Look at what the two numbers add up to.", solution: `${fmt(a)} + ${fmt(b)} = ${N}, so the expression is ${fracStr(f)} × ${N} = ${fmt(v)}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Nf.03"], "Find an area with mixed-number sides", () => {
    const [a, b] = [mixed(1, 4), mixed(1, 3)], A = mul(a.f, b.f);
    return { prompt: `A rectangle is ${a.text} m long and ${b.text} m wide. Find its area in m².`, answers: both(A), hint: "Area = length × width. Use improper fractions.", solution: `${fracStr(a.f)} × ${fracStr(b.f)} = ${fracStr(A)} = ${show(A)} m².`, answerFormat: SIMPLEST };
  }),
  T(`${U}-r6`, "reasoning", ["9Nf.02", "9Nf.03"], "Count how many pieces fit", () => {
    const piece = proper(pick([3, 4, 5, 8])), n = r(3, 20), total = mul(piece, frac(n));
    return { prompt: `How many pieces of ribbon ${fracStr(piece)} m long can be cut from ${show(total)} m of ribbon?`, answers: [String(n)], hint: "Divide the total length by the length of one piece.", solution: `${show(total)} ÷ ${fracStr(piece)} = ${fracStr(total)} × ${piece.d}/${piece.n} = ${n}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9Nf.01"], "Compare a recurring decimal with a terminating one", () => {
    // The decimal is just below or just above the fraction, so either can be larger.
    const d = pick([3, 6, 9, 11]), f = proper(d), exact = value(f), t = (pick([Math.floor, Math.ceil]))(exact * 100) / 100;
    const bigger = exact > t ? fracStr(f) : fmt(t);
    return { prompt: `Which is larger, ${fracStr(f)} or ${fmt(t)}?`, answers: [bigger], hint: `Write ${fracStr(f)} as a decimal and compare digit by digit.`, solution: `${fracStr(f)} = ${exact.toFixed(5)}…, which is larger than ${fmt(t)}, so ${bigger} is larger.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Nf.04"], "Test a law of arithmetic with fractions", () => {
    const [a, b, c] = [proper(pick([2, 3, 4, 5])), proper(pick([3, 4, 5, 6])), proper(pick([2, 3, 5, 7]))];
    const [claim, ok, why] = pick([
      [`${fracStr(a)} × (${fracStr(b)} + ${fracStr(c)}) = ${fracStr(a)} × ${fracStr(b)} + ${fracStr(a)} × ${fracStr(c)}`, true, "multiplication distributes over addition, so both sides equal " + fracStr(mul(a, add(b, c)))],
      [`${fracStr(a)} ÷ ${fracStr(b)} = ${fracStr(b)} ÷ ${fracStr(a)}`, eq(div(a, b), div(b, a)), `the left side is ${fracStr(div(a, b))} and the right side is ${fracStr(div(b, a))}`],
      [`${fracStr(a)} × ${fracStr(b)} = ${fracStr(b)} × ${fracStr(a)}`, true, "multiplication is commutative: both are " + fracStr(mul(a, b))],
      [`${fracStr(a)} − ${fracStr(b)} = ${fracStr(b)} − ${fracStr(a)}`, eq(sub(a, b), sub(b, a)), `the left side is ${fracStr(sub(a, b))} and the right side is ${fracStr(sub(b, a))}`],
    ] as Array<[string, boolean, string]>);
    return { prompt: `Is this true? ${claim}. Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Work out both sides, or recall which operations are commutative and distributive.", solution: `${ok ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
];

function eq(a: Frac, b: Frac) { return a.n === b.n && a.d === b.d; }
