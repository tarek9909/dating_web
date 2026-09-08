import { sendError } from '../utils/response.js';

/**
 * Ensures authenticated user has one of the allowed roles
 * @param  {...string} roles - e.g. 'admin', 'customer'
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action', 'FORBIDDEN', 403);
    }

    next();
  };
}
