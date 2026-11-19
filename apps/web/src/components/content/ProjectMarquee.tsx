import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MarqueeCopyContext } from './marquee-copy.js';
import { ProjectFolder } from './ProjectFolder.js';
import { useMarquee } from '../../lib/useMarquee.js';
import type { Project } from '../../content/types.js';

/** Seven 320px folders are narrower than a wide screen, so the list repeats
 *  three times: the loop keeps the reader in the middle copy, with a full copy
 *  of runway on either side even at 2560px. */
const COPIES = 3;

/**
 * Home Projects as one row of folders you can swipe, with a slow drift on
 * wider screens (spec 2026-11-19-projects-folders §6).
 *
 * The row is a native horizontal scroller — swipe, trackpad and wheel are the
 * browser's own — and useMarquee layers the drift and the endless loop on top.
 * The arrows step one folder either way, for a mouse with no horizontal
 * scroll. Hovering a folder, focusing the row or touching it pauses the drift;
 * phones and reduced motion get no drift at all, only the swipeable strip.
 *
 * Every copy after the first is `aria-hidden` and takes its links out of the
 * tab order (MarqueeCopyContext), so a screen reader and the Tab key meet each
 * project exactly once — while a pointer can still use whichever copy happens
 * to be on screen.
 */
export function ProjectMarquee({ projects }: { projects: Project[] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const nudge = useMarquee(rowRef);

  return (
    <div className="relative">
      <div ref={rowRef} className="marquee">
        <div className="marquee__track">
          {Array.from({ length: COPIES }, (_, i) => (
            <ul
              key={i}
              className="marquee__group"
              aria-hidden={i === 0 ? undefined : true}
            >
              <MarqueeCopyContext.Provider value={i > 0}>
                {projects.map((project) => (
                  <li key={project.slug} className="marquee__item">
                    <ProjectFolder project={project} />
                  </li>
                ))}
              </MarqueeCopyContext.Provider>
            </ul>
          ))}
        </div>
      </div>

      {/* Below the strip on a phone; from `sm:` the wrapper dissolves and the
          two buttons sit in the faded margins either side of the row, where
          there is nothing for them to cover. */}
      <div className="mt-1 flex justify-center gap-2 sm:contents">
        <MarqueeArrow direction={-1} onClick={() => nudge(-1)} />
        <MarqueeArrow direction={1} onClick={() => nudge(1)} />
      </div>
    </div>
  );
}

function MarqueeArrow({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  const Icon = direction < 0 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction < 0 ? 'Previous project' : 'Next project'}
      className={[
        'z-10 grid size-6 place-items-center rounded-chip border border-line bg-surface text-fg',
        'transition-colors duration-[160ms] ease-plate hover:border-accent-text hover:text-accent-text',
        'sm:absolute sm:top-1/2 sm:-translate-y-1/2',
        direction < 0 ? 'sm:left-3 lg:left-6' : 'sm:right-3 lg:right-6',
      ].join(' ')}
    >
      <Icon className="size-3" strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
