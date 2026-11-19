import type { ReactNode } from 'react';
import { Reveal } from '../../ui/Reveal.js';

type AboutChapterProps = {
  /** The rail's anchor, and still the target of a pasted `#about-education`. */
  id: string;
  title: string;
  children: ReactNode;
};

/**
 * One chapter of the About narrative: a block in the column, not a panel.
 *
 * **No `role="tabpanel"`, and no `tabIndex`.** Both were here because one
 * chapter was mounted at a time and the rail genuinely showed and hid them. All
 * three are in the flow now, so this is a `<section>` with a heading — which is
 * what a screen reader's rotor wants anyway, and reachable by every means a
 * heading is. `aria-labelledby` still ties it to its own title so the landmark
 * is named.
 *
 * The head is ported from the reference: a short accent bar, then the title,
 * then the content. The bar is the only gradient on the site and it earns its
 * place by being the thing the eye finds when a chapter arrives — it reads as
 * the start of something in a way a rule between two blocks does not.
 *
 * Two reveals rather than one, 80ms apart. A chapter that fades in as a single
 * object reads as an image loading; head first, then body, reads as a page
 * being laid down. The stagger is small enough that it is felt rather than
 * watched.
 *
 * scroll-mt clears the top bar, the section's sticky title, and below lg the
 * sticky rail as well — it is what makes both the rail's own scroll and a bare
 * anchor jump land under the furniture rather than behind it.
 *
 * Below lg (184px): --bar-h 57 + the sticky title (one line of --text-h2 at its
 * clamp floor, 28px, plus 24px padding and a rule = 53) + the rail (a 44px pill
 * plus 24px padding-block and its rule = 73) = 183, rounded up to the step.
 * Above lg (136px): 57 + the title at its clamp ceiling (45 + 25 = 70) = 127,
 * and the rail is beside the content rather than over it.
 */
export function AboutChapter({ id, title, children }: AboutChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="about-chapter scroll-mt-24 lg:scroll-mt-17"
    >
      <Reveal>
        <span className="about-chapter__bar" aria-hidden="true" />
        <h3 id={`${id}-title`} className="t-chapter mt-2 text-fg">
          {title}
        </h3>
      </Reveal>

      <Reveal delay={80} className="mt-4 lg:mt-5">
        {children}
      </Reveal>
    </section>
  );
}
