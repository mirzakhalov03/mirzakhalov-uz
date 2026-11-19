/**
 * The one list of sections the chrome navigates to, shared by the bar and the
 * mobile panel so the two cannot drift.
 *
 * Document order, not menu order. `useActiveSection` resolves ties by taking
 * the *last* id in this array that is intersecting, because a stacked panel
 * pinned under three others still reports itself as visible — so the array has
 * to run in the same order as the sheets do or the current item lags a section
 * behind.
 *
 * `index` is carried per item rather than derived from position: the sheets on
 * home run 01–06, but 05 is the Laugh interstitial (`HomePage.tsx`), which is
 * deliberately not a nav target. Numbering by array position would print
 * Contact as 05 and quietly misstate where it sits on the page.
 */
export const NAV = [
  { id: 'about', index: '01', label: 'About' },
  { id: 'projects', index: '02', label: 'Projects' },
  { id: 'media', index: '03', label: 'Media' },
  { id: 'blog', index: '04', label: 'Blog' },
  { id: 'contact', index: '06', label: 'Contact' },
] as const;

export const NAV_IDS = NAV.map((item) => item.id);
