import type { Ref } from 'react';

type AboutTurnProps = {
  dir: 'next' | 'back';
  /** The chapter on the other side of it. */
  label: string;
  ref?: Ref<HTMLDivElement>;
};

/**
 * The runway between two chapters, and the signpost on it.
 *
 * It is the scroll mechanism made visible. Scrolling until this block is fully
 * in view is what opens the next tab, so leaving it empty would make the turn
 * feel like the page had taken the wheel — the rule and the label say what the
 * next few hundred pixels of scrolling are going to do, before they do it.
 *
 * aria-hidden because it is an affordance for a gesture screen readers do not
 * make: the tablist is the accessible route between chapters, and announcing a
 * second one would be describing the scaffolding rather than the building.
 */
export function AboutTurn({ dir, label, ref }: AboutTurnProps) {
  return (
    <div ref={ref} className="about-turn" data-dir={dir} aria-hidden="true">
      <span className="about-turn__rule" />
      <span className="about-turn__label t-data">
        {dir === 'next' ? 'Next' : 'Back'} — {label}
        <span className="about-turn__arrow">{dir === 'next' ? '↓' : '↑'}</span>
      </span>
      <span className="about-turn__rule" />
    </div>
  );
}
