const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const crypto = require('node:crypto');
const { generateOTP } = require('../utils/utils');
const tokenBlacklisted = require('../models/tokenBlacklist.model');

async function sendVerificationCode(user) {
  const otp = generateOTP();
  user.emailVerificationOtp = otp;
  user.emailVerificationOtpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  emailService.sendVerificationEmail(user.email, user.name, otp).catch((err) => {
    console.error('Failed to send verification email:', err);
  });

  return otp;
}

async function registerUser(req, res) {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password, and name are required', status: 'failed' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isExist = await userModel.findOne({ email: normalizedEmail });
    if (isExist) {
      return res.status(400).json({ message: 'User already exists with this email', status: 'failed' });
    }

    const systemUserEmails = (process.env.SYSTEM_USER_EMAILS || process.env.SYSTEM_USER_EMAIL || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const user = await userModel.create({
      email: normalizedEmail,
      password,
      name,
      systemUser: systemUserEmails.includes(normalizedEmail),
    });

    await sendVerificationCode(user);

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

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: 'email is required', status: 'failed' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail }).select('+emailVerificationOtp +emailVerificationOtpExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 'failed' });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: 'Email is already verified', status: 'success' });
    }

    await sendVerificationCode(user);

    return res.status(200).json({
      message: 'Verification code resent successfully. Please check your inbox.',
      status: 'success',
    });
  } catch (err) {
    console.error('resendVerificationEmail error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function getCurrentUser(req, res) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Unauthorized or user not logged in. Please login to continue', status: 'failed' });
    }

    const user = await userModel.findById(req.user._id).select('-password').select('+systemUser');

    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 'failed' });
    }

    return res.status(200).json({
      status: 'success',
      user: user.toObject(),
    });
  } catch (err) {
    console.error('getCurrentUser error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required', status: 'failed' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', status: 'failed' });
    }

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

    emailService.sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error('Failed to send welcome email:', err);
    });

    return res.status(200).json({ message: 'Email verified successfully', status: 'success' });
  } catch (err) {
    console.error('verifyEmail error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}
async function userLogoutController(req, res){
const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
if(!token){
  return res.status(400).json({
    message:"Unauthorized or user not logged in . Please login to continue"
  })
}
res.cookie("token","")
await tokenBlacklisted.create({token});
return res.status(200).json({
  message:"User logged out successfully"
})
}

async function adminLogin(req, res) {
  try {
    const { username, password } = req.body || {};
    if (username !== 'user' || password !== 'user123') {
      return res.status(401).json({ message: 'Invalid admin credentials', status: 'failed' });
    }

    const adminEmail = (process.env.SYSTEM_USER_EMAILS || process.env.SYSTEM_USER_EMAIL || '').split(',')[0]?.trim().toLowerCase() || 'admin@example.com';

    let user = await userModel.findOne({ email: adminEmail }).select('+password +systemUser');
    if (user === null) {
      user = await userModel.create({
        email: adminEmail,
        password: 'user123',
        name: 'Admin',
        isEmailVerified: true,
        systemUser: true,
      });
    } else {
      user.systemUser = true;
      user.isEmailVerified = true;
      user.password = 'user123';
      await user.save();
    }

    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.error('JWT secret is not defined in environment');
      return res.status(500).json({ message: 'Server configuration error', status: 'error' });
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });

    return res.status(200).json({ message: 'Admin login successful', status: 'success', token });
  } catch (err) {
    console.error('adminLogin error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'email is required', status: 'failed' });

    const normalized = String(email).trim().toLowerCase();
    const user = await userModel.findOne({ email: normalized }).select('+password');
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset code has been sent', status: 'success' });

    const otp = generateOTP(6);
    const hashed = crypto.createHash('sha256').update(otp).digest('hex');
    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    emailService.sendPasswordResetOtpEmail(user.email, user.name, otp).catch((err) => console.error('Failed to send password reset OTP email:', err));

    return res.status(200).json({ message: 'If that email exists, a reset code has been sent', status: 'success' });
  } catch (err) {
    console.error('requestPasswordReset error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, otp, email, newPassword } = req.body || {};
    if ((!token && !otp) || !email || !newPassword) return res.status(400).json({ message: 'token/otp, email and newPassword are required', status: 'failed' });

    const hashed = crypto.createHash('sha256').update(token || otp).digest('hex');
    const user = await userModel.findOne({ email: String(email).trim().toLowerCase(), passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired password reset token/code', status: 'failed' });

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully', status: 'success' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Internal server error', status: 'error' });
  }
}

module.exports = { registerUser, login, verifyEmail, resendVerificationEmail, getCurrentUser, userLogoutController, adminLogin, requestPasswordReset, resetPassword };



