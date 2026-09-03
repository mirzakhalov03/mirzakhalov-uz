import { z } from 'zod';

/** Mongo ObjectId as it crosses the wire: a 24-char hex string. */
export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid id');

/** URL-safe slug. Lowercase, hyphen-separated, no leading/trailing hyphen. */
export const slug = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase words separated by hyphens');

export const publishStatus = z.enum(['draft', 'published']);
export type PublishStatus = z.infer<typeof publishStatus>;

export const locale = z.enum(['en', 'uz']);
export type Locale = z.infer<typeof locale>;

/**
 * Bilingual text. English is the fallback and is always required;
 * Uzbek is optional so content can ship before it is translated.
 */
export const bilingual = (max: number) =>
  z.object({
    en: z.string().min(1).max(max),
    uz: z.string().max(max).optional(),
  });

/** Cursor-paginated list response — see Technical PRD §4.3. */
export const listResponse = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });

export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

/**
 * The single error shape every endpoint returns. `fields` maps a form input
 * name to its message so the client can render errors at source, not in a toast.
 */
export const apiError = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fields: z.record(z.string(), z.string()).optional(),
  }),
});
export type ApiError = z.infer<typeof apiError>;
