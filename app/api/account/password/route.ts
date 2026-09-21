import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Completes the forced first-sign-in password change. Deliberately refuses
// once mustChangePassword is cleared, so this cannot be used as a general
// "change my password without knowing the current one" endpoint -- ordinary
// changes go through Clerk's own account UI, which asks for the current
// password. The caller can only ever change their own password.
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const password = String((await request.json()).password ?? "");
  if (password.length < 8)
    return NextResponse.json(
      { error: "Choose a password with at least 8 characters." },
      { status: 400 },
    );

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (!user.publicMetadata.mustChangePassword)
    return NextResponse.json({ error: "This password has already been set." }, { status: 409 });

  try {
    await clerk.users.updateUser(userId, {
      password,
      // Sign out the sessions the shared temporary password could have opened.
      signOutOfOtherSessions: true,
      publicMetadata: { ...user.publicMetadata, mustChangePassword: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const clerkErrors = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors;
    const message =
      clerkErrors?.[0]?.longMessage ||
      clerkErrors?.[0]?.message ||
      (error instanceof Error ? error.message : "The password could not be changed.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
