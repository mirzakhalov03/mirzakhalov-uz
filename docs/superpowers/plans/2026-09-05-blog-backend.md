# Blog Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully functional posts subsystem on the server — CRUD, publishing, markdown rendering, search, tags, feed, and cover-image uploads — behind a Zod contract the React app can build against with no further backend work.

**Architecture:** A concrete posts vertical (model → service → controller → routes) plus three shared helpers extracted immediately: `publishFilter()` (draft visibility, security-relevant), `cursor.ts` (keyset pagination), and `renderMarkdown()` (reused by project case studies later). Markdown is rendered and sanitised at write time into stored `bodyHtml`/`toc`/`readingMinutes` fields, so reads are pure lookups. A scoped slice of M2 (assets) is pulled forward because `posts.cover` references it.

**Tech Stack:** Node 22, Express 5, TypeScript, Mongoose 8, Zod 4, Vitest + Supertest + `mongodb-memory-server`, `markdown-it`, `DOMPurify` + `jsdom`, `multer` (memory storage), `file-type`, `image-size`.

**Spec:** `docs/superpowers/specs/2026-09-05-blog-backend-design.md`

## Global Constraints

- **Backend only.** No files under `apps/web/` are created or modified. `/writing` stays a `PendingPage`.
- **ESM with explicit extensions.** Every relative import ends in `.js` (e.g. `../utils/api-error.js`). The repo is `"type": "module"` with `NodeNext` resolution; a missing extension is a runtime failure, not a lint warning.
- **Errors only via `ApiError`.** Never `res.status(400).json(...)` in a controller. `middlewares/error.middleware.ts` is the single exit point for the `{ error: { code, message, fields? } }` envelope.
- **Validation only via `validate(schema, source)`.** No ad-hoc `if (!req.body.title)` anywhere (PRD §4.3).
- **`strict: true` on every Mongoose schema** (PRD §11.3).
- **Public reads never expose drafts.** Every public query composes `publishFilter()`. This includes `prev`/`next`, tag counts, search, and the feed.
- **Storage goes through the adapter.** `multer.memoryStorage()` only — never `multer.diskStorage()`. `storage.save()` takes a `Buffer` (PRD §7).
- **Run commands from the repo root** using `-w @portfolio/api`, e.g. `npm test -w @portfolio/api`.
- **Test file env patching happens before app imports.** Copy the `process.env[...]` block at the top of `apps/api/src/__tests__/auth.test.ts` verbatim; `config/env.ts` calls `process.exit(1)` at import time on invalid config.
- **Each `describe` block that hits a rate-limited route uses its own `X-Forwarded-For` IP**, following `auth.test.ts`.

**Reference signatures already in the repo (do not redefine):**

```ts
// utils/api-error.ts
ApiError.badRequest(message, fields?)  ApiError.unauthorized(message?)
ApiError.notFound(message?)            ApiError.conflict(message, fields?)
ApiError.payloadTooLarge(message)      ApiError.forbidden(message?)

// middlewares/validate.middleware.ts
validate(schema: ZodType, source?: 'body' | 'query' | 'params'): RequestHandler
validatedQuery<T>(req: Request): T          // reads what validate(…, 'query') stored

// middlewares/auth.middleware.ts    requireAdmin: RequestHandler
// middlewares/rate-limit.middleware.ts   uploadLimiter
// utils/async-handler.ts            asyncHandler(handler): RequestHandler

// services/storage/index.ts
storage.save({ buffer: Buffer; mime: string; extension: string })
  → Promise<{ filename, key, url, size, mime }>
storage.remove(key: string): Promise<void>
storage.resolve(key: string): string | null
```

---

## File Structure

```
packages/shared/src/
  post.ts       MODIFY  response schemas, toc, tag counts, q param, admin query
  asset.ts      MODIFY  assetListSchema, assetQuery

apps/api/src/
  services/
    markdown.service.ts       NEW  renderMarkdown() — pure, no DB
    post.service.ts           NEW  post queries + serialisers
    asset.service.ts          NEW  upload/delete + serialiser
    feed.service.ts           NEW  Atom XML builder — pure
    references.ts             NEW  asset reference registry
  models/
    post.model.ts             NEW  schema, indexes, derived-field hook
    asset.model.ts            NEW
  controllers/
    post.controller.ts        NEW  public
    admin-post.controller.ts  NEW
    admin-asset.controller.ts NEW
  routes/
    post.routes.ts            NEW
    admin-post.routes.ts      NEW
    admin-asset.routes.ts     NEW
    index.ts                  MODIFY  mount three routers
  middlewares/
    upload.middleware.ts      NEW  multer memoryStorage + 413 mapping
  utils/
    cursor.ts                 NEW
    publish-filter.ts         NEW
    cache.ts                  NEW
  config/
    env.ts                    MODIFY  PUBLIC_SITE_URL
  scripts/
    seed-posts.ts             NEW
  __tests__/
    shared-schemas.test.ts    NEW
    markdown.test.ts          NEW
    cursor.test.ts            NEW
    asset.test.ts             NEW
    post-public.test.ts       NEW
    post-admin.test.ts        NEW
```

Serialisers live in their service files, following `buildSession()` in `auth.service.ts`. No `serializers/` directory is introduced.

---

## Task 1: Shared response schemas

The wire contract, written before anything depends on it.

**Files:**
- Modify: `packages/shared/src/post.ts`
- Modify: `packages/shared/src/asset.ts`
- Test: `apps/api/src/__tests__/shared-schemas.test.ts`

**Interfaces:**
- Consumes: `assetSchema` (`packages/shared/src/asset.ts`), `listResponse`, `locale`, `objectId`, `publishStatus`, `slug` (`common.ts`).
- Produces: `tocEntrySchema`/`TocEntry`, `postLinkSchema`/`PostLink`, `postSummarySchema`/`PostSummary`, `postDetailSchema`/`PostDetail`, `adminPostSchema`/`AdminPost`, `postListSchema`, `adminPostListSchema`, `tagCountSchema`/`TagCount`, `postTagsQuery`, `adminPostQuery`/`AdminPostQuery`, an extended `postQuery` with `q`, and `assetListSchema`/`assetQuery`.

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/shared-schemas.test.ts`:

```ts
/**
 * The wire contract, tested from the consumer's side. The API imports these
 * schemas and so does the React app, so a drift here breaks both.
 */
import { describe, expect, it } from 'vitest';
import {
  adminPostSchema,
  postDetailSchema,
  postListSchema,
  postQuery,
  postSummarySchema,
  tagCountSchema,
} from '@portfolio/shared';

const asset = {
  id: '507f1f77bcf86cd799439011',
  filename: 'k3m9x2p1.webp',
  originalName: 'cover.png',
  mime: 'image/webp',
  size: 12_345,
  kind: 'image' as const,
  url: '/static/2026/09/k3m9x2p1.webp',
  width: 1200,
  height: 630,
  alt: 'A desk at night',
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
};

const summary = {
  id: '507f1f77bcf86cd799439012',
  slug: 'on-writing',
  title: 'On writing',
  lang: 'en' as const,
  excerpt: 'A short note.',
  tags: ['craft'],
  cover: asset,
  readingMinutes: 4,
  publishedAt: '2026-09-02T09:00:00.000Z',
};

describe('post wire schemas', () => {
  it('accepts a summary with a populated cover', () => {
    expect(() => postSummarySchema.parse(summary)).not.toThrow();
  });

  it('accepts a summary with a null cover', () => {
    expect(() => postSummarySchema.parse({ ...summary, cover: null })).not.toThrow();
  });

  it('rejects a summary whose cover is a bare id', () => {
    expect(() => postSummarySchema.parse({ ...summary, cover: asset.id })).toThrow();
  });

  it('requires bodyHtml, toc, prev and next on the detail shape', () => {
    expect(() =>
      postDetailSchema.parse({
        ...summary,
        bodyHtml: '<h2 id="one">One</h2>',
        toc: [{ id: 'one', text: 'One', depth: 2 }],
        prev: null,
        next: { slug: 'older-note', title: 'Older note' },
        updatedAt: '2026-09-02T09:00:00.000Z',
      }),
    ).not.toThrow();
    expect(() => postDetailSchema.parse(summary)).toThrow();
  });

  it('allows a null publishedAt on the admin shape only', () => {
    const admin = {
      ...summary,
      publishedAt: null,
      body: '# raw',
      bodyHtml: '<h1>raw</h1>',
      toc: [],
      status: 'draft' as const,
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    };
    expect(() => adminPostSchema.parse(admin)).not.toThrow();
    expect(() => postSummarySchema.parse({ ...summary, publishedAt: null })).toThrow();
  });

  it('shapes the list envelope as { items, nextCursor }', () => {
    expect(() => postListSchema.parse({ items: [summary], nextCursor: null })).not.toThrow();
  });

  it('parses a tag count', () => {
    expect(() => tagCountSchema.parse({ tag: 'craft', count: 3 })).not.toThrow();
  });

  it('has no status field on the public query, so drafts cannot be requested', () => {
    const parsed = postQuery.parse({ status: 'draft', limit: '5' });
    expect(parsed).not.toHaveProperty('status');
    expect(parsed.limit).toBe(5);
  });

  it('accepts a search term of two characters or more', () => {
    expect(postQuery.parse({ q: 'ab' }).q).toBe('ab');
    expect(() => postQuery.parse({ q: 'a' })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- shared-schemas`
Expected: FAIL — `postSummarySchema` and friends are not exported from `@portfolio/shared`.

- [ ] **Step 3: Extend the shared post schemas**

Replace the whole of `packages/shared/src/post.ts` with:

```ts
import { z } from 'zod';
import { assetSchema } from './asset.js';
import { listResponse, locale, objectId, publishStatus, slug } from './common.js';

/**
 * Posts are single-language (see Technical PRD §13 Q2) — a post is written in
 * one language and tagged with it, rather than carrying parallel translations.
 */
export const postInputSchema = z.object({
  slug,
  title: z.string().min(1).max(140),
  lang: locale.default('en'),
  excerpt: z.string().min(1).max(400),
  body: z.string().min(1).max(100_000), // markdown
  tags: z.array(z.string().min(1).max(40)).max(10).default([]),
  cover: objectId.nullable().default(null),
  status: publishStatus.default('draft'),
  publishedAt: z.iso.datetime().nullable().default(null),
});
export type PostInput = z.infer<typeof postInputSchema>;

export const postPatchSchema = postInputSchema.partial();
export type PostPatch = z.infer<typeof postPatchSchema>;

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * The public query deliberately has no `status` field. A caller cannot ask for
 * drafts because the parameter does not exist, not merely because it is ignored.
 */
export const postQuery = z.object({
  lang: locale.optional(),
  tag: z.string().min(1).max(40).optional(),
  q: z.string().min(2).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});
export type PostQuery = z.infer<typeof postQuery>;

export const postTagsQuery = z.object({ lang: locale.optional() });
export type PostTagsQuery = z.infer<typeof postTagsQuery>;

export const adminPostQuery = z.object({
  status: publishStatus.optional(),
  lang: locale.optional(),
  q: z.string().min(2).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
export type AdminPostQuery = z.infer<typeof adminPostQuery>;

// ─── Responses ───────────────────────────────────────────────────────────────

export const tocEntrySchema = z.object({
  id: z.string(),
  text: z.string(),
  depth: z.number().int().min(2).max(4),
});
export type TocEntry = z.infer<typeof tocEntrySchema>;

export const postLinkSchema = z.object({ slug, title: z.string() });
export type PostLink = z.infer<typeof postLinkSchema>;

/**
 * List items. `cover` is the populated asset, not an id — a post card needs
 * `url` and `alt`, and returning an id would force an N+1 fetch per card.
 */
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
export type PostSummary = z.infer<typeof postSummarySchema>;

/** GET /posts/:slug — rendered HTML only; raw markdown is not public. */
export const postDetailSchema = postSummarySchema.extend({
  bodyHtml: z.string(),
  toc: z.array(tocEntrySchema),
  prev: postLinkSchema.nullable(),
  next: postLinkSchema.nullable(),
  updatedAt: z.iso.datetime(),
});
export type PostDetail = z.infer<typeof postDetailSchema>;

/** Admin reads carry raw markdown for the editor and may be unpublished. */
export const adminPostSchema = postSummarySchema.extend({
  body: z.string(),
  bodyHtml: z.string(),
  toc: z.array(tocEntrySchema),
  status: publishStatus,
  publishedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type AdminPost = z.infer<typeof adminPostSchema>;

export const postListSchema = listResponse(postSummarySchema);
export type PostList = z.infer<typeof postListSchema>;

export const adminPostListSchema = listResponse(adminPostSchema);
export type AdminPostList = z.infer<typeof adminPostListSchema>;

export const tagCountSchema = z.object({
  tag: z.string(),
  count: z.number().int().positive(),
});
export type TagCount = z.infer<typeof tagCountSchema>;
```

- [ ] **Step 4: Add the asset list schema**

Append the following to the **bottom** of `packages/shared/src/asset.ts`. Add no
imports — the file already imports `z` and defines `assetSchema` and `assetKind`
above this point.

```ts
/** Admin media library listing. */
export const assetListSchema = z.object({
  items: z.array(assetSchema),
  nextCursor: z.string().nullable(),
});
export type AssetList = z.infer<typeof assetListSchema>;

export const assetQuery = z.object({
  kind: assetKind.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  cursor: z.string().optional(),
});
export type AssetQuery = z.infer<typeof assetQuery>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- shared-schemas`
Expected: PASS, 9 tests.

Run: `npm run typecheck -w @portfolio/shared && npm run typecheck -w @portfolio/api`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add packages/shared/src/post.ts packages/shared/src/asset.ts \
        apps/api/src/__tests__/shared-schemas.test.ts
git commit -m "feat(shared): add post response schemas and admin/asset queries"
```

---

## Task 2: Markdown service

A pure function, testable with no database.

**Files:**
- Create: `apps/api/src/services/markdown.service.ts`
- Test: `apps/api/src/__tests__/markdown.test.ts`
- Modify: `apps/api/package.json` (dependencies)

**Interfaces:**
- Consumes: `TocEntry` from `@portfolio/shared` (Task 1).
- Produces: `renderMarkdown(source: string): { html: string; toc: TocEntry[]; readingMinutes: number }`, plus `slugifyHeading(text: string): string` and `countWords(markdown: string): number` (exported for direct testing).

- [ ] **Step 1: Install dependencies**

```bash
npm i -w @portfolio/api markdown-it dompurify jsdom
npm i -w @portfolio/api -D @types/markdown-it @types/jsdom
```

- [ ] **Step 2: Write the failing test**

Create `apps/api/src/__tests__/markdown.test.ts`:

```ts
/**
 * Unit tests for the render pipeline. No database, no HTTP — renderMarkdown is
 * a pure function and is tested as one.
 */
import { describe, expect, it } from 'vitest';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/unused';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

const { renderMarkdown, slugifyHeading, countWords } = await import(
  '../services/markdown.service.js'
);

describe('renderMarkdown', () => {
  it('renders markdown to html', () => {
    expect(renderMarkdown('A *note*.').html).toContain('<em>note</em>');
  });

  it('escapes raw html in the source rather than parsing it', () => {
    const { html } = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('strips event-handler attributes', () => {
    const { html } = renderMarkdown('<img src=x onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('adds rel="noopener noreferrer" to external links', () => {
    const { html } = renderMarkdown('[out](https://example.com)');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('leaves relative links without a target', () => {
    const { html } = renderMarkdown('[in](/writing/hello)');
    expect(html).not.toContain('target="_blank"');
  });

  it('collects h2–h4 into a table of contents and injects matching ids', () => {
    const { html, toc } = renderMarkdown('## First\n\n### Second\n\n# Title\n');
    expect(toc).toEqual([
      { id: 'first', text: 'First', depth: 2 },
      { id: 'second', text: 'Second', depth: 3 },
    ]);
    expect(html).toContain('id="first"');
    expect(html).toContain('id="second"');
  });

  it('disambiguates duplicate heading slugs', () => {
    const { toc } = renderMarkdown('## Setup\n\n## Setup\n\n## Setup\n');
    expect(toc.map((t) => t.id)).toEqual(['setup', 'setup-1', 'setup-2']);
  });

  it('falls back to a positional id for a heading that slugifies to nothing', () => {
    const { toc } = renderMarkdown('## ???\n');
    expect(toc[0]?.id).toBe('section-1');
  });

  it('reports at least one reading minute for any post', () => {
    expect(renderMarkdown('Hi.').readingMinutes).toBe(1);
  });

  it('counts roughly 200 words per minute', () => {
    const source = Array.from({ length: 600 }, () => 'word').join(' ');
    expect(renderMarkdown(source).readingMinutes).toBe(3);
  });

  it('excludes fenced code from the reading time', () => {
    const code = ['```ts', ...Array.from({ length: 600 }, () => 'const x = 1;'), '```'].join('\n');
    expect(renderMarkdown(`Short intro.\n\n${code}`).readingMinutes).toBe(1);
  });

  it('emits a language class on fenced code so the client can highlight it', () => {
    expect(renderMarkdown('```ts\nconst a = 1;\n```').html).toContain('language-ts');
  });
});

describe('slugifyHeading', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyHeading('Hello There World')).toBe('hello-there-world');
  });

  it('drops punctuation but keeps non-latin letters', () => {
    expect(slugifyHeading('Salom, dunyo!')).toBe('salom-dunyo');
  });

  it('returns an empty string when nothing survives', () => {
    expect(slugifyHeading('!!!')).toBe('');
  });
});

describe('countWords', () => {
  it('ignores inline code spans', () => {
    expect(countWords('one `two three` four')).toBe(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- markdown`
Expected: FAIL — cannot resolve `../services/markdown.service.js`.

- [ ] **Step 4: Write the implementation**

Create `apps/api/src/services/markdown.service.ts`:

```ts
import MarkdownIt from 'markdown-it';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { TocEntry } from '@portfolio/shared';

/**
 * Markdown is rendered and sanitised at WRITE time (Technical PRD §5.2), so the
 * stored `bodyHtml` is a guarantee rather than a per-request hope. If this
 * configuration ever loosens, only posts saved afterwards are affected — and
 * the stored HTML can be diffed to find them.
 *
 * `html: false` means raw HTML in the source is escaped, never parsed. That is
 * the first line of defence; DOMPurify is the second.
 */
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

const { window } = new JSDOM('');
const purify = createDOMPurify(window as unknown as Window & typeof globalThis);

/** External links open in a new tab and must not leak `window.opener`. */
purify.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof window.HTMLAnchorElement)) return;
  const href = node.getAttribute('href') ?? '';
  if (/^https?:\/\//i.test(href)) {
    node.setAttribute('rel', 'noopener noreferrer');
    node.setAttribute('target', '_blank');
  }
});

const WORDS_PER_MINUTE = 200;
const MIN_TOC_DEPTH = 2;
const MAX_TOC_DEPTH = 4;

/** Lowercase, hyphenated, punctuation-free. Unicode letters survive (Uzbek posts). */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Words in the prose, with code removed — a fenced block inflates a word count
 * without being read at prose speed.
 */
export function countWords(markdown: string): number {
  const prose = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  return prose.split(/\s+/).filter(Boolean).length;
}

export interface RenderedMarkdown {
  html: string;
  toc: TocEntry[];
  readingMinutes: number;
}

/**
 * One pass over the token stream produces both the heading anchors and the
 * table of contents — rendering first and re-parsing the HTML for a TOC would
 * do the same work twice.
 */
export function renderMarkdown(source: string): RenderedMarkdown {
  const env = {};
  const tokens = md.parse(source, env);
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token?.type !== 'heading_open') continue;

    const depth = Number(token.tag.slice(1));
    if (depth < MIN_TOC_DEPTH || depth > MAX_TOC_DEPTH) continue;

    const text = tokens[i + 1]?.content ?? '';
    const base = slugifyHeading(text) || `section-${toc.length + 1}`;
    const used = seen.get(base) ?? 0;
    seen.set(base, used + 1);
    const id = used === 0 ? base : `${base}-${used}`;

    token.attrSet('id', id);
    toc.push({ id, text, depth });
  }

  const html = purify.sanitize(md.renderer.render(tokens, md.options, env), {
    ADD_ATTR: ['target', 'id', 'class'],
  });

  return {
    html,
    toc,
    readingMinutes: Math.max(1, Math.ceil(countWords(source) / WORDS_PER_MINUTE)),
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- markdown`
Expected: PASS, 16 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/services/markdown.service.ts \
        apps/api/src/__tests__/markdown.test.ts \
        apps/api/package.json package-lock.json
git commit -m "feat(api): add markdown render + sanitise service with TOC and reading time"
```

---

## Task 3: Cursor pagination and publish filter

Two small shared helpers plus a cache-header helper.

**Files:**
- Create: `apps/api/src/utils/cursor.ts`
- Create: `apps/api/src/utils/publish-filter.ts`
- Create: `apps/api/src/utils/cache.ts`
- Test: `apps/api/src/__tests__/cursor.test.ts`

**Interfaces:**
- Consumes: `ApiError` (`utils/api-error.ts`).
- Produces:
  - `encodeCursor(value: Date, id: Types.ObjectId | string): string`
  - `decodeCursor(raw: string): { value: Date; id: Types.ObjectId }`
  - `cursorFilter(key: string, cursor: Cursor): Record<string, unknown>`
  - `toPage<T>(rows: T[], limit: number, sortValue: (row: T) => Date): { items: T[]; nextCursor: string | null }`
  - `publishFilter(): { status: 'published'; publishedAt: { $lte: Date } }`
  - `publicCache(res: Response, seconds?: number): void`, `noStore(res: Response): void`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/cursor.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/unused';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

const { encodeCursor, decodeCursor, cursorFilter, toPage } = await import('../utils/cursor.js');
const { publishFilter } = await import('../utils/publish-filter.js');
const { ApiError } = await import('../utils/api-error.js');

const id = new Types.ObjectId('507f1f77bcf86cd799439011');
const when = new Date('2026-09-02T09:00:00.000Z');

describe('cursor', () => {
  it('round-trips a date and an id', () => {
    const decoded = decodeCursor(encodeCursor(when, id));
    expect(decoded.value.toISOString()).toBe(when.toISOString());
    expect(decoded.id.toString()).toBe(id.toString());
  });

  it('rejects a cursor that is not base64', () => {
    expect(() => decodeCursor('not a cursor!!')).toThrow(ApiError);
  });

  it('rejects a cursor with a bad object id', () => {
    const raw = Buffer.from(`${when.toISOString()}|nope`, 'utf8').toString('base64url');
    expect(() => decodeCursor(raw)).toThrow(ApiError);
  });

  it('rejects a cursor with a bad date', () => {
    const raw = Buffer.from(`banana|${id.toString()}`, 'utf8').toString('base64url');
    expect(() => decodeCursor(raw)).toThrow(ApiError);
  });

  it('builds a keyset filter that breaks ties on _id', () => {
    expect(cursorFilter('publishedAt', { value: when, id })).toEqual({
      $or: [{ publishedAt: { $lt: when } }, { publishedAt: when, _id: { $lt: id } }],
    });
  });
});

describe('toPage', () => {
  const row = (n: number) => ({ _id: new Types.ObjectId(), publishedAt: new Date(2026, 0, n) });

  it('returns a null cursor when no extra row came back', () => {
    const rows = [row(1), row(2)];
    const page = toPage(rows, 2, (r) => r.publishedAt);
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBeNull();
  });

  it('trims the over-fetched row and emits a cursor from the last kept one', () => {
    const rows = [row(1), row(2), row(3)];
    const page = toPage(rows, 2, (r) => r.publishedAt);
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
    expect(decodeCursor(page.nextCursor!).id.toString()).toBe(rows[1]!._id.toString());
  });

  it('returns a null cursor for an empty result set', () => {
    expect(toPage([], 10, (r: { publishedAt: Date }) => r.publishedAt).nextCursor).toBeNull();
  });
});

describe('publishFilter', () => {
  it('excludes drafts and future-dated posts', () => {
    const filter = publishFilter();
    expect(filter.status).toBe('published');
    expect(filter.publishedAt.$lte.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- cursor`
Expected: FAIL — cannot resolve `../utils/cursor.js`.

- [ ] **Step 3: Write `publish-filter.ts`**

Create `apps/api/src/utils/publish-filter.ts`:

```ts
export interface PublishFilter {
  status: 'published';
  publishedAt: { $lte: Date };
}

/**
 * The single definition of "publicly visible" (Technical PRD §4.1 — enforce in
 * a shared query helper, not per-route). Every public read path composes this,
 * including prev/next resolution, tag counts, search and the feed, so a draft
 * cannot leak sideways through a neighbour link.
 *
 * It returns a plain filter object rather than mutating a query builder so the
 * same value drops into find(), countDocuments() and an aggregation $match.
 *
 * The $lte clause delivers scheduled publishing for free: a post dated in the
 * future simply does not match until its moment arrives.
 */
export function publishFilter(): PublishFilter {
  return { status: 'published', publishedAt: { $lte: new Date() } };
}
```

- [ ] **Step 4: Write `cursor.ts`**

Create `apps/api/src/utils/cursor.ts`:

```ts
import { Types } from 'mongoose';
import { ApiError } from './api-error.js';

export interface Cursor {
  value: Date;
  id: Types.ObjectId;
}

/**
 * Keyset pagination over a descending sort on (`key`, `_id`).
 *
 * The cursor carries BOTH keys. Paginating on a timestamp alone silently skips
 * or repeats rows whenever two documents share a second — rare in production,
 * routine in a seed script that inserts a batch in one tick.
 */
export function encodeCursor(value: Date, id: Types.ObjectId | string): string {
  return Buffer.from(`${value.toISOString()}|${id.toString()}`, 'utf8').toString('base64url');
}

export function decodeCursor(raw: string): Cursor {
  const [iso, id] = Buffer.from(raw, 'base64url').toString('utf8').split('|');
  const value = new Date(iso ?? '');

  if (!iso || !id || Number.isNaN(value.getTime()) || !Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid cursor', {
      cursor: 'This cursor is malformed. Request the first page without one.',
    });
  }

  return { value, id: new Types.ObjectId(id) };
}

/** The `WHERE` half of keyset pagination. */
export function cursorFilter(key: string, cursor: Cursor): Record<string, unknown> {
  return {
    $or: [{ [key]: { $lt: cursor.value } }, { [key]: cursor.value, _id: { $lt: cursor.id } }],
  };
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Slice an over-fetched result set (query for `limit + 1`) and derive the next
 * cursor from the last row actually kept.
 */
export function toPage<T extends { _id: Types.ObjectId }>(
  rows: T[],
  limit: number,
  sortValue: (row: T) => Date,
): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(sortValue(last), last._id) : null,
  };
}
```

- [ ] **Step 5: Write `cache.ts`**

Create `apps/api/src/utils/cache.ts`:

```ts
import type { Response } from 'express';

/**
 * Content changes a few times a month, so a short shared cache costs nothing
 * and absorbs a burst of traffic on a link someone shared.
 */
export function publicCache(res: Response, seconds = 60): void {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=300`);
}

/** Admin reads include drafts — never let a proxy hold on to them. */
export function noStore(res: Response): void {
  res.set('Cache-Control', 'no-store');
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- cursor`
Expected: PASS, 9 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/utils/cursor.ts apps/api/src/utils/publish-filter.ts \
        apps/api/src/utils/cache.ts apps/api/src/__tests__/cursor.test.ts
git commit -m "feat(api): add keyset cursor, publish filter and cache helpers"
```

---

## Task 4: Post model

**Files:**
- Create: `apps/api/src/models/post.model.ts`

**Interfaces:**
- Consumes: `renderMarkdown` (Task 2), `locale`, `publishStatus`, `Locale`, `PublishStatus`, `TocEntry` from `@portfolio/shared`.
- Produces: `Post` (Mongoose model) and `IPost` (document interface) with fields `slug, title, lang, excerpt, body, bodyHtml, toc, readingMinutes, searchLang, tags, cover, status, publishedAt, createdAt, updatedAt`.

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/post-model.test.ts`:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

let mongo: MongoMemoryServer;
let Post: typeof import('../models/post.model.js').Post;
let connectDatabase: () => Promise<void>;
let disconnectDatabase: () => Promise<void>;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongo.getUri();
  ({ connectDatabase, disconnectDatabase } = await import('../config/db.js'));
  ({ Post } = await import('../models/post.model.js'));
  await connectDatabase();
  await Post.syncIndexes();
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo.stop();
});

beforeEach(async () => {
  await Post.deleteMany({});
});

const base = {
  slug: 'hello',
  title: 'Hello',
  lang: 'en' as const,
  excerpt: 'A note.',
  body: '## Section\n\nSome prose here.',
};

describe('Post model', () => {
  it('derives bodyHtml, toc and readingMinutes on save', async () => {
    const post = await Post.create(base);
    expect(post.bodyHtml).toContain('id="section"');
    expect(post.toc).toEqual([{ id: 'section', text: 'Section', depth: 2 }]);
    expect(post.readingMinutes).toBe(1);
  });

  it('re-derives them when the body changes', async () => {
    const post = await Post.create(base);
    post.body = '## Renamed\n\nDifferent prose.';
    await post.save();
    expect(post.toc[0]?.id).toBe('renamed');
  });

  it('sets searchLang from lang so Mongo stems each post correctly', async () => {
    expect((await Post.create(base)).searchLang).toBe('english');
    expect((await Post.create({ ...base, slug: 'salom', lang: 'uz' })).searchLang).toBe('none');
  });

  it('stamps publishedAt when a draft is first published', async () => {
    const post = await Post.create({ ...base, status: 'published' });
    expect(post.publishedAt).toBeInstanceOf(Date);
  });

  it('leaves an explicitly supplied publishedAt alone, so backdating works', async () => {
    const backdated = new Date('2020-01-01T00:00:00.000Z');
    const post = await Post.create({ ...base, status: 'published', publishedAt: backdated });
    expect(post.publishedAt?.toISOString()).toBe(backdated.toISOString());
  });

  it('keeps publishedAt when a post is unpublished, so re-publishing does not reorder the feed', async () => {
    const post = await Post.create({ ...base, status: 'published' });
    const original = post.publishedAt?.toISOString();
    post.status = 'draft';
    await post.save();
    expect(post.publishedAt?.toISOString()).toBe(original);
  });

  it('defaults to a draft with no publication date', async () => {
    const post = await Post.create(base);
    expect(post.status).toBe('draft');
    expect(post.publishedAt).toBeNull();
  });

  it('rejects a duplicate slug', async () => {
    await Post.create(base);
    await expect(Post.create({ ...base, title: 'Other' })).rejects.toMatchObject({ code: 11000 });
  });

  it('drops unknown fields rather than persisting them', async () => {
    const post = await Post.create({ ...base, sneaky: 'value' } as never);
    expect((post as unknown as Record<string, unknown>)['sneaky']).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- post-model`
Expected: FAIL — cannot resolve `../models/post.model.js`.

- [ ] **Step 3: Write the model**

Create `apps/api/src/models/post.model.ts`:

```ts
import mongoose, { type Document, Schema, type Types } from 'mongoose';
import { locale, publishStatus, type Locale, type PublishStatus, type TocEntry } from '@portfolio/shared';
import { renderMarkdown } from '../services/markdown.service.js';

/** Technical PRD §3.3. `bodyHtml`, `toc`, `readingMinutes` and `searchLang` are derived. */
export interface IPost extends Document {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  lang: Locale;
  excerpt: string;
  body: string;
  bodyHtml: string;
  toc: TocEntry[];
  readingMinutes: number;
  searchLang: 'english' | 'none';
  tags: string[];
  cover: Types.ObjectId | null;
  status: PublishStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const tocEntrySubSchema = new Schema<TocEntry>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    depth: { type: Number, required: true, min: 2, max: 4 },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    lang: { type: String, enum: locale.options, required: true, default: 'en' },
    excerpt: { type: String, required: true, trim: true, maxlength: 400 },
    body: { type: String, required: true, maxlength: 100_000 },

    // Derived — see the pre-validate hook below. Never written by a client.
    bodyHtml: { type: String, default: '' },
    toc: { type: [tocEntrySubSchema], default: [] },
    readingMinutes: { type: Number, default: 1, min: 1 },
    searchLang: { type: String, enum: ['english', 'none'], default: 'none' },

    tags: { type: [String], default: [] },
    cover: { type: Schema.Types.ObjectId, ref: 'Asset', default: null },
    status: { type: String, enum: publishStatus.options, default: 'draft' },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    // Unknown fields must never persist (Technical PRD §11.3).
    strict: true,
  },
);

/**
 * Every derived field is produced here, from one renderMarkdown() call, so
 * there is exactly one place where stored HTML can come from.
 */
postSchema.pre('validate', function (next) {
  if (this.isNew || this.isModified('body')) {
    const { html, toc, readingMinutes } = renderMarkdown(this.body);
    this.bodyHtml = html;
    this.toc = toc;
    this.readingMinutes = readingMinutes;
  }

  // MongoDB ships no Uzbek stemmer, so Uzbek posts opt out of stemming rather
  // than being stemmed by English rules (see the text index below).
  if (this.isNew || this.isModified('lang')) {
    this.searchLang = this.lang === 'en' ? 'english' : 'none';
  }

  // First publish stamps the date; an explicit value always wins, which is what
  // lets a post be backdated or scheduled. Unpublishing preserves it so
  // re-publishing does not silently jump the post to the top of the feed.
  if (this.status === 'published' && this.publishedAt === null) {
    this.publishedAt = new Date();
  }

  next();
});

// Technical PRD §3.3. Below a few hundred documents Mongo will scan faster than
// it will seek; these are declared because adding indexes to a populated
// production collection is the painful direction to travel.
postSchema.index({ status: 1, publishedAt: -1, _id: -1 });
postSchema.index({ status: 1, lang: 1, publishedAt: -1, _id: -1 });
postSchema.index({ status: 1, tags: 1, publishedAt: -1 });
postSchema.index({ updatedAt: -1, _id: -1 });
postSchema.index(
  { title: 'text', excerpt: 'text', body: 'text' },
  {
    name: 'post_text',
    weights: { title: 10, excerpt: 5, body: 1 },
    // Per-document stemming. This cannot be changed later without a full index
    // rebuild, which is why it is decided up front.
    language_override: 'searchLang',
    default_language: 'none',
  },
);

export const Post = mongoose.model<IPost>('Post', postSchema);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- post-model`
Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/models/post.model.ts apps/api/src/__tests__/post-model.test.ts
git commit -m "feat(api): add Post model with derived render fields and text index"
```

---

## Task 5: Asset model and upload middleware

**Files:**
- Create: `apps/api/src/models/asset.model.ts`
- Create: `apps/api/src/middlewares/upload.middleware.ts`
- Modify: `apps/api/package.json`

**Interfaces:**
- Consumes: `assetKind`, `MAX_PDF_BYTES` from `@portfolio/shared`; `ApiError`.
- Produces: `Asset` model and `IAsset` interface (`filename, originalName, mime, size, kind, key, url, width?, height?, alt, createdAt, updatedAt`); `uploadSingle: RequestHandler` populating `req.file`.

- [ ] **Step 1: Install dependencies**

```bash
npm i -w @portfolio/api file-type image-size
```

- [ ] **Step 2: Write the model**

Create `apps/api/src/models/asset.model.ts`:

```ts
import mongoose, { type Document, Schema, type Types } from 'mongoose';
import { assetKind, type AssetKind } from '@portfolio/shared';

/**
 * Technical PRD §3.4. `key` is storage-internal and never crosses the wire —
 * clients get `url`. Keeping them separate is what lets the StorageAdapter move
 * from disk to S3 without changing a single response shape.
 */
export interface IAsset extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mime: string;
  size: number;
  kind: AssetKind;
  key: string;
  url: string;
  width?: number;
  height?: number;
  alt: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetModelSchema = new Schema<IAsset>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: assetKind.options, required: true },
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    alt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
      // Technical PRD §11.8 — the old site had an empty alt on every image.
      // Enforcing it in the schema is how it stays fixed.
      validate: {
        validator(this: IAsset, value: string): boolean {
          return this.kind !== 'image' || value.trim().length > 0;
        },
        message: 'Alt text is required for images.',
      },
    },
  },
  { timestamps: true, strict: true },
);

assetModelSchema.index({ createdAt: -1, _id: -1 });
assetModelSchema.index({ kind: 1, createdAt: -1, _id: -1 });

export const Asset = mongoose.model<IAsset>('Asset', assetModelSchema);
```

- [ ] **Step 3: Write the upload middleware**

Create `apps/api/src/middlewares/upload.middleware.ts`:

```ts
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { MAX_PDF_BYTES } from '@portfolio/shared';
import { ApiError } from '../utils/api-error.js';

/**
 * memoryStorage, NOT diskStorage — StorageAdapter.save() takes a Buffer, and
 * letting multer write to disk itself would bypass the seam and hard-code disk
 * into the upload path, which is exactly what the interface exists to prevent
 * (Technical PRD §7).
 *
 * The limit here is the larger of the two caps; the per-kind cap is applied in
 * asset.service.ts once the real MIME has been sniffed, because multer cannot
 * know whether a file is an image or a PDF before reading it.
 */
const handler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1 },
}).single('file');

export const uploadSingle: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  handler(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(
          ApiError.payloadTooLarge(
            `File is too large. The maximum is ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB.`,
          ),
        );
        return;
      }
      next(ApiError.badRequest(err.message, { file: err.message }));
      return;
    }
    next(err);
  });
};
```

- [ ] **Step 4: Verify it typechecks**

Run: `npm run typecheck -w @portfolio/api`
Expected: no errors. (Behaviour is covered end-to-end in Task 6; a model and a middleware with no route have nothing meaningful to assert in isolation.)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/models/asset.model.ts apps/api/src/middlewares/upload.middleware.ts \
        apps/api/package.json package-lock.json
git commit -m "feat(api): add Asset model and memory-storage upload middleware"
```

---

## Task 6: Asset service, reference guard and admin asset routes

**Files:**
- Create: `apps/api/src/services/references.ts`
- Create: `apps/api/src/services/asset.service.ts`
- Create: `apps/api/src/controllers/admin-asset.controller.ts`
- Create: `apps/api/src/routes/admin-asset.routes.ts`
- Modify: `apps/api/src/routes/index.ts`
- Test: `apps/api/src/__tests__/asset.test.ts`

**Interfaces:**
- Consumes: `Asset`/`IAsset` (Task 5), `uploadSingle` (Task 5), `Post` (Task 4), `storage`, `encodeCursor`/`decodeCursor`/`cursorFilter`/`toPage` (Task 3), `assetUpdateSchema`/`assetQuery`/`ALLOWED_*`/`MAX_*` from `@portfolio/shared`.
- Produces:
  - `toAssetWire(doc: IAsset): Asset` (the shared wire type)
  - `createAsset(input: { buffer: Buffer; originalName: string; alt: string }): Promise<Asset>`
  - `listAssets(query: AssetQuery): Promise<{ items: Asset[]; nextCursor: string | null }>`
  - `getAsset(id: string): Promise<Asset>`
  - `updateAssetAlt(id: string, alt: string): Promise<Asset>`
  - `deleteAsset(id: string): Promise<void>`
  - `assetReferences: AssetReference[]`
  - Router `adminAssetRouter`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/asset.test.ts`:

```ts
/**
 * Integration tests for the asset slice of M2 — the part the blog needs for
 * cover images.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads-asset';

let app: Express;
let mongo: MongoMemoryServer;
let User: typeof import('../models/user.model.js').User;
let Asset: typeof import('../models/asset.model.js').Asset;
let Post: typeof import('../models/post.model.js').Post;
let assetSchema: typeof import('@portfolio/shared').assetSchema;
let disconnectDatabase: () => Promise<void>;

/** A 1×1 red PNG — real magic bytes, so file-type sniffs it correctly. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

let cookie: string;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongo.getUri();

  const [{ createApp }, db, userMod, assetMod, postMod, shared] = await Promise.all([
    import('../app.js'),
    import('../config/db.js'),
    import('../models/user.model.js'),
    import('../models/asset.model.js'),
    import('../models/post.model.js'),
    import('@portfolio/shared'),
  ]);

  ({ User } = userMod);
  ({ Asset } = assetMod);
  ({ Post } = postMod);
  ({ assetSchema } = shared);
  ({ disconnectDatabase } = db);

  await db.connectDatabase();
  app = createApp();

  await User.create({
    email: 'admin@test.example',
    passwordHash: await bcrypt.hash('correct horse battery', 12),
    name: 'Admin',
  });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .set('X-Forwarded-For', '10.9.0.1')
    .send({ email: 'admin@test.example', password: 'correct horse battery' });

  cookie = (login.headers['set-cookie'] as unknown as string[])[0]!;
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all([Asset.deleteMany({}), Post.deleteMany({})]);
});

describe('POST /admin/assets', () => {
  it('rejects an unauthenticated upload', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .attach('file', PNG, 'cover.png')
      .field('alt', 'A red dot');
    expect(res.status).toBe(401);
  });

  it('stores an image and returns the wire shape', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .attach('file', PNG, 'cover.png')
      .field('alt', 'A red dot');

    expect(res.status).toBe(201);
    expect(() => assetSchema.parse(res.body)).not.toThrow();
    expect(res.body.kind).toBe('image');
    expect(res.body.mime).toBe('image/png');
    expect(res.body.width).toBe(1);
    expect(res.body.url).toMatch(/^\/static\/\d{4}\/\d{2}\/.+\.png$/);
  });

  it('never uses the uploaded filename on disk', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .attach('file', PNG, '../../etc/passwd.png')
      .field('alt', 'A red dot');

    expect(res.status).toBe(201);
    expect(res.body.filename).not.toContain('passwd');
    expect(res.body.filename).not.toContain('..');
  });

  it('requires alt text for an image', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .attach('file', PNG, 'cover.png')
      .field('alt', '   ');

    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('alt');
  });

  it('rejects a type outside the allow-list, whatever the client claims', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('#!/bin/sh\necho hi\n'), {
        filename: 'evil.png',
        contentType: 'image/png',
      })
      .field('alt', 'Not an image');

    expect(res.status).toBe(400);
  });

  it('rejects a request with no file', async () => {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .field('alt', 'Nothing attached');
    expect(res.status).toBe(400);
  });
});

describe('GET /admin/assets', () => {
  it('lists assets newest first with a cursor envelope', async () => {
    for (let i = 0; i < 3; i += 1) {
      await request(app)
        .post('/api/v1/admin/assets')
        .set('Cookie', cookie)
        .attach('file', PNG, `cover-${i}.png`)
        .field('alt', `Dot ${i}`);
    }

    const res = await request(app)
      .get('/api/v1/admin/assets?limit=2')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.nextCursor).not.toBeNull();

    const page2 = await request(app)
      .get(`/api/v1/admin/assets?limit=2&cursor=${encodeURIComponent(res.body.nextCursor)}`)
      .set('Cookie', cookie);

    expect(page2.body.items).toHaveLength(1);
    expect(page2.body.nextCursor).toBeNull();
  });
});

describe('PATCH and DELETE /admin/assets/:id', () => {
  async function upload(): Promise<string> {
    const res = await request(app)
      .post('/api/v1/admin/assets')
      .set('Cookie', cookie)
      .attach('file', PNG, 'cover.png')
      .field('alt', 'A red dot');
    return res.body.id as string;
  }

  it('updates alt text', async () => {
    const id = await upload();
    const res = await request(app)
      .patch(`/api/v1/admin/assets/${id}`)
      .set('Cookie', cookie)
      .send({ alt: 'A crimson dot' });

    expect(res.status).toBe(200);
    expect(res.body.alt).toBe('A crimson dot');
  });

  it('deletes an unreferenced asset', async () => {
    const id = await upload();
    expect((await request(app).delete(`/api/v1/admin/assets/${id}`).set('Cookie', cookie)).status)
      .toBe(204);
    expect(await Asset.findById(id)).toBeNull();
  });

  it('refuses to delete an asset a post still uses, naming what references it', async () => {
    const id = await upload();
    await Post.create({
      slug: 'uses-cover',
      title: 'Uses cover',
      excerpt: 'x',
      body: 'x',
      cover: id,
    });

    const res = await request(app).delete(`/api/v1/admin/assets/${id}`).set('Cookie', cookie);
    expect(res.status).toBe(409);
    expect(res.body.error.message).toContain('post');
    expect(await Asset.findById(id)).not.toBeNull();
  });

  it('404s an unknown id', async () => {
    const res = await request(app)
      .delete('/api/v1/admin/assets/507f1f77bcf86cd799439011')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('400s a malformed id', async () => {
    const res = await request(app).delete('/api/v1/admin/assets/not-an-id').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- asset`
Expected: FAIL — every request 404s; the router does not exist.

- [ ] **Step 3: Write the reference registry**

Create `apps/api/src/services/references.ts`:

```ts
import type { Model } from 'mongoose';
import { Post } from '../models/post.model.js';

export interface AssetReference {
  model: Model<never>;
  field: string;
  /** Human-readable, used in the 409 message. */
  label: string;
}

/**
 * Which documents may point at an asset. `DELETE /admin/assets/:id` walks this
 * and refuses with a 409 naming what still uses the file (Technical PRD §7).
 *
 * Projects and documents each append one line here when their milestones land;
 * nothing else needs to change.
 */
export const assetReferences: AssetReference[] = [
  { model: Post as unknown as Model<never>, field: 'cover', label: 'post' },
];
```

- [ ] **Step 4: Write the asset service**

Create `apps/api/src/services/asset.service.ts`:

```ts
import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import { Types } from 'mongoose';
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_MIME,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  type Asset as AssetWire,
  type AssetKind,
  type AssetQuery,
} from '@portfolio/shared';
import { Asset, type IAsset } from '../models/asset.model.js';
import { storage } from './storage/index.js';
import { assetReferences } from './references.js';
import { ApiError } from '../utils/api-error.js';
import { cursorFilter, decodeCursor, toPage } from '../utils/cursor.js';

function kindFor(mime: string): AssetKind {
  if ((ALLOWED_IMAGE_MIME as readonly string[]).includes(mime)) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  return 'other';
}

/** `key` is storage-internal and deliberately absent from the wire shape. */
export function toAssetWire(doc: IAsset): AssetWire {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    originalName: doc.originalName,
    mime: doc.mime,
    size: doc.size,
    kind: doc.kind,
    url: doc.url,
    ...(doc.width !== undefined && { width: doc.width }),
    ...(doc.height !== undefined && { height: doc.height }),
    alt: doc.alt,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function objectIdOrThrow(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid id', { id: 'That is not a valid identifier.' });
  }
  return new Types.ObjectId(id);
}

export async function createAsset(input: {
  buffer: Buffer;
  originalName: string;
  alt: string;
}): Promise<AssetWire> {
  // The multipart Content-Type is client-supplied. Sniff the real type from the
  // magic bytes instead (Technical PRD §7).
  const sniffed = await fileTypeFromBuffer(input.buffer);

  if (!sniffed || !(ALLOWED_MIME as readonly string[]).includes(sniffed.mime)) {
    throw ApiError.badRequest('That file type is not allowed.', {
      file: `Allowed types: ${ALLOWED_MIME.join(', ')}.`,
    });
  }

  const kind = kindFor(sniffed.mime);
  const cap = kind === 'image' ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;

  if (input.buffer.byteLength > cap) {
    throw ApiError.payloadTooLarge(
      `That ${kind} is too large. The maximum is ${Math.round(cap / 1024 / 1024)} MB.`,
    );
  }

  const alt = input.alt.trim();
  if (kind === 'image' && alt.length === 0) {
    throw ApiError.badRequest('Alt text is required for images.', {
      alt: 'Describe the image for screen readers.',
    });
  }

  let width: number | undefined;
  let height: number | undefined;
  if (kind === 'image') {
    try {
      const measured = imageSize(input.buffer);
      width = measured.width;
      height = measured.height;
    } catch {
      // AVIF and some exotic encodings are unmeasurable here. Dimensions are a
      // nicety for the media library, not a reason to reject a valid upload.
    }
  }

  const stored = await storage.save({
    buffer: input.buffer,
    mime: sniffed.mime,
    extension: sniffed.ext,
  });

  try {
    const doc = await Asset.create({
      filename: stored.filename,
      originalName: input.originalName,
      mime: stored.mime,
      size: stored.size,
      kind,
      key: stored.key,
      url: stored.url,
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      alt,
    });
    return toAssetWire(doc);
  } catch (err) {
    // Do not leave an orphaned file behind if the document fails to save.
    await storage.remove(stored.key);
    throw err;
  }
}

export async function listAssets(
  query: AssetQuery,
): Promise<{ items: AssetWire[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = {};
  if (query.kind) filter['kind'] = query.kind;
  if (query.cursor) Object.assign(filter, cursorFilter('createdAt', decodeCursor(query.cursor)));

  const rows = await Asset.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(query.limit + 1)
    .exec();

  const page = toPage(rows, query.limit, (row) => row.createdAt);
  return { items: page.items.map(toAssetWire), nextCursor: page.nextCursor };
}

export async function getAsset(id: string): Promise<AssetWire> {
  const doc = await Asset.findById(objectIdOrThrow(id)).exec();
  if (!doc) throw ApiError.notFound('Asset not found');
  return toAssetWire(doc);
}

export async function updateAssetAlt(id: string, alt: string): Promise<AssetWire> {
  const doc = await Asset.findById(objectIdOrThrow(id)).exec();
  if (!doc) throw ApiError.notFound('Asset not found');

  doc.alt = alt;
  await doc.save();
  return toAssetWire(doc);
}

export async function deleteAsset(id: string): Promise<void> {
  const objectId = objectIdOrThrow(id);
  const doc = await Asset.findById(objectId).exec();
  if (!doc) throw ApiError.notFound('Asset not found');

  for (const reference of assetReferences) {
    const count = await reference.model.countDocuments({ [reference.field]: objectId }).exec();
    if (count > 0) {
      throw ApiError.conflict(
        `This file is still used by ${count} ${reference.label}${count === 1 ? '' : 's'}. Remove it there first.`,
      );
    }
  }

  await storage.remove(doc.key);
  await doc.deleteOne();
}
```

- [ ] **Step 5: Write the controller**

Create `apps/api/src/controllers/admin-asset.controller.ts`:

```ts
import type { Request, RequestHandler, Response } from 'express';
import { assetQuery, type AssetQuery, type AssetUpdateInput } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { ApiError } from '../utils/api-error.js';
import { noStore } from '../utils/cache.js';
import * as assets from '../services/asset.service.js';

export const uploadAsset: RequestHandler = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw ApiError.badRequest('No file uploaded.', { file: 'Attach a file to upload.' });
  }

  const alt = typeof req.body?.alt === 'string' ? req.body.alt : '';
  const created = await assets.createAsset({
    buffer: file.buffer,
    originalName: file.originalname,
    alt,
  });

  res.status(201).json(created);
};

export const listAssets: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await assets.listAssets(validatedQuery<AssetQuery>(req) ?? assetQuery.parse({})));
};

export const getAsset: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await assets.getAsset(req.params['id'] as string));
};

export const patchAsset: RequestHandler = async (req: Request, res: Response) => {
  const { alt } = req.body as AssetUpdateInput;
  res.status(200).json(await assets.updateAssetAlt(req.params['id'] as string, alt));
};

export const deleteAsset: RequestHandler = async (req: Request, res: Response) => {
  await assets.deleteAsset(req.params['id'] as string);
  res.status(204).end();
};
```

- [ ] **Step 6: Write the routes**

Create `apps/api/src/routes/admin-asset.routes.ts`:

```ts
import { Router } from 'express';
import { assetQuery, assetUpdateSchema } from '@portfolio/shared';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { uploadLimiter } from '../middlewares/rate-limit.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/admin-asset.controller.js';

/** Technical PRD §4.2 — the media library. Every route is admin-only. */
export const adminAssetRouter: Router = Router();

// requireAdmin runs before multer so an anonymous caller never gets to upload
// bytes into memory in the first place.
adminAssetRouter.post(
  '/admin/assets',
  requireAdmin,
  uploadLimiter,
  uploadSingle,
  asyncHandler(controller.uploadAsset),
);

adminAssetRouter.get(
  '/admin/assets',
  requireAdmin,
  validate(assetQuery, 'query'),
  asyncHandler(controller.listAssets),
);

adminAssetRouter.get('/admin/assets/:id', requireAdmin, asyncHandler(controller.getAsset));

adminAssetRouter.patch(
  '/admin/assets/:id',
  requireAdmin,
  validate(assetUpdateSchema),
  asyncHandler(controller.patchAsset),
);

adminAssetRouter.delete('/admin/assets/:id', requireAdmin, asyncHandler(controller.deleteAsset));
```

- [ ] **Step 7: Mount the router**

Replace `apps/api/src/routes/index.ts` with:

```ts
import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { adminAssetRouter } from './admin-asset.routes.js';

/**
 * Everything under /api/v1. Feature routers land here as milestones ship:
 *   M1 authRouter · M2 assetRouter, documentRouter · M3 projectRouter
 *   M4 profileRouter · M5 postRouter · M6 contactRouter, messageRouter
 */
export const apiRouter: Router = Router();

apiRouter.use(healthRouter);
// M1 — auth
apiRouter.use(authRouter);
// M2 (partial) — assets, pulled forward because post covers reference them
apiRouter.use(adminAssetRouter);
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- asset`
Expected: PASS, 13 tests.

- [ ] **Step 9: Commit**

```bash
git add apps/api/src/services/references.ts apps/api/src/services/asset.service.ts \
        apps/api/src/controllers/admin-asset.controller.ts \
        apps/api/src/routes/admin-asset.routes.ts apps/api/src/routes/index.ts \
        apps/api/src/__tests__/asset.test.ts
git commit -m "feat(api): add asset upload pipeline with MIME sniffing and reference guard"
```

---

## Task 7: Post service

All post data access and serialisation. No HTTP.

**Files:**
- Create: `apps/api/src/services/post.service.ts`

**Interfaces:**
- Consumes: `Post`/`IPost` (Task 4), `toAssetWire`/`IAsset` (Tasks 5–6), `publishFilter` (Task 3), cursor helpers (Task 3), post schemas (Task 1).
- Produces:
  - `toPostSummary(doc: IPost): PostSummary`
  - `toPostDetail(doc: IPost, neighbours: { prev: PostLink | null; next: PostLink | null }): PostDetail`
  - `toAdminPost(doc: IPost): AdminPost`
  - `listPublishedPosts(query: PostQuery): Promise<{ items: PostSummary[]; nextCursor: string | null }>`
  - `getPublishedPost(slug: string): Promise<PostDetail>`
  - `listTags(lang?: Locale): Promise<TagCount[]>`
  - `listAllPosts(query: AdminPostQuery): Promise<{ items: AdminPost[]; nextCursor: string | null }>`
  - `getPostById(id: string): Promise<AdminPost>`
  - `createPost(input: PostInput): Promise<AdminPost>`
  - `updatePost(id: string, patch: PostPatch): Promise<AdminPost>`
  - `deletePost(id: string): Promise<void>`
  - `recentPublishedDocs(lang?: Locale, limit?: number): Promise<IPost[]>` — used by the feed in Task 10
  - `SEARCH_LIMIT: number`

- [ ] **Step 1: Write the service**

Create `apps/api/src/services/post.service.ts`:

```ts
import { Types } from 'mongoose';
import type {
  AdminPost,
  AdminPostQuery,
  Locale,
  PostDetail,
  PostInput,
  PostLink,
  PostPatch,
  PostQuery,
  PostSummary,
  TagCount,
} from '@portfolio/shared';
import { Post, type IPost } from '../models/post.model.js';
import type { IAsset } from '../models/asset.model.js';
import { toAssetWire } from './asset.service.js';
import { publishFilter } from '../utils/publish-filter.js';
import { cursorFilter, decodeCursor, toPage } from '../utils/cursor.js';
import { ApiError } from '../utils/api-error.js';

/**
 * Relevance ordering is incompatible with a timestamp cursor, so search returns
 * one capped page (design doc §10). The response shape is unchanged — nextCursor
 * is simply always null.
 */
export const SEARCH_LIMIT = 20;

// ─── Serialisers ─────────────────────────────────────────────────────────────

/** After .populate('cover') the field holds a document; unpopulated it is an id. */
function coverOf(cover: unknown) {
  if (!cover || cover instanceof Types.ObjectId) return null;
  return toAssetWire(cover as IAsset);
}

function commonFields(doc: IPost) {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    lang: doc.lang,
    excerpt: doc.excerpt,
    tags: doc.tags,
    cover: coverOf(doc.cover),
    readingMinutes: doc.readingMinutes,
  };
}

/** Public only — a published post always has a publication date. */
export function toPostSummary(doc: IPost): PostSummary {
  return {
    ...commonFields(doc),
    publishedAt: (doc.publishedAt ?? doc.createdAt).toISOString(),
  };
}

export function toPostDetail(
  doc: IPost,
  neighbours: { prev: PostLink | null; next: PostLink | null },
): PostDetail {
  return {
    ...toPostSummary(doc),
    bodyHtml: doc.bodyHtml,
    toc: doc.toc,
    prev: neighbours.prev,
    next: neighbours.next,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/** Admin reads carry raw markdown and may legitimately have no publication date. */
export function toAdminPost(doc: IPost): AdminPost {
  return {
    ...commonFields(doc),
    body: doc.body,
    bodyHtml: doc.bodyHtml,
    toc: doc.toc,
    status: doc.status,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function objectIdOrThrow(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid id', { id: 'That is not a valid identifier.' });
  }
  return new Types.ObjectId(id);
}

/** Mongo signals a slug collision as error 11000; turn it into a field error. */
function rethrowDuplicateSlug(err: unknown): never {
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    throw ApiError.conflict('A post with that slug already exists', {
      slug: 'This slug is taken. Choose another.',
    });
  }
  throw err;
}

// ─── Public reads ────────────────────────────────────────────────────────────

export async function listPublishedPosts(
  query: PostQuery,
): Promise<{ items: PostSummary[]; nextCursor: string | null }> {
  const base: Record<string, unknown> = { ...publishFilter() };
  if (query.lang) base['lang'] = query.lang;
  if (query.tag) base['tags'] = query.tag;

  if (query.q) {
    const rows = await Post.find(
      { ...base, $text: { $search: query.q } },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(SEARCH_LIMIT)
      .populate('cover')
      .exec();

    return { items: rows.map(toPostSummary), nextCursor: null };
  }

  if (query.cursor) Object.assign(base, cursorFilter('publishedAt', decodeCursor(query.cursor)));

  const rows = await Post.find(base)
    .sort({ publishedAt: -1, _id: -1 })
    .limit(query.limit + 1)
    .populate('cover')
    .exec();

  const page = toPage(rows, query.limit, (row) => row.publishedAt ?? row.createdAt);
  return { items: page.items.map(toPostSummary), nextCursor: page.nextCursor };
}

export async function getPublishedPost(slug: string): Promise<PostDetail> {
  const doc = await Post.findOne({ ...publishFilter(), slug }).populate('cover').exec();
  if (!doc) throw ApiError.notFound('Post not found');

  const publishedAt = doc.publishedAt ?? doc.createdAt;
  const now = new Date();

  // `prev` is the newer post and `next` the older one, matching the reading
  // order of a newest-first index. Both go through publishFilter's rules so a
  // draft cannot leak sideways through a neighbour link.
  const [prev, next] = await Promise.all([
    Post.findOne({
      status: 'published',
      lang: doc.lang,
      publishedAt: { $gt: publishedAt, $lte: now },
    })
      .sort({ publishedAt: 1 })
      .select('slug title')
      .lean()
      .exec(),
    Post.findOne({
      status: 'published',
      lang: doc.lang,
      publishedAt: { $lt: publishedAt },
    })
      .sort({ publishedAt: -1 })
      .select('slug title')
      .lean()
      .exec(),
  ]);

  return toPostDetail(doc, {
    prev: prev ? { slug: prev.slug, title: prev.title } : null,
    next: next ? { slug: next.slug, title: next.title } : null,
  });
}

export async function listTags(lang?: Locale): Promise<TagCount[]> {
  const match: Record<string, unknown> = { ...publishFilter() };
  if (lang) match['lang'] = lang;

  const rows = await Post.aggregate<{ _id: string; count: number }>([
    { $match: match },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]).exec();

  return rows.map((row) => ({ tag: row._id, count: row.count }));
}

/**
 * Used by the feed. Newest first, no pagination. Returns documents rather than
 * summaries because an Atom entry needs `bodyHtml`, which the summary shape
 * deliberately omits.
 */
export async function recentPublishedDocs(lang?: Locale, limit = 20): Promise<IPost[]> {
  const filter: Record<string, unknown> = { ...publishFilter() };
  if (lang) filter['lang'] = lang;

  return Post.find(filter).sort({ publishedAt: -1, _id: -1 }).limit(limit).exec();
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function listAllPosts(
  query: AdminPostQuery,
): Promise<{ items: AdminPost[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = {};
  if (query.status) filter['status'] = query.status;
  if (query.lang) filter['lang'] = query.lang;
  if (query.q) filter['$text'] = { $search: query.q };
  if (query.cursor) Object.assign(filter, cursorFilter('updatedAt', decodeCursor(query.cursor)));

  const rows = await Post.find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(query.limit + 1)
    .populate('cover')
    .exec();

  const page = toPage(rows, query.limit, (row) => row.updatedAt);
  return { items: page.items.map(toAdminPost), nextCursor: page.nextCursor };
}

export async function getPostById(id: string): Promise<AdminPost> {
  const doc = await Post.findById(objectIdOrThrow(id)).populate('cover').exec();
  if (!doc) throw ApiError.notFound('Post not found');
  return toAdminPost(doc);
}

export async function createPost(input: PostInput): Promise<AdminPost> {
  try {
    const doc = await Post.create({
      ...input,
      cover: input.cover ? new Types.ObjectId(input.cover) : null,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    });
    await doc.populate('cover');
    return toAdminPost(doc);
  } catch (err) {
    rethrowDuplicateSlug(err);
  }
}

export async function updatePost(id: string, patch: PostPatch): Promise<AdminPost> {
  const doc = await Post.findById(objectIdOrThrow(id)).exec();
  if (!doc) throw ApiError.notFound('Post not found');

  if (patch.slug !== undefined) doc.slug = patch.slug;
  if (patch.title !== undefined) doc.title = patch.title;
  if (patch.lang !== undefined) doc.lang = patch.lang;
  if (patch.excerpt !== undefined) doc.excerpt = patch.excerpt;
  if (patch.body !== undefined) doc.body = patch.body;
  if (patch.tags !== undefined) doc.tags = patch.tags;
  if (patch.status !== undefined) doc.status = patch.status;
  if (patch.cover !== undefined) {
    doc.cover = patch.cover ? new Types.ObjectId(patch.cover) : null;
  }
  if (patch.publishedAt !== undefined) {
    doc.publishedAt = patch.publishedAt ? new Date(patch.publishedAt) : null;
  }

  try {
    await doc.save();
  } catch (err) {
    rethrowDuplicateSlug(err);
  }

  await doc.populate('cover');
  return toAdminPost(doc);
}

export async function deletePost(id: string): Promise<void> {
  const result = await Post.findByIdAndDelete(objectIdOrThrow(id)).exec();
  if (!result) throw ApiError.notFound('Post not found');
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npm run typecheck -w @portfolio/api`
Expected: no errors. (Behaviour is asserted through the HTTP tests in Tasks 8–9, which is where these functions are actually reachable.)

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/services/post.service.ts
git commit -m "feat(api): add post service with cursor lists, neighbours, tags and search"
```

---

## Task 8: Public post routes

**Files:**
- Create: `apps/api/src/controllers/post.controller.ts`
- Create: `apps/api/src/routes/post.routes.ts`
- Modify: `apps/api/src/routes/index.ts`
- Test: `apps/api/src/__tests__/post-public.test.ts`

**Interfaces:**
- Consumes: `post.service.ts` (Task 7), `publicCache` (Task 3), `postQuery`/`postTagsQuery` (Task 1).
- Produces: `postRouter` serving `GET /posts`, `GET /posts/tags`, `GET /posts/:slug`. (`/posts/feed.xml` is added in Task 10.)

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/post-public.test.ts`:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads-public';

let app: Express;
let mongo: MongoMemoryServer;
let Post: typeof import('../models/post.model.js').Post;
let shared: typeof import('@portfolio/shared');
let disconnectDatabase: () => Promise<void>;

const day = (n: number) => new Date(Date.UTC(2026, 0, n, 12, 0, 0));

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongo.getUri();

  const [{ createApp }, db, postMod, sharedMod] = await Promise.all([
    import('../app.js'),
    import('../config/db.js'),
    import('../models/post.model.js'),
    import('@portfolio/shared'),
  ]);

  ({ Post } = postMod);
  shared = sharedMod;
  ({ disconnectDatabase } = db);

  await db.connectDatabase();
  await Post.syncIndexes();
  app = createApp();
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo.stop();
});

beforeEach(async () => {
  await Post.deleteMany({});
});

async function seed(): Promise<void> {
  await Post.create([
    {
      slug: 'oldest', title: 'Oldest', lang: 'en', excerpt: 'First.',
      body: 'Prose about typography.', tags: ['craft'],
      status: 'published', publishedAt: day(1),
    },
    {
      slug: 'middle', title: 'Middle', lang: 'en', excerpt: 'Second.',
      body: 'Prose about tooling.', tags: ['craft', 'tools'],
      status: 'published', publishedAt: day(2),
    },
    {
      slug: 'newest', title: 'Newest', lang: 'uz', excerpt: 'Uchinchi.',
      body: 'Matn.', tags: ['tools'],
      status: 'published', publishedAt: day(3),
    },
    {
      slug: 'a-draft', title: 'A draft', lang: 'en', excerpt: 'Hidden.',
      body: 'Unfinished prose about typography.', tags: ['craft'], status: 'draft',
    },
    {
      slug: 'scheduled', title: 'Scheduled', lang: 'en', excerpt: 'Later.',
      body: 'Future prose.', tags: ['craft'],
      status: 'published', publishedAt: new Date(Date.now() + 86_400_000),
    },
  ]);
}

describe('GET /posts', () => {
  it('returns published posts newest first, matching the wire schema', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts');

    expect(res.status).toBe(200);
    expect(() => shared.postListSchema.parse(res.body)).not.toThrow();
    expect(res.body.items.map((p: { slug: string }) => p.slug)).toEqual([
      'newest', 'middle', 'oldest',
    ]);
  });

  it('omits drafts and future-dated posts', async () => {
    await seed();
    const slugs = (await request(app).get('/api/v1/posts')).body.items.map(
      (p: { slug: string }) => p.slug,
    );
    expect(slugs).not.toContain('a-draft');
    expect(slugs).not.toContain('scheduled');
  });

  it('filters by language', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts?lang=uz');
    expect(res.body.items.map((p: { slug: string }) => p.slug)).toEqual(['newest']);
  });

  it('filters by tag', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts?tag=tools');
    expect(res.body.items.map((p: { slug: string }) => p.slug)).toEqual(['newest', 'middle']);
  });

  it('paginates across a cursor boundary without skipping or repeating', async () => {
    await seed();
    const page1 = await request(app).get('/api/v1/posts?limit=2');
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.nextCursor).not.toBeNull();

    const page2 = await request(app).get(
      `/api/v1/posts?limit=2&cursor=${encodeURIComponent(page1.body.nextCursor)}`,
    );
    expect(page2.body.items.map((p: { slug: string }) => p.slug)).toEqual(['oldest']);
    expect(page2.body.nextCursor).toBeNull();
  });

  it('paginates correctly when two posts share a publication timestamp', async () => {
    const tied = day(5);
    await Post.create([
      { slug: 'tie-a', title: 'Tie A', excerpt: 'x', body: 'x', status: 'published', publishedAt: tied },
      { slug: 'tie-b', title: 'Tie B', excerpt: 'x', body: 'x', status: 'published', publishedAt: tied },
      { slug: 'tie-c', title: 'Tie C', excerpt: 'x', body: 'x', status: 'published', publishedAt: tied },
    ]);

    const seen: string[] = [];
    let cursor: string | null = null;
    for (let i = 0; i < 5; i += 1) {
      const url: string = `/api/v1/posts?limit=1${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
      const res = await request(app).get(url);
      seen.push(...res.body.items.map((p: { slug: string }) => p.slug));
      cursor = res.body.nextCursor;
      if (!cursor) break;
    }

    expect(seen).toHaveLength(3);
    expect(new Set(seen).size).toBe(3);
  });

  it('rejects a malformed cursor rather than silently returning everything', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts?cursor=!!!not-a-cursor!!!');
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('cursor');
  });

  it('searches by relevance and never paginates', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts?q=typography');
    expect(res.status).toBe(200);
    expect(res.body.nextCursor).toBeNull();
    const slugs = res.body.items.map((p: { slug: string }) => p.slug);
    expect(slugs).toContain('oldest');
    expect(slugs).not.toContain('a-draft');
  });

  it('sets a short public cache header', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts');
    expect(res.headers['cache-control']).toContain('public');
  });
});

describe('GET /posts/tags', () => {
  it('counts tags across published posts only', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/tags');

    expect(res.status).toBe(200);
    res.body.forEach((row: unknown) => {
      expect(() => shared.tagCountSchema.parse(row)).not.toThrow();
    });
    // 'craft' appears on oldest + middle only — not on the draft or the scheduled post.
    expect(res.body).toContainEqual({ tag: 'craft', count: 2 });
    expect(res.body).toContainEqual({ tag: 'tools', count: 2 });
  });

  it('scopes counts to a language', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/tags?lang=uz');
    expect(res.body).toEqual([{ tag: 'tools', count: 1 }]);
  });
});

describe('GET /posts/:slug', () => {
  it('returns the detail shape with rendered html and no raw markdown', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/middle');

    expect(res.status).toBe(200);
    expect(() => shared.postDetailSchema.parse(res.body)).not.toThrow();
    expect(res.body.bodyHtml).toContain('<p>');
    expect(res.body).not.toHaveProperty('body');
  });

  it('links the newer post as prev and the older as next, within one language', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/middle');
    expect(res.body.prev).toBeNull();          // 'newest' is Uzbek
    expect(res.body.next).toEqual({ slug: 'oldest', title: 'Oldest' });
  });

  it('returns null neighbours at the ends of the archive', async () => {
    await Post.create({
      slug: 'only', title: 'Only', excerpt: 'x', body: 'x',
      status: 'published', publishedAt: day(1),
    });
    const res = await request(app).get('/api/v1/posts/only');
    expect(res.body.prev).toBeNull();
    expect(res.body.next).toBeNull();
  });

  it('never links a draft as a neighbour', async () => {
    await Post.create([
      { slug: 'first', title: 'First', excerpt: 'x', body: 'x', status: 'published', publishedAt: day(1) },
      { slug: 'hidden', title: 'Hidden', excerpt: 'x', body: 'x', status: 'draft' },
      { slug: 'third', title: 'Third', excerpt: 'x', body: 'x', status: 'published', publishedAt: day(3) },
    ]);
    const res = await request(app).get('/api/v1/posts/first');
    expect(res.body.prev).toEqual({ slug: 'third', title: 'Third' });
  });

  it('404s a draft requested by slug', async () => {
    await seed();
    expect((await request(app).get('/api/v1/posts/a-draft')).status).toBe(404);
  });

  it('404s a future-dated post requested by slug', async () => {
    await seed();
    expect((await request(app).get('/api/v1/posts/scheduled')).status).toBe(404);
  });

  it('404s an unknown slug', async () => {
    expect((await request(app).get('/api/v1/posts/nope')).status).toBe(404);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- post-public`
Expected: FAIL — all routes 404; `postRouter` does not exist.

- [ ] **Step 3: Write the controller**

Create `apps/api/src/controllers/post.controller.ts`:

```ts
import type { Request, RequestHandler, Response } from 'express';
import type { PostQuery, PostTagsQuery } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { publicCache } from '../utils/cache.js';
import * as posts from '../services/post.service.js';

export const listPosts: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res);
  res.status(200).json(await posts.listPublishedPosts(validatedQuery<PostQuery>(req)));
};

export const listTags: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res, 300);
  res.status(200).json(await posts.listTags(validatedQuery<PostTagsQuery>(req).lang));
};

export const getPost: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res);
  res.status(200).json(await posts.getPublishedPost(req.params['slug'] as string));
};
```

- [ ] **Step 4: Write the routes**

Create `apps/api/src/routes/post.routes.ts`:

```ts
import { Router } from 'express';
import { postQuery, postTagsQuery } from '@portfolio/shared';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/post.controller.js';

/**
 * Public blog reads — Technical PRD §4.1.
 *
 * ORDER MATTERS. Express matches in declaration order, so every literal path
 * under /posts must be registered before /posts/:slug — otherwise a request for
 * /posts/tags is matched as a slug and 404s as "post not found".
 */
export const postRouter: Router = Router();

postRouter.get('/posts', validate(postQuery, 'query'), asyncHandler(controller.listPosts));
postRouter.get('/posts/tags', validate(postTagsQuery, 'query'), asyncHandler(controller.listTags));
// /posts/feed.xml is registered here in Task 10 — also before /posts/:slug.
postRouter.get('/posts/:slug', asyncHandler(controller.getPost));
```

- [ ] **Step 5: Mount the router**

In `apps/api/src/routes/index.ts`, add the import and the mount:

```ts
import { postRouter } from './post.routes.js';
```

and after the asset mount:

```ts
// M5 — blog, public reads
apiRouter.use(postRouter);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- post-public`
Expected: PASS, 18 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/controllers/post.controller.ts apps/api/src/routes/post.routes.ts \
        apps/api/src/routes/index.ts apps/api/src/__tests__/post-public.test.ts
git commit -m "feat(api): add public post list, tag index and detail endpoints"
```

---

## Task 9: Admin post routes

**Files:**
- Create: `apps/api/src/controllers/admin-post.controller.ts`
- Create: `apps/api/src/routes/admin-post.routes.ts`
- Modify: `apps/api/src/routes/index.ts`
- Test: `apps/api/src/__tests__/post-admin.test.ts`

**Interfaces:**
- Consumes: `post.service.ts` (Task 7), `requireAdmin`, `noStore` (Task 3), `postInputSchema`/`postPatchSchema`/`adminPostQuery` (Task 1).
- Produces: `adminPostRouter` serving `GET|POST /admin/posts` and `GET|PATCH|DELETE /admin/posts/:id`.

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/__tests__/post-admin.test.ts`:

```ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import type { Express } from 'express';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads-admin';

let app: Express;
let mongo: MongoMemoryServer;
let Post: typeof import('../models/post.model.js').Post;
let User: typeof import('../models/user.model.js').User;
let shared: typeof import('@portfolio/shared');
let disconnectDatabase: () => Promise<void>;
let cookie: string;

const draft = {
  slug: 'a-new-note',
  title: 'A new note',
  lang: 'en',
  excerpt: 'Something short.',
  body: '## Heading\n\nSome prose.',
  tags: ['craft'],
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env['MONGODB_URI'] = mongo.getUri();

  const [{ createApp }, db, postMod, userMod, sharedMod] = await Promise.all([
    import('../app.js'),
    import('../config/db.js'),
    import('../models/post.model.js'),
    import('../models/user.model.js'),
    import('@portfolio/shared'),
  ]);

  ({ Post } = postMod);
  ({ User } = userMod);
  shared = sharedMod;
  ({ disconnectDatabase } = db);

  await db.connectDatabase();
  await Post.syncIndexes();
  app = createApp();

  await User.create({
    email: 'admin@test.example',
    passwordHash: await bcrypt.hash('correct horse battery', 12),
    name: 'Admin',
  });

  const login = await request(app)
    .post('/api/v1/auth/login')
    .set('X-Forwarded-For', '10.9.1.1')
    .send({ email: 'admin@test.example', password: 'correct horse battery' });

  cookie = (login.headers['set-cookie'] as unknown as string[])[0]!;
});

afterAll(async () => {
  await disconnectDatabase();
  await mongo.stop();
});

beforeEach(async () => {
  await Post.deleteMany({});
});

describe('admin post routes require the cookie', () => {
  it.each([
    ['get', '/api/v1/admin/posts'],
    ['post', '/api/v1/admin/posts'],
    ['get', '/api/v1/admin/posts/507f1f77bcf86cd799439011'],
    ['patch', '/api/v1/admin/posts/507f1f77bcf86cd799439011'],
    ['delete', '/api/v1/admin/posts/507f1f77bcf86cd799439011'],
  ])('%s %s → 401 without a cookie', async (method, path) => {
    const res = await (request(app) as never as Record<string, (p: string) => Promise<{ status: number }>>)[
      method
    ]!(path);
    expect(res.status).toBe(401);
  });
});

describe('POST /admin/posts', () => {
  it('creates a draft and returns the admin shape', async () => {
    const res = await request(app).post('/api/v1/admin/posts').set('Cookie', cookie).send(draft);

    expect(res.status).toBe(201);
    expect(() => shared.adminPostSchema.parse(res.body)).not.toThrow();
    expect(res.body.status).toBe('draft');
    expect(res.body.publishedAt).toBeNull();
    expect(res.body.body).toBe(draft.body);
    expect(res.body.bodyHtml).toContain('id="heading"');
    expect(res.body.readingMinutes).toBe(1);
  });

  it('409s a duplicate slug with a field-level message', async () => {
    await request(app).post('/api/v1/admin/posts').set('Cookie', cookie).send(draft);
    const res = await request(app)
      .post('/api/v1/admin/posts')
      .set('Cookie', cookie)
      .send({ ...draft, title: 'Different title' });

    expect(res.status).toBe(409);
    expect(res.body.error.fields).toHaveProperty('slug');
  });

  it('400s an invalid slug with the error mapped to the field', async () => {
    const res = await request(app)
      .post('/api/v1/admin/posts')
      .set('Cookie', cookie)
      .send({ ...draft, slug: 'Not A Slug' });

    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('slug');
  });

  it('400s a missing body', async () => {
    const { body: _omitted, ...withoutBody } = draft;
    const res = await request(app)
      .post('/api/v1/admin/posts')
      .set('Cookie', cookie)
      .send(withoutBody);
    expect(res.status).toBe(400);
  });
});

describe('GET /admin/posts', () => {
  it('includes drafts, newest-updated first, in the admin envelope', async () => {
    await Post.create([
      { ...draft, slug: 'one', title: 'One' },
      { ...draft, slug: 'two', title: 'Two', status: 'published' },
    ]);

    const res = await request(app).get('/api/v1/admin/posts').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(() => shared.adminPostListSchema.parse(res.body)).not.toThrow();
    expect(res.body.items).toHaveLength(2);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('filters by status', async () => {
    await Post.create([
      { ...draft, slug: 'one', title: 'One' },
      { ...draft, slug: 'two', title: 'Two', status: 'published' },
    ]);

    const res = await request(app).get('/api/v1/admin/posts?status=draft').set('Cookie', cookie);
    expect(res.body.items.map((p: { slug: string }) => p.slug)).toEqual(['one']);
  });
});

describe('PATCH /admin/posts/:id', () => {
  async function create(): Promise<string> {
    const res = await request(app).post('/api/v1/admin/posts').set('Cookie', cookie).send(draft);
    return res.body.id as string;
  }

  it('re-renders bodyHtml and the toc when the body changes', async () => {
    const id = await create();
    const res = await request(app)
      .patch(`/api/v1/admin/posts/${id}`)
      .set('Cookie', cookie)
      .send({ body: '## Renamed\n\nNew prose.' });

    expect(res.status).toBe(200);
    expect(res.body.toc).toEqual([{ id: 'renamed', text: 'Renamed', depth: 2 }]);
    expect(res.body.bodyHtml).toContain('id="renamed"');
  });

  it('stamps publishedAt when the post is first published, making it publicly visible', async () => {
    const id = await create();
    const res = await request(app)
      .patch(`/api/v1/admin/posts/${id}`)
      .set('Cookie', cookie)
      .send({ status: 'published' });

    expect(res.body.publishedAt).not.toBeNull();
    expect((await request(app).get(`/api/v1/posts/${draft.slug}`)).status).toBe(200);
  });

  it('hides the post again when it is unpublished, keeping its original date', async () => {
    const id = await create();
    const published = await request(app)
      .patch(`/api/v1/admin/posts/${id}`)
      .set('Cookie', cookie)
      .send({ status: 'published' });

    const unpublished = await request(app)
      .patch(`/api/v1/admin/posts/${id}`)
      .set('Cookie', cookie)
      .send({ status: 'draft' });

    expect(unpublished.body.publishedAt).toBe(published.body.publishedAt);
    expect((await request(app).get(`/api/v1/posts/${draft.slug}`)).status).toBe(404);
  });

  it('accepts an explicit backdated publishedAt', async () => {
    const id = await create();
    const res = await request(app)
      .patch(`/api/v1/admin/posts/${id}`)
      .set('Cookie', cookie)
      .send({ status: 'published', publishedAt: '2020-01-01T00:00:00.000Z' });

    expect(res.body.publishedAt).toBe('2020-01-01T00:00:00.000Z');
  });

  it('404s an unknown id and 400s a malformed one', async () => {
    expect(
      (await request(app)
        .patch('/api/v1/admin/posts/507f1f77bcf86cd799439011')
        .set('Cookie', cookie)
        .send({ title: 'x' })).status,
    ).toBe(404);

    expect(
      (await request(app)
        .patch('/api/v1/admin/posts/not-an-id')
        .set('Cookie', cookie)
        .send({ title: 'x' })).status,
    ).toBe(400);
  });
});

describe('DELETE /admin/posts/:id', () => {
  it('removes the post', async () => {
    const created = await request(app).post('/api/v1/admin/posts').set('Cookie', cookie).send(draft);
    const res = await request(app)
      .delete(`/api/v1/admin/posts/${created.body.id}`)
      .set('Cookie', cookie);

    expect(res.status).toBe(204);
    expect(await Post.findById(created.body.id)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- post-admin`
Expected: FAIL — `adminPostRouter` does not exist, so every admin route 404s.

- [ ] **Step 3: Write the controller**

Create `apps/api/src/controllers/admin-post.controller.ts`:

```ts
import type { Request, RequestHandler, Response } from 'express';
import type { AdminPostQuery, PostInput, PostPatch } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { noStore } from '../utils/cache.js';
import * as posts from '../services/post.service.js';

export const listPosts: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await posts.listAllPosts(validatedQuery<AdminPostQuery>(req)));
};

export const getPost: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await posts.getPostById(req.params['id'] as string));
};

export const createPost: RequestHandler = async (req: Request, res: Response) => {
  res.status(201).json(await posts.createPost(req.body as PostInput));
};

export const patchPost: RequestHandler = async (req: Request, res: Response) => {
  res.status(200).json(await posts.updatePost(req.params['id'] as string, req.body as PostPatch));
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
  await posts.deletePost(req.params['id'] as string);
  res.status(204).end();
};
```

- [ ] **Step 4: Write the routes**

Create `apps/api/src/routes/admin-post.routes.ts`:

```ts
import { Router } from 'express';
import { adminPostQuery, postInputSchema, postPatchSchema } from '@portfolio/shared';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/admin-post.controller.js';

/** Technical PRD §4.2 — full CRUD over posts, drafts included. */
export const adminPostRouter: Router = Router();

adminPostRouter.get(
  '/admin/posts',
  requireAdmin,
  validate(adminPostQuery, 'query'),
  asyncHandler(controller.listPosts),
);

adminPostRouter.post(
  '/admin/posts',
  requireAdmin,
  validate(postInputSchema),
  asyncHandler(controller.createPost),
);

adminPostRouter.get('/admin/posts/:id', requireAdmin, asyncHandler(controller.getPost));

adminPostRouter.patch(
  '/admin/posts/:id',
  requireAdmin,
  validate(postPatchSchema),
  asyncHandler(controller.patchPost),
);

adminPostRouter.delete('/admin/posts/:id', requireAdmin, asyncHandler(controller.deletePost));
```

- [ ] **Step 5: Mount the router**

In `apps/api/src/routes/index.ts`, add the import and mount it after `postRouter`:

```ts
import { adminPostRouter } from './admin-post.routes.js';
```
```ts
// M5 — blog, admin CRUD
apiRouter.use(adminPostRouter);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- post-admin`
Expected: PASS, 16 tests.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/controllers/admin-post.controller.ts \
        apps/api/src/routes/admin-post.routes.ts apps/api/src/routes/index.ts \
        apps/api/src/__tests__/post-admin.test.ts
git commit -m "feat(api): add admin post CRUD with publish transitions"
```

---

## Task 10: Atom feed

**Files:**
- Create: `apps/api/src/services/feed.service.ts`
- Modify: `apps/api/src/config/env.ts`
- Modify: `apps/api/.env.example`
- Modify: `apps/api/src/controllers/post.controller.ts`
- Modify: `apps/api/src/routes/post.routes.ts`
- Test: `apps/api/src/__tests__/post-public.test.ts` (append a describe block)

**Interfaces:**
- Consumes: `recentPublishedDocs` (Task 7), `IPost` (Task 4), `env.PUBLIC_SITE_URL`.
- Produces: `escapeXml(value: string): string`, `buildAtomFeed(posts: IPost[], options: { siteUrl: string; feedUrl: string }): string`, and `getFeed: RequestHandler`.

- [ ] **Step 1: Add the environment variable**

In `apps/api/src/config/env.ts`, add to `envSchema` after `CORS_ORIGIN`:

```ts
  /** Absolute origin of the public site. The feed links to /writing/:slug there,
   *  not to the API. */
  PUBLIC_SITE_URL: z.url().default('http://localhost:5173'),
```

Append to `apps/api/.env.example`:

```
# Absolute origin of the public site — used for links in the Atom feed
PUBLIC_SITE_URL=http://localhost:5173
```

- [ ] **Step 2: Write the failing test**

Append to `apps/api/src/__tests__/post-public.test.ts`:

```ts
describe('GET /posts/feed.xml', () => {
  it('serves Atom XML for published posts only', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/feed.xml');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/atom+xml');
    expect(res.text).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(res.text).toContain('<title>Middle</title>');
    expect(res.text).not.toContain('A draft');
    expect(res.text).not.toContain('Scheduled');
  });

  it('links entries at the public site, not the API', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/feed.xml');
    expect(res.text).toContain('http://localhost:5173/writing/middle');
  });

  it('filters by language', async () => {
    await seed();
    const res = await request(app).get('/api/v1/posts/feed.xml?lang=uz');
    expect(res.text).toContain('<title>Newest</title>');
    expect(res.text).not.toContain('<title>Middle</title>');
  });

  it('escapes markup in titles rather than emitting invalid XML', async () => {
    await Post.create({
      slug: 'sharp', title: 'Types & <angle> brackets', excerpt: 'x', body: 'x',
      status: 'published', publishedAt: day(1),
    });
    const res = await request(app).get('/api/v1/posts/feed.xml');
    expect(res.text).toContain('Types &amp; &lt;angle&gt; brackets');
  });

  it('resolves before the :slug route rather than being read as a post slug', async () => {
    const res = await request(app).get('/api/v1/posts/feed.xml');
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -w @portfolio/api -- post-public`
Expected: FAIL — `/posts/feed.xml` returns 404 (matched as a slug).

- [ ] **Step 4: Write the feed service**

Create `apps/api/src/services/feed.service.ts`:

```ts
import type { IPost } from '../models/post.model.js';

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char] ?? char);
}

/**
 * Atom 1.0, hand-built — the whole format is five elements and a dependency
 * would not earn its place.
 *
 * A client-rendered SPA is effectively invisible to crawlers (Technical PRD
 * §13.4). A feed is the cheapest available mitigation.
 */
export function buildAtomFeed(
  posts: IPost[],
  options: { siteUrl: string; feedUrl: string; title?: string },
): string {
  const site = options.siteUrl.replace(/\/$/, '');
  const updated = posts[0]?.updatedAt ?? new Date();

  const entries = posts
    .map((post) => {
      const url = `${site}/writing/${post.slug}`;
      const published = (post.publishedAt ?? post.createdAt).toISOString();
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <id>${escapeXml(url)}</id>
    <link rel="alternate" type="text/html" href="${escapeXml(url)}"/>
    <published>${published}</published>
    <updated>${post.updatedAt.toISOString()}</updated>
    <summary type="text">${escapeXml(post.excerpt)}</summary>
    <content type="html">${escapeXml(post.bodyHtml)}</content>
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(options.title ?? 'Writing')}</title>
  <id>${escapeXml(options.feedUrl)}</id>
  <link rel="self" type="application/atom+xml" href="${escapeXml(options.feedUrl)}"/>
  <link rel="alternate" type="text/html" href="${escapeXml(`${site}/writing`)}"/>
  <updated>${updated.toISOString()}</updated>
${entries}
</feed>
`;
}
```

- [ ] **Step 5: Add the controller handler**

Append to `apps/api/src/controllers/post.controller.ts` (and add the two imports at the top):

```ts
import { env } from '../config/env.js';
import { buildAtomFeed } from '../services/feed.service.js';
```

```ts
export const getFeed: RequestHandler = async (req: Request, res: Response) => {
  const { lang } = validatedQuery<PostTagsQuery>(req);
  const docs = await posts.recentPublishedDocs(lang, 20);

  res.set('Content-Type', 'application/atom+xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=1800');
  res.status(200).send(
    buildAtomFeed(docs, {
      siteUrl: env.PUBLIC_SITE_URL,
      feedUrl: `${env.PUBLIC_SITE_URL.replace(/\/$/, '')}/writing/feed.xml`,
    }),
  );
};
```

- [ ] **Step 6: Register the route before `:slug`**

In `apps/api/src/routes/post.routes.ts`, replace the placeholder comment with the route, so the file reads:

```ts
postRouter.get('/posts', validate(postQuery, 'query'), asyncHandler(controller.listPosts));
postRouter.get('/posts/tags', validate(postTagsQuery, 'query'), asyncHandler(controller.listTags));
postRouter.get('/posts/feed.xml', validate(postTagsQuery, 'query'), asyncHandler(controller.getFeed));
postRouter.get('/posts/:slug', asyncHandler(controller.getPost));
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -w @portfolio/api -- post-public`
Expected: PASS, 23 tests.

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/services/feed.service.ts apps/api/src/config/env.ts \
        apps/api/.env.example apps/api/src/controllers/post.controller.ts \
        apps/api/src/routes/post.routes.ts apps/api/src/__tests__/post-public.test.ts
git commit -m "feat(api): serve an Atom feed of published posts"
```

---

## Task 11: Seed script and documentation

Gives the frontend real content to build against.

**Files:**
- Create: `apps/api/src/scripts/seed-posts.ts`
- Modify: `apps/api/package.json` (script entry)
- Modify: `README.md`

**Interfaces:**
- Consumes: `Post` (Task 4), `connectDatabase`/`disconnectDatabase`.
- Produces: `npm run seed:posts -w @portfolio/api`.

- [ ] **Step 1: Write the seed script**

Create `apps/api/src/scripts/seed-posts.ts`:

```ts
/**
 * Sample posts so the frontend has something to render before real content
 * exists. Idempotent: re-running replaces the same three slugs and leaves
 * anything else alone.
 *
 *   npm run seed:posts -w @portfolio/api
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Post } from '../models/post.model.js';

const SAMPLES = [
  {
    slug: 'why-this-site-was-rebuilt',
    title: 'Why this site was rebuilt',
    lang: 'en' as const,
    excerpt: 'The old portfolio was a single HTML file with a bot token in it.',
    tags: ['craft', 'process'],
    status: 'published' as const,
    publishedAt: new Date('2026-08-14T09:00:00.000Z'),
    body: `## The problem

Publishing anything meant editing HTML and pushing a commit. So nothing got published.

## What changed

Content now lives in MongoDB behind a small Express API, and the site reads from it.

### Uploads

Images and PDFs go through an upload endpoint instead of being committed to the repository.

### Writing

This post is markdown in a database. Rendering happens on the server, once, at save time.
`,
  },
  {
    slug: 'notes-on-typography',
    title: 'Notes on typography',
    lang: 'en' as const,
    excerpt: 'A measure of 66 characters, and why the default line height is wrong.',
    tags: ['craft'],
    status: 'published' as const,
    publishedAt: new Date('2026-08-28T09:00:00.000Z'),
    body: `## Measure

Somewhere near 66 characters per line is comfortable. Wider than that and the eye
loses the return sweep.

## Rhythm

Line height is a function of measure, not a constant.
`,
  },
  {
    slug: 'ish-jarayoni-haqida',
    title: 'Ish jarayoni haqida',
    lang: 'uz' as const,
    excerpt: 'Loyihalarni qanday boshlayman va nima uchun.',
    tags: ['process'],
    status: 'draft' as const,
    publishedAt: null,
    body: `## Boshlanishi

Har bir loyiha savol bilan boshlanadi.

## Jarayon

Keyin esa yozish va qayta yozish.
`,
  },
];

async function main(): Promise<void> {
  await connectDatabase();

  for (const sample of SAMPLES) {
    await Post.deleteOne({ slug: sample.slug });
    await Post.create(sample);
    console.log(`[seed] ${sample.status.padEnd(9)} ${sample.slug}`);
  }

  console.log(`[seed] ${SAMPLES.length} posts written`);
  await disconnectDatabase();
}

main().catch((err: unknown) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `apps/api/package.json`, add to `scripts` after `seed:admin`:

```json
    "seed:posts": "tsx src/scripts/seed-posts.ts",
```

- [ ] **Step 3: Document the endpoints**

Append to `README.md`:

```markdown
## Blog API (M5)

Base URL: `/api/v1`. Public reads need no credentials; every admin route
requires the `token` cookie set by `POST /auth/login`.

### Public

| Method | Path | Query | Returns |
|---|---|---|---|
| `GET` | `/posts` | `lang, tag, q, limit, cursor` | `{ items: PostSummary[], nextCursor }` |
| `GET` | `/posts/tags` | `lang` | `TagCount[]` |
| `GET` | `/posts/feed.xml` | `lang` | Atom 1.0 |
| `GET` | `/posts/:slug` | — | `PostDetail` |

Drafts and future-dated posts are absent from all four.
`?q=` returns up to 20 relevance-ordered results with `nextCursor: null`.

### Admin

| Method | Path | Body |
|---|---|---|
| `GET` | `/admin/posts` | — (`status, lang, q, limit, cursor`) |
| `POST` | `/admin/posts` | `PostInput` |
| `GET` | `/admin/posts/:id` | — |
| `PATCH` | `/admin/posts/:id` | `PostPatch` |
| `DELETE` | `/admin/posts/:id` | — |
| `POST` | `/admin/assets` | `multipart/form-data`: `file`, `alt` |
| `GET` | `/admin/assets` | — (`kind, limit, cursor`) |
| `GET/PATCH/DELETE` | `/admin/assets/:id` | `{ alt }` on PATCH |

### Types

Import response types from `@portfolio/shared`:

```ts
import type { PostSummary, PostDetail, AdminPost, TagCount } from '@portfolio/shared';
```

`postListSchema`, `postDetailSchema` and `adminPostSchema` are the runtime
validators for the same shapes.

### Seeding

```bash
npm run seed:posts -w @portfolio/api
```
```

- [ ] **Step 4: Run the full suite and typecheck**

```bash
npm run typecheck
npm test -w @portfolio/api
```
Expected: typecheck clean; all test files pass (auth, shared-schemas, markdown, cursor, post-model, asset, post-public, post-admin).

- [ ] **Step 5: Smoke-test against a real server**

```bash
npm run seed:posts -w @portfolio/api
npm run dev:api -w @portfolio/api &
sleep 3
curl -s localhost:4000/api/v1/posts | head -40
curl -s localhost:4000/api/v1/posts/tags
curl -s localhost:4000/api/v1/posts/feed.xml | head -20
curl -s -o /dev/null -w '%{http_code}\n' localhost:4000/api/v1/posts/ish-jarayoni-haqida  # expect 404, it is a draft
curl -s -o /dev/null -w '%{http_code}\n' localhost:4000/api/v1/admin/posts                 # expect 401
```

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/scripts/seed-posts.ts apps/api/package.json README.md
git commit -m "feat(api): add post seed script and document the blog API"
```

---

## Self-Review Notes

Checked against `docs/superpowers/specs/2026-09-05-blog-backend-design.md`:

| Spec section | Task |
|---|---|
| §4 Wire contract | 1 |
| §5 Endpoints, route order | 8, 9, 10 |
| §6 Data model, indexes | 4, 5 |
| §7 Publication rules, scheduling | 3 (`publishFilter`), 4 (hook), tested in 8 |
| §8 Cursor pagination | 3, tested in 8 |
| §9 Markdown pipeline | 2 |
| §10 Search, `language_override` | 4 (index), 7 (query), tested in 8 |
| §11 Assets | 5, 6 |
| §12 Feed | 10 |
| §13 Caching | 3 (`cache.ts`), applied in 8, 9, 10 |
| §14 Errors | 6, 7 (`rethrowDuplicateSlug`), tested in 9 |
| §15 File layout | all |
| §16 Verification | every task's test step |
| §17 Config and dependencies | 2, 5, 10 |

Naming is consistent across tasks: `toAssetWire` (Task 6) is the name Task 7
imports; `recentPublishedDocs` (Task 7) is the name Task 10 calls;
`validatedQuery` matches the existing helper in `validate.middleware.ts`;
`publishFilter` is spelled identically in Tasks 3, 6 and 7.
