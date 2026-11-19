import type { ElementType, ReactNode } from 'react';
import type { Polymorphic } from '../../primitives/polymorphic.js';

type ButtonOwnProps = {
  variant?: 'solid' | 'ghost';
  /** `sm` is for actions inside a card, where 46px would out-weigh the title. */
  size?: 'md' | 'sm';
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
  size = 'md',
  className = '',
  children,
  ...rest
}: Polymorphic<T, ButtonOwnProps>) {
  const Tag = (as ?? 'button') as ElementType;
  const base =
    'inline-flex items-center justify-center gap-2 border ' +
    'transition-colors duration-[160ms] ease-plate active:translate-x-px active:translate-y-px';

  const sizes = {
    md: 't-data-lg min-h-[46px] px-3',
    sm: 't-data min-h-[38px] px-2',
  } as const;

  const variants = {
    solid:
      'border-transparent bg-accent text-[var(--color-bone)] hover:bg-fg hover:text-surface',
    ghost: 'border-line bg-transparent text-fg hover:border-accent-text hover:text-accent-text',
  } as const;

  return (
    <Tag className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
