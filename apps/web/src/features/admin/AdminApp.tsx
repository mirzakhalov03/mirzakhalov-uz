/**
 * Entry point for the admin tree (Technical PRD §5.1). Lazy-loaded from the
 * router, so this file and everything it imports form their own bundle.
 *
 * M1 replaces this with the login screen and the authenticated shell.
 */
export function AdminApp() {
  return (
    <section style={{ padding: 'var(--section-padding) var(--gutter)' }}>
      <h1 style={{ fontSize: 'var(--text-h3)', textTransform: 'uppercase' }}>Admin</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 'var(--s3)' }}>Arrives in M1.</p>
    </section>
  );
}
