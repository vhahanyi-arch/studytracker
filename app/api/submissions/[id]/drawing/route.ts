import { auth, clerkClient } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Please sign in.", { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const { id } = await context.params;
  const index = Math.max(
    0,
    Number(new URL(request.url).searchParams.get("index")) || 0,
  );
  await ensureSchema();
  const rows =
    user.publicMetadata.role === "teacher"
      ? await sql`SELECT s.answer_text FROM submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.id = ${id} AND a.teacher_id = ${userId}`
      : await sql`SELECT answer_text FROM submissions WHERE id = ${id} AND student_id = ${userId} AND status = 'published'`;
  if (!rows.length) return new NextResponse("Not found.", { status: 404 });
  let answers: any[] = [];
  try {
    answers = JSON.parse(String(rows[0].answer_text || "[]"));
  } catch {}
  const url = answers[index]?.drawingUrl;
  if (!url) return new NextResponse("Drawing not found.", { status: 404 });
  const result = await get(url, { access: "private" });
  if (!result || result.statusCode !== 200)
    return new NextResponse("Drawing not found.", { status: 404 });
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}
