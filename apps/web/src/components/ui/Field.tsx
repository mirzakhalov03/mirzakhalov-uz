import type { ComponentPropsWithoutRef } from 'react';
import { Data } from '../../primitives/Data.js';

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  multiline?: boolean;
} & ComponentPropsWithoutRef<'input'> &
  ComponentPropsWithoutRef<'textarea'>;

/**
 * The label is always visible, never a placeholder — a placeholder disappears
 * the moment someone starts typing, which is exactly when they need it (§4.7).
 * Errors sit at the field, in rose, and state the remedy rather than the rule.
 */
export function Field({ id, label, error, multiline = false, className = '', ...rest }: FieldProps) {
  const Tag = multiline ? 'textarea' : 'input';
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>
        <Data tone={error ? 'fg' : 'muted'}>{label}</Data>
      </label>

      <Tag
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        /* 16px on mobile, or iOS zooms the whole page on focus. */
        className={[
          'w-full border bg-well px-1.5 py-1 text-[16px] text-fg sm:text-body',
          'outline-none transition-colors duration-[160ms] ease-plate',
          'placeholder:text-fg-subtle focus:border-accent-text',
          error ? 'border-danger' : 'border-line',
          className,
        ].join(' ')}
        {...rest}
      />

      {error ? (
        <Data id={errorId} tone="fg" className="text-danger">
          {error}
        </Data>
      ) : null}
    </div>
  );
}
