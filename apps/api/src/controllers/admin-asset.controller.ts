import type { Request, RequestHandler, Response } from 'express';
import { assetQuery, type AssetQuery, type AssetUpdateInput } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { ApiError } from '../utils/api-error.js';
import { noStore } from '../utils/cache.js';
import * as assets from '../services/asset.service.js';

export const uploadAsset: RequestHandler = async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw ApiError.badRequest('No file uploaded.', { file: 'Attach a file to upload.' });
  }

  const alt = typeof req.body?.alt === 'string' ? req.body.alt : '';
  const created = await assets.createAsset({
    buffer: file.buffer,
    originalName: file.originalname,
    alt,
  });

  res.status(201).json(created);
};

export const listAssets: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await assets.listAssets(validatedQuery<AssetQuery>(req) ?? assetQuery.parse({})));
};

export const getAsset: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await assets.getAsset(req.params['id'] as string));
};

export const patchAsset: RequestHandler = async (req: Request, res: Response) => {
  const { alt } = req.body as AssetUpdateInput;
  res.status(200).json(await assets.updateAssetAlt(req.params['id'] as string, alt));
};

export const deleteAsset: RequestHandler = async (req: Request, res: Response) => {
  await assets.deleteAsset(req.params['id'] as string);
  res.status(204).end();
};
