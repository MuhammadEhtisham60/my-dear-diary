import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, me, forgotPassword, logout } from '../controllers/authController.js';
import protect from '../middlewares/authMiddleware.js';
import { validateSignup, validateLogin, validateForgot } from '../middlewares/validate.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

const router = Router();
router.post('/signup', limiter, validateSignup, signup);
router.post('/login', limiter, validateLogin, login);
router.post('/forgot-password', limiter, validateForgot, forgotPassword);
router.get('/me', protect, me);
router.post('/logout', logout);

export default router;
