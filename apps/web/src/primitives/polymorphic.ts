import type { ComponentPropsWithoutRef, ElementType } from 'react';

/**
 * Props for a component that can render as a different element via `as`.
 * The rendered element's own props come along — so `<Button as={Link} to="/">`
 * type-checks `to`, and `<Button as="a" href="…">` type-checks `href`.
 */
export type Polymorphic<T extends ElementType, OwnProps> = OwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | 'as'>;
