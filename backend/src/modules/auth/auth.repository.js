import { pool } from '../../db/pool.js';

export const authRepository = {
  async findUserByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT u.*, c.status AS customer_status, c.full_name, c.phone
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.email = ?`,
      [email]
    );
    return rows[0] || null;
  },

  async findUserById(id) {
    const [rows] = await pool.execute(
      `SELECT u.id, u.customer_id, u.email, u.username, u.role, u.status, u.must_change_password,
              u.last_login_at, c.status AS customer_status, c.full_name, c.phone
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  },

  async createSession({ userId, refreshTokenHash, userAgent, ipHash, expiresAt }) {
    const [result] = await pool.execute(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, user_agent, ip_hash, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, refreshTokenHash, userAgent, ipHash, expiresAt]
    );
    return result.insertId;
  },

  async findActiveSession(refreshTokenHash) {
    const [rows] = await pool.execute(
      `SELECT s.*, u.id AS user_id, u.email, u.role, u.status AS user_status, u.must_change_password, u.customer_id
       FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.refresh_token_hash = ?
         AND s.revoked_at IS NULL
         AND s.expires_at > CURRENT_TIMESTAMP`,
      [refreshTokenHash]
    );
    return rows[0] || null;
  },

  async revokeSession(id) {
    await pool.execute(
      'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  },

  async revokeAllUserSessions(userId) {
    await pool.execute(
      'UPDATE user_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL',
      [userId]
    );
  },

  async updatePassword(userId, passwordHash) {
    await pool.execute(
      `UPDATE users
       SET password_hash = ?, must_change_password = FALSE, password_changed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [passwordHash, userId]
    );
  },

  async createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    await pool.execute(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidPasswordResetToken(tokenHash) {
    const [rows] = await pool.execute(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );
    return rows[0] || null;
  },

  async markPasswordResetTokenUsed(id) {
    await pool.execute(
      'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
};
