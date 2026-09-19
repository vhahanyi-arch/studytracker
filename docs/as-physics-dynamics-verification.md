# AS Physics 9702 — Dynamics checkpoint

This is the historical Topic 3 record. Topics 4 and 5 are now implemented; see the
[Topic 5 checkpoint](as-physics-energy-verification.md) for the latest combined
regression and restored full-app compilation. Topics 6–11 remain pending.

Topic 3 is implemented as `structuredAsDynamics` in
`lib/physics-question-engine.ts`, registered as `as-u3` in `asTopics`, and enabled
in `app/page.tsx`. Exactly six questions are returned per difficulty tier, with
18 templates across foundational, application and reasoning. The existing `sq`,
`validateUnitSet`, `answerMatches` and public `makePhysicsQuestions` architecture
is retained. The standalone draft passed before porting; compiled production
passed before page enablement. No deployment was performed.

## Verified source and objective coverage

Cambridge 9702, user-supplied `664565-2025-2027-syllabus.pdf`, version 1,
2025–2027 exam years, pages 17–18. `lib/as-physics-syllabus.json` contains the
source hash and the 13 numbered objectives in sections 3.1–3.3.

| Objective | Practice content | Templates |
|---|---|---|
| 3.1.1 | Mass as inertia, comparison between objects | f1 |
| 3.1.2 | F = ma, including signed force and acceleration | f2 |
| 3.1.3 | Linear momentum as mass times signed velocity | f3 |
| 3.1.4 | Average force from rate of change of momentum during a rebound | a1 |
| 3.1.5 | All three Newton laws; gravitational/contact interaction pairs | f5, r1 |
| 3.1.6 | Weight as gravitational force, W = mg | f4 |
| 3.2.1 | Sliding friction, fluid drag direction, drag versus speed | f6 |
| 3.2.2 | Downward motion speeding up or slowing down under weight and drag | a2 |
| 3.2.3 | Terminal force balance; transitions after a change in drag | a3, r2 |
| 3.3.1 | Momentum conservation and the condition of zero external impulse | a5 |
| 3.3.2 | One- and two-dimensional inelastic collisions; two-dimensional elastic collision | a4, r4, r6 |
| 3.3.3 | Elastic relative speed and energy conservation; unequal-mass one-dimensional collision | a6, r5 |
| 3.3.4 | Conserved momentum with a loss of kinetic energy | r3 |

Coverage spans the three tiers together, rather than all 13 objectives in every
set. Questions are targeted practice, not an exhaustive assessment of every
possible context. Multiple choice and true/false questions provide explanations
in their worked solutions; open explanations are not marked against one rigid
text string. The short-answer law-identification template has an explicit closed
vocabulary with ordinal/number aliases. Numerical and ordered-vector answers
state units, component order and sign conventions.

## Verification on 2026-09-19

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Final standalone Dynamics draft | 3,000 | 9,000 | 54,000 | Zero failures; zero long decimals |
| Strictly compiled Dynamics production | 10,000 | 30,000 | 180,000 | Zero failures; zero long decimals |
| Topic 1 production regression | 10,000 | 30,000 | 180,000 | Zero failures; zero long decimals |
| Topic 2 production regression | 10,000 | 30,000 | 180,000 | Zero failures; zero long decimals |
| All nine registered units, all tiers | 3,000 | 81,000 | 486,000 | Zero shared-validator/self-match failures; legacy findings below |

Each AS unit passed 3,000 additional draft/production parity comparisons (1,000
per tier). Production was emitted by strict TypeScript compilation and executed
through the public engine function, not replaced by the draft. The full project
passes `tsc --noEmit --strict --incremental false`. After page enablement, an
additional 3,000 iterations per Dynamics tier checks production and availability
together. No authenticated browser/database end-to-end test was performed.

The Dynamics oracle independently reads the displayed values, recomputes answers
and verifies the choices. It checks metadata, objective IDs, six-question sets,
duplicate prompts, finite values, positive masses/times and signed quantities.
Every template must generate more than one semantic correct answer, rather than
just rotating the option letter. All 32 named branch cases are exercised,
including each Newton law, both friction directions, all four drag direction/speed
cases, early-stage force balance, external impulse, both terminal-speed changes,
sticking to the left/right/at rest, rebound versus forward motion in an elastic
collision, and either direction of two-dimensional deflection.

Collision invariants are checked in 15,000 draft cases and **50,000 production
cases** across a4/r3/r4/r5/r6: each momentum component, kinetic-energy decrease for
sticking, kinetic-energy equality for elastic collisions, and the relative speed
condition. The two-dimensional equal-mass elastic case also checks that outgoing
velocity vectors are perpendicular. Separate wall-rebound checks prohibit energy
gain and exercise both equal-speed and reduced-speed rebounds. Ordered-answer
checks reject missing delimiters, reversed unequal components and junk text;
incorrect choice letters and nearby wrong numerical values are also rejected.

An AST scan finds no identical branches in 42 Dynamics ternary expressions;
the combined AS scan checks 88. The blanket decimal scan covers all three
implemented AS units and all nine tiers: **zero long-decimal matches** in prompts,
accepted answers or solutions. The Dynamics-specific scan also includes hints.

## Real defect caught and fixed

**One physical-validity defect:** the first draft selected approach and rebound
speeds independently. The extended check, run for 3,000 iterations per tier,
reported `as-u3-a1: Passive stationary-wall rebound gains kinetic energy`.
Although the momentum-change answer was arithmetically correct, some generated
scenarios implied a ball gaining energy from an ordinary passive stationary wall.

The final draft chooses rebound speed first and derives approach speed as rebound
speed plus a nonnegative increment. It now states explicitly that the wall is
passive and stationary. The final draft and production runs pass the permanent
energy-bound check. The initial failing run is not counted as a passing run in
the table above.

Review also clarified the horizontal constraint in the rebound problem, made the
assumptions for a new terminal speed explicit, and used “right is positive” when
the common collision velocity may be negative. Sliding friction is included as
well as fluid drag. An unnecessary random common mass scale in the elastic-cart
question was removed; changing the actual mass ratio still changes the answer.
These are review refinements, not additional claimed stochastic bug discoveries.

Exact values are constructed: mass/contact-time ratios give clean forces,
sticking-collision initial velocities give clean common velocities, and elastic
collision velocities satisfy both momentum and energy constraints. For the
two-dimensional elastic collision, initial velocity is (5n, 0), and outgoing
velocities are (9n/5, ±12n/5) and (16n/5, ∓12n/5); their speeds are 3n and 4n.
This constructs physically consistent scenarios with terminating decimals.

## Existing legacy findings

The combined regression contains six existing IGCSE units and three AS units.
It still finds long decimals in the same three existing IGCSE templates:
`igcse-u15-r3`, `igcse-u15-r5`, `igcse-u18-r1`. These are explicitly reported,
not counted as passing, and have not been rewritten in the Dynamics batch.
Shared-validator and self-match checks are not a complete scientific audit of
the legacy IGCSE content.

## Reproduce from the project directory

```powershell
node scripts/test-as-physics-u3.mjs --iterations=3000
node scripts/port-as-physics-u3.mjs
node node_modules/typescript/bin/tsc --noEmit --strict --incremental false
node node_modules/typescript/bin/tsc lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u3.mjs --production --iterations=10000
node scripts/test-as-physics.mjs --production --iterations=10000
node scripts/test-as-physics-u2.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
```

For pre-enablement verification, `--before-enable` only defers the page flag
assertion; scientific, metadata, registration and parity checks still run.
The fixed seed is stored in the test script. Porting adds TypeScript annotations
to the verified draft and normalizes Windows newlines. Prior-topic tests now
check an unknown unit ID rather than incorrectly requiring the next completed
topic to remain unsupported. The combined scan automatically discovers the
registered units.

Topics 1–5 are now enabled; topics 6–11 remain pending. Next checkpoint: Topic 6,
Deformation of solids.
