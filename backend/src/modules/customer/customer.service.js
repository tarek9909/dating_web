import { customerRepository } from './customer.repository.js';
import { auditService } from '../../services/auditService.js';
import { pool } from '../../db/pool.js';

function normalizeTimeValue(val) {
  if (!val) return null;
  val = String(val).trim();
  const match = val.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return val.slice(0, 8);
  let [, hours, minutes, seconds, meridiem] = match;
  let h = parseInt(hours, 10);
  if (meridiem) {
    if (meridiem.toUpperCase() === 'PM' && h < 12) h += 12;
    if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
  }
  const hh = String(h).padStart(2, '0');
  const mm = minutes.padStart(2, '0');
  const ss = seconds ? seconds.padStart(2, '0') : '00';
  return `${hh}:${mm}:${ss}`;
}

function assertInvitationNotClaimed(invitation) {
  if (invitation.is_claimed) {
    const err = new Error('This invitation has already been accepted and is locked to preserve the agreed plan.');
    err.statusCode = 403;
    throw err;
  }
}

export const customerService = {
  async getDashboard(customerId) {
    return customerRepository.getCustomerDashboard(customerId);
  },

  async getInvitations(customerId) {
    return customerRepository.getInvitationsByCustomer(customerId);
  },

  async getInvitationFull(publicId, customerId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    return full;
  },

  async updateInvitation(publicId, customerId, data, userId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.updateInvitationDetails(full.invitation.id, {
      recipientName: full.invitation.recipient_name, // Locked to order, customers cannot rebrand
      dateType: data.dateType,
      scheduleMode: data.scheduleMode,
      dateValue: data.dateValue,
      dateText: data.dateText,
      timeValue: normalizeTimeValue(data.timeValue),
      timezone: data.timezone,
      dressCode: data.dressCode,
      dressCodeText: data.dressCodeText,
      internalTitle: data.internalTitle,
    });

    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async updateContent(publicId, customerId, contentData, userId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.updateInvitationContent(full.invitation.id, contentData);
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async applyTemplate(publicId, customerId, { templateId, mode = 'theme_only' }) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    const [templates] = await pool.execute('SELECT * FROM templates WHERE id = ?', [templateId]);
    const template = templates[0];
    if (!template) {
      const err = new Error('Template not found');
      err.statusCode = 404;
      throw err;
    }

    // Update theme_id and template_id
    await pool.execute(
      'UPDATE invitations SET template_id = ?, theme_id = ? WHERE id = ?',
      [template.id, template.theme_id, full.invitation.id]
    );

    // If full reset requested, copy template default content
    if (mode === 'full') {
      const [contents] = await pool.execute('SELECT * FROM template_content WHERE template_id = ?', [template.id]);
      if (contents[0]) {
        const tc = contents[0];
        await customerRepository.updateInvitationContent(full.invitation.id, {
          opening_text: tc.opening_text,
          question_text: tc.question_text,
          yes_button_text: tc.yes_button_text,
          no_button_text: tc.no_button_text,
          no_phrase_1: tc.no_phrase_1,
          no_phrase_2: tc.no_phrase_2,
          no_phrase_3: tc.no_phrase_3,
          angry_title: tc.angry_title,
          angry_message: tc.angry_message,
          angry_button: tc.angry_button,
          location_title: tc.location_title,
          food_title: tc.food_title,
          when_title: tc.when_title,
          dress_code_title: tc.dress_code_title,
          final_title: tc.final_title,
          final_message: tc.final_message,
        });
      }
    }

    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async setLocations(publicId, customerId, locationIds) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.setLocations(full.invitation.id, locationIds);
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async setFoodOptions(publicId, customerId, foodOptionIds) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.setFoodOptions(full.invitation.id, foodOptionIds);
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async updateCustomLocations(publicId, customerId, locations) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    if (Array.isArray(locations)) {
      await customerRepository.updateCustomLocations(full.invitation.id, locations);
    }
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async updateCustomOptions(publicId, customerId, options) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    if (Array.isArray(options)) {
      await customerRepository.updateCustomOptions(full.invitation.id, options);
    }
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async assignMediaSlot(publicId, customerId, slot, mediaAssetId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.assignMediaSlot(full.invitation.id, mediaAssetId, slot);
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async removeMediaSlot(publicId, customerId, slot) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    assertInvitationNotClaimed(full.invitation);

    await customerRepository.removeMediaSlot(full.invitation.id, slot);
    return customerRepository.getInvitationFull(publicId, customerId);
  },

  async createMediaAsset(data) {
    return customerRepository.createMediaAsset(data);
  },

  async publishInvitation(publicId, customerId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }

    // Validate publishing requirements
    const inv = full.invitation;
    const content = full.content;

    if (!inv.recipient_name || inv.recipient_name.trim() === '') {
      const err = new Error('Cannot publish: Recipient name is required');
      err.statusCode = 422;
      throw err;
    }

    if (!content.question_text || content.question_text.trim() === '') {
      const err = new Error('Cannot publish: Question text is required');
      err.statusCode = 422;
      throw err;
    }

    if (full.locations.length === 0) {
      const err = new Error('Cannot publish: Please select at least one location');
      err.statusCode = 422;
      throw err;
    }

    if (full.foodOptions.length === 0) {
      const err = new Error('Cannot publish: Please select at least one food option');
      err.statusCode = 422;
      throw err;
    }

    await customerRepository.setPublishStatus(inv.id, 'published');

    return {
      success: true,
      status: 'published',
      slug: inv.slug,
      publicUrl: `/d/${inv.slug}`,
      message: 'Invitation published successfully! Your date proposal is now live.',
    };
  },

  async unpublishInvitation(publicId, customerId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }

    await customerRepository.setPublishStatus(full.invitation.id, 'unpublished');

    return {
      success: true,
      status: 'unpublished',
      message: 'Invitation has been unpublished and is no longer accessible publicly.',
    };
  },

  async getAnalytics(publicId, customerId) {
    const full = await customerRepository.getInvitationFull(publicId, customerId);
    if (!full) {
      const err = new Error('Invitation not found');
      err.statusCode = 404;
      throw err;
    }
    return customerRepository.getAnalytics(full.invitation.id);
  },

  // Library Catalogs
  async getTemplates() { return customerRepository.getTemplates(); },
  async getThemes() { return customerRepository.getThemes(); },
  async getLocations() { return customerRepository.getLocations(); },
  async getFoodOptions() { return customerRepository.getFoodOptions(); },
  async getGifs(category) { return customerRepository.getGifs(category); }
};
