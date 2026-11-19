import { Data } from '../../primitives/Data.js';
import { Plate } from '../../primitives/Plate.js';
import { Chip } from '../ui/Chip.js';
import type { Project, ProjectHighlight } from '../../content/types.js';

/**
 * The three kinds, drawn at three weights. One solid chip per card is the
 * whole point: three outlines in a row read as one grey band and the eye picks
 * nothing out of it, so scope is filled, feature carries the accent, and stack
 * sits between them in plain ink.
 */
const HIGHLIGHT_TONE = {
  scope: 'solid',
  stack: 'neutral',
  feature: 'accent',
} as const satisfies Record<ProjectHighlight['kind'], 'solid' | 'neutral' | 'accent'>;

/**
 * The home grid's card — the showcase cut, not the catalogue cut.
 *
 * It is a separate component from WorkPlate rather than a variant of it,
 * because the two answer different questions. /work is an index: seventeen
 * entries, the stack spelled out, the paragraph that says what was hard.
 * The home five are an argument, so the card leads with what the project *is*
 * technically (the highlight row), states what it does in one line, and leaves
 * the paragraph to /work. A prop that switched between those would be a second
 * component wearing the first one's name.
 *
 * The ground is void on a bone sheet (§3.4's separation-by-border, taken one
 * step further where a section has to be showcased rather than listed). It
 * costs one attribute: every child re-points itself off --surface and --fg, so
 * the chips, the marks and the rule all land contrast-correct without knowing
 * they moved. It also earns its keep on the screenshots — every cover here is a
 * bright product UI, and a light rectangle on near-black reads as lit rather
 * than pasted on.
 *
 * On hover: the marks go to full and the cover returns from graded to full
 * colour. Nothing moves, scales or lifts (§4.3).
 */
export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const href = project.links.demo ?? project.links.source;
  const interactive = Boolean(href);
  const tagline = project.tagline?.en ?? project.summary.en;

  return (
    <Plate
      as={interactive ? 'a' : 'article'}
      surface="void"
      className="group flex flex-col"
      {...(interactive
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { 'aria-label': project.title })}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden border-b border-line bg-well">
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

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-baseline justify-between gap-3">
          <Data tone="muted">
            {String(index + 1).padStart(2, '0')} · {project.year}
          </Data>
          {project.tags.includes('live') ? <Data tone="live">Live</Data> : null}
        </div>

        <h3 className="t-h3 text-fg">{project.title}</h3>

        {/* Above the description, not below it. The row is the first thing the
            eye lands on after the title, which is the ordering the section is
            for: what this is, technically, before what it does in prose. */}
        {project.highlights?.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label={`${project.title} — highlights`}>
            {project.highlights.map((h) => (
              <li key={h.label}>
                <Chip tone={HIGHLIGHT_TONE[h.kind]} size="md">
                  {h.label}
                </Chip>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="prose-measure text-caption text-fg-muted">{tagline}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-2">
          {project.links.source ? <Chip tone="quiet">Source</Chip> : null}
          {project.hasCaseStudy ? <Chip tone="neutral">Case study</Chip> : null}

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
    </Plate>
  );
}
