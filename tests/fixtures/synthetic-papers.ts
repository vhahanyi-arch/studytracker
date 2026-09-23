// Made-up question papers and mark schemes laid out like Cambridge ones, so
// lib/cambridge-analysis.ts can be tested in CI without committing licensed
// papers. The questions are invented; only the geometry follows the real
// papers: positions measured from 0580, 0625 and 9702 papers (question numbers
// at x 49.6, parts at 72.3, roman subparts right-aligned near 96, marks in
// brackets at 532; each scheme type's column positions as measured).
//
// Each set records what a correct reading must produce, so the tests check
// exact labels, marks and answers rather than only coverage.
import { A4, A4_LANDSCAPE, type Page, type Run } from "./synthetic-pdf";
import type { CambridgePaperMode, CambridgeSubject } from "@/lib/cambridge-analysis";

export type SyntheticSet = {
  name: string;
  subject: CambridgeSubject;
  mode: CambridgePaperMode;
  paper: Page[];
  scheme: Page[];
  expected: Array<{ label: string; marks: number; answer: string; page: number }>;
};

const DOTS = "................................................";
const text = (top: number, x: number, value: string, bold = false): Run => ({ text: value, x, top, bold });
const footer = (code: string): Run => ({ text: `Synthetic fixture ${code}  [Turn over`, x: 380, top: 815, size: 8 });

// A question-paper row: optional number, part and roman subpart, then the text.
function ask(top: number, labels: { main?: string; part?: string; roman?: string }, value: string): Run[] {
  const runs: Run[] = [];
  if (labels.main) runs.push(text(top, 49.6, labels.main, true));
  if (labels.part) runs.push(text(top, 72.3, `(${labels.part})`, true));
  // Roman numerals are right-aligned, so wider ones start further left.
  if (labels.roman) runs.push(text(top, labels.roman.length > 1 ? 92.9 : 96, `(${labels.roman})`, true));
  runs.push(text(top, labels.roman ? 118 : labels.part || labels.main ? 95 : 72.3, value));
  return runs;
}
const answerLine = (top: number, marks: number, prefix = ""): Run[] => [
  ...(prefix ? [text(top, 240, prefix)] : []),
  text(top, 300, DOTS),
  text(top, 532.3, `[${marks}]`),
];

function cover(code: string, title: string, totalMarks: number): Page {
  return {
    ...A4,
    runs: [
      text(90, 49.6, "Synthetic Fixture Examinations", true),
      text(130, 49.6, title, true),
      text(150, 460, code),
      // Metadata in the question-number margin: the parser must skip cover pages.
      text(180, 49.6, "1 hour 30 minutes"),
      text(230, 49.6, "You must answer on the question paper."),
      text(300, 49.6, "INSTRUCTIONS", true),
      text(320, 60, "Answer all questions."),
      text(380, 49.6, "INFORMATION", true),
      text(400, 60, `The total mark for this paper is ${totalMarks}.`),
      text(420, 60, "The number of marks for each question or part question is shown in brackets [ ]."),
      footer(code),
    ],
  };
}
const blank = (code: string): Page => ({ ...A4, runs: [text(420, 260, "BLANK PAGE", true), footer(code)] });

// A mark-scheme table row: label, answer, marks and (maths) partial marks.
type Cols = { question: number; answer: number; marks: number; partial?: number; header: { question: number; answer: number; marks: number; partial?: number } };
function header(top: number, c: Cols): Run[] {
  return [
    text(top, c.header.question, "Question", true),
    text(top, c.header.answer, "Answer", true),
    text(top, c.header.marks, "Marks", true),
    ...(c.header.partial !== undefined ? [text(top, c.header.partial, "Partial Marks", true)] : []),
  ];
}
function row(top: number, c: Cols, cells: { label?: string; answer?: string; marks?: string; partial?: string }): Run[] {
  const runs: Run[] = [];
  if (cells.label) runs.push(text(top, c.question, cells.label));
  if (cells.answer) runs.push(text(top, c.answer, cells.answer));
  if (cells.marks) runs.push(text(top, c.marks, cells.marks));
  if (cells.partial && c.partial !== undefined) runs.push(text(top, c.partial, cells.partial));
  return runs;
}
function table(c: Cols, startTop: number, rows: Array<Parameters<typeof row>[2]>, pitch = 24.5): Run[] {
  return [...header(startTop, c), ...rows.flatMap((cells, index) => row(startTop + 24 + index * pitch, c, cells))];
}
const schemeTitle = (code: string, title: string, max: number): Page => ({
  ...A4,
  runs: [text(90, 49.6, "Synthetic Fixture Examinations", true), text(130, 49.6, title, true), text(150, 460, code), text(200, 49.6, `Maximum Mark: ${max}`), text(240, 49.6, "Published mark scheme (fixture)")],
});

// ── 1. Mathematics, structured (0580-like portrait scheme) ──────────────────
const MATHS: Cols = { question: 67.7, answer: 111.7, marks: 367.5, partial: 383.9, header: { question: 55.5, answer: 201.7, marks: 340.2, partial: 383.9 } };
export const mathsStructured: SyntheticSet = {
  name: "Mathematics, structured",
  subject: "Mathematics",
  mode: "structured",
  paper: [
    cover("0999/12", "MATHEMATICS Paper 1", 24),
    {
      ...A4,
      runs: [
        ...ask(72.6, { main: "1", part: "a" }, "Write 0.375 as a fraction in its simplest form."),
        ...answerLine(120, 1),
        ...ask(160, { part: "b" }, "Work out 15% of 240."),
        ...answerLine(205, 1),
        ...ask(245, { part: "c" }, "Round 4.0671 to 2 decimal places."),
        ...answerLine(290, 1),
        ...ask(340, { main: "2", part: "a" }, "Solve 5x - 7 = 18."),
        ...answerLine(400, 2, "x ="),
        ...ask(450, { part: "b" }, "Expand and simplify 3(x + 4) - 2(x - 1)."),
        ...answerLine(520, 2),
        footer("0999/12"),
      ],
    },
    {
      ...A4,
      runs: [
        ...ask(72.6, { main: "3", part: "a" }, "The numbers of goals scored in four matches are shown in the table."),
        // A table and an axis label inside the question: numbers and words in
        // the label margin that are not question numbers.
        text(100, 95, "Goals"), text(100, 150, "4"), text(100, 200, "7"), text(100, 250, "9"), text(100, 300, "12"),
        text(125, 58, "10"),
        ...ask(150, { roman: "i" }, "Find the mean."),
        ...answerLine(195, 1),
        ...ask(235, { roman: "ii" }, "Find the range."),
        ...answerLine(280, 1),
        ...ask(330, { part: "b" }, "The probability that a bus is late is 0.65. Find the probability that it is not late."),
        ...answerLine(390, 2),
        ...ask(440, { main: "4" }, "Calculate the area of a circle with radius 5 cm."),
        ...answerLine(500, 2, "cm2"),
        footer("0999/12"),
      ],
    },
    {
      ...A4,
      runs: [
        ...ask(72.6, { main: "5", part: "a" }, "Write down the next term of the sequence 3, 7, 11, 15, ..."),
        ...answerLine(120, 1),
        ...ask(160, { part: "b" }, "Find an expression for the nth term of this sequence."),
        ...answerLine(220, 2),
        footer("0999/12"),
      ],
    },
    blank("0999/12"),
  ],
  scheme: [
    schemeTitle("0999/12", "MATHEMATICS Paper 1 Mark Scheme", 24),
    {
      // Marking guidance with a worked sample row. It looks like a real row
      // labelled 5, and must not become one.
      ...A4,
      runs: [
        text(66, 55.5, "General guidance on marking", true),
        text(90, 55.5, "Marks are awarded as shown in the table. For example:"),
        ...table(MATHS, 130, [{ label: "5", answer: "12.5", marks: "2", partial: "M1 for 25 / 2" }]),
      ],
    },
    {
      ...A4,
      runs: table(MATHS, 66.1, [
        { label: "1(a)", answer: "3/8", marks: "1" },
        { label: "1(b)", answer: "36", marks: "1" },
        { label: "1(c)", answer: "4.07", marks: "1" },
        { label: "2(a)", answer: "5", marks: "2", partial: "M1 for 5x = 25 or better" },
        { label: "2(b)", answer: "x + 14", marks: "2", partial: "B1 for 3x + 12 or -2x + 2" },
        { partial: "or for x + k" },
        { label: "3(a)(i)", answer: "8", marks: "1" },
        { label: "3(a)(ii)", answer: "8", marks: "1" },
        { label: "3(b)", answer: "0.35 oe", marks: "2", partial: "M1 for 1 - 0.65" },
      ]),
    },
    {
      ...A4,
      runs: table(MATHS, 66.1, [
        { label: "4", answer: "78.5 or 78.53 to 78.54", marks: "2", partial: "M1 for pi x 5^2" },
        { label: "5(a)", answer: "19", marks: "1" },
        { label: "5(b)", answer: "4n - 1 oe", marks: "2", partial: "B1 for 4n + k" },
      ]),
    },
  ],
  expected: [
    { label: "1(a)", marks: 1, answer: "3/8", page: 2 },
    { label: "1(b)", marks: 1, answer: "36", page: 2 },
    { label: "1(c)", marks: 1, answer: "4.07", page: 2 },
    { label: "2(a)", marks: 2, answer: "5", page: 2 },
    { label: "2(b)", marks: 2, answer: "x + 14", page: 2 },
    { label: "3(a)(i)", marks: 1, answer: "8", page: 3 },
    { label: "3(a)(ii)", marks: 1, answer: "8", page: 3 },
    { label: "3(b)", marks: 2, answer: "0.35", page: 3 },
    { label: "4", marks: 2, answer: "78.5 or 78.53 to 78.54", page: 3 },
    { label: "5(a)", marks: 1, answer: "19", page: 4 },
    { label: "5(b)", marks: 2, answer: "4n - 1", page: 4 },
  ],
};

// ── 2. Physics, multiple choice (0625-like) ─────────────────────────────────
const MCQ: Cols = { question: 78.4, answer: 118.8, marks: 534.2, header: { question: 57.7, answer: 284.9, marks: 505 } };
const MCQ_KEY = ["B", "C", "D", "C", "A", "A", "D", "B", "C", "A"];
const MCQ_STEMS = [
  "Which quantity is a vector?", "A car travels 120 m in 8.0 s. What is its average speed?",
  "Which unit is used for energy?", "What is the weight of a 2.0 kg mass on Earth?",
  "Which change increases the pressure of a gas at constant volume?", "Which wave is longitudinal?",
  "What is the resistance of a lamp with 6.0 V across it and 0.50 A through it?",
  "Which particle has a negative charge?", "Which material is a good thermal insulator?",
  "What is the frequency of a wave with period 0.02 s?",
];
function mcqPage(first: number, count: number): Page {
  const runs: Run[] = [];
  for (let i = 0; i < count; i++) {
    const n = first + i, top = 72.6 + i * 145;
    runs.push(...ask(top, { main: String(n) }, MCQ_STEMS[n - 1]));
    // Answer options, and in question 7 a numeric table, sit inside the
    // label margin without being question labels.
    ["A", "B", "C", "D"].forEach((letter, k) => runs.push(text(top + 30 + k * 22, 85, letter, true), text(top + 30 + k * 22, 107, `option ${letter.toLowerCase()}`)));
    if (n === 7) runs.push(text(top + 20, 60, "40"), text(top + 20, 118, "12"));
  }
  runs.push(footer("0999/11"));
  return { ...A4, runs };
}
export const physicsMultipleChoice: SyntheticSet = {
  name: "Physics, multiple choice",
  subject: "Physics",
  mode: "multiple_choice",
  paper: [cover("0999/11", "PHYSICS Paper 1 Multiple Choice", 10), mcqPage(1, 5), mcqPage(6, 5)],
  scheme: [
    schemeTitle("0999/11", "PHYSICS Paper 1 Mark Scheme", 10),
    { ...A4, runs: table(MCQ, 78.8, MCQ_KEY.map((answer, i) => ({ label: String(i + 1), answer, marks: "1" }))) },
  ],
  expected: MCQ_KEY.map((answer, i) => ({ label: String(i + 1), marks: 1, answer, page: i < 5 ? 2 : 3 })),
};

// ── 3. AS Physics, structured (9702-like landscape scheme, coded marks) ─────
const AS: Cols = { question: 80, answer: 127.6, marks: 760.4, header: { question: 68.5, answer: 408.4, marks: 741.3 } };
const landscape = (runs: Run[]): Page => ({ ...A4_LANDSCAPE, runs });
export const asPhysicsStructured: SyntheticSet = {
  name: "AS Physics, structured",
  subject: "Physics",
  mode: "structured",
  paper: [
    cover("0999/22", "PHYSICS Paper 2 AS Level Structured Questions", 13),
    {
      ...A4,
      runs: [
        ...ask(72.6, { main: "1", part: "a" }, "State what is meant by a vector quantity."),
        ...answerLine(120, 1),
        ...ask(163.6, { part: "b" }, "A trolley accelerates uniformly from rest to 6.0 m/s in 4.0 s. Calculate its acceleration."),
        ...answerLine(240, 2, "acceleration ="),
        ...ask(300, { main: "2", part: "a" }, "Define power."),
        ...answerLine(345, 1),
        ...ask(390, { part: "b" }, "A motor lifts a load of weight 300 N through a height of 2.0 m in 5.0 s."),
        ...ask(430, { roman: "i" }, "Calculate the work done on the load."),
        ...answerLine(490, 2, "work done ="),
        ...ask(540, { roman: "ii" }, "Calculate the useful power output of the motor."),
        ...answerLine(600, 2, "power ="),
        footer("0999/22"),
      ],
    },
    {
      ...A4,
      runs: [
        ...ask(72.6, { main: "3", part: "a" }, "Sketch the I-V characteristic of a filament lamp on the axes."),
        text(110, 118, "I"), text(250, 300, "V"),
        text(290, 532.3, "[2]"),
        ...ask(330, { part: "b" }, "Show that the resistance of the lamp at 4.0 V and 0.50 A is 8.0 ohm."),
        ...answerLine(400, 2),
        footer("0999/22"),
      ],
    },
  ],
  scheme: [
    schemeTitle("0999/22", "PHYSICS Paper 2 Mark Scheme", 13),
    landscape([
      ...header(66.1, AS),
      ...row(90, AS, { label: "1(a)", answer: "quantity with magnitude and direction", marks: "B1" }),
      ...row(115, AS, { label: "1(b)", answer: "a = (v - u) / t", marks: "C1" }),
      ...row(127, AS, { answer: "a = 6.0 / 4.0 = 1.5 m s-2", marks: "A1" }),
      ...row(152, AS, { label: "2(a)", answer: "work done per unit time", marks: "B1" }),
      ...row(164, AS, { answer: "or rate of transfer of energy" }),
      // A second table on the same page, as the real schemes have.
      ...header(282, AS),
      ...row(307, AS, { label: "2(b)(i)", answer: "W = Fs = 300 x 2.0", marks: "C1" }),
      ...row(320, AS, { answer: "= 600 J", marks: "A1" }),
      ...row(345, AS, { label: "2(b)(ii)", answer: "P = W / t = 600 / 5.0", marks: "C1" }),
      ...row(358, AS, { answer: "= 120 W", marks: "A1" }),
    ]),
    // 3(a) runs over a page break, and the next page repeats its label, as
    // real schemes do. The two halves are one question.
    landscape([
      ...header(66.1, AS),
      ...row(520, AS, { label: "3(a)", answer: "curve through the origin", marks: "B1" }),
    ]),
    landscape([
      ...header(66.1, AS),
      ...row(90, AS, { label: "3(a)", answer: "gradient decreasing as V increases", marks: "B1" }),
      ...row(115, AS, { label: "3(b)", answer: "R = V / I", marks: "C1" }),
      ...row(128, AS, { answer: "= 4.0 / 0.50 = 8.0 ohm", marks: "A1" }),
    ]),
  ],
  expected: [
    { label: "1(a)", marks: 1, answer: "quantity with magnitude and direction", page: 2 },
    { label: "1(b)", marks: 2, answer: "a = 6.0 / 4.0 = 1.5 m s-2", page: 2 },
    { label: "2(a)", marks: 1, answer: "work done per unit time", page: 2 },
    { label: "2(b)(i)", marks: 2, answer: "= 600 J", page: 2 },
    { label: "2(b)(ii)", marks: 2, answer: "= 120 W", page: 2 },
    { label: "3(a)", marks: 2, answer: "curve through the origin", page: 3 },
    { label: "3(b)", marks: 2, answer: "= 4.0 / 0.50 = 8.0 ohm", page: 3 },
  ],
};

// ── 4. A landscape table stored as rotated text on a portrait page ──────────
const ROT: Cols = { question: 80, answer: 130, marks: 720, header: { question: 60, answer: 300, marks: 700 } };
const ROT_KEY = ["D", "A", "C", "B", "B"];
export const rotatedScheme: SyntheticSet = {
  name: "Multiple choice with a rotated scheme table",
  subject: "Physics",
  mode: "multiple_choice",
  paper: [cover("0999/13", "PHYSICS Paper 1 Multiple Choice", 5), mcqPage(1, 5)],
  scheme: [
    schemeTitle("0999/13", "PHYSICS Paper 1 Mark Scheme", 5),
    { ...A4, runs: table(ROT, 70, ROT_KEY.map((answer, i) => ({ label: String(i + 1), answer, marks: "1" }))).map((run) => ({ ...run, rotated: true })) },
  ],
  expected: ROT_KEY.map((answer, i) => ({ label: String(i + 1), marks: 1, answer, page: 2 })),
};

export const syntheticSets = [mathsStructured, physicsMultipleChoice, asPhysicsStructured, rotatedScheme];
