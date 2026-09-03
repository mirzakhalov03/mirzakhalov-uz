import { Data } from '../../primitives/Data.js';
import type { Score } from '../../content/types.js';

/**
 * An achievement drawn as a measured dimension rather than a trophy.
 *
 * The bar's length is the value against a stated scale, with end ticks and both
 * bounds labelled — so the row shows the scale rather than asserting a number.
 * "SAT 1330" means nothing to a reader who doesn't know the range; "1330 on
 * 400–1600" means something immediately, and is more honest besides (§3.6).
 */
export function DimensionRow({ score }: { score: Score }) {
  const fraction = (score.value - score.scaleMin) / (score.scaleMax - score.scaleMin);

  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between gap-3">
        <Data tone="muted">{score.label}</Data>
        <span className="t-numeral text-measured" data-numeric>
          {score.display}
        </span>
      </div>

      <div className="relative mt-2 h-2" aria-hidden="true">
        {/* The full scale, with a tick at each bound. */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-line-strong" />
        <div className="absolute left-0 top-0 h-2 w-px bg-line-strong" />
        <div className="absolute right-0 top-0 h-2 w-px bg-line-strong" />

        {/* The measurement itself, terminated by its own tick. */}
        <div
          className="absolute left-0 top-1/2 h-px bg-measured-rule"
          style={{ width: `${fraction * 100}%` }}
        />
        <div
          className="absolute top-0 h-2 w-px bg-measured-rule"
          style={{ left: `calc(${fraction * 100}% - 0.5px)` }}
        />
      </div>

      <div className="mt-1 flex justify-between">
        <Data tone="muted">{score.scaleMin}</Data>
        <Data tone="muted">{score.scaleMax}</Data>
      </div>
    </div>
  );
}
