# AS Physics 9702 — Forces, density and pressure checkpoint

This is the historical Topic 4 record. Topic 5 is now implemented; see the
[Topic 5 checkpoint](as-physics-energy-verification.md) for the latest results.
The dependency limitation recorded below has since cleared, and full-project
strict compilation now passes. Topics 6–11 remain pending.

Topic 4 is implemented as `structuredAsForces` in `lib/physics-question-engine.ts`,
registered as `as-u4` in `asTopics`, and enabled in `app/page.tsx` after production
verification. It uses the existing question type and `sq`, `validateUnitSet`,
`answerMatches` and `makePhysicsQuestions` architecture: six questions per tier,
18 templates across foundational, application and reasoning. No deployment.

## Source and coverage

Cambridge 9702, user-supplied `664565-2025-2027-syllabus.pdf`, version 1,
exam years 2025–2027, pages 18–19. The 13 objectives and PDF provenance/hash are
recorded in `lib/as-physics-syllabus.json`.

| Objective | Practice content | Templates |
|---|---|---|
| 4.1.1 | Centre of gravity of a uniform rod; beam weight acts at its midpoint | f1, r1 |
| 4.1.2 | Perpendicular moment arm; angled force and signed moment | f2, r2 |
| 4.1.3 | Couple versus collinear equal/opposite forces | f3 |
| 4.1.4 | Couple torque; separation versus individual moment arms | f4, r3 |
| 4.2.1 | Principle of moments; loaded beam including its own weight | a1, r1 |
| 4.2.2 | All four zero/nonzero force and torque combinations | a2 |
| 4.2.3 | Closed head-to-tail force triangles; cable tensions | a3, r4 |
| 4.3.1 | Density as mass per unit volume | f5 |
| 4.3.2 | Pressure as normal force per unit area | f6 |
| 4.3.3 | Hydrostatic equation derived from column mass, weight and area | a4 |
| 4.3.4 | Hydrostatic pressure difference from depth difference | a5 |
| 4.3.5 | Upthrust from bottom/top pressure difference | a6 |
| 4.3.6 | Archimedes' principle, partial immersion and apparent weight | r5, r6 |

Coverage is across all tiers together, not every objective in each six-question
set. Force-triangle questions use precise text descriptions and components in the
existing interface; drawing diagrams is not assessed. Explanatory/derivation
questions use multiple choice or true/false with a worked explanation, rather
than exact-match prose. Numerical questions state units and sign conventions;
paired answers specify their order.

## Verification on 2026-09-19

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 4 draft | 3,000 | 9,000 | 54,000 | Zero failures / long decimals |
| Strictly compiled Topic 4 production | 10,000 | 30,000 | 180,000 | Zero failures / long decimals |
| Topics 1–3 production, combined | 10,000 per unit | 90,000 | 540,000 | Zero failures / long decimals |
| All ten registered units, all tiers | 3,000 | 90,000 | 540,000 | Shared validation/self-matching pass; legacy findings below |

Each AS unit also passed 3,000 draft/production parity comparisons (1,000 per
tier). Identical random streams produce identical typed and draft output.
Production tests execute actual JavaScript emitted by TypeScript from the engine.
After Topic 4 was enabled, a further 3,000 iterations per tier verified production
and the page-availability flag together.

Independent oracles read displayed quantities and calculate expected results.
They check six-question sets, metadata, objective IDs, duplicate prompts, finite
values, accepted answer self-matching and rejection of wrong answers. Ordered
answers reject missing delimiters, swapped unequal components and surrounding
junk. Every template produces multiple semantic answers; option-letter rotation
alone does not count as answer variation.

There are 18,000 draft and **60,000 production balance checks** across a1/a3/r1/r3/r4/r6:
clockwise/anticlockwise moments, both support reactions, both vector components,
force-triangle closure, zero resultant force for a couple, and tension plus
upthrust equalling weight. Additional checks enforce positive support forces and
tensions, physically interior loads, positive densities/areas/volumes, increasing
pressure with depth, and upthrust based on displaced volume only. All 15 named
branch cases pass, including both torque signs, all four equilibrium conditions,
both hydrostatic derivation stages, and 25/50/75 percent immersion.

The conditional scan checks 15 Topic 4 expressions and 103 across all four AS
units, with no identical branches. The blanket decimal scan covers every tier of
all four AS units: **zero long-decimal matches**. Topic 4's own scan includes
prompts, hints, solutions and accepted answers.

## Findings and compilation limitation

**No new question-engine bugs were found by the draft or production runs.**
Review made planar motion explicit in the equilibrium question and labelled the
pressure values as gauge pressures. These were wording refinements before the
passing draft run, not claimed stochastic bug discoveries.

Clean numbers are constructed using integer-scaled lengths/areas, force ratios
that balance exactly, integer depth increments, and object densities greater than
the surrounding fluid where a supporting string is assumed. Angular moments use
the supplied exact sin 30° value; cable tensions use a 3:4:5 force triangle.

**The actual question engine passes strict TypeScript compilation**, including a
separate `--noEmit --strict` check against the real `PhysicsQuestion` and validator.
However, full-project compilation currently fails: the project's dependency
folder changed during this work, and packages including `@clerk/nextjs`,
`@vercel/blob`, `@neondatabase/serverless`, `pdfjs-dist`, `zod` and others cannot
be resolved. Associated inferred-type errors also appear. This is not reported
as a clean full-app compile. The same TypeScript 5.9.3 compiler remained available
through the parent workspace and was used for engine compilation and regressions.
No authenticated browser/database end-to-end check or deployment was performed.

The broader scan still reports the same three existing IGCSE long-decimal
templates: `igcse-u15-r3`, `igcse-u15-r5`, `igcse-u18-r1`. These are not counted
as passing. The six legacy IGCSE generators received shared-validator/self-match
checks, not a full scientific audit.

## Reproduce from the project directory

```powershell
node scripts/test-as-physics-u4.mjs --iterations=3000
node scripts/port-as-physics-u4.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --noEmit --strict --target es2020 --module commonjs --skipLibCheck
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u4.mjs --production --iterations=10000
node scripts/test-as-physics.mjs --production --iterations=10000
node scripts/test-as-physics-u2.mjs --production --iterations=10000
node scripts/test-as-physics-u3.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
# Re-run the full-project check once project dependencies are available:
node $topicCompiler --noEmit --strict --incremental false
```

`--before-enable` on the Topic 4 production test only defers the UI flag assertion;
registration, scientific, metadata and parity checks still run. The deterministic
seed is in the test script. The combined scan discovers all registered units.

Topics 1–5 are now enabled; topics 6–11 remain pending. Next checkpoint: Topic 6,
Deformation of solids (6.1–6.2, 10 objectives, page 20).
