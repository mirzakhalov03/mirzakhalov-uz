/**
 * The one error type routes throw. The error middleware turns it into the
 * `{ error: { code, message, fields? } }` envelope from Technical PRD §4.3.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new ApiError(400, 'BAD_REQUEST', message, fields);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }
  static forbidden(message = 'Not allowed') {
    return new ApiError(403, 'FORBIDDEN', message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }
  static conflict(message: string, fields?: Record<string, string>) {
    return new ApiError(409, 'CONFLICT', message, fields);
  }
  static payloadTooLarge(message: string) {
    return new ApiError(413, 'PAYLOAD_TOO_LARGE', message);
  }
  static tooManyRequests(message = 'Too many requests. Try again later.') {
    return new ApiError(429, 'RATE_LIMITED', message);
  }
}
