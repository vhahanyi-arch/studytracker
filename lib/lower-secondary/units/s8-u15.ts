// Stage 8, unit 15: Distance, area and volume (8Gg.02, 8Gg.03, 8Gg.04, 8Gg.06, 8Gg.08).
// The area of a circle is Stage 9 (9Gg.01); Stage 8 uses circumference only.
import { T, type Template } from "../engine";
import { r, pick, fmt, ans, roundDP, big } from "../kit";

const U = "s8-u15";
const DP1 = "Give your answer correct to 1 decimal place.";
const PI = "Use the π button on your calculator, or π ≈ 3.142.";

/** A value correct to 1 decimal place, shown with the unrounded working. */
const oneDP = (x: number) => fmt(roundDP(x, 1));
const long = (x: number) => fmt(roundDP(x, 3));
// Right-angled triangles with whole-number sides, for prisms whose faces all need lengths.
const TRIPLES: Array<[number, number, number]> = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];

export const s8u15: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Gg.02"], "Find a circumference from the diameter", () => {
    const d = r(3, 60) + pick([0, 0, 0.5]), C = Math.PI * d;
    const thing = pick(["plate", "clock face", "coin", "table top", "wheel"]);
    return { prompt: `A circular ${thing} has a diameter of ${fmt(d)} cm. Find its circumference in cm. ${DP1}`, answers: [ans(roundDP(C, 1))], hint: `Circumference = π × diameter. ${PI}`, solution: `C = π × ${fmt(d)} = ${long(C)}… ≈ ${oneDP(C)} cm.` };
  }),
  T(`${U}-f2`, "foundational", ["8Gg.02"], "Find a circumference from the radius", () => {
    const rad = r(2, 40), C = 2 * Math.PI * rad;
    return { prompt: `A circle has a radius of ${rad} cm. Find its circumference in cm. ${DP1}`, answers: [ans(roundDP(C, 1))], hint: "The diameter is twice the radius, and circumference = π × diameter.", solution: `Diameter = 2 × ${rad} = ${2 * rad} cm, so C = π × ${2 * rad} = ${long(C)}… ≈ ${oneDP(C)} cm.` };
  }),
  T(`${U}-f3`, "foundational", ["8Gg.03"], "Convert miles to kilometres", () => {
    const miles = 5 * r(1, 40);
    return { prompt: `Use 5 miles ≈ 8 km to convert ${miles} miles to kilometres.`, answers: [String((miles / 5) * 8)], hint: "Find how many lots of 5 miles there are.", solution: `${miles} ÷ 5 = ${miles / 5}, and ${miles / 5} × 8 = ${(miles / 5) * 8}, so ${miles} miles ≈ ${(miles / 5) * 8} km.` };
  }),
  T(`${U}-f4`, "foundational", ["8Gg.03"], "Convert kilometres to miles", () => {
    const km = 8 * r(1, 40);
    return { prompt: `Use 5 miles ≈ 8 km to convert ${km} km to miles.`, answers: [String((km / 8) * 5)], hint: "Find how many lots of 8 km there are.", solution: `${km} ÷ 8 = ${km / 8}, and ${km / 8} × 5 = ${(km / 8) * 5}, so ${km} km ≈ ${(km / 8) * 5} miles.` };
  }),
  T(`${U}-f5`, "foundational", ["8Gg.04"], "Find the area of a parallelogram", () => {
    const b = r(4, 20), h = r(3, 15), slant = h + r(1, 5);
    return { prompt: `A parallelogram has a base of ${b} cm, a perpendicular height of ${h} cm and slanting sides of ${slant} cm. Find its area in cm².`, answers: [String(b * h)], hint: "Area of a parallelogram = base × perpendicular height. The slanting side is not needed.", solution: `Area = ${b} × ${h} = ${b * h} cm².` };
  }),
  T(`${U}-f6`, "foundational", ["8Gg.04"], "Find the area of a trapezium", () => {
    const a = r(3, 14), b = a + r(1, 10), h = r(2, 12);
    const area = ((a + b) * h) / 2;
    return { prompt: `A trapezium has parallel sides of ${a} cm and ${b} cm, and a perpendicular height of ${h} cm. Find its area in cm².`, answers: [ans(area)], hint: "Area of a trapezium = ½ × (sum of the parallel sides) × height.", solution: `Area = ½ × (${a} + ${b}) × ${h} = ½ × ${a + b} × ${h} = ${fmt(area)} cm².` };
  }),
  T(`${U}-f7`, "foundational", ["8Gg.06"], "Find the volume of a triangular prism", () => {
    const b = r(2, 12), h = r(2, 12), L = r(3, 25), A = (b * h) / 2;
    return { prompt: `A triangular prism is ${L} cm long. Its cross-section is a triangle with base ${b} cm and perpendicular height ${h} cm. Find its volume in cm³.`, answers: [ans(A * L)], hint: "Volume of a prism = area of cross-section × length.", solution: `Cross-section = ½ × ${b} × ${h} = ${fmt(A)} cm². Volume = ${fmt(A)} × ${L} = ${fmt(A * L)} cm³.` };
  }),
  T(`${U}-f8`, "foundational", ["8Gg.08"], "Find the surface area of a cube or cuboid", () => {
    if (pick([true, false])) {
      const s = r(2, 15);
      return { prompt: `Find the surface area of a cube with edges of ${s} cm, in cm².`, answers: [String(6 * s * s)], hint: "A cube has 6 identical square faces.", solution: `One face is ${s} × ${s} = ${s * s} cm², so the surface area is 6 × ${s * s} = ${6 * s * s} cm².` };
    }
    const [l, w, h] = [r(3, 15), r(2, 10), r(2, 10)], sa = 2 * (l * w + l * h + w * h);
    return { prompt: `Find the surface area of a cuboid ${l} cm long, ${w} cm wide and ${h} cm high, in cm².`, answers: [String(sa)], hint: "A cuboid has three pairs of identical rectangular faces.", solution: `2 × (${l} × ${w} + ${l} × ${h} + ${w} × ${h}) = 2 × (${l * w} + ${l * h} + ${w * h}) = ${sa} cm².` };
  }),
  T(`${U}-f9`, "foundational", ["8Gg.02"], "Estimate π from measurements", () => {
    const d = r(40, 250) / 10, C = roundDP(Math.PI * d, 1), q = roundDP(C / d, 2);
    const thing = pick(["tin", "bicycle wheel", "bowl", "plate", "hoop"]);
    return { prompt: `The circumference of a round ${thing} is measured as ${fmt(C)} cm and its diameter as ${fmt(d)} cm. Work out circumference ÷ diameter, correct to 2 decimal places.`, answers: [ans(q)], hint: "Divide the circumference by the diameter. For every circle this ratio is π.", solution: `${fmt(C)} ÷ ${fmt(d)} = ${long(C / d)}… ≈ ${fmt(q)}, very close to π = 3.14159…` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Gg.02"], "Find a diameter from the circumference", () => {
    const C = r(30, 300) + pick([0, 0.5]), d = C / Math.PI;
    return { prompt: `A circle has a circumference of ${fmt(C)} cm. Find its diameter in cm. ${DP1}`, answers: [ans(roundDP(d, 1))], hint: "Circumference = π × diameter, so diameter = circumference ÷ π.", solution: `d = ${fmt(C)} ÷ π = ${long(d)}… ≈ ${oneDP(d)} cm.` };
  }),
  T(`${U}-a2`, "application", ["8Gg.02"], "Find the perimeter of a semicircle", () => {
    const d = 2 * r(2, 20), P = (Math.PI * d) / 2 + d;
    return { prompt: `A semicircle has a diameter of ${d} cm. Find its perimeter in cm, including the straight edge. ${DP1}`, answers: [ans(roundDP(P, 1))], hint: "Half the circumference, plus the diameter.", solution: `Curved part = π × ${d} ÷ 2 = ${long((Math.PI * d) / 2)}… cm. Perimeter = ${long((Math.PI * d) / 2)}… + ${d} ≈ ${oneDP(P)} cm.` };
  }),
  T(`${U}-a3`, "application", ["8Gg.03"], "Compare distances in miles and kilometres", () => {
    const miles = 5 * r(2, 20), kmMiles = (miles / 5) * 8;
    let km = kmMiles + r(-30, 30);
    if (km === kmMiles) km += 5;
    if (km <= 0) km = kmMiles + 7;
    const diff = Math.abs(kmMiles - km), further = kmMiles > km ? `${miles} miles` : `${km} km`;
    return { prompt: `Route A is ${miles} miles long. Route B is ${km} km long. Using 5 miles ≈ 8 km, how many kilometres longer is the longer route?`, answers: [String(diff)], hint: "Convert the miles to kilometres first, then subtract.", solution: `${miles} miles ≈ ${miles / 5} × 8 = ${kmMiles} km. ${further} is longer, by ${Math.max(kmMiles, km)} − ${Math.min(kmMiles, km)} = ${diff} km.` };
  }),
  T(`${U}-a4`, "application", ["8Gg.04"], "Find the height of a parallelogram from its area", () => {
    const b = r(3, 16), h = r(2, 15);
    return { prompt: `A parallelogram has an area of ${b * h} cm² and a base of ${b} cm. Find its perpendicular height in cm.`, answers: [String(h)], hint: "Area = base × height, so height = area ÷ base.", solution: `Height = ${b * h} ÷ ${b} = ${h} cm.` };
  }),
  T(`${U}-a5`, "application", ["8Gg.04"], "Find a missing parallel side of a trapezium", () => {
    const a = r(2, 12), b = a + r(1, 10), h = 2 * r(1, 8), area = ((a + b) * h) / 2;
    return { prompt: `A trapezium has an area of ${area} cm² and a perpendicular height of ${h} cm. One of its parallel sides is ${b} cm. How long is the other parallel side, in cm?`, answers: [String(a)], hint: "Area = ½ × (a + b) × h. Find a + b first.", solution: `a + b = 2 × ${area} ÷ ${h} = ${a + b}, so the other side is ${a + b} − ${b} = ${a} cm.` };
  }),
  T(`${U}-a6`, "application", ["8Gg.06"], "Find a prism's volume from a right-angled cross-section", () => {
    const [p, q, hyp] = pick(TRIPLES), L = r(4, 30), A = (p * q) / 2;
    return { prompt: `A prism has a right-angled triangle as its cross-section, with sides ${p} cm, ${q} cm and ${hyp} cm. The prism is ${L} cm long. Find its volume in cm³.`, answers: [String(A * L)], hint: "The two shorter sides meet at the right angle, so they are the base and height.", solution: `Cross-section = ½ × ${p} × ${q} = ${A} cm². Volume = ${A} × ${L} = ${A * L} cm³.` };
  }),
  T(`${U}-a7`, "application", ["8Gg.08"], "Find the surface area of a triangular prism", () => {
    const [p, q, hyp] = pick(TRIPLES), L = r(4, 20), ends = p * q, sides = (p + q + hyp) * L;
    return { prompt: `A prism is ${L} cm long. Its cross-section is a right-angled triangle with sides ${p} cm, ${q} cm and ${hyp} cm. Find its total surface area in cm².`, answers: [String(ends + sides)], hint: "Two triangular ends, plus three rectangles, each as long as the prism.", solution: `Two ends: 2 × ½ × ${p} × ${q} = ${ends} cm². Three rectangles: (${p} + ${q} + ${hyp}) × ${L} = ${sides} cm². Total = ${ends + sides} cm².` };
  }),
  T(`${U}-a8`, "application", ["8Gg.08"], "Find the surface area of a square-based pyramid", () => {
    const b = r(2, 14), s = b + r(1, 8), base = b * b, tri = (b * s) / 2;
    return { prompt: `A square-based pyramid has a base of side ${b} cm. Each triangular face has a perpendicular height of ${s} cm. Find the total surface area in cm².`, answers: [ans(base + 4 * tri)], hint: "Add the square base to the four identical triangles.", solution: `Base = ${b} × ${b} = ${base} cm². Each triangle = ½ × ${b} × ${s} = ${fmt(tri)} cm². Total = ${base} + 4 × ${fmt(tri)} = ${fmt(base + 4 * tri)} cm².` };
  }),
  T(`${U}-a9`, "application", ["8Gg.06"], "Find the length of a prism from its volume", () => {
    const b = r(2, 12), h = 2 * r(1, 6), L = r(3, 20), A = (b * h) / 2;
    return { prompt: `A triangular prism has a volume of ${A * L} cm³. Its cross-section is a triangle with base ${b} cm and height ${h} cm. How long is the prism, in cm?`, answers: [String(L)], hint: "Length = volume ÷ area of the cross-section.", solution: `Cross-section = ½ × ${b} × ${h} = ${A} cm². Length = ${A * L} ÷ ${A} = ${L} cm.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Gg.02"], "Count the turns of a wheel", () => {
    const d = pick([50, 55, 60, 64, 66, 70, 71, 76]), km = pick([1, 2, 3, 5]);
    const C = Math.PI * d, turns = Math.floor((km * 100000) / C);
    return { prompt: `A bicycle wheel has a diameter of ${d} cm. How many complete turns does it make when the bicycle travels ${km} km?`, answers: [String(turns)], hint: "One turn moves the bicycle one circumference. Work in centimetres: 1 km = 100 000 cm.", solution: `One turn = π × ${d} = ${long(C)}… cm. ${km} km = ${big(km * 100000)} cm, and ${big(km * 100000)} ÷ ${long(C)}… = ${long((km * 100000) / C)}…, so ${turns} complete turns.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Gg.03"], "Compare a speed with a limit in miles per hour", () => {
    const limit = pick([20, 30, 40, 50, 60, 70]), limitKm = (limit / 5) * 8, over = r(3, 25), speed = limitKm + over;
    return { prompt: `The speed limit on a road is ${limit} miles per hour. A car travels at ${speed} km/h. Using 5 miles ≈ 8 km, by how many km/h is the car over the limit?`, answers: [String(over)], hint: "Convert the limit to km/h.", solution: `${limit} miles per hour ≈ ${limit / 5} × 8 = ${limitKm} km/h. ${speed} − ${limitKm} = ${over} km/h over.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Gg.04"], "Solve for a side of a trapezium", () => {
    const x = r(2, 12), d = r(1, 8), h = 2 * r(2, 6), area = ((2 * x + d) * h) / 2;
    return { prompt: `A trapezium has parallel sides of x cm and (x + ${d}) cm, and a perpendicular height of ${h} cm. Its area is ${area} cm². Find x.`, answers: [String(x)], hint: "Write an equation using area = ½ × (sum of parallel sides) × height.", solution: `½ × (2x + ${d}) × ${h} = ${area}, so ${h / 2}(2x + ${d}) = ${area}, 2x + ${d} = ${area / (h / 2)}, 2x = ${2 * x} and x = ${x}.`, answerFormat: "Enter the value of x." };
  }),
  T(`${U}-r4`, "reasoning", ["8Gg.04"], "Match the areas of a parallelogram and a trapezium", () => {
    for (;;) {
      const a = r(2, 12), c = r(2, 14), h = 2 * r(1, 8), area = ((a + c) * h) / 2, b = pick([2, 3, 4, 5, 6, 8, 10]);
      if (a === c || area % b !== 0) continue;
      return { prompt: `A trapezium has parallel sides ${a} cm and ${c} cm and height ${h} cm. A parallelogram with a base of ${b} cm has the same area. What is the perpendicular height of the parallelogram, in cm?`, answers: [String(area / b)], hint: "Find the trapezium's area first.", solution: `Trapezium area = ½ × (${a} + ${c}) × ${h} = ${area} cm². Parallelogram height = ${area} ÷ ${b} = ${area / b} cm.` };
    }
  }),
  T(`${U}-r5`, "reasoning", ["8Gg.06"], "Find the capacity of a prism-shaped trough", () => {
    const b = 10 * r(2, 6), h = 10 * r(2, 5), Lm = r(1, 4), vol = (b * h) / 2 * Lm * 100;
    return { prompt: `A water trough is a triangular prism ${Lm} m long. Its cross-section is a triangle with a top width of ${b} cm and a depth of ${h} cm. How many litres of water does it hold when full? (1 litre = 1000 cm³)`, answers: [ans(vol / 1000)], hint: "Work in centimetres: find the volume in cm³, then divide by 1000.", solution: `Cross-section = ½ × ${b} × ${h} = ${(b * h) / 2} cm². Length = ${Lm * 100} cm. Volume = ${big((b * h) / 2)} × ${Lm * 100} = ${big(vol)} cm³ = ${fmt(vol / 1000)} litres.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Gg.08"], "Work back from the surface area of a cube", () => {
    const s = r(2, 12), sa = 6 * s * s;
    return { prompt: `A cube has a surface area of ${sa} cm². Find its volume in cm³.`, answers: [String(s ** 3)], hint: "Find the area of one face, then the edge length.", solution: `One face = ${sa} ÷ 6 = ${s * s} cm², so each edge is √${s * s} = ${s} cm. Volume = ${s}³ = ${s ** 3} cm³.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Gg.08"], "Find the surface area of an open box", () => {
    const [l, w, h] = [r(10, 40), r(8, 30), r(5, 20)], sa = l * w + 2 * (l * h + w * h);
    return { prompt: `An open box (with no lid) is a cuboid ${l} cm long, ${w} cm wide and ${h} cm high. How much card is needed to make it, in cm²?`, answers: [String(sa)], hint: "There are five faces: the base and four sides.", solution: `Base = ${l} × ${w} = ${l * w}. Front and back = 2 × ${l} × ${h} = ${2 * l * h}. Ends = 2 × ${w} × ${h} = ${2 * w * h}. Total = ${sa} cm².` };
  }),
  T(`${U}-r8`, "reasoning", ["8Gg.02"], "Find the perimeter of a running track", () => {
    const L = 10 * r(5, 12), d = 10 * r(3, 8), P = 2 * L + Math.PI * d;
    return { prompt: `A running track is made of two straight sections, each ${L} m long, joined by two semicircles of diameter ${d} m. Find the total length of one lap in metres. ${DP1}`, answers: [ans(roundDP(P, 1))], hint: "Two semicircles make one full circle.", solution: `Straights = 2 × ${L} = ${2 * L} m. The two semicircles make a circle: π × ${d} = ${long(Math.PI * d)}… m. Total ≈ ${oneDP(P)} m.` };
  }),
];
