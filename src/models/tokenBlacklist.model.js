const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '30d', // optional: auto-remove after 30 days
    },
  },
  { timestamps: true }
);

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;
