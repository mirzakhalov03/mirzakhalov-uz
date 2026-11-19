import { useEffect, useState } from 'react';

/**
 * Which of `ids` the reader is currently in, for a rail that follows the page
 * rather than driving it.
 *
 * The active line sits ~30% down the viewport: `rootMargin` crops the root to a
 * band between 30% and 40% from the top, so a block becomes current as its top
 * reaches the upper third and stays current until the next one arrives there.
 * Tying it to the top edge rather than to "most visible" is what makes the rail
 * move at the moment the reader's eye moves, instead of halfway through the
 * next block.
 *
 * An IntersectionObserver, never a scroll listener (§7.3) — the same call
 * `useActiveSection` makes, for the same reason. That one is the page-level
 * spy over sections in a sticky stack and has to resolve occlusion; this is the
 * cheaper case, several blocks inside one panel, none of them covering another.
 *
 * Two departures from the reference implementation:
 *
 * - **The visible set is kept, not just the last event.** Acting on each
 *   `isIntersecting` as it arrives makes the answer depend on the order the
 *   observer happens to batch entries in, which is not ordered by position. At
 *   a boundary where two blocks are briefly in the band that shows up as the
 *   rail flicking to the wrong pill and back.
 * - **First in document order wins**, so the answer is the block that reached
 *   the line, not whichever one the batch mentioned last.
 *
 * When nothing is in the band — the gap between two blocks, or the very top of
 * the section — the last answer stands rather than going blank. A rail with no
 * pill lit reads as broken; a rail still showing where the reader just was is
 * simply true.
 */
export function useScrollSpy(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');
  /* Joined, so the effect keys on the contents rather than on the identity of
     an array the caller may rebuild every render. */
  const key = ids.join(',');

  useEffect(() => {
    const list = key.split(',');
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        const first = list.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    for (const id of list) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [key]);

  return active;
}
