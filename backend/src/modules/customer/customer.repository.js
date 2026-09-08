import { pool } from '../../db/pool.js';

export const customerRepository = {
  async getDashboard(customerId) {
    const [invitations] = await pool.execute(
      `SELECT i.*, 
              (SELECT COUNT(*) FROM invitation_events e WHERE e.invitation_id = i.id AND e.event_type = 'view') AS total_views,
              (SELECT COUNT(*) FROM invitation_events e WHERE e.invitation_id = i.id AND e.event_type = 'rsvp_complete') AS total_rsvps
       FROM invitations i
       WHERE i.customer_id = ?
       ORDER BY i.created_at DESC`,
      [customerId]
    );

    return {
      invitations,
      totalInvitations: invitations.length,
    };
  },

  async getInvitationsByCustomer(customerId) {
    const [rows] = await pool.execute(
      `SELECT i.*, t.name AS template_name, th.name AS theme_name
       FROM invitations i
       LEFT JOIN templates t ON i.template_id = t.id
       LEFT JOIN themes th ON i.theme_id = th.id
       WHERE i.customer_id = ?
       ORDER BY i.created_at DESC`,
      [customerId]
    );
    return rows;
  },

  async getInvitationFull(publicId, customerId = null) {
    let sql = `
      SELECT i.*, 
             c.full_name AS customer_name, c.phone AS customer_phone, c.email AS customer_email,
             th.name AS theme_name, th.primary_color, th.secondary_color, th.background_color, th.text_color, th.font_family, th.configuration AS theme_config,
             t.name AS template_name, t.slug AS template_slug
      FROM invitations i
      JOIN customers c ON i.customer_id = c.id
      LEFT JOIN themes th ON i.theme_id = th.id
      LEFT JOIN templates t ON i.template_id = t.id
      WHERE i.public_id = ?`;
    const params = [publicId];

    if (customerId) {
      sql += ' AND i.customer_id = ?';
      params.push(customerId);
    }

    const [rows] = await pool.execute(sql, params);
    if (rows.length === 0) return null;

    const inv = rows[0];

    // Fetch invitation content
    const [contents] = await pool.execute(
      'SELECT * FROM invitation_content WHERE invitation_id = ?',
      [inv.id]
    );
    const content = contents[0] || {};

    // Fetch locations
    const [locations] = await pool.execute(
      `SELECT l.id, 
              COALESCE(il.custom_name, l.name) AS name,
              l.category,
              COALESCE(il.custom_description, l.description) AS description,
              l.emoji,
              COALESCE(il.custom_image_url, l.image_url) AS image_url,
              COALESCE(il.custom_image_url, l.image_url) AS imageUrl,
              il.sort_order
       FROM invitation_locations il
       JOIN locations l ON il.location_id = l.id
       WHERE il.invitation_id = ?
       ORDER BY il.sort_order ASC`,
      [inv.id]
    );

    // Fetch food options
    const [foods] = await pool.execute(
      `SELECT f.id, 
              COALESCE(ifo.custom_name, f.name) AS name,
              COALESCE(ifo.custom_description, f.description) AS description,
              COALESCE(ifo.custom_emoji, f.emoji) AS emoji,
              COALESCE(ifo.custom_image_url, f.image_url) AS image_url,
              COALESCE(ifo.custom_image_url, f.image_url) AS imageUrl,
              ifo.sort_order
       FROM invitation_food_options ifo
       JOIN food_options f ON ifo.food_option_id = f.id
       WHERE ifo.invitation_id = ?
       ORDER BY ifo.sort_order ASC`,
      [inv.id]
    );

    // Fetch assigned media slots
    const [mediaRows] = await pool.execute(
      `SELECT im.slot, ma.id AS asset_id, ma.media_type, ma.file_url, ma.original_filename
       FROM invitation_media im
       JOIN media_assets ma ON im.media_asset_id = ma.id
       WHERE im.invitation_id = ?`,
      [inv.id]
    );

    const mediaMap = {};
    mediaRows.forEach((m) => {
      mediaMap[m.slot] = {
        assetId: m.asset_id,
        type: m.media_type,
        url: m.file_url,
      };
    });

    if (content.opening_gif) mediaMap.hero = { url: content.opening_gif };
    if (content.angry_gif) mediaMap.angry = { url: content.angry_gif };
    if (content.when_gif) mediaMap.when = { url: content.when_gif };
    if (content.dress_gif) mediaMap.dress = { url: content.dress_gif };
    if (content.final_gif) mediaMap.final = { url: content.final_gif };
    mediaMap.openingGif = content.opening_gif || mediaMap.hero?.url;
    mediaMap.angryGif = content.angry_gif || mediaMap.angry?.url;
    mediaMap.whenGif = content.when_gif || mediaMap.when?.url;
    mediaMap.dressGif = content.dress_gif || mediaMap.dress?.url;
    mediaMap.finalGif = content.final_gif || mediaMap.final?.url;

    if (content.dress_code_checklist && typeof content.dress_code_checklist === 'string') {
      try {
        content.dress_code_checklist = JSON.parse(content.dress_code_checklist);
      } catch {
        // Keep as string
      }
    }

    return {
      invitation: inv,
      content,
      theme: {
        id: inv.theme_id || 1,
        name: inv.theme_name || 'Romantic Velvet',
        primaryColor: inv.primary_color || '#ff4d6d',
        secondaryColor: inv.secondary_color || '#ff758f',
        backgroundColor: inv.background_color || '#0f0207',
        textColor: inv.text_color || '#ffffff',
        fontFamily: inv.font_family || 'Outfit',
        configuration: inv.theme_config || null,
      },
      locations,
      foodOptions: foods,
      media: mediaMap,
    };
  },

  async updateInvitationDetails(invitationId, { recipientName, dateType, scheduleMode, dateValue, dateText, timeValue, timezone, dressCode, dressCodeText, internalTitle, themeId }) {
    await pool.execute(
      `UPDATE invitations
       SET recipient_name = COALESCE(?, recipient_name),
           date_type = COALESCE(?, date_type),
           schedule_mode = COALESCE(?, schedule_mode),
           date_value = COALESCE(?, date_value),
           date_text = COALESCE(?, date_text),
           time_value = COALESCE(?, time_value),
           timezone = COALESCE(?, timezone),
           dress_code = COALESCE(?, dress_code),
           dress_code_text = COALESCE(?, dress_code_text),
           internal_title = COALESCE(?, internal_title),
           theme_id = COALESCE(?, theme_id)
       WHERE id = ?`,
      [
        recipientName || null, dateType || null, scheduleMode || null, dateValue || null,
        dateText || null, timeValue || null, timezone || null,
        dressCode || null, dressCodeText || null, internalTitle || null,
        themeId || null,
        invitationId
      ]
    );
  },

  async updateInvitationContent(invitationId, content) {
    const fields = [];
    const values = [];

    const allowedKeys = [
      'opening_text', 'question_text', 'yes_button_text', 'no_button_text',
      'no_phrase_1', 'no_phrase_2', 'no_phrase_3',
      'angry_title', 'angry_message', 'angry_button',
      'location_title', 'location_subtitle', 'category_type',
      'food_title', 'food_subtitle', 'when_title', 'when_subtitle',
      'dress_code_title', 'dress_code_subtitle', 'dress_code_checklist',
      'opening_gif', 'angry_gif', 'when_gif', 'dress_gif', 'final_gif',
      'final_title', 'final_message', 'theme_accent_color'
    ];

    allowedKeys.forEach((k) => {
      if (content[k] !== undefined) {
        fields.push(`${k} = ?`);
        if (k === 'dress_code_checklist' && typeof content[k] !== 'string' && content[k] !== null) {
          values.push(JSON.stringify(content[k]));
        } else {
          values.push(content[k]);
        }
      }
    });

    if (fields.length > 0) {
      values.push(invitationId);
      await pool.execute(
        `UPDATE invitation_content SET ${fields.join(', ')} WHERE invitation_id = ?`,
        values
      );
    }
  },

  async updateCustomLocations(invitationId, locations) {
    for (const loc of locations) {
      if (loc.id) {
        await pool.execute(
          `UPDATE invitation_locations
           SET custom_name = ?, custom_description = ?, custom_image_url = ?
           WHERE invitation_id = ? AND location_id = ?`,
          [loc.name || null, loc.description || null, loc.imageUrl || loc.image_url || null, invitationId, loc.id]
        );
      }
    }
  },

  async updateCustomOptions(invitationId, options) {
    for (const opt of options) {
      if (opt.id) {
        await pool.execute(
          `UPDATE invitation_food_options
           SET custom_name = ?, custom_description = ?, custom_image_url = ?, custom_emoji = ?
           WHERE invitation_id = ? AND food_option_id = ?`,
          [opt.name || null, opt.description || null, opt.imageUrl || opt.image_url || null, opt.emoji || null, invitationId, opt.id]
        );
      }
    }
  },

  async setLocations(invitationId, locationIds) {
    await pool.execute('DELETE FROM invitation_locations WHERE invitation_id = ?', [invitationId]);
    for (let i = 0; i < locationIds.length; i++) {
      await pool.execute(
        'INSERT INTO invitation_locations (invitation_id, location_id, sort_order) VALUES (?, ?, ?)',
        [invitationId, locationIds[i], i + 1]
      );
    }
  },

  async setFoodOptions(invitationId, foodOptionIds) {
    await pool.execute('DELETE FROM invitation_food_options WHERE invitation_id = ?', [invitationId]);
    for (let i = 0; i < foodOptionIds.length; i++) {
      await pool.execute(
        'INSERT INTO invitation_food_options (invitation_id, food_option_id, sort_order) VALUES (?, ?, ?)',
        [invitationId, foodOptionIds[i], i + 1]
      );
    }
  },

  async assignMediaSlot(invitationId, mediaAssetId, slot) {
    await pool.execute(
      `INSERT INTO invitation_media (invitation_id, media_asset_id, slot)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE media_asset_id = VALUES(media_asset_id)`,
      [invitationId, mediaAssetId, slot]
    );
  },

  async removeMediaSlot(invitationId, slot) {
    await pool.execute(
      'DELETE FROM invitation_media WHERE invitation_id = ? AND slot = ?',
      [invitationId, slot]
    );
  },

  async createMediaAsset({ customerId, invitationId, userId, visibility, mediaType, mimeType, originalFilename, fileUrl, fileSizeBytes }) {
    const [res] = await pool.execute(
      `INSERT INTO media_assets (customer_id, invitation_id, uploaded_by_user_id, visibility, media_type, mime_type, original_filename, file_url, file_size_bytes, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [customerId, invitationId, userId, visibility, mediaType, mimeType, originalFilename, fileUrl, fileSizeBytes]
    );
    return res.insertId;
  },

  async setPublishStatus(invitationId, status) {
    let sql = 'UPDATE invitations SET status = ?';
    const params = [status];

    if (status === 'published') {
      sql += ', published_at = CURRENT_TIMESTAMP';
    }

    sql += ' WHERE id = ?';
    params.push(invitationId);

    await pool.execute(sql, params);
  },

  async getAnalytics(invitationId) {
    const [rows] = await pool.execute(
      `SELECT event_type, COUNT(*) AS count
       FROM invitation_events
       WHERE invitation_id = ?
       GROUP BY event_type`,
      [invitationId]
    );

    const counts = {
      views: 0,
      yesClicks: 0,
      noClicks: 0,
      locationSelects: 0,
      foodSelects: 0,
      shares: 0,
      rsvps: 0,
    };

    rows.forEach((r) => {
      if (r.event_type === 'view') counts.views = r.count;
      else if (r.event_type === 'yes_click') counts.yesClicks = r.count;
      else if (r.event_type === 'no_click') counts.noClicks = r.count;
      else if (r.event_type === 'location_select') counts.locationSelects = r.count;
      else if (r.event_type === 'food_select') counts.foodSelects = r.count;
      else if (r.event_type === 'share_click') counts.shares = r.count;
      else if (r.event_type === 'rsvp_complete') counts.rsvps = r.count;
    });

    return counts;
  },

  // Library catalogs
  async getTemplates() {
    const [rows] = await pool.execute('SELECT * FROM templates WHERE active = TRUE ORDER BY sort_order ASC');
    return rows;
  },

  async getThemes() {
    const [rows] = await pool.execute('SELECT * FROM themes WHERE active = TRUE');
    return rows;
  },

  async getLocations() {
    const [rows] = await pool.execute('SELECT * FROM locations WHERE active = TRUE ORDER BY sort_order ASC');
    return rows;
  },

  async getFoodOptions() {
    const [rows] = await pool.execute('SELECT * FROM food_options WHERE active = TRUE ORDER BY sort_order ASC');
    return rows;
  },

  async getGifs(category = null) {
    let sql = `
      SELECT g.*, m.file_url, m.media_type
      FROM gif_library g
      JOIN media_assets m ON g.media_asset_id = m.id
      WHERE g.active = TRUE`;
    const params = [];

    if (category) {
      sql += ' AND g.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY g.sort_order ASC';
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};
