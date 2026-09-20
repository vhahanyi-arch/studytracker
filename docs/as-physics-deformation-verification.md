# AS Physics 9702 — Deformation of solids checkpoint

Historical Topic 6 checkpoint. The latest status is in the [Topic 7 verification report](as-physics-waves-verification.md). Topics 1–7 are now enabled.

Topic 6 is implemented as `structuredAsDeformation`, registered as `as-u6`, and enabled in `app/page.tsx`. It uses the existing `sq`, `validateUnitSet`, `answerMatches` and public generation API: six questions per tier, 18 templates in total. The accompanying [revision notes and formula sheet](as-physics-notes/topic-6-deformation-of-solids.md) cover all ten objectives. No push or deployment was performed.

## Source and coverage

Supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed page 20. Objective wording and the source hash are recorded in `lib/as-physics-syllabus.json`.

| Objective | Coverage | Templates |
|---|---|---|
| 6.1.1 | Tensile and compressive loading in one dimension | f1 |
| 6.1.2 | Extension/compression from original length; proportionality limit | f2, r5 |
| 6.1.3 | Hooke's law | f4 |
| 6.1.4 | Spring constant and cm-to-m conversion | f3 |
| 6.1.5 | Stress, strain, Young modulus, geometry and extension scaling | f5, a1, a2, r1 |
| 6.1.6 | Wire experiment: diameter, gauge length, readings, graph; diameter/radius error | a3, r2 |
| 6.2.1 | Elastic/plastic behaviour and distinction between the two limits | f6, r3 |
| 6.2.2 | Work from piecewise-linear loading and unloading graphs | a4, r4 |
| 6.2.3 | Triangular graph area and stored elastic energy | a5 |
| 6.2.4 | Elastic-energy formula and additional work from an initial extension | a6, r6 |

Coverage spans the tiers together, not every objective in each generated set. Experiment questions are targeted multiple-choice checks; the notes give the complete experimental procedure. Graph questions describe their exact coordinates in text. Energy accounting in r4 is a direct application of graph area and Topic 5; the thermal-loss assumption is explicitly supplied, not treated as an unstated general plasticity model.

## Verification results

Final runs after correcting the marking defect:

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 6 draft | 3,000 | 9,000 | 54,000 | No failures or long decimals |
| Compiled Topic 6 production | 10,000 | 30,000 | 180,000 | No failures or long decimals |
| Topic 6 after page enablement | 3,000 | 9,000 | 54,000 | No failures; UI flag passed |
| Earlier Topics 1–5, compiled content | 10,000 per topic | 150,000 | 900,000 | All content checks passed; see Topic 5 UI recovery below |
| Topic 5 after UI recovery | 3,000 | 9,000 | 54,000 | Content, parity and UI checks passed |
| Shared scan: six AS and six implemented IGCSE units | 3,000 per unit | 108,000 | 648,000 | No validator/self-matching failures; no AS long decimals |

Each production topic also compared 1,000 draft/production sets per tier (3,000 parity sets per topic), separate from the question counts above. Topic 6's 10,000-per-tier run included 50,000 energy checks and 30,000 algebra/geometry checks. All 18 templates produced more than one semantic answer; all 16 named branch scenarios were exercised. The AST check found 17 Topic 6 conditional expressions with differing branches; the combined AS scan checked 146. There were 98 explicit shared numeric-tolerance checks.

Strict compilation of the actual engine against `PhysicsQuestion` passed, as did full-project `--noEmit --strict --incremental false` after the changes. This is not a browser end-to-end or deployment check.

## Defects and review changes

**One marking defect found and fixed.** The original single-number checker used `max(0.0001, 0.1% of the answer)` as its tolerance. It incorrectly accepted both `0` and `0.00011` for a correct strain of `0.0001`. A 54,000-question draft run with the added near-zero assertions reproduced both symptoms of this one defect. The checker now applies the promised 0.1% relative tolerance, with only a machine-precision allowance at the boundary. A correct answer of zero requires numeric zero. Ordered-list matching is unchanged.

The shared regression now checks small and large positive and negative answers, both 0.1% boundaries, answers just outside tolerance, zero, and invalid input. Topic 6 separately rejects zero and a 10% strain error while accepting an answer within 0.1%. Earlier topic content and the shared self-matching checks were rerun after the fix.

**One concurrent integration regression recovered.** During the run, parallel shared-page changes restored Topic 5's old disabled entry. Its 180,000-question content regression and parity checks passed, but its final UI assertion failed. The verified Topic 5 title, summary and enabled flag were restored; a further 54,000-question run passed content, parity and UI checks. Other UI edits are outside this content checkpoint and must not be included in its commit.

Review also made the unloading question's energy-loss assumption explicit and expanded experiment coverage from measurement instruments to collecting readings and processing the graph. No new Topic 6 calculation or decimal defect was found. Formula values are constructed to terminate cleanly; no rounding is used to conceal a calculation error.

## Existing limitations

The blanket scan still reports the previously documented long-decimal templates `igcse-u15-r3`, `igcse-u15-r5` and `igcse-u18-r1`. These legacy generators were not changed. Therefore the whole mixed AS/IGCSE engine does **not** have zero long-decimal matches; all six implemented AS topics do. Only six IGCSE units are implemented in the current registry, despite the original brief's description of 21.

## Reproduce

From the project directory, run:

```powershell
node scripts/test-as-physics-u6.mjs --iterations=3000
node scripts/port-as-physics-u6.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u6.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

The fixed random seed is recorded in the Topic 6 test script. `--before-enable` skips only the page flag assertion during initial production verification. Topics 1–6 are now enabled. Next: Topic 7, Waves.
