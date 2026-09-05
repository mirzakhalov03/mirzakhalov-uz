/**
 * An open palm, drawn rather than typed.
 *
 * An emoji would render in whatever font the device ships — Apple's yellow hand
 * on a Mac, something unrelated on Android — and could not take the button's
 * colour. Lucide's `Hand` is the right family but its fingers are too short to
 * survive at 17px; they close up into a mitten. These are drawn long, with the
 * thumb splayed out to the left, so the silhouette still reads as a greeting at
 * the size the top bar actually uses.
 *
 * Strokes in `currentColor`, so it inverts with the label it sits beside.
 * The wave itself is CSS — see `.hand-wave` in substrate.css.
 */
export function WaveHand({ size = 17, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M10.8 11.8V4.6a1.4 1.4 0 0 1 2.8 0v6.8" />
      <path d="M13.6 11.4V3.2a1.4 1.4 0 0 1 2.8 0v8.2" />
      <path d="M16.4 11.6V4.9a1.4 1.4 0 0 1 2.8 0v6.9" />
      <path d="M10.8 12.2V7a1.4 1.4 0 0 0-2.8 0v7.6" />
      <path d="M8 13.4 5.9 11a1.5 1.5 0 0 0-2.25 1.97l3.4 4.35A7 7 0 0 0 12.6 22h.6a6 6 0 0 0 6-6v-4.4" />
    </svg>
  );
}
