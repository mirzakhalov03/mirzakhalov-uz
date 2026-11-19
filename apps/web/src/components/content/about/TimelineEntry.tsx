import { Chip } from '../../ui/Chip.js';
import { Data } from '../../../primitives/Data.js';
import { Plate } from '../../../primitives/Plate.js';
import { formatPartialDate } from '../../../lib/date-label.js';
import type { ExperienceEntry } from '../../../content/types.js';

/** Undrawn corner marks so an empty slot still reads as a frame waiting for a
 *  logo, not a broken image. */
function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="8.5" cy="8.5" r="1.4" />
      <path d="M21 15l-5-5-10 10" />
    </svg>
  );
}

function OrgLogo({ image }: { image?: ExperienceEntry['image'] }) {
  if (image) {
    return (
      <img
        src={image.url}
        alt={image.alt}
        className="h-12 w-12 shrink-0 rounded-frame border border-line object-contain"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-frame border border-dashed border-line-strong bg-raised text-fg-subtle">
      <PlaceholderGlyph />
    </div>
  );
}

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
      <Plate surface="bone" className="timeline__card flex items-center gap-3 p-2">
        <OrgLogo image={entry.image} />

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <h4 className="t-h4 truncate text-fg">{entry.org}</h4>
            {entry.note ? <Data className="whitespace-nowrap">({entry.note})</Data> : null}
            {current ? <Chip tone="liveSolid">Current</Chip> : null}
          </div>
          <Data tone="fg">{entry.role}</Data>
          <Data>
            {formatPartialDate(entry.from)} —{' '}
            {entry.to === null ? 'present' : formatPartialDate(entry.to)}
          </Data>
        </div>
      </Plate>
    </div>
  );
}
