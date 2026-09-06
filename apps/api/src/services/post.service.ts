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
