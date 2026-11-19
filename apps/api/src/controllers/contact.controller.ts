import type { Request, RequestHandler, Response } from 'express';
import type { ContactInput, ContactResponse } from '@portfolio/shared';
import { noStore } from '../utils/cache.js';
import * as contact from '../services/contact.service.js';

export const submitContact: RequestHandler = async (req: Request, res: Response) => {
  noStore(res);
  await contact.submitContact(req.body as ContactInput, {
    ip: req.ip ?? '',
    userAgent: req.get('user-agent') ?? '',
  });
  res.status(201).json({ ok: true } satisfies ContactResponse);
};
