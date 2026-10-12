import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeQuestion, normalizeAnswer, parseNumericAnswer } from "../../lib/grade-question";

// The Papers & assignments marker: proposes a mark for each typed answer when a
// student submits. Multiple-choice and practice sittings publish it at once.
const mark = (expected: string | null, answer: string, extra: Record<string, unknown> = {}) =>
  gradeQuestion({ expected_answer: expected, marks: 2, ...extra }, { answer });

test("an exact match gets full marks with high confidence", () => {
  assert.deepEqual(mark("B", "B"), {
    proposed: 2,
    confidence: "high",
    rationale: "The final answer matches an accepted answer exactly or is numerically equivalent.",
    maximum: 2,
  });
});

test("case, spaces and a decimal comma do not matter", () => {
  assert.equal(mark("Kinetic energy", " kinetic ENERGY ").proposed, 2);
  // Two or more spaces between characters are read as a lost "×" (from mark
  // schemes read out of PDFs). That applies to the student's answer too.
  assert.equal(mark("Kinetic energy", "kinetic  energy").proposed, 0);
  assert.equal(mark("2.5", "2,5").proposed, 2);
});

test("numerically equal answers match", () => {
  assert.equal(mark("0.75", "3/4").proposed, 2);
  assert.equal(mark("3 × 10^8", "300000000").proposed, 2);
  assert.equal(mark("3 x 10^8", "3e8").proposed, 2);
  assert.equal(mark("−4", "-4").proposed, 2);
  assert.equal(mark("2.5", "2.6").proposed, 0);
  assert.equal(mark("5", "-5").proposed, 0);
});

test("any accepted variant matches, and so does the result after the last =", () => {
  assert.equal(mark("12 | twelve", "twelve").proposed, 2);
  assert.equal(mark("23 × 3.4 = (23+160)v, v = 0.43 m s-1", "0.43").proposed, 2);
});

test("a blank answer never scores, even when the accepted answer has an empty variant", () => {
  for (const expected of ["5 |", "| 5", "5 || 6", "v =", "x = 3 | y ="]) {
    const result = mark(expected, "");
    assert.equal(result.proposed, 0, `blank answer scored against "${expected}"`);
  }
});

test("an accepted answer with no content is sent to the teacher", () => {
  for (const expected of [null, "", "  ", "|", " | ", "| |"]) {
    const result = mark(expected, "5");
    assert.equal(result.proposed, null);
    assert.equal(result.confidence, "review");
    assert.equal(result.rationale, "No accepted answer has been configured for this question.");
  }
});

test("a wrong answer with working is left for review; without working it is medium", () => {
  const withWorking = gradeQuestion({ expected_answer: "4", marks: 3 }, { answer: "5", working: "2+3" });
  assert.deepEqual([withWorking.proposed, withWorking.confidence], [0, "review"]);
  assert.deepEqual([mark("4", "5").proposed, mark("4", "5").confidence], [0, "medium"]);
});

test("drawings and handwritten pages always go to the teacher", () => {
  assert.equal(mark("4", "4", { response_type: "drawing" }).proposed, null);
  const handwritten = gradeQuestion(
    { expected_answer: "4", marks: 2 },
    { handwrittenPageAssigned: true, handwrittenFileIndex: 1 },
  );
  assert.equal(handwritten.proposed, null);
  assert.match(handwritten.rationale, /page 2/);
});

test("several answer boxes are joined in order", () => {
  const result = gradeQuestion({ expected_answer: "3 | 4", marks: 1 }, { answers: ["3", "", "4"] });
  // "3 | 4" as a whole is not one of the variants "3" or "4", but its first
  // number is 3, so it matches numerically: recorded here as current behaviour.
  assert.equal(result.proposed, 1);
});

test("marks come from the question, as a number", () => {
  assert.equal(gradeQuestion({ expected_answer: "1", marks: "4" }, { answer: "1" }).maximum, 4);
  assert.equal(gradeQuestion({ expected_answer: "1", marks: null }, { answer: "1" }).maximum, 0);
});

test("normalizeAnswer and parseNumericAnswer", () => {
  assert.equal(normalizeAnswer(" 3 □ 4 "), "3×4");
  assert.equal(parseNumericAnswer("6.0×10^-3m"), 0.006);
  assert.equal(parseNumericAnswer("1/4"), 0.25);
  assert.ok(Number.isNaN(parseNumericAnswer("none")));
});
