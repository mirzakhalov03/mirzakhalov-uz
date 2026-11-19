import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { scrollToFlow } from '../../../lib/scroll-to-flow.js';

type AboutNavProps<Id extends string> = {
  chapters: readonly { id: Id; label: string }[];
  active: Id | '';
};

/**
 * One line icon per chapter, inline.
 *
 * No icon library for three glyphs — a dependency here would cost more than the
 * whole About section does, and §8.7's budget is the reason the contact form is
 * already code-split. Drawn on the same 24px box at stroke 1.8 so they read as
 * one set: an open book, a cap, a case.
 */
const ICONS: Record<string, string> = {
  'about-story': 'M4 5h6a2 2 0 012 2v12a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v12a2 2 0 012-2h6z',
  'about-education': 'M12 4l9 5-9 5-9-5 9-5zM5.5 11.2V16c0 1.4 2.9 2.8 6.5 2.8s6.5-1.4 6.5-2.8v-4.8',
  'about-experience': 'M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 9V6a2 2 0 012-2h2a2 2 0 012 2v3',
};

/**
 * Everything stuck over the top of the viewport that a chapter has to clear
 * when the rail scrolls to it: the top bar, the section's sticky title, and
 * below lg the rail itself.
 *
 * Measured, not computed, and not read off the chapter's own `scroll-margin-top`
 * either. That figure exists for the browser's native anchor jump, which is the
 * only thing that honours it — `window.scrollTo` does not — and it is a static
 * number in a stylesheet, so it is wrong the moment a pill's padding or the
 * head's type changes. This runs once per click and can afford the truth.
 *
 * `.about-nav` is position: sticky at both widths, so computed position cannot
 * tell the phone's bar from the desktop rail — only the breakpoint can. The
 * media query rather than innerWidth: innerWidth counts a classic scrollbar's
 * width and the CSS breakpoint does not, so the two disagree within a
 * scrollbar's width of 1024px.
 */
function clearance(nav: HTMLElement | null): number {
  const declared = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--bar-h'),
  );
  const bar = Number.isFinite(declared) ? declared : 57;

  const head =
    nav?.closest<HTMLElement>('[data-sticky-head]')?.querySelector<HTMLElement>('.section-head') ??
    null;

  const overhead = nav && window.matchMedia('(max-width: 1023.98px)').matches ? nav.offsetHeight : 0;

  /* Plus one module, so the accent bar above the title is not flush against the
     rule under the furniture. Read from the stylesheet rather than written as 8
     here, because --spacing is the one number the whole grid is built on. */
  const module = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--spacing'),
  );

  return bar + (head?.offsetHeight ?? 0) + overhead + (Number.isFinite(module) ? module : 8);
}

/**
 * The chapter rail: a sticky column of pills that follows the reader down the
 * section, ported from uyqulab.uz's section nav.
 *
 * **These are links, not tabs, and that is the honest markup.** The rail was a
 * `role="tablist"` while one chapter was mounted at a time and the others truly
 * were hidden. Every chapter is in the DOM again now and reachable by
 * scrolling, so `role="tab"` would promise panels that show and hide when
 * nothing does — the same reason the ARIA went in, run backwards. `<a href="#…">`
 * is what this actually is: it works before React hydrates, it can be opened in
 * a new tab, it lands on the right chapter from a pasted URL, and `aria-current`
 * says which one the reader is in. Tab walks the three in order with no roving
 * tabindex to maintain, because a list of links is already a list of links.
 *
 * The click is intercepted only to soften the jump. `scrollToFlow` rather than
 * `scrollIntoView`: the panel is sticky, and sticky separates a box's painted
 * position from its laid-out one, so once About has pinned `scrollIntoView`
 * decides the target is already in view and does nothing (scroll-to-flow.ts).
 * Falling through to the browser's own anchor jump if anything is missing keeps
 * the link working either way.
 */
export function AboutNav<Id extends string>({ chapters, active }: AboutNavProps<Id>) {
  const list = useRef<HTMLDivElement>(null);

  /**
   * Keep the current pill on screen in the phone's strip.
   *
   * Below lg the rail is a horizontal strip narrower than its own contents, so
   * a reader who has scrolled into Experience would be looking at a bar showing
   * Story — the one thing a follow-the-reader rail must never do.
   *
   * Guarded on the strip actually overflowing, which is what makes this one
   * effect right at both widths without asking a media query: the desktop rail
   * is a column and never overflows horizontally, so the guard returns and
   * nothing moves. scrollLeft on the strip rather than scrollIntoView, because
   * scrollIntoView would also scroll the *page* to bring the strip into view
   * and undo the reader's position.
   */
  useEffect(() => {
    const strip = list.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;

    const pill = strip.querySelector<HTMLElement>('[aria-current]');
    if (!pill) return;

    strip.scrollTo({
      left: Math.max(0, pill.offsetLeft - (strip.clientWidth - pill.offsetWidth) / 2),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [active]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: Id) => {
    /* Leave modified clicks alone — they are asking for a new tab, not a
       scroll. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const node = document.getElementById(id);
    if (!node) return;

    event.preventDefault();

    /* Land the chapter's first *mark* — the accent bar — under the furniture,
       not the top of its box. The box carries the rule between two chapters and
       the air around it, so scrolling to the box leaves that air stacked on top
       of the clearance and the reader arrives looking at a third of a screen of
       nothing. Taking the padding back off puts the title exactly one module
       below the bar, which is where it looks aimed at. */
    const pad = Number.parseFloat(getComputedStyle(node).paddingTop) || 0;
    const nav = list.current?.closest<HTMLElement>('.about-nav') ?? null;

    scrollToFlow(node, clearance(nav) - pad, 'smooth');
    /* The hash is part of the reader's position, so it should survive a reload
       or a copied URL — but pushing it would put every pill press in the back
       button's history. */
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav className="about-nav" aria-label="About chapters">
      <p className="about-nav__eyebrow">Chapters</p>

      <div ref={list} className="about-nav__list">
        {chapters.map((chapter) => {
          const current = chapter.id === active;

          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={current ? 'true' : undefined}
              onClick={(event) => handleClick(event, chapter.id)}
              className="about-nav__link group"
            >
              <span className="about-nav__icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={ICONS[chapter.id] ?? 'M4 12h16'} />
                </svg>
              </span>
              {chapter.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
