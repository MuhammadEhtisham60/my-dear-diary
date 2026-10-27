import User from '../models/User.js';
import Entry from '../models/Entry.js';
import { httpError } from '../middlewares/errorHandler.js';
import { computeStreaks, todayInTimezone } from '../utils/streakCalculator.js';

const PROFILE_FIELDS = ['name', 'bio', 'timezone', 'dateFormat', 'weekStart', 'theme', 'avatar'];

export const getProfile = (req, res) => res.json({ user: req.user });

export const updateProfile = async (req, res, next) => {
  try {
    for (const k of PROFILE_FIELDS) if (req.body[k] !== undefined) req.user[k] = req.body[k];
    await req.user.save();
    res.json({ user: req.user });
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      throw httpError(401, 'Current password is incorrect.');
    }
    user.password = newPassword; // hashed by pre-save hook
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [totalEntries, favorites, dates, moods, words] = await Promise.all([
      Entry.countDocuments({ userId }),
      Entry.countDocuments({ userId, isFavorite: true }),
      Entry.distinct('date', { userId }),
      Entry.aggregate([{ $match: { userId } }, { $group: { _id: '$mood', count: { $sum: 1 } } }]),
      Entry.aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: '$wordCount' } } }]),
    ]);

    const { currentStreak, longestStreak } = computeStreaks(dates, todayInTimezone(req.user.timezone));
    const moodBreakdown = Object.fromEntries(moods.map((m) => [m._id, m.count]));

    res.json({
      totalEntries,
      currentStreak,
      longestStreak,
      favorites,
      moodBreakdown,
      totalWords: words[0]?.total || 0,
    });
  } catch (err) { next(err); }
};
