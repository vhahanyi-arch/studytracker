# AS Physics 9702 — Work, energy and power checkpoint

Historical Topic 5 checkpoint. The current status is in the [Topic 6 verification report](as-physics-deformation-verification.md), including the small-value marking fix and shared-page recovery. Topics 1–6 are now enabled.

Topic 5 is implemented as `structuredAsEnergy` in `lib/physics-question-engine.ts`,
registered as `as-u5` in `asTopics`, and enabled in `app/page.tsx` after production
verification. The existing architecture is preserved: six questions per tier,
18 templates, `sq`, `validateUnitSet`, `answerMatches` and the public
`makePhysicsQuestions` API. No deployment was performed.

## Verified source and objective coverage

Cambridge 9702, user-supplied `664565-2025-2027-syllabus.pdf`, version 1,
exam years 2025–2027, page 19. The 11 objectives and PDF provenance/hash are in
`lib/as-physics-syllabus.json`.

| Objective | Practice content | Templates |
|---|---|---|
| 5.1.1 | Work along/opposite/perpendicular to displacement; angled force | f1, r1 |
| 5.1.2 | Total energy conservation, internal energy and frictionless descent | f2, a6 |
| 5.1.3 | Useful output divided by total input | f3 |
| 5.1.4 | Non-useful energy and successive converter efficiencies | a2, r2 |
| 5.1.5 | Power as rate of doing work | f4 |
| 5.1.6 | Average output power; lifting time with motor efficiency | a1, r3 |
| 5.1.7 | Derivation/rearrangement of P = Fv; steady uphill driving power | a3, r4 |
| 5.2.1 | Deriving signed gravitational potential-energy change from work | a4 |
| 5.2.2 | Signed mgΔh; potential/kinetic energy during vertical flight | f5, r5 |
| 5.2.3 | Deriving kinetic energy and its change using motion equations | a5 |
| 5.2.4 | Kinetic energy; energy change and braking force | f6, r6 |

Coverage spans the tiers together, not every objective in each set. These are
targeted practice questions rather than an exhaustive assessment of every
context. Derivation and conceptual questions use multiple choice or true/false
with worked explanations. There are no rigid exact-match prose explanations.
Numerical prompts state their units and required signs.

## Verification on 2026-09-19

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Corrected standalone Topic 5 draft | 3,000 | 9,000 | 54,000 | Zero failures / long decimals |
| Strictly compiled Topic 5 production | 10,000 | 30,000 | 180,000 | Zero failures / long decimals |
| Topics 1–4 production, combined | 10,000 per unit | 120,000 | 720,000 | Zero failures / long decimals |
| All 11 registered units, all tiers | 3,000 | 99,000 | 594,000 | Shared validation/self-matching pass; legacy findings below |

Each AS unit also passed 3,000 draft/production parity comparisons (1,000 per
tier). Production tests execute actual JavaScript emitted by strict TypeScript
compilation. The actual engine passes a separate strict no-emit check against
the real `PhysicsQuestion` type and `validateUnitSet`. After enabling the page
entry, a further 3,000 iterations per Topic 5 tier checks production and availability
together.

The formerly unavailable project dependencies are resolvable again, and the
**full project passes `tsc --noEmit --strict --incremental false`**. The full-app
dependency limitation recorded at the Topic 4 checkpoint is therefore historical.
No authenticated browser/database end-to-end check or deployment was performed.

Independent oracles parse displayed quantities and recompute answers. They check
all 11 objective IDs, six-question sets, unique prompts, metadata, finite values,
self-matching and rejection of wrong answers. All templates produce multiple
semantic correct answers, not just changing option letters. All 19 named branches
are covered, including three work directions, both potential-energy signs, both
derivation variants, and ascending/descending velocities.

There are **70,000 production energy checks** across a2/a6/r2/r3/r4/r5/r6:
useful plus non-useful energy equals input; successive converters cannot output
more than they receive; mechanical power balances the stated forces; potential
plus kinetic energy is conserved where appropriate; and braking work equals
the kinetic-energy change. Efficiencies stay strictly between zero and 100%,
heights stay below the launch maximum, masses/times/speeds are positive where
required, and signed work/velocity changes are intentional.

The derivation tests perform **40,000 production algebra checks**, evaluating
every offered option, not just the answer key. The kinetic-energy question is
checked at two numerical substitutions for each branch. The AST scan checks
26 Topic 5 conditional expressions and 129 across all five AS units, with no
identical branches. The blanket scan covers every tier of all five implemented
AS topics with **zero long-decimal matches**; Topic 5 also scans hints.

## Defect caught and fixed

**One underlying marking ambiguity** was found in `as-u5-a5`. The initial
from-rest derivation offered both `0.5mv^2` and `0.5m(v^2 - u^2)`. With u = 0,
both are correct, but the answer key accepted only one. This could mark a
mathematically correct response wrong.

The 3,000-iteration-per-tier draft run failed the unique-correct-option test.
It also reported insufficient variation among the variants that passed; that
was a consequence of the same defect, not a second bug. The final draft uses
separate, unambiguous distractor sets for motion from rest and for a general
change of speed. Both the corrected draft and production pass the permanent
algebra-uniqueness regression. The failed draft is not counted as a passing run
in the table above.

Review also made the fixed track and nonzero force in P/F explicit. Clean values
are constructed: input energies are compatible with percentage efficiencies,
work is derived from chosen power/time, launch/drop heights give exact speeds,
and lifting/braking quantities are chosen to yield finite exact results.

## Existing legacy findings

The broad scan includes six existing IGCSE generators and five AS generators.
The same three existing IGCSE templates still produce long decimals:
`igcse-u15-r3`, `igcse-u15-r5`, `igcse-u18-r1`. They are reported explicitly and
are not counted as passing. Shared-validator and self-match tests do not amount
to a full scientific audit of the legacy content.

## Reproduce from the project directory

```powershell
node scripts/test-as-physics-u5.mjs --iterations=3000
node scripts/port-as-physics-u5.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler --noEmit --strict --incremental false
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u5.mjs --production --iterations=10000
node scripts/test-as-physics.mjs --production --iterations=10000
node scripts/test-as-physics-u2.mjs --production --iterations=10000
node scripts/test-as-physics-u3.mjs --production --iterations=10000
node scripts/test-as-physics-u4.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
```

`--before-enable` on the Topic 5 production test only defers the UI flag
assertion. Scientific, metadata, registration and parity checks still run.
The seed is recorded in the test script. The blanket scan discovers registered
units automatically.

Topics 1–5 are enabled; topics 6–11 remain pending. Next checkpoint: Topic 6,
Deformation of solids (6.1–6.2, 10 objectives, page 20).
