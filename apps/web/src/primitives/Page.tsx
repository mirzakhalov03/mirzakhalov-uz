import type { ReactNode } from 'react';

/**
 * The drawing sheet. Lays the construction grid down as a fixed substrate and
 * caps the content at 1280px with gutters that widen with the viewport (§3.3).
 *
 * The substrate is a separate fixed element rather than a body background so
 * it can carry its own scroll timeline without the page's own scroll fighting it.
 */
export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="substrate" aria-hidden="true" />
      <div className="mx-auto w-full max-w-content px-3 sm:px-4 lg:px-6">{children}</div>
    </>
  );
}
