import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const sessionSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  role: z.literal('admin'),
});
export type Session = z.infer<typeof sessionSchema>;
