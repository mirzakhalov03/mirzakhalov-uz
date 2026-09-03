import { Data } from '../../primitives/Data.js';

/** Measured, not estimated — every ratio here was computed against its ground. */
const SWATCHES = [
  { name: 'Void', token: '--color-void', note: 'Ground' },
  { name: 'Bone', token: '--color-bone', note: '15.9:1' },
  { name: 'Violet', token: '--color-violet', note: 'Large / fills' },
  { name: 'Violet hot', token: '--color-violet-hot', note: '5.6:1' },
  { name: 'Brass', token: '--color-brass', note: 'Measured' },
  { name: 'Mint', token: '--color-mint', note: 'Live' },
];

const SPECS = [
  { label: 'System', value: 'Girih v2' },
  { label: 'Module', value: '32 px · major 256' },
  { label: 'Radius', value: '0' },
  { label: 'Type', value: 'Archivo · JetBrains Mono' },
  { label: 'Measure', value: '62 ch' },
  { label: 'Motion', value: '160 ms · 900 ms' },
];

/**
 * On a technical plate the title block goes at the foot of the sheet: who drew
 * it, at what scale, to which revision. Here it doubles as the living style
 * guide — and as a piece of portfolio evidence in its own right (§3.6).
 */
export function Legend() {
  return (
    <section aria-labelledby="legend-title" className="border-t border-line py-8 lg:py-12">
      <h2 id="legend-title" className="sr-only">
        Drawing legend
      </h2>

      <div className="grid gap-px border border-line bg-line lg:grid-cols-[2fr_3fr]">
        <div className="bg-surface p-3">
          <Data tone="accent">Ground &amp; marks</Data>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SWATCHES.map((swatch) => (
              <li key={swatch.name}>
                <div
                  className="h-8 border border-line"
                  style={{ backgroundColor: `var(${swatch.token})` }}
                  aria-hidden="true"
                />
                <div className="mt-1">
                  <Data tone="fg" className="block">
                    {swatch.name}
                  </Data>
                  <Data className="block">{swatch.note}</Data>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface p-3">
          <Data tone="accent">Specification</Data>
          <dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {SPECS.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-3 border-b border-line pb-1.5">
                <Data>{spec.label}</Data>
                <Data tone="fg">{spec.value}</Data>
              </div>
            ))}
          </dl>

          <p className="prose-measure mt-4 text-body text-fg-muted">
            The grid you can see behind this page is the grid every plate is aligned to. The rosette
            above is generated from its own construction — not a drawing of one.
          </p>
        </div>
      </div>
    </section>
  );
}
