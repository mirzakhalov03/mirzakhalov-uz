import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.js';
import { queryKeys } from '../lib/query-client.js';

type Health = { status: string; db: string };

/**
 * Placeholder home. It pings /health so the scaffold proves the whole path —
 * browser → Vite → CORS → Express → Mongo — before any real feature is built.
 */
export function HomePage() {
  const { data, isPending, isError } = useQuery({
    queryKey: [...queryKeys.session(), 'health'],
    queryFn: () => api.get<Health>('/health'),
    retry: false,
  });

  return (
    <section style={{ padding: 'var(--section-padding) var(--gutter)', maxWidth: 'var(--measure)' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
        Portfolio v2
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 'var(--s3)' }}>
        Scaffold is up. Milestone M0 — workspaces, shared schemas, Express boot, Mongo connect.
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-data)',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          color: isError ? 'var(--rose)' : 'var(--mint)',
          marginTop: 'var(--s4)',
        }}
      >
        {isPending ? 'api — checking' : isError ? 'api — unreachable' : `api — ${data?.status} · db ${data?.db}`}
      </p>
    </section>
  );
}
