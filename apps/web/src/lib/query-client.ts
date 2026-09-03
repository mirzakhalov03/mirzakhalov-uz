import { QueryClient } from '@tanstack/react-query';
import { ApiRequestError } from './api.js';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The content changes a few times a month, not a few times a minute.
      staleTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Retrying a 404 or a 401 just delays the error state.
        if (error instanceof ApiRequestError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

/**
 * Query keys in one place so a mutation can invalidate a list without guessing
 * how the list spelled its key.
 */
export const queryKeys = {
  projects: (filters?: Record<string, unknown>) => ['projects', filters ?? {}] as const,
  project: (slug: string) => ['project', slug] as const,
  posts: (filters?: Record<string, unknown>) => ['posts', filters ?? {}] as const,
  post: (slug: string) => ['post', slug] as const,
  documents: () => ['documents'] as const,
  profile: () => ['profile'] as const,
  session: () => ['session'] as const,
  assets: () => ['assets'] as const,
  messages: () => ['messages'] as const,
};
