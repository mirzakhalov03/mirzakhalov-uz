import { Router } from 'express';
import { isDatabaseConnected } from '../config/db.js';

export const healthRouter: Router = Router();

/**
 * Reports DB connectivity, not just process liveness — a server that answers
 * 200 while Mongo is down is worse than one that admits it (Technical PRD §10).
 */
healthRouter.get('/health', (_req, res) => {
  const db = isDatabaseConnected();
  res.status(db ? 200 : 503).json({
    status: db ? 'ok' : 'degraded',
    db: db ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
