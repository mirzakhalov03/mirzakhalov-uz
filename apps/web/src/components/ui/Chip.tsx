import type { ReactNode } from 'react';

type Tone = 'live' | 'accent' | 'neutral' | 'quiet';

const tones: Record<Tone, string> = {
  live: 'border-live/50 text-live',
  accent: 'border-accent/60 text-accent-text',
  neutral: 'border-line-strong text-fg',
  quiet: 'border-line text-fg-muted',
};

/**
 * Status, stated positively. The old site put "Not for mobile view yet" on
 * eight of ten projects — leading with a deficiency on almost everything (§3.6).
 */
export function Chip({ tone = 'quiet', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`t-data inline-flex items-center border px-1.5 py-0.5 ${tones[tone]}`}>
      {children}
    </span>
  );
}
