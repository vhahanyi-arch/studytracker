// A body that is not a JSON object is the caller's mistake: every route that
// reads one answers 400, never the 500 an uncaught SyntaxError became.
// Each call is made by someone the route lets in, so it reaches the parse.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { call, pdf, accounts } from "./support/call";
import * as password from "@/app/api/account/password/route";
import * as adminUsers from "@/app/api/admin/users/route";
import * as assignments from "@/app/api/assignments/route";
import * as extractScheme from "@/app/api/assignments/[id]/extract-scheme/route";
import * as paperFile from "@/app/api/assignments/[id]/paper/route";
import * as questions from "@/app/api/assignments/[id]/questions/route";
import * as assigned from "@/app/api/assignments/[id]/students/route";
import * as submit from "@/app/api/assignments/[id]/submit/route";
import * as blobUpload from "@/app/api/blob-upload/route";
import * as focus from "@/app/api/lower-secondary/focus/route";
import * as practice from "@/app/api/lower-secondary/practice/route";
import * as roster from "@/app/api/lower-secondary/students/route";
import * as checklist from "@/app/api/physics/checklist/route";
import * as physicsPractice from "@/app/api/physics/practice/route";
import * as review from "@/app/api/submissions/[id]/review/route";

beforeEach(async () => {
  await freshDatabase();
  setAccounts(accounts);
});

// A paper of t1's with one question, assigned to s1, and s1's submission.
async function paperWithSubmission() {
  const created = await call(assignments.POST, { as: "t1", form: { title: "P", className: "9A", profile: "igcse-mathematics-0580", paperMode: "structured", paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  await call(questions.POST, { as: "t1", params: { id }, json: { questions: [{ label: "1", marks: 1, page_number: 1, expected_answer: "4" }] } });
  await call(assigned.POST, { as: "t1", params: { id }, json: { studentIds: ["s1"] } });
  await call(submit.POST, { as: "s1", params: { id }, form: { answers: JSON.stringify([{ question: "1", answer: "4" }]) } });
  const [submission] = await sql`SELECT id FROM submissions WHERE assignment_id = ${id}`;
  return { id, submissionId: String(submission.id) };
}

test("every route that reads a JSON body answers 400 when it is not one", async () => {
  const { id, submissionId } = await paperWithSubmission();
  const routes: Array<[string, Parameters<typeof call>[0], Omit<Parameters<typeof call>[1], "raw">]> = [
    ["account/password POST", password.POST, { as: "s1" }],
    ["admin/users POST", adminUsers.POST, { as: "t1" }],
    ["admin/users PATCH", adminUsers.PATCH, { as: "t1" }],
    ["assignments/[id]/extract-scheme POST", extractScheme.POST, { as: "t1", params: { id } }],
    ["assignments/[id]/paper PUT", paperFile.PUT, { as: "t1", params: { id } }],
    ["assignments/[id]/questions POST", questions.POST, { as: "t1", params: { id } }],
    ["assignments/[id]/students POST", assigned.POST, { as: "t1", params: { id } }],
    ["blob-upload POST", blobUpload.POST, { as: "t1" }],
    ["lower-secondary/focus POST", focus.POST, { as: "t1" }],
    ["lower-secondary/practice POST", practice.POST, { as: "s1" }],
    ["lower-secondary/students POST", roster.POST, { as: "t1" }],
    ["physics/checklist POST", checklist.POST, { as: "s1" }],
    ["physics/practice POST", physicsPractice.POST, { as: "s1" }],
    ["submissions/[id]/review POST", review.POST, { as: "t1", params: { id: submissionId } }],
  ];
  for (const [name, handler, options] of routes)
    for (const raw of ["{", "", "null", "[1, 2]"]) {
      const result = await call(handler, { ...options, raw });
      assert.deepEqual([result.status, result.body.error], [400, "The request could not be read."], `${name} with body ${JSON.stringify(raw)}`);
    }
});
