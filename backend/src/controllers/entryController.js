import Entry from '../models/Entry.js';
import { httpError } from '../middlewares/errorHandler.js';

const FIELDS = ['title', 'content', 'date', 'mood', 'tags', 'isFavorite', 'isDraft'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

export const getEntries = async (req, res, next) => {
  try {
    const { search, mood, tags, favorites, sort = 'newest' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

    const result = await Entry.findPaginated({
      userId: req.user.id,
      search,
      mood,
      tags,
      favorites,
      sort,
      page,
      limit,
    });

    res.json(result);
  } catch (err) { next(err); }
};

export const getEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findOwned(req.params.id, req.user.id);
    if (!entry) throw httpError(404, 'Entry not found.');
    res.json({ entry });
  } catch (err) { next(err); }
};

export const createEntry = async (req, res, next) => {
  try {
    const entry = await Entry.create({ ...pick(req.body), userId: req.user.id });
    res.status(201).json({ entry });
  } catch (err) { next(err); }
};

export const updateEntry = async (req, res, next) => {
  try {
    const entry = await Entry.update(req.params.id, req.user.id, pick(req.body));
    if (!entry) throw httpError(404, 'Entry not found.');
    res.json({ entry });
  } catch (err) { next(err); }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const deleted = await Entry.remove(req.params.id, req.user.id);
    if (!deleted) throw httpError(404, 'Entry not found.');
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const result = await Entry.toggleFavorite(req.params.id, req.user.id);
    if (!result) throw httpError(404, 'Entry not found.');
    res.json(result);
  } catch (err) { next(err); }
};

export const getByDate = async (req, res, next) => {
  try {
    const entries = await Entry.findByDate(req.user.id, req.params.date);
    res.json(entries);
  } catch (err) { next(err); }
};

export const getCalendar = async (req, res, next) => {
  try {
    const prefix = `${String(req.query.year).padStart(4, '0')}-${String(req.query.month).padStart(2, '0')}`;
    const dates = await Entry.getCalendarDates(req.user.id, prefix);
    res.json(dates);
  } catch (err) { next(err); }
};
