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
