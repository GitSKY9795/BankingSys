(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: 'user123' }),
    });

    const loginText = await loginRes.text();
    console.log('login status', loginRes.status);
    console.log(loginText);

    let token;
    try {
      token = JSON.parse(loginText).token;
    } catch (e) {
      // continue
    }

    if (!token) {
      console.error('No token received; aborting.');
      process.exit(1);
    }

    const otherRes = await fetch('http://localhost:3000/api/account/others', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const otherText = await otherRes.text();
    console.log('others status', otherRes.status);
    console.log(otherText);
  } catch (err) {
    console.error(err);
  }
})();
