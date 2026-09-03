import type { ReactNode } from 'react';

/**
 * Renders its children. That is the whole component, and it is deliberate.
 *
 * Design principle 4: nothing animates because it scrolled into view. Fade-up
 * on scroll is the single most common tell of a generated page, it delays the
 * content behind an animation the reader did not ask for, and it makes a long
 * page feel busy rather than considered.
 *
 * Motion in this system is either causal (a 130–180ms response to something
 * the user did) or one of two deliberate set-pieces: the rosette drawing itself
 * once on load, and the signature signing on a successful send. Structural
 * furniture — the substrate, the progress rule, the rosette's turn — is
 * scroll-*linked*, which is a different thing: it tracks the reader's position
 * rather than announcing an arrival.
 *
 * So if you have arrived here looking for a scroll reveal, this is the rule
 * instead. A guardrail beats a paragraph in a document nobody opens.
 */
export function Reveal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
