import { Data } from '../../primitives/Data.js';
import { stackIcons } from './stack-icons.js';
import type { StackItem } from '../../content/types.js';

/**
 * The stack, drawn as a honeycomb: one pointy-top hexagon per tool, tessellated
 * on a three-quarter row pitch with alternate rows offset by half a cell.
 *
 * The comb is the site's own figure rather than a borrowed one — §2 principle 1
 * asks the geometry to be constructed, so the cell is a real hexagon (the 2/√3
 * ratio, the 25/75 facets) and the tiling is the hexagon's own, not a grid of
 * hex-shaped cards with gaps guessed by eye. Geometry lives in `substrate.css`;
 * this file is the twelve cells and what goes in them.
 *
 * Names stay visible inside the cell. The old tools grid revealed them only on
 * hover, so on any touch device it showed twelve unlabelled logos and nothing
 * said what they were — a defect, not a style choice (§3.6). An icon replaces
 * the name for recognition, never for identification.
 *
 * Daily use keeps the violet marking it had in the matrix, moved from a left
 * edge to the cell's base facet — the one place on a hexagon where a straight
 * rule reads as part of the shape instead of a border stuck to it.
 */
export function StackComb({ items }: { items: StackItem[] }) {
  return (
    <ul className="comb">
      {items.map((item) => {
        const glyph = stackIcons[item.name];

        return (
          <li key={item.name} className="comb__cell" data-frequency={item.frequency}>
            {glyph ? (
              <svg viewBox="0 0 24 24" className="comb__glyph" aria-hidden="true" focusable="false">
                <path d={glyph} fill="currentColor" />
              </svg>
            ) : (
              /* A tool with no mark yet still gets a cell, not a hole. */
              <span className="comb__glyph comb__initial" aria-hidden="true">
                {item.name.slice(0, 2)}
              </span>
            )}

            <span className="comb__name">{item.name}</span>
            <span className="sr-only">
              {item.frequency === 'daily' ? '— daily use' : '— used often'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The comb's title rule. Kept next to the comb because the legend is only true
 * of the comb — move one and the other has to move with it.
 */
export function StackCombHeader({ items }: { items: StackItem[] }) {
  const daily = items.filter((item) => item.frequency === 'daily').length;

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Data tone="accent">Stack — {items.length} tools</Data>
      <Data>
        <span className="comb-key" aria-hidden="true" /> {daily} daily
      </Data>
    </div>
  );
}
