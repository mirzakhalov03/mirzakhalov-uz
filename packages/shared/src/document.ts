import { z } from 'zod';
import { objectId } from './common.js';

export const documentKind = z.enum(['resume', 'certificate', 'endorsement', 'transcript']);
export type DocumentKind = z.infer<typeof documentKind>;

/** Field shapes without defaults — shared by the create and patch schemas below. */
const documentFields = {
  title: z.string().min(1).max(140),
  kind: documentKind,
  asset: objectId,
  issuer: z.string().max(120).optional(),
  issuedAt: z.iso.date().optional(),
  visible: z.boolean(),
  order: z.number().int(),
};

/** Create: defaults apply, so a minimal document still yields a complete one. */
export const documentInputSchema = z.object({
  ...documentFields,
  visible: documentFields.visible.default(true),
  order: documentFields.order.default(0),
});
export type DocumentInput = z.infer<typeof documentInputSchema>;

/**
 * PATCH: every field optional and NO defaults. Zod's .partial() does not
 * suppress .default(), so deriving this from documentInputSchema would
 * silently re-inject values for fields the caller never sent — wiping
 * `visible`/`order` on any partial update.
 */
export const documentPatchSchema = z.object(documentFields).partial();
export type DocumentPatch = z.infer<typeof documentPatchSchema>;
