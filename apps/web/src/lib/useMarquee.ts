import { useCallback, useEffect, useRef, type RefObject } from 'react';

/** Seconds a folder takes to drift its own width — the old CSS loop's pace. */
const SECONDS_PER_ITEM = 12;
/** How long the drift stays parked after someone swipes, wheels or clicks an arrow. */
const HOLD_MS = 3500;

/**
 * Drives the home Projects row: a native horizontal scroller whose track holds
 * the list several times, with a slow drift layered on top.
 *
 * Native scroll is the point — swipe, trackpad, wheel, momentum and
 * scroll-on-focus all come from the browser, none of it re-implemented. The
 * drift only nudges `scrollLeft` forward a fraction of a pixel per frame, and
 * gives way to the reader: a folder under the mouse, focus inside the row,
 * any swipe or arrow press (parked for HOLD_MS), reduced motion, a phone, a
 * hidden tab or the row being off-screen all stop it.
 *
 * The loop: the position is kept inside the middle copy, ±half a copy. Past
 * either edge it jumps by exactly one copy — identical content, so the jump
 * is invisible — which makes the row endless in both directions. The jump
 * waits for scrolling to settle, so it never cuts across a swipe's momentum
 * or an arrow's smooth scroll, and it is skipped while focus is inside the
 * row, where moving the content would carry the focused folder off-screen.
 *
 * Returns `nudge(±1)` for the arrow buttons: one folder left or right.
 */
export function useMarquee(ref: RefObject<HTMLElement | null>) {
  const nudgeRef = useRef<(direction: 1 | -1) => void>(() => {});

  useEffect(() => {
    const row = ref.current;
    const track = row?.firstElementChild as HTMLElement | null;
    if (!row || !track) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const phone = window.matchMedia('(width < 40rem)');

    let copyWidth = 0;
    let step = 0;
    let pos = 0; // fractional, so a sub-pixel drift still accumulates
    let visible = false;
    let hovering = false;
    let holdUntil = 0;
    let frame = 0;
    let lastTime = 0;
    let settle = 0;

    const measure = () => {
      copyWidth = track.scrollWidth / track.children.length;
      const items = track.querySelectorAll<HTMLElement>('.marquee__item');
      const [a, b] = [items[0], items[1]];
      step = a && b ? b.offsetLeft - a.offsetLeft : row.clientWidth;
    };

    const wrap = () => {
      if (row.matches(':focus-within') || !copyWidth) return;
      if (pos < copyWidth * 0.5) pos += copyWidth;
      else if (pos >= copyWidth * 1.5) pos -= copyWidth;
      else return;
      row.scrollLeft = pos;
    };

    const drifting = () =>
      visible &&
      !hovering &&
      !document.hidden &&
      !reduceMotion.matches &&
      !phone.matches &&
      !row.matches(':focus-within') &&
      performance.now() > holdUntil;

    const tick = (time: number) => {
      const dt = Math.min(time - lastTime, 64) / 1000;
      lastTime = time;
      if (drifting()) {
        pos += (step / SECONDS_PER_ITEM) * dt;
        if (pos >= copyWidth * 1.5) pos -= copyWidth;
        row.scrollLeft = pos;
      }
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const hold = () => {
      holdUntil = performance.now() + HOLD_MS;
    };

    /* The drift's own writes land within a pixel of `pos`; anything further
       is the reader (or an arrow's smooth scroll), so adopt it. */
    const onScroll = () => {
      if (Math.abs(row.scrollLeft - pos) > 1.5) pos = row.scrollLeft;
      clearTimeout(settle);
      settle = window.setTimeout(wrap, 150);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hovering = Boolean((event.target as Element).closest('.folder'));
    };
    const onPointerLeave = () => {
      hovering = false;
    };

    nudgeRef.current = (direction) => {
      hold();
      wrap();
      row.scrollBy({ left: direction * step, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    };

    measure();
    pos = copyWidth;
    row.scrollLeft = pos;

    const resize = new ResizeObserver(() => {
      const ratio = copyWidth ? pos / copyWidth : 1;
      measure();
      pos = ratio * copyWidth;
      row.scrollLeft = pos;
    });
    resize.observe(row);

    const seen = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) start();
      else stop();
    });
    seen.observe(row);

    row.addEventListener('scroll', onScroll, { passive: true });
    row.addEventListener('pointerdown', hold);
    row.addEventListener('wheel', hold, { passive: true });
    row.addEventListener('touchstart', hold, { passive: true });
    row.addEventListener('pointerover', onPointerOver);
    row.addEventListener('pointerleave', onPointerLeave);
    row.addEventListener('focusout', wrap);

    return () => {
      stop();
      clearTimeout(settle);
      resize.disconnect();
      seen.disconnect();
      row.removeEventListener('scroll', onScroll);
      row.removeEventListener('pointerdown', hold);
      row.removeEventListener('wheel', hold);
      row.removeEventListener('touchstart', hold);
      row.removeEventListener('pointerover', onPointerOver);
      row.removeEventListener('pointerleave', onPointerLeave);
      row.removeEventListener('focusout', wrap);
      nudgeRef.current = () => {};
    };
  }, [ref]);

  return useCallback((direction: 1 | -1) => nudgeRef.current(direction), []);
}
