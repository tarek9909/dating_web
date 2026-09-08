import { Router } from 'express';
import { z } from 'zod';
import { publicController } from './public.controller.js';
import { validate } from '../../middleware/validate.js';
import { publicRequestLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

const requestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  phone: z.string().min(6, 'Valid phone number is required').max(30),
  email: z.string().email('Valid email address is required'),
  recipientName: z.string().min(1, 'Recipient name is required').max(150),
  notes: z.string().max(1000).optional(),
});

const eventSchema = z.object({
  eventType: z.enum(['view', 'yes_click', 'no_click', 'location_select', 'food_select', 'share_click', 'rsvp_complete']),
  sessionKey: z.string().max(100).optional(),
  eventData: z.record(z.any()).optional(),
});

router.post('/requests', publicRequestLimiter, validate(requestSchema), publicController.submitRequest);
router.get('/invitations/:slug', publicController.getInvitationBySlug);
router.post('/invitations/:slug/events', validate(eventSchema), publicController.recordEvent);

export default router;
