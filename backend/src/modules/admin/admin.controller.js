import { adminService } from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';

export const adminController = {
  async getDashboard(req, res, next) {
    try {
      const summary = await adminService.getDashboardSummary();
      return sendSuccess(res, summary);
    } catch (err) {
      next(err);
    }
  },

  async getRequests(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '20', 10);
      const status = req.query.status || null;
      const search = req.query.search || null;

      const result = await adminService.getRequests({ page, pageSize, status, search });
      return sendSuccess(res, result.items, 200, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async getRequestById(req, res, next) {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const request = await adminService.getRequestById(requestId);
      return sendSuccess(res, request);
    } catch (err) {
      next(err);
    }
  },

  async updateRequestStatus(req, res, next) {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const { status } = req.body;
      const result = await adminService.updateRequestStatus({
        requestId,
        status,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async recordPayment(req, res, next) {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const { amount, currency, paymentMethod, referenceNumber, notes } = req.body;
      const result = await adminService.recordPayment({
        requestId,
        amount,
        currency,
        paymentMethod,
        referenceNumber,
        notes,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async activateAccount(req, res, next) {
    try {
      const requestId = parseInt(req.params.requestId, 10);
      const result = await adminService.activateCustomerAccount({
        requestId,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getCustomers(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '20', 10);
      const search = req.query.search || null;

      const result = await adminService.getCustomers({ page, pageSize, search });
      return sendSuccess(res, result.items, 200, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  },

  async createCustomer(req, res, next) {
    try {
      const { fullName, email, phone, recipientName, customPassword } = req.body;
      const result = await adminService.createCustomerDirectly({
        fullName,
        email,
        phone,
        recipientName,
        customPassword,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async suspendCustomer(req, res, next) {
    try {
      const customerId = parseInt(req.params.customerId, 10);
      const result = await adminService.setCustomerSuspension({
        customerId,
        suspend: true,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async activateCustomer(req, res, next) {
    try {
      const customerId = parseInt(req.params.customerId, 10);
      const result = await adminService.setCustomerSuspension({
        customerId,
        suspend: false,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async resetUserPassword(req, res, next) {
    try {
      const userId = parseInt(req.params.userId, 10);
      const result = await adminService.resetUserPassword({
        userId,
        adminUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '30', 10);
      const result = await adminService.getAuditLogs({ page, pageSize });
      return sendSuccess(res, result.items, 200, {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    } catch (err) {
      next(err);
    }
  }
};
