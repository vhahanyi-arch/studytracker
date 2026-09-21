import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { claimTeacher, claimTeacherStatus, type UserStore } from "@/lib/auth-rules";

// Bootstrap for a brand-new deployment. Previously the first teacher role had
// to be set by hand-editing publicMetadata in the Clerk dashboard, which is a
// hard stop for anyone who is not the developer. The rules that decide who may
// claim it live in lib/auth-rules.ts, where they are covered by tests.
async function caller() {
  const { userId } = await auth();
  if (!userId) return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  const clerk = await clerkClient();
  return { userId, store: clerk.users as UserStore };
}

export async function GET() {
  const session = await caller();
  if (session.error) return session.error;
  return NextResponse.json(await claimTeacherStatus(session.store, session.userId));
}

export async function POST() {
  const session = await caller();
  if (session.error) return session.error;

  const result = await claimTeacher(session.store, session.userId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}
