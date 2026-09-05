import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { TopBar } from './chrome/TopBar.js';
import { CommandPalette } from './chrome/CommandPalette.js';

export function RootLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { hash, pathname } = useLocation();

  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /* React Router doesn't scroll to a hash on client navigation. scroll-padding-top
     on <html> keeps the sticky bar off the heading. */
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }

    const target = document.getElementById(hash.slice(1));
    if (!target) return;

    /* On a stacked page the target may be pinned to the top of the screen with
       half the page still below it. Its client rect is where it is *painted*,
       so scrollIntoView would conclude it is already in view and do nothing —
       every link back to an earlier section would go dead. useStack records
       where each panel actually sits in the flow; that is what to scroll to. */
    const panel = target.closest<HTMLElement>('[data-flow-top]');
    const flowTop = panel?.dataset.flowTop;
    if (flowTop) window.scrollTo({ top: Number(flowTop), behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
  }, [hash, pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <TopBar />

      <main id="main">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
