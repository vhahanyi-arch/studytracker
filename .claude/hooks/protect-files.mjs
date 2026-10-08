// PreToolUse hook: refuse Edit/Write on secret files and the lockfile.
// Matches on the file's base name, so it works whichever folder the session
// was started in. `.env.example` is allowed: it holds names, not values.
import { basename } from "node:path";

let input = "";
for await (const chunk of process.stdin) input += chunk;

// Windows shells can prefix piped text with a byte-order mark.
const filePath = JSON.parse(input.replace(/^﻿/, "")).tool_input?.file_path ?? "";
const name = basename(filePath.replaceAll("\\", "/"));

const isSecret = (name === ".env" || name.startsWith(".env.")) && name !== ".env.example";
const isLockfile = name === "pnpm-lock.yaml";

if (isSecret || isLockfile) {
  const reason = isSecret
    ? `${name} holds live credentials. The agent does not edit secret files; put the step in a wizard for the user (see the vault's "Security and secrets").`
    : "pnpm-lock.yaml is generated. Change package.json and run pnpm install instead.";
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
}
