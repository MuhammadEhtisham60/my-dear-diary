import Note from '../models/Note.js';
import { httpError } from '../middlewares/errorHandler.js';

const FIELDS = ['title', 'description', 'date', 'reminderTime', 'tags', 'priority'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

export const getNotes = async (req, res, next) => {
  try {
    res.json(await Note.findAll(req.user.id));
  } catch (err) { next(err); }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...pick(req.body), userId: req.user.id });
    res.status(201).json({ note });
  } catch (err) { next(err); }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.update(req.params.id, req.user.id, pick(req.body));
    if (!note) throw httpError(404, 'Note not found.');
    res.json({ note });
  } catch (err) { next(err); }
};

export const deleteNote = async (req, res, next) => {
  try {
    const deleted = await Note.remove(req.params.id, req.user.id);
    if (!deleted) throw httpError(404, 'Note not found.');
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const toggleNote = async (req, res, next) => {
  try {
    const note = await Note.toggle(req.params.id, req.user.id);
    if (!note) throw httpError(404, 'Note not found.');
    res.json({ note });
  } catch (err) { next(err); }
};
