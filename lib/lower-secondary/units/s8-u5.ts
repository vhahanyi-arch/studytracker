// Stage 8, unit 5: Angles and constructions (8Gg.10, 8Gg.11, 8Gg.12, 8Gp.01).
import { T, type Template } from "../engine";
import { r, pick, linear, fmt, ans, tidyNum } from "../kit";

const U = "s8-u5";
const DEG = "Enter the size in degrees. The ° sign is optional.";
const BEARING = "Enter exactly three digits, for example 047.";
const YES_NO = "Enter yes or no.";

/** A three-figure bearing: 47 -> "047", 405 -> "045". */
const bearing = (d: number) => String(((d % 360) + 360) % 360).padStart(3, "0");
/** The smaller angle between two directions given as bearings. */
const between = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
/** An angle that is clearly not a right angle, so a described diagram is not ambiguous. */
const slant = () => { for (;;) { const a = r(25, 155); if (Math.abs(a - 90) > 5) return a; } };

// Where an angle sits where a transversal crosses one of two parallel lines.
// At each crossing the angles above-right and below-left are vertically
// opposite, and so are above-left and below-right; the two sizes add to 180°.
type Pos = "above-right" | "above-left" | "below-right" | "below-left";
const POSITIONS: Pos[] = ["above-right", "above-left", "below-right", "below-left"];
const place = (p: Pos, line: "first" | "second") => `${p.startsWith("above") ? "above" : "below"} the ${line} line and to the ${p.endsWith("right") ? "right" : "left"} of the transversal`;
const opposite = (p: Pos): Pos => ({ "above-right": "below-left", "below-left": "above-right", "above-left": "below-right", "below-right": "above-left" } as const)[p];
const sameSize = (p: Pos, q: Pos) => p === q || opposite(p) === q;
const PARALLEL = "Two parallel lines are crossed by a transversal. The first line is above the second.";

const COMPASS: Array<[string, number]> = [["north", 0], ["north-east", 45], ["east", 90], ["south-east", 135], ["south", 180], ["south-west", 225], ["west", 270], ["north-west", 315]];

export const s8u5: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Gg.11"], "Use vertically opposite angles", () => {
    const a = slant(), next = pick([true, false]);
    return next
      ? { prompt: `Two straight lines cross, making four angles. One of them is ${a}°. Find the size of an angle next to it.`, answers: [String(180 - a)], hint: "Angles next to each other here lie on a straight line.", solution: `Angles on a straight line add to 180°, so the angle is 180° − ${a}° = ${180 - a}°.`, answerFormat: DEG }
      : { prompt: `Two straight lines cross, making four angles. One of them is ${a}°. Find the angle vertically opposite it.`, answers: [String(a)], hint: "Vertically opposite angles are equal.", solution: `Vertically opposite angles are equal, so it is ${a}°.`, answerFormat: DEG };
  }),
  T(`${U}-f2`, "foundational", ["8Gg.11"], "Name a pair of angles", () => {
    const kind = pick(["corresponding", "alternate", "vertically opposite"] as const);
    let p: string, q: string;
    if (kind === "corresponding") { const s = pick(POSITIONS); p = place(s, "first"); q = place(s, "second"); }
    else if (kind === "alternate") { const right = pick([true, false]); p = place(right ? "below-right" : "below-left", "first"); q = place(right ? "above-left" : "above-right", "second"); }
    else { const s = pick(POSITIONS), line = pick(["first", "second"] as const); p = place(s, line); q = place(opposite(s), line); }
    const why = kind === "corresponding" ? "They are in the same position at each crossing" : kind === "alternate" ? "They are between the parallel lines, on opposite sides of the transversal" : "They are opposite each other where two lines cross";
    return { prompt: `${PARALLEL} Angle p is ${p}. Angle q is ${q}. Are p and q alternate, corresponding or vertically opposite angles?`, answers: [kind], hint: "Picture the crossings: is each angle between the parallel lines or outside them, and on which side of the transversal?", solution: `${why}, so they are ${kind} angles.`, answerFormat: "Enter alternate, corresponding or vertically opposite." };
  }),
  T(`${U}-f3`, "foundational", ["8Gg.11"], "Use alternate and corresponding angles", () => {
    const a = slant(), kind = pick(["alternate", "corresponding"] as const);
    return { prompt: `${PARALLEL} One of the angles between the parallel lines is ${a}°. What is the size of the angle ${kind} to it?`, answers: [String(a)], hint: `${kind === "alternate" ? "Alternate" : "Corresponding"} angles on parallel lines are equal.`, solution: `${kind === "alternate" ? "Alternate" : "Corresponding"} angles are equal, so it is ${a}°.`, answerFormat: DEG };
  }),
  T(`${U}-f4`, "foundational", ["8Gg.10"], "Find an exterior angle of a triangle", () => {
    const a = r(25, 85), b = r(25, 85);
    return { prompt: `In triangle ABC, angle A = ${a}° and angle B = ${b}°. Side BC is extended beyond C. Find the exterior angle at C.`, answers: [String(a + b)], hint: "An exterior angle of a triangle equals the sum of the two interior angles opposite it.", solution: `The exterior angle at C equals angle A + angle B = ${a}° + ${b}° = ${a + b}°.`, answerFormat: DEG };
  }),
  T(`${U}-f5`, "foundational", ["8Gp.01"], "Write a compass direction as a bearing", () => {
    const [name, deg] = pick(COMPASS);
    return { prompt: `Write the direction ${name} as a three-figure bearing.`, answers: [bearing(deg)], hint: "Bearings are measured clockwise from north, using three digits.", solution: `${name[0].toUpperCase() + name.slice(1)} is ${deg}° clockwise from north, written ${bearing(deg)}°.`, answerFormat: BEARING };
  }),
  T(`${U}-f6`, "foundational", ["8Gp.01"], "Write a turn from north as a bearing", () => {
    const clockwise = pick([true, false]), a = clockwise ? r(5, 350) : r(5, 175);
    const b = clockwise ? a : 360 - a;
    return { prompt: `A direction is ${a}° ${clockwise ? "clockwise" : "anticlockwise"} from north. Write it as a three-figure bearing.`, answers: [bearing(b)], hint: "Bearings are always measured clockwise from north.", solution: clockwise ? `It is already measured clockwise from north: ${bearing(b)}°.` : `${a}° anticlockwise is 360° − ${a}° = ${b}° clockwise, so the bearing is ${bearing(b)}°.`, answerFormat: BEARING };
  }),
  T(`${U}-f7`, "foundational", ["8Gg.12"], "Use the perpendicular bisector", () => {
    const L = r(40, 160) / 10;
    const ask = pick(["half", "equal", "angle"] as const);
    if (ask === "half") return { prompt: `The perpendicular bisector of line segment AB crosses AB at M. AB = ${L} cm. How long is AM, in cm?`, answers: [String(L / 2)], hint: "A bisector cuts the segment into two equal halves.", solution: `M is the midpoint of AB, so AM = ${L} ÷ 2 = ${L / 2} cm.` };
    if (ask === "equal") return { prompt: `Point P lies on the perpendicular bisector of line segment AB. PA = ${L} cm. How long is PB, in cm?`, answers: [String(L)], hint: "Every point on the perpendicular bisector is the same distance from A and B.", solution: `Points on the perpendicular bisector are equidistant from A and B, so PB = PA = ${L} cm.` };
    return { prompt: `The perpendicular bisector of a line segment ${L} cm long is constructed. What angle does it make with the segment?`, answers: ["90"], hint: "Think about what perpendicular means.", solution: `Perpendicular means at right angles, so the angle is 90°, whatever the length of the segment.`, answerFormat: DEG };
  }),
  T(`${U}-f8`, "foundational", ["8Gg.12"], "Use an angle bisector", () => {
    const a = 2 * r(12, 85);
    return { prompt: `An angle of ${a}° is bisected using a ruler and compasses. What is the size of each of the two angles formed?`, answers: [String(a / 2)], hint: "Bisect means cut into two equal parts.", solution: `${a}° ÷ 2 = ${a / 2}°.`, answerFormat: DEG };
  }),
  T(`${U}-f9`, "foundational", ["review"], "Use angles on a line, at a point and in a triangle", () => {
    const kind = pick(["line", "point", "triangle"] as const);
    if (kind === "line") { const a = r(20, 80), b = r(20, 80); return { prompt: `Three angles on a straight line are ${a}°, ${b}° and x°. Find x.`, answers: [String(180 - a - b)], hint: "Angles on a straight line add to 180°.", solution: `x = 180 − ${a} − ${b} = ${180 - a - b}°.`, answerFormat: DEG }; }
    if (kind === "point") { const a = r(60, 140), b = r(60, 140); return { prompt: `Three angles around a point are ${a}°, ${b}° and x°. Find x.`, answers: [String(360 - a - b)], hint: "Angles around a point add to 360°.", solution: `x = 360 − ${a} − ${b} = ${360 - a - b}°.`, answerFormat: DEG }; }
    const a = r(30, 80), b = r(30, 80);
    return { prompt: `Two angles of a triangle are ${a}° and ${b}°. Find the third angle.`, answers: [String(180 - a - b)], hint: "Angles in a triangle add to 180°.", solution: `180 − ${a} − ${b} = ${180 - a - b}°.`, answerFormat: DEG };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Gg.10"], "Find a missing interior angle from an exterior angle", () => {
    const a = r(25, 80), b = r(25, 80), e = a + b;
    return { prompt: `An exterior angle of a triangle is ${e}°. One of the two interior angles opposite it is ${a}°. Find the other one.`, answers: [String(b)], hint: "The exterior angle equals the sum of the two interior opposite angles.", solution: `${e}° − ${a}° = ${b}°.`, answerFormat: DEG };
  }),
  T(`${U}-a2`, "application", ["8Gg.10"], "Find an exterior angle of an isosceles triangle", () => {
    const top = 2 * r(10, 60), base = (180 - top) / 2;
    return { prompt: `Triangle ABC is isosceles with AB = AC, and angle A = ${top}°. Side BC is extended beyond C. Find the exterior angle at C.`, answers: [String(top + base)], hint: "Find angle B first: the base angles of an isosceles triangle are equal.", solution: `Angle B = (180° − ${top}°) ÷ 2 = ${base}°. The exterior angle at C = angle A + angle B = ${top}° + ${base}° = ${top + base}°.`, answerFormat: DEG };
  }),
  T(`${U}-a3`, "application", ["8Gg.11"], "Find an angle on parallel lines", () => {
    const a = slant(), p = pick(POSITIONS);
    let q = pick(POSITIONS);
    while (q === p) q = pick(POSITIONS);
    const x = sameSize(p, q) ? a : 180 - a;
    const step2 = q === opposite(p) ? `The angle ${place(q, "second")} is vertically opposite that, so it is also ${x}°.` : `The angle ${place(q, "second")} is next to that on a straight line, so it is 180° − ${a}° = ${x}°.`;
    return { prompt: `${PARALLEL} The angle ${place(p, "first")} is ${a}°. Find the angle ${place(q, "second")}.`, answers: [String(x)], hint: "Use corresponding angles to move to the second line, then vertically opposite angles or angles on a straight line.", solution: `Corresponding angles are equal, so the angle ${place(p, "second")} is also ${a}°. ${step2}`, answerFormat: DEG };
  }),
  T(`${U}-a4`, "application", ["8Gg.11"], "Solve for an unknown in equal angles", () => {
    const kind = pick(["alternate", "corresponding", "vertically opposite"] as const);
    for (;;) {
      const x = r(5, 30), p = r(2, 7), q = r(2, 7);
      if (p === q) continue;
      const v = r(30, 150), c = v - p * x, d = v - q * x;
      if (c === 0 || d === 0 || c === d) continue;
      // px + c = qx + d, so |p − q| x = |d − c|, which is always |p − q| x.
      const diff = Math.abs(p - q);
      return { prompt: `Two angles are ${kind} angles${kind === "vertically opposite" ? "" : " on parallel lines"}. One is (${linear(p, c)})° and the other is (${linear(q, d)})°. Find x.`, answers: [String(x)], hint: `${kind[0].toUpperCase() + kind.slice(1)} angles are equal, so write an equation.`, solution: `${linear(p, c)} = ${linear(q, d)}, so ${diff === 1 ? "" : diff}x = ${diff * x}${diff === 1 ? "" : ` and x = ${x}`}.`, answerFormat: "Enter the value of x." };
    }
  }),
  T(`${U}-a5`, "application", ["8Gp.01"], "Find a back bearing", () => {
    const b = r(5, 355);
    const back = (b + 180) % 360;
    return { prompt: `The bearing of B from A is ${bearing(b)}°. Find the bearing of A from B.`, answers: [bearing(back)], hint: "The direction back is the opposite way: add or subtract 180°.", solution: `${bearing(b)}° ${b < 180 ? "+" : "−"} 180° = ${bearing(back)}°.`, answerFormat: BEARING };
  }),
  T(`${U}-a6`, "application", ["8Gp.01"], "Find the angle between two bearings", () => {
    const p = r(5, 355);
    let q = r(5, 355);
    while (between(p, q) < 20 || between(p, q) > 170) q = r(5, 355);
    const d = between(p, q), raw = Math.abs(p - q);
    return { prompt: `From a lighthouse L, boat P is on a bearing of ${bearing(p)}° and boat Q is on a bearing of ${bearing(q)}°. Find angle PLQ.`, answers: [String(d)], hint: "Both bearings are measured clockwise from the same north line.", solution: raw > 180 ? `${Math.max(p, q)}° − ${Math.min(p, q)}° = ${raw}°, which is the reflex angle, so angle PLQ = 360° − ${raw}° = ${d}°.` : `${Math.max(p, q)}° − ${Math.min(p, q)}° = ${d}°.`, answerFormat: DEG };
  }),
  T(`${U}-a7`, "application", ["8Gg.12"], "Decide whether a triangle can be constructed", () => {
    const a = r(3, 12), b = r(3, 12), ok = pick([true, false]);
    const c = ok ? r(Math.abs(a - b) + 1, a + b - 1) : a + b + r(0, 4);
    const [s1, s2, s3] = [a, b, c].sort((x, y) => x - y);
    return { prompt: `Can a triangle be constructed with sides ${a} cm, ${b} cm and ${c} cm? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "The two shorter sides must add to more than the longest side, or the arcs never meet.", solution: ok ? `Yes: ${s1} + ${s2} = ${s1 + s2}, which is more than ${s3}.` : `No: ${s1} + ${s2} = ${s1 + s2}, which is not more than ${s3}, so the arcs from each end cannot meet.`, answerFormat: YES_NO };
  }),
  T(`${U}-a8`, "application", ["8Gg.12"], "Find a midpoint by construction", () => {
    // Steps of 0.2 cm and an even number of them, so the midpoint has one decimal place.
    const a = tidyNum(r(5, 40) / 5), b = tidyNum(a + (2 * r(10, 45)) / 5), m = tidyNum((a + b) / 2);
    return { prompt: `A line segment is drawn along a ruler from ${fmt(a)} cm to ${fmt(b)} cm. Its perpendicular bisector is constructed. At what ruler reading does the bisector cross the segment, in cm?`, answers: [ans(m)], hint: "The perpendicular bisector crosses at the midpoint.", solution: `The midpoint is halfway: (${fmt(a)} + ${fmt(b)}) ÷ 2 = ${fmt(m)} cm.` };
  }),
  T(`${U}-a9`, "application", ["8Gg.11"], "Use parallel sides in a trapezium", () => {
    const a = slant();
    return { prompt: `In trapezium ABCD, side AB is parallel to side DC. Angle DAB = ${a}°. Find angle ADC.`, answers: [String(180 - a)], hint: "Extend DA beyond A: the angle there corresponds to angle ADC.", solution: `Extend DA beyond A. The angle between that extension and AB is 180° − ${a}° = ${180 - a}° (angles on a straight line), and it corresponds to angle ADC, so angle ADC = ${180 - a}°.`, answerFormat: DEG };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Gg.10"], "Solve an exterior angle equation", () => {
    for (;;) {
      // (p + q + k)x = (px + c) + (qx + d), which holds when c + d = kx.
      const x = r(8, 30), p = r(1, 3), q = r(1, 3), k = r(1, 3), c = r(-10, 30), d = k * x - c;
      const e = (p + q + k) * x, A = p * x + c, B = q * x + d;
      if (c === 0 || d === 0 || A < 15 || B < 15 || e >= 175) continue;
      return { prompt: `An exterior angle of a triangle is ${p + q + k}x°. The two interior angles opposite it are (${linear(p, c)})° and (${linear(q, d)})°. Find x.`, answers: [String(x)], hint: "The exterior angle equals the sum of the two interior opposite angles.", solution: `${p + q + k}x = ${linear(p + q, c + d)}, so ${k === 1 ? "" : k}x = ${c + d}${k === 1 ? "" : ` and x = ${x}`}.`, answerFormat: "Enter the value of x." };
    }
  }),
  T(`${U}-r2`, "reasoning", ["8Gg.11"], "Prove an angle fact with parallel lines", () => {
    const a = r(35, 75), b = r(35, 75);
    const ask = pick(["P", "Q", "R"] as const);
    const x = ask === "P" ? 180 - a - b : ask === "Q" ? a : b;
    const why = ask === "P" ? `The three angles at P lie on the straight line, so angle QPR = 180° − ${a}° − ${b}° = ${x}°.` : `Angle ${ask === "Q" ? "PQR" : "PRQ"} is alternate to the ${x}° angle at P, so it is ${x}°.`;
    return { prompt: `Line ℓ is parallel to line m. Triangle PQR has P on ℓ, and Q and R on m. At P, the angle between ℓ and PQ is ${a}° and the angle between ℓ and PR is ${b}°, both outside the triangle. Find angle ${ask === "P" ? "QPR" : ask === "Q" ? "PQR" : "PRQ"}.`, answers: [String(x)], hint: "Use alternate angles between the parallel lines, or angles on a straight line at P.", solution: why, answerFormat: DEG };
  }),
  T(`${U}-r3`, "reasoning", ["8Gp.01"], "Find the turn between two bearings", () => {
    const p = r(5, 355);
    let q = r(5, 355);
    while (between(p, q) < 20 || between(p, q) > 160) q = r(5, 355);
    const d = between(p, q), raw = Math.abs(q - p);
    const way = (q - p + 360) % 360 === d ? "clockwise" : "anticlockwise";
    return { prompt: `A ship sails on a bearing of ${bearing(p)}°. It then turns to sail on a bearing of ${bearing(q)}°. Through what angle does it turn, taking the smaller turn?`, answers: [String(d)], hint: "Find the difference between the bearings; the smaller turn is at most 180°.", solution: raw > 180 ? `The bearings differ by ${raw}°, so the smaller turn is 360° − ${raw}° = ${d}°, ${way}.` : `The bearings differ by ${d}°, so the ship turns ${d}° ${way}.`, answerFormat: DEG };
  }),
  T(`${U}-r4`, "reasoning", ["8Gp.01", "8Gg.11"], "Use parallel north lines in a bearings problem", () => {
    const t = r(15, 75);
    return { prompt: `A hiker walks from A to B on a bearing of ${bearing(t)}°. From B the hiker walks due south to C, which is due east of A. Find angle ABC.`, answers: [String(t)], hint: "The north lines at A and B are parallel, and BC lies along the north line at B.", solution: `The north lines at A and B are parallel. The bearing makes ${t}° with the north line at A, and angle ABC is alternate to it, so angle ABC = ${t}°.`, answerFormat: DEG };
  }),
  T(`${U}-r5`, "reasoning", ["8Gg.12"], "Choose a compass radius for a construction", () => {
    const L = r(5, 16), R = Math.floor(L / 2) + 1;
    return { prompt: `To construct the perpendicular bisector of AB, arcs of equal radius are drawn from A and from B. AB = ${L} cm. What is the smallest whole number of centimetres the radius can be, so that the arcs cross?`, answers: [String(R)], hint: "If the radius is half of AB or less, the arcs only touch or miss.", solution: `The radius must be more than half of AB, which is ${L / 2} cm, so the smallest whole number is ${R} cm.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Gg.12"], "Find the limits on a triangle's third side", () => {
    // With equal sides the shortest third side is a trivial 1 cm, so ask for the longest.
    const a = r(3, 15), b = r(3, 15), largest = a === b || pick([true, false]);
    return largest
      ? { prompt: `Two sides of a triangle are ${a} cm and ${b} cm. The third side is a whole number of centimetres. What is the longest it can be?`, answers: [String(a + b - 1)], hint: "The other two sides must add to more than the third.", solution: `It must be less than ${a} + ${b} = ${a + b} cm, so the longest whole number is ${a + b - 1} cm.` }
      : { prompt: `Two sides of a triangle are ${a} cm and ${b} cm. The third side is a whole number of centimetres. What is the shortest it can be?`, answers: [String(Math.abs(a - b) + 1)], hint: "The third side and the shorter given side must add to more than the longer given side.", solution: `It must be more than ${Math.max(a, b)} − ${Math.min(a, b)} = ${Math.abs(a - b)} cm, so the shortest whole number is ${Math.abs(a - b) + 1} cm.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Gg.10"], "Share an exterior angle in a ratio", () => {
    for (;;) {
      const p = r(1, 5), q = r(1, 5);
      if (p === q) continue;
      const part = r(5, 25), e = (p + q) * part;
      if (e >= 170) continue;
      return { prompt: `An exterior angle of a triangle is ${e}°. The two interior angles opposite it are in the ratio ${p}:${q}. Find the larger of these two angles.`, answers: [String(Math.max(p, q) * part)], hint: "The two interior opposite angles add up to the exterior angle.", solution: `They add to ${e}°, shared in ${p + q} parts of ${part}°, so the larger is ${Math.max(p, q)} × ${part}° = ${Math.max(p, q) * part}°.`, answerFormat: DEG };
    }
  }),
  T(`${U}-r8`, "reasoning", ["8Gg.11"], "Solve for an unknown between parallel lines", () => {
    for (;;) {
      const x = r(5, 25), p = r(2, 6), q = r(1, 5), s = r(40, 140);
      const c = s - p * x, d = 180 - s - q * x;
      if (c === 0 || d === 0 || Math.abs(s - 90) < 6) continue;
      return { prompt: `${PARALLEL} Two angles lie between the parallel lines, on the same side of the transversal. They are (${linear(p, c)})° and (${linear(q, d)})°. Find x.`, answers: [String(x)], hint: "Use a corresponding angle and angles on a straight line: these two angles add to 180°.", solution: `The angle corresponding to one of them sits on a straight line with the other, so the two add to 180°: ${linear(p + q, c + d)} = 180, so ${p + q}x = ${180 - c - d} and x = ${x}.`, answerFormat: "Enter the value of x." };
    }
  }),
];
