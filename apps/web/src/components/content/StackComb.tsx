import { Data } from '../../primitives/Data.js';
import { StackMark } from '../ui/StackMark.js';
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
 * Every cell carries a violet border and lifts a touch on hover, in the tool's
 * own brand colour rather than the site's usual `currentColor` — a third-party
 * logo reads as itself only when it keeps its own colour.
 *
 * AI tools sit in the same comb as the rest of the stack rather than a comb of
 * their own — they are used the same way, daily, so splitting them out read as
 * a distinction the work doesn't make. `data-group` tints their fill instead,
 * just enough to tell the two apart without a second legend.
 */
export function StackComb({ items }: { items: StackItem[] }) {
  return (
    <ul className="comb">
      {items.map((item) => (
        <li key={item.name} className="comb__cell" data-group={item.group}>
          {/* A brand mark keeps its own colour (see stack-icons.ts), so the
              hover fill can sit close enough to wash it out. This hexagonal
              plate gives every glyph a constant bone backdrop, independent
              of the cell's own fill. A tool with no mark yet still gets a
              cell, not a hole — StackMark falls back to initials. */}
          <span className="comb__glyph-plate">
            <StackMark
              name={item.name}
              className="comb__glyph"
              initialClassName="comb__glyph comb__initial"
            />
          </span>

          <span className="comb__name">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The comb's title rule. Kept next to the comb because the legend is only true
 * of the comb — move one and the other has to move with it.
 */
export function StackCombHeader({ items }: { items: StackItem[] }) {
  return <Data tone="accent">Stack — {items.length} tools</Data>;
}
