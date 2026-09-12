import { useRef } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';

type AboutNavProps<Id extends string> = {
  chapters: readonly { id: Id; label: string }[];
  active: Id;
  onSelect: (id: Id) => void;
};

/** Which way each key moves the selection. Both axes are accepted because the
 *  same tablist is a horizontal bar below lg and a vertical rail above it, and
 *  CSS — not the component — is what decides which. */
const STEP: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * A real tab widget, and now honestly so.
 *
 * This used to be a table of contents: every chapter was in the DOM and
 * reachable by scrolling, so `role="tab"` would have promised panels that show
 * and hide when nothing did. One chapter is mounted at a time now, which is
 * exactly what the tab pattern describes, so the ARIA is no longer a lie —
 * selection moves with the arrow keys, tabindex roves so the tablist is one
 * stop rather than three, and each tab names the panel it controls.
 *
 * The rail keeps its sliding marker. The fill says which tab is open; the
 * marker says the reader is travelling through an ordered set and where in it
 * they are — which is the thing scrolling changes, so it is the thing that
 * moves. A fixed step is what lets it move without measuring anything: index
 * times step, and no layout read on any frame.
 */
export function AboutNav<Id extends string>({ chapters, active, onSelect }: AboutNavProps<Id>) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = chapters.findIndex((chapter) => chapter.id === active);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = activeIndex;
    if (from < 0) return;

    let to: number;
    if (event.key === 'Home') to = 0;
    else if (event.key === 'End') to = chapters.length - 1;
    else {
      const step = STEP[event.key];
      if (step === undefined) return;
      to = (from + step + chapters.length) % chapters.length;
    }

    const next = chapters[to];
    if (!next) return;

    event.preventDefault();
    onSelect(next.id);
    /* onSelect repositions the page to the top of the section; letting focus
       scroll as well would fight it for the same frame. */
    tabs.current[to]?.focus({ preventScroll: true });
  };

  return (
    <div className="about-nav">
      <div
        role="tablist"
        aria-label="About chapters"
        className="about-nav__list"
        onKeyDown={handleKeyDown}
        style={{ '--about-nav-index': Math.max(0, activeIndex) } as CSSProperties}
      >
        {chapters.map((chapter, index) => {
          const current = chapter.id === active;

          return (
            <button
              key={chapter.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${chapter.id}-tab`}
              aria-selected={current}
              aria-controls={chapter.id}
              /* Roving: only the selected tab is in the page's tab order, so
                 Tab enters and leaves the tablist rather than walking it. */
              tabIndex={current ? 0 : -1}
              onClick={() => onSelect(chapter.id)}
              className="about-nav__link"
            >
              {chapter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
