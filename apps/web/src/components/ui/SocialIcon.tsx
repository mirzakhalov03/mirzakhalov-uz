import { Mail } from 'lucide-react';
import { socialIcons } from '../content/social-icons.js';

/**
 * A channel's own mark, small and in its own colour — see `social-icons.ts`
 * for why that's a scoped exception to §4.7. Email has no third-party mark,
 * so it stays on the site's own `currentColor` icon set (Lucide, §3.5)
 * instead of a brand path.
 */
export function SocialIcon({
  label,
  className,
  mono = false,
}: {
  label: string;
  className?: string;
  /** Draw in `currentColor` instead of the brand colour — for a mark on a
   *  filled button, where the brand colour would fight the fill. */
  mono?: boolean;
}) {
  if (label === 'Email') return <Mail className={className} aria-hidden="true" />;

  const glyph = socialIcons[label];
  if (!glyph) return null;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={glyph.d} fill={mono ? 'currentColor' : glyph.color} />
    </svg>
  );
}
