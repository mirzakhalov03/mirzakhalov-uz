import type { NextFunction, Request, RequestHandler, Response } from 'express';
import multer from 'multer';
import { MAX_PDF_BYTES } from '@portfolio/shared';
import { ApiError } from '../utils/api-error.js';

/**
 * memoryStorage, NOT diskStorage — StorageAdapter.save() takes a Buffer, and
 * letting multer write to disk itself would bypass the seam and hard-code disk
 * into the upload path, which is exactly what the interface exists to prevent
 * (Technical PRD §7).
 *
 * The limit here is the larger of the two caps; the per-kind cap is applied in
 * asset.service.ts once the real MIME has been sniffed, because multer cannot
 * know whether a file is an image or a PDF before reading it.
 */
const handler = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES, files: 1 },
}).single('file');

export const uploadSingle: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  handler(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(
          ApiError.payloadTooLarge(
            `File is too large. The maximum is ${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB.`,
          ),
        );
        return;
      }
      next(ApiError.badRequest(err.message, { file: err.message }));
      return;
    }
    next(err);
  });
};
