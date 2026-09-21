# AS Physics 9702 — D.C. circuits checkpoint

Topic 10 is implemented as `structuredAsCircuits`, registered as `as-u10`, and enabled in `app/page.tsx`. It uses the established `sq` / `validateUnitSet` architecture with six questions per tier and 18 templates. The [revision notes and formula sheet](as-physics-notes/topic-10-dc-circuits.md) include both source circuit-symbol sheets. No push or deployment was performed.

## Source and coverage

Supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed page 24: 16 objectives in sections 10.1–10.3. Circuit symbols on printed pages 61–62 were rendered and visually inspected; copies are included in the notes. Objective wording and the PDF source SHA-256 are recorded in `lib/as-physics-syllabus.json`.

| Objective | Practice | Templates |
|---|---|---|
| 10.1.1 | Recognise all 27 component/connection symbols by their distinguishing marks | f1 |
| 10.1.2 | Interpret branch and node connections for ideal meters | f2 |
| 10.1.3 | E.m.f. as source energy per charge | f3 |
| 10.1.4 | Energy distinction between e.m.f. and p.d. | f4 |
| 10.1.5 | Terminal p.d., internal resistance, open-circuit measurement | a1, r2 |
| 10.2.1 | Junction law and conservation of charge | f5 |
| 10.2.2 | Loop law and conservation of energy | f6 |
| 10.2.3 | Derive series resistance using common current | a2 |
| 10.2.4 | Calculate series equivalent resistance | a3 |
| 10.2.5 | Derive parallel resistance using common p.d. | a4 |
| 10.2.6 | Equal and unequal parallel resistors | a5 |
| 10.2.7 | Mixed series/parallel circuit and branch current | r1 |
| 10.3.1 | Unloaded and loaded potential dividers | a6, r6 |
| 10.3.2 | Potentiometer balance-length comparison | r3 |
| 10.3.3 | Galvanometer null: branch current and balanced p.d.s | r4 |
| 10.3.4 | LDR/NTC dividers, both positions and input directions | r5 |

Coverage is collective across tiers and random variants. The existing question format is text-based: f1 describes the symbol, and f2 tests diagram connections in words. It does not grade student-drawn diagrams. The notes supply the actual symbols and a drawing exercise for objectives 10.1.1–10.1.2. These 18 templates provide bounded practice, not exhaustive exam or practical-assessment coverage.

## Verification

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Corrected standalone Topic 10 draft | 3,000 | 9,000 | 54,000 | Passed; no long decimals |
| Compiled Topic 10 production | 10,000 | 30,000 | 180,000 | Passed; no long decimals |
| Topic 10 after enablement | 3,000 | 9,000 | 54,000 | Passed, including registration and page availability |
| Compiled Topics 1–9, each | 10,000 | 30,000 | 180,000 | All nine passed; 1,620,000 questions combined |
| Shared AS/IGCSE validator and marking | 3,000 per tier per unit | 144,000 | 864,000 | Passed across 10 AS and 6 implemented IGCSE units |

Each production Topic 10 run additionally compared 3,000 draft/production sets using identical seeded randomness. The engine was strictly compiled before production testing; full-project strict TypeScript checks passed, including after page enablement.

The independent Topic 10 oracle reads prompts and recomputes numerical answers rather than trusting solutions. Its 180,000-question run checked all 16 objective IDs, 18 templates, at least two distinct semantic answers per template, all 27 symbols and all eight sensor scenarios. Forty-five explicitly required branches were observed. It performed 150,000 circuit/conservation/physical-condition checks and 40,000 numerical checks of the algebraic derivations. All 31 Topic 10 conditional expressions had differing arms; the shared scan checked 259 AS conditionals. These checks are evidence for the exercised templates, not a general proof of every possible circuit.

The shared scan passed 98 numeric-marking tolerance boundaries, found no AS long-decimal templates, and retained the already documented legacy long decimals in `igcse-u15-r3`, `igcse-u15-r5` and `igcse-u18-r1`. This regression is not a new scientific audit of IGCSE content.

## Actual finding and correction

The initial standalone run caught one issue in r2: independently random terminal voltage, loaded current and internal resistance sometimes made the learner's incorrect terminal-V/I method equal the correct internal resistance by coincidence. The generated loaded terminal voltage now exceeds I r by a positive multiple of 4 V. Consequently terminal V/I is always greater than r, and the intended misconception is unambiguous. The independent regression continues to assert that the wrong method differs from the correct answer.

No shared answer matcher, validation rules or existing topic generators were changed. Unrelated stylesheet work was excluded from this checkpoint. No browser integration test, push or deployment is implied by the local checks.

## Reproduction

Run from the project root:

```powershell
node scripts/test-as-physics-u10.mjs --iterations=3000
node scripts/port-as-physics-u10.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u10.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

Previous checkpoint: [Topic 9 — Electricity](as-physics-electricity-verification.md). Next syllabus topic: **11 — Particle physics**.
