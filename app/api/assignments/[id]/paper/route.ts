import { currentViewer } from "@/lib/session";
import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { readJsonObject, unreadableBody } from "@/lib/request-body";
import { homeworkUploadUrl, removeUnusedFiles } from "@/lib/assignment-files";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await currentViewer();
  if (!session)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, user } = session;
  const role = user.publicMetadata.role;
  if (role !== "teacher" && role !== "student")
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  const { id } = await context.params;
  await ensureSchema();
  const rows =
    role === "teacher"
      ? await sql`SELECT question_paper_url FROM assignments WHERE id = ${id} AND teacher_id = ${userId} LIMIT 1`
      : await sql`SELECT a.question_paper_url FROM assignments a WHERE a.id = ${id} AND a.status = 'assigned' AND (EXISTS (SELECT 1 FROM assignment_students s WHERE s.assignment_id=a.id AND s.student_id=${userId}) OR ((a.is_practice_library=TRUE OR a.resource_kind='homework') AND EXISTS (SELECT 1 FROM lower_secondary_enrollments e WHERE e.student_id=${userId} AND e.teacher_id=a.teacher_id AND e.stage>=a.lower_secondary_stage))) LIMIT 1`;
  const url = rows[0]?.question_paper_url as string | undefined;
  if (!url) return new NextResponse("Paper not found.", { status: 404 });
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200)
    return new NextResponse("Paper not found.", { status: 404 });
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

const SUBMITTED_MEANWHILE = "A student submitted this paper just now, so its question paper cannot be replaced safely.";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await currentViewer();
  if (!session)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { userId, user } = session;
  if (user.publicMetadata.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access only." },
      { status: 403 },
    );

  const isJson = request.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await readJsonObject(request) : null;
  if (isJson && !payload) return unreadableBody();
  const form = isJson ? null : await request.formData();
  const paper = form?.get("paper");
  // Only a homework book this app's browser uploaded; anything else is refused below.
  const directUrl = homeworkUploadUrl(payload?.paperUrl);
  if (!directUrl && (!(paper instanceof File) || paper.type !== "application/pdf"))
    return NextResponse.json(
      { error: "Select a PDF question paper." },
      { status: 400 },
    );
  if (paper instanceof File && paper.size > 20_000_000)
    return NextResponse.json(
      { error: "The question paper must be smaller than 20 MB." },
      { status: 400 },
    );

  const { id } = await context.params;
  await ensureSchema();
  const assignments = await sql`
    SELECT question_paper_url, mark_scheme_url FROM assignments
    WHERE id = ${id} AND teacher_id = ${userId} LIMIT 1
  `;
  if (!assignments.length)
    return NextResponse.json(
      { error: "Assignment not found." },
      { status: 404 },
    );
  const submissions = await sql`
    SELECT 1 FROM submissions WHERE assignment_id = ${id} LIMIT 1
  `;
  if (submissions.length)
    return NextResponse.json(
      {
        error:
          "This paper already has student submissions, so its question paper cannot be replaced safely.",
      },
      { status: 409 },
    );

  const schemeUrl = assignments[0].mark_scheme_url ? String(assignments[0].mark_scheme_url) : null;
  const scheme = schemeUrl ? await get(schemeUrl, { access: "private" }) : null;
  if (paper instanceof File && scheme?.statusCode === 200) {
    const [paperDigest, schemeDigest] = await Promise.all([
      crypto.subtle.digest("SHA-256", await paper.arrayBuffer()),
      crypto.subtle.digest(
        "SHA-256",
        await new Response(scheme.stream).arrayBuffer(),
      ),
    ]);
    const sameDocument = new Uint8Array(paperDigest).every(
      (byte, index) => byte === new Uint8Array(schemeDigest)[index],
    );
    if (sameDocument)
      return NextResponse.json(
        {
          error:
            "This is the same PDF as the mark scheme. Select the question paper instead.",
        },
        { status: 400 },
      );
  }

  const uploaded = paper instanceof File ? await put(
    `assignments/${id}/question-paper-${crypto.randomUUID()}.pdf`, paper,
    { access: "private", addRandomSuffix: false },
  ) : null;
  const nextUrl = uploaded?.url || directUrl!;
  // The check above ran before the upload, seconds ago. The row lock waits for
  // any submission being written; each statement then re-checks with a fresh
  // read-committed snapshot, so a submission that landed meanwhile keeps its
  // questions and marks, and this replace is refused (as for Known issues #19).
  const [, updated] = await sql.transaction([
    sql`SELECT id FROM assignments WHERE id = ${id} FOR UPDATE`,
    sql`
      UPDATE assignments
      SET question_paper_url = ${nextUrl}, status = 'needs_setup'
      WHERE id = ${id} AND teacher_id = ${userId}
        AND NOT EXISTS (SELECT 1 FROM submissions WHERE assignment_id = ${id})
      RETURNING id
    `,
    sql`DELETE FROM assignment_questions WHERE assignment_id = ${id} AND NOT EXISTS (SELECT 1 FROM submissions WHERE assignment_id = ${id})`,
  ], { isolationLevel: "ReadCommitted" });
  if (!updated.length) {
    if (uploaded) await removeUnusedFiles(id, [uploaded.url], `assignment ${id} paper replace refused`);
    return NextResponse.json({ error: SUBMITTED_MEANWHILE }, { status: 409 });
  }
  // The replaced PDF is no longer this paper's; remove it unless another paper uses it.
  await removeUnusedFiles(id, [assignments[0].question_paper_url], `assignment ${id} paper replaced`);
  return NextResponse.json({ replaced: true, resetQuestions: true });
}
