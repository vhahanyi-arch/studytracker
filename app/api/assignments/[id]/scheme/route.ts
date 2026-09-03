import { auth, clerkClient } from "@clerk/nextjs/server";
import { get, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access only." },
      { status: 403 },
    );
  const { id } = await context.params;
  await ensureSchema();
  const rows = await sql`
    SELECT mark_scheme_url FROM assignments
    WHERE id = ${id} AND teacher_id = ${userId} LIMIT 1
  `;
  const url = rows[0]?.mark_scheme_url as string | undefined;
  if (!url) return new NextResponse("Mark scheme not found.", { status: 404 });
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200)
    return new NextResponse("Mark scheme not found.", { status: 404 });
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.publicMetadata.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access only." },
      { status: 403 },
    );

  const form = await request.formData();
  const scheme = form.get("scheme");
  if (!(scheme instanceof File) || scheme.type !== "application/pdf")
    return NextResponse.json(
      { error: "Select a PDF mark scheme." },
      { status: 400 },
    );
  if (scheme.size > 20_000_000)
    return NextResponse.json(
      { error: "The mark scheme must be smaller than 20 MB." },
      { status: 400 },
    );

  const { id } = await context.params;
  await ensureSchema();
  const assignments = await sql`
    SELECT question_paper_url FROM assignments
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
          "This paper already has student submissions, so its mark scheme cannot be replaced safely.",
      },
      { status: 409 },
    );

  const paper = await get(String(assignments[0].question_paper_url), {
    access: "private",
  });
  if (paper?.statusCode === 200) {
    const [schemeDigest, paperDigest] = await Promise.all([
      crypto.subtle.digest("SHA-256", await scheme.arrayBuffer()),
      crypto.subtle.digest(
        "SHA-256",
        await new Response(paper.stream).arrayBuffer(),
      ),
    ]);
    const sameDocument = new Uint8Array(schemeDigest).every(
      (byte, index) => byte === new Uint8Array(paperDigest)[index],
    );
    if (sameDocument)
      return NextResponse.json(
        {
          error:
            "This is the same PDF as the question paper. Select the mark scheme instead.",
        },
        { status: 400 },
      );
  }

  const uploaded = await put(
    `assignments/${id}/mark-scheme-${crypto.randomUUID()}.pdf`,
    scheme,
    { access: "private", addRandomSuffix: false },
  );
  await sql`
    UPDATE assignments
    SET mark_scheme_url = ${uploaded.url}, status = 'needs_review'
    WHERE id = ${id} AND teacher_id = ${userId}
  `;
  return NextResponse.json({ replaced: true });
}
