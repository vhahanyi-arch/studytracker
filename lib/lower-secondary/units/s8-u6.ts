// Stage 8, unit 6: Collecting data (8Ss.01, 8Ss.02, 8Ss.03).
import { T, type Template } from "../engine";
import { r, pick, shuffle, ordinal } from "../kit";

const U = "s8-u6";
const LETTER = "Enter the letter of your choice.";
const YES_NO = "Enter yes or no.";

type Kind = "categorical" | "discrete" | "continuous";
const VARIABLES: Array<[string, Kind]> = [
  ["the number of pets each student owns", "discrete"], ["the number of goals scored in each match", "discrete"],
  ["the number of siblings each student has", "discrete"], ["the number of letters in each student's first name", "discrete"],
  ["the number of cars passing the school each minute", "discrete"],
  ["the time each student takes to run 100 m", "continuous"], ["the height of each plant", "continuous"],
  ["the mass of each parcel", "continuous"], ["the temperature at noon each day", "continuous"], ["the length of each leaf", "continuous"],
  ["each student's favourite colour", "categorical"], ["the type of each car in a car park", "categorical"],
  ["each student's country of birth", "categorical"], ["the eye colour of each student", "categorical"], ["each student's favourite sport", "categorical"],
];
const WHY: Record<Kind, string> = {
  categorical: "it is described by words or categories, not numbers",
  discrete: "it is counted, so it can only take separate values such as 0, 1, 2",
  continuous: "it is measured, so it can take any value in a range",
};
// Survey questions that collect each kind of data.
const QUESTIONS: Record<Kind, string[]> = {
  categorical: ["What is your favourite fruit?", "How do you usually travel to school?", "Which month were you born in?", "What is your favourite subject?"],
  discrete: ["How many books did you read last month?", "How many people live in your home?", "How many times did you visit the library this term?", "How many text messages did you send yesterday?"],
  continuous: ["How long did your journey to school take today?", "What is your height?", "How far do you live from school?", "What is your mass?"],
};

type Method = "random" | "systematic" | "convenience";
const METHODS: Array<[string, Method]> = [
  ["Every student's name is put into a hat and 20 names are drawn out.", "random"],
  ["Each student is given a number, and a computer picks 30 numbers at random.", "random"],
  ["Numbered raffle tickets are shuffled and 25 are picked without looking.", "random"],
  ["The names are listed in order and every 10th name is chosen.", "systematic"],
  ["Starting with the 3rd person to arrive, every 5th person through the gate is asked.", "systematic"],
  ["From a list of houses, every 20th house on the list is visited.", "systematic"],
  ["The first 20 people to walk past the researcher are asked.", "convenience"],
  ["A student asks the friends sitting at their lunch table.", "convenience"],
  ["A teacher asks the students who happen to be in the library at break.", "convenience"],
];
const METHOD_WHY: Record<Method, string> = {
  random: "every member of the population has an equal chance of being chosen",
  systematic: "members are chosen at regular intervals from a list or a queue",
  convenience: "it uses whoever is easiest to reach",
};

const BIAS: Array<[string, boolean, string]> = [
  ["To find out how students travel to school, a teacher asks only the students on the school bus.", true, "students on the bus all travel by bus, so other ways of travelling are left out"],
  ["To find out how popular a sports club is, a researcher asks people leaving the club.", true, "people leaving the club are more likely to like it"],
  ["To find the favourite sport in a school, only members of the football team are asked.", true, "football players are more likely to choose football"],
  ["To find out how much time students spend reading, only students in the library are asked.", true, "students in the library are likely to read more than others"],
  ["To find out how students travel to school, 50 names are chosen at random from the school register.", false, "every student had an equal chance of being chosen"],
  ["To find the average height of Stage 8 students, every 5th name on the full Stage 8 register is chosen.", false, "the sample is spread evenly through the whole year group"],
  ["To find the favourite school lunch, 40 students are picked at random from a list of all students.", false, "every student had an equal chance of being chosen"],
];

// Pairs of survey questions for the same investigation: a vague one, and one that collects useful data.
const SURVEY: Array<[string, string, string]> = [
  ["exercise", "Do you exercise a lot?", "How many minutes did you exercise yesterday?"],
  ["sleep", "Do you get enough sleep?", "How many hours did you sleep last night, to the nearest half hour?"],
  ["reading", "Do you read often?", "How many books have you read this month?"],
  ["screen time", "Do you spend too long on screens?", "How many hours did you spend on screens yesterday?"],
  ["travel", "Is your journey to school long?", "How many minutes does your journey to school take?"],
  ["pocket money", "Do you get a lot of pocket money?", "How much pocket money did you get last week, in rand?"],
];

/** A pie-chart total that divides 360 so every sector is a whole number of degrees. */
const pieTotal = () => pick([18, 20, 24, 30, 36, 40, 45, 60, 72, 90, 120, 180]);
/** Values from a stem-and-leaf diagram, sorted, with the diagram as one line of text. */
function stemLeaf() {
  const rows = r(3, 4), first = r(1, 5);
  const values: number[] = [];
  for (let s = first; s < first + rows; s++) for (let k = r(2, 5); k > 0; k--) values.push(10 * s + r(0, 9));
  values.sort((a, b) => a - b);
  const lines: string[] = [];
  for (let s = first; s < first + rows; s++) lines.push(`${s} | ${values.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10).join(" ")}`);
  return { values, text: `${lines.join("; ")} (key: ${first} | 2 means ${first}2)` };
}

export const s8u6: Template[] = [
  // ---- foundational ----------------------------------------------------------
  T(`${U}-f1`, "foundational", ["8Ss.01"], "Classify data", () => {
    const [what, kind] = pick(VARIABLES);
    return { prompt: `A survey records ${what}. Is this data categorical, discrete or continuous?`, answers: [kind], hint: "Words are categorical; counts are discrete; measurements are continuous.", solution: `It is ${kind}: ${WHY[kind]}.`, answerFormat: "Enter categorical, discrete or continuous." };
  }),
  T(`${U}-f2`, "foundational", ["8Ss.03"], "Work out a pie chart angle", () => {
    const total = pieTotal(), n = r(2, total - 1), each = 360 / total;
    const what = pick(["walk to school", "chose football", "have a pet cat", "prefer apples", "voted for Ana"]);
    return { prompt: `In a survey of ${total} people, ${n} ${what}. What angle should their sector have in a pie chart, in degrees?`, answers: [String(n * each)], hint: "The whole pie is 360°. Work out how many degrees one person gets.", solution: `Each person gets 360° ÷ ${total} = ${each}°, so the sector is ${n} × ${each}° = ${n * each}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
  }),
  T(`${U}-f3`, "foundational", ["8Ss.03"], "Complete a two-way table", () => {
    const bw = r(3, 12), bn = r(3, 12), gw = r(3, 12), gn = r(3, 12);
    const total = bw + bn + gw + gn, boys = bw + bn;
    return { prompt: `A two-way table shows whether ${total} students walk to school. ${boys} of the students are boys. ${bw} boys walk and ${gw} girls walk. How many girls do not walk?`, answers: [String(gn)], hint: "Find the number of girls first.", solution: `Girls = ${total} − ${boys} = ${gw + gn}. Girls who do not walk = ${gw + gn} − ${gw} = ${gn}.` };
  }),
  T(`${U}-f4`, "foundational", ["8Ss.02"], "Set up a systematic sample", () => {
    const n = pick([10, 20, 25, 30, 40, 50]), k = pick([4, 5, 6, 8, 10, 12, 15, 20]), N = n * k;
    return { prompt: `A systematic sample of ${n} is taken from a list of ${N} names by choosing every kth name. What is k?`, answers: [String(k)], hint: "Share the list evenly among the people in the sample.", solution: `${N} ÷ ${n} = ${k}, so every ${k}th name is chosen.` };
  }),
  T(`${U}-f5`, "foundational", ["8Ss.02"], "Name a sampling method", () => {
    const [description, method] = pick(METHODS);
    return { prompt: `${description} Is this a random, systematic or convenience sample?`, answers: method === "convenience" ? [method, "opportunity"] : [method], hint: "Random: equal chances. Systematic: regular intervals. Convenience: whoever is easiest.", solution: `It is a ${method} sample: ${METHOD_WHY[method]}.`, answerFormat: "Enter random, systematic or convenience." };
  }),
  T(`${U}-f6`, "foundational", ["8Ss.03"], "Place a value in a class", () => {
    const width = pick([5, 10]), start = pick([130, 140, 150]), lo = start + width * r(0, 3), hi = lo + width;
    const v = lo + (pick([true, false]) ? 0 : r(1, width - 1));
    return { prompt: `Heights are grouped in classes ${start} ≤ h < ${start + width}, ${start + width} ≤ h < ${start + 2 * width}, and so on. Which class does a height of ${v} cm go into?`, answers: [`${lo} ≤ h < ${hi}`], hint: "≤ means the lower end is included; < means the upper end is not.", solution: `${lo} ≤ ${v} < ${hi}, so it goes in the class ${lo} ≤ h < ${hi}.`, answerFormat: `Enter the class, for example ${start} ≤ h < ${start + width}. You may type <= for ≤.` };
  }),
  T(`${U}-f7`, "foundational", ["8Ss.01"], "Choose a survey question that collects useful data", () => {
    const [topic, vague, clear] = pick(SURVEY), clearFirst = pick([true, false]);
    const [A, B] = clearFirst ? [clear, vague] : [vague, clear];
    const letter = clearFirst ? "A" : "B";
    return { prompt: `Two survey questions are suggested for an investigation into ${topic}. A: "${A}" B: "${B}" Which question collects more useful data?`, answers: [letter], hint: "Words like \"a lot\" or \"often\" mean different things to different people.", solution: `${letter}: "${clear}" gives an answer that can be measured and compared, while the answer to "${vague}" depends on each person's opinion.`, answerFormat: LETTER };
  }),
  T(`${U}-f8`, "foundational", ["8Ss.03"], "Read a frequency from a pie chart", () => {
    const total = pieTotal(), each = 360 / total, n = r(2, total - 1);
    return { prompt: `A pie chart shows the choices of ${total} people. One sector has an angle of ${n * each}°. How many people does it represent?`, answers: [String(n)], hint: "Each person is represented by 360° ÷ the total.", solution: `Each person = 360° ÷ ${total} = ${each}°, so ${n * each}° ÷ ${each}° = ${n} people.` };
  }),
  T(`${U}-f9`, "foundational", ["8Ss.02"], "Spot a biased sample", () => {
    const [description, biased, why] = pick(BIAS);
    return { prompt: `${description} Is this sample likely to be biased? Answer yes or no.`, answers: [biased ? "yes" : "no"], hint: "A biased sample leaves out, or over-represents, part of the population.", solution: `${biased ? "Yes" : "No"}: ${why}.`, answerFormat: YES_NO };
  }),

  // ---- application -----------------------------------------------------------
  T(`${U}-a1`, "application", ["8Ss.03"], "Work out a pie chart angle from a table", () => {
    const total = pieTotal(), each = 360 / total;
    const a = r(1, total - 3), b = r(1, total - a - 2), c = total - a - b;
    const labels = shuffle(["bus", "car", "walk", "bicycle", "taxi"]).slice(0, 3), i = r(0, 2), f = [a, b, c][i];
    return { prompt: `A survey asked how people travel to work: ${labels[0]} ${a}, ${labels[1]} ${b}, ${labels[2]} ${c}. What angle should the ${labels[i]} sector have in a pie chart, in degrees?`, answers: [String(f * each)], hint: "Find the total first, then the angle for one person.", solution: `Total = ${a} + ${b} + ${c} = ${total}. Each person = 360° ÷ ${total} = ${each}°. ${labels[i][0].toUpperCase() + labels[i].slice(1)}: ${f} × ${each}° = ${f * each}°.`, answerFormat: "Enter the angle in degrees. The ° sign is optional." };
  }),
  T(`${U}-a2`, "application", ["8Ss.03"], "Complete a two-way table with three columns", () => {
    const cells = [[r(2, 12), r(2, 12), r(2, 12)], [r(2, 12), r(2, 12), r(2, 12)]];
    const [cols, rows] = [["tennis", "swimming", "running"], ["Stage 8", "Stage 9"]];
    const i = r(0, 1), j = r(0, 2), rowTotal = cells[i].reduce((s, v) => s + v, 0);
    const known = cells[i].map((v, k) => (k === j ? null : `${v} chose ${cols[k]}`)).filter(Boolean).join(" and ");
    return { prompt: `A two-way table shows the favourite sport of ${rowTotal} ${rows[i]} students. ${known}. The rest chose ${cols[j]}. How many ${rows[i]} students chose ${cols[j]}?`, answers: [String(cells[i][j])], hint: "The row must add up to the row total.", solution: `${rowTotal} − ${cells[i].filter((_, k) => k !== j).join(" − ")} = ${cells[i][j]}.` };
  }),
  T(`${U}-a3`, "application", ["8Ss.02"], "Continue a systematic sample", () => {
    const k = pick([5, 8, 10, 12, 15, 20, 25]), start = r(1, k), nth = r(3, 8);
    return { prompt: `A systematic sample starts with the ${ordinal(start)} name on a list and then takes every ${ordinal(k)} name. Which position on the list is the ${ordinal(nth)} name chosen?`, answers: [String(start + (nth - 1) * k)], hint: "After the first name, add the interval once for each further name.", solution: `${start} + ${nth - 1} × ${k} = ${start + (nth - 1) * k}.` };
  }),
  T(`${U}-a4`, "application", ["8Ss.03"], "Choose a suitable chart", () => {
    const [situation, chart, why] = pick([
      ["how the temperature changed through one day", "line graph", "it shows change over time"],
      ["the monthly rainfall in a town over a year", "line graph", "it shows change over time"],
      ["what fraction of a class chose each flavour of ice cream", "pie chart", "it shows how a whole is split into parts"],
      ["how a family's budget is split between rent, food, transport and savings", "pie chart", "it shows how a whole is split into parts"],
      ["whether taller students tend to have longer arm spans", "scatter graph", "it shows whether two variables are related"],
      ["whether hours of revision are related to test marks", "scatter graph", "it shows whether two variables are related"],
      ["how many students chose each of five sports", "bar chart", "it compares frequencies of separate categories"],
    ] as const);
    return { prompt: `Which is the most suitable chart to show ${situation}: a bar chart, a line graph, a pie chart or a scatter graph?`, answers: [chart, `a ${chart}`], hint: "Think about what the chart needs to show: categories, parts of a whole, change over time, or a relationship.", solution: `A ${chart}, because ${why}.`, answerFormat: "Enter the name of the chart." };
  }),
  T(`${U}-a5`, "application", ["8Ss.03"], "Group continuous data", () => {
    const width = 10, lo = pick([30, 40, 50]), values: number[] = [];
    for (let i = 0; i < 12; i++) values.push(r(lo - 10, lo + 19) + pick([0, 0.5]));
    const inClass = values.filter((v) => v >= lo && v < lo + width);
    if (inClass.length === 0) return s8u6.find((t) => t.id === `${U}-a5`)!.make();
    return { prompt: `The masses of 12 parcels, in kg, are: ${values.join(", ")}. How many belong in the class ${lo} ≤ m < ${lo + width}?`, answers: [String(inClass.length)], hint: `Include ${lo} itself, but not ${lo + width}.`, solution: `The masses from ${lo} up to (but not including) ${lo + width} are ${inClass.join(", ")}: that is ${inClass.length}.` };
  }),
  T(`${U}-a6`, "application", ["8Ss.02"], "Choose the more representative sample", () => {
    const [good, bad] = pick([
      ["picking 60 students at random from the whole school register", "asking 60 students in the school football team"],
      ["choosing every 10th name from a list of all the school's students", "asking the first 60 students to arrive in the morning"],
      ["picking 40 students at random from every year group", "asking 40 students from one class"],
      ["drawing 50 names at random from all the town's households", "asking 50 shoppers at one shop on a Monday morning"],
    ] as const);
    const goodFirst = pick([true, false]), letter = goodFirst ? "A" : "B";
    return { prompt: `To find out about all the students in a school or town, which sample is more likely to represent the whole population? A: ${goodFirst ? good : bad}. B: ${goodFirst ? bad : good}.`, answers: [letter], hint: "A good sample gives every group a fair chance of being included.", solution: `${letter}: ${good} gives everyone a fair chance of being chosen, while ${bad} leaves out many people.`, answerFormat: LETTER };
  }),
  T(`${U}-a7`, "application", ["8Ss.03"], "Read a stem-and-leaf diagram", () => {
    const s = stemLeaf(), ask = pick(["largest", "smallest", "count"] as const);
    if (ask === "count") {
      const cut = s.values[r(1, 3)], n = s.values.filter((v) => v > cut).length;
      return { prompt: `A stem-and-leaf diagram shows: ${s.text}. How many values are greater than ${cut}?`, answers: [String(n)], hint: "Read each leaf with its stem to get the full value.", solution: `The values greater than ${cut} are ${s.values.filter((v) => v > cut).join(", ")}, so there are ${n}.` };
    }
    const v = ask === "largest" ? s.values[s.values.length - 1] : s.values[0];
    return { prompt: `A stem-and-leaf diagram shows: ${s.text}. What is the ${ask} value?`, answers: [String(v)], hint: `The ${ask} value is at the ${ask === "largest" ? "end of the last" : "start of the first"} row.`, solution: `The ${ask} value is ${v}.` };
  }),
  T(`${U}-a8`, "application", ["8Ss.03"], "Read a time series", () => {
    const months = ["January", "February", "March", "April", "May", "June"], sales = months.map(() => 10 * r(3, 12));
    const rises = sales.slice(1).map((v, i) => v - sales[i]);
    const best = Math.max(...rises);
    if (best <= 0) return s8u6.find((t) => t.id === `${U}-a8`)!.make();
    const at = rises.indexOf(best);
    return { prompt: `A shop's sales each month were: ${months.map((m, i) => `${m} ${sales[i]}`).join(", ")}. What was the largest increase from one month to the next?`, answers: [String(best)], hint: "Work out the change between each pair of neighbouring months.", solution: `The largest rise is from ${months[at]} to ${months[at + 1]}: ${sales[at + 1]} − ${sales[at]} = ${best}.` };
  }),
  T(`${U}-a9`, "application", ["8Ss.02"], "Work out a sample size", () => {
    const pct = pick([5, 10, 15, 20, 25]), N = 20 * r(5, 40), n = (N * pct) / 100;
    if (!Number.isInteger(n)) return s8u6.find((t) => t.id === `${U}-a9`)!.make();
    return { prompt: `A school has ${N} students. A survey will sample ${pct}% of them. How many students should be in the sample?`, answers: [String(n)], hint: "Find the percentage of the whole population.", solution: `${pct}% of ${N} = ${N} × ${pct} ÷ 100 = ${n} students.` };
  }),

  // ---- reasoning -------------------------------------------------------------
  T(`${U}-r1`, "reasoning", ["8Ss.03"], "Find the total from a pie chart sector", () => {
    const total = pieTotal(), each = 360 / total, n = r(2, total - 1);
    return { prompt: `In a pie chart, the sector for "walk" has an angle of ${n * each}° and represents ${n} students. How many students are shown in the whole pie chart?`, answers: [String(total)], hint: "Find how many degrees one student gets, then how many students fit into 360°.", solution: `Each student = ${n * each}° ÷ ${n} = ${each}°, so the total is 360° ÷ ${each}° = ${total} students.` };
  }),
  T(`${U}-r2`, "reasoning", ["8Ss.03"], "Complete a two-way table from fractions", () => {
    const boys = r(5, 15), girls = 2 * boys, total = 3 * boys, boysChess = r(1, boys - 1), chess = boysChess + r(1, girls - 1);
    return { prompt: `There are ${total} students in a club, and two-thirds of them are girls. ${chess} students play chess, and ${boysChess} of these are boys. How many girls do not play chess?`, answers: [String(girls - (chess - boysChess))], hint: "Find the number of girls, then the number of girls who play chess.", solution: `Girls = ${girls}. Girls who play chess = ${chess} − ${boysChess} = ${chess - boysChess}. Girls who do not = ${girls} − ${chess - boysChess} = ${girls - (chess - boysChess)}.` };
  }),
  T(`${U}-r3`, "reasoning", ["8Ss.02"], "Check whether a name is in a systematic sample", () => {
    const k = pick([10, 12, 15, 20, 25]), start = r(1, k - 1), ok = pick([true, false]);
    let pos = start + k * r(3, 12);
    if (!ok) pos += r(1, k - 1);
    return { prompt: `A systematic sample takes every ${k}th name, starting with name number ${start}. Is name number ${pos} in the sample? Answer yes or no.`, answers: [ok ? "yes" : "no"], hint: "Chosen names are the first one plus a whole number of intervals.", solution: ok ? `Yes: ${pos} − ${start} = ${pos - start} = ${(pos - start) / k} × ${k}.` : `No: ${pos} − ${start} = ${pos - start}, which is not a multiple of ${k}.`, answerFormat: YES_NO };
  }),
  T(`${U}-r4`, "reasoning", ["8Ss.02"], "Keep a sample in proportion", () => {
    for (;;) {
      const a = 50 * r(2, 12), b = 50 * r(2, 12), n = pick([20, 25, 40, 50, 60, 80, 100]);
      if ((b * n) % (a + b) !== 0) continue;
      const [first, second] = pick([["boys", "girls"], ["Stage 8 students", "Stage 9 students"], ["day students", "boarders"]]);
      return { prompt: `A school has ${a} ${first} and ${b} ${second}. A sample of ${n} should have ${first} and ${second} in the same proportion as the school. How many ${second} should be in the sample?`, answers: [String((b * n) / (a + b))], hint: `Find what fraction of the school are ${second}.`, solution: `${second[0].toUpperCase() + second.slice(1)} are ${b} out of ${a + b}, so the sample needs ${b}/${a + b} × ${n} = ${(b * n) / (a + b)}.` };
    }
  }),
  T(`${U}-r5`, "reasoning", ["8Ss.03"], "Compare two pie charts", () => {
    const [t1, t2] = shuffle([36, 40, 60, 72, 90, 120, 180]).slice(0, 2);
    const n1 = r(2, t1 - 1), n2 = r(2, t2 - 1);
    if (n1 === n2) return s8u6.find((t) => t.id === `${U}-r5`)!.make();
    const [a1, a2] = [(n1 * 360) / t1, (n2 * 360) / t2];
    return { prompt: `Pie chart A shows ${t1} people, and its football sector is ${a1}°. Pie chart B shows ${t2} people, and its football sector is ${a2}°. How many more people chose football in the chart with more football fans?`, answers: [String(Math.abs(n1 - n2))], hint: "A bigger angle does not always mean more people: convert each angle to a number of people.", solution: `A: ${a1}° ÷ 360° × ${t1} = ${n1} people. B: ${a2}° ÷ 360° × ${t2} = ${n2} people. Difference = ${Math.abs(n1 - n2)}.` };
  }),
  T(`${U}-r6`, "reasoning", ["8Ss.01"], "Find the question that collects a type of data", () => {
    const kinds: Kind[] = ["categorical", "discrete", "continuous"], want = pick(kinds);
    const options = shuffle(kinds.map((k) => [k, pick(QUESTIONS[k])] as const));
    const letter = "ABC"[options.findIndex(([k]) => k === want)];
    return { prompt: `Here are three survey questions. ${options.map(([, q], i) => `${"ABC"[i]}: "${q}"`).join(" ")} Which one collects ${want} data?`, answers: [letter], hint: "Words are categorical; counts are discrete; measurements are continuous.", solution: `${letter}: its answers are ${want}, because ${WHY[want]}.`, answerFormat: LETTER };
  }),
  T(`${U}-r7`, "reasoning", ["8Ss.03"], "Count values in a range from a stem-and-leaf diagram", () => {
    const s = stemLeaf(), lo = s.values[r(1, 3)], hi = s.values[s.values.length - r(2, 4)];
    if (lo >= hi) return s8u6.find((t) => t.id === `${U}-r7`)!.make();
    const inside = s.values.filter((v) => v >= lo && v <= hi);
    return { prompt: `A stem-and-leaf diagram shows: ${s.text}. How many values are from ${lo} to ${hi} inclusive?`, answers: [String(inside.length)], hint: "Inclusive means the end values count too.", solution: `The values from ${lo} to ${hi} are ${inside.join(", ")}: ${inside.length} values.` };
  }),
  T(`${U}-r8`, "reasoning", ["8Ss.03"], "Find a total from a frequency table", () => {
    const f = [r(1, 6), r(2, 8), r(2, 8), r(1, 6), r(0, 4)], total = f.reduce((s, v, x) => s + v * x, 0);
    const [what, heading, ask] = pick([
      ["goals scored in each match", "Goals", "How many goals were scored altogether?"],
      ["siblings each student has", "Siblings", "How many siblings do the students have altogether?"],
      ["pets each student owns", "Pets", "How many pets do the students own altogether?"],
    ]);
    return { prompt: `A frequency table shows the number of ${what}. ${heading}: 0, 1, 2, 3, 4. Frequency: ${f.join(", ")}. ${ask}`, answers: [String(total)], hint: "Multiply each value by its frequency, then add.", solution: `${f.map((v, x) => `${x} × ${v}`).join(" + ")} = ${total}.` };
  }),
];
