import { customerService } from './customer.service.js';
import { sendSuccess } from '../../utils/response.js';

export const customerController = {
  async getDashboard(req, res, next) {
    try {
      const result = await customerService.getDashboard(req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getInvitations(req, res, next) {
    try {
      const result = await customerService.getInvitations(req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getInvitation(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.getInvitationFull(publicId, req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateInvitation(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.updateInvitation(publicId, req.user.customerId, req.body, req.user.id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getContent(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.getInvitationFull(publicId, req.user.customerId);
      return sendSuccess(res, result.content);
    } catch (err) {
      next(err);
    }
  },

  async updateContent(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.updateContent(publicId, req.user.customerId, req.body, req.user.id);
      return sendSuccess(res, result.content);
    } catch (err) {
      next(err);
    }
  },

  async applyTemplate(req, res, next) {
    try {
      const { publicId } = req.params;
      const { templateId, mode } = req.body;
      const result = await customerService.applyTemplate(publicId, req.user.customerId, { templateId, mode });
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getLocations(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.getInvitationFull(publicId, req.user.customerId);
      return sendSuccess(res, result.locations);
    } catch (err) {
      next(err);
    }
  },

  async setLocations(req, res, next) {
    try {
      const { publicId } = req.params;
      const { locationIds } = req.body;
      const result = await customerService.setLocations(publicId, req.user.customerId, locationIds);
      return sendSuccess(res, result.locations);
    } catch (err) {
      next(err);
    }
  },

  async getFoodOptions(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.getInvitationFull(publicId, req.user.customerId);
      return sendSuccess(res, result.foodOptions);
    } catch (err) {
      next(err);
    }
  },

  async setFoodOptions(req, res, next) {
    try {
      const { publicId } = req.params;
      const { foodOptionIds } = req.body;
      const result = await customerService.setFoodOptions(publicId, req.user.customerId, foodOptionIds);
      return sendSuccess(res, result.foodOptions);
    } catch (err) {
      next(err);
    }
  },

  async uploadMedia(req, res, next) {
    try {
      const { publicId } = req.params;
      const file = req.file;

      if (!file) {
        const err = new Error('No file uploaded');
        err.statusCode = 400;
        throw err;
      }

      const full = await customerService.getInvitationFull(publicId, req.user.customerId);
      const isGif = file.mimetype === 'image/gif';
      const fileUrl = `/uploads/${file.filename}`;

      const assetId = await customerService.createMediaAsset({
        customerId: req.user.customerId,
        invitationId: full.invitation.id,
        userId: req.user.id,
        visibility: 'customer_private',
        mediaType: isGif ? 'gif' : 'image',
        mimeType: file.mimetype,
        originalFilename: file.originalname,
        fileUrl,
        fileSizeBytes: file.size,
      });

      return sendSuccess(res, {
        assetId,
        url: fileUrl,
        mediaType: isGif ? 'gif' : 'image',
      }, 201);
    } catch (err) {
      next(err);
    }
  },

  async assignMediaSlot(req, res, next) {
    try {
      const { publicId, slot } = req.params;
      const { mediaAssetId } = req.body;

      const result = await customerService.assignMediaSlot(publicId, req.user.customerId, slot, mediaAssetId);
      return sendSuccess(res, result.media);
    } catch (err) {
      next(err);
    }
  },

  async removeMediaSlot(req, res, next) {
    try {
      const { publicId, slot } = req.params;
      const result = await customerService.removeMediaSlot(publicId, req.user.customerId, slot);
      return sendSuccess(res, result.media);
    } catch (err) {
      next(err);
    }
  },

  async preview(req, res, next) {
    try {
      const { publicId } = req.params;
      const full = await customerService.getInvitationFull(publicId, req.user.customerId);

      // Build unified preview payload matching the public renderer format
      const inv = full.invitation;
      const c = full.content;

      const payload = {
        invitation: {
          publicId: inv.public_id,
          slug: inv.slug,
          recipientName: inv.recipient_name,
          status: inv.status,
          scheduleMode: inv.schedule_mode || 'strict',
          isClaimed: Boolean(inv.is_claimed),
          claimedAt: inv.claimed_at,
          claimedPayload: inv.claimed_payload
            ? (typeof inv.claimed_payload === 'string' ? JSON.parse(inv.claimed_payload) : inv.claimed_payload)
            : null,
          date: {
            type: inv.date_type,
            value: inv.date_value,
            text: inv.date_text || 'Tomorrow',
            time: inv.time_value ? String(inv.time_value).slice(0, 5) : '18:00',
            timezone: inv.timezone,
          },
          dressCode: {
            value: inv.dress_code || 'Casual',
            description: inv.dress_code_text || 'Nothing too serious. Just look cute.',
          }
        },
        content: {
          openingText: c.opening_text,
          questionText: c.question_text,
          yesButtonText: c.yes_button_text,
          noButtonText: c.no_button_text,
          noPhrases: [c.no_phrase_1, c.no_phrase_2, c.no_phrase_3].filter(Boolean),
          angry: {
            title: c.angry_title,
            message: c.angry_message,
            button: c.angry_button,
          },
          categoryType: c.category_type || 'food',
          sectionTitles: {
            locations: c.location_title,
            food: c.food_title,
            when: c.when_title,
            dressCode: c.dress_code_title,
          },
          subtitles: {
            locations: c.location_subtitle || null,
            food: c.food_subtitle || null,
            when: c.when_subtitle || null,
            dressCode: c.dress_code_subtitle || null,
          },
          dressCodeChecklist: c.dress_code_checklist 
            ? (typeof c.dress_code_checklist === 'string' ? JSON.parse(c.dress_code_checklist) : c.dress_code_checklist) 
            : null,
          final: {
            title: c.final_title,
            message: c.final_message,
          }
        },
        theme: {
          name: inv.theme_name || 'Romantic Velvet',
          primaryColor: inv.primary_color || '#ff4d6d',
          secondaryColor: inv.secondary_color || '#ff758f',
          backgroundColor: inv.background_color || '#0f0207',
          textColor: inv.text_color || '#ffffff',
          fontFamily: inv.font_family || 'Outfit',
        },
        locations: full.locations.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description,
          emoji: l.emoji,
          imageUrl: l.imageUrl || l.image_url,
          tag: l.category || 'Choice',
        })),
        foodOptions: full.foodOptions.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
          emoji: f.emoji,
          imageUrl: f.imageUrl || f.image_url,
        })),
        media: full.media,
        whatsappPhone: inv.customer_phone,
        ticketCode: `#${inv.public_id.slice(-6).toUpperCase()}`,
      };

      return sendSuccess(res, payload);
    } catch (err) {
      next(err);
    }
  },

  async updateCustomLocations(req, res, next) {
    try {
      const { publicId } = req.params;
      const { locations } = req.body;
      const result = await customerService.updateCustomLocations(publicId, req.user.customerId, locations);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async updateCustomOptions(req, res, next) {
    try {
      const { publicId } = req.params;
      const { options } = req.body;
      const result = await customerService.updateCustomOptions(publicId, req.user.customerId, options);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async publish(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.publishInvitation(publicId, req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async unpublish(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.unpublishInvitation(publicId, req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const { publicId } = req.params;
      const result = await customerService.getAnalytics(publicId, req.user.customerId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  // Catalogs
  async getTemplates(req, res, next) {
    try {
      const result = await customerService.getTemplates();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getThemes(req, res, next) {
    try {
      const result = await customerService.getThemes();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getLocations(req, res, next) {
    try {
      const result = await customerService.getLocations();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getFoodOptions(req, res, next) {
    try {
      const result = await customerService.getFoodOptions();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getGifs(req, res, next) {
    try {
      const category = req.query.category || null;
      const result = await customerService.getGifs(category);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
};
