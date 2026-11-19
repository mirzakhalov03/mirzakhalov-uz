# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A content-managed portfolio (mirzakhalov.uz) rebuilt as an npm-workspaces monorepo.
The governing idea: publishing a project, note, résumé or certificate is a form
submission, not a commit.

Two long-form specs are the source of authority and are referenced by section
number throughout the code (`Technical PRD §4.3`, `design doc §3.4`):

- `technicalprd.md` — architecture, data model, security posture
- `proposeddesign.md` — the visual system

When a code comment cites a `§`, that section is the reason the code looks that
way. Read it before changing the behaviour it describes.

## Commands

```bash
npm install                  # root only — workspaces are hoisted

npm run dev                  # api + web concurrently
npm run dev:api              # tsx watch → http://localhost:4000
npm run dev:web              # vite      → http://localhost:5173 (strictPort)

npm run typecheck            # all three workspaces
npm run build                # api (tsup) then web (tsc + vite build)
```

API-only (run from root with `-w @portfolio/api`, or inside `apps/api`):

```bash
npm test -w @portfolio/api                    # vitest run
npm run test:watch -w @portfolio/api
npm run test:coverage -w @portfolio/api

npx vitest run src/__tests__/post-public.test.ts          # single file
npx vitest run -t "returns 404 for a draft"               # single test by name

npm run seed:admin -w @portfolio/api          # needs ADMIN_EMAIL + ADMIN_PASSWORD in .env
npm run seed:posts -w @portfolio/api
```

`npm run lint` exists at the root but resolves to nothing — there is no ESLint
config in this repo. Formatting is Prettier (`.prettierrc.json`: single quotes,
100 cols, trailing commas) applied by editor, not by a script. **`npm run typecheck`
is the real gate** — `tsconfig.base.json` runs `strict` plus `noUncheckedIndexedAccess`,
`noUnusedLocals` and `noUnusedParameters`, so unused imports fail the build.

Node 22+ required (`.nvmrc`). Tests only exist for the API; the web app has none
and none are wanted.

## Environment

Copy both examples before first run:

```bash
cp apps/api/.env.example apps/api/.env    # fill JWT_SECRET (openssl rand -base64 48) and MONGODB_URI
cp apps/web/.env.example apps/web/.env
```

`apps/api/src/config/env.ts` parses `process.env` through Zod at module load and
calls `process.exit(1)` on failure. Adding a variable means adding it there —
reading `process.env` directly anywhere else defeats the boot-time guarantee.
In production it additionally refuses to start if `PUBLIC_SITE_URL` is localhost,
because that value is baked into every Atom feed `<id>`.

## Architecture

```
apps/web/          React 19 · Vite 6 · React Router 7 · TanStack Query · Tailwind v4
apps/api/          Node 22 · Express 5 · Mongoose 8
packages/shared/   Zod schemas — the contract between the two
```

### `packages/shared` is the point of the monorepo

Each domain file (`post.ts`, `asset.ts`, `auth.ts`, …) defines the input schema,
the query schema, and the response schemas for one resource. The Express
validator middleware and the React client are both typed from the same
declaration, so a shape cannot drift between them.

It ships **raw TypeScript** (`"exports": "./src/index.ts"`, no build step). Two
consequences that are easy to break:

- `apps/api/tsup.config.ts` sets `noExternal: ['@portfolio/shared']` so it gets
  bundled rather than resolved at runtime.
- Adding a new domain means a new file plus a re-export in `packages/shared/src/index.ts`.

Conventions inside it: `objectId`, `slug`, `publishStatus`, `locale`,
`bilingual(max)`, `listResponse(item)`, `paginationQuery` and `apiError` live in
`common.ts` and should be composed, not re-declared.

**Create vs. patch schemas.** Never derive a PATCH schema with `.partial()` on
an input schema that has `.default()` calls — Zod's `.partial()` does not
suppress defaults, so a partial update silently re-injects them and wipes fields
the caller never sent. The established pattern (`post.ts`) is a bare `postFields`
object, with defaults layered on only in the create schema.

### API request pipeline

```
route → rate limiter? → requireAdmin? → validate(schema, source) → asyncHandler(controller)
                                                                        → service → model
```

Layers are strict: **controllers do no business logic and services touch no
`req`/`res`.** Serialisation to wire types (`toPostSummary`, `toAdminPost`,
`toAssetWire`) lives in the service.

- **`validate()` is the only validation.** No ad-hoc `if (!req.body.title)` anywhere.
  It replaces `req.body`/`req.params` with the parsed value.
- **Query params are the exception.** Express 5 exposes `req.query` as a getter,
  so `validate(schema, 'query')` stashes the result and controllers must read it
  with `validatedQuery<T>(req)` — never `req.query`.
- **`ApiError` is the only error thrown**, and `errorHandler` is the only place a
  response body is formatted. Everything reaches the client as
  `{ error: { code, message, fields? } }`. `fields` maps an input name to its
  message so forms render errors at source.
- **`asyncHandler` wraps async controllers** so rejections reach the error
  middleware. The auth controllers predate it and call `next(err)` by hand;
  new async routes should use `asyncHandler`.

### Mongo invariants

`config/db.ts` sets `sanitizeFilter: true` globally. This rewrites any nested
`{ $op: value }` in a filter into `{ $eq: { $op: value } }` unless that specific
object is wrapped in `mongoose.trusted()`.

> **If you write a query filter containing a `$` operator, it must be wrapped in
> `mongoose.trusted()` per nested object — or it will silently stop matching, or
> throw a CastError.** Marking only the outer filter is not enough; the check
> runs per nested value. See `utils/cursor.ts` and `utils/publish-filter.ts`,
> which already do this once so callers inherit safe filters.

- **`publishFilter()` is the single definition of "publicly visible"** —
  `status: 'published'` plus `publishedAt: { $lte: now }` (which is what makes
  scheduled publishing work). Every public read path composes it, including
  prev/next neighbours, tag counts, search and the feed, so a draft cannot leak
  sideways through a neighbour link. Do not hand-roll a status check.
- **Pagination is keyset, on `(sortKey, _id)` both descending.** Query for
  `limit + 1`, then `toPage(rows, limit, row => row.date)`. The cursor carries
  both keys because paginating on a timestamp alone skips or repeats rows when
  two documents share a second. Cursors are opaque base64url.
- **Derived fields are computed in a `pre('validate')` hook**, never accepted from
  a client. On `Post`: `bodyHtml`, `toc` and `readingMinutes` all come from one
  `renderMarkdown()` call.
- **Models must register idempotently:**
  `mongoose.models['X'] ?? mongoose.model<IX>('X', schema)`. Vitest runs every
  test file in one forked process against a shared Mongoose registry, so a bare
  `mongoose.model()` throws `OverwriteModelError` on the second import.

### Seams worth preserving

- **`services/storage/`** — `StorageAdapter` (`save`/`remove`/`resolve`) hides where
  bytes live. `services/storage/index.ts` picks the implementation; moving to
  S3/R2 is one new adapter and one changed line. This is why `upload.middleware.ts`
  uses multer's `memoryStorage` — letting multer write to disk would bypass the seam.
- **`services/references.ts`** — the registry of which models may point at an asset.
  `DELETE /admin/assets/:id` walks it and 409s naming what still uses the file.
  When a new model gains an asset field, append one line here.
- **`services/markdown.service.ts`** — markdown is rendered and sanitised at **write**
  time, so stored `bodyHtml` is a guarantee rather than a per-request hope.
  `html: false` + markdown-it's `validateLink` + DOMPurify, in that order.

### Route ordering gotcha

Express matches in declaration order. Every literal path under a collection must
be registered before its `:param` route — `/posts/tags` and `/posts/feed.xml`
come before `/posts/:slug`, or they 404 as "post not found".

### Web app

- **`lib/api.ts` is the only place a `fetch` happens.** Every failure becomes an
  `ApiRequestError` carrying `status`, `code` and `fields`. `auth: true` opts a
  request into sending the admin cookie; public reads stay credential-free so
  they remain cacheable.
- **`/#about` is a scroll-spy, not a tab widget.** Three chapters stacked down
  one column with a rail beside them that follows the reader. The interaction is
  ported from uyqulab.uz's section nav (`mirzakhalov03/uyqulab-uz`,
  `components/home/SectionNav.tsx` + `hooks/useScrollSpy.ts`); keep them in mind
  when changing this.
  - **Nothing intercepts the scroll, and that is the whole design.** No wheel
    listener, no `preventDefault`, no pinned panel, no parked page, no
    `overscroll-behavior` lock. The chapters are three blocks in the flow and
    the browser scrolls them. This replaced a one-chapter-at-a-time widget that
    made the section its own scroll surface, where every frame was a negotiation
    between the reader's gesture and the component — momentum, rubber-banding,
    keyboard paging and find-in-page all cost something there and are free here.
    **If a change starts by adding a scroll or wheel listener to this section,
    it is reintroducing the thing that was removed.**
  - `useScrollSpy` is an `IntersectionObserver` with `rootMargin:
    '-30% 0px -60% 0px'` — a band 30–40% down the viewport, so a chapter goes
    current as its top reaches the upper third. It keeps a visible *set* and
    takes the first in document order; acting on each `isIntersecting` as it
    arrives makes the answer depend on batch order and flickers at boundaries.
    When nothing is in the band the last answer stands, so the rail is never
    blank.
  - **The rail is links, not tabs.** `role="tab"` was correct only while one
    chapter was mounted and the others really were hidden. They are all in the
    DOM now, so `<a href="#…">` with `aria-current` is the honest markup — it
    works unhydrated, opens in a new tab, and needs no roving tabindex.
  - Clicking uses **`scrollToFlow`, never `scrollIntoView`** — the panel is
    sticky and `scrollIntoView` concludes a pinned target is already in view and
    does nothing (`scroll-to-flow.ts`). The offset is `clearance(nav) - the
    chapter's own padding-top`: measured chrome, minus the box's air, so the
    accent bar lands a module under the furniture instead of a third of a screen
    below it. `scroll-margin-top` on the chapter is the fallback for the
    browser's *native* anchor jump, which is the only thing that honours it.
  - **`Reveal` is the one place content animates because it scrolled into
    view**, which §2 principle 4 otherwise forbids. One-shot — the observer
    disconnects on fire, so scrolling back finds the section as it was left.
    `will-change` is set on the pending state only and released by `.is-shown`;
    left on permanently every revealed block keeps a compositor layer for the
    life of the page.
  - **Two named radii and two shadows exist for this rail and nothing else**
    (`--radius-pill`, `--radius-chip`, `--shadow-soft`, `--shadow-glow`), a
    deliberate override of §3.4's "radius 0, no exceptions" and "separation from
    the border, never elevation". `--radius-*: initial` still deletes Tailwind's
    default radius scale, so only these two are generated and a third has to be
    added on purpose.
  - Selected state is `background: var(--accent-text); color: var(--surface)`.
    `--accent-text` is by definition this ground's accent at text contrast
    against `--surface`, so inverting the pair is contrast-correct on bone and
    void alike. `--accent` as a fill lands at 4.1:1 and is not. The icon chip on
    a selected pill *darkens* (`color-mix` with `--surface`) rather than
    lightening as the reference does, because here the fill is the light half of
    the pair.
  - Below `lg` the rail is a horizontal strip that overflows a phone. The active
    pill is scrolled into view by `scrollLeft` on the strip — never
    `scrollIntoView`, which would move the page too — guarded on the strip
    actually overflowing, which is what makes one effect correct at both widths
    without a media query. A mask fades its right edge, because a pill cut dead
    at the viewport edge reads as a clipping bug rather than as "there is more".
  - Info boxes inside the band are `<Plate surface="bone">`. On void,
    `--surface-raised` is one step off the ground — it separates, but it does
    not make anything readable.
- **`Section` takes `stickyHead`** (About is the only user). It pins the title
  and its index under the top bar and publishes `--section-head-h`, which
  `.about-nav` adds to its own sticky offset so the tab bar lands under the
  title instead of behind it. That figure is **computed, not measured**
  (`calc(var(--text-h2) * 1.02 + var(--spacing) * 3)`) so nothing has to read
  layout on a scroll frame — which is why the prop only suits a head that stays
  one line: give a `stickyHead` section a lede, or an aside that wraps, and the
  number silently stops being true. `AboutNav.clearance()` takes the real
  `offsetHeight` instead, because it runs once per click and can afford to.
- **`/admin/*` is `React.lazy`-loaded** in `routes/router.tsx` so the admin bundle
  never reaches a public visitor.
- **Relative imports carry a `.js` extension**, including from `.tsx` files
  (`'../pages/HomePage.js'`). `verbatimModuleSyntax` + bundler resolution. Match it.
- `@/*` is aliased to `apps/web/src/*` in both `vite.config.ts` and `tsconfig.json`.

### The design system (`apps/web/src/styles/`)

Three layers, and the separation is load-bearing:

| File | Role |
|---|---|
| `tokens.css` | Raw pigments and scales, in `@theme`. **No hex value may exist anywhere else in the codebase.** |
| `theme.css` | Which pigment plays which semantic role (`--surface`, `--fg`, `--line`, `--accent-text`) |
| `substrate.css` | The parts Tailwind is the wrong tool for: the 32px construction grid, registration marks, variable-width type treatments, motion timelines |

There is no dark-mode toggle. A section declares its own ground with
`data-surface="bone | void | plate"`; custom properties inherit, so every child
re-points itself automatically and components never need to know which ground
they landed on.

`--spacing` is redefined to `8px`, so Tailwind's numeric scale *is* the design's
8px module: `p-1` = 8px, `p-4` = 32px, `p-8` = 64px. Don't reach for arbitrary
values where a step exists.

`primitives/` holds the five structural components — `Page`, `Section`, `Plate`,
`Data`, `Prose`. **`Plate` is the base container for everything**: 1px border,
flat fill, registration marks, radius 0, no shadow — separation comes from the
border, never from elevation. `components/ui/` holds leaf controls;
`components/content/` holds page-specific composites.

### Tests

Vitest + supertest + `mongodb-memory-server`, single forked process, sequential,
30s timeouts. Test files set `process.env` at the top **before** dynamically
`import()`ing `app.ts` and the models — a static import would evaluate
`config/env.ts` first and exit the process. Copy the `beforeAll` shape from
`src/__tests__/post-public.test.ts` when adding a suite.

## Milestone state

Work is organised M0–M7 (`README.md`). Landed so far: workspaces and boot (M0),
auth (M1), assets pulled forward from M2, and the blog end-to-end (M5 — public
reads, admin CRUD, Atom feed, seeding). Projects, profile, contact and hardening
are not built. **The status table in `README.md` is stale** — it still reads
"M0 complete"; `apps/api/src/routes/index.ts` is the accurate map of what is wired.

Public web routes for `/writing` and `/laugh` are deliberate `PendingPage`
placeholders, not bugs.

## Before shipping

The Telegram bot token in `old-html-version/js/app.js` is public and in git
history. It must be revoked via BotFather and reissued into the API's env — it
must never reach the client (PRD §11.1). `old-html-version/` is the previous
static site, kept for reference only; nothing there is live.
