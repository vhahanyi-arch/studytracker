// Stage 9, unit 13: Position and transformation (9Gp.02 to 9Gp.07).
// Enlargements use positive whole-number scale factors only: negative and
// fractional scale factors are IGCSE, not Lower Secondary.
import { T, type Template } from "../engine";
import { r, rNonZero, pick, shuffle, fmt, ans, br } from "../kit";

const U = "s9-u13";
const POINT = "Enter the coordinates as (x, y), for example (3, -2).";
const LETTER = "Enter the letter of your choice.";

const P = (x: number, y: number) => `(${fmt(x)}, ${fmt(y)})`;
const A = (x: number, y: number) => `(${ans(x)}, ${ans(y)})`;
const c = () => r(-8, 8);
const plus = (a: number, b: number) => `${fmt(a)} + ${br(b)}`;

type Map2 = { name: string; map: (x: number, y: number) => [number, number] };
const REFLECT: Map2[] = [
  { name: "reflection in the x-axis", map: (x, y) => [x, -y] },
  { name: "reflection in the y-axis", map: (x, y) => [-x, y] },
  { name: "reflection in the line y = x", map: (x, y) => [y, x] },
  { name: "reflection in the line y = −x", map: (x, y) => [-y, -x] },
];
const ROTATE: Map2[] = [
  { name: "rotation of 90° clockwise about the origin", map: (x, y) => [y, -x] },
  { name: "rotation of 90° anticlockwise about the origin", map: (x, y) => [-y, x] },
  { name: "rotation of 180° about the origin", map: (x, y) => [-x, -y] },
];
const translate = (a: number, b: number): Map2 => ({ name: `translation by the vector ${P(a, b)}`, map: (x, y) => [x + a, y + b] });
/** A point with |x| ≠ |y| and neither zero, so every transformation moves it recognisably. */
const general = (): [number, number] => { for (;;) { const x = rNonZero(-7, 7), y = rNonZero(-7, 7); if (Math.abs(x) !== Math.abs(y)) return [x, y]; } };

export const s9u13: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Gp.02"], "Find a point a fraction of the way along a segment", () => {
    const d = pick([3, 4, 5]), k = r(1, d - 1), [x1, y1] = [c(), c()], [dx, dy] = [d * rNonZero(-3, 3), d * rNonZero(-3, 3)];
    const [px, py] = [x1 + (k * dx) / d, y1 + (k * dy) / d];
    return { prompt: `A is ${P(x1, y1)} and B is ${P(x1 + dx, y1 + dy)}. Find the point that is ${k}/${d} of the way from A to B.`, answers: [A(px, py)], hint: `Find the change from A to B, take ${k}/${d} of it, and add it to A.`, solution: `A to B is ${P(dx, dy)}. ${k}/${d} of that is ${P((k * dx) / d, (k * dy) / d)}. The point is (${plus(x1, (k * dx) / d)}, ${plus(y1, (k * dy) / d)}) = ${P(px, py)}.`, answerFormat: POINT };
  }),
  T(`${U}-f2`, "foundational", ["9Gp.03"], "Reflect and then translate a point", () => {
    const [x, y] = general(), m = pick(REFLECT), t = translate(rNonZero(-5, 5), rNonZero(-5, 5)), [x1, y1] = m.map(x, y), [x2, y2] = t.map(x1, y1);
    return { prompt: `The point ${P(x, y)} is given a ${m.name}, followed by a ${t.name}. Find its final position.`, answers: [A(x2, y2)], hint: "Do the transformations one at a time, in order.", solution: `After the reflection: ${P(x1, y1)}. After the translation: ${P(x2, y2)}.`, answerFormat: POINT };
  }),
  T(`${U}-f3`, "foundational", ["9Gp.03"], "Combine two reflections", () => {
    const [x, y] = general(), [m1, m2] = shuffle(REFLECT).slice(0, 2), [x1, y1] = m1.map(x, y), [x2, y2] = m2.map(x1, y1);
    return { prompt: `The point ${P(x, y)} is given a ${m1.name}, then a ${m2.name}. Find its final position.`, answers: [A(x2, y2)], hint: "Apply the first reflection, then reflect the result.", solution: `First: ${P(x1, y1)}. Then: ${P(x2, y2)}.`, answerFormat: POINT };
  }),
  T(`${U}-f4`, "foundational", ["9Gp.04"], "Identify a transformation from its effect on coordinates", () => {
    const all = [...REFLECT, ...ROTATE], right = pick(all), [x, y] = general(), [ix, iy] = right.map(x, y);
    const options = shuffle([right, ...shuffle(all.filter((m) => m !== right)).slice(0, 2)]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `A single transformation maps ${P(x, y)} to ${P(ix, iy)}. Which is it? ${options.map((m, i) => `${"ABC"[i]}: ${m.name}`).join("; ")}.`, answers: [letter], hint: "Apply each option to the point and see which gives the image.", solution: `${letter}: a ${right.name} maps ${P(x, y)} to ${P(ix, iy)}.`, answerFormat: LETTER };
  }),
  T(`${U}-f5`, "foundational", ["9Gp.05"], "Decide whether an image is congruent", () => {
    const [t, ok] = pick([["a reflection", true], ["a rotation", true], ["a translation", true], ["an enlargement with scale factor 2", false], ["an enlargement with scale factor 3", false], ["a reflection followed by a rotation", true], ["a translation followed by an enlargement with scale factor 2", false]] as const);
    return { prompt: `A shape is transformed by ${t}. Is the image always congruent to the original shape? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Congruent means exactly the same shape and size.", solution: ok ? `Yes: ${t} does not change lengths or angles, so the image is congruent.` : `No: an enlargement changes the lengths, so the image is similar but not congruent.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-f6`, "foundational", ["9Gp.06"], "Enlarge a point from a centre", () => {
    const [cx, cy] = [r(-4, 4), r(-4, 4)], k = r(2, 3), [dx, dy] = [rNonZero(-3, 3), rNonZero(-3, 3)], [ix, iy] = [cx + k * dx, cy + k * dy];
    return { prompt: `A shape is enlarged by scale factor ${k} with centre ${P(cx, cy)}. One vertex is at ${P(cx + dx, cy + dy)}. Where is its image?`, answers: [A(ix, iy)], hint: "Multiply the vector from the centre to the vertex by the scale factor.", solution: `Centre to vertex: ${P(dx, dy)}. × ${k}: ${P(k * dx, k * dy)}. Image = (${plus(cx, k * dx)}, ${plus(cy, k * dy)}) = ${P(ix, iy)}.`, answerFormat: POINT };
  }),
  T(`${U}-f7`, "foundational", ["9Gp.07"], "Find the perimeter after an enlargement", () => {
    const [a, b] = [r(2, 12), r(2, 12)], k = r(2, 5), square = pick([true, false]), p = square ? 4 * a : 2 * (a + b);
    return { prompt: `A ${square ? `square of side ${a} cm` : `rectangle ${a} cm by ${b} cm`} is enlarged by scale factor ${k}. What is the perimeter of the image, in cm?`, answers: [String(k * p)], hint: "Lengths are multiplied by the scale factor, so the perimeter is too.", solution: `Original perimeter = ${p} cm. Image perimeter = ${k} × ${p} = ${k * p} cm.` };
  }),
  T(`${U}-f8`, "foundational", ["9Gp.07"], "Find the area after an enlargement", () => {
    const [a, b] = [r(2, 10), r(2, 10)], k = r(2, 4), square = pick([true, false]), area = square ? a * a : a * b;
    return { prompt: `A ${square ? `square of side ${a} cm` : `rectangle ${a} cm by ${b} cm`} is enlarged by scale factor ${k}. What is the area of the image, in cm²?`, answers: [String(k * k * area)], hint: `Each length is multiplied by ${k}, so the area is multiplied by ${k}².`, solution: `Original area = ${area} cm². Image area = ${k}² × ${area} = ${k * k} × ${area} = ${k * k * area} cm².` };
  }),
  T(`${U}-f9`, "foundational", ["9Gp.02"], "Find the point halfway or a third of the way", () => {
    const d = pick([2, 3]), [x1, y1] = [c(), c()], [dx, dy] = [d * rNonZero(-4, 4), d * rNonZero(-4, 4)], from = pick(["A", "B"] as const);
    const [px, py] = from === "A" ? [x1 + dx / d, y1 + dy / d] : [x1 + dx - dx / d, y1 + dy - dy / d];
    return { prompt: `A is ${P(x1, y1)} and B is ${P(x1 + dx, y1 + dy)}. Point M is 1/${d} of the way from ${from} to ${from === "A" ? "B" : "A"}. Find M.`, answers: [A(px, py)], hint: `Take 1/${d} of the change in x and in y, starting from ${from}.`, solution: `Change from ${from} to ${from === "A" ? "B" : "A"}: ${from === "A" ? P(dx, dy) : P(-dx, -dy)}. 1/${d} of it is ${from === "A" ? P(dx / d, dy / d) : P(-dx / d, -dy / d)}, so M = ${P(px, py)}.`, answerFormat: POINT };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Gp.02"], "Divide a segment in a ratio", () => {
    const [m, n] = pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4]] as const), t = m + n, [x1, y1] = [c(), c()], [dx, dy] = [t * rNonZero(-2, 2), t * rNonZero(-2, 2)];
    const [px, py] = [x1 + (m * dx) / t, y1 + (m * dy) / t];
    return { prompt: `P divides the line segment from A ${P(x1, y1)} to B ${P(x1 + dx, y1 + dy)} in the ratio AP : PB = ${m} : ${n}. Find P.`, answers: [A(px, py)], hint: `P is ${m}/${t} of the way from A to B.`, solution: `P is ${m}/${t} of the way along: ${P(x1, y1)} + ${m}/${t} × ${P(dx, dy)} = ${P(px, py)}.`, answerFormat: POINT };
  }),
  T(`${U}-a2`, "application", ["9Gp.03"], "Rotate and then reflect a point", () => {
    const [x, y] = general(), t = pick(ROTATE), m = pick(REFLECT), [x1, y1] = t.map(x, y), [x2, y2] = m.map(x1, y1);
    return { prompt: `The point ${P(x, y)} is given a ${t.name}, followed by a ${m.name}. Find its final position.`, answers: [A(x2, y2)], hint: "Do the rotation first, then the reflection.", solution: `After the rotation: ${P(x1, y1)}. After the reflection: ${P(x2, y2)}.`, answerFormat: POINT };
  }),
  T(`${U}-a3`, "application", ["9Gp.04"], "Describe a transformation of a triangle", () => {
    const tri: Array<[number, number]> = [[1, 1], [r(3, 5), 1], [1, r(3, 5)]], all = [...REFLECT, ...ROTATE, translate(rNonZero(-5, 5), rNonZero(-5, 5))], right = pick(all);
    const img = tri.map(([x, y]) => right.map(x, y)), options = shuffle([right, ...shuffle(all.filter((m) => m !== right)).slice(0, 2)]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `Triangle T has vertices ${tri.map(([x, y]) => P(x, y)).join(", ")}. Its image has vertices ${img.map(([x, y]) => P(x, y)).join(", ")} (in the same order). Describe the single transformation. ${options.map((m, i) => `${"ABC"[i]}: ${m.name}`).join("; ")}.`, answers: [letter], hint: "Check what happens to each vertex under each option.", solution: `${letter}: a ${right.name} maps every vertex to its image.`, answerFormat: LETTER };
  }),
  T(`${U}-a4`, "application", ["9Gp.06"], "Find a scale factor from an enlargement", () => {
    const k = r(2, 5), [x, y] = [rNonZero(-4, 4), rNonZero(-4, 4)], [cx, cy] = [r(-3, 3), r(-3, 3)];
    return { prompt: `An enlargement with centre ${P(cx, cy)} maps ${P(cx + x, cy + y)} to ${P(cx + k * x, cy + k * y)}. What is the scale factor?`, answers: [String(k)], hint: "Compare the distances from the centre: the image is k times as far.", solution: `From the centre, the point is ${P(x, y)} away and the image is ${P(k * x, k * y)} away: ${k} times as far, so the scale factor is ${k}.` };
  }),
  T(`${U}-a5`, "application", ["9Gp.07"], "Find the dimensions and area of an enlarged rectangle", () => {
    const [a, b, k] = [r(2, 9), r(2, 9), r(2, 4)], ask = pick(["area", "perimeter"] as const);
    const value = ask === "area" ? k * a * k * b : 2 * (k * a + k * b);
    return { prompt: `A rectangle ${a} m by ${b} m is enlarged by scale factor ${k}. Find the ${ask} of the enlarged rectangle, in ${ask === "area" ? "m²" : "m"}.`, answers: [String(value)], hint: "Find the new length and width first.", solution: `New sides: ${k * a} m and ${k * b} m. ${ask === "area" ? `Area = ${k * a} × ${k * b} = ${value} m²` : `Perimeter = 2 × (${k * a} + ${k * b}) = ${value} m`}.` };
  }),
  T(`${U}-a6`, "application", ["9Gp.07"], "Find a scale factor from areas", () => {
    const k = r(2, 6), area = r(2, 20);
    return { prompt: `A rectangle with area ${area} cm² is enlarged. The image has area ${k * k * area} cm². What is the scale factor?`, answers: [String(k)], hint: "The area is multiplied by the square of the scale factor.", solution: `${k * k * area} ÷ ${area} = ${k * k} = ${k}², so the scale factor is ${k}.` };
  }),
  T(`${U}-a7`, "application", ["9Gp.03", "9Gp.04"], "Combine two translations", () => {
    const [a, b, p, q] = [rNonZero(-6, 6), rNonZero(-6, 6), rNonZero(-6, 6), rNonZero(-6, 6)];
    return { prompt: `A shape is translated by ${P(a, b)} and then by ${P(p, q)}. What single translation vector has the same effect?`, answers: [A(a + p, b + q)], hint: "Add the vectors component by component.", solution: `(${plus(a, p)}, ${plus(b, q)}) = ${P(a + p, b + q)}.`, answerFormat: "Enter the vector as (x, y)." };
  }),
  T(`${U}-a8`, "application", ["9Gp.05"], "Know what a congruence transformation keeps", () => {
    const t = pick(["reflection", "rotation", "translation"]), keeps = pick(["the lengths of its sides", "the sizes of its angles", "its area"]);
    const changes = t === "translation" ? "its position" : pick(["its position", "the direction it faces"]);
    const options = shuffle([keeps, changes, pick(["the number of its vertices doubles", "its sides get longer"])]), letter = "ABC"[options.indexOf(keeps)];
    return { prompt: `A shape is transformed by a ${t}. Which property must stay the same? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join("; ")}.`, answers: [letter], hint: "Reflections, rotations and translations give congruent images.", solution: `${letter}: a ${t} gives a congruent image, so ${keeps} stays the same.`, answerFormat: LETTER };
  }),
  T(`${U}-a9`, "application", ["9Gp.06"], "Enlarge from a centre on the shape", () => {
    const [x0, y0] = [r(-3, 3), r(-3, 3)], k = r(2, 3), [w, h] = [r(1, 4), r(1, 4)], corner = pick(["top-right", "top-left"] as const);
    const [dx, dy] = corner === "top-right" ? [w, h] : [0, h], [ix, iy] = [x0 + k * dx, y0 + k * dy];
    return { prompt: `A rectangle has its bottom-left vertex at ${P(x0, y0)}, width ${w} and height ${h}. It is enlarged by scale factor ${k} with centre ${P(x0, y0)}, a vertex of the shape. Find the image of the ${corner} vertex.`, answers: [A(ix, iy)], hint: "The centre does not move; every other point moves k times as far from it.", solution: `The ${corner} vertex is ${P(x0 + dx, y0 + dy)}, which is ${P(dx, dy)} from the centre. × ${k}: ${P(k * dx, k * dy)}. Image: ${P(ix, iy)}.`, answerFormat: POINT };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Gp.04", "9Gp.03"], "Replace two transformations with one", () => {
    const [combo, single, wrong1, wrong2] = pick([
      ["a reflection in the x-axis followed by a reflection in the y-axis", "rotation of 180° about the origin", "reflection in the line y = x", "translation by the vector (0, 0)"],
      ["a reflection in the line y = x followed by a reflection in the line y = −x", "rotation of 180° about the origin", "reflection in the x-axis", "rotation of 90° clockwise about the origin"],
      ["a rotation of 90° clockwise about the origin followed by another 90° clockwise about the origin", "rotation of 180° about the origin", "reflection in the y-axis", "rotation of 90° anticlockwise about the origin"],
      ["a reflection in the x-axis followed by a reflection in the line y = x", "rotation of 90° anticlockwise about the origin", "rotation of 90° clockwise about the origin", "reflection in the y-axis"],
    ] as const);
    const options = shuffle([single, wrong1, wrong2]), letter = "ABC"[options.indexOf(single)];
    const [x, y] = general();
    return { prompt: `Which single transformation is equivalent to ${combo}? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join("; ")}.`, answers: [letter], hint: `Try a point such as ${P(x, y)}: apply both transformations and compare with each option.`, solution: `${letter}: ${combo} has the same effect on every point as a ${single}.`, answerFormat: LETTER };
  }),
  T(`${U}-r2`, "reasoning", ["9Gp.07"], "Work back from an enlarged perimeter", () => {
    const k = r(2, 5), [a, b] = [r(2, 10), r(2, 10)], p = 2 * (a + b);
    return { prompt: `A rectangle is enlarged by scale factor ${k}. The image has a perimeter of ${k * p} cm. What was the perimeter of the original rectangle, in cm?`, answers: [String(p)], hint: "The perimeter is multiplied by the scale factor.", solution: `${k * p} ÷ ${k} = ${p} cm.` };
  }),
  T(`${U}-r3`, "reasoning", ["9Gp.02"], "Find an end point from a point along a segment", () => {
    const d = pick([3, 4]), [x1, y1] = [c(), c()], [sx, sy] = [rNonZero(-3, 3), rNonZero(-3, 3)], [px, py] = [x1 + sx, y1 + sy], [bx, by] = [x1 + d * sx, y1 + d * sy];
    return { prompt: `A is ${P(x1, y1)}. The point ${P(px, py)} is 1/${d} of the way from A to B. Find B.`, answers: [A(bx, by)], hint: `The step from A to the point is 1/${d} of the whole journey from A to B.`, solution: `A to the point is ${P(sx, sy)}, so A to B is ${d} × ${P(sx, sy)} = ${P(d * sx, d * sy)}. B = ${P(bx, by)}.`, answerFormat: POINT };
  }),
  T(`${U}-r4`, "reasoning", ["9Gp.03"], "Test whether the order of transformations matters", () => {
    const [x, y] = general(), m = pick(REFLECT), [a, b] = [rNonZero(-4, 4), rNonZero(-4, 4)], t = translate(a, b);
    const first = t.map(...m.map(x, y)), second = m.map(...t.map(x, y)), same = first[0] === second[0] && first[1] === second[1];
    return { prompt: `The point ${P(x, y)} is given a ${m.name} then a ${t.name}. Would doing the translation first give the same final point? Answer yes or no.`, answers: [same ? "yes" : "no"], hint: "Work out both orders and compare.", solution: `Reflection then translation: ${P(...first)}. Translation then reflection: ${P(...second)}. ${same ? "Yes: they are the same." : "No: the order matters here."}`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r5`, "reasoning", ["9Gp.06"], "Find the centre of an enlargement", () => {
    const [cx, cy] = [r(-4, 4), r(-4, 4)], k = r(2, 3), [dx, dy] = [rNonZero(-3, 3), rNonZero(-3, 3)], [px, py] = [cx + dx, cy + dy], [ix, iy] = [cx + k * dx, cy + k * dy];
    return { prompt: `An enlargement with scale factor ${k} maps ${P(px, py)} to ${P(ix, iy)}. Find the centre of enlargement.`, answers: [A(cx, cy)], hint: `The point-to-image step is ${k === 2 ? "the same as" : `${k - 1} times`} the centre-to-point step.`, solution: `Point to image: ${P(ix - px, iy - py)} = ${k - 1} × ${P(dx, dy)}. So the centre is ${P(px, py)} − ${P(dx, dy)} = ${P(cx, cy)}.`, answerFormat: POINT };
  }),
  T(`${U}-r6`, "reasoning", ["9Gp.07"], "Compare areas after an enlargement", () => {
    const k = r(2, 6), s = r(2, 10);
    return { prompt: `A square of side ${s} cm is enlarged by scale factor ${k}. How many times larger is the area of the image than the area of the original?`, answers: [String(k * k)], hint: "Try it: work out both areas, or think about how each length changes.", solution: `Original area ${s * s} cm²; image side ${k * s} cm, area ${k * k * s * s} cm². ${k * k * s * s} ÷ ${s * s} = ${k * k}, which is ${k}².` };
  }),
  T(`${U}-r7`, "reasoning", ["9Gp.04"], "Find the translation that maps a shape back", () => {
    const [a, b] = [rNonZero(-6, 6), rNonZero(-6, 6)], [x, y] = [c(), c()];
    return { prompt: `A translation maps ${P(x, y)} to ${P(x + a, y + b)}. What translation vector maps the image back to the original?`, answers: [A(-a, -b)], hint: "The inverse translation undoes the move.", solution: `The translation is ${P(a, b)}, so the inverse is ${P(-a, -b)}.`, answerFormat: "Enter the vector as (x, y)." };
  }),
  T(`${U}-r8`, "reasoning", ["9Gp.03"], "Rotate about a centre that is not the origin, then reflect", () => {
    const [cx, cy] = [r(-3, 3), r(-3, 3)], [dx, dy] = general(), turn = pick(ROTATE), m = pick(REFLECT.slice(0, 2));
    const [rx, ry] = turn.map(dx, dy), [x1, y1] = [cx + rx, cy + ry], [x2, y2] = m.map(x1, y1);
    const turnName = turn.name.replace(" about the origin", ` about ${P(cx, cy)}`);
    return { prompt: `The point ${P(cx + dx, cy + dy)} is given a ${turnName}, followed by a ${m.name}. Find its final position.`, answers: [A(x2, y2)], hint: "For the rotation, work with the vector from the centre to the point.", solution: `From the centre the point is ${P(dx, dy)}; rotated it is ${P(rx, ry)}, giving ${P(x1, y1)}. After the reflection: ${P(x2, y2)}.`, answerFormat: POINT };
  }),
];
