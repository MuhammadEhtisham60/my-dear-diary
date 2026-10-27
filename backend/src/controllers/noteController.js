import Note from '../models/Note.js';
import { httpError } from '../middlewares/errorHandler.js';

const FIELDS = ['title', 'description', 'date', 'reminderTime', 'tags', 'priority'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

const findOwned = async (req) => {
  const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
  if (!note) throw httpError(404, 'Note not found.');
  return note;
};

export const getNotes = async (req, res, next) => {
  try {
    res.json(await Note.find({ userId: req.user._id }).sort({ date: 1, reminderTime: 1 }));
  } catch (err) { next(err); }
};

export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({ ...pick(req.body), userId: req.user._id });
    res.status(201).json({ note });
  } catch (err) { next(err); }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await findOwned(req);
    note.set(pick(req.body));
    await note.save();
    res.json({ note });
  } catch (err) { next(err); }
};

export const deleteNote = async (req, res, next) => {
  try {
    const note = await findOwned(req);
    await note.deleteOne();
    res.json({ success: true });
  } catch (err) { next(err); }
};

export const toggleNote = async (req, res, next) => {
  try {
    const note = await findOwned(req);
    note.completed = !note.completed;
    await note.save();
    res.json({ note });
  } catch (err) { next(err); }
};
