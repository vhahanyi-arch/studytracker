# AS Physics 9702 — Topic 1 checkpoint

This is the historical Topic 1 verification record. Topics 2–5 are now implemented;
see [the Topic 5 checkpoint](as-physics-energy-verification.md) for current
coverage and the latest combined regression results. Topics 6–11 remain pending.

Implemented in `lib/physics-question-engine.ts` as `structuredAsQuantities`,
registered as `as-u1` in `asTopics`, and enabled in `app/page.tsx`.
Exactly six questions per tier; 18 templates across foundational, application and
reasoning. Uses the existing `sq`, `validateUnitSet`, `answerMatches`, and public
`makePhysicsQuestions` API. No architecture replacement and no deployment.

## Source and scope

User-supplied `664565-2025-2027-syllabus.pdf`, Cambridge 9702, version 1,
exam years 2025–2027. Page 15 assigns topics 1–11 to AS; pages 16–25 contain
**11 topics, 32 subsections, 145 numbered theory objectives, zero duplicate IDs
or objective texts**. Topic 1 has 12 objectives on page 16.

`lib/as-physics-syllabus.json` records the complete AS theory hierarchy, objective
wording, source pages, source SHA-256, and explicit equation transcription repairs.
`scripts/extract-as-physics-syllabus.py` reproduces it from the supplied PDF.
All ten AS content pages were rendered and visually checked, including fractions,
superscripts and nuclear notation that plain text extraction scrambled.
The subsection objective counts are asserted against the inspected pages.

The existing 11 AS unit IDs and topic order matched the PDF. No invented units
were found. Topic 1's display title now follows the source wording, and its summary
also mentions scalars and vectors. Topics 2–11 remain unavailable pending their
own draft and production verification. Practical assessment is a separate syllabus
section and is not claimed as covered by this question engine. The extracted data
is not yet wired into the currently empty AS checklist view.

## Topic 1 objective coverage

Coverage is across the three tiers together, not all 12 objectives in every set.
These are targeted practice questions, not exhaustive assessment of every possible
context within each objective.

| Objective | Content | Templates |
|---|---|---|
| 1.1.1 | Numerical magnitude and unit | f1 |
| 1.1.2 | Reasonable estimates | f2 |
| 1.2.1 | Five specified SI base quantities and units | f3 |
| 1.2.2 | Derived SI units | f4 |
| 1.2.3 | Homogeneity and its limitations | a1, r1 |
| 1.2.4 | All ten specified prefixes; squared-unit conversion | f5, r2 |
| 1.3.1 | Systematic/zero errors and random errors | a2, r3 |
| 1.3.2 | Precision versus accuracy | a6 |
| 1.3.3 | Absolute and percentage uncertainty propagation | a3, r4 |
| 1.4.1 | Scalar/vector distinction and examples | f6 |
| 1.4.2 | Addition and subtraction of coplanar vectors | a4, r5 |
| 1.4.3 | Perpendicular components | a5, r6 |

## Verification results

Final passing runs on 2026-09-19:

| Check | Sets | Questions | Result |
|---|---:|---:|---|
| Standalone draft, 3,000 iterations per tier | 9,000 | 54,000 | Zero failures / long decimals |
| Strictly compiled production, 10,000 per tier | 30,000 | 180,000 | Zero failures / long decimals |
| Draft/compiled production parity, 1,000 per tier | 3,000 | 18,000 compared pairs | Identical output for identical random streams |
| All 7 registered units, 3,000 per tier | 63,000 | 378,000 | Zero shared-validation or answer self-match failures; legacy decimal findings below |

The AS blanket scan covers all three tiers of the sole implemented AS unit.
Tests independently reconstruct the expected answers from displayed question text,
check signed ordered components and reject missing delimiters, reversed components
and junk text. They check metadata, duplicate prompts, valid objective IDs, finite
values, numeric physical bounds, multiple-choice keys and all 12 objective IDs.
Every template must produce at least two semantic answers, not just change option
letters. An AST scan rejects identical ternary branches. Long-decimal checks include
prompts, accepted answers and solutions. Closed unit-name answers include British
and US spellings; explanatory questions use multiple choice rather than rigid prose
matching. Numeric answers state the required unit; vector components state their order.

Twelve malformed-set rejection checks and four marking compatibility checks pass.
The full project passes `tsc --noEmit --strict --incremental false`; production is
also emitted by strict `tsc` and executed through its public exports. The final
production regression does not execute the draft in place of production code.
UI availability and API registration are asserted. No authenticated browser/session
or database end-to-end test was performed.

## Findings fixed

1. Two reasoning drafts varied their scenarios but kept the same semantic answer.
   Replaced the generic responses with scenario-specific correct choices.
2. Shared ordered-list marking removed commas before comparing answers, so `12`
   could match `1, 2`. Parse strictly delimited numeric lists before normalization;
   also reject surrounding junk and incorrect component order. Single numeric
   tolerance and textual ordered-answer behavior are retained.
3. The shared validator omitted the specified six-question count, nonempty content,
   and answer self-match checks. Added these and duplicate template-ID rejection.
4. Review found “northeast” could imply 45 degrees in a 3:4 component question.
   Changed it to “between east and north”, retaining the explicit ratio.
5. Removed a redundant random sum/difference switch: absolute uncertainties add
   in either case, so that switch did not change the answer. The final question
   uses subtraction and varies the two uncertainties instead.

No answer-first arithmetic failures or physically invalid values were detected in
the final AS runs. Fraction/superscript extraction repairs are listed separately in
the syllabus JSON provenance; they are not question-engine bug counts.

## Existing-checkout discrepancies

The brief describes 21 completed IGCSE generators; this checkout contains only six:
u1, u14, u15, u16, u17 and u18. Shared-regression checks are not a scientific audit
of those legacy generators. A whole-engine decimal scan found three existing
IGCSE templates with long decimals: `igcse-u15-r3`, `igcse-u15-r5`, and
`igcse-u18-r1`. These have not been silently counted as passing, and were not
rewritten as part of the AS Topic 1 batch. Thus the new AS engine has zero decimal
findings, but a zero-decimal claim for the entire existing IGCSE engine is not valid.

## Reproduce from the project directory

```powershell
python scripts/extract-as-physics-syllabus.py 'C:\Users\USER\Downloads\664565-2025-2027-syllabus.pdf'
node scripts/test-as-physics.mjs --iterations=3000
node scripts/port-as-physics-u1.mjs
node node_modules/typescript/bin/tsc --noEmit --strict --incremental false
node node_modules/typescript/bin/tsc lib/physics-question-engine.ts --strict --target es2020 --module commonjs --skipLibCheck --outDir tmp/9702/compiled
node scripts/test-as-physics.mjs --production --iterations=10000
node scripts/test-physics-shared-regression.mjs
```

Python requires `pypdf`. Node uses this project's installed TypeScript package.
The deterministic random seeds are saved in the test scripts. Porting only adds
TypeScript annotations to the verified draft body; parity tests detect drift.
Temporary renders and compiled output are excluded from version control.

Next syllabus checkpoint: Topic 6, Deformation of solids.
