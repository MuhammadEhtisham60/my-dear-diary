import { Router } from 'express';
import protect from '../middlewares/authMiddleware.js';
import { validateProfile, validatePasswordChange } from '../middlewares/validate.js';
import { getProfile, updateProfile, changePassword, getStats } from '../controllers/userController.js';

const router = Router();
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', validateProfile, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);
router.get('/stats', getStats);

export default router;
