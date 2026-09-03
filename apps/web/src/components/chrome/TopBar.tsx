import { Link, useLocation } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { ThemeToggle } from './ThemeToggle.js';
import { useActiveSection } from '../../lib/useActiveSection.js';

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'writing', label: 'Writing' },
  { id: 'contact', label: 'Contact' },
] as const;

const IDS = NAV.map((item) => item.id);

/**
 * 56px, sticky, one hairline underneath. No hamburger at any width — four short
 * mono items fit as a scrollable row down to 320px, which is one tap instead of
 * two (§4.1). The old nav disappeared entirely below 370px.
 */
export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const active = useActiveSection(IDS);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/88 backdrop-blur-md">
      <div className="mx-auto flex h-7 max-w-content items-center gap-3 px-3 sm:px-4 lg:px-6">
        <Link to="/" className="shrink-0 leading-none" aria-label="Javohirbek Mirzakhalov — home">
          <span className="font-display text-[1.05rem] tracking-tight text-fg">JM</span>
          <span className="t-data ml-1 hidden text-fg-subtle sm:inline">.UZ</span>
        </Link>

        <nav
          aria-label="Sections"
          className="-mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV.map((item) => {
            const current = onHome && active === item.id;
            return (
              <Link
                key={item.id}
                to={{ pathname: '/', hash: `#${item.id}` }}
                aria-current={current ? 'true' : undefined}
                className="group relative shrink-0 px-1 py-2 sm:px-1.5"
              >
                <Data
                  size="lg"
                  tone={current ? 'fg' : 'muted'}
                  className="transition-colors duration-[160ms] group-hover:text-[var(--fg)]"
                >
                  {item.label}
                </Data>
                {/* Draws in from the left on hover; stays for the current section. */}
                <span
                  aria-hidden="true"
                  className={[
                    'absolute inset-x-1 bottom-1 h-px origin-left bg-accent sm:inset-x-1.5',
                    'transition-transform duration-[160ms] ease-plate',
                    current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  ].join(' ')}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {/* No keyboard below md, so the shortcut is not offered there. */}
          <button
            type="button"
            onClick={onOpenPalette}
            className="t-data hidden items-center gap-1 border border-line px-2 py-1 text-fg-muted transition-colors duration-[160ms] hover:border-accent-text hover:text-accent-text md:inline-flex"
          >
            <span aria-hidden="true">⌘</span>K
          </button>
        </div>
      </div>

      {/* Reading position, drawn as a rule rather than a bar. Scroll-linked. */}
      <div
        aria-hidden="true"
        className="rule-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent"
      />
    </header>
  );
}
