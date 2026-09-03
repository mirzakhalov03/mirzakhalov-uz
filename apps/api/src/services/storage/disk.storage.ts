import { createHash } from 'node:crypto';
import { mkdir, rm } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { nanoid } from 'nanoid';
import { env } from '../../config/env.js';
import type { StorageAdapter, StoredFile } from './storage.adapter.js';

const root = path.resolve(process.cwd(), env.UPLOAD_DIR);

/** Files are foldered by year/month so a single directory never grows unbounded. */
function datedPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const diskStorage: StorageAdapter = {
  async save({ buffer, mime, extension }): Promise<StoredFile> {
    const filename = `${nanoid(12)}.${extension}`;
    const key = `${datedPrefix()}/${filename}`;
    const absolute = path.join(root, key);

    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, buffer);

    return {
      filename,
      key,
      url: `${env.PUBLIC_STATIC_PATH}/${key}`,
      size: buffer.byteLength,
      mime,
    };
  },

  async remove(key: string): Promise<void> {
    const absolute = this.resolve(key);
    if (!absolute) return;
    await rm(absolute, { force: true });
  },

  resolve(key: string): string | null {
    const absolute = path.resolve(root, key);
    // Refuse anything that escapes the upload root — keys are generated, but a
    // path-traversal check is one line and removes the whole class of bug.
    return absolute.startsWith(root + path.sep) ? absolute : null;
  },
};

/** Content hash, for future de-duplication of identical uploads. */
export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export const uploadRoot = root;
