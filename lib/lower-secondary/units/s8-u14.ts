// Stage 8, unit 14: Position and transformation (8Gp.02 to 8Gp.06).
// Combinations of transformations, and the effect of enlargement on perimeter
// and area, are Stage 9 (9Gp.03, 9Gp.07), so every question here uses one.
import { T, type Template } from "../engine";
import { r, rNonZero, pick, fmt, ans, br } from "../kit";

const U = "s8-u14";
const POINT = "Enter the coordinates as (x, y), for example (3, -2).";
const VECTOR = "Enter the vector as (x, y), for example (3, -2).";
const VECTOR_HINT = "In a vector (p, q), p is the move right (left if negative) and q is the move up (down if negative).";

/** A point as shown to students, with true minus signs. */
const P = (x: number, y: number) => `(${fmt(x)}, ${fmt(y)})`;
/** A point as an accepted answer, as students type it. */
const A = (x: number, y: number) => `(${ans(x)}, ${ans(y)})`;
const c = () => r(-8, 8);
const plus = (a: number, b: number) => `${fmt(a)} + ${br(b)}`;
const minus = (a: number, b: number) => `${fmt(a)} − ${br(b)}`;

type Turn = { name: string; rule: string; map: (x: number, y: number) => [number, number] };
const TURNS: Turn[] = [
  { name: "90° clockwise", rule: "(x, y) → (y, −x)", map: (x, y) => [y, -x] },
  { name: "90° anticlockwise", rule: "(x, y) → (−y, x)", map: (x, y) => [-y, x] },
  { name: "180°", rule: "(x, y) → (−x, −y)", map: (x, y) => [-x, -y] },
];

type Mirror = { name: string; answers: string[]; map: (x: number, y: number) => [number, number] };
function mirror(): Mirror {
  const k = rNonZero(-5, 5);
  return pick<Mirror>([
    { name: "the x-axis", answers: ["y = 0", "x-axis", "the x-axis"], map: (x, y) => [x, -y] },
    { name: "the y-axis", answers: ["x = 0", "y-axis", "the y-axis"], map: (x, y) => [-x, y] },
    { name: "the line y = x", answers: ["y = x"], map: (x, y) => [y, x] },
    { name: "the line y = −x", answers: ["y = -x"], map: (x, y) => [-y, -x] },
    { name: `the line x = ${fmt(k)}`, answers: [`x = ${ans(k)}`], map: (x, y) => [2 * k - x, y] },
    { name: `the line y = ${fmt(k)}`, answers: [`y = ${ans(k)}`], map: (x, y) => [x, 2 * k - y] },
  ]);
}

/** Every way a student might describe a rotation about a known centre. */
function turnAnswers(t: Turn) {
  if (t.name === "180°") return ["180°", "180", "180 clockwise", "180 anticlockwise", "half turn"];
  const [deg, dir] = t.name.split(" ");
  return [t.name, `${deg.replace("°", "")} ${dir}`, `${deg.replace("°", "")} degrees ${dir}`, `${dir} ${deg}`, `${dir} ${deg.replace("°", "")}`];
}

export const s8u14: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Gp.02"], "Find the midpoint of a line segment", () => {
    const [x1, y1, x2, y2] = [c(), c(), c(), c()];
    if (x1 === x2 && y1 === y2) return s8u14[0].make();
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    return { prompt: `Find the midpoint of the line segment from ${P(x1, y1)} to ${P(x2, y2)}.`, answers: [A(mx, my)], hint: "Add the x-coordinates and halve; then do the same for the y-coordinates.", solution: `x: (${plus(x1, x2)}) ÷ 2 = ${fmt(mx)}; y: (${plus(y1, y2)}) ÷ 2 = ${fmt(my)}. The midpoint is ${P(mx, my)}.`, answerFormat: POINT };
  }),
  T(`${U}-f2`, "foundational", ["8Gp.03"], "Translate a point by a vector", () => {
    const [x, y, a, b] = [c(), c(), rNonZero(-6, 6), rNonZero(-6, 6)];
    return { prompt: `The point ${P(x, y)} is translated by the vector ${P(a, b)}. Find the coordinates of its image.`, answers: [A(x + a, y + b)], hint: VECTOR_HINT, solution: `Add the vector: (${plus(x, a)}, ${plus(y, b)}) = ${P(x + a, y + b)}.`, answerFormat: POINT };
  }),
  T(`${U}-f3`, "foundational", ["8Gp.04"], "Reflect a point in an axis", () => {
    const [x, y] = [rNonZero(-8, 8), rNonZero(-8, 8)], inX = pick([true, false]);
    const [ix, iy] = inX ? [x, -y] : [-x, y];
    return { prompt: `Reflect the point ${P(x, y)} in the ${inX ? "x" : "y"}-axis.`, answers: [A(ix, iy)], hint: inX ? "Reflecting in the x-axis keeps x the same and changes the sign of y." : "Reflecting in the y-axis keeps y the same and changes the sign of x.", solution: `The ${inX ? "y" : "x"}-coordinate changes sign: ${P(x, y)} → ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-f4`, "foundational", ["8Gp.04"], "Reflect a point in y = x or y = −x", () => {
    let [x, y] = [rNonZero(-8, 8), rNonZero(-8, 8)];
    if (Math.abs(x) === Math.abs(y)) y += y > 0 ? 1 : -1;
    const plusLine = pick([true, false]);
    const [ix, iy] = plusLine ? [y, x] : [-y, -x];
    return { prompt: `Reflect the point ${P(x, y)} in the line y = ${plusLine ? "" : "−"}x.`, answers: [A(ix, iy)], hint: plusLine ? "Reflecting in y = x swaps the coordinates." : "Reflecting in y = −x swaps the coordinates and changes both signs.", solution: plusLine ? `Swap the coordinates: ${P(x, y)} → ${P(ix, iy)}.` : `Swap the coordinates and change both signs: ${P(x, y)} → ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-f5`, "foundational", ["8Gp.05"], "Rotate a point about the origin", () => {
    const [x, y] = [rNonZero(-7, 7), rNonZero(-7, 7)], t = pick(TURNS), [ix, iy] = t.map(x, y);
    return { prompt: `Rotate the point ${P(x, y)} ${t.name} about the origin.`, answers: [A(ix, iy)], hint: "Sketch it, or use the rule for this rotation about the origin.", solution: `A ${t.name} rotation about the origin maps ${t.rule}, so ${P(x, y)} → ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-f6`, "foundational", ["8Gp.06"], "Find a length after an enlargement", () => {
    const k = r(2, 5), side = r(2, 12) + pick([0, 0, 0.5]);
    const shape = pick(["triangle", "rectangle", "trapezium", "kite"]);
    return { prompt: `A ${shape} is enlarged by scale factor ${k}. One of its sides is ${fmt(side)} cm long. How long is the matching side of the image, in cm?`, answers: [ans(k * side)], hint: "Every length is multiplied by the scale factor.", solution: `${fmt(side)} × ${k} = ${fmt(k * side)} cm.` };
  }),
  T(`${U}-f7`, "foundational", ["8Gp.06"], "Enlarge a point from the origin", () => {
    const [x, y] = [rNonZero(-5, 5), rNonZero(-5, 5)], k = r(2, 4);
    return { prompt: `The point ${P(x, y)} is enlarged by scale factor ${k} with centre the origin. Find its image.`, answers: [A(k * x, k * y)], hint: "From the origin, the image is the scale factor times as far in each direction.", solution: `Multiply both coordinates by ${k}: ${P(k * x, k * y)}.`, answerFormat: POINT };
  }),
  T(`${U}-f8`, "foundational", ["8Gp.03"], "Find a translation vector", () => {
    const [x, y, a, b] = [c(), c(), rNonZero(-6, 6), rNonZero(-6, 6)];
    return { prompt: `A translation maps ${P(x, y)} to ${P(x + a, y + b)}. What is the translation vector?`, answers: [A(a, b)], hint: VECTOR_HINT, solution: `Subtract: (${minus(x + a, x)}, ${minus(y + b, y)}) = ${P(a, b)}.`, answerFormat: VECTOR };
  }),
  T(`${U}-f9`, "foundational", ["8Gp.04"], "Reflect a point in a line parallel to an axis", () => {
    const k = rNonZero(-4, 4), vertical = pick([true, false]);
    let [x, y] = [c(), c()];
    if (vertical && x === k) x += 2;
    if (!vertical && y === k) y += 2;
    const [ix, iy] = vertical ? [2 * k - x, y] : [x, 2 * k - y];
    const d = vertical ? x - k : y - k;
    return { prompt: `Reflect the point ${P(x, y)} in the line ${vertical ? "x" : "y"} = ${fmt(k)}.`, answers: [A(ix, iy)], hint: `The image is the same distance from the mirror line, on the other side; only the ${vertical ? "x" : "y"}-coordinate changes.`, solution: `The point is ${fmt(Math.abs(d))} ${Math.abs(d) === 1 ? "unit" : "units"} ${vertical ? (d > 0 ? "right of" : "left of") : d > 0 ? "above" : "below"} the line, so the image is ${fmt(Math.abs(d))} ${Math.abs(d) === 1 ? "unit" : "units"} ${vertical ? (d > 0 ? "left of" : "right of") : d > 0 ? "below" : "above"} it: ${P(ix, iy)}.`, answerFormat: POINT };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Gp.02"], "Find an end point from the midpoint", () => {
    const [x1, y1, mx, my] = [c(), c(), c(), c()];
    if (x1 === mx && y1 === my) return s8u14.find((t) => t.id === `${U}-a1`)!.make();
    const [x2, y2] = [2 * mx - x1, 2 * my - y1];
    return { prompt: `M ${P(mx, my)} is the midpoint of AB. A is ${P(x1, y1)}. Find the coordinates of B.`, answers: [A(x2, y2)], hint: "B is as far beyond M as M is beyond A.", solution: `From A to M is (${minus(mx, x1)}, ${minus(my, y1)}) = ${P(mx - x1, my - y1)}. Add that to M: B = (${plus(mx, mx - x1)}, ${plus(my, my - y1)}) = ${P(x2, y2)}.`, answerFormat: POINT };
  }),
  T(`${U}-a2`, "application", ["8Gp.03"], "Reverse a translation", () => {
    const [x, y, a, b] = [c(), c(), rNonZero(-6, 6), rNonZero(-6, 6)];
    return { prompt: `A point is translated by the vector ${P(a, b)}. Its image is ${P(x + a, y + b)}. Where was the point before the translation?`, answers: [A(x, y)], hint: "Undo the translation: subtract the vector.", solution: `(${minus(x + a, a)}, ${minus(y + b, b)}) = ${P(x, y)}.`, answerFormat: POINT };
  }),
  T(`${U}-a3`, "application", ["8Gp.04"], "Identify the mirror line", () => {
    const m = mirror();
    const pts: Array<[number, number]> = [];
    while (pts.length < 2) {
      const [x, y] = [rNonZero(-6, 6), rNonZero(-6, 6)], [ix, iy] = m.map(x, y);
      if ((ix !== x || iy !== y) && !pts.some(([px, py]) => px === x && py === y) && Math.abs(x) !== Math.abs(y)) pts.push([x, y]);
    }
    const pairs = pts.map(([x, y]) => `${P(x, y)} maps to ${P(...m.map(x, y))}`).join(" and ");
    return { prompt: `Under a reflection, ${pairs}. What is the equation of the mirror line?`, answers: m.answers, hint: "The mirror line is halfway between each point and its image, at right angles to the line joining them.", solution: `Each point and its image are the same distance either side of ${m.name}, so the mirror line is ${m.answers[0].replace("-", "−")}.`, answerFormat: "Enter the equation of the line, for example x = 2 or y = -x." };
  }),
  T(`${U}-a4`, "application", ["8Gp.05"], "Rotate a point about a centre that is not the origin", () => {
    const [cx, cy] = [r(-4, 4), r(-4, 4)], t = pick(TURNS);
    let [dx, dy] = [rNonZero(-4, 4), rNonZero(-4, 4)];
    if (dx === dy) dy = -dy;
    const [ex, ey] = t.map(dx, dy), [ix, iy] = [cx + ex, cy + ey];
    return { prompt: `Rotate the point ${P(cx + dx, cy + dy)} ${t.name} about the centre ${P(cx, cy)}.`, answers: [A(ix, iy)], hint: "Find how far the point is from the centre, rotate that, then add it back on to the centre.", solution: `From the centre the point is ${P(dx, dy)}. Rotating ${t.name} gives ${P(ex, ey)} (${t.rule}). Add to the centre: (${plus(cx, ex)}, ${plus(cy, ey)}) = ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-a5`, "application", ["8Gp.05"], "Describe a rotation about the origin", () => {
    let [x, y] = [rNonZero(-7, 7), rNonZero(-7, 7)];
    if (Math.abs(x) === Math.abs(y)) y += y > 0 ? 1 : -1;
    const t = pick(TURNS), [ix, iy] = t.map(x, y);
    return { prompt: `A rotation about the origin maps ${P(x, y)} to ${P(ix, iy)}. Give the angle and direction of the rotation.`, answers: turnAnswers(t), hint: "Sketch both points and the origin, then compare with the rules for 90° and 180° turns.", solution: `${P(x, y)} → ${P(ix, iy)} follows ${t.rule}, which is a rotation of ${t.name}${t.name === "180°" ? " (either direction)" : ""}.`, answerFormat: "Enter the angle and direction, for example 90° clockwise." };
  }),
  T(`${U}-a6`, "application", ["8Gp.06"], "Enlarge a point from a centre", () => {
    const [cx, cy] = [r(-3, 3), r(-3, 3)], k = r(2, 3), [dx, dy] = [rNonZero(-3, 3), rNonZero(-3, 3)];
    const [ix, iy] = [cx + k * dx, cy + k * dy];
    return { prompt: `The point ${P(cx + dx, cy + dy)} is enlarged by scale factor ${k} with centre ${P(cx, cy)}. Find its image.`, answers: [A(ix, iy)], hint: "Find the vector from the centre to the point, multiply it by the scale factor, then add it to the centre.", solution: `From the centre the point is ${P(dx, dy)}. Times ${k}: ${P(k * dx, k * dy)}. Add to the centre: (${plus(cx, k * dx)}, ${plus(cy, k * dy)}) = ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-a7`, "application", ["8Gp.06"], "Use a scale factor found from lengths", () => {
    const a = r(2, 7), b = a + r(1, 6), k = r(2, 5);
    const shorter = pick([true, false]);
    return { prompt: `A rectangle ${a} cm by ${b} cm is enlarged. The ${shorter ? "shorter" : "longer"} side of the image is ${k * (shorter ? a : b)} cm. How long is the ${shorter ? "longer" : "shorter"} side of the image, in cm?`, answers: [String(k * (shorter ? b : a))], hint: "Find the scale factor from the pair of matching sides first.", solution: `Scale factor = ${k * (shorter ? a : b)} ÷ ${shorter ? a : b} = ${k}, so the other side is ${shorter ? b : a} × ${k} = ${k * (shorter ? b : a)} cm.` };
  }),
  T(`${U}-a8`, "application", ["8Gp.03"], "Use congruence after a translation", () => {
    const [p, q] = [r(3, 12), r(3, 12)], ang = r(30, 120), [a, b] = [rNonZero(-6, 6), rNonZero(-6, 6)];
    const ask = pick(["side", "angle"] as const);
    return ask === "side"
      ? { prompt: `Triangle ABC has AB = ${p} cm and BC = ${q} cm. It is translated by the vector ${P(a, b)} to triangle A′B′C′. How long is A′B′, in cm?`, answers: [String(p)], hint: "A translation slides a shape without turning or resizing it.", solution: `A translation gives a congruent image, so A′B′ = AB = ${p} cm.` }
      : { prompt: `Triangle ABC has angle ABC = ${ang}°. It is translated by the vector ${P(a, b)} to triangle A′B′C′. What is angle A′B′C′?`, answers: [String(ang)], hint: "A translation slides a shape without turning or resizing it.", solution: `A translation gives a congruent image, so angle A′B′C′ = ${ang}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
  }),
  T(`${U}-a9`, "application", ["8Gp.02"], "Find where the diagonals of a parallelogram cross", () => {
    const [ax, ay] = [r(-6, 2), r(-6, 2)], [ux, uy, vx, vy] = [r(2, 7), r(-2, 2), r(-2, 3), r(2, 7)];
    const [cx, cy] = [ax + ux + vx, ay + uy + vy];
    const [mx, my] = [(ax + cx) / 2, (ay + cy) / 2];
    return { prompt: `ABCD is a parallelogram with A at ${P(ax, ay)} and C at ${P(cx, cy)}. The diagonals of a parallelogram bisect each other. Where do the diagonals cross?`, answers: [A(mx, my)], hint: "The crossing point is the midpoint of AC.", solution: `It is the midpoint of AC: ((${plus(ax, cx)}) ÷ 2, (${plus(ay, cy)}) ÷ 2) = ${P(mx, my)}.`, answerFormat: POINT };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Gp.06"], "Find the centre of an enlargement", () => {
    const [cx, cy] = [r(-4, 4), r(-4, 4)], k = r(2, 3), [dx, dy] = [rNonZero(-3, 3), rNonZero(-3, 3)];
    const [px, py] = [cx + dx, cy + dy], [ix, iy] = [cx + k * dx, cy + k * dy];
    return { prompt: `An enlargement with scale factor ${k} maps P ${P(px, py)} to P′ ${P(ix, iy)}. Find the centre of enlargement.`, answers: [A(cx, cy)], hint: `The image is ${k} times as far from the centre as P is, in the same direction, so PP′ is ${k === 2 ? "as long as" : `${k - 1} times`} the distance from the centre to P.`, solution: `From P to P′ is ${P(ix - px, iy - py)}, which is ${k - 1} × the vector from the centre to P, so that vector is ${P(dx, dy)}. The centre is P minus it: (${minus(px, dx)}, ${minus(py, dy)}) = ${P(cx, cy)}.`, answerFormat: POINT };
  }),
  T(`${U}-r2`, "reasoning", ["8Gp.05", "8Gp.02"], "Find the centre of a half-turn", () => {
    const [cx, cy] = [r(-5, 5) + pick([0, 0.5]), r(-5, 5)], [dx, dy] = [rNonZero(-4, 4), rNonZero(-4, 4)];
    const [px, py, ix, iy] = [cx + dx, cy + dy, cx - dx, cy - dy];
    return { prompt: `A rotation of 180° maps ${P(px, py)} to ${P(ix, iy)}. Find the centre of rotation.`, answers: [A(cx, cy)], hint: "In a half-turn, the centre is exactly halfway between a point and its image.", solution: `The centre is the midpoint: ((${plus(px, ix)}) ÷ 2, (${plus(py, iy)}) ÷ 2) = ${P(cx, cy)}.`, answerFormat: POINT };
  }),
  T(`${U}-r3`, "reasoning", ["8Gp.04"], "Find a mirror line from a point and its image", () => {
    const vertical = pick([true, false]), k = r(-5, 5) + pick([0, 0.5]), d = rNonZero(-5, 5), other = c();
    const [x1, x2] = [k - d, k + d];
    const [p, q] = vertical ? [P(x1, other), P(x2, other)] : [P(other, x1), P(other, x2)];
    const v = vertical ? "x" : "y";
    return { prompt: `A reflection maps ${p} to ${q}. What is the equation of the mirror line?`, answers: [`${v} = ${ans(k)}`], hint: `Only the ${v}-coordinate changes, so the mirror line is ${v} = a number, halfway between.`, solution: `Halfway between ${fmt(x1)} and ${fmt(x2)} is (${plus(x1, x2)}) ÷ 2 = ${fmt(k)}, so the mirror line is ${v} = ${fmt(k)}.`, answerFormat: "Enter the equation of the line, for example x = 2." };
  }),
  T(`${U}-r4`, "reasoning", ["8Gp.03"], "Apply a translation found from one point to another", () => {
    const [x, y, a, b, u, w] = [c(), c(), rNonZero(-6, 6), rNonZero(-6, 6), c(), c()];
    if (u === x && w === y) return s8u14.find((t) => t.id === `${U}-r4`)!.make();
    return { prompt: `A translation maps A ${P(x, y)} to A′ ${P(x + a, y + b)}. The same translation maps B ${P(u, w)} to B′. Find the coordinates of B′.`, answers: [A(u + a, w + b)], hint: "Every point moves by the same vector in a translation.", solution: `The vector is (${minus(x + a, x)}, ${minus(y + b, y)}) = ${P(a, b)}. B′ = (${plus(u, a)}, ${plus(w, b)}) = ${P(u + a, w + b)}.`, answerFormat: POINT };
  }),
  T(`${U}-r5`, "reasoning", ["8Gp.06"], "Find and use a scale factor from the origin", () => {
    const k = r(2, 4), [x, y] = [rNonZero(-4, 4), rNonZero(-4, 4)], [u, w] = [rNonZero(-4, 4), rNonZero(-4, 4)];
    if (u === x && w === y) return s8u14.find((t) => t.id === `${U}-r5`)!.make();
    return { prompt: `An enlargement with centre the origin maps ${P(x, y)} to ${P(k * x, k * y)}. Where does it map ${P(u, w)}?`, answers: [A(k * u, k * w)], hint: "Find the scale factor first by comparing the coordinates.", solution: `${fmt(k * x)} ÷ ${br(x)} = ${k}, so the scale factor is ${k}. ${P(u, w)} → ${P(k * u, k * w)}.`, answerFormat: POINT };
  }),
  T(`${U}-r6`, "reasoning", ["8Gp.02"], "Find unknown coordinates from a midpoint", () => {
    const [x2, y1, mx, my] = [c(), c(), c(), c()];
    // (a, y1) and (x2, b) have midpoint (mx, my), so a = 2mx − x2 and b = 2my − y1.
    const [p, q] = [2 * mx - x2, 2 * my - y1];
    return { prompt: `The midpoint of (p, ${fmt(y1)}) and (${fmt(x2)}, q) is ${P(mx, my)}. Find p and q.`, answers: [`${ans(p)}, ${ans(q)}`, `p = ${ans(p)}, q = ${ans(q)}`], hint: "Write an equation for each coordinate: the midpoint is the mean of the end points.", solution: `(p + ${br(x2)}) ÷ 2 = ${fmt(mx)}, so p = ${fmt(2 * mx)} − ${br(x2)} = ${fmt(p)}. (${fmt(y1)} + q) ÷ 2 = ${fmt(my)}, so q = ${fmt(2 * my)} − ${br(y1)} = ${fmt(q)}. So (p, q) = (${fmt(p)}, ${fmt(q)}).`, answerFormat: "Enter p then q, separated by a comma, for example 3, -5." };
  }),
  T(`${U}-r7`, "reasoning", ["8Gp.05"], "Undo a rotation about the origin", () => {
    let [x, y] = [rNonZero(-7, 7), rNonZero(-7, 7)];
    if (Math.abs(x) === Math.abs(y)) y += y > 0 ? 1 : -1;
    const t = pick(TURNS.slice(0, 2)), [ix, iy] = t.map(x, y);
    const back = TURNS.find((u) => u.name === (t.name.includes("anti") ? "90° clockwise" : "90° anticlockwise"))!;
    return { prompt: `A rotation of ${t.name} about the origin maps P to ${P(ix, iy)}. Find P.`, answers: [A(x, y)], hint: "Undo the rotation by turning the image back the other way.", solution: `Rotate ${P(ix, iy)} back ${back.name}: ${back.rule} gives P = ${P(x, y)}.`, answerFormat: POINT };
  }),
  T(`${U}-r8`, "reasoning", ["8Gp.03"], "Decide whether a single translation fits", () => {
    const [x, y, u, w, a, b] = [c(), c(), c(), c(), rNonZero(-5, 5), rNonZero(-5, 5)], ok = pick([true, false]);
    const [e, f] = ok ? [a, b] : pick([[a + rNonZero(-2, 2), b], [a, b + rNonZero(-2, 2)], [-a, -b]]);
    if (u === x && w === y) return s8u14.find((t) => t.id === `${U}-r8`)!.make();
    return { prompt: `Can one translation map ${P(x, y)} to ${P(x + a, y + b)} and also map ${P(u, w)} to ${P(u + e, w + f)}? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "A translation moves every point by the same vector.", solution: ok ? `Yes: both points move by ${P(a, b)}.` : `No: the first point moves by ${P(a, b)} but the second moves by ${P(e, f)}, and a translation moves every point by the same vector.`, answerFormat: "Enter yes or no." };
  }),
];
