---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/landing/Landing.tsx","components/SignInScreen.tsx","app/globals.css"]
---

## Scope

The whole app: the signed-in portal (teacher and student; Operate), plus the front page for students and parents and the sign-in screen (Persuade). One world across all three.

## Audience and job

Students (Stage 7 to AS, often on phones) answering set work and practising; one teacher at a desk marking and publishing. Parents read the front page. The user's words for what would feel wrong: childish or gamified, corporate SaaS, slower to use, hard to read on a phone. Motion is open (user, 2026-10-06), as long as it serves.

## Direction contract

THESIS: Every Cambridge level is a coloured ring-binder divider. The screen's whole ground is the current level's divider board at full strength, and the work sits on milky leaves above it. It refuses the category default: one grey ground, one accent, and the same white cards on every screen whatever the subject.

OWN-WORLD: Seven divider hues at full strength: Stage 7 chrome yellow, Stage 8 oxide orange, Stage 9 sienna (the maths stages deepen as they advance), IGCSE Physics teal, AS Physics ultramarine, exam papers violet, and the classroom grass. The dashboard and My progress use a graphite cover board. Reading happens on near-white milky leaves; vermilion is reserved for errata (errors). One grotesque does the work, with a mono for syllabus codes and figures. No gradients, no decorative shadows, flat boards.

STORY: Students and the teacher always know which class they are in from the colour of the whole screen before reading a word, then find the work on the leaf exactly where it always is.

FIRST VIEWPORT: The usual top bar and a graphite side rail. Each nav entry carries its level's divider tab on the rail's inner edge, and the current entry's tab extends across the row and joins the board: the signature move. Main area: the board in the level hue; the level's name and syllabus code set large on the board; the primary action reversed on the board; below, leaves holding the screen's lists and controls, all standard web controls.

FORM: Boxed-software reference manual with acetate leaves over coloured tab boards (challenger rw-manual-acetate-tab-board, bolder re-roll 1). The leader was The Teacher's Stamp. Seed key 02b755da.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Signature interaction: switching level steps the board colour in two frames (steps(2), 90 ms), with no easing. Leaves hinge in from their bound edge in the same two-step. Reduced motion swaps instantly.

## Unresolved

- Dark mode renders the boards as the same hues at night (deep, lower lightness); the leaves become dark acetate.
- The build path is code-led (no image generation in this harness).
