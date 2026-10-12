// The teacher dashboard's figures, through the real route handler.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, accounts, secondTeacher } from "./support/call";
import * as dashboard from "@/app/api/dashboard/route";

beforeEach(async () => {
  await freshDatabase();
  setAccounts([...accounts, ...secondTeacher]);
});

test("Students counts the teacher's whole roster, set a paper or not", async () => {
  const mine = await call(dashboard.GET as never, { as: "t1" });
  assert.equal(mine.status, 200);
  assert.equal(mine.body.students, 3, "s1, s2 and s3, though none has a paper");
  assert.equal((await call(dashboard.GET as never, { as: "t2" })).body.students, 1);
});

test("only a teacher sees the dashboard", async () => {
  assert.equal((await call(dashboard.GET as never, { as: null })).status, 401);
  assert.equal((await call(dashboard.GET as never, { as: "s1" })).status, 403);
});
