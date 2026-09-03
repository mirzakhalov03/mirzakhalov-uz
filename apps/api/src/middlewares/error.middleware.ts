import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiError } from '../utils/api-error.js';
import { isProduction } from '../config/env.js';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
};

/**
 * The single exit point for every failure. Nothing else in the app formats an
 * error response, so the shape in Technical PRD §4.3 cannot drift.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) },
    });
    return;
  }

  // Mongo duplicate key — almost always a slug collision here.
  if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'That value is already taken' },
    });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: isProduction ? 'Something went wrong' : String((err as Error)?.message ?? err),
    },
  });
};
