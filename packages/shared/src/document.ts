import { z } from 'zod';
import { objectId } from './common.js';

export const documentKind = z.enum(['resume', 'certificate', 'endorsement', 'transcript']);
export type DocumentKind = z.infer<typeof documentKind>;

export const documentInputSchema = z.object({
  title: z.string().min(1).max(140),
  kind: documentKind,
  asset: objectId,
  issuer: z.string().max(120).optional(),
  issuedAt: z.iso.date().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
});
export type DocumentInput = z.infer<typeof documentInputSchema>;

export const documentPatchSchema = documentInputSchema.partial();
export type DocumentPatch = z.infer<typeof documentPatchSchema>;
