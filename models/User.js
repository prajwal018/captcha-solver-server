const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  coinBalance: { type: Number, default: 0 },
  stats: {
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('User', userSchema);
