import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultDueDate } from "../../lib/due-date";

test("a new assignment is due a week from today, in local calendar days", () => {
  assert.equal(defaultDueDate(new Date(2026, 9, 12, 9, 30)), "2026-10-19");
  assert.equal(defaultDueDate(new Date(2026, 9, 12, 23, 59)), "2026-10-19");
  assert.equal(defaultDueDate(new Date(2026, 11, 28)), "2027-01-04");
  assert.equal(defaultDueDate(new Date(2028, 1, 25)), "2028-03-03");
});
