import type { ElementType, ReactNode } from 'react';
import type { Polymorphic } from './polymorphic.js';

type DataOwnProps = {
  size?: 'sm' | 'lg';
  tone?: 'muted' | 'fg' | 'accent' | 'live' | 'measured';
  className?: string;
  children?: ReactNode;
};

const tones = {
  muted: 'text-fg-muted',
  fg: 'text-fg',
  accent: 'text-accent-text',
  live: 'text-live',
  measured: 'text-measured',
} as const;

/**
 * The mono metadata primitive — coordinates, dates, stacks, versions, statuses,
 * captions. Principle 5: if it is a measurement it is mono, and if it is not,
 * it is Archivo. That one restriction is what keeps the instrument labelling
 * from tipping into fancy-dress terminal.
 */
export function Data<T extends ElementType = 'span'>({
  as,
  size = 'sm',
  tone = 'muted',
  className = '',
  children,
  ...rest
}: Polymorphic<T, DataOwnProps>) {
  const Tag = (as ?? 'span') as ElementType;
  return (
    <Tag className={`${size === 'lg' ? 't-data-lg' : 't-data'} ${tones[tone]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
