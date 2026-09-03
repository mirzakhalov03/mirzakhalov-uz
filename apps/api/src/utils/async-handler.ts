import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 5 forwards rejected promises to the error middleware on its own, but
 * wrapping keeps the intent explicit and the types tidy at the call site.
 */
export const asyncHandler =
  <T extends RequestHandler>(handler: T): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
