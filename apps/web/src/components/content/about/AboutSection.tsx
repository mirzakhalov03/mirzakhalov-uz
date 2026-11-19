import { AboutNav } from './AboutNav.js';
import { EducationChapter } from './EducationChapter.js';
import { ExperienceChapter } from './ExperienceChapter.js';
import { StoryChapter } from './StoryChapter.js';
import { useScrollSpy } from '../../../lib/useScrollSpy.js';

/* Document order, and the rail's order. A tuple rather than a
   `readonly Link[]`, so `CHAPTERS[0]` is a known element under
   noUncheckedIndexedAccess. */
const CHAPTERS = [
  { id: 'about-story', label: 'Story' },
  { id: 'about-education', label: 'Education' },
  { id: 'about-experience', label: 'Experience' },
] as const;

const IDS = CHAPTERS.map((chapter) => chapter.id);

/**
 * §01, as three chapters down one column with a rail that follows the reader.
 *
 * **The scroll is the browser's.** Nothing here observes the wheel, cancels an
 * event, parks the page, pins a panel or holds a gesture. The chapters are
 * three blocks stacked in the flow; the reader scrolls the document the way
 * they scroll every other section on the site, and `useScrollSpy` reads which
 * block they are in so the rail can light the matching pill. Pressing a pill
 * scrolls to that block.
 *
 * That is the whole mechanism, and the smoothness is a consequence of it. The
 * previous design made the section its own scroll surface, so every frame was a
 * negotiation between what the reader's fingers were doing and what the
 * component thought should happen. Handing the scroll back to the browser
 * removes the negotiation: momentum, trackpad rubber-banding, keyboard paging,
 * find-in-page, the scrollbar and reader mode all work again, because none of
 * them are intercepted any more.
 *
 * What it costs: nothing makes the reader pass through all three chapters. That
 * was what the lock bought, and it is gone — along with the section that could
 * not be scrolled out of, which is the same sentence read the other way.
 *
 * Arriving on `#about-education` needs no code. Every chapter is in the DOM, so
 * the browser's own anchor jump lands on it and `AboutChapter`'s `scroll-mt` is
 * what clears the bar and the sticky head.
 */
export function AboutSection() {
  const active = useScrollSpy(IDS);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(13rem,1fr)_3fr] lg:gap-8">
      <AboutNav chapters={CHAPTERS} active={active} />

      <div className="mt-5 lg:mt-0">
        <StoryChapter />
        <EducationChapter />
        <ExperienceChapter />
      </div>
    </div>
  );
}
