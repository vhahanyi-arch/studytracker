// Stage 9, unit 9: Sequences and functions (9As.01, 9As.02, 9As.03).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, frac, add, mul, fracStr, mixedStr, fmt, ans, br, linear, poly, exprForms, ordinal } from "../kit";

const U = "s9-u9";
const NTH = "Enter the nth term using n, for example 3n² + 2 or 4n − 1. You may type n^2.";
const list = (xs: number[]) => xs.map((x) => fmt(x)).join(", ");
/** Terms 1 to count of an² + bn + c. */
const quad = (a: number, b: number, c: number, count = 4) => Array.from({ length: count }, (_, i) => a * (i + 1) ** 2 + b * (i + 1) + c);
const diffs = (xs: number[]) => xs.slice(1).map((x, i) => x - xs[i]);

export const s9u9: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9As.01"], "Continue a quadratic sequence", () => {
    const [a, b, c] = [r(1, 3), rNonZero(-4, 5), r(-5, 8)], seq = quad(a, b, c, 5), d1 = diffs(seq.slice(0, 4));
    return { prompt: `Find the next term: ${list(seq.slice(0, 4))}, ...`, answers: [ans(seq[4])], hint: "Find the differences between terms, then the differences between those.", solution: `First differences ${list(d1)} go up by ${2 * a} each time, so the next difference is ${fmt(d1[2] + 2 * a)} and the next term is ${fmt(seq[3])} + ${br(d1[2] + 2 * a)} = ${fmt(seq[4])}.` };
  }),
  T(`${U}-f2`, "foundational", ["9As.02"], "Find the nth term of a linear sequence", () => {
    const a = rNonZero(-8, 9), b = r(-10, 20), seq = [1, 2, 3, 4].map((n) => a * n + b);
    return { prompt: `Find the nth term of the sequence ${list(seq)}, ...`, answers: exprForms(linear(a, b, "n")), hint: "The difference between terms is the number in front of n.", solution: `The terms change by ${fmt(a)}, so the rule is ${linear(a, 0, "n")} + something. When n = 1: ${fmt(a)} + ${br(b)} = ${fmt(seq[0])}, so the nth term is ${linear(a, b, "n")}.`, answerFormat: NTH };
  }),
  T(`${U}-f3`, "foundational", ["9As.02"], "Find a term from a quadratic rule", () => {
    const a = r(1, 4), c = rNonZero(-9, 12), k = r(3, 15), rule = poly([a, 0, c], "n");
    return { prompt: `The nth term of a sequence is ${rule}. Find the ${ordinal(k)} term.`, answers: [ans(a * k * k + c)], hint: "Substitute n into the rule. Square before multiplying.", solution: `${a === 1 ? "" : `${a} × `}${k}² ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${a === 1 ? "" : `${a} × `}${k * k} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(a * k * k + c)}.` };
  }),
  T(`${U}-f4`, "foundational", ["9As.01"], "Use a term-to-term rule", () => {
    const m = r(2, 3), c = rNonZero(-5, 5), first = r(1, 6), seq = [first];
    for (let i = 0; i < 3; i++) seq.push(seq[i] * m + c);
    return { prompt: `A sequence starts at ${first}. The term-to-term rule is "multiply by ${m}, then ${c < 0 ? "subtract" : "add"} ${Math.abs(c)}". Find the 4th term.`, answers: [ans(seq[3])], hint: "Apply the rule three times.", solution: `${list(seq)}: the 4th term is ${fmt(seq[3])}.` };
  }),
  T(`${U}-f5`, "foundational", ["9As.03"], "Find an output from a function with a power", () => {
    const a = r(1, 4), p = pick([2, 3]), c = rNonZero(-10, 10), x = rNonZero(-4, 5), y = a * x ** p + c;
    const rule = `${a === 1 ? "" : a}x${p === 2 ? "²" : "³"} ${c < 0 ? "−" : "+"} ${Math.abs(c)}`;
    return { prompt: `A function maps x → ${rule}. Find the output when the input is ${fmt(x)}.`, answers: [ans(y)], hint: "Work out the power first, then multiply and add.", solution: `${a === 1 ? "" : `${a} × `}${br(x)}${p === 2 ? "²" : "³"} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${a === 1 ? "" : `${a} × `}${br(x ** p)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(y)}.` };
  }),
  T(`${U}-f6`, "foundational", ["9As.03"], "Find an input from an output", () => {
    const x = r(2, 12), c = rNonZero(-10, 20), y = x * x + c;
    return { prompt: `A function maps x → x² ${c < 0 ? "−" : "+"} ${Math.abs(c)}. The output is ${fmt(y)}. Find the positive input.`, answers: [String(x)], hint: "Undo the operations in reverse order: first the addition or subtraction, then the square.", solution: `x² = ${fmt(y)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${x * x}, so x = √${x * x} = ${x}.` };
  }),
  T(`${U}-f7`, "foundational", ["9As.02"], "Decide whether a number is in a sequence", () => {
    const a = r(3, 9), b = r(-5, 8), ok = pick([true, false]), n = r(10, 60), v = a * n + b + (ok ? 0 : r(1, a - 1));
    return { prompt: `Is ${v} a term of the sequence with nth term ${linear(a, b, "n")}? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Solve the rule = the number. The term number must be a whole number.", solution: ok ? `Yes: ${linear(a, b, "n")} = ${v} gives n = ${n}, a whole number.` : `No: ${linear(a, b, "n")} = ${v} gives n = ${fracStr(frac(v - b, a))}, not a whole number.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-f8`, "foundational", ["9As.01"], "Find the second difference", () => {
    const [a, b, c] = [r(1, 5), rNonZero(-5, 5), r(-5, 10)], seq = quad(a, b, c, 5), d1 = diffs(seq);
    return { prompt: `What is the second difference of the sequence ${list(seq)}, ...?`, answers: [String(2 * a)], hint: "Find the differences between terms, then the differences between those differences.", solution: `First differences: ${list(d1)}. They go up by ${2 * a} each time, so the second difference is ${2 * a}.` };
  }),
  T(`${U}-f9`, "foundational", ["9As.02"], "Find the nth term of a simple quadratic sequence", () => {
    const c = rNonZero(-6, 10), seq = quad(1, 0, c, 4), rule = poly([1, 0, c], "n");
    return { prompt: `Find the nth term of the sequence ${list(seq)}, ...`, answers: exprForms(rule), hint: "Compare with the square numbers 1, 4, 9, 16.", solution: `Each term is ${c < 0 ? `${Math.abs(c)} less` : `${c} more`} than the square numbers 1, 4, 9, 16, so the nth term is ${rule}.`, answerFormat: NTH };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9As.02"], "Find the nth term of an² + c", () => {
    const a = r(2, 5), c = rNonZero(-8, 8), seq = quad(a, 0, c, 4), rule = poly([a, 0, c], "n");
    return { prompt: `Find the nth term of the sequence ${list(seq)}, ...`, answers: exprForms(rule), hint: "The second difference is 2a, where a is the number in front of n².", solution: `The second difference is ${2 * a}, so the rule starts ${a}n². ${a}n² gives ${list(quad(a, 0, 0, 4))}; each term is ${c < 0 ? `${Math.abs(c)} less` : `${c} more`}, so the nth term is ${rule}.`, answerFormat: NTH };
  }),
  T(`${U}-a2`, "application", ["9As.02"], "Find which term has a value", () => {
    const a = r(2, 9), b = rNonZero(-10, 10), n = r(12, 60), v = a * n + b;
    return { prompt: `A sequence has nth term ${linear(a, b, "n")}. Which term is equal to ${v}?`, answers: [String(n)], hint: "Solve the equation rule = value.", solution: `${linear(a, b, "n")} = ${v}, so ${a}n = ${v - b} and n = ${n}. It is the ${ordinal(n)} term.` };
  }),
  T(`${U}-a3`, "application", ["9As.01", "9As.02"], "Continue a growing pattern", () => {
    const b = r(1, 4), c = r(0, 3), seq = quad(1, b, c, 3), k = r(6, 15);
    return { prompt: `A pattern of tiles has ${list(seq)} tiles in patterns 1, 2 and 3. The number of tiles follows the rule ${poly([1, b, c], "n")}. How many tiles are in pattern ${k}?`, answers: [String(k * k + b * k + c)], hint: "Substitute the pattern number into the rule.", solution: `${k}² + ${b === 1 ? "" : `${b} × `}${k}${c ? ` + ${c}` : ""} = ${k * k} + ${b * k}${c ? ` + ${c}` : ""} = ${k * k + b * k + c}.` };
  }),
  T(`${U}-a4`, "application", ["9As.03"], "Undo a function with a cube", () => {
    const x = rNonZero(-5, 6), c = rNonZero(-20, 20), y = x ** 3 + c;
    return { prompt: `A function maps x → x³ ${c < 0 ? "−" : "+"} ${Math.abs(c)}. The output is ${fmt(y)}. Find the input.`, answers: [ans(x)], hint: "Undo the addition or subtraction, then take the cube root.", solution: `x³ = ${fmt(y)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${fmt(x ** 3)}, so x = ∛${br(x ** 3)} = ${fmt(x)}.` };
  }),
  T(`${U}-a5`, "application", ["9As.03"], "Find a linear function from two pairs", () => {
    const m = rNonZero(-5, 6), c = rNonZero(-10, 10), [x1, x2, x3] = [r(1, 4), r(5, 8), r(9, 15)];
    return { prompt: `A linear function maps ${x1} → ${fmt(m * x1 + c)} and ${x2} → ${fmt(m * x2 + c)}. What does it map ${x3} to?`, answers: [ans(m * x3 + c)], hint: "Find how much the output changes for each 1 added to the input.", solution: `The output changes by ${fmt(m * (x2 - x1))} when the input goes up by ${x2 - x1}, so the rule is x → ${linear(m, c)}. ${x3} → ${fmt(m * x3 + c)}.` };
  }),
  T(`${U}-a6`, "application", ["9As.02"], "Find the first term above a value", () => {
    const a = r(3, 9), b = rNonZero(-8, 8), N = 10 * r(10, 40), n = Math.floor((N - b) / a) + 1;
    return { prompt: `A sequence has nth term ${linear(a, b, "n")}. What is the first term that is greater than ${N}?`, answers: [String(a * n + b)], hint: "Solve the inequality rule > value, then take the next whole number n.", solution: `${linear(a, b, "n")} > ${N} gives n > ${fracStr(frac(N - b, a))}, so n = ${n} and the term is ${a * n + b}.` };
  }),
  T(`${U}-a7`, "application", ["9As.01"], "Continue a sequence of fractions", () => {
    const d = pick([3, 4, 5, 6, 8]), step = frac(r(1, d - 1), d), start = frac(r(1, d), d), k = r(5, 8), term = add(start, mul(step, frac(k - 1)));
    return { prompt: `A sequence starts at ${fracStr(start)} and ${fracStr(step)} is added each time. Find the ${ordinal(k)} term.`, answers: [...new Set([fracStr(term), mixedStr(term)])], hint: "The kth term is the first term plus (k − 1) steps.", solution: `${fracStr(start)} + ${k - 1} × ${fracStr(step)} = ${fracStr(term)} = ${mixedStr(term)}.`, answerFormat: "Enter a fraction or mixed number, for example 11/4 or 2 3/4." };
  }),
  T(`${U}-a8`, "application", ["9As.02"], "Use an nth term with a fractional coefficient", () => {
    const d = pick([2, 4, 5]), b = r(-5, 10), k = d * r(2, 10);
    return { prompt: `The nth term of a sequence is n/${d} ${b < 0 ? "−" : "+"} ${Math.abs(b)}. Find the ${ordinal(k)} term.`, answers: [ans(k / d + b)], hint: `Divide the term number by ${d}, then ${b < 0 ? "subtract" : "add"} ${Math.abs(b)}.`, solution: `${k} ÷ ${d} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(k / d)} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = ${fmt(k / d + b)}.` };
  }),
  T(`${U}-a9`, "application", ["9As.03"], "Undo a two-step function", () => {
    const m = r(2, 6), c = rNonZero(-10, 10), x = rNonZero(-6, 12), y = m * (x + c);
    return { prompt: `A function ${c < 0 ? `subtracts ${-c} from the input` : `adds ${c} to the input`}, then multiplies by ${m}. The output is ${fmt(y)}. What was the input?`, answers: [ans(x)], hint: "Work backwards: divide first, then undo the addition.", solution: `${fmt(y)} ÷ ${m} = ${fmt(x + c)}, then ${fmt(x + c)} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${fmt(x)}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9As.02"], "Find the nth term of n² + bn", () => {
    const b = rNonZero(-3, 5), c = r(-3, 5), seq = quad(1, b, c, 5), rule = poly([1, b, c], "n");
    return { prompt: `Find the nth term of the quadratic sequence ${list(seq)}, ...`, answers: exprForms(rule), hint: "The second difference is 2, so the rule starts n². Subtract n² from each term and find the linear rule that is left.", solution: `Subtracting n² (1, 4, 9, 16, 25) leaves ${list(seq.map((v, i) => v - (i + 1) ** 2))}, which is ${linear(b, c, "n")}. So the nth term is ${rule}.`, answerFormat: NTH };
  }),
  T(`${U}-r2`, "reasoning", ["9As.02"], "Find the first number in two sequences", () => {
    for (;;) {
      const [a1, b1, a2, b2] = [r(2, 7), r(-3, 6), r(2, 7), r(-3, 6)];
      if (a1 === a2) continue;
      const s1 = new Set(Array.from({ length: 80 }, (_, i) => a1 * (i + 1) + b1)), common = Array.from({ length: 80 }, (_, i) => a2 * (i + 1) + b2).filter((v) => s1.has(v));
      if (!common.length || common[0] <= 0) continue;
      return { prompt: `What is the smallest number that is in both the sequence ${linear(a1, b1, "n")} and the sequence ${linear(a2, b2, "n")}?`, answers: [String(common[0])], hint: "List the first terms of each sequence and look for a match.", solution: `${linear(a1, b1, "n")}: ${list(Array.from({ length: 6 }, (_, i) => a1 * (i + 1) + b1))}, … ${linear(a2, b2, "n")}: ${list(Array.from({ length: 6 }, (_, i) => a2 * (i + 1) + b2))}, … The first number in both is ${common[0]}.` };
    }
  }),
  T(`${U}-r3`, "reasoning", ["9As.02"], "Decide whether a number is in a quadratic sequence", () => {
    const c = rNonZero(-10, 20), n = r(5, 20), ok = pick([true, false]), v = n * n + c + (ok ? 0 : r(1, 2 * n));
    const root = Math.sqrt(v - c);
    return { prompt: `Is ${v} a term of the sequence with nth term n² ${c < 0 ? "−" : "+"} ${Math.abs(c)}? Answer yes or no.`, answers: [Number.isInteger(root) ? "yes" : "no"], hint: `Is ${v} ${c < 0 ? "+" : "−"} ${Math.abs(c)} a square number?`, solution: Number.isInteger(root) ? `Yes: ${v} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${v - c} = ${root}², so it is the ${ordinal(root)} term.` : `No: ${v} ${c < 0 ? "+" : "−"} ${Math.abs(c)} = ${v - c}, which is not a square number.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r4`, "reasoning", ["9As.03"], "Undo a function with a square", () => {
    const x = r(2, 10), c = r(1, 15), m = r(2, 5), y = m * (x * x + c);
    return { prompt: `A function squares the input, adds ${c}, then multiplies by ${m}. The output is ${y}. What was the positive input?`, answers: [String(x)], hint: "Undo each step in reverse order.", solution: `${y} ÷ ${m} = ${x * x + c}; ${x * x + c} − ${c} = ${x * x}; √${x * x} = ${x}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9As.02"], "Find when a decreasing sequence becomes negative", () => {
    const a = r(3, 9), b = a * r(8, 20) + r(1, a - 1), n = Math.floor(b / a) + 1;
    return { prompt: `A sequence has nth term ${b} − ${a}n. Which is the first term that is negative?`, answers: [String(n)], hint: "Solve the rule < 0.", solution: `${b} − ${a}n < 0 gives n > ${fracStr(frac(b, a))}, so the first negative term is term ${n} (value ${fmt(b - a * n)}).`, answerFormat: "Enter the term number." };
  }),
  T(`${U}-r6`, "reasoning", ["9As.01"], "Work back through a quadratic sequence", () => {
    const [a, b, c] = [r(1, 3), rNonZero(-4, 4), r(-5, 10)], seq = quad(a, b, c, 5);
    return { prompt: `The 2nd, 3rd, 4th and 5th terms of a quadratic sequence are ${list(seq.slice(1))}. What is the 1st term?`, answers: [ans(seq[0])], hint: "Use the differences: the second difference is constant, so extend the differences backwards.", solution: `First differences ${list(diffs(seq.slice(1)))} change by ${2 * a}, so the difference before them is ${fmt(seq[2] - seq[1] - 2 * a)}. The 1st term is ${fmt(seq[1])} − ${br(seq[1] - seq[0])} = ${fmt(seq[0])}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9As.03"], "Find a missing constant in a function", () => {
    const a = r(1, 3), k = r(2, 6), b = rNonZero(-10, 15), y = a * k * k + b;
    return { prompt: `A function maps x → ${a === 1 ? "" : a}x² + b. It maps ${k} to ${fmt(y)}. Find b.`, answers: [ans(b)], hint: "Substitute the input and output, then solve for b.", solution: `${a === 1 ? "" : `${a} × `}${k}² + b = ${fmt(y)}, so ${a * k * k} + b = ${fmt(y)} and b = ${fmt(b)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9As.02"], "Find a term of a sequence of fractions", () => {
    const [p, q] = [r(1, 3), r(2, 4)], k = r(10, 30);
    return { prompt: `The sequence ${[1, 2, 3, 4].map((n) => `${n}/${p * n + q}`).join(", ")}, ... has numerators 1, 2, 3, … Find the ${ordinal(k)} term as a fraction (not simplified).`, answers: [`${k}/${p * k + q}`, fracStr(frac(k, p * k + q))], hint: "Find a rule for the numerators and a rule for the denominators separately.", solution: `Numerators: n. Denominators: ${linear(p, q, "n")}. The ${ordinal(k)} term is ${k}/${p * k + q}.`, answerFormat: "Enter a fraction, for example 20/41." };
  }),
];
