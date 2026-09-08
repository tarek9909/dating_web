import { verifyAccessToken } from '../utils/tokens.js';
import { sendError } from '../utils/response.js';
import { pool } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
  }

  const token = authHeader.slice(7).trim();

  try {
    const decoded = verifyAccessToken(token);

    // Fetch user state to verify not suspended/disabled
    const [users] = await pool.execute(
      `SELECT u.id, u.email, u.role, u.status, u.must_change_password, u.customer_id,
              c.status AS customer_status
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (users.length === 0) {
      return sendError(res, 'User account no longer exists', 'UNAUTHORIZED', 401);
    }

    const user = users[0];

    if (user.status !== 'active') {
      return sendError(res, 'Your account has been suspended or disabled', 'ACCOUNT_SUSPENDED', 403);
    }

    if (user.customer_status && user.customer_status === 'suspended') {
      return sendError(res, 'Customer account is currently suspended', 'ACCOUNT_SUSPENDED', 403);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      customerId: user.customer_id,
      mustChangePassword: Boolean(user.must_change_password),
    };

    // If customer must change password, guard other routes
    const isChangePassword = (req.originalUrl && req.originalUrl.includes('/change-password')) || (req.path && req.path.includes('change-password'));
    const isLogout = (req.originalUrl && req.originalUrl.includes('/logout')) || (req.path && req.path.includes('logout'));
    const isMe = (req.originalUrl && req.originalUrl.includes('/me')) || (req.path && req.path.includes('me'));

    if (
      req.user.mustChangePassword &&
      !isChangePassword &&
      !isLogout &&
      !isMe
    ) {
      return sendError(
        res,
        'You must change your temporary password before accessing the system',
        'PASSWORD_CHANGE_REQUIRED',
        403
      );
    }


    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token has expired', 'TOKEN_EXPIRED', 401);
    }
    return sendError(res, 'Invalid access token', 'UNAUTHORIZED', 401);
  }
}
