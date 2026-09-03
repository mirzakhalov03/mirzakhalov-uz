import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/api-error.js';

type Source = 'body' | 'query' | 'params';

/** Flatten Zod issues into the `fields` map the client renders at each input. */
function toFields(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_';
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * One middleware for every mutation body, per Technical PRD §4.3 — no ad-hoc
 * `if (!req.body.title)` anywhere in the codebase.
 *
 * The parsed (and defaulted, and coerced) value replaces the raw one, so
 * handlers only ever see validated data.
 */
export function validate(schema: ZodType, source: Source = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(ApiError.badRequest('Validation failed', toFields(result.error.issues)));
      return;
    }

    if (source === 'query') {
      // Express 5 exposes req.query as a getter — assign onto the request instead.
      (req as Request & { validatedQuery?: unknown }).validatedQuery = result.data;
    } else {
      req[source] = result.data as never;
    }
    next();
  };
}

/** Reads what `validate(schema, 'query')` stored. */
export function validatedQuery<T>(req: Request): T {
  return (req as Request & { validatedQuery: T }).validatedQuery;
}
