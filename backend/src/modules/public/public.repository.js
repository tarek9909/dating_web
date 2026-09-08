import { pool } from '../../db/pool.js';

export const publicRepository = {
  async findCustomerByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async createCustomer({ fullName, phone, email }) {
    const [res] = await pool.execute(
      `INSERT INTO customers (full_name, phone, email, status)
       VALUES (?, ?, ?, 'lead')`,
      [fullName, phone, email]
    );
    return res.insertId;
  },

  async updateCustomerContact(id, { fullName, phone }) {
    await pool.execute(
      'UPDATE customers SET full_name = ?, phone = ? WHERE id = ?',
      [fullName, phone, id]
    );
  },

  async createRequest({ customerId, recipientName, notes }) {
    const [res] = await pool.execute(
      `INSERT INTO customer_requests (customer_id, recipient_name, notes, status)
       VALUES (?, ?, ?, 'new')`,
      [customerId, recipientName, notes || null]
    );
    return res.insertId;
  },

  async getPublishedInvitationBySlug(slug) {
    const [rows] = await pool.execute(
      `SELECT i.*, 
              c.full_name AS customer_name, c.phone AS customer_phone, c.status AS customer_status,
              th.name AS theme_name, th.primary_color, th.secondary_color, th.background_color, th.text_color, th.font_family, th.configuration AS theme_config
       FROM invitations i
       JOIN customers c ON i.customer_id = c.id
       LEFT JOIN themes th ON i.theme_id = th.id
       WHERE i.slug = ? AND i.status = 'published' AND c.status = 'active'`,
      [slug]
    );

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
              COALESCE(il.custom_description, l.description) AS description,
              l.emoji,
              COALESCE(il.custom_image_url, l.image_url) AS image_url,
              COALESCE(il.custom_image_url, l.image_url) AS imageUrl,
              l.category AS tag
       FROM invitation_locations il
       JOIN locations l ON il.location_id = l.id
       WHERE il.invitation_id = ?
       ORDER BY il.sort_order ASC`,
      [inv.id]
    );

    // Fetch food / custom options
    const [foods] = await pool.execute(
      `SELECT f.id, 
              COALESCE(ifo.custom_name, f.name) AS name,
              COALESCE(ifo.custom_description, f.description) AS description,
              COALESCE(ifo.custom_emoji, f.emoji) AS emoji,
              COALESCE(ifo.custom_image_url, f.image_url) AS image_url,
              COALESCE(ifo.custom_image_url, f.image_url) AS imageUrl
       FROM invitation_food_options ifo
       JOIN food_options f ON ifo.food_option_id = f.id
       WHERE ifo.invitation_id = ?
       ORDER BY ifo.sort_order ASC`,
      [inv.id]
    );

    // Fetch assigned media slots
    const [mediaRows] = await pool.execute(
      `SELECT im.slot, ma.media_type, ma.file_url
       FROM invitation_media im
       JOIN media_assets ma ON im.media_asset_id = ma.id
       WHERE im.invitation_id = ?`,
      [inv.id]
    );

    const mediaMap = {};
    mediaRows.forEach((m) => {
      mediaMap[m.slot] = {
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

    let parsedChecklist = null;
    try {
      if (content.dress_code_checklist) {
        parsedChecklist = typeof content.dress_code_checklist === 'string'
          ? JSON.parse(content.dress_code_checklist)
          : content.dress_code_checklist;
      }
    } catch {
      parsedChecklist = null;
    }

    return {
      invitation: {
        id: inv.id,
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
        openingText: content.opening_text,
        questionText: content.question_text,
        yesButtonText: content.yes_button_text,
        noButtonText: content.no_button_text,
        noPhrases: [content.no_phrase_1, content.no_phrase_2, content.no_phrase_3].filter(Boolean),
        angry: {
          title: content.angry_title,
          message: content.angry_message,
          button: content.angry_button,
        },
        categoryType: content.category_type || 'food',
        sectionTitles: {
          locations: content.location_title,
          food: content.food_title,
          when: content.when_title,
          dressCode: content.dress_code_title,
        },
        subtitles: {
          locations: content.location_subtitle,
          food: content.food_subtitle,
          when: content.when_subtitle,
          dressCode: content.dress_code_subtitle,
        },
        dressCodeChecklist: parsedChecklist,
        final: {
          title: content.final_title,
          message: content.final_message,
        },
        themeAccentColor: content.theme_accent_color || null,
      },
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
      whatsappPhone: inv.customer_phone,
      ticketCode: `#${inv.public_id.slice(-6).toUpperCase()}`,
    };
  },

  async recordEvent({ invitationId, eventType, sessionKey, ipAddress, userAgent, eventData }) {
    await pool.execute(
      `INSERT INTO invitation_events (invitation_id, event_type, session_key, ip_hash, user_agent, event_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        invitationId,
        eventType,
        sessionKey || null,
        ipAddress ? ipAddress.slice(0, 64) : null,
        userAgent ? userAgent.slice(0, 500) : null,
        eventData ? JSON.stringify(eventData) : null,
      ]
    );

    if (eventType === 'rsvp_complete') {
      await pool.execute(
        `UPDATE invitations
         SET is_claimed = TRUE, claimed_at = NOW(), claimed_payload = ?
         WHERE id = ? AND is_claimed = FALSE`,
        [eventData ? JSON.stringify(eventData) : null, invitationId]
      );
    }
  }
};
