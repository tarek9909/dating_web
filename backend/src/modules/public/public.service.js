import { publicRepository } from './public.repository.js';
import { emailService } from '../../services/emailService.js';

export const publicService = {
  async submitRequest({ name, phone, email, recipientName, notes }) {
    // 1. Find or create customer lead
    let customer = await publicRepository.findCustomerByEmail(email);
    let customerId;

    if (!customer) {
      customerId = await publicRepository.createCustomer({
        fullName: name,
        phone,
        email,
      });
    } else {
      customerId = customer.id;
      // Update phone/name if provided
      await publicRepository.updateCustomerContact(customerId, {
        fullName: name,
        phone,
      });
    }

    // 2. Create customer request entry
    const requestId = await publicRepository.createRequest({
      customerId,
      recipientName,
      notes,
    });

    // 3. Queue admin notification
    await emailService.notifyAdminNewRequest({
      customerName: name,
      phone,
      email,
      recipientName,
      notes,
    });

    return {
      requestId,
      status: 'new',
      message: 'Invitation request received successfully! We will contact you shortly to confirm details and payment.',
    };
  },

  async getPublishedInvitation(slug) {
    const payload = await publicRepository.getPublishedInvitationBySlug(slug);
    if (!payload) {
      const err = new Error('Invitation not found or is currently private');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return payload;
  },

  async recordEvent(slug, { eventType, sessionKey, ipAddress, userAgent, eventData }) {
    const payload = await publicRepository.getPublishedInvitationBySlug(slug);
    if (!payload) return; // Silent discard if invitation not published

    await publicRepository.recordEvent({
      invitationId: payload.invitation.id,
      eventType,
      sessionKey,
      ipAddress,
      userAgent,
      eventData,
    });
  }
};

