import { z } from 'zod';
import { bilingual, objectId, publishStatus, slug } from './common.js';

export const projectTag = z.enum(['live', 'client', 'experiment', 'archived']);
export type ProjectTag = z.infer<typeof projectTag>;

/** Fields the admin can write. The public shape adds server-owned fields below. */
export const projectInputSchema = z.object({
  slug,
  title: z.string().min(1).max(120),
  year: z.number().int().min(2000).max(2100),
  summary: bilingual(400),
  body: bilingual(50_000).optional(), // markdown, the case study
  stack: z.array(z.string().min(1).max(40)).max(20).default([]),
  tags: z.array(projectTag).max(6).default([]),
  links: z
    .object({
      demo: z.url().optional(),
      source: z.url().optional(),
    })
    .default({}),
  cover: objectId.nullable().default(null),
  gallery: z.array(objectId).max(24).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: publishStatus.default('draft'),
  publishedAt: z.iso.datetime().nullable().default(null),
});
export type ProjectInput = z.infer<typeof projectInputSchema>;

/** PATCH accepts any subset. */
export const projectPatchSchema = projectInputSchema.partial();
export type ProjectPatch = z.infer<typeof projectPatchSchema>;

export const projectQuery = z.object({
  featured: z.stringbool().optional(),
  tag: projectTag.optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
export type ProjectQuery = z.infer<typeof projectQuery>;
