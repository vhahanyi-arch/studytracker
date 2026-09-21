import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PAGE = 100;
const MAX_SCANNED = 1000;

async function requireTeacher() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  const clerk = await clerkClient();
  const teacher = await clerk.users.getUser(userId);
  if (teacher.publicMetadata.role !== "teacher")
    return { error: NextResponse.json({ error: "Teacher access is required." }, { status: 403 }) };
  return { userId, clerk };
}

// Students are scoped to the teacher who created them. Previously this listed
// every student in the Clerk instance regardless of teacherId, which is
// correct only while exactly one teacher exists.
async function studentsOf(clerk: Awaited<ReturnType<typeof clerkClient>>, teacherId: string) {
  const students = [];
  for (let offset = 0; offset < MAX_SCANNED; offset += PAGE) {
    const page = await clerk.users.getUserList({ limit: PAGE, offset });
    students.push(
      ...page.data.filter(
        (user) =>
          user.publicMetadata.role === "student" &&
          user.publicMetadata.teacherId === teacherId,
      ),
    );
    if (page.data.length < PAGE) break;
  }
  return students;
}

export async function GET() {
  const guard = await requireTeacher();
  if (guard.error) return guard.error;
  const { clerk, userId } = guard;

  const students = await studentsOf(clerk, userId);
  return NextResponse.json(
    students.map((user) => ({
      id: user.id,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
      username: user.username,
      mustChangePassword: Boolean(user.publicMetadata.mustChangePassword),
    })),
  );
}

export async function POST(request: Request) {
  const guard = await requireTeacher();
  if (guard.error) return guard.error;
  const { clerk, userId } = guard;

  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!firstName || !lastName || username.length < 4 || password.length < 8) {
    return NextResponse.json(
      { error: "Complete all fields. The password must contain at least 8 characters." },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json(
      { error: "Use only letters, numbers, underscores or hyphens in the username." },
      { status: 400 },
    );
  }

  try {
    const student = await clerk.users.createUser({
      firstName,
      lastName,
      username,
      password,
      // The teacher types this password and hands it over, so it is shared by
      // construction; the student is required to replace it at first sign-in.
      publicMetadata: { role: "student", teacherId: userId, mustChangePassword: true },
    });
    return NextResponse.json({ id: student.id, username: student.username });
  } catch (error: unknown) {
    const clerkErrors = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors;
    const message =
      clerkErrors?.[0]?.longMessage ||
      clerkErrors?.[0]?.message ||
      (error instanceof Error ? error.message : "The account could not be created.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Reset a student's password. Scoped to the teacher's own students so one
// teacher cannot reset another teacher's student, or any teacher account.
export async function PATCH(request: Request) {
  const guard = await requireTeacher();
  if (guard.error) return guard.error;
  const { clerk, userId } = guard;

  const body = await request.json();
  const studentId = String(body.studentId ?? "");
  const password = String(body.password ?? "");
  if (password.length < 8)
    return NextResponse.json(
      { error: "The password must contain at least 8 characters." },
      { status: 400 },
    );

  const student = await clerk.users.getUser(studentId).catch(() => null);
  if (
    !student ||
    student.publicMetadata.role !== "student" ||
    student.publicMetadata.teacherId !== userId
  )
    return NextResponse.json({ error: "That student was not found." }, { status: 404 });

  try {
    await clerk.users.updateUser(studentId, {
      password,
      publicMetadata: { ...student.publicMetadata, mustChangePassword: true },
    });
    return NextResponse.json({ ok: true, username: student.username });
  } catch (error: unknown) {
    const clerkErrors = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors;
    const message =
      clerkErrors?.[0]?.longMessage ||
      clerkErrors?.[0]?.message ||
      (error instanceof Error ? error.message : "The password could not be reset.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
