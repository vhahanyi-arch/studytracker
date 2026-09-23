// Stage 9, unit 5: Angles (9Gg.07, 9Gg.08, 9Gg.09, 9Gg.11, 9Gp.01).
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, big, linear, an } from "../kit";

const U = "s9-u5";
const DEG = "Enter the size in degrees. The ° sign is optional.";
const BEARING = "Enter exactly three digits, for example 047.";

const NAMES: Record<number, string> = { 3: "triangle", 4: "quadrilateral", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };
/** Polygons whose regular versions have whole-number interior angles. */
const REGULAR = [3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24, 30, 36];
const name = (n: number) => NAMES[n] ?? `${n}-sided polygon`;
const sum = (n: number) => (n - 2) * 180;
/** "equilateral triangle", "square", "regular hexagon". */
const regular = (n: number) => (n === 3 ? "equilateral triangle" : n === 4 ? "square" : `regular ${name(n)}`);
const bearing = (d: number) => String(((d % 360) + 360) % 360).padStart(3, "0");

export const s9u5: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Gg.07"], "Find the interior angle sum of a polygon", () => {
    const n = r(5, 20);
    return { prompt: `Find the sum of the interior angles of ${an(name(n))} ${name(n)}.`, answers: [String(sum(n))], hint: "A polygon with n sides can be split into n − 2 triangles from one vertex.", solution: `(${n} − 2) × 180° = ${n - 2} × 180° = ${sum(n)}°.`, answerFormat: DEG };
  }),
  T(`${U}-f2`, "foundational", ["9Gg.07"], "Find each interior angle of a regular polygon", () => {
    const n = pick(REGULAR.filter((k) => k >= 5));
    return { prompt: `Find the size of each interior angle of a regular ${name(n)}.`, answers: [String(sum(n) / n)], hint: "Find the interior angle sum, then share it equally between the angles.", solution: `Sum = (${n} − 2) × 180° = ${sum(n)}°, so each angle is ${sum(n)}° ÷ ${n} = ${sum(n) / n}°.`, answerFormat: DEG };
  }),
  T(`${U}-f3`, "foundational", ["9Gg.08"], "Find each exterior angle of a regular polygon", () => {
    const n = pick(REGULAR);
    return { prompt: `Find the size of each exterior angle of a regular ${name(n)}.`, answers: [String(360 / n)], hint: "The exterior angles of any polygon add up to 360°.", solution: `360° ÷ ${n} = ${360 / n}°.`, answerFormat: DEG };
  }),
  T(`${U}-f4`, "foundational", ["9Gg.08"], "Find the number of sides from an exterior angle", () => {
    const n = pick(REGULAR.filter((k) => k >= 5));
    return { prompt: `Each exterior angle of a regular polygon is ${360 / n}°. How many sides does it have?`, answers: [String(n)], hint: "The exterior angles add up to 360°.", solution: `360° ÷ ${360 / n}° = ${n} sides.` };
  }),
  T(`${U}-f5`, "foundational", ["9Gg.09"], "Find a missing angle in a quadrilateral", () => {
    const [a, b, c] = [r(60, 130), r(60, 130), r(50, 120)], d = 360 - a - b - c;
    if (d <= 20 || d >= 200) return s9u5[4].make();
    return { prompt: `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. Find the fourth angle.`, answers: [String(d)], hint: "The angles of a quadrilateral add up to 360°.", solution: `360° − ${a}° − ${b}° − ${c}° = ${d}°.`, answerFormat: DEG };
  }),
  T(`${U}-f6`, "foundational", ["9Gg.11"], "Plan the construction of an angle", () => {
    const [target, from, how] = pick([
      [30, 60, "Construct an equilateral triangle to get 60°, then bisect it"],
      [45, 90, "Construct a perpendicular to get 90°, then bisect it"],
      [15, 30, "Construct 60°, bisect it to get 30°, then bisect again"],
      [22.5, 45, "Construct 90°, bisect to get 45°, then bisect again"],
      [75, 150, "Construct 150° (90° + 60°), then bisect it"],
    ] as const);
    return { prompt: `To construct an angle of ${fmt(target)}° with a ruler and compasses, you bisect a larger angle that you can already construct. What size is that larger angle?`, answers: [fmt(target * 2)], hint: "Bisecting halves an angle.", solution: `${how}: ${fmt(from)}° ÷ 2 = ${fmt(target)}°.`, answerFormat: DEG };
  }),
  T(`${U}-f7`, "foundational", ["9Gp.01"], "Use a map scale", () => {
    const scale = pick([10000, 20000, 25000, 50000, 100000, 250000]), cm = pick([r(2, 15), r(2, 15) + 0.5]), km = (cm * scale) / 100000;
    return { prompt: `A map has a scale of 1 : ${big(scale)}. Two villages are ${fmt(cm)} cm apart on the map. How far apart are they in real life, in km?`, answers: [ans(km)], hint: "Multiply by the scale to get centimetres, then convert to kilometres (100 000 cm = 1 km).", solution: `${fmt(cm)} × ${big(scale)} = ${big(cm * scale)} cm = ${fmt(km)} km.` };
  }),
  T(`${U}-f8`, "foundational", ["9Gp.01"], "Draw a length to scale", () => {
    const per = pick([2, 5, 10, 20, 50]), cm = r(2, 16) + pick([0, 0.5]), real = cm * per;
    const unit = pick(["km", "m"]);
    return { prompt: `On a scale drawing, 1 cm represents ${per} ${unit}. How long should a real distance of ${fmt(real)} ${unit} be on the drawing, in cm?`, answers: [ans(cm)], hint: "Divide the real distance by what 1 cm represents.", solution: `${fmt(real)} ÷ ${per} = ${fmt(cm)} cm.` };
  }),
  T(`${U}-f9`, "foundational", ["9Gg.07"], "Find a missing angle in a polygon", () => {
    const n = r(5, 7), known = Array.from({ length: n - 1 }, () => r(90, 150)), missing = sum(n) - known.reduce((s, v) => s + v, 0);
    if (missing <= 30 || missing >= 300) return s9u5[8].make();
    return { prompt: `${n - 1} of the interior angles of ${an(name(n))} ${name(n)} are ${known.join("°, ")}°. Find the remaining angle.`, answers: [String(missing)], hint: "Find the interior angle sum first.", solution: `Sum = (${n} − 2) × 180° = ${sum(n)}°. ${sum(n)}° − ${known.reduce((s, v) => s + v, 0)}° = ${missing}°.`, answerFormat: DEG };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Gg.07"], "Find the number of sides from the angle sum", () => {
    const n = r(5, 22);
    return { prompt: `The interior angles of a polygon add up to ${big(sum(n))}°. How many sides does it have?`, answers: [String(n)], hint: "Divide by 180° to find the number of triangles; there are two more sides than triangles.", solution: `${big(sum(n))} ÷ 180 = ${n - 2} triangles, so the polygon has ${n - 2} + 2 = ${n} sides.` };
  }),
  T(`${U}-a2`, "application", ["9Gg.08"], "Find a missing exterior angle", () => {
    const n = r(5, 7), known = Array.from({ length: n - 1 }, () => r(35, 80)), missing = 360 - known.reduce((s, v) => s + v, 0);
    if (missing <= 10 || missing >= 120) return s9u5.find((t) => t.id === `${U}-a2`)!.make();
    return { prompt: `${n - 1} of the exterior angles of ${an(name(n))} ${name(n)} are ${known.join("°, ")}°. Find the last exterior angle.`, answers: [String(missing)], hint: "The exterior angles of any polygon add up to 360°.", solution: `360° − ${known.reduce((s, v) => s + v, 0)}° = ${missing}°.`, answerFormat: DEG };
  }),
  T(`${U}-a3`, "application", ["9Gg.07", "9Gg.08"], "Work back from an interior angle", () => {
    const n = pick(REGULAR.filter((k) => k >= 5)), interior = sum(n) / n;
    return { prompt: `Each interior angle of a regular polygon is ${interior}°. How many sides does it have?`, answers: [String(n)], hint: "Find the exterior angle first: interior + exterior = 180°.", solution: `Exterior angle = 180° − ${interior}° = ${360 / n}°, so there are 360° ÷ ${360 / n}° = ${n} sides.` };
  }),
  T(`${U}-a4`, "application", ["9Gg.09"], "Find an angle using parallel lines and an isosceles triangle", () => {
    const a = 2 * r(20, 70), base = (180 - a) / 2;
    return { prompt: `Triangle PQR is isosceles with PQ = PR and angle QPR = ${a}°. Line ℓ passes through P and is parallel to QR. Find the angle between ℓ and PQ, outside the triangle.`, answers: [String(base)], hint: "Find a base angle of the triangle, then use alternate angles.", solution: `The base angles are (180° − ${a}°) ÷ 2 = ${base}°. The angle between ℓ and PQ is alternate to angle PQR, so it is ${base}°.`, answerFormat: DEG };
  }),
  T(`${U}-a5`, "application", ["9Gg.11"], "Plan the construction of a regular polygon", () => {
    const n = pick([3, 4, 5, 6, 8, 10, 12]);
    return { prompt: `A regular ${name(n)} is to be drawn inside a circle by marking equal angles at the centre. What angle should there be between neighbouring radii?`, answers: [String(360 / n)], hint: "The angles at the centre share a full turn equally.", solution: `360° ÷ ${n} = ${360 / n}°.${n === 6 ? " (For a hexagon you can also step the compass round the circle: each side equals the radius.)" : ""}`, answerFormat: DEG };
  }),
  T(`${U}-a6`, "application", ["9Gp.01"], "Combine a bearing with a map scale", () => {
    const scale = pick([25000, 50000, 100000]), cm = r(3, 14), b = r(10, 350), km = (cm * scale) / 100000, askBack = pick([true, false]);
    return askBack
      ? { prompt: `On a map, B is ${cm} cm from A on a bearing of ${bearing(b)}°. What is the bearing of A from B?`, answers: [bearing(b + 180)], hint: "The bearing back differs by 180°.", solution: `${bearing(b)}° ${b < 180 ? "+" : "−"} 180° = ${bearing(b + 180)}°.`, answerFormat: BEARING }
      : { prompt: `On a map with scale 1 : ${big(scale)}, B is ${cm} cm from A on a bearing of ${bearing(b)}°. How far is B from A in real life, in km?`, answers: [ans(km)], hint: "The bearing gives the direction; the scale gives the distance.", solution: `${cm} × ${big(scale)} = ${big(cm * scale)} cm = ${fmt(km)} km.` };
  }),
  T(`${U}-a7`, "application", ["9Gp.01"], "Use the scale of a plan", () => {
    const scale = pick([50, 100, 200, 250, 500]), cm = r(10, 60) / 10, m = (cm * scale) / 100;
    return { prompt: `A house plan is drawn at a scale of 1 : ${scale}. A room is ${fmt(cm)} cm long on the plan. How long is the room in real life, in metres?`, answers: [ans(m)], hint: "Multiply by the scale to get centimetres, then divide by 100 for metres.", solution: `${fmt(cm)} × ${scale} = ${fmt(cm * scale)} cm = ${fmt(m)} m.` };
  }),
  T(`${U}-a8`, "application", ["9Gg.09"], "Solve for angles in a quadrilateral", () => {
    for (;;) {
      const [p, q] = [r(1, 3), r(1, 3)], [b, c, d] = [r(-20, 40), r(-20, 40), r(-20, 40)], x = (360 - b - c - d) / (p + q + 2);
      if (!Number.isInteger(x)) continue;
      const angles = [p * x + b, q * x + c, x + d, x];
      if (angles.some((v) => v < 30 || v > 170)) continue;
      return { prompt: `The angles of a quadrilateral are (${linear(p, b)})°, (${linear(q, c)})°, (${linear(1, d)})° and x°. Find x.`, answers: [String(x)], hint: "The angles add up to 360°.", solution: `${linear(p + q + 2, b + c + d)} = 360, so ${p + q + 2}x = ${360 - b - c - d} and x = ${x}.` };
    }
  }),
  T(`${U}-a9`, "application", ["9Gg.08"], "Decide whether a regular polygon can have an exterior angle", () => {
    const e = pick([r(5, 120), pick([15, 18, 20, 24, 30, 36, 40, 45, 60, 72])]), ok = 360 % e === 0 && e <= 120;
    return { prompt: `Can a regular polygon have exterior angles of ${e}°? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "The number of sides must be a whole number: 360° ÷ exterior angle.", solution: ok ? `Yes: 360° ÷ ${e}° = ${360 / e}, a whole number of sides.` : `No: 360° ÷ ${e}° = ${fmt(Math.round((360 / e) * 100) / 100)}${Number.isInteger((360 / e) * 100) ? "" : "…"}, which is not a whole number of sides.`, answerFormat: "Enter yes or no." };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Gg.07"], "Solve for angles in a pentagon", () => {
    for (;;) {
      const coefs = [1, r(1, 3), r(1, 3), r(1, 3), r(1, 3)], consts = [0, r(-20, 30), r(-20, 30), r(-20, 30), r(-20, 30)];
      const k = coefs.reduce((s, v) => s + v, 0), c = consts.reduce((s, v) => s + v, 0), x = (540 - c) / k;
      if (!Number.isInteger(x)) continue;
      const angles = coefs.map((m, i) => m * x + consts[i]);
      if (angles.some((v) => v < 40 || v > 175)) continue;
      return { prompt: `The interior angles of a pentagon are ${coefs.map((m, i) => (i === 0 ? "x°" : `(${linear(m, consts[i])})°`)).join(", ")}. Find x.`, answers: [String(x)], hint: "The interior angles of a pentagon add up to 540°.", solution: `${linear(k, c)} = 540, so ${k}x = ${540 - c} and x = ${x}.` };
    }
  }),
  T(`${U}-r2`, "reasoning", ["9Gg.08"], "Use a ratio of interior to exterior angle", () => {
    const k = r(2, 8), e = 180 / (k + 1), n = 360 / e;
    return { prompt: `Each interior angle of a regular polygon is ${k} times the size of each exterior angle. How many sides does it have?`, answers: [String(n)], hint: "Interior + exterior = 180°. Write both in terms of the exterior angle.", solution: `${k}e + e = 180°, so e = ${fmt(e)}° and the polygon has 360° ÷ ${fmt(e)}° = ${n} sides.` };
  }),
  T(`${U}-r3`, "reasoning", ["9Gg.07"], "Explain the interior angle formula", () => {
    const n = r(5, 15), ask = pick(["triangles", "sum"] as const);
    return ask === "triangles"
      ? { prompt: `Lines are drawn from one vertex of ${an(name(n))} ${name(n)} to every other vertex. How many triangles are formed?`, answers: [String(n - 2)], hint: "The two neighbouring vertices are already joined by sides.", solution: `Lines go to ${n - 3} vertices, splitting the shape into ${n - 2} triangles, which is why the angle sum is (${n} − 2) × 180°.` }
      : { prompt: `A polygon is split into ${n - 2} triangles by lines from one vertex. How many sides does the polygon have?`, answers: [String(n)], hint: "There are always 2 fewer triangles than sides.", solution: `Sides = triangles + 2 = ${n - 2} + 2 = ${n}.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Gg.07", "9Gg.09"], "Find the angle where regular polygons meet", () => {
    const [a, b] = shuffle([3, 4, 5, 6, 8, 10, 12]).slice(0, 2), ia = sum(a) / a, ib = sum(b) / b, gap = 360 - ia - ib;
    if (gap <= 0) return s9u5.find((t) => t.id === `${U}-r4`)!.make();
    return { prompt: `${an(regular(a))[0].toUpperCase() + an(regular(a)).slice(1)} ${regular(a)} and ${an(regular(b))} ${regular(b)} share a vertex and one side, and do not overlap. Find the angle left over at that vertex.`, answers: [String(gap)], hint: "Find each interior angle, then use angles around a point.", solution: `Interior angles: ${ia}° and ${ib}°. Angles around a point add to 360°: 360° − ${ia}° − ${ib}° = ${gap}°.`, answerFormat: DEG };
  }),
  T(`${U}-r5`, "reasoning", ["9Gp.01", "9Gg.09"], "Find an angle between two journeys", () => {
    const p = r(20, 150), q = r(20, 340);
    const back = (p + 180) % 360, d = Math.abs(back - q) % 360, angle = d > 180 ? 360 - d : d;
    if (angle < 20 || angle > 170) return s9u5.find((t) => t.id === `${U}-r5`)!.make();
    return { prompt: `A boat sails from A to B on a bearing of ${bearing(p)}°, then from B to C on a bearing of ${bearing(q)}°. Find angle ABC.`, answers: [String(angle)], hint: "At B, find the bearing back to A, then the angle between that direction and BC.", solution: `The bearing of A from B is ${bearing(back)}°. The angle between bearings ${bearing(back)}° and ${bearing(q)}° is ${angle}°.`, answerFormat: DEG };
  }),
  T(`${U}-r6`, "reasoning", ["9Gg.11"], "Decide which angles can be constructed", () => {
    const can = pick([15, 22.5, 30, 45, 75, 105, 135, 150]), cannot = shuffle([10, 20, 25, 35, 40, 50, 70, 80]).slice(0, 2);
    const options = shuffle([can, ...cannot]), letter = "ABC"[options.indexOf(can)];
    return { prompt: `Using only constructions of 60° and 90°, bisecting, and adding angles, which of these angles can be constructed exactly? ${options.map((o, i) => `${"ABC"[i]}: ${fmt(o)}°`).join(", ")}.`, answers: [letter], hint: "From 60° and 90° you can reach 30°, 45°, 15°, 22.5° and their sums.", solution: `${letter}: ${fmt(can)}° can be made from 60°, 90° and their halves${can > 90 ? " added together" : ""}; the others cannot.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-r7`, "reasoning", ["9Gp.01"], "Work out a map scale", () => {
    const km = r(3, 40), cm = pick([2, 3, 4, 5, 6, 8]), scale = (km * 100000) / cm;
    if (!Number.isInteger(scale)) return s9u5.find((t) => t.id === `${U}-r7`)!.make();
    return { prompt: `Two towns are ${km} km apart. On a map they are ${cm} cm apart. Write the scale of the map in the form 1 : n. What is n?`, answers: [String(scale)], hint: "Convert the real distance to centimetres (1 km = 100 000 cm), then divide by the map distance.", solution: `${km} km = ${big(km * 100000)} cm, and ${big(km * 100000)} ÷ ${cm} = ${big(scale)}, so the scale is 1 : ${big(scale)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Gg.09"], "Combine the exterior angle of a triangle with algebra", () => {
    const p = r(1, 3), q = r(1, 4), x = r(10, 40), e = (p + q) * x;
    if (e >= 175 || e <= 60) return s9u5.find((t) => t.id === `${U}-r8`)!.make();
    return { prompt: `In triangle ABC, angle A = ${linear(p, 0)}° and angle B = ${linear(q, 0)}°. The exterior angle at C is ${e}°. Find angle ACB.`, answers: [String(180 - e)], hint: "The exterior angle equals the sum of the two interior opposite angles.", solution: `${linear(p + q, 0)} = ${e}, so x = ${x}. Angle ACB = 180° − ${e}° = ${180 - e}°.`, answerFormat: DEG };
  }),
];
