// Stage 8, unit 7: Fractions (8Nf.01, 8Nf.02, 8Nf.03, with 8Nf.04 and 8Nf.06 for fractions).
import { T, type Template } from "../engine";
import { r, pick, shuffle, gcd, frac, add, sub, mul, div, value, fracStr, mixedStr, fromMixed, fmt, ans, type Frac } from "../kit";

const U = "s8-u7";
const MIXED_FORMAT = "Enter a mixed number in its simplest form, for example 2 1/3.";
const FRACTION_FORMAT = "Enter a fraction in its simplest form, for example 3/4.";
const LETTERS = ["A", "B", "C", "D"];

/** A proper fraction n/d already in its simplest form. */
function proper(d: number) { let n = r(1, d - 1); while (gcd(n, d) !== 1) n = r(1, d - 1); return n; }

/** A mixed number whole + n/d with a proper, simplified fractional part. */
function mixedNumber(minWhole: number, maxWhole: number, d = pick([2, 3, 4, 5, 6, 8, 10, 12])) {
  const n = proper(d), whole = r(minWhole, maxWhole);
  return { whole, n, d, f: fromMixed(whole, n, d), text: `${whole} ${n}/${d}` };
}

/** A result as a student should give it: a mixed number in simplest form (or a whole number). */
const mixedAnswers = (f: Frac) => [mixedStr(f).replace("−", "-")];

/** Recurring decimals from ninths, thirds and sixths, with their fractions. */
function recurring() {
  const [num, den, decimal] = pick([
    ...[1, 2, 4, 5, 7, 8].map((n) => [n, 9, `0.${String(n).repeat(3)}...`] as const),
    [1, 3, "0.333..."], [2, 3, "0.666..."], [1, 6, "0.1666..."], [5, 6, "0.8333..."],
  ] as const);
  return { f: frac(num, den), decimal: String(decimal), den };
}

export const s8u7: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Nf.02"], "Subtract mixed numbers", () => {
    const big = mixedNumber(3, 7, pick([4, 6, 8, 10, 12])), small = mixedNumber(1, 2, pick([2, 3, 4, 5, 6]));
    const result = sub(big.f, small.f);
    return { prompt: `Calculate ${big.text} − ${small.text}. Give your answer as a mixed number in its simplest form.`, answers: mixedAnswers(result), hint: "Write both as improper fractions with a common denominator, or subtract the whole numbers and fractions separately.", solution: `${big.text} − ${small.text} = ${fracStr(big.f)} − ${fracStr(small.f)} = ${fracStr(result)} = ${mixedStr(result)}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-f2`, "foundational", ["8Nf.03"], "Multiply a whole number by a mixed number", () => {
    const m = mixedNumber(1, 4), k = r(2, 9), result = mul(frac(k), m.f);
    return { prompt: `Calculate ${k} × ${m.text}. Give your answer as a mixed number in its simplest form.`, answers: mixedAnswers(result), hint: "Write the mixed number as an improper fraction, then multiply the numerator.", solution: `${k} × ${fracStr(m.f)} = ${fracStr(result)} = ${mixedStr(result)}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-f3`, "foundational", ["8Nf.03"], "Divide a whole number by a proper fraction", () => {
    const d = pick([2, 3, 4, 5, 6, 8]), n = proper(d), k = n * r(2, 6);
    const result = div(frac(k), frac(n, d));
    return { prompt: `Calculate ${k} ÷ ${n}/${d}.`, answers: [fracStr(result)], hint: "Dividing by a fraction is the same as multiplying by its reciprocal.", solution: `${k} ÷ ${n}/${d} = ${k} × ${d}/${n} = ${fracStr(result)}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Nf.01"], "Write a recurring decimal as a fraction", () => {
    const c = recurring();
    return { prompt: `The recurring decimal ${c.decimal} is equal to a fraction with denominator ${c.den}. Write the fraction in its simplest form.`, answers: [fracStr(c.f)], hint: `Think about which fractions over ${c.den} you already know as decimals.`, solution: `${c.decimal} = ${fracStr(c.f)}.`, answerFormat: FRACTION_FORMAT };
  }),
  T(`${U}-f5`, "foundational", ["8Nf.02"], "Estimate a mixed-number subtraction", () => {
    const d = pick([8, 10, 12]), a = r(4, 9), b = r(1, 3);
    // Fractional parts well away from one half, so the rounding is never in doubt.
    const an = pick([r(Math.ceil(d * 0.7), d - 1), r(1, Math.floor(d * 0.3))]), bn = pick([r(1, Math.floor(d * 0.3)), r(Math.ceil(d * 0.7), d - 1)]);
    const ra = an / d >= 0.5 ? a + 1 : a, rb = bn / d >= 0.5 ? b + 1 : b;
    return { prompt: `Estimate ${a} ${an}/${d} − ${b} ${bn}/${d} by rounding each number to the nearest whole number.`, answers: [String(ra - rb)], hint: "A fractional part of one half or more rounds up.", solution: `${a} ${an}/${d} ≈ ${ra} and ${b} ${bn}/${d} ≈ ${rb}, so the estimate is ${ra - rb}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Nf.06"], "Compare negative fractions", () => {
    const draw = () => { const d = r(3, 9); return frac(-proper(d), d); };
    let a = draw(), b = draw();
    while (value(a) === value(b)) b = draw();
    const greater = value(a) > value(b) ? a : b;
    return { prompt: `Which is greater: ${fracStr(a)} or ${fracStr(b)}?`, answers: [fracStr(greater).replace("−", "-")], hint: "For negative numbers, the one closer to zero is greater.", solution: `${fracStr(a)} ≈ ${fmt(value(a), 3)} and ${fracStr(b)} ≈ ${fmt(value(b), 3)}, so ${fracStr(greater)} is greater.`, answerFormat: FRACTION_FORMAT };
  }),
  T(`${U}-f7`, "foundational", ["review"], "Simplify a fraction", () => {
    const d = r(3, 12), n = proper(d), k = r(2, 9);
    return { prompt: `Simplify ${n * k}/${d * k}.`, answers: [`${n}/${d}`], hint: "Divide the numerator and denominator by their highest common factor.", solution: `Dividing both by ${k} gives ${n}/${d}.`, answerFormat: FRACTION_FORMAT };
  }),
  T(`${U}-f8`, "foundational", ["8Nf.04"], "Use the order of operations with fractions", () => {
    const d = pick([2, 3, 4, 5, 6]), a = frac(proper(d), d), b = frac(1, pick([2, 3, 4])), k = r(2, 6);
    const result = add(a, mul(b, frac(k)));
    return { prompt: `Calculate ${fracStr(a)} + ${fracStr(b)} × ${k}. Give your answer in its simplest form.`, answers: [mixedStr(result).replace("−", "-"), fracStr(result)], hint: "Multiply before you add.", solution: `${fracStr(b)} × ${k} = ${fracStr(mul(b, frac(k)))}, then ${fracStr(a)} + ${fracStr(mul(b, frac(k)))} = ${mixedStr(result)}.`, answerFormat: "Enter a whole number, fraction or mixed number, for example 2 1/3." };
  }),
  T(`${U}-f9`, "foundational", ["8Nf.03"], "Count how many unit fractions fit into a whole number", () => {
    const k = r(2, 12), d = pick([2, 3, 4, 5, 8] as const);
    const name = { 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 8: "eighths" }[d];
    return { prompt: `How many ${name} are there in ${k}?`, answers: [String(k * d)], hint: `This is ${k} ÷ 1/${d}; there are ${d} ${name} in each whole.`, solution: `${k} ÷ 1/${d} = ${k} × ${d} = ${k * d}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Nf.02"], "Subtract mixed numbers in context", () => {
    const a = mixedNumber(4, 8, pick([4, 6, 8])), b = mixedNumber(1, 3, pick([2, 3, 4]));
    const [start, used, unit] = pick([["A ribbon is", "is cut off", "m long"], ["A pipe is", "is cut off", "m long"], ["A bag holds", "of flour is used", "kg of flour"], ["A jug holds", "of juice is poured out", "litres of juice"]]);
    const shortUnit = unit.split(" ")[0];
    const result = sub(a.f, b.f);
    return { prompt: `${start} ${a.text} ${unit}. ${b.text} ${shortUnit} ${used}. How much is left? Give your answer as a mixed number in its simplest form.`, answers: mixedAnswers(result), hint: "Use a common denominator for the fractional parts.", solution: `${a.text} − ${b.text} = ${mixedStr(result)} ${shortUnit}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-a2`, "application", ["8Nf.03"], "Multiply a mixed number by a whole number in context", () => {
    const m = mixedNumber(1, 3, pick([2, 3, 4])), k = r(3, 9), result = mul(frac(k), m.f);
    const [what, unit] = pick([["bag of sand weighs", "kg"], ["bottle holds", "litres"], ["plank is", "m long"]]);
    return { prompt: `Each ${what} ${m.text} ${unit}. Find the total for ${k} of them. Give your answer as a mixed number in its simplest form, or a whole number.`, answers: mixedAnswers(result), hint: "Multiply the whole-number part and the fraction part separately, then add.", solution: `${k} × ${m.whole} = ${k * m.whole} and ${k} × ${m.n}/${m.d} = ${fracStr(mul(frac(k), frac(m.n, m.d)))}; the total is ${mixedStr(result)}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-a3`, "application", ["8Nf.03"], "Divide a whole number by a fraction in context", () => {
    // The number of bottles is a multiple of the denominator, so the litres are whole.
    const d = pick([3, 4, 5, 8]), n = proper(d), bottles = d * r(2, 8), litres = (bottles * n) / d;
    return { prompt: `How many ${n}/${d}-litre bottles can be filled from ${litres} litres?`, answers: [String(bottles)], hint: "Divide the total by the size of one bottle: multiply by the reciprocal.", solution: `${litres} ÷ ${n}/${d} = ${litres} × ${d}/${n} = ${bottles}.` };
  }),
  T(`${U}-a4`, "application", ["8Nf.01"], "Recognise a recurring decimal from a calculator", () => {
    const c = recurring(), repeat = c.decimal.charAt(c.decimal.length - 4);
    const shown = c.decimal.replace("...", "").padEnd(9, repeat);
    return { prompt: `A calculator shows ${shown}, and the digits carry on in the same way. The fraction has denominator ${c.den}. Which fraction is it, in its simplest form?`, answers: [fracStr(c.f)], hint: "The calculator has cut off a recurring decimal.", solution: `${c.decimal} recurring is ${fracStr(c.f)}.`, answerFormat: FRACTION_FORMAT };
  }),
  T(`${U}-a5`, "application", ["8Nf.04"], "Use the distributive law with fractions", () => {
    const d = pick([3, 4, 5, 8]), f = frac(proper(d), d), a = d * r(1, 5), b = d * r(1, 5);
    return { prompt: `Calculate ${fracStr(f)} × ${a} + ${fracStr(f)} × ${b} by first adding ${a} and ${b}.`, answers: [ans(value(mul(f, frac(a + b))))], hint: "Both products share the fraction, so multiply it by the sum.", solution: `${fracStr(f)} × (${a} + ${b}) = ${fracStr(f)} × ${a + b} = ${fracStr(mul(f, frac(a + b)))}.` };
  }),
  T(`${U}-a6`, "application", ["8Nf.06"], "Order fractions and decimals", () => {
    const values: Array<{ text: string; v: number }> = [];
    while (values.length < 4) {
      const v = Math.random() < 0.5 ? (() => { const d = r(3, 9), f = frac(pick([-1, 1]) * proper(d), d); return { text: fracStr(f), v: value(f) }; })() : (() => { const x = pick([-1, 1]) * r(5, 95) / 100; return { text: fmt(x), v: x }; })();
      if (!values.some((w) => Math.abs(w.v - v.v) < 0.01)) values.push(v);
    }
    const labelled = shuffle(values).map((x, i) => ({ ...x, label: LETTERS[i] }));
    const sorted = [...labelled].sort((a, b) => a.v - b.v);
    return { prompt: `Put these in ascending order, smallest first: ${labelled.map((x) => `${x.label} = ${x.text}`).join(", ")}. Enter the letters.`, answers: [sorted.map((x) => x.label).join(",")], hint: "Convert each fraction to a decimal to compare.", solution: `In order: ${sorted.map((x) => `${x.text} (${x.label})`).join(", ")}, so ${sorted.map((x) => x.label).join(",")}.`, answerFormat: "Enter the letters in order, for example C, A, D, B." };
  }),
  T(`${U}-a7`, "application", ["8Nf.02"], "Find a time remaining with mixed numbers", () => {
    const total = mixedNumber(2, 4, pick([2, 4])), done = mixedNumber(1, 1, pick([3, 6]));
    const left = sub(total.f, done.f);
    return { prompt: `A project takes ${total.text} hours. Lebo has worked on it for ${done.text} hours. How many hours are left? Give your answer in its simplest form.`, answers: mixedAnswers(left), hint: "Rewrite the fractional parts with a common denominator first.", solution: `${total.text} − ${done.text} = ${mixedStr(left)} hours.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-a8`, "application", ["8Nf.03"], "Count pieces cut from a length of rope", () => {
    const d = pick([4, 5, 8]), n = proper(d), pieces = d * r(2, 6), metres = (pieces * n) / d;
    return { prompt: `A ${metres} m rope is cut into pieces ${n}/${d} m long. How many pieces are there?`, answers: [String(pieces)], hint: "Divide by the fraction: multiply by its reciprocal.", solution: `${metres} ÷ ${n}/${d} = ${metres} × ${d}/${n} = ${pieces}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Nf.02"], "Correct a mixed-number subtraction", () => {
    const d = pick([5, 7, 8]), bn = r(2, d - 1), an = r(1, bn - 1), a = r(3, 6), b = r(1, a - 1);
    const right = sub(fromMixed(a, an, d), fromMixed(b, bn, d));
    return { prompt: `A learner calculates ${a} ${an}/${d} − ${b} ${bn}/${d} and writes ${a - b} ${bn - an}/${d}. Enter the correct answer as a mixed number.`, answers: mixedAnswers(right), hint: `${an}/${d} is smaller than ${bn}/${d}, so exchange one whole for ${d}/${d} first.`, solution: `${a} ${an}/${d} = ${a - 1} ${an + d}/${d}, and ${a - 1} ${an + d}/${d} − ${b} ${bn}/${d} = ${mixedStr(right)}. The learner took the smaller fraction from the larger.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-r2`, "reasoning", ["8Nf.03"], "Predict the size of a division by a fraction", () => {
    const k = r(5, 30), d = r(3, 9), n = proper(d);
    return { prompt: `Without calculating, is ${k} ÷ ${n}/${d} greater than or less than ${k}?`, answers: ["greater", "greater than"], hint: "How many pieces smaller than a whole fit into a number?", solution: `More than ${k} pieces of size ${n}/${d} fit into ${k}, so the answer is greater.`, answerFormat: "Enter greater or less." };
  }),
  T(`${U}-r3`, "reasoning", ["8Nf.01"], "Pick out the recurring decimal", () => {
    const terminating = shuffle([frac(3, 8), frac(7, 20), frac(9, 25), frac(1, 4), frac(3, 5), frac(7, 8), frac(11, 20), frac(2, 5)]).slice(0, 3);
    const rec = pick([frac(2, 9), frac(1, 3), frac(5, 6), frac(4, 9), frac(7, 12), frac(1, 6), frac(5, 11)]);
    const list = shuffle([...terminating, rec]);
    return { prompt: `Exactly one of ${list.map(fracStr).join(", ")} is equivalent to a recurring decimal. Which one?`, answers: [fracStr(rec)], hint: "In its simplest form, a fraction terminates only if its denominator has no prime factors other than 2 and 5.", solution: `The denominator of ${fracStr(rec)} has a prime factor other than 2 or 5, so it recurs; ${terminating.map(fracStr).join(", ")} all terminate.`, answerFormat: FRACTION_FORMAT };
  }),
  T(`${U}-r4`, "reasoning", ["8Nf.02"], "Find a missing mixed number", () => {
    const a = mixedNumber(4, 7, 3), c = mixedNumber(1, 2, 4), missing = sub(a.f, c.f);
    return { prompt: `${a.text} − □ = ${c.text}. Find □ as a mixed number in its simplest form.`, answers: mixedAnswers(missing), hint: "□ is the first number minus the answer.", solution: `□ = ${a.text} − ${c.text} = ${mixedStr(missing)}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-r5`, "reasoning", ["8Nf.03"], "Reverse a multiplication by a mixed number", () => {
    const m = mixedNumber(1, 3, 2), x = 2 * r(2, 9), product = mul(frac(x), m.f);
    return { prompt: `A number multiplied by ${m.text} gives ${fracStr(product)}. What is the number?`, answers: [String(x)], hint: "Divide by the mixed number: write it as an improper fraction first.", solution: `${fracStr(product)} ÷ ${fracStr(m.f)} = ${fracStr(product)} × ${m.f.d}/${m.f.n} = ${x}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Nf.04"], "Split a mixed number to multiply", () => {
    const m = mixedNumber(1, 4, pick([3, 5, 7])), k = r(2, 9), result = mul(frac(k), m.f);
    return { prompt: `Calculate ${k} × ${m.text} by working out ${k} × ${m.whole} + ${k} × ${m.n}/${m.d}. Give your answer as a mixed number.`, answers: mixedAnswers(result), hint: "Multiply the whole part and the fraction part separately, then add.", solution: `${k} × ${m.whole} = ${k * m.whole} and ${k} × ${m.n}/${m.d} = ${fracStr(mul(frac(k), frac(m.n, m.d)))}; together ${mixedStr(result)}.`, answerFormat: MIXED_FORMAT };
  }),
  T(`${U}-r7`, "reasoning", ["8Nf.06"], "Judge an inequality with fractions and decimals", () => {
    const d = pick([4, 5, 8, 10, 20]), f = frac(-proper(d), d), dec = value(f);
    const [text, truth, why] = pick([
      [`${fracStr(f)} ≥ ${fmt(dec)}`, "true", `${fracStr(f)} = ${fmt(dec)}, and ≥ allows equality`],
      [`${fracStr(f)} > ${fmt(dec)}`, "false", `${fracStr(f)} = ${fmt(dec)}, so neither is greater`],
      [`${fracStr(f)} ≠ ${fmt(dec)}`, "false", `${fracStr(f)} = ${fmt(dec)}`],
      [`${fracStr(f)} < ${fmt(dec + 0.01)}`, "true", `${fmt(dec)} is less than ${fmt(dec + 0.01)}`],
    ] as const);
    return { prompt: `True or false: ${text}.`, answers: [truth], hint: "Convert the fraction to a decimal first.", solution: `It is ${truth}: ${why}.`, answerFormat: "Enter true or false." };
  }),
  T(`${U}-r8`, "reasoning", ["8Nf.01"], "Extend a known recurring decimal", () => {
    const [known, knownDec, askDec, answer, times] = pick([
      ["1/6", "0.1666...", "0.8333...", "5/6", 5],
      ["1/9", "0.111...", "0.444...", "4/9", 4],
      ["1/3", "0.333...", "0.666...", "2/3", 2],
      ["1/9", "0.111...", "0.777...", "7/9", 7],
      ["1/11", "0.0909...", "0.2727...", "3/11", 3],
    ] as const);
    return { prompt: `${known} = ${knownDec}. Which fraction with the same denominator equals ${askDec}?`, answers: [answer], hint: `How many times larger than ${knownDec} is ${askDec}?`, solution: `${askDec} is ${times} times ${knownDec}, so it is ${answer}.`, answerFormat: FRACTION_FORMAT };
  }),
];
