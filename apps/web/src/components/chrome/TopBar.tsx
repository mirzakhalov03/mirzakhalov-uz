import { useCallback, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { useActiveSection } from '../../lib/useActiveSection.js';
import { WaveHand } from '../ui/WaveHand.js';
import { BurgerButton, NavMenu } from './NavMenu.js';
import { NAV, NAV_IDS } from './nav-items.js';

type BarRowProps = {
  /** Null anywhere but home — the underline tracks sections, not routes. */
  active: string | null;
  /** The panel's copy of the row omits it: below `sm` the links are hidden
      anyway, and a second set in the DOM buys nothing. */
  showNav?: boolean;
  /** Set inside the panel, so following a link there also dismisses it. */
  onNavigate?: () => void;
  menu: ReactNode;
};

/**
 * The bar's contents, drawn twice — once in the sticky header, once inside the
 * panel, which covers it. Same component both times so the wordmark and the CTA
 * cannot drift apart between the closed and open states.
 */
function BarRow({ active, showNav = true, onNavigate, menu }: BarRowProps) {
  return (
    <div className="mx-auto flex h-7 max-w-content items-center gap-3 px-3 sm:px-4 lg:px-6">
      <Link
        to="/"
        onClick={onNavigate}
        className="shrink-0 leading-none"
        aria-label="Javohirbek Mirzakhalov — home"
      >
        <span className="font-display text-[1.05rem] tracking-tight text-fg">JM</span>
        <span className="t-data ml-1 hidden text-fg-subtle sm:inline">.UZ</span>
      </Link>

      {showNav ? (
        <nav
          aria-label="Sections"
          className="-mx-1 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden"
        >
          {NAV.map((item) => {
            const current = active === item.id;
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
      ) : null}

      {/* The one filled thing in the bar, so it stays the only place the eye is
          pulled. Inverts on hover like Button's solid variant — the plate
          flipping over (§3.6) — rather than shifting a tint. Shown at every
          width, and kept out of the panel: it is the primary action, and
          §4.1's point about it costing one tap holds whether or not the section
          links are behind a button. `ml-auto` only bites below `sm`, where the
          nav that would otherwise fill the row is gone. */}
      <Link
        to={{ pathname: '/', hash: '#contact' }}
        onClick={onNavigate}
        className="t-data ml-auto inline-flex shrink-0 items-center gap-1.5 border border-transparent bg-accent px-2 py-1 text-[var(--color-bone)] transition-colors duration-[160ms] ease-plate hover:bg-fg hover:text-surface active:translate-x-px active:translate-y-px sm:ml-0 sm:px-2.5"
      >
        <WaveHand className="hand-wave" />
        Say Hi
      </Link>

      {menu}
    </div>
  );
}

/**
 * 56px, sticky, one hairline underneath.
 *
 * §4.1 originally ruled out a hamburger at every width, on the grounds that
 * four short mono items fit as a scrollable row down to 320px — one tap instead
 * of two. The bar has since grown to five items plus a filled CTA, which puts
 * Contact off the right edge of a phone with no scrollbar to admit it exists.
 * So below `sm` the links move into a panel and the row keeps the wordmark, the
 * CTA and the trigger. At `sm` and above nothing has changed.
 */
export function TopBar() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const activeSection = useActiveSection(NAV_IDS);
  const active = onHome ? activeSection : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/88 backdrop-blur-md">
      <BarRow
        active={active}
        menu={<BurgerButton open={false} onClick={() => setMenuOpen(true)} />}
      />

      <NavMenu open={menuOpen} onClose={closeMenu} active={active}>
        <BarRow
          active={active}
          showNav={false}
          onNavigate={closeMenu}
          menu={<BurgerButton open onClick={closeMenu} />}
        />
      </NavMenu>

      {/* Reading position, drawn as a rule rather than a bar. Scroll-linked. */}
      <div
        aria-hidden="true"
        className="rule-progress absolute inset-x-0 bottom-0 h-0.5 bg-accent"
      />
    </header>
  );
}
