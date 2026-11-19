# Home Projects — Folder Marquee — Design

**Date:** 2026-11-19
**Milestone:** Frontend, home page §02. No backend, no data-model change.
**Scope:** Replace the home Projects grid (`ProjectCard` × 5 + `MoreOnGitHub`)
with two full-width, auto-sliding rows of folder-shaped cards.
**Companion documents:** `proposeddesign.md` (§2 principles 4 and 6, §3.4, §4.3),
brainstorm mockup `.superpowers/brainstorm/563-1795088612/content/folder-soft-v2.html`
(the **shorten.uz** folder is the approved look).

---

## 1. Intent

The current cards feel generic. The section should have personality: each
project is a **folder** you can almost pick up, with its stack tucked inside and
poking out the top, and the section itself is alive, two rows drifting past in
opposite directions.

The two directions carry meaning: **row 1 is what is live in production, row 2
is what was built along the way.**

**Done means all of these are true:**

- Projects renders two rows that break out of the page container to the full
  viewport width.
- Row 1 holds the five `featured` projects and drifts right to left. Row 2 holds
  every non-featured project plus a GitHub folder and drifts left to right.
- Both rows loop seamlessly and slowly. A soft fade on each edge leaves a focus
  zone about **two folders wide** on desktop (about one on phones).
- Each project is a folder: back flap with a tab, real stack logos on small cards
  tucked behind the front panel, then the cover image, a large title with the
  year, one line, and up to three facts.
- Hovering a folder pauses its row, tips the front flap open, lifts and fans the
  logo cards, dims the image, and slides the action buttons up over it.
- `prefers-reduced-motion: reduce` stops all of it: rows become swipeable strips
  and the flap does not tilt.
- `npm run typecheck` passes.

## 2. Goals, non-goals, anti-goals

**Goals:** personality; a motion read of "live vs. along the way"; every folder
still one click from its demo and source.

**Non-goals:** `/work` (`WorkPlate`, `WorkIndexPage`) is untouched. No drag-to-scroll,
no JS animation loop, no new content fields.

**Anti-goals, failures even if it technically works:**

- A button you have to chase. Hover/focus must stop the row.
- The loop giving itself away: the same folder visible twice in a row's focus
  zone at once. On very wide screens a five-item row 1 can show a copy faded at
  the far edge; that's acceptable, but it must never show inside the clear band.
- Logo cards or the tipped flap clipped by the row's overflow.
- Horizontal page scroll caused by the full-bleed break-out.
- A rendering cost while the section is off-screen or the tab is hidden (this is
  why it is pure CSS).

## 3. Deliberate departures from the design system

These are the fourth-and-later exceptions to §2 principle 6 / §3.4, and the
second to principle 4. Each is documented in place, the way `tokens.css` already
documents the About rail's.

| Rule | Departure | Why |
|---|---|---|
| Principle 4: nothing moves on its own | The rows drift continuously | It is the section's personality, chosen explicitly; reduced-motion turns it off |
| Principle 6: radius 0 | Folder, inner image, logo cards and buttons are rounded | The folder reads as a folder only when soft |
| Principle 6: no shadows | Front panel casts a shadow that deepens on hover | Sells the flap opening |
| §4.3: nothing moves on hover | Flap tilt, logo lift, button slide-up | That is the interaction |

## 4. Approaches considered

| | Approach | Trade-off | Decision |
|---|---|---|---|
| Structure | One `ProjectCard` rewritten as a folder | Simplest, but the GitHub exit stays a flat box, a different family | No |
| | **`Folder` shell + `ProjectFolder`, GitHub as an empty folder** | One extra component with two real users | **Chosen** |
| Motion | JS `requestAnimationFrame` loop | Eased pause, drag, but per-frame script and more code | No |
| | **CSS keyframes on a doubled track** | No easing into the pause; costs nothing off-screen | **Chosen** |
| Row content | Only the 5 featured, split 3 + 2 | Too few to loop without visible repeats | No |
| | All 20 mixed | Production work lost among practice builds | No |
| | **Row 1 = featured 5, row 2 = the rest + GitHub** | Row 1 is short, so it is doubled more than once (§6.2) | **Chosen** |

All three were the designer's call, delegated by the user ("go with your pick").
The look (B + C's opening flap, real logos, bigger title) and row content
(option A) were chosen by the user.

## 5. Components

### 5.1 `Folder` — `components/content/Folder.tsx`

The shell every folder shares. It knows nothing about projects.

```
Folder
├─ back        absolute, violet-tinted flap, --radius-folder
├─ tab         top-left, ~44% wide, same tint, top corners rounded; holds `tab` (ReactNode)
├─ papers      absolute top-right, z between back and front; holds `papers` (ReactNode)
└─ front       relative, --surface-raised fill, --radius-folder, --shadow-folder; holds children
```

Props: `tab`, `papers?`, `children`, `as?` (an `<a>` for the GitHub folder,
`article` otherwise), `className?`. All hover choreography is CSS on the
`.folder` class in `substrate.css`, keyed off `.folder:hover` and
`.folder:focus-within`. Tailwind cannot express nth-child fan transforms or the
3D tilt cleanly.

Hover / focus-within choreography (timings from the mockup, cubic-bezier(.2,.8,.2,1)):

- `front`: `rotateX(-10deg)` from `transform-origin: bottom`, parent `perspective: 1000px`,
  shadow goes to `--shadow-folder-open`. 450ms.
- `papers`: `translateY(-14px)`; first and last card fan a further few degrees outward.
- Image dims (`brightness(.5)`), actions slide up from `translateY(100%)` and fade in, 50ms delay.

At rest the logo cards sit slightly rotated and staggered (-7°, 3°, -2°, 6°, -4°
with small Y offsets) so they read as loose papers, not a toolbar.

### 5.2 `ProjectFolder` — replaces `components/content/ProjectCard.tsx`

`ProjectCard.tsx` is deleted, since HomePage is its only user.

- **Tab:** status. `● Live` (mint `Data tone="live"`) when `tags` includes `live`;
  otherwise `Source only` if there is just a source link; `Private build` if there
  are no links.
- **Papers:** up to five `StackMark`s from `project.stack`, in order.
- **Cover:** 16/10, `--radius-folder-inner`, `object-cover object-top`, keeps
  `viewTransitionName: cover-${slug}`. Actions overlay its bottom edge: `Visit site ↗`
  (solid, accent) when `demo`, `Source ↗` (ghost) when `source`. With no links,
  no overlay. The private state lives in the tab, not in a fake button.
- **Title row:** `t-h2`-scale display title (the mockup's 30px; use the nearest
  type token, don't hard-code), year in mono to the right.
- **Line:** `tagline.en ?? summary.en`, clamped to 2 lines.
- **Facts:** `highlights` as rounded chips, `feature` kind filled with
  `--accent-text`. Non-featured projects mostly lack highlights; then no chip row.
  The card height difference is fine because rows align to `start`.
- The cover is still a link to the primary destination, kept out of the tab order,
  same as today.

### 5.3 `MoreOnGitHub` — rewritten as an empty folder

Same `Folder` shell rendered `as="a"` to the GitHub URL from `socials`, so the whole
folder is the link. Tab: `GitHub`. Papers: one card with the GitHub mark. Front:
no image; the handle, and "everything else I've pushed →". Sits at the end of
row 2's list, so it appears once per loop. Being empty is what tells it apart
from a project.

### 5.4 `StackMark` — `components/ui/StackMark.tsx`

One component that renders a tool's brand glyph, or its initials when it has none.
Used by the folder papers **and** by `StackComb`, so both show logos the same
way. `StackComb` keeps its own cell styling and swaps its inline glyph/initial
branch for `StackMark`.

`stack-icons.ts` gains:

- **New marks** (Simple Icons, CC0, copied in as the file already does), paired
  with a `--color-brand-*` token: PostgreSQL, AWS Lambda, React Query (TanStack
  Query), Ant Design, SQLite, Docker, Drizzle, Redux, i18next, HTML5, CSS, Spotify.
  Marks drawn black or too pale on a light card (Express, Next.js, Drizzle) use
  `currentColor`.
- **An alias map** from content names to icon keys, so content stays written the
  way a human says it: `React 19 → React`, `Postgres → PostgreSQL`,
  `Claude Agent SDK → Claude`, `TanStack Query → React Query`,
  `Redux Toolkit`/`RTK Query → Redux`, `SCSS → Scss`, `CSS → CSS`, `HTML → HTML5`,
  `Spotify API → Spotify`.
- **No mark** (`REST API`, `Web Audio`) means initials, which is correct: those
  have no original logo.

## 6. The marquee — `components/content/ProjectMarquee.tsx`

### 6.1 Layout

HomePage's Projects `Section` keeps its head (index, title, lede, `Index →` aside).
Its children become `ProjectMarquee`, which breaks out of the page container:
`width: 100vw; margin-inline: calc(50% - 50vw)`. That works because the Section
sits in Page's centered `max-w-content` container. **The Section's lg grid offsets
children by the 88px index column**, so the break-out must be computed against
the centered container, not the column. Either render the marquee outside the
grid div (a small `Section` prop, e.g. `bleed`), or compensate for the column.
`bleed` is the cleaner fix. `100vw` includes the scrollbar, so the root needs
`overflow-x: clip` (check `Page`/`body` first) to avoid a horizontal scrollbar.

Two rows stacked with `gap` of about one module (the folder flaps need air). Each
row has a small mono label at the container's left edge, aligned with the head:
`In production` / `Built along the way`, so the meaning of the two rows is
legible, not just felt.

Folder width is fixed per breakpoint (about 360px desktop, about 80vw phone) so
the focus zone math holds. **Two rows plus the section head should fit a 1080px
viewport.** If they don't, shrink the folder, not the type.

### 6.2 Loop

- Each row renders its list **N times** inside a `flex w-max` track and animates
  `translateX(0) → translateX(-100% / N)` linearly, infinitely. N = 2 normally; if
  one copy of the list is narrower than the viewport (row 1: 5 × 360 + gaps ≈
  2000px, fine at 1920 but check ultra-wide), the copies must still exceed
  viewport width + one folder, or a gap shows. Compute `N = max(2, ceil((viewport
  + folder) / listWidth) + 1)`. Static per breakpoint is fine; there is no need to
  measure on resize. Simplest: render row 1 three times, row 2 twice.
- Row 2 runs `animation-direction: reverse`.
- **Duration scales with item count** (`--marquee-duration: calc(var(--count) * 9s)`
  or similar), so both rows move at the same apparent speed, about 30 px/s.
  Tune by eye: "slow" is the brief.
- Every copy after the first is `aria-hidden="true"` and `inert`, so screen
  readers and Tab see each project exactly once.

### 6.3 Focus zone and edge fade

`mask-image` on each row's viewport: transparent at both edges, opaque across a
centered band `--focus-w` = 2 folders + 1 gap (1 folder on phones):

```
linear-gradient(to right, transparent 0, #000 calc(50% - var(--focus-w)/2),
                #000 calc(50% + var(--focus-w)/2), transparent 100%)
```

(`#000` inside a mask is an alpha value, not a colour. If the no-hex rule is read
strictly, `black` works identically.) Folders entering or leaving pass through
the fade, which is the brief's "entering such a zone".

### 6.4 Pause and interaction

- `.marquee-row:hover .marquee-track, .marquee-row:focus-within .marquee-track
  { animation-play-state: paused }`. Hovering anywhere on a row pauses that row
  only.
- Row viewport: `overflow-x: hidden` with enough `padding-block` that the lifted
  papers (-14px) and tipped flap's shadow are not clipped.
- **No hover (`@media (hover: none)`):** action buttons are always visible over
  the image's bottom edge, the image is not dimmed, the flap stays shut. The row
  keeps drifting; at about 30 px/s a tap lands. `:focus-within` pauses it once a
  link is focused.

### 6.5 Reduced motion

`@media (prefers-reduced-motion: reduce)`: no animation; copies after the first
are `display: none`; the row viewport becomes `overflow-x: auto` with
`scroll-snap-type: x mandatory`, each folder `scroll-snap-align: center`; the
mask stays (it still signals "more"); the flap does not tilt and the papers don't
move. Buttons follow the hover/no-hover rules above.

## 7. Tokens (`tokens.css`, documented in the existing exceptions comment)

- `--radius-folder: 22px`, `--radius-folder-inner: 14px`. Logo cards reuse
  `--radius-frame` (10px), buttons and chips reuse `--radius-pill`.
- `--shadow-folder`, `--shadow-folder-open` (mockup values, cast in void like
  `--shadow-soft`).
- Folder back-flap tint: `color-mix(in oklab, var(--color-violet) 35%, var(--color-bone))`
  in `theme.css` as a semantic `--folder-back`. **No new hex.** Tab text uses
  `--accent-text`.
- Logo card fill: a `--color-paper` white pigment in `tokens.css`. `theme.css`
  already writes `#ffffff` raw for the plate ground; point that at the new token
  while there.
- New `--color-brand-*` for each added mark.

## 8. HomePage changes

- Replace the grid with `<ProjectMarquee live={featuredProjects} built={otherProjects} />`.
  Export `otherProjects` (`!featured`) from `content/projects.ts` beside
  `featuredProjects`.
- Rewrite the long section comment above `id="projects"` to describe the folders,
  the two rows and their meaning, and cite this spec's §3 departures.
- Lede stays ("Five running in production — …"), since it now describes row 1.

## 9. Left to the builder

- Exact folder widths per breakpoint and the speed constant, within the
  1080px-fit and about-30-px/s targets.
- Whether `bleed` is a `Section` prop or a compensated margin (§6.1). `bleed`
  is preferred.
- Exact copy counts per row (§6.2), as long as no gap appears at 2560px wide.
- Simple Icons version to copy paths from.

## 10. Calls made during the write-up (not discussed with the user)

- Row labels `In production` / `Built along the way`.
- Tab shows status (Live / Source only / Private build); title stays below the image.
- No-hover devices: buttons always visible, row keeps drifting.
- Projects with no highlights simply have no chip row.
- GitHub folder at the end of row 2, whole folder is the link.
- `ProjectCard.tsx` deleted; `StackComb` migrated to `StackMark`.

## 11. Revision — 2026-11-19, after first build

Requested by the user after seeing the build; supersedes §1–§8 where they differ.

- **One row only.** The "Built along the way" row, the row labels, `otherProjects`,
  the GitHub folder and the logos only that row used are removed.
- **GitHub exit is a still button** ("More on GitHub ↗", pill, ghost) centred
  under the moving row.
- **Fixed floor.** The section drops its bottom padding and its full-screen
  stack min-height (`.stack > .stack-fit`); the button's wrapper ends 160px
  below it, so the next sheet lands 160px under the button (raised from 40px, then 80px).
- **Phones (< 40rem) don't slide.** No animation, no fade: folders stack
  vertically, one full-width folder at a time, inside the page gutter. The
  reduced-motion snap strip now applies only at 40rem and up.
