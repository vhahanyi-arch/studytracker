// Stage 8, unit 3: Place value and rounding (8Np.01, 8Np.02).
import { T, type Template } from "../engine";
import { r, pick, fmt, ans, roundSF, roundDP, big, tidyNum } from "../kit";

const U = "s8-u3";

/** A number with `sig` significant digits, none of them trailing zeros, at magnitude 10^exp. */
function digits(sig: number, exp: number) {
  let m = r(10 ** (sig - 1), 10 ** sig - 1);
  while (m % 10 === 0) m = r(10 ** (sig - 1), 10 ** sig - 1);
  return tidyNum(m * 10 ** (exp - sig + 1), 12);
}

/** Rounding that must not land exactly on a tie at the cut, so the answer is unambiguous. */
function sfCase(sig: number, exp: number, to: number) {
  for (;;) {
    const x = digits(sig, exp);
    const scaled = tidyNum(x / 10 ** (Math.floor(Math.log10(x)) - to + 1), 8);
    if (Math.abs(scaled - Math.floor(scaled) - 0.5) > 1e-9) return { x, rounded: roundSF(x, to) };
  }
}

const sf = (n: number) => (n === 1 ? "1 significant figure" : `${n} significant figures`);

export const s8u3: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Np.02"], "Round a whole number to 1 significant figure", () => {
    const exp = r(2, 4), { x, rounded } = sfCase(r(3, exp + 1), exp, 1);
    return { prompt: `Round ${big(x)} to 1 significant figure.`, answers: [ans(rounded)], hint: "Keep the first non-zero digit, look at the next digit, and replace the rest with zeros.", solution: `${big(x)} rounds to ${big(rounded)} to 1 significant figure.` };
  }),
  T(`${U}-f2`, "foundational", ["8Np.02"], "Round a decimal to significant figures", () => {
    const to = r(2, 3), { x, rounded } = sfCase(to + r(1, 2), -r(1, 3), to);
    return { prompt: `Round ${fmt(x)} to ${sf(to)}.`, answers: [ans(rounded)], hint: "Count from the first non-zero digit; zeros before it are not significant.", solution: `${fmt(x)} rounds to ${fmt(rounded)} to ${sf(to)}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Np.02"], "Round to 3 significant figures", () => {
    const { x, rounded } = sfCase(r(4, 6), r(3, 5), 3);
    return { prompt: `Round ${big(x)} to 3 significant figures.`, answers: [ans(rounded)], hint: "Keep three significant digits and fill the remaining places with zeros.", solution: `${big(x)} rounds to ${big(rounded)} to 3 significant figures.` };
  }),
  T(`${U}-f4`, "foundational", ["8Np.01"], "Multiply by 0.1", () => {
    const x = pick([digits(r(2, 3), r(0, 2)), digits(2, -1)]);
    return { prompt: `Calculate ${fmt(x)} × 0.1.`, answers: [ans(x * 0.1)], hint: "Multiplying by 0.1 is the same as dividing by 10.", solution: `${fmt(x)} × 0.1 = ${fmt(x)} ÷ 10 = ${fmt(x * 0.1)}.` };
  }),
  T(`${U}-f5`, "foundational", ["8Np.01"], "Divide by 0.1", () => {
    const x = pick([digits(r(1, 3), r(0, 1)), digits(2, -1)]);
    return { prompt: `Calculate ${fmt(x)} ÷ 0.1.`, answers: [ans(x / 0.1)], hint: "Dividing by 0.1 is the same as multiplying by 10.", solution: `${fmt(x)} ÷ 0.1 = ${fmt(x)} × 10 = ${fmt(x / 0.1)}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Np.01"], "Multiply by 0.01", () => {
    const x = digits(r(2, 3), r(1, 3));
    return { prompt: `Calculate ${fmt(x)} × 0.01.`, answers: [ans(x * 0.01)], hint: "Multiplying by 0.01 is the same as dividing by 100.", solution: `${fmt(x)} × 0.01 = ${fmt(x)} ÷ 100 = ${fmt(x * 0.01)}.` };
  }),
  T(`${U}-f7`, "foundational", ["8Np.01"], "Divide by 0.01", () => {
    const x = digits(r(1, 3), r(-2, 0));
    return { prompt: `Calculate ${fmt(x)} ÷ 0.01.`, answers: [ans(x / 0.01)], hint: "Dividing by 0.01 is the same as multiplying by 100.", solution: `${fmt(x)} ÷ 0.01 = ${fmt(x)} × 100 = ${fmt(x / 0.01)}.` };
  }),
  T(`${U}-f8`, "foundational", ["review"], "Round to decimal places", () => {
    const dp = r(1, 2);
    let x = tidyNum(r(1000, 99999) / 10 ** (dp + 2), 12);
    while (Math.abs(tidyNum(x * 10 ** dp, 8) % 1 - 0.5) < 1e-9) x = tidyNum(r(1000, 99999) / 10 ** (dp + 2), 12);
    return { prompt: `Round ${fmt(x)} to ${dp} decimal place${dp === 1 ? "" : "s"}.`, answers: [ans(roundDP(x, dp))], hint: "Look at the digit after the last place you keep: 5 or more rounds up.", solution: `${fmt(x)} rounds to ${fmt(roundDP(x, dp))}.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Np.02"], "Round a large quantity to significant figures", () => {
    const exp = r(5, 6), to = r(1, 2), { x, rounded } = sfCase(r(4, exp + 1), exp, to);
    const what = pick(["The population of a city is", "A stadium sold", "A website had", "A country produced"]);
    const unit = { "The population of a city is": "people", "A stadium sold": "tickets this season", "A website had": "visits last year", "A country produced": "tonnes of maize" }[what];
    return { prompt: `${what} ${big(x)} ${unit}. Round this to ${sf(to)}.`, answers: [ans(rounded)], hint: "Keep the significant figures you need and replace the other whole-number digits with zeros.", solution: `${big(x)} to ${sf(to)} is ${big(rounded)}.` };
  }),
  T(`${U}-a2`, "application", ["8Np.02"], "Round a small measurement to significant figures", () => {
    const to = r(1, 2), { x, rounded } = sfCase(r(3, 4), -r(2, 4), to);
    const what = pick(["A seed has a mass of", "A sheet of paper is", "A raindrop has a volume of", "A wire has a diameter of"]);
    const unit = { "A seed has a mass of": "g", "A sheet of paper is": "mm thick", "A raindrop has a volume of": "ml", "A wire has a diameter of": "cm" }[what];
    return { prompt: `${what} ${fmt(x)} ${unit}. Round this to ${sf(to)}.`, answers: [ans(rounded)], hint: "The zeros after the decimal point and before the first non-zero digit are not significant.", solution: `${fmt(x)} to ${sf(to)} is ${fmt(rounded)}.` };
  }),
  T(`${U}-a3`, "application", ["8Np.02"], "Estimate a product using 1 significant figure", () => {
    const a = sfCase(3, 2, 1), b = sfCase(2, 1, 1);
    return { prompt: `Estimate ${a.x} × ${b.x} by rounding each number to 1 significant figure.`, answers: [ans(a.rounded * b.rounded)], hint: "Round both numbers first, then multiply.", solution: `${a.x} ≈ ${a.rounded} and ${b.x} ≈ ${b.rounded}, so ${a.rounded} × ${b.rounded} = ${big(a.rounded * b.rounded)}.` };
  }),
  T(`${U}-a4`, "application", ["8Np.02"], "Estimate a quotient using 1 significant figure", () => {
    const d = pick([20, 30, 40, 50, 60]);
    const top = pick([2, 3, 4, 5, 6, 7, 8, 9].filter((k) => (k * 1000) % d === 0)) * 1000;
    const x = top + pick([-1, 1]) * r(10, 400), y = d + pick([-1, 1]) * r(1, 4);
    return { prompt: `Estimate ${big(x)} ÷ ${y} by rounding each number to 1 significant figure.`, answers: [ans(top / d)], hint: "Round both numbers first; then the division is easy.", solution: `${big(x)} ≈ ${big(top)} and ${y} ≈ ${d}, so ${big(top)} ÷ ${d} = ${top / d}.` };
  }),
  T(`${U}-a5`, "application", ["8Np.01"], "Convert units by multiplying by 0.01", () => {
    const [from, to, n] = pick([["cm", "m", r(120, 980)], ["cents", "rand", r(150, 9500)], ["mm", "dm", r(200, 900)]] as const);
    return { prompt: `1 ${from.replace(/s$/, "")} = 0.01 ${to}. Convert ${n} ${from} to ${to} by multiplying by 0.01.`, answers: [ans(n * 0.01)], hint: "Multiplying by 0.01 moves every digit two places to the right of where it was.", solution: `${n} × 0.01 = ${fmt(n * 0.01)} ${to}.` };
  }),
  T(`${U}-a6`, "application", ["8Np.01"], "Divide by 0.1 in context", () => {
    const length = tidyNum(r(12, 95) / 10, 4);
    return { prompt: `A ${fmt(length)} m ribbon is cut into pieces 0.1 m long. How many pieces are there?`, answers: [ans(length / 0.1)], hint: "Dividing by 0.1 is the same as multiplying by 10.", solution: `${fmt(length)} ÷ 0.1 = ${fmt(length)} × 10 = ${fmt(length / 0.1)} pieces.` };
  }),
  T(`${U}-a7`, "application", ["8Np.01"], "Divide by 0.01 in context", () => {
    const mass = tidyNum(r(12, 95) / 100, 4);
    return { prompt: `A scoop holds 0.01 kg of flour. How many scoops are in ${fmt(mass)} kg?`, answers: [ans(mass / 0.01)], hint: "Dividing by 0.01 is the same as multiplying by 100.", solution: `${fmt(mass)} ÷ 0.01 = ${fmt(mass)} × 100 = ${fmt(mass / 0.01)} scoops.` };
  }),
  T(`${U}-a8`, "application", ["8Np.02"], "Round money to significant figures", () => {
    const exp = r(3, 4), to = r(2, 3), { x, rounded } = sfCase(exp + 3, exp, to);
    return { prompt: `A car costs R${big(x)}. Round the price to ${sf(to)}.`, answers: [ans(rounded)], hint: "Count significant figures from the first digit.", solution: `R${big(x)} to ${sf(to)} is R${big(rounded)}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Np.02"], "Find the smallest value that rounds to a number", () => {
    const to = r(1, 2), rounded = roundSF(digits(to, r(2, 3)), to), step = 10 ** (Math.floor(Math.log10(rounded)) - to + 1);
    return { prompt: `A length is ${big(rounded)} cm, correct to ${sf(to)}. What is the smallest the length could be?`, answers: [ans(rounded - step / 2)], hint: `The length rounds to ${big(rounded)}, so it is within half of ${big(step)} of it.`, solution: `Half of ${big(step)} is ${fmt(step / 2)}, so the smallest length is ${big(rounded)} − ${fmt(step / 2)} = ${fmt(rounded - step / 2)} cm.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Np.01"], "Connect × 0.1 and ÷ 10", () => {
    const x = digits(2, r(0, 1));
    if (Math.random() < 0.5) return { prompt: `${fmt(x)} ÷ 0.1 = ${fmt(x)} × □. Find □.`, answers: ["10"], hint: "How many tenths are there in 1?", solution: `Dividing by 0.1 counts tenths, and there are 10 tenths in 1, so □ = 10.` };
    return { prompt: `${fmt(x)} × 0.01 = ${fmt(x)} ÷ □. Find □.`, answers: ["100"], hint: "0.01 is one hundredth.", solution: `Multiplying by one hundredth divides by 100, so □ = 100.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Np.02"], "Correct a significant-figure error", () => {
    const { x, rounded } = sfCase(4, -2, 2);
    const wrong = roundDP(x, 2);
    if (wrong === rounded) return { prompt: `A learner rounds ${fmt(x)} to 2 significant figures and writes ${fmt(roundSF(x, 1))}. Enter the correct value.`, answers: [ans(rounded)], hint: "Two significant figures means two digits counted from the first non-zero digit.", solution: `The first two significant digits of ${fmt(x)} give ${fmt(rounded)}.` };
    return { prompt: `A learner rounds ${fmt(x)} to 2 significant figures and writes ${fmt(wrong)}. Enter the correct value.`, answers: [ans(rounded)], hint: "The learner rounded to 2 decimal places. Start counting at the first non-zero digit.", solution: `Counting from the first non-zero digit, ${fmt(x)} is ${fmt(rounded)} to 2 significant figures.` };
  }),
  T(`${U}-r4`, "reasoning", ["8Np.01"], "Find a missing number with × 0.01", () => {
    const x = digits(r(2, 3), r(1, 3));
    return { prompt: `□ × 0.01 = ${fmt(x * 0.01)}. Find □.`, answers: [ans(x)], hint: "Undo × 0.01 by multiplying by 100.", solution: `□ = ${fmt(x * 0.01)} × 100 = ${fmt(x)}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8Np.01"], "Compare × 0.1 with ÷ 0.1", () => {
    const x = r(12, 95);
    return { prompt: `Find the difference between ${x} ÷ 0.1 and ${x} × 0.1.`, answers: [ans(x * 10 - x / 10)], hint: "One of these makes the number 10 times larger, the other 10 times smaller.", solution: `${x} ÷ 0.1 = ${x * 10} and ${x} × 0.1 = ${fmt(x / 10)}; the difference is ${fmt(x * 10 - x / 10)}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Np.02"], "Find the error in an estimate", () => {
    const a = sfCase(2, 1, 1), b = sfCase(2, 1, 1);
    const exact = a.x * b.x, est = a.rounded * b.rounded;
    return { prompt: `Estimate ${a.x} × ${b.x} using 1 significant figure, then find the difference between your estimate and the exact answer.`, answers: [ans(Math.abs(exact - est))], hint: "Work out both, then subtract the smaller from the larger.", solution: `Estimate ${a.rounded} × ${b.rounded} = ${est}; exact ${a.x} × ${b.x} = ${exact}; difference ${Math.abs(exact - est)}.` };
  }),
  T(`${U}-r7`, "reasoning", ["8Np.02"], "Count significant figures", () => {
    const n = r(2, 4), x = digits(n, -r(1, 3));
    return { prompt: `How many significant figures does ${fmt(x)} have?`, answers: [String(n)], hint: "Start counting at the first non-zero digit.", solution: `The significant digits of ${fmt(x)} start at its first non-zero digit: there are ${n}.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Np.02"], "Find the largest value that rounds to a number", () => {
    const rounded = r(2, 9) * 1000;
    return { prompt: `A whole number rounds to ${big(rounded)} to 1 significant figure. What is the largest it could be?`, answers: [ans(rounded + 499)], hint: "Which whole numbers round to this at 1 significant figure? The next one up would round higher.", solution: `Whole numbers from ${big(rounded - 500)} to ${big(rounded + 499)} round to ${big(rounded)}, so the largest is ${big(rounded + 499)}.` };
  }),
];
