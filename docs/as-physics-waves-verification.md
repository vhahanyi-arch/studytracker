# AS Physics 9702 — Waves checkpoint

Topic 7 is implemented as `structuredAsWaves`, registered as `as-u7`, and enabled in `app/page.tsx`. The existing architecture is preserved: six questions in each of three tiers, 18 templates, `sq`, `validateUnitSet`, `answerMatches`, and the public generation API. The [revision notes and formula sheet](as-physics-notes/topic-7-waves.md) accompany the generator. No push or deployment was performed.

## Source, scope and coverage

The supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed pages 20–21, defines 16 objectives in sections 7.1–7.5. Its objective text and source hash are in `lib/as-physics-syllabus.json`.

| Objective | Coverage | Templates |
|---|---|---|
| 7.1.1 | Progressive waves on ropes and springs; local particle motion | f1 |
| 7.1.2 | Amplitude, period, frequency, wavelength; displacement and phase lag | f2, r6 |
| 7.1.3 | CRO time-base, period/frequency, y-gain and peak-to-peak amplitude | a1 |
| 7.1.4 | Deriving v = fλ from distance per period and rearranging | a2 |
| 7.1.5 | Wave speed and wavelength unit conversion | a3 |
| 7.1.6 | Energy transfer without net bulk transport in the ripple-tank model | r1 |
| 7.1.7 | Power/area, squared amplitude ratio and power over a new area | f3, r5 |
| 7.2.1 | Transverse versus longitudinal particle motion | f4 |
| 7.2.2 | Interpreting a longitudinal displacement-position graph | a4 |
| 7.3.1 | Doppler wavefront spacing, pitch and unchanged sound speed | r2 |
| 7.3.2 | Moving-source, stationary-observer frequency; approach and recession | a5 |
| 7.4.1 | Common free-space electromagnetic speed and transverse nature | f5 |
| 7.4.2 | Interior wavelength examples across all seven named spectral regions | a6 |
| 7.4.3 | Explicit syllabus visible range, 400–700 nm | f6 |
| 7.5.1 | Polarisation as evidence of transverse motion; longitudinal sound | r3 |
| 7.5.2 | Malus's law applied sequentially to two ideal filters | r4 |

Coverage spans the tiers collectively; six questions do not assess every objective on every call. Graph coordinates and CRO division readings are supplied as text rather than rendered images. The notes explain both transverse and longitudinal graph interpretation, and give the associated definitions, derivations, formulas, symbols, units and conditions.

Doppler questions keep the observer stationary, the air still and the source subsonic, moving directly towards or away from the observer. Polariser questions start with plane-polarised light. Neither the moving-observer formula nor the unpolarised-light intensity calculation is introduced.

Objective 7.4.2 asks for approximate spectral ranges but gives no numerical boundaries outside the explicit visible range in 7.4.3. This ambiguity is flagged in the notes. Their conventional approximate table and the question bank's interior examples were cross-checked against [NASA's spectrum table](https://imagine.gsfc.nasa.gov/science/toolbox/spectrum_chart.html); these supplementary numerical conventions are not presented as Cambridge-prescribed thresholds or new syllabus objectives. Questions distinguish the separately named radio and microwave regions and avoid boundary wavelengths and specialised overlapping classifications.

## Final verification

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 7 draft | 3,000 | 9,000 | 54,000 | No failures or long decimals |
| Compiled Topic 7 production | 10,000 | 30,000 | 180,000 | No failures or long decimals |
| Topic 7 after page enablement | 3,000 | 9,000 | 54,000 | Content, registration and UI checks passed |
| Earlier Topics 1–6, compiled production | 10,000 per topic | 180,000 | 1,080,000 | All passed, including parity and UI checks |
| Shared scan: seven AS plus six implemented IGCSE units | 3,000 per unit | 117,000 | 702,000 | No validator/self-matching failures or AS long decimals |

Each production topic also compared 1,000 draft/production sets per tier (3,000 parity sets per topic), separate from the table's question counts. Topic 7's main production run performed 80,000 wave calculation checks and 20,000 algebra candidate checks. All 18 templates produced multiple semantic answers, all 39 named scenarios were exercised, and all 33 conditional expressions had differing branches. The combined AS AST scan checked 179 conditional expressions; the shared numeric-tolerance suite passed all 98 checks.

The independent oracle parses the displayed question rather than reading the generator's hidden variables. Doppler frequency is reconstructed from wavefront spacing during a source period. Malus's law is checked using numerical cosine values and successive relative angles, independently of the draft's exact-value lookup. Algebra multiple-choice options are checked for exactly one correct candidate using two substitutions per branch. Numeric answers self-match, a 1% error is rejected, and a 0.05% deviation is accepted; zero-intensity cases are also checked.

The actual engine compiled strictly against `PhysicsQuestion`, and full-project `--noEmit --strict --incremental false` passed. This is not a browser end-to-end test. Concurrent changes to `app/globals.css` belong to the separate UI track and are excluded from this content commit.

## Defect found and fixed

**One question-design defect:** the first polariser draft used axes at 60° and, in one branch, 120° to the original polarisation. The correct second relative angle was 60°, but cos²120° = cos²60°. Therefore the learner's stated wrong method accidentally gave the correct result. The test rejected that branch in the initial 54,000-question run; its missing branch-coverage message was a consequence of the same defect, not a second bug.

The first axis is now 45°. Relative second angles remain 0°, 30°, 45°, 60° and 90°, preserving aligned, intermediate and crossed-filter cases. For every generated case, the test now verifies that the stated wrong method gives a different result. No calculation-key, decimal or physical-validity failure remained after the correction. Review also clarified negative graph extrema and particle-motion wording, and kept CRO heights within eight vertical divisions.

## Existing limitations

The three previously documented legacy long-decimal templates remain: `igcse-u15-r3`, `igcse-u15-r5`, and `igcse-u18-r1`. The shared scan reports them explicitly. All seven implemented AS topics are free of long-decimal matches in this run; the whole mixed AS/IGCSE bank is not. No legacy generator or shared marking behaviour was changed in this checkpoint.

## Reproduce

From the project directory:

```powershell
node scripts/test-as-physics-u7.mjs --iterations=3000
node scripts/port-as-physics-u7.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u7.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

The fixed seed is in the test script. `--before-enable` skips only the UI availability assertion during the initial production check. Topics 1–7 are enabled; next is Topic 8, Superposition.
