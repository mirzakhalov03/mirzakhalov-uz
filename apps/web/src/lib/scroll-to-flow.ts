/**
 * Scroll to an element inside a stacked panel.
 *
 * Not scrollIntoView, and not getBoundingClientRect. Sticky separates a box's
 * painted position from its laid-out one, so once a panel has pinned, every
 * descendant reports a rect near the top of the screen and scrollIntoView
 * concludes the target is already in view and does nothing — the same failure
 * useStack documents at lib/useStack.ts:12-19 and solves by writing the panel's
 * flow position to `data-flow-top`.
 *
 * So: the panel's flow top, plus the target's offset within it (offsetTop is a
 * layout value and immune to sticky painting), minus whatever is stuck over the
 * top of the viewport.
 */

/** Sum offsetTop up the offsetParent chain, stopping at `ancestor`. */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement): number {
  let total = 0;
  let current: HTMLElement | null = node;

  while (current && current !== ancestor) {
    total += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return total;
}

/**
 * Where `target` sits in the document flow, in page coordinates.
 *
 * Split out from the scroll below because a caller that wants to park an
 * element's *bottom* on the viewport floor needs the number, not the scroll —
 * and re-deriving it from a client rect is exactly the trap this file exists
 * to avoid.
 */
export function flowTopOf(target: HTMLElement): number {
  /* `.stack > *` is position: sticky and therefore positioned, so it is also
     the offsetParent the walk above terminates on. */
  const panel = target.closest<HTMLElement>('.stack > *');
  const flowTop = panel ? Number(panel.dataset.flowTop) : Number.NaN;

  return panel && Number.isFinite(flowTop)
    ? flowTop + offsetWithin(target, panel)
    : /* Unstacked page, or useStack has not measured yet. */
      target.getBoundingClientRect().top + window.scrollY;
}

export function scrollToFlow(
  target: HTMLElement,
  offset = 0,
  /** 'auto' for a control that repositions the page, 'smooth' for a link the
   *  reader asked to travel along. */
  behavior: ScrollBehavior = 'smooth',
): void {
  window.scrollTo({
    top: Math.max(0, flowTopOf(target) - offset),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : behavior,
  });
}
