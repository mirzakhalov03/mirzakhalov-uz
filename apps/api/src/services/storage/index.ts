import { diskStorage } from './disk.storage.js';
import type { StorageAdapter } from './storage.adapter.js';

/**
 * The single place the storage backend is chosen. Moving to S3/R2 means adding
 * an adapter and changing this line (see Technical PRD §7).
 */
export const storage: StorageAdapter = diskStorage;

export type { StorageAdapter, StoredFile } from './storage.adapter.js';
export { uploadRoot } from './disk.storage.js';
