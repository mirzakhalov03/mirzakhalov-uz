import { Link, useRouteError } from 'react-router';

export function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'This page does not exist.';

  return (
    <section style={{ padding: 'var(--section-padding) var(--gutter)', maxWidth: 'var(--measure)' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', textTransform: 'uppercase' }}>Not found</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 'var(--s3)' }}>{message}</p>
      <p style={{ marginTop: 'var(--s4)' }}>
        <Link to="/">Back to the start</Link>
      </p>
    </section>
  );
}
