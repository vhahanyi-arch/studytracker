// Stage 9, unit 11: Ratio and proportion (9Nf.07, 9Nf.08, 9As.07).
import { T, type Template } from "../engine";
import { r, pick, shuffle, gcd, fmt, ans, money, tidyNum, roundDP, linear } from "../kit";

const U = "s9-u11";
const RATIO = "Enter the ratio with colons, for example 2:3:5.";
const ratioAnswers = (parts: number[]) => [parts.join(":"), parts.join(" : ")];
const coprime = (lo: number, hi: number) => { for (;;) { const a = r(lo, hi), b = r(lo, hi); if (a !== b && gcd(a, b) === 1) return [a, b]; } };

export const s9u11: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Nf.07"], "Scale a cost in direct proportion", () => {
    const n = r(2, 9), price = r(3, 40), m = r(2, 20);
    if (m === n) return s9u11[0].make();
    const item = pick(["notebooks", "tickets", "bottles of water", "bus fares"]);
    return { prompt: `${n} ${item} cost R${n * price}. How much do ${m} ${item} cost, in rand?`, answers: [String(m * price)], hint: "Find the cost of one first.", solution: `One costs R${n * price} ÷ ${n} = R${price}, so ${m} cost ${m} × R${price} = R${m * price}.` };
  }),
  T(`${U}-f2`, "foundational", ["9Nf.07"], "Use inverse proportion", () => {
    const total = pick([24, 30, 36, 48, 60, 72, 120]), divisors = Array.from({ length: total }, (_, i) => i + 1).filter((d) => total % d === 0 && d > 1 && d < total);
    const [w1, w2] = shuffle(divisors).slice(0, 2);
    const [who, job] = pick([["workers", "build a wall"], ["painters", "paint a hall"], ["machines", "pack an order"]]);
    return { prompt: `${w1} ${who} take ${total / w1} days to ${job}. How many days would ${w2} ${who} take, working at the same rate?`, answers: [String(total / w2)], hint: "More workers means fewer days: find the total number of worker-days first.", solution: `${w1} × ${total / w1} = ${total} worker-days. ${total} ÷ ${w2} = ${total / w2} days.` };
  }),
  T(`${U}-f3`, "foundational", ["9Nf.08"], "Simplify a three-part ratio", () => {
    const parts = [r(1, 9), r(1, 9), r(1, 9)], g = parts.reduce((a, b) => gcd(a, b)), k = r(2, 8), big = parts.map((p) => p * k);
    const simple = parts.map((p) => p / g);
    return { prompt: `Simplify the ratio ${big.join(" : ")}.`, answers: ratioAnswers(simple), hint: "Divide every part by the highest common factor of all three.", solution: `The highest common factor is ${k * g}, so the ratio simplifies to ${simple.join(" : ")}.`, answerFormat: RATIO };
  }),
  T(`${U}-f4`, "foundational", ["9Nf.08"], "Share an amount in a ratio", () => {
    const parts = [r(1, 6), r(1, 6), r(1, 6)], unit = r(5, 40), total = parts.reduce((a, b) => a + b) * unit, i = r(0, 2);
    const names = shuffle(["Ana", "Ben", "Chen", "Dudu"]).slice(0, 3);
    return { prompt: `R${total} is shared between ${names[0]}, ${names[1]} and ${names[2]} in the ratio ${parts.join(" : ")}. How much does ${names[i]} get, in rand?`, answers: [String(parts[i] * unit)], hint: "Find the value of one part first.", solution: `${parts.join(" + ")} = ${parts.reduce((a, b) => a + b)} parts; one part = R${total} ÷ ${parts.reduce((a, b) => a + b)} = R${unit}. ${names[i]} gets ${parts[i]} × R${unit} = R${parts[i] * unit}.` };
  }),
  T(`${U}-f5`, "foundational", ["9As.07"], "Calculate an average speed", () => {
    const v = r(4, 110), t = pick([0.5, 1.5, 2, 2.5, 3, 4]), d = tidyNum(v * t);
    return { prompt: `A car travels ${fmt(d)} km in ${fmt(t)} hours. Find its average speed in km/h.`, answers: [String(v)], hint: "Speed = distance ÷ time.", solution: `${fmt(d)} ÷ ${fmt(t)} = ${v} km/h.` };
  }),
  T(`${U}-f6`, "foundational", ["9As.07"], "Calculate density", () => {
    const rho = pick([0.8, 1.2, 2.5, 2.7, 7.8, 8.9, 11.3, 19.3]), V = r(2, 50), m = tidyNum(rho * V);
    return { prompt: `A block has a mass of ${fmt(m)} g and a volume of ${V} cm³. Find its density in g/cm³.`, answers: [ans(rho)], hint: "Density = mass ÷ volume.", solution: `${fmt(m)} ÷ ${V} = ${fmt(rho)} g/cm³.` };
  }),
  T(`${U}-f7`, "foundational", ["9Nf.07"], "Decide whether quantities are directly or inversely proportional", () => {
    const [situation, kind] = pick([
      ["the number of identical pens bought and the total cost", "direct"], ["the distance travelled at a steady speed and the time taken", "direct"],
      ["the number of taps filling a tank and the time it takes to fill", "inverse"], ["the speed of a car and the time a fixed journey takes", "inverse"],
      ["the number of people sharing a prize equally and each person's share", "inverse"], ["the mass of flour and the number of identical cakes baked", "direct"],
    ] as const);
    return { prompt: `Are ${situation} in direct or inverse proportion?`, answers: [kind], hint: "Direct: both go up together. Inverse: as one doubles, the other halves.", solution: `${kind === "direct" ? "Direct: when one doubles, so does the other." : "Inverse: when one doubles, the other halves."}`, answerFormat: "Enter direct or inverse." };
  }),
  T(`${U}-f8`, "foundational", ["9Nf.08"], "Simplify a ratio with different units", () => {
    const [a, b] = coprime(1, 9), [small, large, f] = pick([["cm", "m", 100], ["g", "kg", 1000], ["ml", "litres", 1000], ["minutes", "hours", 60]] as const);
    const k = pick(f === 60 ? [5, 10, 15, 20, 30] : [10, 20, 25, 50]), second = (b * k) / f;
    if (!Number.isInteger(second * 100)) return s9u11[7].make();
    return { prompt: `Write ${a * k} ${small} : ${fmt(second)} ${second === 1 ? large.replace(/s$/, "") : large} as a ratio in its simplest form.`, answers: ratioAnswers([a, b]), hint: "Change both quantities into the same unit first.", solution: `${fmt(second)} ${second === 1 ? large.replace(/s$/, "") : large} = ${b * k} ${small}. ${a * k} : ${b * k} simplifies to ${a} : ${b}.`, answerFormat: RATIO };
  }),
  T(`${U}-f9`, "foundational", ["9As.07"], "Read a speed from a distance-time graph", () => {
    const v = pick([4, 5, 12, 15, 20, 30, 40, 45, 60, 80]), t = pick([1, 2, 3, 4, 5]);
    return { prompt: `A distance-time graph is a straight line from (0 h, 0 km) to (${t} h, ${v * t} km). What speed does it show, in km/h?`, answers: [String(v)], hint: "The gradient of a distance-time graph is the speed.", solution: `Gradient = ${v * t} ÷ ${t} = ${v} km/h.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Nf.07"], "Use y = kx", () => {
    const k = r(2, 9), x1 = r(2, 12), x2 = r(2, 20);
    if (x1 === x2) return s9u11.find((t) => t.id === `${U}-a1`)!.make();
    return { prompt: `y is directly proportional to x. When x = ${x1}, y = ${k * x1}. Find y when x = ${x2}.`, answers: [String(k * x2)], hint: "Write y = kx and find k first.", solution: `k = ${k * x1} ÷ ${x1} = ${k}, so y = ${k} × ${x2} = ${k * x2}.` };
  }),
  T(`${U}-a2`, "application", ["9Nf.07"], "Use y = k/x", () => {
    const k = pick([24, 36, 48, 60, 72, 90, 120]), divs = Array.from({ length: k }, (_, i) => i + 1).filter((d) => k % d === 0 && d > 1 && d < k), [x1, x2] = shuffle(divs).slice(0, 2);
    return { prompt: `y is inversely proportional to x. When x = ${x1}, y = ${k / x1}. Find y when x = ${x2}.`, answers: [String(k / x2)], hint: "Write y = k/x, so k = xy.", solution: `k = ${x1} × ${k / x1} = ${k}, so y = ${k} ÷ ${x2} = ${k / x2}.` };
  }),
  T(`${U}-a3`, "application", ["9Nf.08"], "Use a difference between shares", () => {
    const [a, b] = coprime(1, 9), unit = r(3, 15), diff = Math.abs(b - a) * unit;
    const [p, q] = pick([["boys", "girls"], ["cats", "dogs"], ["adults", "children"]]);
    const more = b > a ? q : p;
    return { prompt: `The ratio of ${p} to ${q} in a group is ${a} : ${b}. There are ${diff} more ${more} than ${more === p ? q : p}. How many ${p} and ${q} are there altogether?`, answers: [String((a + b) * unit)], hint: "The difference between the parts corresponds to the difference in numbers.", solution: `The parts differ by ${Math.abs(b - a)}, which is ${diff}, so one part is ${unit}. Total = ${a + b} × ${unit} = ${(a + b) * unit}.` };
  }),
  T(`${U}-a4`, "application", ["9As.07"], "Use a rate of flow", () => {
    const rate = r(5, 40), t = r(3, 30), ask = pick(["volume", "time", "rate"] as const), V = rate * t;
    if (ask === "volume") return { prompt: `Water flows into a tank at ${rate} litres per minute. How many litres flow in ${t} minutes?`, answers: [String(V)], hint: "Volume = rate × time.", solution: `${rate} × ${t} = ${V} litres.` };
    if (ask === "time") return { prompt: `A tank holds ${V} litres. It fills at ${rate} litres per minute. How many minutes does it take to fill?`, answers: [String(t)], hint: "Time = volume ÷ rate.", solution: `${V} ÷ ${rate} = ${t} minutes.` };
    return { prompt: `A tank of ${V} litres fills in ${t} minutes. What is the rate of flow in litres per minute?`, answers: [String(rate)], hint: "Rate = volume ÷ time.", solution: `${V} ÷ ${t} = ${rate} litres per minute.` };
  }),
  T(`${U}-a5`, "application", ["9As.07"], "Convert a speed between km/h and m/s", () => {
    const ms = pick([5, 10, 15, 20, 25, 30, 35, 40]), kmh = ms * 3.6, toMs = pick([true, false]);
    return toMs
      ? { prompt: `Convert ${fmt(kmh)} km/h to m/s.`, answers: [String(ms)], hint: "1 km/h = 1000 m ÷ 3600 s, so divide by 3.6.", solution: `${fmt(kmh)} × 1000 ÷ 3600 = ${fmt(kmh)} ÷ 3.6 = ${ms} m/s.` }
      : { prompt: `Convert ${ms} m/s to km/h.`, answers: [ans(kmh)], hint: "Multiply by 3600 to get metres per hour, then divide by 1000.", solution: `${ms} × 3600 ÷ 1000 = ${ms} × 3.6 = ${fmt(kmh)} km/h.` };
  }),
  T(`${U}-a6`, "application", ["9Nf.08", "9Nf.07"], "Find the better buy", () => {
    for (;;) {
      const [m1, m2] = shuffle([250, 400, 500, 750, 1000]).slice(0, 2), [p1, p2] = [r(20, 90) * m1 / 1000 + r(0, 9) / 10, r(20, 90) * m2 / 1000 + r(0, 9) / 10].map((v) => roundDP(v, 2));
      const [u1, u2] = [p1 / m1, p2 / m2];
      if (Math.abs(u1 - u2) / Math.min(u1, u2) < 0.05) continue;
      const better = u1 < u2 ? "A" : "B";
      return { prompt: `Which is the better buy? A: ${m1} g for R${money(p1)}. B: ${m2} g for R${money(p2)}.`, answers: [better], hint: "Compare the cost of the same amount, for example 100 g, in each.", solution: `A: R${money((p1 / m1) * 100)} per 100 g. B: R${money((p2 / m2) * 100)} per 100 g. ${better} is cheaper for the same amount.`, answerFormat: "Enter A or B." };
    }
  }),
  T(`${U}-a7`, "application", ["9As.07"], "Find the average speed of a journey with a stop", () => {
    const [v1, t1, stop, v2, t2] = [r(30, 80), pick([1, 1.5, 2]), pick([0.5, 1]), r(30, 80), pick([0.5, 1, 1.5, 2])], d = v1 * t1 + v2 * t2, T_ = t1 + stop + t2;
    const avg = roundDP(d / T_, 1);
    return { prompt: `A distance-time graph shows a journey: ${fmt(v1 * t1)} km in ${fmt(t1)} h, a stop of ${fmt(stop)} h, then ${fmt(v2 * t2)} km in ${fmt(t2)} h. Find the average speed for the whole journey, in km/h, to 1 decimal place.`, answers: [ans(avg)], hint: "Average speed = total distance ÷ total time, including the stop.", solution: `Total distance = ${fmt(d)} km; total time = ${fmt(T_)} h. ${fmt(d)} ÷ ${fmt(T_)} = ${fmt(roundDP(d / T_, 3))}… ≈ ${fmt(avg)} km/h.` };
  }),
  T(`${U}-a8`, "application", ["9Nf.07"], "Scale a recipe", () => {
    const from = pick([4, 6, 8]), to = pick([2, 3, 5, 10, 12]), perPerson = pick([25, 30, 40, 50, 60, 75]), amount = perPerson * from;
    if (from === to) return s9u11.find((t) => t.id === `${U}-a8`)!.make();
    const ing = pick(["flour", "sugar", "rice", "butter"]);
    return { prompt: `A recipe for ${from} people uses ${amount} g of ${ing}. How much ${ing} is needed for ${to} people, in grams?`, answers: [String(perPerson * to)], hint: "Find the amount for one person first.", solution: `${amount} ÷ ${from} = ${perPerson} g per person, so ${to} people need ${perPerson * to} g.` };
  }),
  T(`${U}-a9`, "application", ["9Nf.08"], "Turn a ratio into a percentage", () => {
    const pairs = [[1, 4], [3, 7], [2, 3], [1, 9], [7, 13], [9, 11], [3, 17], [1, 1], [2, 8], [6, 14]], [a, b] = pick(pairs), pct = (100 * a) / (a + b);
    return { prompt: `Red and blue beads are in the ratio ${a} : ${b}. What percentage of the beads are red?`, answers: [ans(pct), `${ans(pct)}%`], hint: `Red is ${a} out of every ${a + b} beads.`, solution: `${a} ÷ ${a + b} × 100 = ${fmt(pct)}%.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Nf.07"], "Find how many are needed in inverse proportion", () => {
    const total = pick([60, 72, 96, 120, 144, 180]), divs = Array.from({ length: total }, (_, i) => i + 1).filter((d) => total % d === 0 && d > 2 && d < 40), [n1, n2] = shuffle(divs).slice(0, 2);
    return { prompt: `${n1} pumps can empty a pool in ${total / n1} hours. How many pumps are needed to empty it in ${total / n2} hours?`, answers: [String(n2)], hint: "The total pump-hours stays the same.", solution: `${n1} × ${total / n1} = ${total} pump-hours. ${total} ÷ ${total / n2} = ${n2} pumps.` };
  }),
  T(`${U}-r2`, "reasoning", ["9Nf.08"], "Solve a changing-ratio problem", () => {
    for (;;) {
      const [a, b] = coprime(1, 6), [c, d] = coprime(1, 9), add = r(2, 20);
      // red a k, blue b k; (a k + add) : b k = c : d  =>  k = add d / (b c − a d)
      const den = b * c - a * d;
      if (den <= 0 || (add * d) % den !== 0) continue;
      const k = (add * d) / den;
      if (k < 1 || k > 15) continue;
      return { prompt: `A bag has red and blue counters in the ratio ${a} : ${b}. After ${add} more red counters are added, the ratio is ${c} : ${d}. How many blue counters are there?`, answers: [String(b * k)], hint: "Let the numbers be ak and bk. Blue does not change.", solution: `(${linear(a, add, "k")}) : ${linear(b, 0, "k")} = ${c} : ${d}, so ${d === 1 ? "" : d}(${linear(a, add, "k")}) = ${c === 1 ? "" : `${c} × `}${linear(b, 0, "k")}, giving k = ${k}. Blue = ${b} × ${k} = ${b * k}.` };
    }
  }),
  T(`${U}-r3`, "reasoning", ["9As.07"], "Find the average speed over two stages", () => {
    const d = pick([60, 90, 120, 180]), [v1, v2] = shuffle([30, 40, 45, 60, 90]).slice(0, 2), t = d / v1 + d / v2, avg = roundDP((2 * d) / t, 1);
    return { prompt: `A cyclist travels ${d} km at ${v1} km/h and then another ${d} km at ${v2} km/h. Find the average speed for the whole journey, in km/h, to 1 decimal place.`, answers: [ans(avg)], hint: "It is not the mean of the two speeds: find the total time first.", solution: `Times: ${d} ÷ ${v1} = ${fmt(roundDP(d / v1, 3))} h and ${d} ÷ ${v2} = ${fmt(roundDP(d / v2, 3))} h. Average = ${2 * d} ÷ ${fmt(roundDP(t, 3))} ≈ ${fmt(avg)} km/h.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Nf.07"], "Recognise proportion from a table", () => {
    const k = pick([24, 36, 48, 60, 72]), inverse = pick([true, false]), xs = [2, 3, 4, 6].filter((x) => k % x === 0).slice(0, 3);
    const ys = inverse ? xs.map((x) => k / x) : xs.map((x) => (k / 12) * x);
    return { prompt: `x: ${xs.join(", ")}. y: ${ys.join(", ")}. Are x and y in direct or inverse proportion?`, answers: [inverse ? "inverse" : "direct"], hint: "Direct: y ÷ x is constant. Inverse: x × y is constant.", solution: inverse ? `x × y = ${k} every time, so inverse.` : `y ÷ x = ${k / 12} every time, so direct.`, answerFormat: "Enter direct or inverse." };
  }),
  T(`${U}-r5`, "reasoning", ["9As.07"], "Find a mass from density and dimensions", () => {
    const rho = pick([0.5, 0.7, 2.7, 7.9, 8.9]), [l, w, h] = [r(2, 10), r(2, 10), r(2, 10)], m = tidyNum(rho * l * w * h);
    return { prompt: `A cuboid ${l} cm × ${w} cm × ${h} cm is made of a material with density ${fmt(rho)} g/cm³. Find its mass in grams.`, answers: [ans(m)], hint: "Find the volume, then mass = density × volume.", solution: `Volume = ${l} × ${w} × ${h} = ${l * w * h} cm³. Mass = ${fmt(rho)} × ${l * w * h} = ${fmt(m)} g.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Nf.08"], "Combine two ratios", () => {
    const [a, b] = coprime(1, 7), [c, d] = coprime(1, 7), [A, C] = [a * c, b * d], g = gcd(A, C);
    return { prompt: `a : b = ${a} : ${b} and b : c = ${c} : ${d}. Find the ratio a : c in its simplest form.`, answers: ratioAnswers([A / g, C / g]), hint: "Make the b parts the same in both ratios.", solution: `a : b = ${a * c} : ${b * c} and b : c = ${b * c} : ${b * d}, so a : c = ${A} : ${C} = ${A / g} : ${C / g}.`, answerFormat: RATIO };
  }),
  T(`${U}-r7`, "reasoning", ["9As.07"], "Find a rate of change from a graph", () => {
    const start = r(0, 30), rate = r(2, 12), t = r(3, 15), end = start + rate * t;
    const [what, unit, per] = pick([["the water level in a tank", "cm", "minute"], ["the temperature of an oven", "°C", "minute"], ["the height of a plant", "mm", "day"]]);
    return { prompt: `A straight-line graph shows ${what} rising steadily from ${start} ${unit} to ${end} ${unit} over ${t} ${per}s. What is the rate of increase, in ${unit} per ${per}?`, answers: [String(rate)], hint: "Rate = change ÷ time: the gradient of the graph.", solution: `(${end} − ${start}) ÷ ${t} = ${rate * t} ÷ ${t} = ${rate} ${unit} per ${per}.` };
  }),
  T(`${U}-r8`, "reasoning", ["9Nf.07"], "Convert currency in two steps", () => {
    const [r1, r2] = [pick([15, 16, 17, 18, 19, 20]), pick([2, 3, 4, 5])], dollars = r(5, 60), rand = dollars * r1, yuan = roundDP(rand / r2, 2);
    return { prompt: `1 US dollar = R${r1}, and 1 Chinese yuan = R${r2}. How many yuan is ${dollars} US dollars? Give your answer to 2 decimal places.`, answers: [ans(yuan)], hint: "Convert dollars to rand, then rand to yuan.", solution: `${dollars} × ${r1} = R${rand}. R${rand} ÷ ${r2} = ${fmt(yuan)} yuan.` };
  }),
];
