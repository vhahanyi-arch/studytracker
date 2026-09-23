// Stage 9, unit 7: Shapes and measurements (9Gg.01, 9Gg.02, 9Gg.03, 9Gg.10).
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, big, roundDP } from "../kit";

const U = "s9-u7";
const DP1 = "Give your answer correct to 1 decimal place.";
const PI = "Use the π button on your calculator.";

const oneDP = (x: number) => fmt(roundDP(x, 1));
const long = (x: number) => fmt(roundDP(x, 3));
const TRIPLES: Array<[number, number, number]> = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [15, 20, 25], [10, 24, 26]];

// Units a thousand apart, from very small to very large.
const CHAINS: Array<[string, string[]]> = [
  ["length", ["nm", "μm", "mm", "m", "km"]],
  ["mass", ["μg", "mg", "g", "kg", "tonnes"]],
  ["capacity", ["ml", "litres", "kilolitres", "megalitres"]],
];

export const s9u7: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Gg.01"], "Find the area of a circle from its radius", () => {
    const rad = r(2, 30) + pick([0, 0, 0.5]), A = Math.PI * rad * rad;
    return { prompt: `Find the area of a circle with radius ${fmt(rad)} cm, in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: `Area = πr². ${PI}`, solution: `A = π × ${fmt(rad)}² = ${long(A)}… ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-f2`, "foundational", ["9Gg.01"], "Find the area of a circle from its diameter", () => {
    const d = 2 * r(2, 25), A = Math.PI * (d / 2) ** 2;
    return { prompt: `A circular rug has a diameter of ${d} cm. Find its area in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Halve the diameter to get the radius, then use A = πr².", solution: `r = ${d} ÷ 2 = ${d / 2} cm. A = π × ${d / 2}² = ${long(A)}… ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-f3`, "foundational", ["9Gg.01"], "Find the circumference of a circle", () => {
    const rad = r(2, 40), C = 2 * Math.PI * rad;
    return { prompt: `Find the circumference of a circle with radius ${rad} m, in metres. ${DP1}`, answers: [ans(roundDP(C, 1))], hint: "C = 2πr (or π × diameter).", solution: `C = 2 × π × ${rad} = ${long(C)}… ≈ ${oneDP(C)} m.` };
  }),
  T(`${U}-f4`, "foundational", ["9Gg.02"], "Convert between very small or very large units", () => {
    const [, units] = pick(CHAINS), i = r(0, units.length - 2), up = pick([true, false]);
    const [from, to] = up ? [units[i], units[i + 1]] : [units[i + 1], units[i]];
    const x = up ? pick([r(2, 90) * 100, r(15, 950) * 10, r(2, 9) * 1000 + r(1, 9) * 100]) : r(2, 90) / pick([1, 10]);
    const v = up ? x / 1000 : x * 1000;
    return { prompt: `Convert ${big(x)} ${from} to ${to}.`, answers: [ans(v)], hint: `1 ${units[i + 1].replace(/s$/, "")} = 1000 ${units[i]}.`, solution: `${up ? "Divide" : "Multiply"} by 1000: ${big(x)} ${from} = ${big(v)} ${to}.` };
  }),
  T(`${U}-f5`, "foundational", ["9Gg.03"], "Find the area of an L-shape", () => {
    const [W, H] = [r(8, 20), r(8, 20)], [w, h] = [r(2, W - 3), r(2, H - 3)], area = W * H - w * h;
    return { prompt: `An L-shape is made by cutting a ${w} cm by ${h} cm rectangle from one corner of a ${W} cm by ${H} cm rectangle. Find its area in cm².`, answers: [String(area)], hint: "Find the big rectangle's area and subtract the piece cut out.", solution: `${W} × ${H} − ${w} × ${h} = ${W * H} − ${w * h} = ${area} cm².` };
  }),
  T(`${U}-f6`, "foundational", ["9Gg.10"], "Find the hypotenuse with Pythagoras' theorem", () => {
    const [a, b, c] = pick(TRIPLES), [p, q] = shuffle([a, b]);
    return { prompt: `A right-angled triangle has shorter sides of ${p} cm and ${q} cm. Find the length of the hypotenuse in cm.`, answers: [String(c)], hint: "c² = a² + b², where c is the hypotenuse.", solution: `c² = ${p}² + ${q}² = ${p * p} + ${q * q} = ${c * c}, so c = √${c * c} = ${c} cm.` };
  }),
  T(`${U}-f7`, "foundational", ["9Gg.10"], "Find a shorter side with Pythagoras' theorem", () => {
    const [a, b, c] = pick(TRIPLES), [known, unknown] = pick([[a, b], [b, a]]);
    return { prompt: `A right-angled triangle has a hypotenuse of ${c} cm and one other side of ${known} cm. Find the length of the third side in cm.`, answers: [String(unknown)], hint: "Rearrange c² = a² + b²: a² = c² − b².", solution: `a² = ${c}² − ${known}² = ${c * c} − ${known * known} = ${unknown * unknown}, so a = ${unknown} cm.` };
  }),
  T(`${U}-f8`, "foundational", ["9Gg.03"], "Find the area of a rectangle and triangle together", () => {
    const [w, h, t] = [r(4, 16), r(3, 12), r(2, 10)], area = w * h + (w * t) / 2;
    return { prompt: `A shape is a rectangle ${w} m wide and ${h} m tall, with a triangle on top. The triangle's base is the top of the rectangle and its height is ${t} m. Find the total area in m².`, answers: [ans(area)], hint: "Add the rectangle's area to the triangle's area (½ × base × height).", solution: `${w} × ${h} + ½ × ${w} × ${t} = ${w * h} + ${fmt((w * t) / 2)} = ${fmt(area)} m².` };
  }),
  T(`${U}-f9`, "foundational", ["9Gg.02"], "Choose a sensible unit", () => {
    const [thing, unit, others] = pick([
      ["the mass of a grain of salt", "mg", ["kg", "tonnes"]],
      ["the mass of a lorry", "tonnes", ["mg", "g"]],
      ["the width of a human hair", "μm", ["km", "m"]],
      ["the volume of water in a reservoir", "megalitres", ["ml", "litres"]],
      ["the size of a virus", "nm", ["mm", "cm"]],
      ["the dose of a medicine tablet", "mg", ["kg", "tonnes"]],
    ] as const);
    const options = shuffle([unit, ...others]), letter = "ABC"[options.indexOf(unit)];
    return { prompt: `Which unit is most sensible for ${thing}? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(", ")}.`, answers: [letter, unit], hint: "Think about how big or small the quantity is.", solution: `${letter}: ${unit} suits ${thing}.`, answerFormat: "Enter the letter of your choice." };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Gg.01"], "Find the area of a semicircle", () => {
    const d = 2 * r(2, 20), A = (Math.PI * (d / 2) ** 2) / 2;
    return { prompt: `Find the area of a semicircle with diameter ${d} cm, in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Half of the area of the full circle.", solution: `r = ${d / 2}. Area = ½ × π × ${d / 2}² = ${long(A)}… ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-a2`, "application", ["9Gg.01"], "Find a radius from an area", () => {
    const A = r(20, 900), rad = Math.sqrt(A / Math.PI);
    return { prompt: `A circle has an area of ${A} cm². Find its radius in cm. ${DP1}`, answers: [ans(roundDP(rad, 1))], hint: "A = πr², so r = √(A ÷ π).", solution: `r² = ${A} ÷ π = ${long(A / Math.PI)}…, so r = ${long(rad)}… ≈ ${oneDP(rad)} cm.` };
  }),
  T(`${U}-a3`, "application", ["9Gg.10"], "Find a hypotenuse that is not a whole number", () => {
    const [p, q] = [r(2, 15), r(2, 15)], c = Math.sqrt(p * p + q * q);
    if (Number.isInteger(c)) return s9u7.find((t) => t.id === `${U}-a3`)!.make();
    return { prompt: `A right-angled triangle has shorter sides of ${p} cm and ${q} cm. Find the hypotenuse in cm. ${DP1}`, answers: [ans(roundDP(c, 1))], hint: "c² = a² + b², then take the square root.", solution: `c² = ${p * p} + ${q * q} = ${p * p + q * q}, so c = √${p * p + q * q} = ${long(c)}… ≈ ${oneDP(c)} cm.` };
  }),
  T(`${U}-a4`, "application", ["9Gg.10"], "Decide whether a triangle is right-angled", () => {
    const [a, b, c] = pick(TRIPLES), ok = pick([true, false]), cc = ok ? c : c + pick([-1, 1]);
    return { prompt: `A triangle has sides ${a} cm, ${b} cm and ${cc} cm. Is it right-angled? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Check whether the square of the longest side equals the sum of the squares of the other two.", solution: `${a}² + ${b}² = ${a * a + b * b} and ${cc}² = ${cc * cc}. ${ok ? "Yes: they are equal." : "No: they are not equal."}`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-a5`, "application", ["9Gg.03", "9Gg.01"], "Find the area of a rectangle with a semicircle", () => {
    const [L, w] = [r(6, 20), 2 * r(2, 6)], A = L * w + (Math.PI * (w / 2) ** 2) / 2;
    return { prompt: `A window is a rectangle ${L} dm tall and ${w} dm wide, with a semicircle on top whose diameter is the width of the window. Find the total area in dm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Rectangle area + half a circle of radius (width ÷ 2).", solution: `${L} × ${w} = ${L * w}; semicircle = ½ × π × ${w / 2}² = ${long((Math.PI * (w / 2) ** 2) / 2)}…. Total ≈ ${oneDP(A)} dm².` };
  }),
  T(`${U}-a6`, "application", ["9Gg.03", "9Gg.01"], "Find a shaded area between a square and a circle", () => {
    const s = 2 * r(2, 12), A = s * s - Math.PI * (s / 2) ** 2;
    return { prompt: `A circle fits exactly inside a square of side ${s} cm, touching all four sides. Find the area of the square that is outside the circle, in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "The circle's diameter equals the side of the square.", solution: `Square = ${s * s}; circle = π × ${s / 2}² = ${long(Math.PI * (s / 2) ** 2)}…. Difference ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-a7`, "application", ["9Gg.02"], "Convert across two units", () => {
    const [, units] = pick(CHAINS), i = r(0, units.length - 3), x = pick([r(2, 90), r(2, 9) / 10, r(11, 99) / 10]);
    const [from, to] = [units[i + 2], units[i]], v = x * 1e6;
    return { prompt: `Convert ${fmt(x)} ${from} to ${to}.`, answers: [ans(v)], hint: `Go one step at a time: ${from} → ${units[i + 1]} → ${to}, multiplying by 1000 each time.`, solution: `${fmt(x)} ${from} = ${big(x * 1000)} ${units[i + 1]} = ${big(v)} ${to}.` };
  }),
  T(`${U}-a8`, "application", ["9Gg.10"], "Solve a ladder problem", () => {
    const L = r(4, 12), base = r(1, L - 2) + pick([0, 0.5]), h = Math.sqrt(L * L - base * base);
    return { prompt: `A ${L} m ladder leans against a vertical wall. Its foot is ${fmt(base)} m from the wall on level ground. How high up the wall does it reach, in metres? ${DP1}`, answers: [ans(roundDP(h, 1))], hint: "The ladder is the hypotenuse.", solution: `h² = ${L}² − ${fmt(base)}² = ${L * L} − ${fmt(base * base)} = ${fmt(L * L - base * base)}, so h = ${long(h)}… ≈ ${oneDP(h)} m.` };
  }),
  T(`${U}-a9`, "application", ["9Gg.01"], "Find the perimeter of a quarter circle", () => {
    const rad = r(3, 20), P = (2 * Math.PI * rad) / 4 + 2 * rad;
    return { prompt: `Find the perimeter of a quarter circle with radius ${rad} cm, in cm. ${DP1}`, answers: [ans(roundDP(P, 1))], hint: "A quarter of the circumference, plus two radii.", solution: `Curved edge = 2 × π × ${rad} ÷ 4 = ${long((2 * Math.PI * rad) / 4)}…; plus 2 × ${rad} = ${2 * rad}. Perimeter ≈ ${oneDP(P)} cm.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Gg.10"], "Find the distance between two points", () => {
    const [a, b, c] = pick(TRIPLES.filter(([, , h]) => h <= 17)), [dx, dy] = shuffle([a, b]), [x1, y1] = [r(-5, 5), r(-5, 5)];
    const [x2, y2] = [x1 + dx * pick([-1, 1]), y1 + dy * pick([-1, 1])];
    return { prompt: `Find the distance between the points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}).`, answers: [String(c)], hint: "Draw a right-angled triangle: the horizontal and vertical distances are the shorter sides.", solution: `Horizontal distance ${dx}, vertical distance ${dy}. d² = ${dx * dx} + ${dy * dy} = ${c * c}, so d = ${c}.` };
  }),
  T(`${U}-r2`, "reasoning", ["9Gg.01"], "Find an area from a circumference", () => {
    const C = r(20, 120), rad = C / (2 * Math.PI), A = Math.PI * rad * rad;
    return { prompt: `A circle has a circumference of ${C} cm. Find its area in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Find the radius from C = 2πr first. Do not round until the end.", solution: `r = ${C} ÷ (2π) = ${long(rad)}…; A = π × r² = ${long(A)}… ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-r3`, "reasoning", ["9Gg.03", "9Gg.01"], "Find the area of a ring", () => {
    const R = r(5, 20), rr = r(2, R - 2), A = Math.PI * (R * R - rr * rr);
    return { prompt: `A ring is the region between two circles with the same centre, of radii ${R} cm and ${rr} cm. Find its area in cm². ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Area of the large circle minus the area of the small one.", solution: `π × ${R}² − π × ${rr}² = π × ${R * R - rr * rr} = ${long(A)}… ≈ ${oneDP(A)} cm².` };
  }),
  T(`${U}-r4`, "reasoning", ["9Gg.10"], "Find the height of an isosceles triangle", () => {
    const [a, b, c] = pick(TRIPLES), [half, h] = pick([[a, b], [b, a]]);
    return { prompt: `An isosceles triangle has two sides of ${c} cm and a base of ${2 * half} cm. Find its perpendicular height in cm.`, answers: [String(h)], hint: "The height splits it into two right-angled triangles, each with half the base.", solution: `Half the base is ${half} cm. h² = ${c}² − ${half}² = ${c * c - half * half}, so h = ${h} cm.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Gg.02"], "Compare quantities in different units", () => {
    const [, units] = pick(CHAINS), i = r(0, units.length - 2), small = units[i], large = units[i + 1];
    // Both between 200 and 9900 of the smaller unit, so either can be larger.
    const a = r(2, 99) / 10, b = r(2, 99) * 100, aIn = Math.round(a * 1000);
    if (Math.abs(aIn - b) < 1e-9) return s9u7.find((t) => t.id === `${U}-r5`)!.make();
    const bigger = aIn > b ? "A" : "B";
    return { prompt: `Which is more? A: ${fmt(a)} ${large} or B: ${big(b)} ${small}.`, answers: [bigger], hint: `Write both in ${small}: 1 ${large.replace(/s$/, "")} = 1000 ${small}.`, solution: `${fmt(a)} ${large} = ${big(aIn)} ${small}, and ${big(aIn)} is ${aIn > b ? "more" : "less"} than ${big(b)}, so ${bigger} is more.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-r6`, "reasoning", ["9Gg.01"], "Give an exact area in terms of π", () => {
    const rad = r(2, 15), useD = pick([true, false]);
    return { prompt: `A circle has ${useD ? `a diameter of ${2 * rad}` : `a radius of ${rad}`} cm. Write its exact area in terms of π, in cm².`, answers: [`${rad * rad}π`, `${rad * rad}pi`, `${rad * rad}*π`, `π${rad * rad}`], hint: "Leave π as a symbol: do not multiply it out.", solution: `A = π × ${rad}² = ${rad * rad}π cm².`, answerFormat: "Enter the area using π (or pi), for example 36π." };
  }),
  T(`${U}-r7`, "reasoning", ["9Gg.03"], "Find the area of a garden with a pond", () => {
    const [L, W] = [r(10, 30), r(8, 20)], d = 2 * r(1, Math.floor(Math.min(L, W) / 4)), A = L * W - Math.PI * (d / 2) ** 2;
    return { prompt: `A rectangular garden is ${L} m by ${W} m. It has a circular pond of diameter ${d} m. What area of the garden is not pond, in m²? ${DP1}`, answers: [ans(roundDP(A, 1))], hint: "Rectangle area minus the circle's area.", solution: `${L} × ${W} = ${L * W}; pond = π × ${d / 2}² = ${long(Math.PI * (d / 2) ** 2)}…. ${L * W} − ${long(Math.PI * (d / 2) ** 2)}… ≈ ${oneDP(A)} m².` };
  }),
  T(`${U}-r8`, "reasoning", ["9Gg.10"], "Use Pythagoras' theorem twice", () => {
    const [a, b, c] = pick(TRIPLES), [x, y] = shuffle([a, b]), q = r(3, 20), s = Math.sqrt(c * c + q * q), whole = Number.isInteger(s);
    return { prompt: `Triangle ABC is right-angled at B, with AB = ${x} cm and BC = ${y} cm. Triangle ACD is right-angled at C, with CD = ${q} cm. Find AD in cm.${whole ? "" : ` ${DP1}`}`, answers: [ans(roundDP(s, 1))], hint: "Find AC first; it is a side of the second triangle.", solution: `AC² = ${x}² + ${y}² = ${c * c}, so AC = ${c}. AD² = ${c}² + ${q}² = ${c * c + q * q}, so AD = ${whole ? `${s} cm` : `√${c * c + q * q} = ${long(s)}… ≈ ${oneDP(s)} cm`}.` };
  }),
];
