import { useContext } from 'react';
import { Data } from '../../primitives/Data.js';
import { Button } from '../ui/Button.js';
import { Chip } from '../ui/Chip.js';
import { StackMark } from '../ui/StackMark.js';
import { Folder } from './Folder.js';
import { MarqueeCopyContext } from './marquee-copy.js';
import type { Project } from '../../content/types.js';

/** How many stack cards fit across a folder's top edge. */
const MAX_PAPERS = 5;

/**
 * A project as a folder (spec 2026-11-19-projects-folders §5.2).
 *
 * Reads top to bottom in three beats, the same as the card it replaced:
 * the cover, the name, a few details. The tab carries the project's status, the
 * stack rides on loose cards tucked in behind the front, and the actions stay
 * hidden until the folder opens (hover or focus), when they slide up over the
 * dimmed cover. On touch there is no hover, so they are always shown (CSS).
 *
 * The cover is also a link to the primary destination — clicking the picture
 * is what people try first — kept out of the tab order and the accessibility
 * tree because the button already names that destination once.
 */
export function ProjectFolder({ project }: { project: Project }) {
  const isCopy = useContext(MarqueeCopyContext);
  /* A marquee copy is for the pointer only — see marquee-copy.ts. */
  const tabIndex = isCopy ? -1 : undefined;
  const { demo, source } = project.links;
  const primary = demo ?? source;
  const line = project.tagline?.en ?? project.summary.en;

  const tab = project.tags.includes('live') ? (
    /* Only the dot is mint: the tint behind the tab drops --live under 4.5:1
       as text, but a status dot needs only 3:1. */
    <>
      <span className="text-live">●</span>&nbsp;Live
    </>
  ) : source ? (
    'Source only'
  ) : (
    'Private build'
  );

  const papers = project.stack.slice(0, MAX_PAPERS).map((name) => (
    <span key={name} className="folder__paper">
      <StackMark name={name} />
    </span>
  ));

  const cover = project.cover ? (
    <img
      src={project.cover.url}
      alt={project.cover.alt}
      loading="lazy"
      decoding="async"
      style={isCopy ? undefined : { viewTransitionName: `cover-${project.slug}` }}
    />
  ) : null;

  return (
    <Folder tab={tab} papers={papers}>
      <div className="folder__cover">
        {primary ? (
          <a href={primary} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
            {cover}
          </a>
        ) : (
          cover
        )}

        {/* No links, no overlay — "Private build" is already on the tab. */}
        {primary ? (
          <div className="folder__actions">
            {demo ? (
              <Button
                as="a"
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                tabIndex={tabIndex}
                className="rounded-pill"
              >
                Visit site ↗
              </Button>
            ) : null}
            {source ? (
              <Button
                as="a"
                href={source}
                tabIndex={tabIndex}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant={demo ? 'ghost' : 'solid'}
                /* A ghost button is transparent; over a dimmed cover it needs
                   a fill of its own to stay readable. */
                className={demo ? 'rounded-pill bg-raised!' : 'rounded-pill'}
              >
                Source ↗
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="folder__title t-h2 text-fg">{project.title}</h3>
        <Data tone="muted" className="shrink-0">
          {project.year}
        </Data>
      </div>

      <p className="mt-1 line-clamp-2 text-caption text-fg-muted">{line}</p>

      {project.highlights?.length ? (
        <ul className="mt-2 flex flex-wrap gap-1" aria-label={`${project.title} — highlights`}>
          {project.highlights.map((h) => (
            <li key={h.label}>
              <Chip tone={h.kind === 'feature' ? 'solid' : 'quiet'} className="rounded-pill">
                {h.label}
              </Chip>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="sr-only" aria-label={`${project.title} — stack`}>
        {project.stack.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </Folder>
  );
}
