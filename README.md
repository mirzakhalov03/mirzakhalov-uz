# Portfolio v2

Content-managed portfolio. Publishing a project, a note, a résumé or a certificate
is a form submission — not a commit.

Specs: [`technicalprd.md`](./technicalprd.md) (architecture) · [`proposeddesign.md`](./proposeddesign.md) (visual system).

## Layout

```
apps/web/          React 19 + Vite + React Router 7 + TanStack Query
apps/api/          Node 22 + Express 5 + Mongoose
packages/shared/   Zod schemas — the single source of truth for both sides
```

`packages/shared` is the point of the monorepo. `ProjectSchema` is defined once;
the Express validator and the React form are both typed from it.

## Running it

```bash
npm install

cp apps/api/.env.example apps/api/.env    # then fill JWT_SECRET and MONGODB_URI
cp apps/web/.env.example apps/web/.env

npm run dev:api    # http://localhost:4000
npm run dev:web    # http://localhost:5173
```

Generate a secret with `openssl rand -base64 48`. The API refuses to start on an
invalid environment rather than failing later on the first request that needs it.

```bash
npm run typecheck   # all three workspaces
npm run build
```

Health check: `GET http://localhost:4000/api/v1/health` — reports DB connectivity,
not just process liveness.

## Status — M0 complete

| | Milestone | State |
|---|---|---|
| M0 | Workspaces, TS configs, Express boot, Mongo connect, `/health`, shared Zod package | done |
| M1 | Auth — user model, seed script, login/logout/me, `requireAdmin`, admin shell | next |
| M2 | Assets & documents — upload pipeline, media library |  |
| M3 | Projects |  |
| M4 | Profile |  |
| M5 | Blog |  |
| M6 | Contact |  |
| M7 | Hardening |  |

## Decisions taken from the PRD's open questions (§13)

| # | Question | Taken |
|---|---|---|
| 1 | Disk vs GridFS | **Disk**, behind the `StorageAdapter` interface in `apps/api/src/services/storage/`. Swapping to S3/R2 is one new adapter and one changed line in `services/storage/index.ts`. |
| 2 | Bilingual scope | Projects carry bilingual `summary`/`body` (`en` required, `uz` optional); posts are single-language with a `lang` flag. |
| 3 | Monorepo | **Workspaces**, for the shared schemas. |
| 5 | Admin location | **Same domain**, `/admin`, lazy-loaded so its bundle never reaches a public visitor. |

Q4 (SSR/prerendering) stays out of scope for v2.

## Before anything ships

Rotate the Telegram bot token. The old one is in `old-html-version/js/app.js` and in
git history, so anyone can send through that bot. Revoke via BotFather, put the new
token in the API's env, and never let it reach the client (PRD §11.1).

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
Search is unstemmed (`default_language: 'none'` on both the index and the
query), so it matches whole tokens only — `cats` will not match `cat`.

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
