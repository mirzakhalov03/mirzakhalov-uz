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
 */
export function publishFilter(): PublishFilter {
  return { status: 'published', publishedAt: { $lte: new Date() } };
}
