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
