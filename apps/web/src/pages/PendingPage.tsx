import { Link } from 'react-router';
import { Data, Page, Plate } from '../primitives/index.js';
import { Footer } from '../components/chrome/Footer.js';
import { Button } from '../components/ui/Button.js';

/**
 * A route that exists in the design and not yet in the build. It says which,
 * and offers the nearest useful thing — an empty screen is an invitation to
 * act, not an apology.
 */
export function PendingPage({ title, note, next }: { title: string; note: string; next: string }) {
  return (
    <Page>
      <div className="py-12">
        <Plate className="p-4 lg:p-6">
          <Data tone="accent">Not built yet</Data>
          <h1 className="t-h2 mt-2 text-fg">{title}</h1>
          <p className="prose-measure mt-3 text-lede text-fg-muted">{note}</p>
          <div className="mt-5">
            <Button as={Link} to="/" variant="ghost">
              {next}
            </Button>
          </div>
        </Plate>
      </div>
      <Footer />
    </Page>
  );
}
