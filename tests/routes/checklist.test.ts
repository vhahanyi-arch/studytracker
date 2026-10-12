// The physics syllabus checklist (Known issues #5: AS was "coming soon"),
// through the real route handler.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, accounts } from "./support/call";
import * as checklist from "@/app/api/physics/checklist/route";
import { asPhysicsChecklist, checklistFor, isChecklistObjective } from "@/lib/syllabus-checklist";

beforeEach(async () => {
  await freshDatabase();
  setAccounts(accounts);
});

const objectives = (level: "igcse" | "as") =>
  checklistFor(level).flatMap((topic) => topic.groups.flatMap((group) => group.objectives));

test("the AS checklist holds all 145 objectives of the 9702 syllabus, topics 1 to 11", () => {
  assert.deepEqual(asPhysicsChecklist.map((topic) => topic.id), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]);
  const as = objectives("as");
  assert.equal(as.length, 145);
  assert.equal(new Set(as.map((objective) => objective.id)).size, 145, "ids are unique");
  for (const objective of as) {
    assert.match(objective.id, /^\d+\.\d+\.\d+$/);
    assert.ok(objective.text.trim().length > 10, objective.id);
    assert.equal(objective.type, undefined, "AS has no core/supplement split");
  }
  for (const topic of asPhysicsChecklist) for (const group of topic.groups) assert.ok(group.objectives.length, group.id);
});

test("each level accepts only its own objectives", () => {
  assert.ok(isChecklistObjective("as", "1.1.1"));
  assert.ok(isChecklistObjective("igcse", "1.1-c1"));
  assert.ok(!isChecklistObjective("as", "1.1-c1"));
  assert.ok(!isChecklistObjective("igcse", "1.1.1"));
  assert.ok(!isChecklistObjective("as", "x".repeat(5000)));
});

test("a student ticks and unticks an AS objective", async () => {
  const tick = await call(checklist.POST, { as: "s1", json: { level: "as", objectiveId: "10.1.1" } });
  assert.deepEqual([tick.status, tick.body], [200, { objectiveId: "10.1.1", checked: true }]);
  assert.deepEqual((await call(checklist.GET, { as: "s1", query: "level=as" })).body, { level: "as", checked: ["10.1.1"] });
  assert.deepEqual((await call(checklist.GET, { as: "s1", query: "level=igcse" })).body.checked, [], "levels are kept apart");
  assert.equal((await call(checklist.POST, { as: "s1", json: { level: "as", objectiveId: "10.1.1" } })).body.checked, false);
  assert.deepEqual((await call(checklist.GET, { as: "s1", query: "level=as" })).body.checked, []);
});

test("an objective that is not in the level's syllabus is refused and not stored", async () => {
  for (const [level, objectiveId] of [["as", "1.1-c1"], ["igcse", "1.1.1"], ["as", "made-up"], ["as", "y".repeat(5000)]]) {
    const refused = await call(checklist.POST, { as: "s1", json: { level, objectiveId } });
    assert.deepEqual([refused.status, refused.body.error], [400, "That objective is not in this syllabus."], objectiveId.slice(0, 20));
  }
  assert.deepEqual((await call(checklist.GET, { as: "s1", query: "level=as" })).body.checked, []);
});
