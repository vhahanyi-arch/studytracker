// physics-exam-storage.ts
//
// File storage for the physics paper upload / marking system, using Vercel
// Blob instead of local disk (ported from physics-exam-studio's original
// src/storage/index.ts, which wrote directly to the local filesystem --
// that approach cannot work on Vercel's serverless runtime, where each
// function invocation may run on a different, ephemeral container with no
// shared disk). The magic-byte validation logic is unchanged from the
// original; only the storage backend is different.
//
// Files are stored privately (not publicly accessible by URL) since this
// handles student answer submissions and potentially copyrighted exam
// papers -- retrieval always goes through getFile(), which the calling API
// route is responsible for gating behind proper authentication.

import { put, get } from "@vercel/blob";
import type { StoredFile } from "./physics-extraction-schema";
import { describeBlobToken } from "./blob-token";

const PREFIX = "physics-exam/";

// The Blob SDK retries network and server errors ten times with doubling
// waits, which adds up to many minutes: an upload to a store it cannot reach
// looked like a silent hang until Vercel killed the function. Two retries
// still ride out a blip, and a real failure now surfaces in seconds.
process.env.VERCEL_BLOB_RETRIES ??= "2";

async function logged<T>(what: string, work: Promise<T>): Promise<T> {
  try {
    return await work;
  } catch (error) {
    const e = error instanceof Error ? error : new Error(String(error));
    console.error(`[blob] ${what} failed: ${e.name}: ${e.message} (token is for ${describeBlobToken(process.env.BLOB_READ_WRITE_TOKEN)})`);
    throw error;
  }
}

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function storeFile(file: File, kind: "pdf" | "answer"): Promise<StoredFile> {
  if (file.size === 0 || file.size > 25 * 1024 * 1024) throw Error("Files must be between 1 byte and 25 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  let mime = "";
  if (bytes.subarray(0, 5).toString() === "%PDF-") mime = "application/pdf";
  else if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) mime = "image/png";
  else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mime = "image/jpeg";
  if (!mime || (kind === "pdf" && mime !== "application/pdf")) throw Error("Use a valid PDF" + (kind === "answer" ? ", PNG or JPEG" : "") + ".");

  const meta: StoredFile = { id: crypto.randomUUID(), name: file.name.slice(0, 200), mime, size: bytes.length };
  await logged("put", put(PREFIX + meta.id, bytes, { access: "private", contentType: mime }));
  await logged("put", put(PREFIX + meta.id + ".json", JSON.stringify(meta), { access: "private", contentType: "application/json" }));
  return meta;
}

export async function getFile(id: string): Promise<{ meta: StoredFile; bytes: Buffer }> {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw Error("Invalid file ID.");

  const metaResult = await get(PREFIX + id + ".json", { access: "private" });
  if (!metaResult || metaResult.statusCode !== 200 || !metaResult.stream) throw Error("File not found.");
  const meta: StoredFile = JSON.parse((await streamToBuffer(metaResult.stream)).toString("utf8"));

  const fileResult = await get(PREFIX + id, { access: "private" });
  if (!fileResult || fileResult.statusCode !== 200 || !fileResult.stream) throw Error("File not found.");
  const bytes = await streamToBuffer(fileResult.stream);

  return { meta, bytes };
}
