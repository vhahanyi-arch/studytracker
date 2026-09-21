# AS Physics 9702 — Particle physics checkpoint

Topic 11 is implemented as `structuredAsParticles`, registered as `as-u11`, and enabled in `app/page.tsx`. It follows the established `sq` / `validateUnitSet` architecture: six questions per tier and 18 templates. The [revision notes and formula sheet](as-physics-notes/topic-11-particle-physics.md) accompany this checkpoint. No push or deployment was performed.

All 11 AS theory topics are now implemented and enabled locally. Together their references cover the 145 objectives in the checked syllabus record. This completes the topic-by-topic AS theory build; it does not constitute practical-assessment preparation or an exhaustive past-paper bank.

## Source and objective coverage

Supplied Cambridge 9702 syllabus, version 1, examinations 2025–2027, printed page 25: 18 objectives in sections 11.1–11.2. The source page was extracted and visually checked, including nuclide notation and beta-decay requirements. The objective wording and PDF source SHA-256 are recorded in `lib/as-physics-syllabus.json`.

| Objective | Practice | Template |
|---|---|---|
| 11.1.1 | Alpha-scattering observations and nuclear-model inferences | f1 |
| 11.1.2 | Proton, neutron and orbital-electron location/charge | f2 |
| 11.1.3 | Proton versus nucleon number | f3 |
| 11.1.4 | Isotopes versus different elements | f4 |
| 11.1.5 | Read/use nuclide notation | f5 |
| 11.1.6 | Conserve nuclear charge and nucleon number | f6 |
| 11.1.7 | Alpha, beta-minus, beta-plus and gamma composition/mass/charge | a1 |
| 11.1.8 | Positron as electron antiparticle; equal positive rest mass | a2 |
| 11.1.9 | Electron antineutrino versus electron neutrino in beta decay | a3 |
| 11.1.10 | Discrete alpha energies and continuous beta energies | a4 |
| 11.1.11 | Complete alpha and beta decay equations | a5 |
| 11.1.12 | Unified atomic mass unit conversion | a6 |
| 11.2.1 | Correct a six-quark-flavour list | r1 |
| 11.2.2 | Charges of all six quarks and their antiquarks | r2 |
| 11.2.3 | Proton/neutron compositions and composite nature | r3 |
| 11.2.4 | Baryon versus meson constituents | r4 |
| 11.2.5 | Single-quark changes during both beta-decay modes | r5 |
| 11.2.6 | Leptons versus hadrons, independent of production process | r6 |

Coverage is collective across tiers and variants. Reasoning questions correct explicit misconceptions and include explanations; the existing answer interface grades the selected option or number, not a student's written explanation. Nuclides use explicit text notation `^A_Z X`. Multiple-choice equation questions are not a drawing or free-form equation editor. The bank uses nine known decay examples; it does not infer physical decay possibility from conservation alone.

## Verification results

| Check | Iterations per tier | Sets | Questions | Result |
|---|---:|---:|---:|---|
| Standalone Topic 11 draft | 3,000 | 9,000 | 54,000 | Passed; no long decimals |
| Compiled Topic 11 production | 10,000 | 30,000 | 180,000 | Passed; no long decimals |
| Topic 11 after page enablement | 3,000 | 9,000 | 54,000 | Content, registration and availability passed |
| Compiled Topics 1–10, each | 10,000 | 30,000 | 180,000 | All ten passed; 1,800,000 questions combined |
| Shared AS/IGCSE validator and marking | 3,000 per tier per unit | 153,000 | 918,000 | Passed across 11 AS and 6 implemented IGCSE units |

Each Topic 11 production run additionally compared 3,000 identically seeded draft/production sets. Strict engine compilation and full-project strict TypeScript checking passed, including a project check after page enablement.

The independent oracle reparses prompts, uses a separate decay reference, balances all offered nuclear equations and asserts that exactly one option conserves both nucleon number and charge. It checks the topic/objective mapping, answer self-matching, rejection of incorrect option letters, positive masses, known nuclide counts, and meaningful semantic variation for every template. The 180,000-question run performed 40,000 conservation checks and 30,000 quark-charge checks. All 86 required cases occurred, including all six flavours and antiquarks, nine decay examples in each relevant template, all four radiation descriptions and all 19 unit-conversion masses. All 18 templates had at least two distinct semantic answers.

The static scan checked 42 Topic 11 conditional expressions for identical arms; the shared scan checked 301 AS conditionals. Shared marking passed 98 numeric-tolerance boundary checks. There were no AS long-decimal templates. The known legacy long decimals in `igcse-u15-r3`, `igcse-u15-r5` and `igcse-u18-r1` remain outside this topic's scope; the shared regression is not a new scientific audit of IGCSE content.

## Actual findings and corrections

Two content issues were corrected during draft review before the first automated run:

1. Independently chosen proton/neutron counts could describe unbound nuclei. The count question now samples a fixed list of known nuclides.
2. The lepton multiple-choice question initially offered two scientifically true statements about different leptons. The answer choices now contain one correct correction for the named particle and three false classifications.

The standalone automated run found no further physics, answer-key or decimal failures. The initial strict port compilation caught a tuple-type inference problem in the nuclide table. An explicitly typed table fixed it; the draft was rerun, the engine recompiled, and compiled-production tests then passed. This was a type-declaration issue, not a physics calculation error. A final diff check also caught an extra blank line added when rerunning the port; the port now preserves the separator and was verified to produce identical output on repeated runs. The rest of the engine matches the previous checkpoint exactly.

No existing topic generator, shared validator or answer matcher was changed. Unrelated stylesheet work was excluded. These local checks do not imply browser integration testing, pushing or deployment.

## Reproduction

Run from the project root:

```powershell
node scripts/test-as-physics-u11.mjs --iterations=3000
node scripts/port-as-physics-u11.mjs
$topicCompiler = node -p "require.resolve('typescript/bin/tsc')"
node $topicCompiler lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics-u11.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
node $topicCompiler --noEmit --strict --incremental false
```

Previous checkpoint: [Topic 10 — D.C. circuits](as-physics-circuits-verification.md). [Complete AS revision-reference index](as-physics-notes/README.md).
