import type { ElementType, ReactNode } from 'react';
import type { Polymorphic } from './polymorphic.js';

type PlateOwnProps = {
  /** Force a surface. Omit to inherit the theme's ground. */
  surface?: 'plate' | 'bone' | 'void';
  /** Pin the registration marks on, for a plate that is already the focus. */
  marked?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * The base container. 1px border, flat fill, four registration marks, radius 0,
 * no shadow — separation comes from the border and the marks, never from
 * elevation (§3.4). Everything on the site is a plate or sits on one.
 */
export function Plate<T extends ElementType = 'div'>({
  as,
  surface = 'plate',
  marked = false,
  className = '',
  children,
  ...rest
}: Polymorphic<T, PlateOwnProps>) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      data-surface={surface}
      data-marked={marked || undefined}
      className={`marks border border-line bg-surface text-fg transition-colors duration-[160ms] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
