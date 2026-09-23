// Stage 8, unit 12: Ratio and proportion (8Nf.09, 8Nf.10, 8Nf.11).
import { T, type Template } from "../engine";
import { r, pick, gcd, fmt, ans, money, tidyNum } from "../kit";

const U = "s8-u12";
const RATIO_FORMAT = "Enter the ratio with a colon, for example 3:4.";

/** Two numbers with no common factor. */
const coprimePair = (lo: number, hi: number) => { for (;;) { const a = r(lo, hi), b = r(lo, hi); if (a !== b && gcd(a, b) === 1) return [a, b]; } };
const ratioAnswers = (parts: number[]) => [parts.join(":"), parts.join(" : ")];

/** A ratio pair in different units that simplifies nicely: e.g. 50 cm : 2 m -> 1:4. */
function unitRatio() {
  const [small, large, factor] = pick([["cm", "m", 100], ["g", "kg", 1000], ["ml", "litres", 1000], ["minutes", "hours", 60], ["mm", "cm", 10]] as const);
  const [a, b] = coprimePair(1, 9);
  const k = pick(factor === 60 ? [5, 10, 15, 20, 30] : factor === 10 ? [1, 2, 5] : [10, 20, 25, 50]);
  // a*k small-units : b*k small-units, with the second written in large units.
  const second = (b * k) / factor;
  if (!Number.isFinite(second) || Math.round(second * 1000) / 1000 !== second) return unitRatio();
  const unit = second === 1 ? ({ hours: "hour", litres: "litre" } as Record<string, string>)[large] ?? large : large;
  return { text: `${a * k} ${small} : ${fmt(second)} ${unit}`, simplified: [a, b], work: `${fmt(second)} ${unit} = ${b * k} ${small}, so ${a * k} : ${b * k} = ${a}:${b}` };
}

export const s8u12: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Nf.10"], "Simplify a ratio", () => {
    const [a, b] = coprimePair(1, 9), k = r(2, 12);
    return { prompt: `Simplify the ratio ${a * k}:${b * k}.`, answers: ratioAnswers([a, b]), hint: "Divide both parts by their highest common factor.", solution: `Both parts divide by ${k}, giving ${a}:${b}.`, answerFormat: RATIO_FORMAT };
  }),
  T(`${U}-f2`, "foundational", ["8Nf.10"], "Simplify a ratio with different units", () => {
    const u = unitRatio();
    return { prompt: `Simplify the ratio ${u.text}.`, answers: ratioAnswers(u.simplified), hint: "Write both quantities in the same unit first.", solution: `${u.work}.`, answerFormat: RATIO_FORMAT };
  }),
  T(`${U}-f3`, "foundational", ["8Nf.11"], "Share an amount in a ratio", () => {
    const [a, b] = coprimePair(1, 7), unit = r(3, 25), total = (a + b) * unit;
    const which = pick(["larger", "smaller"] as const);
    const share = which === "larger" ? Math.max(a, b) * unit : Math.min(a, b) * unit;
    return { prompt: `Share ${total} in the ratio ${a}:${b}. Give the ${which} share.`, answers: [String(share)], hint: `There are ${a + b} equal parts in total.`, solution: `${total} ÷ ${a + b} = ${unit} per part, so the shares are ${a * unit} and ${b * unit}; the ${which} is ${share}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Nf.11"], "Share an amount in a three-part ratio", () => {
    const parts = [r(1, 5), r(1, 5), r(1, 5)], unit = r(2, 20), total = parts.reduce((s, p) => s + p, 0) * unit;
    const i = r(0, 2), name = ["first", "second", "third"][i];
    return { prompt: `Share R${total} in the ratio ${parts.join(":")}. How much is the ${name} share in rand?`, answers: [String(parts[i] * unit)], hint: `Add the parts to find how many equal shares there are.`, solution: `${parts.join(" + ")} = ${parts.reduce((s, p) => s + p, 0)} parts; R${total} ÷ ${parts.reduce((s, p) => s + p, 0)} = R${unit} per part; the ${name} share is ${parts[i]} × R${unit} = R${parts[i] * unit}.` };
  }),
  T(`${U}-f5`, "foundational", ["8Nf.09"], "Use direct proportion to scale a cost", () => {
    const n = r(2, 9), price = r(2, 30), m = r(2, 15);
    const item = pick(["pencils", "apples", "stickers", "rulers"]);
    return { prompt: `${n} ${item} cost R${n * price}. The cost is directly proportional to the number bought. Find the cost of ${m === n ? m + 1 : m} ${item} in rand.`, answers: [String((m === n ? m + 1 : m) * price)], hint: "Find the cost of one first.", solution: `One costs R${n * price} ÷ ${n} = R${price}, so ${m === n ? m + 1 : m} cost R${(m === n ? m + 1 : m) * price}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Nf.09"], "Use direct proportion with y = kx", () => {
    const k = r(2, 9), x1 = r(2, 9), x2 = r(2, 15);
    return { prompt: `y is directly proportional to x. When x = ${x1}, y = ${k * x1}. Find y when x = ${x2 === x1 ? x2 + 1 : x2}.`, answers: [String(k * (x2 === x1 ? x2 + 1 : x2))], hint: "Find how many times x is multiplied to give y.", solution: `y = ${k}x, so when x = ${x2 === x1 ? x2 + 1 : x2}, y = ${k * (x2 === x1 ? x2 + 1 : x2)}.` };
  }),
  T(`${U}-f7`, "foundational", ["8Nf.11"], "Write part of a ratio as a fraction", () => {
    const [a, b] = coprimePair(1, 9);
    const [thing1, thing2] = pick([["boys", "girls"], ["red beads", "blue beads"], ["cats", "dogs"]]);
    const f = `${a / gcd(a, a + b)}/${(a + b) / gcd(a, a + b)}`;
    return { prompt: `The ratio of ${thing1} to ${thing2} is ${a}:${b}. What fraction of the total are ${thing1}?`, answers: [f], hint: `The whole is ${a} + ${b} = ${a + b} parts.`, solution: `${thing1[0].toUpperCase() + thing1.slice(1)} are ${a} of ${a + b} parts, which is ${f}.`, answerFormat: "Enter a fraction in its simplest form, for example 2/5." };
  }),
  T(`${U}-f8`, "foundational", ["8Nf.10"], "Compare two ratios", () => {
    let [a, b] = coprimePair(1, 9), [c, d] = coprimePair(1, 9);
    while (a / b === c / d) [c, d] = coprimePair(1, 9);
    const larger = a / b > c / d ? `${a}:${b}` : `${c}:${d}`;
    return { prompt: `Which ratio is larger when written as a single number, ${a}:${b} or ${c}:${d}?`, answers: [larger, larger.replace(":", " : ")], hint: "Write each ratio as a fraction (first part ÷ second part) and compare.", solution: `${a}:${b} = ${fmt(a / b, 3)} and ${c}:${d} = ${fmt(c / d, 3)}, so ${larger} is larger.`, answerFormat: RATIO_FORMAT };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Nf.09"], "Use a map scale", () => {
    const scale = pick([25000, 50000, 100000, 200000]), cm = r(2, 18);
    const km = (cm * scale) / 100000;
    return { prompt: `A map has a scale of 1:${scale}. Two towns are ${cm} cm apart on the map. How far apart are they in real life, in km?`, answers: [ans(km)], hint: "Multiply the map distance by the scale, then convert cm to km (100 000 cm = 1 km).", solution: `${cm} × ${scale} = ${cm * scale} cm = ${fmt(km)} km.` };
  }),
  T(`${U}-a2`, "application", ["8Nf.11"], "Mix paint in a three-part ratio", () => {
    const parts = [r(1, 4), r(1, 4), r(1, 4)], unit = r(2, 12), total = parts.reduce((s, p) => s + p, 0) * unit;
    const colours = ["red", "yellow", "white"], i = r(0, 2);
    return { prompt: `Paint is mixed from red, yellow and white in the ratio ${parts.join(":")}. How many litres of ${colours[i]} are in ${total} litres of the mix?`, answers: [String(parts[i] * unit)], hint: "Find the size of one part first.", solution: `${total} ÷ ${parts.reduce((s, p) => s + p, 0)} = ${unit} litres per part, so ${colours[i]} is ${parts[i]} × ${unit} = ${parts[i] * unit} litres.` };
  }),
  T(`${U}-a3`, "application", ["8Nf.09"], "Convert currency using direct proportion", () => {
    const rate = pick([18, 19, 20, 21, 22, 23]), dollars = r(5, 60);
    return { prompt: `1 US dollar is worth R${rate}. The amount in rand is directly proportional to the amount in dollars. How many rand is ${dollars} US dollars?`, answers: [String(rate * dollars)], hint: "Multiply the number of dollars by the rate.", solution: `${dollars} × R${rate} = R${rate * dollars}.` };
  }),
  T(`${U}-a4`, "application", ["8Nf.10"], "Compare prices to find the better buy", () => {
    const small = pick([250, 400, 500]), large = small * 2, pSmall = tidyNum(r(1500, 4000) / 100, 4);
    const pLarge = tidyNum(pSmall * 2 * pick([0.85, 0.9, 1.1, 1.15]), 4);
    const better = pLarge / large < pSmall / small ? "large" : "small";
    return { prompt: `A ${small} g packet costs R${money(pSmall)} and a ${large} g packet costs R${money(pLarge)}. Which is the better buy, small or large?`, answers: [better, `the ${better}`, `${better} packet`], hint: "Compare the cost per gram, or the cost of the same mass.", solution: `Two small packets (${large} g) cost R${money(pSmall * 2)}, compared with R${money(pLarge)} for the large, so the ${better} packet is the better buy.`, answerFormat: "Enter small or large." };
  }),
  T(`${U}-a5`, "application", ["8Nf.10"], "Simplify a recipe ratio in mixed units", () => {
    const [a, b] = coprimePair(1, 5), k = pick([50, 100, 250]);
    const flour = a * k, milk = (b * k) / 1000;
    return { prompt: `A recipe uses ${flour} g of flour and ${fmt(milk)} kg of sugar. Write the ratio flour : sugar in its simplest form.`, answers: ratioAnswers([a, b]), hint: "Convert kilograms to grams first.", solution: `${fmt(milk)} kg = ${b * k} g, so ${flour} : ${b * k} = ${a}:${b}.`, answerFormat: RATIO_FORMAT };
  }),
  T(`${U}-a6`, "application", ["8Nf.11"], "Use one part of a ratio to find another", () => {
    const [a, b] = coprimePair(1, 9), unit = r(2, 12);
    const [first, second] = pick([["boys", "girls"], ["adults", "children"], ["cars", "bicycles"]]);
    return { prompt: `The ratio of ${first} to ${second} is ${a}:${b}. There are ${a * unit} ${first}. How many ${second} are there?`, answers: [String(b * unit)], hint: `Find what one part is worth using the ${first}.`, solution: `One part = ${a * unit} ÷ ${a} = ${unit}, so there are ${b} × ${unit} = ${b * unit} ${second}.` };
  }),
  T(`${U}-a7`, "application", ["8Nf.11"], "Share using the difference between parts", () => {
    const [a, b] = coprimePair(1, 9), unit = r(3, 15), diff = Math.abs(a - b) * unit;
    return { prompt: `Two amounts are in the ratio ${a}:${b}. The difference between them is ${diff}. Find the larger amount.`, answers: [String(Math.max(a, b) * unit)], hint: `The difference is ${Math.abs(a - b)} parts.`, solution: `${diff} ÷ ${Math.abs(a - b)} = ${unit} per part, so the larger amount is ${Math.max(a, b)} × ${unit} = ${Math.max(a, b) * unit}.` };
  }),
  T(`${U}-a8`, "application", ["8Nf.09"], "Scale a recipe in proportion", () => {
    const people = pick([2, 4, 5, 6]), grams = people * r(20, 80), newPeople = people * pick([2, 3]) + (Math.random() < 0.5 ? 0 : people / 2);
    const scaled = (grams / people) * newPeople;
    if (!Number.isInteger(scaled)) return { prompt: `A recipe for ${people} people uses ${grams} g of rice. How much rice is needed for ${people * 2} people?`, answers: [String(grams * 2)], hint: "The amount is directly proportional to the number of people.", solution: `${people * 2} people is twice as many, so ${grams * 2} g.` };
    return { prompt: `A recipe for ${people} people uses ${grams} g of rice. The amount is directly proportional to the number of people. How much rice is needed for ${newPeople} people?`, answers: [String(scaled)], hint: "Find the amount for one person first.", solution: `${grams} ÷ ${people} = ${fmt(grams / people)} g per person, so ${newPeople} × ${fmt(grams / people)} = ${scaled} g.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Nf.11"], "Use a known share in a three-part ratio", () => {
    const parts = [r(1, 5), r(1, 5), r(1, 5)], unit = r(2, 12), i = r(0, 2), j = (i + 1) % 3;
    const name = ["first", "second", "third"];
    return { prompt: `Money is shared in the ratio ${parts.join(":")}. The ${name[i]} share is R${parts[i] * unit}. How much is the total in rand?`, answers: [String(parts.reduce((s, p) => s + p, 0) * unit)], hint: `Work out one part from the ${name[i]} share.`, solution: `One part = R${parts[i] * unit} ÷ ${parts[i]} = R${unit}; the total is ${parts.reduce((s, p) => s + p, 0)} parts = R${parts.reduce((s, p) => s + p, 0) * unit}. The ${name[j]} share would be R${parts[j] * unit}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Nf.09"], "Decide whether quantities are in direct proportion", () => {
    const k = r(2, 9), x1 = r(2, 6), x2 = x1 + r(1, 5), prop = Math.random() < 0.5;
    const y2 = prop ? k * x2 : k * x2 + pick([-1, 1]) * r(1, 3);
    return { prompt: `When x = ${x1}, y = ${k * x1}. When x = ${x2}, y = ${y2}. Could y be directly proportional to x? Answer yes or no.`, answers: [prop ? "yes" : "no"], hint: "In direct proportion, y ÷ x is the same every time.", solution: `${k * x1} ÷ ${x1} = ${k} and ${y2} ÷ ${x2} = ${fmt(y2 / x2, 3)}, so the answer is ${prop ? "yes, the ratio is constant" : "no, the ratio changes"}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Nf.10"], "Find a new ratio after a change", () => {
    const [a, b] = coprimePair(1, 6), unit = r(2, 6), add = r(1, 9);
    const newA = a * unit + add, newB = b * unit, g = gcd(newA, newB);
    return { prompt: `A bag has red and blue counters in the ratio ${a}:${b}, with ${a * unit} red counters. ${add} more red counter${add === 1 ? " is" : "s are"} added. Write the new ratio red : blue in its simplest form.`, answers: ratioAnswers([newA / g, newB / g]), hint: "Work out how many blue counters there are, then write the new totals as a ratio.", solution: `Blue = ${b * unit}; red becomes ${newA}; ${newA}:${newB} = ${newA / g}:${newB / g}.`, answerFormat: RATIO_FORMAT };
  }),
  T(`${U}-r4`, "reasoning", ["8Nf.10"], "Write a ratio in the form 1 : n", () => {
    const a = pick([2, 4, 5, 8]), n = r(2, 9), b = a * n + pick([0, a / 2]);
    return { prompt: `Write the ratio ${a}:${fmt(b)} in the form 1:n.`, answers: ratioAnswers([1, b / a].map((v) => Number(fmt(v)))), hint: `Divide both parts by ${a}.`, solution: `${a} ÷ ${a} = 1 and ${fmt(b)} ÷ ${a} = ${fmt(b / a)}, so 1:${fmt(b / a)}.`, answerFormat: "Enter 1:n, for example 1:4.5." };
  }),
  T(`${U}-r5`, "reasoning", ["8Nf.10"], "Compare the strength of two mixtures", () => {
    let [a, b] = coprimePair(1, 5), [c, d] = coprimePair(1, 5);
    while (a / (a + b) === c / (c + d)) [c, d] = coprimePair(1, 5);
    const stronger = a / (a + b) > c / (c + d) ? "A" : "B";
    return { prompt: `Squash A is mixed concentrate : water in the ratio ${a}:${b}. Squash B is ${c}:${d}. Which is stronger, A or B?`, answers: [stronger, `squash ${stronger}`], hint: "Compare the fraction of each drink that is concentrate.", solution: `A is ${a}/${a + b} concentrate (${fmt(a / (a + b), 3)}); B is ${c}/${c + d} (${fmt(c / (c + d), 3)}). So ${stronger} is stronger.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-r6`, "reasoning", ["8Nf.09"], "Reason about scaling in direct proportion", () => {
    const k = r(2, 9), x = r(2, 12), factor = pick([2, 3, 4, 10]);
    return { prompt: `y is directly proportional to x. When x = ${x}, y = ${k * x}. What is y when x is multiplied by ${factor}?`, answers: [String(k * x * factor)], hint: "In direct proportion, scaling x scales y by the same factor.", solution: `y is also multiplied by ${factor}: ${k * x} × ${factor} = ${k * x * factor}.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Nf.11"], "Judge a ratio claim", () => {
    const [a, b] = coprimePair(1, 5), k = r(2, 5), ok = Math.random() < 0.5;
    const flour = a * k, butter = ok ? b * k : b * k + 1;
    return { prompt: `A recipe needs flour and butter in the ratio ${a}:${b}. A learner uses ${flour} cups of flour and ${butter} cups of butter. Is this in the correct ratio? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Divide both amounts by the same number to compare with the recipe ratio.", solution: `${flour}:${butter} ${ok ? `= ${a}:${b}, so yes` : `does not simplify to ${a}:${b}, so no`}.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Nf.09"], "Scale a rate for a new distance", () => {
    const perHundred = r(5, 12), km = 50 * r(3, 12);
    return { prompt: `A car uses ${perHundred} litres of fuel to travel 100 km. At the same rate, how many litres does it use to travel ${km} km?`, answers: [ans((perHundred * km) / 100)], hint: "Fuel used is directly proportional to distance.", solution: `${km} ÷ 100 = ${fmt(km / 100)}, and ${fmt(km / 100)} × ${perHundred} = ${fmt((perHundred * km) / 100)} litres.` };
  }),
];
