import { Router } from 'express';
import { assetQuery, assetUpdateSchema } from '@portfolio/shared';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { uploadLimiter } from '../middlewares/rate-limit.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/admin-asset.controller.js';

/** Technical PRD §4.2 — the media library. Every route is admin-only. */
export const adminAssetRouter: Router = Router();

// requireAdmin runs before multer so an anonymous caller never gets to upload
// bytes into memory in the first place.
adminAssetRouter.post(
  '/admin/assets',
  requireAdmin,
  uploadLimiter,
  uploadSingle,
  asyncHandler(controller.uploadAsset),
);

adminAssetRouter.get(
  '/admin/assets',
  requireAdmin,
  validate(assetQuery, 'query'),
  asyncHandler(controller.listAssets),
);

adminAssetRouter.get('/admin/assets/:id', requireAdmin, asyncHandler(controller.getAsset));

adminAssetRouter.patch(
  '/admin/assets/:id',
  requireAdmin,
  validate(assetUpdateSchema),
  asyncHandler(controller.patchAsset),
);

adminAssetRouter.delete('/admin/assets/:id', requireAdmin, asyncHandler(controller.deleteAsset));
