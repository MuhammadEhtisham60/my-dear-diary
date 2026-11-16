import crypto from 'node:crypto';
import User from '../models/User.js';
import { signToken } from '../utils/tokenHelper.js';
import { sendPasswordResetOtp } from '../utils/emailService.js';
import { httpError } from '../middlewares/errorHandler.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp.trim()).digest('hex');

async function verifyUserOtp(email, otp) {
  const user = await User.findByEmail(email, { withSecrets: true });

  if (!user || !user.resetOtpHash || !user.resetOtpExpires) {
    throw httpError(400, 'Invalid or expired OTP.');
  }

  if (user.resetOtpExpires.getTime() < Date.now()) {
    await User.clearResetOtp(user.id);
    throw httpError(400, 'OTP has expired. Please request a new one.');
  }

  if ((user.resetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
    await User.clearResetOtp(user.id);
    throw httpError(429, 'Too many invalid OTP attempts. Please request a new one.');
  }

  const candidate = Buffer.from(hashOtp(otp), 'hex');
  const expected = Buffer.from(user.resetOtpHash, 'hex');
  const matches = candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);

  if (!matches) {
    await User.incrementResetOtpAttempts(user.id, MAX_OTP_ATTEMPTS);
    throw httpError(400, 'Invalid OTP.');
  }

  return user;
}

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findByEmail(email);
    if (exists) throw httpError(409, 'An account with this email already exists.');
    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: signToken(user.id) });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email, { withSecrets: true });
    if (!user || !(await User.comparePassword(password, user.password))) {
      throw httpError(401, 'Invalid email or password.');
    }
    const safeUser = await User.findById(user.id);
    res.json({ user: safeUser, token: signToken(user.id) });
  } catch (err) { next(err); }
};

export const me = (req, res) => res.json({ user: req.user });

// Always responds the same to avoid revealing which emails are registered.
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      await User.setResetOtp(user.id, {
        hash: hashOtp(otp),
        expires: new Date(Date.now() + OTP_TTL_MS),
      });
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
    await User.updatePassword(user.id, req.body.newPassword);
    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) { next(err); }
};

// JWT is stateless: the client discards the token.
export const logout = (req, res) => res.json({ success: true });
