# Home Projects — Folder Marquee Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home Projects grid with two full-width, opposite-drifting rows of folder-shaped project cards.

**Architecture:** A project-agnostic `Folder` shell (back flap, tab, tucked logo cards, front panel, CSS hover choreography) is filled by `ProjectFolder` and by an empty GitHub folder. `ProjectMarquee` renders two rows as CSS-keyframe loops on repeated tracks, with a `mask-image` focus band, and breaks out of the page container through a new `Section` `bleed` prop. A shared `StackMark` renders brand glyphs, via an alias map, for both the folders and the About `StackComb`.

**Tech Stack:** React 19, Tailwind v4 (tokens in `@theme`), plain CSS in `substrate.css`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-19-projects-folders-design.md`

## Global Constraints

- **No tests in `apps/web`.** None exist and none are wanted. Every task's gate is `npm run typecheck` (from repo root) plus the visual check named in the task, against `npm run dev:web` at http://localhost:5173.
- **No hex value outside `apps/web/src/styles/tokens.css`.** Colours are tokens; tints are `color-mix()` of tokens.
- **Relative imports carry `.js`**, including from `.tsx` (`'./Folder.js'`).
- **Spacing:** `--spacing` is 8px; use Tailwind steps (`p-2` = 16px), not arbitrary values where a step exists.
- **Radii exist only as named tokens.** `--radius-*: initial` stays; new ones go in front of the existing exceptions comment in `tokens.css`, and that comment is updated to list them.
- **Motion timings (from the approved mockup):** easing `cubic-bezier(.2,.8,.2,1)`; flap `rotateX(-10deg)` over 450ms, `transform-origin: bottom`, parent `perspective: 1000px`; papers `translateY(-14px)`; actions slide from `translateY(100%)` with a 50ms delay; image `brightness(.5)` on open.
- **Every `prefers-reduced-motion: reduce` path:** no animation, no tilt, no paper movement.
- **Commits:** the working tree has unrelated uncommitted edits in `HomePage.tsx`, `substrate.css` and others. **Do not commit unless the user asks.** If they do, stage only the files a task lists and check `git diff --cached` for foreign hunks first.

## Review Focus

1. **Keyboard Tab through the rows:** each project is reached exactly once (copies are `inert`), focusing a link pauses its row, and the focused folder opens as on hover. Checked in Task 5, step 6.
2. **Ultra-wide (2560px) and phone (375px) widths:** no visible gap at the loop seam, no horizontal page scrollbar, focus band about 2 folders and about 1 folder respectively. Checked in Task 5, step 6.
3. **Touch device (`hover: none`):** buttons visible without hover, image not dimmed, flap shut. Checked in Task 4, step 4 (DevTools touch emulation).
4. **Reduced motion:** rows become snap-scrolling strips with one copy each; flap and papers static. Checked in Task 5, step 6.
5. **Clipping:** lifted papers and the open flap's shadow are not cut off by the row's `overflow`. Checked in Task 5, step 6.

---

### Task 1: Design tokens for the folder

**Files:**
- Modify: `apps/web/src/styles/tokens.css` (structure block, about lines 118–142; brand block, about lines 50–58)
- Modify: `apps/web/src/styles/theme.css` (bone and void sets, plus `[data-surface='white']`, about line 106)

**Interfaces:**
- Produces (CSS custom properties, used by Tasks 2–5): `--radius-folder: 22px`, `--radius-folder-inner: 14px` (Tailwind generates `rounded-folder`, `rounded-folder-inner`); `--shadow-folder: 0 10px 30px -14px rgb(12 10 20 / .35)`; `--shadow-folder-open: 0 22px 40px -18px rgb(12 10 20 / .45)`; `--color-paper: #ffffff`; `--folder-back` (semantic, theme.css) = `color-mix(in oklab, var(--color-violet) 35%, var(--color-bone))`; brand colours `--color-brand-postgresql #4169e1`, `-awslambda #ff9900`, `-reactquery #ff4154`, `-antdesign #0170fe`, `-sqlite #003b57`, `-docker #2496ed`, `-redux #764abc`, `-i18next #26a69a`, `-html5 #e34f26`, `-css #663399`, `-spotify #1ed760`.

- [ ] **Step 1:** Add the two radii and two shadows to `tokens.css` beside the existing ones. Rewrite the exceptions comment so it names the folder (and cites spec §3) alongside the rail and the frame.
- [ ] **Step 2:** Add `--color-paper` and the brand colours above. Point `[data-surface='white']`'s raw `#ffffff` values in `theme.css` at `var(--color-paper)`.
- [ ] **Step 3:** Define `--folder-back` in `theme.css` at the root/bone set, so every ground inherits it. The folder always sits on the bone sheet; one definition is enough.
- [ ] **Step 4:** Run `npm run typecheck` and `npm run build -w @portfolio/web` from the repo root. Expected: both succeed. Then `grep -rnE "#[0-9a-fA-F]{3,6}\b" apps/web/src --include=*.css | grep -v tokens.css`. Expected: no `#ffffff` lines from `theme.css`'s white set (other pre-existing theme.css hexes such as `#4a4640` are out of scope; don't touch them), and no hex added by this task.

---

### Task 2: `StackMark` and the extended icon set

**Files:**
- Modify: `apps/web/src/components/content/stack-icons.ts`
- Create: `apps/web/src/components/ui/StackMark.tsx`
- Modify: `apps/web/src/components/content/StackComb.tsx:33-52`

**Interfaces:**
- Consumes: Task 1 brand colour tokens.
- Produces:
  - `export const stackAliases: Record<string, string>` in `stack-icons.ts`
  - `export function resolveStackIcon(name: string): { d: string; color: string } | undefined` in `stack-icons.ts`: `stackIcons[stackAliases[name] ?? name]`.
  - `export function StackMark({ name, className, initialClassName }: { name: string; className?: string; initialClassName?: string }): JSX.Element` in `components/ui/StackMark.tsx`. Renders `<svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className}><path d fill={color}/></svg>` when resolved, else `<span aria-hidden className={initialClassName ?? className}>{name.slice(0, 2)}</span>`. Decorative: the caller provides the accessible name.

- [ ] **Step 1:** Add marks to `stackIcons`, copying the single `d` of each 24×24 path from Simple Icons (CC0), with keys and colours: `PostgreSQL` (`postgresql`), `AWS Lambda` (`awslambda`), `React Query` (`reactquery`), `Ant Design` (`antdesign`), `SQLite` (`sqlite`), `Docker` (`docker`), `Drizzle` (`drizzle`, `currentColor`), `Redux` (`redux`), `i18next` (`i18next`), `HTML5` (`html5`), `CSS` (`css`), `Spotify` (`spotify`). Fetch with `curl -s https://unpkg.com/simple-icons@13.21.0/icons/<slug>.svg`. Note in the file's doc comment that it now serves the folders too.
- [ ] **Step 2:** Add `stackAliases` exactly: `'React 19': 'React'`, `Postgres: 'PostgreSQL'`, `'Claude Agent SDK': 'Claude'`, `'TanStack Query': 'React Query'`, `'Redux Toolkit': 'Redux'`, `'RTK Query': 'Redux'`, `SCSS: 'Scss'`, `HTML: 'HTML5'`, `'Spotify API': 'Spotify'`. Add `resolveStackIcon`.
- [ ] **Step 3:** Create `StackMark` per the interface.
- [ ] **Step 4:** In `StackComb`, replace the glyph/initial ternary with `<StackMark name={item.name} className="comb__glyph" initialClassName="comb__glyph comb__initial" />`. Remove the now-unused `stackIcons` import.
- [ ] **Step 5:** Run `npm run typecheck`. Expected: PASS (an unused import would fail it). Open `/#about` and check that the stack comb looks identical to before: same glyphs, same initials cell for Antigravity.

---

### Task 3: `Folder` shell and its choreography

**Files:**
- Create: `apps/web/src/components/content/Folder.tsx`
- Modify: `apps/web/src/styles/substrate.css` (append a new `Folder` block at the end, with a header comment citing spec §3 and §5.1)

**Interfaces:**
- Consumes: Task 1 tokens; `Polymorphic` from `primitives/polymorphic.ts`.
- Produces: `export function Folder<T extends ElementType = 'article'>(props: Polymorphic<T, { tab: ReactNode; papers?: ReactNode; className?: string; children: ReactNode }>)`. DOM classes later tasks rely on: `.folder` (root, `group`), `.folder__back`, `.folder__tab`, `.folder__papers`, `.folder__paper` (one per child the caller wraps; ProjectFolder renders `<span className="folder__paper">…</span>`), `.folder__front`. Also these, styled here but rendered by Task 4: `.folder__cover` (image box), `.folder__actions` (overlay), `.folder__cover img`.

- [ ] **Step 1:** Create `Folder`. Back and tab are `aria-hidden` decoration; `tab` content is still visible text. Papers container is `aria-hidden` (stack is listed for sighted readers only; ProjectFolder adds an `sr-only` stack list).
- [ ] **Step 2:** Write the `.folder*` CSS. Geometry from the mockup: root `padding-top: 34px; perspective: 1000px`; back `top: 16px`, `--folder-back`, `--radius-folder`; tab `height: 34px; width: 44%`, top corners `18px`, mono uppercase 11px, `--accent-text`; papers `top: 0; right: 22px; gap: 6px; z-index: 1`; paper `40×46px`, `--color-paper`, 1px `--line`, `--radius-frame`, glyph 22px; rest rotations `-7°, 3°+5px, -2°+1px, 6°+4px, -4°+2px` by `nth-child`; front `z-index: 2`, `--surface-raised`, `--radius-folder`, `--shadow-folder`, padding `--spacing * 2.25`; cover `--radius-folder-inner`, `overflow: hidden`.
- [ ] **Step 3:** Open state on `.folder:hover` **and** `.folder:focus-within`, inside `@media (hover: hover) and (prefers-reduced-motion: no-preference)` for the motion parts: flap tilt and `--shadow-folder-open`, papers lift, first/last paper fan (`-12deg translateX(-4px)` / `9deg translateX(4px)`), cover image `brightness(.5)`, `.folder__actions` to `transform: none; opacity: 1`. Under `(hover: none)`: `.folder__actions` always shown, no dim. Under `(hover: hover)` with reduced motion: actions appear without sliding (opacity only, no transition), no tilt.
- [ ] **Step 4:** Run `npm run typecheck`. Expected: PASS. (Visual check happens in Task 4, once something renders a folder.)

---

### Task 4: `ProjectFolder` and the GitHub folder

**Files:**
- Create: `apps/web/src/components/content/ProjectFolder.tsx`
- Delete: `apps/web/src/components/content/ProjectCard.tsx`
- Modify: `apps/web/src/components/content/MoreOnGitHub.tsx` (rewrite body and doc comment)
- Modify: `apps/web/src/content/types.ts:20` (comment says "ProjectCard"; make it "ProjectFolder")
- Modify: `apps/web/src/pages/HomePage.tsx:11,123-126` (temporary: swap `ProjectCard` for `ProjectFolder` in the existing grid so this task is viewable; Task 5 replaces the grid)

**Interfaces:**
- Consumes: `Folder` (Task 3), `StackMark` (Task 2), `Button`, `Chip`, `Data`, `Project`.
- Produces: `export function ProjectFolder({ project }: { project: Project })`; `export function MoreOnGitHub()` (unchanged signature, now a `Folder as="a"`).

- [ ] **Step 1:** Build `ProjectFolder` per spec §5.2:
  - Tab: `<Data tone="live">● Live</Data>` if `tags.includes('live')`, else `Source only` if only `source`, else `Private build`.
  - Papers: first 5 of `project.stack` as `.folder__paper` > `StackMark`, plus `<ul className="sr-only">` of the full stack.
  - Cover in `.folder__cover`, aspect 16/10, keeps `viewTransitionName: cover-${slug}`, wrapped in the hidden primary link as `ProjectCard` did. `.folder__actions` overlay: `Visit site ↗` (`Button size="sm"`, solid) when `demo`, `Source ↗` (ghost, given a `--surface-raised` fill so it reads over the dimmed image) when `source`. Both `rounded-pill`. No overlay when there are no links.
  - Title row: `<h3 className="t-h2 …">` in `--font-display` (spec: the mockup's 30px; `--text-h2` clamps 28–44px, which is the nearest token), year `<Data tone="muted">` baseline-right.
  - Line `tagline?.en ?? summary.en`, `line-clamp-2 text-caption text-fg-muted`.
  - Highlights as `Chip`s with `rounded-pill`; `feature` kind uses the accent fill. Omit the list when empty.
- [ ] **Step 2:** Rewrite `MoreOnGitHub` as `<Folder as="a" href={github.url} target="_blank" rel="noopener noreferrer" tab="GitHub" papers={…one paper with the socialIcons.GitHub glyph…}>`. Front: no cover; the handle (`Data`), then "Everything else I've pushed →" in `t-h3`. Give the front a min-height equal to a project folder's cover + title so it sits level in the row. Keep the `socials` lookup and `return null` guard.
- [ ] **Step 3:** Delete `ProjectCard.tsx`; update the `types.ts` comment; swap the grid in `HomePage.tsx` to `ProjectFolder`.
- [ ] **Step 4:** Run `npm run typecheck`. Expected: PASS. Visual, at `/#projects`: folders match the approved mockup's shorten.uz folder; hover tips the flap, lifts and fans the papers, slides up the buttons; NemoAI shows "Private build" and no overlay; DevTools device toolbar (touch) shows buttons without hover; DevTools rendering "prefers-reduced-motion: reduce" shows no tilt.

---

### Task 5: `ProjectMarquee`, `Section` bleed, and HomePage wiring

**Files:**
- Create: `apps/web/src/components/content/ProjectMarquee.tsx`
- Modify: `apps/web/src/primitives/Section.tsx` (add `bleed` prop)
- Modify: `apps/web/src/content/projects.ts:363` (add `otherProjects`)
- Modify: `apps/web/src/pages/HomePage.tsx:92-128` (section comment + children)
- Modify: `apps/web/src/styles/substrate.css` (append a `Marquee` block)

**Interfaces:**
- Consumes: `ProjectFolder`, `MoreOnGitHub` (Task 4).
- Produces:
  - `Section` prop `bleed?: ReactNode`: rendered after the grid div, still inside `<section>`, inside a `<div className="section-bleed">` that is `position: relative; left: 50%; width: 100vw; translate: -50% 0;` (same technique and comment as `.band::before`; `html` already has `overflow-x: clip`).
  - `export const otherProjects = projects.filter((p) => !p.featured);`
  - `export function ProjectMarquee({ live, built }: { live: Project[]; built: Project[] })`
  - Internal `MarqueeRow({ label, direction, copies, children })` with `direction: 'left' | 'right'`, `copies: number`.

- [ ] **Step 1:** Add `bleed` to `Section` and document it in the props comment: for content that must span the viewport; head and lede stay on the grid.
- [ ] **Step 2:** Add `otherProjects`.
- [ ] **Step 3:** Build `ProjectMarquee`: row 1 `label="In production"`, `direction="left"`, `copies={3}`, items `live`; row 2 `label="Built along the way"`, `direction="right"`, `copies={2}`, items `built` then `<MoreOnGitHub />`. `MarqueeRow` renders a `<Data>` label aligned to the content container's left edge (`max-w-content mx-auto` with Page's paddings), then a viewport `.marquee` > track `.marquee__track` (`flex w-max`, `style={{ '--count': n, '--copies': copies }}`) containing `copies` groups. Groups at index ≥ 1 get `aria-hidden="true"` and `inert` plus class `marquee__copy`. Folder items are a fixed `.marquee__item` width.
- [ ] **Step 4:** Write the `.marquee*` CSS:
  - Item width `min(80vw, 360px)`; `--gap: calc(var(--spacing) * 4)`; `--focus-w`: `calc(2 * 360px + var(--gap))` at `lg`, `min(80vw, 360px)` below.
  - Viewport: `overflow-x: hidden; padding-block: calc(var(--spacing) * 3)` (room for the -14px papers and the open shadow); `mask-image: linear-gradient(to right, transparent 0, black calc(50% - var(--focus-w) / 2), black calc(50% + var(--focus-w) / 2), transparent 100%)`.
  - Under `prefers-reduced-motion: no-preference`: `@keyframes marquee { to { transform: translateX(calc(-100% / var(--copies))); } }`; track `animation: marquee calc(var(--count) * 12s) linear infinite`; `[data-direction='right']` uses `animation-direction: reverse`; `.marquee:hover .marquee__track, .marquee:focus-within .marquee__track { animation-play-state: paused; }`. Tune the `12s` by eye toward about 30px/s.
  - Each copy group must end with the same trailing gap it starts with (`padding-right: var(--gap)` on the group, gap inside), or the seam jumps by one gap.
  - Under `prefers-reduced-motion: reduce`: `.marquee__copy { display: none }`; viewport `overflow-x: auto; scroll-snap-type: x mandatory`; items `scroll-snap-align: center`; mask kept.
- [ ] **Step 5:** In `HomePage.tsx`: remove the grid and the `ProjectFolder`/`MoreOnGitHub` imports; pass `bleed={<ProjectMarquee live={featuredProjects} built={otherProjects} />}` and no children (make `children` optional in `Section`, or pass `null`, whichever keeps the type honest). Rewrite the comment block above the section: folders, two rows and what each means, hover pauses, and that spec §3 lists the deliberate departures from principles 4 and 6.
- [ ] **Step 6:** Run `npm run typecheck` and `npm run build`. Expected: both PASS. Visual, at `/#projects`, check each Review Focus item:
  - 1440px: two rows drift in opposite directions at the same speed, the focus band is about 2 folders, and edges fade.
  - Hovering a folder pauses only that row and opens the folder; papers and shadow are not clipped.
  - Tab: each project is focused once, the row pauses, and the folder opens.
  - 2560px: no gap at the seam, and no copy inside the clear band.
  - 375px: band about 1 folder, no horizontal page scrollbar.
  - Reduced motion: static snap strips, one copy each.
  - The two rows plus the section head fit a 1080px-tall viewport; if not, lower the item width, not the type.
- [ ] **Step 7:** Confirm `ProjectCard` has no remaining references: `grep -rn "ProjectCard" apps/web/src`. Expected: no output.

---

### Task 6: Hand-off

- [ ] **Step 1:** Run `npm run typecheck` and `npm run build` from the root once more. Expected: PASS.
- [ ] **Step 2:** Report to the user what changed and what was checked visually, and ask whether to commit. If yes, stage only this plan's files (Tasks 1–5 lists, plus the spec and this plan) after checking `git diff --cached` for unrelated hunks in `HomePage.tsx`, `substrate.css`, `tokens.css` and `theme.css`.
