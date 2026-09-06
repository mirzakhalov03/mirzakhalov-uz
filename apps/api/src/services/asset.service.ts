import { fileTypeFromBuffer } from 'file-type';
import { imageSize } from 'image-size';
import { Types } from 'mongoose';
import {
  ALLOWED_IMAGE_MIME,
  ALLOWED_MIME,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  type Asset as AssetWire,
  type AssetKind,
  type AssetQuery,
} from '@portfolio/shared';
import { Asset, type IAsset } from '../models/asset.model.js';
import { storage } from './storage/index.js';
import { assetReferences } from './references.js';
import { ApiError } from '../utils/api-error.js';
import { cursorFilter, decodeCursor, toPage } from '../utils/cursor.js';

function kindFor(mime: string): AssetKind {
  if ((ALLOWED_IMAGE_MIME as readonly string[]).includes(mime)) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  return 'other';
}

/** `key` is storage-internal and deliberately absent from the wire shape. */
export function toAssetWire(doc: IAsset): AssetWire {
  return {
    id: doc._id.toString(),
    filename: doc.filename,
    originalName: doc.originalName,
    mime: doc.mime,
    size: doc.size,
    kind: doc.kind,
    url: doc.url,
    ...(doc.width !== undefined && { width: doc.width }),
    ...(doc.height !== undefined && { height: doc.height }),
    alt: doc.alt,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function objectIdOrThrow(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid id', { id: 'That is not a valid identifier.' });
  }
  return new Types.ObjectId(id);
}

export async function createAsset(input: {
  buffer: Buffer;
  originalName: string;
  alt: string;
}): Promise<AssetWire> {
  // The multipart Content-Type is client-supplied. Sniff the real type from the
  // magic bytes instead (Technical PRD §7).
  const sniffed = await fileTypeFromBuffer(input.buffer);

  if (!sniffed || !(ALLOWED_MIME as readonly string[]).includes(sniffed.mime)) {
    throw ApiError.badRequest('That file type is not allowed.', {
      file: `Allowed types: ${ALLOWED_MIME.join(', ')}.`,
    });
  }

  const kind = kindFor(sniffed.mime);
  const cap = kind === 'image' ? MAX_IMAGE_BYTES : MAX_PDF_BYTES;

  if (input.buffer.byteLength > cap) {
    throw ApiError.payloadTooLarge(
      `That ${kind} is too large. The maximum is ${Math.round(cap / 1024 / 1024)} MB.`,
    );
  }

  const alt = input.alt.trim();
  if (kind === 'image' && alt.length === 0) {
    throw ApiError.badRequest('Alt text is required for images.', {
      alt: 'Describe the image for screen readers.',
    });
  }

  let width: number | undefined;
  let height: number | undefined;
  if (kind === 'image') {
    try {
      const measured = imageSize(input.buffer);
      width = measured.width;
      height = measured.height;
    } catch {
      // AVIF and some exotic encodings are unmeasurable here. Dimensions are a
      // nicety for the media library, not a reason to reject a valid upload.
    }
  }

  const stored = await storage.save({
    buffer: input.buffer,
    mime: sniffed.mime,
    extension: sniffed.ext,
  });

  try {
    const doc = await Asset.create({
      filename: stored.filename,
      originalName: input.originalName,
      mime: stored.mime,
      size: stored.size,
      kind,
      key: stored.key,
      url: stored.url,
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),
      alt,
    });
    return toAssetWire(doc);
  } catch (err) {
    // Do not leave an orphaned file behind if the document fails to save.
    await storage.remove(stored.key);
    throw err;
  }
}

export async function listAssets(
  query: AssetQuery,
): Promise<{ items: AssetWire[]; nextCursor: string | null }> {
  const filter: Record<string, unknown> = {};
  if (query.kind) filter['kind'] = query.kind;
  if (query.cursor) Object.assign(filter, cursorFilter('createdAt', decodeCursor(query.cursor)));

  const rows = await Asset.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(query.limit + 1)
    .exec();

  const page = toPage(rows, query.limit, (row) => row.createdAt);
  return { items: page.items.map(toAssetWire), nextCursor: page.nextCursor };
}

export async function getAsset(id: string): Promise<AssetWire> {
  const doc = await Asset.findById(objectIdOrThrow(id)).exec();
  if (!doc) throw ApiError.notFound('Asset not found');
  return toAssetWire(doc);
}

export async function updateAssetAlt(id: string, alt: string): Promise<AssetWire> {
  const doc = await Asset.findById(objectIdOrThrow(id)).exec();
  if (!doc) throw ApiError.notFound('Asset not found');

  doc.alt = alt;
  await doc.save();
  return toAssetWire(doc);
}

export async function deleteAsset(id: string): Promise<void> {
  const objectId = objectIdOrThrow(id);
  const doc = await Asset.findById(objectId).exec();
  if (!doc) throw ApiError.notFound('Asset not found');

  for (const reference of assetReferences) {
    const count = await reference.model.countDocuments({ [reference.field]: objectId }).exec();
    if (count > 0) {
      throw ApiError.conflict(
        `This file is still used by ${count} ${reference.label}${count === 1 ? '' : 's'}. Remove it there first.`,
      );
    }
  }

  await storage.remove(doc.key);
  await doc.deleteOne();
}
