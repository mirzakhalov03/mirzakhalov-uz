import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Data } from '../../primitives/Data.js';
import { NAV } from './nav-items.js';

/**
 * Three rules that fold into a cross. Lines are already the system's vocabulary
 * (§3.4), so the icon needs no icon set and no new token — it is the same
 * hairline the bar and every Plate edge are drawn with. 44px square, which is
 * the tap minimum, not the drawn size.
 */
export function BurgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="nav-menu"
      aria-label={open ? 'Close menu' : 'Menu'}
      data-open={open ? '' : undefined}
      className="nav-burger -mr-1 shrink-0"
    >
      <span aria-hidden="true" className="nav-burger__bar" />
      <span aria-hidden="true" className="nav-burger__bar" />
      <span aria-hidden="true" className="nav-burger__bar" />
    </button>
  );
}

type NavMenuProps = {
  open: boolean;
  onClose: () => void;
  /** Null anywhere but home — the underline tracks sections, not routes. */
  active: string | null;
  /**
   * The bar, redrawn inside the dialog. `showModal()` makes everything outside
   * the dialog inert, so the trigger left behind in the real bar would still
   * look live and do nothing; the panel has to carry its own copy of the row
   * for the close affordance to be reachable at all.
   */
  children: ReactNode;
};

/**
 * The mobile section menu. Built on `<dialog>` + `showModal()` for the same
 * reason CommandPalette is: the focus trap, the inert background and the Esc
 * handling are the platform's job rather than ours.
 *
 * It is attached to the bar rather than floating over the sheet, so it takes no
 * shadow — §3.4 grants that exemption to the palette alone.
 */
export function NavMenu({ open, onClose, active, children }: NavMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  /* The trigger only exists below `sm`. Rotating to landscape with the panel
     open would unmount it while the dialog still holds the top layer and the
     page inert — an overlay with nothing left to close it. */
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia('(min-width: 640px)');
    const sync = () => {
      if (wide.matches) onClose();
    };
    sync();
    wide.addEventListener('change', sync);
    return () => wide.removeEventListener('change', sync);
  }, [open, onClose]);

  return (
    <dialog
      id="nav-menu"
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        /* The dialog fills the viewport and the panel sits at the top of it, so
           anything landing on the element itself is a tap on the empty ground
           below — the mobile gesture for dismiss. */
        if (event.target === dialogRef.current) onClose();
      }}
      className="nav-menu m-0 max-w-none bg-transparent p-0 backdrop:bg-[var(--shade)] backdrop:backdrop-blur-[2px] open:fixed open:inset-0 open:block"
    >
      <div className="relative z-10 border-b border-line bg-surface">{children}</div>

      <nav aria-label="Sections" className="nav-menu__list border-b border-line bg-surface">
        <ul className="mx-auto max-w-content">
          {NAV.map((item) => {
            const current = active === item.id;
            return (
              <li key={item.id} className="border-t border-line first:border-t-0">
                <Link
                  to={{ pathname: '/', hash: `#${item.id}` }}
                  onClick={onClose}
                  aria-current={current ? 'true' : undefined}
                  className="group flex min-h-6 items-center gap-3 px-3 active:translate-x-px active:translate-y-px sm:px-4"
                >
                  {/* A 40px rail, not Section's 88px one: at 320px a two-digit
                      number given a tenth of the screen reads as a mistake. */}
                  <Data size="lg" tone={current ? 'accent' : 'muted'} className="w-5 shrink-0">
                    {item.index}
                  </Data>
                  <span className="relative">
                    <span
                      className={`text-lede transition-colors duration-[160ms] ${
                        current ? 'text-fg' : 'text-fg-muted group-hover:text-[var(--fg)]'
                      }`}
                    >
                      {item.label}
                    </span>
                    {/* Same grammar as the bar: draws in from the left on
                        hover, stays for the current section. */}
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute inset-x-0 -bottom-1 h-px origin-left bg-accent',
                        'transition-transform duration-[160ms] ease-plate',
                        current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      ].join(' ')}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </dialog>
  );
}
