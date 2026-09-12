import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import { formatPartialDate } from '../../../lib/date-label.js';
import type { ExperienceEntry } from '../../../content/types.js';

export function TimelineEntry({
  entry,
  side,
  index,
}: {
  entry: ExperienceEntry;
  side: 'left' | 'right';
  index: number;
}) {
  const current = entry.to === null;

  return (
    <div className="timeline__entry" data-side={side} style={{ gridRow: index + 1 }}>
      <span className="timeline__node" aria-hidden="true" />

      {/* Bone, not the ground's own plate. On the void band --surface-raised is
          one step off the ground and reads as a hairline, not as a card — so a
          plate there separates without making anything easier to read. The band
          is the frame; the cards are reading islands on it (§2 principle 7). */}
      <Plate surface="bone" className="flex flex-col gap-1 p-3">
        <div className="timeline__head flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="t-h4 text-fg">{entry.org}</h4>
          {current ? <Chip tone="live">Current</Chip> : null}
        </div>

        <Data>
          {formatPartialDate(entry.from)} —{' '}
          {entry.to === null ? 'present' : formatPartialDate(entry.to)}
        </Data>
        <Data tone="fg">{entry.role}</Data>

        {entry.detail ? <p className="mt-1 text-body text-fg-muted">{entry.detail}</p> : null}
      </Plate>
    </div>
  );
}
