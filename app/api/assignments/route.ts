import { auth, clerkClient } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata.role;
  return role === "teacher" || role === "student" ? { userId, role } : null;
}

export async function GET() {
  const viewer = await requireUser();
  if (!viewer)
    return NextResponse.json(
      { error: "Signed-in access is required." },
      { status: 403 },
    );
  await ensureSchema();
  const rows =
    viewer.role === "teacher"
      ? await sql`SELECT id, title, subject, syllabus, paper_mode, class_name, due_date, status, created_at, lower_secondary_stage, is_practice_library, source_year, resource_kind, content_start_page, content_end_page FROM assignments WHERE teacher_id = ${viewer.userId} ORDER BY created_at DESC`
      : await sql`
          SELECT a.id, a.title, a.subject, a.syllabus, a.paper_mode,
            a.class_name, a.due_date, a.status, a.created_at,
            CASE
              WHEN sub.status = 'published' THEN 'result_available'
              WHEN sub.status = 'awaiting_review' THEN 'awaiting_review'
              WHEN sub.id IS NOT NULL THEN 'submitted'
              WHEN draft.assignment_id IS NOT NULL THEN 'in_progress'
              ELSE 'not_started'
            END AS student_status,
            draft.updated_at AS draft_updated_at,
            sub.submitted_at
          FROM assignments a
          JOIN assignment_students s ON s.assignment_id = a.id
          LEFT JOIN student_answer_drafts draft
            ON draft.assignment_id = a.id AND draft.student_id = ${viewer.userId}
          LEFT JOIN submissions sub
            ON sub.assignment_id = a.id AND sub.student_id = ${viewer.userId}
          WHERE s.student_id = ${viewer.userId} AND a.status = 'assigned' AND a.is_practice_library = FALSE
          ORDER BY a.created_at DESC
        `;
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const viewer = await requireUser();
  if (!viewer || viewer.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 403 },
    );
  const teacherId = viewer.userId;
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const className = String(form.get("className") ?? "").trim();
  const profile = String(form.get("profile") ?? "igcse-mathematics-0580");
  const profiles: Record<string, { subject: string; syllabus: string }> = {
    "igcse-mathematics-0580": { subject: "Mathematics", syllabus: "0580" },
    "igcse-physics-0625": { subject: "Physics", syllabus: "0625" },
    "as-mathematics-9709": { subject: "Mathematics", syllabus: "9709" },
    "as-physics-9702": { subject: "Physics", syllabus: "9702" },
    "cambridge-general": { subject: "Cambridge", syllabus: "General" },
    "lower-secondary-stage8": { subject: "Mathematics", syllabus: "Stage 8" },
    "lower-secondary-stage9": { subject: "Mathematics", syllabus: "Stage 9" },
    "lower-secondary-homework": { subject: "Mathematics", syllabus: "Lower Secondary" },
  };
  const selectedProfile = profiles[profile];
  const paperMode = String(form.get("paperMode") ?? "structured") === "multiple_choice"
    ? "multiple_choice"
    : "structured";
  const dueDate = String(form.get("dueDate") ?? "").trim() || null;
  const isPracticeLibrary = String(form.get("library") ?? "") === "true";
  const resourceKind = String(form.get("resourceKind") ?? "exam") === "homework"
    ? "homework"
    : "exam";
  const requestedStage = Number(form.get("stage"));
  const lowerSecondaryStage = (isPracticeLibrary || resourceKind === "homework") && (requestedStage === 8 || requestedStage === 9) ? requestedStage : null;
  const sourceYear = String(form.get("year") ?? "").trim().slice(0, 20) || null;
  const contentStartPage = resourceKind === "homework" ? Math.max(1, Math.round(Number(form.get("contentStartPage")) || 1)) : null;
  const requestedEndPage = Math.round(Number(form.get("contentEndPage")) || 0);
  const contentEndPage = resourceKind === "homework" && requestedEndPage >= Number(contentStartPage) ? requestedEndPage : null;
  const paper = form.get("paper");
  const scheme = form.get("scheme");
  const paperUrlValue = String(form.get("paperUrl") ?? "").trim();
  let paperUrl: string | null = null;
  if (paperUrlValue) {
    try {
      const parsed = new URL(paperUrlValue);
      if (parsed.protocol === "https:" && parsed.hostname.endsWith("blob.vercel-storage.com")) paperUrl = parsed.toString();
    } catch {}
  }
  if (
    !title ||
    !className ||
    !selectedProfile ||
    (!(paper instanceof File) && !paperUrl) ||
    (resourceKind !== "homework" && !(scheme instanceof File))
  )
    return NextResponse.json(
      { error: resourceKind === "homework" ? "Add a title, class and homework PDF." : "Add a title, class, question paper and mark scheme." },
      { status: 400 },
    );
  if ((paper instanceof File && paper.type !== "application/pdf") || (scheme instanceof File && scheme.type !== "application/pdf"))
    return NextResponse.json(
      { error: "Uploaded documents must be PDF files." },
      { status: 400 },
    );
  if ((paper instanceof File && paper.size > (resourceKind === "homework" ? 60_000_000 : 20_000_000)) || (scheme instanceof File && scheme.size > 20_000_000))
    return NextResponse.json(
      { error: resourceKind === "homework" ? "The homework PDF must be smaller than 60 MB." : "Each PDF must be smaller than 20 MB." },
      { status: 400 },
    );

  if (paper instanceof File && scheme instanceof File) {
    const [paperDigest, schemeDigest] = await Promise.all([
      crypto.subtle.digest("SHA-256", await paper.arrayBuffer()),
      crypto.subtle.digest("SHA-256", await scheme.arrayBuffer()),
    ]);
    const sameDocument = new Uint8Array(paperDigest).every(
      (byte, index) => byte === new Uint8Array(schemeDigest)[index],
    );
    if (sameDocument)
      return NextResponse.json(
        { error: "The question paper and mark scheme are the same PDF. Please select the mark scheme in the second upload box." },
        { status: 400 },
      );
  }

  const id = crypto.randomUUID();
  const [paperBlob, schemeBlob] = await Promise.all([
    paper instanceof File ? put(`assignments/${id}/question-paper.pdf`, paper, { access: "private", addRandomSuffix: false }) : null,
    scheme instanceof File ? put(`assignments/${id}/mark-scheme.pdf`, scheme, { access: "private", addRandomSuffix: false }) : null,
  ]);
  const savedPaperUrl = paperBlob?.url || paperUrl!;
  const savedSchemeUrl = schemeBlob?.url || null;
  await ensureSchema();
  await sql`INSERT INTO assignments (id, teacher_id, title, subject, syllabus, paper_mode, class_name, due_date, question_paper_url, mark_scheme_url, status, lower_secondary_stage, is_practice_library, source_year, resource_kind, content_start_page, content_end_page) VALUES (${id}, ${teacherId}, ${title}, ${selectedProfile.subject}, ${selectedProfile.syllabus}, ${paperMode}, ${className}, ${dueDate}, ${savedPaperUrl}, ${savedSchemeUrl}, 'needs_setup', ${lowerSecondaryStage}, ${isPracticeLibrary}, ${sourceYear}, ${resourceKind}, ${contentStartPage}, ${contentEndPage})`;
  return NextResponse.json({ id, title, paper_mode: paperMode, status:"needs_setup", lower_secondary_stage:lowerSecondaryStage, is_practice_library:isPracticeLibrary, source_year:sourceYear, resource_kind:resourceKind, content_start_page:contentStartPage, content_end_page:contentEndPage, ...selectedProfile });
}
