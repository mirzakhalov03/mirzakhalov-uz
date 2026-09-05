import { z } from 'zod';
import { objectId } from './common.js';

export const assetKind = z.enum(['image', 'pdf', 'other']);
export type AssetKind = z.infer<typeof assetKind>;

/** MIME allow-list — anything else is rejected at upload (§7). */
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const ALLOWED_DOC_MIME = ['application/pdf'] as const;
export const ALLOWED_MIME = [...ALLOWED_IMAGE_MIME, ...ALLOWED_DOC_MIME] as const;

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_BYTES = 15 * 1024 * 1024;

export const assetSchema = z.object({
  id: objectId,
  filename: z.string(),
  originalName: z.string(),
  mime: z.string(),
  size: z.number().int().nonnegative(),
  kind: assetKind,
  url: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Asset = z.infer<typeof assetSchema>;

/**
 * The only field an upload accepts alongside the file itself.
 * Alt text is required for images and enforced here rather than by convention (§11.8).
 */
export const assetUpdateSchema = z.object({
  alt: z.string().max(300),
});
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;

/** Admin media library listing. */
export const assetListSchema = z.object({
  items: z.array(assetSchema),
  nextCursor: z.string().nullable(),
});
export type AssetList = z.infer<typeof assetListSchema>;

export const assetQuery = z.object({
  kind: assetKind.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  cursor: z.string().optional(),
});
export type AssetQuery = z.infer<typeof assetQuery>;
