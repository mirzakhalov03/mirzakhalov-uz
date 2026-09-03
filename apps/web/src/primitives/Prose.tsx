import type { ReactNode } from 'react';

/**
 * Long-form gets its own surface (§2 principle 7). Several hundred words of
 * body copy on near-black is worse, not braver — so prose sits on the bone
 * plate whatever the page ground is. In light mode this is a no-op; in dark it
 * is the warm reading island the design is built around.
 */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-surface="bone"
      className={`prose-plate bg-surface text-fg text-body ${className}`}
    >
      {children}
    </div>
  );
}
