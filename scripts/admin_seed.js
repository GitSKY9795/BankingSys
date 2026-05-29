require('dotenv').config();
const fetch = global.fetch;
const base = process.env.API_BASE || 'http://localhost:3000';

async function run() {
  try {
    console.log('Admin login...');
    const loginRes = await fetch(`${base}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: 'user123' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) throw new Error(`admin-login failed: ${loginJson.message || JSON.stringify(loginJson)}`);
    const token = loginJson.token;
    console.log('Admin token acquired.');

    console.log('Fetching all accounts...');
    const accountsRes = await fetch(`${base}/api/account/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accountsJson = await accountsRes.json();
    if (!accountsRes.ok) throw new Error(`get all accounts failed: ${accountsJson.message || JSON.stringify(accountsJson)}`);
    let accounts = accountsJson.accounts || [];
    console.log(`Found ${accounts.length} accounts.`);

    const adminEmail = (process.env.SYSTEM_USER_EMAILS || process.env.SYSTEM_USER_EMAIL || '').split(',')[0]?.trim().toLowerCase() || null;

    let recipient = accounts.find(a => (a.user && a.user.email && adminEmail) ? a.user.email.toLowerCase() !== adminEmail : true);

    if (!recipient) {
      console.log('No non-admin recipient found — creating a new account for admin to act as recipient.');
      const createAccRes = await fetch(`${base}/api/account`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const createAccJson = await createAccRes.json();
      if (!createAccRes.ok) throw new Error(`create account failed: ${createAccJson.message || JSON.stringify(createAccJson)}`);
      recipient = createAccJson.account;
      console.log('Created account:', recipient._id);
    } else {
      console.log('Selected recipient account:', recipient._id, 'user:', recipient.user?.email || recipient.user);
    }

    const amount = 1000;
    const idempotencyKey = `seed-${Date.now()}`;
    console.log(`Seeding ₹${amount} to account ${recipient._id} (idempotencyKey=${idempotencyKey})...`);

    const seedRes = await fetch(`${base}/api/transaction/system/initial-funds`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ toAccount: recipient._id, amount, idempotencyKey }),
    });
    const seedJson = await seedRes.json();
    if (!seedRes.ok) throw new Error(`seed failed: ${seedJson.message || JSON.stringify(seedJson)}`);

    console.log('Seed transaction result:', seedJson.message);
    console.log('Transaction id:', seedJson.transaction?._id || '(not returned)');

    console.log('Fetching all accounts to verify recipient balance (admin-only)...');
    const accountsAfterRes = await fetch(`${base}/api/account/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accountsAfterJson = await accountsAfterRes.json();
    if (!accountsAfterRes.ok) throw new Error(`get all accounts failed: ${accountsAfterJson.message || JSON.stringify(accountsAfterJson)}`);
    const updated = (accountsAfterJson.accounts || []).find(a => a._id === recipient._id);
    console.log('Recipient balance:', updated ? updated.balance : '(not found in admin list)');

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
