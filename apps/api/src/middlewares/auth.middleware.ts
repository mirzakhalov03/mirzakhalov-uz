import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';

/**
 * Guards every admin route. When this middleware passes:
 *   • The JWT in the httpOnly cookie is valid and unexpired.
 *   • The user still exists in the database (soft revocation).
 *   • `req.user` is populated and fully typed.
 *
 * Technical PRD §6 and §4.2.
 */
export const requireAdmin: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.cookies?.token;

  if (!token) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    const payload = verifyToken(token);

    // Verify the user still exists — catches the "account deleted" edge case
    // without needing a token blocklist.
    const user = await User.findById(payload.sub).exec();
    if (!user) {
      next(ApiError.unauthorized('Account not found.'));
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    // verifyToken already throws ApiError.unauthorized on JWT failures.
    next(err);
  }
};
