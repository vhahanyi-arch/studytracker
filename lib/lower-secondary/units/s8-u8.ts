// Stage 8, unit 8: Shapes and symmetry (8Gg.01, 8Gg.05, 8Gg.07, 8Gg.09).
import { T, type Template } from "../engine";
import { r, pick, an } from "../kit";

const U = "s8-u8";
const YES_NO = "Enter yes or no.";
const NAME = "Enter the name of the shape.";

const POLYGONS: Array<[number, string]> = [[3, "equilateral triangle"], [4, "square"], [5, "regular pentagon"], [6, "regular hexagon"], [7, "regular heptagon"], [8, "regular octagon"], [9, "regular nonagon"], [10, "regular decagon"], [12, "regular dodecagon"]];

// Prisms and pyramids on an n-sided base: the counts students can reason out.
const BASE: Record<number, string> = { 3: "triangular", 4: "square", 5: "pentagonal", 6: "hexagonal", 7: "heptagonal", 8: "octagonal" };
type Solid = { name: string; F: number; V: number; E: number };
const prism = (n: number): Solid => ({ name: n === 4 ? "cuboid" : `${BASE[n]} prism`, F: n + 2, V: 2 * n, E: 3 * n });
const pyramid = (n: number): Solid => ({ name: `${BASE[n]}-based pyramid`, F: n + 1, V: n + 1, E: 2 * n });
const anySolid = () => (pick([true, false]) ? prism(r(3, 8)) : pyramid(r(3, 8)));
const COUNT = { F: "faces", V: "vertices", E: "edges" } as const;

const QUADS = ["square", "rectangle", "rhombus", "parallelogram", "kite"] as const;
// Whether every shape of each kind has the property, in the order of QUADS.
const PROPERTIES: Array<[string, boolean[]]> = [
  ["diagonals of equal length", [true, true, false, false, false]],
  ["diagonals that cross at right angles", [true, false, true, false, true]],
  ["diagonals that bisect each other", [true, true, true, true, false]],
  ["four equal sides", [true, false, true, false, false]],
  ["two pairs of parallel sides", [true, true, true, true, false]],
  ["four right angles", [true, true, false, false, false]],
  ["both pairs of opposite angles equal", [true, true, true, true, false]],
  ["at least one line of symmetry", [true, true, true, false, true]],
];

export const s8u8: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Gg.09"], "Find the lines of symmetry of a regular polygon", () => {
    const [n, name] = pick(POLYGONS);
    return { prompt: `How many lines of symmetry does ${an(name)} ${name} have?`, answers: [String(n)], hint: "A regular polygon has as many lines of symmetry as it has sides.", solution: `It has ${n} sides, so it has ${n} lines of symmetry.` };
  }),
  T(`${U}-f2`, "foundational", ["8Gg.09"], "Find the order of rotational symmetry of a regular polygon", () => {
    const [n, name] = pick(POLYGONS);
    return { prompt: `What is the order of rotational symmetry of ${an(name)} ${name}?`, answers: [String(n)], hint: "Count how many times it fits onto itself in one full turn.", solution: `It fits onto itself ${n} times in a full turn, so the order is ${n}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Gg.09"], "Identify a regular polygon from its symmetry", () => {
    const [n, name] = pick(POLYGONS.slice(1));
    const clue = pick([`${n} lines of symmetry`, `rotational symmetry of order ${n}`]);
    const plain = name.replace("regular ", "");
    return { prompt: `A regular polygon has ${clue}. What is its name?`, answers: [plain, name, `regular ${plain}`], hint: "For a regular polygon, the number of sides equals the number of lines of symmetry and the order of rotational symmetry.", solution: `It has ${n} sides, so it is ${an(name)} ${name}.`, answerFormat: NAME };
  }),
  T(`${U}-f4`, "foundational", ["8Gg.05"], "Use Euler's formula", () => {
    const s = anySolid(), missing = pick(["F", "V", "E"] as const);
    const given = (["F", "V", "E"] as const).filter((k) => k !== missing).map((k) => `${s[k]} ${COUNT[k]}`).join(" and ");
    const work = missing === "E" ? `E = F + V − 2 = ${s.F} + ${s.V} − 2 = ${s.E}` : missing === "F" ? `F = E − V + 2 = ${s.E} − ${s.V} + 2 = ${s.F}` : `V = E − F + 2 = ${s.E} − ${s.F} + 2 = ${s.V}`;
    return { prompt: `A polyhedron has ${given}. Use Euler's formula to find the number of ${COUNT[missing]}.`, answers: [String(s[missing])], hint: "Euler's formula: F + V − E = 2.", solution: `F + V − E = 2, so ${work}.` };
  }),
  T(`${U}-f5`, "foundational", ["8Gg.05"], "Count the faces, vertices and edges of a solid", () => {
    const s = anySolid(), ask = pick(["F", "V", "E"] as const);
    return { prompt: `How many ${COUNT[ask]} does ${an(s.name)} ${s.name} have?`, answers: [String(s[ask])], hint: "Picture the base, then what joins it to the top or to the apex.", solution: `${an(s.name)[0].toUpperCase() + an(s.name).slice(1)} ${s.name} has ${s.F} faces, ${s.V} vertices and ${s.E} edges, so the answer is ${s[ask]}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Gg.01"], "Use the hierarchy of quadrilaterals", () => {
    const [claim, yes, why] = pick([
      ["Every square is a rectangle", true, "a square has four right angles, which is all a rectangle needs"],
      ["Every rectangle is a square", false, "a rectangle's sides need not all be equal"],
      ["Every square is a rhombus", true, "a square has four equal sides, which is all a rhombus needs"],
      ["Every rhombus is a square", false, "a rhombus need not have right angles"],
      ["Every rhombus is a parallelogram", true, "a rhombus has two pairs of parallel sides"],
      ["Every parallelogram is a rhombus", false, "a parallelogram's sides need not all be equal"],
      ["Every rectangle is a parallelogram", true, "a rectangle has two pairs of parallel sides"],
      ["Every parallelogram is a rectangle", false, "a parallelogram need not have right angles"],
      ["Every rhombus is a kite", true, "a rhombus has two pairs of equal adjacent sides"],
      ["Every kite is a rhombus", false, "a kite's four sides need not all be equal"],
    ] as const);
    return { prompt: `Is this statement true? "${claim}." Answer yes or no.`, answers: [yes ? "yes" : "no"], hint: "Check whether the second shape's definition is met by every shape of the first kind.", solution: `${yes ? "Yes" : "No"}: ${why}.`, answerFormat: YES_NO };
  }),
  T(`${U}-f7`, "foundational", ["8Gg.01"], "Name a quadrilateral from its properties", () => {
    const [clue, name] = pick([
      ["four equal sides and four right angles", "square"],
      ["four right angles, but sides that are not all equal", "rectangle"],
      ["four equal sides, but no right angles", "rhombus"],
      ["two pairs of parallel sides, no right angles and adjacent sides of different lengths", "parallelogram"],
      ["two pairs of equal adjacent sides, but sides that are not all equal", "kite"],
      ["exactly one pair of parallel sides", "trapezium"],
    ] as const);
    return { prompt: `A quadrilateral has ${clue}. What is its most specific name?`, answers: [name], hint: "Work through square, rectangle, rhombus, parallelogram, kite and trapezium.", solution: `Those properties describe ${an(name)} ${name}.`, answerFormat: NAME };
  }),
  T(`${U}-f8`, "foundational", ["8Gg.07"], "Name the view of a 3D shape", () => {
    const [solid, view, shape] = pick([
      ["A cylinder stands on one of its circular faces.", "from above", "circle"],
      ["A cylinder stands on one of its circular faces.", "from the front", "rectangle"],
      ["A cone stands on its circular base.", "from above", "circle"],
      ["A cone stands on its circular base.", "from the front", "triangle"],
      ["A square-based pyramid stands on its base.", "from above", "square"],
      ["A square-based pyramid stands on its base.", "from the front", "triangle"],
      ["A triangular prism lies on a rectangular face, with a triangular end facing you.", "from the front", "triangle"],
      ["A triangular prism lies on a rectangular face, with a triangular end facing you.", "from above", "rectangle"],
      ["A hemisphere rests on its flat face.", "from the front", "semicircle"],
      ["A hemisphere rests on its flat face.", "from above", "circle"],
    ] as const);
    return { prompt: `${solid} What shape is its view ${view}?`, answers: [shape], hint: "Imagine looking straight at it, so you see only the outline in that direction.", solution: `Seen ${view}, its outline is ${an(shape)} ${shape}.`, answerFormat: NAME };
  }),
  T(`${U}-f9`, "foundational", ["review"], "Use corresponding parts of congruent shapes", () => {
    const ab = r(3, 12), bc = r(3, 12), b = r(30, 120);
    const [ask, value, why] = pick([
      ["the length of DE, in cm", String(ab), `DE matches AB, so DE = ${ab} cm`],
      ["the length of EF, in cm", String(bc), `EF matches BC, so EF = ${bc} cm`],
      ["the size of angle E, in degrees", String(b), `angle E matches angle B, so it is ${b}°`],
    ] as const);
    return { prompt: `Triangles ABC and DEF are congruent, with A matching D, B matching E and C matching F. AB = ${ab} cm, BC = ${bc} cm and angle B = ${b}°. Find ${ask}.`, answers: [value], hint: "Congruent shapes have matching sides and angles equal.", solution: `The triangles are congruent, and ${why}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Gg.05"], "Check a solid against Euler's formula", () => {
    const s = anySolid(), ok = pick([true, false]);
    const E = ok ? s.E : s.E + pick([-2, -1, 1, 2]);
    const total = s.F + s.V - E;
    return { prompt: `Could a polyhedron have ${s.F} faces, ${s.V} vertices and ${E} edges? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "For any polyhedron, F + V − E = 2.", solution: `${ok ? "Yes" : "No"}: ${s.F} + ${s.V} − ${E} = ${total < 0 ? "−" : ""}${Math.abs(total)}, ${ok ? "which fits Euler's formula" : "not 2, so it breaks Euler's formula"}.`, answerFormat: YES_NO };
  }),
  T(`${U}-a2`, "application", ["8Gg.05"], "Work back from the edges of a prism or pyramid", () => {
    const n = r(3, 12), isPrism = pick([true, false]), ask = pick(["F", "V"] as const);
    const E = isPrism ? 3 * n : 2 * n, value = isPrism ? (ask === "F" ? n + 2 : 2 * n) : n + 1;
    const rule = isPrism ? `A prism with an n-sided base has 3n edges, so n = ${E} ÷ 3 = ${n}` : `A pyramid with an n-sided base has 2n edges, so n = ${E} ÷ 2 = ${n}`;
    const count = isPrism ? (ask === "F" ? `It has n + 2 = ${value} faces` : `It has 2n = ${value} vertices`) : `It has n + 1 = ${value} ${COUNT[ask]}`;
    return { prompt: `A ${isPrism ? "prism" : "pyramid"} has ${E} edges. How many ${COUNT[ask]} does it have?`, answers: [String(value)], hint: "Find how many sides its base has first.", solution: `${rule}. ${count}.` };
  }),
  T(`${U}-a3`, "application", ["8Gg.01"], "Find the symmetry of a quadrilateral", () => {
    const [shape, lines, order] = pick([
      ["square", 4, 4], ["rectangle that is not a square", 2, 2], ["rhombus that is not a square", 2, 2],
      ["parallelogram that is not a rectangle or a rhombus", 0, 2], ["kite that is not a rhombus", 1, 1], ["isosceles trapezium", 1, 1],
    ] as const);
    const lineAsk = pick([true, false]);
    return lineAsk
      ? { prompt: `How many lines of symmetry does ${an(shape)} ${shape} have?`, answers: [String(lines)], hint: "Imagine folding the shape so the two halves match exactly.", solution: `${an(shape)[0].toUpperCase() + an(shape).slice(1)} ${shape} has ${lines} line${lines === 1 ? "" : "s"} of symmetry.` }
      : { prompt: `What is the order of rotational symmetry of ${an(shape)} ${shape}?`, answers: [String(order)], hint: "Count how many times it fits onto itself in one full turn.", solution: `${an(shape)[0].toUpperCase() + an(shape).slice(1)} ${shape} fits onto itself ${order === 1 ? "only once" : `${order} times`} in a full turn, so the order is ${order}.` };
  }),
  T(`${U}-a4`, "application", ["8Gg.01"], "Decide which quadrilaterals have a property", () => {
    const i = r(0, QUADS.length - 1), [property, has] = pick(PROPERTIES), yes = has[i];
    return { prompt: `Does every ${QUADS[i]} have ${property}? Answer yes or no.`, answers: [yes ? "yes" : "no"], hint: "Picture the most general shape of that kind, not a special case.", solution: yes ? `Yes: every ${QUADS[i]} has ${property}.` : `No: ${an(QUADS[i])} ${QUADS[i]} need not have ${property}.`, answerFormat: YES_NO };
  }),
  T(`${U}-a5`, "application", ["8Gg.07"], "Identify a solid from its views", () => {
    const [front, side, top, name] = pick([
      ["rectangle", "rectangle", "circle", "cylinder"],
      ["triangle", "triangle", "circle", "cone"],
      ["circle", "circle", "circle", "sphere"],
      ["triangle", "triangle", "square", "square-based pyramid"],
      ["triangle", "rectangle", "rectangle", "triangular prism"],
      ["semicircle", "semicircle", "circle", "hemisphere"],
      ["square", "square", "square", "cube"],
    ] as const);
    return { prompt: `A solid's view from the front is ${an(front)} ${front}, its view from the side is ${an(side)} ${side} and its view from above is ${an(top)} ${top}. What is the solid?`, answers: name === "square-based pyramid" ? [name, "square based pyramid", "square pyramid"] : [name], hint: "Start with the view from above: it shows the shape of the base.", solution: `A ${top} from above with those front and side views is ${an(name)} ${name}.`, answerFormat: NAME };
  }),
  T(`${U}-a6`, "application", ["8Gg.07"], "Count the cubes in a cuboid from its views", () => {
    const w = r(2, 6), d = r(2, 5), h = r(2, 5);
    return { prompt: `A solid cuboid is built from centimetre cubes. Its front view is ${w} squares wide and ${h} high. Its side view is ${d} squares wide and ${h} high. How many cubes are used?`, answers: [String(w * d * h)], hint: "The front view gives the length and height; the side view gives the depth.", solution: `It is ${w} long, ${d} deep and ${h} high: ${w} × ${d} × ${h} = ${w * d * h} cubes.` };
  }),
  T(`${U}-a7`, "application", ["8Gg.09"], "Find the angle of rotational symmetry", () => {
    const n = pick([3, 4, 5, 6, 8, 9, 10, 12]), name = POLYGONS.find(([k]) => k === n)![1];
    return { prompt: `${an(name)[0].toUpperCase() + an(name).slice(1)} ${name} is rotated about its centre. What is the smallest angle of rotation that makes it fit onto itself?`, answers: [String(360 / n)], hint: "It fits onto itself as many times in a full turn as its order of rotational symmetry.", solution: `The order is ${n}, so the angle is 360° ÷ ${n} = ${360 / n}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
  }),
  T(`${U}-a8`, "application", ["8Gg.09"], "Work back from an angle of rotation", () => {
    const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]), angle = 360 / n;
    const ask = pick(["lines of symmetry", "sides"]);
    return { prompt: `The smallest rotation that makes a regular polygon fit onto itself is ${angle}°. How many ${ask} does it have?`, answers: [String(n)], hint: "Find how many of these rotations make a full turn.", solution: `360° ÷ ${angle}° = ${n}, so it has ${n} sides and ${n} lines of symmetry.` };
  }),
  T(`${U}-a9`, "application", ["8Gg.01"], "Name a quadrilateral from its diagonals", () => {
    const [clue, name] = pick([
      ["are equal in length, bisect each other and cross at right angles", "square"],
      ["are equal in length and bisect each other, but do not cross at right angles", "rectangle"],
      ["cross at right angles and bisect each other, but are not equal in length", "rhombus"],
      ["bisect each other, but are not equal in length and do not cross at right angles", "parallelogram"],
      ["cross at right angles, but only one of them is cut in half by the other", "kite"],
    ] as const);
    return { prompt: `The diagonals of a quadrilateral ${clue}. What is its most specific name?`, answers: [name], hint: "Recall the diagonal properties of the square, rectangle, rhombus, parallelogram and kite.", solution: `Only ${an(name)} ${name} has diagonals like these.`, answerFormat: NAME };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Gg.05"], "Use Euler's formula when every face is a triangle", () => {
    const V = pick([4, 5, 6, 7, 8, 9, 10, 12]), F = 2 * (V - 2), E = 3 * (V - 2);
    return { prompt: `Every face of a polyhedron is a triangle, so 2E = 3F. The polyhedron has ${V} vertices. How many faces does it have?`, answers: [String(F)], hint: "Write E in terms of F, then substitute into F + V − E = 2.", solution: `E = 1.5F, so F + ${V} − 1.5F = 2, giving 0.5F = ${V - 2} and F = ${F} (with ${E} edges).` };
  }),
  T(`${U}-r2`, "reasoning", ["8Gg.05"], "Decide whether a prism or pyramid can have a number of edges", () => {
    const isPrism = pick([true, false]), ok = pick([true, false]);
    let E: number;
    if (isPrism) { if (ok) E = 3 * r(3, 10); else do E = r(10, 30); while (E % 3 === 0); }
    else if (ok) E = 2 * r(3, 15); else E = 2 * r(3, 14) + 1;
    const k = isPrism ? 3 : 2;
    const solution = ok ? `Yes: ${an(isPrism ? "prism" : "pyramid")} ${isPrism ? "prism" : "pyramid"} with an n-sided base has ${k}n edges, and ${k} × ${E / k} = ${E}.` : `No: ${an(isPrism ? "prism" : "pyramid")} ${isPrism ? "prism" : "pyramid"} with an n-sided base has ${k}n edges, and ${E} is not a multiple of ${k}.`;
    return { prompt: `Can ${isPrism ? "a prism" : "a pyramid"} have exactly ${E} edges? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Count the edges of a prism or pyramid on an n-sided base in terms of n.", solution, answerFormat: YES_NO };
  }),
  T(`${U}-r3`, "reasoning", ["8Gg.01"], "Pin down a quadrilateral with extra information", () => {
    const [clue, name] = pick([
      ["a parallelogram with one right angle", "rectangle"],
      ["a rhombus with one right angle", "square"],
      ["a rectangle with two adjacent sides equal", "square"],
      ["a parallelogram with two adjacent sides equal", "rhombus"],
      ["a kite whose diagonals bisect each other", "rhombus"],
      ["a rectangle whose diagonals cross at right angles", "square"],
      ["a parallelogram whose diagonals are equal in length", "rectangle"],
      ["a parallelogram whose diagonals cross at right angles", "rhombus"],
    ] as const);
    return { prompt: `A shape is ${clue}. What is the most specific name you can be sure of?`, answers: [name], hint: "Use the extra fact to show which further properties the shape must have.", solution: `That extra fact forces the properties of ${an(name)} ${name}, so it must be ${an(name)} ${name}.`, answerFormat: NAME };
  }),
  T(`${U}-r4`, "reasoning", ["8Gg.09"], "Decide whether a rotation maps a regular polygon onto itself", () => {
    const n = pick([5, 6, 8, 9, 10, 12]), step = 360 / n, name = POLYGONS.find(([k]) => k === n)![1], ok = pick([true, false]);
    let angle = step * r(1, n - 1);
    if (!ok) do angle = 5 * r(2, 70); while (angle % step === 0);
    return { prompt: `${an(name)[0].toUpperCase() + an(name).slice(1)} ${name} is rotated ${angle}° about its centre. Does it fit exactly onto its original position? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Find the smallest rotation that works; any rotation that works is a multiple of it.", solution: ok ? `Yes: it fits onto itself every 360° ÷ ${n} = ${step}°, and ${angle}° = ${angle / step} × ${step}°.` : `No: it fits onto itself only at multiples of 360° ÷ ${n} = ${step}°, and ${angle}° is not a multiple of ${step}°.`, answerFormat: YES_NO };
  }),
  T(`${U}-r5`, "reasoning", ["8Gg.07"], "Find the most cubes that match two views", () => {
    for (;;) {
      const cols = [r(1, 4), r(1, 4), r(1, 4)], rows = [r(1, 4), r(1, 4)];
      if (Math.max(...cols) !== Math.max(...rows)) continue;
      const row = (h: number) => cols.map((c) => Math.min(c, h));
      const [front, back] = rows.map((h) => row(h)), s0 = front.reduce((a, b) => a + b), s1 = back.reduce((a, b) => a + b);
      return { prompt: `A solid is built from cubes stacked on a grid of 3 columns (left to right) and 2 rows (front to back). Its front view shows stacks of heights ${cols.join(", ")} from left to right. Its side view shows heights ${rows.join(", ")} from front to back. What is the greatest number of cubes it can have?`, answers: [String(s0 + s1)], hint: "Each stack can be no taller than its column's height in the front view and no taller than its row's height in the side view.", solution: `Each stack is at most the smaller of its column height and its row height. Front row: ${front.join(" + ")} = ${s0}. Back row: ${back.join(" + ")} = ${s1}. Greatest total: ${s0} + ${s1} = ${s0 + s1}.` };
    }
  }),
  T(`${U}-r6`, "reasoning", ["8Gg.05"], "Use Euler's formula on a combined solid", () => {
    const n = r(3, 8), twoPyramids = pick([true, false]), ask = pick(["F", "V", "E"] as const);
    const s = twoPyramids ? { F: 2 * n, V: n + 2, E: 3 * n } : { F: 2 * n + 1, V: 2 * n + 1, E: 4 * n };
    const text = twoPyramids ? `Two identical ${BASE[n]}-based pyramids are joined base to base` : `${an(BASE[n])[0].toUpperCase() + an(BASE[n]).slice(1)} ${BASE[n]} prism has ${an(BASE[n])} ${BASE[n]}-based pyramid joined onto one end, base to end`;
    const work = twoPyramids
      ? `The two bases are now inside. Faces: ${n} triangles on each pyramid, 2 × ${n} = ${s.F}. Vertices: ${n} around the join and 2 apexes, ${s.V}. Edges: ${n} around the join and ${n} slanting edges on each pyramid, ${n} + 2 × ${n} = ${s.E}`
      : `The pyramid's base and the prism's end are now inside. Faces: ${n} rectangles, 1 end and ${n} triangles, ${s.F}. Vertices: 2 × ${n} on the prism and 1 apex, ${s.V}. Edges: 3 × ${n} on the prism and ${n} slanting edges, ${s.E}`;
    return { prompt: `${text}. How many ${COUNT[ask]} does the new solid have?`, answers: [String(s[ask])], hint: "Count carefully: faces that are glued together are no longer on the outside. Then check with F + V − E = 2.", solution: `${work}. Check: ${s.F} + ${s.V} − ${s.E} = 2. It has ${s[ask]} ${COUNT[ask]}.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Gg.09"], "Describe where the lines of symmetry of a regular polygon go", () => {
    const [n, name] = pick(POLYGONS.filter(([k]) => k >= 4));
    const even = n % 2 === 0, through = even ? n / 2 : 0;
    return { prompt: `How many lines of symmetry of ${an(name)} ${name} pass through two of its vertices?`, answers: [String(through)], hint: "Consider whether each vertex has another vertex directly opposite it, or the middle of a side.", solution: even ? `With ${n} sides (even), each vertex is opposite another vertex: ${n / 2} lines join opposite vertices and ${n / 2} join midpoints of opposite sides. So ${through} lines pass through two vertices.` : `With ${n} sides (odd), each vertex is opposite the middle of a side, so every line goes through one vertex and one midpoint. So ${through} lines pass through two vertices.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Gg.01"], "Use quadrilateral properties to find angles", () => {
    const kind = pick(["parallelogram", "kite", "rhombus"] as const);
    if (kind === "parallelogram") {
      const a = r(40, 140);
      return { prompt: `In parallelogram ABCD, angle A = ${a}°. Find angle B.`, answers: [String(180 - a)], hint: "AD is parallel to BC, so angles A and B lie between parallel lines on the same side of AB.", solution: `Angles A and B are next to each other in a parallelogram, so they add to 180°: angle B = 180° − ${a}° = ${180 - a}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
    }
    if (kind === "kite") {
      const a = 2 * r(20, 60), c = 2 * r(20, 60);
      const b = (360 - a - c) / 2;
      return { prompt: `ABCD is a kite with AB = AD and CB = CD. Angle BAD = ${a}° and angle BCD = ${c}°. Find angle ABC.`, answers: [String(b)], hint: "In this kite, the angles at B and D are equal.", solution: `Angles ABC and ADC are equal and the four angles add to 360°: (360° − ${a}° − ${c}°) ÷ 2 = ${b}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
    }
    const a = 2 * r(25, 70), bad = 180 - a;
    return { prompt: `In rhombus ABCD, angle ABC = ${a}°. Find angle BAC.`, answers: [String(bad / 2)], hint: "Find angle DAB first, then use the fact that diagonal AC cuts it in half.", solution: `A rhombus is a parallelogram, so angle DAB = 180° − ${a}° = ${bad}°. Diagonal AC bisects angle DAB, so angle BAC = ${bad}° ÷ 2 = ${bad / 2}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
  }),
];
