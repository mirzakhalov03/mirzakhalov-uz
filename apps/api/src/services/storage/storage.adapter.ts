/**
 * The seam from Technical PRD §7. Nothing outside this folder knows where files
 * physically live, so swapping disk for S3/R2 later is one new implementation
 * of this interface — not a grep across the codebase.
 */
export interface StoredFile {
  /** Generated name, e.g. 'k3m9x2p1.webp'. Never the uploaded original. */
  filename: string;
  /** Storage-relative location, e.g. '2026/09/k3m9x2p1.webp'. */
  key: string;
  /** Publicly fetchable URL, e.g. '/static/2026/09/k3m9x2p1.webp'. */
  url: string;
  size: number;
  mime: string;
}

export interface StorageAdapter {
  /** Persist bytes and return everything the Asset document needs. */
  save(input: { buffer: Buffer; mime: string; extension: string }): Promise<StoredFile>;
  /** Remove a file. Resolves quietly if it is already gone. */
  remove(key: string): Promise<void>;
  /** Absolute location, for adapters that have one. Null for remote stores. */
  resolve(key: string): string | null;
}
