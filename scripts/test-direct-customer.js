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

async function runDirectCustomerTest() {
  console.log('--- Testing Direct Customer Creation by Admin ---');

  // Step 1: Admin Login
  console.log('\nStep 1: Admin logs in...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@platform.com', password: 'Admin123!' }),
  });
  const adminToken = adminLogin.data.accessToken;
  console.log('✓ Admin authenticated.');

  // Step 2: Directly create a customer
  const timestamp = Date.now();
  const testEmail = `farah_${timestamp}@love.lb`;
  const testPhone = '+96170123456';
  const testName = `Farah Haddad ${timestamp}`;
  const testRecipient = 'Rami';

  console.log(`\nStep 2: Admin directly adds customer "${testName}"...`);
  const createRes = await request('/admin/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      fullName: testName,
      email: testEmail,
      phone: testPhone,
      recipientName: testRecipient,
    }),
  });

  console.log('Create Response:', JSON.stringify(createRes, null, 2));
  const { customerId, userId, temporaryPassword, invitation } = createRes.data;
  if (!temporaryPassword || !customerId || !userId || !invitation) {
    throw new Error('Missing expected fields in direct customer creation response!');
  }
  console.log(`✓ Customer created directly! Temp password: ${temporaryPassword}, Slug: ${invitation.slug}`);

  // Step 3: Newly created customer logs in with temporary password
  console.log('\nStep 3: Customer logs in with temporary password...');
  const custLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: temporaryPassword,
    }),
  });

  console.log('Customer Login User:', custLogin.data.user);
  if (!custLogin.data.user.mustChangePassword) {
    throw new Error('Expected mustChangePassword to be true!');
  }
  const custToken = custLogin.data.accessToken;
  console.log('✓ Customer logged in successfully with mustChangePassword=true.');

  // Step 4: Customer changes password
  console.log('\nStep 4: Customer updates their password...');
  await request('/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${custToken}` },
    body: JSON.stringify({
      currentPassword: temporaryPassword,
      newPassword: 'MyNewSecretPassword2026!',
    }),
  });
  console.log('✓ Password changed successfully.');

  // Step 5: Customer logs in with new permanent password
  console.log('\nStep 5: Customer logs in with new permanent password...');
  const newLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'MyNewSecretPassword2026!',
    }),
  });
  const finalToken = newLogin.data.accessToken;

  console.log('\nStep 6: Customer fetches their starter invitation...');
  const invRes = await request('/customer/invitations', {
    method: 'GET',
    headers: { Authorization: `Bearer ${finalToken}` },
  });

  console.log('Customer Invitations Count:', invRes.data.length);
  console.log('Customer Starter Invitation:', {
    title: invRes.data[0]?.internal_title,
    recipient: invRes.data[0]?.recipient_name,
    status: invRes.data[0]?.status,
    slug: invRes.data[0]?.slug,
  });

  if (invRes.data.length === 0 || invRes.data[0].recipient_name !== testRecipient) {
    throw new Error(`Starter invitation mismatch! Expected recipient: ${testRecipient}`);
  }

  console.log('\n======================================================');
  console.log('🎉 DIRECT CUSTOMER CREATION VERIFIED SUCCESSFULLY! 🎉');
  console.log('======================================================');
}

runDirectCustomerTest().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
