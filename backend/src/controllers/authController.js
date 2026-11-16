import crypto from 'node:crypto';
import User from '../models/User.js';
import { signToken } from '../utils/tokenHelper.js';
import { sendPasswordResetOtp } from '../utils/emailService.js';
import { httpError } from '../middlewares/errorHandler.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp.trim()).digest('hex');

async function verifyUserOtp(email, otp) {
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+resetOtpHash +resetOtpExpires +resetOtpAttempts +password');

  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    throw httpError(400, 'Invalid or expired OTP.');
  }

  if (user.resetOtpExpires.getTime() < Date.now()) {
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
    throw httpError(400, 'OTP has expired. Please request a new one.');
  }

  if ((user.resetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
    throw httpError(429, 'Too many invalid OTP attempts. Please request a new one.');
  }

  const candidate = Buffer.from(hashOtp(otp), 'hex');
  const expected = Buffer.from(user.resetOtpHash, 'hex');
  const matches = candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);

  if (!matches) {
    user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
    if (user.resetOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.resetOtpHash = undefined;
      user.resetOtpExpires = undefined;
    }
    await user.save();
    throw httpError(400, 'Invalid OTP.');
  }

  return user;
}

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw httpError(409, 'An account with this email already exists.');
    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: signToken(user._id) });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw httpError(401, 'Invalid email or password.');
    }
    res.json({ user, token: signToken(user._id) });
  } catch (err) { next(err); }
};

export const me = (req, res) => res.json({ user: req.user });

// Always responds the same to avoid revealing which emails are registered.
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase().trim() });
    if (user) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      user.resetOtpHash = hashOtp(otp);
      user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
      user.resetOtpAttempts = 0;
      await user.save();
      await sendPasswordResetOtp({ to: user.email, name: user.name, otp });
    }
    res.json({ message: 'If an account with that email exists, a 6-digit OTP has been sent.' });
  } catch (err) { next(err); }
};

export const verifyOtp = async (req, res, next) => {
  try {
    await verifyUserOtp(req.body.email, req.body.otp);
    res.json({ valid: true, message: 'OTP verified.' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await verifyUserOtp(req.body.email, req.body.otp);
    user.password = req.body.newPassword;
    user.resetOtpHash = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    await user.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) { next(err); }
};

// JWT is stateless: the client discards the token.
export const logout = (req, res) => res.json({ success: true });
