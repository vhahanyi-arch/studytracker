// Stands in for @vercel/blob: records each upload and stores nothing.
export const uploads: string[] = [];

export async function put(pathname: string) {
  uploads.push(pathname);
  return { url: `https://store.private.blob.vercel-storage.com/${pathname}`, pathname };
}
