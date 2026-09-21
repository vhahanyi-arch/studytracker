import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { completeFirstPassword, type UserStore } from "@/lib/auth-rules";

// Completes the forced first-sign-in password change. The rule that it refuses
// once mustChangePassword is cleared -- so this cannot become a general "change
// my password without knowing the current one" endpoint -- lives in
// lib/auth-rules.ts, where it is covered by tests.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const password = String((await request.json()).password ?? "");
  const clerk = await clerkClient();

  const result = await completeFirstPassword(
    clerk.users as UserStore,
    userId,
    password,
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}
