import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || (err.name === 'ZodError' ? 422 : 500);

  if (statusCode >= 500) {
    console.error('[Internal Server Error caught by global handler]:', err);
  } else {
    console.warn(`[Client Error ${statusCode} - ${err.code || err.name || 'CLIENT_ERROR'}]:`, err.message);
  }

  if (err.name === 'ZodError') {
    return sendError(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      422,
      err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
    );
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
  }

  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, code, statusCode);
}
