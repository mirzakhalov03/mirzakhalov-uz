import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * The two measurements a sticky stack needs and CSS cannot take, in one pass.
 *
 * `--stick-top` — a panel pinned at top: 0 that is taller than the screen hides
 * its own tail: the reader would never reach the last project in Selected work.
 * Pinned at `viewport - height` instead — a negative offset for a tall panel,
 * clamped to 0 for one that fits — it scrolls up until its last line rests on
 * the viewport floor and only then holds. That offset depends on the element's
 * own height, which CSS has no way to refer to.
 *
 * `data-flow-top` — where the panel sits in the flow. Sticky separates a box's
 * painted position from its laid-out one, so a panel stuck to the top reports a
 * client rect of ~0 and scrollIntoView concludes it is already in view and does
 * nothing. Every backward nav link would silently do nothing. Panels are
 * contiguous and unmargined, so the flow position is just the running sum of
 * the heights above.
 *
 * Both are written to the DOM rather than held in state: they are read by CSS
 * and by a scroll handler, neither of which needs a React render to see them.
 */
export function useStack(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const stack = ref.current;
    if (!stack || !enabled) return;

    let queued = 0;

    const measure = () => {
      queued = 0;
      const view = window.innerHeight;
      let flow = stack.getBoundingClientRect().top + window.scrollY;

      for (const panel of Array.from(stack.children) as HTMLElement[]) {
        const height = panel.offsetHeight;
        panel.style.setProperty('--stick-top', `${Math.min(0, view - height)}px`);
        panel.dataset.flowTop = String(Math.round(flow));

        flow += height;
      }
    };

    /* Coalesced to a frame: a mobile URL bar sliding away resizes every panel
       at once, and the observer would otherwise run the loop per panel. */
    const schedule = () => {
      if (queued) return;
      queued = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(stack);
    for (const panel of stack.children) observer.observe(panel);

    /* A viewport that only changes height leaves a tall panel's own height
       alone, so the observer never fires — but its pin offset has moved. */
    window.addEventListener('resize', schedule);
    measure();

    return () => {
      if (queued) cancelAnimationFrame(queued);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [ref, enabled]);
}
