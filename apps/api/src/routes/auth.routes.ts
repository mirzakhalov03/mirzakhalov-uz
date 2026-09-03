import { Router } from 'express';
import { loginSchema } from '@portfolio/shared';
import { loginLimiter } from '../middlewares/rate-limit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { login, logout, me } from '../controllers/auth.controller.js';

/**
 * Auth endpoints — Technical PRD §4.2:
 *   POST /auth/login   Rate-limited + body-validated. Sets the httpOnly cookie.
 *   POST /auth/logout  Clears the cookie.
 *   GET  /auth/me      Session check; used by the admin app on every boot.
 */
export const authRouter: Router = Router();

authRouter.post('/auth/login', loginLimiter, validate(loginSchema), login);
authRouter.post('/auth/logout', logout);
authRouter.get('/auth/me', requireAdmin, me);
