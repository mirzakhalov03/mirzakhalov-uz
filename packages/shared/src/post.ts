import { z } from 'zod';
import { locale, objectId, publishStatus, slug } from './common.js';

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

export const postQuery = z.object({
  lang: locale.optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});
export type PostQuery = z.infer<typeof postQuery>;
