import type { CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import { env, isProduction } from '../config/env.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { signToken } from '../services/auth.service.js';

/**
 * Cookie settings from Technical PRD §6.
 *   httpOnly  — not readable by JS; the primary XSS defence.
 *   secure    — HTTPS-only in production.
 *   sameSite  — 'lax' covers same-site navigations and form posts.
 *               Switch to 'none' only if the web app moves to a separate
 *               registrable domain from the API (see the ⚠️ note in §6).
 *   domain    — set in production so the cookie is shared by
 *               yoursite.com and api.yoursite.com.
 */
const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function cookieOptions(clear = false): CookieOptions {
  const opts: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: clear ? 0 : COOKIE_MAX_AGE,
  };
  if (env.COOKIE_DOMAIN) opts.domain = env.COOKIE_DOMAIN;
  return opts;
}

/**
 * Sentinel hash used when the email doesn't exist.
 * Running `bcrypt.compare` on a known hash keeps the response time
 * indistinguishable from a real failed login, preventing email enumeration
 * via timing (Technical PRD §6 — "always respond in ~the same time").
 */
const SENTINEL_HASH = '$2b$12$sentinelhashsentinelhashsentinelXXXXXXXXXXXXXXXXXXXXXX';

// ─── Handlers ────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Body is already validated by `validate(loginSchema)` in the router.
 */
export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findByEmail(email);

    // Always run bcrypt even when the user is not found — prevents timing attacks.
    const hashToCheck = user?.passwordHash ?? SENTINEL_HASH;
    const valid = await bcrypt.compare(password, hashToCheck);

    if (!user || !valid) {
      next(ApiError.unauthorized('Invalid email or password.'));
      return;
    }

    // Issue token and set httpOnly cookie.
    const token = signToken({ sub: (user._id as { toString(): string }).toString(), role: user.role });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    // Update last login timestamp (non-blocking — don't await).
    void User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    // Return session so the frontend can initialise its auth state immediately.
    res.status(200).json({
      id: (user._id as { toString(): string }).toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/logout
 * Clears the cookie. The JWT is stateless, so there is no server-side
 * revocation; the short `maxAge: 0` makes the browser drop it immediately.
 */
export const logout: RequestHandler = (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, cookieOptions(true));
  res.status(200).json({ ok: true });
};

/**
 * GET /auth/me
 * Only reached after `requireAdmin` attaches `req.user`.
 */
export const me: RequestHandler = (req: Request, res: Response) => {
  const user = req.user!;
  res.status(200).json({
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  });
};
