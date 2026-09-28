// Stands in for @clerk/nextjs/server: a signed-in caller and a list of
// accounts. getUser throws for a missing account, as Clerk does.
type Account = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  publicMetadata: Record<string, unknown>;
};

const state = { caller: null as string | null, accounts: [] as Account[], calls: 0 };

export function signIn(id: string | null) {
  state.caller = id;
}
export function setAccounts(accounts: Account[]) {
  state.accounts = accounts.map((account) => ({
    ...account,
    // As Clerk's User.fullName: first and last name, or null.
    fullName: `${account.firstName ?? ""} ${account.lastName ?? ""}`.trim() || null,
    publicMetadata: { ...account.publicMetadata },
  }));
}
export const clerkCalls = () => state.calls;

export async function auth() {
  return { userId: state.caller };
}

export async function clerkClient() {
  return {
    users: {
      async getUser(id: string) {
        state.calls++;
        const account = state.accounts.find((candidate) => candidate.id === id);
        if (!account) throw Object.assign(new Error("Not Found"), { status: 404 });
        return account;
      },
      async getUserList(params: { userId?: string[]; limit?: number; offset?: number } = {}) {
        state.calls++;
        const matching = params.userId ? state.accounts.filter((account) => params.userId!.includes(account.id)) : state.accounts;
        const offset = params.offset ?? 0;
        return { data: matching.slice(offset, offset + (params.limit ?? 10)), totalCount: matching.length };
      },
    },
  };
}
