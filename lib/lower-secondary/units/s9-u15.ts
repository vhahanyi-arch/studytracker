// Stage 9, unit 15: Interpreting and discussing results (9Ss.04, 9Ss.05).
// Quartiles and the interquartile range are IGCSE, not Lower Secondary; spread
// is compared with the range.
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, big, roundDP, ordinal } from "../kit";

const U = "s9-u15";
const LETTER = "Enter the letter of your choice.";
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

/** A grouped frequency table with equal-width classes. */
function grouped(classes = 4) {
  const w = pick([5, 10, 20]), lo = w * r(0, 6), f = Array.from({ length: classes }, () => r(2, 15));
  const bounds = f.map((_, i) => [lo + i * w, lo + (i + 1) * w] as const), mids = bounds.map(([a, b]) => (a + b) / 2);
  const n = sum(f), fx = sum(f.map((v, i) => v * mids[i]));
  return { w, f, bounds, mids, n, fx, mean: fx / n, text: bounds.map(([a, b], i) => `${a} ≤ x < ${b}: ${f[i]}`).join("; ") };
}
/** The class that contains the median of a grouped table. */
function medianClass(f: number[]) {
  const n = sum(f), pos = (n + 1) / 2;
  let run = 0;
  for (let i = 0; i < f.length; i++) { run += f[i]; if (run >= pos) return i; }
  return f.length - 1;
}

export const s9u15: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ss.04"], "Estimate the mean of grouped data", () => {
    const g = grouped(), est = roundDP(g.mean, 1);
    return { prompt: `Estimate the mean from this grouped frequency table: ${g.text}. Give your answer to 1 decimal place.`, answers: [ans(est)], hint: "Use the midpoint of each class: Σ(f × midpoint) ÷ Σf.", solution: `Midpoints ${g.mids.join(", ")}. Σfx = ${g.f.map((v, i) => `${v} × ${g.mids[i]}`).join(" + ")} = ${fmt(g.fx)}; Σf = ${g.n}. Mean ≈ ${fmt(g.fx)} ÷ ${g.n} = ${fmt(roundDP(g.mean, 3))}… ≈ ${fmt(est)}.` };
  }),
  T(`${U}-f2`, "foundational", ["9Ss.04"], "Find the modal class", () => {
    const g = grouped(), top = Math.max(...g.f);
    if (g.f.filter((v) => v === top).length > 1) return s9u15[1].make();
    const i = g.f.indexOf(top), [a, b] = g.bounds[i];
    return { prompt: `Which is the modal class? ${g.text}.`, answers: [`${a} ≤ x < ${b}`, `${a}-${b}`], hint: "The modal class has the highest frequency.", solution: `The highest frequency is ${top}, so the modal class is ${a} ≤ x < ${b}.`, answerFormat: `Enter the class, for example ${g.bounds[0][0]} ≤ x < ${g.bounds[0][1]}.` };
  }),
  T(`${U}-f3`, "foundational", ["9Ss.04"], "Find the class that contains the median", () => {
    const g = grouped(), i = medianClass(g.f), [a, b] = g.bounds[i];
    return { prompt: `Which class contains the median? ${g.text}.`, answers: [`${a} ≤ x < ${b}`, `${a}-${b}`], hint: `There are ${g.n} values; find which class holds the middle one.`, solution: `The median is the ${g.n % 2 ? `${ordinal((g.n + 1) / 2)} value` : `mean of the ${ordinal(g.n / 2)} and ${ordinal(g.n / 2 + 1)} values`}. Running totals: ${g.f.map((_, k) => sum(g.f.slice(0, k + 1))).join(", ")}, so it is in ${a} ≤ x < ${b}.`, answerFormat: `Enter the class, for example ${g.bounds[0][0]} ≤ x < ${g.bounds[0][1]}.` };
  }),
  T(`${U}-f4`, "foundational", ["9Ss.04"], "Compare two means", () => {
    const [a, b] = [Array.from({ length: 5 }, () => r(40, 90)), Array.from({ length: 5 }, () => r(40, 90))], [ma, mb] = [sum(a) / 5, sum(b) / 5];
    if (ma === mb) return s9u15[3].make();
    const better = ma > mb ? "A" : "B";
    return { prompt: `Group A scored ${a.join(", ")}. Group B scored ${b.join(", ")}. Which group has the higher mean?`, answers: [better], hint: "Mean = total ÷ number of values.", solution: `A: ${sum(a)} ÷ 5 = ${fmt(ma)}. B: ${sum(b)} ÷ 5 = ${fmt(mb)}. Group ${better} has the higher mean.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-f5`, "foundational", ["9Ss.05"], "Spot a misleading graph", () => {
    const [feature, misleading, why] = pick([
      ["The vertical axis of a bar chart starts at 90 instead of 0.", true, "cutting off the axis makes small differences look large"],
      ["A pictogram uses a bigger picture, not more pictures, to show a larger number.", true, "the area of the picture grows faster than the number, exaggerating the difference"],
      ["The gaps between the values on the vertical axis are not equal.", true, "an uneven scale distorts the heights of the bars"],
      ["A bar chart has a labelled vertical axis starting at 0 with an even scale.", false, "the bar heights are in proportion to the values"],
      ["A line graph has both axes labelled, with even scales and a title.", false, "nothing distorts the data"],
      ["A pie chart is drawn in 3D and tilted, so the front sectors look bigger.", true, "the tilt makes the nearest sectors look larger than they are"],
    ] as const);
    return { prompt: `${feature} Is this likely to be misleading? Answer yes or no.`, answers: [misleading ? "yes" : "no"], hint: "Ask whether the picture's sizes are in proportion to the numbers.", solution: `${misleading ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-f6`, "foundational", ["9Ss.05"], "Judge whether an inference is valid", () => {
    const [claim, ok, why] = pick([
      ["A survey of 8 people in one street finds 6 like a new shop. So 75% of the whole city likes it.", false, "8 people in one street cannot represent a whole city"],
      ["A random sample of 1000 voters finds 52% support a plan. So about half of all voters probably support it.", true, "a large random sample gives a reasonable estimate"],
      ["The students in the chess club have higher maths marks. So playing chess causes higher marks.", false, "a link between two things does not show that one causes the other"],
      ["A random sample of 500 Stage 9 students suggests most walk to school. So most Stage 9 students probably walk.", true, "the sample is large and random"],
      ["Ice cream sales and sunburn cases both rise in summer. So ice cream causes sunburn.", false, "both are caused by hot, sunny weather"],
    ] as const);
    return { prompt: `Is this conclusion reasonable? "${claim}" Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Think about sample size, how the sample was chosen, and whether a link means cause.", solution: `${ok ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-f7`, "foundational", ["9Ss.04"], "Find the median of a list", () => {
    const n = pick([7, 8, 9, 10]), xs = Array.from({ length: n }, () => r(10, 60)), s = [...xs].sort((a, b) => a - b), m = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    return { prompt: `Find the median of ${xs.join(", ")}.`, answers: [ans(m)], hint: "Order the values, then find the middle one (or the mean of the middle two).", solution: `In order: ${s.join(", ")}. The median is ${fmt(m)}.` };
  }),
  T(`${U}-f8`, "foundational", ["9Ss.04"], "Compare consistency using the range", () => {
    const [a, b] = [Array.from({ length: 6 }, () => r(20, 60)), Array.from({ length: 6 }, () => r(20, 60))], [ra, rb] = [Math.max(...a) - Math.min(...a), Math.max(...b) - Math.min(...b)];
    if (ra === rb) return s9u15[7].make();
    const more = ra < rb ? "A" : "B";
    return { prompt: `Runner A's times (s) are ${a.join(", ")}. Runner B's are ${b.join(", ")}. Which runner is more consistent?`, answers: [more], hint: "The smaller range shows more consistent results.", solution: `Range A = ${ra}; range B = ${rb}. Runner ${more} has the smaller range, so is more consistent.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-f9`, "foundational", ["9Ss.05"], "Read a percentage in context", () => {
    const n = pick([20, 25, 40, 50, 80]), k = r(2, n - 2), pct = (100 * k) / n;
    return { prompt: `In a survey, ${k} out of ${n} people said yes. What percentage said yes?`, answers: [ans(pct), `${ans(pct)}%`], hint: "Divide, then multiply by 100.", solution: `${k} ÷ ${n} × 100 = ${fmt(pct)}%.` };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ss.04"], "Estimate a mean from a five-class table", () => {
    const g = grouped(5), est = roundDP(g.mean, 1);
    return { prompt: `The times, in minutes, of some journeys are grouped: ${g.text}. Estimate the mean time to 1 decimal place.`, answers: [ans(est)], hint: "Multiply each midpoint by its frequency, add, then divide by the total frequency.", solution: `Σfx = ${fmt(g.fx)} and Σf = ${g.n}, so the mean ≈ ${fmt(roundDP(g.mean, 3))}… ≈ ${fmt(est)} minutes.` };
  }),
  T(`${U}-a2`, "application", ["9Ss.04"], "Compare two grouped distributions", () => {
    const [g1, g2] = [grouped(), grouped()];
    if (Math.abs(g1.mean - g2.mean) < 0.5) return s9u15.find((t) => t.id === `${U}-a2`)!.make();
    const bigger = g1.mean > g2.mean ? "A" : "B";
    return { prompt: `Group A: ${g1.text}. Group B: ${g2.text}. Which group has the higher estimated mean?`, answers: [bigger], hint: "Estimate each mean using the class midpoints.", solution: `A ≈ ${fmt(roundDP(g1.mean, 1))} and B ≈ ${fmt(roundDP(g2.mean, 1))}, so group ${bigger} is higher.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-a3`, "application", ["9Ss.05"], "Measure how much a cut axis exaggerates", () => {
    const start = 10 * r(3, 8), a = start + 10 * r(1, 3), b = a + 10 * r(1, 4), looks = (b - start) / (a - start);
    return { prompt: `A bar chart's vertical axis starts at ${start}. Bar A shows ${a} and bar B shows ${b}. How many times taller does bar B look than bar A?`, answers: [ans(roundDP(looks, 2))], hint: "Measure each bar from the bottom of the axis, not from 0.", solution: `Bar A is drawn ${a - start} units tall and bar B ${b - start}, so B looks ${fmt(roundDP(looks, 2))} times as tall, although ${b} is only ${fmt(roundDP(b / a, 2))} times ${a}.` };
  }),
  T(`${U}-a4`, "application", ["9Ss.04"], "Find the median from a frequency table", () => {
    const f = [r(1, 6), r(2, 8), r(2, 8), r(1, 6), r(1, 4)], values = f.flatMap((v, x) => Array(v).fill(x)), n = values.length;
    const m = n % 2 ? values[(n - 1) / 2] : (values[n / 2 - 1] + values[n / 2]) / 2;
    return { prompt: `A frequency table shows the number of pets owned. Pets: 0, 1, 2, 3, 4. Frequency: ${f.join(", ")}. Find the median number of pets.`, answers: [ans(m)], hint: "Find the position of the middle value, then count through the frequencies.", solution: `There are ${n} values, so the median is ${n % 2 ? `value number ${(n + 1) / 2}` : `the mean of values ${n / 2} and ${n / 2 + 1}`}. Counting through gives ${fmt(m)}.` };
  }),
  T(`${U}-a5`, "application", ["9Ss.05", "9Ss.04"], "Choose the correct comparison", () => {
    const [mA, mB] = [r(50, 70), r(50, 70)], [rA, rB] = [r(5, 20), r(25, 50)];
    if (mA === mB) return s9u15.find((t) => t.id === `${U}-a5`)!.make();
    const hi = mA > mB ? "Class A" : "Class B", lo = hi === "Class A" ? "Class B" : "Class A";
    const right = `${hi} did better on average, and class A's marks were more consistent.`;
    const options = shuffle([right, `${lo} did better on average, and class A's marks were more consistent.`, `${hi} did better on average, and class B's marks were more consistent.`]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `Class A: mean ${mA}, range ${rA}. Class B: mean ${mB}, range ${rB}. Which statement is correct? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(" ")}`, answers: [letter], hint: "Use the mean to compare averages and the range to compare consistency.", solution: `${letter}: ${hi} has the higher mean, and class A has the smaller range.`, answerFormat: LETTER };
  }),
  T(`${U}-a6`, "application", ["9Ss.04"], "Explain why a grouped mean is an estimate", () => {
    const right = "the exact values inside each class are not known", options = shuffle([right, "the frequencies might be wrong", "the mean can only be found for small data sets"]), letter = "ABC"[options.indexOf(right)];
    const g = grouped();
    return { prompt: `The mean of the grouped data ${g.text} can only be estimated. Why? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join("; ")}.`, answers: [letter], hint: "Think about what the midpoint stands in for.", solution: `${letter}: ${right}, so each value is assumed to be at its class midpoint.`, answerFormat: LETTER };
  }),
  T(`${U}-a7`, "application", ["9Ss.05"], "Compare percentages of different totals", () => {
    const [p1, n1, p2, n2] = [pick([20, 30, 40, 60]), pick([50, 80, 150, 200]), pick([15, 25, 35, 45]), pick([40, 100, 120, 300])], [k1, k2] = [(p1 * n1) / 100, (p2 * n2) / 100];
    if (k1 === k2) return s9u15.find((t) => t.id === `${U}-a7`)!.make();
    const more = k1 > k2 ? "A" : "B";
    return { prompt: `In school A, ${p1}% of ${n1} students walk to school. In school B, ${p2}% of ${n2} students walk. Which school has more students who walk?`, answers: [more], hint: "A bigger percentage does not always mean more people: work out the numbers.", solution: `A: ${p1}% of ${n1} = ${fmt(k1)}. B: ${p2}% of ${n2} = ${fmt(k2)}. School ${more} has more.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-a8`, "application", ["9Ss.05"], "Tell correlation from causation", () => {
    const [claim, ok, why] = pick([
      ["Towns with more doctors have more illness, so doctors cause illness.", false, "bigger towns have both more doctors and more illness"],
      ["Students who sleep more tend to have higher marks. This shows a positive correlation between sleep and marks.", true, "that describes the link without claiming a cause"],
      ["Shoe size and reading ability are positively correlated in primary school, so big feet make you read better.", false, "older children have bigger feet and read better: age causes both"],
      ["The more hours a heater runs, the more electricity is used. Running the heater uses the electricity.", true, "here there is a direct physical cause"],
      ["Countries that eat more chocolate win more Nobel prizes, so chocolate makes people cleverer.", false, "richer countries can afford both more chocolate and more research"],
      ["Taller students tend to have longer arm spans. This is a positive correlation.", true, "it describes the pattern in the data without claiming a cause"],
      ["Umbrella sales rise on days when more people catch colds, so umbrellas cause colds.", false, "rainy, cold weather causes both"],
      ["Cars that are driven further tend to use more fuel, because moving the car burns fuel.", true, "there is a direct cause: driving uses fuel"],
    ] as const);
    return { prompt: `Is this conclusion reasonable? "${claim}" Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Correlation shows a link; it does not by itself show that one thing causes the other.", solution: `${ok ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-a9`, "application", ["9Ss.05"], "Use a sample to estimate for a population", () => {
    const n = pick([50, 100, 200, 250]), k = r(5, n - 5), N = pick([1000, 2000, 5000, 10000]);
    return { prompt: `In a random sample of ${n} people from a town of ${big(N)}, ${k} said they cycle to work. Estimate how many people in the town cycle to work.`, answers: [ans((k * N) / n)], hint: "Assume the same proportion as in the sample.", solution: `${k}/${n} of ${big(N)} = ${big((k * N) / n)}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ss.04"], "Find a missing frequency from the mean", () => {
    for (;;) {
      const f = [r(2, 8), r(2, 8), 0, r(2, 8)], x = r(2, 9);
      f[2] = x;
      const n = sum(f), total = sum(f.map((v, i) => v * i));
      if ((total * 10) % n !== 0) continue;
      return { prompt: `Goals: 0, 1, 2, 3. Frequency: ${f[0]}, ${f[1]}, k, ${f[3]}. The mean number of goals is ${fmt(total / n)}. Find k.`, answers: [String(x)], hint: "Write the mean as (total goals) ÷ (total frequency), with k in both, and solve.", solution: `(${f[1]} + 2k + ${3 * f[3]}) ÷ (${f[0] + f[1] + f[3]} + k) = ${fmt(total / n)}. Solving gives k = ${x}.` };
    }
  }),
  T(`${U}-r2`, "reasoning", ["9Ss.04"], "Combine the means of two groups", () => {
    for (;;) {
      const [n1, n2, m1, m2] = [r(10, 30), r(10, 30), r(30, 80), r(30, 80)], mean = (n1 * m1 + n2 * m2) / (n1 + n2);
      if (m1 === m2 || !Number.isInteger(mean * 10)) continue;
      return { prompt: `A group of ${n1} has a mean score of ${m1}; another group of ${n2} has a mean score of ${m2}. Find the mean score of everyone together.`, answers: [ans(mean)], hint: "Find each total, add them, and divide by the total number.", solution: `(${n1} × ${m1} + ${n2} × ${m2}) ÷ ${n1 + n2} = ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} = ${fmt(mean)}.` };
    }
  }),
  T(`${U}-r3`, "reasoning", ["9Ss.05"], "Avoid being misled by pie charts of different totals", () => {
    const [t1, t2] = shuffle([60, 90, 120, 180, 360]).slice(0, 2), [a1, a2] = [30 * r(2, 8), 30 * r(2, 8)], [n1, n2] = [(a1 * t1) / 360, (a2 * t2) / 360];
    if (n1 === n2 || !Number.isInteger(n1) || !Number.isInteger(n2)) return s9u15.find((t) => t.id === `${U}-r3`)!.make();
    const more = n1 > n2 ? "A" : "B";
    return { prompt: `Pie chart A shows ${t1} people and pie chart B shows ${t2} people. The "yes" sector is ${a1}° in A and ${a2}° in B. Which chart shows more people saying yes?`, answers: [more], hint: "Convert each angle to a number of people.", solution: `A: ${a1}/360 × ${t1} = ${n1}. B: ${a2}/360 × ${t2} = ${n2}. ${more} has more, whatever the angles suggest.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-r4`, "reasoning", ["9Ss.04"], "Find the median class with an even total", () => {
    const g = grouped(5), i = medianClass(g.f), [a, b] = g.bounds[i];
    return { prompt: `${g.n} people are grouped by age: ${g.text}. In which class is the median age?`, answers: [`${a} ≤ x < ${b}`, `${a}-${b}`], hint: "Find the middle position, then use running totals.", solution: `The middle is at position ${fmt((g.n + 1) / 2)}. Running totals ${g.f.map((_, k) => sum(g.f.slice(0, k + 1))).join(", ")} put it in ${a} ≤ x < ${b}.`, answerFormat: `Enter the class, for example ${g.bounds[0][0]} ≤ x < ${g.bounds[0][1]}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Ss.05"], "Recognise a misleading average", () => {
    const base = Array.from({ length: 6 }, () => 1000 * r(8, 14)), boss = 1000 * r(80, 150), all = [...base, boss].sort((a, b) => a - b), mean = sum(all) / 7, median = all[3];
    return { prompt: `A company's 7 monthly salaries are R${all.map((v) => big(v)).join(", R")}. The company advertises "average salary R${big(Math.round(mean))}". Which average did it use: mean or median?`, answers: ["mean"], hint: "Work out both averages and compare with the advertised figure.", solution: `Mean = R${big(Math.round(mean))}; median = R${big(median)}. It used the mean, which the one high salary pulls up, so the claim is misleading.`, answerFormat: "Enter mean or median." };
  }),
  T(`${U}-r6`, "reasoning", ["9Ss.04"], "Estimate a total from a grouped mean", () => {
    const g = grouped(), est = g.fx;
    return { prompt: `Estimate the total of all the values in this grouped table: ${g.text}.`, answers: [ans(est)], hint: "Use Σ(frequency × midpoint).", solution: `${g.f.map((v, i) => `${v} × ${g.mids[i]}`).join(" + ")} = ${fmt(est)}.` };
  }),
  T(`${U}-r7`, "reasoning", ["9Ss.05"], "Scale a sample result to a population, then compare", () => {
    const n = pick([80, 100, 200]), k = r(10, n - 10), N = pick([2000, 4000, 5000]), claim = pick([1000, 1500, 2000]), est = (k * N) / n, ok = est > claim;
    return { prompt: `A random sample of ${n} out of ${big(N)} students found ${k} who want a longer lunch break. Does this suggest that more than ${big(claim)} students in total want it? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Scale the sample proportion up to the whole population.", solution: `${k}/${n} × ${big(N)} = ${big(est)}. ${ok ? "Yes" : "No"}: that is ${ok ? "more" : "not more"} than ${big(claim)}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r8`, "reasoning", ["9Ss.04"], "Predict the effect of a new value on the mean and range", () => {
    const xs = Array.from({ length: 5 }, () => r(10, 40)), extra = r(50, 90), ask = pick(["mean", "range"] as const), ys = [...xs, extra];
    const value = ask === "mean" ? sum(ys) / 6 : Math.max(...ys) - Math.min(...ys);
    return { prompt: `The data ${xs.join(", ")} has the value ${extra} added. What is the new ${ask}?${ask === "mean" ? " Give your answer to 1 decimal place if needed." : ""}`, answers: [ans(roundDP(value, 1))], hint: `Recalculate the ${ask} with all six values.`, solution: ask === "mean" ? `New total = ${sum(ys)}; mean = ${sum(ys)} ÷ 6 = ${fmt(roundDP(value, 3))}${Number.isInteger(value * 10) ? "" : "…"} ≈ ${fmt(roundDP(value, 1))}.` : `New range = ${Math.max(...ys)} − ${Math.min(...ys)} = ${value}.` };
  }),
];
