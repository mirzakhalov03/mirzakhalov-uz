import { Post } from '../models/post.model.js';

/**
 * `model` is typed structurally to exactly the one method the registry calls
 * (`countDocuments`), rather than `Model<never>`. Mongoose's `Model<T>` generic
 * does not compose across heterogeneous documents in a single array, and
 * `Model<never>` would need an `as unknown as` cast to bridge that; a narrower
 * structural type sidesteps the mismatch entirely — every concrete Mongoose
 * model already has a compatible `countDocuments`, so no cast is needed here,
 * and nothing beyond `countDocuments` is exposed to a caller of this registry.
 */
export interface AssetReference {
  model: { countDocuments(filter: Record<string, unknown>): { exec(): Promise<number> } };
  field: string;
  /** Human-readable, used in the 409 message. */
  label: string;
}

/**
 * Which documents may point at an asset. `DELETE /admin/assets/:id` walks this
 * and refuses with a 409 naming what still uses the file (Technical PRD §7).
 *
 * Projects and documents each append one line here when their milestones land;
 * nothing else needs to change.
 */
export const assetReferences: AssetReference[] = [
  { model: Post, field: 'cover', label: 'post' },
];
