/**
 * The wire contract, tested from the consumer's side. The API imports these
 * schemas and so does the React app, so a drift here breaks both.
 */
import { describe, expect, it } from 'vitest';
import {
  adminPostSchema,
  assetListSchema,
  postDetailSchema,
  postInputSchema,
  postListSchema,
  postPatchSchema,
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

  it('shapes the asset list envelope as { items, nextCursor }', () => {
    expect(() => assetListSchema.parse({ items: [asset], nextCursor: null })).not.toThrow();
    expect(() => assetListSchema.parse({ items: [asset] })).toThrow();
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

  it('does not re-inject defaults for fields a PATCH omits', () => {
    // Regression: postPatchSchema must NOT derive from postInputSchema.partial() —
    // Zod's .partial() does not suppress .default(), so a naive derivation would
    // silently fill in lang/tags/cover/status/publishedAt for a caller who only
    // sent `status`, wiping the post's existing tags, cover and publish date.
    const parsed = postPatchSchema.parse({ status: 'draft' });
    expect(Object.keys(parsed)).toEqual(['status']);
  });

  it('still applies its defaults on the create path', () => {
    // Guards against over-correcting the fix above: postInputSchema must keep
    // defaulting a minimal create payload into a complete draft post.
    const parsed = postInputSchema.parse({
      slug: 'on-writing',
      title: 'On writing',
      excerpt: 'A short note.',
      body: '# raw',
    });
    expect(parsed.lang).toBe('en');
    expect(parsed.tags).toEqual([]);
    expect(parsed.status).toBe('draft');
    expect(parsed.cover).toBeNull();
    expect(parsed.publishedAt).toBeNull();
  });
});
