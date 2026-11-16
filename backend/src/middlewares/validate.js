import { MOOD_IDS } from '../models/Entry.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RE = /^\d{6}$/;

const isValidDate = (s) => DATE_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

/** Wrap a (req) => string|null checker into middleware. */
const check = (fn) => (req, res, next) => {
  const message = fn(req);
  if (message) return res.status(400).json({ message });
  next();
};

const str = (v) => typeof v === 'string' && v.trim().length > 0;

export const validateSignup = check(({ body }) => {
  if (!str(body.name) || !str(body.email) || !str(body.password)) return 'All fields are required.';
  if (!EMAIL_RE.test(body.email)) return 'Please provide a valid email address.';
  if (body.password.length < 6) return 'Password must be at least 6 characters.';
  return null;
});

export const validateLogin = check(({ body }) => {
  if (!str(body.email) || !str(body.password)) return 'Email and password are required.';
  return null;
});

export const validateForgot = check(({ body }) => {
  if (!str(body.email)) return 'Email is required.';
  if (!EMAIL_RE.test(body.email)) return 'Please provide a valid email address.';
  return null;
});

export const validateVerifyOtp = check(({ body }) => {
  if (!str(body.email) || !str(body.otp)) return 'Email and OTP are required.';
  if (!EMAIL_RE.test(body.email)) return 'Please provide a valid email address.';
  if (!OTP_RE.test(body.otp.trim())) return 'OTP must be a 6-digit code.';
  return null;
});

export const validateResetPassword = check(({ body }) => {
  if (!str(body.email) || !str(body.otp) || !str(body.newPassword)) return 'Email, OTP, and new password are required.';
  if (!EMAIL_RE.test(body.email)) return 'Please provide a valid email address.';
  if (!OTP_RE.test(body.otp.trim())) return 'OTP must be a 6-digit code.';
  if (body.newPassword.length < 6) return 'New password must be at least 6 characters.';
  return null;
});

const tagsOk = (t) => t === undefined || (Array.isArray(t) && t.every((x) => typeof x === 'string'));

export const validateEntry = (isCreate) => check(({ body }) => {
  if (isCreate && !str(body.title)) return 'Title is required.';
  if (body.title !== undefined && !str(body.title)) return 'Title is required.';
  if (isCreate && !body.date) return 'Date is required.';
  if (body.date !== undefined && !isValidDate(body.date)) return 'Date must be in YYYY-MM-DD format.';
  if (body.mood !== undefined && !MOOD_IDS.includes(body.mood)) return `Mood must be one of: ${MOOD_IDS.join(', ')}.`;
  if (!tagsOk(body.tags)) return 'Tags must be an array of strings.';
  return null;
});

export const validateNote = (isCreate) => check(({ body }) => {
  if (isCreate && !str(body.title)) return 'Title is required.';
  if (body.title !== undefined && !str(body.title)) return 'Title is required.';
  if (isCreate && !body.date) return 'Date is required.';
  if (body.date !== undefined && !isValidDate(body.date)) return 'Date must be in YYYY-MM-DD format.';
  if (body.reminderTime !== undefined && !TIME_RE.test(body.reminderTime)) return 'reminderTime must be HH:mm.';
  if (body.priority !== undefined && !['low', 'medium', 'high'].includes(body.priority)) return 'Priority must be low, medium or high.';
  if (!tagsOk(body.tags)) return 'Tags must be an array of strings.';
  return null;
});

export const validateProfile = check(({ body }) => {
  if (body.name !== undefined && !str(body.name)) return 'Name cannot be empty.';
  if (body.bio !== undefined && String(body.bio).length > 300) return 'Bio must be 300 characters or fewer.';
  if (body.weekStart !== undefined && !['Monday', 'Sunday'].includes(body.weekStart)) return 'weekStart must be Monday or Sunday.';
  if (body.theme !== undefined && !['light', 'dark', 'system'].includes(body.theme)) return 'theme must be light, dark or system.';
  return null;
});

export const validatePasswordChange = check(({ body }) => {
  if (!str(body.currentPassword) || !str(body.newPassword)) return 'Both fields are required.';
  if (body.newPassword.length < 6) return 'New password must be at least 6 characters.';
  return null;
});

export const validateCalendarQuery = check(({ query }) => {
  const y = Number(query.year);
  const m = Number(query.month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) return 'Valid year and month (1-12) are required.';
  return null;
});

export const validateDateParam = check(({ params }) => (isValidDate(params.date) ? null : 'Date must be in YYYY-MM-DD format.'));
