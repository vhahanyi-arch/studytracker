---
name: StudyTrack
description: Cambridge learner planner. Every level is a coloured ring-binder divider; the work sits on a milky leaf above it.
colors:
  cover: "#24292e"
  cover-ink: "#24292e"
  stage7: "#e3b341"
  stage7-ink: "#7a5800"
  stage8: "#d4693e"
  stage8-ink: "#a63a0c"
  stage9: "#8f4a2b"
  stage9-ink: "#8a3d1b"
  igcse: "#167a78"
  igcse-ink: "#0b6e6c"
  as: "#3446a8"
  as-ink: "#2e3fb0"
  exam: "#6b4596"
  exam-ink: "#6a3d9e"
  classroom: "#5a9c4c"
  classroom-ink: "#2f6b16"
  on-board-dark: "#16181a"
  on-board-light: "#ffffff"
  on-level: "#ffffff"
  paper: "#f1f3f2"
  sheet: "#ffffff"
  ink: "#17212e"
  muted: "#5b6472"
  line: "#dde3ea"
  rail: "#1b1e21"
  rail-ink: "#d5d9dd"
  rail-muted: "#9aa3ab"
  topbar: "#fafbfa"
  topbar-line: "#e2e5e3"
  mark-board: "#1d2125"
  errata: "#b4220f"
  errata-tint: "#fdebe6"
  errata-line: "#f2b8aa"
typography:
  display:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(44px, 5.6vw, 84px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 78"
  headline:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 60px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 80"
  title:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "19px"
    fontWeight: 750
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 88"
  body:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 450
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  code:
    fontFamily: "Red Hat Mono, monospace"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.02em"
  figure:
    fontFamily: "Nunito, Archivo, sans-serif"
    fontSize: "34px"
    fontWeight: 900
    letterSpacing: "-0.01em"
    fontFeature: "'tnum'"
rounded:
  none: "0"
  slip: "2px"
  edge: "3px"
  sm: "4px"
  tab: "4px 0 0 4px"
spacing:
  board-gutter: "28px"
  leaf-x: "48px"
  leaf-x-tablet: "20px"
  leaf-x-phone: "14px"
  board-head: "40px"
  board-head-phone: "26px"
  section: "36px"
components:
  button-primary:
    backgroundColor: "{colors.cover-ink}"
    textColor: "{colors.on-level}"
    rounded: "{rounded.sm}"
    padding: "11px 17px"
  button-on-board:
    backgroundColor: "{colors.on-board-light}"
    textColor: "{colors.cover}"
    rounded: "{rounded.sm}"
    padding: "11px 17px"
  button-cta-cover:
    backgroundColor: "{colors.stage7}"
    textColor: "{colors.on-board-dark}"
    rounded: "{rounded.sm}"
  nav-tab-active:
    backgroundColor: "{colors.stage7}"
    textColor: "{colors.on-board-dark}"
    rounded: "{rounded.tab}"
    padding: "9px 24px 9px 10px"
  nav-item:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-ink}"
    rounded: "{rounded.tab}"
    padding: "9px 24px 9px 10px"
  divider-tab:
    backgroundColor: "{colors.igcse}"
    textColor: "{colors.on-board-light}"
    rounded: "{rounded.tab}"
    padding: "10px 16px"
  errata-slip:
    backgroundColor: "{colors.errata-tint}"
    textColor: "{colors.errata}"
    rounded: "{rounded.slip}"
    padding: "10px 14px"
  leaf:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "0 0 4px 4px"
    padding: "0 48px 64px"
---

# Design System: StudyTrack

## Overview

**Creative North Star: "The Ring-Binder Divider"**

StudyTrack is a boxed-software reference manual with acetate leaves over coloured tab boards. Every Cambridge level is a divider in a ring binder, and the screen's whole ground is the current level's board at full strength, so a student or the teacher knows which class they are in from the colour of the screen before reading a word. The work sits on one milky, near-white leaf laid over the board, always in the same place. The dashboard and My progress are the binder's graphite cover, and so are the front page and the sign-in screen: the binder seen from outside, with the level tabs stepping down its fore edge.

The world is flat and printed. Boards are solid colour; nothing is graded, glossed or lifted. Depth comes only from stacking: board, then leaf, then the rules drawn on the leaf. Inside a leaf, work is ruled rather than boxed, the way a manual sets a section: a heavy rule opens it and hairlines divide its rows. One grotesque, Archivo, does all the reading, condensed and heavy on its width axis for heads the way a tab's label is set; Red Hat Mono is kept for what is genuinely code or a figure. Changes do not ease: a divider is turned, in two frames over 90 ms.

The system refuses the category default of one grey ground, one accent and the same white cards on every screen whatever the subject.

**Key Characteristics:**
- The current level's board fills the screen ground; the work sits on a single leaf above it.
- The active sidebar entry is a tab that runs out across the rail and joins the board.
- Flat boards: no gradients, no decorative shadows.
- Sections on a leaf are ruled, not carded.
- Archivo on its width axis for all words; Nunito at 800–900 (bold, rounded, tabular) for every figure and syllabus code; Red Hat Mono only for the small running head above a board heading.
- Smooth, fast motion: 160 ms ease-out on the rail; moving to another binder is a quiet fade (about 280 ms, view transition); reduced motion swaps instantly.
- Vermilion appears only on errors.

## Colors

Seven full-strength divider hues and a graphite cover, each with a reading colour for the leaf, over a cool near-white leaf and a graphite rail. The values in the frontmatter are the light theme; the dark theme keeps the same hues as deep night boards (see the sidecar for every dark value).

### Primary: the dividers
Each level owns four roles, mapped by `data-level` on the shell: **board** (the divider at full strength, as screen ground and tab), **on-board** (text and controls set on the board), **level** (the level's reading colour on the leaf: links, selection, the one primary fill; at least 4.5:1 on the leaf) and **on-level** (text on a level fill).

- **Graphite Cover** (cover / cover-ink): the dashboard, My progress, the front page, sign-in, the landing bar and foot. White on it.
- **Chrome Yellow** (stage7), read on the leaf as **Deep Ochre** (stage7-ink). Dark text on the board.
- **Oxide Orange** (stage8), read as **Burnt Oxide** (stage8-ink). Dark text on the board.
- **Sienna** (stage9), read as **Deep Sienna** (stage9-ink). White on the board. The maths stages deepen as they advance: yellow, orange, sienna.
- **Physics Teal** (igcse), read as **Deep Teal** (igcse-ink). White on the board.
- **Ultramarine** (as), board and reading colour alike. White on the board.
- **Exam Violet** (exam), board and reading colour alike. White on the board.
- **Classroom Grass** (classroom), read as **Deep Grass** (classroom-ink): papers, marking and students. Dark text on the board.

Measured contrast: on-board text at least 4.83:1 in light and 8.5:1 in dark; level ink on the leaf at least 5.7:1 in light and 7.28:1 in dark.

At night the boards drop to deep versions of the same hues (for example Chrome Yellow becomes `#5e4a0b`), every on-board becomes white, the reading colours lift to light tints (Stage 7 reads `#e3b341`), and on-level turns near-black (`#111315`). Because the reading colour is light at night, any level fill that carries white text takes the deep board instead (`--level-fill`).

### Neutral
- **Milky Leaf** (paper): the leaf every screen's work sits on. Cool, with no warmth, so it reads as acetate rather than paper. Dark leaf `#111315`.
- **White Sheet** (sheet): inputs and drawing surfaces that frame a printed page. The writing surfaces stay white in every theme. Dark sheet `#1a1e24`.
- **Ink** (ink): body text and the heavy rules that open sections. Dark `#f1f7ff`.
- **Muted Slate** (muted): secondary text, asides, meta lines. Dark `#939ca9`.
- **Hairline** (line): row dividers on the leaf. Dark `#2e3236`.
- **Graphite Rail** (rail, rail-ink, rail-muted): the binder's edge holding the nav, in both themes (`#0f1113` at night).
- **Top Bar** (topbar, topbar-line): near-white bar, 86% opaque over the board (solid under reduced transparency). Dark `#0f1113`.

### Tertiary: errata
- **Vermilion** (errata, errata-tint, errata-line): an error, laid on the leaf as a slip. The one colour no divider uses. Dark `#ff9b85` on `#3a1d17`.

### Named Rules
**The Top Band Rule.** The current level's board colour fills the screen's heading band, edge to edge, and the rail's tabs; nowhere else. Below the band the page is calm paper (`--paper`) across the full width, with no coloured frame. Set once by `data-level` on the shell; components read `--board`, `--on-board`, `--level`. (Revised 2026-10-07 after testing: colour over the whole ground "takes over".)

**The Board and Leaf Rule.** The board colour is for large ground and tabs; on the leaf, a level speaks only through its reading colour (`--level`). Never set leaf text in a board hue.

**The Errata Rule.** Vermilion is reserved for errors. A waiting count, a deadline or a highlight is never vermilion; on the cover, the queue figure is in the cover's ink and turns the classroom's lit green (`#8dd068`) when nothing waits.

## Typography

**Display Font:** Archivo, variable on the width axis (with Arial, sans-serif)
**Body Font:** Archivo (with Arial, sans-serif)
**Figures Font:** Nunito 800–900 (tabular numerals). **Running-head Font:** Red Hat Mono (with monospace), for the small line above a board heading only.

**Character:** One grotesque does the work, condensed and heavy for heads like a tab's printed label and at full width for reading. The mono is kept for what is genuinely code or a figure.

### Hierarchy
- **Display** (800, `clamp(44px, 5.6vw, 84px)`, 0.94, width 78%): the front-page hero on the cover only; 12ch measure. Sign-in uses the same cut at `clamp(38px, 4vw, 60px)`.
- **Headline** (800, `clamp(34px, 4.6vw, 60px)`, 0.98, width 80%, -0.02em): the screen's heading, set on the board; 20 to 24ch measure. The dashboard queue heading runs `clamp(38px, 5vw, 66px)`.
- **Title** (750, width 88%, -0.012em): every other h1 to h3. Section heads on a leaf are 19px; landing step and divider-tab labels run 26 to 28px at width 80%.
- **Body** (450, 17px, 1.5): reading text and the board's standfirst, 56ch maximum on the board.
- **Label** (600, 13px): figure labels, rail section names (700, rail-muted).
- **Code** (Red Hat Mono 600, 13px, 0.02em, uppercase on the running head): syllabus codes and the board's running head.
- **Figure** (Nunito 900, tabular, -0.01em): counts, marks, scores, percentages and the large syllabus code in a board heading (Nunito 800).

The shared scale steps are 13, 15, 17, 20, 24, 30, 38 and 48px (`--t-fine` to `--t-display`).

### Named Rules
**The One Grotesque Rule.** Archivo does all the reading and interface; heads get their character from the width axis (78 to 88%) and weight (750 to 800), never from a third family.

**The Context In The Heading Rule.** What a label above a heading would say travels inside the heading: the syllabus code is set large in the mono beside the level name ("Stage 7 mastery 0862", mono at weight 400), and a quieter aside (the tier, "practice complete") follows on the leaf at 0.62em in muted Archivo after a middle dot. The only line above a heading is the board's running head (below).

**The Rounded Figures Rule.** Scores, counts, marks, percentages and syllabus codes are set in Nunito's heaviest weights with tabular numerals: bold, rounded, warm. Prose numbers are not. (Revised 2026-10-07: the mono "felt robotic".)

## Layout

The portal is a graphite rail on the left and the board filling the rest. The leaf sits centred on the board, inset 28px each side (`calc(100% - 56px)`), at most 1200px wide, padded 48px across and 64px below, with only its bottom corners rounded. The screen's opening heading is painted out to the board's edges above the leaf, so the leaf appears to start beneath it: 40px of board above the heading and 34px below, then 36px to the first section.

On the leaf, sections stack vertically and are ruled, not gridded into cards. Counts read as one ruled figure line: cells divided by vertical hairlines, padded 14px 18px 16px.

Responsive behaviour: below 1100px the front page's fore-edge tabs fold into a horizontally scrolling row under the hero copy. At 900px and below the rail becomes a drawer (the active tab still runs to its edge), the leaf inset drops to 10px a side with 20px padding, and the board head to 26px. At 620px and below the leaf pads 14px, figure lines go three across with the number above its label at 26px, and the brand tagline is dropped while the name stays. At 600px the front page's level rows stack the divider tab above its text.

## Elevation & Depth

Flat. Depth is conveyed only by stacking printed planes: the board, the leaf laid on it, the rules drawn on the leaf. No surface casts a shadow. The board header uses a spread shadow (`0 0 0 100vmax`) clipped to the top as a painting technique to extend the board colour to the edges; it is paint, not elevation. A lit filter tab uses an inset 4px top bar in the level colour, also paint.

### Named Rules
**The Flat Boards Rule.** No gradients and no decorative shadows anywhere: boards, leaves, panels, buttons and Clerk's sign-in card are all shadowless.

## Shapes

Crisp, nearly square corners. Controls, leaves and sheets take 4px; small inner pieces 3px; error slips 2px; ruled sections and the board header 0. Tabs are square on the side that joins the board and 4px on the free side (`4px 0 0 4px`); the inactive tab marker on the rail's inner edge is a 9px strip at `3px 0 0 3px`. The mark is a board with two binder holes and three dividers in yellow, orange and teal stepping down its fore edge.

**The Ruled Not Boxed Rule.** A section on a leaf opens with a 2px ink rule and divides its rows with 1px hairlines; it has no background, border box or radius. The one lit section, this week's focus, opens with a 4px rule in the level colour instead.

## Components

### Buttons
Few, flat and decisive.
- **Shape:** gently squared (4px).
- **Primary on the leaf:** the one strong action, filled in the level's reading colour with on-level text, weight 700, 11px 17px. Hover mixes 14% ink into the fill.
- **Primary on the board:** reversed out of the board: on-board fill, board-coloured text. Hover mixes 14% board in.
- **Secondary on the board:** transparent, on-board text, 1.5px on-board border at 55%; hover firms the border and washes 8%.
- **Front-page call to action:** Chrome Yellow on the graphite cover with dark text, weight 750.
- **Press and focus:** pressing scales to 0.97 over 140ms; focus is a 2px outline offset 2px in the level colour on the leaf, and white on the rail, the board header and the sign-in cover.

### Navigation
- **Rail:** graphite, rail-ink text at weight 600, rail-muted section names. Hover (fine pointers only) washes 7% white.
- **Divider tabs on the rail:** each entry carries its level's 9px tab on the rail's inner edge; at night it takes the level's lit reading colour so it does not vanish against the dark rail.
- **Active entry (signature):** the tab runs out across the whole row in the board colour, weight 750, to the rail's edge; its colour eases in over 160 ms.
- **Top bar:** near-white, translucent over the board, hairline below.

### Leaf
The one surface for work: Milky Leaf, ink text, bottom corners 4px, centred on the board. Panels on it are flat ruled sections, never cards.

### Errata slip
Vermilion text on the errata tint, 1px errata hairline, 2px corners, weight 600 at 15px, 10px 14px. Also used for a wrong answer on the front page's live question.

### Board header (signature)
The screen's opening heading, set on the board: a running head in the mono (13px, uppercase, ruled off below by a 1px on-board hairline at 38%), the headline with the syllabus code in it, a 17px standfirst, mono figures, and the reversed action. It steps in from 10px left in two frames when the level changes.

**The Running Head Rule.** The line above the board heading is a reference manual's running head: the real syllabus and section ("Cambridge Lower Secondary Mathematics"), once per screen, only on the board, ruled off. It never carries an invented label, and no other heading on any surface gets a label above it.

### Front-page divider tabs
On the cover, the levels step down the fore edge as board-coloured tabs (176px wide, 62px tall, 4px gap, level name in condensed 17px 800 over its code in the mono), standing proud of the cover; hover nudges a tab 8px out. Further down, each level is a row opened at its divider: a board-coloured tab cell beside a white sheet of text. Sign-in repeats the stepped tabs (52% to 76% wide) and hides them on phones so the form starts in the first screen.

### Inputs
White sheet, 4px corners, with the shared focus ring. Clerk's form uses the same 4px corners, no shadow, and a 1px border.

### Motion
**The Quiet Fade Rule.** Moving to another binder is a quiet fade: the old screen (`view-transition-name: binder` on `.portal-main`) fades out in 140 ms while the new one fades in and rises 8px into place over 240 ms. The rail and top bar change in place. `changeBinder` in `lib/binder-change.ts` wraps the state change; without view transitions or under reduced motion the screen simply changes. Switching binders happens all day, so nothing dramatic: a 3D page turn was tried and "looked odd" and "felt gimmicky" (2026-10-09).

## Do's and Don'ts

### Do:
- **Do** set `data-level` on the shell and let every component read `--board`, `--on-board`, `--level` and `--on-level`.
- **Do** put the screen's heading on the board and the work on one leaf below it.
- **Do** open sections on a leaf with a 2px ink rule and divide rows with hairlines.
- **Do** set syllabus codes, marks and counts in Nunito 800–900 with tabular numerals, and put the code inside the heading.
- **Do** keep corners at 4px (2px for error slips, 0 for ruled sections).
- **Do** move between binders with the quiet fade (`changeBinder`), and drop it entirely under reduced motion. **Don't** bring back 3D turns or other showpiece transitions on screens used all day.
- **Do** keep drawing and writing surfaces that frame a printed page white in every theme.

### Don't:
- **Don't** use vermilion for anything but errors.
- **Don't** use gradients or decorative shadows; boards and leaves are flat.
- **Don't** box a leaf's sections as cards or a card grid, or fill a section with a tinted background.
- **Don't** set leaf text in a board hue; use the level's reading colour.
- **Don't** put a small-capitals label or eyebrow above a heading; the board's running head is the only line above a heading.
- **Don't** ease level changes or fade them; a divider is turned.
- **Don't** add a third type family or use glyphs from text faces as icons; the portal has one 24px stroke icon set.
