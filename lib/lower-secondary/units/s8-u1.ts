// Stage 8, unit 1: Integers (8Ni.01-8Ni.07).
import { T, type Template } from "../engine";
import { r, rNonZero, pick, gcd, lcm, primeFactors, primeIndexForm, primeProductForm, sup, supToCaret, fmt, ans, br, shuffle } from "../kit";

const U = "s8-u1";
const INDEX_FORMAT = "Enter a single power, for example 5^7.";
const PRIME_FORMAT = "Write the primes multiplied together, for example 2 × 2 × 3 or 2² × 3.";

/** Every way a student might reasonably type a prime factorisation. */
function primeAnswers(n: number) {
  const forms = [primeProductForm(n), primeIndexForm(n), supToCaret(primeIndexForm(n))];
  return [...new Set(forms.flatMap((f) => [f, f.replace(/×/g, "x"), f.replace(/×/g, "*")]))];
}

/** "5^7" and "5⁷". */
const powerAnswers = (base: number, exp: number) => [`${base}^${exp}`, `${base}${sup(exp)}`];

/** A number built from small primes, for factorising by hand. */
function smallComposite() {
  for (;;) {
    const n = pick([2, 2, 2, 3, 3, 5, 7]) * pick([2, 3, 5]) * pick([2, 3, 4, 5, 6, 7, 9]);
    if (n >= 24 && n <= 400 && primeFactors(n).length >= 3) return n;
  }
}


export const s8u1: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Ni.02"], "Multiply integers", () => {
    const a = rNonZero(-12, 12) , b = r(2, 12) * pick([-1, 1]);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    return { prompt: `Calculate ${br(x)} × ${br(y)}.`, answers: [ans(x * y)], hint: "Multiply the sizes, then decide the sign: same signs give a positive, different signs a negative.", solution: `${br(x)} × ${br(y)} = ${fmt(x * y)}.` };
  }),
  T(`${U}-f2`, "foundational", ["8Ni.02"], "Divide integers", () => {
    const q = rNonZero(-12, 12), d = r(2, 12) * pick([-1, 1]), n = q * d;
    return { prompt: `Calculate ${br(n)} ÷ ${br(d)}.`, answers: [ans(q)], hint: "Divide the sizes; the sign rule is the same as for multiplication.", solution: `${br(n)} ÷ ${br(d)} = ${fmt(q)}.` };
  }),
  T(`${U}-f3`, "foundational", ["8Ni.01", "8Ni.02"], "Use the order of operations", () => {
    const a = r(2, 20), b = r(2, 9), c = rNonZero(-9, 9);
    return { prompt: `Calculate ${a} − ${b} × ${br(c)}.`, answers: [ans(a - b * c)], hint: "Multiply before you subtract.", solution: `${b} × ${br(c)} = ${fmt(b * c)}, so ${a} − ${br(b * c)} = ${fmt(a - b * c)}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Ni.03"], "Find a highest common factor", () => {
    const h = r(2, 12);
    let p = r(2, 9), q = r(2, 9);
    while (gcd(p, q) !== 1 || p === q) { p = r(2, 9); q = r(2, 9); }
    return { prompt: `Find the highest common factor of ${h * p} and ${h * q}.`, answers: [String(h)], hint: "List the factors of each number and find the largest one they share.", solution: `${h * p} = ${h} × ${p} and ${h * q} = ${h} × ${q}, and ${p} and ${q} share no factor, so the HCF is ${h}.` };
  }),
  T(`${U}-f5`, "foundational", ["8Ni.03"], "Find a lowest common multiple", () => {
    let a = r(3, 15), b = r(3, 15);
    while (a === b || a % b === 0 || b % a === 0) { a = r(3, 15); b = r(3, 15); }
    return { prompt: `Find the lowest common multiple of ${a} and ${b}.`, answers: [String(lcm(a, b))], hint: "List multiples of the larger number until one is also a multiple of the smaller.", solution: `LCM = ${a} × ${b} ÷ HCF(${a}, ${b}) = ${a * b} ÷ ${gcd(a, b)} = ${lcm(a, b)}.` };
  }),
  T(`${U}-f6`, "foundational", ["8Ni.03"], "Write a number as a product of primes", () => {
    const n = smallComposite();
    return { prompt: `Write ${n} as a product of its prime factors.`, answers: primeAnswers(n), hint: "Divide by the smallest prime that works, and repeat until the result is prime.", solution: `${n} = ${primeProductForm(n)} = ${primeIndexForm(n)}.`, answerFormat: PRIME_FORMAT };
  }),
  T(`${U}-f7`, "foundational", ["8Ni.06"], "Square a negative number", () => {
    const n = r(2, 15);
    return { prompt: `Evaluate (−${n})².`, answers: [String(n * n)], hint: "A negative multiplied by a negative is positive.", solution: `(−${n})² = (−${n}) × (−${n}) = ${n * n}.` };
  }),
  T(`${U}-f8`, "foundational", ["8Ni.07"], "Find a cube or cube root", () => {
    const n = r(2, 6), neg = Math.random() < 0.5 ? -1 : 1;
    if (Math.random() < 0.5) return { prompt: `Evaluate ${br(neg * n)}³.`, answers: [ans((neg * n) ** 3)], hint: "Multiply the number by itself three times; an odd power keeps the sign.", solution: `${br(neg * n)}³ = ${fmt((neg * n) ** 3)}.` };
    return { prompt: `Find the cube root of ${fmt((neg * n) ** 3)}.`, answers: [ans(neg * n)], hint: "Which number multiplied by itself three times gives this? A negative cube has a negative cube root.", solution: `${br(neg * n)}³ = ${fmt((neg * n) ** 3)}, so ∛${br((neg * n) ** 3)} = ${fmt(neg * n)}.` };
  }),
  T(`${U}-f9`, "foundational", ["8Ni.05"], "Multiply powers of the same number", () => {
    const b = r(2, 9), m = r(2, 8), n = r(2, 8);
    return { prompt: `Write ${b}${sup(m)} × ${b}${sup(n)} as a single power of ${b}.`, answers: powerAnswers(b, m + n), hint: "When multiplying powers of the same number, add the indices.", solution: `${b}${sup(m)} × ${b}${sup(n)} = ${b}${sup(m + n)}, written ${b}^${m + n}.`, answerFormat: INDEX_FORMAT };
  }),
  T(`${U}-f10`, "foundational", ["8Ni.05"], "Use a zero index", () => {
    const b = r(2, 12), c = r(2, 6);
    return { prompt: `Evaluate ${b}⁰ + ${c}².`, answers: [String(1 + c * c)], hint: "Any non-zero number to the power 0 is 1.", solution: `${b}⁰ = 1 and ${c}² = ${c * c}, so the total is ${1 + c * c}.` };
  }),
  T(`${U}-f11`, "foundational", ["8Ni.04"], "Classify numbers", () => {
    const neg = -r(2, 15), whole = r(2, 30), [p, q] = [r(1, 4), r(5, 9)];
    const options = shuffle([fmt(neg), String(whole), `${p}/${q}`]);
    return { prompt: `Which of ${options.join(", ")} is an integer but not a natural number?`, answers: [ans(neg)], hint: "Natural numbers are the positive whole numbers; integers also include zero and the negative whole numbers.", solution: `${fmt(neg)} is a whole number but negative, so it is an integer and not a natural number; ${whole} is both; ${p}/${q} is rational but not an integer.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Ni.02"], "Apply integer multiplication to temperature", () => {
    const start = r(-4, 6), drop = r(2, 5), hours = r(3, 8), end = start - drop * hours;
    return { prompt: `The temperature is ${fmt(start)}°C and falls by ${drop}°C every hour for ${hours} hours. Find the final temperature in °C.`, answers: [ans(end)], hint: "Work out the total fall first, then subtract it from the starting temperature.", solution: `Total fall = ${drop} × ${hours} = ${drop * hours}°C, so ${fmt(start)} − ${drop * hours} = ${fmt(end)}°C.` };
  }),
  T(`${U}-a2`, "application", ["8Ni.02"], "Share a debt equally", () => {
    const people = r(3, 8), each = r(15, 90), total = people * each;
    return { prompt: `A shared account has a balance of −R${total}. The debt is split equally between ${people} friends. Write each friend's share of the balance as an integer.`, answers: [ans(-each)], hint: "Divide the negative balance by the number of friends.", solution: `(−${total}) ÷ ${people} = −${each}, so each share is −${each}.` };
  }),
  T(`${U}-a3`, "application", ["8Ni.02"], "Estimate an integer calculation", () => {
    // The rounded divisor must divide the rounded dividend exactly, and each
    // unrounded number must round back to it at 1 significant figure.
    const b = pick([20, 30, 40, 50, 60]);
    const hundreds = [2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (d * 100) % b === 0);
    const a = pick([-1, 1]) * pick(hundreds) * 100;
    const x = a + pick([-1, 1]) * r(1, 45), y = b + pick([-1, 1]) * r(1, 4);
    return { prompt: `Estimate ${br(x)} ÷ ${y} by rounding each number to 1 significant figure.`, answers: [ans(a / b)], hint: "Round each number first, then divide; keep the sign.", solution: `${br(x)} ≈ ${br(a)} and ${y} ≈ ${b}, so the estimate is ${br(a)} ÷ ${b} = ${fmt(a / b)}.` };
  }),
  T(`${U}-a4`, "application", ["8Ni.03"], "Use a lowest common multiple in context", () => {
    let a = r(4, 15), b = r(4, 15);
    while (a === b || a % b === 0 || b % a === 0) { a = r(4, 15); b = r(4, 15); }
    const ctx = pick([["Two lights flash every", "seconds", "flash together"], ["Two buses leave the station every", "minutes", "leave together"], ["Two bells ring every", "minutes", "ring together"]]);
    return { prompt: `${ctx[0]} ${a} and ${b} ${ctx[1]}. They start together. After how many ${ctx[1]} will they next ${ctx[2]}?`, answers: [String(lcm(a, b))], hint: "The next time they coincide is the lowest common multiple.", solution: `LCM(${a}, ${b}) = ${lcm(a, b)}, so after ${lcm(a, b)} ${ctx[1]}.` };
  }),
  T(`${U}-a5`, "application", ["8Ni.03"], "Use a highest common factor in context", () => {
    const h = r(3, 12);
    let p = r(2, 9), q = r(2, 9);
    while (gcd(p, q) !== 1 || p === q) { p = r(2, 9); q = r(2, 9); }
    const [first, second] = pick([["pencils", "rubbers"], ["red beads", "blue beads"], ["apples", "oranges"]]);
    return { prompt: `A teacher has ${h * p} ${first} and ${h * q} ${second}. She makes identical packs using all of them. What is the greatest number of packs she can make?`, answers: [String(h)], hint: "The number of packs must divide both amounts exactly.", solution: `The greatest number dividing ${h * p} and ${h * q} is their HCF, ${h}.` };
  }),
  T(`${U}-a6`, "application", ["8Ni.06"], "Find a square root in context", () => {
    const s = r(6, 25);
    return { prompt: `A square tile has an area of ${s * s} cm². Find the length of one side in cm.`, answers: [String(s)], hint: "The side length is the positive square root of the area.", solution: `√${s * s} = ${s}, so each side is ${s} cm.` };
  }),
  T(`${U}-a7`, "application", ["8Ni.07"], "Find a cube root in context", () => {
    const s = r(2, 10);
    return { prompt: `A cube has a volume of ${s ** 3} cm³. Find the length of one edge in cm.`, answers: [String(s)], hint: "The edge length is the cube root of the volume.", solution: `∛${s ** 3} = ${s}, so each edge is ${s} cm.` };
  }),
  T(`${U}-a8`, "application", ["8Ni.05"], "Divide powers of the same number", () => {
    const b = r(2, 9), n = r(2, 6), m = n + r(1, 6);
    return { prompt: `Write ${b}${sup(m)} ÷ ${b}${sup(n)} as a single power of ${b}.`, answers: powerAnswers(b, m - n), hint: "When dividing powers of the same number, subtract the indices.", solution: `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}${sup(m - n)}, written ${b}^${m - n}.`, answerFormat: INDEX_FORMAT };
  }),
  T(`${U}-a9`, "application", ["8Ni.01", "8Ni.06"], "Use the order of operations with powers and roots", () => {
    const k = r(2, 5), s = r(2, 6), root = r(2, 9);
    if (Math.random() < 0.5) return { prompt: `Evaluate ${k} × ${s}² − √${root * root}.`, answers: [ans(k * s * s - root)], hint: "Powers and roots come before multiplication, then subtraction.", solution: `${k} × ${s * s} − ${root} = ${k * s * s} − ${root} = ${fmt(k * s * s - root)}.` };
    const c = r(2, 5);
    return { prompt: `Evaluate (${s} + ${k})² − ∛${c ** 3}.`, answers: [String((s + k) ** 2 - c)], hint: "Work out the bracket first, then the power and the cube root.", solution: `(${s + k})² − ${c} = ${(s + k) ** 2} − ${c} = ${(s + k) ** 2 - c}.` };
  }),
  T(`${U}-a10`, "application", ["8Ni.04"], "Name the smallest set a number belongs to", () => {
    const kind = pick(["natural", "integer", "rational"] as const);
    const number = kind === "natural" ? String(r(2, 60)) : kind === "integer" ? fmt(-r(2, 60)) : pick([`${r(1, 4)}/${r(5, 9)}`, `${fmt(-r(1, 9))}.${r(1, 9)}`]);
    const set = { natural: "natural numbers", integer: "integers", rational: "rational numbers" }[kind];
    const why = { natural: "it is a positive whole number", integer: "it is a whole number but negative", rational: "it is not a whole number" }[kind];
    return { prompt: `Which is the smallest of these sets that contains ${number}: natural numbers, integers or rational numbers?`, answers: [kind, set, kind + " number", kind + "s"], hint: "Natural numbers are the positive whole numbers; every natural number is an integer, and every integer is rational.", solution: `${number} belongs to the ${set} (${kind}), because ${why}.`, answerFormat: "Enter natural, integer or rational." };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Ni.02"], "Find a missing integer", () => {
    const x = rNonZero(-12, 12), k = r(2, 9) * pick([-1, 1]);
    return { prompt: `Find the missing number: □ × ${br(k)} = ${fmt(x * k)}.`, answers: [ans(x)], hint: "Divide the result by the number you know.", solution: `${fmt(x * k)} ÷ ${br(k)} = ${fmt(x)}.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Ni.02"], "Decide the sign of a product", () => {
    const negatives = r(1, 4), total = negatives + r(1, 2);
    const factors = shuffle([...Array(negatives)].map(() => -r(2, 9)).concat([...Array(total - negatives)].map(() => r(2, 9))));
    const sign = negatives % 2 === 0 ? "positive" : "negative";
    return { prompt: `Without calculating, is ${factors.map(br).join(" × ")} positive or negative?`, answers: [sign], hint: "Count the negative factors: an even number gives a positive product.", solution: `There ${negatives === 1 ? "is 1 negative factor" : `are ${negatives} negative factors`}, an ${negatives % 2 === 0 ? "even" : "odd"} number, so the product is ${sign}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Ni.03"], "Rebuild a number from its prime factors", () => {
    const n = smallComposite();
    return { prompt: `A number's prime factorisation is ${primeIndexForm(n)}. What is the number?`, answers: [String(n)], hint: "Multiply the prime factors back together.", solution: `${primeProductForm(n)} = ${n}.` };
  }),
  T(`${U}-r4`, "reasoning", ["8Ni.03"], "Find an HCF from prime factorisations", () => {
    const [a2, b2, a3, b3] = [r(1, 4), r(1, 4), r(0, 2), r(0, 2)];
    const five = pick([[1, 0], [0, 1], [0, 0]]);
    const A = 2 ** a2 * 3 ** a3 * 5 ** five[0], B = 2 ** b2 * 3 ** b3 * 5 ** five[1];
    const h = gcd(A, B);
    return { prompt: `A = ${primeIndexForm(A)} and B = ${primeIndexForm(B)}. Find the highest common factor of A and B.`, answers: [String(h)], hint: "Take each prime the pair share, to the lower of its two powers.", solution: `Shared primes to their lower powers give ${primeIndexForm(h) || "1"} = ${h}.` };
  }),
  T(`${U}-r5`, "reasoning", ["8Ni.05"], "Find a missing index", () => {
    const b = r(2, 9), n = r(2, 7), m = r(2, 7);
    if (Math.random() < 0.5) return { prompt: `${b}ⁿ × ${b}${sup(m)} = ${b}${sup(n + m)}. Find n.`, answers: [String(n)], hint: "Multiplying powers adds the indices.", solution: `n + ${m} = ${n + m}, so n = ${n}.` };
    return { prompt: `${b}${sup(n + m)} ÷ ${b}ⁿ = ${b}${sup(m)}. Find n.`, answers: [String(n)], hint: "Dividing powers subtracts the indices.", solution: `${n + m} − n = ${m}, so n = ${n}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Ni.06"], "Give both square roots", () => {
    const n = r(3, 15);
    return { prompt: `Two different numbers have a square of ${n * n}. What are they?`, answers: [`±${n}`, `${n},-${n}`, `-${n},${n}`, `${n} and -${n}`, `-${n} and ${n}`, `+${n},-${n}`], hint: "A positive number has a positive square root and a negative one.", solution: `${n}² = ${n * n} and (−${n})² = ${n * n}, so the numbers are ±${n}.`, answerFormat: "Enter both numbers, for example 7, -7 or ±7." };
  }),
  T(`${U}-r7`, "reasoning", ["8Ni.07"], "Reason about negative cubes", () => {
    const n = r(2, 9);
    return { prompt: `Which integer, when cubed, gives −${n ** 3}?`, answers: [`-${n}`], hint: "An odd power of a negative number is negative.", solution: `(−${n})³ = −${n ** 3}, so the integer is −${n}.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Ni.01"], "Correct an order-of-operations error", () => {
    const a = r(2, 9), b = r(2, 8);
    return { prompt: `A learner says ${a} + ${b}² = ${(a + b) ** 2}. What is the correct value?`, answers: [String(a + b * b)], hint: "The index applies only to the number it is attached to, and comes before addition.", solution: `${b}² = ${b * b}, so ${a} + ${b * b} = ${a + b * b}. The learner worked out (${a} + ${b})² instead.` };
  }),
  T(`${U}-r9`, "reasoning", ["8Ni.04"], "Judge a statement about sets of numbers", () => {
    const n = r(2, 20), [p, q] = [r(1, 3), r(4, 9)];
    const [statement, truth, why] = pick([
      ["Every integer is a rational number.", "true", `any integer, such as ${n}, can be written as ${n}/1`],
      ["Every rational number is an integer.", "false", `${p}/${q} is rational but not a whole number`],
      [`−${n} is a natural number.`, "false", "natural numbers are positive whole numbers"],
      [`${p}/${q} is a rational number.`, "true", "it is a fraction of two integers"],
      [`${n} is a natural number, an integer and a rational number.`, "true", "a positive whole number belongs to all three sets"],
      [`−${n} is an integer but not a rational number.`, "false", `−${n} = −${n}/1, so it is rational too`],
    ] as const);
    return { prompt: `True or false: ${statement}`, answers: [truth], hint: "Natural numbers sit inside the integers, which sit inside the rational numbers.", solution: `It is ${truth}: ${why}.`, answerFormat: "Enter true or false." };
  }),
  T(`${U}-r10`, "reasoning", ["8Ni.05"], "Correct a zero-index error", () => {
    const b = r(2, 15);
    return { prompt: `A learner says ${b}⁰ = 0. Enter the correct value of ${b}⁰.`, answers: ["1"], hint: `Think of ${b}³ ÷ ${b}³: it is 1, and by the index law it is ${b}⁰.`, solution: `${b}³ ÷ ${b}³ = 1 and also ${b}³⁻³ = ${b}⁰, so ${b}⁰ = 1.` };
  }),
];
