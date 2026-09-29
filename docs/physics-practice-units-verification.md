# Physics practice: units in typed answers

IGCSE 0625 and AS 9702 generated practice is marked by `answerMatches` in `lib/physics-question-engine.ts`. The answer box says "including units where shown", but the marker compared numbers only. For example, "7 m/s²" for an accepted "7" was marked wrong (igcse-u2-f6). This change reads the unit and checks it. No question text, answer or generator body changed, and the AS drafts and their markers are untouched.

## Rules (decided with the user, 2026-09-29)

- **A bare number is still right.** The unit is optional.
- **A wrong unit is wrong.** "7 kg" for an acceleration is marked wrong.
- **A different prefix is a different unit, even when converted.** "1.6 cm" and "160 cm" are both wrong for 1.6 m, and "Convert 160 cm to metres" cannot be answered with "160 cm".
- **Equivalent SI units and other notations are right.**
  - N·s = kg·m/s, N m = J, V/A = Ω, m/s² = N/kg.
  - m/s² = m/s^2 = m s⁻² = ms-2 = m/s/s = "metres per second squared".
  - Ω = ohm = ohms.
- **Case is relaxed only when nothing else is meant.** "7 j", "50 hz" and "3 mpa" are accepted; "Nm" is still N·m, not nm.
- **Answers with no unit refuse any unit.** These are counts, charges in units of e, coefficients of a power of ten, and ratios.
- **Sessions saved before this change have no unit recorded.** They accept any recognised unit, but nonsense ("7 bananas", "7x") is still wrong.

## Where the unit comes from

`ANSWER_UNITS` sits just above `makePhysicsQuestions`, outside the AS topic markers, so re-porting a draft cannot remove it. It maps each numeric template to the unit its solution states, written in that solution's notation. One template, `as-u7-a1`, asks for Hz or V depending on the instance, and the rule for it reads the end of the prompt. `makePhysicsQuestions` attaches `unit` to each question, and it is saved with the session in `questions_json`.

The route passes `question.unit` to the marker, and `expectedAnswerText` shows the accepted answer with its unit ("7 m/s²"). The answer box says "A unit is optional, but if you give one it must be the right unit", or "Enter the number only, without a unit".

## How the table was checked

`scripts/test-physics-answer-units.mjs` runs as part of `pnpm test:content`. It uses a seeded random number generator and makes 3,000 sets per tier for all 32 units. Its oracle is each question's own solution: the unit written after the final answer, or the unit the prompt asks for with "in …", must be the table's unit.

One exception was reviewed by hand. The `igcse-u5-r2` solution states no unit, so its prompt must name "kg·m/s or N·s". For `as-u9-r4`, the solution's text happens to contain the answer next to "C", but the answer itself is a coefficient with no unit.

For every numeric question, the harness checks:
- The table unit has exactly one reading.
- The bare number, the number with its unit, and the number run into its unit are right.
- A session without units accepts the unit.

For the first 60 instances of each template, it also checks:
- Every other notation, and every listed equivalent, is right.
- About 30 wrong units are wrong, as are k-, m- and M-prefixed versions of the unit.
- "bananas", "x", the milli-unit conversion, and a value 1% off are wrong.

Every template in the table must still be generated with a numeric answer, and word or list answers must have no unit.

### Result (2026-09-29, `physics-answer-units` branch)

| | |
|---|---|
| Sets | 288,000 (32 units × 3 tiers × 3,000) |
| Questions | 1,728,000, of which 765,000 numeric |
| Checks | 5,917,063 |
| Templates with a unit | 236 |
| Templates without a unit | 19 |
| Template whose unit varies | `as-u7-a1` (Hz or V) |
| Failures | 0 |

### Found by the harness while building it

- `tidy()` drops "°". So "1.8°" and "1.8 °" passed as 1.8 for a length, through both the string shortcut and the numeric shortcut. Now a numeric answer with a degree sign is always read with its unit.
- Run-together symbols read "mm" as m·m, which would have accepted "7 mm" for an area in m². "°C" also read as °·C. A symbol can no longer follow itself, and nothing runs on after "°".
- Reading any case let "stands" and "at" pass as products of symbols. Now a case-relaxed reading must be a single symbol.
- Spaced units in AS solutions ("6 N m", "6 kg m/s") were first mis-read as N and kg by a one-word reading. The table was built from the longest reading, and the oracle uses the same reading.

Unit tests are in `tests/physics/answer-matching.test.ts`: 15 tests, and 13 of them fail on the previous marker.

The front page's sample question (`components/landing/TryQuestion.tsx`) passes the question's unit too.

## Not covered

- Scientific notation typed as "3 × 10^8 m/s" is still wrong, as it was before. Only forms `Number()` reads, such as "3e8", are understood.
