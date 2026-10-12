import { test } from "node:test";
import assert from "node:assert/strict";
import { readReply } from "../../lib/read-reply";

test("a JSON reply is returned as data", async () => {
  assert.deepEqual(await readReply(new Response('{"ok":true}', { status: 200 })), { ok: true });
  assert.deepEqual(await readReply(new Response('{"error":"No"}', { status: 403 })), { error: "No" });
});

test("a platform timeout page is explained in words", async () => {
  await assert.rejects(readReply(new Response("An error occurred with your deployment\nFUNCTION_INVOCATION_TIMEOUT", { status: 504 })), {
    message: "The server took too long to answer. Try again, or upload fewer pages.",
  });
});

test("any other non-JSON reply names its status, not a parse error", async () => {
  await assert.rejects(readReply(new Response("<html>Bad gateway</html>", { status: 502 })), {
    message: "The server sent an unexpected reply (HTTP 502). Try again in a moment.",
  });
});
