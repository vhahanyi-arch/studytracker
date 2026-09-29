// Stage 8/9 full past papers, through the real route handlers on an in-memory
// Postgres: a library paper the teacher sets is sat by that stage's class, in
// practice or for the teacher, as many times as they like.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, pdf, accounts } from "./support/call";
import * as assignments from "@/app/api/assignments/route";
import * as questions from "@/app/api/assignments/[id]/questions/route";
import * as students from "@/app/api/assignments/[id]/students/route";
import * as submit from "@/app/api/assignments/[id]/submit/route";
import * as draft from "@/app/api/assignments/[id]/draft/route";
import * as queue from "@/app/api/submissions/route";
import * as review from "@/app/api/submissions/[id]/review/route";
import * as fullPapers from "@/app/api/lower-secondary/full-papers/route";

async function libraryPaper(stage: 8 | 9 = 8, approve = true) {
  const created = await call(assignments.POST, { as: "t1", form: { title: `Stage ${stage} test`, className: `Stage ${stage} past-paper library`, profile: `lower-secondary-stage${stage}`, paperMode: "structured", library: "true", stage: String(stage), year: "2025", paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  if (approve) {
    const set = [
      { label: "1", marks: 1, page_number: 1, expected_answer: "12", topic: "s8-u1" },
      { label: "2", marks: 2, page_number: 1, expected_answer: "x=3", topic: "s8-u2", answer_labels: [{ before: "x =", after: "" }] },
      { label: "3", marks: 1, page_number: 2, response_type: "drawing", topic: "s8-u3" },
    ];
    assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: set } })).status, 200);
  }
  return id;
}
const enrol = (studentId: string, stage: number) =>
  sql`INSERT INTO lower_secondary_enrollments (teacher_id, student_id, stage) VALUES ('t1', ${studentId}, ${stage})`;
const setPaper = (id: string, set = true, dueDate: string | null = null) =>
  call(fullPapers.POST, { as: "t1", json: { id, set, dueDate } });
const sit = (id: string, as: string, sitting: "practice" | "teacher", answers: unknown[], timerMinutes = "") =>
  call(submit.POST, { as, params: { id }, form: { answers: JSON.stringify(answers), sitting, timerMinutes } });
const good = [{ question: "1", answer: "12" }, { question: "2", answer: "3" }];

beforeEach(async () => {
  await freshDatabase();
  setAccounts(accounts);
});

test("a paper reaches the stage's class only once it is set, and leaves when unset", async () => {
  const id = await libraryPaper(8);
  await enrol("s1", 8);
  await enrol("s2", 9);
  const listed = async (as: string, stage: number) => (await call(fullPapers.GET, { as, query: `stage=${stage}` })).body.papers.map((paper: { id: string }) => paper.id);
  assert.deepEqual(await listed("s1", 8), [], "not set yet");
  assert.equal((await sit(id, "s1", "practice", good)).status, 403);

  assert.equal((await setPaper(id, true, "2026-10-10")).status, 200);
  assert.deepEqual(await listed("s1", 8), [id]);
  assert.deepEqual(await listed("s2", 9), [], "a Stage 8 paper is for the Stage 8 class");
  assert.equal((await sit(id, "s2", "practice", good)).status, 403);
  assert.equal((await sit(id, "s3", "practice", good)).status, 403, "not enrolled");
  const [paper] = (await call(fullPapers.GET, { as: "s1", query: "stage=8" })).body.papers;
  assert.deepEqual([paper.questions, paper.maximum, String(paper.due_date).slice(0, 10)], [3, 4, "2026-10-10"]);
  const studentQuestions = (await call(questions.GET, { as: "s1", params: { id } })).body;
  assert.equal(studentQuestions[0].expected_answer, undefined, "no answers before sitting");
  assert.deepEqual(studentQuestions.map((q: Record<string, unknown>) => q.answer_labels), [[], [{ before: "x =", after: "" }], []], "the printed words around each answer line");

  assert.equal((await setPaper(id, false)).status, 200);
  assert.deepEqual(await listed("s1", 8), []);
  assert.equal((await sit(id, "s1", "practice", good)).status, 403);
});

test("a paper cannot be set before its questions are approved, nor by anyone but its teacher", async () => {
  const id = await libraryPaper(8, false);
  const refused = await setPaper(id);
  assert.equal(refused.status, 409);
  assert.match(refused.body.error, /Approve every question/);
  assert.equal((await call(fullPapers.POST, { as: "s1", json: { id, set: true } })).status, 403);
});

test("a practice sitting is marked at once, shows the answers, and stays out of the teacher's queue", async () => {
  const id = await libraryPaper(8);
  await enrol("s1", 8);
  await setPaper(id);
  const result = await sit(id, "s1", "practice", good, "60");
  assert.equal(result.status, 200);
  assert.deepEqual({ ...result.body, submissionId: undefined }, { submitted: true, status: "published", total: 3, maximum: 4, attempt: 1, practice: true, submissionId: undefined });

  const [row] = await sql`SELECT status, self_practice, timer_minutes, total_final FROM submissions`;
  assert.deepEqual([row.status, row.self_practice, row.timer_minutes, row.total_final], ["published", true, 60, 3]);
  assert.deepEqual((await call(queue.GET, { as: "t1" })).body, [], "not in the marking queue");
  assert.deepEqual((await call(queue.GET, { as: "s1" })).body, [], "not among the student's teacher-marked results");

  const detail = await call(fullPapers.GET, { as: "s1", query: `attempt=${result.body.submissionId}` });
  assert.deepEqual(detail.body.questions.map((q: Record<string, unknown>) => [q.label, q.mark, q.automatic, q.answer, q.accepted]), [
    ["1", 1, true, "12", "12"],
    ["2", 2, true, "x = 3", "x=3"],
    ["3", 0, false, "", null],
  ]);
  assert.equal((await call(fullPapers.GET, { as: "s2", query: `attempt=${result.body.submissionId}` })).status, 404, "only the student who sat it");
});

test("retakes: a new attempt waits until the teacher has marked the last one", async () => {
  const id = await libraryPaper(8);
  await enrol("s1", 8);
  await setPaper(id);
  assert.equal((await sit(id, "s1", "practice", [{ question: "1", answer: "11" }])).body.attempt, 1);
  const forTeacher = await sit(id, "s1", "teacher", good);
  assert.deepEqual([forTeacher.body.status, forTeacher.body.attempt, forTeacher.body.practice], ["awaiting_review", 2, false]);

  const blocked = await sit(id, "s1", "practice", good);
  assert.equal(blocked.status, 409);
  assert.match(blocked.body.error, /still with your teacher/);

  const [queued] = (await call(queue.GET, { as: "t1" })).body;
  assert.equal(queued.attempt, 2);
  const marks = queued.marks.map((mark: Record<string, unknown>) => ({ questionId: mark.question_id, reviewed: true, finalMark: mark.maximum }));
  assert.equal((await call(review.POST, { as: "t1", params: { id: queued.id }, json: { publish: true, marks } })).status, 200);
  const results = (await call(queue.GET, { as: "s1" })).body;
  assert.deepEqual(results.map((r: Record<string, unknown>) => [r.attempt, r.total_final]), [[2, 4]]);

  assert.equal((await sit(id, "s1", "practice", good)).body.attempt, 3);
  const listed = (await call(fullPapers.GET, { as: "s1", query: "stage=8" })).body.papers[0].attempts;
  assert.deepEqual(listed.map((a: Record<string, unknown>) => [a.attempt, a.practice, a.status]), [[1, true, "published"], [2, false, "published"], [3, true, "published"]]);
  const teacherView = (await call(fullPapers.GET, { as: "t1", query: "stage=8" })).body.papers[0].attempts;
  assert.deepEqual(teacherView.map((a: Record<string, unknown>) => a.student_name), ["Sam Student", "Sam Student", "Sam Student"]);
  const detail = await call(fullPapers.GET, { as: "s1", query: `attempt=${queued.id}` });
  assert.equal(detail.body.questions[0].accepted, undefined, "answers are shown for practice attempts only");
});

test("an assigned paper is still sat once, whatever the form says", async () => {
  const created = await call(assignments.POST, { as: "t1", form: { title: "Homework paper", className: "9A", profile: "igcse-mathematics-0580", paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  await call(questions.POST, { as: "t1", params: { id }, json: { questions: [{ label: "1", marks: 1, page_number: 1, expected_answer: "12" }] } });
  await call(students.POST, { as: "t1", params: { id }, json: { studentIds: ["s1"] } });
  const first = await sit(id, "s1", "practice", good);
  assert.deepEqual(first.body, { submitted: true, status: "awaiting_review" }, "practice is only for full past papers");
  assert.equal((await sit(id, "s1", "practice", good)).status, 409);
  await assert.rejects(
    async () => { await sql`INSERT INTO submissions (id, assignment_id, student_id) VALUES (gen_random_uuid(), ${id}, 's1')`; },
    "the database refuses a second attempt 1",
  );
  const [row] = await sql`SELECT attempt, self_practice FROM submissions`;
  assert.deepEqual([row.attempt, row.self_practice], [1, false]);
});

test("the draft keeps how the paper is being sat", async () => {
  const id = await libraryPaper(8);
  await enrol("s1", 8);
  await setPaper(id);
  const saved = await call(draft.PUT as never, { as: "s1", params: { id }, json: { draft: { rows: [{ question: "1", answer: "1" }], mode: "typed", sitting: { practice: true, timerMinutes: 45, startedAt: "2026-09-29T10:00:00.000Z" } } } });
  assert.equal(saved.status, 200);
  const [paper] = (await call(fullPapers.GET, { as: "s1", query: "stage=8" })).body.papers;
  assert.deepEqual([paper.in_progress, paper.sitting], [true, { practice: true, timerMinutes: 45, startedAt: "2026-09-29T10:00:00.000Z" }]);
  const odd = await call(draft.PUT as never, { as: "s1", params: { id }, json: { draft: { rows: [], mode: "typed", sitting: { practice: 1, timerMinutes: 7 } } } });
  assert.equal(odd.status, 200);
  const [again] = (await call(fullPapers.GET, { as: "s1", query: "stage=8" })).body.papers;
  assert.equal(again.sitting.timerMinutes, null, "only the offered timer lengths");
});
