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

  // Transport-layer errors (e.g. body-parser's http-errors instances, thrown
  // when a payload exceeds express.json()'s limit) carry a numeric
  // status/statusCode instead of being an ApiError. Map any such 4xx error
  // onto the standard envelope so it never falls through to a 500.
  if (typeof err === 'object' && err !== null) {
    const status = (err as { status?: unknown }).status ?? (err as { statusCode?: unknown }).statusCode;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      const type = (err as { type?: unknown }).type;
      const code =
        status === 413
          ? 'PAYLOAD_TOO_LARGE'
          : typeof type === 'string' && type
            ? type.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
            : 'BAD_REQUEST';
      const message = (err as { message?: unknown }).message;
      res.status(status).json({
        error: { code, message: typeof message === 'string' && message ? message : 'Request could not be processed' },
      });
      return;
    }
  }

  console.error('[error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL',
      message: isProduction ? 'Something went wrong' : String((err as Error)?.message ?? err),
    },
  });
};
