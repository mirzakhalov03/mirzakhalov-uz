import { Data } from '../../primitives/Data.js';
import { Plate } from '../../primitives/Plate.js';
import { Chip } from '../ui/Chip.js';
import type { Project } from '../../content/types.js';

const CHIPS = {
  live: { label: 'Live', tone: 'live' },
  client: { label: 'Client work', tone: 'accent' },
  experiment: { label: 'Experiment', tone: 'quiet' },
  archived: { label: 'Archived', tone: 'quiet' },
} as const;

/**
 * One component for every slot — home, the index, and later the related-work
 * rail. The reflow is a container query rather than a variant prop, so a plate
 * laid out full width arranges itself side by side and a narrow one stacks,
 * without the parent having to tell it which it is (§7.1).
 *
 * On hover: the registration marks go to full and the screenshot returns from
 * graded to full colour. Nothing moves, scales or lifts — in a dense grid a
 * card-lift jitters the layout under a moving cursor, and the colour return
 * makes the work itself the thing that lights up (§4.3).
 */
export function WorkPlate({ project, index }: { project: Project; index?: number }) {
  const href = project.links.demo ?? project.links.source;
  const interactive = Boolean(href);

  return (
    <Plate
      as={interactive ? 'a' : 'article'}
      className="group @container flex flex-col"
      {...(interactive
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { 'aria-label': project.title })}
    >
      <div className="@2xl:flex-row flex flex-col">
        <div className="@2xl:w-1/2 @2xl:border-r @2xl:border-b-0 relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line bg-well">
          {project.cover ? (
            <img
              src={project.cover.url}
              alt={project.cover.alt}
              loading="lazy"
              decoding="async"
              style={{ viewTransitionName: `cover-${project.slug}` }}
              className="screenshot h-full w-full object-cover object-top"
            />
          ) : null}
        </div>

        <div className="@2xl:w-1/2 flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-baseline justify-between gap-3">
            <Data tone="muted" className="shrink-0 whitespace-nowrap">
              {index !== undefined ? `${String(index + 1).padStart(2, '0')} · ` : ''}
              {project.year}
            </Data>
            <Data tone="muted" className="min-w-0 truncate text-right">
              {project.stack.join(' / ')}
            </Data>
          </div>

          <h3 className="t-h3 text-fg">{project.title}</h3>

          <p className="prose-measure text-body text-fg-muted">{project.summary.en}</p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
            {project.tags.map((tag) => (
              <Chip key={tag} tone={CHIPS[tag].tone}>
                {CHIPS[tag].label}
              </Chip>
            ))}
            {project.hasCaseStudy ? <Chip tone="neutral">Case study</Chip> : null}
            {project.links.source ? <Chip tone="quiet">Source</Chip> : null}

            {interactive ? (
              <Data
                tone="accent"
                className="ml-auto opacity-0 transition-opacity duration-[160ms] group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100"
              >
                Open ↗
              </Data>
            ) : null}
          </div>
        </div>
      </div>
    </Plate>
  );
}
