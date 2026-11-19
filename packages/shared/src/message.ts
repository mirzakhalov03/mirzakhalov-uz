import { z } from 'zod';

/**
 * The contact form. `website` is a honeypot: a real person never fills it,
 * a bot always does, so a non-empty value is silently accepted and dropped.
 *
 * `email` is optional — a reply can go to Telegram or nowhere — so the client
 * omits it rather than sending an empty string.
 */
export const contactInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254).optional(),
  message: z.string().trim().min(10).max(4000),
  // Accepted at any value so a bot gets the same 201 a person does; the
  // service is what drops it. Rejecting here would tell it which field to skip.
  website: z.string().max(200).optional(),
});
export type ContactInput = z.infer<typeof contactInputSchema>;

export const contactResponse = z.object({ ok: z.literal(true) });
export type ContactResponse = z.infer<typeof contactResponse>;

export const messagePatchSchema = z.object({
  readAt: z.iso.datetime().nullable(),
});
export type MessagePatch = z.infer<typeof messagePatchSchema>;
