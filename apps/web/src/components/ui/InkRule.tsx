import { INK_WEIGHT, inkPath } from '../../lib/ink-path.js';

/** The path is generated once at this length and stretched to fit. */
const NOMINAL = 600;

type InkRuleProps = {
  /** Changes the wobble. Same seed, same line — give each rule its own. */
  seed?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

/**
 * The one organic mark in the system (design doc §3.4 keeps everything else
 * flat and square). It takes its colour from `currentColor`, so it re-points
 * with the ground like every other component and never needs to know whether it
 * landed on bone or void.
 */
export function InkRule({ seed = 0, orientation = 'horizontal', className = '' }: InkRuleProps) {
  const vertical = orientation === 'vertical';
  const path = inkPath(NOMINAL, seed, vertical ? 'y' : 'x');

  return (
    <svg
      viewBox={vertical ? `0 0 ${INK_WEIGHT} ${NOMINAL}` : `0 0 ${NOMINAL} ${INK_WEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={`${vertical ? 'h-full' : 'w-full'} block ${className}`}
      style={vertical ? { width: `${INK_WEIGHT}px` } : { height: `${INK_WEIGHT}px` }}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        /* Keeps the stroke 1px however far the viewBox is stretched. */
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
