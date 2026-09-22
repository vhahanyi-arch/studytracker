# Scripts

## Wizards

Interactive, step-by-step walkthroughs for procedures that have to be done by
hand in someone else's dashboard. Each one opens the right page, says exactly
what to click, captures what you copy back, and confirms before anything
irreversible. Stop any time with Ctrl-C and re-run later.

| Script | What it does |
| --- | --- |
| `rotate-clerk-key.sh` | Replaces the Clerk **secret** key with no downtime — adds the new key, deploys, verifies, and only then deletes the old one. The publishable key is public by design and is not touched. |
| `harden-clerk.sh` | Closes public sign-up, then optionally moves Clerk to a production instance. Stops after closing sign-up unless you choose to continue. |
| `rotate-credentials.sh` | Rotates the Neon database password and the Vercel Blob read-write token. Unlike the Clerk one this **does** have downtime, because those credentials die the moment they are reset. |

### Running them on Windows

`bash` is not on PowerShell's PATH, so `bash scripts/...` fails with
`The term 'bash' is not recognized`. Call Git's copy directly, and give it the
script's full path:

```powershell
& "C:\Program Files\Git\bin\bash.exe" "C:\Users\USER\Documents\ChatGPT\task tracker for students\vercel-studytrack\scripts\rotate-clerk-key.sh"
```

The full path is worth the length. A relative path needs PowerShell to already
be in the project directory, and when it is not the error is just
`No such file or directory` — which reads like the script is missing rather than
like you are standing in the wrong place. Each wizard finds the project from its
own location, so an absolute path works from anywhere.

Launching it from PowerShell matters for more than finding `bash`: the shell
inherits PowerShell's PATH, which is where the Vercel CLI lives. A Git Bash
window opened from the Start menu does not necessarily see `vercel`, and the
wizard will stop at its pre-flight check saying so.

A good pre-flight looks like this, and stops harmlessly at the first prompt:

```
  Vercel CLI found: 59.24.0
  Logged in as: <your-username>
  Project linked: studytrack-cambridge-planner
  ? Ready to start? [y/N]
```

### Before a production move

A Clerk **production instance starts with an empty user list**. No teacher or
student account carries over from development, so every one has to be recreated,
and the teacher account has to exist again *before* sign-up is closed on
production — otherwise there is no way to create the first account.
`harden-clerk.sh` sequences this correctly, but it is worth knowing before you
start, because it makes the move much cheaper to do before real classroom use
than after.

A production move also issues fresh `sk_live_` keys, which makes a development
key rotation redundant. If you are doing both, do the production move.

## Content harnesses

`run-content-regression.mjs` compiles the question engine and runs every
`test-*.mjs` harness beside it. `pnpm test:content` is the entry point.

`test-cambridge-analysis.mjs` needs real Cambridge past papers, which are
copyrighted and therefore not committed. It reads them from
`CAMBRIDGE_PAPERS_DIR` (default `C:/Users/USER/Downloads`) and reports as
skipped when they are absent, which is why CI shows 12/13 passed and 1 skipped
rather than a failure.
