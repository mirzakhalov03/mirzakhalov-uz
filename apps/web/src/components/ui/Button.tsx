import type { ElementType, ReactNode } from 'react';
import type { Polymorphic } from '../../primitives/polymorphic.js';

type ButtonOwnProps = {
  variant?: 'solid' | 'ghost';
  className?: string;
  children: ReactNode;
};

/**
 * Mono, uppercase, 46px minimum, radius 0.
 *
 * The solid variant inverts completely on hover — violet fill/bone text becomes
 * bone fill/void text — rather than shifting a tint. It should read as a plate
 * flipping over, which is the same physical language as the registration marks
 * and the active-state nudge (§3.6).
 */
export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'solid',
  className = '',
  children,
  ...rest
}: Polymorphic<T, ButtonOwnProps>) {
  const Tag = (as ?? 'button') as ElementType;
  const base =
    't-data-lg inline-flex min-h-[46px] items-center justify-center gap-2 border px-3 ' +
    'transition-colors duration-[160ms] ease-plate active:translate-x-px active:translate-y-px';

  const variants = {
    solid:
      'border-transparent bg-accent text-[var(--color-bone)] hover:bg-fg hover:text-surface',
    ghost: 'border-line bg-transparent text-fg hover:border-accent-text hover:text-accent-text',
  } as const;

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
