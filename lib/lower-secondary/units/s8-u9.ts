// Stage 8, unit 9: Sequences and functions (8As.01, 8As.02, 8As.03).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, frac, add, mul, fracStr, mixedStr, fmt, ans, linear, exprForms, tidyNum, type Frac } from "../kit";

const U = "s8-u9";
const NTH_FORMAT = "Enter the nth term using n, for example 4n + 3.";
const terms = (a: number, b: number, count = 4) => [...Array(count)].map((_, i) => a * (i + 1) + b);
const list = (xs: number[]) => xs.map(fmt).join(", ");
const nth = (a: number, b: number) => linear(a, b, "n");
/** The nth term in every order students might write it: "23 − 3n" and "−3n + 23". */
const nthAnswers = (a: number, b: number) => exprForms(nth(a, b));
/** A fraction sequence term as students may write it: 3/2 or 1 1/2. */
const fracAnswers = (f: Frac) => [...new Set([fracStr(f), mixedStr(f)].map((s) => s.replace("−", "-")))];

export const s8u9: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8As.01"], "Find the next term of a linear sequence", () => {
    const step = rNonZero(-9, 9), start = r(-10, 30), seq = [0, 1, 2, 3].map((i) => start + i * step);
    return { prompt: `Find the next term: ${list(seq)}, ...`, answers: [ans(start + 4 * step)], hint: "Find the difference between consecutive terms.", solution: `The terms change by ${fmt(step)} each time, so the next is ${fmt(seq[3])} ${step < 0 ? "−" : "+"} ${Math.abs(step)} = ${fmt(start + 4 * step)}.` };
  }),
  T(`${U}-f2`, "foundational", ["8As.01"], "Use a two-step term-to-term rule", () => {
    const m = r(2, 3), c = rNonZero(-4, 4), first = r(1, 5);
    const seq = [first]; for (let i = 0; i < 3; i++) seq.push(seq[i] * m + c);
    return { prompt: `The first term of a sequence is ${first}. The term-to-term rule is "multiply by ${m}, then ${c < 0 ? "subtract" : "add"} ${Math.abs(c)}". Find the 4th term.`, answers: [ans(seq[3])], hint: "Apply the rule to each term to get the next one.", solution: `The terms are ${list(seq)}, so the 4th term is ${fmt(seq[3])}.` };
  }),
  T(`${U}-f3`, "foundational", ["8As.01"], "Continue a sequence of fractions", () => {
    const d = pick([2, 3, 4, 5]), step = frac(r(1, d - 1), d), start = frac(r(1, 2 * d), d);
    const seq = [0, 1, 2, 3].map((i) => add(start, mul(step, frac(i))));
    const next = add(start, mul(step, frac(4)));
    return { prompt: `Find the next term: ${seq.map(fracStr).join(", ")}, ...`, answers: fracAnswers(next), hint: "Find the fraction added each time.", solution: `Each term is ${fracStr(step)} more than the one before, so the next term is ${fracStr(next)}.`, answerFormat: "Enter a fraction, mixed number or whole number, for example 7/4 or 1 3/4." };
  }),
  T(`${U}-f4`, "foundational", ["8As.02"], "Use an nth term rule", () => {
    const a = rNonZero(-6, 9), b = r(-10, 15), n = r(5, 30);
    return { prompt: `A sequence has nth term ${nth(a, b)}. Find the ${n}th term.`, answers: [ans(a * n + b)], hint: `Substitute n = ${n}.`, solution: `Substitute n = ${n}: ${fmt(a)} × ${n} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(a * n + b)}.` };
  }),
  T(`${U}-f5`, "foundational", ["8As.02"], "Find the nth term of an increasing sequence", () => {
    const a = r(2, 9), b = r(-8, 12);
    return { prompt: `Write the nth term of the sequence ${list(terms(a, b))}, ...`, answers: nthAnswers(a, b), hint: "The difference between terms is the number in front of n; then adjust with a constant.", solution: `The difference is ${a}, so start from ${a}n; ${a} × 1 = ${a} and the first term is ${fmt(a + b)}, so the nth term is ${nth(a, b)}.`, answerFormat: NTH_FORMAT };
  }),
  T(`${U}-f6`, "foundational", ["8As.02"], "Find the nth term of a decreasing sequence", () => {
    const a = -r(2, 7), b = r(20, 45);
    return { prompt: `Write the nth term of the sequence ${list(terms(a, b))}, ...`, answers: nthAnswers(a, b), hint: "The terms go down, so the number in front of n is negative.", solution: `The difference is ${fmt(a)}, so start from ${fmt(a)}n; the first term ${fmt(a + b)} is ${b} more than ${fmt(a)}, so the nth term is ${nth(a, b)}.`, answerFormat: NTH_FORMAT };
  }),
  T(`${U}-f7`, "foundational", ["8As.03"], "Find an output from a function", () => {
    const a = rNonZero(-5, 6), b = rNonZero(-10, 10), x = r(-6, 9);
    return { prompt: `A function is f(x) = ${linear(a, b)}. Find f(${fmt(x)}).`, answers: [ans(a * x + b)], hint: `Replace x with ${fmt(x)}.`, solution: `f(${fmt(x)}) = ${fmt(a)} × ${fmt(x)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(a * x + b)}.` };
  }),
  T(`${U}-f8`, "foundational", ["8As.03"], "Find an input from an output", () => {
    const m = r(2, 9), c = rNonZero(-10, 12), x = r(1, 12);
    return { prompt: `A function multiplies the input by ${m}, then ${c < 0 ? "subtracts" : "adds"} ${Math.abs(c)}. The output is ${fmt(m * x + c)}. What was the input?`, answers: [String(x)], hint: "Undo the operations in reverse order.", solution: `${fmt(m * x + c)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${m * x}, then ${m * x} ÷ ${m} = ${x}.` };
  }),
  T(`${U}-f9`, "foundational", ["8As.01"], "Continue a spatial pattern", () => {
    const first = r(3, 8), step = r(2, 6), k = r(5, 12);
    const thing = pick(["matchsticks", "tiles", "dots", "squares"]);
    return { prompt: `Pattern 1 uses ${first} ${thing}, pattern 2 uses ${first + step} and pattern 3 uses ${first + 2 * step}. How many ${thing} does pattern ${k} use?`, answers: [String(first + (k - 1) * step)], hint: `Each pattern adds ${step} ${thing}.`, solution: `Pattern ${k} has ${first} + ${k - 1} × ${step} = ${first + (k - 1) * step} ${thing}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8As.01"], "Apply a linear sequence in context", () => {
    const start = r(30, 200), step = r(5, 40), k = r(4, 10);
    const text = pick([
      `Savings start at R${start}, and R${step} is added each week. How much is saved after ${k - 1} more weeks, in rand?`,
      `A plant is ${start} mm tall and grows ${step} mm each week. How tall is it after ${k - 1} weeks, in mm?`,
      `Rent is R${start} in the first year and rises by R${step} each year. What is the rent in year ${k}, in rand?`,
    ]);
    return { prompt: text, answers: [String(start + (k - 1) * step)], hint: "Count how many times the amount is added.", solution: `${start} + ${k - 1} × ${step} = ${start + (k - 1) * step}.` };
  }),
  T(`${U}-a2`, "application", ["8As.02"], "Find an nth term with a fractional coefficient", () => {
    const d = pick([2, 3, 4]), b = r(0, 5);
    const seq = [1, 2, 3, 4].map((n) => add(frac(n, d), frac(b)));
    const exprs = [`n/${d}+${b}`, `${b}+n/${d}`, `1/${d}n+${b}`, `(1/${d})n+${b}`, ...(d === 2 ? [`0.5n+${b}`, `½n+${b}`] : []), ...(d === 4 ? [`0.25n+${b}`, `¼n+${b}`] : [])].map((e) => (b === 0 ? e.replace(/\+0$|^0\+/, "") : e));
    return { prompt: `Write the nth term of the sequence ${seq.map(fracStr).join(", ")}, ...`, answers: [...new Set(exprs)], hint: `The terms go up by 1/${d} each time.`, solution: `The difference is 1/${d}, so start from n/${d}; ${b === 0 ? "no adjustment is needed" : `add ${b}`}, giving n/${d}${b === 0 ? "" : ` + ${b}`}.`, answerFormat: "Enter the nth term using n, for example n/2 + 3." };
  }),
  T(`${U}-a3`, "application", ["8As.03"], "Find an input for a function with a fraction", () => {
    const d = r(2, 5), c = rNonZero(-6, 8), x = d * r(1, 10);
    return { prompt: `f(x) = x/${d} ${c < 0 ? "−" : "+"} ${Math.abs(c)}. Find the input x when the output is ${fmt(x / d + c)}.`, answers: [String(x)], hint: `Undo the ${c < 0 ? "subtraction" : "addition"} first, then multiply by ${d}.`, solution: `x/${d} = ${fmt(x / d + c)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${x / d}, so x = ${x / d} × ${d} = ${x}.` };
  }),
  T(`${U}-a4`, "application", ["8As.02"], "Decide whether a number is in a sequence", () => {
    const a = r(3, 9), b = rNonZero(-5, 8), n = r(10, 40), inSeq = Math.random() < 0.5;
    const value = inSeq ? a * n + b : a * n + b + r(1, a - 1);
    return { prompt: `Is ${value} a term of the sequence with nth term ${nth(a, b)}? Answer yes or no.`, answers: [inSeq ? "yes" : "no"], hint: `Solve ${nth(a, b)} = ${value} and check whether n is a whole number.`, solution: `${a}n = ${value - b}, so n = ${fmt(tidyNum((value - b) / a, 4))}; ${inSeq ? "a whole number, so yes" : "not a whole number, so no"}.` };
  }),
  T(`${U}-a5`, "application", ["8As.01"], "Find which pattern has a given number of pieces", () => {
    const first = r(3, 8), step = r(2, 5), k = r(6, 20), total = first + (k - 1) * step;
    const thing = pick(["tiles", "matchsticks", "counters"]);
    return { prompt: `Pattern 1 has ${first} ${thing} and each new pattern has ${step} more. Which pattern number has ${total} ${thing}?`, answers: [String(k)], hint: `How many steps of ${step} take you from ${first} to ${total}?`, solution: `${total} − ${first} = ${total - first}, and ${total - first} ÷ ${step} = ${k - 1} steps, so it is pattern ${k}.` };
  }),
  T(`${U}-a6`, "application", ["8As.03"], "Use a function machine with division", () => {
    const d = r(2, 5), c = rNonZero(-8, 10), x = d * r(2, 12);
    return { prompt: `A function machine divides the input by ${d}, then ${c < 0 ? "subtracts" : "adds"} ${Math.abs(c)}. Find the output when the input is ${x}.`, answers: [ans(x / d + c)], hint: "Apply the operations in order.", solution: `${x} ÷ ${d} = ${x / d}, then ${x / d} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(x / d + c)}.` };
  }),
  T(`${U}-a7`, "application", ["8As.02"], "Find a far term of a sequence", () => {
    const a = r(2, 9), b = rNonZero(-6, 10), n = pick([50, 60, 75, 100, 120]);
    return { prompt: `A sequence begins ${list(terms(a, b, 3))}, ... Find the ${n}th term.`, answers: [ans(a * n + b)], hint: "Find the nth term first, then substitute.", solution: `The nth term is ${nth(a, b)}, so the ${n}th term is ${a} × ${n} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(a * n + b)}.` };
  }),
  T(`${U}-a8`, "application", ["8As.01"], "Use a term-to-term rule with decimals", () => {
    const start = tidyNum(r(20, 80) / 10, 4), step = tidyNum(-r(3, 15) / 10, 4), k = r(4, 7);
    return { prompt: `A sequence starts at ${fmt(start)} and each term is ${fmt(-step)} less than the one before. Find term ${k}.`, answers: [ans(start + (k - 1) * step)], hint: `Subtract ${fmt(-step)} a total of ${k - 1} times.`, solution: `${fmt(start)} − ${k - 1} × ${fmt(-step)} = ${fmt(start + (k - 1) * step)}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8As.02"], "Find which term has a given value", () => {
    const a = r(3, 9), b = rNonZero(-10, 10), n = r(10, 40);
    return { prompt: `Which term of the sequence with nth term ${nth(a, b)} is equal to ${fmt(a * n + b)}?`, answers: [String(n)], hint: `Solve ${nth(a, b)} = ${fmt(a * n + b)}.`, solution: `${a}n = ${fmt(a * n + b)} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${a * n}, so n = ${n}; it is the ${n}th term.` };
  }),
  T(`${U}-r2`, "reasoning", ["8As.02"], "Correct an nth-term error", () => {
    const a = r(2, 9), b = r(1, 12);
    return { prompt: `A learner says the nth term of ${list(terms(a, b))}, ... is n + ${a}. Enter the correct nth term.`, answers: nthAnswers(a, b), hint: "The difference between terms tells you the number in front of n.", solution: `The terms go up by ${a}, so the nth term starts ${a}n; adjusting to fit the first term gives ${nth(a, b)}. The learner used the difference as the constant.`, answerFormat: NTH_FORMAT };
  }),
  T(`${U}-r3`, "reasoning", ["8As.03"], "Reverse a function with negative values", () => {
    const m = r(2, 6), c = rNonZero(-9, 9), x = -r(1, 9);
    return { prompt: `f(x) = ${linear(m, c)}. Find x when f(x) = ${fmt(m * x + c)}.`, answers: [ans(x)], hint: "Undo the operations in reverse order.", solution: `${m}x = ${fmt(m * x + c)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${fmt(m * x)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-r4`, "reasoning", ["8As.01"], "Decide whether a pattern can have a given size", () => {
    const a = r(3, 6), b = r(1, 4), target = r(30, 90), possible = (target - b) % a === 0;
    return { prompt: `Pattern number n uses ${nth(a, b)} dots. Can a pattern use exactly ${target} dots? Answer yes or no.`, answers: [possible ? "yes" : "no"], hint: `Solve ${nth(a, b)} = ${target}; n must be a whole number.`, solution: `${a}n = ${target - b}, so n = ${fmt(tidyNum((target - b) / a, 4))}: ${possible ? "a whole number, so yes" : "not a whole number, so no"}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8As.02"], "Find where two sequences share a term number", () => {
    const n = r(2, 12), a = r(2, 5), c = a + r(1, 4), b = r(1, 15), d = a * n + b - c * n;
    return { prompt: `Two sequences have nth terms ${nth(a, b)} and ${nth(c, d)}. For which value of n are the two terms equal?`, answers: [String(n)], hint: "Set the two expressions equal and solve for n.", solution: `${nth(a, b)} = ${nth(c, d)} gives ${c - a}n = ${b - d}, so n = ${n}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8As.03"], "Find where input and output are equal", () => {
    const m = r(2, 6), x = r(2, 12) * pick([-1, 1]), c = x - m * x;
    return { prompt: `A function multiplies the input by ${m}, then ${c < 0 ? "subtracts" : "adds"} ${Math.abs(c)}. Which input gives an output equal to itself?`, answers: [ans(x)], hint: `Solve x = ${linear(m, c)}.`, solution: `x = ${linear(m, c)} gives ${m - 1}x = ${fmt(-c)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-r7`, "reasoning", ["8As.02"], "Find the first term above a value", () => {
    const a = r(3, 8), b = -r(5, 30), limit = 10 * r(5, 20);
    const n = Math.floor((limit - b) / a) + 1;
    return { prompt: `The nth term of a sequence is ${nth(a, b)}. Which term number is the first to be greater than ${limit}?`, answers: [String(n)], hint: `Solve ${nth(a, b)} > ${limit}, then take the next whole number.`, solution: `${a}n > ${limit - b}, so n > ${fmt(tidyNum((limit - b) / a, 3))}; the first whole number is ${n} (term ${fmt(a * n + b)}).` };
  }),
  T(`${U}-r8`, "reasoning", ["8As.01"], "Find the first negative term with fractions", () => {
    const d = pick([2, 4]), step = frac(r(1, d - 1), d), start = r(3, 7);
    let term = frac(start), k = 1;
    while (term.n >= 0) { term = add(term, mul(step, frac(-1))); k++; }
    return { prompt: `A sequence starts at ${start} and ${fracStr(step)} is subtracted each time. What is the first negative term?`, answers: fracAnswers(term).concat([ans(term.n / term.d)]), hint: `Keep subtracting ${fracStr(step)}; watch for the first term below zero.`, solution: `Term ${k} is the first below zero: ${fracStr(term)}.`, answerFormat: "Enter a fraction or decimal, for example -1/4 or -0.25." };
  }),
];
