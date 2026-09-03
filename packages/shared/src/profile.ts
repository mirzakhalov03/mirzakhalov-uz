import { z } from 'zod';
import { bilingual } from './common.js';

export const socialSchema = z.object({
  label: z.string().min(1).max(40),
  handle: z.string().min(1).max(80),
  url: z.url(),
});

/**
 * A score carries its own scale because the design renders these as dimension
 * lines (value against its range), not as trophies. SAT 1330 means nothing
 * without 400–1600 beside it.
 */
export const scoreSchema = z.object({
  label: z.string().min(1).max(40),
  value: z.number(),
  scaleMin: z.number(),
  scaleMax: z.number(),
  takenAt: z.iso.date().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1).max(40),
  level: z.string().min(1).max(40),
  note: z.string().max(120).optional(),
});

export const stackItemSchema = z.object({
  name: z.string().min(1).max(40),
  frequency: z.enum(['daily', 'often']),
});

export const profileInputSchema = z.object({
  name: z.string().min(1).max(80),
  role: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  coords: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }),
  bio: bilingual(4000),
  now: z.object({ text: z.string().max(2000), updatedAt: z.iso.datetime().optional() }),
  socials: z.array(socialSchema).max(12).default([]),
  scores: z.array(scoreSchema).max(12).default([]),
  languages: z.array(languageSchema).max(12).default([]),
  stack: z.array(stackItemSchema).max(40).default([]),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;

export const profilePatchSchema = profileInputSchema.partial();
export type ProfilePatch = z.infer<typeof profilePatchSchema>;
