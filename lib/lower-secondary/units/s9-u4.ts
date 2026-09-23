// Stage 9, unit 4: Equations and inequalities (9Ae.05, 9Ae.06, 9Ae.07).
// Inequality answers are single inequalities or lists of integers: a double
// inequality such as −2 < x ≤ 3 would be marked by its numbers alone, which
// cannot tell < from ≤.
import { T, type Template } from "../engine";
import { r, rNonZero, pick, fmt, ans, br, linear, frac, fracStr } from "../kit";

const U = "s9-u4";
const PAIR = "Enter x then y, for example x = 3, y = -2.";
const INEQ = "Enter an inequality, for example x > 4 or x <= -2.";

/** A solution pair as shown and as students may type it. */
const pairAnswers = (x: number, y: number) => [`x = ${ans(x)}, y = ${ans(y)}`, `${ans(x)}, ${ans(y)}`, `(${ans(x)}, ${ans(y)})`];
const pairText = (x: number, y: number) => `x = ${fmt(x)}, y = ${fmt(y)}`;
/** "x > 4" with every way of typing it: x>=4, 4<x and so on. */
function ineqAnswers(sign: ">" | "<" | "≥" | "≤", v: number) {
  const typed = { ">": ">", "<": "<", "≥": ">=", "≤": "<=" }[sign], flip = { ">": "<", "<": ">", "≥": "≤", "≤": "≥" }[sign];
  const flipTyped = { ">": ">", "<": "<", "≥": ">=", "≤": "<=" }[flip];
  return [`x ${sign} ${ans(v)}`, `x ${typed} ${ans(v)}`, `${ans(v)} ${flip} x`, `${ans(v)} ${flipTyped} x`];
}
const flipSign = (s: ">" | "<" | "≥" | "≤") => ({ ">": "<", "<": ">", "≥": "≤", "≤": "≥" } as const)[s];
/** An equation in the form ax + by = c. */
function eq(a: number, b: number, c: number) {
  const x = a === 1 ? "x" : a === -1 ? "−x" : `${linear(a, 0)}`, yMag = Math.abs(b) === 1 ? "y" : `${Math.abs(b)}y`;
  return `${x} ${b < 0 ? "−" : "+"} ${yMag} = ${fmt(c)}`;
}

export const s9u4: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ae.05"], "Solve an equation with brackets on both sides", () => {
    for (;;) {
      // a(x + b) = c(x + d) with a whole-number solution x: choose x, then d.
      const a = r(2, 6), c = r(2, 6), b = rNonZero(-6, 6), x = rNonZero(-8, 10), need = a * (x + b) - c * x;
      if (a === c || need % c !== 0) continue;
      const d = need / c;
      if (d === 0 || Math.abs(d) > 20) continue;
      return { prompt: `Solve ${a}(${linear(1, b)}) = ${c}(${linear(1, d)}).`, answers: [ans(x)], hint: "Expand both brackets, then collect the x terms on one side.", solution: `${linear(a, a * b)} = ${linear(c, c * d)}, so ${linear(a - c, 0)} = ${fmt(c * d - a * b)} and x = ${fmt(x)}.` };
    }
  }),
  T(`${U}-f2`, "foundational", ["9Ae.05"], "Solve an equation with the unknown in the denominator", () => {
    const x = r(2, 12), m = r(2, 9), k = x * m, shifted = pick([true, false]), b = r(1, 6);
    return shifted
      ? { prompt: `Solve ${k}/(x − ${b}) = ${m}.`, answers: [String(x + b)], hint: "Multiply both sides by the denominator first.", solution: `${k} = ${m}(x − ${b}), so x − ${b} = ${k} ÷ ${m} = ${x} and x = ${x + b}.` }
      : { prompt: `Solve ${k}/x = ${m}.`, answers: [String(x)], hint: "Multiply both sides by x, then divide.", solution: `${k} = ${m}x, so x = ${k} ÷ ${m} = ${x}.` };
  }),
  T(`${U}-f3`, "foundational", ["9Ae.05"], "Solve an equation with a fraction", () => {
    const a = r(2, 9), c = rNonZero(-6, 12), b = rNonZero(-9, 9), x = a * c - b;
    return { prompt: `Solve (${linear(1, b)})/${a} = ${fmt(c)}.`, answers: [ans(x)], hint: `Multiply both sides by ${a} first.`, solution: `${linear(1, b)} = ${a} × ${br(c)} = ${fmt(a * c)}, so x = ${fmt(a * c)} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(x)}.` };
  }),
  T(`${U}-f4`, "foundational", ["9Ae.06"], "Solve simultaneous equations by elimination", () => {
    const x = rNonZero(-6, 8), y = rNonZero(-6, 8), b = r(1, 5), a1 = r(1, 5), a2 = r(1, 5), add = pick([true, false]);
    const b2 = add ? -b : b, c1 = a1 * x + b * y, c2 = a2 * x + b2 * y;
    const combined = add ? a1 + a2 : a1 - a2;
    if (combined === 0) return s9u4[3].make();
    return { prompt: `Solve the simultaneous equations ${eq(a1, b, c1)} and ${eq(a2, b2, c2)}.`, answers: pairAnswers(x, y), hint: `The y terms ${add ? "have opposite signs: add" : "are the same: subtract"} the equations to eliminate y.`, solution: `${add ? "Adding" : "Subtracting"}: ${linear(combined, 0)} = ${fmt(add ? c1 + c2 : c1 - c2)}, so x = ${fmt(x)}. Substituting: ${linear(b, 0, "y")} = ${fmt(c1)} − ${br(a1 * x)} = ${fmt(b * y)}, so y = ${fmt(y)}. ${pairText(x, y)}.`, answerFormat: PAIR };
  }),
  T(`${U}-f5`, "foundational", ["9Ae.06"], "Find where two lines cross", () => {
    const x = rNonZero(-5, 6), m1 = rNonZero(-4, 4), m2 = rNonZero(-4, 4), c1 = rNonZero(-8, 8);
    if (m1 === m2) return s9u4[4].make();
    const y = m1 * x + c1, c2 = y - m2 * x;
    return { prompt: `The graphs of y = ${linear(m1, c1)} and y = ${linear(m2, c2)} cross at one point. Find its coordinates.`, answers: [`(${ans(x)}, ${ans(y)})`, `${ans(x)}, ${ans(y)}`], hint: "Where the lines cross, both equations are true: set the right-hand sides equal.", solution: `${linear(m1, c1)} = ${linear(m2, c2)}, so ${linear(m1 - m2, 0)} = ${fmt(c2 - c1)} and x = ${fmt(x)}. Then y = ${fmt(y)}. The point is (${fmt(x)}, ${fmt(y)}).`, answerFormat: "Enter the point as (x, y)." };
  }),
  T(`${U}-f6`, "foundational", ["9Ae.07"], "Solve a linear inequality", () => {
    const a = r(2, 8), b = rNonZero(-12, 12), v = rNonZero(-6, 10), sign = pick([">", "<", "≥", "≤"] as const), c = a * v + b;
    return { prompt: `Solve ${linear(a, b)} ${sign} ${fmt(c)}.`, answers: ineqAnswers(sign, v), hint: "Solve it like an equation; the sign stays the same when you divide by a positive number.", solution: `${a}x ${sign} ${fmt(c)} ${b < 0 ? "+" : "−"} ${Math.abs(b)} = ${fmt(c - b)}, so x ${sign} ${fmt(v)}.`, answerFormat: INEQ };
  }),
  T(`${U}-f7`, "foundational", ["9Ae.07"], "List the integers that satisfy an inequality", () => {
    const lo = r(-5, 3), n = r(3, 6), hi = lo + n, a = r(2, 4), b = rNonZero(-5, 5);
    const lowStrict = pick([true, false]), highStrict = pick([true, false]);
    const first = lowStrict ? lo + 1 : lo, last = highStrict ? hi - 1 : hi, list = Array.from({ length: last - first + 1 }, (_, i) => first + i);
    const L = a * lo + b, H = a * hi + b;
    return { prompt: `List all the integers x for which ${fmt(L)} ${lowStrict ? "<" : "≤"} ${linear(a, b)} ${highStrict ? "<" : "≤"} ${fmt(H)}.`, answers: [list.map((v) => ans(v)).join(", ")], hint: `Subtract ${fmt(b)} from all three parts, then divide by ${a}.`, solution: `${fmt(L - b)} ${lowStrict ? "<" : "≤"} ${a}x ${highStrict ? "<" : "≤"} ${fmt(H - b)}, so ${fmt(lo)} ${lowStrict ? "<" : "≤"} x ${highStrict ? "<" : "≤"} ${fmt(hi)}. The integers are ${list.map((v) => fmt(v)).join(", ")}.`, answerFormat: "Enter the integers in order, separated by commas." };
  }),
  T(`${U}-f8`, "foundational", ["9Ae.05"], "Form and solve an equation from words", () => {
    const x = r(2, 20), m = r(2, 9), s = r(1, 15), minus = pick([true, false]), result = minus ? m * x - s : m * x + s;
    if (result <= 0) return s9u4[7].make();
    return { prompt: `I think of a number, multiply it by ${m} and then ${minus ? `subtract ${s}` : `add ${s}`}. The answer is ${result}. What was my number?`, answers: [String(x)], hint: `Write an equation: ${m}n ${minus ? "−" : "+"} ${s} = ${result}.`, solution: `${m}n ${minus ? "−" : "+"} ${s} = ${result}, so ${m}n = ${minus ? result + s : result - s} and n = ${x}.` };
  }),
  T(`${U}-f9`, "foundational", ["9Ae.07"], "Solve an inequality with a negative coefficient", () => {
    const a = r(2, 6), b = rNonZero(-10, 10), v = rNonZero(-6, 8), sign = pick([">", "<", "≥", "≤"] as const), c = -a * v + b, out = flipSign(sign);
    return { prompt: `Solve ${fmt(b)} − ${a}x ${sign} ${fmt(c)}.`, answers: ineqAnswers(out, v), hint: "When you divide by a negative number, reverse the inequality sign.", solution: `−${a}x ${sign} ${fmt(c)} − ${br(b)} = ${fmt(c - b)}. Dividing by −${a} reverses the sign: x ${out} ${fmt(v)}.`, answerFormat: INEQ };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ae.05"], "Solve an equation with fractions on both sides", () => {
    for (;;) {
      const p = r(2, 6), q = r(2, 6), b = rNonZero(-8, 8), d = rNonZero(-8, 8);
      if (p === q) continue;
      // x/p + b = x/q + d  =>  x(q − p) = pq(d − b)
      const num = p * q * (d - b), den = q - p;
      if (num % den !== 0 || num === 0) continue;
      const x = num / den;
      return { prompt: `Solve x/${p} ${b < 0 ? "−" : "+"} ${Math.abs(b)} = x/${q} ${d < 0 ? "−" : "+"} ${Math.abs(d)}.`, answers: [ans(x)], hint: `Multiply every term by ${p * q} to clear the fractions.`, solution: `× ${p * q}: ${q}x ${b < 0 ? "−" : "+"} ${Math.abs(p * q * b)} = ${p}x ${d < 0 ? "−" : "+"} ${Math.abs(p * q * d)}, so ${linear(q - p, 0)} = ${fmt(num)} and x = ${fmt(x)}.` };
    }
  }),
  T(`${U}-a2`, "application", ["9Ae.05"], "Solve a proportion with the unknown in the denominator", () => {
    for (;;) {
      const a = r(2, 9), b = r(2, 12), c = r(1, 12);
      if (a === b) continue;
      // a/x = b/(x + c)  =>  a(x + c) = bx  =>  x = ac/(b − a)
      const num = a * c, den = b - a;
      if (num % den !== 0) continue;
      const x = num / den;
      if (x === 0 || x + c === 0) continue;
      return { prompt: `Solve ${a}/x = ${b}/(x + ${c}).`, answers: [ans(x)], hint: "Cross-multiply: multiply both sides by x and by (x + c).", solution: `${a}(x + ${c}) = ${b}x, so ${a}x + ${a * c} = ${b}x, ${linear(b - a, 0)} = ${a * c} and x = ${fmt(x)}.` };
    }
  }),
  T(`${U}-a3`, "application", ["9Ae.06"], "Solve simultaneous equations by scaling one", () => {
    for (;;) {
      const x = rNonZero(-6, 7), y = rNonZero(-6, 7), a1 = r(1, 5), b1 = r(1, 4), k = r(2, 4), a2 = rNonZero(-5, 5), b2 = k * b1;
      if (a2 === k * a1) continue;
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y, diff = k * a1 - a2;
      return { prompt: `Solve the simultaneous equations ${eq(a1, b1, c1)} and ${eq(a2, b2, c2)}.`, answers: pairAnswers(x, y), hint: `Multiply the first equation by ${k} so the y terms match.`, solution: `× ${k}: ${eq(k * a1, b2, k * c1)}. Subtracting the second: ${linear(diff, 0)} = ${fmt(k * c1 - c2)}, so x = ${fmt(x)}. Then ${linear(b1, 0, "y")} = ${fmt(c1)} − ${br(a1 * x)}, so y = ${fmt(y)}. ${pairText(x, y)}.`, answerFormat: PAIR };
    }
  }),
  T(`${U}-a4`, "application", ["9Ae.06"], "Solve a pricing problem with simultaneous equations", () => {
    for (;;) {
      const p = r(4, 20), b = r(15, 60), [n1, m1, n2, m2] = [r(2, 5), r(2, 4), r(2, 5), r(2, 4)];
      if (n1 * m2 === n2 * m1) continue;
      const [item1, item2] = pick([["pens", "books"], ["apples", "melons"], ["pies", "cakes"]]);
      const ask = pick([item1, item2]), value = ask === item1 ? p : b;
      return { prompt: `${n1} ${item1} and ${m1} ${item2} cost R${n1 * p + m1 * b}. ${n2} ${item1} and ${m2} ${item2} cost R${n2 * p + m2 * b}. What is the cost of one ${ask.replace(/s$/, "")} in rand?`, answers: [String(value)], hint: "Write two equations with one letter for each price, then eliminate one letter.", solution: `${n1}p + ${m1}b = ${n1 * p + m1 * b} and ${n2}p + ${m2}b = ${n2 * p + m2 * b}. Solving gives p = ${p} and b = ${b}, so one ${ask.replace(/s$/, "")} costs R${value}.` };
    }
  }),
  T(`${U}-a5`, "application", ["9Ae.07"], "Form and solve an inequality in context", () => {
    const fixed = r(10, 30), rate = r(5, 12), budget = 10 * r(8, 25), most = Math.floor((budget - fixed) / rate);
    return { prompt: `A taxi charges R${fixed} plus R${rate} per kilometre. Sam has R${budget}. What is the greatest whole number of kilometres Sam can travel?`, answers: [String(most)], hint: `Write ${fixed} + ${rate}k ≤ ${budget} and solve it.`, solution: `${fixed} + ${rate}k ≤ ${budget}, so ${rate}k ≤ ${budget - fixed} and k ≤ ${fmt(Math.round(((budget - fixed) / rate) * 100) / 100)}. The greatest whole number is ${most}.` };
  }),
  T(`${U}-a6`, "application", ["9Ae.07"], "Find the smallest or largest integer solution", () => {
    const a = r(2, 7), b = rNonZero(-10, 10), c = rNonZero(-20, 30), strict = pick([true, false]), greater = pick([true, false]);
    const bound = (c - b) / a;
    const value = greater ? (strict ? Math.floor(bound) + 1 : Math.ceil(bound)) : strict ? Math.ceil(bound) - 1 : Math.floor(bound);
    const sign = greater ? (strict ? ">" : "≥") : strict ? "<" : "≤";
    return { prompt: `What is the ${greater ? "smallest" : "largest"} integer x for which ${linear(a, b)} ${sign} ${fmt(c)}?`, answers: [ans(value)], hint: "Solve the inequality, then look at the integers near the boundary.", solution: `${a}x ${sign} ${fmt(c - b)}, so x ${sign} ${fracStr(frac(c - b, a))}. The ${greater ? "smallest" : "largest"} integer is ${fmt(value)}.` };
  }),
  T(`${U}-a7`, "application", ["9Ae.05"], "Form and solve an equation from angles", () => {
    for (;;) {
      const [p, q, s] = [r(1, 4), r(1, 4), r(1, 4)], [b, c] = [rNonZero(-20, 30), rNonZero(-20, 30)], x = (180 - b - c) / (p + q + s);
      if (!Number.isInteger(x) || x <= 0) continue;
      const angles = [p * x, q * x + b, s * x + c];
      if (angles.some((v) => v <= 5)) continue;
      return { prompt: `The angles of a triangle are ${linear(p, 0)}°, (${linear(q, b)})° and (${linear(s, c)})°. Find x.`, answers: [String(x)], hint: "The angles of a triangle add up to 180°.", solution: `${linear(p + q + s, b + c)} = 180, so ${p + q + s}x = ${180 - b - c} and x = ${x}.` };
    }
  }),
  T(`${U}-a8`, "application", ["9Ae.06"], "Check a pair of values against two equations", () => {
    const x = rNonZero(-5, 6), y = rNonZero(-5, 6), [a1, b1, a2, b2] = [r(1, 5), rNonZero(-4, 4), r(1, 5), rNonZero(-4, 4)], ok = pick([true, false]);
    const [tx, ty] = ok ? [x, y] : [x, y + pick([-1, 1])];
    return { prompt: `Is x = ${fmt(tx)}, y = ${fmt(ty)} the solution of ${eq(a1, b1, a1 * x + b1 * y)} and ${eq(a2, b2, a2 * x + b2 * y)}? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Substitute into both equations: both must be true.", solution: `First: ${a1} × ${br(tx)} + ${br(b1)} × ${br(ty)} = ${fmt(a1 * tx + b1 * ty)}; second: ${a2} × ${br(tx)} + ${br(b2)} × ${br(ty)} = ${fmt(a2 * tx + b2 * ty)}. ${ok ? "Yes: both are true." : "No: at least one is false."}`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-a9`, "application", ["9Ae.05"], "Form an equation with the unknown in the denominator", () => {
    const x = r(2, 12), total = x * r(3, 20);
    const [what, per] = pick([["R" + total + " is shared equally between x friends", "rand"], [total + " sweets are shared equally between x children", "sweets"]]);
    const each = total / x;
    return { prompt: `${what}. Each gets ${each} ${per}. Write an equation and find x.`, answers: [String(x)], hint: "Each person's share is the total divided by x.", solution: `${total}/x = ${each}, so x = ${total} ÷ ${each} = ${x}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ae.06"], "Solve simultaneous equations by scaling both", () => {
    for (;;) {
      const x = rNonZero(-6, 7), y = rNonZero(-6, 7), [a1, b1, a2, b2] = [r(2, 5), r(2, 5), r(2, 5), rNonZero(-5, 5)];
      if (a1 * b2 === a2 * b1 || a1 === a2 || Math.abs(b1) === Math.abs(b2) || b2 % b1 === 0 || b1 % b2 === 0) continue;
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      return { prompt: `Solve the simultaneous equations ${eq(a1, b1, c1)} and ${eq(a2, b2, c2)}.`, answers: pairAnswers(x, y), hint: "Multiply each equation by a number so that the x (or y) terms match, then eliminate.", solution: `× ${a2} and × ${a1}: ${eq(a1 * a2, b1 * a2, c1 * a2)} and ${eq(a1 * a2, b2 * a1, c2 * a1)}. Subtracting: ${linear(b1 * a2 - b2 * a1, 0, "y")} = ${fmt(c1 * a2 - c2 * a1)}, so y = ${fmt(y)}; then x = ${fmt(x)}. ${pairText(x, y)}.`, answerFormat: PAIR };
    }
  }),
  T(`${U}-r2`, "reasoning", ["9Ae.06"], "Find where two lines in the form ax + by = c cross", () => {
    for (;;) {
      const x = rNonZero(-5, 6), y = rNonZero(-5, 6), [a1, b1, a2, b2] = [r(1, 4), r(1, 4), r(1, 4), rNonZero(-4, -1)];
      if (a1 * b2 === a2 * b1) continue;
      return { prompt: `The lines ${eq(a1, b1, a1 * x + b1 * y)} and ${eq(a2, b2, a2 * x + b2 * y)} are drawn on a graph. At what point do they cross?`, answers: [`(${ans(x)}, ${ans(y)})`, `${ans(x)}, ${ans(y)}`], hint: "The crossing point is the solution of both equations at once.", solution: `Solving the equations simultaneously gives x = ${fmt(x)} and y = ${fmt(y)}, so the lines cross at (${fmt(x)}, ${fmt(y)}).`, answerFormat: "Enter the point as (x, y)." };
    }
  }),
  T(`${U}-r3`, "reasoning", ["9Ae.07"], "Solve an inequality with the unknown on both sides", () => {
    for (;;) {
      const a = r(3, 9), c = r(1, a - 1), b = rNonZero(-10, 10), v = rNonZero(-6, 8), d = (a - c) * v + b, sign = pick([">", "<", "≥", "≤"] as const);
      if (d === 0) continue;
      return { prompt: `Solve ${linear(a, b)} ${sign} ${linear(c, d)}.`, answers: ineqAnswers(sign, v), hint: "Collect the x terms on the side with more x.", solution: `${linear(a - c, 0)} ${sign} ${fmt(d)} − ${br(b)} = ${fmt(d - b)}, so x ${sign} ${fmt(v)}.`, answerFormat: INEQ };
    }
  }),
  T(`${U}-r4`, "reasoning", ["9Ae.05"], "Solve an age problem", () => {
    const [k, m] = pick([[3, 2], [4, 3], [4, 2], [5, 3], [5, 2]] as const), t = r(2, 8);
    // kb + t = m(b + t)  =>  b = t(m − 1)/(k − m)
    const num = t * (m - 1), den = k - m;
    if (num % den !== 0) return s9u4.find((u) => u.id === `${U}-r4`)!.make();
    const b = num / den;
    const times = (n: number) => (n === 2 ? "twice" : `${n} times`);
    return { prompt: `Ana is ${times(k)} as old as Ben. In ${t} years, Ana will be ${times(m)} as old as Ben. How old is Ben now?`, answers: [String(b)], hint: "Let Ben be b years old. Write Ana's age now and in the future, then form an equation.", solution: `${k}b + ${t} = ${m}(b + ${t}), so ${k}b + ${t} = ${m}b + ${m * t}, ${linear(k - m, 0, "b")} = ${m * t - t} and b = ${b}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Ae.07"], "Count the integers that satisfy two inequalities", () => {
    const lo = r(-4, 5), hi = lo + r(3, 9), [a, b, c] = [r(2, 5), rNonZero(-6, 6), r(2, 4)];
    const n = hi - lo; // x > lo and x ≤ hi
    return { prompt: `x is an integer. ${linear(a, b)} > ${fmt(a * lo + b)} and ${c}x ≤ ${fmt(c * hi)}. How many possible values of x are there?`, answers: [String(n)], hint: "Solve each inequality, then count the integers that satisfy both.", solution: `${a}x > ${fmt(a * lo)}, so x > ${fmt(lo)}; and x ≤ ${fmt(hi)}. The integers are ${fmt(lo + 1)} to ${fmt(hi)}: ${n} values.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Ae.06"], "Solve a ticket problem with simultaneous equations", () => {
    const adult = 5 * r(8, 20), child = 5 * r(3, 7), a = r(5, 40), c = r(5, 40), ask = pick(["adult", "child"] as const);
    if (adult === child) return s9u4.find((u) => u.id === `${U}-r6`)!.make();
    return { prompt: `A show sold ${a + c} tickets for R${adult * a + child * c} in total. Adult tickets cost R${adult} and child tickets cost R${child}. How many ${ask} tickets were sold?`, answers: [String(ask === "adult" ? a : c)], hint: "Let a and c be the numbers of tickets. Write one equation for the count and one for the money.", solution: `a + c = ${a + c} and ${adult}a + ${child}c = ${adult * a + child * c}. Multiplying the first by ${child} and subtracting: ${adult - child}a = ${(adult - child) * a}, so a = ${a} and c = ${c}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9Ae.05"], "Solve a problem with the unknown in two denominators", () => {
    const d = r(2, 6), x = r(2, 12), N = 2 * d * x;
    return { prompt: `When ${N} is divided by a number, the answer is ${d} more than when ${N} is divided by twice that number. What is the number?`, answers: [String(x)], hint: `Let the number be n: ${N}/n = ${N}/(2n) + ${d}.`, solution: `${N}/n − ${N}/(2n) = ${d}, so ${N / 2}/n = ${d} and n = ${N / 2} ÷ ${d} = ${x}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Ae.07"], "Use an inequality with a perimeter", () => {
    const k = r(1, 8), P = 2 * r(15, 40), most = Math.floor((P - 2 * k) / 4);
    return { prompt: `A rectangle is (x + ${k}) cm long and x cm wide, where x is a whole number. Its perimeter is at most ${P} cm. What is the largest possible value of x?`, answers: [String(most)], hint: "Write the perimeter in terms of x and form an inequality.", solution: `2(x + ${k}) + 2x = 4x + ${2 * k} ≤ ${P}, so 4x ≤ ${P - 2 * k} and x ≤ ${fmt((P - 2 * k) / 4)}. The largest whole number is ${most}.` };
  }),
];
