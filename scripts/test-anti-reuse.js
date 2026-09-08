// Automated Test Suite for Anti-Reuse "Burn After RSVP" & Single-Use Protection
const BASE_URL = 'http://localhost:3000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(body.message || body.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function runAntiReuseTests() {
  console.log('================================================================');
  console.log('🛡️  TESTING ANTI-REUSE "BURN AFTER RSVP" & SINGLE-USE LOCK 🛡️');
  console.log('================================================================');

  const ts = Date.now();
  const testRecipient = `Sara ${ts}`;
  const testEmail = `sara_buyer_${ts}@test.com`;

  // Step 1: Create request, record payment, and activate account
  console.log('\nStep 1: Creating & Activating Customer for recipient "' + testRecipient + '"...');
  const reqRes = await request('/public/requests', {
    method: 'POST',
    body: JSON.stringify({
      name: `Buyer ${ts}`,
      email: testEmail,
      phone: '+96171999111',
      recipientName: testRecipient,
      notes: 'Anniversary dinner and surprise date',
    }),
  });
  const requestId = reqRes.data.requestId;

  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@platform.com', password: 'Admin123!' }),
  });
  const adminToken = adminLogin.data.accessToken;

  await request(`/admin/requests/${requestId}/payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ amount: 15, currency: 'USD', paymentMethod: 'whish' }),
  });

  const actRes = await request(`/admin/requests/${requestId}/activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const { temporaryPassword, invitation } = actRes.data;
  const publicId = invitation.publicId;

  // Step 2: Customer logs in and changes password
  console.log('Step 2: Customer authenticates and publishes invitation...');
  const custLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: temporaryPassword }),
  });
  const custToken = custLogin.data.accessToken;

  await request('/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({ currentPassword: temporaryPassword, newPassword: 'NewPassword123!' }),
  });

  const activeLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'NewPassword123!' }),
  });
  const token = activeLogin.data.accessToken;

  // Step 3: Publish invitation
  const pubRes = await request(`/customer/invitations/${publicId}/publish`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const slug = pubRes.data.slug;
  console.log(`✓ Invitation published live! Slug: ${slug}`);

  // Step 4: First visit by Sara - Link is unclimed
  console.log('\nStep 4: Visitor opens link before RSVP...');
  const firstVisit = await request(`/public/invitations/${slug}`);
  console.log(' - isClaimed before RSVP:', firstVisit.data.invitation.isClaimed);
  if (firstVisit.data.invitation.isClaimed !== false) {
    throw new Error('Expected isClaimed to be false before RSVP');
  }

  // Step 5: Sara completes the RSVP choices
  console.log('\nStep 5: Recipient accepts and seals RSVP agreement on WhatsApp...');
  await request(`/public/invitations/${slug}/events`, {
    method: 'POST',
    body: JSON.stringify({
      eventType: 'rsvp_complete',
      eventData: {
        location: 'Sky Rooftop 🌃',
        food: 'Italian Pasta 🍝',
        date: 'This Friday',
        time: '8:30 PM',
        dressCode: 'Look cute 😌✨',
        recipientName: testRecipient,
      },
    }),
  });
  console.log('✓ rsvp_complete event recorded.');

  // Step 6: Verify invitation is now PERMANENTLY CLAIMED in Public API
  console.log('\nStep 6: Public visitor re-opens the link (e.g. 2nd person or revisit)...');
  const secondVisit = await request(`/public/invitations/${slug}`);
  const invAfter = secondVisit.data.invitation;
  console.log(' - isClaimed after RSVP:', invAfter.isClaimed);
  console.log(' - claimedAt:', invAfter.claimedAt);
  console.log(' - claimedPayload location:', invAfter.claimedPayload?.location);
  console.log(' - claimedPayload food:', invAfter.claimedPayload?.food);

  if (invAfter.isClaimed !== true) {
    throw new Error('Expected isClaimed to be true after rsvp_complete!');
  }
  if (invAfter.claimedPayload?.location !== 'Sky Rooftop 🌃') {
    throw new Error('Claimed payload location mismatch!');
  }
  console.log('✓ Public link is permanently burned into Claimed Souvenir Mode!');

  // Step 7: Exploit attempt - Customer tries to edit the invitation after it is claimed
  console.log('\nStep 7: Testing Exploit Defense: Customer attempts to edit or rebrand...');
  
  // 7a: Attempt to change content
  try {
    await request(`/customer/invitations/${publicId}/content`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ opening_text: 'Trying to reuse for someone else...' }),
    });
    throw new Error('SECURITY BREACH: Customer was able to edit claimed invitation content!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✓ Blocked content edit: 403 Forbidden ("' + err.message + '")');
    } else {
      throw err;
    }
  }

  // 7b: Attempt to change locations
  try {
    await request(`/customer/invitations/${publicId}/custom-locations`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ locations: [{ id: 1, name: 'Different Venue' }] }),
    });
    throw new Error('SECURITY BREACH: Customer was able to edit claimed invitation locations!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✓ Blocked venue edit: 403 Forbidden ("' + err.message + '")');
    } else {
      throw err;
    }
  }

  // 7c: Attempt to change recipient name
  try {
    await request(`/customer/invitations/${publicId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipientName: 'Maya (New Girl)' }),
    });
    throw new Error('SECURITY BREACH: Customer was able to update claimed invitation details!');
  } catch (err) {
    if (err.status === 403) {
      console.log('✓ Blocked detail edit: 403 Forbidden ("' + err.message + '")');
    } else {
      throw err;
    }
  }

  // Step 8: Verify Customer Dashboard & Preview reflect isClaimed
  console.log('\nStep 8: Verifying Customer Dashboard & Preview response...');
  const previewRes = await request(`/customer/invitations/${publicId}/preview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(' - Preview isClaimed:', previewRes.data.invitation.isClaimed);
  if (previewRes.data.invitation.isClaimed !== true) {
    throw new Error('Expected preview to show isClaimed = true');
  }

  console.log('\n================================================================');
  console.log('🎉 100% ANTI-REUSE & SINGLE-USE PROTECTION VERIFIED! 🎉');
  console.log('================================================================');
}

runAntiReuseTests().catch((err) => {
  console.error('\n❌ Anti-reuse test failed:', err.message);
  if (err.body) console.error('Response Body:', err.body);
  process.exit(1);
});
