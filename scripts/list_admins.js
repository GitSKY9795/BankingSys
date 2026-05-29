require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('../src/models/user.model');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

mongoose.connect(uri, { maxPoolSize: 5 })
  .then(async () => {
    const admins = await userModel.find({ systemUser: true }).select('email name').lean();
    if (!admins || admins.length === 0) {
      console.log('No admin/system users found.');
    } else {
      console.log('Admin users:');
      admins.forEach((a) => console.log(`- ${a.name || '<no-name>'} <${a.email}>`));
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message || err);
    process.exit(1);
  });
