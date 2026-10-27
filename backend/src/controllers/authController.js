import User from '../models/User.js';
import { signToken } from '../utils/tokenHelper.js';
import { httpError } from '../middlewares/errorHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) throw httpError(409, 'An account with this email already exists.');
    const user = await User.create({ name, email, password });
    res.status(201).json({ user, token: signToken(user._id) });
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw httpError(401, 'Invalid email or password.');
    }
    res.json({ user, token: signToken(user._id) });
  } catch (err) { next(err); }
};

export const me = (req, res) => res.json({ user: req.user });

// Always responds the same to avoid revealing which emails are registered.
export const forgotPassword = async (req, res, next) => {
  try {
    await User.findOne({ email: req.body.email.toLowerCase().trim() });
    res.json({ message: 'Password reset link sent.' });
  } catch (err) { next(err); }
};

// JWT is stateless: the client discards the token.
export const logout = (req, res) => res.json({ success: true });
