// blob-token.ts
//
// The Blob read-write token is vercel_blob_rw_<storeId>_<secret>. Pasting it
// into Vercel by hand has twice left it unusable: the store page's copy
// button copies the whole .env line (BLOB_READ_WRITE_TOKEN="vercel_blob_rw_...")
// and a terminal paste can carry an invisible control character. Either way
// every upload failed with "Access denied". cleanBlobToken() strips that
// wrapping; describeBlobToken() says what is wrong for the logs without ever
// printing any part of the secret.

const TOKEN = /^vercel_blob_rw_([A-Za-z0-9]+)_[A-Za-z0-9]+$/;

export function cleanBlobToken(raw: string | undefined): { token: string | undefined; fixes: string[] } {
  if (raw === undefined) return { token: undefined, fixes: [] };
  const fixes: string[] = [];
  let token = raw;
  const strip = (pattern: RegExp, fix: string) => {
    const next = token.replace(pattern, "");
    if (next !== token) { token = next; fixes.push(fix); }
  };
  strip(/[\u0000-\u001f\u007f​-‍﻿]/g, "invisible characters");
  strip(/^\s+|\s+$/g, "spaces around it");
  strip(/^export\s+/, "an export prefix");
  strip(/^BLOB_READ_WRITE_TOKEN\s*=\s*/, "the variable name");
  const quoted = /^(["'`])(.*)\1$/.exec(token);
  if (quoted) { token = quoted[2].trim(); fixes.push("quotes"); }
  return { token, fixes };
}

// Which store the token is for, or the shape of what is there instead.
export function describeBlobToken(token: string | undefined): string {
  if (!token) return "no BLOB_READ_WRITE_TOKEN set";
  const match = TOKEN.exec(token);
  if (match) return `store_${match[1]}`;
  if (/^store_[A-Za-z0-9]+$/.test(token)) return "a store id, not a read-write token";
  if (token.startsWith("vercel_blob_client_")) return "a client upload token, not a read-write token";
  const shape = [
    `${token.length} characters`,
    `${token.split("_").length - 1} underscores`,
    token.startsWith("vercel_blob_rw_") ? "starts vercel_blob_rw_" : "does not start vercel_blob_rw_",
  ];
  if (/\s/.test(token)) shape.push("contains spaces");
  if (/[^A-Za-z0-9_\s]/.test(token)) shape.push("contains punctuation");
  return `an unrecognised token (${shape.join(", ")})`;
}

// Cleans process.env once, at server start, so every Blob call in the app
// (uploads, client-upload tokens, downloads) uses the cleaned value.
export function repairBlobTokenEnv(warn: (line: string) => void = console.warn, info: (line: string) => void = console.info) {
  const { token, fixes } = cleanBlobToken(process.env.BLOB_READ_WRITE_TOKEN);
  if (token === undefined) return;
  if (fixes.length) {
    process.env.BLOB_READ_WRITE_TOKEN = token;
    warn(`[blob] BLOB_READ_WRITE_TOKEN had ${fixes.join(", ")} around it; using it without. Fix the variable in Vercel when convenient.`);
  }
  info(`[blob] token is for ${describeBlobToken(token)}`);
}
