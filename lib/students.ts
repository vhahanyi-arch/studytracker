// Student accounts for teacher screens. Routes used to call users.getUser once
// per row, and not all of them survived an account deleted in the Clerk
// dashboard: the marking queue failed outright. Here accounts come from batched
// list calls, and an account that no longer exists is simply absent.

export type NamedUser = {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  publicMetadata?: Record<string, unknown>;
};

// The subset of the Clerk users client this needs, so it can be tested.
export type UserLister = {
  getUserList(params: { userId: string[]; limit: number }): Promise<{ data: NamedUser[] }>;
};

export function displayName(user: NamedUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Student";
}

// Clerk accepts up to 500 ids per list call; 100 keeps each request small.
const BATCH = 100;

export async function accountsById(users: UserLister, ids: Iterable<unknown>) {
  const unique = [...new Set(Array.from(ids).filter((id) => id !== null && id !== undefined && id !== "").map(String))];
  const accounts = new Map<string, NamedUser>();
  for (let start = 0; start < unique.length; start += BATCH) {
    const batch = unique.slice(start, start + BATCH);
    const { data } = await users.getUserList({ userId: batch, limit: batch.length });
    for (const user of data) accounts.set(user.id, user);
  }
  return accounts;
}

export async function studentNames(users: UserLister, ids: Iterable<unknown>) {
  const accounts = await accountsById(users, ids);
  return (id: unknown) => {
    const account = accounts.get(String(id));
    return account ? displayName(account) : "Student";
  };
}
