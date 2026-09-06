import type { Request, RequestHandler, Response } from 'express';
import type { AdminPostQuery, PostInput, PostPatch } from '@portfolio/shared';
import { validatedQuery } from '../middlewares/validate.middleware.js';
import { noStore } from '../utils/cache.js';
import * as posts from '../services/post.service.js';

export const listPosts: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await posts.listAllPosts(validatedQuery<AdminPostQuery>(req)));
};

export const getPost: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  res.status(200).json(await posts.getPostById(req.params['id'] as string));
};

export const createPost: RequestHandler = async (req: Request, res: Response) => {
  res.status(201).json(await posts.createPost(req.body as PostInput));
};

export const patchPost: RequestHandler = async (req: Request, res: Response) => {
  res.status(200).json(await posts.updatePost(req.params['id'] as string, req.body as PostPatch));
};

export const deletePost: RequestHandler = async (req: Request, res: Response) => {
  await posts.deletePost(req.params['id'] as string);
  res.status(204).end();
};
