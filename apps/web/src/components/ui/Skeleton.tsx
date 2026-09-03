/**
 * Static. No shimmer — a shimmer animates an arrival, which principle 4 rules
 * out, and it draws the eye to the thing that isn't there yet. A block plus a
 * rule where the baseline will land says the same thing without moving.
 */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="border-b border-line bg-well" style={{ height: 16, width: `${100 - i * 12}%` }} />
      ))}
    </div>
  );
}
