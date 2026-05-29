require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('../src/models/user.model');

const query = process.argv[2];
if (!query) {
  console.error('Usage: node find_user.js <email-or-fragment>');
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('.env MONGODB_URI is required');
  process.exit(1);
}

mongoose.connect(uri)
  .then(async () => {
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await userModel.find({ email: regex }).select('email name isEmailVerified systemUser').lean();
    if (!users.length) {
      console.log('No users match:', query);
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach(u => console.log(`- ${u.name || '<no-name>'} <${u.email}> verified=${u.isEmailVerified} systemUser=${u.systemUser}`));
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err.message || err);
    process.exit(1);
  });
