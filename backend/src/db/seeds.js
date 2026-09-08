import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

async function runSeeds() {
  console.log('--- Starting Database Seeding ---');

  const dbConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
  });

  try {
    // 1. Seed Default Admin User
    console.log('Seeding default Admin user...');
    const adminEmail = 'admin@platform.com';
    const [existingAdmins] = await dbConn.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      await dbConn.execute(
        `INSERT INTO users (email, username, password_hash, role, status, must_change_password)
         VALUES (?, ?, ?, 'admin', 'active', FALSE)`,
        [adminEmail, 'admin', passwordHash]
      );
      console.log('Default admin created: admin@platform.com / Admin123!');
    } else {
      console.log('Default admin already exists.');
    }

    // 2. Seed Default Theme: Romantic Velvet
    console.log('Seeding Default Theme...');
    const [existingThemes] = await dbConn.execute('SELECT id FROM themes WHERE slug = ?', ['romantic-velvet']);
    let themeId;

    if (existingThemes.length === 0) {
      const [res] = await dbConn.execute(
        `INSERT INTO themes (name, slug, description, primary_color, secondary_color, background_color, text_color, font_family, configuration, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          'Romantic Velvet',
          'romantic-velvet',
          'Deep burgundy luxury velvet palette with glowing rose accents and glassmorphism',
          '#ff4d6d',
          '#ff758f',
          '#0f0207',
          '#ffffff',
          'Outfit',
          JSON.stringify({
            wine: '#220412',
            burgundy: '#3a0820',
            cardBg: 'rgba(35, 8, 22, 0.72)',
            borderSubtle: 'rgba(255, 180, 200, 0.18)',
            borderActive: 'rgba(255, 77, 109, 0.65)',
            glowPink: '0 0 25px rgba(255, 77, 109, 0.45)',
          })
        ]
      );
      themeId = res.insertId;
      console.log('Romantic Velvet theme created (ID:', themeId, ')');
    } else {
      themeId = existingThemes[0].id;
      console.log('Romantic Velvet theme already exists (ID:', themeId, ')');
    }

    // 3. Seed Default Template: Romantic Date Night
    console.log('Seeding Default Template...');
    const [existingTemplates] = await dbConn.execute('SELECT id FROM templates WHERE slug = ?', ['romantic-date-night']);
    let templateId;

    if (existingTemplates.length === 0) {
      const [res] = await dbConn.execute(
        `INSERT INTO templates (theme_id, name, slug, description, preview_image_url, default_configuration, active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, 1)`,
        [
          themeId,
          'Romantic Date Night',
          'romantic-date-night',
          'The playful runaway NO button, strike 3 angry alert, date planning, and WhatsApp RSVP ticket',
          '/gifs/final_date.gif',
          JSON.stringify({
            sections: ['invitation', 'location', 'food', 'when', 'dress_code', 'final'],
            allowSound: true,
            allowParticles: true,
          })
        ]
      );
      templateId = res.insertId;
      console.log('Romantic Date Night template created (ID:', templateId, ')');

      // 4. Seed Template Content
      await dbConn.execute(
        `INSERT INTO template_content (
          template_id, opening_text, question_text, yes_button_text, no_button_text,
          no_phrase_1, no_phrase_2, no_phrase_3,
          angry_title, angry_message, angry_button,
          location_title, food_title, when_title, dress_code_title,
          final_title, final_message
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          templateId,
          'I have a very important question for you…',
          'Will you go on a date with me? ❤️',
          'YES ❤️',
          'NO 🙄',
          'Nice try 😏',
          'Too slow!',
          'Error 404: No not found 💅',
          'EXCUSE ME?! 😤',
          'You have pressed NO THREE TIMES. I am starting to take this personally. 😭💔',
          'Okay okay… ❤️',
          'Okay… since you said YES 😌❤️ Where are we heading?',
          'And what are we eating?',
          'When? ⏰',
          'What should you wear? 👕',
          'IT\'S A DATE. ❤️',
          'Congratulations. You have successfully agreed to go on a date with me. 😂❤️'
        ]
      );
      console.log('Template content seeded.');
    } else {
      templateId = existingTemplates[0].id;
      console.log('Romantic Date Night template already exists.');
    }

    // 5. Seed Global Locations
    console.log('Seeding Global Locations...');
    const defaultLocations = [
      { name: 'Fancy', category: 'Fine Dining', description: 'Boujee, elegant, and dress-to-impress energy.', emoji: '✨', imageUrl: '/gifs/loc_skymate.gif', sortOrder: 1 },
      { name: 'Rooftop', category: 'Nightlife', description: 'City lights, cool night breeze, and atmospheric skyline views.', emoji: '🌃', imageUrl: '/gifs/loc_hawana.gif', sortOrder: 2 },
      { name: 'Beach', category: 'Coastal', description: 'Gentle waves, scenic coastal breeze, and relaxed romance.', emoji: '🌊', imageUrl: '/gifs/loc_jia.gif', sortOrder: 3 },
    ];

    for (const loc of defaultLocations) {
      const [exists] = await dbConn.execute('SELECT id FROM locations WHERE name = ?', [loc.name]);
      if (exists.length === 0) {
        await dbConn.execute(
          `INSERT INTO locations (name, category, description, emoji, image_url, active, sort_order)
           VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
          [loc.name, loc.category, loc.description, loc.emoji, loc.imageUrl, loc.sortOrder]
        );
        console.log(` - Location ${loc.name} seeded.`);
      }
    }

    // 6. Seed Global Food Options
    console.log('Seeding Global Food Options...');
    const defaultFoods = [
      { name: 'Lebanese 🇱🇧', description: 'Hummus, grilled skewers, and elite hospitality. “Because we have taste.”', emoji: '🇱🇧', imageUrl: '/gifs/food_lebanese.gif', sortOrder: 1 },
      { name: 'Italian 🇮🇹', description: 'Creamy pasta, warm bread, and maximum comfort. “A little pasta never hurt anyone. 🍝”', emoji: '🍝', imageUrl: '/gifs/food_italian.gif', sortOrder: 2 },
      { name: 'Sandwiches 🥪', description: 'Chill, effortless, and undeniably delicious. “Keeping it simple 😌”', emoji: '🥪', imageUrl: '/gifs/food_sandwiches.gif', sortOrder: 3 },
    ];

    for (const food of defaultFoods) {
      const [exists] = await dbConn.execute('SELECT id FROM food_options WHERE name = ?', [food.name]);
      if (exists.length === 0) {
        await dbConn.execute(
          `INSERT INTO food_options (name, description, emoji, image_url, active, sort_order)
           VALUES (?, ?, ?, ?, TRUE, ?)`,
          [food.name, food.description, food.emoji, food.imageUrl, food.sortOrder]
        );
        console.log(` - Food option ${food.name} seeded.`);
      }
    }

    // 7. Seed Media Assets & GIF Library
    console.log('Seeding Global GIF Library...');
    const defaultGifs = [
      { name: 'Cute Pleading Hero Cat', category: 'cute', url: '/gifs/invitation_pleading.gif' },
      { name: 'Strike 3 Angry Cat', category: 'angry', url: '/gifs/angry_strike_3.gif' },
      { name: 'Fancy Wine Cat', category: 'romantic', url: '/gifs/loc_skymate.gif' },
      { name: 'Cool Cat Sunglasses', category: 'funny', url: '/gifs/loc_hawana.gif' },
      { name: 'Beach Lounging Cat', category: 'cute', url: '/gifs/loc_jia.gif' },
      { name: 'Eating Cat Feast', category: 'funny', url: '/gifs/food_lebanese.gif' },
      { name: 'Pasta Eating Cat', category: 'cute', url: '/gifs/food_italian.gif' },
      { name: 'Sandwich Hamster', category: 'cute', url: '/gifs/food_sandwiches.gif' },
      { name: 'Clock Changing Cat', category: 'funny', url: '/gifs/when_tomorrow.gif' },
      { name: 'Casual Hoodie Cat', category: 'cute', url: '/gifs/dress_casual.gif' },
      { name: 'Celebration Dance Cat', category: 'celebration', url: '/gifs/final_date.gif' },
    ];

    for (const g of defaultGifs) {
      const [exists] = await dbConn.execute('SELECT id FROM media_assets WHERE file_url = ?', [g.url]);
      let assetId;
      if (exists.length === 0) {
        const [assetRes] = await dbConn.execute(
          `INSERT INTO media_assets (visibility, media_type, mime_type, original_filename, file_url, active)
           VALUES ('global', 'gif', 'image/gif', ?, ?, TRUE)`,
          [g.name, g.url]
        );
        assetId = assetRes.insertId;
        await dbConn.execute(
          `INSERT INTO gif_library (media_asset_id, name, category, active)
           VALUES (?, ?, ?, TRUE)`,
          [assetId, g.name, g.category]
        );
        console.log(` - GIF ${g.name} seeded.`);
      }
    }

    // 9. Seed Default Live Demo Invitation (/d/dana)
    console.log('Seeding Live Demo Invitation (/d/dana)...');
    const [existingDana] = await dbConn.execute('SELECT id FROM invitations WHERE slug = ?', ['dana']);
    if (existingDana.length === 0) {
      let demoCustId;
      const [existingCust] = await dbConn.execute('SELECT id FROM customers WHERE email = ?', ['karim@dana.love']);
      if (existingCust.length > 0) {
        demoCustId = existingCust[0].id;
      } else {
        const [custRes] = await dbConn.execute(
          `INSERT INTO customers (full_name, phone, email, status)
           VALUES ('Karim', '+96171273152', 'karim@dana.love', 'active')`
        );
        demoCustId = custRes.insertId;
      }

      let demoUserId;
      const [existingUser] = await dbConn.execute('SELECT id FROM users WHERE email = ?', ['karim@dana.love']);
      if (existingUser.length > 0) {
        demoUserId = existingUser[0].id;
      } else {
        const demoPasswordHash = await bcrypt.hash('Dana2026!', 10);
        const [userRes] = await dbConn.execute(
          `INSERT INTO users (customer_id, email, username, password_hash, role, status, must_change_password)
           VALUES (?, 'karim@dana.love', 'karim', ?, 'customer', 'active', FALSE)`,
          [demoCustId, demoPasswordHash]
        );

        demoUserId = userRes.insertId;
      }

      const [danaInvRes] = await dbConn.execute(
        `INSERT INTO invitations (
          public_id, customer_id, created_by_user_id, template_id, theme_id,
          internal_title, slug, recipient_name, date_type, date_text, time_value, timezone,
          dress_code, dress_code_text, status, published_at
        ) VALUES (
          '01DANA00000000000000000001', ?, ?, ?, ?,
          'Official Date Proposal for Dana', 'dana', 'Dana', 'tomorrow', 'Tomorrow', '18:00:00', 'Asia/Beirut',
          'Casual', 'Nothing too serious. Just look cute.', 'published', NOW()
        )`,
        [demoCustId, demoUserId, templateId, themeId]
      );
      const danaInvId = danaInvRes.insertId;

      await dbConn.execute(
        `INSERT INTO invitation_content (
          invitation_id, opening_text, question_text, yes_button_text, no_button_text,
          no_phrase_1, no_phrase_2, no_phrase_3,
          angry_title, angry_message, angry_button,
          location_title, food_title, when_title, dress_code_title,
          final_title, final_message
        ) VALUES (
          ?, 'I have a very important question for you…', 'Will you go on a date with me? ❤️',
          'YES ❤️', 'NO', 'Nice try 😏', 'Too slow!', 'Error 404: No not found 💅',
          'EXCUSE ME?! 😤', 'You have pressed NO THREE TIMES. I am starting to take this personally. 😭💔', 'Okay okay… ❤️',
          'Okay… since you said YES 😌❤️ Where are we heading?', 'And what are we eating?',
          'When? ⏰', 'What should we wear? 👕',
          'IT\\'S A DATE. ❤️', 'Congratulations. You have successfully agreed to go on a date with me. 😂❤️'
        )`,
        [danaInvId]
      );

      // Link locations and foods
      await dbConn.execute(
        `INSERT INTO invitation_locations (invitation_id, location_id, sort_order)
         VALUES (?, 1, 1), (?, 2, 2), (?, 3, 3)`,
        [danaInvId, danaInvId, danaInvId]
      );

      await dbConn.execute(
        `INSERT INTO invitation_food_options (invitation_id, food_option_id, sort_order)
         VALUES (?, 1, 1), (?, 2, 2), (?, 3, 3)`,
        [danaInvId, danaInvId, danaInvId]
      );

      console.log('✓ Default live invitation seeded at /d/dana');
    }



  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await dbConn.end();
  }

  console.log('--- Database Seeding Complete ---');
}

runSeeds();
