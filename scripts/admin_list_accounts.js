require('dotenv').config();
const fetch = global.fetch;
const base = process.env.API_BASE || 'http://localhost:3000';

async function run() {
  try {
    const loginRes = await fetch(`${base}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: 'user123' }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) throw new Error(`admin-login failed: ${loginJson.message || JSON.stringify(loginJson)}`);
    const token = loginJson.token;

    const accountsRes = await fetch(`${base}/api/account/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accountsJson = await accountsRes.json();
    if (!accountsRes.ok) throw new Error(`get all accounts failed: ${accountsJson.message || JSON.stringify(accountsJson)}`);
    const accounts = accountsJson.accounts || [];
    console.log(`Total accounts: ${accounts.length}`);
    accounts.forEach(a => {
      console.log(`- ${a._id} | user=${a.user?.email || a.user} | balance=${a.balance}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

run();
