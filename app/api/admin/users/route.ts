import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createStudent,
  listStudents,
  requireTeacher,
  resetStudentPassword,
  type Outcome,
  type UserStore,
} from "@/lib/auth-rules";

// Teacher-only student administration. The scoping rule -- every student is
// owned by the teacher who created them, so one teacher can never list or
// touch another teacher's students -- lives in lib/auth-rules.ts with its tests.
async function teacherSession() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };

  const clerk = await clerkClient();
  const store = clerk.users as UserStore;
  const guard = await requireTeacher(store, userId);
  if (!guard.ok)
    return { error: NextResponse.json({ error: guard.error }, { status: guard.status }) };
  return { userId, store };
}

function respond<T>(result: Outcome<T>) {
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}

export async function GET() {
  const session = await teacherSession();
  if (session.error) return session.error;
  return NextResponse.json(await listStudents(session.store, session.userId));
}

export async function POST(request: Request) {
  const session = await teacherSession();
  if (session.error) return session.error;
  return respond(await createStudent(session.store, session.userId, await request.json()));
}

// Reset a student's password. Scoped to the teacher's own students so one
// teacher cannot reset another teacher's student, or any teacher account.
export async function PATCH(request: Request) {
  const session = await teacherSession();
  if (session.error) return session.error;
  return respond(await resetStudentPassword(session.store, session.userId, await request.json()));
}
