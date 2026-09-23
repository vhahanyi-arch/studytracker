// Stage 8, unit 10: Percentages (8Nf.05).
import { T, type Template } from "../engine";
import { r, pick, gcd, fmt, ans, money, tidyNum, an } from "../kit";

const U = "s8-u10";
const PCTS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75];
/** An amount that p% of comes out whole: a multiple of 100 / gcd(p, 100). */
const baseFor = (p: number, lo: number, hi: number) => { const step = 100 / [100, 50, 25, 20, 10, 5, 4, 2, 1].find((g) => p % g === 0 && 100 % g === 0)!; return step * r(Math.ceil(lo / step), Math.floor(hi / step)); };

export const s8u10: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Nf.05"], "Increase an amount by a percentage", () => {
    const p = pick(PCTS), x = baseFor(p, 20, 400);
    return { prompt: `Increase ${x} by ${p}%.`, answers: [ans(x * (1 + p / 100))], hint: `Find ${p}% of ${x}, then add it on, or multiply by ${fmt(1 + p / 100)}.`, solution: `${p}% of ${x} = ${fmt(x * p / 100)}, so ${x} + ${fmt(x * p / 100)} = ${fmt(x * (1 + p / 100))}.` };
  }),
  T(`${U}-f2`, "foundational", ["8Nf.05"], "Decrease an amount by a percentage", () => {
    const p = pick(PCTS), x = baseFor(p, 20, 400);
    return { prompt: `Decrease ${x} by ${p}%.`, answers: [ans(x * (1 - p / 100))], hint: `Find ${p}% of ${x}, then take it away, or multiply by ${fmt(1 - p / 100)}.`, solution: `${p}% of ${x} = ${fmt(x * p / 100)}, so ${x} − ${fmt(x * p / 100)} = ${fmt(x * (1 - p / 100))}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Nf.05"], "Find the absolute change", () => {
    const from = r(20, 200), change = r(3, 60), up = Math.random() < 0.5;
    const to = up ? from + change : from - Math.min(change, from - 5);
    const diff = Math.abs(to - from);
    return { prompt: `A price changes from R${from} to R${to}. What is the absolute change in rand?`, answers: [String(diff)], hint: "The absolute change is the difference between the two values, in rand, not as a percentage.", solution: `The difference between R${from} and R${to} is R${diff}, so the price ${up ? "rises" : "falls"} by R${diff}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Nf.05"], "Find a percentage change", () => {
    const p = pick(PCTS), from = baseFor(p, 20, 400), up = Math.random() < 0.5, to = up ? from * (1 + p / 100) : from * (1 - p / 100);
    return { prompt: `A value ${up ? "rises" : "falls"} from ${from} to ${fmt(to)}. Find the percentage ${up ? "increase" : "decrease"}.`, answers: [String(p), `${p}%`], hint: "Percentage change = change ÷ original value × 100.", solution: `Change = ${fmt(Math.abs(to - from))}; ${fmt(Math.abs(to - from))} ÷ ${from} × 100 = ${p}%.` };
  }),
  T(`${U}-f5`, "foundational", ["8Nf.05"], "Find the multiplier for a percentage increase", () => {
    const p = r(1, 60);
    return { prompt: `What single number do you multiply by to increase an amount by ${p}%?`, answers: [ans(1 + p / 100)], hint: "The new amount is 100% plus the increase.", solution: `100% + ${p}% = ${100 + p}% = ${fmt(1 + p / 100)}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Nf.05"], "Find the multiplier for a percentage decrease", () => {
    const p = r(1, 60);
    return { prompt: `What single number do you multiply by to decrease an amount by ${p}%?`, answers: [ans(1 - p / 100)], hint: "The new amount is 100% minus the decrease.", solution: `100% − ${p}% = ${100 - p}% = ${fmt(1 - p / 100)}.` };
  }),
  T(`${U}-f7`, "foundational", ["review"], "Find a percentage of an amount", () => {
    const p = pick(PCTS), x = baseFor(p, 20, 600);
    return { prompt: `Find ${p}% of ${x}.`, answers: [ans(x * p / 100)], hint: `Find 1% or 10% first, then scale up to ${p}%.`, solution: `${p}% of ${x} = ${x} × ${fmt(p / 100)} = ${fmt(x * p / 100)}.` };
  }),
  T(`${U}-f8`, "foundational", ["review"], "Write one amount as a percentage of another", () => {
    // The whole is a multiple of 100 / gcd(p, 100), so the part is always whole.
    const p = pick([5, 10, 12, 15, 20, 25, 30, 40, 45, 60, 75, 80]), whole = (100 / gcd(p, 100)) * r(1, Math.max(1, Math.floor(300 / (100 / gcd(p, 100))))), part = (whole * p) / 100;
    return { prompt: `Write ${part} as a percentage of ${whole}.`, answers: [String(p), `${p}%`], hint: "Divide the part by the whole and multiply by 100.", solution: `${part} ÷ ${whole} × 100 = ${p}%.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Nf.05"], "Apply a price increase", () => {
    const p = pick(PCTS), price = baseFor(p, 40, 900);
    const item = pick(["a school bag", "a bicycle", "a pair of shoes", "a jacket"]);
    return { prompt: `The price of ${item} is R${price}. It increases by ${p}%. Find the new price in rand.`, answers: [ans(price * (1 + p / 100)), money(price * (1 + p / 100))], hint: `Multiply by ${fmt(1 + p / 100)}.`, solution: `R${price} × ${fmt(1 + p / 100)} = R${money(price * (1 + p / 100))}.` };
  }),
  T(`${U}-a2`, "application", ["8Nf.05"], "Apply a discount", () => {
    const p = pick(PCTS), price = baseFor(p, 40, 900);
    return { prompt: `A shop takes ${p}% off an item priced R${price}. Find the sale price in rand.`, answers: [ans(price * (1 - p / 100)), money(price * (1 - p / 100))], hint: `Multiply by ${fmt(1 - p / 100)}.`, solution: `R${price} × ${fmt(1 - p / 100)} = R${money(price * (1 - p / 100))}.` };
  }),
  T(`${U}-a3`, "application", ["8Nf.05"], "Add VAT", () => {
    const price = 20 * r(3, 60);
    return { prompt: `A repair costs R${price} before VAT. VAT of 15% is added. Find the total cost in rand.`, answers: [ans(price * 1.15), money(price * 1.15)], hint: "Multiply by 1.15.", solution: `R${price} × 1.15 = R${money(price * 1.15)}.` };
  }),
  T(`${U}-a4`, "application", ["8Nf.05"], "Compare absolute and percentage changes", () => {
    // The larger rise in rand goes with the larger price, so the obvious answer is often wrong.
    let a = 10 * r(3, 8), inc = pick([5, 10]), b = a * r(3, 5), incB = inc * r(1, 4);
    while (Math.abs((inc / a) - (incB / b)) * 100 < 0.5) { b = a * r(3, 5); incB = inc * r(1, 4); }
    const pa = (inc / a) * 100, pb = (incB / b) * 100;
    const answer = pa > pb ? "first" : "second";
    return { prompt: `A R${a} item rises by R${inc}. A R${b} item rises by R${incB}. Which has the greater percentage increase, the first or the second?`, answers: [answer, "the " + answer], hint: "The larger absolute rise is not necessarily the larger percentage rise.", solution: `First: ${fmt(pa, 1)}%; second: ${fmt(pb, 1)}%. So the ${answer} has the greater percentage increase.`, answerFormat: "Enter first or second." };
  }),
  T(`${U}-a5`, "application", ["8Nf.05"], "Find a percentage decrease in context", () => {
    const p = pick([5, 10, 15, 20, 25]), from = 100 * r(12, 60), to = from * (1 - p / 100);
    return { prompt: `A town's population falls from ${from} to ${to}. Find the percentage decrease.`, answers: [String(p), `${p}%`], hint: "Divide the fall by the original population, then multiply by 100.", solution: `Fall = ${from - to}; ${from - to} ÷ ${from} × 100 = ${p}%.` };
  }),
  T(`${U}-a6`, "application", ["8Nf.05"], "Find an increase in rand from a percentage", () => {
    const p = pick(PCTS), bill = baseFor(p, 60, 900);
    return { prompt: `A monthly bill of R${bill} goes up by ${p}%. By how many rand does it go up?`, answers: [ans(bill * p / 100), money(bill * p / 100)], hint: "This asks for the absolute change, not the new bill.", solution: `${p}% of R${bill} = R${money(bill * p / 100)}.` };
  }),
  T(`${U}-a7`, "application", ["8Nf.05"], "Use a multiplier in context", () => {
    const p = pick([10, 15, 20, 25, 30, 35, 40]);
    const up = Math.random() < 0.5;
    return { prompt: `What single number should a shop multiply its prices by to ${up ? `increase them by ${p}%` : `give a ${p}% discount`}?`, answers: [ans(up ? 1 + p / 100 : 1 - p / 100)], hint: up ? "Add the percentage to 100%." : "Subtract the percentage from 100%.", solution: `${up ? `100% + ${p}%` : `100% − ${p}%`} = ${up ? 100 + p : 100 - p}%, which is ${fmt(up ? 1 + p / 100 : 1 - p / 100)}.` };
  }),
  T(`${U}-a8`, "application", ["8Nf.05"], "Find a percentage increase in context", () => {
    const p = pick([4, 5, 8, 10, 12, 15]), from = 50 * r(80, 400), to = from * (1 + p / 100);
    return { prompt: `A salary rises from R${from} to R${fmt(to)} a month. Find the percentage increase.`, answers: [String(p), `${p}%`], hint: "Divide the rise by the original salary, then multiply by 100.", solution: `Rise = ${fmt(to - from)}; ${fmt(to - from)} ÷ ${from} × 100 = ${p}%.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Nf.05"], "Find the original price after an increase", () => {
    const p = pick([10, 20, 25, 50]), original = 20 * r(3, 40), now = original * (1 + p / 100);
    return { prompt: `After a ${p}% increase, an item costs R${fmt(now)}. Find the original price in rand.`, answers: [String(original)], hint: `The new price is ${100 + p}% of the original, so divide by ${fmt(1 + p / 100)}.`, solution: `R${fmt(now)} ÷ ${fmt(1 + p / 100)} = R${original}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Nf.05"], "Combine an increase and a decrease", () => {
    const p = pick([10, 20, 25, 50]), price = 100 * r(1, 9);
    const final = tidyNum(price * (1 + p / 100) * (1 - p / 100), 6);
    return { prompt: `A price of R${price} increases by ${p}%, then the new price decreases by ${p}%. Find the final price in rand.`, answers: [ans(final), money(final)], hint: "The decrease is a percentage of the larger, increased price.", solution: `R${price} × ${fmt(1 + p / 100)} × ${fmt(1 - p / 100)} = R${money(final)}, which is less than the original.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Nf.05"], "Correct a reverse-percentage error", () => {
    const p = pick([10, 20, 25]), original = 20 * r(3, 20), now = original * (1 + p / 100), wrong = now * (1 - p / 100);
    return { prompt: `After a ${p}% increase a price is R${fmt(now)}. A learner decreases R${fmt(now)} by ${p}% to find the original and gets R${fmt(wrong)}. What was the original price in rand?`, answers: [String(original)], hint: "The increase was a percentage of the original, not of the new price.", solution: `Original = R${fmt(now)} ÷ ${fmt(1 + p / 100)} = R${original}.` };
  }),
  T(`${U}-r4`, "reasoning", ["8Nf.05"], "Find an original from an absolute change", () => {
    const p = pick([4, 5, 8, 10, 12, 15, 20]), original = 50 * r(2, 30), rise = (original * p) / 100;
    return { prompt: `A price increased by ${p}%, which was an increase of R${fmt(rise)}. Find the original price in rand.`, answers: [String(original)], hint: `R${fmt(rise)} is ${p}% of the original, so find 1% first.`, solution: `1% = R${fmt(rise)} ÷ ${p} = R${fmt(rise / p)}, so 100% = R${original}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8Nf.05"], "Read a percentage change from a multiplier", () => {
    const p = r(2, 45), up = Math.random() < 0.5, m = up ? 1 + p / 100 : 1 - p / 100;
    return { prompt: `A value is multiplied by ${fmt(m)}. What is the percentage ${up ? "increase" : "decrease"}?`, answers: [String(p), `${p}%`], hint: "Compare the multiplier with 1, which leaves the value unchanged.", solution: `${fmt(m)} = ${up ? 100 + p : 100 - p}%, a ${up ? "rise" : "fall"} of ${p}%.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Nf.05"], "Compare successive discounts with one discount", () => {
    const p = pick([10, 20]), price = 100 * r(2, 12);
    const one = price * (1 - (2 * p) / 100), two = tidyNum(price * (1 - p / 100) * (1 - p / 100), 6);
    return { prompt: `Shop A takes ${2 * p}% off a R${price} item in one step. Shop B takes ${p}% off, then another ${p}% off the new price. Which shop is cheaper, A or B?`, answers: ["A", "shop A"], hint: "The second discount at shop B is taken from a smaller price.", solution: `A: R${fmt(one)}; B: R${money(two)}. So shop A is cheaper.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-r7`, "reasoning", ["8Nf.05"], "Compare two percentages of amounts", () => {
    const a = pick([10, 20, 25, 30, 40, 50, 60, 75, 80]), b = pick([20, 40, 60, 80, 120]);
    return { prompt: `Which is larger: ${a}% of ${b} or ${b}% of ${a}? Enter the value of the larger, or the common value if they are equal.`, answers: [ans((a * b) / 100)], hint: "Write each as a product over 100.", solution: `${a}% of ${b} = ${a} × ${b} ÷ 100 = ${fmt((a * b) / 100)}, and ${b}% of ${a} gives the same product, so both equal ${fmt((a * b) / 100)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Nf.05"], "Find the overall change of two percentage changes", () => {
    const [up, down] = pick([[25, 20], [50, 20], [20, 25], [10, 10], [100, 50], [25, 40]]);
    const factor = (1 + up / 100) * (1 - down / 100), change = tidyNum((factor - 1) * 100, 6);
    const word = change > 0 ? "increase" : change < 0 ? "decrease" : "no change";
    return { prompt: `A value increases by ${up}% and then decreases by ${down}%. What is the overall percentage change? Enter a negative number for a decrease.`, answers: [ans(change), `${ans(change)}%`], hint: `Multiply the multipliers: ${fmt(1 + up / 100)} × ${fmt(1 - down / 100)}.`, solution: `${fmt(1 + up / 100)} × ${fmt(1 - down / 100)} = ${fmt(factor)}, which is ${word === "no change" ? "no change, 0%" : `${an(word)} ${word} of ${fmt(Math.abs(change))}%, written ${fmt(change)}`}.` };
  }),
];
