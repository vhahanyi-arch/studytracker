import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { sql, ensureSchema } from "@/lib/db";
import { getFile } from "@/lib/physics-exam-storage";

export const runtime = "nodejs";

// A file's id can appear in three places: a paper's own uploaded PDFs
// (files array), an individual answer's attached file, or a submission's
// wholePaperFiles. Rather than parse and search JSON payloads for every
// paper and submission a user can reach, this checks JSONB containment
// directly in SQL, scoped to papers/submissions the requester actually owns
// or is otherwise entitled to see (teacher: their own papers and any
// submission to them; student: their own submissions and papers from their
// own teacher).
async function canAccessFile(userId: string, role: unknown, fileId: string): Promise<boolean> {
  if (role === "teacher") {
    const rows = await sql`
      SELECT 1 FROM physics_exam_papers
      WHERE teacher_id=${userId} AND payload::text LIKE ${"%" + fileId + "%"}
      UNION
      SELECT 1 FROM physics_exam_submissions s
      JOIN physics_exam_papers p ON p.id = s.paper_id
      WHERE p.teacher_id=${userId} AND s.payload::text LIKE ${"%" + fileId + "%"}
      LIMIT 1
    `;
    return rows.length > 0;
  }
  if (role === "student") {
    const rows = await sql`
      SELECT 1 FROM physics_exam_submissions
      WHERE student_id=${userId} AND payload::text LIKE ${"%" + fileId + "%"}
      UNION
      SELECT 1 FROM physics_exam_papers p
      JOIN lower_secondary_enrollments e ON e.teacher_id = p.teacher_id
      WHERE e.student_id=${userId} AND p.payload::text LIKE ${"%" + fileId + "%"}
      LIMIT 1
    `;
    return rows.length > 0;
  }
  return false;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return NextResponse.json({ error: "Invalid file ID." }, { status: 400 });
  await ensureSchema();
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  try {
    const allowed = await canAccessFile(userId, user.publicMetadata.role, id);
    if (!allowed) return NextResponse.json({ error: "File not found." }, { status: 404 });
    const { meta, bytes } = await getFile(id);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": meta.mime,
        "Content-Disposition": "inline; filename=\"" + meta.name.replace(/"/g, "") + "\"",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
