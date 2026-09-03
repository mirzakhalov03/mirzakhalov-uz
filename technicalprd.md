# Technical PRD — Portfolio v2

Companion to `proposed-design.md` (visual system) and `PORTFOLIO-REFERENCE.md` (audit of the old site).
This document covers **architecture, data, API and delivery**. Design decisions live in the other file.

---

## 1. Goal

Turn a hand-edited static site into a **content-managed portfolio**, so publishing a project, a note, a new résumé or a certificate is a form submission — not a commit.

**Success = these are all true**
- Adding a project, post, or document requires no code change and no deploy.
- Uploading a PDF or image happens from the admin UI.
- The public site reads everything from the API.
- One admin account. No public signup, ever.
- The Telegram bot token is server-side only.

**Non-goals (v2):** multi-user, comments, WYSIWYG editor, analytics dashboard, i18n framework, SSR/SEO prerendering (see §12).

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **React 19 + TypeScript + Vite** | CSS Modules + custom properties, per the design doc |
| Routing | **React Router v7** | |
| Server state | **TanStack Query** | Caching, retries, and mutation invalidation for free — the one dependency that genuinely pays for itself here |
| Backend | **Node 22 + Express 5 + TypeScript** | |
| Database | **MongoDB + Mongoose** | Atlas in production |
| Validation | **Zod**, shared between client and server | One schema, both sides typed |
| Auth | **JWT in an httpOnly cookie** + bcrypt | Single admin |
| Uploads | **Multer → disk**, path/URL stored in Mongo | §7 |
| Markdown | **markdown-it** server-side sanitised, or MDX at build | §5.2 |

### Repo layout — npm workspaces

```
portfolio/
├── apps/
│   ├── web/          React + Vite          → yoursite.com
│   └── api/          Express + Mongoose    → api.yoursite.com
├── packages/
│   └── shared/       Zod schemas + inferred TS types
└── package.json      workspaces: ["apps/*", "packages/*"]
```

`packages/shared` is the point of the monorepo: define `ProjectSchema` once, and both the Express validator and the React form are typed from it. If a monorepo feels heavy, plain `client/` + `server/` + a copied types file works — you just lose the single source of truth.

---

## 3. Data Model

Seven collections. All documents get `createdAt` / `updatedAt` (`timestamps: true`).

### 3.1 `users` — exactly one document
```ts
{ email, passwordHash, name, role: 'admin', lastLoginAt }
```
Created by a seed script from env vars. **No registration endpoint exists.**

### 3.2 `projects`
```ts
{
  slug,                          // unique, indexed
  title,
  year,
  summary:  { en: String, uz?: String },
  body:     { en: String, uz?: String },   // markdown; the case study
  stack:    [String],                      // ['React','TypeScript']
  tags:     [String],                      // live | client | experiment | archived
  links:    { demo?: String, source?: String },
  cover:    ObjectId → assets,
  gallery:  [ObjectId → assets],
  featured: Boolean,                       // shows on home
  order:    Number,                        // manual sort
  hasCaseStudy: Boolean,
  status:   'draft' | 'published',
  publishedAt: Date
}
```
Indexes: `slug` (unique), `{ status: 1, featured: -1, order: 1 }`.

### 3.3 `posts` — blogging, Phase 5
```ts
{
  slug, title, lang: 'en' | 'uz',
  excerpt, body,                 // markdown
  tags: [String],
  cover?: ObjectId → assets,
  status: 'draft' | 'published',
  publishedAt: Date,
  readingMinutes: Number         // computed on save
}
```
Indexes: `slug` (unique), `{ status: 1, publishedAt: -1 }`.

### 3.4 `assets` — every uploaded file
```ts
{
  filename,        // generated, e.g. 'k3m9x2p1.webp' — never the original
  originalName,    // kept for the admin UI only
  mime, size,
  kind: 'image' | 'pdf' | 'other',
  path,            // on-disk: 'uploads/2026/09/k3m9x2p1.webp'
  url,             // public:  '/static/2026/09/k3m9x2p1.webp'
  width?, height?, // images only
  alt              // required for images — enforced, see §11
}
```

### 3.5 `documents` — résumés, certificates, endorsements
```ts
{
  title,                        // 'Résumé — Sep 2026'
  kind: 'resume' | 'certificate' | 'endorsement' | 'transcript',
  asset: ObjectId → assets,
  issuer?, issuedAt?,           // 'IELTS', 2022-06-14
  visible: Boolean,
  order: Number
}
```
This replaces the two Google Drive links, which are unversioned and will rot.

### 3.6 `profile` — singleton
```ts
{
  name, role, location,
  coords: { lat: 41.2995, lng: 69.2401 },
  bio: { en, uz },
  now: { text, updatedAt },     // powers /now
  socials:   [{ label, handle, url }],
  scores:    [{ label, value, scaleMin, scaleMax, takenAt }],   // SAT 1330 / 400–1600
  languages: [{ name, level, note }],
  stack:     [{ name, frequency: 'daily' | 'often' }]
}
```
`scores` carries its own scale because the design draws them as dimension lines, not trophies.

### 3.7 `messages` — contact form
```ts
{ name, message, ipHash, userAgent, relayed: Boolean, readAt }
```
Stored as a backup even though the primary delivery is Telegram — so a Telegram outage doesn't silently lose a message.

---

## 4. API

REST, versioned at `/api/v1`. JSON only. Public reads are unauthenticated; every write requires the admin cookie.

### 4.1 Public

| Method | Path | Returns |
|---|---|---|
| `GET` | `/projects` | Published projects. `?featured=true&limit=3` for home |
| `GET` | `/projects/:slug` | One published project + its case study |
| `GET` | `/posts` | Published posts. `?lang=uz&limit=10&cursor=` |
| `GET` | `/posts/:slug` | One published post |
| `GET` | `/documents` | Visible documents (résumé, certificates) |
| `GET` | `/profile` | The singleton |
| `POST` | `/contact` | Rate-limited, honeypot; relays to Telegram + stores |

Public endpoints **never** return `status: 'draft'`. Enforce in a shared query helper, not per-route.

### 4.2 Admin — all behind `requireAdmin`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/auth/login` | Sets the cookie. Rate-limited |
| `POST` | `/auth/logout` | Clears it |
| `GET` | `/auth/me` | Session check on admin app boot |
| `GET/POST/PATCH/DELETE` | `/admin/projects[/:id]` | Full CRUD, drafts included |
| `GET/POST/PATCH/DELETE` | `/admin/posts[/:id]` | |
| `GET/POST/PATCH/DELETE` | `/admin/documents[/:id]` | |
| `PATCH` | `/admin/profile` | Singleton upsert |
| `POST` | `/admin/assets` | `multipart/form-data`, field `file` |
| `GET/DELETE` | `/admin/assets[/:id]` | Delete removes disk file **and** doc |
| `GET/PATCH` | `/admin/messages[/:id]` | Inbox, mark read |

### 4.3 Conventions

- Success: the resource, or `{ items, nextCursor }` for lists.
- Error: `{ error: { code, message, fields? } }` — `fields` maps to form inputs so the client renders errors at source.
- Status codes used honestly: `400` validation, `401` unauthenticated, `403` authenticated-but-forbidden, `404`, `409` duplicate slug, `413` file too large, `429` rate limited.
- Every mutation body parsed through its Zod schema in one `validate(schema)` middleware. No ad-hoc `if (!req.body.title)`.

---

## 5. Content Authoring

### 5.1 Admin UI

A separate route tree in the same React app at `/admin`, code-split so its bundle never loads for public visitors.

| Screen | Does |
|---|---|
| `/admin/login` | Email + password |
| `/admin` | Counts, drafts, unread messages, recent uploads |
| `/admin/projects` | List with status, drag-to-reorder, publish toggle |
| `/admin/projects/:id` | Form + markdown editor + cover/gallery picker |
| `/admin/posts` | Same, with a language selector |
| `/admin/documents` | Upload a PDF, set kind + issuer + visibility |
| `/admin/media` | Grid of assets, alt-text editing, delete |
| `/admin/profile` | Bio, now, scores, languages, stack, socials |
| `/admin/messages` | Inbox |

Two things worth doing properly: **autosave drafts** (a debounced `PATCH` — losing a half-written case study once is enough), and a **live preview** that renders the markdown in the real public component, so what you see is what ships.

### 5.2 Markdown

Store raw markdown. Render server-side with `markdown-it` and sanitise with `DOMPurify` (via `jsdom`) **before** it reaches the client, then render as HTML. Even as the only author, sanitising means a mistake can't become stored XSS.

---

## 6. Auth

Single admin, deliberately boring.

- `POST /auth/login` → verify with `bcrypt.compare` (cost 12) → sign JWT (`{ sub, role }`, 7d) → set cookie:
  `httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7d`
- `requireAdmin` reads the cookie, verifies, attaches `req.user`.
- Rate limit `/auth/login` to **5 attempts / 15 min per IP**, and always respond in ~the same time whether the email exists or not.
- Seed script: `npm run seed:admin` reads `ADMIN_EMAIL` / `ADMIN_PASSWORD`, hashes, inserts, exits. Run once.

**Why a cookie and not `localStorage`:** a JWT in `localStorage` is readable by any XSS. httpOnly is not.

**CSRF:** `sameSite: 'lax'` plus a JSON-only API plus requiring `Content-Type: application/json` on mutations covers it for this shape. If the admin ever moves to a different registrable domain than the API, add a double-submit token.

> ⚠️ **Deployment trap.** If `web` is on `vercel.app` and `api` is on `onrender.com`, the auth cookie is **cross-site** and needs `sameSite: 'none'` — which some browsers restrict and which weakens CSRF posture. Put both under one registrable domain (`yoursite.com` + `api.yoursite.com`) and this whole class of problem disappears. Decide this before writing the auth code.

---

## 7. File Uploads

**Approach:** file written to the server's disk, path and public URL stored in MongoDB. *(See open question Q1 — this is the interpretation of "MongoDB's static file saving path" I've specced.)*

```
POST /admin/assets  (multipart/form-data)
  → multer.diskStorage
  → uploads/YYYY/MM/<nanoid>.<ext>
  → create Asset doc
  → 201 { id, url, width, height }
```

**Rules**
- Filename is **always generated** (`nanoid` + extension derived from the sniffed MIME). Never use `originalName` on disk — that's how path traversal and overwrite bugs happen.
- Allow-list MIME: `image/jpeg|png|webp|avif`, `application/pdf`. Reject everything else.
- Limits: **8 MB** images, **15 MB** PDFs. Return `413` with a usable message.
- Serve via `express.static('uploads')` mounted at `/static` with `Cache-Control: public, max-age=31536000, immutable` — safe because filenames are content-unique.
- `DELETE` removes the disk file and the document, and refuses if the asset is referenced by a project or document (`409` naming what references it).

**Phase 2 — image derivatives.** Add `sharp` on upload: read real dimensions, generate WebP/AVIF at 2–3 widths, store them on the Asset doc. The design doc's performance budget (LCP < 1.5s) assumes this; the current site serves an unoptimised 5.3 MB PNG.

> ⚠️ **This requires a persistent disk.** Serverless and ephemeral-filesystem hosts (Vercel Functions, Heroku dynos, Render's free tier) wipe uploads on every deploy or restart. The API must run on a container or VPS with a mounted volume — Render/Railway/Fly with a volume, or a cheap VPS. When this becomes limiting, swapping to S3-compatible storage (R2, Spaces) is a change to one `StorageAdapter` module, because nothing outside it knows where files live. Build that seam now; it costs an interface.

---

## 8. Frontend Data Flow

- One typed `api.ts` client. `credentials: 'include'` on admin calls.
- TanStack Query keys: `['projects', { featured }]`, `['project', slug]`, `['posts', { lang }]`.
- Mutations invalidate their list key. No manual cache surgery.
- Public pages: `staleTime: 5 min`. The content changes a few times a month.
- **Loading and empty states are components, not afterthoughts** — the design doc specifies static skeletons (no shimmer) and empty states that offer the next action.
- Errors render inline where they happened, never as a toast.

---

## 9. Configuration

```
# api
PORT, NODE_ENV
MONGODB_URI
JWT_SECRET                 # 32+ random bytes
COOKIE_DOMAIN
CORS_ORIGIN                # exact origin, never '*' with credentials
UPLOAD_DIR                 # default ./uploads
TELEGRAM_BOT_TOKEN         # NEW token — see §11
TELEGRAM_CHAT_ID
ADMIN_EMAIL, ADMIN_PASSWORD  # seed only, remove after first run

# web
VITE_API_URL
```

`.env` is gitignored; `.env.example` is committed with empty values.

---

## 10. Deployment

| Piece | Where | Why |
|---|---|---|
| `web` | Vercel | Static build, CDN, preview deploys |
| `api` | Render / Railway / Fly, **with a persistent volume** | §7 requires real disk |
| DB | MongoDB Atlas (free tier is fine) | |
| Domain | `yoursite.com` + `api.yoursite.com` | Keeps auth cookies same-site (§6) |

Also: Atlas scheduled backups on, and a `GET /health` returning DB connectivity.

---

## 11. Security

Ordered by how much they matter here.

1. **Rotate the Telegram bot token immediately.** The current token and chat ID are in `js/app.js`, committed, and public in git history. Anyone can send messages through that bot. Revoke via BotFather, generate a new one, put it in the API's env, and never let it reach the client. This is true regardless of whether the rebuild happens.
2. `helmet()`, CORS locked to the exact origin, `express.json({ limit: '100kb' })`.
3. Zod on every mutation body. Mongoose `strict: true` so unknown fields never persist.
4. Rate limits: login 5/15min, contact 5/hour per IP, uploads 30/hour.
5. Sanitise rendered markdown (§5.2).
6. Store an IP **hash**, not the IP, on messages.
7. Generated upload filenames + MIME allow-list (§7).
8. `alt` required on image assets — the old site has an empty `alt` on **every single image**. Enforcing it at the schema level is how it stays fixed.

---

## 12. Milestones

Each ships something usable.

| # | Milestone | Contents |
|---|---|---|
| **M0** | Skeleton | Workspaces, TS configs, Express boot, Mongo connect, `/health`, shared Zod package |
| **M1** | Auth | User model, seed script, login/logout/me, `requireAdmin`, admin shell + login screen |
| **M2** | Assets & documents | Upload pipeline, static serving, media library, documents CRUD → **résumé and certificates uploadable** |
| **M3** | Projects | Model, admin + public CRUD, markdown, cover/gallery → **public site reads projects from the API** |
| **M4** | Profile | Singleton, bio/now/scores/stack editing, `/now` page |
| **M5** | Blog | Posts model, admin editor, `/writing` + `/writing/:slug`, language filter |
| **M6** | Contact | Server-side Telegram relay with the **new** token, honeypot, rate limit, admin inbox |
| **M7** | Hardening | `sharp` derivatives, caching, `axe` in CI, Lighthouse against the budget, Atlas backups |

M2 before M3 is deliberate: it's the thing you asked for first, and projects depend on assets existing.

**Migration:** a one-off `npm run seed:content` that reads the current hardcoded HTML content into Mongo, so the site launches populated rather than empty.

---

## 13. Open Questions

1. **File storage — is "MongoDB's static file saving path" disk-and-path (what's specced above) or GridFS (files stored as chunks inside MongoDB)?** Disk is faster, cacheable by CDN, and keeps the DB small; GridFS survives ephemeral hosting and needs no volume, at the cost of streaming every byte through Node and Mongo. **I recommend disk + the `StorageAdapter` seam**, but say the word and I'll respec for GridFS — it's a contained change.
2. **Bilingual scope:** are `projects.body` and `posts` both bilingual, or is `posts.lang` a single-language flag (as specced) and projects English-only? Affects the schema and the editor.
3. **Monorepo or plain `client/` + `server/`?** Workspaces buy shared types; two folders are simpler to reason about.
4. **SSR / SEO:** a client-rendered SPA means link previews and crawlers see an empty shell. Out of scope for v2, but if the blog matters for reach, prerendering the public routes is worth a later milestone.
5. **Admin on the same domain** (`/admin`, code-split) **or a separate subdomain?** Same-domain is specced — simpler cookies, one deploy.
