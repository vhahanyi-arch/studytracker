// Stage 9, unit 10: Graphs (9As.04, 9As.05, 9As.06).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, shuffle, fmt, ans, br, linear, poly, frac, fracStr, terminates, gcd, type Frac } from "../kit";

const U = "s9-u10";
const LINE = "Enter the equation as y = mx + c, for example y = 3x - 2. Fractions like 1/2x are fine.";
const GRAD = "Enter the gradient as a whole number or fraction, for example -3/4.";

/** Every way a student may write a gradient: -3/4, -0.75. */
function gradAnswers(m: Frac) {
  const out = [fracStr(m).replace("−", "-")];
  if (terminates(m)) out.push(ans(m.n / m.d));
  return out;
}
/** A straight line y = mx + c in the forms students may type, with a fractional m allowed. */
function lineAnswers(m: Frac, c: number) {
  const sign = m.n < 0 ? "-" : "", a = Math.abs(m.n), cs = c === 0 ? "" : c < 0 ? `-${-c}` : `+${c}`;
  const heads = m.d === 1 ? [`${sign}${a === 1 ? "" : a}x`] : [`${sign}${a}/${m.d}x`, `${sign}${a === 1 ? "" : a}x/${m.d}`, `${sign}(${a}/${m.d})x`, ...(terminates(m) ? [`${sign}${ans(a / m.d)}x`] : [])];
  const tails = c === 0 ? [""] : [cs];
  const forms = heads.flatMap((h) => tails.flatMap((t) => [`${h}${t}`, t ? `${t.replace(/^\+/, "")}${h.startsWith("-") ? h : `+${h}`}` : h]));
  return [...new Set(forms.flatMap((f) => [`y=${f}`, f]))].sort((p, q) => Number(q.startsWith("y=")) - Number(p.startsWith("y=")));
}
const showLine = (m: Frac, c: number) => `y = ${linear(m, c)}`;

export const s9u10: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9As.06"], "Read the gradient and intercept of a line", () => {
    const m = frac(rNonZero(-5, 5), pick([1, 2, 3, 4])), c = r(-9, 9), ask = pick(["gradient", "y-intercept"] as const);
    return ask === "gradient"
      ? { prompt: `What is the gradient of the line ${showLine(m, c)}?`, answers: gradAnswers(m), hint: "In y = mx + c, m is the gradient.", solution: `The number multiplying x is ${fracStr(m)}, so the gradient is ${fracStr(m)}.`, answerFormat: GRAD }
      : { prompt: `Where does the line ${showLine(m, c)} cross the y-axis? Give the y-coordinate.`, answers: [ans(c)], hint: "In y = mx + c, c is the y-intercept.", solution: `When x = 0, y = ${fmt(c)}, so it crosses the y-axis at (0, ${fmt(c)}).` };
  }),
  T(`${U}-f2`, "foundational", ["9As.06"], "Find the gradient between two points", () => {
    const [x1, y1] = [r(-6, 4), r(-6, 6)], dx = rNonZero(-6, 6), dy = rNonZero(-8, 8), m = frac(dy, dx);
    return { prompt: `Find the gradient of the line through (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x1 + dx)}, ${fmt(y1 + dy)}).`, answers: gradAnswers(m), hint: "Gradient = change in y ÷ change in x.", solution: `(${fmt(y1 + dy)} − ${br(y1)}) ÷ (${fmt(x1 + dx)} − ${br(x1)}) = ${fmt(dy)} ÷ ${fmt(dx)} = ${fracStr(m)}.`, answerFormat: GRAD };
  }),
  T(`${U}-f3`, "foundational", ["9As.05"], "Complete a table for a quadratic function", () => {
    const a = pick([1, 1, 2, -1]), c = r(-6, 6), x = rNonZero(-4, 4), y = a * x * x + c;
    return { prompt: `Complete the table of values for y = ${poly([a, 0, c])}: find y when x = ${fmt(x)}.`, answers: [ans(y)], hint: "Square x first (a negative squared is positive).", solution: `y = ${a === 1 ? "" : a === -1 ? "−" : `${a} × `}${br(x)}²${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${fmt(y)}.` };
  }),
  T(`${U}-f4`, "foundational", ["9As.05"], "Find where a line ax + by = c crosses an axis", () => {
    const [a, b] = [r(1, 6), r(1, 6)], c = a * b * pick([1, 2, 3]);
    const axis = pick(["x", "y"] as const), v = axis === "x" ? c / a : c / b;
    return { prompt: `Where does the line ${a === 1 ? "" : a}x + ${b === 1 ? "" : b}y = ${c} cross the ${axis}-axis? Give the ${axis}-coordinate.`, answers: [ans(v)], hint: `On the ${axis}-axis, ${axis === "x" ? "y" : "x"} = 0.`, solution: `Put ${axis === "x" ? "y" : "x"} = 0: ${axis === "x" ? `${a === 1 ? "" : a}x` : `${b === 1 ? "" : b}y`} = ${c}, so ${axis} = ${fmt(v)}.` };
  }),
  T(`${U}-f5`, "foundational", ["9As.04"], "Write a linear function from words", () => {
    const fixed = 10 * r(3, 30), rate = 10 * r(5, 40);
    const [who, per, units] = pick([["A plumber charges", "per hour", "hours"], ["A hall costs", "per hour to hire", "hours"], ["A taxi charges", "per kilometre", "kilometres"]]);
    return { prompt: `${who} R${fixed} plus R${rate} ${per}. Write an equation for the total cost y (in rand) for x ${units}.`, answers: lineAnswers(frac(rate), fixed), hint: "The fixed charge is the constant; the rate multiplies x.", solution: `Each unit adds R${rate} and there is a fixed R${fixed}, so y = ${rate}x + ${fixed}.`, answerFormat: LINE };
  }),
  T(`${U}-f6`, "foundational", ["9As.06"], "Write the equation of a line from its gradient and intercept", () => {
    const m = frac(rNonZero(-5, 5), pick([1, 2, 3, 4])), c = rNonZero(-9, 9);
    return { prompt: `A straight line has gradient ${fracStr(m)} and crosses the y-axis at (0, ${fmt(c)}). Write its equation.`, answers: lineAnswers(m, c), hint: "Use y = mx + c.", solution: `m = ${fracStr(m)} and c = ${fmt(c)}, so ${showLine(m, c)}.`, answerFormat: LINE };
  }),
  T(`${U}-f7`, "foundational", ["9As.05"], "Check whether a point is on a line", () => {
    const [a, b] = [rNonZero(-5, 6), rNonZero(-5, 6)], [x, y] = [r(-5, 6), r(-5, 6)], ok = pick([true, false]), c = a * x + b * y + (ok ? 0 : pick([-2, -1, 1, 2]));
    const lhs = `${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y`;
    return { prompt: `Does the point (${fmt(x)}, ${fmt(y)}) lie on the line ${lhs} = ${fmt(c)}? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Substitute the coordinates into the left-hand side.", solution: `${fmt(a)} × ${br(x)} + ${br(b)} × ${br(y)} = ${fmt(a * x + b * y)}. ${ok ? "Yes: that equals" : "No: that is not"} ${fmt(c)}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-f8`, "foundational", ["9As.05", "9As.06"], "Find the gradient of a line given as ax + by = c", () => {
    const [a, b] = [rNonZero(-6, 6), r(1, 6)], c = r(1, 20), m = frac(-a, b);
    return { prompt: `Find the gradient of the line ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x + ${b === 1 ? "" : b}y = ${c}.`, answers: gradAnswers(m), hint: "Rearrange into the form y = mx + c.", solution: `${b === 1 ? "" : b}y = ${linear(-a, c)}, so y = ${linear(m, frac(c, b))} and the gradient is ${fracStr(m)}.`, answerFormat: GRAD };
  }),
  T(`${U}-f9`, "foundational", ["9As.05"], "Evaluate a quadratic with a linear term", () => {
    const b = rNonZero(-6, 6), c = r(-5, 5), x = rNonZero(-4, 5), y = x * x + b * x + c;
    return { prompt: `For y = ${poly([1, b, c])}, find y when x = ${fmt(x)}.`, answers: [ans(y)], hint: "Substitute carefully, using brackets for negative numbers.", solution: `${br(x)}² ${b < 0 ? "−" : "+"} ${Math.abs(b)} × ${br(x)}${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${x * x} ${b * x < 0 ? "−" : "+"} ${Math.abs(b * x)}${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${fmt(y)}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9As.06"], "Find the equation of a line through two points", () => {
    const m = rNonZero(-5, 5), c = r(-8, 8), [x1, x2] = [r(-4, 1), r(2, 6)];
    return { prompt: `Find the equation of the straight line through (${fmt(x1)}, ${fmt(m * x1 + c)}) and (${fmt(x2)}, ${fmt(m * x2 + c)}).`, answers: lineAnswers(frac(m), c), hint: "Find the gradient, then substitute one point into y = mx + c to find c.", solution: `Gradient = ${fmt(m * (x2 - x1))} ÷ ${x2 - x1} = ${fmt(m)}. Using (${fmt(x2)}, ${fmt(m * x2 + c)}): ${fmt(m * x2 + c)} = ${fmt(m)} × ${br(x2)} + c, so c = ${fmt(c)}. The line is ${showLine(frac(m), c)}.`, answerFormat: LINE };
  }),
  T(`${U}-a2`, "application", ["9As.06"], "Find a parallel line through a point", () => {
    const m = rNonZero(-5, 5), c1 = r(-8, 8), c2 = rNonZero(-8, 8), x = r(-4, 5), y = m * x + c2;
    if (c1 === c2) return s9u10.find((t) => t.id === `${U}-a2`)!.make();
    return { prompt: `Find the equation of the line parallel to y = ${linear(m, c1)} that passes through (${fmt(x)}, ${fmt(y)}).`, answers: lineAnswers(frac(m), c2), hint: "Parallel lines have the same gradient.", solution: `The gradient is ${fmt(m)}. ${fmt(y)} = ${fmt(m)} × ${br(x)} + c gives c = ${fmt(c2)}, so ${showLine(frac(m), c2)}.`, answerFormat: LINE };
  }),
  T(`${U}-a3`, "application", ["9As.05"], "Find where a quadratic graph crosses the x-axis", () => {
    const k = r(1, 10);
    return { prompt: `Where does the graph of y = x² − ${k * k} cross the x-axis? Give both x-values.`, answers: [`-${k}, ${k}`, `${k}, -${k}`, `±${k}`], hint: "On the x-axis y = 0, so solve x² = " + k * k + ".", solution: `x² = ${k * k}, so x = −${k}, ${k}.`, answerFormat: "Enter both values separated by a comma, for example -3, 3." };
  }),
  T(`${U}-a4`, "application", ["9As.04"], "Use an equation of the form ax + by = c", () => {
    const [a, b] = [r(2, 9), r(2, 9)], [x, y] = [r(2, 10), r(2, 10)], total = a * x + b * y;
    const [item1, item2] = pick([["pens", "pencils"], ["apples", "pears"], ["stamps", "envelopes"]]);
    return { prompt: `${item1[0].toUpperCase() + item1.slice(1)} cost R${a} each and ${item2} cost R${b} each. Sam spends exactly R${total}, so ${a}x + ${b}y = ${total}, where x is the number of ${item1} and y the number of ${item2}. If Sam buys ${x} ${item1}, how many ${item2} does Sam buy?`, answers: [String(y)], hint: "Substitute the value of x and solve for y.", solution: `${a} × ${x} + ${b}y = ${total}, so ${b}y = ${total - a * x} and y = ${y}.` };
  }),
  T(`${U}-a5`, "application", ["9As.06"], "Find a gradient from the intercepts", () => {
    const c = rNonZero(-9, 9), k = rNonZero(-8, 8), m = frac(-c, k);
    return { prompt: `A straight line crosses the y-axis at (0, ${fmt(c)}) and the x-axis at (${fmt(k)}, 0). Find its gradient.`, answers: gradAnswers(m), hint: "Use the two intercepts as two points on the line.", solution: `Gradient = (0 − ${br(c)}) ÷ (${fmt(k)} − 0) = ${fracStr(m)}.`, answerFormat: GRAD };
  }),
  T(`${U}-a6`, "application", ["9As.05"], "Complete a table for y = ax² + c", () => {
    const a = pick([2, 3, -2]), c = r(-9, 9), x = rNonZero(-3, 3), y = a * x * x + c;
    return { prompt: `For y = ${poly([a, 0, c])}, find y when x = ${fmt(x)}.`, answers: [ans(y)], hint: "Square x, then multiply by the number in front, then add.", solution: `y = ${fmt(a)} × ${br(x)}²${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${fmt(a)} × ${x * x}${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${fmt(y)}.` };
  }),
  T(`${U}-a7`, "application", ["9As.06"], "Choose the steepest line", () => {
    const ms = shuffle([frac(1, 2), frac(r(3, 5)), frac(-2), frac(-1, 3)]).slice(0, 3), steep = ms.reduce((p, q) => (Math.abs(q.n / q.d) > Math.abs(p.n / p.d) ? q : p));
    const cs = ms.map(() => r(-5, 5)), letter = "ABC"[ms.indexOf(steep)];
    return { prompt: `Which line is the steepest? ${ms.map((m, i) => `${"ABC"[i]}: ${showLine(m, cs[i])}`).join(", ")}.`, answers: [letter], hint: "Steepness depends on the size of the gradient, ignoring its sign.", solution: `${letter}: its gradient ${fracStr(steep)} has the largest size.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a8`, "application", ["9As.04", "9As.06"], "Interpret a gradient and intercept in context", () => {
    const fixed = 10 * r(2, 10), rate = r(5, 30), ask = pick(["gradient", "intercept"] as const);
    const right = ask === "gradient" ? "the cost for each extra hour" : "the fixed charge before any hours", wrong = shuffle(["the total cost for one hour", "the number of hours", ask === "gradient" ? "the fixed charge before any hours" : "the cost for each extra hour"]).slice(0, 2);
    const options = shuffle([right, ...wrong]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `The cost of hiring a boat is y = ${rate}x + ${fixed}, where x is the number of hours. What does the ${ask === "gradient" ? `gradient, ${rate},` : `intercept, ${fixed},`} represent? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(". ")}.`, answers: [letter], hint: "The gradient is the rate of change; the intercept is the value when x = 0.", solution: `${letter}: ${ask === "gradient" ? `each hour adds R${rate}` : `when x = 0 the cost is R${fixed}`}, so it is ${right}.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a9`, "application", ["9As.05"], "Find the intercepts of an implicit line", () => {
    const [a, b] = [rNonZero(-6, 6), rNonZero(-6, 6)], L = Math.abs(a * b) * pick([1, 2]), axis = pick(["x", "y"] as const);
    const v = axis === "x" ? L / a : L / b;
    return { prompt: `Where does the line ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x ${b < 0 ? "−" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y = ${L} cross the ${axis}-axis? Give the coordinates.`, answers: axis === "x" ? [`(${ans(v)}, 0)`, `${ans(v)}, 0`] : [`(0, ${ans(v)})`, `0, ${ans(v)}`], hint: `On the ${axis}-axis, the other coordinate is 0.`, solution: `Put ${axis === "x" ? "y" : "x"} = 0: ${linear(axis === "x" ? a : b, 0, axis)} = ${L}, so ${axis} = ${fmt(v)}. The point is ${axis === "x" ? `(${fmt(v)}, 0)` : `(0, ${fmt(v)})`}.`, answerFormat: "Enter the point as (x, y)." };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9As.06"], "Use a line with a fractional gradient", () => {
    const q = pick([2, 3, 4]), p = rNonZero(-3, 3), c = r(-6, 6), x1 = q * r(-2, 0), x2 = x1 + q * r(1, 3), m = frac(p, q), k = q * r(2, 5);
    const y = (xx: number) => (p * xx) / q + c;
    return { prompt: `A straight line passes through (${fmt(x1)}, ${fmt(y(x1))}) and (${fmt(x2)}, ${fmt(y(x2))}). Find y on this line when x = ${k}.`, answers: [ans(y(k))], hint: "Find the gradient and the equation first.", solution: `Gradient = ${fmt(y(x2) - y(x1))} ÷ ${x2 - x1} = ${fracStr(m)}, and the line is ${showLine(m, c)}. When x = ${k}, y = ${fmt(y(k))}.` };
  }),
  T(`${U}-r2`, "reasoning", ["9As.05"], "Find where a quadratic meets a horizontal line", () => {
    const x = r(2, 9), c = rNonZero(-5, 10), k = x * x - c;
    return { prompt: `The graph of y = x² ${c < 0 ? "+" : "−"} ${Math.abs(c)} meets the line y = ${fmt(k)} at two points. Find the positive x-coordinate.`, answers: [String(x)], hint: "Set x² − c equal to the height of the line and solve.", solution: `x² = ${fmt(k)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${x * x}, so x = ${x} (or −${x}).` };
  }),
  T(`${U}-r3`, "reasoning", ["9As.06"], "Decide whether two lines are parallel", () => {
    const m = rNonZero(-5, 5), k = r(2, 4), ok = pick([true, false]), m2 = ok ? m : m + pick([-1, 1]), c1 = r(-6, 6), c2 = r(-6, 6);
    return { prompt: `Are the lines ${k}y = ${linear(k * m2, k * c2)} and y = ${linear(m, c1)} parallel? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Rearrange the first into y = mx + c and compare gradients.", solution: `The first line is y = ${linear(m2, c2)}, with gradient ${fmt(m2)}; the second has gradient ${fmt(m)}. ${ok ? "Yes: equal gradients, so parallel." : "No: the gradients differ."}`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r4`, "reasoning", ["9As.04"], "Find a linear rule from two data points", () => {
    const rate = r(3, 12), fixed = 5 * r(4, 20), [d1, d2] = [r(2, 6), r(8, 15)];
    const ask = pick(["fixed", "rate"] as const);
    return { prompt: `A taxi fare is a fixed charge plus an amount per kilometre. A ${d1} km trip costs R${fixed + rate * d1} and a ${d2} km trip costs R${fixed + rate * d2}. What is the ${ask === "fixed" ? "fixed charge" : "charge per kilometre"}, in rand?`, answers: [String(ask === "fixed" ? fixed : rate)], hint: "The extra kilometres explain the extra cost.", solution: `${d2 - d1} extra km cost R${rate * (d2 - d1)}, so R${rate} per km. Fixed charge = ${fixed + rate * d1} − ${rate} × ${d1} = R${fixed}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9As.05"], "Check whether a point is on a quadratic graph", () => {
    const c = r(-6, 6), x = rNonZero(-4, 4), ok = pick([true, false]), y = x * x + c + (ok ? 0 : pick([-2, 2]));
    return { prompt: `Does the point (${fmt(x)}, ${fmt(y)}) lie on the graph of y = ${poly([1, 0, c])}? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Substitute x and compare with the y-coordinate.", solution: `${br(x)}²${c ? ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}` : ""} = ${fmt(x * x + c)}. ${ok ? "Yes: it matches." : `No: the y-coordinate is ${fmt(y)}.`}`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r6`, "reasoning", ["9As.06"], "Find an unknown gradient", () => {
    const k = rNonZero(-5, 5), c = r(-6, 6), x = rNonZero(-4, 5);
    return { prompt: `The line y = kx ${c < 0 ? "−" : "+"} ${Math.abs(c)} passes through (${fmt(x)}, ${fmt(k * x + c)}). Find k.`, answers: [ans(k)], hint: "Substitute the point and solve for k.", solution: `${fmt(k * x + c)} = ${linear(x, c, "k")}, so ${linear(x, 0, "k")} = ${fmt(k * x)} and k = ${fmt(k)}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9As.05"], "Find the line of symmetry of a quadratic graph", () => {
    const a = rNonZero(-5, 5), b = r(-6, 6);
    return { prompt: `The graph of y = (x ${a < 0 ? "+" : "−"} ${Math.abs(a)})² ${b < 0 ? "−" : "+"} ${Math.abs(b)} is symmetrical about a vertical line x = k. Find k.`, answers: [ans(a)], hint: "The lowest point is where the bracket equals zero.", solution: `The bracket is zero when x = ${fmt(a)}, which gives the lowest point, so the line of symmetry is x = ${fmt(a)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9As.06"], "Find a fractional gradient from ax + by = c", () => {
    for (;;) {
      const [a, b] = [rNonZero(-7, 7), r(2, 8)], c = r(1, 30);
      if (gcd(Math.abs(a), b) !== 1) continue;
      const m = frac(-a, b);
      return { prompt: `Rearrange ${a === 1 ? "" : a === -1 ? "−" : fmt(a)}x + ${b}y = ${c} into the form y = mx + c. What is the gradient?`, answers: gradAnswers(m), hint: "Subtract the x term, then divide everything by the number in front of y.", solution: `${b}y = ${linear(-a, c)}, so y = ${linear(m, frac(c, b))}. The gradient is ${fracStr(m)}.`, answerFormat: GRAD };
    }
  }),
];

