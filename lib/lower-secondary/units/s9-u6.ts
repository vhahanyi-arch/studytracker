// Stage 9, unit 6: Statistical investigations (9Ss.01, 9Ss.02, 9Ss.03).
import { T, type Template } from "../engine";
import { r, pick, shuffle, fmt, ans, linear, frac } from "../kit";

const U = "s9-u6";
const LETTER = "Enter the letter of your choice.";
const YES_NO = "Enter yes or no.";

const QUAL: Array<[string, boolean]> = [
  ["the colour of each car in a car park", true], ["each student's favourite music style", true], ["the flavour of each ice cream sold", true], ["how each student describes the school canteen (poor, fair, good)", true],
  ["the number of goals scored in each match", false], ["the mass of each apple", false], ["the time each runner takes", false], ["the number of pages in each book", false],
  ["each student's eye colour", true], ["the type of pet each family owns", true], ["the country each visitor comes from", true], ["how tasty each tester found a new drink (from awful to delicious)", true],
  ["the height of each sunflower", false], ["the number of siblings each student has", false], ["the temperature each day at noon", false], ["the price of each item in a shop", false],
];
type Kind = "categorical" | "discrete" | "continuous";
const KINDS: Array<[string, Kind]> = [
  ["the number of cousins each student has", "discrete"], ["the number of emails received each day", "discrete"], ["shoe sizes sold in a shop", "discrete"],
  ["the length of each fish caught", "continuous"], ["the time taken to solve a puzzle", "continuous"], ["the volume of water used each day", "continuous"],
  ["the type of phone each student owns", "categorical"], ["the month each student was born", "categorical"], ["the language each student speaks at home", "categorical"],
  ["the number of people on each bus", "discrete"], ["the number of correct answers in a quiz", "discrete"], ["the mass of each newborn baby", "continuous"],
  ["the distance each student jumps", "continuous"], ["each student's blood group", "categorical"], ["the brand of each bicycle", "categorical"],
];
const WHY: Record<Kind, string> = { categorical: "it is made of categories, not numbers", discrete: "it is counted and can only take separate values", continuous: "it is measured and can take any value in a range" };

/** A back-to-back stem-and-leaf diagram: values for two groups sharing stems. */
function backToBack() {
  const first = r(2, 6), rows = 3, make = () => Array.from({ length: r(5, 8) }, () => 10 * (first + r(0, rows - 1)) + r(0, 9)).sort((a, b) => a - b);
  const [A, B] = [make(), make()];
  const lines = Array.from({ length: rows }, (_, i) => {
    const s = first + i, left = A.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10).reverse().join(" "), right = B.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10).join(" ");
    return `${left || "–"} | ${s} | ${right || "–"}`;
  });
  return { A, B, text: `${lines.join("; ")} (Group A on the left, group B on the right; key: 2 | ${first} | 5 means ${first}2 for A and ${first}5 for B)` };
}

export const s9u6: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["9Ss.01"], "Tell qualitative from quantitative data", () => {
    const [what, qual] = pick(QUAL);
    return { prompt: `A survey records ${what}. Is this qualitative or quantitative data?`, answers: [qual ? "qualitative" : "quantitative"], hint: "Qualitative data is descriptive (words); quantitative data is numerical.", solution: `It is ${qual ? "qualitative: it describes a quality in words" : "quantitative: it is a number that is counted or measured"}.`, answerFormat: "Enter qualitative or quantitative." };
  }),
  T(`${U}-f2`, "foundational", ["9Ss.01"], "Classify data as categorical, discrete or continuous", () => {
    const [what, kind] = pick(KINDS);
    return { prompt: `Is ${what} categorical, discrete or continuous data?`, answers: [kind], hint: "Counts are discrete; measurements are continuous; labels are categorical.", solution: `It is ${kind}: ${WHY[kind]}.`, answerFormat: "Enter categorical, discrete or continuous." };
  }),
  T(`${U}-f3`, "foundational", ["9Ss.02"], "Spot a biased survey question", () => {
    const [topic, fair, leading] = pick([
      ["school lunches", "How would you rate school lunches from 1 to 5?", "Don't you agree that school lunches are too expensive?"],
      ["homework", "How many hours of homework do you do each week?", "Most people think there is too much homework. Do you agree?"],
      ["the new park", "How often do you visit the new park?", "Isn't the new park a great improvement to our town?"],
      ["sport", "Which sport do you enjoy most?", "Football is the best sport, isn't it?"],
      ["the library", "How many times did you visit the library last month?", "Surely you agree the library should open longer?"],
      ["school buses", "How long is your bus journey to school, in minutes?", "Don't you think the school buses are always late?"],
      ["exercise", "How many minutes of exercise did you do yesterday?", "Everyone knows exercise is important. How much do you do?"],
      ["screen time", "How many hours did you spend on a screen yesterday?", "Do you agree that young people spend far too long on screens?"],
    ] as const);
    const fairFirst = pick([true, false]), letter = fairFirst ? "B" : "A";
    return { prompt: `For a survey about ${topic}, which question is biased? A: "${fairFirst ? fair : leading}" B: "${fairFirst ? leading : fair}" Enter A or B.`, answers: [letter], hint: "A biased (leading) question pushes people towards one answer.", solution: `${letter}: "${leading}" suggests the answer it wants, so it is biased.`, answerFormat: LETTER };
  }),
  T(`${U}-f4`, "foundational", ["9Ss.02"], "Decide whether a sample is biased", () => {
    const [description, biased, why] = pick([
      ["To find out how much exercise adults do, a researcher asks people at a gym.", true, "people at a gym probably exercise more than most adults"],
      ["To find out how people in a town get to work, a researcher asks people at a bus station at 8 a.m.", true, "people at a bus station mostly travel by bus"],
      ["To find out about a school's reading habits, the librarian asks students who borrow books.", true, "students who borrow books read more than many others"],
      ["To find out about a town's shopping habits, 200 households are picked at random from the full list of addresses.", false, "every household had an equal chance of being chosen"],
      ["To find the average height of Stage 9 students, 40 are picked at random from the Stage 9 register.", false, "every Stage 9 student had an equal chance of being chosen"],
      ["To find out how often people eat fast food, a researcher asks customers leaving a burger restaurant.", true, "those customers eat fast food more often than most people"],
      ["To find the favourite subject in a school, only the maths club is asked.", true, "maths club members are more likely to choose maths"],
      ["To find out how far students travel to school, every 10th name on the full school register is chosen.", false, "the sample is spread through the whole school"],
      ["To find out how a town voted, 300 adults are picked at random from the full electoral roll.", false, "every adult had an equal chance of being chosen"],
      ["To find out whether people like a new film, a reporter asks people queueing to see it a second time.", true, "people seeing it again are likely to have enjoyed it"],
    ] as const);
    return { prompt: `${description} Is this sample likely to be biased? Answer yes or no.`, answers: [biased ? "yes" : "no"], hint: "Does the method give every member of the population a fair chance?", solution: `${biased ? "Yes" : "No"}: ${why}.`, answerFormat: YES_NO };
  }),
  T(`${U}-f5`, "foundational", ["9Ss.03"], "Plot a frequency polygon at midpoints", () => {
    const w = pick([5, 10, 20]), lo = w * r(1, 8);
    return { prompt: `On a frequency polygon, at what value is the class ${lo} ≤ t < ${lo + w} plotted?`, answers: [ans(lo + w / 2)], hint: "Frequency polygons plot each frequency at the midpoint of its class.", solution: `The midpoint is (${lo} + ${lo + w}) ÷ 2 = ${fmt(lo + w / 2)}.` };
  }),
  T(`${U}-f6`, "foundational", ["9Ss.03"], "Describe correlation", () => {
    const [situation, kind] = pick([
      ["As the temperature rises, more ice creams are sold.", "positive"], ["Students who revise for longer tend to score higher marks.", "positive"],
      ["As a car gets older, its value tends to fall.", "negative"], ["The higher up a mountain, the lower the temperature tends to be.", "negative"],
      ["There is no pattern between students' shoe sizes and their test marks.", "none"], ["House numbers show no link with the ages of the people living there.", "none"],
      ["Taller people tend to have bigger hand spans.", "positive"], ["The more hours a heater runs, the more electricity is used.", "positive"],
      ["The more people share a pizza, the smaller each share tends to be.", "negative"], ["As a runner's training increases, their race time tends to fall.", "negative"],
      ["There is no link between the day of the month and the rainfall.", "none"],
    ] as const);
    return { prompt: `${situation} What type of correlation does a scatter graph of this show: positive, negative or none?`, answers: kind === "none" ? ["none", "no correlation", "no"] : [kind], hint: "Positive: both increase together. Negative: one increases as the other decreases.", solution: kind === "none" ? "There is no correlation: the points show no pattern (none)." : `It is ${kind} correlation: ${kind === "positive" ? "both variables increase together" : "one increases as the other decreases"}.`, answerFormat: "Enter positive, negative or none." };
  }),
  T(`${U}-f7`, "foundational", ["9Ss.03"], "Read a back-to-back stem-and-leaf diagram", () => {
    const d = backToBack(), group = pick(["A", "B"] as const), vals = group === "A" ? d.A : d.B, ask = pick(["largest", "smallest"] as const);
    const v = ask === "largest" ? Math.max(...vals) : Math.min(...vals);
    return { prompt: `A back-to-back stem-and-leaf diagram shows: ${d.text}. What is the ${ask} value in group ${group}?`, answers: [String(v)], hint: `Group ${group}'s leaves are on the ${group === "A" ? "left, read from the stem outwards" : "right"}.`, solution: `The ${ask} value in group ${group} is ${v}.` };
  }),
  T(`${U}-f8`, "foundational", ["9Ss.03"], "Turn a pie chart angle into a percentage", () => {
    const pct = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75]), angle = (pct * 360) / 100;
    return { prompt: `A sector of a pie chart has an angle of ${fmt(angle)}°. What percentage of the data does it represent?`, answers: [String(pct), `${pct}%`], hint: "The whole pie is 360°, which is 100%.", solution: `${fmt(angle)} ÷ 360 × 100 = ${pct}%.` };
  }),
  T(`${U}-f9`, "foundational", ["9Ss.01"], "Tell primary from secondary data", () => {
    const [how, kind] = pick([
      ["A student counts the cars passing the school gate.", "primary"], ["A class measures their own heights.", "primary"], ["A student carries out a survey of their year group.", "primary"],
      ["A student uses population figures from a government website.", "secondary"], ["A student takes rainfall figures from a newspaper.", "secondary"], ["A student uses results published in a textbook.", "secondary"],
      ["A group times how long their classmates take to run 100 m.", "primary"], ["A student records the temperature in the garden every hour.", "primary"], ["A student interviews shoppers about their journeys.", "primary"],
      ["A student downloads football results from a sports website.", "secondary"], ["A student copies exchange rates from a bank's website.", "secondary"], ["A student uses last year's census results.", "secondary"],
    ] as const);
    return { prompt: `${how} Is this primary or secondary data?`, answers: [kind], hint: "Primary data is collected by you; secondary data was collected by someone else.", solution: `It is ${kind} data: ${kind === "primary" ? "the student collected it first-hand" : "someone else collected it"}.`, answerFormat: "Enter primary or secondary." };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["9Ss.03"], "Find a point on a frequency polygon", () => {
    const w = pick([5, 10]), lo = w * r(2, 10), f = [r(2, 15), r(2, 15), r(2, 15), r(2, 15)], i = r(0, 3), a = lo + i * w;
    const table = f.map((v, k) => `${lo + k * w} ≤ m < ${lo + (k + 1) * w}: ${v}`).join("; ");
    return { prompt: `A grouped frequency table shows masses in kg. ${table}. Which point is plotted for the class ${a} ≤ m < ${a + w} on a frequency polygon?`, answers: [`(${ans(a + w / 2)}, ${f[i]})`, `${ans(a + w / 2)}, ${f[i]}`], hint: "Use the midpoint of the class for x and the frequency for y.", solution: `Midpoint = ${fmt(a + w / 2)}, frequency = ${f[i]}, so the point is (${fmt(a + w / 2)}, ${f[i]}).`, answerFormat: "Enter the point as (x, y)." };
  }),
  T(`${U}-a2`, "application", ["9Ss.02"], "Find a problem with response boxes", () => {
    const w = r(3, 6), start = r(0, 2), boxes = [0, 1, 2].map((k) => [start + k * w, start + (k + 1) * w]);
    const overlap = boxes[1][0];
    return { prompt: `A questionnaire asks "How many hours of TV do you watch each week?" with boxes ${boxes.map(([a, b]) => `${a}–${b}`).join(", ")} and "more than ${boxes[2][1]}". What is the smallest whole number of hours that could be ticked in two different boxes?`, answers: [String(overlap)], hint: "Look at where one box ends and the next begins.", solution: `${overlap} is in both ${boxes[0][0]}–${boxes[0][1]} and ${boxes[1][0]}–${boxes[1][1]}: the boxes overlap. (${boxes[1][1]} is also in two boxes, but ${overlap} is smaller.)` };
  }),
  T(`${U}-a3`, "application", ["9Ss.03"], "Use percentages from a two-way table", () => {
    const [yes, no] = [r(5, 40), r(5, 40)], total = yes + no, p = frac(100 * yes, total);
    if (p.d !== 1 && ![2, 4, 5, 10, 20].includes(p.d)) return s9u6.find((t) => t.id === `${U}-a3`)!.make();
    return { prompt: `In a two-way table, ${yes} of the ${total} Stage 9 students said yes to walking to school and ${no} said no. What percentage said yes?`, answers: [ans((100 * yes) / total), `${ans((100 * yes) / total)}%`], hint: "Percentage = part ÷ whole × 100.", solution: `${yes} ÷ ${total} × 100 = ${fmt((100 * yes) / total)}%.` };
  }),
  T(`${U}-a4`, "application", ["9Ss.01"], "Choose data to test a hypothesis", () => {
    const [claim, right, wrong1, wrong2] = pick([
      ["taller students have longer arm spans", "each student's height and arm span", "each student's favourite sport", "the number of students in each class"],
      ["students who sleep more get higher test marks", "each student's hours of sleep and test mark", "each student's shoe size", "the colour of each student's bag"],
      ["older cars are worth less", "each car's age and value", "each car's colour", "the number of cars in the car park"],
    ] as const);
    const options = shuffle([right, wrong1, wrong2]), letter = "ABC"[options.indexOf(right)];
    return { prompt: `To test the hypothesis "${claim}", which data should be collected? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(". ")}.`, answers: [letter], hint: "You need paired data on both variables in the hypothesis.", solution: `${letter}: ${right}, so the two variables can be compared on a scatter graph.`, answerFormat: LETTER };
  }),
  T(`${U}-a5`, "application", ["9Ss.03"], "Predict from a line of best fit", () => {
    const m = r(2, 6), c = r(5, 30), x = r(3, 20), [xv, yv] = pick([["hours of revision", "test mark"], ["temperature (°C)", "ice creams sold"], ["age of a tree (years)", "height (dm)"]]);
    return { prompt: `The line of best fit on a scatter graph of ${yv} (y) against ${xv} (x) is y = ${linear(m, c)}. Use it to estimate y when x = ${x}.`, answers: [String(m * x + c)], hint: "Substitute the value of x into the equation of the line.", solution: `y = ${m} × ${x} + ${c} = ${m * x + c}.` };
  }),
  T(`${U}-a6`, "application", ["9Ss.02"], "Keep a sample in proportion", () => {
    for (;;) {
      const g = [50 * r(2, 8), 50 * r(2, 8), 50 * r(2, 8)], N = g[0] + g[1] + g[2], n = pick([30, 40, 50, 60, 80, 100]), i = r(0, 2);
      if ((g[i] * n) % N !== 0) continue;
      const names = ["Stage 7", "Stage 8", "Stage 9"];
      return { prompt: `A school has ${g[0]} Stage 7, ${g[1]} Stage 8 and ${g[2]} Stage 9 students. A sample of ${n} should have each stage in the same proportion as the school. How many ${names[i]} students should be chosen?`, answers: [String((g[i] * n) / N)], hint: `Find what fraction of the school is ${names[i]}.`, solution: `${names[i]} is ${g[i]} out of ${N}, so ${g[i]}/${N} × ${n} = ${(g[i] * n) / N}.` };
    }
  }),
  T(`${U}-a7`, "application", ["9Ss.03"], "Count values in a back-to-back stem-and-leaf diagram", () => {
    const d = backToBack(), group = pick(["A", "B"] as const), vals = group === "A" ? d.A : d.B, cut = vals[r(1, vals.length - 2)], n = vals.filter((v) => v > cut).length;
    return { prompt: `A back-to-back stem-and-leaf diagram shows: ${d.text}. How many values in group ${group} are greater than ${cut}?`, answers: [String(n)], hint: `Read group ${group}'s values in full: stem and leaf together.`, solution: `Group ${group}'s values above ${cut} are ${vals.filter((v) => v > cut).join(", ")}: ${n} values.` };
  }),
  T(`${U}-a8`, "application", ["9Ss.03"], "Choose a representation for an investigation", () => {
    const [task, chart, why] = pick([
      ["compare the distributions of two groups' reaction times, grouped in classes", "frequency polygon", "two frequency polygons can be drawn on the same axes"],
      ["compare the test marks of two classes, keeping every individual mark", "back-to-back stem-and-leaf diagram", "it shows both sets of values side by side"],
      ["see whether height is related to hand span", "scatter graph", "it shows whether two variables are related"],
      ["show how the number of visitors to a museum changed month by month", "time series graph", "it shows change over time"],
    ] as const);
    const choices = shuffle(["frequency polygon", "back-to-back stem-and-leaf diagram", "scatter graph", "time series graph"]), letter = "ABCD"[choices.indexOf(chart)];
    return { prompt: `Which representation is best to ${task}? ${choices.map((c, i) => `${"ABCD"[i]}: ${c}`).join(", ")}.`, answers: [letter], hint: "Think about whether you are comparing groups, looking for a relationship, or showing change over time.", solution: `${letter}: a ${chart}, because ${why}.`, answerFormat: LETTER };
  }),
  T(`${U}-a9`, "application", ["9Ss.02"], "Find a gap in response boxes", () => {
    const w = r(2, 4), a = r(0, 2), gapAt = a + w + 1;
    return { prompt: `A questionnaire asks "How many books did you read last month?" with the boxes ${a}–${a + w}, ${gapAt + 1}–${gapAt + 1 + w} and "more than ${gapAt + 1 + w}". Which whole number of books has no box?`, answers: [String(gapAt)], hint: "Check each whole number from the first box upwards.", solution: `The first box ends at ${a + w} and the next starts at ${gapAt + 1}, so ${gapAt} books has no box.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["9Ss.03"], "Identify an outlier on a scatter graph", () => {
    const m = r(2, 4), c = r(2, 10), xs = shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 6).sort((a, b) => a - b), k = r(1, 4);
    const pts = xs.map((x, i) => [x, m * x + c + (i === k ? pick([-1, 1]) * r(12, 18) : r(-1, 1))] as const);
    const [ox, oy] = pts[k];
    return { prompt: `These points are plotted on a scatter graph: ${pts.map(([x, y]) => `(${x}, ${fmt(y)})`).join(", ")}. Which point is an outlier?`, answers: [`(${ans(ox)}, ${ans(oy)})`, `${ans(ox)}, ${ans(oy)}`], hint: "Look for the point far from the pattern the others follow.", solution: `The others lie close to y ≈ ${linear(m, c)}; (${ox}, ${fmt(oy)}) is far from that pattern, so it is the outlier.`, answerFormat: "Enter the point as (x, y)." };
  }),
  T(`${U}-r2`, "reasoning", ["9Ss.02"], "Improve a data collection method", () => {
    const [problem, better, worse1, worse2] = pick([
      ["A survey on how residents feel about a new road is carried out only on weekday mornings.", "survey at different times and days, including weekends", "survey only on Monday mornings", "ask only the builders of the road"],
      ["A teacher wants to know how the whole school feels about uniforms but asks only their own class.", "choose students at random from every year group", "ask the same class again next week", "ask only the student council"],
      ["An online poll about internet use is used to estimate how many people use the internet.", "survey a random sample, including people offline", "run the online poll for longer", "ask only people on social media"],
    ] as const);
    const options = shuffle([better, worse1, worse2]), letter = "ABC"[options.indexOf(better)];
    return { prompt: `${problem} Which change would reduce the bias most? ${options.map((o, i) => `${"ABC"[i]}: ${o}`).join(". ")}.`, answers: [letter], hint: "A better sample represents the whole population.", solution: `${letter}: ${better}, so the sample represents the whole population better.`, answerFormat: LETTER };
  }),
  T(`${U}-r3`, "reasoning", ["9Ss.03"], "Find the modal class", () => {
    const w = pick([5, 10]), lo = w * r(2, 8), f = shuffle([r(2, 6), r(7, 10), r(11, 14), r(15, 20)]), i = f.indexOf(Math.max(...f));
    const table = f.map((v, k) => `${lo + k * w} ≤ t < ${lo + (k + 1) * w}: ${v}`).join("; ");
    return { prompt: `A frequency polygon is drawn from this table of times in seconds: ${table}. Which class is the modal class?`, answers: [`${lo + i * w} ≤ t < ${lo + (i + 1) * w}`, `${lo + i * w}-${lo + (i + 1) * w}`], hint: "The modal class has the highest frequency: the highest point on the polygon.", solution: `The highest frequency is ${f[i]}, for the class ${lo + i * w} ≤ t < ${lo + (i + 1) * w}.`, answerFormat: `Enter the class, for example ${lo} ≤ t < ${lo + w}.` };
  }),
  T(`${U}-r4`, "reasoning", ["9Ss.01", "9Ss.02"], "Plan a sample size", () => {
    const N = 50 * r(4, 24), pct = pick([5, 10, 20, 25]), n = (N * pct) / 100;
    return { prompt: `A student wants a ${pct}% sample of the ${N} people in a club. How many people should be in the sample?`, answers: [String(n)], hint: "Find the percentage of the whole population.", solution: `${pct}% of ${N} = ${N} × ${pct} ÷ 100 = ${n}.` };
  }),
  T(`${U}-r5`, "reasoning", ["9Ss.03"], "Work back from a line of best fit", () => {
    const m = r(2, 6), c = r(5, 30), x = r(3, 20);
    return { prompt: `The line of best fit on a scatter graph is y = ${linear(m, c)}. Estimate the value of x when y = ${m * x + c}.`, answers: [String(x)], hint: "Substitute y and solve for x.", solution: `${m}x + ${c} = ${m * x + c}, so ${m}x = ${m * x} and x = ${x}.` };
  }),
  T(`${U}-r6`, "reasoning", ["9Ss.02"], "Check whether a sample is in proportion", () => {
    const [a, b] = [100 * r(2, 6), 100 * r(2, 6)], n = pick([20, 40, 50]), fairA = (a * n) / (a + b);
    if (!Number.isInteger(fairA)) return s9u6.find((t) => t.id === `${U}-r6`)!.make();
    const ok = pick([true, false]), used = ok ? fairA : fairA + pick([-3, -2, 2, 3]);
    if (used <= 0 || used >= n) return s9u6.find((t) => t.id === `${U}-r6`)!.make();
    return { prompt: `A school has ${a} boys and ${b} girls. A sample of ${n} students contains ${used} boys. Is the sample in the same proportion as the school? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Work out how many boys a sample in proportion would contain.", solution: `In proportion: ${a}/${a + b} × ${n} = ${fairA} boys. The sample has ${used}, so ${ok ? "yes" : "no"}.`, answerFormat: YES_NO };
  }),
  T(`${U}-r7`, "reasoning", ["9Ss.03"], "Compare groups in a back-to-back stem-and-leaf diagram", () => {
    const d = backToBack(), ra = Math.max(...d.A) - Math.min(...d.A), rb = Math.max(...d.B) - Math.min(...d.B);
    if (ra === rb) return s9u6.find((t) => t.id === `${U}-r7`)!.make();
    const g = ra > rb ? "A" : "B";
    return { prompt: `A back-to-back stem-and-leaf diagram shows: ${d.text}. Which group has the larger range?`, answers: [g, `group ${g}`], hint: "Range = largest − smallest, for each group.", solution: `Range A = ${Math.max(...d.A)} − ${Math.min(...d.A)} = ${ra}. Range B = ${Math.max(...d.B)} − ${Math.min(...d.B)} = ${rb}. Group ${g} has the larger range.`, answerFormat: "Enter A or B." };
  }),
  T(`${U}-r8`, "reasoning", ["9Ss.03"], "Choose class widths for grouped data", () => {
    const k = pick([4, 5, 8, 10]), w = pick([2, 5, 10, 20]), lo = w * r(1, 5), hi = lo + k * w;
    return { prompt: `Continuous data from ${lo} up to (but not including) ${hi} is to be grouped into ${k} equal classes. What class width should be used?`, answers: [String(w)], hint: "Divide the whole range covered by the number of classes.", solution: `(${hi} − ${lo}) ÷ ${k} = ${w}.` };
  }),
];

