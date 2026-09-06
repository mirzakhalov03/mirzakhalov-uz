import mongoose, { Types } from 'mongoose';
import { ApiError } from './api-error.js';

export interface Cursor {
  value: Date;
  id: Types.ObjectId;
}

/**
 * Keyset pagination over a descending sort on (`key`, `_id`).
 *
 * The cursor carries BOTH keys. Paginating on a timestamp alone silently skips
 * or repeats rows whenever two documents share a second — rare in production,
 * routine in a seed script that inserts a batch in one tick.
 */
export function encodeCursor(value: Date, id: Types.ObjectId | string): string {
  return Buffer.from(`${value.toISOString()}|${id.toString()}`, 'utf8').toString('base64url');
}

export function decodeCursor(raw: string): Cursor {
  const [iso, id] = Buffer.from(raw, 'base64url').toString('utf8').split('|');
  const value = new Date(iso ?? '');

  if (!iso || !id || Number.isNaN(value.getTime()) || !Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid cursor', {
      cursor: 'This cursor is malformed. Request the first page without one.',
    });
  }

  return { value, id: new Types.ObjectId(id) };
}

/**
 * The `WHERE` half of keyset pagination.
 *
 * `config/db.ts` turns on Mongoose's `sanitizeFilter` project-wide (Technical
 * PRD §11) — a deliberate defence against a raw request value smuggling a
 * `$`-prefixed operator into a query. Its mechanism: any object it finds in
 * filter-value position whose own keys start with `$` gets rewritten from
 * `{ $lt: v }` to `{ $eq: { $lt: v } }`, which is exactly what breaks keyset
 * pagination — unless that specific object carries `mongoose.trusted()`'s
 * marker. (Marking only the *outer* filter is not enough: sanitizeFilter's
 * check runs per nested value, not once at the top, so each `{ $lt: ... }`
 * object must be marked individually — confirmed empirically against a live
 * `mongodb-memory-server`, since even Mongoose's own documented top-level
 * `trusted()` example does not survive its own sanitizer on this version.)
 *
 * This is a narrow, audited exemption, not a bypass of the protection: the
 * `$lt` values here come from `decodeCursor()`, which only ever produces a
 * `Date` and an `ObjectId` it has itself validated — never raw, unparsed user
 * text. Marking trusted here, once, means every caller (asset, post, and any
 * future keyset-paginated listing) gets a filter that is already safe, rather
 * than each one having to rediscover this and remember to do it themselves.
 */
export function cursorFilter(key: string, cursor: Cursor): Record<string, unknown> {
  return {
    $or: [
      { [key]: mongoose.trusted({ $lt: cursor.value }) },
      { [key]: cursor.value, _id: mongoose.trusted({ $lt: cursor.id }) },
    ],
  };
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Slice an over-fetched result set (query for `limit + 1`) and derive the next
 * cursor from the last row actually kept.
 */
export function toPage<T extends { _id: Types.ObjectId }>(
  rows: T[],
  limit: number,
  sortValue: (row: T) => Date,
): Page<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor(sortValue(last), last._id) : null,
  };
}
