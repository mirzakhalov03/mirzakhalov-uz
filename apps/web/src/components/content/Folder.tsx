import type { ElementType, ReactNode } from 'react';
import type { Polymorphic } from '../../primitives/polymorphic.js';

type FolderOwnProps = {
  /** What the tab says — a status, a name. Visible text, so it stays readable. */
  tab: ReactNode;
  /** Cards tucked in behind the front panel, poking out of the top. Each child
   *  should be a `.folder__paper`; the first five get the loose-paper stagger. */
  papers?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * A folder: back flap with a tab, a few cards tucked inside, a front panel.
 *
 * The shell knows nothing about what it holds, so a project and the empty
 * GitHub folder share one shape (spec 2026-11-19-projects-folders §5.1).
 *
 * All motion is CSS (`.folder` in substrate.css), keyed off `:hover` *and*
 * `:focus-within`, so a keyboard reader opens the folder by tabbing into it.
 * The back and the papers are `aria-hidden`: the back is drawing, and the
 * papers repeat a stack the caller lists in text for screen readers.
 */
export function Folder<T extends ElementType = 'article'>({
  as,
  tab,
  papers,
  className = '',
  children,
  ...rest
}: Polymorphic<T, FolderOwnProps>) {
  const Tag = (as ?? 'article') as ElementType;

  return (
    <Tag className={`folder group ${className}`} {...rest}>
      <span className="folder__back" aria-hidden="true" />
      <span className="folder__tab">{tab}</span>
      {papers ? (
        <span className="folder__papers" aria-hidden="true">
          {papers}
        </span>
      ) : null}
      <div className="folder__front">{children}</div>
    </Tag>
  );
}
