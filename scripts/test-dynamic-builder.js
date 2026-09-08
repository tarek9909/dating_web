const API_BASE = 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
  const url = `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed (${response.status})`;
    throw new Error(`${options.method || 'GET'} ${path} => ${response.status}: ${errorMsg}`);
  }

  return data;
}

async function runDynamicBuilderTest() {
  console.log('--- Testing Dynamic Builder & Interactive Scheduler ---');

  // Step 1: Admin logs in and creates customer with customized recipient
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@platform.com', password: 'Admin123!' }),
  });
  const adminToken = adminLogin.data.accessToken;

  const timestamp = Date.now();
  const testEmail = `tarek_${timestamp}@test.lb`;
  const testName = `Tarek ${timestamp}`;
  const testRecipient = `Nour ${timestamp}`;

  console.log(`\nStep 1: Creating customer for recipient "${testRecipient}"...`);
  const createRes = await request('/admin/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phone: '+96171555444',
      recipientName: testRecipient,
    }),
  });

  const { temporaryPassword, invitation, customerId } = createRes.data;
  const publicId = invitation.publicId;
  console.log(`✓ Customer created. PublicId: ${publicId}`);

  // Step 2: Customer logs in and changes password
  console.log('\nStep 2: Customer logs in...');
  const custLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: temporaryPassword }),
  });
  const custToken = custLogin.data.accessToken;

  await request('/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      currentPassword: temporaryPassword,
      newPassword: 'MyNewPassword123!',
    }),
  });

  const activeLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'MyNewPassword123!' }),
  });
  const token = activeLogin.data.accessToken;
  console.log('✓ Customer authenticated with new password.');

  // Step 3: Customer customizes all 4 screens dynamically
  console.log('\nStep 3: Customer saves dynamic titles, subtitles, category="activity", and scheduleMode="picker"...');

  // 3a: Update Content
  await request(`/customer/invitations/${publicId}/content`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      opening_text: `Hey ${testRecipient}, I have a question...`,
      question_text: `Will you join me for our anniversary date? ❤️`,
      category_type: 'activity',
      location_title: 'Where should our romantic journey begin? ✨',
      location_subtitle: 'Choose your dream destination for tonight:',
      food_title: 'What adventure are we going on? 🎯',
      food_subtitle: 'Pick the activity you want to experience together:',
      when_title: 'Pick when you are ready 📅',
      when_subtitle: 'Select any date that fits your schedule:',
      dress_code_title: 'Dress Code Vibe 👗',
      dress_code_subtitle: 'Look adorable and bring your energy.',
      dress_code_checklist: [
        'Comfortable sneakers for walking',
        'Cute jacket for the evening breeze',
        'Your brightest smile',
      ],
      opening_gif: '/gifs/loc_skymate.gif',
      angry_gif: '/gifs/angry_strike_3.gif',
      when_gif: '/gifs/when_tomorrow.gif',
      dress_gif: '/gifs/dress_casual.gif',
      final_gif: '/gifs/final_date.gif',
    }),
  });

  // 3b: Update Invitation (Schedule mode = picker, date, time)
  await request(`/customer/invitations/${publicId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      scheduleMode: 'picker',
      dateText: 'This Saturday',
      timeValue: '19:30:00',
      dressCode: 'Smart Casual ✨',
      dressCodeText: 'Dress cute and comfortable!',
    }),
  });

  // 3c: Update Custom Locations
  console.log('Customizing locations with individual distinct GIFs...');
  await request(`/customer/invitations/${publicId}/custom-locations`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      locations: [
        { id: 1, name: 'Secret Garden Villa', description: 'Candlelit terrace surrounded by blooming jasmine.', imageUrl: '/gifs/loc_skymate.gif', tag: 'Romantic' },
        { id: 2, name: 'High Sky Rooftop', description: 'Immaculate city lights and acoustic live violin.', imageUrl: '/gifs/loc_hawana.gif', tag: 'Skyline' },
        { id: 3, name: 'Private Beach Cabana', description: 'Sound of gentle waves and stars above.', imageUrl: '/gifs/loc_jia.gif', tag: 'Seaside' },
      ],
    }),
  });

  // 3d: Update Custom Options (Activities instead of Food!)
  console.log('Customizing Step 2 options into Activities (Cinema, Bowling, Stargazing)...');
  await request(`/customer/invitations/${publicId}/custom-options`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      options: [
        { id: 1, name: 'Private Cinema Screening', description: 'Cozy beanbags, popcorn & romantic movie.', emoji: '🎬', imageUrl: '/gifs/food_sandwiches.gif' },
        { id: 2, name: 'Neon Bowling Battle', description: 'Playful competition with arcade games.', emoji: '🎳', imageUrl: '/gifs/food_italian.gif' },
        { id: 3, name: 'Telescope Stargazing', description: 'Blanket under constellations with hot cocoa.', emoji: '✨', imageUrl: '/gifs/food_lebanese.gif' },
      ],
    }),
  });

  console.log('✓ All 4 screens successfully customized via API.');

  // Step 4: Verify in Preview
  console.log('\nStep 4: Customer checks preview payload...');
  const previewRes = await request(`/customer/invitations/${publicId}/preview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const p = previewRes.data;
  console.log('Preview Verified Fields:');
  console.log(' - scheduleMode:', p.invitation.scheduleMode);
  console.log(' - categoryType:', p.content.categoryType);
  console.log(' - locationTitle:', p.content.sectionTitles?.locations);
  console.log(' - activityTitle:', p.content.sectionTitles?.food);
  console.log(' - checklist count:', p.content.dressCodeChecklist?.length);
  console.log(' - first location name:', p.locations[0]?.name);
  console.log(' - first location imageUrl:', p.locations[0]?.imageUrl);
  console.log(' - first activity name:', p.foodOptions[0]?.name);
  console.log(' - first activity emoji:', p.foodOptions[0]?.emoji);

  console.log(' - preview openingGif:', p.media?.openingGif);
  if (p.invitation.scheduleMode !== 'picker') throw new Error('Expected scheduleMode=picker');
  if (p.content.categoryType !== 'activity') throw new Error('Expected categoryType=activity');
  if (p.locations[0].name !== 'Secret Garden Villa') throw new Error('Location customization did not persist');
  if (p.foodOptions[0].name !== 'Private Cinema Screening') throw new Error('Option customization did not persist');
  if (!p.locations[0].imageUrl) throw new Error('Missing location imageUrl!');
  if (p.media?.openingGif !== '/gifs/loc_skymate.gif') throw new Error('Preview openingGif mismatch');

  // Step 5: Customer Publishes Live and Public Visitor checks
  console.log('\nStep 5: Customer publishes live...');
  const pubRes = await request(`/customer/invitations/${publicId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`✓ Published! Public slug: ${pubRes.data.slug}`);

  console.log('\nStep 6: Public visitor retrieves published invitation by slug...');
  const publicRes = await request(`/public/invitations/${pubRes.data.slug}`);
  const pubData = publicRes.data;

  console.log('Public Data Verification:');
  console.log(' - Public scheduleMode:', pubData.invitation.scheduleMode);
  console.log(' - Public categoryType:', pubData.content.categoryType);
  console.log(' - Public location 1:', pubData.locations[0].name, 'imageUrl:', pubData.locations[0].imageUrl);
  console.log(' - Public option 1:', pubData.foodOptions[0].name, 'emoji:', pubData.foodOptions[0].emoji);

  console.log(' - Public openingGif:', pubData.media?.openingGif);
  if (pubData.invitation.scheduleMode !== 'picker') throw new Error('Public scheduleMode mismatch');
  if (pubData.content.categoryType !== 'activity') throw new Error('Public categoryType mismatch');
  if (pubData.locations[0].name !== 'Secret Garden Villa') throw new Error('Public location name mismatch');
  if (pubData.foodOptions[0].name !== 'Private Cinema Screening') throw new Error('Public option name mismatch');
  if (pubData.media?.openingGif !== '/gifs/loc_skymate.gif') throw new Error('Public openingGif mismatch');

  console.log('\n================================================================');
  console.log('🎉 100% DYNAMIC BUILDER & INTERACTIVE SCHEDULER VERIFIED! 🎉');
  console.log('================================================================');
}

runDynamicBuilderTest().catch((err) => {
  console.error('\n❌ Dynamic builder test failed:', err.message);
  process.exit(1);
});
