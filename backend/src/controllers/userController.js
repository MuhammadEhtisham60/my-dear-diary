import User from '../models/User.js';
import Entry from '../models/Entry.js';
import { httpError } from '../middlewares/errorHandler.js';
import { computeStreaks, todayInTimezone } from '../utils/streakCalculator.js';

const PROFILE_FIELDS = ['name', 'bio', 'timezone', 'dateFormat', 'weekStart', 'theme', 'avatar'];

export const getProfile = (req, res) => res.json({ user: req.user });

export const updateProfile = async (req, res, next) => {
  try {
    const updates = Object.fromEntries(
      PROFILE_FIELDS.filter((k) => req.body[k] !== undefined).map((k) => [k, req.body[k]])
    );
    const user = await User.updateProfile(req.user.id, updates);
    res.json({ user });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id, { withSecrets: true });
    if (!(await User.comparePassword(currentPassword, user.password))) {
      throw httpError(401, 'Current password is incorrect.');
    }
    await User.updatePassword(req.user.id, newPassword);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const { totalEntries, favorites, dates, moodBreakdown, totalWords } = await Entry.getUserStats(req.user.id);
    const { currentStreak, longestStreak } = computeStreaks(dates, todayInTimezone(req.user.timezone));

    res.json({
      totalEntries,
      currentStreak,
      longestStreak,
      favorites,
      moodBreakdown,
      totalWords,
    });
  } catch (err) { next(err); }
};
