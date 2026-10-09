// Who is turned away. A paper's questions and a Stage class are the teacher's;
// these tests pin every caller who is not that teacher to a refusal that
// changes nothing. Scoping between teachers uses the second teacher, `t2`.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, pdf, accounts, secondTeacher } from "./support/call";
import * as assignments from "@/app/api/assignments/route";
import * as questions from "@/app/api/assignments/[id]/questions/route";
import * as assigned from "@/app/api/assignments/[id]/students/route";
import * as roster from "@/app/api/lower-secondary/students/route";

beforeEach(async () => {
  await freshDatabase();
  setAccounts([...accounts, ...secondTeacher]);
});

const oneQuestion = [{ label: "1", marks: 1, page_number: 1, expected_answer: "4" }];

// t1's paper with one question, assigned to s1 only.
async function paper() {
  const created = await call(assignments.POST, { as: "t1", form: { title: "P", className: "9A", profile: "igcse-mathematics-0580", paperMode: "structured", paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: oneQuestion } })).status, 200);
  assert.equal((await call(assigned.POST, { as: "t1", params: { id }, json: { studentIds: ["s1"] } })).status, 200);
  return id;
}

// Signed out, no role, a student (assigned or not), and another teacher.
const outsiders = [null, "x", "s1", "s3", "t2"];

test("only the paper's teacher can save its questions; anyone else is refused and nothing changes", async () => {
  const id = await paper();
  const saved = async () => (await sql`SELECT label, expected_answer FROM assignment_questions WHERE assignment_id = ${id}`).map((row) => [row.label, row.expected_answer]);
  for (const as of outsiders) {
    const result = await call(questions.POST, { as, params: { id }, json: { questions: [{ label: "9", marks: 5, page_number: 1, expected_answer: "taken" }] } });
    assert.equal(result.status, 403, `questions POST as ${as}`);
  }
  assert.deepEqual(await saved(), [["1", "4"]]);
});

test("a paper's questions are refused to anyone but its teacher and its assigned students", async () => {
  const id = await paper();
  for (const as of [null, "x", "s3", "t2"])
    assert.equal((await call(questions.GET, { as, params: { id } })).status, 403, `questions GET as ${as}`);
  assert.equal((await call(questions.GET, { as: "s1", params: { id } })).status, 200, "the assigned student sees it");
  assert.equal((await call(questions.GET, { as: "t1", params: { id } })).status, 200, "the teacher sees it");
});

test("a Stage class is the teacher's: no one else can read or change it", async () => {
  assert.equal((await call(roster.POST, { as: "t1", json: { stage: 8, studentIds: ["s1"] } })).status, 200);
  const enrolled = async () => (await sql`SELECT teacher_id, student_id FROM lower_secondary_enrollments ORDER BY student_id`).map((row) => [row.teacher_id, row.student_id]);
  for (const as of [null, "x", "s1"]) {
    assert.equal((await call(roster.GET, { as, query: "stage=8" })).status, 403, `roster GET as ${as}`);
    assert.equal((await call(roster.POST, { as, json: { stage: 8, studentIds: ["s2", "s3"] } })).status, 403, `roster POST as ${as}`);
  }
  assert.deepEqual(await enrolled(), [["t1", "s1"]]);
  // Another teacher saving their own class writes only their own rows.
  assert.equal((await call(roster.POST, { as: "t2", json: { stage: 8, studentIds: ["s4"] } })).status, 200);
  assert.deepEqual(await enrolled(), [["t1", "s1"], ["t2", "s4"]]);
});

// Known issues #1: the roster lists every student account, and a teacher can
// enrol or assign another teacher's students. One teacher per deployment makes
// this low priority, so these record the intended behaviour without failing
// the run. Drop `todo` when #1 is fixed.
test("a teacher's Stage class lists only their own students", { todo: "Known issues #1" }, async () => {
  const listed = (await call(roster.GET, { as: "t1", query: "stage=8" })).body.map((row: Record<string, unknown>) => row.id);
  assert.ok(!listed.includes("s4"), "t2's student is not in t1's list");
  await call(roster.POST, { as: "t1", json: { stage: 8, studentIds: ["s4"] } });
  assert.deepEqual((await sql`SELECT student_id FROM lower_secondary_enrollments WHERE teacher_id = 't1'`).length, 0, "t1 cannot enrol t2's student");
});

test("a teacher can assign a paper only to their own students", { todo: "Known issues #1" }, async () => {
  const id = await paper();
  await call(assigned.POST, { as: "t1", params: { id }, json: { studentIds: ["s1", "s4"] } });
  const rows = await sql`SELECT student_id FROM assignment_students WHERE assignment_id = ${id} ORDER BY student_id`;
  assert.deepEqual(rows.map((row) => row.student_id), ["s1"], "t2's student is not assigned");
});
