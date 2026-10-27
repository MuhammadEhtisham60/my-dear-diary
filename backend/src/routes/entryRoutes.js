import { Router } from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateEntry, validateCalendarQuery, validateDateParam } from '../middlewares/validate.js';
import {
  getEntries, getEntry, createEntry, updateEntry, deleteEntry,
  toggleFavorite, getByDate, getCalendar,
} from '../controllers/entryController.js';

const router = Router();
router.use(protect);

// Static paths must come before /:id
router.get('/calendar', validateCalendarQuery, getCalendar);
router.get('/by-date/:date', validateDateParam, getByDate);

router.route('/')
  .get(getEntries)
  .post(validateEntry(true), createEntry);

router.route('/:id')
  .get(getEntry)
  .put(validateEntry(false), updateEntry)
  .delete(deleteEntry);

router.patch('/:id/favorite', toggleFavorite);

export default router;
