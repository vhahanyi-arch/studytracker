# AS Physics 9702 — Electricity checkpoint

Topic 9 is implemented as `structuredAsElectricity`, registered as `as-u9`, and enabled in `app/page.tsx`. It preserves the established `sq` / `validateUnitSet` architecture: six questions per tier and 18 templates. The [revision notes and formula sheet](as-physics-notes/topic-9-electricity.md) accompany this checkpoint. No push or deployment was performed.

## Source and coverage

Supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed page 23: 15 objectives in sections 9.1–9.3. Objective wording and the PDF source hash are recorded in `lib/as-physics-syllabus.json`.

| Objective | Practice content | Templates |
|---|---|---|
| 9.1.1 | Charge carriers in metals and electrolytes | f1 |
| 9.1.2 | Quantised electron charge and carrier counts | f2, r4 |
| 9.1.3 | Q = It | f3 |
| 9.1.4 | I = Anvq, area conversion and drift-speed scaling | a1, r5 |
| 9.2.1 | Potential difference as energy per unit charge | f4 |
| 9.2.2 | V = W/Q | a2 |
| 9.2.3 | P = VI, I²R and V²/R | a3 |
| 9.3.1 | Resistance as V/I at an operating point | f5 |
| 9.3.2 | V = IR | a4 |
| 9.3.3 | Metallic, filament-lamp and diode I–V characteristics | a5 |
| 9.3.4 | Filament heating and resistance change | r1 |
| 9.3.5 | Ohm’s law and constant physical conditions | f6 |
| 9.3.6 | R = ρL/A, area and constant-volume drawing | a6, r6 |
| 9.3.7 | LDR resistance versus light intensity | r2 |
| 9.3.8 | NTC thermistor resistance versus temperature | r3 |

Coverage is collective across tiers, not exhaustive in every six-question set. I–V characteristic questions describe the required sketches in text with current on the vertical axis and potential difference on the horizontal axis. The notes provide the full sketch behaviour and clarify that diode turn-on voltage, LDR response curves and thermistor response curves are not prescribed quantitatively by these objectives.

## Verification results

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 9 draft | 3,000 | 9,000 | 54,000 | No failures or long decimals |
| Compiled Topic 9 production | 10,000 | 30,000 | 180,000 | No failures or long decimals |
| Topic 9 after page enablement | 3,000 | 9,000 | 54,000 | Content, registration and UI checks passed |
| Earlier Topics 1–8, compiled production | 10,000 per topic | 240,000 | 1,440,000 | All content, parity and UI checks passed |
| Shared scan: nine AS and six implemented IGCSE units | 3,000 per unit | 135,000 | 810,000 | No validator/self-matching failures or AS long decimals |

Each production topic also compared 1,000 draft/production sets per tier (3,000 parity sets per topic), separate from the question totals above. Topic 9's main production run performed 100,000 electrical checks and 20,000 algebra/geometry checks. All 18 templates produced multiple semantic answers; all 16 named physical branches were exercised. Its 15 conditional expressions had differing branches; the combined AS scan checked 228. All 98 shared numeric-tolerance checks passed.

The independent oracle reconstructs current from carrier flow, power from each supplied form, resistance after a constant-volume draw, and drift speed from area proportional to radius squared. It verifies every I–V distractor's physical category and checks the fixed-voltage conditions for LDR and NTC power changes. Numeric checks reject a 1% error while accepting a 0.05% deviation. The decimal scan covers prompts, hints, solutions and answers.

The actual engine compiled strictly against `PhysicsQuestion`; full-project `--noEmit --strict --incremental false` passed. These checks do not constitute browser end-to-end testing or deployment. Concurrent changes to `app/globals.css` belong to the separate UI track and are excluded from this content commit.

## Findings and corrections

No calculation, answer-key, physical-validity or decimal defect was found in the Electricity draft. Review explicitly keeps the current-voltage condition visible: at fixed voltage, lower resistance means higher current and power; at fixed current, the power comparison is different. The notes distinguish resistance from resistivity, carrier count from carrier density, and the signed electron charge from its magnitude.

The shared numeric matcher was previously corrected during Topic 6 for small values such as strain. Topic 9's current and carrier tests also exercise small SI values and passed the same boundary checks. The three documented legacy IGCSE long-decimal templates remain unchanged.

## Existing limitations

The shared scan still reports `igcse-u15-r3`, `igcse-u15-r5` and `igcse-u18-r1` as legacy long-decimal templates. All nine implemented AS topics have zero long-decimal matches in this run; the entire mixed AS/IGCSE bank does not. Topics 10 and 11 remain pending.

## Reproduce

```powershell
node scripts/test-as-physics-u9.mjs --iterations=3000
node scripts/port-as-physics-u9.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u9.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

The fixed seed is recorded in the test script. `--before-enable` skips only the UI availability assertion during initial production verification. At this checkpoint, Topics 1–9 were enabled. Topic 10 is now recorded in the [D.C. circuits checkpoint](as-physics-circuits-verification.md).
