// Stands in for @vercel/blob: records each upload and deletion, and keeps the
// pathnames still stored (no content), so list() can answer by prefix.
export const uploads: string[] = [];
export const deleted: string[] = [];
export const stored = new Set<string>();
export const BASE = "https://store.private.blob.vercel-storage.com/";

export async function put(pathname: string) {
  uploads.push(pathname);
  stored.add(pathname);
  return { url: BASE + pathname, pathname };
}

export async function del(urls: string | string[]) {
  for (const url of [urls].flat()) {
    deleted.push(url);
    stored.delete(url.replace(BASE, ""));
  }
}

export async function list({ prefix = "" }: { prefix?: string; cursor?: string; limit?: number } = {}) {
  const blobs = [...stored].filter((pathname) => pathname.startsWith(prefix)).map((pathname) => ({ url: BASE + pathname, pathname }));
  return { blobs, cursor: undefined, hasMore: false };
}

// Content is not kept, so a read finds nothing (routes treat that as a missing file).
export async function get() {
  return null;
}
