import 'dotenv/config';
import { z } from 'zod';

/**
 * Every environment variable the API reads, in one place, validated at boot.
 * A misconfigured server should fail loudly on startup — not at 2am on the
 * first request that happens to need JWT_SECRET.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters — generate one with: openssl rand -base64 48'),
  COOKIE_DOMAIN: z.string().optional(),

  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),

  /** Absolute origin of the public site. The feed links to /writing/:slug there,
   *  not to the API. */
  PUBLIC_SITE_URL: z.url().default('http://localhost:5173'),

  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_STATIC_PATH: z.string().default('/static'),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`Invalid environment configuration:\n${issues}\n\nSee apps/api/.env.example`);
  process.exit(1);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';

/** CORS_ORIGIN may hold a comma-separated list (e.g. prod + a preview domain). */
export const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
