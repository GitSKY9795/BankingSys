require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('../src/models/user.model');
const accountModel = require('../src/models/account.model');

const email = process.argv[2] || process.env.CHECK_EMAIL || 'skyddu3278@gmail.com';

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(0);
    }
    console.log(`Found user: ${user.name || '<no-name>'} <${user.email}> verified=${user.isEmailVerified} systemUser=${user.systemUser}`);

    const accounts = await accountModel.find({ user: user._id });
    if (!accounts.length) {
      console.log('No accounts found for this user.');
      process.exit(0);
    }

    for (const acc of accounts) {
      const balance = await acc.getBalance();
      console.log(`- Account ${acc._id} status=${acc.status} currency=${acc.currency} balance=${balance}`);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err.message || err);
    process.exit(1);
  });
