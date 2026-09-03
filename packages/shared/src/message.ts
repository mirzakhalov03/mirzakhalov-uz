import { z } from 'zod';

/**
 * The contact form. `website` is a honeypot: a real person never fills it,
 * a bot always does, so a non-empty value is silently accepted and dropped.
 */
export const contactInputSchema = z.object({
  name: z.string().min(1).max(80),
  message: z.string().min(10).max(4000),
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const messagePatchSchema = z.object({
  readAt: z.iso.datetime().nullable(),
});
export type MessagePatch = z.infer<typeof messagePatchSchema>;
