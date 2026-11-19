import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Data } from '../../primitives/Data.js';
import { Plate } from '../../primitives/Plate.js';

/**
 * A section that exists but isn't open yet: the real content, blurred, with a
 * locked plate over it. Showing the shape of what is coming says more than an
 * empty box, and it costs nothing to lift — delete the wrapper and the content
 * underneath is already the finished section.
 *
 * The blurred layer is `inert` and hidden from assistive tech, so its links
 * can be neither clicked, tabbed to, nor read out — the plate is the only
 * thing there. `action` sits under the note — somewhere to go in the
 * meantime, so the lock is not a dead end.
 */
export function ComingSoon({
  note,
  action,
  children,
}: {
  note: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    // The plate sets the band's height, never the other way round: a fixed
    // height clipped the plate on phones, where the note wraps to more lines.
    // The blurred rows are laid behind it out of flow and cropped to whatever
    // height that is (min 288px) — they carry no information, so a short band
    // shows the shape, and the fade says "there's more" rather than "cut off".
    <div className="relative grid min-h-36 place-items-center overflow-hidden p-3">
      <div
        inert
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none overflow-hidden blur-sm [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
      >
        {children}
      </div>

      <div className="relative">
        <Plate
          surface="bone"
          className="flex max-w-[28rem] flex-col items-center gap-1.5 p-3 text-center"
        >
          <span className="grid size-6 place-items-center border border-line text-accent-text">
            <Lock className="size-3" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <Data tone="accent" className="mt-1">
            Coming soon
          </Data>
          <p className="text-body text-fg-muted">{note}</p>
          {action ? <div className="mt-1">{action}</div> : null}
        </Plate>
      </div>
    </div>
  );
}
