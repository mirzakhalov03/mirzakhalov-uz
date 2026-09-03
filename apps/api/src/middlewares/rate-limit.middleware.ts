import rateLimit, { type Options } from 'express-rate-limit';

/** Limits from Technical PRD §11.4, kept together so they are easy to audit. */
const base: Partial<Options> = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again later.' } },
};

export const loginLimiter = rateLimit({ ...base, windowMs: 15 * 60_000, limit: 5 });
export const contactLimiter = rateLimit({ ...base, windowMs: 60 * 60_000, limit: 5 });
export const uploadLimiter = rateLimit({ ...base, windowMs: 60 * 60_000, limit: 30 });
