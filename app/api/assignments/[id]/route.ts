import { NextResponse } from "next/server";
import { currentViewer } from "@/lib/session";
import { ensureSchema, sql } from "@/lib/db";
import { assignmentFiles, removeUnusedFiles } from "@/lib/assignment-files";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SUBMISSIONS_CHANGED = (count: number) =>
  `This paper now has ${count} submission${count === 1 ? "" : "s"}. Reload the page and try again.`;

// Deletes a paper with everything that hangs off it: its questions, the
// students it was set for, their drafts, submissions and marks (all cascade),
// then its files in Blob. ?submissions= is how many submissions the teacher
// was warned about: if a student has submitted since, nothing is deleted, so
// no work goes unannounced (as for Exam papers).
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const viewer = await currentViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (viewer.role !== "teacher")
    return NextResponse.json({ error: "Teacher access is required." }, { status: 403 });
  const { id } = await context.params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  const given = new URL(request.url).searchParams.get("submissions");
  const warned = Number(given);
  if (!given || !Number.isInteger(warned) || warned < 0)
    return NextResponse.json({ error: "Say how many submissions will be deleted." }, { status: 400 });

  await ensureSchema();
  const found = await sql`
    SELECT question_paper_url, mark_scheme_url FROM assignments
    WHERE id = ${id} AND teacher_id = ${viewer.userId} LIMIT 1
  `;
  if (!found.length) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

  // The lock waits for any submission being written to commit; the delete,
  // with a fresh read-committed snapshot, then counts it. A submission that
  // arrives after the lock fails its foreign key once the row is gone.
  const [, deleted] = await sql.transaction([
    sql`SELECT id FROM assignments WHERE id = ${id} FOR UPDATE`,
    sql`
      DELETE FROM assignments a
      WHERE a.id = ${id} AND a.teacher_id = ${viewer.userId}
        AND (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.id) = ${warned}
      RETURNING a.id
    `,
  ], { isolationLevel: "ReadCommitted" });
  if (!deleted.length) {
    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM submissions WHERE assignment_id = ${id}`;
    return NextResponse.json({ error: SUBMISSIONS_CHANGED(Number(count)), submissions: Number(count) }, { status: 409 });
  }

  const files = await assignmentFiles(id, [found[0].question_paper_url, found[0].mark_scheme_url]);
  const removed = await removeUnusedFiles(id, files, `assignment ${id} deleted`);
  console.info(`[papers] deleted assignment ${id} with ${warned} submission(s), ${removed} file(s)`);
  return NextResponse.json({ deleted: id });
}
