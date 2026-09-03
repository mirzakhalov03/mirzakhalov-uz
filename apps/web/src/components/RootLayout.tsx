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
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, pathname]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <TopBar onOpenPalette={() => setPaletteOpen(true)} />

      <main id="main">
        <Outlet />
      </main>

      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </>
  );
}
