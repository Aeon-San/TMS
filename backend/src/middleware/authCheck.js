import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { COOKIE_NAME, COOKIE_OPTIONS, SESSION_ACTIVITY_UPDATE_WINDOW_MS } from '../config/security.js';
import { clearAuthCookie } from '../library/token.js';
import { logger } from '../library/logger.js';

export const authCheck = async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: 'User not authenticated!' });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.userId)
      .select('name email role avatar profilePic lastActiveAt sessionExpiresAt sessionVersion');

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'User not found' });
    }

    if (decode.sessionVersion !== user.sessionVersion) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }

    if (!user.sessionExpiresAt || new Date(user.sessionExpiresAt).getTime() < Date.now()) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'Session timed out. Please login again.' });
    }

    const now = Date.now();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;
    if (now - lastActive > SESSION_ACTIVITY_UPDATE_WINDOW_MS) {
      user.lastActiveAt = new Date(now);
      user.sessionExpiresAt = new Date(now + COOKIE_OPTIONS.maxAge);
      await user.save();
    }

    req.userId = decode.userId;
    req.user = user;
    next();
  } catch (error) {
    clearAuthCookie(res);
    logger.warn('Token verification failed', { message: error.message, path: req.originalUrl });
    return res.status(401).json({ message: 'Invalid Token' });
  }
};
