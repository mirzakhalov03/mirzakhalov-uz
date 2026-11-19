import { Link, useRouteError } from 'react-router';
import { Data, Page, Plate } from '../primitives/index.js';
import { Footer } from '../components/chrome/Footer.js';
import { Button } from '../components/ui/Button.js';
import { BrokenRosette } from '../components/content/Rosette.js';

/**
 * The rosette, mis-constructed — the star drawn with a wrong inner radius so it
 * visibly fails to close (§5.5). It is the one page where the system's own
 * logic can carry the joke, and it costs nothing because the geometry is
 * already parameterised.
 */
export function ErrorPage() {
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : null;

  return (
    <Page>
      <div className="grid items-center gap-8 py-12 lg:grid-cols-[1fr_1fr]">
        <div className="mx-auto w-2/3 max-w-xs lg:order-2 lg:w-full lg:max-w-none">
          <BrokenRosette />
        </div>

        <Plate className="p-4 lg:order-1 lg:p-6">
          <Data tone="accent">404 — construction failed</Data>
          <h1 className="t-h2 mt-2 text-fg">This one doesn’t close</h1>
          <p className="prose-measure mt-3 text-lede text-fg-muted">
            The inner radius is wrong, so the star never meets itself. Same with this URL — there is
            nothing at the end of it.
          </p>
          {detail ? (
            <Data className="mt-3 block">{detail}</Data>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button as={Link} to="/">
              Back to the start
            </Button>
            <Button as={Link} to="/#projects" variant="ghost">
              See the work
            </Button>
          </div>
        </Plate>
      </div>
      <Footer />
    </Page>
  );
}
