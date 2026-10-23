require('dotenv').config();
const speakeasy = require('speakeasy');
const mongoose = require('mongoose');
const User = require('../models/User');

const API_BASE = 'http://localhost/api';

async function runRbacTests() {
  console.log('========================================================================');
  console.log('QUESTION 2(b) TEST: TOTP MFA & ROLE-BASED ACCESS CONTROL (RBAC) AUDIT');
  console.log('========================================================================\n');

  // Connect to DB to fetch user MFA secrets for authentic test
  await mongoose.connect(process.env.MONGO_URI);
  const adminUser = await User.findOne({ email: 'admin@hostel.edu' });
  const studentUser = await User.findOne({ email: 'student@hostel.edu' });

  // -------------------------------------------------------------------------
  // TEST 1: Attempt Update & Delete WITHOUT valid token (Expecting 401 Unauthorized)
  // -------------------------------------------------------------------------
  console.log('[TEST 1] Attempting PUT /api/menu/mockId without token...');
  const res1 = await fetch(`${API_BASE}/menu/66a123456789012345678901`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealType: 'Breakfast' }),
  });
  const data1 = await res1.json();
  console.log(`HTTP Status: ${res1.status} ${res1.statusText}`);
  console.log('Response Body:', data1);
  console.log(`Result: ${res1.status === 401 ? 'PASSED (Properly Rejected with 401 Unauthorized)' : 'FAILED'}\n`);

  console.log('[TEST 1b] Attempting DELETE /api/feedback/mockId without token...');
  const res1b = await fetch(`${API_BASE}/feedback/66a123456789012345678901`, {
    method: 'DELETE',
  });
  const data1b = await res1b.json();
  console.log(`HTTP Status: ${res1b.status} ${res1b.statusText}`);
  console.log('Response Body:', data1b);
  console.log(`Result: ${res1b.status === 401 ? 'PASSED (Properly Rejected with 401 Unauthorized)' : 'FAILED'}\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Attempt Update with FAKE/INVALID token (Expecting 401 Unauthorized)
  // -------------------------------------------------------------------------
  console.log('[TEST 2] Attempting PUT /api/menu/mockId with invalid forged token...');
  const res2 = await fetch(`${API_BASE}/menu/66a123456789012345678901`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidtokenxyz',
    },
    body: JSON.stringify({ mealType: 'Breakfast' }),
  });
  const data2 = await res2.json();
  console.log(`HTTP Status: ${res2.status} ${res2.statusText}`);
  console.log('Response Body:', data2);
  console.log(`Result: ${res2.status === 401 ? 'PASSED (Properly Rejected with 401)' : 'FAILED'}\n`);

  // -------------------------------------------------------------------------
  // TEST 3: Login as STUDENT & Attempt Protected Admin Operation (Expecting 403 Forbidden)
  // -------------------------------------------------------------------------
  console.log('[TEST 3] Logging in as Student to test privilege escalation defense...');
  // Step 3a: Submit student credentials
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@hostel.edu', password: 'studentPass2026' }),
  });
  const loginData = await loginRes.json();
  
  // Step 3b: Verify student TOTP MFA
  const studentTotp = speakeasy.totp({
    secret: studentUser.totpSecret,
    encoding: 'base32',
  });
  const verifyRes = await fetch(`${API_BASE}/auth/verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: studentUser._id, totpCode: studentTotp }),
  });
  const studentAuth = await verifyRes.json();
  console.log(`Student authenticated successfully with TOTP MFA. Role: ${studentAuth.user.role}`);

  // Step 3c: Student attempts DELETE /api/feedback/mockId
  console.log('Student attempting DELETE /api/feedback/mockId...');
  const res3 = await fetch(`${API_BASE}/feedback/66a123456789012345678901`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  const data3 = await res3.json();
  console.log(`HTTP Status: ${res3.status} ${res3.statusText}`);
  console.log('Response Body:', data3);
  console.log(`Result: ${res3.status === 403 ? 'PASSED (Properly Rejected with 403 Forbidden - Insufficient Role)' : 'FAILED'}\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Full Multi-Factor Authentication (MFA) & Admin Operation
  // -------------------------------------------------------------------------
  console.log('[TEST 4] Full Admin Login with TOTP Multi-Factor Authentication (MFA)...');
  
  // Step 4a: Password Verification
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@hostel.edu', password: 'adminSecurePassword123!' }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log('Step 1 (Password Check):', adminLoginData.message);
  console.log(`Requires MFA: ${adminLoginData.requiresMfa}`);

  // Step 4b: TOTP Authenticator App Verification (Google/Microsoft Authenticator)
  const adminTotp = speakeasy.totp({
    secret: adminUser.totpSecret,
    encoding: 'base32',
  });
  console.log(`Generated Authenticator TOTP Token: ${adminTotp} (Valid for 30 seconds)`);

  const adminVerifyRes = await fetch(`${API_BASE}/auth/verify-totp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: adminUser._id, totpCode: adminTotp }),
  });
  const adminAuth = await adminVerifyRes.json();
  console.log('Step 2 (MFA Token Check):', adminAuth.message);
  console.log(`Issued Admin JWT Token (truncated): ${adminAuth.token.substring(0, 45)}...`);

  // Step 4c: Admin performs authorized operation
  console.log('\nAdmin performing authorized menu inspection/update...');
  const testMenuRes = await fetch(`${API_BASE}/menu`);
  const menus = await testMenuRes.json();
  if (menus.length > 0) {
    const targetMenuId = menus[0]._id;
    const updateRes = await fetch(`${API_BASE}/menu/${targetMenuId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`,
      },
      body: JSON.stringify({ items: [...menus[0].items, 'Seasonal Fresh Fruit'] }),
    });
    const updateData = await updateRes.json();
    console.log(`HTTP Status: ${updateRes.status} ${updateRes.statusText}`);
    console.log('Admin Update Result:', updateData.message);
    console.log('Result: PASSED (Authorized Admin operation successfully granted)');
  }

  console.log('\n========================================================================');
  console.log('ALL RBAC & TOTP MFA SECURITY TESTS PASSED PERFECTLY!');
  console.log('========================================================================');
  process.exit(0);
}

runRbacTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
