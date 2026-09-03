import { Data } from '../../primitives/Data.js';

/**
 * The success state for the contact form. His real signature, already in the
 * repo, drawn in violet over a faint ghost of itself — about 2KB for the
 * emotional high point of the site. Not a green toast (§3.6).
 */
export function Signature({ caption }: { caption: string }) {
  const style = { '--signature-src': 'url(/brand/signature.png)' } as React.CSSProperties;

  return (
    <div role="status" className="py-4">
      <div className="relative h-16 w-56" style={style}>
        <div className="signature absolute inset-0 text-fg-subtle" aria-hidden="true" />
        <div className="signature signature-ink absolute inset-0 text-accent-text" aria-hidden="true" />
      </div>
      <Data tone="fg" className="mt-2 block">
        {caption}
      </Data>
    </div>
  );
}
