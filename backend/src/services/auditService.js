import { pool } from '../db/pool.js';
import { hashToken } from '../utils/tokens.js';

export const auditService = {
  /**
   * Records an administrative action in audit_logs
   */
  async logAction({ userId, action, entityType, entityId, oldValues = null, newValues = null, ipAddress = null, userAgent = null }, connection = null) {
    const executor = connection || pool;
    const ipHash = ipAddress ? hashToken(ipAddress) : null;

    await executor.execute(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_hash, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        entityType || null,
        entityId || null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipHash,
        userAgent ? userAgent.slice(0, 500) : null,
      ]
    );
  }
};
