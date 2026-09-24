import { test } from "node:test";
import assert from "node:assert/strict";
import { acceptedAnswers, pastPaperQuestion, pastPaperSet, PAST_PAPER_SET_SIZE, type PastPaperRow } from "@/lib/past-paper-practice";
import { answerMatches } from "@/lib/lower-secondary-question-engine";

const row = (id: string, expected = "12", extra: Partial<PastPaperRow> = {}): PastPaperRow => ({
  id, assignment_id: "a1", title: "Stage 8 End-of-year", source_year: "2025", label: "7(b)", marks: 1,
  page_number: 3, crop_x: 0.025, crop_y: 0.4, crop_width: 0.95, crop_height: 0.2,
  expected_answer: expected, mark_scheme_notes: null, ...extra,
});

test("variants separated by a bar are all accepted", () => {
  assert.deepEqual(acceptedAnswers("3/4 | 0.75"), ["3/4", "0.75"]);
});

test("a variant showing its working also accepts the final result", () => {
  assert.deepEqual(acceptedAnswers("12 ÷ 4 = 3"), ["12 ÷ 4 = 3", "3"]);
});

test("blank variants are dropped and duplicates listed once", () => {
  assert.deepEqual(acceptedAnswers(" 5 || 5 | "), ["5"]);
});

test("a question carries its crop, so the student sees the printed question", () => {
  const q = pastPaperQuestion(row("q1"));
  assert.equal(q.templateId, "past:q1");
  assert.deepEqual(q.source, { assignmentId: "a1", label: "7(b)", pageNumber: 3, cropX: 0.025, cropY: 0.4, cropWidth: 0.95, cropHeight: 0.2, title: "Stage 8 End-of-year (2025)" });
  assert.match(q.prompt, /question 7\(b\)/);
});

test("the paper name leaves out a missing year", () => {
  assert.equal(pastPaperQuestion(row("q1", "12", { source_year: null })).source?.title, "Stage 8 End-of-year");
});

test("the accepted answer is revealed only in the solution", () => {
  const q = pastPaperQuestion(row("q1", "42", { mark_scheme_notes: "B1 for 6 × 7" }));
  assert.doesNotMatch(q.prompt + q.hint, /42|6 × 7/);
  assert.match(q.solution, /Accepted answer: 42\./);
  assert.match(q.solution, /B1 for 6 × 7/);
});

test("a multi-mark question's hint says so", () => {
  assert.match(pastPaperQuestion(row("q1", "9", { marks: 3 })).hint, /3 marks/);
});

test("answers are marked by the practice marker", () => {
  const q = pastPaperQuestion(row("q1", "2 1/3 | 7/3"));
  assert.ok(answerMatches("2 1/3", q.answers));
  assert.ok(answerMatches("7/3", q.answers));
  assert.ok(!answerMatches("21/3", q.answers));
});

test("a set holds at most six questions, each once", () => {
  const rows = Array.from({ length: 10 }, (_, i) => row(`q${i}`));
  const set = pastPaperSet(rows);
  assert.equal(set.length, PAST_PAPER_SET_SIZE);
  assert.equal(new Set(set.map((q) => q.templateId)).size, PAST_PAPER_SET_SIZE);
});

test("a unit with fewer approved questions gives a shorter set", () => {
  assert.equal(pastPaperSet([row("q1"), row("q2")]).length, 2);
});

test("a question without a usable accepted answer is never served", () => {
  const set = pastPaperSet([row("q1", " | "), row("q2", "8")]);
  assert.deepEqual(set.map((q) => q.templateId), ["past:q2"]);
});

test("the order is shuffled rather than always the paper's order", () => {
  const rows = Array.from({ length: 6 }, (_, i) => row(`q${i}`));
  const reversed = pastPaperSet(rows, () => 0).map((q) => q.templateId);
  assert.notDeepEqual(reversed, rows.map((r) => `past:${r.id}`));
});
