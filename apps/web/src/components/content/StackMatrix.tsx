import { Data } from '../../primitives/Data.js';
import type { StackItem } from '../../content/types.js';

/**
 * Name plus frequency, with a violet edge on daily use. Replaces twelve
 * mismatched raster logos at four different inline sizes.
 *
 * Names are always visible. The old grid revealed them only on hover, so on any
 * touch device it showed twelve unlabelled icons and nothing said what they
 * were — a defect, not a style choice (§3.6).
 */
export function StackMatrix({ items }: { items: StackItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.name}
          className={`flex items-baseline justify-between gap-2 bg-surface px-2 py-1.5 ${
            item.frequency === 'daily' ? 'border-l-2 border-accent' : ''
          }`}
        >
          <span className="text-body text-fg">{item.name}</span>
          <Data tone={item.frequency === 'daily' ? 'accent' : 'muted'}>
            {item.frequency === 'daily' ? 'Daily' : 'Often'}
          </Data>
        </li>
      ))}
    </ul>
  );
}
