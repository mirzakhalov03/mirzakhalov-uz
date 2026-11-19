import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type RevealProps = {
  /** Staggers this block behind the one above it. Milliseconds. */
  delay?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Fades and lifts its children into place the first time they are scrolled to.
 *
 * This is the one place the site animates something *because* it scrolled into
 * view, which §2 principle 4 otherwise forbids. It is here on purpose: it is
 * what the About rail was rebuilt around, and a column of blocks that simply
 * exist reads as a document where the reference reads as a page being turned
 * through. The rule still holds everywhere else.
 *
 * One-shot. The observer disconnects the moment it fires, so a reader scrolling
 * back up finds the section as they left it rather than watching it rebuild
 * itself — and there is no live observer left on the page per block.
 *
 * The motion itself is in `.reveal` (substrate.css), which is also where
 * `prefers-reduced-motion` turns it off. Nothing here reads a media query,
 * because that would leave two places to change it.
 */
export function Reveal({ delay = 0, className = '', children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setShown(true);
          /* Nothing left to watch — this never plays twice. */
          observer.disconnect();
          return;
        }
      },
      /* A sliver is not an arrival. 15% of the block, and the bottom 8% of the
         viewport discounted, so it starts once the block is properly on screen
         rather than as its first pixel clears the fold. */
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-shown' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
