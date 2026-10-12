import { test } from "node:test";
import assert from "node:assert/strict";
import { NO_PREVIEW_DATABASE, databaseUrl, previewClerkSecretKey, usePreviewBlobStore } from "../../lib/preview-env";

// Known issues #17: DATABASE_URL is one variable for every environment, so a
// preview must never fall back to it. These are made-up connection strings.
const LIVE = "postgresql://app:x@ep-live-123-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const OWN = "postgresql://app:y@ep-preview-456-pooler.eu-central-1.aws.neon.tech/studytrack_preview?sslmode=require";
const quiet = () => {};

test("production and local use DATABASE_URL as before", () => {
  assert.equal(databaseUrl({ VERCEL_ENV: "production", DATABASE_URL: LIVE, PREVIEW_DATABASE_URL: OWN }, quiet), LIVE);
  assert.equal(databaseUrl({ DATABASE_URL: LIVE }, quiet), LIVE);
  assert.equal(databaseUrl({ VERCEL_ENV: "development", DATABASE_URL: LIVE }, quiet), LIVE);
});

test("a preview uses its own database", () => {
  assert.equal(databaseUrl({ VERCEL_ENV: "preview", DATABASE_URL: LIVE, PREVIEW_DATABASE_URL: ` ${OWN} ` }, quiet), OWN);
});

test("a preview without its own database gets none, never the live one", () => {
  const warnings: string[] = [];
  const warn = (line: string) => warnings.push(line);
  for (const own of [undefined, "", "  ", "not a url"])
    assert.equal(databaseUrl({ VERCEL_ENV: "preview", DATABASE_URL: LIVE, PREVIEW_DATABASE_URL: own }, warn), NO_PREVIEW_DATABASE);
  assert.equal(warnings.length, 4);
  assert.ok(warnings.every((line) => line.startsWith("[preview]")));
});

test("a preview database on the live endpoint is refused, pooled or direct", () => {
  for (const own of [
    LIVE,
    "postgresql://other:z@ep-live-123.eu-central-1.aws.neon.tech/another_db",
    "postgres://app:x@EP-LIVE-123-POOLER.eu-central-1.aws.neon.tech/neondb",
  ])
    assert.equal(databaseUrl({ VERCEL_ENV: "preview", DATABASE_URL: LIVE, PREVIEW_DATABASE_URL: own }, quiet), NO_PREVIEW_DATABASE, own);
});

test("the stand-in is a valid connection string that cannot resolve", () => {
  assert.equal(new URL(NO_PREVIEW_DATABASE).hostname.endsWith(".invalid"), true);
});

test("a preview uses only its own file store, never a connected or live one", () => {
  const env: Record<string, string | undefined> = {
    VERCEL_ENV: "preview",
    BLOB_STORE_ID: "store_live",
    BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_live_secret",
    PREVIEW_BLOB_READ_WRITE_TOKEN: " vercel_blob_rw_preview_secret ",
  };
  usePreviewBlobStore(env, quiet);
  assert.equal(env.BLOB_STORE_ID, undefined);
  assert.equal(env.BLOB_READ_WRITE_TOKEN, "vercel_blob_rw_preview_secret");

  const bare: Record<string, string | undefined> = { VERCEL_ENV: "preview", BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_live_secret" };
  usePreviewBlobStore(bare, quiet);
  assert.equal(bare.BLOB_READ_WRITE_TOKEN, undefined, "no preview token: no store at all");
});

test("outside previews the file store settings are untouched", () => {
  const env: Record<string, string | undefined> = { VERCEL_ENV: "production", BLOB_STORE_ID: "s", BLOB_READ_WRITE_TOKEN: "t", PREVIEW_BLOB_READ_WRITE_TOKEN: "p" };
  usePreviewBlobStore(env, quiet);
  assert.deepEqual(env, { VERCEL_ENV: "production", BLOB_STORE_ID: "s", BLOB_READ_WRITE_TOKEN: "t", PREVIEW_BLOB_READ_WRITE_TOKEN: "p" });
});

test("only a preview takes PREVIEW_CLERK_SECRET_KEY", () => {
  assert.equal(previewClerkSecretKey({ VERCEL_ENV: "preview", PREVIEW_CLERK_SECRET_KEY: " sk_test_preview " }), "sk_test_preview");
  assert.equal(previewClerkSecretKey({ VERCEL_ENV: "preview", PREVIEW_CLERK_SECRET_KEY: "" }), undefined);
  assert.equal(previewClerkSecretKey({ VERCEL_ENV: "preview" }), undefined);
  assert.equal(previewClerkSecretKey({ VERCEL_ENV: "production", PREVIEW_CLERK_SECRET_KEY: "sk_test_preview" }), undefined);
});
