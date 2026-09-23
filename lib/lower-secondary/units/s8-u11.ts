// Stage 8, unit 11: Graphs (8As.04, 8As.05, 8As.06, 8As.07).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, fmt, ans, linear, exprForms, tidyNum, plural } from "../kit";

const U = "s8-u11";
const LINE_FORMAT = "Enter the equation as y = mx + c, for example y = 3x + 2.";
const line = (m: number, c: number) => `y = ${linear(m, c)}`;
/** y = mx + c in every term order, with or without "y =". */
const lineAnswers = (m: number, c: number) => exprForms(linear(m, c)).map((f) => `y=${f}`);

/** A three-part journey described in words: out, stop, back. */
function journey() {
  const out = r(1, 3), stop = pick([0.5, 1, 1.5, 2]), back = r(1, 4), dist = 10 * r(3, 12);
  return { out, stop, back, dist, text: `A distance–time graph of a journey has three straight parts. From 0 h to ${out} h the distance rises to ${dist} km. From ${out} h to ${fmt(out + stop)} h the graph is horizontal. From ${fmt(out + stop)} h to ${fmt(out + stop + back)} h it falls back to 0 km.` };
}

export const s8u11: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8As.06"], "Read the gradient of y = mx + c", () => {
    const m = rNonZero(-9, 9), c = rNonZero(-12, 12);
    return { prompt: `What is the gradient of the line ${line(m, c)}?`, answers: [ans(m)], hint: "In y = mx + c, the gradient is m, the number multiplying x.", solution: `The number multiplying x is ${fmt(m)}, so the gradient is ${fmt(m)}.` };
  }),
  T(`${U}-f2`, "foundational", ["8As.06"], "Read the y-intercept of y = mx + c", () => {
    const m = rNonZero(-9, 9), c = rNonZero(-12, 12);
    return { prompt: `The line ${line(m, c)} crosses the y-axis at (0, c). Find c.`, answers: [ans(c)], hint: "Substitute x = 0.", solution: `When x = 0, y = ${fmt(c)}, so c = ${fmt(c)}.` };
  }),
  T(`${U}-f3`, "foundational", ["8As.05"], "Complete a table of values", () => {
    const m = rNonZero(-4, 5), c = r(-6, 6), xs = [-1, 0, 1, 2, 3];
    const ys = xs.map((x) => m * x + c);
    return { prompt: `Complete the table of values for ${line(m, c)} with x = −1, 0, 1, 2 and 3. Enter the five y-values in order.`, answers: [ys.map(ans).join(",")], hint: "Substitute each x-value into the equation.", solution: `The y-values are ${ys.map(fmt).join(", ")}.`, answerFormat: "Enter the y-values in order, separated by commas." };
  }),
  T(`${U}-f4`, "foundational", ["8As.05"], "Decide whether a point is on a line", () => {
    const m = rNonZero(-5, 6), c = r(-8, 8), x = r(-4, 6), on = Math.random() < 0.5, y = on ? m * x + c : m * x + c + rNonZero(-3, 3);
    return { prompt: `Does the point (${fmt(x)}, ${fmt(y)}) lie on the line ${line(m, c)}? Answer yes or no.`, answers: [on ? "yes" : "no"], hint: `Substitute x = ${fmt(x)} and compare with the y-coordinate.`, solution: `When x = ${fmt(x)}, y = ${fmt(m * x + c)}, which ${on ? "matches, so yes" : `is not ${fmt(y)}, so no`}.` };
  }),
  T(`${U}-f5`, "foundational", ["8As.04"], "Write a linear function from words", () => {
    const m = r(2, 15), c = r(5, 60);
    const [who, per] = pick([["A taxi charges", "per kilometre"], ["A gym charges", "per visit"], ["A tutor charges", "per hour"], ["A phone plan costs", "per gigabyte"]]);
    return { prompt: `${who} R${c} plus R${m} ${per}. Write the cost y (in rand) for x units in the form y = mx + c.`, answers: lineAnswers(m, c), hint: "m is the amount for each unit; c is the fixed charge.", solution: `Each unit adds R${m} and the fixed charge is R${c}, so ${line(m, c)}.`, answerFormat: LINE_FORMAT };
  }),
  T(`${U}-f6`, "foundational", ["8As.06"], "Find a gradient from two points", () => {
    const m = rNonZero(-5, 5), x1 = r(-4, 4), dx = r(1, 5), y1 = r(-8, 8);
    const x2 = x1 + dx, y2 = y1 + m * dx;
    return { prompt: `Find the gradient of the line through (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}).`, answers: [ans(m)], hint: "Gradient = change in y ÷ change in x.", solution: `(${fmt(y2)} − ${fmt(y1)}) ÷ (${fmt(x2)} − ${fmt(x1)}) = ${fmt(y2 - y1)} ÷ ${dx} = ${fmt(m)}.` };
  }),
  T(`${U}-f7`, "foundational", ["8As.07"], "Read a stop from a travel graph", () => {
    const j = journey();
    return { prompt: `${j.text} For how many hours did the journey stop?`, answers: [ans(j.stop)], hint: "A horizontal part means the distance is not changing.", solution: `The graph is horizontal from ${j.out} h to ${fmt(j.out + j.stop)} h, a stop of ${plural(j.stop, "hour")}.` };
  }),
  T(`${U}-f8`, "foundational", ["8As.05"], "Find y for a given x", () => {
    const m = rNonZero(-6, 8), c = rNonZero(-12, 12), x = r(-5, 9);
    return { prompt: `For the line ${line(m, c)}, find y when x = ${fmt(x)}.`, answers: [ans(m * x + c)], hint: "Substitute the x-value.", solution: `y = ${fmt(m)} × ${fmt(x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(m * x + c)}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8As.04"], "Model a situation and use the model", () => {
    const m = r(3, 20), c = r(10, 80), x = r(2, 12);
    return { prompt: `Hiring a bike costs a R${c} deposit plus R${m} per hour. Write the cost y for x hours in the form y = mx + c, then find the cost of ${x} hours. Enter the cost in rand.`, answers: [String(m * x + c)], hint: "Write the model first, then substitute.", solution: `${line(m, c)}; when x = ${x}, y = ${m * x + c}.` };
  }),
  T(`${U}-a2`, "application", ["8As.07"], "Interpret where two lines intersect", () => {
    const x = r(3, 20), m1 = r(2, 6), m2 = m1 + r(1, 5), c2 = r(5, 30), c1 = c2 + (m2 - m1) * x;
    return { prompt: `Plan A costs y = ${linear(m1, c1)} and Plan B costs y = ${linear(m2, c2)} (y in rand, x in gigabytes). Their graphs intersect. At what value of x do the plans cost the same?`, answers: [String(x)], hint: "At the intersection the two costs are equal.", solution: `${linear(m1, c1)} = ${linear(m2, c2)} gives ${m2 - m1}x = ${c1 - c2}, so x = ${x}.` };
  }),
  T(`${U}-a3`, "application", ["8As.07"], "Find a speed from part of a travel graph", () => {
    const j = journey();
    return { prompt: `${j.text} What was the speed on the way out, in km/h?`, answers: [ans(j.dist / j.out)], hint: "Speed is the gradient: distance ÷ time.", solution: `${j.dist} km in ${j.out} hour${j.out === 1 ? "" : "s"} is ${fmt(j.dist / j.out)} km/h.` };
  }),
  T(`${U}-a4`, "application", ["8As.06"], "Write the equation of a parallel line", () => {
    const m = rNonZero(-6, 7), c1 = r(-9, 9), c2 = r(-9, 9) === c1 ? c1 + 1 : r(-9, 9);
    const c = c2 === c1 ? c1 + 2 : c2;
    return { prompt: `Write the equation of the line parallel to ${line(m, c1)} that passes through (0, ${fmt(c)}).`, answers: lineAnswers(m, c), hint: "Parallel lines have the same gradient; (0, c) gives the intercept.", solution: `Same gradient ${fmt(m)} and intercept ${fmt(c)}: ${line(m, c)}.`, answerFormat: LINE_FORMAT };
  }),
  T(`${U}-a5`, "application", ["8As.05", "8As.06"], "Write an equation from two plotted points", () => {
    const m = rNonZero(-5, 6), c = r(-8, 8);
    return { prompt: `A straight line is plotted through (0, ${fmt(c)}) and (1, ${fmt(m + c)}). Write its equation.`, answers: lineAnswers(m, c), hint: "(0, c) gives the intercept, and the rise from x = 0 to x = 1 gives the gradient.", solution: `Intercept ${fmt(c)} and gradient ${fmt(m + c)} − ${fmt(c)} = ${fmt(m)}, so ${line(m, c)}.`, answerFormat: LINE_FORMAT };
  }),
  T(`${U}-a6`, "application", ["8As.04"], "Interpret the parts of a linear model", () => {
    const m = r(10, 60), c = r(20, 200), part = pick(["fixed charge", "cost per hour"] as const);
    return { prompt: `The cost y (rand) of hiring a hall for x hours is y = ${m}x + ${c}. What is the ${part} in rand?`, answers: [String(part === "fixed charge" ? c : m)], hint: "The constant term is paid however long you hire; the coefficient of x is paid each hour.", solution: `The ${part} is R${part === "fixed charge" ? c : m}.` };
  }),
  T(`${U}-a7`, "application", ["8As.07"], "Choose the cheaper option beyond an intersection", () => {
    const x0 = r(5, 15), m1 = r(2, 5), m2 = m1 + r(1, 4), c2 = r(5, 30), c1 = c2 + (m2 - m1) * x0;
    const x = x0 + pick([-1, 1]) * r(2, 4);
    const cheaper = m1 * x + c1 < m2 * x + c2 ? "A" : "B";
    return { prompt: `Plan A: y = ${linear(m1, c1)}. Plan B: y = ${linear(m2, c2)}. Which plan is cheaper when x = ${x}, A or B?`, answers: [cheaper, `plan ${cheaper}`], hint: "Substitute the x-value into both, or think about which side of the intersection it is on.", solution: `A costs ${m1 * x + c1} and B costs ${m2 * x + c2}, so plan ${cheaper} is cheaper.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-a8`, "application", ["8As.06"], "Find the y-intercept from the gradient and a point", () => {
    const m = rNonZero(-5, 6), c = r(-10, 10), x = r(1, 8);
    return { prompt: `A line has gradient ${fmt(m)} and passes through (${x}, ${fmt(m * x + c)}). Find its y-intercept.`, answers: [ans(c)], hint: "Substitute into y = mx + c and solve for c.", solution: `${fmt(m * x + c)} = ${fmt(m)} × ${x} + c, so c = ${fmt(m * x + c)} − ${fmt(m * x)} = ${fmt(c)}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8As.06"], "Find a negative gradient from two points", () => {
    const m = -r(1, 5), x1 = r(-3, 3), dx = r(2, 5), y1 = r(0, 12);
    return { prompt: `Find the gradient of the line through (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x1 + dx)}, ${fmt(y1 + m * dx)}).`, answers: [ans(m)], hint: "The line goes down from left to right, so expect a negative gradient.", solution: `${fmt(m * dx)} ÷ ${dx} = ${fmt(m)}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8As.07"], "Find where two lines meet", () => {
    const x = r(-3, 6), m1 = r(1, 5), m2 = -r(1, 4), c1 = r(-6, 8), c2 = m1 * x + c1 - m2 * x;
    return { prompt: `The lines ${line(m1, c1)} and ${line(m2, c2)} intersect. Find the x-coordinate of the intersection.`, answers: [ans(x)], hint: "Set the right-hand sides equal and solve.", solution: `${linear(m1, c1)} = ${linear(m2, c2)} gives ${m1 - m2}x = ${fmt(c2 - c1)}, so x = ${fmt(x)}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8As.04"], "Use a linear model backwards", () => {
    const m = 5 * r(5, 12), c = 10 * r(3, 12), x = r(2, 9);
    return { prompt: `A plumber charges y = ${m}x + ${c} rand for x hours of work. A bill is R${m * x + c}. How many hours did the plumber work?`, answers: [String(x)], hint: "Subtract the fixed charge, then divide by the hourly rate.", solution: `${m * x + c} − ${c} = ${m * x}, and ${m * x} ÷ ${m} = ${x} hours.` };
  }),
  T(`${U}-r4`, "reasoning", ["8As.06"], "Decide whether two lines are parallel", () => {
    const m = rNonZero(-5, 6), parallel = Math.random() < 0.5, m2 = parallel ? m : m + rNonZero(-2, 2);
    const c1 = r(-8, 8), c2 = c1 + rNonZero(-6, 6);
    return { prompt: `Are the lines ${line(m, c1)} and ${line(m2, c2)} parallel? Answer yes or no.`, answers: [parallel ? "yes" : "no"], hint: "Parallel lines have equal gradients.", solution: `The gradients are ${fmt(m)} and ${fmt(m2)}, so the answer is ${parallel ? "yes" : "no"}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8As.05"], "Find a missing coordinate on a line", () => {
    const m = rNonZero(-5, 6), c = r(-9, 9), x = r(-4, 8);
    return { prompt: `The point (${fmt(x)}, k) lies on ${line(m, c)}. Find k.`, answers: [ans(m * x + c)], hint: "Substitute the x-coordinate.", solution: `k = ${fmt(m)} × ${fmt(x)} ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${fmt(m * x + c)}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8As.07"], "Find an average speed over a whole journey", () => {
    const j = journey(), total = j.out + j.stop + j.back;
    return { prompt: `${j.text} What was the average speed for the whole journey, including the stop, in km/h?`, answers: [ans(tidyNum((2 * j.dist) / total, 4))], hint: "Average speed = total distance ÷ total time.", solution: `Total distance ${2 * j.dist} km over ${fmt(total)} hours gives ${fmt(tidyNum((2 * j.dist) / total, 4))} km/h.` };
  }),
  T(`${U}-r7`, "reasoning", ["8As.06"], "Write the equation of a horizontal line", () => {
    const x = r(-6, 6), y = rNonZero(-9, 9);
    return { prompt: `A line has gradient 0 and passes through (${fmt(x)}, ${fmt(y)}). Write its equation.`, answers: [`y=${ans(y)}`], hint: "A gradient of 0 means y never changes.", solution: `Every point has y = ${fmt(y)}, so the equation is y = ${fmt(y)}.`, answerFormat: "Enter the equation, for example y = 4." };
  }),
  T(`${U}-r8`, "reasoning", ["8As.04", "8As.06"], "Compare rates from two linear models", () => {
    const a = 5 * r(8, 20), b = a + 5 * r(1, 6);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    return { prompt: `Car A's distance is y = ${x}x and car B's distance is y = ${y}x (y in km, x in hours). Which car is faster, A or B?`, answers: [x > y ? "A" : "B", `car ${x > y ? "A" : "B"}`], hint: "The gradient of a distance–time line is the speed.", solution: `The speeds are ${x} km/h and ${y} km/h, so car ${x > y ? "A" : "B"} is faster.`, answerFormat: "Enter A or B." };
  }),
];
