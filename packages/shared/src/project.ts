import { z } from 'zod';
import { bilingual, objectId, publishStatus, slug } from './common.js';

export const projectTag = z.enum(['live', 'client', 'experiment', 'archived']);
export type ProjectTag = z.infer<typeof projectTag>;

/**
 * A highlight is the technical claim a card leads with, and its `kind` is what
 * keeps three of them from reading as one undifferentiated row: exactly one
 * answers what the work *was* (scope), one what it is built with (stack), and
 * one what is interesting about it (feature). The renderer draws scope solid
 * and the other two outlined, so a card has one loud chip rather than three.
 *
 * Capped at three because a fourth stops being a distinction and starts being
 * a stack list — `stack` already exists for that, and is what /work prints.
 */
export const highlightKind = z.enum(['scope', 'stack', 'feature']);
export type HighlightKind = z.infer<typeof highlightKind>;

export const projectHighlight = z.object({
  /** Short enough to survive a card at phone width without wrapping mid-chip. */
  label: z.string().min(1).max(28),
  kind: highlightKind,
});
export type ProjectHighlight = z.infer<typeof projectHighlight>;

/** Field shapes without defaults — shared by the create and patch schemas below. */
const projectFields = {
  slug,
  title: z.string().min(1).max(120),
  year: z.number().int().min(2000).max(2100),
  summary: bilingual(400),
  /**
   * The card line. `summary` is the paragraph /work and the case studies want;
   * a card wants one sentence, and truncating the paragraph to fit would cut it
   * mid-clause. Optional: a project that has never been featured never needs one,
   * and the card falls back to `summary`.
   */
  tagline: bilingual(160).optional(),
  highlights: z.array(projectHighlight).max(3),
  body: bilingual(50_000).optional(), // markdown, the case study
  stack: z.array(z.string().min(1).max(40)).max(20),
  tags: z.array(projectTag).max(6),
  links: z.object({
    demo: z.url().optional(),
    source: z.url().optional(),
  }),
  cover: objectId.nullable(),
  gallery: z.array(objectId).max(24),
  featured: z.boolean(),
  order: z.number().int(),
  status: publishStatus,
  publishedAt: z.iso.datetime().nullable(),
};

/** Fields the admin can write. The public shape adds server-owned fields below.
 *  Create: defaults apply, so a minimal project still yields a complete one. */
export const projectInputSchema = z.object({
  ...projectFields,
  stack: projectFields.stack.default([]),
  highlights: projectFields.highlights.default([]),
  tags: projectFields.tags.default([]),
  links: projectFields.links.default({}),
  cover: projectFields.cover.default(null),
  gallery: projectFields.gallery.default([]),
  featured: projectFields.featured.default(false),
  order: projectFields.order.default(0),
  status: projectFields.status.default('draft'),
  publishedAt: projectFields.publishedAt.default(null),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/**
 * PATCH: every field optional and NO defaults. Zod's .partial() does not
 * suppress .default(), so deriving this from projectInputSchema would
 * silently re-inject values for fields the caller never sent — wiping
 * `cover`, `gallery`, `featured`, `order`, `status` and `publishedAt` (among
 * others) on any partial update.
 */
export const projectPatchSchema = z.object(projectFields).partial();
export type ProjectPatch = z.infer<typeof projectPatchSchema>;

export const projectQuery = z.object({
  featured: z.stringbool().optional(),
  tag: projectTag.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
export type ProjectQuery = z.infer<typeof projectQuery>;
