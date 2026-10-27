import Entry from '../models/Entry.js';
import { httpError } from '../middlewares/errorHandler.js';

const FIELDS = ['title', 'content', 'date', 'mood', 'tags', 'isFavorite', 'isDraft'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findOwned = async (req) => {
  const entry = await Entry.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) throw httpError(404, 'Entry not found.');
  return entry;
};

export const getEntries = async (req, res, next) => {
  try {
    const { search, mood, tags, favorites, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

    const filter = { userId: req.user._id };
    if (search) {
      const rx = { $regex: escapeRegex(String(search)), $options: 'i' };
      filter.$or = [{ title: rx }, { content: rx }, { tags: rx }];
    }
    if (mood) filter.mood = mood;
    if (tags) {
      const list = (Array.isArray(tags) ? tags : String(tags).split(',')).map((t) => t.trim()).filter(Boolean);
      if (list.length) filter.tags = { $all: list };
    }
    if (favorites === 'true' || favorites === true) filter.isFavorite = true;

    const sortMap = {
      newest: { date: -1, createdAt: -1 },
      oldest: { date: 1, createdAt: 1 },
      alpha: { title: 1 },
    };

    const total = await Entry.countDocuments(filter);
    const entries = await Entry.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ entries, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const getEntry = async (req, res, next) => {
  try { res.json({ entry: await findOwned(req) }); } catch (err) { next(err); }
};

export const createEntry = async (req, res, next) => {
  try {
    const entry = await Entry.create({ ...pick(req.body), userId: req.user._id });
    res.status(201).json({ entry });
  } catch (err) { next(err); }
};

export const updateEntry = async (req, res, next) => {
  try {
    const entry = await findOwned(req);
    entry.set(pick(req.body));
    await entry.save();
    res.json({ entry });
  } catch (err) { next(err); }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const entry = await findOwned(req);
    await entry.deleteOne();
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const entry = await findOwned(req);
    entry.isFavorite = !entry.isFavorite;
    await entry.save();
    res.json({ id: entry.id, isFavorite: entry.isFavorite });
  } catch (err) { next(err); }
};

export const getByDate = async (req, res, next) => {
  try {
    const entries = await Entry.find({ userId: req.user._id, date: req.params.date }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) { next(err); }
};

export const getCalendar = async (req, res, next) => {
  try {
    const prefix = `${String(req.query.year).padStart(4, '0')}-${String(req.query.month).padStart(2, '0')}`;
    const dates = await Entry.distinct('date', {
      userId: req.user._id,
      date: { $regex: `^${prefix}` },
    });
    res.json(dates.sort());
  } catch (err) { next(err); }
};
