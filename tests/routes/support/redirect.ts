// Route tests run the real route handlers. Imported first by each route test,
// this swaps the three outside services for in-memory stand-ins: the database
// (any import of lib/db.ts, relative ones included), Clerk and Vercel Blob.
// It wraps Node's CommonJS resolver, which is how tsx loads this project.
import Module from "node:module";
import path from "node:path";

const standIns: Record<string, string> = {
  "@clerk/nextjs/server": path.join(__dirname, "fake-clerk.ts"),
  "@vercel/blob": path.join(__dirname, "fake-blob.ts"),
};
const fakeDb = path.join(__dirname, "fake-db.ts");
const realDb = path.join(__dirname, "..", "..", "..", "lib", "db.ts");

const resolver = Module as unknown as { _resolveFilename: (request: string, ...rest: unknown[]) => string };
const original = resolver._resolveFilename;
resolver._resolveFilename = function (request: string, ...rest: unknown[]) {
  if (standIns[request]) return standIns[request];
  const resolved = original.call(this, request, ...rest);
  return path.resolve(resolved) === realDb ? fakeDb : resolved;
};
