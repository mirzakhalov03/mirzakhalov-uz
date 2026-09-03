import type { ApiError } from '@portfolio/shared';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

/** A failed response, carrying the server's `fields` map so forms can render errors at source. */
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  /** Send the admin cookie. Off by default so public reads stay cacheable. */
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/**
 * The one place a fetch happens. Every caller gets the same error type, so no
 * component has to know what an error envelope looks like.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth, query, headers, ...rest } = options;

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    credentials: auth ? 'include' : 'same-origin',
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = payload as ApiError | null;
    throw new ApiRequestError(
      response.status,
      envelope?.error.code ?? 'UNKNOWN',
      envelope?.error.message ?? 'Request failed',
      envelope?.error.fields,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
