import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-must-be-at-least-32-chars!!';
process.env['MONGODB_URI'] = 'mongodb://127.0.0.1:27017/unused';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';
process.env['UPLOAD_DIR'] = '/tmp/test-uploads';

const { encodeCursor, decodeCursor, cursorFilter, toPage } = await import('../utils/cursor.js');
const { publishFilter } = await import('../utils/publish-filter.js');
const { ApiError } = await import('../utils/api-error.js');

const id = new Types.ObjectId('507f1f77bcf86cd799439011');
const when = new Date('2026-09-02T09:00:00.000Z');

describe('cursor', () => {
  it('round-trips a date and an id', () => {
    const decoded = decodeCursor(encodeCursor(when, id));
    expect(decoded.value.toISOString()).toBe(when.toISOString());
    expect(decoded.id.toString()).toBe(id.toString());
  });

  it('rejects a cursor that is not base64', () => {
    expect(() => decodeCursor('not a cursor!!')).toThrow(ApiError);
  });

  it('rejects a cursor with a bad object id', () => {
    const raw = Buffer.from(`${when.toISOString()}|nope`, 'utf8').toString('base64url');
    expect(() => decodeCursor(raw)).toThrow(ApiError);
  });

  it('rejects a cursor with a bad date', () => {
    const raw = Buffer.from(`banana|${id.toString()}`, 'utf8').toString('base64url');
    expect(() => decodeCursor(raw)).toThrow(ApiError);
  });

  it('builds a keyset filter that breaks ties on _id', () => {
    expect(cursorFilter('publishedAt', { value: when, id })).toEqual({
      $or: [{ publishedAt: { $lt: when } }, { publishedAt: when, _id: { $lt: id } }],
    });
  });
});

describe('toPage', () => {
  const row = (n: number) => ({ _id: new Types.ObjectId(), publishedAt: new Date(2026, 0, n) });

  it('returns a null cursor when no extra row came back', () => {
    const rows = [row(1), row(2)];
    const page = toPage(rows, 2, (r) => r.publishedAt);
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).toBeNull();
  });

  it('trims the over-fetched row and emits a cursor from the last kept one', () => {
    const rows = [row(1), row(2), row(3)];
    const page = toPage(rows, 2, (r) => r.publishedAt);
    expect(page.items).toHaveLength(2);
    expect(page.nextCursor).not.toBeNull();
    expect(decodeCursor(page.nextCursor!).id.toString()).toBe(rows[1]!._id.toString());
  });

  it('returns a null cursor for an empty result set', () => {
    expect(toPage<{ _id: Types.ObjectId; publishedAt: Date }>([], 10, (r) => r.publishedAt).nextCursor).toBeNull();
  });
});

describe('publishFilter', () => {
  it('excludes drafts and future-dated posts', () => {
    const filter = publishFilter();
    expect(filter.status).toBe('published');
    expect(filter.publishedAt.$lte.getTime()).toBeLessThanOrEqual(Date.now());
  });
});
