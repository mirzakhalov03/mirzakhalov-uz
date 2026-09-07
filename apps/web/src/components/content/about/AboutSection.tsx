import { useCallback } from 'react';
import { AboutNav } from './AboutNav.js';
import { EducationChapter } from './EducationChapter.js';
import { ExperienceChapter } from './ExperienceChapter.js';
import { StoryChapter } from './StoryChapter.js';
import { scrollToFlow } from '../../../lib/scroll-to-flow.js';
import { useActiveSection } from '../../../lib/useActiveSection.js';
import type { AboutChapterLink } from './AboutNav.js';

/* Document order. useActiveSection resolves ties by taking the last
   intersecting id, so this array has to run in the order the chapters do. */
const CHAPTERS: readonly AboutChapterLink[] = [
  { id: 'about-story', label: 'Story' },
  { id: 'about-education', label: 'Education' },
  { id: 'about-experience', label: 'Experience' },
] as const;

const IDS = CHAPTERS.map((chapter) => chapter.id);
const FIRST = IDS[0] ?? '';

/** The top bar, plus the chapter bar where it is sticky, plus a little air. */
function stuckHeight(): number {
  const root = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  );
  const bar = Number.isFinite(root) ? root : 57;

  const nav = document.querySelector<HTMLElement>('.about-nav');
  const navStuck = nav && getComputedStyle(nav).position === 'sticky' && window.innerWidth < 1024;

  return bar + (navStuck && nav ? nav.offsetHeight : 0) + 16;
}

/**
 * §01, as three chapters behind one anchored navigation.
 *
 * There is no tab state to own. The chapters are all rendered, all the time —
 * which is what makes this read as one continuous story rather than three
 * pages, and what keeps the panel's height constant so useStack never
 * re-measures the panels below mid-interaction. "Active" is a purely derived
 * fact about where the reader is, so it comes from the observer the top bar
 * already uses.
 */
export function AboutSection() {
  const observed = useActiveSection(IDS);
  const active = observed ?? FIRST;

  const handleNavigate = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) scrollToFlow(target, stuckHeight());
  }, []);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(9rem,1fr)_3fr] lg:gap-8">
      <AboutNav chapters={CHAPTERS} active={active} onNavigate={handleNavigate} />

      {/* The chapters carry their own separation — each opens with its heading
          and inked rule — so the gap here is air, not a divider. */}
      <div className="mt-5 flex flex-col gap-10 lg:mt-0 lg:gap-16">
        <StoryChapter />
        <EducationChapter />
        <ExperienceChapter />
      </div>
    </div>
  );
}
