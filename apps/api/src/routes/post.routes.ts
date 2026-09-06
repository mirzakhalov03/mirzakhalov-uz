import { Router } from 'express';
import { postQuery, postTagsQuery } from '@portfolio/shared';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/post.controller.js';

/**
 * Public blog reads — Technical PRD §4.1.
 *
 * ORDER MATTERS. Express matches in declaration order, so every literal path
 * under /posts must be registered before /posts/:slug — otherwise a request for
 * /posts/tags is matched as a slug and 404s as "post not found".
 */
export const postRouter: Router = Router();

postRouter.get('/posts', validate(postQuery, 'query'), asyncHandler(controller.listPosts));
postRouter.get('/posts/tags', validate(postTagsQuery, 'query'), asyncHandler(controller.listTags));
// /posts/feed.xml is registered here in Task 10 — also before /posts/:slug.
postRouter.get('/posts/:slug', asyncHandler(controller.getPost));
