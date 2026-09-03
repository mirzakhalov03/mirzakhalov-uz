import type { IUser } from '../models/user.model.js';

/**
 * Augment Express's Request interface so every guarded handler knows
 * `req.user` is a full Mongoose document when `requireAdmin` has run.
 *
 * This file is picked up by TypeScript automatically because it is inside
 * the project's `src/` tree. No import or triple-slash reference is needed.
 */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
