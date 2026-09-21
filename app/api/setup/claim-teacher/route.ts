import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Bootstrap for a brand-new deployment. Previously the first teacher role had
// to be set by hand-editing publicMetadata in the Clerk dashboard, which is a
// hard stop for anyone who is not the developer.
//
// This grants teacher privileges, so it is deliberately narrow: it works only
// while the instance has no teacher at all, and only for the earliest-created
// account. Once a teacher exists every later call is refused, and before that
// a stranger who signs up cannot claim it because they are not the oldest
// account. There is no path here to promote anyone other than the caller.
const PAGE = 100;
const MAX_SCANNED = 1000;

async function findTeacher(clerk: Awaited<ReturnType<typeof clerkClient>>) {
  for (let offset = 0; offset < MAX_SCANNED; offset += PAGE) {
    const page = await clerk.users.getUserList({ limit: PAGE, offset });
    if (!page.data.length) return null;
    const teacher = page.data.find((user) => user.publicMetadata.role === "teacher");
    if (teacher) return teacher;
    if (page.data.length < PAGE) return null;
  }
  return null;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const clerk = await clerkClient();
  const teacher = await findTeacher(clerk);
  if (teacher) return NextResponse.json({ claimable: false, reason: "taken" });

  const oldest = await clerk.users.getUserList({ limit: 1, orderBy: "+created_at" });
  return NextResponse.json({
    claimable: oldest.data[0]?.id === userId,
    reason: oldest.data[0]?.id === userId ? null : "not_first",
  });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const clerk = await clerkClient();

  if (await findTeacher(clerk))
    return NextResponse.json(
      { error: "A teacher account already exists. Ask your teacher to create your account." },
      { status: 409 },
    );

  const oldest = await clerk.users.getUserList({ limit: 1, orderBy: "+created_at" });
  if (oldest.data[0]?.id !== userId)
    return NextResponse.json(
      { error: "Only the first account created on this workspace can claim the teacher role." },
      { status: 403 },
    );

  const caller = await clerk.users.getUser(userId);
  await clerk.users.updateUser(userId, {
    publicMetadata: { ...caller.publicMetadata, role: "teacher" },
  });
  return NextResponse.json({ ok: true });
}
