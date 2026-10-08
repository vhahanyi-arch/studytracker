---
name: ship-and-verify
description: Verify and push the current branch, wait for CI, hold for "deploy", then fast-forward main and prove the change is live on studytrack.win.
disable-model-invocation: true
argument-hint: "[marker: a string unique to this change]"
---

# Ship and verify

Ships the current branch to production and ends on proof. A green CI and a READY deployment do not prove the code is live; only the **marker** found in the assets studytrack.win serves does.

Invoking this skill is the user's go-ahead to commit and push the branch. Production is not: step 5 is a **hold**.

Run every command from `vercel-studytrack/`. Every `gh` call takes `--repo vhahanyi-arch/studytracker`.

## 1. Preflight

- On `main`? Create a branch named for the change first.
- `git status --short`: decide the commit's file list. Local working files stay out unless the user says otherwise: `.impeccable/review/`, `.impeccable/hook.cache.json`, `.impeccable/questions/`, `tmp/`.
- The repo is public. The staged set holds no `.env*` file and no PDF or Cambridge paper (synthetic fixtures only). If one appears, stop and ask.
- Choose the **marker**: `$ARGUMENTS` if given, else a string from this change's added lines that survives minification (user-facing text, or a CSS class or custom property name). Run `node .claude/skills/ship-and-verify/check-live.mjs "<marker>"`.

Done when: you are on a feature branch, the file list is settled, and the marker prints NOT FOUND on the live site (FOUND means it is not unique to this change; choose another).

## 2. Verify

`pnpm verify`, then `pnpm build`. Record the figures: typecheck clean, tests N / N, content N/N, build OK.

Done when all four pass. On red: report the failing output and stop; fix it only when the cause is inside this change.

## 3. Commit and push the branch

Write the message in the repo's style (`git log --oneline -10`: one plain imperative sentence), ending with the co-author line. Then `git push -u origin <branch>`.

## 4. CI

Get the run for this commit: `gh run list --branch <branch> --limit 1 --json databaseId,headSha,status` (it can take ~30 s to appear; check `headSha`). Then `gh run watch <id> --exit-status`.

Done when the run for this commit's SHA is green. On red: report `gh run view <id> --log-failed` and stop.

## 5. Hold for deploy

Report the branch, SHA, the step 2 figures, the CI run id and the marker. Ask "Deploy to studytrack.win?" and **stop**. Continue only on an explicit yes from the user in chat ("deploy", "merge and deploy", "push to main").

## 6. Deploy

- `git fetch origin`. If `origin/main` is not an ancestor of the branch: rebase onto it, rerun step 2, `git push --force-with-lease`, rerun step 4, and say so in the report.
- `git checkout main && git merge --ff-only <branch> && git push origin main`. Vercel's Git integration builds production from `main`.
- Find the **production** deployment built from the SHA: `vercel ls studytrack-cambridge-planner --prod`, or the Vercel MCP `list_deployments`. The commit's GitHub status usually links the branch *preview*; that id is the wrong one.
- Wait until it is READY, then run `vercel inspect studytrack.win 2>&1 | head -20`. The CLI prints the `id` within ~10 s but can then hang on its update check; run it in the background and read the output rather than waiting for it to exit.

Done when `vercel inspect studytrack.win` names the production deployment built from the SHA.

## 7. Prove it live

- `node .claude/skills/ship-and-verify/check-live.mjs "<marker>" [/page ...]` must print FOUND. Pass page paths (e.g. `/sign-in`) when the marker ships only on that page; signed-out pages are all it can reach.
- A server-only change (new API route): request the route signed out. 401 means it shipped; 404 means it did not.
- NOT FOUND after READY: fetch a random 404 path (never cached) to tell a stale edge cache from a stale build, and check `turbopackFileSystemCacheForBuild: false` is still in `next.config.ts`.
- If `lib/schema-version.ts` changed, the DDL runs on production's Neon database on the first signed-in request. Say so.

Done when the marker is FOUND, or the report says plainly "not confirmed live" and why.

## 8. Report and record

Report in the vault's wording:

- **Confirmed live:** what was checked, with the marker, the asset URL and the deployment id.
- **Not verified:** the signed-in screens. The agent does not sign in as the user, so name the check the user should make.

Then record it in the vault (`../StudyTracker/`, per `CLAUDE.md`): a dated entry at the top of `Status/Current state.md` with the `main` SHA, deployment id, CI run ids and figures, plus the session note.
