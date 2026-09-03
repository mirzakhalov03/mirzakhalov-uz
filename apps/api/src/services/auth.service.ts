import jwt from 'jsonwebtoken';
import type { Session } from '@portfolio/shared';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';
import type { IUser } from '../models/user.model.js';

/** The claims we embed in the JWT — kept minimal on purpose. */
export interface JwtPayload {
  sub: string; // user ObjectId
  role: 'admin';
}

const JWT_OPTIONS: jwt.SignOptions = {
  expiresIn: '7d',
  algorithm: 'HS256',
};

/**
 * Signs a JWT from the given payload.
 * The secret is validated at boot (env.ts), so the cast is safe.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, JWT_OPTIONS);
}

/**
 * Verifies a JWT. Returns the decoded payload on success; throws
 * `ApiError.unauthorized` on any failure so callers don't need to
 * distinguish between expired, tampered, or simply missing tokens.
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    throw ApiError.unauthorized('Invalid or expired session. Please log in again.');
  }
}

/**
 * Builds the `Session` object returned by `GET /auth/me`.
 * The shape is defined by `sessionSchema` in the shared package.
 */
export function buildSession(user: IUser): Session {
  return {
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
