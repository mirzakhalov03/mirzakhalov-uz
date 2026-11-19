import type { ReactNode } from 'react';

type Tone = 'live' | 'liveSolid' | 'accent' | 'neutral' | 'quiet' | 'solid';
type Size = 'sm' | 'md';

const tones: Record<Tone, string> = {
  live: 'border-live/50 text-live',
  accent: 'border-accent/60 text-accent-text',
  neutral: 'border-line-strong text-fg',
  quiet: 'border-line text-fg-muted',
  /**
   * The one filled chip. `--accent-text` is by definition this ground's accent
   * at text contrast against `--surface`, so inverting the pair is
   * contrast-correct on bone and void alike — the same trick the About nav uses
   * for its selected tab. `--accent` as a fill lands at 4.1:1 and is not.
   */
  solid: 'border-transparent bg-accent-text text-surface',
  /** `live`, filled. Mint on every ground rather than the ground's own
   *  `--live` — on bone that is the deep green, which reads heavy as a fill.
   *  Void ink on mint is ~11:1, so the pair holds on bone and void alike. */
  liveSolid: 'border-transparent bg-mint text-void',
};

const sizes: Record<Size, string> = {
  sm: 't-data px-1.5 py-0.5',
  md: 't-data-lg px-2 py-1',
};

/**
 * Status, stated positively. The old site put "Not for mobile view yet" on
 * eight of ten projects — leading with a deficiency on almost everything (§3.6).
 *
 * Two sizes because chips now do two jobs: `sm` is metadata riding under a
 * plate (Live, Source, Case study), `md` is the highlight row a project card
 * leads with, which has to out-weigh the title's neighbours rather than sit
 * beneath them.
 */
export function Chip({
  tone = 'quiet',
  size = 'sm',
  className = '',
  children,
}: {
  tone?: Tone;
  size?: Size;
  /** Extra classes — e.g. `rounded-pill` where a chip sits in a folder. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`inline-flex items-center border ${sizes[size]} ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
