import { pool } from '../../db/pool.js';

export const adminRepository = {
  // Dashboard KPI Metrics
  async getDashboardSummary() {
    const [reqCounts] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'new' THEN 1 END) AS newRequests,
        COUNT(CASE WHEN status = 'awaiting_payment' THEN 1 END) AS awaitingPayment,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) AS paidRequests,
        COUNT(CASE WHEN status = 'account_created' THEN 1 END) AS activatedRequests
      FROM customer_requests
    `);

    const [customerCounts] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS activeCustomers,
        COUNT(CASE WHEN status = 'lead' THEN 1 END) AS leadCustomers
      FROM customers
    `);

    const [invitationCounts] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'published' THEN 1 END) AS publishedInvitations,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) AS draftInvitations
      FROM invitations
    `);

    const [paymentTotal] = await pool.execute(`
      SELECT COALESCE(SUM(amount), 0) AS totalRevenue
      FROM payments
      WHERE status = 'paid'
    `);

    return {
      requests: reqCounts[0],
      customers: customerCounts[0],
      invitations: invitationCounts[0],
      revenue: paymentTotal[0].totalRevenue,
    };
  },

  // Requests Management
  async getRequests({ page = 1, pageSize = 20, status = null, search = null }) {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (c.full_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ? OR r.recipient_name LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM customer_requests r
       JOIN customers c ON r.customer_id = c.id
       ${whereClause}`,
      params
    );

    const [rows] = await pool.execute(
      `SELECT r.*, c.full_name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              p.id AS payment_id, p.amount AS payment_amount, p.status AS payment_status, p.payment_method
       FROM customer_requests r
       JOIN customers c ON r.customer_id = c.id
       LEFT JOIN payments p ON r.id = p.request_id AND p.status = 'paid'
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return {
      items: rows,
      total: countRows[0].total,
      page,
      pageSize,
    };
  },

  async getRequestById(id) {
    const [rows] = await pool.execute(
      `SELECT r.*, c.full_name AS customer_name, c.email AS customer_email, c.phone AS customer_phone, c.status AS customer_status
       FROM customer_requests r
       JOIN customers c ON r.customer_id = c.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async updateRequestStatus(id, status, assignedAdminId = null) {
    let sql = 'UPDATE customer_requests SET status = ?';
    const params = [status];

    if (status === 'contacted') {
      sql += ', contacted_at = CURRENT_TIMESTAMP';
    } else if (status === 'completed' || status === 'account_created') {
      sql += ', completed_at = CURRENT_TIMESTAMP';
    }

    if (assignedAdminId) {
      sql += ', assigned_admin_user_id = ?';
      params.push(assignedAdminId);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await pool.execute(sql, params);
  },

  // Payments Management
  async recordPayment({ requestId, customerId, amount, currency = 'USD', paymentMethod, referenceNumber, notes, adminUserId }) {
    const [res] = await pool.execute(
      `INSERT INTO payments (request_id, customer_id, amount, currency, payment_method, reference_number, notes, status, marked_paid_by, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'paid', ?, CURRENT_TIMESTAMP)`,
      [requestId, customerId, amount, currency, paymentMethod, referenceNumber || null, notes || null, adminUserId]
    );

    // Update request status to paid
    await pool.execute(
      "UPDATE customer_requests SET status = 'paid' WHERE id = ?",
      [requestId]
    );

    return res.insertId;
  },

  // Customers Management
  async getCustomers({ page = 1, pageSize = 20, search = null }) {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM customers ${whereClause}`,
      params
    );

    const [rows] = await pool.execute(
      `SELECT c.*, u.id AS user_id, u.status AS user_status, u.last_login_at,
              (SELECT COUNT(*) FROM invitations i WHERE i.customer_id = c.id) AS invitation_count
       FROM customers c
       LEFT JOIN users u ON c.id = u.customer_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    return {
      items: rows,
      total: countRows[0].total,
      page,
      pageSize,
    };
  },

  async updateCustomerStatus(customerId, status) {
    await pool.execute('UPDATE customers SET status = ? WHERE id = ?', [status, customerId]);
    // Also synchronize user account status if linked
    const userStatus = status === 'suspended' ? 'suspended' : 'active';
    await pool.execute('UPDATE users SET status = ? WHERE customer_id = ?', [userStatus, customerId]);
  },

  // Users Management & Password Reset
  async resetUserPassword(userId, newPasswordHash) {
    await pool.execute(
      `UPDATE users
       SET password_hash = ?, must_change_password = TRUE, password_changed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newPasswordHash, userId]
    );
  },

  // Audit Logs
  async getAuditLogs({ page = 1, pageSize = 30 }) {
    const offset = (page - 1) * pageSize;
    const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM audit_logs');
    const [rows] = await pool.execute(
      `SELECT a.*, u.email AS admin_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    return {
      items: rows,
      total: countRows[0].total,
      page,
      pageSize,
    };
  }
};
