import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const clerk = await clerkClient();
  const teacher = await clerk.users.getUser(userId);
  if (teacher.publicMetadata.role !== "teacher")
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 403 },
    );
  const users = await clerk.users.getUserList({ limit: 100 });
  return NextResponse.json(
    users.data
      .filter((user) => user.publicMetadata.role === "student")
      .map((user) => ({
        id: user.id,
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.username,
        username: user.username,
      })),
  );
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const clerk = await clerkClient();
  const teacher = await clerk.users.getUser(userId);
  if (teacher.publicMetadata.role !== "teacher") {
    return NextResponse.json(
      { error: "Teacher access is required." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const username = String(body.username ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  if (!firstName || !lastName || username.length < 4 || password.length < 8) {
    return NextResponse.json(
      {
        error:
          "Complete all fields. The password must contain at least 8 characters.",
      },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json(
      {
        error:
          "Use only letters, numbers, underscores or hyphens in the username.",
      },
      { status: 400 },
    );
  }

  try {
    const student = await clerk.users.createUser({
      firstName,
      lastName,
      username,
      password,
      publicMetadata: { role: "student", teacherId: userId },
    });
    return NextResponse.json({ id: student.id, username: student.username });
  } catch (error: unknown) {
    const clerkErrors = (
      error as { errors?: Array<{ longMessage?: string; message?: string }> }
    )?.errors;
    const message =
      clerkErrors?.[0]?.longMessage ||
      clerkErrors?.[0]?.message ||
      (error instanceof Error
        ? error.message
        : "The account could not be created.");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
