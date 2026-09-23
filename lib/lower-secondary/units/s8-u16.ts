// Stage 8, unit 16: Interpreting and discussing results (8Ss.04, 8Ss.05).
// Averages of grouped data and misleading representations are Stage 9
// (9Ss.04, 9Ss.05), so this unit uses lists and ungrouped frequency tables.
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, tidyNum, roundDP, ordinal } from "../kit";

const U = "s8-u16";
const LETTER = "Enter the letter of your choice.";

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
function median(xs: number[]) {
  const s = sorted(xs), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const list = (xs: number[]) => xs.map((x) => fmt(x)).join(", ");
/** n whole numbers between lo and hi whose mean is exactly a whole number. */
function withMean(n: number, lo: number, hi: number) {
  for (;;) {
    const xs = Array.from({ length: n - 1 }, () => r(lo, hi)), m = r(lo + 2, hi - 2), last = n * m - sum(xs);
    if (last >= lo && last <= hi) return { xs: shuffle([...xs, last]), m };
  }
}
/** A list with exactly one most common value. */
function withMode(n: number, lo: number, hi: number) {
  for (;;) {
    const xs = Array.from({ length: n }, () => r(lo, hi)), counts = new Map<number, number>();
    xs.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1));
    const top = Math.max(...counts.values()), modes = [...counts].filter(([, c]) => c === top);
    if (top >= 2 && modes.length === 1) return { xs, mode: modes[0][0] };
  }
}

export const s8u16: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Ss.04"], "Find the mean", () => {
    const n = r(4, 7), { xs, m } = withMean(n, 2, 30);
    return { prompt: `Find the mean of ${list(xs)}.`, answers: [String(m)], hint: "Add the values, then divide by how many there are.", solution: `(${xs.join(" + ")}) ÷ ${n} = ${sum(xs)} ÷ ${n} = ${m}.` };
  }),
  T(`${U}-f2`, "foundational", ["8Ss.04"], "Find the median", () => {
    const n = r(5, 8), xs = Array.from({ length: n }, () => r(1, 40)), md = median(xs);
    return { prompt: `Find the median of ${list(xs)}.`, answers: [ans(md)], hint: "Put the values in order first. With an even number of values, take the mean of the middle two.", solution: `In order: ${list(sorted(xs))}. ${n % 2 ? `The middle value is ${fmt(md)}.` : `The middle two are ${sorted(xs)[n / 2 - 1]} and ${sorted(xs)[n / 2]}, so the median is ${fmt(md)}.`}` };
  }),
  T(`${U}-f3`, "foundational", ["8Ss.04"], "Find the mode", () => {
    const { xs, mode } = withMode(r(7, 10), 1, 12);
    return { prompt: `Find the mode of ${list(xs)}.`, answers: [String(mode)], hint: "The mode is the value that appears most often.", solution: `${mode} appears most often, so the mode is ${mode}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Ss.04"], "Find the range", () => {
    const n = r(5, 8), xs = Array.from({ length: n }, () => r(-5, 40)), s = sorted(xs);
    return { prompt: `Find the range of ${list(xs)}.`, answers: [String(s[n - 1] - s[0])], hint: "Range = largest value − smallest value.", solution: `${fmt(s[n - 1])} − ${s[0] < 0 ? `(${fmt(s[0])})` : fmt(s[0])} = ${s[n - 1] - s[0]}.` };
  }),
  T(`${U}-f5`, "foundational", ["8Ss.04", "8Ss.05"], "Use the range to compare consistency", () => {
    const ra = r(4, 30), rb = ra + pick([-1, 1]) * r(5, 15), m = r(50, 75);
    if (rb < 3) return s8u16.find((t) => t.id === `${U}-f5`)!.make();
    const more = ra < rb ? "A" : "B";
    const [what, unit] = pick([["test marks", "marks"], ["times for a 100 m run", "seconds"], ["daily sales", "items"]]);
    return { prompt: `Two classes' ${what} have the same mean, ${m} ${unit}. Class A has a range of ${ra} ${unit} and class B has a range of ${rb} ${unit}. Which class's results are more consistent?`, answers: [more, `class ${more}`], hint: "A smaller range means the values are closer together.", solution: `Class ${more} has the smaller range (${Math.min(ra, rb)} ${unit}), so its results are more consistent.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-f6`, "foundational", ["8Ss.04"], "Compare two means", () => {
    const a = withMean(5, 3, 20), b = withMean(5, 3, 20);
    if (a.m === b.m) return s8u16.find((t) => t.id === `${U}-f6`)!.make();
    const higher = a.m > b.m ? "A" : "B";
    return { prompt: `Team A scored ${list(a.xs)} points in five games. Team B scored ${list(b.xs)}. Which team has the higher mean score?`, answers: [higher, `team ${higher}`], hint: "Find each mean: total ÷ 5.", solution: `Team A: ${sum(a.xs)} ÷ 5 = ${a.m}. Team B: ${sum(b.xs)} ÷ 5 = ${b.m}. Team ${higher} has the higher mean.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-f7`, "foundational", ["8Ss.05"], "Interpret a mean in context", () => {
    // A half in the mean needs an even count, so the total is a whole number.
    const half = pick([true, false]), n = half ? 2 * r(3, 6) : r(5, 12), m = r(2, 9) + (half ? 0.5 : 0), total = tidyNum(n * m);
    const [who, thing, unit] = pick([["students", "books each student read", "books"], ["matches", "goals scored in each match", "goals"], ["days", "emails received each day", "emails"]]);
    return { prompt: `Over ${n} ${who}, the mean number of ${thing} is ${fmt(m)}. What is the total number of ${unit}?`, answers: [ans(total)], hint: "Mean = total ÷ number of values, so total = mean × number of values.", solution: `Total = ${fmt(m)} × ${n} = ${fmt(total)} ${unit}.` };
  }),
  T(`${U}-f8`, "foundational", ["8Ss.04"], "Find the mean from a frequency table", () => {
    for (;;) {
      const f = [r(1, 6), r(2, 8), r(2, 8), r(1, 6), r(0, 4)], n = sum(f), total = sum(f.map((v, x) => v * x));
      if ((total * 10) % n !== 0) continue;
      return { prompt: `A frequency table shows the number of pets each student owns. Pets: 0, 1, 2, 3, 4. Number of students: ${f.join(", ")}. Find the mean number of pets per student.`, answers: [ans(total / n)], hint: "Multiply each number of pets by its frequency and add; divide by the number of students.", solution: `Total pets = ${f.map((v, x) => `${x} × ${v}`).join(" + ")} = ${total}. Students = ${n}. Mean = ${total} ÷ ${n} = ${fmt(total / n)}.` };
    }
  }),
  T(`${U}-f9`, "foundational", ["8Ss.04", "8Ss.05"], "Choose the most suitable average", () => {
    const [situation, best, why] = pick([
      ["the salaries of 10 staff, where the manager earns ten times more than anyone else", "median", "one very large value would pull the mean up"],
      ["the house prices in a street where one mansion costs far more than the rest", "median", "one extreme value would distort the mean"],
      ["the most popular shoe size sold in a shop", "mode", "the shop needs the size bought most often"],
      ["the favourite colours of a class", "mode", "the data is categorical, so only the mode makes sense"],
      ["the heights of a class of students, with no unusual values", "mean", "it uses every value and there are no extreme values"],
      ["the marks of a class in a test, where everyone scored between 40 and 60", "mean", "it uses every value and there are no extreme values"],
    ] as const);
    return { prompt: `Which average (mean, median or mode) is most suitable for ${situation}?`, answers: [best], hint: "Think about extreme values and whether the data is numerical.", solution: `The ${best}, because ${why}.`, answerFormat: "Enter mean, median or mode." };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Ss.04"], "Find a missing value from the mean", () => {
    const n = r(4, 6), { xs, m } = withMean(n, 5, 40), known = xs.slice(0, n - 1), missing = xs[n - 1];
    return { prompt: `The mean of ${n} numbers is ${m}. ${n - 1} of them are ${list(known)}. Find the other number.`, answers: [String(missing)], hint: "Find the total of all the numbers from the mean first.", solution: `Total = ${m} × ${n} = ${m * n}. Known total = ${sum(known)}. The other number = ${m * n} − ${sum(known)} = ${missing}.` };
  }),
  T(`${U}-a2`, "application", ["8Ss.04"], "Find the median from a frequency table", () => {
    const f = [r(1, 6), r(1, 7), r(1, 7), r(1, 6), r(1, 4)], n = sum(f);
    const values = f.flatMap((v, x) => Array(v).fill(x)), md = median(values);
    const pos = n % 2 ? `the ${ordinal((n + 1) / 2)} value` : `the mean of the ${ordinal(n / 2)} and ${ordinal(n / 2 + 1)} values`;
    return { prompt: `A frequency table shows the number of goals scored in each match. Goals: 0, 1, 2, 3, 4. Frequency: ${f.join(", ")}. Find the median number of goals.`, answers: [ans(md)], hint: "Count through the frequencies to find the middle match.", solution: `There are ${n} matches, so the median is ${pos}, which is ${fmt(md)}.` };
  }),
  T(`${U}-a3`, "application", ["8Ss.04", "8Ss.05"], "Compare two groups using the range", () => {
    const a = Array.from({ length: 6 }, () => r(40, 80)), b = Array.from({ length: 6 }, () => r(40, 80));
    const [ra, rb] = [Math.max(...a) - Math.min(...a), Math.max(...b) - Math.min(...b)];
    if (ra === rb) return s8u16.find((t) => t.id === `${U}-a3`)!.make();
    const more = ra < rb ? "A" : "B";
    return { prompt: `Group A's test marks were ${list(a)}. Group B's were ${list(b)}. Use the range to decide which group's marks were more consistent.`, answers: [more, `group ${more}`], hint: "Find each range; the smaller range is more consistent.", solution: `Range A = ${Math.max(...a)} − ${Math.min(...a)} = ${ra}. Range B = ${Math.max(...b)} − ${Math.min(...b)} = ${rb}. Group ${more} has the smaller range, so it is more consistent.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-a4`, "application", ["8Ss.05"], "Draw a conclusion from averages and ranges", () => {
    const mA = r(20, 30), mB = mA + pick([-1, 1]) * r(2, 5), rA = r(3, 8), rB = rA + r(8, 15);
    const [nameA, nameB] = pick([["Town P", "Town Q"], ["Farm P", "Farm Q"]]);
    const statements = shuffle([
      [`${mA > mB ? nameA : nameB} has the higher mean, and ${nameA} is more consistent.`, true],
      [`${mA > mB ? nameB : nameA} has the higher mean, and ${nameA} is more consistent.`, false],
      [`${mA > mB ? nameA : nameB} has the higher mean, and ${nameB} is more consistent.`, false],
    ] as Array<[string, boolean]>);
    const letter = "ABC"[statements.findIndex(([, ok]) => ok)];
    const what = nameA.startsWith("Town") ? "daily maximum temperature (°C)" : "daily milk yield (litres)";
    return { prompt: `${nameA}: mean ${what} ${mA}, range ${rA}. ${nameB}: mean ${mB}, range ${rB}. Which statement is correct? ${statements.map(([s], i) => `${"ABC"[i]}: ${s}`).join(" ")}`, answers: [letter], hint: "The higher mean shows which is greater on average; the smaller range shows which is more consistent.", solution: `${letter}: ${mA > mB ? nameA : nameB} has the higher mean (${Math.max(mA, mB)}), and ${nameA} has the smaller range (${rA}), so it is more consistent.`, answerFormat: LETTER };
  }),
  T(`${U}-a5`, "application", ["8Ss.04"], "Find a new mean after a value is added", () => {
    const n = r(4, 9), m = r(10, 30), extra = r(5, 50), newMean = (n * m + extra) / (n + 1);
    if (!Number.isInteger(newMean * 10)) return s8u16.find((t) => t.id === `${U}-a5`)!.make();
    return { prompt: `The mean of ${n} numbers is ${m}. The number ${extra} is added to the list. What is the new mean?`, answers: [ans(newMean)], hint: "Find the old total, add the new number, then divide by the new count.", solution: `Old total = ${n} × ${m} = ${n * m}. New total = ${n * m + extra}. New mean = ${n * m + extra} ÷ ${n + 1} = ${fmt(newMean)}.` };
  }),
  T(`${U}-a6`, "application", ["8Ss.05"], "Compare groups of different sizes", () => {
    for (;;) {
      const [na, nb] = [pick([20, 25, 40, 50]), pick([20, 25, 40, 50])], [ka, kb] = [r(4, na - 4), r(4, nb - 4)];
      if (na === nb || ka / na === kb / nb || ka === kb) continue;
      const higher = ka / na > kb / nb ? "A" : "B";
      if ((higher === "A") === (ka > kb)) continue; // make counts and proportions disagree
      return { prompt: `In club A, ${ka} of ${na} members walk to training. In club B, ${kb} of ${nb} members do. Which club has the higher proportion of members who walk?`, answers: [higher, `club ${higher}`], hint: "Compare percentages, not counts: the clubs are different sizes.", solution: `Club A: ${ka} ÷ ${na} = ${fmt((100 * ka) / na)}%. Club B: ${kb} ÷ ${nb} = ${fmt((100 * kb) / nb)}%. Club ${higher} has the higher proportion, even though it has fewer walkers.`, answerFormat: "Enter A or B." };
    }
  }),
  T(`${U}-a7`, "application", ["8Ss.04"], "Find the median of decimal data", () => {
    const n = pick([6, 8]), xs = Array.from({ length: n }, () => r(100, 250) / 10), md = tidyNum(median(xs));
    return { prompt: `The times, in seconds, of ${n} runners are ${list(xs)}. Find the median time in seconds.`, answers: [ans(md)], hint: "Order the times; the median is halfway between the middle two.", solution: `In order: ${list(sorted(xs))}. Middle two: ${fmt(sorted(xs)[n / 2 - 1])} and ${fmt(sorted(xs)[n / 2])}. Median = ${fmt(md)} s.` };
  }),
  T(`${U}-a8`, "application", ["8Ss.05"], "Judge a conclusion from a small sample", () => {
    const [claim, ok, why] = pick([
      ["Two different random samples of 10 students give mean heights of 151 cm and 154 cm. So the heights of the whole school must have changed between the samples.", false, "samples vary by chance, so a small difference does not prove anything changed"],
      ["A coin gives 7 heads in 10 flips. So the coin must be biased.", false, "10 flips is too few: results vary a lot by chance in small samples"],
      ["In a survey of 5 people, 3 prefer brand X. So 60% of everyone in the country prefers brand X.", false, "a sample of 5 is far too small to represent a whole country"],
      ["Random samples of 500 students in two schools give mean journey times of 12 minutes and 35 minutes. So students at the second school tend to travel for longer.", true, "large random samples with a big difference give good evidence"],
      ["In 2000 rolls, a dice showed six 780 times. So the dice is probably biased.", true, "with so many rolls the result should be close to 1/6, and 780 is far from about 333"],
    ] as const);
    return { prompt: `Is this conclusion reasonable? "${claim}" Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Think about the size of the sample and how much results vary by chance.", solution: `${ok ? "Yes" : "No"}: ${why}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-a9`, "application", ["8Ss.04"], "Work back from the range", () => {
    const xs = Array.from({ length: 4 }, () => r(2, 30)), R = r(5, 20), hi = Math.min(...xs) + R;
    if (hi <= Math.max(...xs)) return s8u16.find((t) => t.id === `${U}-a9`)!.make();
    return { prompt: `Five numbers have a range of ${R}. Four of them are ${list(xs)}. The fifth number is the largest. What is it?`, answers: [String(hi)], hint: "Range = largest − smallest.", solution: `The smallest is ${Math.min(...xs)}, so the largest is ${Math.min(...xs)} + ${R} = ${hi}.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Ss.04"], "Find numbers from their mean, median and range", () => {
    for (;;) {
      const a = r(1, 15), b = a + r(1, 10), c = b + r(1, 10), m = (a + b + c) / 3;
      if (!Number.isInteger(m)) continue;
      const ask = pick(["largest", "smallest"] as const);
      return { prompt: `Three whole numbers have a mean of ${m}, a median of ${b} and a range of ${c - a}. What is the ${ask} number?`, answers: [String(ask === "largest" ? c : a)], hint: "The total is 3 × the mean, and the middle number is the median.", solution: `Total = 3 × ${m} = ${3 * m}, so smallest + largest = ${3 * m} − ${b} = ${a + c}. They differ by ${c - a}, so the largest is (${a + c} + ${c - a}) ÷ 2 = ${c} and the smallest is ${a}. The ${ask} is ${ask === "largest" ? c : a}.` };
    }
  }),
  T(`${U}-r2`, "reasoning", ["8Ss.04"], "Predict the effect of changing every value", () => {
    const m = r(10, 40), R = r(5, 20), k = r(2, 10), add = pick([true, false]), ask = pick(["mean", "range"] as const);
    const value = ask === "mean" ? (add ? m + k : m * k) : add ? R : R * k;
    const why = ask === "mean" ? (add ? `every value goes up by ${k}, so the mean does too` : `every value is multiplied by ${k}, so the mean is too`) : add ? "every value moves up by the same amount, so the gaps between them do not change" : `every gap between values is multiplied by ${k}`;
    return { prompt: `A set of numbers has a mean of ${m} and a range of ${R}. ${add ? `${k} is added to every number` : `Every number is multiplied by ${k}`}. What is the new ${ask}?`, answers: [String(value)], hint: "Think about what happens to each value, and to the gaps between them.", solution: `The new ${ask} is ${value}: ${why}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Ss.04"], "Combine the means of two groups", () => {
    for (;;) {
      const n1 = r(8, 20), n2 = r(8, 20), m1 = r(40, 80), m2 = r(40, 80), mean = (n1 * m1 + n2 * m2) / (n1 + n2);
      if (m1 === m2 || !Number.isInteger(mean * 10)) continue;
      return { prompt: `A class of ${n1} students has a mean mark of ${m1}. Another class of ${n2} students has a mean mark of ${m2}. Find the mean mark of all ${n1 + n2} students.`, answers: [ans(mean)], hint: "Find each class's total, add them, then divide by the total number of students.", solution: `Totals: ${n1} × ${m1} = ${n1 * m1} and ${n2} × ${m2} = ${n2 * m2}. Mean = ${n1 * m1 + n2 * m2} ÷ ${n1 + n2} = ${fmt(mean)}.` };
    }
  }),
  T(`${U}-r4`, "reasoning", ["8Ss.04", "8Ss.05"], "See how an extreme value affects averages", () => {
    const xs = sorted(Array.from({ length: 5 }, () => r(10, 30))), big = r(150, 400), ys = [...xs.slice(0, 4), big];
    const ask = pick(["mean", "median"] as const), before = ask === "mean" ? sum(xs) / 5 : median(xs), after = ask === "mean" ? sum(ys) / 5 : median(ys);
    return { prompt: `The data ${list(xs)} has its largest value, ${xs[4]}, replaced by ${big}. What is the new ${ask}?`, answers: [ans(after)], hint: "Recalculate the average with the new value. Which averages depend on every value?", solution: ask === "mean" ? `New total = ${sum(ys)}, so the mean = ${sum(ys)} ÷ 5 = ${fmt(after)} (it was ${fmt(before)}): one extreme value changes the mean a lot.` : `In order the data is ${list(ys)}; the middle value is still ${fmt(after)}, so the median is not affected by the extreme value.` };
  }),
  T(`${U}-r5`, "reasoning", ["8Ss.05"], "Compare success rates", () => {
    for (;;) {
      const [na, nb] = [pick([40, 50, 60, 80]), pick([40, 50, 60, 80])], [ka, kb] = [r(15, na - 5), r(15, nb - 5)];
      const [pa, pb] = [(100 * ka) / na, (100 * kb) / nb];
      if (na === nb || Math.abs(pa - pb) < 2 || !Number.isInteger(pa * 10) || !Number.isInteger(pb * 10)) continue;
      const better = pa > pb ? "A" : "B";
      return { prompt: `At school A, ${ka} of ${na} students passed a test. At school B, ${kb} of ${nb} students passed. Which school had the higher pass rate?`, answers: [better, `school ${better}`], hint: "Work out each pass rate as a percentage.", solution: `A: ${ka} ÷ ${na} = ${fmt(pa)}%. B: ${kb} ÷ ${nb} = ${fmt(pb)}%. School ${better} had the higher pass rate.`, answerFormat: "Enter A or B." };
    }
  }),
  T(`${U}-r6`, "reasoning", ["8Ss.04"], "Make the mean equal the median", () => {
    for (;;) {
      const a = r(1, 10), b = a + r(1, 6), c = b + 2 * r(1, 4), md = (b + c) / 2, x = 4 * md - (a + b + c);
      if (x <= c || !Number.isInteger(md)) continue;
      return { prompt: `The numbers ${a}, ${b}, ${c} and x are in order, with x the largest. The mean is equal to the median. Find x.`, answers: [String(x)], hint: "Find the median from the two middle numbers, then use mean = median to find the total.", solution: `Median = (${b} + ${c}) ÷ 2 = ${md}. The mean is also ${md}, so the total is 4 × ${md} = ${4 * md}. x = ${4 * md} − ${a} − ${b} − ${c} = ${x}.` };
    }
  }),
  T(`${U}-r7`, "reasoning", ["8Ss.04", "8Ss.05"], "Test a claim with a frequency table", () => {
    const f = [r(1, 8), r(2, 9), r(2, 9), r(0, 6), r(0, 4)], n = sum(f), total = sum(f.map((v, x) => v * x)), mean = total / n, claim = pick([1.5, 2]);
    if (mean === claim) return s8u16.find((t) => t.id === `${U}-r7`)!.make();
    const ok = mean > claim;
    return { prompt: `A coach claims the team scores more than ${fmt(claim)} goals per match on average. Goals: 0, 1, 2, 3, 4. Number of matches: ${f.join(", ")}. Is the claim supported by the mean? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Find the mean from the table and compare it with the claim.", solution: `Total goals = ${total} in ${n} matches, so the mean = ${fmt(roundDP(mean, 2))}${Number.isInteger(mean * 100) ? "" : " (to 2 decimal places)"}. ${ok ? "Yes" : "No"}: that is ${ok ? "more" : "not more"} than ${fmt(claim)}.`, answerFormat: "Enter yes or no." };
  }),
  T(`${U}-r8`, "reasoning", ["8Ss.04"], "Find the mean after a value is removed", () => {
    for (;;) {
      const n = r(5, 10), m = r(20, 60) / 10, out = r(10, 90) / 10, rest = tidyNum(n * m - out), newMean = tidyNum(rest / (n - 1));
      if (rest <= 0 || !Number.isInteger(tidyNum(newMean * 100))) continue;
      return { prompt: `The mean mass of ${n} parcels is ${fmt(m)} kg. One parcel of ${fmt(out)} kg is removed. Find the mean mass of the remaining parcels, in kg.`, answers: [ans(newMean)], hint: "Find the total mass first, then take away the parcel.", solution: `Total = ${n} × ${fmt(m)} = ${fmt(tidyNum(n * m))} kg. Remaining = ${fmt(tidyNum(n * m))} − ${fmt(out)} = ${fmt(rest)} kg. Mean = ${fmt(rest)} ÷ ${n - 1} = ${fmt(newMean)} kg.` };
    }
  }),
];
