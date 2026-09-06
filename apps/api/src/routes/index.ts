import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { adminAssetRouter } from './admin-asset.routes.js';

/**
 * Everything under /api/v1. Feature routers land here as milestones ship:
 *   M1 authRouter · M2 assetRouter, documentRouter · M3 projectRouter
 *   M4 profileRouter · M5 postRouter · M6 contactRouter, messageRouter
 */
export const apiRouter: Router = Router();

apiRouter.use(healthRouter);
// M1 — auth
apiRouter.use(authRouter);
// M2 (partial) — assets, pulled forward because post covers reference them
apiRouter.use(adminAssetRouter);
