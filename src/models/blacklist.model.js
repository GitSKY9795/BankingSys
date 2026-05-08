const mongoose = require("mongoose");

const tokenBlacklistedSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
blacklistedAt: {
    type: Date,
    default: Date.now,
    required: true,
  }},
  {
  timestamps: true
});
tokenBlacklistedSchema.index({ crearedAt: 1 },{
    expireAfterSeconds: 60 * 60 * 24*3
});
const tokenBlacklisted = mongoose.model("tokenBlacklisted", tokenBlacklisted);
module.exports = tokenBlacklisted;