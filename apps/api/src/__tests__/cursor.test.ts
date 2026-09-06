import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose, { Types } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

  it('builds a keyset filter that breaks ties on _id, marked trusted for sanitizeFilter', () => {
    // Each `$lt` clause must carry mongoose.trusted()'s marker — see the
    // comment on cursorFilter() — or config/db.ts's global `sanitizeFilter`
    // rewrites it into `{ $eq: { $lt: ... } }` and pagination throws instead
    // of paging (covered end-to-end below).
    expect(cursorFilter('publishedAt', { value: when, id })).toEqual({
      $or: [
        { publishedAt: mongoose.trusted({ $lt: when }) },
        { publishedAt: when, _id: mongoose.trusted({ $lt: id }) },
      ],
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

/**
 * Regression for a real bug, not a hypothetical one: `config/db.ts` enables
 * Mongoose's `sanitizeFilter` project-wide. Left unmarked, sanitizeFilter
 * rewrites any nested `{ $op: v }` filter value into `{ $eq: { $op: v } }`,
 * which Mongo cannot cast — a CastError instead of a result — and rejects a
 * top-level `$text` value outright unless it is marked trusted. This was
 * first caught by Task 6's `GET /admin/assets` test for `cursorFilter()`'s
 * `{ $lt: ... }` clauses, and, empirically, hits every other server-built
 * `$`-shaped filter value the same way: `publishFilter()`'s `{ $lte: ... }`,
 * the post service's prev/next neighbour bounds, and both of its `$text`
 * search branches. This block now covers the two shapes `cursorFilter()`
 * does not already cover — a `publishFilter()`-style `find()` and a `$text`
 * query — since post.service.ts composes both without going through
 * `cursorFilter()` at all.
 *
 * This runs an actual query against a live, sanitizeFilter-enabled connection
 * rather than asserting on the returned object's shape, because the shape is
 * not what breaks — a `{ $lt }` object looks identical whether or not it
 * carries Mongoose's internal trusted-symbol marker. Only a real query proves
 * the marker survived being merged into a caller's larger filter object via
 * `Object.assign`/spread, which is exactly how every current and future
 * caller uses these helpers (see `asset.service.ts`, `post.service.ts`).
 */
interface ProbeDoc {
  createdAt: Date;
  status: string;
  title: string;
  publishedAt?: Date;
}

describe('server-built filters against a live sanitizeFilter connection', () => {
  let mongo: MongoMemoryServer;
  let disconnectDatabase: () => Promise<void>;
  let Probe: import('mongoose').Model<ProbeDoc>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env['MONGODB_URI'] = mongo.getUri();

    const [db, mongooseModule] = await Promise.all([import('../config/db.js'), import('mongoose')]);
    ({ disconnectDatabase } = db);
    await db.connectDatabase();

    const mongooseDefault = mongooseModule.default;
    const schema = new mongooseDefault.Schema<ProbeDoc>({
      createdAt: { type: Date, required: true },
      status: { type: String, required: true },
      title: { type: String, required: true },
      // Typed as Date, mirroring post.model.ts's `publishedAt` path — the cast
      // that fails on an unmarked `{ $lte: ... }` only happens against a real
      // Date-typed schema path, so this field must exist for the test below to
      // actually exercise the bug rather than silently matching nothing.
      publishedAt: { type: Date },
    });
    schema.index({ title: 'text' });

    Probe =
      (mongooseDefault.models['CursorFilterProbe'] as import('mongoose').Model<ProbeDoc> | undefined) ??
      mongooseDefault.model<ProbeDoc>('CursorFilterProbe', schema);

    // Model.init() (which builds the `text` index above) runs fire-and-forget
    // at compile time; neither save() nor Query.exec() awaits it, so the
    // $text test below can race the background index build. Await it
    // explicitly, mirroring post-model.test.ts's beforeAll.
    await Probe.syncIndexes();
  });

  afterAll(async () => {
    await disconnectDatabase();
    await mongo.stop();
  });

  it('pages a real collection instead of throwing a CastError', async () => {
    // Mirrors asset.service.ts's listAssets: a base filter with a sibling key,
    // then cursorFilter()'s output merged in via Object.assign — the exact
    // composition that must keep the trust marking alive.
    const older = await Probe.create({
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      status: 'published',
      title: 'older',
    });
    const newer = await Probe.create({
      createdAt: new Date('2026-06-01T00:00:00.000Z'),
      status: 'published',
      title: 'newer',
    });

    const filter: Record<string, unknown> = {};
    Object.assign(
      filter,
      cursorFilter('createdAt', { value: newer.createdAt, id: newer._id as Types.ObjectId }),
    );

    const rows = await Probe.find(filter).sort({ createdAt: -1, _id: -1 }).exec();

    expect(rows).toHaveLength(1);
    expect(rows[0]!._id.toString()).toBe(older._id.toString());
  });

  it('a find() composing publishFilter() returns rows instead of throwing a CastError', async () => {
    // publishFilter()'s own `{ $lte: ... }` clause is what post.service.ts's
    // public reads spread into find() — this is that exact composition, not
    // a synthetic one, against a real sanitizeFilter-enabled connection. The
    // document must actually have a past `publishedAt` or the assertion below
    // proves nothing: it would pass just as well if the query matched zero
    // rows for an unrelated reason.
    await Probe.create({
      createdAt: new Date('2020-01-01'),
      status: 'published',
      title: 'visible',
      publishedAt: new Date('2020-01-01'),
    });

    const filter: Record<string, unknown> = { ...publishFilter() };
    const rows = await Probe.find(filter).exec();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.title).toBe('visible');
  });

  it('a trusted $text query executes instead of throwing a MongooseError', async () => {
    // Mirrors post.service.ts's search branches: a plain filter with a
    // sibling key, plus a $text value built by the server from an
    // already-validated query param and marked trusted.
    await Probe.create({ createdAt: new Date(), status: 'published', title: 'searchable phrase' });

    const filter: Record<string, unknown> = {
      status: 'published',
      $text: mongoose.trusted({ $search: 'searchable' }),
    };
    const rows = await Probe.find(filter).exec();

    expect(rows).toHaveLength(1);
    expect(rows[0]!.title).toBe('searchable phrase');
  });
});
