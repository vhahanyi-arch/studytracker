# AS Physics 9702 — Kinematics checkpoint

This is the historical Topic 2 record. Topics 3–5 are now implemented; see the
[Topic 5 checkpoint](as-physics-energy-verification.md) for the latest combined
regression. Topics 6–11 remain pending.

Topic 2 is implemented as `structuredAsKinematics` in
`lib/physics-question-engine.ts`, registered as `as-u2` in `asTopics`, and enabled
in `app/page.tsx`. It returns six questions per difficulty tier, using the existing
`sq`, `validateUnitSet`, `answerMatches` and `makePhysicsQuestions` architecture.
The standalone `.mjs` draft passed before porting; the compiled production engine
passed before the page entry was enabled. No deployment was performed.

## Source and coverage

Cambridge 9702, user-supplied `664565-2025-2027-syllabus.pdf`, version 1,
2025–2027 exam years, page 17. The nine objective IDs and source wording are in
`lib/as-physics-syllabus.json`, with the PDF provenance and hash.

| Objective | Content covered | Templates |
|---|---|---|
| 2.1.1 | Distance, displacement, speed, velocity, acceleration; whole-journey averages | f1, a1 |
| 2.1.2 | Representations of all five motion quantities on time graphs | f2 |
| 2.1.3 | Signed velocity–time area, trapezia, zero crossings, distance versus displacement | f3, a2, r1 |
| 2.1.4 | Displacement–time gradient with nonzero origins and either sign | f4 |
| 2.1.5 | Velocity–time gradient with either sign | f5 |
| 2.1.6 | Equation derivation by substitution and elimination of time | a3, r2 |
| 2.1.7 | Uniform acceleration, free fall, reaction plus braking, upward launch from a cliff | f6, a6, r3, r6 |
| 2.1.8 | Electromagnet/contact-plate free-fall experiment; SI conversion; timer bias | a4, r5 |
| 2.1.9 | Independent horizontal/vertical motion, horizontal and inclined launches | a5, r4 |

Coverage spans the three tiers, rather than all nine objectives in every six-question
set. Graphs are specified by shape or precise coordinates in the existing text-only
question format. Questions test graph interpretation and representation, not drawing
or experimentally carrying out the procedure. Derivation and experiment reasoning
use multiple choice rather than marking one exact prose explanation. Definition
questions request a quantity name from an explicitly stated list. Numeric questions
state units and sign conventions.

## Verification on 2026-09-19

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Kinematics draft | 3,000 | 9,000 | 54,000 | Zero failures; zero long decimals |
| Strictly compiled Kinematics production | 10,000 | 30,000 | 180,000 | Zero failures; zero long decimals |
| Topic 1 production regression | 10,000 | 30,000 | 180,000 | Zero failures; zero long decimals |
| All eight registered units, all tiers | 3,000 | 72,000 | 432,000 | Zero shared-validator/self-match failures; legacy findings below |

Each AS unit also passed 3,000 draft/production parity comparisons (1,000 per tier).
For the same deterministic random stream, the typed production output exactly
matches its draft. The production tests execute the JavaScript emitted by strict
`tsc`, through the public engine function, not the draft.

The Kinematics oracle independently reads the displayed values, recomputes the
answers, validates the option keys, and rejects incorrect letters/numeric answers.
It checks physical ranges, positive times/heights, signed versus unsigned quantities,
valid objective IDs, metadata, finite values, six-question sets and distinct prompts.
Every template produces at least two semantic answers. Required branch coverage
includes all five definitions and graph types, positive/negative gradients and areas,
both average quantities, reversal distance/displacement, both derivation variants,
and early/late timer errors. All 18 Kinematics conditional expressions have distinct
branches; the combined AS scan checks 46.

The blanket decimal scan includes prompts, accepted answers and solutions across
both enabled AS units, all six tiers: **zero matches**. Kinematics additionally scans
hints. The full project passes `tsc --noEmit --strict --incremental false`.
After enabling the unit, an additional 3,000 iterations per tier verifies production
and page availability together. No authenticated browser/database end-to-end test
was performed.

## Findings and prevention

The stochastic runs found **zero new arithmetic, answer-key, metadata or decimal
bugs**. No bug count is inferred from the number of assertions run.

Draft review refined two coverage/wording points before the passing run:

- Include speed explicitly among the quantity definitions and graph variants,
  alongside distance, displacement, velocity and acceleration.
- Specify that a timer starting late still starts before impact, so the time
  interval in the error-analysis question remains physically meaningful.

Exact arithmetic is constructed rather than obtained by arbitrary division:
gradient endpoints come from a chosen slope; runner distances are multiples of
total time; free-fall heights come from chosen times; reaction/braking speeds are
compatible with the braking acceleration; cliff heights give exact impact speeds.
Free-fall experiment values use integer millimetres/milliseconds and estimated g
values 9.6, 9.8 or 10 m/s². Other free-fall/projectile questions explicitly state
g = 10 m/s². Negative displacement, velocity and acceleration are intentional;
distance, speed, time and height stay in their valid ranges.

The combined scan still flags the same three pre-existing IGCSE long-decimal
templates: `igcse-u15-r3`, `igcse-u15-r5`, `igcse-u18-r1`. There are six IGCSE
generators in this checkout, plus the two AS generators. The legacy findings are
not counted as passing and have not been rewritten in this Kinematics batch.

## Reproduce from the project directory

```powershell
node scripts/test-as-physics-u2.mjs --iterations=3000
node scripts/port-as-physics-u2.mjs
node node_modules/typescript/bin/tsc --noEmit --strict --incremental false
node node_modules/typescript/bin/tsc lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u2.mjs --production --iterations=10000
node scripts/test-as-physics.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
```

When verifying before page enablement, add `--before-enable` to the Kinematics
production test; it only defers the page-availability assertion. All scientific,
metadata, registration and draft/production parity checks still run.
The combined regression discovers registered units rather than requiring a
manually maintained unit list. Unfinished units remain disabled.

Next checkpoint: Topic 6, Deformation of solids.
