import 'dotenv/config';
import { z } from 'zod';

/**
 * Every environment variable the API reads, in one place, validated at boot.
 * A misconfigured server should fail loudly on startup — not at 2am on the
 * first request that happens to need JWT_SECRET.
 */
const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

const envSchema = z
  .object({
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
  })
  .superRefine((val, ctx) => {
    // The default is a development convenience, but shipping it to production
    // silently bakes localhost into every Atom feed <link>/<id> — cached 30
    // minutes and delivered to subscribers, with nothing failing loudly.
    if (val.NODE_ENV !== 'production') return;
    let hostname = '';
    try {
      hostname = new URL(val.PUBLIC_SITE_URL).hostname;
    } catch {
      // Unparseable URLs are already rejected by z.url() above.
    }
    if (LOCALHOST_HOSTNAMES.has(hostname)) {
      ctx.addIssue({
        code: 'custom',
        path: ['PUBLIC_SITE_URL'],
        message:
          'PUBLIC_SITE_URL is set to localhost in production. Set it to the real public site origin ' +
          '(e.g. https://mirzakhalov.uz) — it is embedded in every Atom feed link and id.',
      });
    }
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
