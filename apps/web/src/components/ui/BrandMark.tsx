/**
 * The initials on their own void ground — the one loud element in the top bar
 * and the footer. It carries its own ground rather than a colour of its own,
 * so the mark is the system's inversion and not a sixth pigment (§3.2).
 *
 * `className` sets the size: the box and the type scale together.
 */
export function BrandMark({ className = 'size-5 text-[1.05rem]' }: { className?: string }) {
  return (
    <span
      data-surface="void"
      aria-hidden="true"
      className={`marks grid shrink-0 place-items-center bg-surface font-display leading-none text-fg ${className}`}
    >
      JM
    </span>
  );
}
