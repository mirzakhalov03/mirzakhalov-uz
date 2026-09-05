import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useStack } from '../lib/useStack.js';

type PageProps = {
  /**
   * Turn every direct child into a sheet of its own that lands on top of the
   * last one. Opt-in per page, because it only means anything where the page
   * is an ordered sequence of sections — the work index is one list, and a
   * list should scroll like a list.
   */
  stacked?: boolean;
  children: ReactNode;
};

/**
 * The drawing sheet. Caps the content at 1280px with gutters that widen with
 * the viewport (§3.3), and lays the construction grid down behind it.
 *
 * Unstacked, the grid is one fixed substrate carrying its own scroll timeline,
 * separate from the body background so the page's scroll doesn't fight it.
 * Stacked, every panel is opaque wall to wall and carries the grid itself, so
 * the substrate would never be seen and isn't paid for.
 */
export function Page({ stacked = false, children }: PageProps) {
  const stack = useRef<HTMLDivElement>(null);
  useStack(stack, stacked);

  return (
    <>
      {stacked ? null : <div className="substrate" aria-hidden="true" />}
      <div
        ref={stack}
        className={`mx-auto w-full max-w-content px-3 sm:px-4 lg:px-6 ${stacked ? 'stack' : ''}`}
      >
        {children}
      </div>
    </>
  );
}
