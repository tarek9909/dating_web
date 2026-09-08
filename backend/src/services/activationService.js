import { withTransaction } from '../db/transaction.js';
import { generateUlid, generateSlug } from '../utils/ulid.js';
import { generateTemporaryPassword, hashPassword } from '../utils/password.js';
import { auditService } from './auditService.js';
import { emailService } from './emailService.js';

export const activationService = {
  /**
   * Atomically activates a customer request after payment verification.
   */
  async activateRequest({ requestId, adminUserId, ipAddress, userAgent }) {
    return withTransaction(async (conn) => {
      // 1. Lock and fetch request
      const [requests] = await conn.execute(
        'SELECT * FROM customer_requests WHERE id = ? FOR UPDATE',
        [requestId]
      );

      const request = requests[0];
      if (!request) {
        const err = new Error('Customer request not found');
        err.statusCode = 404;
        throw err;
      }

      // 2. Verify payment status
      const [payments] = await conn.execute(
        `SELECT * FROM payments
         WHERE request_id = ? AND status = 'paid'
         LIMIT 1`,
        [requestId]
      );

      if (payments.length === 0) {
        const err = new Error('Cannot activate account: Manual payment must be recorded as paid first');
        err.statusCode = 400;
        err.code = 'PAYMENT_REQUIRED';
        throw err;
      }

      // 3. Fetch customer
      const [customers] = await conn.execute(
        'SELECT * FROM customers WHERE id = ? FOR UPDATE',
        [request.customer_id]
      );

      const customer = customers[0];
      if (!customer) {
        const err = new Error('Customer record not found');
        err.statusCode = 404;
        throw err;
      }

      // 4. Create or reuse user account
      const [existingUsers] = await conn.execute(
        'SELECT * FROM users WHERE customer_id = ? OR email = ? FOR UPDATE',
        [customer.id, customer.email]
      );

      let user = existingUsers[0];
      let tempPassword = null;

      if (!user) {
        tempPassword = generateTemporaryPassword();
        const passwordHash = await hashPassword(tempPassword);

        const [userRes] = await conn.execute(
          `INSERT INTO users (customer_id, email, username, password_hash, role, status, must_change_password)
           VALUES (?, ?, ?, ?, 'customer', 'active', TRUE)`,
          [customer.id, customer.email, customer.email.split('@')[0], passwordHash]
        );

        user = {
          id: userRes.insertId,
          email: customer.email,
          customer_id: customer.id,
        };
      } else {
        // Generate new temporary password if resetting or activating
        tempPassword = generateTemporaryPassword();
        const passwordHash = await hashPassword(tempPassword);
        await conn.execute(
          `UPDATE users
           SET customer_id = ?, password_hash = ?, status = 'active', must_change_password = TRUE
           WHERE id = ?`,
          [customer.id, passwordHash, user.id]
        );
      }

      // 5. Update customer status to active
      await conn.execute(
        "UPDATE customers SET status = 'active' WHERE id = ?",
        [customer.id]
      );

      // 6. Fetch default template and its default content
      const [templates] = await conn.execute(
        'SELECT * FROM templates WHERE slug = ? OR active = TRUE ORDER BY id ASC LIMIT 1',
        ['romantic-date-night']
      );
      const defaultTemplate = templates[0];

      let defaultContent = null;
      if (defaultTemplate) {
        const [contents] = await conn.execute(
          'SELECT * FROM template_content WHERE template_id = ?',
          [defaultTemplate.id]
        );
        defaultContent = contents[0];
      }

      // 7. Instantiate customer's first invitation
      const publicId = generateUlid();
      const slug = generateSlug(request.recipient_name);

      const [invRes] = await conn.execute(
        `INSERT INTO invitations (
          public_id, customer_id, created_by_user_id, template_id, theme_id,
          internal_title, slug, recipient_name, date_type, date_text, time_value,
          dress_code, dress_code_text, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'tomorrow', 'Tomorrow', '18:00:00', 'Casual', 'Nothing too serious. Just look cute.', 'draft')`,
        [
          publicId,
          customer.id,
          user.id,
          defaultTemplate ? defaultTemplate.id : null,
          defaultTemplate ? defaultTemplate.theme_id : null,
          `Invitation for ${request.recipient_name}`,
          slug,
          request.recipient_name,
        ]
      );

      const invitationId = invRes.insertId;

      // 8. Clone template content to invitation_content
      if (defaultContent) {
        await conn.execute(
          `INSERT INTO invitation_content (
            invitation_id, opening_text, question_text, yes_button_text, no_button_text,
            no_phrase_1, no_phrase_2, no_phrase_3,
            angry_title, angry_message, angry_button,
            location_title, food_title, when_title, dress_code_title,
            final_title, final_message
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invitationId,
            defaultContent.opening_text,
            defaultContent.question_text,
            defaultContent.yes_button_text,
            defaultContent.no_button_text,
            defaultContent.no_phrase_1,
            defaultContent.no_phrase_2,
            defaultContent.no_phrase_3,
            defaultContent.angry_title,
            defaultContent.angry_message,
            defaultContent.angry_button,
            defaultContent.location_title,
            defaultContent.food_title,
            defaultContent.when_title,
            defaultContent.dress_code_title,
            defaultContent.final_title,
            defaultContent.final_message,
          ]
        );
      }

      // 9. Attach default locations & food options to invitation
      const [defaultLocations] = await conn.execute(
        'SELECT id FROM locations WHERE active = TRUE ORDER BY sort_order ASC LIMIT 3'
      );
      for (let i = 0; i < defaultLocations.length; i++) {
        await conn.execute(
          'INSERT INTO invitation_locations (invitation_id, location_id, sort_order) VALUES (?, ?, ?)',
          [invitationId, defaultLocations[i].id, i + 1]
        );
      }

      const [defaultFoods] = await conn.execute(
        'SELECT id FROM food_options WHERE active = TRUE ORDER BY sort_order ASC LIMIT 3'
      );
      for (let i = 0; i < defaultFoods.length; i++) {
        await conn.execute(
          'INSERT INTO invitation_food_options (invitation_id, food_option_id, sort_order) VALUES (?, ?, ?)',
          [invitationId, defaultFoods[i].id, i + 1]
        );
      }

      // 10. Update customer request status
      await conn.execute(
        "UPDATE customer_requests SET status = 'account_created', completed_at = CURRENT_TIMESTAMP WHERE id = ?",
        [requestId]
      );

      // 11. Audit log
      await auditService.logAction({
        userId: adminUserId,
        action: 'ADMIN_ACTIVATED_CUSTOMER_ACCOUNT',
        entityType: 'customer_requests',
        entityId: requestId,
        newValues: {
          customerId: customer.id,
          userId: user.id,
          invitationId,
          publicId,
          slug,
        },
        ipAddress,
        userAgent,
      }, conn);

      // 12. Queue email to customer with credentials
      await emailService.notifyCustomerAccountActivated({
        customerEmail: customer.email,
        customerName: customer.full_name,
        tempPassword,
      });

      return {
        success: true,
        customerId: customer.id,
        userId: user.id,
        email: customer.email,
        temporaryPassword: tempPassword,
        invitation: {
          id: invitationId,
          publicId,
          slug,
          recipientName: request.recipient_name,
        }
      };
    });
  },

  /**
   * Directly creates and activates a customer account by an admin without requiring a prior public request.
   */
  async createDirectCustomer({ fullName, email, phone, recipientName = 'My Love', customPassword, adminUserId, ipAddress, userAgent }) {
    return withTransaction(async (conn) => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();
      const cleanName = fullName.trim();
      const cleanRecipient = (recipientName && recipientName.trim()) ? recipientName.trim() : 'My Love';

      // 1. Check if email already exists in customers or users
      const [existingCustomers] = await conn.execute(
        'SELECT id FROM customers WHERE email = ?',
        [cleanEmail]
      );

      const [existingUsers] = await conn.execute(
        'SELECT id FROM users WHERE email = ?',
        [cleanEmail]
      );

      if (existingCustomers.length > 0 || existingUsers.length > 0) {
        const err = new Error(`An account with email "${cleanEmail}" already exists`);
        err.statusCode = 409;
        err.code = 'EMAIL_ALREADY_EXISTS';
        throw err;
      }

      // 2. Create customer record
      const [custRes] = await conn.execute(
        `INSERT INTO customers (full_name, phone, email, status)
         VALUES (?, ?, ?, 'active')`,
        [cleanName, cleanPhone, cleanEmail]
      );
      const customerId = custRes.insertId;

      // 3. Generate password
      const tempPassword = customPassword && customPassword.trim().length >= 6
        ? customPassword.trim()
        : generateTemporaryPassword();
      const passwordHash = await hashPassword(tempPassword);

      // 4. Create user account
      const username = cleanEmail.split('@')[0];
      const [userRes] = await conn.execute(
        `INSERT INTO users (customer_id, email, username, password_hash, role, status, must_change_password)
         VALUES (?, ?, ?, ?, 'customer', 'active', TRUE)`,
        [customerId, cleanEmail, username, passwordHash]
      );
      const userId = userRes.insertId;

      // 5. Create customer_requests record marked as account_created
      const [reqRes] = await conn.execute(
        `INSERT INTO customer_requests (
          customer_id, recipient_name, notes, status, quoted_amount, assigned_admin_user_id, contacted_at, completed_at
        ) VALUES (?, ?, 'Created directly via Admin Portal', 'account_created', 0.00, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [customerId, cleanRecipient, adminUserId || null]
      );
      const requestId = reqRes.insertId;

      // 6. Fetch default template and default content
      const [templates] = await conn.execute(
        'SELECT * FROM templates WHERE slug = ? OR active = TRUE ORDER BY id ASC LIMIT 1',
        ['romantic-date-night']
      );
      const defaultTemplate = templates[0];

      let defaultContent = null;
      if (defaultTemplate) {
        const [contents] = await conn.execute(
          'SELECT * FROM template_content WHERE template_id = ?',
          [defaultTemplate.id]
        );
        defaultContent = contents[0];
      }

      // 7. Instantiate first invitation in draft mode
      const publicId = generateUlid();
      const slug = generateSlug(cleanRecipient);

      const [invRes] = await conn.execute(
        `INSERT INTO invitations (
          public_id, customer_id, created_by_user_id, template_id, theme_id,
          internal_title, slug, recipient_name, date_type, date_text, time_value,
          dress_code, dress_code_text, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'tomorrow', 'Tomorrow', '18:00:00', 'Casual', 'Nothing too serious. Just look cute.', 'draft')`,
        [
          publicId,
          customerId,
          userId,
          defaultTemplate ? defaultTemplate.id : null,
          defaultTemplate ? defaultTemplate.theme_id : null,
          `Invitation for ${cleanRecipient}`,
          slug,
          cleanRecipient,
        ]
      );
      const invitationId = invRes.insertId;

      // 8. Clone template content
      if (defaultContent) {
        await conn.execute(
          `INSERT INTO invitation_content (
            invitation_id, opening_text, question_text, yes_button_text, no_button_text,
            no_phrase_1, no_phrase_2, no_phrase_3,
            angry_title, angry_message, angry_button,
            location_title, food_title, when_title, dress_code_title,
            final_title, final_message
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invitationId,
            defaultContent.opening_text,
            defaultContent.question_text,
            defaultContent.yes_button_text,
            defaultContent.no_button_text,
            defaultContent.no_phrase_1,
            defaultContent.no_phrase_2,
            defaultContent.no_phrase_3,
            defaultContent.angry_title,
            defaultContent.angry_message,
            defaultContent.angry_button,
            defaultContent.location_title,
            defaultContent.food_title,
            defaultContent.when_title,
            defaultContent.dress_code_title,
            defaultContent.final_title,
            defaultContent.final_message,
          ]
        );
      }

      // 9. Attach default locations & food options
      const [defaultLocations] = await conn.execute(
        'SELECT id FROM locations WHERE active = TRUE ORDER BY sort_order ASC LIMIT 3'
      );
      for (let i = 0; i < defaultLocations.length; i++) {
        await conn.execute(
          'INSERT INTO invitation_locations (invitation_id, location_id, sort_order) VALUES (?, ?, ?)',
          [invitationId, defaultLocations[i].id, i + 1]
        );
      }

      const [defaultFoods] = await conn.execute(
        'SELECT id FROM food_options WHERE active = TRUE ORDER BY sort_order ASC LIMIT 3'
      );
      for (let i = 0; i < defaultFoods.length; i++) {
        await conn.execute(
          'INSERT INTO invitation_food_options (invitation_id, food_option_id, sort_order) VALUES (?, ?, ?)',
          [invitationId, defaultFoods[i].id, i + 1]
        );
      }

      // 10. Audit log
      await auditService.logAction({
        userId: adminUserId,
        action: 'ADMIN_CREATED_DIRECT_CUSTOMER',
        entityType: 'customers',
        entityId: customerId,
        newValues: {
          customerId,
          userId,
          invitationId,
          publicId,
          slug,
          email: cleanEmail,
        },
        ipAddress,
        userAgent,
      }, conn);

      // 11. Queue email notification
      await emailService.notifyCustomerAccountActivated({
        customerEmail: cleanEmail,
        customerName: cleanName,
        tempPassword,
      });

      return {
        success: true,
        customerId,
        userId,
        customerName: cleanName,
        customerPhone: cleanPhone,
        customerEmail: cleanEmail,
        email: cleanEmail,
        temporaryPassword: tempPassword,
        invitation: {
          id: invitationId,
          publicId,
          slug,
          recipientName: cleanRecipient,
        }
      };
    });
  }
};
