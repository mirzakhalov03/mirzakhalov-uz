import { env } from '../config/env.js';

/**
 * The one place the bot token is used. It never leaves the server (PRD §11.1).
 *
 * Returns whether Telegram accepted the message rather than throwing: a failed
 * relay is not a failed submission, because the message is already stored.
 */
export async function sendTelegramMessage(html: string): Promise<boolean> {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env;
  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID unset — message stored only');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      // The body names the problem (bad token, unknown chat) without echoing the token.
      console.error(`[telegram] relay failed: ${response.status} ${await response.text()}`);
    }
    return response.ok;
  } catch (err) {
    console.error('[telegram] relay failed:', err);
    return false;
  }
}

/** Telegram's HTML mode only needs these three escaped. */
export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
