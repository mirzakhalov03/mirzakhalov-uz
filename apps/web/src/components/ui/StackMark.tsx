import { resolveStackIcon } from '../content/stack-icons.js';

type StackMarkProps = {
  /** The tool as content names it — aliases resolve ("React 19" → React). */
  name: string;
  className?: string;
  /** Classes for the initials fallback; defaults to `className`. */
  initialClassName?: string;
};

/**
 * One tool's brand mark, or its first two letters when it has none.
 *
 * Shared by the About stack comb and the project folders so a tool looks the
 * same wherever it appears. Decorative by contract — `aria-hidden` either way —
 * because every caller already names the tool in text beside it or in an
 * `sr-only` list; announcing the logo too would read each name twice.
 */
export function StackMark({ name, className, initialClassName }: StackMarkProps) {
  const glyph = resolveStackIcon(name);

  if (!glyph) {
    /* No original mark (REST API, Web Audio) — initials are the honest stand-in. */
    return (
      <span className={initialClassName ?? className} aria-hidden="true">
        {name.slice(0, 2)}
      </span>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path d={glyph.d} fill={glyph.color} />
    </svg>
  );
}
