import { Router } from 'express';
import { contactInputSchema } from '@portfolio/shared';
import { contactLimiter } from '../middlewares/rate-limit.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import * as controller from '../controllers/contact.controller.js';

/**
 * Technical PRD §4.1 — POST /contact: rate-limited (5/hour per IP, §11.4),
 * honeypot-checked, stored, then relayed to Telegram.
 */
export const contactRouter: Router = Router();

contactRouter.post(
  '/contact',
  contactLimiter,
  validate(contactInputSchema),
  asyncHandler(controller.submitContact),
);
