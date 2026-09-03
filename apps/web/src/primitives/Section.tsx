import type { ReactNode } from 'react';
import { Data } from './Data.js';

type SectionProps = {
  id: string;
  /** The sheet index. Home is an ordered argument — proof, then person, then
   *  depth, then personality, then action — so the numbering is real there.
   *  A standalone page is not a sequence, so it omits this. */
  index?: string;
  title: string;
  lede?: string;
  /** Right-hand furniture on the title rule: a count, a link, a legend. */
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * A numbered plate on the sheet. The index sits in a left rail and sticks while
 * its section is in view — the drawing-margin equivalent of a scroll position
 * indicator, and the reason the design doesn't need a progress dot column.
 */
export function Section({ id, index, title, lede, aside, children }: SectionProps) {
  return (
    <section id={id} data-section={id} className="scroll-mt-11 border-t border-line py-8 lg:py-12">
      <div className="lg:grid lg:grid-cols-[88px_1fr] lg:gap-6">
        <div className="lg:sticky lg:top-11 lg:self-start lg:pt-1">
          {index ? (
            <Data tone="accent" aria-hidden="true">
              {index}
            </Data>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className="t-h2 text-fg">{title}</h2>
            {aside}
          </div>

          {lede ? (
            <p className="prose-measure mt-3 text-lede text-fg-muted text-balance">{lede}</p>
          ) : null}

          <div className="mt-6 lg:mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
