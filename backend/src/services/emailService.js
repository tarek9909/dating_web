import { pool } from '../db/pool.js';
import { config } from '../config/env.js';

export const emailService = {
  /**
   * Queues an email into email_outbox for asynchronous sending or admin notification
   */
  async queueEmail({ recipientEmail, templateName, subject, payload }) {
    const [res] = await pool.execute(
      `INSERT INTO email_outbox (recipient_email, template_name, subject, payload, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [recipientEmail, templateName, subject, JSON.stringify(payload || {})]
    );

    console.log(`[EmailService] Notification queued (ID: ${res.insertId}) to: ${recipientEmail} - Subject: "${subject}"`);
    return res.insertId;
  },

  async notifyAdminNewRequest({ customerName, phone, email, recipientName, notes }) {
    return this.queueEmail({
      recipientEmail: config.notifications.adminEmail,
      templateName: 'admin_new_request',
      subject: `New Invitation Request — ${customerName}`,
      payload: {
        customerName,
        phone,
        email,
        recipientName,
        notes,
        submittedAt: new Date().toISOString(),
      }
    });
  },

  async notifyCustomerAccountActivated({ customerEmail, customerName, tempPassword }) {
    return this.queueEmail({
      recipientEmail: customerEmail,
      templateName: 'customer_account_activated',
      subject: 'Your Date Invitation Account is Ready! 💌',
      payload: {
        customerName,
        email: customerEmail,
        temporaryPassword: tempPassword,
        loginUrl: `${config.urls.frontend}/login`,
      }
    });
  }
};
