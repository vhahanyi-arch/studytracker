// Stage 9, unit 12: Probability (9Sp.01 to 9Sp.04).
import { T, type Template } from "../engine";
import { r, pick, shuffle, frac, fracStr, terminates, fmt, ans, tidyNum, mul, add, type Frac } from "../kit";

const U = "s9-u12";
const PROB = "Enter the probability as a fraction, for example 3/8, or as a decimal.";

/** A probability as its simplest fraction, with the unsimplified form and the decimal a student may give. */
function prob(f: Frac, raw?: string) {
  const text = fracStr(f), answers = [text];
  if (raw) answers.push(raw);
  if (terminates(f)) answers.push(ans(f.n / f.d));
  return { text, answers: [...new Set(answers)] };
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const count = (a: number[], b: number[], test: (x: number, y: number) => boolean) => a.flatMap((x) => b.map((y) => test(x, y))).filter(Boolean).length;
const dec2 = () => r(5, 60) / 100;

export const s9u12: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Sp.01"], "Use the fact that probabilities total 1", () => {
    const [a, b] = [dec2(), dec2()], c = tidyNum(1 - a - b);
    if (c <= 0.02) return s9u12[0].make();
    const [x, y, z] = shuffle(["red", "blue", "green", "yellow"]).slice(0, 3);
    return { prompt: `A spinner can land only on ${x}, ${y} or ${z}. P(${x}) = ${fmt(a)} and P(${y}) = ${fmt(b)}. Find P(${z}).`, answers: [ans(c)], hint: "The probabilities of all the possible outcomes add up to 1.", solution: `1 − ${fmt(a)} − ${fmt(b)} = ${fmt(c)}.`, answerFormat: PROB };
  }),
  T(`${U}-f2`, "foundational", ["9Sp.01"], "Add mutually exclusive probabilities", () => {
    const [a, b] = [dec2(), dec2()];
    if (a + b >= 1) return s9u12[1].make();
    const [x, y] = pick([["walks", "cycles"], ["has cereal", "has toast"], ["wins", "draws"]]);
    return { prompt: `The probability that Ali ${x} is ${fmt(a)} and the probability that Ali ${y} is ${fmt(b)}. These cannot both happen. What is the probability that Ali ${x} or ${y}?`, answers: [ans(a + b)], hint: "For mutually exclusive events, P(A or B) = P(A) + P(B).", solution: `${fmt(a)} + ${fmt(b)} = ${fmt(tidyNum(a + b))}.`, answerFormat: PROB };
  }),
  T(`${U}-f3`, "foundational", ["9Sp.04"], "Find an expected frequency", () => {
    const [p, n] = pick([[0.2, 50], [0.3, 200], [0.25, 80], [0.15, 400], [0.6, 150], [0.35, 300], [0.1, 120], [0.45, 200]] as const), k = r(1, 3) * n;
    return { prompt: `The probability that a seed grows is ${fmt(p)}. ${k} seeds are planted. How many would you expect to grow?`, answers: [ans(p * k)], hint: "Expected frequency = probability × number of trials.", solution: `${fmt(p)} × ${k} = ${fmt(tidyNum(p * k))}.` };
  }),
  T(`${U}-f4`, "foundational", ["9Sp.02"], "Multiply probabilities of independent events", () => {
    const [e1, p1] = pick([["a head on a coin", frac(1, 2)], ["a 6 on a dice", frac(1, 6)], ["an even number on a dice", frac(1, 2)], ["a 1 or a 2 on a dice", frac(1, 3)]] as const);
    const [e2, p2] = pick([["a tail on a coin", frac(1, 2)], ["red on a spinner with 4 equal colours", frac(1, 4)], ["a number less than 3 on a dice", frac(1, 3)], ["a 5 on a dice", frac(1, 6)]] as const);
    const p = prob(mul(p1, p2));
    return { prompt: `Find the probability of getting ${e1} and then ${e2}.`, answers: p.answers, hint: "The events are independent: multiply their probabilities.", solution: `${fracStr(p1)} × ${fracStr(p2)} = ${p.text}.`, answerFormat: PROB };
  }),
  T(`${U}-f5`, "foundational", ["9Sp.02"], "Tell independent from dependent events", () => {
    const [situation, kind] = pick([
      ["A coin is flipped twice.", "independent"], ["A dice is rolled and a spinner is spun.", "independent"],
      ["A counter is taken from a bag, replaced, and then a second counter is taken.", "independent"],
      ["Two sweets are taken from a bag, one after the other, without putting the first back.", "dependent"],
      ["Two cards are dealt from a pack without replacement.", "dependent"], ["Two students are chosen from a class to be captain and vice-captain.", "dependent"],
    ] as const);
    return { prompt: `${situation} Are the two events independent or dependent?`, answers: [kind], hint: "Dependent: the first result changes the probabilities for the second.", solution: `${kind === "independent" ? "Independent: the first result does not change the second probability." : "Dependent: the first choice changes what is left for the second."}`, answerFormat: "Enter independent or dependent." };
  }),
  T(`${U}-f6`, "foundational", ["9Sp.03"], "Find a probability from a sample space", () => {
    const [a, b] = [r(3, 6), r(4, 6)], s = r(4, a + b - 1), n = count(range(1, a), range(1, b), (x, y) => x + y === s), p = prob(frac(n, a * b), `${n}/${a * b}`);
    return { prompt: `Two fair spinners, numbered 1 to ${a} and 1 to ${b}, are spun and the scores are added. Find the probability that the total is ${s}.`, answers: p.answers, hint: "Draw the table of all totals; each cell is equally likely.", solution: `${n} of the ${a * b} outcomes total ${s}, so the probability is ${n}/${a * b}${p.text === `${n}/${a * b}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-f7`, "foundational", ["9Sp.04"], "Compare observed and expected frequencies", () => {
    const n = pick([60, 120, 180, 300, 600]), expected = n / 6, obs = expected + pick([-1, 1]) * r(2, Math.round(expected / 3));
    return { prompt: `A fair dice is rolled ${n} times and shows a 4 on ${obs} rolls. How many more or fewer 4s is that than expected? Give the difference.`, answers: [String(Math.abs(obs - expected))], hint: "Expected frequency = 1/6 × number of rolls.", solution: `Expected = ${n} ÷ 6 = ${expected}. ${obs} is ${Math.abs(obs - expected)} ${obs > expected ? "more" : "fewer"} than expected.` };
  }),
  T(`${U}-f8`, "foundational", ["9Sp.02"], "Find a probability with replacement", () => {
    const [red, blue] = [r(1, 7), r(1, 7)], n = red + blue, colour = pick(["red", "blue"] as const), k = colour === "red" ? red : blue, p = prob(frac(k * k, n * n), `${k * k}/${n * n}`);
    return { prompt: `A bag holds ${red} red and ${blue} blue counters. A counter is taken, its colour noted, and it is put back. A second counter is then taken. Find the probability that both are ${colour}.`, answers: p.answers, hint: "With replacement, the probability is the same both times.", solution: `${k}/${n} × ${k}/${n} = ${k * k}/${n * n}${p.text === `${k * k}/${n * n}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-f9`, "foundational", ["9Sp.01"], "Solve for an unknown probability in a table", () => {
    for (;;) {
      const [a, b, k] = [r(5, 40) / 100, r(5, 30) / 100, r(2, 4)], rest = tidyNum(1 - a - b), x = tidyNum(rest / (k + 1));
      if (rest <= 0 || !Number.isInteger(tidyNum(x * 100))) continue;
      return { prompt: `A biased spinner has outcomes A, B, C and D. P(A) = ${fmt(a)}, P(B) = ${fmt(b)}, P(C) = x and P(D) = ${k}x. Find x.`, answers: [ans(x)], hint: "All four probabilities add up to 1.", solution: `${fmt(a)} + ${fmt(b)} + ${k + 1}x = 1, so ${k + 1}x = ${fmt(rest)} and x = ${fmt(x)}.` };
    }
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Sp.02"], "Find a probability without replacement", () => {
    const [red, blue] = [r(2, 8), r(2, 8)], n = red + blue, colour = pick(["red", "blue"] as const), k = colour === "red" ? red : blue;
    const p = prob(frac(k * (k - 1), n * (n - 1)), `${k * (k - 1)}/${n * (n - 1)}`);
    return { prompt: `A bag holds ${red} red and ${blue} blue sweets. Two are taken, one after the other, without replacement. Find the probability that both are ${colour}.`, answers: p.answers, hint: "After the first is taken, there is one fewer of that colour and one fewer sweet.", solution: `${k}/${n} × ${k - 1}/${n - 1} = ${k * (k - 1)}/${n * (n - 1)}${p.text === `${k * (k - 1)}/${n * (n - 1)}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a2`, "application", ["9Sp.03"], "Find a probability with a spinner and a dice", () => {
    const n = r(3, 6), kind = pick(["product even", "sum greater", "same number"] as const), g = r(5, n + 4);
    const test = kind === "product even" ? (x: number, y: number) => (x * y) % 2 === 0 : kind === "sum greater" ? (x: number, y: number) => x + y > g : (x: number, y: number) => x === y;
    const text = kind === "product even" ? "the product of the scores is even" : kind === "sum greater" ? `the total is greater than ${g}` : "both show the same number";
    const c = count(range(1, n), range(1, 6), test), p = prob(frac(c, 6 * n), `${c}/${6 * n}`);
    if (c === 0) return s9u12.find((t) => t.id === `${U}-a2`)!.make();
    return { prompt: `A fair spinner numbered 1 to ${n} is spun and a fair dice is rolled. Find the probability that ${text}.`, answers: p.answers, hint: `There are ${n} × 6 = ${6 * n} equally likely outcomes.`, solution: `${c} of the ${6 * n} outcomes fit, so the probability is ${c}/${6 * n}${p.text === `${c}/${6 * n}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a3`, "application", ["9Sp.04"], "Find an expected frequency from a fraction", () => {
    const d = pick([4, 5, 8, 10, 12]), n = r(1, d - 1), k = d * r(5, 50);
    return { prompt: `The probability that a train is late is ${fracStr(frac(n, d))}. Over ${k} journeys, how many late trains would you expect?`, answers: [ans((k * n) / d)], hint: "Multiply the probability by the number of journeys.", solution: `${fracStr(frac(n, d))} × ${k} = ${fmt((k * n) / d)}.` };
  }),
  T(`${U}-a4`, "application", ["9Sp.01"], "Decide whether events are mutually exclusive", () => {
    const [a, b, me, why] = pick([
      ["rolling a 2", "rolling an odd number", true, "2 is not odd, so both cannot happen on one roll"],
      ["rolling a 6", "rolling an even number", false, "6 is even, so both can happen together"],
      ["taking a red card", "taking a heart", false, "a heart is a red card, so both can happen"],
      ["taking a king", "taking a queen", true, "one card cannot be both a king and a queen"],
      ["a spinner landing on blue", "the same spin landing on green", true, "one spin lands on only one colour"],
      ["rolling a number greater than 3", "rolling a 5", false, "5 is greater than 3"],
    ] as const);
    return { prompt: `On one trial, are "${a}" and "${b}" mutually exclusive? Answer yes or no.`, answers: [me ? "yes" : "no"], hint: "Mutually exclusive events cannot happen at the same time.", solution: `${me ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-a5`, "application", ["9Sp.02"], "Multiply decimal probabilities of independent events", () => {
    const [p, q] = [r(1, 9) / 10, r(1, 9) / 10], [e1, e2] = pick([["it rains on Monday", "the bus is late on Tuesday"], ["Tom passes his test", "Ana passes hers"], ["a light bulb fails", "a fuse blows"]]);
    return { prompt: `P(${e1}) = ${fmt(p)} and P(${e2}) = ${fmt(q)}. The events are independent. Find the probability that both happen.`, answers: [ans(p * q)], hint: "For independent events, P(A and B) = P(A) × P(B).", solution: `${fmt(p)} × ${fmt(q)} = ${fmt(tidyNum(p * q))}.`, answerFormat: PROB };
  }),
  T(`${U}-a6`, "application", ["9Sp.01", "9Sp.02"], "Find the probability of at least one success", () => {
    const [p, q] = [r(1, 9) / 10, r(1, 9) / 10], none = tidyNum((1 - p) * (1 - q)), v = tidyNum(1 - none);
    return { prompt: `Two independent alarms each detect smoke with probabilities ${fmt(p)} and ${fmt(q)}. Find the probability that at least one detects it.`, answers: [ans(v)], hint: "Find the probability that neither detects it, then subtract from 1.", solution: `P(neither) = ${fmt(tidyNum(1 - p))} × ${fmt(tidyNum(1 - q))} = ${fmt(none)}. P(at least one) = 1 − ${fmt(none)} = ${fmt(v)}.`, answerFormat: PROB };
  }),
  T(`${U}-a7`, "application", ["9Sp.04"], "Predict from an experiment", () => {
    const n = pick([20, 25, 40, 50]), k = r(2, n - 2), m = n * r(3, 20);
    return { prompt: `A drawing pin lands point up ${k} times in ${n} throws. Using this, estimate how many times it will land point up in ${m} throws.`, answers: [String((k * m) / n)], hint: "Use the relative frequency as the probability.", solution: `Relative frequency = ${k}/${n}. ${k}/${n} × ${m} = ${(k * m) / n}.` };
  }),
  T(`${U}-a8`, "application", ["9Sp.03"], "Find a probability with two spinners", () => {
    const [a, b] = [r(3, 5), r(3, 6)], kind = pick(["product", "difference"] as const), k = kind === "product" ? pick([4, 6, 8, 12]) : r(0, 2);
    const test = kind === "product" ? (x: number, y: number) => x * y >= k : (x: number, y: number) => Math.abs(x - y) === k;
    const c = count(range(1, a), range(1, b), test);
    if (c === 0) return s9u12.find((t) => t.id === `${U}-a8`)!.make();
    const p = prob(frac(c, a * b), `${c}/${a * b}`);
    return { prompt: `Two fair spinners are numbered 1 to ${a} and 1 to ${b}. Find the probability that ${kind === "product" ? `the product of the scores is at least ${k}` : `the scores differ by ${k}`}.`, answers: p.answers, hint: "Use a table of all outcomes.", solution: `${c} of the ${a * b} outcomes fit, so the probability is ${c}/${a * b}${p.text === `${c}/${a * b}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-a9`, "application", ["9Sp.01"], "Complete the probabilities of a biased dice", () => {
    const ps = [r(5, 20), r(5, 20), r(5, 20), r(5, 20), r(5, 20)].map((v) => v / 100), last = tidyNum(1 - ps.reduce((s, v) => s + v, 0));
    if (last <= 0.02) return s9u12.find((t) => t.id === `${U}-a9`)!.make();
    return { prompt: `For a biased dice, P(1) to P(5) are ${ps.map((p) => fmt(p)).join(", ")}. Find P(6).`, answers: [ans(last)], hint: "The six probabilities must add up to 1.", solution: `${ps.map((p) => fmt(p)).join(" + ")} = ${fmt(tidyNum(1 - last))}, so P(6) = 1 − ${fmt(tidyNum(1 - last))} = ${fmt(last)}.`, answerFormat: PROB };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Sp.02"], "Find the probability of one of each colour", () => {
    const [red, blue] = [r(2, 8), r(2, 8)], n = red + blue, p = prob(frac(2 * red * blue, n * (n - 1)), `${2 * red * blue}/${n * (n - 1)}`);
    return { prompt: `A bag holds ${red} red and ${blue} blue counters. Two are taken without replacement. Find the probability of getting one of each colour.`, answers: p.answers, hint: "Red then blue, or blue then red: add the two probabilities.", solution: `P(red, blue) = ${red}/${n} × ${blue}/${n - 1} and P(blue, red) = ${blue}/${n} × ${red}/${n - 1}. Total = ${2 * red * blue}/${n * (n - 1)}${p.text === `${2 * red * blue}/${n * (n - 1)}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-r2`, "reasoning", ["9Sp.01"], "Solve for probabilities written with x", () => {
    const [a, b, c] = [r(1, 3), r(1, 4), r(1, 5)], total = a + b + c, ask = pick([0, 1, 2]), coef = [a, b, c][ask], p = prob(frac(coef, total));
    return { prompt: `The only possible outcomes of an event are A, B and C, with P(A) = ${a === 1 ? "" : a}x, P(B) = ${b === 1 ? "" : b}x and P(C) = ${c === 1 ? "" : c}x. Find P(${"ABC"[ask]}).`, answers: p.answers, hint: "The probabilities add up to 1: find x first.", solution: `${total}x = 1, so x = 1/${total}. P(${"ABC"[ask]}) = ${coef === 1 ? "" : `${coef} × `}1/${total} = ${p.text}.`, answerFormat: PROB };
  }),
  T(`${U}-r3`, "reasoning", ["9Sp.04"], "Use expected frequency to judge fairness", () => {
    const n = pick([300, 600, 1200]), expected = n / 6, biased = pick([true, false]), obs = biased ? Math.round(expected * pick([1.5, 1.7, 0.5])) : expected + r(-Math.round(expected * 0.05), Math.round(expected * 0.05));
    return { prompt: `A dice is rolled ${n} times and lands on 3 exactly ${obs} times. Is there strong evidence that the dice is biased? Answer yes or no.`, answers: [biased ? "yes" : "no"], hint: "Compare with the expected frequency, 1/6 of the rolls. Large samples should be close to it.", solution: `Expected = ${n} ÷ 6 = ${expected}. ${obs} is ${biased ? "far from" : "close to"} ${expected}, so ${biased ? "yes, it looks biased" : "no, this is normal variation"}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r4`, "reasoning", ["9Sp.02"], "Work back to the number in a bag", () => {
    const n = r(5, 12), red = r(2, n - 1), f = frac(red * (red - 1), n * (n - 1));
    return { prompt: `A bag has ${red} red counters and some blue ones. Two counters are taken without replacement. P(both red) = ${fracStr(f)}. How many counters are in the bag altogether?`, answers: [String(n)], hint: "P(both red) = red/n × (red − 1)/(n − 1). Try values of n.", solution: `${red}/${n} × ${red - 1}/${n - 1} = ${red * (red - 1)}/${n * (n - 1)} = ${fracStr(f)}, so there are ${n} counters.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Sp.03"], "Find the probability that a total is at least a value", () => {
    const k = r(6, 11), c = count(range(1, 6), range(1, 6), (x, y) => x + y >= k), p = prob(frac(c, 36), `${c}/36`);
    return { prompt: `Two fair dice are rolled. Find the probability that the total is at least ${k}.`, answers: p.answers, hint: "Count the cells in the 6 by 6 table with a total of " + k + " or more.", solution: `${c} of the 36 outcomes have a total of at least ${k}, so the probability is ${c}/36${p.text === `${c}/36` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
  T(`${U}-r6`, "reasoning", ["9Sp.02"], "Multiply over three independent events", () => {
    const p = r(1, 9) / 10, none = pick([true, false]), q = none ? tidyNum(1 - p) : p, v = tidyNum(q ** 3);
    return { prompt: `The probability that it rains on any day is ${fmt(p)}, independently of other days. Find the probability that it ${none ? "does not rain on any" : "rains on all"} of the next three days.`, answers: [ans(v)], hint: none ? "Find P(no rain) for one day, then multiply for three days." : "Multiply the probability for each day.", solution: `${fmt(q)} × ${fmt(q)} × ${fmt(q)} = ${fmt(v)}.`, answerFormat: PROB };
  }),
  T(`${U}-r7`, "reasoning", ["9Sp.04"], "Combine experiments to predict", () => {
    const trials = shuffle([20, 30, 50]), succ = trials.map((t) => Math.round(t * 0.3) + r(-3, 3)), total = succ.reduce((s, v) => s + v, 0), m = pick([500, 1000, 2000]);
    return { prompt: `Three groups test the same spinner. They get red ${succ[0]} times in ${trials[0]} spins, ${succ[1]} times in ${trials[1]} spins and ${succ[2]} times in ${trials[2]} spins. Using all the results, how many reds would you expect in ${m} spins?`, answers: [ans((total * m) / 100)], hint: "Combine the results into one relative frequency first.", solution: `Total: ${total} reds in 100 spins, relative frequency ${fmt(total / 100)}. ${fmt(total / 100)} × ${m} = ${fmt((total * m) / 100)}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Sp.02", "9Sp.01"], "Find the probability of the same colour from two bags", () => {
    const [ra, ba, rb, bb] = [r(1, 6), r(1, 6), r(1, 6), r(1, 6)], [na, nb] = [ra + ba, rb + bb];
    const same = add(mul(frac(ra, na), frac(rb, nb)), mul(frac(ba, na), frac(bb, nb))), p = prob(same, `${ra * rb + ba * bb}/${na * nb}`);
    return { prompt: `Bag A holds ${ra} red and ${ba} blue balls; bag B holds ${rb} red and ${bb} blue balls. One ball is taken from each bag. Find the probability that they are the same colour.`, answers: p.answers, hint: "Add P(red and red) and P(blue and blue).", solution: `${ra}/${na} × ${rb}/${nb} + ${ba}/${na} × ${bb}/${nb} = ${ra * rb + ba * bb}/${na * nb}${p.text === `${ra * rb + ba * bb}/${na * nb}` ? "" : ` = ${p.text}`}.`, answerFormat: PROB };
  }),
];
