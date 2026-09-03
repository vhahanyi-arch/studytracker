import { auth, clerkClient } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

type HandwrittenFile = { url: string; name?: string; type?: string };

const filesFromStoredValue = (value: unknown): HandwrittenFile[] => {
  const stored = String(value || "").trim();
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed))
      return parsed.filter((item) => item && typeof item.url === "string");
  } catch {}
  return [{ url: stored, name: "Handwritten work" }];
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Please sign in.", { status: 401 });
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const { id } = await context.params;
  const pageIndex = Math.max(0, Number(new URL(request.url).searchParams.get("page")) || 0);
  await ensureSchema();
  const rows =
    user.publicMetadata.role === "teacher"
      ? await sql`SELECT s.handwritten_url FROM submissions s JOIN assignments a ON a.id = s.assignment_id WHERE s.id = ${id} AND a.teacher_id = ${userId}`
      : await sql`SELECT handwritten_url FROM submissions WHERE id = ${id} AND student_id = ${userId} AND status = 'published'`;
  if (!rows.length) return new NextResponse("Not found.", { status: 404 });
  const files = filesFromStoredValue(rows[0].handwritten_url);
  const file = files[pageIndex];
  if (!file) return new NextResponse("Handwritten page not found.", { status: 404 });
  const result = await get(file.url, { access: "private" });
  if (!result || result.statusCode !== 200)
    return new NextResponse("Handwritten page not found.", { status: 404 });
  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": file.type || result.blob.contentType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${String(file.name || `handwritten-page-${pageIndex + 1}`).replace(/["\r\n]/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
