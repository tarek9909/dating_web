import { adminRepository } from './admin.repository.js';
import { activationService } from '../../services/activationService.js';
import { auditService } from '../../services/auditService.js';
import { generateTemporaryPassword, hashPassword } from '../../utils/password.js';

export const adminService = {
  async getDashboardSummary() {
    return adminRepository.getDashboardSummary();
  },

  async getRequests(query) {
    return adminRepository.getRequests(query);
  },

  async getRequestById(id) {
    const request = await adminRepository.getRequestById(id);
    if (!request) {
      const err = new Error('Request not found');
      err.statusCode = 404;
      throw err;
    }
    return request;
  },

  async updateRequestStatus({ requestId, status, adminUserId, ipAddress, userAgent }) {
    await adminRepository.updateRequestStatus(requestId, status, adminUserId);
    await auditService.logAction({
      userId: adminUserId,
      action: `ADMIN_UPDATED_REQUEST_STATUS_TO_${status.toUpperCase()}`,
      entityType: 'customer_requests',
      entityId: requestId,
      newValues: { status },
      ipAddress,
      userAgent,
    });
    return { success: true, status };
  },

  async recordPayment({ requestId, amount, currency, paymentMethod, referenceNumber, notes, adminUserId, ipAddress, userAgent }) {
    const request = await adminRepository.getRequestById(requestId);
    if (!request) {
      const err = new Error('Request not found');
      err.statusCode = 404;
      throw err;
    }

    const paymentId = await adminRepository.recordPayment({
      requestId,
      customerId: request.customer_id,
      amount,
      currency: currency || 'USD',
      paymentMethod,
      referenceNumber,
      notes,
      adminUserId,
    });

    await auditService.logAction({
      userId: adminUserId,
      action: 'ADMIN_RECORDED_MANUAL_PAYMENT',
      entityType: 'payments',
      entityId: paymentId,
      newValues: { requestId, amount, currency, paymentMethod, referenceNumber },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      paymentId,
      status: 'paid',
      message: 'Payment recorded successfully. Request is now marked as paid.',
    };
  },

  async activateCustomerAccount({ requestId, adminUserId, ipAddress, userAgent }) {
    return activationService.activateRequest({
      requestId,
      adminUserId,
      ipAddress,
      userAgent,
    });
  },

  async getCustomers(query) {
    return adminRepository.getCustomers(query);
  },

  async setCustomerSuspension({ customerId, suspend, adminUserId, ipAddress, userAgent }) {
    const newStatus = suspend ? 'suspended' : 'active';
    await adminRepository.updateCustomerStatus(customerId, newStatus);

    await auditService.logAction({
      userId: adminUserId,
      action: suspend ? 'ADMIN_SUSPENDED_CUSTOMER' : 'ADMIN_REACTIVATED_CUSTOMER',
      entityType: 'customers',
      entityId: customerId,
      newValues: { status: newStatus },
      ipAddress,
      userAgent,
    });

    return { success: true, status: newStatus };
  },

  async resetUserPassword({ userId, adminUserId, ipAddress, userAgent }) {
    const tempPassword = generateTemporaryPassword();
    const newHash = await hashPassword(tempPassword);

    await adminRepository.resetUserPassword(userId, newHash);

    await auditService.logAction({
      userId: adminUserId,
      action: 'ADMIN_RESET_USER_PASSWORD',
      entityType: 'users',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      temporaryPassword: tempPassword,
      message: 'Temporary password generated. Please deliver it securely to the customer.',
    };
  },

  async createCustomerDirectly({ fullName, email, phone, recipientName, customPassword, adminUserId, ipAddress, userAgent }) {
    return activationService.createDirectCustomer({
      fullName,
      email,
      phone,
      recipientName,
      customPassword,
      adminUserId,
      ipAddress,
      userAgent,
    });
  },

  async getAuditLogs(query) {
    return adminRepository.getAuditLogs(query);
  }
};
