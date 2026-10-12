// Preview deployments get their own database, file store and Clerk key, under
// names only this code reads: PREVIEW_DATABASE_URL, PREVIEW_BLOB_READ_WRITE_TOKEN
// and PREVIEW_CLERK_SECRET_KEY (Known issues #17). The live DATABASE_URL is one
// variable for every environment, so a preview must never fall back to it: when
// its own value is missing or points at the live database, it gets none at all.
// Code built before this file ignores the PREVIEW_ names, so a preview of an old
// branch stays unable to sign in rather than reaching live data.

type Env = Record<string, string | undefined>;

export const isPreview = (env: Env = process.env) => env.VERCEL_ENV === "preview";

// Parses as a connection string, and fails at the first query: a preview with
// no database of its own answers errors instead of touching the live one.
export const NO_PREVIEW_DATABASE = "postgresql://preview:none@preview-has-no-database.invalid/none";

// The Neon compute endpoint behind a connection string ("ep-…"), the same for
// its pooled and direct hosts. Another branch has another endpoint.
function endpoint(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url.trim()).hostname.toLowerCase().split(".")[0].replace(/-pooler$/, "");
  } catch {
    return null;
  }
}

export function databaseUrl(env: Env = process.env, warn: (line: string) => void = console.error): string {
  if (!isPreview(env)) return env.DATABASE_URL!;
  const own = env.PREVIEW_DATABASE_URL?.trim();
  if (!own) {
    warn("[preview] PREVIEW_DATABASE_URL is not set, so this preview has no database. It will not use the live one.");
    return NO_PREVIEW_DATABASE;
  }
  const ownEndpoint = endpoint(own);
  if (!ownEndpoint) {
    warn("[preview] PREVIEW_DATABASE_URL is not a connection string, so this preview has no database.");
    return NO_PREVIEW_DATABASE;
  }
  if (ownEndpoint === endpoint(env.DATABASE_URL)) {
    warn("[preview] PREVIEW_DATABASE_URL points at the live database, so this preview has no database.");
    return NO_PREVIEW_DATABASE;
  }
  return own;
}

// Run once at server start, before any Blob call. The Blob SDK prefers a
// connected store (BLOB_STORE_ID with Vercel's OIDC token) over the token, so a
// preview drops that and uses only its own token; without one it has none.
export function usePreviewBlobStore(env: Env = process.env, warn: (line: string) => void = console.error) {
  if (!isPreview(env)) return;
  delete env.BLOB_STORE_ID;
  const own = env.PREVIEW_BLOB_READ_WRITE_TOKEN?.trim();
  if (own) env.BLOB_READ_WRITE_TOKEN = own;
  else {
    delete env.BLOB_READ_WRITE_TOKEN;
    warn("[preview] PREVIEW_BLOB_READ_WRITE_TOKEN is not set, so this preview has no file store.");
  }
}

// The Clerk secret key for a preview. clerkMiddleware passes it on to every
// route (it needs CLERK_ENCRYPTION_KEY to do so). Undefined outside previews.
export function previewClerkSecretKey(env: Env = process.env) {
  return isPreview(env) ? env.PREVIEW_CLERK_SECRET_KEY?.trim() || undefined : undefined;
}
