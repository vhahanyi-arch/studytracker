// The words printed around an answer line ("x = ......", "...... cm"), read
// from the paper so the answer box can show them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { answerLineLabel, answerLineLabels, analysePaperWithMarkScheme, parseMarkScheme } from "@/lib/cambridge-analysis";
import { cleanAnswerLabels, withAnswerLabel } from "@/lib/answer-lines";
import { cleanQuestion } from "@/lib/question-save";
import { gradeQuestion } from "@/lib/grade-question";
import { extractPdfPages } from "@/lib/server-pdf";
import { writePdf } from "../fixtures/synthetic-pdf";
import { syntheticSets, asPhysicsStructured } from "../fixtures/synthetic-papers";

const DOTS = "..............................";

test("the words either side of the line are kept, and the printed marks dropped", () => {
  assert.deepEqual(answerLineLabel(`x = ${DOTS} [2]`), { before: "x =", after: "" });
  assert.deepEqual(answerLineLabel(`${DOTS} cm [1]`), { before: "", after: "cm" });
  assert.deepEqual(answerLineLabel(`Area = ${DOTS} cm² [2]`), { before: "Area =", after: "cm²" });
  assert.deepEqual(answerLineLabel(`$ ${DOTS}`), { before: "$", after: "" });
  assert.deepEqual(answerLineLabel(`${DOTS} [3]`), { before: "", after: "" }, "a bare line has no label");
  assert.deepEqual(answerLineLabel(`______________ kg`), { before: "", after: "kg" });
  assert.equal(answerLineLabel("Work out 3.5 + 4.2 [1]"), null, "a decimal point is not a line");
});

test("a part label is not part of the answer line, but a number in a sum is", () => {
  assert.deepEqual(answerLineLabel(`(a) y = ${DOTS} [1]`), { before: "y =", after: "" });
  assert.deepEqual(answerLineLabel(`(b)(ii) ${DOTS} %`), { before: "", after: "%" });
  assert.deepEqual(answerLineLabel(`12 + ${DOTS} = 20`), { before: "12 +", after: "= 20" });
});

test("a coordinate pair is one box with its brackets, and dots spaced out still count", () => {
  assert.deepEqual(answerLineLabel(`( ${DOTS} , ${DOTS} )`), { before: "(", after: ")" });
  assert.deepEqual(answerLineLabel("x = . . . . . . . . . ."), { before: "x =", after: "" });
});

test("text too long to be a label keeps only the words next to the line", () => {
  const label = answerLineLabel(`The total number of sweets that Maria has left in the jar = ${DOTS}`)!;
  assert.ok(label.before.length <= 40);
  assert.match(label.before, /in the jar =$/);
});

test("one label per answer line, in printed order", () => {
  assert.deepEqual(answerLineLabels(["Solve the equation.", `x = ${DOTS}`, `y = ${DOTS}`]), [
    { before: "x =", after: "" },
    { before: "y =", after: "" },
  ]);
});

test("stored labels are cleaned, and an answer reads as it does on the paper", () => {
  assert.deepEqual(cleanAnswerLabels('[{"before":" x  = ","after":""},{"after":"cm"},"junk"]'), [
    { before: "x =", after: "" },
    { before: "", after: "cm" },
    { before: "", after: "" },
  ]);
  assert.deepEqual(cleanAnswerLabels("not json"), []);
  assert.deepEqual(cleanAnswerLabels(null), []);
  assert.equal(withAnswerLabel("3", { before: "x =", after: "" }), "x = 3");
  assert.equal(withAnswerLabel(" 12 ", { before: "", after: "cm" }), "12 cm");
  assert.equal(withAnswerLabel("", { before: "x =", after: "" }), "", "no answer stays empty");
  assert.equal(withAnswerLabel("7", undefined), "7");
});

test("a save keeps labels for the paper's answer boxes, and none when nothing is printed", () => {
  const saved = cleanQuestion({ label: "2(a)", answer_slots: 1, answer_labels: [{ before: "x =", after: "" }, { before: "y =", after: "" }] }, 0);
  assert.deepEqual(JSON.parse(saved.answerLabels!), [{ before: "x =", after: "" }], "one box, one label");
  assert.equal(cleanQuestion({ label: "1", answer_labels: [{ before: "", after: "" }] }, 0).answerLabels, null);
  assert.equal(cleanQuestion({ label: "1" }, 0).answerLabels, null);
});

// The label is shown around the box, and the student types only their part:
// the marker already accepts that against a scheme that includes the label.
test("the marker accepts the typed part against a scheme answer that includes the label", () => {
  const grade = (expected: string, answer: string) => gradeQuestion({ expected_answer: expected, marks: 2 }, { answer }).proposed;
  assert.equal(grade("x = 3", "3"), 2);
  assert.equal(grade("12 cm", "12"), 2);
  assert.equal(grade("78.5 cm²", "78.5"), 2);
  assert.equal(grade("x = 3", "4"), 0);
});

test("synthetic papers: the reader finds the words printed beside each answer line", async () => {
  const labelsOf = async (set: { paper: Parameters<typeof writePdf>[0]; scheme: Parameters<typeof writePdf>[0]; subject: Parameters<typeof parseMarkScheme>[1]; mode: Parameters<typeof parseMarkScheme>[2] }) => {
    const [paper, scheme] = await Promise.all([extractPdfPages(writePdf(set.paper)), extractPdfPages(writePdf(set.scheme))]);
    const result = analysePaperWithMarkScheme(paper, parseMarkScheme(scheme, set.subject, set.mode), set.subject, set.mode);
    return Object.fromEntries(result.questions.map((question) => [question.label, question.answer_labels]));
  };
  const maths = await labelsOf(syntheticSets[0]);
  assert.deepEqual(maths["2(a)"], [{ before: "x =", after: "" }]);
  assert.deepEqual(maths["4"], [{ before: "cm2", after: "" }]);
  assert.deepEqual(maths["1(a)"], [{ before: "", after: "" }], "a bare line has an empty label");
  const physics = await labelsOf(asPhysicsStructured);
  assert.ok(Object.values(physics).some((labels) => labels?.some((label) => label.before === "acceleration =")));
});
