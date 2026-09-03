/**
 * The eight-point khatam, computed rather than drawn.
 *
 * Girih is compass-and-straightedge work, so the figure has to be derivable or
 * it is just a pasted pattern (§2 principle 1). Two squares inscribed in the
 * same circle and rotated 45° intersect at radius R·cos45°/cos22.5° = 0.7654R.
 * That intersection is the star's inner vertex — so the star is literally the
 * overlap of its own generating squares, and both stay visible behind it.
 */

const R = 88;
const INNER = (R * Math.cos(Math.PI / 4)) / Math.cos(Math.PI / 8); // 0.7654 R

const polar = (radius: number, degrees: number) => {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return [radius * Math.cos(rad), radius * Math.sin(rad)] as const;
};

const toPath = (points: readonly (readonly [number, number])[]) =>
  `${points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`).join('')}Z`;

/** 16 alternating vertices: outer at k·45°, inner at 22.5° + k·45°. */
const star = toPath(
  Array.from({ length: 16 }, (_, k) => polar(k % 2 === 0 ? R : INNER, k * 22.5)),
);

/** The two generating squares, corners on the circle, 45° apart. */
const squares = [0, 45].map((offset) =>
  toPath(Array.from({ length: 4 }, (_, k) => polar(R, offset + k * 90))),
);

/** The radials the compass would have swung, at every star vertex. */
const radials = Array.from({ length: 16 }, (_, k) => polar(R, k * 22.5));

export function Rosette({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="-100 -100 200 200"
      className={`rosette-turn w-full ${className}`}
      role="img"
      aria-label="An eight-point girih rosette drawn over the circles and squares that generate it"
    >
      {/* Construction, visible at rest — the plate is never blank or mid-state. */}
      <g stroke="var(--accent)" fill="none" strokeWidth="0.5" opacity="0.28">
        {radials.map(([x, y], i) => (
          <line key={i} x1="0" y1="0" x2={x} y2={y} />
        ))}
        <circle cx="0" cy="0" r={R} />
        <circle cx="0" cy="0" r={INNER} />
        <circle cx="0" cy="0" r={R / 2} />
      </g>

      <g stroke="var(--accent)" fill="none" strokeWidth="0.75" opacity="0.45">
        {squares.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* The figure itself: draws once on load, then fills. Never again (§4.2). */}
      <path
        d={star}
        pathLength={1}
        className="construct-fill"
        fill="var(--accent)"
        stroke="none"
      />
      <path
        d={star}
        pathLength={1}
        className="construct-line"
        fill="none"
        stroke="var(--accent-text)"
        strokeWidth="1.25"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/** The same figure with a wrong inner radius, so it visibly fails to close. For 404. */
export function BrokenRosette({ className = '' }: { className?: string }) {
  const wrong = toPath(
    Array.from({ length: 16 }, (_, k) => polar(k % 2 === 0 ? R : R * 0.52, k * 22.5)),
  );
  return (
    <svg viewBox="-100 -100 200 200" className={`w-full ${className}`} aria-hidden="true">
      <g stroke="var(--accent)" fill="none" strokeWidth="0.5" opacity="0.28">
        <circle cx="0" cy="0" r={R} />
        <circle cx="0" cy="0" r={INNER} />
      </g>
      <path d={wrong} fill="none" stroke="var(--danger)" strokeWidth="1.25" />
    </svg>
  );
}
