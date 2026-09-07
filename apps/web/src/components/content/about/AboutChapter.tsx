import type { ReactNode } from 'react';
import { InkRule } from '../../ui/InkRule.js';

type AboutChapterProps = {
  /** Also the scroll target and the id useActiveSection observes. */
  id: string;
  title: string;
  /** Gives this chapter's rule its own wobble. */
  seed?: number;
  children: ReactNode;
};

/**
 * One chapter of the About narrative.
 *
 * The id sits on the section rather than on the heading, so the observer
 * watches a whole chapter instead of a 30px line of text — otherwise the nav
 * would only light while the title itself was in the reading band.
 *
 * scroll-mt clears the top bar plus, below lg, the sticky chapter bar. It is
 * belt-and-braces: scrollToFlow already subtracts the same offset, but a native
 * anchor jump (a pasted #about-education URL) does not go through it.
 */
export function AboutChapter({ id, title, seed = 0, children }: AboutChapterProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-13 lg:scroll-mt-11">
      <div className="flex items-center gap-2">
        <h3 id={`${id}-title`} className="t-chapter shrink-0 text-fg">
          {title}
        </h3>
        <InkRule seed={seed} className="text-line-strong" />
      </div>

      <div className="mt-4 lg:mt-5">{children}</div>
    </section>
  );
}
