// Papers & assignments, through the real route handlers on an in-memory
// Postgres. Clerk and Blob are stand-ins; see support/redirect.ts.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts, clerkCalls } from "./support/fake-clerk";
import { uploads } from "./support/fake-blob";
import { call, pdf, png, accounts } from "./support/call";
import * as assignments from "@/app/api/assignments/route";
import * as questions from "@/app/api/assignments/[id]/questions/route";
import * as students from "@/app/api/assignments/[id]/students/route";
import * as submit from "@/app/api/assignments/[id]/submit/route";
import * as queue from "@/app/api/submissions/route";
import * as review from "@/app/api/submissions/[id]/review/route";
import * as remark from "@/app/api/submissions/[id]/remark/route";

const threeQuestions = (answers: string[]) => [
  { label: "1", marks: 2, page_number: 1, expected_answer: answers[0], topic: "Algebra" },
  { label: "2(a)", marks: 1, page_number: 1, expected_answer: answers[1] },
  { label: "2(b)", marks: 1, page_number: 2, expected_answer: answers[2] },
];

async function paper(mode: "structured" | "multiple_choice" = "structured", studentIds = ["s1", "s2"]) {
  const created = await call(assignments.POST, { as: "t1", form: { title: `Paper ${mode}`, className: "9A", profile: "igcse-mathematics-0580", paperMode: mode, paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  const set = mode === "multiple_choice"
    ? ["A", "C", "D"].map((answer, index) => ({ label: String(index + 1), marks: 1, page_number: 1, response_type: "multiple_choice", expected_answer: answer }))
    : threeQuestions(["12", "x=3", "0.5"]);
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: set } })).status, 200);
  assert.equal((await call(students.POST, { as: "t1", params: { id }, json: { studentIds } })).status, 200);
  return id;
}
const answers = (rows: unknown[]) => ({ answers: JSON.stringify(rows) });
const marksFor = async (studentId: string) => (await sql`
  SELECT q.label, m.proposed_mark, m.final_mark FROM submission_marks m
  JOIN submissions s ON s.id = m.submission_id JOIN assignment_questions q ON q.id = m.question_id
  WHERE s.student_id = ${studentId} ORDER BY q.position`).map((row) => [row.label, row.proposed_mark, row.final_mark]);

beforeEach(async () => {
  await freshDatabase();
  setAccounts(accounts);
});

test("fixing an accepted answer after students have submitted keeps every mark", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }, { question: "2(a)", answer: "3" }]) });
  const [submission] = (await call(queue.GET, { as: "t1" })).body;
  await call(review.POST, { as: "t1", params: { id: submission.id }, json: { publish: false, marks: [{ questionId: submission.marks[1].question_id, reviewed: true, finalMark: 1 }] } });
  const before = await marksFor("s1");
  assert.equal(before.length, 3);

  const saved = await call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["12", "3", "1/2"]) } });
  assert.equal(saved.status, 200);
  assert.deepEqual(await marksFor("s1"), before, "the marks survive the save");
  const [row] = await sql`SELECT expected_answer FROM assignment_questions WHERE assignment_id = ${id} AND label = '2(a)'`;
  assert.equal(row.expected_answer, "3", "the new accepted answer is saved");

  // Re-marking uses the new answer, and leaves the teacher's confirmed mark.
  await call(remark.POST, { as: "t1", params: { id: submission.id } });
  assert.deepEqual(await marksFor("s1"), [["1", 2, null], ["2(a)", 1, 1], ["2(b)", 0, null]]);
});

test("once a student has submitted, questions cannot be added, removed or relabelled", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) });
  const refused = async (set: unknown[]) => {
    const result = await call(questions.POST, { as: "t1", params: { id }, json: { questions: set } });
    assert.equal(result.status, 409);
    assert.match(result.body.error, /already submitted/);
  };
  await refused(threeQuestions(["12", "3", "1/2"]).slice(0, 2));
  await refused([...threeQuestions(["12", "3", "1/2"]), { label: "3", marks: 1, page_number: 3 }]);
  await refused(threeQuestions(["12", "3", "1/2"]).map((question, index) => (index === 2 ? { ...question, label: "3" } : question)));
  assert.equal((await marksFor("s1")).length, 3);
  // Case and spacing are not a new label.
  const respaced = threeQuestions(["12", "3", "1/2"]).map((question, index) => (index === 2 ? { ...question, label: "2 (B)" } : question));
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: respaced } })).status, 200);
});

// Runs `step` at the moment the next sql.transaction is called, before it
// writes: the window between a route's checks and its write.
function inTheGap(step: () => Promise<unknown>) {
  const original = sql.transaction;
  sql.transaction = (async (queries: Parameters<typeof original>[0]) => {
    sql.transaction = original;
    await step();
    return original(queries);
  }) as typeof original;
}

test("a submission that lands while the teacher removes a question keeps every mark", async () => {
  const id = await paper();
  inTheGap(() => call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) }));
  const saved = await call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["12", "3", "1/2"]).slice(0, 2) } });
  assert.equal(saved.status, 409);
  assert.match(saved.body.error, /already submitted/);
  assert.equal((await marksFor("s1")).length, 3, "no mark was deleted");
  assert.equal((await sql`SELECT id FROM assignment_questions WHERE assignment_id = ${id}`).length, 3, "no question was removed");
});

test("a save that keeps the questions still goes through when a submission lands mid-save", async () => {
  const id = await paper();
  inTheGap(() => call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) }));
  const saved = await call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["12", "3", "1/2"]) } });
  assert.equal(saved.status, 200);
  assert.equal((await marksFor("s1")).length, 3);
  const [row] = await sql`SELECT expected_answer FROM assignment_questions WHERE assignment_id = ${id} AND label = '2(b)'`;
  assert.equal(row.expected_answer, "1/2");
});

test("a submission that lands just after a question was removed is refused cleanly and can be sent again", async () => {
  const id = await paper();
  inTheGap(() => call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["12", "3", "1/2"]).slice(0, 2) } }));
  const first = await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) });
  assert.equal(first.status, 409);
  assert.match(first.body.error, /changed this paper's questions/);
  assert.equal((await sql`SELECT id FROM submissions WHERE student_id = 's1'`).length, 0, "nothing was written");
  const again = await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) });
  assert.equal(again.status, 200);
  assert.equal((await marksFor("s1")).length, 2, "marked against the new paper");
});

test("a student's view of the questions carries no part of the answer key", async () => {
  const id = await paper();
  const keyed = threeQuestions(["12", "x=3", "0.5"]).map((question) => ({
    ...question,
    mark_scheme_notes: "M1 for method",
    draft_answer: "AI proposal",
    draft_accepted_answer: "AI accepted",
    draft_confidence: "high",
  }));
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: keyed } })).status, 200);
  const teacher = (await call(questions.GET, { as: "t1", params: { id } })).body;
  assert.equal(teacher[0].mark_scheme_notes, "M1 for method", "the key is saved, so its absence below means something");
  const student = (await call(questions.GET, { as: "s1", params: { id } })).body;
  assert.equal(student.length, 3);
  // Exactly these fields, so a column added to the student query later has to
  // be added here on purpose.
  const allowed = ["answer_labels", "answer_slots", "crop_height", "crop_width", "crop_x", "crop_y", "extracted_question_text", "id", "label", "marks", "page_number", "position", "response_layout", "response_type", "topic"];
  for (const question of student) assert.deepEqual(Object.keys(question).sort(), allowed);
  const text = JSON.stringify(student);
  for (const secret of ["x=3", "M1 for method", "AI proposal", "AI accepted"]) assert.ok(!text.includes(secret), `the student response contains ${secret}`);
});

test("a paper saves up to 500 questions and refuses more, changing nothing", async () => {
  const id = await paper();
  const many = (count: number) => Array.from({ length: count }, (_, index) => ({ label: String(index + 1), marks: 1, page_number: index + 1 }));
  const count = async () => (await sql`SELECT id FROM assignment_questions WHERE assignment_id = ${id}`).length;
  const refused = await call(questions.POST, { as: "t1", params: { id }, json: { questions: many(501) } });
  assert.deepEqual([refused.status, refused.body.error], [400, "A paper can have at most 500 questions."]);
  assert.equal(await count(), 3, "the paper keeps its questions");
  assert.deepEqual((await call(questions.POST, { as: "t1", params: { id }, json: { questions: many(500) } })).body, { saved: 500 });
  assert.equal(await count(), 500);
});

test("before anyone submits, a paper can gain and lose questions", async () => {
  const id = await paper();
  const ids = async () => (await sql`SELECT id FROM assignment_questions WHERE assignment_id = ${id} ORDER BY position`).map((row) => String(row.id));
  const original = await ids();
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["1", "2", "3"]).slice(0, 1) } })).status, 200);
  assert.deepEqual(await ids(), original.slice(0, 1), "the kept question keeps its id");
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: threeQuestions(["1", "2", "3"]) } })).status, 200);
  const grown = await ids();
  assert.equal(grown.length, 3);
  assert.equal(grown[0], original[0]);
});

test("a student cannot submit a paper twice, even a marked multiple-choice one", async () => {
  const id = await paper("multiple_choice");
  const first = await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "A" }, { question: "2", answer: "B" }, { question: "3", answer: "D" }]) });
  assert.deepEqual(first.body, { submitted: true, status: "published", total: 2, maximum: 3 });
  const uploadsBefore = uploads.length;
  const second = await call(submit.POST, { as: "s1", params: { id }, form: { ...answers([{ question: "2", answer: "C" }]), handwritten: png("retry") } });
  assert.equal(second.status, 409);
  assert.equal(second.body.error, "You have already submitted this paper.");
  assert.equal(uploads.length, uploadsBefore, "nothing is uploaded for a refused submission");
  const [row] = await sql`SELECT status, total_final FROM submissions WHERE student_id = 's1'`;
  assert.deepEqual([row.status, row.total_final], ["published", 2]);
});

test("handwritten pages are linked to the questions on them", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: { ...answers([{ question: "1", answer: "12" }]), handwritten: [png("page-1"), png("page-2")] } });
  const [submission] = (await call(queue.GET, { as: "t1" })).body;
  assert.deepEqual(
    submission.answers.map((answer: Record<string, unknown>) => [answer.question, answer.handwrittenFileIndex, answer.handwrittenUploadMode]),
    [["1", 0, "whole_paper"], ["2(a)", 0, "whole_paper"], ["2(b)", 1, "whole_paper"]],
  );
  assert.equal(submission.handwritten_count, 2);
});

test("the marking queue still loads after a student's account is deleted", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) });
  await call(submit.POST, { as: "s2", params: { id }, form: answers([{ question: "1", answer: "11" }]) });
  setAccounts(accounts.filter((account) => account.id !== "s2"));
  const before = clerkCalls();
  const listed = await call(queue.GET, { as: "t1" });
  assert.equal(listed.status, 200);
  assert.deepEqual(listed.body.map((row: Record<string, unknown>) => row.student_name).sort(), ["Sam Student", "Student"]);
  assert.equal(listed.body[0].marks.length, 3);
  assert.equal(clerkCalls() - before, 2, "the caller, then one batched lookup for every name");
});

test("a review keeps confirmed marks when publishing is refused, then publishes the total", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: answers([{ question: "1", answer: "12" }]) });
  const [submission] = (await call(queue.GET, { as: "t1" })).body;
  const mark = (index: number, finalMark: number) => ({ questionId: submission.marks[index].question_id, reviewed: true, finalMark, feedback: "ok" });
  const refused = await call(review.POST, { as: "t1", params: { id: submission.id }, json: { publish: true, marks: [mark(0, 9)] } });
  assert.equal(refused.status, 400);
  assert.deepEqual(await marksFor("s1"), [["1", 2, 2], ["2(a)", 0, null], ["2(b)", 0, null]], "capped at the question's marks, and kept");
  const published = await call(review.POST, { as: "t1", params: { id: submission.id }, json: { publish: true, feedback: "Good", marks: [mark(1, 1), mark(2, 0), { questionId: "not-a-question", reviewed: true, finalMark: 1 }] } });
  assert.deepEqual(published.body, { saved: true, published: true, ready: false, outstanding: 0, total: 3 });
  const results = (await call(queue.GET, { as: "s1" })).body;
  assert.equal(results[0].total_final, 3);
  assert.deepEqual(results[0].marks.map((row: Record<string, unknown>) => row.final_mark), [2, 1, 0]);
});

test("a class keeps the order the teacher chose", async () => {
  const id = await paper("structured", ["s3", "s1", "s2"]);
  const roster = await call(students.GET, { as: "t1", params: { id } });
  assert.deepEqual(roster.body.map((row: Record<string, unknown>) => row.student_id), ["s3", "s1", "s2"]);
  const refused = await call(students.POST, { as: "t1", params: { id }, json: { studentIds: ["s1", "x"] } });
  assert.equal(refused.status, 400);
  assert.equal((await call(students.GET, { as: "t1", params: { id } })).body.length, 3, "a refused change leaves the class as it was");
});
