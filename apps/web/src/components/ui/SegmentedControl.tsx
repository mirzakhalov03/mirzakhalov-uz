type Option<T extends string> = { value: T; label: string; title?: string };

type Props<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
};

/** Mono segments sharing one border, with a single filled segment for the
 *  current value. No sliding indicator — the fill is the indicator. */
export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex border border-line">
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.title ?? option.label}
            onClick={() => onChange(option.value)}
            className={[
              't-data px-1.5 py-1 transition-colors duration-[160ms] ease-plate sm:px-2',
              i > 0 ? 'border-l border-line' : '',
              active ? 'bg-accent text-[var(--color-bone)]' : 'text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
