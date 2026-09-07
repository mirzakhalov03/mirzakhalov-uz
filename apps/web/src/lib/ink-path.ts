/**
 * A hand-drawn stroke, generated rather than eyeballed.
 *
 * §2 principle 1: every ornament must be derivable. So the wobble is the sum of
 * three sine terms at fixed frequencies, sampled every 8px — an imperfect line
 * that can say exactly where it came from. Deliberately NOT Math.random(): a
 * random path re-rolls on every render and flickers.
 *
 * The stroke is drawn inside a band `INK_WEIGHT` wide, centred, so the SVG that
 * carries it can stretch on one axis with preserveAspectRatio="none" while the
 * stroke itself stays 1px via vector-effect.
 */

/** The cross-axis size of the band the stroke wanders inside, in px. */
export const INK_WEIGHT = 6;

const FREQUENCIES = [1.7, 4.3, 9.1] as const;
const AMPLITUDES = [0.9, 0.45, 0.22] as const;
const SAMPLE_PX = 8;

export function inkPath(length: number, seed = 0, axis: 'x' | 'y' = 'x'): string {
  const centre = INK_WEIGHT / 2;
  const steps = Math.max(2, Math.round(length / SAMPLE_PX));
  const points: string[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;

    let cross = centre;
    for (let harmonic = 0; harmonic < FREQUENCIES.length; harmonic += 1) {
      /* noUncheckedIndexedAccess: both arrays are `as const` and read in
         lockstep, but the compiler still types the index as possibly
         undefined. */
      const frequency = FREQUENCIES[harmonic] ?? 0;
      const amplitude = AMPLITUDES[harmonic] ?? 0;
      const phase = seed * 0.618 + harmonic * 1.31;
      cross += Math.sin((t * frequency + phase) * Math.PI * 2) * amplitude;
    }

    const along = (t * length).toFixed(2);
    const wander = cross.toFixed(2);
    points.push(axis === 'x' ? `${along} ${wander}` : `${wander} ${along}`);
  }

  return `M ${points.join(' L ')}`;
}
