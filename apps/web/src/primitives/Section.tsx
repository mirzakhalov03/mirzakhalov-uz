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
  /** Turn this section's ground over. `void` paints a full-bleed dark band
   *  behind it and re-points every semantic token for the subtree, so the
   *  content inside needs no changes at all. Omit to sit on the sheet. */
  surface?: 'bone' | 'void';
  /** Keep the title (and its index) under the top bar for the whole section.
   *
   *  For a section the reader stays inside rather than passes through — one
   *  that is several screens long and changes what it is showing while they are
   *  in it, so the title is the answer to "where am I" rather than a label they
   *  read once. It also publishes `--section-head-h` for anything below that has
   *  to stick clear of it, and that number is computed rather than measured, so
   *  the head has to stay one line of `--text-h2`: add a lede or an aside that
   *  wraps and it stops being true. */
  stickyHead?: boolean;
  children: ReactNode;
};

/**
 * A numbered plate on the sheet. The index sits in a left rail and sticks while
 * its section is in view — the drawing-margin equivalent of a scroll position
 * indicator, and the reason the design doesn't need a progress dot column.
 */
export function Section({
  id,
  index,
  title,
  lede,
  aside,
  surface,
  stickyHead,
  children,
}: SectionProps) {
  const band = surface === 'void';

  return (
    <section
      id={id}
      data-section={id}
      data-surface={surface}
      data-sticky-head={stickyHead || undefined}
      className={[
        'scroll-mt-11',
        /* A band is separated by the change of ground, so it does not also take
           the hairline — two separation devices for one edge (§3.4). It gets
           more air instead, because an inverted block needs room to be a block. */
        band ? 'band py-10 lg:py-16' : 'border-t border-line py-8 lg:py-12',
      ].join(' ')}
    >
      <div className="lg:grid lg:grid-cols-[88px_1fr] lg:gap-6">
        {/* The index rides with the title when the title stays, so the two do
            not drift apart on the way down the section. */}
        <div
          className={
            stickyHead
              ? 'section-head__index lg:sticky lg:self-start'
              : 'lg:sticky lg:top-11 lg:self-start lg:pt-1'
          }
        >
          {index ? (
            <Data tone="accent" aria-hidden="true">
              {index}
            </Data>
          ) : null}
        </div>

        <div>
          <div
            className={[
              'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2',
              stickyHead ? 'section-head' : '',
            ].join(' ')}
          >
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
