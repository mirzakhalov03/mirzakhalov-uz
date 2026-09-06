import mongoose, { type Document, type Model, Schema, type Types } from 'mongoose';
import { assetKind, type AssetKind } from '@portfolio/shared';

/**
 * Technical PRD §3.4. `key` is storage-internal and never crosses the wire —
 * clients get `url`. Keeping them separate is what lets the StorageAdapter move
 * from disk to S3 without changing a single response shape.
 */
export interface IAsset extends Document {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mime: string;
  size: number;
  kind: AssetKind;
  key: string;
  url: string;
  width?: number;
  height?: number;
  alt: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetModelSchema = new Schema<IAsset>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: assetKind.options, required: true },
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    alt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
      // Technical PRD §11.8 — the old site had an empty alt on every image.
      // Enforcing it in the schema is how it stays fixed.
      validate: {
        validator(this: IAsset, value: string): boolean {
          return this.kind !== 'image' || value.trim().length > 0;
        },
        message: 'Alt text is required for images.',
      },
    },
  },
  { timestamps: true, strict: true },
);

assetModelSchema.index({ createdAt: -1, _id: -1 });
assetModelSchema.index({ kind: 1, createdAt: -1, _id: -1 });

// Idempotent registration: vitest's `singleFork` pool runs every test file in
// one process against one shared mongoose instance, re-executing this module
// per file while the model registry persists. A bare `mongoose.model(...)`
// call would throw `OverwriteModelError` the second time this file loads.
export const Asset =
  (mongoose.models['Asset'] as Model<IAsset> | undefined) ??
  mongoose.model<IAsset>('Asset', assetModelSchema);
