// Stage 9, unit 1: Number and calculation (9Ni.01, 9Ni.02, 9Ni.04).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, shuffle, sup, fmt, ans, br, frac, fracStr, terminates, roundDP } from "../kit";

const U = "s9-u1";
const INDEX = "Enter a power using ^, for example x^-3 or 2^5.";
const KIND = "Enter rational or irrational.";

/** A power as shown and every way a student may type it: x⁻³, x^-3, x^(-3). */
function power(base: string | number, e: number) {
  if (e === 0) return ["1"];
  if (e === 1) return [String(base)];
  return [`${base}${sup(e)}`, `${base}^${e}`, `${base}^(${e})`];
}
/** A coefficient times a power: 12x³. */
function term(c: number, v: string, e: number) {
  const p = power(v, e);
  const k = c === 1 ? "" : fmt(c);
  return e === 0 ? [fmt(c)] : p.map((f) => `${k}${f}`);
}
/** An exact fraction answer, with its decimal when that terminates. */
function fracAnswers(n: number, d: number) {
  const f = frac(n, d), out = [fracStr(f).replace("−", "-")];
  if (terminates(f)) out.push(ans(n / d));
  return out;
}
/** A power as displayed, without a written index of 1. */
const pw = (b: string | number, e: number) => (e === 1 ? String(b) : `${b}${sup(e)}`);
const SQUARES = Array.from({ length: 15 }, (_, i) => (i + 1) ** 2);
const isSquare = (n: number) => SQUARES.includes(n);
const nonSquare = (lo: number, hi: number) => { for (;;) { const n = r(lo, hi); if (!isSquare(n)) return n; } };

export const s9u1: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ni.02"], "Evaluate a negative power", () => {
    const b = r(2, 10), k = b <= 3 ? r(1, 4) : b <= 5 ? r(1, 3) : r(1, 2), v = b ** k;
    return { prompt: `Write ${b}${sup(-k)} as a fraction.`, answers: fracAnswers(1, v), hint: "A negative index means the reciprocal: a⁻ⁿ = 1/aⁿ.", solution: `${b}${sup(-k)} = 1/${b}${k === 1 ? "" : sup(k)} = 1/${v}.`, answerFormat: "Enter a fraction, for example 1/8." };
  }),
  T(`${U}-f2`, "foundational", ["9Ni.02"], "Multiply powers with negative indices", () => {
    const v = pick(["x", "y", "a", "p"]), m = rNonZero(-6, 8), n = rNonZero(-6, -1), e = m + n;
    return { prompt: `Simplify ${pw(v, m)} × ${pw(v, n)}.`, answers: power(v, e), hint: "Multiplying powers of the same base: add the indices.", solution: `${fmt(m)} + ${br(n)} = ${fmt(e)}, so the answer is ${power(v, e)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-f3`, "foundational", ["9Ni.02"], "Divide powers with negative indices", () => {
    const v = pick(["x", "y", "m", "t"]), m = rNonZero(-5, 6), n = rNonZero(-5, 6), e = m - n;
    if (m === n) return s9u1[2].make();
    return { prompt: `Simplify ${pw(v, m)} ÷ ${pw(v, n)}.`, answers: power(v, e), hint: "Dividing powers of the same base: subtract the indices.", solution: `${fmt(m)} − ${br(n)} = ${fmt(e)}, so the answer is ${power(v, e)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-f4`, "foundational", ["9Ni.02"], "Raise a power to a power", () => {
    const v = pick(["x", "y", "a", "n"]), m = rNonZero(-4, 5), n = rNonZero(-3, 4), e = m * n;
    if (n === 1) return s9u1[3].make();
    return { prompt: `Simplify (${pw(v, m)})${sup(n)}.`, answers: power(v, e), hint: "A power of a power: multiply the indices.", solution: `${fmt(m)} × ${br(n)} = ${fmt(e)}, so the answer is ${power(v, e)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-f5`, "foundational", ["9Ni.01"], "Decide whether a number is rational", () => {
    const n = r(2, 150), c = r(2, 12), d = r(2, 9);
    const [text, rational, why] = pick([
      [`√${n}`, isSquare(n), isSquare(n) ? `${n} is a square number, so √${n} = ${Math.sqrt(n)}` : `${n} is not a square number, so its square root cannot be written as a fraction`],
      [`${c}/${d}`, true, "it is already a fraction of two integers"],
      ["π", false, "π cannot be written as a fraction; its decimal never ends or repeats"],
      [`0.${c}${c}${c}… (the digits ${c} repeat forever)`, true, "every recurring decimal can be written as a fraction"],
      [`∛${c ** 3}`, true, `∛${c ** 3} = ${c}, an integer`],
      [`√${c * c}`, true, `√${c * c} = ${c}, an integer`],
    ] as const);
    return { prompt: `Is ${text} rational or irrational?`, answers: [rational ? "rational" : "irrational"], hint: "A rational number can be written as a fraction of two integers.", solution: `${rational ? "Rational" : "Irrational"}: ${why}.`, answerFormat: KIND };
  }),
  T(`${U}-f6`, "foundational", ["9Ni.04"], "Place a square root between two integers", () => {
    const n = nonSquare(5, 200), lo = Math.floor(Math.sqrt(n));
    return { prompt: `√${n} lies between which two consecutive whole numbers?`, answers: [`${lo} and ${lo + 1}`, `${lo}, ${lo + 1}`], hint: "Find the square numbers either side.", solution: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}. ${lo * lo} < ${n} < ${(lo + 1) ** 2}, so √${n} is between ${lo} and ${lo + 1}.`, answerFormat: "Enter the two numbers separated by a comma, for example 6, 7." };
  }),
  T(`${U}-f7`, "foundational", ["9Ni.04"], "Place a cube root between two integers", () => {
    let n = r(10, 900);
    while (Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n) n++;
    const lo = Math.floor(Math.cbrt(n) + 1e-9);
    return { prompt: `∛${n} lies between which two consecutive whole numbers?`, answers: [`${lo} and ${lo + 1}`, `${lo}, ${lo + 1}`], hint: "Find the cube numbers either side.", solution: `${lo}³ = ${lo ** 3} and ${lo + 1}³ = ${(lo + 1) ** 3}. ${lo ** 3} < ${n} < ${(lo + 1) ** 3}, so ∛${n} is between ${lo} and ${lo + 1}.`, answerFormat: "Enter the two numbers separated by a comma, for example 4, 5." };
  }),
  T(`${U}-f8`, "foundational", ["9Ni.02"], "Evaluate an expression with zero and negative indices", () => {
    const b = pick([2, 4, 5, 10]), c = r(3, 9), kind = pick(["zero", "mixed"] as const);
    if (kind === "zero") return { prompt: `Evaluate ${c}⁰ + ${b}${sup(-1)}.`, answers: [ans(1 + 1 / b), fracStr(frac(b + 1, b))], hint: "Anything (except 0) to the power 0 is 1; a⁻¹ = 1/a.", solution: `${c}⁰ = 1 and ${b}${sup(-1)} = 1/${b} = ${fmt(1 / b)}, so the total is ${fmt(1 + 1 / b)}.` };
    const m = r(3, 5), n = -r(1, 2);
    return { prompt: `Evaluate ${b}${sup(n)} × ${b}${sup(m)}.`, answers: [String(b ** (m + n))], hint: "Add the indices first, then evaluate.", solution: `${b}${sup(n)} × ${b}${sup(m)} = ${b}${sup(m + n)} = ${b ** (m + n)}.` };
  }),
  T(`${U}-f9`, "foundational", ["review"], "Use the order of operations with integers", () => {
    const a = rNonZero(-6, 6), b = r(2, 5), c = rNonZero(-9, 9), v = a * a - b * c;
    return { prompt: `Work out ${br(a)}² − ${b} × ${br(c)}.`, answers: [ans(v)], hint: "Indices first, then multiplication, then subtraction.", solution: `${br(a)}² = ${a * a} and ${b} × ${br(c)} = ${fmt(b * c)}, so ${a * a} − ${br(b * c)} = ${fmt(v)}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ni.02"], "Evaluate a fraction to a negative power", () => {
    const [p, q] = pick([[2, 3], [3, 4], [2, 5], [3, 5], [1, 2], [1, 3], [4, 5]]), k = r(1, 3);
    const n = q ** k, d = p ** k;
    return { prompt: `Evaluate (${p}/${q})${sup(-k)}. Give your answer as a fraction.`, answers: [d === 1 ? String(n) : fracStr(frac(n, d)), `${n}/${d}`], hint: "A negative index flips the fraction: (a/b)⁻ⁿ = (b/a)ⁿ.", solution: `(${p}/${q})${sup(-k)} = (${q}/${p})${k === 1 ? "" : sup(k)} = ${d === 1 ? n : `${n}/${d}`}.`, answerFormat: "Enter a fraction, for example 9/4, or a whole number." };
  }),
  T(`${U}-a2`, "application", ["9Ni.02"], "Find an unknown index", () => {
    const b = pick([2, 3, 5, 10]), k = b === 2 ? r(2, 6) : b === 3 ? r(2, 4) : r(1, 3);
    if (pick([true, false])) return { prompt: `Find x if ${b}ˣ = 1/${b ** k}.`, answers: [String(-k)], hint: `Write 1/${b ** k} as a power of ${b}.`, solution: `1/${b ** k} = 1/${b}${sup(k)} = ${b}${sup(-k)}, so x = ${fmt(-k)}.` };
    const m = r(2, 6), t = rNonZero(-5, 3), x = t - m;
    return { prompt: `Find x if ${b}ˣ × ${b}${sup(m)} = ${pw(b, t)}.`, answers: [String(x)], hint: "Multiplying powers adds the indices.", solution: `x + ${m} = ${fmt(t)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-a3`, "application", ["9Ni.01"], "Pick out the irrational number", () => {
    const sq = r(2, 12) ** 2, ns = nonSquare(2, 99), d = pick([4, 5, 8, 20]);
    const options = shuffle([[`√${sq}`, false], [`√${ns}`, true], [`${r(1, d - 1)}/${d}`, false], [`0.${r(1, 9)}${r(1, 9)}`, false]] as Array<[string, boolean]>);
    const letter = "ABCD"[options.findIndex(([, irr]) => irr)];
    return { prompt: `Which of these numbers is irrational? ${options.map(([t], i) => `${"ABCD"[i]}: ${t}`).join(", ")}.`, answers: [letter], hint: "Check which cannot be written as a fraction of two integers.", solution: `${letter}: ${ns} is not a square number, so √${ns} is irrational. √${sq} = ${Math.sqrt(sq)}, and the others are fractions or terminating decimals.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a4`, "application", ["9Ni.04"], "Estimate a square root to one decimal place", () => {
    const n = nonSquare(10, 150), root = Math.sqrt(n), lo = Math.floor(root);
    return { prompt: `Without a calculator, estimate √${n} to 1 decimal place.`, answers: [ans(roundDP(root, 1))], hint: `√${n} is between ${lo} and ${lo + 1}. Try squaring decimals between them.`, solution: `${lo}² = ${lo * lo} and ${lo + 1}² = ${(lo + 1) ** 2}. Checking: ${fmt(roundDP(root, 1))}² = ${fmt(roundDP(roundDP(root, 1) ** 2, 2))}, and √${n} = ${fmt(roundDP(root, 3))}… ≈ ${fmt(roundDP(root, 1))}.` };
  }),
  T(`${U}-a5`, "application", ["9Ni.01"], "Decide whether a product of roots is rational", () => {
    for (;;) {
      const a = r(2, 12), b = r(2, 50), p = a * b;
      if (isSquare(a) || isSquare(b)) continue;
      const rational = isSquare(p);
      return { prompt: `Is √${a} × √${b} rational or irrational?`, answers: [rational ? "rational" : "irrational"], hint: "√a × √b = √(ab). Is ab a square number?", solution: `√${a} × √${b} = √${p}. ${rational ? `${p} = ${Math.sqrt(p)}², so it is ${Math.sqrt(p)}: rational.` : `${p} is not a square number, so it is irrational.`}`, answerFormat: KIND };
    }
  }),
  T(`${U}-a6`, "application", ["9Ni.02"], "Simplify terms with coefficients and indices", () => {
    const v = pick(["x", "y", "a", "b"]), divide = pick([true, false]);
    if (divide) {
      const c2 = r(2, 6), c1 = c2 * r(2, 6), m = rNonZero(-3, 8), n = rNonZero(-4, 5), e = m - n;
      if (e === 0) return s9u1.find((t) => t.id === `${U}-a6`)!.make();
      return { prompt: `Simplify ${c1}${pw(v, m)} ÷ ${c2}${pw(v, n)}.`, answers: term(c1 / c2, v, e), hint: "Divide the numbers; subtract the indices.", solution: `${c1} ÷ ${c2} = ${c1 / c2} and ${fmt(m)} − ${br(n)} = ${fmt(e)}, giving ${term(c1 / c2, v, e)[0]}.`, answerFormat: INDEX };
    }
    const c1 = r(2, 9), c2 = r(2, 9), m = rNonZero(-5, 6), n = rNonZero(-5, 6), e = m + n;
    if (e === 0) return s9u1.find((t) => t.id === `${U}-a6`)!.make();
    return { prompt: `Simplify ${c1}${pw(v, m)} × ${c2}${pw(v, n)}.`, answers: term(c1 * c2, v, e), hint: "Multiply the numbers; add the indices.", solution: `${c1} × ${c2} = ${c1 * c2} and ${fmt(m)} + ${br(n)} = ${fmt(e)}, giving ${term(c1 * c2, v, e)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-a7`, "application", ["9Ni.04"], "Estimate a sum of square roots", () => {
    const a = nonSquare(5, 99), b = nonSquare(5, 99), ra = Math.round(Math.sqrt(a)), rb = Math.round(Math.sqrt(b));
    return { prompt: `Estimate √${a} + √${b} by first rounding each square root to the nearest whole number.`, answers: [String(ra + rb)], hint: "Find the nearest square number to each.", solution: `√${a} ≈ ${ra} (as ${a} is closest to ${ra * ra}) and √${b} ≈ ${rb} (closest to ${rb * rb}), so the estimate is ${ra} + ${rb} = ${ra + rb}.` };
  }),
  T(`${U}-a8`, "application", ["9Ni.02"], "Write a fraction as a power of a prime", () => {
    const b = pick([2, 3, 5, 7]), k = b === 2 ? r(1, 6) : b === 3 ? r(1, 4) : r(1, 3);
    return { prompt: `Write 1/${b ** k} as a power of ${b}.`, answers: power(b, -k), hint: `Write ${b ** k} as a power of ${b} first.`, solution: `${b ** k} = ${b}${k === 1 ? "" : sup(k)}, so 1/${b ** k} = ${power(b, -k)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-a9`, "application", ["9Ni.01"], "Write a recurring decimal as a fraction", () => {
    const two = pick([true, false]);
    if (!two) {
      const d = r(1, 8), f = frac(d, 9);
      return { prompt: `Write 0.${d}${d}${d}… (the digit ${d} repeats forever) as a fraction in its simplest form.`, answers: [fracStr(f)], hint: "A single repeating digit d gives d/9.", solution: `0.${d}${d}${d}… = ${d}/9${f.d === 9 ? "" : ` = ${fracStr(f)}`}, so it is rational.`, answerFormat: "Enter a fraction, for example 4/9." };
    }
    let ab = r(10, 98);
    while (ab % 11 === 0) ab++;
    const f = frac(ab, 99), s = String(ab).padStart(2, "0");
    return { prompt: `Write 0.${s}${s}${s}… (the digits ${s} repeat forever) as a fraction in its simplest form.`, answers: [fracStr(f)], hint: "Two repeating digits ab give ab/99.", solution: `0.${s}${s}… = ${ab}/99${f.d === 99 ? "" : ` = ${fracStr(f)}`}, so it is rational.`, answerFormat: "Enter a fraction, for example 4/33." };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ni.02"], "Compare two negative powers", () => {
    const [a, b] = shuffle([[2, 3], [3, 2], [2, 4], [4, 2], [5, 2], [2, 5], [3, 3], [10, 1]].map(([base, k]) => [base, k] as const)).slice(0, 2);
    const va = a[0] ** a[1], vb = b[0] ** b[1];
    if (va === vb) return s9u1.find((t) => t.id === `${U}-r1`)!.make();
    const larger = va < vb ? va : vb;
    return { prompt: `Which is larger, ${a[0]}${sup(-a[1])} or ${b[0]}${sup(-b[1])}? Give its value as a fraction.`, answers: [`1/${larger}`], hint: "Write each as 1 over a whole number. The smaller denominator gives the larger fraction.", solution: `${a[0]}${sup(-a[1])} = 1/${va} and ${b[0]}${sup(-b[1])} = 1/${vb}. The larger is 1/${larger}.`, answerFormat: "Enter a fraction, for example 1/8." };
  }),
  T(`${U}-r2`, "reasoning", ["9Ni.02"], "Solve an index equation with different bases", () => {
    const [big, small, k] = pick([[4, 2, 2], [8, 2, 3], [9, 3, 2], [27, 3, 3], [25, 5, 2], [16, 2, 4]] as const);
    const t = rNonZero(-6, 9), x = frac(t, k);
    return { prompt: `Find x if ${big}ˣ = ${pw(small, t)}.`, answers: [fracStr(x).replace("−", "-"), ans(t / k)], hint: `Write ${big} as a power of ${small}.`, solution: `${big} = ${small}${sup(k)}, so ${big}ˣ = ${small}${sup(k)}ˣ. Then ${k}x = ${fmt(t)} and x = ${fracStr(x)}.`, answerFormat: "Enter x as a whole number, fraction or decimal." };
  }),
  T(`${U}-r3`, "reasoning", ["9Ni.01"], "Show that irrational numbers can combine to a rational one", () => {
    const n = nonSquare(2, 30), a = r(1, 9), b = r(1, 9), product = pick([true, false]);
    if (product) return { prompt: `√${n} is irrational. Work out (√${n})².`, answers: [String(n)], hint: "Squaring undoes a square root.", solution: `√${n} is irrational, but (√${n})² = ${n}, which is rational.` };
    return { prompt: `√${n} is irrational. Work out (${a} + √${n}) + (${b} − √${n}).`, answers: [String(a + b)], hint: "Collect the whole numbers and the roots separately.", solution: `The √${n} terms cancel: ${a} + ${b} = ${a + b}. Two irrational numbers can add up to a rational number.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Ni.04"], "Find the largest whole number below a root", () => {
    const k = r(3, 15), cube = pick([true, false]);
    return cube
      ? { prompt: `What is the largest whole number n for which ∛n < ${k}?`, answers: [String(k ** 3 - 1)], hint: `∛n < ${k} means n < ${k}³.`, solution: `${k}³ = ${k ** 3}, so n < ${k ** 3} and the largest whole number is ${k ** 3 - 1}.` }
      : { prompt: `What is the largest whole number n for which √n < ${k}?`, answers: [String(k * k - 1)], hint: `√n < ${k} means n < ${k}².`, solution: `${k}² = ${k * k}, so n < ${k * k} and the largest whole number is ${k * k - 1}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Ni.04"], "Count the whole numbers whose roots lie in a range", () => {
    const p = r(2, 14);
    return { prompt: `How many whole numbers n have √n strictly between ${p} and ${p + 1}?`, answers: [String(2 * p)], hint: `Square both ends: n must be strictly between ${p}² and ${p + 1}².`, solution: `${p}² = ${p * p} and ${p + 1}² = ${(p + 1) ** 2}. The whole numbers strictly between them are ${p * p + 1} to ${(p + 1) ** 2 - 1}: that is ${2 * p} numbers.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Ni.02"], "Correct a mistake with a negative index", () => {
    const b = r(2, 9), k = pick([2, 2, 3]), v = b ** k;
    return { prompt: `A student says ${b}${sup(-k)} = −${v}. What is the correct value? Give it as a fraction.`, answers: [`1/${v}`], hint: "A negative index does not make the number negative.", solution: `A negative index means the reciprocal: ${b}${sup(-k)} = 1/${b}${sup(k)} = 1/${v}, which is positive.`, answerFormat: "Enter a fraction, for example 1/8." };
  }),
  T(`${U}-r7`, "reasoning", ["9Ni.02"], "Combine powers of 2 written with different bases", () => {
    const a = rNonZero(-4, 6), b = rNonZero(-3, 4), c = pick([2, 3] as const), base = c === 2 ? 4 : 8, e = a + c * b;
    if (e === 0 || e === 1) return s9u1.find((t) => t.id === `${U}-r7`)!.make();
    return { prompt: `Write ${pw(2, a)} × ${pw(base, b)} as a single power of 2.`, answers: power(2, e), hint: `Write ${base} as a power of 2 first.`, solution: `${base} = 2${sup(c)}, so ${pw(base, b)} = ${pw(2, c * b)}. Then ${pw(2, a)} × ${pw(2, c * b)} = ${power(2, e)[0]}.`, answerFormat: INDEX };
  }),
  T(`${U}-r8`, "reasoning", ["9Ni.01", "9Ni.04"], "Decide whether a square's measurements are rational", () => {
    const n = r(2, 60), ask = pick(["area", "perimeter"] as const);
    const rational = ask === "area" ? true : isSquare(n);
    const why = ask === "area" ? `the area is (√${n})² = ${n}, a whole number` : isSquare(n) ? `√${n} = ${Math.sqrt(n)}, so the perimeter is ${4 * Math.sqrt(n)}` : `the perimeter is 4√${n}, and √${n} is irrational because ${n} is not a square number`;
    return { prompt: `A square has sides of length √${n} cm. Is its ${ask} rational or irrational?`, answers: [rational ? "rational" : "irrational"], hint: "Write the measurement in terms of √n, then simplify.", solution: `${rational ? "Rational" : "Irrational"}: ${why}.`, answerFormat: KIND };
  }),
];
