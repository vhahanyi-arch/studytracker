import { auth, clerkClient } from "@clerk/nextjs/server";

export type Role = "teacher" | "student";

// The signed-in caller, with the role read from their Clerk account. Every
// route used to spell this out itself: auth(), then clerkClient(), then
// getUser() for publicMetadata.role. Routes still choose their own responses,
// so null (signed out) and a null role (no role yet) are left to the caller.
export async function currentViewer() {
  const { userId } = await auth();
  if (!userId) return null;
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const role = user.publicMetadata.role;
  return {
    userId,
    user,
    clerk,
    role: role === "teacher" || role === "student" ? (role as Role) : null,
  };
}

export type Viewer = NonNullable<Awaited<ReturnType<typeof currentViewer>>>;
