# About Section — Scroll-Linked Chapters — Design

**Date:** 2026-09-07
**Milestone:** Frontend, home page §01. No backend, no milestone jump.
**Scope:** Replace the single About band with three scroll-linked chapters —
Story · Education · Experience — behind one anchored navigation.
**Companion documents:** `proposeddesign.md` (§2, §3.1–3.6, §4.2, §7.3, §7.4),
whiteboard references (desktop + mobile, 2026-09-07)

---

## 1. Goal

Turn §01 from a static two-column block into a navigable personal narrative that
reads as one continuous story, on a page that is a sticky panel stack.

**Done means all of these are true:**

- About is one stack panel containing three chapters laid out vertically.
- Scrolling through it progressively lights the matching item in the navigation.
- Clicking an item scrolls to that chapter — correctly, including once the About
  panel has pinned.
- The navigation is anchored for the whole of About and leaves when About ends,
  with no scroll listener and no manual unpinning.
- Desktop is a left rail beside wide content; mobile is a horizontal sticky bar
  above single-column content. Neither is a shrunk version of the other.
- Education, certificates and experience exist as typed content, shaped so the
  future profile API can replace the constant without a component noticing.
- Nothing animates because it scrolled into view (§2 principle 4 holds).
- `npm run typecheck` passes.

**Non-goals:** the standalone `/about` page and its print-to-CV stylesheet
(§4.5 — separate work); the profile API (M2/M3); any change to §02 Projects;
the Projects tab from the reference sketch, which the user cut because §02
already carries projects.

---

## 2. Context

### 2.1 What exists

`HomePage.tsx:82-120` — one `<Section id="about" surface="void">` holding a
prose plate, a "Measured" column of `DimensionRow`s, a `LanguageTable`, and a
`StackComb` below a divider. Content is static in `content/profile.ts`.

### 2.2 The three constraints that shape this design

**The home page is a sticky panel stack, not a normal scroll.**
`Page stacked` runs `useStack`, which makes every direct child `position: sticky`
at `--stick-top`. A panel taller than the viewport gets a *negative* offset, so
it scrolls until its last line rests on the viewport floor and only then holds
(`substrate.css:118-130`, `useStack.ts:26-43`).

Two consequences, both load-bearing here:

1. *Anchoring is free.* A nested `position: sticky` rail inside the About panel
   sticks while the panel spans the viewport and leaves with it. No observer, no
   unpin logic. This is exactly the requested behaviour, delivered by CSS.
2. *Clicking a tab is not `scrollIntoView`.* Once the About panel pins, its
   descendants report painted rects, not flow ones — `scrollIntoView` concludes
   the chapter is already in view and does nothing. `useStack` writes
   `data-flow-top` on every panel for precisely this failure
   (`useStack.ts:12-19`). The tab click reads it.

**Motion is rationed, and `Reveal` is a guardrail.**
`components/motion/Reveal.tsx` renders its children and nothing else — a
deliberate no-op that exists so nobody adds a scroll reveal. §2 principle 4
allows causal state changes (130–180 ms, user-caused) and scroll-*linked*
tracking, and forbids fade-up-on-scroll.

> **Flagged tension.** The brief asks for "gentle content transitions, small
> movement/opacity changes." Read as *chapters fading in as they scroll into
> view*, that is the one thing this system forbids. This design spends the
> motion budget on causal motion instead — the rail marker sliding, smooth
> scroll on click, hover states. If you want scroll-triggered reveals anyway,
> that is a deliberate amendment to principle 4 and should be written into
> `proposeddesign.md` rather than smuggled into a component.

**Cabin Sketch is uppercase-only.**
`global.css:22` subsets it to `A–Z -–—.,'&` (132 kB → 39 kB). Lowercase falls
back to Archivo mid-word. It is also a double-outline hatched face that turns to
mud below ~20px. So handwriting goes on the three chapter headings at `t-h3`
size, uppercase — never on 11px rail labels.

---

## 3. Visual register — "organic marks, system geometry"

The references are hand-drawn because Excalidraw draws that way. The agreed
reading: **personality lives in the marks and the display type; geometry stays
system.**

| Element | Treatment |
|---|---|
| Card borders | 1px `--line`, **radius 0**, registration marks (`Plate`). Unchanged from §3.4. |
| Chapter headings | Cabin Sketch, uppercase, `t-h3` size, followed by a hand-inked rule |
| Section rules (the sketch's `---Education-----`) | `InkRule` — a hand-drawn SVG stroke |
| Rail / tab labels | Mono (`Data`), as everywhere else in the system |
| Colour | Existing tokens only. No hex outside `tokens.css`. |

### `InkRule` — constructed, not eyeballed

§2 principle 1: *"Every ornament must be derivable. If a mark cannot explain
where it came from, it does not ship."* So the wobble is generated, not drawn:

- A pure function `inkPath(width, seed)` returns an SVG path — a horizontal
  stroke whose y-offset is a sum of three sine terms at fixed frequencies and
  amplitudes (≤1.5px), sampled every 8px.
- Deterministic per seed. **No `Math.random()`** — a random path re-rolls on
  every render and flickers.
- One `<path>`, `stroke="currentColor"`, `vector-effect="non-scaling-stroke"`,
  so it inherits the ground and re-points on `data-surface` like everything else.
- `preserveAspectRatio="none"` with a fixed viewBox width, so one path stretches
  to any column without re-computation.

That gives an imperfect line that can explain exactly where it came from.

---

## 4. Composition

### 4.1 Desktop (`lg` and up)

Asymmetric two-column grid, `lg:grid-cols-[minmax(9rem,1fr)_3fr]` — rail left,
content right, deliberately not an even split.

```
┌ ABOUT PANEL — one stack sheet, ~3 viewports tall, surface="void" ─────────┐
│                                                                          │
│  01                                                                      │
│  ABOUT                                                                   │
│                                                                          │
│  ┌ rail (sticky, top: --bar-h + 32px) ┐  ┌ chapters ──────────────────┐  │
│  │                                    │  │                            │  │
│  │  ▌ STORY        ← active: 1px box, │  │  STORY  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  │  │
│  │    EDUCATION      violet text      │  │  ┌──────────────────────┐  │  │
│  │    EXPERIENCE                      │  │  │ bio, bone island     │  │  │
│  │                                    │  │  └──────────────────────┘  │  │
│  │  (rail holds still; only the       │  │  Now · Languages           │  │
│  │   marker moves — 160ms)            │  ├────────────────────────────┤  │
│  │                                    │  │  EDUCATION ∿∿∿∿∿∿∿∿∿∿∿∿∿  │  │
│  │                                    │  │  ...                       │  │
│  │                                    │  ├────────────────────────────┤  │
│  │                                    │  │  EXPERIENCE ∿∿∿∿∿∿∿∿∿∿∿∿  │  │
│  └────────────────────────────────────┘  └────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

The rail sticks below the top bar. Its items are mono, left-aligned, generously
leaded. The active item takes a 1px box and `--accent-text`; inactive items are
`--fg-muted`. A 2px violet marker sits at the left edge and translates between
items over `--duration-micro`.

### 4.2 Mobile (below `lg`)

Single column, re-composed rather than stacked-down.

```
┌ ABOUT PANEL ─────────────────────────┐
│  01  ABOUT                           │
│ ┌ tab bar — sticky at top: --bar-h ┐ │
│ │  Story  ┌EDUCATION┐  Experience  │ │
│ │         └─────────┘              │ │
│ │ ──────────────────────────────── │ │  ← 1px rule under the bar
│ └──────────────────────────────────┘ │
│                                      │
│  INHA University          2024–2028  │
│  — full-width, px-3 gutter           │
│                                      │
│  ┌──────────┐  ┌──────────┐          │
│  │ Najot    │  │ LangApex │  ← 2-up  │
│  └──────────┘  └──────────┘    where │
│                                 it   │
│  CERTIFICATES ∿∿∿∿∿∿∿∿∿∿∿∿∿∿   fits │
│  ┌────────────────────────────────┐  │
│  │ IELTS 8.0 · IDP                │  │  ← 1-up by default
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- Tab bar: horizontally scrollable row, `overflow-x: auto`, scrollbar hidden —
  the same pattern `TopBar.tsx:38-41` already uses, so behaviour matches the
  chrome above it.
- Sticky at `top: var(--bar-h)`, sitting directly under the top bar with the
  bar's own ground so it never shows content sliding beneath it.
- Active tab: 1px box + `--accent-text`, per the reference's outlined treatment.
  A 1px rule spans under the whole bar.
- Cards single column; certificates go 2-up from `sm` where the measure holds.

---

## 5. The three chapters

Each gets a different visual approach, because each is a different kind of claim.

### 5.1 Story — the reading island

The one chapter that is mostly words, so it keeps the existing `Prose` bone
plate inside the void band (§2 principle 7).

- `profile.bio.en` on the bone island, as today.
- **Now** — `profile.now` as a short block marked with a `Chip tone="live"`
  carrying `updatedAt`. Turns a static bio into something with a current state.
- **Languages** — the existing `LanguageTable`, unchanged. Human languages are
  personal, so they belong to Story rather than Education.

Reuses `Prose`, `LanguageTable`, `Chip`. No new components.

### 5.2 Education — cards, with the scores measured

Follows the reference closely, with one substitution.

- **INHA University 2024–2028** as a full-width lead `Plate`.
- **Najot Ta'lim** and **LangApex** two-up beneath it.
- `InkRule` labelled CERTIFICATES.
- Certificate cards in a 2-up grid.

**The substitution:** the reference draws *IELTS 8.0* and *SAT 1330* as plain
cards. This design renders any certificate carrying a score as a `DimensionRow`
instead — the existing component that draws a value against its stated scale.
§2 principle 8: *"A score means more with a date and a scale."* It also means
the `scores` array stops being a separate "Measured" column and becomes evidence
inside Education, which is where it belongs.

`scores` (SAT/IELTS/GPA) merges into `certificates`; issuers come from the
reference (IDP, College Board). GPA has no issuer and stays a bare dimension row.

### 5.3 Experience — the alternating timeline

The reference's strongest drawing: a vertical dashed spine with entries
alternating left and right, each tethered to the spine by a short diagonal.

- Spine: a vertical `InkRule` (same generator, rotated) down the column centre.
- Entries alternate sides on `lg`; on mobile they collapse to a single left-aligned
  column against a spine on the left — a timeline, not two squeezed columns.
- Each entry: org (`t-h4`), dates (`Data`), role (`Data tone="fg"`), one line of
  detail. Current role takes `Chip tone="live"`.
- Tether: a short 1px diagonal from card edge to spine node. Node is a small
  violet ring, `--mark`.

**Coda — the stack comb.** `StackComb` moves out of the bottom of About and
becomes the end of Experience: the tools are what the work is made of, so they
close the work chapter rather than trailing the whole section. Component
unchanged; only its parent moves.

---

## 6. Content model

Static, in `content/profile.ts`, typed in `content/types.ts` — the pattern
`types.ts:7-12` already documents: *"when the API lands, this changes from a
constant to a query and no component notices."*

```ts
export type EducationEntry = {
  org: string;
  qualification?: string;
  from: string;          // ISO 'YYYY' or 'YYYY-MM'
  to: string | null;     // null = ongoing
  detail?: string;
  lead?: boolean;        // the full-width card
};

export type Certificate = {
  name: string;
  issuer?: string;
  issuedAt?: string;
  /** Present = render as a DimensionRow against its stated scale. */
  score?: { value: number; scaleMin: number; scaleMax: number; display: string };
};

export type ExperienceEntry = {
  org: string;
  role: string;
  from: string;
  to: string | null;     // null = current
  detail?: string;
};
```

`Score` is absorbed by `Certificate.score` and removed; `experience` is widened
from its current `{ org, role, from, to }` shape.

### 6.1 Content to confirm

Assembled from `profile.ts` plus the reference sketches. **Items marked ⚠ are my
reconstruction and need your confirmation before implementation** — the sketch
uses placeholders in several places.

**Education**

| Org | Dates | Source |
|---|---|---|
| INHA University, Tashkent | 2024–2028 | sketch + `profile.ts:21` |
| Najot Ta'lim | Jan 2024 – Sep 2024 | sketch |
| ⚠ LangApex | 2019–2022 | sketch says *education*; `profile.ts:86` has LangApex as an ESL **job**, 2022–2023. Conflicting — which is it? |

**Certificates**

| Name | Issuer | Score | Source |
|---|---|---|---|
| IELTS | IDP | 8.0 on 0–9 | sketch + `profile.ts:54` |
| SAT | College Board | 1330 on 400–1600 | sketch + `profile.ts:53` |
| GPA | — | 4.00 on 0–4 | `profile.ts:55` |
| ⚠ NodeJS Mastery | Udemy | — | sketch — real, or filler? |
| ⚠ "Certified Claude Architect", Anthropic | — | — | sketch — reads as a joke placeholder. Drop unless you say otherwise. |

**Experience**

| Org | Role | Dates | Source |
|---|---|---|---|
| ⚠ Vention | Software Engineer | Mar 2026 – present | sketch |
| ⚠ SATashkent | Frontend Engineer | Nov 2025 – Mar 2026 | sketch |
| Ziyokor Education | IELTS mentor & ESL teacher | 2023–2024 | `profile.ts:85` |
| LangApex Edu-Center | ESL teacher | 2022–2023 | `profile.ts:86` |

Each entry also needs one line of detail; the sketch has Lorem Ipsum. The plan's
first task is collecting these, and implementation is written so the copy is the
last thing dropped in.

---

## 7. Behaviour

### 7.1 Active chapter — reuse, don't rebuild

`useActiveSection(ids)` already does this: one `IntersectionObserver`, no scroll
listener (§7.3), `rootMargin: '-88px 0px -55% 0px'`, last match wins. Chapters
are contiguous and non-overlapping, so last-wins gives the natural reading —
the tab flips as a chapter reaches the upper reading band.

Called with `['about-story', 'about-education', 'about-experience']`. Its one
gap: it returns `null` before anything intersects, so the rail falls back to the
first chapter rather than rendering nothing selected.

### 7.2 Click to navigate — `scrollToFlow`

New util, `lib/scroll-to-flow.ts`. Not `scrollIntoView`, for the reason in §2.2.

```
target = Number(panel.dataset.flowTop) + chapter.offsetTop - stickyOffset
window.scrollTo({ top: target, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
```

- `panel` is the closest `.stack > *` ancestor; `useStack` keeps `flowTop` current
  through its `ResizeObserver`.
- `offsetTop` is a layout value, unaffected by sticky painting. `.stack > *` is
  `position: sticky` and therefore positioned, so it *is* the `offsetParent` —
  the sum is correct by construction.
- `stickyOffset` is `--bar-h` plus the mobile tab bar's height where present.
- Falls back to `getBoundingClientRect()` if `flowTop` is missing, so the util is
  never a hard dependency on `useStack` having measured.

### 7.3 Accessibility — this is navigation, not a tab widget

**Do not use `role="tablist"` / `role="tab"` / `aria-selected`.** All three
chapters are in the DOM, visible, and reachable by scrolling; nothing is hidden.
An ARIA tab widget promises panels that show and hide, and a screen-reader user
would be told two-thirds of the content is unavailable when it is right there.

It is a table of contents:

- `<nav aria-label="About chapters">` wrapping a list of `<a href="#about-…">`.
- `aria-current="true"` on the active link.
- Each chapter is a `<section>` with `aria-labelledby` pointing at its heading.
- Headings are real `<h3>`s under the section's `<h2>`.
- Native anchors, so keyboard, middle-click and deep links all work; the click
  handler calls `preventDefault()` only to substitute `scrollToFlow`.

### 7.4 Motion budget

| What | Trigger | Duration |
|---|---|---|
| Rail marker slides between items | active chapter changes | `--duration-micro`, `--ease-plate` |
| Active label colour / box | same | `--duration-micro` |
| Smooth scroll to chapter | click | native, `auto` under reduced motion |
| Registration marks 40% → 100% | hover / focus | existing `.marks` |

**Rejected:** chapter content fading or rising as it scrolls into view (§2
principle 4); the `InkRule` drawing itself via `stroke-dashoffset` when its
chapter activates — that is an arrival animation, and the two set-pieces that
are permitted (rosette, signature) are already spent.

---

## 8. Components and files

**New** — `apps/web/src/components/content/about/`

| File | Responsibility |
|---|---|
| `AboutSection.tsx` | The section shell: heading, rail/bar, chapter list. Owns active state. |
| `AboutNav.tsx` | Both treatments of the navigation — rail at `lg`, sticky bar below. One component, because the two share their state and their item list; the divergence is layout only. |
| `ChapterHeading.tsx` | Cabin Sketch `<h3>` + `InkRule`, with the id the nav targets. |
| `StoryChapter.tsx` | §5.1 |
| `EducationChapter.tsx` | §5.2 |
| `ExperienceChapter.tsx` | §5.3 |
| `TimelineEntry.tsx` | One experience entry + its tether. Extracted because the alternating-side logic is the fiddly part. |

**New** — elsewhere

| File | Responsibility |
|---|---|
| `components/ui/InkRule.tsx` | The hand-inked stroke, horizontal or vertical |
| `lib/ink-path.ts` | `inkPath(width, seed)` — the deterministic generator |
| `lib/scroll-to-flow.ts` | §7.2 |

**Modified**

| File | Change |
|---|---|
| `pages/HomePage.tsx` | §01 body replaced by `<AboutSection />`. `Section` keeps `id="about"`, `index="01"`, `surface="void"` so `TopBar` and the ⌘K palette are untouched. |
| `content/profile.ts` | Add `education`, `certificates`; widen `experience`; remove `scores` |
| `content/types.ts` | Add the three types; remove `Score` |
| `styles/substrate.css` | Rail marker, timeline spine and tether, sticky offsets, mobile bar |
| `components/content/DimensionRow.tsx` | Accept a `Certificate`'s score shape |

**Untouched:** `LanguageTable`, `StackComb`, `Prose`, `Plate`, `Chip`, `Data`,
`Section`, `useActiveSection`, `useStack`, `TopBar`, `CommandPalette`.

`Section`'s `children` becomes the chapter stack; its existing 88px index rail
stays, so the About nav sits *inside* the content column beside it. Two rails
would fight, so the desktop nav column is part of the section body, not a second
sticky gutter.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| About grows to ~3 viewports; `useStack` re-measures every panel below on resize | Height is tab-independent — all chapters always rendered, nothing shows/hides — so the only re-measures are genuine viewport changes, which already happen today. |
| Nested sticky inside a sticky panel | Legal: the rail's containing block is a chapter-spanning div inside the panel, and no ancestor sets `overflow`. Verify in Safari, where nested sticky has historically been weakest. |
| Cabin Sketch subset lacks a needed glyph | Headings are `[A-Z]` only — STORY, EDUCATION, EXPERIENCE, CERTIFICATES all fit the existing subset. No re-subsetting, no extra bytes. |
| Mobile bar and top bar both sticky, both translucent | The About bar takes an opaque `bg-surface`, not the top bar's `/88` + blur, so content never ghosts through two layers. |
| `InkRule` at very wide columns stretches the wobble | `preserveAspectRatio="none"` scales amplitude with width; cap the viewBox width and repeat rather than stretch beyond ~1.5× |

---

## 10. Verification

No tests — the web app has none and none are wanted (CLAUDE.md).

The gate is `npm run typecheck` plus a manual pass:

1. Scroll home top to bottom: the rail lights Story → Education → Experience,
   holds through About, and leaves with the panel.
2. Click each tab from the top of About, and again from the bottom (where the
   panel has pinned — this is the `data-flow-top` case).
3. Deep link `/#about`, then a chapter anchor directly.
4. Keyboard: tab to each nav link, Enter navigates, focus is visible.
5. 320px, 768px, 1280px, 1920px.
6. `prefers-reduced-motion: reduce`: no smooth scroll, marks at full opacity.
7. Safari and Firefox for nested sticky.
