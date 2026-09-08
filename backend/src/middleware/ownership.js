import { pool } from '../db/pool.js';
import { sendError } from '../utils/response.js';

/**
 * Validates that an invitation identified by :publicId belongs strictly
 * to the authenticated user's customer_id.
 * Attaches the resolved invitation to req.invitation.
 */
export async function requireInvitationOwnership(req, res, next) {
  const { publicId } = req.params;
  const customerId = req.user.customerId;

  if (!publicId) {
    return sendError(res, 'Invitation identifier is required', 'BAD_REQUEST', 400);
  }

  if (!customerId && req.user.role !== 'admin') {
    return sendError(res, 'No customer account linked to user', 'FORBIDDEN', 403);
  }

  try {
    let query = 'SELECT * FROM invitations WHERE public_id = ?';
    const params = [publicId];

    // Non-admin customers are strictly restricted to their own invitations
    if (req.user.role !== 'admin') {
      query += ' AND customer_id = ?';
      params.push(customerId);
    }

    const [invitations] = await pool.execute(query, params);

    if (invitations.length === 0) {
      return sendError(res, 'Invitation not found or access denied', 'NOT_FOUND', 404);
    }

    req.invitation = invitations[0];
    next();
  } catch (err) {
    next(err);
  }
}
