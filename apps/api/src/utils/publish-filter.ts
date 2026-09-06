import mongoose from 'mongoose';

export interface PublishFilter {
  status: 'published';
  publishedAt: { $lte: Date };
}

/**
 * The single definition of "publicly visible" (Technical PRD §4.1 — enforce in
 * a shared query helper, not per-route). Every public read path composes this,
 * including prev/next resolution, tag counts, search and the feed, so a draft
 * cannot leak sideways through a neighbour link.
 *
 * It returns a plain filter object rather than mutating a query builder so the
 * same value drops into find(), countDocuments() and an aggregation $match.
 *
 * The $lte clause delivers scheduled publishing for free: a post dated in the
 * future simply does not match until its moment arrives.
 *
 * `mongoose.trusted(...)` on the `publishedAt` clause: `config/db.ts` sets
 * `sanitizeFilter: true` project-wide, which rewrites any nested `{ $op: v }`
 * value that isn't marked trusted into `{ $eq: { $op: v } }` — an object Mongo
 * cannot cast to a Date, so every caller composing this filter into a `find()`
 * would throw a CastError instead of returning rows. The exemption is narrow:
 * this `Date` is built by the server itself, one line up, never from raw
 * request input, which is exactly the case `trusted()` exists for.
 */
export function publishFilter(): PublishFilter {
  return { status: 'published', publishedAt: mongoose.trusted({ $lte: new Date() }) };
}
