import { Router } from 'express';
import { z } from 'zod';
import { adminController } from './admin.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

// Enforce Admin Authentication on all admin routes
router.use(requireAuth);
router.use(requireRole('admin'));

// Validation Schemas
const updateStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'awaiting_payment', 'paid', 'account_created', 'completed', 'cancelled']),
});

const recordPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  paymentMethod: z.enum(['cash', 'whish', 'bank_transfer', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

const createCustomerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(6, 'Valid phone / WhatsApp number is required'),
  recipientName: z.string().optional(),
  customPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

// Admin Dashboard KPI
router.get('/dashboard', adminController.getDashboard);

// Requests Management
router.get('/requests', adminController.getRequests);
router.get('/requests/:requestId', adminController.getRequestById);
router.patch('/requests/:requestId/status', validate(updateStatusSchema), adminController.updateRequestStatus);
router.post('/requests/:requestId/payment', validate(recordPaymentSchema), adminController.recordPayment);
router.post('/requests/:requestId/activate', adminController.activateAccount);

// Customers Management
router.get('/customers', adminController.getCustomers);
router.post('/customers', validate(createCustomerSchema), adminController.createCustomer);
router.post('/customers/:customerId/suspend', adminController.suspendCustomer);
router.post('/customers/:customerId/activate', adminController.activateCustomer);
router.post('/customers/:customerId/reactivate', adminController.activateCustomer);

// Users Management
router.post('/users/:userId/reset-password', adminController.resetUserPassword);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
