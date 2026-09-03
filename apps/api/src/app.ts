import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOrigins, env, isProduction } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { uploadRoot } from './services/storage/index.js';

export function createApp(): Express {
  const app = express();

  // Behind Render/Railway/Fly's proxy, so rate limiting sees the real client IP.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // Assets are served from this origin but embedded by the web app on another.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: corsOrigins, // exact origins, never '*' with credentials (§11.2)
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  // Generated filenames are content-unique, so caching them forever is safe (§7).
  app.use(
    env.PUBLIC_STATIC_PATH,
    express.static(uploadRoot, {
      immutable: true,
      maxAge: '1y',
      index: false,
      dotfiles: 'ignore',
    }),
  );

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  if (!isProduction) {
    console.log(`[cors] allowing: ${corsOrigins.join(', ')}`);
  }

  return app;
}
