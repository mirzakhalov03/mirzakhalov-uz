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
