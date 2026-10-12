import { del, list } from "@vercel/blob";
import { describeBlobToken } from "@/lib/blob-token";
import { sql } from "@/lib/db";

// Removing the Blob files of Papers & assignments: a paper's PDFs once it is
// replaced or deleted, and its students' uploads once it is deleted. Always
// best effort and always after the database change: a file left behind is
// only unused storage, so a failure is logged and never fails the request.
// Only files the paper owns are ever deleted (see ownedBy).

// The pathname of a file in this app's Blob store, or null for anything else.
// Kept as the URL parser leaves it (dot segments resolved, nothing decoded),
// and an encoded slash or backslash is refused, so a prefix check on it holds.
const storePathname = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".blob.vercel-storage.com")) return null;
    if (/%2f|%5c/i.test(parsed.pathname)) return null;
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
};

// A paper given by URL must be a homework book the teacher's browser uploaded
// (homework/<uuid>/<name>, through /api/blob-upload). Any other file in the
// store, an Exam papers file or a student's upload, is refused, so a paper can
// never come to point at something it does not own.
export function homeworkUploadUrl(value: unknown) {
  const url = String(value ?? "").trim();
  return url && storePathname(url)?.startsWith("homework/") ? new URL(url).toString() : null;
}

// The only files cleanup may ever delete: a paper's own folders, and homework
// books uploaded for papers.
const ownedBy = (assignmentId: string) => (url: string) => {
  const pathname = storePathname(url);
  return Boolean(pathname) && [`assignments/${assignmentId}/`, `submissions/${assignmentId}/`, "homework/"].some((prefix) => pathname!.startsWith(prefix));
};

const failed = (what: string, error: unknown) => {
  const e = error instanceof Error ? error : new Error(String(error));
  console.error(`[blob] ${what} failed: ${e.name}: ${e.message} (token is for ${describeBlobToken(process.env.BLOB_READ_WRITE_TOKEN)})`);
};

// Every file stored under a pathname prefix, across pages.
async function filesUnder(prefix: string) {
  const urls: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    urls.push(...page.blobs.map((blob) => blob.url));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return urls;
}

// A paper's own files: its current PDFs (a homework book is uploaded outside
// its folder), every earlier PDF in its folder, and its students' uploads.
export async function assignmentFiles(id: string, current: Array<string | null | undefined>) {
  const urls = current.filter((url): url is string => Boolean(url));
  for (const prefix of [`assignments/${id}/`, `submissions/${id}/`]) {
    try {
      urls.push(...(await filesUnder(prefix)));
    } catch (error) {
      failed(`list ${prefix}`, error);
    }
  }
  return urls;
}

// Deletes the files of this paper that no remaining paper still uses as its
// question paper or mark scheme (two papers can share one homework book).
// Returns how many were removed; never throws.
export async function removeUnusedFiles(assignmentId: string, urls: Array<string | null | undefined>, reason: string) {
  try {
    const candidates = [...new Set(urls.filter((url): url is string => Boolean(url)).filter(ownedBy(assignmentId)))];
    if (!candidates.length) return 0;
    const used = await sql`
      SELECT question_paper_url AS url FROM assignments WHERE question_paper_url = ANY(${candidates}::text[])
      UNION
      SELECT mark_scheme_url AS url FROM assignments WHERE mark_scheme_url = ANY(${candidates}::text[])
    `;
    const inUse = new Set(used.map((row) => String(row.url)));
    const unused = candidates.filter((url) => !inUse.has(url));
    if (!unused.length) return 0;
    await del(unused);
    console.info(`[blob] ${reason}: removed ${unused.length} file(s)`);
    return unused.length;
  } catch (error) {
    failed(`${reason}: removing files`, error);
    return 0;
  }
}
