/**
 * Standardized API response helpers matching the V1 specification
 */

export function sendSuccess(res, data = null, statusCode = 200, meta = null) {
  const payload = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, message = 'An error occurred', code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message,
    }
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}
