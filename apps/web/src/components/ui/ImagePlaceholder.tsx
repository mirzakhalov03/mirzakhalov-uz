import { Data } from '../../primitives/Data.js';

/** Undrawn corner marks so an empty slot reads as a frame waiting for
 *  content, not a broken image. */
function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="8.5" cy="8.5" r="1.4" />
      <path d="M21 15l-5-5-10 10" />
    </svg>
  );
}

/**
 * The shared empty-image state — a dashed frame, the corner-mark glyph, and
 * an optional label. Same markup EducationChapter draws inline; pulled out
 * here so Media's link cards and photo grid don't redraw it a second time.
 */
export function ImagePlaceholder({
  label = 'Image placeholder',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1.5 rounded-frame border border-dashed border-line-strong bg-raised text-fg-subtle ${className}`}
    >
      <PlaceholderGlyph />
      {label ? <Data>{label}</Data> : null}
    </div>
  );
}
