import { createHmac } from 'node:crypto';
import type { ContactInput } from '@portfolio/shared';
import { env } from '../config/env.js';
import { Message } from '../models/message.model.js';
import { escapeHtml, sendTelegramMessage } from './telegram.service.js';

export type SenderMeta = { ip: string; userAgent: string };

/** Keyed, so the stored hash cannot be reversed by hashing every IPv4 address. */
const hashIp = (ip: string): string => createHmac('sha256', env.JWT_SECRET).update(ip).digest('hex');

function formatForTelegram({ name, email, message }: ContactInput): string {
  return [
    '<b>New message from mirzakhalov.uz</b>',
    '',
    `<b>Name:</b> ${escapeHtml(name)}`,
    email ? `<b>Email:</b> ${escapeHtml(email)}` : null,
    '',
    escapeHtml(message),
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Store first, then relay — so the message survives whatever Telegram does.
 *
 * A filled honeypot returns as if it worked. Telling a bot it was caught only
 * teaches it which field to leave empty.
 */
export async function submitContact(input: ContactInput, meta: SenderMeta): Promise<void> {
  if (input.website) return;

  const doc = await Message.create({
    name: input.name,
    email: input.email,
    message: input.message,
    ipHash: hashIp(meta.ip),
    userAgent: meta.userAgent.slice(0, 500),
  });

  if (await sendTelegramMessage(formatForTelegram(input))) {
    doc.relayed = true;
    await doc.save();
  }
}
