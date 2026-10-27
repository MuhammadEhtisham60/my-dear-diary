import { Router } from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateNote } from '../middlewares/validate.js';
import { getNotes, createNote, updateNote, deleteNote, toggleNote } from '../controllers/noteController.js';

const router = Router();
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(validateNote(true), createNote);

router.route('/:id')
  .put(validateNote(false), updateNote)
  .delete(deleteNote);

router.patch('/:id/toggle', toggleNote);

export default router;
