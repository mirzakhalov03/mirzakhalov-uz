import { createContext } from 'react';

/**
 * True inside a marquee copy — the repeats that exist only so the loop has no
 * seam (ProjectMarquee).
 *
 * A copy is on screen much of the time, so it has to stay fully usable with a
 * pointer: `inert` would make visible folders dead to clicks and hover. What a
 * copy must not do is reach the keyboard or a screen reader a second time, so
 * the group is `aria-hidden` and each folder reads this to take its own links
 * out of the tab order (and to skip its view-transition name, which has to be
 * unique on the page).
 */
export const MarqueeCopyContext = createContext(false);
