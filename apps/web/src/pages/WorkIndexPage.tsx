import { useSearchParams } from 'react-router';
import { Data, Page, Section } from '../primitives/index.js';
import { Footer } from '../components/chrome/Footer.js';
import { WorkPlate } from '../components/content/WorkPlate.js';
import { projects } from '../content/projects.js';
import type { Project } from '../content/types.js';

const FILTERS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'live', label: 'Live', match: (p: Project) => p.tags.includes('live') },
  { id: 'client', label: 'Client', match: (p: Project) => p.tags.includes('client') },
  { id: 'experiment', label: 'Experiment', match: (p: Project) => p.tags.includes('experiment') },
  { id: 'archived', label: 'Archived', match: (p: Project) => p.tags.includes('archived') },
  { id: 'source', label: 'Source available', match: (p: Project) => Boolean(p.links.source) },
] as const;

/**
 * Filters are worth building here because there are fourteen entries of
 * genuinely different weight — a client clinic system and a tasbeh counter
 * should not compete as equals (§4.3).
 *
 * The active filter lives in the URL, so a filtered view can be linked to.
 * The page scrolls; the browser's scrollbar is the scrollbar — the old site's
 * 88vh internal scroll box is retired.
 */
export function WorkIndexPage() {
  const [params, setParams] = useSearchParams();
  const activeId = params.get('filter') ?? 'all';
  const active = FILTERS.find((f) => f.id === activeId) ?? FILTERS[0];
  const visible = projects.filter(active.match);

  return (
    <Page>
      <Section
        id="index"
        title="Everything"
        lede="Fourteen projects, newest first. Client work, things that run in production, and the early exercises that got there."
        aside={<Data>{visible.length} shown</Data>}
      >
        <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => {
            const current = filter.id === active.id;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={current}
                onClick={() =>
                  setParams(filter.id === 'all' ? {} : { filter: filter.id }, { replace: true })
                }
                className={[
                  't-data border px-2 py-1 transition-colors duration-[160ms] ease-plate',
                  'active:translate-x-px active:translate-y-px',
                  current
                    ? 'border-accent bg-accent text-[var(--color-bone)]'
                    : 'border-line text-fg-muted hover:border-accent-text hover:text-accent-text',
                ].join(' ')}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {visible.length > 0 ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {visible.map((project, i) => (
              <WorkPlate key={project.slug} project={project} index={i} />
            ))}
          </div>
        ) : (
          /* Empty states always offer the next best thing (§3.6). */
          <div className="mt-6 border border-line p-4">
            <Data tone="fg" className="block">
              Nothing is tagged “{active.label}”.
            </Data>
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="mt-2 underline underline-offset-4"
            >
              <Data tone="accent">Show all {projects.length} →</Data>
            </button>
          </div>
        )}
      </Section>

      <Footer />
    </Page>
  );
}
