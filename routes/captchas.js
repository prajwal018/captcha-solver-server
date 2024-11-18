const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Captcha = require('../models/Captcha');
const svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid');

// API to generate a new CAPTCHA
router.get('/captcha', async (req, res) => {
  try {
    
    const captcha = svgCaptcha.create();
    const captchaId = uuidv4();
  
  // Store CAPTCHA in database
    await Captcha.create({ captchaId, answer: captcha.text });
    
    res.json({
      captchaId,
      image: captcha.data, // SVG image data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate CAPTCHA' });
  }
});



// API to validate a CAPTCHA
router.post('/validate',async (req, res) => {
  const { captchaId, userAnswer, userId, action } = req.body;

    try {
    // Ensure user exists in the database
    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({
        userId,
        coinBalance: 0,
        stats: { correct: 0, incorrect: 0, skipped: 0 },
      });
    }

    if (action === 'skip') {
      // Increment "skipped" stat
      user.stats.skipped += 1;
      await user.save();

      // Delete CAPTCHA and generate a new one
      await Captcha.findOneAndDelete({ captchaId });
      const newCaptcha = svgCaptcha.create();
      const newCaptchaId = uuidv4();
      await Captcha.create({ captchaId: newCaptchaId, answer: newCaptcha.text });

      return res.json({
        success: true,
        newCaptcha: {
          captchaId: newCaptchaId,
          image: newCaptcha.data,
        },
        message: 'CAPTCHA skipped',
      });
    }

    // Validate CAPTCHA
    const captcha = await Captcha.findOne({ captchaId });
    if (captcha && captcha.answer.toLowerCase() === userAnswer.toLowerCase()) {
      // Correct answer
      user.stats.correct += 1;
      user.coinBalance += 1;
      await user.save();

      // Delete CAPTCHA and generate a new one
      await Captcha.findOneAndDelete({ captchaId });
      const newCaptcha = svgCaptcha.create();
      const newCaptchaId = uuidv4();
      await Captcha.create({ captchaId: newCaptchaId, answer: newCaptcha.text });

      return res.json({
        success: true,
        coinBalance: user.coinBalance,
        newCaptcha: {
          captchaId: newCaptchaId,
          image: newCaptcha.data,
        },
      });
    } else {
      // Incorrect answer
      user.stats.incorrect += 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid CAPTCHA answer' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// API to get the user’s current stats and coin balance
router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.json({
        coinBalance: 0,
        stats: { correct: 0, incorrect: 0, skipped: 0 },
      });
    }

    res.json({
      coinBalance: user.coinBalance,
      stats: user.stats,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

module.exports = router;
