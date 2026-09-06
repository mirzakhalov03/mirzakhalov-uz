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
