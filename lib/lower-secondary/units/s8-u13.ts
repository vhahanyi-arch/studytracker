// Stage 8, unit 13: Probability (8Sp.01 to 8Sp.04).
// Expected frequency, and mutually exclusive events summing to 1, are Stage 9
// (9Sp.01, 9Sp.04), so experiments here compare probabilities, not counts.
import { T, type Template } from "../engine";
import { r, pick, shuffle, frac, fracStr, terminates, ans, fmt, tidyNum, distinct } from "../kit";

const U = "s8-u13";
const PROB = "Enter the probability as a fraction, for example 3/8, or as a decimal.";
const YES_NO = "Enter yes or no.";

/** A probability as its simplest fraction, with the other forms a student may give. */
function prob(n: number, d: number) {
  const f = frac(n, d), text = fracStr(f);
  const answers = [text, `${n}/${d}`];
  if (terminates(f)) answers.push(ans(n / d));
  return { text, answers: [...new Set(answers)] };
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const DIE = range(1, 6);
/** Every ordered pair of outcomes from two independent choices. */
const pairs = (a: number[], b: number[]) => a.flatMap((x) => b.map((y) => [x, y] as const));
const count = (a: number[], b: number[], test: (x: number, y: number) => boolean) => pairs(a, b).filter(([x, y]) => test(x, y)).length;
/** The number of ways two fair dice give a total of s. */
const waysToTotal = (s: number) => 6 - Math.abs(s - 7);

type Event = { text: string; test: (x: number, y: number) => boolean };
function diceEvent(): Event {
  const s = r(4, 10), g = r(6, 10), d = r(1, 4);
  return pick<Event>([
    { text: `the total is ${s}`, test: (x, y) => x + y === s },
    { text: `the total is greater than ${g}`, test: (x, y) => x + y > g },
    { text: "both dice show an even number", test: (x, y) => x % 2 === 0 && y % 2 === 0 },
    { text: "the product of the two numbers is even", test: (x, y) => (x * y) % 2 === 0 },
    { text: "the two dice show the same number", test: (x, y) => x === y },
    { text: `the two numbers differ by ${d}`, test: (x, y) => Math.abs(x - y) === d },
  ]);
}

export const s8u13: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Sp.01"], "Use complementary events", () => {
    const p = r(3, 97) / 100;
    const [event, not] = pick([["a bus is late", "it is not late"], ["it rains tomorrow", "it does not rain tomorrow"], ["a team wins its next match", "it does not win"], ["a seed grows", "it does not grow"]]);
    return { prompt: `The probability that ${event} is ${fmt(p)}. What is the probability that ${not}?`, answers: [ans(1 - p)], hint: "An event and its complement have probabilities that add up to 1.", solution: `1 − ${fmt(p)} = ${fmt(tidyNum(1 - p))}.`, answerFormat: PROB };
  }),
  T(`${U}-f2`, "foundational", ["8Sp.02"], "Count the outcomes of two events", () => {
    const n = r(3, 8), a = r(2, 5), b = r(2, 5);
    const [what, total, how] = pick([
      ["two coins are flipped", 4, "2 × 2"],
      ["a coin is flipped and a dice is rolled", 12, "2 × 6"],
      ["two dice are rolled", 36, "6 × 6"],
      [`a coin is flipped and a spinner with ${n} equal sections is spun`, 2 * n, `2 × ${n}`],
      [`a dice is rolled and a spinner with ${n} equal sections is spun`, 6 * n, `6 × ${n}`],
      [`a meal is made from one of ${a} starters and one of ${b} main courses`, a * b, `${a} × ${b}`],
    ] as const);
    return { prompt: `How many different outcomes are there when ${what}?`, answers: [String(total)], hint: "List them in a table: each outcome of the first can go with each outcome of the second.", solution: `Each of the first outcomes pairs with each of the second: ${how} = ${total}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Sp.03"], "Find a probability with two coins", () => {
    const [event, n] = pick([["two heads", 1], ["two tails", 1], ["one head and one tail", 2], ["at least one head", 3]] as const);
    const p = prob(n, 4);
    const how = pick(["Two fair coins are flipped", "A fair coin is flipped twice"]);
    return { prompt: `${how}. What is the probability of getting ${event}?`, answers: p.answers, hint: "List the equally likely outcomes: HH, HT, TH, TT.", solution: `${n} of the 4 outcomes (HH, HT, TH, TT) give ${event}, so the probability is ${p.text}.`, answerFormat: PROB };
  }),
  T(`${U}-f4`, "foundational", ["8Sp.03"], "Find the probability of a total with two dice", () => {
    const s = r(2, 12), n = waysToTotal(s), p = prob(n, 36);
    return { prompt: `Two fair dice are rolled and the scores are added. What is the probability that the total is ${s}?`, answers: p.answers, hint: "Draw the 6 by 6 table of totals and count the cells that match.", solution: `${n} of the 36 equally likely outcomes give ${s}, so the probability is ${n}/36${p.text === `${n}/36` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-f5`, "foundational", ["8Sp.04"], "Find an experimental probability", () => {
    const N = pick([20, 25, 40, 50, 100]), k = r(2, N - 2);
    const [thing, result] = pick([["A drawing pin is dropped", "it lands point up"], ["A paper cup is thrown", "it lands on its side"], ["A spinner is spun", "it lands on red"], ["A bottle top is flipped", "it lands face up"]]);
    return { prompt: `${thing} ${N} times, and ${result} ${k} times. What is the experimental probability that ${result}?`, answers: [ans(k / N), fracStr(frac(k, N)), `${k}/${N}`], hint: "Experimental probability = number of times it happened ÷ number of trials.", solution: `${k} ÷ ${N} = ${fmt(k / N)}.`, answerFormat: PROB };
  }),
  T(`${U}-f6`, "foundational", ["8Sp.01"], "Find the probability that something does not happen", () => {
    const [red, blue, green] = [r(1, 9), r(1, 9), r(1, 9)], total = red + blue + green;
    const colour = pick(["red", "blue", "green"] as const), n = { red, blue, green }[colour], p = prob(total - n, total);
    return { prompt: `A bag holds ${red} red, ${blue} blue and ${green} green counters. One is taken at random. What is the probability that it is not ${colour}?`, answers: p.answers, hint: "P(not A) = 1 − P(A).", solution: `P(${colour}) = ${n}/${total}, so P(not ${colour}) = 1 − ${n}/${total} = ${total - n}/${total}${p.text === `${total - n}/${total}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-f7`, "foundational", ["8Sp.02"], "Count outcomes in a sample space", () => {
    const a = r(3, 5), b = r(3, 6), s = r(3, a + b - 1), A = range(1, a), B = range(1, b);
    const n = count(A, B, (x, y) => x + y === s), list = pairs(A, B).filter(([x, y]) => x + y === s).map(([x, y]) => `(${x}, ${y})`).join(", ");
    return { prompt: `Spinner A is numbered 1 to ${a} and spinner B is numbered 1 to ${b}. Both are spun and the scores are added. How many of the possible outcomes give a total of ${s}?`, answers: [String(n)], hint: "Draw a table with spinner A down the side and spinner B across the top.", solution: `The outcomes are ${list}: that is ${n}.` };
  }),
  T(`${U}-f8`, "foundational", ["8Sp.04"], "Compare experimental and theoretical probability", () => {
    const coin = pick([true, false]), N = coin ? pick([40, 50, 100]) : pick([30, 60, 120]), theory = coin ? N / 2 : N / 6;
    let k = theory + r(-8, 8);
    if (k === theory) k += 3;
    if (k < 2) k = theory + r(2, 8);
    const higher = k > theory, face = coin ? "heads" : "a six";
    return { prompt: `A fair ${coin ? "coin is flipped" : "dice is rolled"} ${N} times and gives ${face} ${k} times. Is the experimental probability of ${face} higher or lower than the theoretical probability?`, answers: [higher ? "higher" : "lower"], hint: "Compare the fraction of trials with the fraction you would expect in theory.", solution: `Experimental: ${k}/${N}. Theoretical: ${coin ? "1/2" : "1/6"}, which is ${theory}/${N}. ${k} is ${higher ? "more" : "less"} than ${theory}, so it is ${higher ? "higher" : "lower"}.`, answerFormat: "Enter higher or lower." };
  }),
  T(`${U}-f9`, "foundational", ["8Sp.03"], "Find a probability with a coin and a spinner", () => {
    const n = r(3, 8), k = r(1, n), side = pick(["heads", "tails"]), p = prob(1, 2 * n);
    return { prompt: `A fair coin is flipped and a fair spinner numbered 1 to ${n} is spun. What is the probability of getting ${side} and a ${k}?`, answers: p.answers, hint: "Count all the equally likely outcomes, then how many match.", solution: `There are 2 × ${n} = ${2 * n} equally likely outcomes and only one is ${side} with ${k}, so the probability is ${p.text}.`, answerFormat: PROB };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Sp.03"], "Find a probability with two dice", () => {
    const e = diceEvent(), n = count(DIE, DIE, e.test);
    if (n === 0) return s8u13.find((t) => t.id === `${U}-a1`)!.make();
    const p = prob(n, 36);
    return { prompt: `Two fair dice are rolled. What is the probability that ${e.text}?`, answers: p.answers, hint: "Use a 6 by 6 table of outcomes and count the ones that fit.", solution: `${n} of the 36 equally likely outcomes fit, so the probability is ${n}/36${p.text === `${n}/36` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a2`, "application", ["8Sp.03"], "Find a probability with two spinners", () => {
    const a = r(3, 5), b = r(3, 6), A = range(1, a), B = range(1, b), s = r(3, a + b - 1);
    const n = count(A, B, (x, y) => x + y === s), p = prob(n, a * b);
    return { prompt: `Fair spinners numbered 1 to ${a} and 1 to ${b} are spun and the scores added. What is the probability of a total of ${s}?`, answers: p.answers, hint: "Make a table of totals: it has one cell for each equally likely outcome.", solution: `There are ${a} × ${b} = ${a * b} outcomes and ${n} give ${s}, so the probability is ${n}/${a * b}${p.text === `${n}/${a * b}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a3`, "application", ["8Sp.01", "8Sp.03"], "Use the complement to find 'at least one'", () => {
    const coins = pick([true, false]);
    if (coins) {
      const p = prob(3, 4);
      return { prompt: `Two fair coins are flipped. Use P(no heads) to find the probability of at least one head.`, answers: p.answers, hint: "\"At least one head\" is the complement of \"no heads\".", solution: `P(no heads) = P(TT) = 1/4, so P(at least one head) = 1 − 1/4 = ${p.text}.`, answerFormat: PROB };
    }
    const k = r(1, 6), p = prob(11, 36);
    return { prompt: `Two fair dice are rolled. Use P(neither dice shows ${k}) to find the probability that at least one shows ${k}.`, answers: p.answers, hint: `"At least one shows ${k}" is the complement of "neither shows ${k}".`, solution: `Outcomes where neither shows ${k}: 5 × 5 = 25 of 36. So P(at least one shows ${k}) = 1 − 25/36 = ${p.text}.`, answerFormat: PROB };
  }),
  T(`${U}-a4`, "application", ["8Sp.04"], "Choose the more reliable estimate", () => {
    const small = pick([10, 20]), big = pick([100, 200, 250, 500]), ks = r(2, small - 2), kb = r(Math.round(big * 0.2), Math.round(big * 0.8));
    const [first, second] = pick([true, false]) ? [[small, ks], [big, kb]] : [[big, kb], [small, ks]];
    return { prompt: `Maya spins a spinner ${first[0]} times and gets red ${first[1]} times. Leo spins the same spinner ${second[0]} times and gets red ${second[1]} times. Using the more reliable results, estimate the probability of red.`, answers: [ans(kb / big), fracStr(frac(kb, big)), `${kb}/${big}`], hint: "More trials give a more reliable estimate.", solution: `The ${big} spins are more reliable: ${kb} ÷ ${big} = ${fmt(kb / big)}.`, answerFormat: PROB };
  }),
  T(`${U}-a5`, "application", ["8Sp.04"], "Decide whether a dice seems biased", () => {
    const N = pick([300, 600, 1200]), expected = N / 6, biased = pick([true, false]);
    const k = biased ? Math.round(expected * pick([1.6, 1.8, 0.4, 0.5])) : expected + r(-Math.round(expected * 0.04), Math.round(expected * 0.04));
    return { prompt: `A dice is rolled ${N} times and lands on six ${k} times. Does the dice seem to be biased? Answer yes or no.`, answers: [biased ? "yes" : "no"], hint: "Compare the experimental probability of a six with 1/6 ≈ 0.167. With many trials they should be close.", solution: `Experimental probability = ${k}/${N} ≈ ${fmt(Math.round((k / N) * 1000) / 1000)}, and 1/6 ≈ 0.167. ${biased ? "Yes: after so many rolls this is too far from 1/6 to be chance." : "No: after this many rolls, that is close to 1/6."}`, answerFormat: YES_NO };
  }),
  T(`${U}-a6`, "application", ["8Sp.02"], "Count combinations systematically", () => {
    const a = r(2, 5), b = r(2, 6), c = r(2, 4);
    const three = pick([true, false]);
    return three
      ? { prompt: `A café offers ${a} starters, ${b} main courses and ${c} desserts. How many different three-course meals can be chosen?`, answers: [String(a * b * c)], hint: "For each starter, list every main course; for each of those, every dessert.", solution: `${a} × ${b} × ${c} = ${a * b * c} meals.` }
      : { prompt: `A school uniform has ${a} shirt colours and ${b} jumper colours. How many different shirt-and-jumper combinations are there?`, answers: [String(a * b)], hint: "Each shirt colour can go with every jumper colour.", solution: `${a} × ${b} = ${a * b} combinations.` };
  }),
  T(`${U}-a7`, "application", ["8Sp.03"], "Find a probability with a coin and a dice", () => {
    const g = r(2, 5);
    const [event, n] = pick([["a head and an even number", 3], ["a tail and an odd number", 3], [`a head and a number greater than ${g}`, 6 - g], [`a tail and a number less than ${g}`, g - 1], ["a tail and a 6", 1]] as const);
    const p = prob(n, 12);
    return { prompt: `A fair coin is flipped and a fair dice is rolled. What is the probability of ${event}?`, answers: p.answers, hint: "There are 2 × 6 = 12 equally likely outcomes.", solution: `${n} of the 12 outcomes give ${event}, so the probability is ${n}/12${p.text === `${n}/12` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a8`, "application", ["8Sp.02"], "Count outcomes in a table of differences", () => {
    const d = r(0, 5), n = count(DIE, DIE, (x, y) => Math.abs(x - y) === d);
    return { prompt: `Two dice are rolled and the difference between the scores is recorded (larger minus smaller). In a table of all 36 outcomes, how many cells show a difference of ${d}?`, answers: [String(n)], hint: "Make the 6 by 6 table, or list the pairs systematically.", solution: `The pairs with a difference of ${d} are ${pairs(DIE, DIE).filter(([x, y]) => Math.abs(x - y) === d).map(([x, y]) => `(${x}, ${y})`).join(", ")}: ${n} cells.` };
  }),
  T(`${U}-a9`, "application", ["8Sp.01"], "Work back from a probability", () => {
    const d = pick([4, 5, 8, 10]), n = r(1, d - 1), total = d * r(3, 8);
    const not = (total * (d - n)) / d;
    return { prompt: `A bag holds ${total} counters. The probability of taking a blue counter is ${fracStr(frac(n, d))}. How many counters are not blue?`, answers: [String(not)], hint: "Find P(not blue) first.", solution: `P(not blue) = 1 − ${fracStr(frac(n, d))} = ${fracStr(frac(d - n, d))}, and ${fracStr(frac(d - n, d))} of ${total} = ${not}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Sp.03"], "Compare the likelihood of two totals", () => {
    const [s1, s2] = distinct(2, 2, 12);
    if (waysToTotal(s1) === waysToTotal(s2)) return s8u13.find((t) => t.id === `${U}-r1`)!.make();
    const more = waysToTotal(s1) > waysToTotal(s2) ? s1 : s2;
    return { prompt: `Two fair dice are rolled and the scores added. Which total is more likely, ${s1} or ${s2}?`, answers: [String(more)], hint: "Count how many of the 36 outcomes give each total.", solution: `${s1} can be made in ${waysToTotal(s1)} ways and ${s2} in ${waysToTotal(s2)} ways, so ${more} is more likely.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Sp.03"], "Decide whether a game is fair", () => {
    const a = r(2, 6), b = r(2, 6), A = range(1, a), B = range(1, b);
    const even = count(A, B, (x, y) => (x + y) % 2 === 0), odd = a * b - even, fair = even === odd;
    return { prompt: `Ana and Ben spin fair spinners numbered 1 to ${a} and 1 to ${b}, and add the scores. Ana wins if the total is even; Ben wins if it is odd. Is the game fair? Answer yes or no.`, answers: [fair ? "yes" : "no"], hint: "Count the even and odd totals in a table of all the outcomes.", solution: `Of the ${a * b} outcomes, ${even} give an even total and ${odd} an odd total, so ${fair ? "yes, it is fair" : `no, it is not fair: ${even > odd ? "Ana" : "Ben"} is more likely to win`}.`, answerFormat: YES_NO };
  }),
  T(`${U}-r3`, "reasoning", ["8Sp.04"], "Find the gap between experiment and theory", () => {
    const n = pick([2, 4, 5, 8, 10]), N = pick([20, 40, 50, 80, 100, 200]), k = Math.round(N / n) + r(-6, 6);
    const diff = tidyNum(Math.abs(k / N - 1 / n));
    if (diff === 0 || k < 2) return s8u13.find((t) => t.id === `${U}-r3`)!.make();
    return { prompt: `A fair spinner has ${n} equal sections, one of them red. It is spun ${N} times and lands on red ${k} times. Find the difference between the experimental and theoretical probabilities of red, as a decimal.`, answers: [ans(diff)], hint: "Write both probabilities as decimals, then subtract the smaller from the larger.", solution: `Experimental = ${k} ÷ ${N} = ${fmt(k / N)}. Theoretical = 1 ÷ ${n} = ${fmt(1 / n)}. Difference = ${fmt(diff)}.`, answerFormat: "Enter a decimal." };
  }),
  T(`${U}-r4`, "reasoning", ["8Sp.01", "8Sp.03"], "Use the complement with two dice", () => {
    const s = r(4, 10);
    const [event, n] = pick([
      ["the dice do not show the same number", 30],
      ["at least one dice shows an even number", 27],
      [`the total is not ${s}`, 36 - waysToTotal(s)],
      ["at least one dice shows a 6", 11],
    ] as const);
    const p = prob(n, 36);
    return { prompt: `Two fair dice are rolled. What is the probability that ${event}?`, answers: p.answers, hint: "It may be quicker to find the probability of the opposite event and subtract from 1.", solution: `The opposite event happens in ${36 - n} of the 36 outcomes, so the probability is 1 − ${36 - n}/36 = ${n}/36${p.text === `${n}/36` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-r5`, "reasoning", ["8Sp.02", "8Sp.03"], "List the outcomes of three coins", () => {
    const [event, n] = pick([["exactly two heads", 3], ["exactly one head", 3], ["three heads", 1], ["all three coins the same", 2], ["at least one tail", 7]] as const);
    const p = prob(n, 8);
    return { prompt: `Three fair coins are flipped. What is the probability of ${event}?`, answers: p.answers, hint: "List all the outcomes systematically: HHH, HHT, HTH, and so on.", solution: `There are 8 outcomes (HHH, HHT, HTH, THH, HTT, THT, TTH, TTT). ${n} give ${event}, so the probability is ${n}/8${p.text === `${n}/8` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-r6`, "reasoning", ["8Sp.02", "8Sp.03"], "List two-digit numbers made from cards", () => {
    const cards = distinct(4, 1, 9).sort((a, b) => a - b), numbers = cards.flatMap((x) => cards.filter((y) => y !== x).map((y) => 10 * x + y));
    const cut = 10 * r(2, 7), even = pick([true, false]);
    const fits = numbers.filter((v) => (even ? v % 2 === 0 : v > cut));
    if (fits.length === 0 || fits.length === 12) return s8u13.find((t) => t.id === `${U}-r6`)!.make();
    const p = prob(fits.length, 12);
    return { prompt: `Cards numbered ${cards.join(", ")} are shuffled. Two are taken in order to make a two-digit number (the first card gives the tens). What is the probability that the number is ${even ? "even" : `greater than ${cut}`}?`, answers: p.answers, hint: "List all 12 possible numbers systematically.", solution: `The 12 numbers are ${numbers.join(", ")}. ${fits.length} of them fit (${fits.join(", ")}), so the probability is ${fits.length}/12${p.text === `${fits.length}/12` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-r7`, "reasoning", ["8Sp.01"], "Solve for a probability using complements", () => {
    const [k, m] = shuffle(distinct(2, 1, 7));
    const event = pick(["a team wins", "it snows", "a light bulb fails", "a train is late"]), p = prob(k, k + m);
    return { prompt: `The probability that ${event} is ${k === 1 ? "" : k}x, and the probability that it does not is ${m === 1 ? "" : m}x. What is the probability that ${event}?`, answers: p.answers, hint: "The two probabilities are complementary, so they add up to 1.", solution: `${k + m}x = 1, so x = 1/${k + m} and the probability is ${k} × 1/${k + m} = ${p.text}.`, answerFormat: PROB };
  }),
  T(`${U}-r8`, "reasoning", ["8Sp.04"], "Combine results from several experiments", () => {
    const trials = shuffle([20, 30, 50]), heads = trials.map((t) => Math.round(t / 2) + r(-5, 5)), total = heads.reduce((s, h) => s + h, 0);
    return { prompt: `Three groups flip the same coin. Group A gets ${heads[0]} heads in ${trials[0]} flips, group B ${heads[1]} heads in ${trials[1]} flips, and group C ${heads[2]} heads in ${trials[2]} flips. Combine the results to find the best estimate of the probability of heads.`, answers: [ans(total / 100), fracStr(frac(total, 100)), `${total}/100`], hint: "Add up all the heads and all the flips: more trials give a better estimate.", solution: `${heads.join(" + ")} = ${total} heads in 100 flips, so the estimate is ${total} ÷ 100 = ${fmt(total / 100)}.`, answerFormat: PROB };
  }),
];
