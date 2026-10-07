# Product

<!-- impeccable:product-schema 1 -->

The full project record lives in the Obsidian vault at `../StudyTracker/` (start at `Home.md`). This file holds only the product truth design work needs.

## Platform

web

## Users

- **The teacher** (one per deployment). Sets Cambridge Mathematics and Physics work, uploads past papers and mark schemes, sets a weekly focus, confirms every proposed mark in the marking queue, and publishes results. Creates the student accounts.
- **Students** in Cambridge Lower Secondary (Stages 7–9), IGCSE (0580, 0625) and AS Level (9702, 9709). They answer set papers (typed, drawn, handwritten or annotated), sit past exam papers, do generated practice between lessons, and see published results and "Am I improving?". They often use it on their phones.
- **Parents** look at the public front page and their child's progress. They do not have accounts.

## Product Purpose

A teacher sets Cambridge work, students answer it, the app proposes marks, and the teacher confirms them before anything reaches a student. Success means the teacher spends less time marking and more time teaching, and students know where they stand on the real Cambridge syllabus.

## Positioning

A product for Cambridge teachers (confirmed 2026-10-06): it starts as one teacher's class and is meant for other Cambridge Mathematics and Physics teachers to run their own copy. What a neighbouring product could not truthfully copy:

- It reads real Cambridge question papers and mark schemes (a text-layer reader, plus AI for structured physics papers) and crops each question as printed.
- Marking only *proposes*. A mark reaches a student after the teacher confirms and publishes it. The deliberate exceptions are generated practice, multiple-choice papers and exam papers in practice mode.
- Practice is generated from the Cambridge syllabus itself: Lower Secondary 0862 framework codes, IGCSE 0625 units, AS 9702 topics. Each engine is verified over thousands of runs, and mastery is two sets at 80% or more.

## Operating Context

- Paper flow: upload the question paper and mark scheme, review the detected questions, assign, students answer, the marking queue, publish, then a PDF report.
- Syllabus vocabulary is real and specific: stage, unit, framework code (e.g. `8Ni.03`), tier (foundational → application → reasoning), weekly focus, strong set, mastered, marking point (`B1`, `A1`), ECF.
- Students draw and write on white surfaces that frame the printed PDF page; those surfaces stay white in every theme.

## Capabilities and Constraints

- Light, dark and device themes, all of which must keep working.
- One teacher per deployment. No self sign-up; the teacher creates student accounts (Clerk).
- No Cambridge material in the public repository; use synthetic fixtures.
- Undecided: how a second teacher would get their own copy (hosting, onboarding, pricing). Do not imply any of it exists.

## Brand Commitments

- The name **StudyTrack** stays (confirmed 2026-10-06). The red accent, the rounded "S" mark, the subject colours and the tagline "Cambridge learner planner" are not binding.

## Evidence on Hand

- Real, working demonstrations: live practice questions from the real engines (the front page already embeds one), revision notes for AS 9702, IGCSE 0625 and Stage 8/9 maths, and the 0862 framework codes.
- No testimonials, customer counts, school names, results data or pricing exist. Never invent them.
- No real screenshots of the signed-in screens exist yet; only the teacher can capture them.

## Product Principles

1. The teacher's judgement is final; the software proposes.
2. Speak Cambridge precisely: real syllabus codes, real paper structure, real mark-scheme language.
3. Built for daily use by students on phones and by a busy teacher at a desk: fast, legible, nothing in the way.
4. Show the real thing working rather than claiming it.

## Accessibility & Inclusion

Nothing a reader must read goes below 13 px. Measured contrast of at least 4.5:1 for text in both themes. Reduced motion and keyboard use are honoured throughout.
