import { Router } from 'express';
import { adminPostQuery, postInputSchema, postPatchSchema } from '@portfolio/shared';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/admin-post.controller.js';

/** Technical PRD §4.2 — full CRUD over posts, drafts included. */
export const adminPostRouter: Router = Router();

adminPostRouter.get(
  '/admin/posts',
  requireAdmin,
  validate(adminPostQuery, 'query'),
  asyncHandler(controller.listPosts),
);

adminPostRouter.post(
  '/admin/posts',
  requireAdmin,
  validate(postInputSchema),
  asyncHandler(controller.createPost),
);

adminPostRouter.get('/admin/posts/:id', requireAdmin, asyncHandler(controller.getPost));

adminPostRouter.patch(
  '/admin/posts/:id',
  requireAdmin,
  validate(postPatchSchema),
  asyncHandler(controller.patchPost),
);

adminPostRouter.delete('/admin/posts/:id', requireAdmin, asyncHandler(controller.deletePost));
