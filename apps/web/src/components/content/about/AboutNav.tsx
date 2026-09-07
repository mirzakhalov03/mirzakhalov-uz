import type { CSSProperties, MouseEvent } from 'react';

export type AboutChapterLink = { id: string; label: string };

type AboutNavProps = {
  chapters: readonly AboutChapterLink[];
  active: string;
  onNavigate: (id: string) => void;
};

/**
 * Not a tab widget. Every chapter is in the DOM and reachable by scrolling, so
 * role="tab" would promise panels that show and hide and tell a screen-reader
 * user that two thirds of the section is unavailable. It is a table of
 * contents: real anchors, aria-current, and a click handler that only
 * preventDefaults so it can substitute the flow-aware scroll.
 */
export function AboutNav({ chapters, active, onNavigate }: AboutNavProps) {
  const index = chapters.findIndex((chapter) => chapter.id === active);
  const hasCurrent = index >= 0;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    /* Let the browser handle a modified click — a new tab on a #hash is odd
       but it is the reader's to ask for. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(id);
  };

  return (
    <nav
      aria-label="About chapters"
      className="about-nav"
      data-has-current={hasCurrent || undefined}
      style={hasCurrent ? ({ '--about-nav-index': index } as CSSProperties) : undefined}
    >
      <ul className="about-nav__list">
        {chapters.map((chapter) => {
          const current = chapter.id === active;

          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={current ? 'true' : undefined}
                data-current={current || undefined}
                onClick={(event) => handleClick(event, chapter.id)}
                className="about-nav__link t-data"
              >
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
