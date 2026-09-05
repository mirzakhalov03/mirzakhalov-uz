# Blog Backend — Design

**Date:** 2026-09-05
**Milestone:** M5 (Blog), with a scoped slice of M2 (Assets) pulled forward
**Scope:** Backend only. Fully functional, and wire-ready for the frontend to consume.
**Companion documents:** `technicalprd.md` (§3.3, §4, §5.2, §7, §11), `proposeddesign.md`

---

## 1. Goal

Ship the posts subsystem end to end on the server, so the React app can build
`/writing` and `/writing/:slug` against a stable, typed contract without any
further backend work.

**Done means all of these are true:**

- An admin can create, edit, publish, unpublish, schedule, and delete a post.
- A post can carry a cover image that the admin uploaded through the API.
- Public endpoints never return a draft, and never return a post whose
  publication date is still in the future.
- Every response validates against a Zod schema in `packages/shared`, and a test
  proves it.
- Markdown is rendered and sanitised on the server; the client injects HTML it
  did not have to trust.
- The blog is reachable by feed readers as well as by browsers.

**Non-goals:** comments, view counts, multi-author, WYSIWYG editing, image
derivatives (`sharp` remains PRD §7 Phase 2), SSR/prerendering, any frontend
work.

---

## 2. Context

M0 (skeleton) and M1 (auth) are built. Everything M5 needs from them exists:

| Already present | Location |
|---|---|
| Error envelope + single exit point | `utils/api-error.ts`, `middlewares/error.middleware.ts` |
| Zod body/query validation middleware | `middlewares/validate.middleware.ts` |
| Admin cookie guard | `middlewares/auth.middleware.ts` |
| Rate limiters incl. `uploadLimiter` | `middlewares/rate-limit.middleware.ts` |
| Storage seam (disk implementation) | `services/storage/` |
| Post **input** schemas | `packages/shared/src/post.ts` |
| Asset **response** schema, MIME allow-list, size caps | `packages/shared/src/asset.ts` |

Two gaps block the blog:

1. **No asset pipeline.** `StorageAdapter` is defined and implemented but has no
   caller — no model, no upload route. `posts.cover` is typed `ObjectId → assets`,
   so without this a post cannot have a cover image.
2. **No post response schemas.** `post.ts` defines what the admin may *write*,
   not what the API *returns*. The frontend derives its types from this package,
   so the contract does not yet exist.

This is also the first content vertical in the codebase. Projects, documents and
profile will copy its shape, which is why §3 constrains what gets generalised.

---

## 3. Architectural Approach

**Chosen: a concrete posts vertical plus three named shared helpers.**

Posts get their own model, service, controllers and routes. Exactly three pieces
are extracted immediately, each for a stated reason:

| Helper | Why now, not later |
|---|---|
| `publishFilter()` | PRD §4.1 requires it: "enforce in a shared query helper, not per-route". Security-relevant — per-route reimplementation is how a draft eventually leaks. |
| `paginate()` | Correct cursor tie-breaking is subtle enough to be worth writing once. Parameterised by sort key so admin and public lists share it. |
| `renderMarkdown()` | Projects' case-study bodies need a byte-identical pipeline. A second sanitiser configuration is a second place to get sanitising wrong. |

Everything else stays concrete until a second consumer proves the shape.

**Rejected — generic `createContentResource()` factory.** A CRUD factory cannot
be designed well from one example. Posts have prev/next and reading time,
projects have manual ordering and galleries, profile is a singleton. Casting the
mould from posts alone would force the other three to fit it.

**Rejected — fully concrete, extract later.** Acceptable for pagination, not for
the draft-visibility rule. That one belongs in a single function from the start.

---

## 4. Wire Contract

`packages/shared/src/post.ts` is extended with response schemas. The frontend's
types derive from these, so they are written before any server code.

```ts
export const tocEntrySchema = z.object({
  id: z.string(),
  text: z.string(),
  depth: z.number().int().min(2).max(4),
});

export const postLinkSchema = z.object({
  slug,
  title: z.string(),
});

/** List items. Cover is populated, so a card renders without a second request. */
export const postSummarySchema = z.object({
  id: objectId,
  slug,
  title: z.string(),
  lang: locale,
  excerpt: z.string(),
  tags: z.array(z.string()),
  cover: assetSchema.nullable(),
  readingMinutes: z.number().int().positive(),
  publishedAt: z.iso.datetime(),
});

/** GET /posts/:slug — rendered HTML only; raw markdown is not public. */
export const postDetailSchema = postSummarySchema.extend({
  bodyHtml: z.string(),
  toc: z.array(tocEntrySchema),
  prev: postLinkSchema.nullable(),
  next: postLinkSchema.nullable(),
  updatedAt: z.iso.datetime(),
});

/** Admin reads carry raw markdown for the editor and may be unpublished. */
export const adminPostSchema = postSummarySchema
  .extend({
    body: z.string(),
    bodyHtml: z.string(),
    toc: z.array(tocEntrySchema),
    status: publishStatus,
    publishedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  });

export const postListSchema = listResponse(postSummarySchema);

export const tagCountSchema = z.object({
  tag: z.string(),
  count: z.number().int().positive(),
});
```

`postQuery` gains `q: z.string().min(2).max(80).optional()`. It deliberately has
no `status` field — public callers cannot ask for drafts, because the parameter
does not exist.

An `adminPostQuery` is added separately: `{ status?, lang?, q?, limit, cursor }`.

### Cover population

`cover` is returned as a full `assetSchema` object, not an ObjectId. A post card
needs `url` and `alt`; returning an id would force the client into an N+1 fetch
per list item. Population happens in the service, not the controller.

---

## 5. Endpoints

All under `/api/v1`. Public reads are unauthenticated; every write requires the
admin cookie.

### 5.1 Public

| Method | Path | Query | Returns |
|---|---|---|---|
| `GET` | `/posts` | `lang, tag, q, limit, cursor` | `{ items: PostSummary[], nextCursor }` |
| `GET` | `/posts/tags` | `lang` | `TagCount[]` |
| `GET` | `/posts/feed.xml` | `lang` | Atom XML |
| `GET` | `/posts/:slug` | — | `PostDetail` |

### 5.2 Admin — behind `requireAdmin`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/admin/posts` | Drafts included. Sorted `updatedAt desc`. |
| `POST` | `/admin/posts` | Body via `validate(postInputSchema)`. |
| `GET` | `/admin/posts/:id` | Raw markdown included. |
| `PATCH` | `/admin/posts/:id` | Body via `validate(postPatchSchema)`. |
| `DELETE` | `/admin/posts/:id` | `204`. |
| `POST` | `/admin/assets` | `multipart/form-data`: `file` + `alt`. `uploadLimiter`. |
| `GET` | `/admin/assets` | Paginated. `?kind=image`. |
| `GET` | `/admin/assets/:id` | |
| `PATCH` | `/admin/assets/:id` | Alt text only (`assetUpdateSchema`). |
| `DELETE` | `/admin/assets/:id` | `409` if referenced. |

### 5.3 Route registration order

`/posts/tags` and `/posts/feed.xml` **must** be registered before `/posts/:slug`.
Express matches in declaration order; the reverse yields a `404 "post not found"`
for the feed, which is a confusing failure to debug.

---

## 6. Data Model

`apps/api/src/models/post.model.ts`

```ts
{
  slug:           String,   // unique, indexed
  title:          String,
  lang:           'en' | 'uz',
  excerpt:        String,
  body:           String,   // markdown, source of truth
  bodyHtml:       String,   // derived — sanitised render of `body`
  toc:            [{ id, text, depth }],   // derived
  readingMinutes: Number,   // derived
  searchLang:     String,   // derived — 'english' | 'none', see §9
  tags:           [String],
  cover:          ObjectId | null,  // → assets
  status:         'draft' | 'published',
  publishedAt:    Date | null,
}
```

`timestamps: true`, `strict: true` (PRD §11.3).

The four derived fields are produced by one `renderMarkdown()` call in a
`pre('validate')` hook that runs only when `body` is modified. One function, one
call site.

`apps/api/src/models/asset.model.ts` mirrors `assetSchema` from
`packages/shared/src/asset.ts`, adding the storage-internal `key` (which is never
serialised to the wire — the client gets `url`).

### 6.1 Indexes

| Index | Serves |
|---|---|
| `{ slug: 1 }` unique | Detail lookup, duplicate detection |
| `{ status: 1, publishedAt: -1, _id: -1 }` | Public list, all languages |
| `{ status: 1, lang: 1, publishedAt: -1, _id: -1 }` | Public list, language-filtered |
| `{ status: 1, tags: 1, publishedAt: -1 }` | Tag filter (multikey) |
| `{ updatedAt: -1, _id: -1 }` | Admin list |
| text: `title:10, excerpt:5, body:1` | Search (§9) |

Stated honestly: below a few hundred documents MongoDB will collection-scan
faster than it will seek. These are declared because intent belongs in the schema
and because adding indexes to a populated production collection is the painful
direction to travel.

---

## 7. Publication Rules

### 7.1 The shared filter

`apps/api/src/utils/publish-filter.ts`

```ts
export function publishFilter() {
  return { status: 'published', publishedAt: { $lte: new Date() } };
}
```

It returns a plain filter object rather than mutating a query builder,
specifically so the same value composes into `find()`, `countDocuments()`, and
the `$match` stage of the tag aggregation. Every public read path uses it —
including `prev`/`next` resolution and tag counting, so a draft cannot leak
sideways through a neighbour link or inflate a tag count.

The `$lte` clause delivers **scheduled publishing at no extra cost**: set
`publishedAt` to a future date and the post surfaces on its own.

### 7.2 `publishedAt` transitions

| Transition | Behaviour |
|---|---|
| `draft → published`, `publishedAt` null | Set to `now` |
| `draft → published`, `publishedAt` set | Left alone (backdating and scheduling both work) |
| `published → draft` | `publishedAt` preserved, so re-publishing does not silently reorder the feed |
| Explicit `publishedAt` in the request body | Always wins |

---

## 8. Cursor Pagination

`apps/api/src/utils/cursor.ts`

Sort keys: `publishedAt desc, _id desc` (public), `updatedAt desc, _id desc`
(admin).

```ts
encode(sortValue: Date, id: ObjectId) → base64url(`${iso}|${id}`)

filter(key, value, id) → {
  $or: [
    { [key]: { $lt: value } },
    { [key]: value, _id: { $lt: id } },
  ],
}
```

The cursor carries **both** keys. Paginating on a timestamp alone silently skips
or repeats rows whenever two posts share a second — rare in production, routine
in a seed script that inserts a batch in one tick.

Mechanics: fetch `limit + 1`, slice to `limit`, derive `nextCursor` from the last
retained row, return `null` when no extra row came back. A malformed or
undecodable cursor raises `ApiError.badRequest`, never a silent unpaginated
response.

---

## 9. Markdown Pipeline

`apps/api/src/services/markdown.service.ts`

```ts
renderMarkdown(md: string): {
  html: string;
  toc: TocEntry[];
  readingMinutes: number;
}
```

- **`markdown-it`** configured with `html: false`, `linkify: true`, `typographer: true`.
  Raw HTML in the source is escaped rather than parsed — the first line of defence.
- **Headings.** A single pass over the token stream handles `heading_open`
  tokens: slugify the heading text, disambiguate collisions with a numeric
  suffix, inject the `id` attribute, and append to the `toc`. One walk produces
  both the anchors and the table of contents; no second parse, and no
  `markdown-it-anchor` dependency.
- **Sanitising.** `DOMPurify` over a `jsdom` window, applied to the rendered
  output. `<script>`, `<iframe>` and all `on*` handlers are stripped. A hook adds
  `rel="noopener noreferrer"` to external anchors.
- **Reading time.** `max(1, ceil(words / 200))`, counted on the markdown source
  with fenced code blocks removed — code inflates a word count without being
  read at prose speed.
- **Code blocks** emit `<pre><code class="language-ts">`. Highlighting is left to
  frontend CSS so the server does not lock in a colour theme, and so a theme
  change does not require re-rendering every post.

Sanitising at write time rather than read time makes it a stored guarantee: if
the configuration ever loosens by accident, only posts saved afterwards are
affected, and the stored HTML can be diffed to find them.

---

## 10. Search

Text index over `title` (weight 10), `excerpt` (5), `body` (1), with
`language_override: 'searchLang'`.

`searchLang` is a stored, derived field: `'english'` for `lang: 'en'`, `'none'`
for `lang: 'uz'`. MongoDB ships no Uzbek stemmer, and without the override every
Uzbek post would be stemmed by English rules and match poorly. This setting
cannot be changed later without a full index rebuild, which is why it is decided
now.

**Deliberate limitation.** `?q=` sorts by `$meta: 'textScore'`, which is
incompatible with a timestamp cursor. Search returns up to 20 relevance-ordered
results with `nextCursor: null` — the same response shape, simply never
paginated. At this archive's size that is the correct trade. Past roughly 200
posts the upgrade is Atlas Search, not a cursor workaround.

---

## 11. Assets (scoped M2 slice)

Only what a blog cover requires. Documents and project galleries reuse it later
without change.

**Upload** — `POST /admin/assets`, `multipart/form-data`, `uploadLimiter`:

1. `multer.memoryStorage()` — **not** `diskStorage`. The adapter's `save()` takes
   a `Buffer`; letting multer write to disk directly would bypass the seam and
   hard-code disk into the upload path, which is precisely what the interface
   exists to prevent.
2. Sniff the real MIME from magic bytes with `file-type`. The multipart header is
   client-supplied and is not trusted. Reject anything outside `ALLOWED_MIME`.
3. Enforce `MAX_IMAGE_BYTES` / `MAX_PDF_BYTES` → `413` with a usable message.
4. Read dimensions with `image-size` for images. `sharp` and derivatives stay
   deferred to PRD §7 Phase 2.
5. Derive the extension from the *sniffed* type, generate a `nanoid` filename,
   hand the buffer to `storage.save()`.
6. Persist the Asset document; respond `201`.

`alt` is required when `kind === 'image'`, enforced in the schema rather than by
convention (PRD §11.8).

**Delete** — `apps/api/src/services/references.ts` holds a small registry:

```ts
[{ model: Post, field: 'cover', label: 'post' }]
```

`DELETE /admin/assets/:id` walks it and returns `409` naming what still points at
the asset. Projects and documents each append one line when they land.

---

## 12. Feed

`GET /posts/feed.xml` renders Atom 1.0 from the most recent 20 published posts.

- `Content-Type: application/atom+xml; charset=utf-8`
- `Cache-Control: public, max-age=1800`
- Entry content is the stored `bodyHtml`, XML-escaped
- `?lang=` filters; omitted means all languages

Requires a new environment variable, `PUBLIC_SITE_URL` — feed links must point at
the *site* (`/writing/:slug`), not at the API. Added to `config/env.ts` and
`.env.example`.

Rationale: PRD §13.4 notes that a client-rendered SPA is effectively invisible to
crawlers. A feed is the cheapest available mitigation and needs no new
dependency.

---

## 13. Caching

Public reads set `Cache-Control: public, max-age=60, stale-while-revalidate=300`.
Admin reads set `Cache-Control: no-store`. Content changes a few times a month;
sixty seconds costs nothing and absorbs any burst of traffic on a shared link.

---

## 14. Errors

No new machinery. `ApiError` and `errorHandler` already own the envelope. Two
specifics:

- **Duplicate slug.** Caught as MongoDB error `11000` on write and re-thrown as
  `ApiError.conflict('A post with that slug already exists', { slug: … })`, so
  the admin form renders the message at the input. Catching the failed write
  rather than pre-checking existence keeps it race-safe.
- **Bad cursor / bad ObjectId.** `400` with a `fields` entry, never a silent
  fallback to the unpaginated list.

Status codes follow PRD §4.3: `400` validation, `401` unauthenticated, `404`
missing, `409` duplicate slug or referenced asset, `413` oversized upload, `429`
rate limited.

---

## 15. File Layout

```
packages/shared/src/
  post.ts                        EXTEND  response schemas, toc, tag counts, q

apps/api/src/
  models/
    post.model.ts                NEW     schema, indexes, pre-validate hook
    asset.model.ts               NEW
  services/
    markdown.service.ts          NEW     renderMarkdown()
    post.service.ts              NEW     queries + toPostSummary/Detail/Admin
    asset.service.ts             NEW     upload, delete, reference guard
    feed.service.ts              NEW     Atom builder
    references.ts                NEW     asset reference registry
  controllers/
    post.controller.ts           NEW     public
    admin-post.controller.ts     NEW
    admin-asset.controller.ts    NEW
  routes/
    post.routes.ts               NEW
    admin-post.routes.ts         NEW
    admin-asset.routes.ts        NEW
    index.ts                     EDIT    mount the three routers
  middlewares/
    upload.middleware.ts         NEW     multer memoryStorage + limits
  utils/
    cursor.ts                    NEW
    publish-filter.ts            NEW
  config/
    env.ts                       EDIT    PUBLIC_SITE_URL
  scripts/
    seed-posts.ts                NEW     sample content for frontend work
  __tests__/
    markdown.test.ts             NEW     unit — pure function
    post.test.ts                 NEW     integration
    asset.test.ts                NEW     integration
```

Serialisers (`toPostSummary`, `toPostDetail`, `toAdminPost`) live in
`post.service.ts`, following the precedent set by `buildSession()` in
`auth.service.ts`. The repository has no `serializers/` directory and this design
does not introduce one for a single vertical.

---

## 16. Verification

Follows the `auth.test.ts` precedent: `supertest` against an in-process app from
`createApp()`, backed by `mongodb-memory-server`. No running MongoDB, no network.

The load-bearing assertion appears in every endpoint test:

```ts
expect(() => postDetailSchema.parse(res.body)).not.toThrow();
```

Each response is parsed by the shared schema **the frontend derives its types
from**. If the server drifts from the contract, a test fails instead of a UI
component. That is what makes the contract wire-ready mechanically rather than
aspirationally.

Flows that must be covered:

- Public list — pagination across a cursor boundary, including a tied `publishedAt`
- Public list — `lang` and `tag` filters
- Public list, detail, tags, and feed — **drafts absent from all four**
- Future-dated post — absent from public reads, present in admin reads
- Detail — `prev`/`next` correct at both ends of the archive (null, null)
- Search — relevance ordering; `nextCursor` always null
- Admin CRUD — create, patch, publish transition, delete
- Duplicate slug → `409` carrying `fields.slug`
- Every admin route → `401` without the cookie
- Upload — accepted type, rejected type, oversized file → `413`
- Delete a referenced asset → `409` naming the post

---

## 17. Configuration & Dependencies

**New environment variable**

```
PUBLIC_SITE_URL      # e.g. https://mirzakhalov.uz — absolute links in the feed
```

Added to the `envSchema` in `config/env.ts` and to `.env.example`.

**New dependencies**

| Package | Purpose |
|---|---|
| `markdown-it` (+ `@types/markdown-it`) | Markdown → HTML |
| `dompurify` | Sanitising |
| `jsdom` (+ `@types/jsdom`) | DOM for DOMPurify server-side |
| `file-type` | Magic-byte MIME sniffing |
| `image-size` | Image dimensions without `sharp` |

`multer`, `nanoid` and `zod` are already installed.

---

## 18. Build Order

Each step leaves the repository in a working state.

1. **Shared schemas** — the contract, before any server code depends on it.
2. **`markdown.service.ts`** — a pure function; unit-testable with no database.
3. **`cursor.ts` and `publish-filter.ts`** — small, shared, independently testable.
4. **Asset vertical** — model, upload middleware, service, admin routes.
   Independent of posts and can proceed in parallel with step 5.
5. **`post.model.ts`** — schema, indexes, derived-field hook.
6. **`post.service.ts`** — queries, prev/next, tag aggregation, search, serialisers.
7. **Public routes and controllers** — including registration order (§5.3).
8. **Admin routes and controllers.**
9. **Feed.**
10. **Integration tests** parsing every response through the shared schemas.
11. **`seed-posts.ts`**, `.env.example`, and endpoint documentation in the README.

Steps 4 and 5–6 are the only pair that can run concurrently; everything else is
sequential on the step before it.

---

## 19. Out of Scope, and What Follows

**Not built here:** any frontend work (`/writing` remains a `PendingPage`),
`sharp` derivatives, comments, view counts, prerendering.

**Enabled for later:** the asset pipeline and the `references.ts` registry make
M2 (documents) and M3 (projects) substantially smaller. `renderMarkdown()` is
what M3's case-study bodies will call.

**Known limitation, accepted:** search is capped at 20 unpaginated results (§10).
