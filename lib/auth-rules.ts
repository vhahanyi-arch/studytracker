// Authorization decisions for the account routes, kept free of Next and Clerk
// so they can be tested against a fake store. The routes under app/api are thin
// adapters: they supply the caller id and a UserStore, then translate the
// Outcome below into a response.

export type UserRecord = {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  publicMetadata: Record<string, unknown>;
};

// The subset of the Clerk users client these rules actually use.
export type UserStore = {
  getUserList(params: { limit: number; offset?: number; orderBy?: string }): Promise<{ data: UserRecord[] }>;
  getUser(id: string): Promise<UserRecord>;
  updateUser(id: string, params: Record<string, unknown>): Promise<unknown>;
  createUser(params: Record<string, unknown>): Promise<UserRecord>;
};

export type Outcome<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

const ok = <T>(data: T): Outcome<T> => ({ ok: true, data });
const fail = (status: number, error: string): Outcome<never> => ({ ok: false, status, error });

const PAGE = 100;
const MAX_SCANNED = 1000;

// Clerk reports validation problems (a weak or breached password, a taken
// username) in an errors array; anything else is a genuine failure.
export function clerkMessage(error: unknown, fallback: string) {
  const errors = (error as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors;
  return (
    errors?.[0]?.longMessage ||
    errors?.[0]?.message ||
    (error instanceof Error ? error.message : fallback)
  );
}

export async function findTeacher(store: UserStore) {
  for (let offset = 0; offset < MAX_SCANNED; offset += PAGE) {
    const page = await store.getUserList({ limit: PAGE, offset });
    if (!page.data.length) return null;
    const teacher = page.data.find((user) => user.publicMetadata.role === "teacher");
    if (teacher) return teacher;
    if (page.data.length < PAGE) return null;
  }
  return null;
}

async function oldestAccountId(store: UserStore) {
  const oldest = await store.getUserList({ limit: 1, orderBy: "+created_at" });
  return oldest.data[0]?.id;
}

// Bootstrap for a brand-new deployment. Granting teacher privileges is
// deliberately narrow: only while the instance has no teacher at all, and only
// for the earliest-created account, so a stranger who signs up cannot claim it.
// There is no path here to promote anyone other than the caller.
export async function claimTeacherStatus(store: UserStore, userId: string) {
  if (await findTeacher(store)) return { claimable: false, reason: "taken" as const };
  const first = (await oldestAccountId(store)) === userId;
  return { claimable: first, reason: first ? null : ("not_first" as const) };
}

export async function claimTeacher(store: UserStore, userId: string): Promise<Outcome<{ ok: true }>> {
  if (await findTeacher(store))
    return fail(409, "A teacher account already exists. Ask your teacher to create your account.");
  if ((await oldestAccountId(store)) !== userId)
    return fail(403, "Only the first account created on this workspace can claim the teacher role.");

  const caller = await store.getUser(userId);
  await store.updateUser(userId, {
    publicMetadata: { ...caller.publicMetadata, role: "teacher" },
  });
  return ok({ ok: true });
}

// Completes the forced first-sign-in password change. Refuses once
// mustChangePassword is cleared, so it cannot become a general "change my
// password without knowing the current one" endpoint -- ordinary changes go
// through the Clerk account UI, which asks for the current password.
export async function completeFirstPassword(
  store: UserStore,
  userId: string,
  password: string,
): Promise<Outcome<{ ok: true }>> {
  if (password.length < 8) return fail(400, "Choose a password with at least 8 characters.");

  const user = await store.getUser(userId);
  if (!user.publicMetadata.mustChangePassword)
    return fail(409, "This password has already been set.");

  try {
    await store.updateUser(userId, {
      password,
      // Sign out the sessions the shared temporary password could have opened.
      signOutOfOtherSessions: true,
      publicMetadata: { ...user.publicMetadata, mustChangePassword: false },
    });
    return ok({ ok: true });
  } catch (error: unknown) {
    return fail(400, clerkMessage(error, "The password could not be changed."));
  }
}

export async function requireTeacher(store: UserStore, userId: string): Promise<Outcome<UserRecord>> {
  const teacher = await store.getUser(userId);
  if (teacher.publicMetadata.role !== "teacher") return fail(403, "Teacher access is required.");
  return ok(teacher);
}

// Students are scoped to the teacher who created them, so one teacher never
// sees or touches another teacher's students.
export async function studentsOf(store: UserStore, teacherId: string) {
  const students: UserRecord[] = [];
  for (let offset = 0; offset < MAX_SCANNED; offset += PAGE) {
    const page = await store.getUserList({ limit: PAGE, offset });
    students.push(
      ...page.data.filter(
        (user) =>
          user.publicMetadata.role === "student" && user.publicMetadata.teacherId === teacherId,
      ),
    );
    if (page.data.length < PAGE) break;
  }
  return students;
}

export type StudentSummary = {
  id: string;
  name: string | null | undefined;
  username: string | null | undefined;
  mustChangePassword: boolean;
};

export async function listStudents(store: UserStore, teacherId: string): Promise<StudentSummary[]> {
  const students = await studentsOf(store, teacherId);
  return students.map((user) => ({
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username,
    username: user.username,
    mustChangePassword: Boolean(user.publicMetadata.mustChangePassword),
  }));
}

export async function createStudent(
  store: UserStore,
  teacherId: string,
  body: Record<string, unknown>,
): Promise<Outcome<{ id: string; username: string | null | undefined }>> {
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!firstName || !lastName || username.length < 4 || password.length < 8)
    return fail(400, "Complete all fields. The password must contain at least 8 characters.");
  if (!/^[a-z0-9_-]+$/.test(username))
    return fail(400, "Use only letters, numbers, underscores or hyphens in the username.");

  try {
    const student = await store.createUser({
      firstName,
      lastName,
      username,
      password,
      // The teacher types this password and hands it over, so it is shared by
      // construction; the student is required to replace it at first sign-in.
      publicMetadata: { role: "student", teacherId, mustChangePassword: true },
    });
    return ok({ id: student.id, username: student.username });
  } catch (error: unknown) {
    return fail(400, clerkMessage(error, "The account could not be created."));
  }
}

export async function resetStudentPassword(
  store: UserStore,
  teacherId: string,
  body: Record<string, unknown>,
): Promise<Outcome<{ ok: true; username: string | null | undefined }>> {
  const studentId = String(body.studentId ?? "");
  const password = String(body.password ?? "");
  if (password.length < 8) return fail(400, "The password must contain at least 8 characters.");

  const student = await store.getUser(studentId).catch(() => null);
  if (
    !student ||
    student.publicMetadata.role !== "student" ||
    student.publicMetadata.teacherId !== teacherId
  )
    return fail(404, "That student was not found.");

  try {
    await store.updateUser(studentId, {
      password,
      publicMetadata: { ...student.publicMetadata, mustChangePassword: true },
    });
    return ok({ ok: true, username: student.username });
  } catch (error: unknown) {
    return fail(400, clerkMessage(error, "The password could not be reset."));
  }
}
