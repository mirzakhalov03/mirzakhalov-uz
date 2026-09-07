import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import type { ExperienceEntry } from '../../../content/types.js';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/** '2026-03' → 'Mar 2026'; '2023' → '2023'. Not Intl: the input is a partial
 *  date, and `new Date('2023')` is a UTC instant that can render as 2022 west
 *  of Greenwich. */
function label(value: string): string {
  const [year, month] = value.split('-');
  if (!year) return value;
  if (!month) return year;

  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : year;
}

export function TimelineEntry({
  entry,
  side,
}: {
  entry: ExperienceEntry;
  side: 'left' | 'right';
}) {
  const current = entry.to === null;

  return (
    <div className="timeline__entry" data-side={side}>
      <span className="timeline__node" aria-hidden="true" />

      <Plate className="flex flex-col gap-1 p-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="t-h4 text-fg">{entry.org}</h4>
          {current ? <Chip tone="live">Current</Chip> : null}
        </div>

        <Data>
          {label(entry.from)} — {entry.to === null ? 'present' : label(entry.to)}
        </Data>
        <Data tone="fg">{entry.role}</Data>

        {entry.detail ? <p className="mt-1 text-body text-fg-muted">{entry.detail}</p> : null}
      </Plate>
    </div>
  );
}
