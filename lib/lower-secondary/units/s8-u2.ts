// Stage 8, unit 2: Expressions, formulae and equations (8Ae.01-8Ae.07).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, gcd, fmt, ans, br, linear, poly, exprForms, factorForms, typed } from "../kit";

const U = "s8-u2";
const EXPR_FORMAT = "Enter the simplified expression. Spaces are optional; write powers as x² or x^2.";
const LIST_FORMAT = "List every integer in order, separated by commas. Example: -1, 0, 1, 2";

const coprime = (lo: number, hi: number) => { for (;;) { const p = r(lo, hi), q = r(lo, hi); if (p !== q && gcd(p, q) === 1) return [p, q]; } };

/** Integers x with lo (<|≤) x (<|≤) hi, and the inequality as printed. */
function interval() {
  const lo = r(-6, 2), hi = lo + r(3, 6);
  const lower = pick(["<", "≤"]), upper = pick(["<", "≤"]);
  const from = lower === "<" ? lo + 1 : lo, to = upper === "<" ? hi - 1 : hi;
  const values = [...Array(to - from + 1)].map((_, i) => from + i);
  return { text: `${fmt(lo)} ${lower} x ${upper} ${fmt(hi)}`, values, lo, hi, lower, upper };
}
const listAnswer = (values: number[]) => values.map(ans).join(",");
const listText = (values: number[]) => values.map(fmt).join(", ");

/** x = (y − b)/a in every sensible typed form. */
function subjectForms(subject: string, y: string, a: number, b: number) {
  const top = b > 0 ? `${y}-${b}` : `${y}+${-b}`;
  return [`(${top})/${a}`, `${subject}=(${top})/${a}`, `(${top})÷${a}`, `${subject}=(${top})÷${a}`];
}

const FORMULAE = [
  { name: "v = u + at", vars: () => { const u = r(0, 20), a = r(2, 9), t = r(2, 10); return { given: `u = ${u}, a = ${a} and t = ${t}`, find: "v", value: u + a * t, work: `v = ${u} + ${a} × ${t} = ${u + a * t}` }; } },
  { name: "P = 2(l + w)", vars: () => { const l = r(5, 30), w = r(2, 20); return { given: `l = ${l} and w = ${w}`, find: "P", value: 2 * (l + w), work: `P = 2(${l} + ${w}) = ${2 * (l + w)}` }; } },
  { name: "A = ½bh", vars: () => { const b = 2 * r(2, 12), h = r(3, 15); return { given: `b = ${b} and h = ${h}`, find: "A", value: (b * h) / 2, work: `A = ½ × ${b} × ${h} = ${(b * h) / 2}` }; } },
  { name: "d = st", vars: () => { const s = r(3, 25), t = r(2, 9); return { given: `s = ${s} and t = ${t}`, find: "d", value: s * t, work: `d = ${s} × ${t} = ${s * t}` }; } },
  { name: "F = ma", vars: () => { const m = r(2, 25), a = r(2, 12); return { given: `m = ${m} and a = ${a}`, find: "F", value: m * a, work: `F = ${m} × ${a} = ${m * a}` }; } },
];

export const s8u2: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Ae.02"], "Collect like terms", () => {
    const [p, q] = pick([["a", "b"], ["x", "y"], ["m", "n"], ["p", "q"]]);
    const a = r(3, 9), c = r(1, a - 1), b = r(2, 9), d = r(1, 9);
    const result = `${linear(a - c, 0, p)} + ${linear(b + d, 0, q)}`;
    return { prompt: `Simplify ${a}${p} + ${b}${q} − ${c === 1 ? "" : c}${p} + ${d === 1 ? "" : d}${q}.`, answers: exprForms(result), hint: `Collect the ${p} terms and the ${q} terms separately.`, solution: `${a}${p} − ${c === 1 ? "" : c}${p} = ${linear(a - c, 0, p)} and ${b}${q} + ${d === 1 ? "" : d}${q} = ${linear(b + d, 0, q)}, giving ${result}.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-f2`, "foundational", ["8Ae.02"], "Collect like terms with squares", () => {
    const a = r(3, 8), b = r(1, a - 1), c = r(1, 9), d = r(1, 9) * pick([-1, 1]);
    const result = poly([a - b, c + d, 0]);
    return { prompt: `Simplify ${a}x² + ${c === 1 ? "" : c}x − ${b === 1 ? "" : b}x² ${d < 0 ? "−" : "+"} ${Math.abs(d) === 1 ? "" : Math.abs(d)}x.`, answers: exprForms(result), hint: "x² terms and x terms are different kinds of term; collect each kind on its own.", solution: `x² terms: ${a} − ${b} = ${a - b}; x terms: ${c} ${d < 0 ? "−" : "+"} ${Math.abs(d)} = ${fmt(c + d)}. So the answer is ${result}.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-f3`, "foundational", ["8Ae.02"], "Multiply and divide algebraic terms", () => {
    const a = r(2, 7), b = r(2, 7);
    const kind = pick(["xx", "ab", "div", "cube"] as const);
    if (kind === "xx") return { prompt: `Simplify ${a}x × ${b}x.`, answers: exprForms(`${a * b}x²`), hint: "Multiply the numbers, then x × x = x².", solution: `${a} × ${b} = ${a * b} and x × x = x², so ${a * b}x².`, answerFormat: EXPR_FORMAT };
    if (kind === "ab") return { prompt: `Simplify ${a}p × ${b}q.`, answers: [`${a * b}pq`, `${a * b}qp`], hint: "Multiply the numbers and write the letters next to each other.", solution: `${a} × ${b} = ${a * b}, so ${a * b}pq.`, answerFormat: EXPR_FORMAT };
    if (kind === "div") return { prompt: `Simplify ${a * b}x² ÷ ${a}x.`, answers: [`${b}x`], hint: "Divide the numbers, then x² ÷ x = x.", solution: `${a * b} ÷ ${a} = ${b} and x² ÷ x = x, so ${b}x.`, answerFormat: EXPR_FORMAT };
    return { prompt: `Simplify ${a}y × ${b}y².`, answers: exprForms(`${a * b}y³`), hint: "Multiply the numbers; y × y² = y³.", solution: `${a} × ${b} = ${a * b} and y × y² = y³, so ${a * b}y³.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-f4`, "foundational", ["8Ae.03"], "Expand a single bracket", () => {
    const a = r(2, 9), b = r(1, 6), c = rNonZero(-9, 9);
    const result = linear(a * b, a * c);
    return { prompt: `Expand ${a}(${linear(b, c)}).`, answers: exprForms(result), hint: "Multiply every term inside the bracket by the number outside.", solution: `${a} × ${linear(b, 0)} = ${linear(a * b, 0)} and ${a} × ${br(c)} = ${fmt(a * c)}, so ${result}.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-f5`, "foundational", ["8Ae.03"], "Expand a bracket to give a square", () => {
    const k = r(1, 4), m = r(1, 5), c = rNonZero(-9, 9);
    const result = poly([k * m, k * c, 0]);
    const outside = k === 1 ? "x" : `${k}x`;
    return { prompt: `Expand ${outside}(${linear(m, c)}).`, answers: exprForms(result), hint: `Multiply each term in the bracket by ${outside}; x × x = x².`, solution: `${outside} × ${linear(m, 0)} = ${poly([k * m, 0, 0])} and ${outside} × ${br(c)} = ${poly([k * c, 0])}, so ${result}.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-f6`, "foundational", ["8Ae.03"], "Factorise using the highest common factor", () => {
    const h = r(2, 9); const [p, q] = coprime(1, 9);
    const inside = linear(p, q);
    return { prompt: `Factorise fully ${linear(h * p, h * q)}.`, answers: factorForms(String(h), inside), hint: "Find the highest number that divides both terms and take it outside the bracket.", solution: `The HCF of ${h * p} and ${h * q} is ${h}, so ${linear(h * p, h * q)} = ${h}(${inside}).`, answerFormat: "Enter the factorised expression, for example 6(2x + 3)." };
  }),
  T(`${U}-f7`, "foundational", ["8Ae.05"], "Substitute into a formula", () => {
    const f = pick(FORMULAE), v = f.vars();
    return { prompt: `Use the formula ${f.name} to find ${v.find} when ${v.given}.`, answers: [ans(v.value)], hint: "Replace each letter with its value, then follow the order of operations.", solution: `${v.work}.` };
  }),
  T(`${U}-f8`, "foundational", ["8Ae.01"], "Tell expressions, equations and formulae apart", () => {
    const a = r(2, 9), b = r(1, 20), x = r(2, 9);
    const [text, kind, why] = pick([
      [`${a}x + ${b}`, "expression", "it has no equals sign"],
      [`${a}x + ${b} = ${a * x + b}`, "equation", "it is true for one particular value of x"],
      [`P = ${a}l + ${b}`, "formula", "it connects the values of two different quantities"],
      [`C = ${a}n + ${b}`, "formula", "it gives C for any value of n"],
      [`${a}(x − ${b})`, "expression", "it has no equals sign"],
      [`${a}x − ${b} = ${fmt(a * x - b)}`, "equation", "only one value of x makes it true"],
    ] as const);
    return { prompt: `Is ${text} an expression, an equation or a formula?`, answers: [kind], hint: "An expression has no equals sign; an equation can be solved for one value; a formula links different quantities.", solution: `It is ${kind === "expression" ? "an expression" : kind === "equation" ? "an equation" : "a formula"}: ${why}.`, answerFormat: "Enter expression, equation or formula." };
  }),
  T(`${U}-f9`, "foundational", ["8Ae.06"], "Solve a two-step equation", () => {
    const a = r(2, 9), x = rNonZero(-6, 12), b = rNonZero(-15, 15), c = a * x + b;
    return { prompt: `Solve ${linear(a, b)} = ${fmt(c)}.`, answers: [ans(x), `x=${ans(x)}`], hint: "Undo the addition or subtraction first, then the multiplication.", solution: `${a}x = ${fmt(c)} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(a * x)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-f10`, "foundational", ["8Ae.07"], "List the integers in an interval", () => {
    const i = interval();
    return { prompt: `List the integers x that satisfy ${i.text}.`, answers: [listAnswer(i.values)], hint: "< leaves the end value out; ≤ includes it.", solution: `The integers are ${listText(i.values)}.`, answerFormat: LIST_FORMAT };
  }),
  T(`${U}-f11`, "foundational", ["8Ae.04"], "Write an expression from words", () => {
    const k = r(2, 9), m = r(2, 12);
    const [words, expr, extra] = pick([
      [`multiply n by ${k} and then subtract ${m}`, `${k}n − ${m}`, []],
      [`multiply n by ${k} and then add ${m}`, `${k}n + ${m}`, []],
      [`add ${m} to n and then multiply by ${k}`, `${k}(n + ${m})`, [...exprForms(`${k}n + ${k * m}`), `(n+${m})${k}`, `(n+${m})×${k}`, `(${m}+n)${k}`, `${k}(${m}+n)`]],
      [`subtract n from ${m * k}`, `${m * k} − n`, []],
      [`divide n by ${k} and then add ${m}`, `n/${k} + ${m}`, [`n÷${k}+${m}`, `${m}+n/${k}`, `1/${k}n+${m}`, `(1/${k})n+${m}`]],
    ] as [string, string, string[]][]);
    return { prompt: `Write an expression for: ${words}.`, answers: [...new Set([...exprForms(expr), ...extra])], hint: "Follow the words in order; use brackets when an operation applies to a whole result.", solution: `The expression is ${expr}.`, answerFormat: "Enter the expression using n. Spaces are optional." };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Ae.04"], "Form an expression from a context", () => {
    const [item, other] = pick([["pens", "file"], ["tickets", "booking fee"], ["notebooks", "pencil case"], ["cupcakes", "box"]]);
    const k = r(3, 12), m = r(5, 40);
    const result = `${k}p + ${m}`;
    return { prompt: `${item[0].toUpperCase() + item.slice(1)} cost p rand each. Write an expression for the cost of ${k} ${item} and a ${other} costing R${m}.`, answers: exprForms(result), hint: `${k} ${item} cost ${k} × p.`, solution: `${k} × p + ${m} = ${result}.`, answerFormat: "Enter the expression using p." };
  }),
  T(`${U}-a2`, "application", ["8Ae.04"], "Form an expression with a fractional coefficient", () => {
    const [part, d] = pick([["half", 2], ["a third", 3], ["a quarter", 4]] as const);
    const k = r(2, 9);
    const [a, b] = pick([["Sam", "Ali"], ["Thandi", "Lebo"], ["Priya", "Maya"]]);
    const expr = `m/${d} + ${k}`;
    return { prompt: `${a} has m marbles. ${b} has ${part} as many marbles as ${a}, plus ${k} more. Write an expression for the number of marbles ${b} has.`, answers: [...new Set([...exprForms(expr), `m÷${d}+${k}`, `1/${d}m+${k}`, `(1/${d})m+${k}`, `${k}+1/${d}m`, ...(d === 2 ? ["0.5m+" + k, "½m+" + k] : []), ...(d === 4 ? ["0.25m+" + k, "¼m+" + k] : [])])], hint: `${part[0].toUpperCase() + part.slice(1)} of m is m ÷ ${d}.`, solution: `${part[0].toUpperCase() + part.slice(1)} of m is m/${d}; adding ${k} gives ${expr}.`, answerFormat: "Enter the expression using m, for example m/2 + 3." };
  }),
  T(`${U}-a3`, "application", ["8Ae.05"], "Change the subject of a formula", () => {
    const [y, x] = pick([["y", "x"], ["P", "n"], ["C", "h"], ["T", "m"]]);
    const a = r(2, 9), b = rNonZero(-12, 12);
    const top = b > 0 ? `${y} − ${b}` : `${y} + ${-b}`;
    return { prompt: `Make ${x} the subject of ${y} = ${linear(a, b, x)}.`, answers: subjectForms(x, y.toLowerCase(), a, b).concat(subjectForms(x, y, a, b)), hint: `Undo the ${b > 0 ? "addition" : "subtraction"} first, then the multiplication, doing the same to both sides.`, solution: `${y} ${b > 0 ? "−" : "+"} ${Math.abs(b)} = ${a}${x}, so ${x} = (${top})/${a}.`, answerFormat: `Enter ${x} = ..., for example ${x} = (y − 5)/3.` };
  }),
  T(`${U}-a4`, "application", ["8Ae.06"], "Form and solve an equation from words", () => {
    const a = r(2, 9), x = r(3, 15), b = r(2, 20);
    const [op, sign] = pick([["subtract", -1], ["add", 1]] as const);
    const c = a * x + sign * b;
    return { prompt: `I think of a number, multiply it by ${a} and ${op} ${b}. The answer is ${fmt(c)}. What is my number?`, answers: [String(x)], hint: `Write ${a}n ${sign < 0 ? "−" : "+"} ${b} = ${fmt(c)} and solve for n.`, solution: `${a}n ${sign < 0 ? "−" : "+"} ${b} = ${fmt(c)}, so ${a}n = ${a * x} and n = ${x}.` };
  }),
  T(`${U}-a5`, "application", ["8Ae.06"], "Solve with the unknown on both sides", () => {
    const x = rNonZero(-5, 12), c = r(1, 6), a = c + r(1, 6), b = rNonZero(-12, 12), d = a * x + b - c * x;
    return { prompt: `Solve ${linear(a, b)} = ${linear(c, d)}.`, answers: [ans(x), `x=${ans(x)}`], hint: "Subtract the smaller x term from both sides first.", solution: `${linear(a - c, 0)} = ${fmt(d)} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(d - b)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-a6`, "application", ["8Ae.06"], "Solve an equation with a fractional coefficient", () => {
    const k = r(2, 6), m = r(1, 5), b = r(1, 9);
    const kind = pick(["x/k+b", "mx/k", "(x+b)/k"] as const);
    if (kind === "x/k+b") { const x = k * r(1, 9), c = x / k + b; return { prompt: `Solve x/${k} + ${b} = ${c}.`, answers: [String(x), `x=${x}`], hint: `Subtract ${b}, then multiply both sides by ${k}.`, solution: `x/${k} = ${c - b}, so x = ${c - b} × ${k} = ${x}.` }; }
    if (kind === "mx/k") { const x = k * r(1, 9), c = (m * x) / k; if (m === k) return { prompt: `Solve ${m + 1}x/${k} = ${((m + 1) * x) / k}.`, answers: [String(x), `x=${x}`], hint: `Multiply both sides by ${k}, then divide by ${m + 1}.`, solution: `${m + 1}x = ${((m + 1) * x)}, so x = ${x}.` }; return { prompt: `Solve ${m === 1 ? "" : m}x/${k} = ${fmt(c)}.`, answers: [String(x), `x=${x}`], hint: `Multiply both sides by ${k}, then divide by ${m}.`, solution: `${m === 1 ? "x" : `${m}x`} = ${fmt(c * k)}, so x = ${x}.` }; }
    const c = r(2, 9), x = k * c - b;
    return { prompt: `Solve (x + ${b})/${k} = ${c}.`, answers: [ans(x), `x=${ans(x)}`], hint: `Multiply both sides by ${k} first.`, solution: `x + ${b} = ${k * c}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-a7`, "application", ["8Ae.03"], "Factorise with an algebraic common factor", () => {
    const h = r(1, 6); const [p, q] = coprime(1, 7);
    const outside = h === 1 ? "x" : `${h}x`;
    return { prompt: `Factorise fully ${poly([h * p, h * q, 0])}.`, answers: factorForms(outside, linear(p, q)), hint: "Both terms share a number and a factor of x; take both outside.", solution: `The highest common factor is ${outside}, so ${poly([h * p, h * q, 0])} = ${outside}(${linear(p, q)}).`, answerFormat: "Enter the fully factorised expression, for example 3x(2x + 3)." };
  }),
  T(`${U}-a8`, "application", ["8Ae.05"], "Use a formula in context", () => {
    const [who, unit, letter] = pick([["A bike hire company", "hours", "h"], ["A plumber", "hours", "h"], ["A taxi firm", "kilometres", "k"], ["A printing shop", "pages", "p"]]);
    const k = r(3, 25), m = r(10, 60), n = r(2, 12);
    return { prompt: `${who} charges C rand for ${letter} ${unit}, where C = ${k}${letter} + ${m}. Find C when ${letter} = ${n}.`, answers: [String(k * n + m)], hint: `Substitute ${letter} = ${n} into the formula.`, solution: `C = ${k} × ${n} + ${m} = ${k * n} + ${m} = ${k * n + m}.` };
  }),
  T(`${U}-a9`, "application", ["8Ae.07"], "Turn words into an interval", () => {
    const i = interval();
    const low = i.lower === "<" ? `greater than ${fmt(i.lo)}` : `at least ${fmt(i.lo)}`;
    const high = i.upper === "<" ? `less than ${fmt(i.hi)}` : `at most ${fmt(i.hi)}`;
    return { prompt: `x is an integer ${low} and ${high}. List the possible values of x.`, answers: [listAnswer(i.values)], hint: "\"At least\" and \"at most\" include the end value; \"greater than\" and \"less than\" do not.", solution: `This is ${i.text}, so x can be ${listText(i.values)}.`, answerFormat: LIST_FORMAT };
  }),
  T(`${U}-a10`, "application", ["8Ae.02", "8Ae.03"], "Expand and simplify", () => {
    const a = r(2, 6), b = r(1, 5), c = rNonZero(-8, 8), d0 = r(1, 9) * pick([-1, 1]);
    // Never let the x terms cancel: "expand and simplify" should leave an x term.
    const d = a * b + d0 === 0 ? -d0 : d0;
    const result = linear(a * b + d, a * c);
    return { prompt: `Expand and simplify ${a}(${linear(b, c)}) ${d < 0 ? "−" : "+"} ${Math.abs(d) === 1 ? "" : Math.abs(d)}x.`, answers: exprForms(result), hint: "Expand the bracket first, then collect the x terms.", solution: `${a}(${linear(b, c)}) = ${linear(a * b, a * c)}; then ${linear(a * b, 0)} ${d < 0 ? "−" : "+"} ${linear(Math.abs(d), 0)} = ${linear(a * b + d, 0)}, giving ${result}.`, answerFormat: EXPR_FORMAT };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Ae.06"], "Solve with brackets and unknowns on both sides", () => {
    const x = rNonZero(-4, 10), a = r(2, 6), b = rNonZero(-6, 6), c = pick([...Array(8)].map((_, i) => i + 1).filter((v) => v !== a));
    const d = a * (x + b) - c * x;
    return { prompt: `Solve ${a}(${linear(1, b)}) = ${linear(c, d)}.`, answers: [ans(x), `x=${ans(x)}`], hint: "Expand the bracket, then collect the x terms on one side.", solution: `${linear(a, a * b)} = ${linear(c, d)}, so ${linear(a - c, 0)} = ${fmt(d - a * b)} and x = ${fmt(x)}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Ae.06"], "Form and solve an equation from a perimeter", () => {
    const x = r(2, 12), p = r(2, 4), q = r(1, 9);
    const perimeter = 2 * (p * x + q + x);
    return { prompt: `A rectangle has length (${linear(p, q)}) cm and width x cm. Its perimeter is ${perimeter} cm. Find x.`, answers: [String(x), `x=${x}`], hint: "Perimeter = 2 × (length + width). Write an equation and solve it.", solution: `2(${linear(p + 1, q)}) = ${perimeter}, so ${linear(2 * (p + 1), 2 * q)} = ${perimeter}, ${2 * (p + 1)}x = ${perimeter - 2 * q} and x = ${x}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Ae.05"], "Use a formula backwards", () => {
    const kind = pick(["v", "P", "A", "F"] as const);
    if (kind === "v") { const u = r(0, 15), a = r(2, 8), t = r(2, 9); return { prompt: `Using v = u + at, find t when v = ${u + a * t}, u = ${u} and a = ${a}.`, answers: [String(t)], hint: "Substitute the values you know, then solve for t.", solution: `${u + a * t} = ${u} + ${a}t, so ${a}t = ${a * t} and t = ${t}.` }; }
    if (kind === "P") { const l = r(6, 25), w = r(2, 15); return { prompt: `Using P = 2(l + w), find w when P = ${2 * (l + w)} and l = ${l}.`, answers: [String(w)], hint: "Halve P first, then subtract l.", solution: `${2 * (l + w)} ÷ 2 = ${l + w}, so w = ${l + w} − ${l} = ${w}.` }; }
    if (kind === "A") { const b = 2 * r(2, 10), h = r(3, 15); return { prompt: `Using A = ½bh, find h when A = ${(b * h) / 2} and b = ${b}.`, answers: [String(h)], hint: "Multiply A by 2, then divide by b.", solution: `2 × ${(b * h) / 2} = ${b * h}, so h = ${b * h} ÷ ${b} = ${h}.` }; }
    const m = r(2, 20), a = r(2, 10);
    return { prompt: `Using F = ma, find a when F = ${m * a} and m = ${m}.`, answers: [String(a)], hint: "Divide F by m.", solution: `a = ${m * a} ÷ ${m} = ${a}.` };
  }),
  T(`${U}-r4`, "reasoning", ["8Ae.03"], "Correct an expansion with a negative", () => {
    const a = r(2, 9), b = r(1, 9);
    const right = poly([-a, a * b]);
    return { prompt: `A learner expands −${a}(x − ${b}) and writes −${a}x − ${a * b}. Enter the correct expansion.`, answers: exprForms(right), hint: "Multiplying −b by a negative number gives a positive result.", solution: `−${a} × x = −${a}x and −${a} × (−${b}) = +${a * b}, so ${right}.`, answerFormat: EXPR_FORMAT };
  }),
  T(`${U}-r5`, "reasoning", ["8Ae.02"], "Reason about squared terms", () => {
    const k = r(2, 9);
    if (Math.random() < 0.5) return { prompt: `Is ${k}x² the same expression as (${k}x)²? Answer yes or no.`, answers: ["no"], hint: `Expand (${k}x)² as ${k}x × ${k}x.`, solution: `No: (${k}x)² = ${k * k}x², but ${k}x² is only ${k} lots of x².` };
    const a = r(2, 9);
    return { prompt: `${a}x × kx = ${a * k}x². Find k.`, answers: [String(k)], hint: "x × x = x², so compare the numbers.", solution: `${a} × k = ${a * k}, so k = ${k}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Ae.07"], "Count the integers in an interval", () => {
    const i = interval();
    return { prompt: `How many integers satisfy ${i.text}?`, answers: [String(i.values.length)], hint: "List them, taking care over which end values are included.", solution: `They are ${listText(i.values)}: ${i.values.length} integers.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Ae.04"], "Choose where the brackets go", () => {
    const k = 2 * r(1, 9), d = pick([2, 3, 4]);
    const kk = k % d === 0 ? k : k * d;
    const expr = `(n − ${kk})/${d}`;
    const answers = [`(n-${kk})/${d}`, `(n-${kk})÷${d}`, `1/${d}(n-${kk})`, `(1/${d})(n-${kk})`, `n/${d}-${kk / d}`];
    return { prompt: `Write an expression for: subtract ${kk} from n, then divide the result by ${d}.`, answers, hint: "The subtraction happens first, so it needs brackets before dividing.", solution: `(n − ${kk}) must all be divided by ${d}, giving ${expr}, which also equals n/${d} − ${kk / d}.`, answerFormat: "Enter the expression using n, for example (n − 4)/2." };
  }),
  T(`${U}-r8`, "reasoning", ["8Ae.01"], "Reason about what a letter stands for", () => {
    const a = r(2, 9), x = r(2, 9), b = r(1, 15);
    const [text, answer, why] = pick([
      [`In the equation ${a}x + ${b} = ${a * x + b}, can x take more than one value?`, "no", `only x = ${x} makes the equation true`],
      [`In the formula A = lw, can l take more than one value?`, "yes", "l can be the length of any rectangle"],
      [`In the formula C = ${a}n + ${b}, can n take more than one value?`, "yes", "a formula works for any value of n"],
      [`In the equation ${a}(x − ${b}) = ${a * (x + b - b)}, can x take more than one value?`, "no", `only x = ${x + b} makes it true`],
      [`In the expression ${a}y + ${b}, must y have one particular value?`, "no", "an expression can be evaluated for any value of y"],
    ] as const);
    return { prompt: `${text} Answer yes or no.`, answers: [answer], hint: "An equation is solved for particular values; a formula or expression works for any value.", solution: `${answer === "yes" ? "Yes" : "No"}: ${why}.` };
  }),
  T(`${U}-r9`, "reasoning", ["8Ae.06"], "Find when two costs are equal", () => {
    const n = r(3, 25), d = r(2, 6), b = d + r(1, 5), a = r(10, 60), c = a + (b - d) * n;
    const unit = pick(["call", "visit", "lesson", "journey"]);
    return { prompt: `Plan A costs R${a} plus R${b} per ${unit}. Plan B costs R${c} plus R${d} per ${unit}. After how many ${unit}s do the two plans cost the same?`, answers: [String(n)], hint: `Write ${a} + ${b}n = ${c} + ${d}n and solve for n.`, solution: `${a} + ${b}n = ${c} + ${d}n, so ${linear(b - d, 0, "n")} = ${c - a} and n = ${n}.` };
  }),
  T(`${U}-r10`, "reasoning", ["8Ae.05"], "Rearrange a formula, then use it", () => {
    const l = r(3, 15), w = r(2, 15), b = 2 * r(2, 10), h = r(3, 12);
    if (Math.random() < 0.5) return { prompt: `Make w the subject of A = lw, then find w when A = ${l * w} and l = ${l}.`, answers: [String(w), `w=${w}`], hint: "Divide both sides by l.", solution: `w = A/l = ${l * w} ÷ ${l} = ${w}.` };
    return { prompt: `Make h the subject of A = ½bh, then find h when A = ${(b * h) / 2} and b = ${b}.`, answers: [String(h), `h=${h}`], hint: "Multiply by 2, then divide by b.", solution: `h = 2A/b = ${b * h} ÷ ${b} = ${h}.` };
  }),
];
