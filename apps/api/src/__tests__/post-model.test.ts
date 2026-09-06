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
    expect(post.toObject().toc).toEqual([{ id: 'section', text: 'Section', depth: 2 }]);
    expect(post.readingMinutes).toBe(1);
  });

  it('re-derives them when the body changes', async () => {
    const post = await Post.create(base);
    post.body = '## Renamed\n\nDifferent prose.';
    await post.save();
    expect(post.toc[0]?.id).toBe('renamed');
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
