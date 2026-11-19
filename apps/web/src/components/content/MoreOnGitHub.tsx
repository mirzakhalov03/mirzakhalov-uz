import { Data } from '../../primitives/Data.js';
import { Plate } from '../../primitives/Plate.js';
import { socials } from '../../content/profile.js';

/**
 * The sixth cell of a five-card grid — the way out of the section.
 *
 * It keeps the sheet's own ground while the five projects invert to void, which
 * is the whole of how it says "not a sixth project": same frame, same grid
 * cell, opposite ground. Nothing had to be added to make the distinction — the
 * cards' ground is what draws it.
 *
 * `self-start` matters. Left to stretch, the grid gives this cell the height of
 * whichever card shares its row — a bone box the size of a project with three
 * lines in one corner, which reads as a rendering fault rather than a panel.
 * The 16/10 is the cards' own cover proportion, so the cell takes its size from
 * the thing beside it instead of guessing one.
 *
 * The handle comes from `socials`, so the profile's GitHub address is written
 * down in exactly one place.
 */
export function MoreOnGitHub() {
  const github = socials.find((s) => s.label === 'GitHub');
  if (!github) return null;

  return (
    <Plate
      as="a"
      surface="bone"
      href={github.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex aspect-[16/10] flex-col items-start justify-between self-start p-3 transition-colors hover:border-accent-text"
    >
      <Data tone="muted">Everything else</Data>

      <div>
        <span className="t-h3 block text-fg transition-colors group-hover:text-accent-text">
          More on GitHub ↗
        </span>
        <Data tone="accent">{github.handle}</Data>
      </div>
    </Plate>
  );
}
