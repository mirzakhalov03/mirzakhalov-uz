import type { ReactNode } from 'react';
import { InkRule } from '../../ui/InkRule.js';

type AboutChapterProps = {
  /** Matches the tab's `aria-controls`, and is still the anchor a pasted
   *  `#about-education` arrives on. */
  id: string;
  title: string;
  /** Gives this chapter's rule its own wobble. */
  seed?: number;
  children: ReactNode;
};

/**
 * One chapter of the About narrative, and the panel of one tab.
 *
 * Labelled by its tab rather than by its own heading, which is what the tab
 * pattern expects — the heading stays because the tab bar is a control strip,
 * not a title, and a chapter that scrolls under it should still say what it is.
 *
 * tabIndex is unconditional. A tabpanel needs a tab stop when it holds nothing
 * focusable, and Story holds only prose — deciding per chapter would mean the
 * keyboard's map of the section changed depending on which tab was open.
 *
 * scroll-mt clears the top bar, the section's sticky title, and below lg the
 * sticky tab bar as well. It is belt-and-braces: AboutSection parks every turn
 * with the same clearance, measured, but a native anchor jump does not go
 * through it.
 *
 * Below lg (184px): --bar-h 57 + the sticky title (one line of --text-h2 at its
 * clamp floor, 28px, plus 24px padding and a rule = 53) + the tab bar (a 48px
 * tab plus 24px padding-block and its rule = 73) = 183, rounded up to the step.
 * Above lg (136px): 57 + the title at its clamp ceiling (45 + 25 = 70) = 127,
 * and the tab rail is beside the content rather than over it.
 */
export function AboutChapter({ id, title, seed = 0, children }: AboutChapterProps) {
  return (
    <section
      id={id}
      role="tabpanel"
      aria-labelledby={`${id}-tab`}
      tabIndex={0}
      className="about-chapter scroll-mt-23 lg:scroll-mt-17"
    >
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
