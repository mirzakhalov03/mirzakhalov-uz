import type { Response } from 'express';

/**
 * Content changes a few times a month, so a short shared cache costs nothing
 * and absorbs a burst of traffic on a link someone shared.
 */
export function publicCache(res: Response, seconds = 60): void {
  res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=300`);
}

/** Admin reads include drafts — never let a proxy hold on to them. */
export function noStore(res: Response): void {
  res.set('Cache-Control', 'no-store');
}
