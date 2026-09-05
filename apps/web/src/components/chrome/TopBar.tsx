import { Link, useLocation } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { useActiveSection } from '../../lib/useActiveSection.js';
import { WaveHand } from '../ui/WaveHand.js';

/* Document order, not menu order. useActiveSection resolves ties by taking the
   *last* id in this array that is intersecting, because a stacked panel pinned
   under three others still reports itself as visible — so the array has to run
   in the same order as the sheets do or the current item lags a section behind. */
const NAV = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'media', label: 'Media' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
] as const;

const IDS = NAV.map((item) => item.id);

/**
 * 56px, sticky, one hairline underneath. No hamburger at any width — four short
 * mono items fit as a scrollable row down to 320px, which is one tap instead of
 * two (§4.1). The old nav disappeared entirely below 370px.
 */
export function TopBar() {
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

        {/* The one filled thing in the bar, so it stays the only place the eye is
            pulled. Inverts on hover like Button's solid variant — the plate
            flipping over (§3.6) — rather than shifting a tint. Shown at every
            width: unlike the shortcut it replaced, it needs no keyboard. */}
        <Link
          to={{ pathname: '/', hash: '#contact' }}
          className="t-data inline-flex shrink-0 items-center gap-1.5 border border-transparent bg-accent px-2 py-1 text-[var(--color-bone)] transition-colors duration-[160ms] ease-plate hover:bg-fg hover:text-surface active:translate-x-px active:translate-y-px sm:px-2.5"
        >
          <WaveHand className="hand-wave" />
          Say Hi
        </Link>
      </div>

      {/* Reading position, drawn as a rule rather than a bar. Scroll-linked. */}
      <div
        aria-hidden="true"
        className="rule-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent"
      />
    </header>
  );
}
