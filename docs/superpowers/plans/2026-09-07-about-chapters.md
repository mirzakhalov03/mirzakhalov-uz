# About Section — Scroll-Linked Chapters — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static About band on the home page with three scroll-linked
chapters — Story · Education · Experience — behind one anchored navigation that
is a left rail on desktop and a sticky horizontal bar on mobile.

**Architecture:** About stays a single child of the sticky panel stack, holding
three chapters laid out vertically. `useActiveSection` (existing) lights the
matching nav item from one IntersectionObserver; clicking an item calls a new
`scrollToFlow` util that reads `data-flow-top` — written by `useStack` — because
a stuck sticky panel reports painted rects and `scrollIntoView` would silently
do nothing. Anchoring is plain nested `position: sticky`, so the nav leaves when
the panel does with no unpin logic.

**Tech Stack:** React 19, TypeScript (strict + `noUncheckedIndexedAccess`),
Tailwind v4, plain CSS in `substrate.css` for the parts Tailwind is wrong for.
No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-07-about-section-redesign-design.md`

## Global Constraints

Copied verbatim from the spec and `CLAUDE.md`. Every task's requirements
implicitly include this section.

- **No tests.** The web app has none and none are wanted. The gate is
  `npm run typecheck` (root — runs all three workspaces) plus the named browser
  check in each task.
- **`npm run typecheck` must pass after every task.** `tsconfig.base.json` sets
  `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters` —
  an unused import fails the build, and every array index is `T | undefined`.
- **Relative imports carry a `.js` extension**, including from `.tsx`
  (`'../primitives/Data.js'`). `verbatimModuleSyntax` + bundler resolution.
- **No hex value may exist outside `apps/web/src/styles/tokens.css`.** Use the
  semantic tokens: `--surface`, `--fg`, `--fg-muted`, `--line`, `--line-strong`,
  `--accent`, `--accent-text`, `--measured`, `--mark`, `--live`.
- **`--spacing` is `8px`**, so Tailwind's numeric scale is the module: `p-1` = 8,
  `p-2` = 16, `p-3` = 24, `p-4` = 32, `p-6` = 48, `p-8` = 64. Don't use arbitrary
  values where a step exists.
- **Radius 0 everywhere** (§3.4). No shadows. Separation is a 1px border plus
  registration marks.
- **Nothing animates because it scrolled into view** (§2 principle 4). Motion is
  causal (`--duration-micro` = 160ms, `--ease-plate`) or scroll-linked tracking.
  `components/motion/Reveal.tsx` is a deliberate no-op guardrail — leave it alone.
- **Cabin Sketch is subset to `A–Z -–—.,'&`.** Any text in `--font-sketch` must be
  uppercase or it falls back to Archivo mid-word.
- **Prettier:** single quotes, 100 columns, trailing commas.
- **Commit messages** end with:
  ```
  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
  ```

**Deviations from the spec, decided while planning:**

- The spec names `ChapterHeading.tsx`. It became `AboutChapter.tsx`, which renders
  the `<section>` *and* its heading — the id the nav observes must sit on the
  section, not the `<h3>`, or the IntersectionObserver watches a 30px heading
  instead of a whole chapter.
- The spec's timeline "tether" is a diagonal. It is built as a horizontal 1px
  connector: robust in CSS, and reads the same at a glance.
- The timeline node is a small violet **cross**, not a ring — reusing the system's
  registration-mark language instead of introducing the only circle on the page.

---

## File Structure

**Create**

| File | Responsibility |
|---|---|
| `apps/web/src/lib/ink-path.ts` | `inkPath(length, seed, axis)` — deterministic hand-drawn stroke geometry |
| `apps/web/src/lib/scroll-to-flow.ts` | `scrollToFlow(target, offset)` — flow-aware scroll past a stuck sticky panel |
| `apps/web/src/components/ui/InkRule.tsx` | The stroke as an SVG that inherits its ground |
| `apps/web/src/components/content/about/AboutChapter.tsx` | One chapter: `<section>` + Cabin Sketch heading + ink rule |
| `apps/web/src/components/content/about/AboutNav.tsx` | The navigation — rail at `lg`, sticky bar below |
| `apps/web/src/components/content/about/StoryChapter.tsx` | Bio island, Now, languages |
| `apps/web/src/components/content/about/EducationChapter.tsx` | Education cards + certificates |
| `apps/web/src/components/content/about/ExperienceChapter.tsx` | Timeline + stack comb coda |
| `apps/web/src/components/content/about/TimelineEntry.tsx` | One timeline entry, node and tether |
| `apps/web/src/components/content/about/AboutSection.tsx` | The shell: owns active state, wires nav to chapters |

**Modify**

| File | Change |
|---|---|
| `apps/web/src/content/types.ts` | Add `EducationEntry`, `Certificate`, `CertificateScore`, `ExperienceEntry`; remove `Score` (Task 9) |
| `apps/web/src/content/profile.ts` | Add `education`, `certificates`; widen `experience`; remove `scores` (Task 9) |
| `apps/web/src/components/content/DimensionRow.tsx` | Take `label` + `CertificateScore` instead of `Score` |
| `apps/web/src/styles/substrate.css` | `.t-chapter`, `.about-nav`, `.timeline`, `.ink-rule` |
| `apps/web/src/pages/HomePage.tsx` | §01 body becomes `<AboutSection />` |

---

## Task 0: Confirm the content (blocking, no code)

The reference sketches use placeholders. These facts must be settled before
Task 1, because Task 1 writes them into `profile.ts`.

- [ ] **Step 1: Get answers to these five questions**

1. **LangApex** — the sketch lists it under *Education*, 2019–2022.
   `profile.ts:86` has "LangApex Edu-Center", ESL teacher, 2022–2023, as a
   *job*. Which is it? Both (studied there, then taught there)?
2. **Vention** — Software Engineer, March 2026 – present. Correct?
3. **SATashkent** — Frontend Engineer, November 2025 – March 2026. Correct?
4. **"NodeJS Mastery by Udemy"** — a real certificate, or filler?
5. **"Certified Claude Architect by Anthropic"** — reads as a joke. Drop it?

- [ ] **Step 2: Get one line of detail for each entry**

Every education and experience entry needs one sentence. The sketch has Lorem
Ipsum. Ask for them, or write drafts in the voice of `profile.ts:19-21` — plain,
specific, no adjectives — and get them approved.

- [ ] **Step 3: Record the answers at the top of Task 1 before writing code**

---

## Task 1: Content model

**Files:**
- Modify: `apps/web/src/content/types.ts`
- Modify: `apps/web/src/content/profile.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `EducationEntry`, `Certificate`, `CertificateScore`, `ExperienceEntry`
  types; `education: EducationEntry[]`, `certificates: Certificate[]`,
  `experience: ExperienceEntry[]` exports from `content/profile.ts`.

**Why `scores` and `Score` survive this task:** `HomePage.tsx:14` still imports
`scores`, and `DimensionRow` still takes `Score`. Deleting them here would break
`npm run typecheck` until Task 9. They are removed in Task 9, once nothing
references them.

- [ ] **Step 1: Add the types**

Append to `apps/web/src/content/types.ts`:

```ts
/** A value against a stated scale — 1330 means nothing without 400–1600 (§3.6). */
export type CertificateScore = {
  value: number;
  scaleMin: number;
  scaleMax: number;
  display: string;
};

export type EducationEntry = {
  org: string;
  qualification?: string;
  /** ISO 'YYYY' or 'YYYY-MM'. */
  from: string;
  /** null means ongoing. */
  to: string | null;
  detail?: string;
  /** The one entry that takes the full-width lead card. */
  lead?: boolean;
};

/**
 * A certificate, or a score. Present `score` and the row is drawn as a
 * DimensionRow against its scale rather than as a card — §2 principle 8: a
 * score means more with a date and a scale.
 */
export type Certificate = {
  name: string;
  issuer?: string;
  /** ISO 'YYYY' or 'YYYY-MM'. */
  issuedAt?: string;
  score?: CertificateScore;
};

export type ExperienceEntry = {
  org: string;
  role: string;
  from: string;
  to: string | null;
  detail?: string;
};
```

- [ ] **Step 2: Add the data**

In `apps/web/src/content/profile.ts`, extend the type import on line 1:

```ts
import type {
  Certificate,
  EducationEntry,
  ExperienceEntry,
  Language,
  Note,
  Score,
  Social,
  StackItem,
} from './types.js';
```

Then replace the `experience` export (currently lines 84-87) and add the two new
ones. **Substitute the answers from Task 0** — the values below are the
reconstruction, and the ⚠ lines are the ones that were in question:

```ts
export const education: EducationEntry[] = [
  {
    org: 'INHA University in Tashkent',
    qualification: 'BSc, Computer Science',
    from: '2024',
    to: '2028',
    detail: 'TODO — one line from Task 0',
    lead: true,
  },
  {
    org: "Najot Ta'lim",
    qualification: 'Frontend development',
    from: '2024-01',
    to: '2024-09',
    detail: 'TODO — one line from Task 0',
  },
  // ⚠ Task 0 question 1 — keep, move to `experience`, or both.
  {
    org: 'LangApex',
    from: '2019',
    to: '2022',
    detail: 'TODO — one line from Task 0',
  },
];

/**
 * Ordered strongest first. A certificate carrying a `score` is drawn as a
 * dimension row; one without is drawn as a card.
 */
export const certificates: Certificate[] = [
  {
    name: 'IELTS',
    issuer: 'IDP',
    score: { value: 8, scaleMin: 0, scaleMax: 9, display: '8.0' },
  },
  {
    name: 'SAT',
    issuer: 'College Board',
    score: { value: 1330, scaleMin: 400, scaleMax: 1600, display: '1330' },
  },
  {
    name: 'GPA',
    score: { value: 4, scaleMin: 0, scaleMax: 4, display: '4.00' },
  },
  // ⚠ Task 0 question 4 — drop this entry if it was filler.
  { name: 'Node.js', issuer: 'Udemy' },
];

/** Reverse chronological — the timeline reads newest at the top. */
export const experience: ExperienceEntry[] = [
  // ⚠ Task 0 question 2
  {
    org: 'Vention',
    role: 'Software Engineer',
    from: '2026-03',
    to: null,
    detail: 'TODO — one line from Task 0',
  },
  // ⚠ Task 0 question 3
  {
    org: 'SATashkent',
    role: 'Frontend Engineer',
    from: '2025-11',
    to: '2026-03',
    detail: 'TODO — one line from Task 0',
  },
  {
    org: 'Ziyokor Education',
    role: 'IELTS mentor & ESL teacher',
    from: '2023',
    to: '2024',
    detail: 'TODO — one line from Task 0',
  },
  {
    org: 'LangApex Edu-Center',
    role: 'ESL teacher',
    from: '2022',
    to: '2023',
    detail: 'TODO — one line from Task 0',
  },
];
```

No `TODO` string may survive into the commit — Task 0 supplies the copy.

- [ ] **Step 3: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS. `Score` and `scores` are still exported and still used by
`HomePage.tsx` and `DimensionRow.tsx`, so nothing breaks.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/content/types.ts apps/web/src/content/profile.ts
git commit -m "$(cat <<'EOF'
feat(web): add education, certificate and experience content

Typed to the shape the profile API will return, so the constants become
queries later without a component noticing (types.ts:7-12).

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 2: The hand-inked rule

**Files:**
- Create: `apps/web/src/lib/ink-path.ts`
- Create: `apps/web/src/components/ui/InkRule.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `inkPath(length: number, seed?: number, axis?: 'x' | 'y'): string`,
  `INK_WEIGHT: number`; `<InkRule seed?: number orientation?: 'horizontal' |
  'vertical' className?: string />`.

- [ ] **Step 1: Write the generator**

Create `apps/web/src/lib/ink-path.ts`:

```ts
/**
 * A hand-drawn stroke, generated rather than eyeballed.
 *
 * §2 principle 1: every ornament must be derivable. So the wobble is the sum of
 * three sine terms at fixed frequencies, sampled every 8px — an imperfect line
 * that can say exactly where it came from. Deliberately NOT Math.random(): a
 * random path re-rolls on every render and flickers.
 *
 * The stroke is drawn inside a band `INK_WEIGHT` wide, centred, so the SVG that
 * carries it can stretch on one axis with preserveAspectRatio="none" while the
 * stroke itself stays 1px via vector-effect.
 */

/** The cross-axis size of the band the stroke wanders inside, in px. */
export const INK_WEIGHT = 6;

const FREQUENCIES = [1.7, 4.3, 9.1] as const;
const AMPLITUDES = [0.9, 0.45, 0.22] as const;
const SAMPLE_PX = 8;

export function inkPath(length: number, seed = 0, axis: 'x' | 'y' = 'x'): string {
  const centre = INK_WEIGHT / 2;
  const steps = Math.max(2, Math.round(length / SAMPLE_PX));
  const points: string[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;

    let cross = centre;
    for (let harmonic = 0; harmonic < FREQUENCIES.length; harmonic += 1) {
      /* noUncheckedIndexedAccess: both arrays are `as const` and read in
         lockstep, but the compiler still types the index as possibly
         undefined. */
      const frequency = FREQUENCIES[harmonic] ?? 0;
      const amplitude = AMPLITUDES[harmonic] ?? 0;
      const phase = seed * 0.618 + harmonic * 1.31;
      cross += Math.sin((t * frequency + phase) * Math.PI * 2) * amplitude;
    }

    const along = (t * length).toFixed(2);
    const wander = cross.toFixed(2);
    points.push(axis === 'x' ? `${along} ${wander}` : `${wander} ${along}`);
  }

  return `M ${points.join(' L ')}`;
}
```

- [ ] **Step 2: Write the component**

Create `apps/web/src/components/ui/InkRule.tsx`:

```tsx
import { INK_WEIGHT, inkPath } from '../../lib/ink-path.js';

/** The path is generated once at this length and stretched to fit. */
const NOMINAL = 600;

type InkRuleProps = {
  /** Changes the wobble. Same seed, same line — give each rule its own. */
  seed?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

/**
 * The one organic mark in the system (design doc §3.4 keeps everything else
 * flat and square). It takes its colour from `currentColor`, so it re-points
 * with the ground like every other component and never needs to know whether it
 * landed on bone or void.
 */
export function InkRule({ seed = 0, orientation = 'horizontal', className = '' }: InkRuleProps) {
  const vertical = orientation === 'vertical';
  const path = inkPath(NOMINAL, seed, vertical ? 'y' : 'x');

  return (
    <svg
      viewBox={vertical ? `0 0 ${INK_WEIGHT} ${NOMINAL}` : `0 0 ${NOMINAL} ${INK_WEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`${vertical ? 'h-full' : 'w-full'} block ${className}`}
      style={vertical ? { width: `${INK_WEIGHT}px` } : { height: `${INK_WEIGHT}px` }}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        /* Keeps the stroke 1px however far the viewBox is stretched. */
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/ink-path.ts apps/web/src/components/ui/InkRule.tsx
git commit -m "$(cat <<'EOF'
feat(web): add the hand-inked rule

The wobble is three summed sines at fixed frequencies, not Math.random():
principle 1 asks an ornament to be derivable, and a random path would
re-roll and flicker on every render.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 3: Flow-aware scrolling

**Files:**
- Create: `apps/web/src/lib/scroll-to-flow.ts`

**Interfaces:**
- Consumes: `data-flow-top`, written to every stack panel by
  `lib/useStack.ts:39`.
- Produces: `scrollToFlow(target: HTMLElement, offset?: number): void`.

- [ ] **Step 1: Write the util**

Create `apps/web/src/lib/scroll-to-flow.ts`:

```ts
/**
 * Scroll to an element inside a stacked panel.
 *
 * Not scrollIntoView, and not getBoundingClientRect. Sticky separates a box's
 * painted position from its laid-out one, so once a panel has pinned, every
 * descendant reports a rect near the top of the screen and scrollIntoView
 * concludes the target is already in view and does nothing — the same failure
 * useStack documents at lib/useStack.ts:12-19 and solves by writing the panel's
 * flow position to `data-flow-top`.
 *
 * So: the panel's flow top, plus the target's offset within it (offsetTop is a
 * layout value and immune to sticky painting), minus whatever is stuck over the
 * top of the viewport.
 */

/** Sum offsetTop up the offsetParent chain, stopping at `ancestor`. */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement): number {
  let total = 0;
  let current: HTMLElement | null = node;

  while (current && current !== ancestor) {
    total += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return total;
}

export function scrollToFlow(target: HTMLElement, offset = 0): void {
  /* `.stack > *` is position: sticky and therefore positioned, so it is also
     the offsetParent the walk above terminates on. */
  const panel = target.closest<HTMLElement>('.stack > *');
  const flowTop = panel ? Number(panel.dataset.flowTop) : Number.NaN;

  const top =
    panel && Number.isFinite(flowTop)
      ? flowTop + offsetWithin(target, panel)
      : /* Unstacked page, or useStack has not measured yet. */
        target.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: Math.max(0, top - offset),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
  });
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/lib/scroll-to-flow.ts
git commit -m "$(cat <<'EOF'
feat(web): scroll to a target inside a stacked panel

scrollIntoView does nothing once a panel has pinned, because a stuck
sticky box reports a painted rect rather than a laid-out one. Reads the
data-flow-top useStack already writes for exactly this case.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 4: Chapter shell and its styles

**Files:**
- Create: `apps/web/src/components/content/about/AboutChapter.tsx`
- Modify: `apps/web/src/styles/substrate.css` (append)

**Interfaces:**
- Consumes: `InkRule` from Task 2.
- Produces: `<AboutChapter id title seed? className? children />`. `id` lands on
  the `<section>` — this is the element `useActiveSection` observes and
  `scrollToFlow` targets. The heading gets `${id}-title`.

- [ ] **Step 1: Add the chapter heading treatment**

Append to `apps/web/src/styles/substrate.css`:

```css
/* ==========================================================================
   The About chapters (§01, design doc §4.2 ③)
   ========================================================================== */

/* The drafted hand, second and last outing. The face is subset to A–Z in
   global.css, so this treatment MUST uppercase or lowercase silently falls
   back to Archivo mid-word. Set at h3 rather than anywhere smaller because
   Cabin Sketch is a double outline with a hatched fill — below about 20px the
   two lines close up and it reads as mud. */
.t-chapter {
  font-family: var(--font-sketch);
  font-size: var(--text-h3);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}
```

- [ ] **Step 2: Write the component**

Create `apps/web/src/components/content/about/AboutChapter.tsx`:

```tsx
import type { ReactNode } from 'react';
import { InkRule } from '../../ui/InkRule.js';

type AboutChapterProps = {
  /** Also the scroll target and the id useActiveSection observes. */
  id: string;
  title: string;
  /** Gives this chapter's rule its own wobble. */
  seed?: number;
  children: ReactNode;
};

/**
 * One chapter of the About narrative.
 *
 * The id sits on the section rather than on the heading, so the observer
 * watches a whole chapter instead of a 30px line of text — otherwise the nav
 * would only light while the title itself was in the reading band.
 *
 * scroll-mt clears the top bar plus, below lg, the sticky chapter bar. It is
 * belt-and-braces: scrollToFlow already subtracts the same offset, but a native
 * anchor jump (a pasted #about-education URL) does not go through it.
 */
export function AboutChapter({ id, title, seed = 0, children }: AboutChapterProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-13 lg:scroll-mt-11">
      <div className="flex items-center gap-2">
        <h3 id={`${id}-title`} className="t-chapter shrink-0 text-fg">
          {title}
        </h3>
        <InkRule seed={seed} className="text-line-strong" />
      </div>

      <div className="mt-4 lg:mt-5">{children}</div>
    </section>
  );
}
```

- [ ] **Step 3: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS. (`AboutChapter` is not yet imported anywhere; `noUnusedLocals`
does not flag unused *exports*.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/content/about/AboutChapter.tsx apps/web/src/styles/substrate.css
git commit -m "$(cat <<'EOF'
feat(web): add the About chapter shell

Cabin Sketch's second and last outing, at h3 — the face is subset to
A-Z and turns to mud below ~20px, so the heading uppercases and nothing
smaller uses it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 5: The navigation

**Files:**
- Create: `apps/web/src/components/content/about/AboutNav.tsx`
- Modify: `apps/web/src/styles/substrate.css` (append)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `type AboutChapterLink = { id: string; label: string }`;
  `<AboutNav chapters={readonly AboutChapterLink[]} active={string}
  onNavigate={(id: string) => void} />`.

**Accessibility — read before writing.** This is **not** an ARIA tab widget. All
three chapters are in the DOM, visible, and reachable by scrolling. `role="tab"`
promises panels that show and hide, so a screen-reader user would be told
two-thirds of the content is unavailable when it is right there. It is a table
of contents: a `<nav>` of real anchors, with `aria-current` on the active one.

- [ ] **Step 1: Add the styles**

Append to `apps/web/src/styles/substrate.css`:

```css
/* --- the chapter navigation ----------------------------------------------
   One component, two treatments. Below lg it is a bar under the top bar;
   from lg it is a rail beside the content. Both are plain position: sticky
   inside the About panel, which is what makes the nav leave when the section
   ends without a single line of unpin logic. */

.about-nav__list {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-nav__link {
  display: inline-flex;
  align-items: center;
  color: var(--fg-muted);
  text-decoration: none;
  transition: color var(--duration-micro) var(--ease-plate);
}

.about-nav__link[data-current] {
  color: var(--accent-text);
}

/* The bar. Opaque, not the top bar's translucent + blur: two stacked
   translucent layers would let content ghost through both. */
@media (max-width: 1023.98px) {
  .about-nav {
    position: sticky;
    top: var(--bar-h);
    z-index: 20;
    /* Break the container gutter so the rule under the bar runs edge to edge,
       then put the gutter back on the contents. */
    margin-inline: calc(var(--spacing) * -3);
    padding-inline: calc(var(--spacing) * 3);
    padding-block: calc(var(--spacing) * 1.5);
    background-color: var(--surface);
    border-bottom: 1px solid var(--line);
  }

  .about-nav__list {
    gap: calc(var(--spacing) * 2);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .about-nav__list::-webkit-scrollbar {
    display: none;
  }

  .about-nav__link {
    padding: calc(var(--spacing) * 0.75) calc(var(--spacing) * 1.25);
    white-space: nowrap;
    /* Transparent at rest so the box appearing costs no layout shift. */
    border: 1px solid transparent;
    transition:
      color var(--duration-micro) var(--ease-plate),
      border-color var(--duration-micro) var(--ease-plate);
  }

  .about-nav__link[data-current] {
    border-color: var(--line-strong);
  }
}

/* The rail. A fixed step is what lets the marker move without measuring
   anything — index times step, and no layout read on any frame. */
@media (min-width: 1024px) {
  .about-nav {
    --about-nav-step: 40px;
    position: sticky;
    top: calc(var(--bar-h) + var(--spacing) * 4);
    align-self: start;
  }

  .about-nav__list {
    position: relative;
    flex-direction: column;
    padding-left: calc(var(--spacing) * 2);
  }

  .about-nav__list::before {
    content: '';
    position: absolute;
    left: 0;
    top: calc((var(--about-nav-step) - var(--spacing) * 2) / 2);
    width: 2px;
    height: calc(var(--spacing) * 2);
    background-color: var(--accent);
    translate: 0 calc(var(--about-nav-index, 0) * var(--about-nav-step));
    transition: translate var(--duration-micro) var(--ease-plate);
  }

  .about-nav__link {
    height: var(--about-nav-step);
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-nav__list::before {
    transition: none;
  }
}
```

- [ ] **Step 2: Write the component**

Create `apps/web/src/components/content/about/AboutNav.tsx`:

```tsx
import type { CSSProperties, MouseEvent } from 'react';

export type AboutChapterLink = { id: string; label: string };

type AboutNavProps = {
  chapters: readonly AboutChapterLink[];
  active: string;
  onNavigate: (id: string) => void;
};

/**
 * Not a tab widget. Every chapter is in the DOM and reachable by scrolling, so
 * role="tab" would promise panels that show and hide and tell a screen-reader
 * user that two thirds of the section is unavailable. It is a table of
 * contents: real anchors, aria-current, and a click handler that only
 * preventDefaults so it can substitute the flow-aware scroll.
 */
export function AboutNav({ chapters, active, onNavigate }: AboutNavProps) {
  const index = Math.max(
    0,
    chapters.findIndex((chapter) => chapter.id === active),
  );

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    /* Let the browser handle a modified click — a new tab on a #hash is odd
       but it is the reader's to ask for. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(id);
  };

  return (
    <nav
      aria-label="About chapters"
      className="about-nav"
      style={{ '--about-nav-index': index } as CSSProperties}
    >
      <ul className="about-nav__list">
        {chapters.map((chapter) => {
          const current = chapter.id === active;

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? 'true' : undefined}
                data-current={current || undefined}
                onClick={(event) => handleClick(event, chapter.id)}
                className="about-nav__link t-data"
              >
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS. The `as CSSProperties` cast is required — React's `style` type
rejects unknown custom properties without it.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/content/about/AboutNav.tsx apps/web/src/styles/substrate.css
git commit -m "$(cat <<'EOF'
feat(web): add the About chapter navigation

A rail from lg, a sticky bar below, one component. Deliberately a nav of
anchors rather than an ARIA tablist: nothing is hidden, so role="tab"
would misreport two thirds of the section as unavailable.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 6: Story chapter

**Files:**
- Create: `apps/web/src/components/content/about/StoryChapter.tsx`

**Interfaces:**
- Consumes: `AboutChapter` (Task 4); existing `Prose`, `Data`, `Chip`,
  `LanguageTable`; `profile`, `languages` from `content/profile.ts`.
- Produces: `<StoryChapter />`, no props.

- [ ] **Step 1: Write the component**

Create `apps/web/src/components/content/about/StoryChapter.tsx`:

```tsx
import { AboutChapter } from './AboutChapter.js';
import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { LanguageTable } from '../LanguageTable.js';
import { Prose } from '../../../primitives/Prose.js';
import { languages, profile } from '../../../content/profile.js';

/**
 * The one chapter that is mostly words, so it keeps the bone reading island
 * inside the void band (§2 principle 7): several hundred words on near-black is
 * worse, not braver.
 *
 * Human languages live here rather than under Education — they are part of who
 * someone is, not a qualification they were awarded.
 */
export function StoryChapter() {
  return (
    <AboutChapter id="about-story" title="Story" seed={1}>
      <div className="grid gap-5 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-8">
        <Prose className="border border-line p-3 lg:p-4">
          {profile.bio.en.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </Prose>

        <div className="flex flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <Data tone="accent">Now</Data>
              <Chip tone="live">Since {profile.now.updatedAt}</Chip>
            </div>
            <p className="prose-measure mt-2 text-body text-fg-muted">{profile.now.text}</p>
          </div>

          <div>
            <Data tone="accent">Languages</Data>
            <div className="mt-2">
              <LanguageTable languages={languages} />
            </div>
          </div>
        </div>
      </div>
    </AboutChapter>
  );
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/components/content/about/StoryChapter.tsx
git commit -m "$(cat <<'EOF'
feat(web): add the Story chapter

Keeps the bone reading island inside the void band, and gives the bio a
current state by putting `now` beside it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 7: Education chapter

**Files:**
- Create: `apps/web/src/components/content/about/EducationChapter.tsx`
- Modify: `apps/web/src/components/content/DimensionRow.tsx`

**Interfaces:**
- Consumes: `AboutChapter` (Task 4), `InkRule` (Task 2), `education` and
  `certificates` (Task 1); existing `Plate`, `Data`, `Chip`.
- Produces: `<EducationChapter />`, no props. `DimensionRow` changes signature to
  `{ label: string; score: CertificateScore }`.

**Why `DimensionRow` changes:** the reference draws IELTS and SAT as plain cards.
A score card asserts a number; a dimension row shows it against its scale, which
is what §3.6 asked for and what the component already does. Taking `label` and
`score` separately lets it serve a `Certificate` without the component knowing
what a certificate is.

- [ ] **Step 1: Retarget DimensionRow**

Replace lines 1-2 and the signature/body of
`apps/web/src/components/content/DimensionRow.tsx`. The two changed lines:

```tsx
import { Data } from '../../primitives/Data.js';
import type { CertificateScore } from '../../content/types.js';
```

```tsx
export function DimensionRow({ label, score }: { label: string; score: CertificateScore }) {
```

And inside, line 18 becomes:

```tsx
        <Data tone="muted">{label}</Data>
```

Everything else in the file — the fraction maths, the ticks, the bounds — is
unchanged. `score.value`, `score.scaleMin`, `score.scaleMax` and `score.display`
all exist on `CertificateScore` under the same names.

**This breaks `HomePage.tsx` until Task 9.** That is expected and called out in
Step 3.

- [ ] **Step 2: Write the chapter**

Create `apps/web/src/components/content/about/EducationChapter.tsx`:

```tsx
import { AboutChapter } from './AboutChapter.js';
import { Data } from '../../../primitives/Data.js';
import { DimensionRow } from '../DimensionRow.js';
import { InkRule } from '../../ui/InkRule.js';
import { Plate } from '../../../primitives/Plate.js';
import { certificates, education } from '../../../content/profile.js';
import type { EducationEntry } from '../../../content/types.js';

/** '2024-09' → '2024'. Dates are mono metadata, so they stay terse. */
function span(entry: EducationEntry): string {
  const to = entry.to ?? 'present';
  return entry.from === to ? entry.from : `${entry.from} — ${to}`;
}

function EducationCard({ entry }: { entry: EducationEntry }) {
  return (
    <Plate className="flex h-full flex-col gap-1 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="t-h4 text-fg">{entry.org}</h4>
        <Data>{span(entry)}</Data>
      </div>

      {entry.qualification ? <Data tone="accent">{entry.qualification}</Data> : null}
      {entry.detail ? <p className="mt-1 text-body text-fg-muted">{entry.detail}</p> : null}
    </Plate>
  );
}

/**
 * Cards for the institutions, dimension rows for anything with a number.
 *
 * A score card asserts a figure; a dimension row shows it against its scale
 * (§2 principle 8 — a score means more with a date and a scale), so a
 * certificate carrying one is drawn as a measurement and one without is drawn
 * as a card.
 */
export function EducationChapter() {
  const lead = education.find((entry) => entry.lead);
  const rest = education.filter((entry) => !entry.lead);

  const measured = certificates.filter((certificate) => certificate.score);
  const awarded = certificates.filter((certificate) => !certificate.score);

  return (
    <AboutChapter id="about-education" title="Education" seed={2}>
      <div className="flex flex-col gap-3">
        {lead ? <EducationCard entry={lead} /> : null}

        {rest.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {rest.map((entry) => (
              <EducationCard key={entry.org} entry={entry} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-6 lg:mt-8">
        <div className="flex items-center gap-2">
          <Data tone="accent" className="shrink-0">
            Certificates
          </Data>
          <InkRule seed={5} className="text-line" />
        </div>

        <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {measured.map((certificate) =>
            certificate.score ? (
              <DimensionRow
                key={certificate.name}
                label={
                  certificate.issuer
                    ? `${certificate.name} — ${certificate.issuer}`
                    : certificate.name
                }
                score={certificate.score}
              />
            ) : null,
          )}
        </div>

        {awarded.length ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {awarded.map((certificate) => (
              <Plate key={certificate.name} className="flex flex-col gap-1 p-3">
                <h4 className="t-h4 text-fg">{certificate.name}</h4>
                {certificate.issuer ? <Data>by {certificate.issuer}</Data> : null}
              </Plate>
            ))}
          </div>
        ) : null}
      </div>
    </AboutChapter>
  );
}
```

The `certificate.score ?` guard inside `measured.map` is redundant at runtime —
`measured` was filtered on it — but `Certificate.score` is optional, so the
compiler needs it. A non-null assertion would also work; the guard is preferred
because it cannot go stale if the filter changes.

- [ ] **Step 3: Verify the expected breakage, then check the rest**

Run: `npm run typecheck`
Expected: **FAIL**, with exactly one class of error, in `HomePage.tsx` —
`Property 'label' is missing` / `Type 'Score' is not assignable` at the
`<DimensionRow key={score.label} score={score} />` call on line 95.

That is the only permitted failure. Any error in `EducationChapter.tsx`,
`DimensionRow.tsx`, or elsewhere is a real one — fix it before continuing.
Task 9 removes the `HomePage` call site.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/content/about/EducationChapter.tsx apps/web/src/components/content/DimensionRow.tsx
git commit -m "$(cat <<'EOF'
feat(web): add the Education chapter

A certificate with a score is drawn as a dimension row rather than a
card: principle 8 asks a number to carry its scale, and the component
already draws exactly that. HomePage's old call site lands next.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 8: Experience chapter

**Files:**
- Create: `apps/web/src/components/content/about/TimelineEntry.tsx`
- Create: `apps/web/src/components/content/about/ExperienceChapter.tsx`
- Modify: `apps/web/src/styles/substrate.css` (append)

**Interfaces:**
- Consumes: `AboutChapter` (Task 4), `InkRule` (Task 2), `experience` (Task 1);
  existing `Plate`, `Data`, `Chip`, `StackComb`, `StackCombHeader`.
- Produces: `<TimelineEntry entry={ExperienceEntry} side={'left' | 'right'} />`;
  `<ExperienceChapter />`, no props.

- [ ] **Step 1: Add the timeline styles**

Append to `apps/web/src/styles/substrate.css`:

```css
/* --- the experience timeline ---------------------------------------------
   A spine with entries hung off it. Down the left edge on a phone, because a
   single column has no middle to alternate about; centred from lg, where
   alternating is what makes a list of four jobs read as a passage of time
   rather than as four more cards. */

.timeline {
  position: relative;
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.timeline__spine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--spacing) * 1.5);
  color: var(--line-strong);
  pointer-events: none;
}

.timeline__entry {
  position: relative;
  padding-left: calc(var(--spacing) * 5);
}

/* The node is a registration cross, not a dot — the system already marks a
   position that way (§3.4), and a circle would be the only one on the site. */
.timeline__node {
  position: absolute;
  top: calc(var(--spacing) * 2);
  left: calc(var(--spacing) * 1.5);
  width: 11px;
  height: 11px;
  translate: -50% 0;
  pointer-events: none;
  background-color: var(--surface);
  background-repeat: no-repeat;
  background-image:
    linear-gradient(var(--mark), var(--mark)), linear-gradient(var(--mark), var(--mark));
  background-size:
    11px 1px,
    1px 11px;
  background-position: center, center;
}

/* The tether — a horizontal tick from the card edge to the spine. */
.timeline__entry::after {
  content: '';
  position: absolute;
  top: calc(var(--spacing) * 2 + 5px);
  left: calc(var(--spacing) * 1.5);
  width: calc(var(--spacing) * 3.5);
  height: 1px;
  background-color: var(--line-strong);
}

@media (min-width: 1024px) {
  .timeline {
    grid-template-columns: 1fr 1fr;
    column-gap: calc(var(--spacing) * 6);
  }

  .timeline__spine {
    left: 50%;
    translate: -50% 0;
  }

  .timeline__entry {
    padding-left: 0;
  }

  .timeline__entry[data-side='left'] {
    grid-column: 1;
    text-align: right;
  }

  .timeline__entry[data-side='right'] {
    grid-column: 2;
  }

  /* Half the column gap puts both the node and the tether's far end exactly
     on the spine, whichever side the entry is on. */
  .timeline__entry[data-side='left'] .timeline__node {
    left: auto;
    right: calc(var(--spacing) * -3);
    translate: 50% 0;
  }

  .timeline__entry[data-side='right'] .timeline__node {
    left: calc(var(--spacing) * -3);
  }

  .timeline__entry[data-side='left']::after {
    left: auto;
    right: calc(var(--spacing) * -3);
    width: calc(var(--spacing) * 3);
  }

  .timeline__entry[data-side='right']::after {
    left: calc(var(--spacing) * -3);
    width: calc(var(--spacing) * 3);
  }
}
```

- [ ] **Step 2: Write the entry**

Create `apps/web/src/components/content/about/TimelineEntry.tsx`:

```tsx
import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import type { ExperienceEntry } from '../../../content/types.js';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** '2026-03' → 'Mar 2026'; '2023' → '2023'. Not Intl: the input is a partial
 *  date, and `new Date('2023')` is a UTC instant that can render as 2022 west
 *  of Greenwich. */
function label(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}

export function TimelineEntry({
  entry,
  side,
}: {
  entry: ExperienceEntry;
  side: 'left' | 'right';
}) {
  const current = entry.to === null;

  return (
    <div className="timeline__entry" data-side={side}>
      <span className="timeline__node" aria-hidden="true" />

      <Plate className="flex flex-col gap-1 p-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="t-h4 text-fg">{entry.org}</h4>
          {current ? <Chip tone="live">Current</Chip> : null}
        </div>

        <Data>
          {label(entry.from)} — {entry.to === null ? 'present' : label(entry.to)}
        </Data>
        <Data tone="fg">{entry.role}</Data>

        {entry.detail ? <p className="mt-1 text-body text-fg-muted">{entry.detail}</p> : null}
      </Plate>
    </div>
  );
}
```

- [ ] **Step 3: Write the chapter**

Create `apps/web/src/components/content/about/ExperienceChapter.tsx`:

```tsx
import { AboutChapter } from './AboutChapter.js';
import { InkRule } from '../../ui/InkRule.js';
import { StackComb, StackCombHeader } from '../StackComb.js';
import { TimelineEntry } from './TimelineEntry.js';
import { experience, stack } from '../../../content/profile.js';

/**
 * The timeline, then the tools.
 *
 * The stack comb used to trail the whole About section. It closes Experience
 * instead: a list of tools is what the work is made of, so it belongs to the
 * work chapter rather than to the person.
 */
export function ExperienceChapter() {
  return (
    <AboutChapter id="about-experience" title="Experience" seed={3}>
      <div className="timeline">
        <InkRule seed={7} orientation="vertical" className="timeline__spine" />

        {experience.map((entry, index) => (
          <TimelineEntry
            key={`${entry.org}-${entry.from}`}
            entry={entry}
            side={index % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-5 lg:mt-10 lg:pt-6">
        <StackCombHeader items={stack} />
        <div className="mt-6 lg:mt-8">
          <StackComb items={stack} />
        </div>
      </div>
    </AboutChapter>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: the **same single `HomePage.tsx` DimensionRow error from Task 7**, and
nothing else. Anything new is a real error.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/content/about/TimelineEntry.tsx apps/web/src/components/content/about/ExperienceChapter.tsx apps/web/src/styles/substrate.css
git commit -m "$(cat <<'EOF'
feat(web): add the Experience chapter

An alternating timeline about a hand-inked spine, with the stack comb
moved here as its coda — the tools are what the work is made of, so
they close the work chapter rather than trailing the whole section.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 9: Assemble and wire in

**Files:**
- Create: `apps/web/src/components/content/about/AboutSection.tsx`
- Modify: `apps/web/src/pages/HomePage.tsx:74-120`
- Modify: `apps/web/src/content/profile.ts` (remove `scores`)
- Modify: `apps/web/src/content/types.ts` (remove `Score`)

**Interfaces:**
- Consumes: everything from Tasks 1-8, plus existing `useActiveSection`.
- Produces: `<AboutSection />`, rendered inside the existing
  `<Section id="about" index="01" surface="void">`.

- [ ] **Step 1: Write the shell**

Create `apps/web/src/components/content/about/AboutSection.tsx`:

```tsx
import { useCallback } from 'react';
import { AboutNav } from './AboutNav.js';
import { EducationChapter } from './EducationChapter.js';
import { ExperienceChapter } from './ExperienceChapter.js';
import { StoryChapter } from './StoryChapter.js';
import { scrollToFlow } from '../../../lib/scroll-to-flow.js';
import { useActiveSection } from '../../../lib/useActiveSection.js';
import type { AboutChapterLink } from './AboutNav.js';

/* Document order. useActiveSection resolves ties by taking the last
   intersecting id, so this array has to run in the order the chapters do. */
const CHAPTERS: readonly AboutChapterLink[] = [
  { id: 'about-story', label: 'Story' },
  { id: 'about-education', label: 'Education' },
  { id: 'about-experience', label: 'Experience' },
] as const;

const IDS = CHAPTERS.map((chapter) => chapter.id);
const FIRST = IDS[0] ?? '';

/** The top bar, plus the chapter bar where it is sticky, plus a little air. */
function stuckHeight(): number {
  const root = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  );
  const bar = Number.isFinite(root) ? root : 57;

  const nav = document.querySelector<HTMLElement>('.about-nav');
  const navStuck = nav && getComputedStyle(nav).position === 'sticky' && window.innerWidth < 1024;

  return bar + (navStuck && nav ? nav.offsetHeight : 0) + 16;
}

/**
 * §01, as three chapters behind one anchored navigation.
 *
 * There is no tab state to own. The chapters are all rendered, all the time —
 * which is what makes this read as one continuous story rather than three
 * pages, and what keeps the panel's height constant so useStack never
 * re-measures the panels below mid-interaction. "Active" is a purely derived
 * fact about where the reader is, so it comes from the observer the top bar
 * already uses.
 */
export function AboutSection() {
  const observed = useActiveSection(IDS);
  const active = observed ?? FIRST;

  const handleNavigate = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) scrollToFlow(target, stuckHeight());
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(9rem,1fr)_3fr] lg:gap-8">
      <AboutNav chapters={CHAPTERS} active={active} onNavigate={handleNavigate} />

      {/* The chapters carry their own separation — each opens with its heading
          and inked rule — so the gap here is air, not a divider. */}
      <div className="mt-5 flex flex-col gap-10 lg:mt-0 lg:gap-16">
        <StoryChapter />
        <EducationChapter />
        <ExperienceChapter />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire it into HomePage**

In `apps/web/src/pages/HomePage.tsx`, replace the whole §01 block (lines 74-120,
from the `{/* ── 01 · About */}` comment through the closing `</Section>`) with:

```tsx
      {/* ── 01 · About ──────────────────────────────────────────────────────
          The face and the name, then the person behind them. It lands directly
          on the hero, and it is the one section that turns the ground over: the
          sheet is bone the whole way down, so the band is what marks the person
          out from the work that follows.

          Three chapters, all rendered, navigated by one anchored rail. The
          panel is deliberately several viewports tall — useStack pins a tall
          panel at `viewport - height`, so it scrolls until its last line rests
          on the floor and only then holds, and the nav's nested sticky leaves
          with it. */}
      <Section id="about" index="01" title="About" surface="void">
        <AboutSection />
      </Section>
```

Then fix the imports at the top of the file:

- **Add:** `import { AboutSection } from '../components/content/about/AboutSection.js';`
- **Remove:** the `DimensionRow`, `LanguageTable`, `Portrait`-adjacent
  `StackComb`/`StackCombHeader`, and `Prose` imports **only if nothing else in
  the file still uses them.** After this edit:
  - `DimensionRow` — no other use. Remove the import (line 6).
  - `LanguageTable` — no other use. Remove (line 7).
  - `StackComb`, `StackCombHeader` — no other use. Remove (line 11).
  - `Prose` — no other use. Remove from the `primitives/index.js` import on line 3.
  - `Portrait` — **still used** by the hero. Keep.
  - `Data` — **still used** by the hero and §05. Keep.
- **Change** the content import on line 14 from
  `import { languages, notes, profile, scores, stack } from '../content/profile.js';`
  to `import { notes, profile } from '../content/profile.js';`
  (`languages` and `stack` are now imported by the chapters that use them.)

`noUnusedLocals` turns any missed import into a build failure, so the typecheck
in Step 4 catches a mistake here.

- [ ] **Step 3: Remove the dead `scores` / `Score`**

In `apps/web/src/content/profile.ts`, delete the `scores` export (lines 47-56,
including its doc comment) and drop `Score` from the type import on line 1.

In `apps/web/src/content/types.ts`, delete the `Score` type.

- [ ] **Step 4: Verify it typechecks**

Run: `npm run typecheck`
Expected: **PASS** — including the `HomePage.tsx` error carried since Task 7,
which this task's Step 2 removes the call site for.

- [ ] **Step 5: Verify it builds**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Browser check**

Run: `npm run dev:web`, open http://localhost:5173

Walk this list and fix what fails:

1. **Scroll** home top to bottom. The rail lights Story → Education →
   Experience in turn, holds for the whole of About, and leaves with the panel
   as §02 Projects lands on top.
2. **Click each nav item from the top of About.** Each scrolls smoothly to its
   chapter, landing clear of the top bar.
3. **Click each nav item from the *bottom* of About** — scroll until §02 has
   just started to cover it, then scroll back one notch so the About panel is
   pinned. This is the `data-flow-top` case; before Task 3 it would do nothing.
4. **Paste `http://localhost:5173/#about-education`** into a fresh tab. It lands
   on the chapter, clear of the bar.
5. **Keyboard:** Tab to each nav link, Enter navigates, the focus ring is
   visible against the void ground.
6. **Widths:** 320, 375, 768, 1024, 1280, 1920. At 320 the tab bar scrolls
   horizontally without clipping; at 1024 the layout switches to the rail.
7. **Mobile bar:** it sticks directly under the top bar with no gap and no
   content ghosting through it.
8. **Reduced motion:** in devtools, emulate `prefers-reduced-motion: reduce`.
   Nav clicks jump rather than glide; the rail marker does not slide;
   registration marks sit at full opacity.
9. **Safari and Firefox** — the nested sticky (a sticky nav inside a sticky
   panel) is the thing to confirm. It should hold at the bar and release with
   the panel in both.
10. **The top bar's own About link** still jumps to §01, and ⌘K → About still
    works.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/content/about/AboutSection.tsx apps/web/src/pages/HomePage.tsx apps/web/src/content/profile.ts apps/web/src/content/types.ts
git commit -m "$(cat <<'EOF'
feat(web): rebuild About as three scroll-linked chapters

Story, Education and Experience behind one anchored navigation — a rail
from lg, a sticky bar below. Every chapter stays rendered: it is what
makes the section read as one story rather than three pages, and it
keeps the panel's height constant so useStack never re-measures the
panels below mid-interaction.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Task 10: Record the design decisions

**Files:**
- Modify: `proposeddesign.md` (§3.6, §4.2 ③)
- Modify: `CLAUDE.md` (the web app section)

The codebase's convention is that a `§` citation in a comment points at a real
paragraph. Three decisions here are not yet in the design doc, so those
citations would dangle.

- [ ] **Step 1: Add the new components to `proposeddesign.md` §3.6**

Append two entries, in the voice of the surrounding table:

```markdown
**Ink rule** — the one organic mark in a system that is otherwise flat and
square. A 1px stroke whose wobble is the sum of three sine terms at fixed
frequencies, generated per seed rather than drawn, so it satisfies principle 1:
the mark can say where it came from. Used for chapter headings and the
timeline spine. It is the only exception to §3.4, and it is an exception about
*line quality*, never about radius — every box on the page is still square.

**Chapter rail** — the About section's table of contents. A sticky rail from
`lg`, a sticky horizontal bar below, both plain `position: sticky` nested inside
the About panel so the nav leaves when the section does. Deliberately a `<nav>`
of anchors rather than an ARIA tablist: every chapter stays in the DOM, so
`role="tab"` would misreport two thirds of the section as unavailable.
```

- [ ] **Step 2: Rewrite `proposeddesign.md` §4.2 ③**

It currently reads:

> **③ About** — ~140 words at a 60-character measure, plus the stack matrix,
> with the measured column (scores, languages) alongside.

Replace with:

```markdown
**③ About** — three chapters behind one anchored rail: **Story** (the bio on
its bone island, the current state, languages), **Education** (institution
cards, then certificates — anything carrying a number is drawn as a dimension
row against its scale, not asserted on a card), and **Experience** (an
alternating timeline about an inked spine, closing on the stack comb).

The panel is several viewports tall and every chapter is rendered at all times.
That is what makes it read as one continuous story rather than three pages, and
it is also what keeps the panel's height constant — a tab that showed and hid
content would resize the panel and send `useStack` re-measuring every panel
below it mid-interaction.
```

- [ ] **Step 3: Add a line to `CLAUDE.md`**

Under `### Web app`, after the `lib/api.ts` bullet:

```markdown
- **`/#about` is one panel of three chapters, not a tab widget.** All three are
  always rendered; `useActiveSection` derives which is current and
  `lib/scroll-to-flow.ts` handles clicks, because `scrollIntoView` silently does
  nothing once a stack panel has pinned. Keep the height tab-independent — if a
  chapter ever shows and hides, `useStack` re-measures every panel below it.
```

- [ ] **Step 4: Verify nothing else went stale**

Run: `grep -rn "scores\|Score" apps/web/src`
Expected: no hits in `content/`, `pages/`, or `components/content/DimensionRow.tsx`
except `CertificateScore`.

- [ ] **Step 5: Commit**

```bash
git add proposeddesign.md CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: record the ink rule, the chapter rail and the new About §4.2

Comments in the new components cite these sections; without them the
citations dangle, which is the one thing the § convention cannot afford.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_019ruGg7yFNmxXWnksNxnHZN
EOF
)"
```

---

## Self-Review

**Spec coverage**

| Spec section | Task |
|---|---|
| §3 visual register — ink rule, Cabin Sketch headings, mono rail | 2, 4 |
| §4.1 desktop rail | 5, 9 |
| §4.2 mobile sticky bar | 5 |
| §5.1 Story | 6 |
| §5.2 Education, scores as dimension rows | 7 |
| §5.3 Experience timeline + comb coda | 8 |
| §6 content model | 1 |
| §6.1 content to confirm | 0 |
| §7.1 active chapter via `useActiveSection` | 9 |
| §7.2 `scrollToFlow` | 3 |
| §7.3 accessibility — nav, not tablist | 5, 4 |
| §7.4 motion budget | 5 (marker), 3 (reduced motion) |
| §8 files | all |
| §9 risks | 9 step 6 items 6-9 |
| §10 verification | 9 step 6 |

No gaps.

**Placeholder scan**

The `'TODO — one line from Task 0'` strings in Task 1 are the one intentional
placeholder in the plan, and they are gated: Task 0 is blocking, Task 1 Step 2
says no `TODO` may reach the commit. Everything else is literal code.

**Type consistency**

- `CertificateScore` — defined Task 1, consumed by `DimensionRow` (Task 7) and
  `Certificate.score` (Task 1). Field names `value`, `scaleMin`, `scaleMax`,
  `display` match the existing `Score`, so `DimensionRow`'s arithmetic is
  untouched.
- `inkPath(length, seed, axis)` / `INK_WEIGHT` — defined Task 2, consumed only
  by `InkRule` in the same task.
- `scrollToFlow(target, offset)` — defined Task 3, called once, Task 9.
- `AboutChapterLink` — defined Task 5 in `AboutNav.tsx`, imported Task 9.
- `AboutChapter` props `{ id, title, seed?, children }` — defined Task 4, used
  identically in Tasks 6, 7, 8.
- `ExperienceEntry` / `EducationEntry` — defined Task 1, consumed Tasks 7, 8.
- Chapter ids `about-story` / `about-education` / `about-experience` — written in
  Tasks 6, 7, 8; listed in Task 9. Identical in both places.

**Deliberate intermediate breakage:** Task 7 leaves `npm run typecheck` failing
on one known `HomePage.tsx` line, and Task 9 fixes it. Tasks 7 and 8 name the
exact expected error so an executor can tell it apart from a real one. This is
the alternative to a larger, unreviewable single task; if you would rather every
task be green, merge Tasks 7, 8 and 9.
