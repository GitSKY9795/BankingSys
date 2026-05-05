const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const { generateOTP } = require('../utils/utils');
async function registerUser(req, res) {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password, and name are required', status: 'failed' });
    }

    const isExist = await userModel.findOne({ email });
    if (isExist) {
      return res.status(400).json({ message: 'User already exists with this email', status: 'failed' });
    }

    const user = await userModel.create({ email, password, name });

    const otp = generateOTP();
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    emailService.sendVerificationEmail(user.email, user.name, otp).catch((err) => {
      console.error('Failed to send registration email:', err);
    });

    return res.status(201).json({
      message: 'User registered successfully. Please verify your email with the OTP sent to your inbox.',
      status: 'success',
      name: user.name,
      email: user.email,
      id: user._id,
    });

  } catch (err) {
    console.error('registerUser error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required', status: 'failed' });
    }

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 'failed' });
    }

    // ✅ Works only if password is stored as a bcrypt hash (fixed above)
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password', status: 'failed' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in', status: 'failed' });
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error('JWT secret is not defined in environment');
      return res.status(500).json({ message: 'Server configuration error', status: 'error' });
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({ message: 'Login successful', status: 'success', token });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ message: 'email and otp are required', status: 'failed' });
    }

    const user = await userModel.findOne({ email }).select('+emailVerificationOtp +emailVerificationOtpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 'failed' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified', status: 'success' });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationOtpExpires) {
      return res.status(400).json({ message: 'Verification code is missing. Please request a new one.', status: 'failed' });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP', status: 'failed' });
    }

    if (user.emailVerificationOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired', status: 'failed' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully', status: 'success' });
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

module.exports = { registerUser, login, verifyEmail };