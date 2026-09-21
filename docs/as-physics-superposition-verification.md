# AS Physics 9702 — Superposition checkpoint

Topic 8 is implemented as `structuredAsSuperposition`, registered as `as-u8`, and enabled in `app/page.tsx`. It follows the existing `sq` / `validateUnitSet` architecture: six questions per tier and 18 templates. The [revision notes and formula sheet](as-physics-notes/topic-8-superposition.md) accompany this checkpoint. No push or deployment was performed.

## Verified source and coverage

Supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed page 22: 12 objectives in sections 8.1–8.4. The objective transcription and PDF hash are in `lib/as-physics-syllabus.json`.

| Objective | Practice content | Templates |
|---|---|---|
| 8.1.1 | Signed displacement superposition | f1 |
| 8.1.2 | Stationary-wave experiments with microwaves, strings and air columns; successive tube resonances | a1, r6 |
| 8.1.3 | Nodes/antinodes and addition of counter-travelling wave profiles over a cycle | f2, r2 |
| 8.1.4 | Node–node and node–antinode spacing | f3 |
| 8.2.1 | Diffraction as spreading, distinguished from interference | f4 |
| 8.2.2 | Ripple-tank gap width relative to wavelength | a2 |
| 8.3.1 | Coherence, phase and path difference; constructive/destructive interference | f5, r5 |
| 8.3.2 | Two-source experiments with water, sound, light and microwaves | a3 |
| 8.3.3 | Stable phase, polarisation and amplitude conditions; contrast versus complete cancellation | r1 |
| 8.3.4 | Double-slit wavelength; correct number of fringe intervals | a4, r3 |
| 8.4.1 | Line density, spacing, grating equation and allowed orders | f6, a5, r4 |
| 8.4.2 | Grating wavelength experiment: angle reference and order identification | a6 |

Coverage is collective across tiers, not exhaustive in every six-question set. Graphical superposition is represented by exact profile sample pairs at four quarter-period instants; it does not render a graph image. The notes explain how to add complete profiles and give the required experiment methods. Open-ended explanations are assessed through focused multiple-choice or true/false items rather than rigid paraphrase matching.

The questions assume negligible air-column end corrections and do not require spectrometer construction. Grating illumination is normal, maxima counts use an ideal grating with no missing orders, and the constructed maximum-order ratios are half-integers to avoid an ambiguous grazing 90° order. Double-slit geometries explicitly use the small-angle approximation. Light interference illumination is explicitly coherent.

## Final verification results

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 8 draft | 3,000 | 9,000 | 54,000 | No failures or long decimals |
| Compiled Topic 8 production | 10,000 | 30,000 | 180,000 | No failures or long decimals |
| Topic 8 after page enablement | 3,000 | 9,000 | 54,000 | Content, registration and UI checks passed |
| Earlier Topics 1–7, compiled production | 10,000 per topic | 210,000 | 1,260,000 | All content, parity and UI checks passed |
| Shared scan: eight AS and six implemented IGCSE units | 3,000 per unit | 126,000 | 756,000 | No validator/self-matching failures or AS long decimals |

Each production topic also compared 1,000 draft/production sets per tier (3,000 parity sets per topic), separate from the question totals in the table. Topic 8's main production run performed 80,000 wave calculation checks and 20,000 profile/order checks. All 18 templates produced multiple semantic answers; all 30 named scenarios were exercised. Its 34 conditional expressions had differing branches. The combined AS scan checked 213 conditionals, and all 98 shared numeric-tolerance checks passed.

The oracle parses displayed values and checks signs, units, physical ranges, answer keys and distractors. It adds the profile pairs to identify zero-amplitude nodes and maximum-amplitude antinodes, enumerates allowed signed grating orders independently of the generator's constructed answer, and calculates relative phase to check interference outcomes. It rejects the specified wrong fringe-interval count and wrong full-wavelength resonance interpretation. Numeric answer checks include signed and zero answers, rejecting a 1% error while accepting a 0.05% deviation. The decimal scan covers prompts, hints, solutions and accepted answers for Topic 8.

The real engine compiled strictly against `PhysicsQuestion`; full-project `--noEmit --strict --incremental false` also passed. These checks do not constitute browser end-to-end testing or deployment. The separate UI track's changes to `app/globals.css` are excluded from this content commit.

## Findings and corrections

**No question calculation, answer-key or decimal defect was found.** The first draft run did find one error in the new verification code: a geometry assertion demanded D/a strictly greater than 1000 and rejected the valid endpoint D/a = 1000. This was an overly strict test boundary, not a failure of the small-angle model. The check now includes that endpoint; all generated fringe-spacing angles are independently required to be small. The corrected 54,000-question draft run passed.

Review made the coherent-light-source assumption explicit and specified no missing grating orders for the maxima-count question. Grating ratios avoid the grazing-order boundary by construction. The notes distinguish equal amplitudes (needed for completely dark minima) from coherence (needed for a stable pattern), rather than treating unequal amplitudes as preventing all interference.

## Existing limitations

The blanket scan still reports the previously documented legacy decimal templates `igcse-u15-r3`, `igcse-u15-r5` and `igcse-u18-r1`. All eight implemented AS topics have zero long-decimal matches in this run; the entire mixed AS/IGCSE bank does not. Legacy generators and shared marking behaviour were not changed in this checkpoint.

## Reproduce

From the project directory:

```powershell
node scripts/test-as-physics-u8.mjs --iterations=3000
node scripts/port-as-physics-u8.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u8.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

The fixed seed is recorded in the test script. `--before-enable` skips only the page availability assertion in the initial production check. Topics 1–8 are now enabled. Next: Topic 9, Electricity.
