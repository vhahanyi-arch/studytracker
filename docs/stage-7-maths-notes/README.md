# Stage 7 mathematics revision notes

Summary notes for the 12 Stage 7 chapters of Cambridge Lower Secondary Mathematics (0862), one file per chapter, in the order of `stage7Chapters` in [lib/portal-content.ts](../../lib/portal-content.ts). They are foundation notes: Stage 7 students can use them, and so can Stage 8 and Stage 9 students revising what later units build on.

Unlike the Stage 8 and 9 notes, these cite no learning-objective codes: the project holds no Stage 7 objective list, and codes are not quoted from memory. Each chapter instead ends with "Where this leads", naming the Stage 8 units that build on it. The notes are written in our own words; no Cambridge text or test questions are copied into them.

Each chapter has the same shape: key ideas, a table of key facts and formulas, worked examples of each method in different kinds of question, common mistakes, and where this leads. Notation matches the Stage 8 and 9 notes and the practice questions: mixed numbers as 2 1/3, recurring decimals as 0.333..., negative numbers with a true minus sign (−5).

To change a note, edit the markdown here and run `pnpm notes`. `tests/notes/content.test.ts` fails if the generated module and these files disagree, if a chapter lacks notes, if a note loses its shape, or if "Where this leads" names a Stage 8 unit that does not exist.
