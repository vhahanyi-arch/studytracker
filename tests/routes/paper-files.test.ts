// Deleting a Papers & assignments paper, and removing replaced PDFs from Blob
// (Known issues #3), through the real route handlers.
import "./support/redirect";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { freshDatabase, sql } from "./support/fake-db";
import { setAccounts } from "./support/fake-clerk";
import { BASE, stored } from "./support/fake-blob";
import { call, pdf, png, accounts, secondTeacher } from "./support/call";
import * as assignments from "@/app/api/assignments/route";
import * as one from "@/app/api/assignments/[id]/route";
import * as questions from "@/app/api/assignments/[id]/questions/route";
import * as students from "@/app/api/assignments/[id]/students/route";
import * as submit from "@/app/api/assignments/[id]/submit/route";
import * as paperFile from "@/app/api/assignments/[id]/paper/route";
import * as schemeFile from "@/app/api/assignments/[id]/scheme/route";

beforeEach(async () => {
  await freshDatabase();
  setAccounts([...accounts, ...secondTeacher]);
});

async function paper() {
  const created = await call(assignments.POST, { as: "t1", form: { title: "P", className: "9A", profile: "igcse-mathematics-0580", paperMode: "structured", paper: pdf("qp"), scheme: pdf("ms") } });
  const id = created.body.id as string;
  assert.equal((await call(questions.POST, { as: "t1", params: { id }, json: { questions: [{ label: "1", marks: 1, page_number: 1, expected_answer: "4" }] } })).status, 200);
  assert.equal((await call(students.POST, { as: "t1", params: { id }, json: { studentIds: ["s1", "s2"] } })).status, 200);
  return id;
}
const filesOf = (id: string) => [...stored].filter((pathname) => pathname.includes(`/${id}/`)).sort();
const rowsOf = async (id: string) => {
  const [row] = await sql`SELECT
    (SELECT COUNT(*)::int FROM assignments WHERE id = ${id}) AS assignments,
    (SELECT COUNT(*)::int FROM assignment_questions WHERE assignment_id = ${id}) AS questions,
    (SELECT COUNT(*)::int FROM assignment_students WHERE assignment_id = ${id}) AS students,
    (SELECT COUNT(*)::int FROM submissions WHERE assignment_id = ${id}) AS submissions`;
  return { assignments: Number(row.assignments), questions: Number(row.questions), students: Number(row.students), submissions: Number(row.submissions) };
};
const remove = (id: string, as: string | null, submissions?: number) =>
  call(one.DELETE, { as, params: { id }, query: submissions === undefined ? undefined : `submissions=${submissions}` });

test("a paper nobody has submitted is deleted with its rows and files", async () => {
  const id = await paper();
  assert.deepEqual(filesOf(id), [`assignments/${id}/mark-scheme.pdf`, `assignments/${id}/question-paper.pdf`]);
  const deleted = await remove(id, "t1", 0);
  assert.equal(deleted.status, 200);
  assert.deepEqual(deleted.body, { deleted: id });
  assert.deepEqual(await rowsOf(id), { assignments: 0, questions: 0, students: 0, submissions: 0 });
  assert.deepEqual(filesOf(id), []);
});

test("a paper with submissions is deleted only when the teacher was told how many", async () => {
  const id = await paper();
  await call(submit.POST, { as: "s1", params: { id }, form: { answers: JSON.stringify([{ question: "1", answer: "4" }]), handwritten: png("page-1") } });
  assert.equal(filesOf(id).filter((pathname) => pathname.startsWith("submissions/")).length, 1);

  const stale = await remove(id, "t1", 0);
  assert.equal(stale.status, 409);
  assert.deepEqual(stale.body, { error: "This paper now has 1 submission. Reload the page and try again.", submissions: 1 });
  assert.deepEqual(await rowsOf(id), { assignments: 1, questions: 1, students: 2, submissions: 1 }, "nothing is deleted");
  assert.equal(filesOf(id).length, 3, "no file is removed");

  assert.equal((await remove(id, "t1", 1)).status, 200);
  assert.deepEqual(await rowsOf(id), { assignments: 0, questions: 0, students: 0, submissions: 0 });
  assert.equal((await sql`SELECT COUNT(*)::int AS n FROM submission_marks`)[0].n, 0);
  assert.deepEqual(filesOf(id), [], "the student's upload is removed too");
});

test("only the paper's own teacher can delete it", async () => {
  const id = await paper();
  for (const [as, status] of [[null, 401], ["x", 403], ["s1", 403], ["t2", 404]] as const)
    assert.equal((await remove(id, as, 0)).status, status, `as ${as}`);
  assert.deepEqual(await rowsOf(id), { assignments: 1, questions: 1, students: 2, submissions: 0 });
  assert.equal(filesOf(id).length, 2);
});

test("a delete needs a valid id and the warned submission count", async () => {
  const id = await paper();
  assert.equal((await remove(id, "t1")).status, 400);
  assert.equal((await call(one.DELETE, { as: "t1", params: { id }, query: "submissions=-1" })).status, 400);
  assert.equal((await call(one.DELETE, { as: "t1", params: { id }, query: "submissions=one" })).status, 400);
  assert.equal((await remove("not-a-uuid", "t1", 0)).status, 404);
  assert.equal((await remove("00000000-0000-4000-8000-000000000000", "t1", 0)).status, 404);
  assert.equal((await rowsOf(id)).assignments, 1);
});

test("replacing the question paper or mark scheme removes the old PDF", async () => {
  const id = await paper();
  assert.equal((await call(paperFile.PUT, { as: "t1", params: { id }, form: { paper: pdf("qp-2") } })).status, 200);
  assert.equal((await call(schemeFile.PUT, { as: "t1", params: { id }, form: { scheme: pdf("ms-2") } })).status, 200);
  const files = filesOf(id);
  assert.equal(files.length, 2);
  assert.ok(files.some((pathname) => /question-paper-[0-9a-f-]{36}\.pdf$/.test(pathname)), "the new paper is stored");
  assert.ok(files.some((pathname) => /mark-scheme-[0-9a-f-]{36}\.pdf$/.test(pathname)), "the new scheme is stored");
  const [row] = await sql`SELECT question_paper_url, mark_scheme_url FROM assignments WHERE id = ${id}`;
  assert.deepEqual([row.question_paper_url, row.mark_scheme_url].map((url) => String(url).replace(BASE, "")).sort(), files);
});

test("two papers can share a homework book; it is removed only once neither uses it", async () => {
  const book = "homework/1b4e28ba-2fa1-4d3b-a3f5-ef19f2c3a0b1/book-2.pdf";
  stored.add(book);
  const first = await paper();
  const second = await paper();
  for (const id of [first, second])
    assert.equal((await call(paperFile.PUT, { as: "t1", params: { id }, json: { paperUrl: BASE + book } })).status, 200);
  assert.ok(!stored.has(`assignments/${second}/question-paper.pdf`), "the paper's own original is removed");
  assert.equal((await call(paperFile.PUT, { as: "t1", params: { id: second }, form: { paper: pdf("qp-3") } })).status, 200);
  assert.ok(stored.has(book), "kept while the first paper still uses it");
  assert.equal((await remove(first, "t1", 0)).status, 200);
  assert.ok(!stored.has(book), "removed with the last paper that used it");
});

test("a paper can be pointed only at an uploaded homework book, never at another file in the store", async () => {
  const id = await paper();
  for (const pathname of [
    "physics-exam/6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f",
    `submissions/${id}/s1/handwritten-page-1.png`,
    `assignments/${id}/mark-scheme.pdf`,
    "homework%2F..%2Fphysics-exam/x.pdf",
    "other/book.pdf",
  ]) {
    const refused = await call(paperFile.PUT, { as: "t1", params: { id }, json: { paperUrl: BASE + pathname } });
    assert.equal(refused.status, 400, pathname);
    const created = await call(assignments.POST, { as: "t1", form: { title: "H", className: "9A", profile: "igcse-mathematics-0580", paperMode: "structured", paperUrl: BASE + pathname, scheme: pdf("ms") } });
    assert.equal(created.status, 400, `new paper from ${pathname}`);
  }
  assert.equal((await call(paperFile.PUT, { as: "t1", params: { id }, json: { paperUrl: "https://evil.example/homework/x.pdf" } })).status, 400);
  const [row] = await sql`SELECT question_paper_url FROM assignments WHERE id = ${id}`;
  assert.equal(row.question_paper_url, BASE + `assignments/${id}/question-paper.pdf`, "unchanged");
});

test("cleanup never deletes a file outside the paper's own folders, even one the paper points at", async () => {
  const id = await paper();
  const foreign = "physics-exam/6f1c2d3e-4b5a-4c6d-8e7f-9a0b1c2d3e4f";
  stored.add(foreign);
  await sql`UPDATE assignments SET question_paper_url = ${BASE + foreign} WHERE id = ${id}`;
  assert.equal((await call(paperFile.PUT, { as: "t1", params: { id }, form: { paper: pdf("qp-2") } })).status, 200);
  assert.ok(stored.has(foreign), "kept after a replace");
  await sql`UPDATE assignments SET question_paper_url = ${BASE + foreign} WHERE id = ${id}`;
  assert.equal((await remove(id, "t1", 0)).status, 200);
  assert.ok(stored.has(foreign), "kept after a delete");
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
const submitAs = (id: string, student = "s1") =>
  call(submit.POST, { as: student, params: { id }, form: { answers: JSON.stringify([{ question: "1", answer: "4" }]) } });
const marksOf = async (id: string) => Number((await sql`
  SELECT COUNT(*)::int AS n FROM submission_marks m JOIN submissions s ON s.id = m.submission_id WHERE s.assignment_id = ${id}`)[0].n);

test("a submission that lands while the question paper is replaced keeps its questions, marks and PDF", async () => {
  const id = await paper();
  inTheGap(() => submitAs(id));
  const replaced = await call(paperFile.PUT, { as: "t1", params: { id }, form: { paper: pdf("qp-2") } });
  assert.equal(replaced.status, 409);
  assert.match(replaced.body.error, /submitted this paper just now/);
  assert.deepEqual(await rowsOf(id), { assignments: 1, questions: 1, students: 2, submissions: 1 });
  assert.equal(await marksOf(id), 1, "the mark survives");
  const [row] = await sql`SELECT question_paper_url, status FROM assignments WHERE id = ${id}`;
  assert.deepEqual([row.question_paper_url, row.status], [BASE + `assignments/${id}/question-paper.pdf`, "assigned"]);
  assert.deepEqual(filesOf(id), [`assignments/${id}/mark-scheme.pdf`, `assignments/${id}/question-paper.pdf`], "the old PDF is kept and the refused upload removed");
});

test("a submission that lands while the mark scheme is replaced keeps the scheme", async () => {
  const id = await paper();
  inTheGap(() => submitAs(id));
  const replaced = await call(schemeFile.PUT, { as: "t1", params: { id }, form: { scheme: pdf("ms-2") } });
  assert.equal(replaced.status, 409);
  const [row] = await sql`SELECT mark_scheme_url, status FROM assignments WHERE id = ${id}`;
  assert.deepEqual([row.mark_scheme_url, row.status], [BASE + `assignments/${id}/mark-scheme.pdf`, "assigned"]);
  assert.deepEqual(filesOf(id), [`assignments/${id}/mark-scheme.pdf`, `assignments/${id}/question-paper.pdf`]);
});

test("a submission that lands while the teacher deletes stops the delete", async () => {
  const id = await paper();
  inTheGap(() => submitAs(id));
  const deleted = await remove(id, "t1", 0);
  assert.equal(deleted.status, 409);
  assert.equal(deleted.body.submissions, 1);
  assert.deepEqual(await rowsOf(id), { assignments: 1, questions: 1, students: 2, submissions: 1 });
  assert.equal(await marksOf(id), 1);
});

test("a submission that arrives just after the delete is refused cleanly", async () => {
  const id = await paper();
  inTheGap(() => remove(id, "t1", 0));
  const late = await submitAs(id);
  assert.equal(late.status, 409);
  assert.deepEqual(await rowsOf(id), { assignments: 0, questions: 0, students: 0, submissions: 0 });
});
