import { publicService } from './public.service.js';
import { sendSuccess } from '../../utils/response.js';

export const publicController = {
  async submitRequest(req, res, next) {
    try {
      const { name, phone, email, recipientName, notes } = req.body;
      const result = await publicService.submitRequest({
        name,
        phone,
        email,
        recipientName,
        notes,
      });

      return sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  },

  async getInvitationBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const result = await publicService.getPublishedInvitation(slug);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async recordEvent(req, res, next) {
    try {
      const { slug } = req.params;
      const { eventType, sessionKey, eventData } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await publicService.recordEvent(slug, {
        eventType,
        sessionKey,
        ipAddress,
        userAgent,
        eventData,
      });

      return sendSuccess(res, { recorded: true });
    } catch (err) {
      next(err);
    }
  }
};

