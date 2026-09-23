// Stage 9, unit 2: Expressions and formulae (9Ae.01 to 9Ae.04).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, shuffle, sup, fmt, ans, br, poly, linear, exprForms, gcd } from "../kit";

const U = "s9-u2";
const EXPR = "Enter the expression. You may type x^2 for x².";
const LETTER = "Enter the letter of your choice.";

/** A single term with a coefficient: (3, "x", 2) -> "3x²"; (−1, "x", 1) -> "−x". */
function mono(c: number, v: string, e: number) {
  const k = c === 1 ? "" : c === -1 ? "−" : fmt(c);
  return e === 0 ? fmt(c) : `${k}${v}${e === 1 ? "" : sup(e)}`;
}
/** Forms of a single term students may type: 12x⁵ -> 12x⁵, 12x^5. */
const monoForms = (c: number, v: string, e: number) => exprForms(mono(c, v, e));
/** Both orders of a two-variable term: 12a³b⁴ and 12b⁴a³, with carets. */
function twoVar(c: number, a: number, b: number) {
  const k = c === 1 ? "" : fmt(c), pa = `a${a === 1 ? "" : sup(a)}`, pb = `b${b === 1 ? "" : sup(b)}`;
  return [...new Set([`${k}${pa}${pb}`, `${k}${pb}${pa}`].flatMap((f) => exprForms(f)))];
}

export const s9u2: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ae.01"], "Multiply algebraic terms with powers", () => {
    const v = pick(["x", "y", "a", "p"]), c1 = rNonZero(-6, 8), c2 = r(2, 7), m = r(1, 5), n = r(2, 5);
    return { prompt: `Simplify ${mono(c1, v, m)} × ${mono(c2, v, n)}.`, answers: monoForms(c1 * c2, v, m + n), hint: "Multiply the numbers, then add the indices.", solution: `${fmt(c1)} × ${c2} = ${fmt(c1 * c2)} and ${v}${m === 1 ? "" : sup(m)} × ${v}${sup(n)} = ${v}${sup(m + n)}, so ${mono(c1 * c2, v, m + n)}.`, answerFormat: EXPR };
  }),
  T(`${U}-f2`, "foundational", ["9Ae.01"], "Collect like terms with powers", () => {
    const [a, b, c, d] = [r(2, 9), rNonZero(-8, 8), rNonZero(-6, -1), rNonZero(-8, 8)];
    if (a + c === 0 || b + d === 0) return s9u2[1].make();
    const result = poly([a + c, b + d, 0]);
    return { prompt: `Simplify ${poly([a, 0, 0])} ${b < 0 ? "−" : "+"} ${mono(Math.abs(b), "x", 1)} ${c < 0 ? "−" : "+"} ${mono(Math.abs(c), "x", 2)} ${d < 0 ? "−" : "+"} ${mono(Math.abs(d), "x", 1)}.`, answers: exprForms(result), hint: "Only terms with the same letter and the same power are like terms.", solution: `x² terms: ${a} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(a + c)}. x terms: ${fmt(b)} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${fmt(b + d)}. So ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-f3`, "foundational", ["9Ae.02"], "Expand two brackets", () => {
    const a = rNonZero(-9, 9), b = rNonZero(-9, 9);
    if (a + b === 0) return s9u2[2].make();
    const result = poly([1, a + b, a * b]);
    return { prompt: `Expand and simplify (${linear(1, a)})(${linear(1, b)}).`, answers: exprForms(result), hint: "Multiply each term in the first bracket by each term in the second.", solution: `x × x = x², x × ${br(b)} + ${br(a)} × x = ${linear(a + b, 0)}, and ${br(a)} × ${br(b)} = ${fmt(a * b)}. So ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-f4`, "foundational", ["9Ae.01", "9Ae.02"], "Divide algebraic terms", () => {
    const v = pick(["x", "y", "m", "t"]), c2 = r(2, 6), q = rNonZero(-5, 6), m = r(4, 8), n = r(1, m - 1), c1 = c2 * q;
    return { prompt: `Simplify ${mono(c1, v, m)} ÷ ${mono(c2, v, n)}.`, answers: monoForms(q, v, m - n), hint: "Divide the numbers, then subtract the indices.", solution: `${fmt(c1)} ÷ ${c2} = ${fmt(q)} and ${m} − ${n} = ${m - n}, so ${mono(q, v, m - n)}.`, answerFormat: EXPR };
  }),
  T(`${U}-f5`, "foundational", ["9Ae.03"], "Write an expression from words", () => {
    const k = r(2, 9), c = r(2, 12), v = pick(["n", "x", "y", "p"]);
    const [words, expr, answers] = pick([
      [`the square of ${v}, plus ${c}`, `${v}² + ${c}`, exprForms(`${v}² + ${c}`)],
      [`the cube of ${v}, minus ${c}`, `${v}³ − ${c}`, exprForms(`${v}³ − ${c}`)],
      [`${k} times the square of ${v}`, `${k}${v}²`, exprForms(`${k}${v}²`)],
      [`the square root of ${v}, add ${c}`, `√${v} + ${c}`, [`√${v}+${c}`, `${c}+√${v}`, `sqrt(${v})+${c}`, `${c}+sqrt(${v})`]],
      [`the square of the sum of ${v} and ${c}`, `(${v} + ${c})²`, [`(${v}+${c})²`, `(${v}+${c})^2`, `(${c}+${v})²`, `(${c}+${v})^2`]],
      [`the cube of ${k} times ${v}`, `(${k}${v})³`, [`(${k}${v})³`, `(${k}${v})^3`, `${k ** 3}${v}³`, `${k ** 3}${v}^3`]],
    ] as Array<[string, string, string[]]>);
    return { prompt: `Write an expression for ${words}.`, answers, hint: "Read the words in order and decide what the operation acts on.", solution: `${words[0].toUpperCase() + words.slice(1)} is ${expr}.`, answerFormat: "Enter the expression. You may type x^2 for x² and sqrt(x) for √x." };
  }),
  T(`${U}-f6`, "foundational", ["9Ae.04"], "Substitute into a formula with a power", () => {
    const [formula, make] = pick([
      ["E = ½mv²", () => { const m = 2 * r(1, 6), v = r(2, 9); return { given: `m = ${m} and v = ${v}`, find: "E", value: (m * v * v) / 2, work: `½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = ${(m * v * v) / 2}` }; }],
      ["A = 4r²", () => { const rr = r(2, 12); return { given: `r = ${rr}`, find: "A", value: 4 * rr * rr, work: `4 × ${rr}² = 4 × ${rr * rr} = ${4 * rr * rr}` }; }],
      ["V = x³ + 2x", () => { const x = r(2, 6); return { given: `x = ${x}`, find: "V", value: x ** 3 + 2 * x, work: `${x}³ + 2 × ${x} = ${x ** 3} + ${2 * x} = ${x ** 3 + 2 * x}` }; }],
      ["P = 3a² − b", () => { const a = rNonZero(-6, 6), b = r(1, 20); return { given: `a = ${fmt(a)} and b = ${b}`, find: "P", value: 3 * a * a - b, work: `3 × ${br(a)}² − ${b} = 3 × ${a * a} − ${b} = ${fmt(3 * a * a - b)}` }; }],
    ] as Array<[string, () => { given: string; find: string; value: number; work: string }]>);
    const s = make();
    return { prompt: `Use the formula ${formula} to find ${s.find} when ${s.given}.`, answers: [ans(s.value)], hint: "Work out the power before multiplying.", solution: `${s.find} = ${s.work}.` };
  }),
  T(`${U}-f7`, "foundational", ["9Ae.02"], "Simplify an algebraic fraction", () => {
    const v = pick(["x", "y", "a"]), d = r(2, 6), q = r(2, 7), m = r(3, 7), n = r(1, m - 1);
    return { prompt: `Simplify (${mono(d * q, v, m)})/(${mono(d, v, n)}).`, answers: monoForms(q, v, m - n), hint: "Cancel common factors in the numbers, then subtract the indices.", solution: `${d * q} ÷ ${d} = ${q} and ${v}${sup(m)} ÷ ${v}${n === 1 ? "" : sup(n)} = ${v}${m - n === 1 ? "" : sup(m - n)}, so ${mono(q, v, m - n)}.`, answerFormat: EXPR };
  }),
  T(`${U}-f8`, "foundational", ["9Ae.03"], "Match words to an expression", () => {
    const [words, right, wrong1, wrong2] = pick([
      ["the square of the sum of a and b", "(a + b)²", "a² + b²", "2(a + b)"],
      ["the sum of the squares of a and b", "a² + b²", "(a + b)²", "2a + 2b"],
      ["the square root of the product of a and b", "√(ab)", "√a × b", "(ab)²"],
      ["the cube of the difference between a and b", "(a − b)³", "a³ − b³", "3(a − b)"],
      ["twice the square of a", "2a²", "(2a)²", "a² + 2"],
    ] as const);
    const options = shuffle([right, wrong1, wrong2]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `Which expression means ${words}? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(", ")}.`, answers: [letter], hint: "Decide what is squared, cubed or rooted: a single letter, or a whole bracket.", solution: `${letter}: ${words} is ${right}.`, answerFormat: LETTER };
  }),
  T(`${U}-f9`, "foundational", ["9Ae.01"], "Expand a bracket with powers", () => {
    const k = rNonZero(-5, 6), m = r(1, 2), a = r(2, 6), n = r(1, 3), b = rNonZero(-9, 9);
    if (k === 1) return s9u2[8].make();
    const result = `${mono(k * a, "x", m + n)} ${k * b < 0 ? "−" : "+"} ${mono(Math.abs(k * b), "x", m)}`;
    return { prompt: `Expand ${mono(k, "x", m)}(${mono(a, "x", n)} ${b < 0 ? "−" : "+"} ${Math.abs(b)}).`, answers: exprForms(result), hint: "Multiply each term inside by the term outside; add indices when multiplying powers of x.", solution: `${mono(k, "x", m)} × ${mono(a, "x", n)} = ${mono(k * a, "x", m + n)} and ${mono(k, "x", m)} × ${br(b)} = ${mono(k * b, "x", m)}, so ${result}.`, answerFormat: EXPR };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ae.02"], "Expand brackets with coefficients", () => {
    const [a, b, c, d] = [r(2, 5), rNonZero(-7, 7), rNonZero(-4, 5), rNonZero(-7, 7)];
    const mid = a * d + b * c;
    if (mid === 0) return s9u2.find((t) => t.id === `${U}-a1`)!.make();
    const result = poly([a * c, mid, b * d]);
    return { prompt: `Expand and simplify (${linear(a, b)})(${linear(c, d)}).`, answers: exprForms(result), hint: "Four multiplications: first, outer, inner, last. Then collect the x terms.", solution: `${linear(a, 0)} × ${linear(c, 0)} = ${poly([a * c, 0, 0])}; ${linear(a, 0)} × ${br(d)} + ${br(b)} × ${linear(c, 0)} = ${linear(mid, 0)}; ${br(b)} × ${br(d)} = ${fmt(b * d)}. So ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-a2`, "application", ["9Ae.02"], "Square a bracket", () => {
    const a = rNonZero(-9, 9), result = poly([1, 2 * a, a * a]);
    return { prompt: `Expand and simplify (${linear(1, a)})².`, answers: exprForms(result), hint: `Write it as (${linear(1, a)})(${linear(1, a)}). It is not just x² + ${a * a}.`, solution: `(${linear(1, a)})(${linear(1, a)}) = x² ${a < 0 ? "−" : "+"} ${mono(Math.abs(a), "x", 1)} ${a < 0 ? "−" : "+"} ${mono(Math.abs(a), "x", 1)} + ${a * a} = ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-a3`, "application", ["9Ae.02"], "Add algebraic fractions", () => {
    let [p, q] = [r(2, 7), r(2, 9)];
    if (p === q) q++;
    const sub = pick([true, false]), n = sub ? q - p : q + p, d = p * q, g = gcd(Math.abs(n), d), N = n / g, D = d / g;
    const coef = N === 1 ? "" : N === -1 ? "-" : String(N);
    const shown = N === 1 ? "" : N === -1 ? "−" : fmt(N);
    return { prompt: `Write x/${p} ${sub ? "−" : "+"} x/${q} as a single fraction in its simplest form.`, answers: D === 1 ? exprForms(`${shown}x`) : [`${coef}x/${D}`, `(${coef}x)/${D}`], hint: `Use a common denominator of ${p * q}.`, solution: `x/${p} = ${q}x/${d} and x/${q} = ${p}x/${d}, so the result is ${n === 1 ? "" : n === -1 ? "−" : fmt(n)}x/${d}${g === 1 ? "" : ` = ${shown}x/${D}`}.`, answerFormat: "Enter the fraction, for example 7x/12." };
  }),
  T(`${U}-a4`, "application", ["9Ae.04"], "Change the subject when there is a power", () => {
    const k = r(2, 9), [S, v, cube] = pick([["A", "r", false], ["y", "x", false], ["V", "s", true], ["E", "v", false]] as const);
    const root = cube ? "∛" : "√", word = cube ? "cbrt" : "sqrt";
    const inner = `${S.toLowerCase()}/${k}`, answers = [`${root}(${inner})`, `${word}(${inner})`, `${v}=${root}(${inner})`, `${v}=${word}(${inner})`];
    return { prompt: `Make ${v} the subject of ${S} = ${k}${v}${cube ? "³" : "²"}${cube ? "" : `, where ${v} is positive`}.`, answers, hint: `Divide both sides by ${k}, then take the ${cube ? "cube" : "square"} root.`, solution: `${S}/${k} = ${v}${cube ? "³" : "²"}, so ${v} = ${root}(${S}/${k}).`, answerFormat: `Enter ${v} = … using ${word}(…) or ${root}(…).` };
  }),
  T(`${U}-a5`, "application", ["9Ae.04"], "Work back through a formula with a square", () => {
    const k = r(2, 6), x = r(2, 12), y = k * x * x;
    const [S, v] = pick([["A", "r"], ["E", "v"], ["y", "x"]]);
    return { prompt: `${S} = ${k}${v}². Find the positive value of ${v} when ${S} = ${y}.`, answers: [String(x)], hint: `Divide by ${k}, then take the square root.`, solution: `${v}² = ${y} ÷ ${k} = ${x * x}, so ${v} = √${x * x} = ${x}.` };
  }),
  T(`${U}-a6`, "application", ["9Ae.03", "9Ae.02"], "Write and expand an area expression", () => {
    const a = r(1, 9), b = r(1, 9), shape = pick(["rectangle", "square"] as const);
    if (shape === "square") {
      const result = poly([1, 2 * a, a * a]);
      return { prompt: `A square has sides of (x + ${a}) cm. Write an expanded expression for its area in cm².`, answers: exprForms(result), hint: "Area = side × side. Expand (x + a)(x + a).", solution: `(x + ${a})² = ${result}.`, answerFormat: EXPR };
    }
    const result = poly([1, a + b, a * b]);
    return { prompt: `A rectangle is (x + ${a}) cm long and (x + ${b}) cm wide. Write an expanded expression for its area in cm².`, answers: exprForms(result), hint: "Area = length × width. Expand the two brackets.", solution: `(x + ${a})(x + ${b}) = ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-a7`, "application", ["9Ae.01"], "Multiply terms with two letters", () => {
    const [c1, c2, a1, a2, b1, b2] = [r(2, 6), rNonZero(-5, 6), r(1, 4), r(1, 3), r(1, 3), r(1, 4)];
    const term = (c: number, a: number, b: number) => `${c === 1 ? "" : c === -1 ? "−" : fmt(c)}a${a === 1 ? "" : sup(a)}b${b === 1 ? "" : sup(b)}`;
    return { prompt: `Simplify ${term(c1, a1, b1)} × ${c2 < 0 ? `(${term(c2, a2, b2)})` : term(c2, a2, b2)}.`, answers: twoVar(c1 * c2, a1 + a2, b1 + b2), hint: "Multiply the numbers, then add the indices of a and of b separately.", solution: `${c1} × ${br(c2)} = ${fmt(c1 * c2)}; a: ${a1} + ${a2} = ${a1 + a2}; b: ${b1} + ${b2} = ${b1 + b2}. So ${term(c1 * c2, a1 + a2, b1 + b2)}.`, answerFormat: "Enter the term, for example 12a^3b^4." };
  }),
  T(`${U}-a8`, "application", ["9Ae.02"], "Expand and simplify a sum of products", () => {
    const [k, m, a, b] = [r(2, 5), rNonZero(-6, 6), rNonZero(-6, 6), rNonZero(-6, 6)];
    const result = poly([1, k + a + b, k * m + a * b]);
    if (k + a + b === 0 || k * m + a * b === 0) return s9u2.find((t) => t.id === `${U}-a8`)!.make();
    return { prompt: `Expand and simplify ${k}(${linear(1, m)}) + (${linear(1, a)})(${linear(1, b)}).`, answers: exprForms(result), hint: "Expand each part separately, then collect like terms.", solution: `${k}(${linear(1, m)}) = ${linear(k, k * m)}. (${linear(1, a)})(${linear(1, b)}) = ${poly([1, a + b, a * b])}. Together: ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-a9`, "application", ["9Ae.04"], "Use v² = u² + 2as", () => {
    for (;;) {
      const u = r(0, 12), a = r(1, 5), s = r(1, 20), v2 = u * u + 2 * a * s, v = Math.sqrt(v2);
      if (!Number.isInteger(v)) continue;
      return { prompt: `Use v² = u² + 2as to find v when u = ${u}, a = ${a} and s = ${s}. (v is positive.)`, answers: [String(v)], hint: "Work out v² first, then take the square root.", solution: `v² = ${u}² + 2 × ${a} × ${s} = ${u * u} + ${2 * a * s} = ${v2}, so v = √${v2} = ${v}.` };
    }
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ae.02"], "Find a missing number in an expansion", () => {
    const a = r(1, 9), k = r(1, 9);
    return { prompt: `(x + ${a})(x + k) = x² + ${a + k}x + ${a * k}. Find k.`, answers: [String(k)], hint: "The constant term is the product of the two numbers in the brackets.", solution: `${a} × k = ${a * k}, so k = ${k}. Check: ${a} + ${k} = ${a + k}.` };
  }),
  T(`${U}-r2`, "reasoning", ["9Ae.02"], "Use the difference of two squares", () => {
    const m = 10 * r(3, 9), d = r(1, 4), [p, q] = [m + d, m - d];
    return { prompt: `Expand (a + b)(a − b), then use your answer to work out ${p}² − ${q}² without a calculator.`, answers: [String(p * p - q * q)], hint: "(a + b)(a − b) = a² − b². Choose a and b so that a + b and a − b are easy.", solution: `a² − b² = (a + b)(a − b), so ${p}² − ${q}² = (${p} + ${q})(${p} − ${q}) = ${p + q} × ${p - q} = ${p * p - q * q}.` };
  }),
  T(`${U}-r3`, "reasoning", ["9Ae.02", "9Ae.03"], "Find the area of a border", () => {
    const a = r(1, 6), result = poly([2 * a, a * a]);
    return { prompt: `A square of side x cm is cut from a corner of a square of side (x + ${a}) cm. Write a simplified expression for the area left, in cm².`, answers: exprForms(result), hint: "Subtract the smaller area from the larger one.", solution: `(x + ${a})² − x² = x² + ${2 * a}x + ${a * a} − x² = ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-r4`, "reasoning", ["9Ae.04"], "Find a speed from kinetic energy", () => {
    const m = 2 * r(1, 10), v = r(2, 12), E = (m * v * v) / 2;
    return { prompt: `The kinetic energy of an object is E = ½mv². An object of mass m = ${m} kg has E = ${E} J. Find its speed v in m/s.`, answers: [String(v)], hint: "Rearrange: v² = 2E ÷ m.", solution: `v² = 2 × ${E} ÷ ${m} = ${v * v}, so v = ${v} m/s.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Ae.02"], "Simplify an algebraic fraction by factorising", () => {
    const k = r(2, 9), a = rNonZero(-9, 9), byX = pick([true, false]);
    if (byX) {
      const result = linear(1, a);
      return { prompt: `Simplify (x² ${a < 0 ? "−" : "+"} ${mono(Math.abs(a), "x", 1)})/x.`, answers: exprForms(result), hint: "Factorise the top, then cancel.", solution: `x² ${a < 0 ? "−" : "+"} ${mono(Math.abs(a), "x", 1)} = x(${result}), so dividing by x gives ${result}.`, answerFormat: EXPR };
    }
    const result = linear(1, a);
    return { prompt: `Simplify (${k}x ${k * a < 0 ? "−" : "+"} ${Math.abs(k * a)})/${k}.`, answers: exprForms(result), hint: "Factorise the top, then cancel.", solution: `${k}x ${k * a < 0 ? "−" : "+"} ${Math.abs(k * a)} = ${k}(${result}), so dividing by ${k} gives ${result}.`, answerFormat: EXPR };
  }),
  T(`${U}-r6`, "reasoning", ["9Ae.03"], "Evaluate an expression given in words", () => {
    const [p, q, h] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]] as const);
    const [a, b] = shuffle([p, q]);
    return { prompt: `Find the square root of the sum of the squares of ${a} and ${b}.`, answers: [String(h)], hint: "Square each number, add, then take the square root.", solution: `${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}, and √${a * a + b * b} = ${h}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9Ae.01", "9Ae.02"], "Test whether two expressions are always equal", () => {
    const a = r(2, 9);
    const [left, right, ok, why] = pick([
      [`(x + ${a})²`, `x² + ${a * a}`, false, `(x + ${a})² = x² + ${2 * a}x + ${a * a}, which has an extra ${2 * a}x`],
      [`(x + ${a})²`, `x² + ${2 * a}x + ${a * a}`, true, `(x + ${a})(x + ${a}) = x² + ${2 * a}x + ${a * a}`],
      [`${a}x(x + 1)`, `${a}x² + ${a}x`, true, `${a}x × x = ${a}x² and ${a}x × 1 = ${a}x`],
      [`(x + ${a})(x − ${a})`, `x² − ${a * a}`, true, `the x terms cancel, leaving x² − ${a * a}`],
      [`(${a}x)²`, `${a}x²`, false, `(${a}x)² = ${a * a}x², not ${a}x²`],
      [`x³ × x²`, `x⁶`, false, `x³ × x² = x⁵: indices are added, not multiplied`],
    ] as const);
    return { prompt: `Is ${left} = ${right} true for every value of x? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Expand or simplify the left side, or test a value such as x = 1.", solution: `${ok ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r8`, "reasoning", ["9Ae.04"], "Rearrange a volume formula to find a length", () => {
    const rad = r(2, 8), h = r(2, 15), coef = rad * rad * h;
    return { prompt: `The volume of a cylinder is V = πr²h. A cylinder has V = ${coef}π cm³ and r = ${rad} cm. Find its height h in cm.`, answers: [String(h)], hint: "Rearrange to h = V ÷ (πr²).", solution: `h = ${coef}π ÷ (π × ${rad}²) = ${coef} ÷ ${rad * rad} = ${h} cm.` };
  }),
];

