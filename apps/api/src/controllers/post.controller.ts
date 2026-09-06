import type { Request, RequestHandler, Response } from 'express';
import type { PostQuery, PostTagsQuery } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { publicCache } from '../utils/cache.js';
import * as posts from '../services/post.service.js';

export const listPosts: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res);
  res.status(200).json(await posts.listPublishedPosts(validatedQuery<PostQuery>(req)));
};

export const listTags: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res, 300);
  res.status(200).json(await posts.listTags(validatedQuery<PostTagsQuery>(req).lang));
};

export const getPost: RequestHandler = async (req: Request, res: Response) => {
  publicCache(res);
  res.status(200).json(await posts.getPublishedPost(req.params['slug'] as string));
};
