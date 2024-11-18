const mongoose = require('mongoose');

const captchaSchema = new mongoose.Schema({
  captchaId: { type: String, required: true, unique: true },
  answer: { type: String, required: true },
});


module.exports = mongoose.model('Captcha', captchaSchema);
