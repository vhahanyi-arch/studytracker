// Lower Secondary classes, weekly focus and generated practice, through the
// real route handlers on an in-memory Postgres. See support/redirect.ts.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, accounts } from "./support/call";
import * as roster from "@/app/api/lower-secondary/students/route";
import * as focus from "@/app/api/lower-secondary/focus/route";
import * as practice from "@/app/api/lower-secondary/practice/route";
import * as physics from "@/app/api/physics/practice/route";

beforeEach(async () => {
  await freshDatabase();
  setAccounts(accounts);
});

test("the Stage class picker lists students beyond the first hundred accounts", async () => {
  const many = Array.from({ length: 150 }, (_, index) => ({ id: `m${index}`, username: `m${index}`, firstName: null, lastName: null, publicMetadata: { role: "student" } }));
  setAccounts([...accounts, ...many]);
  const listed = await call(roster.GET, { as: "t1", query: "stage=8" });
  assert.equal(listed.body.length, 153);
  const saved = await call(roster.POST, { as: "t1", json: { stage: 8, studentIds: ["m149", "s1", "x", "s1"] } });
  assert.deepEqual(saved.body, { saved: true, enrolled: 2, stage: 8 }, "non-students and repeats are dropped");
  const enrolled = (await call(roster.GET, { as: "t1", query: "stage=8" })).body.filter((row: Record<string, unknown>) => row.enrolled);
  assert.deepEqual(enrolled.map((row: Record<string, unknown>) => row.id).sort(), ["m149", "s1"]);
});

test("the weekly focus keeps the order the teacher chose", async () => {
  await call(focus.POST, { as: "t1", json: { stage: 8, chapters: ["s8-u3", "s8-u1", "bogus", "s8-u2"] } });
  assert.deepEqual((await call(focus.GET, { as: "t1", query: "stage=8" })).body.chapters, ["s8-u3", "s8-u1", "s8-u2"]);
  await call(focus.POST, { as: "t1", json: { stage: 8, chapters: ["s8-u2"] } });
  assert.deepEqual((await call(focus.GET, { as: "t1", query: "stage=8" })).body.chapters, ["s8-u2"]);
});

test("a practice set is marked once, and a bad session id is simply not found", async () => {
  await call(roster.POST, { as: "t1", json: { stage: 8, studentIds: ["s1"] } });
  const set = await call(practice.POST, { as: "s1", json: { action: "start", stage: 8, homeStage: 8, chapter: "s8-u1" } });
  assert.equal(set.status, 200);
  assert.equal(set.body.difficulty, "foundational");
  const [saved] = await sql`SELECT questions_json FROM lower_secondary_practice_sessions WHERE id = ${set.body.id}`;
  const correct = JSON.parse(String(saved.questions_json)).map((question: { answers: string[] }) => question.answers[0]);
  const marked = await call(practice.POST, { as: "s1", json: { action: "submit", id: set.body.id, answers: correct, hints: [true, false, true] } });
  assert.equal(marked.body.score, 100);
  assert.equal(marked.body.hints_used, 2);
  assert.equal(marked.body.results.every((result: { correct: boolean }) => result.correct), true);
  const again = await call(practice.POST, { as: "s1", json: { action: "submit", id: set.body.id, answers: [] } });
  assert.equal(again.status, 404);
  for (const id of ["", "not-a-uuid", undefined]) {
    const missing = await call(practice.POST, { as: "s1", json: { action: "submit", id, answers: [] } });
    assert.equal(missing.status, 404);
  }
  // One strong set moves the student up a tier; two master the unit.
  const next = await call(practice.POST, { as: "s1", json: { action: "start", stage: 8, homeStage: 8, chapter: "s8-u1" } });
  assert.equal(next.body.difficulty, "application");
});

test("physics practice is credited to the teacher the Exam papers use", async () => {
  await call(roster.POST, { as: "t1", json: { stage: 8, studentIds: ["s2"] } });
  const set = await call(physics.POST, { as: "s2", json: { action: "start", level: "igcse", chapter: "igcse-u1" } });
  assert.equal(set.status, 200);
  const marked = await call(physics.POST, { as: "s2", json: { action: "submit", id: set.body.id, answers: [] } });
  assert.equal(marked.body.score, 0);
  const [row] = await sql`SELECT teacher_id, status FROM physics_practice_sessions`;
  assert.deepEqual([row.teacher_id, row.status], ["t1", "completed"]);
  const view = await call(physics.GET, { as: "t1", query: "level=igcse" });
  assert.deepEqual(view.body.students.map((student: Record<string, unknown>) => [student.student_name, student.attempts]), [["Sia", 1]]);
  assert.equal((await call(physics.POST, { as: "s2", json: { action: "submit", id: "nope", answers: [] } })).status, 404);
});
