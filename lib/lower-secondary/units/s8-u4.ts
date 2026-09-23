// Stage 8, unit 4: Decimals (8Nf.04, 8Nf.06, 8Nf.07, 8Nf.08).
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, money, tidyNum, roundDP } from "../kit";

const U = "s8-u4";
const d1 = (lo: number, hi: number) => tidyNum(r(lo * 10, hi * 10) / 10, 4);
const d2 = (lo: number, hi: number) => tidyNum(r(lo * 100, hi * 100) / 100, 4);
/** A one-decimal-place number that is not a whole number. */
const tenths = (lo: number, hi: number) => { let x = d1(lo, hi); while (Number.isInteger(x)) x = d1(lo, hi); return x; };
const LETTERS = ["A", "B", "C", "D"];

/** Four distinct decimals, some negative, labelled A-D; answer is the letters in ascending order. */
function orderCase() {
  const values = new Set<number>();
  while (values.size < 4) values.add(tidyNum(pick([-1, 1]) * r(5, 250) / 100, 4));
  const list = shuffle([...values]);
  const labelled = list.map((v, i) => ({ label: LETTERS[i], v }));
  const sorted = [...labelled].sort((a, b) => a.v - b.v);
  return { labelled, sorted };
}

export const s8u4: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Nf.07"], "Multiply a decimal by a whole number", () => {
    const x = tenths(1, 20), k = r(3, 9);
    return { prompt: `Calculate ${fmt(x)} × ${k}.`, answers: [ans(x * k)], hint: `Multiply ${fmt(x * 10)} × ${k}, then divide by 10.`, solution: `${fmt(x * 10)} × ${k} = ${fmt(x * 10 * k)}, so ${fmt(x)} × ${k} = ${fmt(x * k)}.` };
  }),
  T(`${U}-f2`, "foundational", ["8Nf.07"], "Multiply two decimals", () => {
    const a = tenths(0.2, 9), b = tenths(0.2, 5);
    return { prompt: `Calculate ${fmt(a)} × ${fmt(b)}.`, answers: [ans(a * b)], hint: "Multiply as whole numbers, then count the decimal places in the question.", solution: `${fmt(a * 10)} × ${fmt(b * 10)} = ${fmt(a * b * 100)}; there are two decimal places, so ${fmt(a * b)}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Nf.08"], "Divide by a one-decimal-place number", () => {
    const d = tenths(0.2, 4), q = r(3, 30);
    return { prompt: `Calculate ${fmt(d * q)} ÷ ${fmt(d)}.`, answers: [ans(q)], hint: "Multiply both numbers by 10 so that you divide by a whole number.", solution: `${fmt(d * q)} ÷ ${fmt(d)} = ${fmt(d * q * 10)} ÷ ${fmt(d * 10)} = ${q}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Nf.06"], "Order positive and negative decimals", () => {
    const { labelled, sorted } = orderCase();
    return { prompt: `Put these in ascending order, smallest first: ${labelled.map((x) => `${x.label} = ${fmt(x.v)}`).join(", ")}. Enter the letters.`, answers: [sorted.map((x) => x.label).join(",")], hint: "Negative numbers are smaller than positive ones; the further a negative is from zero, the smaller it is.", solution: `In order: ${sorted.map((x) => `${fmt(x.v)} (${x.label})`).join(", ")}, so ${sorted.map((x) => x.label).join(",")}.`, answerFormat: "Enter the letters in order, for example C, A, D, B." };
  }),
  T(`${U}-f5`, "foundational", ["8Nf.06"], "Compare decimals with < or >", () => {
    const a = tidyNum(-r(11, 95) / 100, 4), b = tidyNum(a + pick([-1, 1]) * r(1, 9) / 100, 4);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [tidyNum(-a, 4), tidyNum(-b, 4)];
    const sym = x < y ? "<" : ">";
    return { prompt: `Which symbol, < or >, makes ${fmt(x)} □ ${fmt(y)} true?`, answers: [sym], hint: "On a number line, the number further to the right is larger.", solution: `${fmt(x)} is ${x < y ? "less" : "greater"} than ${fmt(y)}, so ${fmt(x)} ${sym} ${fmt(y)}.`, answerFormat: "Enter < or >." };
  }),
  T(`${U}-f6`, "foundational", ["8Nf.04"], "Use the order of operations with decimals", () => {
    const a = tenths(1, 9), b = tenths(0.2, 3), k = r(2, 6);
    return { prompt: `Calculate ${fmt(a)} + ${fmt(b)} × ${k}.`, answers: [ans(a + b * k)], hint: "Multiply before you add.", solution: `${fmt(b)} × ${k} = ${fmt(b * k)}, then ${fmt(a)} + ${fmt(b * k)} = ${fmt(a + b * k)}.` };
  }),
  T(`${U}-f7`, "foundational", ["8Nf.07"], "Estimate a decimal product", () => {
    const a = d2(2.1, 9.4), b = d2(2.1, 7.4);
    const ra = Math.round(a), rb = Math.round(b);
    return { prompt: `Estimate ${fmt(a)} × ${fmt(b)} by rounding each number to the nearest whole number.`, answers: [ans(ra * rb)], hint: "Round first, then multiply.", solution: `${fmt(a)} ≈ ${ra} and ${fmt(b)} ≈ ${rb}, so the estimate is ${ra * rb}.` };
  }),
  T(`${U}-f8`, "foundational", ["8Nf.06"], "Judge a statement with ≤, ≥ or ≠", () => {
    const x = tidyNum(pick([-1, 1]) * r(11, 95) / 100, 4);
    const [text, truth, why] = pick([
      [`${fmt(x)} ≠ ${fmt(x)}0`, "false", `${fmt(x)}0 is the same number as ${fmt(x)}`],
      [`${fmt(x)} ≥ ${fmt(x)}0`, "true", `the two numbers are equal, and ≥ allows equality`],
      [`${fmt(x)} ≤ ${fmt(tidyNum(x - 0.01, 4))}`, "false", `${fmt(x)} is greater than ${fmt(tidyNum(x - 0.01, 4))}`],
      [`${fmt(x)} ≥ ${fmt(tidyNum(x - 0.01, 4))}`, "true", `${fmt(x)} is greater than ${fmt(tidyNum(x - 0.01, 4))}`],
      [`${fmt(x)} ≠ ${fmt(tidyNum(x + 0.1, 4))}`, "true", `the numbers differ by 0.1`],
    ] as const);
    return { prompt: `True or false: ${text}.`, answers: [truth], hint: "≤ means less than or equal to, ≥ greater than or equal to, and ≠ not equal to.", solution: `It is ${truth}: ${why}.`, answerFormat: "Enter true or false." };
  }),
  T(`${U}-f9`, "foundational", ["review"], "Subtract decimals", () => {
    const a = d1(5, 20), b = d2(0.5, a - 0.5);
    return { prompt: `Calculate ${fmt(a)} − ${fmt(b)}.`, answers: [ans(a - b)], hint: "Line up the decimal points and fill empty places with zeros.", solution: `${fmt(a)} − ${fmt(b)} = ${fmt(a - b)}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Nf.07"], "Multiply a price by a quantity", () => {
    const price = d2(2, 45), n = r(3, 12);
    const item = pick(["a pen", "a notebook", "a loaf of bread", "a bus ticket", "a mango"]);
    return { prompt: `${item[0].toUpperCase() + item.slice(1)} costs R${money(price)}. Find the cost of ${n} of them in rand.`, answers: [ans(price * n), money(price * n)], hint: "Multiply the price by the number bought.", solution: `${n} × R${money(price)} = R${money(price * n)}.` };
  }),
  T(`${U}-a2`, "application", ["8Nf.07"], "Multiply two decimals in context", () => {
    const price = tidyNum(2 * r(750, 1250) / 100, 4), litres = r(10, 40) + pick([0, 0.5]);
    return { prompt: `Petrol costs R${money(price)} per litre. Find the cost of ${fmt(litres)} litres in rand.`, answers: [ans(price * litres), money(price * litres)], hint: "Multiply the price per litre by the number of litres.", solution: `${fmt(litres)} × R${money(price)} = R${money(price * litres)}.` };
  }),
  T(`${U}-a3`, "application", ["8Nf.08"], "Divide by a decimal in context", () => {
    const piece = tenths(0.2, 1.5), n = r(4, 25);
    return { prompt: `A ${fmt(piece * n)} m rope is cut into pieces ${fmt(piece)} m long. How many pieces are there?`, answers: [String(n)], hint: "Divide the total length by the length of one piece.", solution: `${fmt(piece * n)} ÷ ${fmt(piece)} = ${n} pieces.` };
  }),
  T(`${U}-a4`, "application", ["8Nf.08"], "Find a speed by dividing decimals", () => {
    const time = pick([0.5, 1.5, 2.5, 0.4, 1.2]), speed = r(8, 30);
    return { prompt: `A cyclist travels ${fmt(speed * time)} km in ${fmt(time)} hours. Find the average speed in km/h.`, answers: [String(speed)], hint: "Speed = distance ÷ time.", solution: `${fmt(speed * time)} ÷ ${fmt(time)} = ${speed} km/h.` };
  }),
  T(`${U}-a5`, "application", ["8Nf.06"], "Order negative temperatures", () => {
    const temps = new Set<number>();
    while (temps.size < 4) temps.add(tidyNum(r(-45, 15) / 10, 4));
    const list = shuffle([...temps]), sorted = [...list].sort((a, b) => a - b);
    return { prompt: `Temperatures of ${list.map((t) => `${fmt(t)}°C`).join(", ")} were recorded. Write them from coldest to warmest.`, answers: [sorted.map(ans).join(",")], hint: "The coldest is the most negative.", solution: `From coldest: ${sorted.map((t) => `${fmt(t)}°C`).join(", ")}, that is ${sorted.map(fmt).join(", ")}.`, answerFormat: "Enter the numbers in order, separated by commas. Leave out °C." };
  }),
  T(`${U}-a6`, "application", ["8Nf.04"], "Use the order of operations in context", () => {
    const fee = d2(8, 20), rate = tenths(5, 12), km = tenths(1.5, 9);
    const cost = fee + rate * km;
    return { prompt: `A taxi charges R${money(fee)} plus R${money(rate)} per kilometre. Find the cost of a ${fmt(km)} km trip, correct to the nearest cent.`, answers: [ans(roundDP(cost, 2)), money(cost)], hint: "Multiply the rate by the distance, then add the fixed charge.", solution: `R${money(fee)} + R${money(rate)} × ${fmt(km)} = R${money(fee)} + R${money(rate * km)} = R${money(cost)}.` };
  }),
  T(`${U}-a7`, "application", ["8Nf.07"], "Find an area with decimal lengths", () => {
    const l = tenths(1.2, 9), w = tenths(1.2, 5);
    return { prompt: `A rectangular mat is ${fmt(l)} m long and ${fmt(w)} m wide. Find its area in m².`, answers: [ans(l * w)], hint: "Area = length × width.", solution: `${fmt(l)} × ${fmt(w)} = ${fmt(l * w)} m².` };
  }),
  T(`${U}-a8`, "application", ["8Nf.08"], "Share a decimal amount into equal portions", () => {
    const portion = pick([0.2, 0.4, 0.5, 0.25, 0.75]), n = r(6, 40);
    const [what, unit] = pick([["rice", "kg"], ["juice", "litres"], ["sand", "kg"]]);
    return { prompt: `How many ${fmt(portion)} ${unit} portions can be filled from ${fmt(portion * n)} ${unit} of ${what}?`, answers: [String(n)], hint: "Divide the total by the size of one portion.", solution: `${fmt(portion * n)} ÷ ${fmt(portion)} = ${n} portions.` };
  }),
  T(`${U}-a9`, "application", ["8Nf.06"], "Compare decimal times", () => {
    const a = d2(10.1, 13.9), b = tidyNum(a + pick([-1, 1]) * pick([0.05, 0.04, 0.1, 0.06]), 4);
    const faster = Math.min(a, b);
    const [x, y] = shuffle([a, b]);
    return { prompt: `Two sprinters ran 100 m in ${fmt(x)} s and ${fmt(y)} s. Which time is faster?`, answers: [ans(faster)], hint: "The faster time is the smaller number; compare the tenths, then the hundredths.", solution: `${fmt(faster)} s is less than ${fmt(Math.max(a, b))} s, so ${fmt(faster)} s is faster.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Nf.07"], "Correct a decimal multiplication error", () => {
    const a = r(2, 9), b = r(2, 9);
    return { prompt: `A learner says 0.${a} × 0.${b} = ${fmt(a * b / 10)}. Enter the correct answer.`, answers: [ans(a * b / 100)], hint: "Tenths × tenths give hundredths.", solution: `${a} × ${b} = ${a * b}, and 0.${a} × 0.${b} has two decimal places, so ${fmt(a * b / 100)}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Nf.08"], "Reverse a division by a decimal", () => {
    const d = tenths(0.2, 0.9), q = r(4, 40);
    return { prompt: `A number divided by ${fmt(d)} gives ${q}. Find the number.`, answers: [ans(d * q)], hint: "Undo the division by multiplying.", solution: `${q} × ${fmt(d)} = ${fmt(d * q)}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Nf.06"], "Find the number halfway between two decimals", () => {
    const a = tidyNum(pick([-1, 1]) * r(1, 30) / 10, 4), b = tidyNum(a + 0.1, 4);
    return { prompt: `Find the number exactly halfway between ${fmt(a)} and ${fmt(b)}.`, answers: [ans((a + b) / 2)], hint: "Add the two numbers and halve the total.", solution: `(${fmt(a)} + ${fmt(b)}) ÷ 2 = ${fmt((a + b) / 2)}.` };
  }),
  T(`${U}-r4`, "reasoning", ["8Nf.04"], "Use the laws of arithmetic to calculate efficiently", () => {
    const x = tenths(1.1, 9.9);
    if (Math.random() < 0.5) return { prompt: `Calculate ${fmt(x)} × 25 × 4 by choosing an easy order.`, answers: [ans(x * 100)], hint: "25 × 4 = 100.", solution: `${fmt(x)} × (25 × 4) = ${fmt(x)} × 100 = ${fmt(x * 100)}.` };
    return { prompt: `Calculate ${fmt(x)} × 99 by working out ${fmt(x)} × 100 − ${fmt(x)}.`, answers: [ans(x * 99)], hint: "99 = 100 − 1, so multiply by 100 and subtract one lot.", solution: `${fmt(x * 100)} − ${fmt(x)} = ${fmt(x * 99)}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8Nf.07"], "Predict the size of a product", () => {
    const n = r(12, 95), m = pick([tenths(0.2, 0.9), tenths(1.1, 2.5)]);
    const answer = m < 1 ? "less" : "greater";
    return { prompt: `Without calculating, is ${n} × ${fmt(m)} greater than or less than ${n}?`, answers: [answer, answer + " than"], hint: "Multiplying by a number less than 1 makes a positive number smaller.", solution: `${fmt(m)} is ${m < 1 ? "less" : "greater"} than 1, so the product is ${answer} than ${n}.`, answerFormat: "Enter greater or less." };
  }),
  T(`${U}-r6`, "reasoning", ["8Nf.08"], "Predict the size of a quotient", () => {
    const n = r(12, 95), m = pick([tenths(0.2, 0.9), tenths(1.1, 2.5)]);
    const answer = m < 1 ? "greater" : "less";
    return { prompt: `Without calculating, is ${n} ÷ ${fmt(m)} greater than or less than ${n}?`, answers: [answer, answer + " than"], hint: "Dividing by a number less than 1 makes a positive number larger.", solution: `${fmt(m)} is ${m < 1 ? "less" : "greater"} than 1, so the quotient is ${answer} than ${n}.`, answerFormat: "Enter greater or less." };
  }),
  T(`${U}-r7`, "reasoning", ["8Nf.06"], "Count values that satisfy an inequality", () => {
    const bound = tidyNum(-r(1, 9) / 10, 4);
    const values = new Set<number>([bound]);
    while (values.size < 5) values.add(tidyNum(r(-9, 9) / 10 + pick([0, 0.05]), 4));
    const list = shuffle([...values]), count = list.filter((v) => v >= bound).length;
    return { prompt: `How many of ${list.map(fmt).join(", ")} satisfy x ≥ ${fmt(bound)}?`, answers: [String(count)], hint: "≥ includes the value itself.", solution: `The values that are ${fmt(bound)} or more are ${list.filter((v) => v >= bound).map(fmt).join(", ")}: there are ${count}.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Nf.04"], "Find a missing number with brackets", () => {
    const a = tenths(1, 5), m = tenths(0.2, 3), k = r(2, 6);
    return { prompt: `(${fmt(a)} + □) × ${k} = ${fmt((a + m) * k)}. Find □.`, answers: [ans(m)], hint: `Divide by ${k} first, then subtract ${fmt(a)}.`, solution: `${fmt((a + m) * k)} ÷ ${k} = ${fmt(a + m)}, so □ = ${fmt(a + m)} − ${fmt(a)} = ${fmt(m)}.` };
  }),
  T(`${U}-r9`, "reasoning", ["8Nf.07"], "Use an estimate to correct a calculation", () => {
    const a = d1(2.1, 9.4), b = d1(2.1, 6.4), exact = tidyNum(a * b, 6);
    return { prompt: `A learner calculates ${fmt(a)} × ${fmt(b)} = ${fmt(exact * 10)}. Use an estimate to find the mistake, then enter the correct answer.`, answers: [ans(exact)], hint: `${fmt(a)} × ${fmt(b)} is about ${Math.round(a)} × ${Math.round(b)} = ${Math.round(a) * Math.round(b)}.`, solution: `The estimate is about ${Math.round(a) * Math.round(b)}, so the decimal point is misplaced: ${fmt(a)} × ${fmt(b)} = ${fmt(exact)}.` };
  }),
];
