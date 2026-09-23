// Stage 9, unit 14: Volume, surface area and symmetry (9Gg.04, 9Gg.05, 9Gg.06).
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, big, roundDP } from "../kit";

const U = "s9-u14";
const DP1 = "Give your answer correct to 1 decimal place.";
const oneDP = (x: number) => fmt(roundDP(x, 1));
const long = (x: number) => fmt(roundDP(x, 3));
const TRIPLES: Array<[number, number, number]> = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]];

// Planes of symmetry of common solids (regular prisms have n + 1).
const PLANES: Array<[string, number]> = [
  ["a cube", 9], ["a cuboid with length, width and height all different", 3], ["a cuboid with two square faces (and the other faces not square)", 5],
  ["a square-based pyramid (with its apex above the centre of the base)", 4], ["a prism whose cross-section is an equilateral triangle", 4],
  ["a prism whose cross-section is a regular hexagon", 7], ["a prism whose cross-section is a regular pentagon", 6], ["a prism whose cross-section is an isosceles triangle (not equilateral)", 2],
];

export const s9u14: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Gg.04"], "Find the volume of a cylinder", () => {
    const rad = r(2, 15), h = r(3, 30), V = Math.PI * rad * rad * h;
    return { prompt: `A cylinder has radius ${rad} cm and height ${h} cm. Find its volume in cm³. ${DP1}`, answers: [ans(roundDP(V, 1))], hint: "Volume = area of the circular cross-section × height = πr²h.", solution: `V = π × ${rad}² × ${h} = ${long(V)}… ≈ ${oneDP(V)} cm³.` };
  }),
  T(`${U}-f2`, "foundational", ["9Gg.04"], "Find the volume of a prism from its cross-section", () => {
    const A = r(8, 60), L = r(3, 25);
    const shape = pick(["hexagonal", "pentagonal", "L-shaped", "trapezium-shaped"]);
    return { prompt: `A prism has a ${shape} cross-section with area ${A} cm² and is ${L} cm long. Find its volume in cm³.`, answers: [String(A * L)], hint: "Volume of any prism = area of cross-section × length.", solution: `${A} × ${L} = ${A * L} cm³.` };
  }),
  T(`${U}-f3`, "foundational", ["9Gg.05"], "Find the surface area of a closed cylinder", () => {
    const rad = r(2, 12), h = r(3, 25), S = 2 * Math.PI * rad * rad + 2 * Math.PI * rad * h;
    return { prompt: `Find the total surface area of a closed cylinder with radius ${rad} cm and height ${h} cm, in cm². ${DP1}`, answers: [ans(roundDP(S, 1))], hint: "Two circles (2πr²) plus the curved surface (2πrh).", solution: `2 × π × ${rad}² + 2 × π × ${rad} × ${h} = ${long(2 * Math.PI * rad * rad)}… + ${long(2 * Math.PI * rad * h)}… ≈ ${oneDP(S)} cm².` };
  }),
  T(`${U}-f4`, "foundational", ["9Gg.05"], "Find the surface area of a cuboid", () => {
    const [l, w, h] = [r(2, 15), r(2, 12), r(2, 12)], S = 2 * (l * w + l * h + w * h);
    return { prompt: `Find the surface area of a cuboid measuring ${l} cm by ${w} cm by ${h} cm, in cm².`, answers: [String(S)], hint: "Three pairs of identical rectangles.", solution: `2 × (${l * w} + ${l * h} + ${w * h}) = ${S} cm².` };
  }),
  T(`${U}-f5`, "foundational", ["9Gg.06"], "Count planes of symmetry", () => {
    const [solid, n] = pick(PLANES);
    return { prompt: `How many planes of symmetry does ${solid} have?`, answers: [String(n)], hint: "A plane of symmetry cuts the solid into two halves that are mirror images.", solution: `${solid[0].toUpperCase() + solid.slice(1)} has ${n} planes of symmetry.` };
  }),
  T(`${U}-f6`, "foundational", ["9Gg.04"], "Find the volume of a trapezium-based prism", () => {
    const [a, b, h, L] = [r(2, 10), r(4, 14), 2 * r(1, 6), r(5, 30)], A = ((a + b) * h) / 2;
    return { prompt: `A prism is ${L} cm long. Its cross-section is a trapezium with parallel sides ${a} cm and ${b} cm and height ${h} cm. Find its volume in cm³.`, answers: [String(A * L)], hint: "Find the area of the trapezium first.", solution: `Cross-section = ½ × (${a} + ${b}) × ${h} = ${A} cm². Volume = ${A} × ${L} = ${A * L} cm³.` };
  }),
  T(`${U}-f7`, "foundational", ["9Gg.05"], "Find the surface area of a triangular prism", () => {
    const [p, q, s] = pick(TRIPLES), L = r(4, 20), S = p * q + (p + q + s) * L;
    return { prompt: `A prism is ${L} cm long. Its cross-section is a right-angled triangle with sides ${p} cm, ${q} cm and ${s} cm. Find its total surface area in cm².`, answers: [String(S)], hint: "Two triangles plus three rectangles.", solution: `Triangles: 2 × ½ × ${p} × ${q} = ${p * q}. Rectangles: (${p} + ${q} + ${s}) × ${L} = ${(p + q + s) * L}. Total = ${S} cm².` };
  }),
  T(`${U}-f8`, "foundational", ["9Gg.04"], "Find the capacity of a cylinder in litres", () => {
    const rad = r(5, 20), h = r(10, 40), V = Math.PI * rad * rad * h, L = V / 1000;
    return { prompt: `A cylindrical tank has radius ${rad} cm and height ${h} cm. How many litres does it hold? ${DP1} (1 litre = 1000 cm³)`, answers: [ans(roundDP(L, 1))], hint: "Find the volume in cm³, then divide by 1000.", solution: `V = π × ${rad}² × ${h} = ${long(V)}… cm³ = ${long(L)}… litres ≈ ${oneDP(L)} litres.` };
  }),
  T(`${U}-f9`, "foundational", ["9Gg.05"], "Find the curved surface area of a cylinder", () => {
    const rad = r(2, 12), h = r(3, 30), C = 2 * Math.PI * rad * h;
    return { prompt: `A label covers the curved surface of a tin with radius ${rad} cm and height ${h} cm. Find the area of the label in cm². ${DP1}`, answers: [ans(roundDP(C, 1))], hint: "Unrolled, the label is a rectangle: circumference × height.", solution: `2 × π × ${rad} × ${h} = ${long(C)}… ≈ ${oneDP(C)} cm².` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Gg.04"], "Find the height of a cylinder from its volume", () => {
    const rad = r(2, 10), V = r(200, 3000), h = V / (Math.PI * rad * rad);
    return { prompt: `A cylinder has radius ${rad} cm and volume ${big(V)} cm³. Find its height in cm. ${DP1}`, answers: [ans(roundDP(h, 1))], hint: "h = V ÷ (πr²).", solution: `πr² = π × ${rad}² = ${long(Math.PI * rad * rad)}…; h = ${big(V)} ÷ ${long(Math.PI * rad * rad)}… = ${long(h)}… ≈ ${oneDP(h)} cm.` };
  }),
  T(`${U}-a2`, "application", ["9Gg.04"], "Work out how many containers can be filled", () => {
    const rad = r(3, 6), h = r(8, 15), cup = Math.PI * rad * rad * h, jug = pick([2, 3, 5]) * 1000, n = Math.floor(jug / cup);
    return { prompt: `A cylindrical cup has radius ${rad} cm and height ${h} cm. How many cups can be completely filled from ${jug / 1000} litres of juice? (1 litre = 1000 cm³)`, answers: [String(n)], hint: "Find the volume of one cup, then divide.", solution: `One cup = π × ${rad}² × ${h} = ${long(cup)}… cm³. ${big(jug)} ÷ ${long(cup)}… = ${long(jug / cup)}…, so ${n} full cups.` };
  }),
  T(`${U}-a3`, "application", ["9Gg.05"], "Find the surface area of a square-based pyramid", () => {
    const b = r(3, 14), s = b + r(1, 8), S = b * b + 2 * b * s;
    return { prompt: `A square-based pyramid has a base of side ${b} cm. Each triangular face has a perpendicular height of ${s} cm. Find its total surface area in cm².`, answers: [String(S)], hint: "The base plus four identical triangles.", solution: `Base = ${b * b}. Each triangle = ½ × ${b} × ${s} = ${fmt((b * s) / 2)}. Total = ${b * b} + 4 × ${fmt((b * s) / 2)} = ${S} cm².` };
  }),
  T(`${U}-a4`, "application", ["9Gg.06"], "Count planes of symmetry of a cuboid", () => {
    const kind = pick(["different", "square", "cube"] as const), a = r(2, 9), b = kind === "different" ? a + r(1, 4) : a, c = kind === "cube" ? a : a + r(5, 8);
    const n = kind === "cube" ? 9 : kind === "square" ? 5 : 3;
    return { prompt: `How many planes of symmetry does a cuboid measuring ${a} cm by ${b} cm by ${c} cm have?`, answers: [String(n)], hint: "Every cuboid has 3; square faces give extra diagonal planes.", solution: kind === "cube" ? "All faces are squares: it is a cube, with 3 + 6 = 9 planes." : kind === "square" ? "It has two square ends, which add 2 diagonal planes: 3 + 2 = 5." : "All three lengths are different, so there are just 3 planes." };
  }),
  T(`${U}-a5`, "application", ["9Gg.05"], "Find the surface area of an open cylinder", () => {
    const rad = r(3, 12), h = r(5, 25), S = Math.PI * rad * rad + 2 * Math.PI * rad * h;
    return { prompt: `A cylindrical tin with no lid has radius ${rad} cm and height ${h} cm. Find the area of metal needed to make it, in cm². ${DP1}`, answers: [ans(roundDP(S, 1))], hint: "One circle (the base) plus the curved surface.", solution: `π × ${rad}² + 2 × π × ${rad} × ${h} = ${long(Math.PI * rad * rad)}… + ${long(2 * Math.PI * rad * h)}… ≈ ${oneDP(S)} cm².` };
  }),
  T(`${U}-a6`, "application", ["9Gg.04"], "Find the volume of an L-shaped prism", () => {
    const [W, H] = [r(6, 14), r(6, 14)], [w, h] = [r(2, W - 3), r(2, H - 3)], A = W * H - w * h, L = r(4, 20);
    return { prompt: `A prism is ${L} cm long. Its cross-section is an L-shape made by cutting a ${w} cm by ${h} cm rectangle from the corner of a ${W} cm by ${H} cm rectangle. Find its volume in cm³.`, answers: [String(A * L)], hint: "Find the area of the L-shape, then multiply by the length.", solution: `Cross-section = ${W * H} − ${w * h} = ${A} cm². Volume = ${A} × ${L} = ${A * L} cm³.` };
  }),
  T(`${U}-a7`, "application", ["9Gg.04"], "Find the length of a prism from its volume", () => {
    const A = r(6, 50), L = r(3, 25);
    return { prompt: `A prism has a cross-section of area ${A} cm² and a volume of ${A * L} cm³. How long is it, in cm?`, answers: [String(L)], hint: "Length = volume ÷ area of cross-section.", solution: `${A * L} ÷ ${A} = ${L} cm.` };
  }),
  T(`${U}-a8`, "application", ["9Gg.06"], "Choose the solid with a given number of planes of symmetry", () => {
    const [right, n] = pick(PLANES), others = shuffle(PLANES.filter(([, k]) => k !== n)).slice(0, 2).map(([s]) => s), options = shuffle([right, ...others]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `Which of these has exactly ${n} planes of symmetry? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join("; ")}.`, answers: [letter], hint: "Count the planes that cut each solid into mirror-image halves.", solution: `${letter}: ${right} has ${n} planes of symmetry.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a9`, "application", ["9Gg.05", "9Gg.04"], "Find a cube's surface area from its volume", () => {
    const s = r(2, 12);
    return { prompt: `A cube has a volume of ${s ** 3} cm³. Find its surface area in cm².`, answers: [String(6 * s * s)], hint: "Find the edge length with a cube root first.", solution: `Edge = ∛${s ** 3} = ${s} cm. Surface area = 6 × ${s}² = ${6 * s * s} cm².` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Gg.04"], "Compare the volumes of a cylinder and a cuboid", () => {
    for (;;) {
      const rad = r(3, 8), h = r(5, 15), [l, w, d] = [r(4, 15), r(4, 15), r(4, 15)], vc = Math.PI * rad * rad * h, vb = l * w * d;
      if (Math.abs(vc - vb) / Math.min(vc, vb) < 0.05) continue;
      const bigger = vc > vb ? "A" : "B";
      return { prompt: `Which container holds more? A: a cylinder with radius ${rad} cm and height ${h} cm. B: a cuboid ${l} cm by ${w} cm by ${d} cm.`, answers: [bigger], hint: "Work out both volumes.", solution: `A: π × ${rad}² × ${h} ≈ ${oneDP(vc)} cm³. B: ${l} × ${w} × ${d} = ${vb} cm³. ${bigger} holds more.`, answerFormat: "Enter A or B." };
    }
  }),
  T(`${U}-r2`, "reasoning", ["9Gg.05"], "Work out how much paint is needed", () => {
    const [l, w, h] = [r(10, 40), r(10, 30), r(10, 30)], S = 2 * (l * w + l * h + w * h), cover = pick([500, 1000, 1500]), tins = Math.ceil(S / cover);
    return { prompt: `A closed box ${l} cm × ${w} cm × ${h} cm is painted on the outside. One small tin of paint covers ${big(cover)} cm². How many tins are needed?`, answers: [String(tins)], hint: "Find the surface area, then divide and round up.", solution: `Surface area = ${big(S)} cm². ${big(S)} ÷ ${big(cover)} = ${fmt(roundDP(S / cover, 2))}, so ${tins} tins are needed (round up).` };
  }),
  T(`${U}-r3`, "reasoning", ["9Gg.04"], "Pour water from a cuboid into a cylinder", () => {
    const [l, w, d] = [r(5, 15), r(5, 15), r(3, 10)], rad = r(4, 9), V = l * w * d, h = V / (Math.PI * rad * rad);
    return { prompt: `A cuboid tank ${l} cm × ${w} cm × ${d} cm is full of water. All the water is poured into an empty cylinder of radius ${rad} cm. How deep is the water in the cylinder, in cm? ${DP1}`, answers: [ans(roundDP(h, 1))], hint: "The volume stays the same: V = πr²h.", solution: `Volume = ${V} cm³. Depth = ${V} ÷ (π × ${rad}²) = ${long(h)}… ≈ ${oneDP(h)} cm.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Gg.06"], "Find the planes of symmetry of a regular prism", () => {
    const n = r(5, 12);
    return { prompt: `A prism has a regular ${n}-sided polygon as its cross-section. How many planes of symmetry does it have?`, answers: [String(n + 1)], hint: "Each line of symmetry of the cross-section gives a plane along the prism; there is also one plane across the middle.", solution: `The regular ${n}-gon has ${n} lines of symmetry, giving ${n} planes along the length, plus 1 plane cutting across the middle: ${n + 1}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Gg.04"], "Find the radius of a cylinder from its volume", () => {
    const h = r(5, 20), V = r(300, 5000), rad = Math.sqrt(V / (Math.PI * h));
    return { prompt: `A cylinder has height ${h} cm and volume ${big(V)} cm³. Find its radius in cm. ${DP1}`, answers: [ans(roundDP(rad, 1))], hint: "r² = V ÷ (πh), then take the square root.", solution: `r² = ${big(V)} ÷ (π × ${h}) = ${long(V / (Math.PI * h))}…, so r = ${long(rad)}… ≈ ${oneDP(rad)} cm.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Gg.05"], "Compare the surface areas of two cylinders", () => {
    for (;;) {
      const [r1, h1, r2, h2] = [r(2, 8), r(4, 20), r(2, 8), r(4, 20)], S = (a: number, b: number) => 2 * Math.PI * a * a + 2 * Math.PI * a * b, [s1, s2] = [S(r1, h1), S(r2, h2)];
      if (Math.abs(s1 - s2) / Math.min(s1, s2) < 0.05) continue;
      const bigger = s1 > s2 ? "A" : "B";
      return { prompt: `Which closed cylinder has the larger total surface area? A: radius ${r1} cm, height ${h1} cm. B: radius ${r2} cm, height ${h2} cm.`, answers: [bigger], hint: "Surface area = 2πr² + 2πrh for each.", solution: `A ≈ ${oneDP(s1)} cm² and B ≈ ${oneDP(s2)} cm², so ${bigger} is larger.`, answerFormat: "Enter A or B." };
    }
  }),
  T(`${U}-r7`, "reasoning", ["9Gg.04"], "Find the volume of a pipe", () => {
    const R = r(4, 12), rr = r(2, R - 1), L = r(20, 200), V = Math.PI * (R * R - rr * rr) * L;
    return { prompt: `A pipe is ${L} cm long. Its outer radius is ${R} cm and its inner radius is ${rr} cm. Find the volume of material in the pipe, in cm³. ${DP1}`, answers: [ans(roundDP(V, 1))], hint: "The cross-section is a ring: π(R² − r²).", solution: `π × (${R}² − ${rr}²) × ${L} = π × ${R * R - rr * rr} × ${L} = ${long(V)}… ≈ ${oneDP(V)} cm³.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Gg.05"], "Find a missing dimension from a surface area", () => {
    const [l, w, h] = [r(2, 12), r(2, 12), r(2, 12)], S = 2 * (l * w + l * h + w * h);
    return { prompt: `A cuboid has length ${l} cm, width ${w} cm and a surface area of ${S} cm². Find its height in cm.`, answers: [String(h)], hint: "S = 2(lw + lh + wh). Substitute, then solve for h.", solution: `${S} = 2(${l * w} + ${l}h + ${w}h), so ${S / 2} = ${l * w} + ${l + w}h, ${l + w}h = ${S / 2 - l * w} and h = ${h} cm.` };
  }),
];
