import User from '../models/User.js';
import { verifyToken } from '../utils/tokenHelper.js';

export default async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized. Token missing.' });
    }
    const decoded = verifyToken(header.split(' ')[1]);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    req.user = user;
    next();
  } catch (err) {
    err.status = 401;
    err.message = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    next(err);
  }
}
