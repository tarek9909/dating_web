/**
 * End-to-End System Test
 * Exercises the entire customer lifecycle:
 * 1. Visitor submits request
 * 2. Admin logs in
 * 3. Admin records manual payment
 * 4. Admin activates customer account (atomic transaction)
 * 5. Customer logs in with temporary password
 * 6. Customer updates temporary password
 * 7. Customer edits invitation content & schedule
 * 8. Customer publishes invitation
 * 9. Public visitor views invitation via /d/:slug
 * 10. Public visitor records RSVP event
 */

import http from 'http';
import app from '../backend/src/app.js';
import { pool } from '../backend/src/db/pool.js';


async function runE2ETest() {
  console.log('--- Starting Complete Platform E2E Lifecycle Test ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3099, resolve));
  const baseUrl = 'http://127.0.0.1:3099/api/v1';

  try {
    // 1. Submit Visitor Request
    console.log('\nStep 1: Visitor Submits Invitation Request...');
    const timestamp = Date.now();
    const reqRes = await fetch(`${baseUrl}/public/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Romeo Montague ${timestamp}`,
        email: `romeo_${timestamp}@verona.it`,
        phone: '+96171999888',
        recipientName: 'Juliet Capulet',
        notes: 'Stargazing on balcony with Italian dinner'
      })
    });
    const reqData = await reqRes.json();
    console.log('Response:', reqData);
    if (!reqData.success) throw new Error('Failed to submit request');
    const requestId = reqData.data.requestId;
    console.log(`✓ Request created with ID: ${requestId}`);

    // 2. Admin Logs In
    console.log('\nStep 2: Admin Logs In...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@platform.com',
        password: 'Admin123!'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success) throw new Error('Admin login failed');
    const adminToken = adminLoginData.data.accessToken;
    console.log('✓ Admin authenticated successfully.');

    // 3. Admin Records Payment
    console.log('\nStep 3: Admin Records Manual Payment...');
    const paymentRes = await fetch(`${baseUrl}/admin/requests/${requestId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        amount: 25.00,
        currency: 'USD',
        paymentMethod: 'cash',
        referenceNumber: `REC-${timestamp}`,
        notes: 'Cash received at office'
      })
    });
    const paymentData = await paymentRes.json();
    console.log('Response:', paymentData);
    if (!paymentData.success) throw new Error('Failed to record payment');
    console.log('✓ Payment recorded successfully.');

    // 4. Admin Activates Account
    console.log('\nStep 4: Admin Activates Customer Account (Atomic Transaction)...');
    const activateRes = await fetch(`${baseUrl}/admin/requests/${requestId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const activateData = await activateRes.json();
    console.log('Activation Response:', activateData);
    if (!activateData.success) throw new Error('Failed to activate customer');
    const customerEmail = activateData.data.email || activateData.data.credentials?.email;
    const temporaryPassword = activateData.data.temporaryPassword || activateData.data.credentials?.temporaryPassword;
    console.log(`✓ Customer activated. Email: ${customerEmail}, TempPass: ${temporaryPassword}`);


    // 5. Customer Logs In with Temporary Password
    console.log('\nStep 5: Customer Logs In with Temporary Password...');
    const customerLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: temporaryPassword
      })
    });
    const customerLoginData = await customerLoginRes.json();
    console.log('Customer Login Response:', customerLoginData);
    if (!customerLoginData.success) throw new Error('Customer login failed');
    if (!customerLoginData.data.user?.mustChangePassword) throw new Error('Expected mustChangePassword=true');
    let customerToken = customerLoginData.data.accessToken;
    console.log('✓ Customer logged in. mustChangePassword is correctly true.');


    // 6. Customer Updates Temporary Password
    console.log('\nStep 6: Customer Changes Password...');
    const changePassRes = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        currentPassword: temporaryPassword,
        newPassword: 'MySecurePassword2026!'
      })
    });
    const changePassData = await changePassRes.json();
    console.log('Change Password Response:', changePassData);
    if (!changePassData.success) throw new Error('Failed to change password');
    console.log('✓ Customer password changed successfully.');

    console.log('\nStep 6.5: Customer Logs In with New Password...');
    const reLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'MySecurePassword2026!'
      })
    });
    const reLoginData = await reLoginRes.json();
    if (!reLoginData.success) throw new Error('Re-login failed');
    customerToken = reLoginData.data.accessToken;
    console.log('✓ Logged in with new password.');

    // 7. Customer Retrieves & Updates Invitation
    console.log('\nStep 7: Customer Retrieves Invitation...');
    const invRes = await fetch(`${baseUrl}/customer/invitations`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    console.log('Inv Response Status:', invRes.status);
    const invText = await invRes.text();
    console.log('Inv Response Body:', invText);
    const invData = JSON.parse(invText);
    const firstInv = Array.isArray(invData.data) ? invData.data[0] : (invData.data?.invitations?.[0] || invData.data);
    const publicId = firstInv.public_id || firstInv.publicId;
    console.log('Invitation Data:', publicId, firstInv.status, firstInv.recipient_name);


    console.log('\nStep 8: Customer Customizes Invitation Content & Date...');
    const updateContentRes = await fetch(`${baseUrl}/customer/invitations/${publicId}/content`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        opening_text: 'Fair Juliet, by yonder blessed moon...',
        question_text: 'Shall we partake in dinner under the stars tonight? ❤️',
        yes_button_text: 'Thy wish is my command ❤️',
        no_button_text: 'Parting is such sweet sorrow'
      })
    });
    const updateContentData = await updateContentRes.json();
    console.log('Update Content Response:', updateContentData);
    if (!updateContentData.success) throw new Error('Failed to update content');

    const updateDateRes = await fetch(`${baseUrl}/customer/invitations/${publicId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        dateText: 'This Friday Night',
        timeValue: '7:30 PM'
      })
    });
    const updateDateData = await updateDateRes.json();
    console.log('Update Date Response:', updateDateData);
    if (!updateDateData.success) throw new Error('Failed to update date');
    console.log('✓ Invitation customized.');


    // 8. Customer Publishes Invitation
    console.log('\nStep 9: Customer Publishes Invitation...');
    const pubRes = await fetch(`${baseUrl}/customer/invitations/${publicId}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const pubData = await pubRes.json();
    console.log('Publish Response:', pubData);
    if (!pubData.success) throw new Error('Failed to publish invitation');
    const slug = pubData.data.slug;
    console.log(`✓ Invitation published live! Slug: ${slug}`);

    // 9. Public Visitor Accesses Invitation via /d/:slug
    console.log('\nStep 10: Public Visitor Loads Invitation by Slug...');
    const publicGetRes = await fetch(`${baseUrl}/public/invitations/${slug}`);
    const publicGetData = await publicGetRes.json();
    console.log('Public Invitation Data:', {
      slug: publicGetData.data.invitation.slug,
      recipient: publicGetData.data.invitation.recipientName,
      question: publicGetData.data.content.questionText,
      date: publicGetData.data.invitation.date.text,
      locationsCount: publicGetData.data.locations.length,
      foodCount: publicGetData.data.foodOptions.length
    });
    if (!publicGetData.success) throw new Error('Failed to get public invitation');
    if (publicGetData.data.invitation.recipientName !== 'Juliet Capulet') throw new Error('Recipient mismatch');
    console.log('✓ Public invitation rendered with dynamic customized data.');

    // 10. Public Visitor Dispatches Analytics Events
    console.log('\nStep 11: Public Visitor Dispatches Events (view, yes_click, rsvp_complete)...');
    await fetch(`${baseUrl}/public/invitations/${slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'view', eventData: { referrer: null } })
    });
    await fetch(`${baseUrl}/public/invitations/${slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'yes_click' })
    });
    const rsvpEventRes = await fetch(`${baseUrl}/public/invitations/${slug}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'rsvp_complete',
        eventData: { location: 'Balcony', food: 'Italian' }
      })
    });
    const rsvpEventData = await rsvpEventRes.json();
    console.log('RSVP Event Response:', rsvpEventData);
    if (!rsvpEventData.success) throw new Error('Failed to record event');
    console.log('✓ Analytics events logged successfully.');

    // 11. Verify Analytics in Customer Dashboard
    console.log('\nStep 12: Customer Checks Analytics Summary...');
    const analyticsRes = await fetch(`${baseUrl}/customer/invitations/${publicId}/analytics`, {
      headers: { 'Authorization': `Bearer ${customerToken}` }
    });
    const analyticsData = await analyticsRes.json();
    console.log('Customer Analytics Summary:', analyticsData.data);
    if (!analyticsData.data || analyticsData.data.rsvps < 1) throw new Error('RSVP event missing from analytics');
    console.log('✓ Analytics verified in Customer Dashboard.');



    console.log('\n========================================');
    console.log('🎉 ALL END-TO-END E2E CHECKS PASSED! 🎉');
    console.log('========================================\n');
  } finally {
    server.close();
    await pool.end();
  }
}

runE2ETest().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
