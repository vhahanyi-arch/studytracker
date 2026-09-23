// Stage 9, unit 3: Decimals, percentages and rounding
// (9Ni.03, 9Np.01, 9Np.02, 9Nf.05, 9Nf.06).
import { T, type Template } from "../engine";
import { r, pick, shuffle, sup, fmt, ans, big, money, tidyNum, roundDP, roundSF, plural, an } from "../kit";

const U = "s9-u3";
const SF = "Enter the number in standard form, for example 3.2 × 10^5 (x or * is fine for ×).";

/** Mantissa and exponent of a number in standard form: 45000 -> [4.5, 4]. */
function split(x: number): [number, number] {
  const [m, e] = tidyNum(x, 12).toExponential().split("e");
  return [tidyNum(Number(m), 10), Number(e)];
}
/** m × 10^e exactly: 5.1 * 10 ** 5 is 509999.99999999994 in floating point. */
const exact = (m: number, e: number) => Number(`${m}e${e}`);
const std = (m: number, e: number) => `${fmt(m)} × 10${sup(e)}`;
/** Standard form as shown, and the ways a student may type it. */
function stdAnswers(m: number, e: number) {
  const M = ans(m);
  return [std(m, e), `${M}×10^${e}`, `${M}x10^${e}`, `${M}*10^${e}`, `${M}×10^(${e})`, `${M}e${e}`];
}
/** A mantissa with one or two decimal places. */
const mantissa = () => tidyNum(r(11, 99) / 10 + pick([0, 0, r(1, 9) / 100]));

export const s9u3: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ni.03"], "Write a large number in standard form", () => {
    const m = mantissa(), e = r(3, 9), x = exact(m, e);
    return { prompt: `Write ${big(x)} in standard form.`, answers: stdAnswers(m, e), hint: "Write it as a number from 1 up to (not including) 10, times a power of 10.", solution: `Move the decimal point ${e} places: ${big(x)} = ${std(m, e)}.`, answerFormat: SF };
  }),
  T(`${U}-f2`, "foundational", ["9Ni.03"], "Write a small number in standard form", () => {
    const m = mantissa(), e = -r(2, 7), x = exact(m, e);
    return { prompt: `Write ${fmt(x)} in standard form.`, answers: stdAnswers(m, e), hint: "Count how many places the decimal point moves to give a number from 1 to 10. Small numbers have a negative power.", solution: `The point moves ${-e} places to the right, so ${fmt(x)} = ${std(m, e)}.`, answerFormat: SF };
  }),
  T(`${U}-f3`, "foundational", ["9Ni.03"], "Write a standard form number in full", () => {
    const m = mantissa(), e = pick([r(2, 7), -r(1, 5)]), x = exact(m, e);
    return { prompt: `Write ${std(m, e)} as an ordinary number.`, answers: [ans(x)], hint: `${e > 0 ? "Multiplying" : "Dividing"} by 10${Math.abs(e) === 1 ? "" : sup(Math.abs(e))} moves the point ${plural(Math.abs(e), "place")} to the ${e > 0 ? "right" : "left"}.`, solution: `${std(m, e)} = ${e > 0 ? big(x) : fmt(x)}.` };
  }),
  T(`${U}-f4`, "foundational", ["9Np.01"], "Multiply or divide by a power of 10", () => {
    const x = tidyNum(r(12, 980) / pick([10, 100])), k = pick([-3, -2, -1, 2, 3, 4]), divide = pick([true, false]);
    const v = tidyNum(divide ? x / 10 ** k : x * 10 ** k);
    const net = divide ? -k : k;
    return { prompt: `Work out ${fmt(x)} ${divide ? "÷" : "×"} 10${sup(k)}.`, answers: [ans(v)], hint: "Multiplying by 10ⁿ moves the digits n places left for positive n, right for negative n. Dividing does the opposite.", solution: `This moves the point ${Math.abs(net)} ${Math.abs(net) === 1 ? "place" : "places"} to the ${net > 0 ? "right" : "left"}: ${big(v)}.` };
  }),
  T(`${U}-f5`, "foundational", ["9Np.02"], "Find the bounds of a rounded measurement", () => {
    const [to, step] = pick([["the nearest whole number", 1], ["the nearest 10", 10], ["1 decimal place", 0.1], ["the nearest 100", 100]] as const);
    const v = tidyNum(step * r(3, 99)), lower = pick([true, false]), b = tidyNum(v + (lower ? -step / 2 : step / 2));
    const [thing, unit] = pick([["The length of a rope", "m"], ["The mass of a bag", "kg"], ["A journey", "km"]]);
    return { prompt: `${thing} is ${fmt(v)} ${unit}, correct to ${to}. What is the ${lower ? "lower" : "upper"} bound?`, answers: [ans(b)], hint: "The bounds are half a unit of rounding either side.", solution: `Half of ${fmt(step)} is ${fmt(step / 2)}, so the ${lower ? "lower" : "upper"} bound is ${fmt(v)} ${lower ? "−" : "+"} ${fmt(step / 2)} = ${fmt(b)} ${unit}.` };
  }),
  T(`${U}-f6`, "foundational", ["9Nf.05"], "Find a value after compound growth", () => {
    const P = 100 * r(5, 50), rate = pick([2, 3, 4, 5, 6, 8, 10]), n = r(2, 4), v = roundDP(P * (1 + rate / 100) ** n, 2);
    return { prompt: `R${P} is invested at ${rate}% compound interest per year. What is it worth after ${n} years? Give your answer in rand to the nearest cent.`, answers: [money(v), ans(v)], hint: `Each year multiplies the amount by ${fmt(1 + rate / 100)}.`, solution: `${P} × ${fmt(1 + rate / 100)}${sup(n)} = R${money(v)}.` };
  }),
  T(`${U}-f7`, "foundational", ["9Nf.06"], "Multiply decimals", () => {
    let bb = r(2, 99);
    if (bb % 10 === 0) bb++;
    const a = r(2, 9) * pick([0.1, 0.01]), b = bb * pick([0.1, 0.01]), v = tidyNum(a * b, 12);
    const [A, B] = [tidyNum(a), tidyNum(b)];
    const places = (x: number) => (String(x).split(".")[1] ?? "").length;
    return { prompt: `Work out ${fmt(A)} × ${fmt(B)}.`, answers: [ans(v, 12)], hint: "Multiply as whole numbers, then count the decimal places in the question.", solution: `${Math.round(A * 10 ** places(A))} × ${Math.round(B * 10 ** places(B))} = ${Math.round(A * 10 ** places(A)) * Math.round(B * 10 ** places(B))}, with ${plural(places(A) + places(B), "decimal place")}: ${fmt(v, 12)}.` };
  }),
  T(`${U}-f8`, "foundational", ["9Nf.06"], "Divide by a decimal", () => {
    const d = pick([0.2, 0.4, 0.5, 0.03, 0.06, 0.08, 0.3, 0.7]), q = r(2, 90), x = tidyNum(d * q);
    const k = d < 0.1 ? 100 : 10;
    return { prompt: `Work out ${fmt(x)} ÷ ${fmt(d)}.`, answers: [String(q)], hint: "Multiply both numbers by the same power of 10 so you divide by a whole number.", solution: `Multiply both by ${k}: ${fmt(tidyNum(x * k))} ÷ ${fmt(tidyNum(d * k))} = ${q}.` };
  }),
  T(`${U}-f9`, "foundational", ["9Nf.06"], "Estimate by rounding to 1 significant figure", () => {
    const a = tidyNum(r(11, 99) / 10 * pick([1, 10])), b = tidyNum(r(11, 99) / 10 * pick([1, 10])), op = pick(["×", "÷"]);
    const [ra, rb] = [roundSF(a, 1), roundSF(b, 1)], est = op === "×" ? tidyNum(ra * rb) : tidyNum(ra / rb);
    if (op === "÷" && !Number.isInteger(est * 100)) return s9u3[8].make();
    return { prompt: `Estimate ${fmt(a)} ${op} ${fmt(b)} by rounding each number to 1 significant figure.`, answers: [ans(est)], hint: "Round each number first, then calculate.", solution: `${fmt(a)} ≈ ${fmt(ra)} and ${fmt(b)} ≈ ${fmt(rb)}, so the estimate is ${fmt(ra)} ${op} ${fmt(rb)} = ${fmt(est)}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ni.03"], "Multiply numbers in standard form", () => {
    const [a, b] = [r(2, 9), r(2, 9)], [p, q] = [r(2, 8), pick([r(2, 8), -r(1, 5)])], [m, e] = split(a * b * 10 ** (p + q));
    return { prompt: `Work out (${a} × 10${sup(p)}) × (${b} × 10${sup(q)}). Give your answer in standard form.`, answers: stdAnswers(m, e), hint: "Multiply the numbers, add the powers, then adjust so the first number is between 1 and 10.", solution: `${a} × ${b} = ${a * b} and 10${sup(p)} × 10${sup(q)} = 10${sup(p + q)}. ${a * b} × 10${sup(p + q)} = ${std(m, e)}.`, answerFormat: SF };
  }),
  T(`${U}-a2`, "application", ["9Ni.03"], "Divide numbers in standard form", () => {
    const b = r(2, 4), q = r(2, Math.floor(9 / b)), a = b * q, [p, s] = [r(3, 9), r(1, 6)], [m, e] = split(q * 10 ** (p - s));
    return { prompt: `Work out (${a} × 10${sup(p)}) ÷ (${b} × 10${sup(s)}). Give your answer in standard form.`, answers: stdAnswers(m, e), hint: "Divide the numbers and subtract the powers.", solution: `${a} ÷ ${b} = ${q} and 10${sup(p)} ÷ 10${sup(s)} = 10${sup(p - s)}, so the answer is ${std(m, e)}.`, answerFormat: SF };
  }),
  T(`${U}-a3`, "application", ["9Ni.03"], "Order numbers in standard form", () => {
    const base = r(-6, 6), opts = shuffle([[mantissa(), base], [mantissa(), base + 1], [mantissa(), base - 1], [mantissa(), base]] as Array<[number, number]>);
    const values = opts.map(([m, e]) => m * 10 ** e), best = values.indexOf(Math.max(...values));
    if (new Set(values).size < 4) return s9u3.find((t) => t.id === `${U}-a3`)!.make();
    const letter = "ABCD"[best];
    return { prompt: `Which is the largest? ${opts.map(([m, e], i) => `${"ABCD"[i]}: ${std(m, e)}`).join(", ")}.`, answers: [letter], hint: "Compare the powers of 10 first; if they are equal, compare the first numbers.", solution: `${letter}: ${std(...opts[best])} has the highest power of 10${opts.filter(([, e]) => e === opts[best][1]).length > 1 ? " and the larger first number" : ""}.`, answerFormat: "Enter the letter of your choice." };
  }),
  T(`${U}-a4`, "application", ["9Np.02"], "Find the bounds of a perimeter", () => {
    const s = r(4, 20), n = pick([3, 4, 5, 6]), upper = pick([true, false]), shape = { 3: "equilateral triangle", 4: "square", 5: "regular pentagon", 6: "regular hexagon" }[n]!;
    const b = n * (s + (upper ? 0.5 : -0.5));
    return { prompt: `Each side of ${an(shape)} ${shape} is ${s} cm, correct to the nearest centimetre. What is the ${upper ? "upper" : "lower"} bound of its perimeter?`, answers: [ans(b)], hint: `Use the ${upper ? "upper" : "lower"} bound of one side.`, solution: `One side is at ${upper ? "most" : "least"} ${fmt(s + (upper ? 0.5 : -0.5))} cm, so the perimeter bound is ${n} × ${fmt(s + (upper ? 0.5 : -0.5))} = ${fmt(b)} cm.` };
  }),
  T(`${U}-a5`, "application", ["9Nf.05"], "Find a value after compound depreciation", () => {
    const P = 1000 * r(20, 250), rate = pick([5, 8, 10, 12, 15, 20]), n = r(2, 4), v = roundDP(P * (1 - rate / 100) ** n, 2);
    return { prompt: `A car bought for R${big(P)} loses ${rate}% of its value each year. What is it worth after ${n} years, in rand to the nearest cent?`, answers: [money(v), ans(v)], hint: `Each year multiplies the value by ${fmt(1 - rate / 100)}.`, solution: `${big(P)} × ${fmt(1 - rate / 100)}${sup(n)} = R${money(v)}.` };
  }),
  T(`${U}-a6`, "application", ["9Nf.05"], "Find the overall change after two percentage changes", () => {
    const up = pick([10, 20, 25, 30, 40, 50]), down = pick([10, 20, 25, 30, 40, 50]), m = tidyNum((1 + up / 100) * (1 - down / 100)), change = tidyNum((m - 1) * 100);
    if (change === 0) return s9u3.find((t) => t.id === `${U}-a6`)!.make();
    return { prompt: `A price increases by ${up}% and then the new price decreases by ${down}%. What is the overall percentage change? Give a negative answer for a decrease.`, answers: [ans(change), `${ans(change)}%`], hint: "Multiply the two multipliers together.", solution: `${fmt(1 + up / 100)} × ${fmt(1 - down / 100)} = ${fmt(m)}, which is an overall change of ${fmt(change)}%.` };
  }),
  T(`${U}-a7`, "application", ["9Nf.05"], "Find a compound multiplier", () => {
    const rate = pick([2, 3, 4, 5, 6, 8]), n = r(2, 5), grow = pick([true, false]), base = tidyNum(1 + (grow ? rate : -rate) / 100), m = roundDP(base ** n, 4);
    return { prompt: `A quantity ${grow ? "increases" : "decreases"} by ${rate}% each year for ${n} years. What single number is the original multiplied by? Give it to 4 decimal places.`, answers: [ans(m)], hint: `Each year is × ${fmt(base)}.`, solution: `${fmt(base)}${sup(n)} = ${fmt(roundDP(base ** n, 6))}… ≈ ${fmt(m)}.` };
  }),
  T(`${U}-a8`, "application", ["9Np.01"], "Use a negative power of 10", () => {
    const x = tidyNum(r(12, 980) / pick([1, 10, 1000])), k = -r(1, 4), divide = pick([true, false]), v = tidyNum(divide ? x / 10 ** k : x * 10 ** k);
    return { prompt: `Work out ${fmt(x)} ${divide ? "÷" : "×"} 10${sup(k)}.`, answers: [ans(v)], hint: `10${sup(k)} = 1/10${sup(-k)}, so ${divide ? "dividing by it is multiplying" : "multiplying by it is dividing"} by 10${sup(-k)}.`, solution: `${divide ? "Dividing by" : "Multiplying by"} 10${sup(k)} is the same as ${divide ? "multiplying" : "dividing"} by ${big(10 ** -k)}: ${big(v)}.` };
  }),
  T(`${U}-a9`, "application", ["9Nf.06"], "Calculate with decimals in context", () => {
    const price = tidyNum(r(250, 2500) / 100), qty = tidyNum(r(12, 95) / 10), v = roundDP(price * qty, 2);
    const [item, unit] = pick([["Fabric", "metre"], ["Cheese", "kilogram"], ["Rope", "metre"], ["Rice", "kilogram"]]);
    return { prompt: `${item} costs R${money(price)} per ${unit}. How much do ${fmt(qty)} ${unit}s cost, to the nearest cent?`, answers: [money(v), ans(v)], hint: "Multiply the price by the amount; estimate first to check.", solution: `${money(price)} × ${fmt(qty)} = ${fmt(tidyNum(price * qty, 6))} ≈ R${money(v)}. (Estimate: ${fmt(roundSF(price, 1))} × ${fmt(roundSF(qty, 1))} = ${fmt(tidyNum(roundSF(price, 1) * roundSF(qty, 1)))}.)` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ni.03"], "Add numbers in standard form", () => {
    const [a, b] = [r(11, 89) / 10, r(1, 9)], p = r(3, 8), total = tidyNum(a * 10 ** p + b * 10 ** (p - 1)), [m, e] = split(total);
    return { prompt: `Work out ${std(a, p)} + ${b} × 10${sup(p - 1)}. Give your answer in standard form.`, answers: stdAnswers(m, e), hint: "Write both with the same power of 10 (or as ordinary numbers) before adding.", solution: `${b} × 10${sup(p - 1)} = ${fmt(b / 10)} × 10${sup(p)}, so the sum is (${fmt(a)} + ${fmt(b / 10)}) × 10${sup(p)} = ${std(m, e)}.`, answerFormat: SF };
  }),
  T(`${U}-r2`, "reasoning", ["9Np.02"], "Find the greatest possible speed from rounded values", () => {
    const d = 10 * r(5, 40), t = tidyNum(r(80, 300) / 10), v = roundDP((d + 0.5) / (t - 0.05), 2);
    return { prompt: `A runner covers ${d} m, correct to the nearest metre, in ${fmt(t)} s, correct to 1 decimal place. Find the greatest possible average speed in m/s, to 2 decimal places.`, answers: [ans(v)], hint: "Speed = distance ÷ time. The greatest speed uses the largest distance and the smallest time.", solution: `Greatest distance = ${d + 0.5} m; least time = ${fmt(tidyNum(t - 0.05))} s. ${d + 0.5} ÷ ${fmt(tidyNum(t - 0.05))} = ${fmt(roundDP((d + 0.5) / (t - 0.05), 4))}… ≈ ${fmt(v)} m/s.` };
  }),
  T(`${U}-r3`, "reasoning", ["9Nf.05"], "Find when compound growth passes a target", () => {
    const P = 100 * r(5, 50), rate = pick([5, 6, 8, 10, 12]), factor = pick([1.5, 2]), target = P * factor;
    let n = 0, v = P;
    while (v <= target) { v *= 1 + rate / 100; n++; }
    return { prompt: `R${P} is invested at ${rate}% compound interest per year. After how many whole years will it first be worth more than R${fmt(target)}?`, answers: [String(n)], hint: `Keep multiplying by ${fmt(1 + rate / 100)} and count the years.`, solution: `After ${n - 1} years it is R${money(P * (1 + rate / 100) ** (n - 1))}; after ${n} years it is R${money(P * (1 + rate / 100) ** n)}, which is more than R${fmt(target)}. So ${n} years.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Nf.05"], "Work back from compound growth", () => {
    const P = 100 * r(5, 50), rate = pick([5, 10, 20]), n = 2, v = tidyNum(P * (1 + rate / 100) ** n);
    return { prompt: `After ${n} years of ${rate}% compound growth, an investment is worth R${money(v)}. How much was invested at the start, in rand?`, answers: [String(P)], hint: `Divide by the multiplier for ${n} years.`, solution: `${fmt(1 + rate / 100)}² = ${fmt(tidyNum((1 + rate / 100) ** 2))}, and ${money(v)} ÷ ${fmt(tidyNum((1 + rate / 100) ** 2))} = ${P}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Nf.06"], "Use a known product to find another", () => {
    const a = r(12, 99), b = r(12, 99), p = a * b, [ka, kb] = [pick([10, 100]), pick([1, 10, 100])];
    const A = tidyNum(a / ka), B = tidyNum(b / kb), v = tidyNum(A * B, 10);
    return { prompt: `Given that ${a} × ${b} = ${big(p)}, work out ${fmt(A)} × ${fmt(B)}.`, answers: [ans(v)], hint: "Count how many times smaller each number is than in the fact you are given.", solution: `${fmt(A)} is ${a} ÷ ${ka} and ${fmt(B)} is ${b} ÷ ${kb}, so the answer is ${big(p)} ÷ ${big(ka * kb)} = ${fmt(v)}.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Ni.03"], "Compare quantities in standard form", () => {
    const [m1, e1] = [tidyNum(r(20, 99) / 10), r(20, 26)], [m2, e2] = [tidyNum(r(11, 99) / 10), e1 - r(1, 2)], ratio = Math.round((m1 * 10 ** e1) / (m2 * 10 ** e2));
    return { prompt: `Planet P has a mass of ${std(m1, e1)} kg and moon Q has a mass of ${std(m2, e2)} kg. How many times heavier is P than Q, to the nearest whole number?`, answers: [String(ratio)], hint: "Divide the numbers and subtract the powers of 10.", solution: `(${fmt(m1)} ÷ ${fmt(m2)}) × 10${sup(e1 - e2)} = ${fmt(roundDP((m1 / m2) * 10 ** (e1 - e2), 2))}… ≈ ${ratio}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9Np.02"], "Find the lower bound after rounding to significant figures", () => {
    const sf = pick([1, 2]), mag = pick([100, 1000, 10000]), x = sf === 1 ? r(2, 9) * mag : r(11, 99) * mag / 10, step = sf === 1 ? mag : mag / 10;
    const lower = pick([true, false]), b = x + (lower ? -step / 2 : step / 2);
    return { prompt: `A number rounded to ${sf} significant figure${sf === 1 ? "" : "s"} is ${big(x)}. What is the ${lower ? "smallest value it could have been" : "upper bound of the number"}?`, answers: [String(b)], hint: `Rounding to ${sf} significant figure${sf === 1 ? "" : "s"} here is rounding to the nearest ${big(step)}.`, solution: `It was rounded to the nearest ${big(step)}, so it is within ${big(step / 2)} of ${big(x)}: the ${lower ? "lower" : "upper"} bound is ${big(b)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Np.01"], "Find the power of 10 used", () => {
    const x = tidyNum(r(12, 98) / pick([1000, 10000])), k = r(3, 7), v = tidyNum(x * 10 ** k);
    return { prompt: `${fmt(x)} × 10ᵏ = ${big(v)}. Find k.`, answers: [String(k)], hint: "Count how many places the digits move.", solution: `The digits move ${k} places to the left (the point moves right), so k = ${k}.` };
  }),
];
