import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, next) {
  console.error('[Error caught by global handler]:', err);

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

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, code, statusCode);
}
