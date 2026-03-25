import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { COOKIE_NAME, COOKIE_OPTIONS, SESSION_TIMEOUT_MS, TOKEN_EXPIRY } from '../config/security.js';

export const clearAuthCookie = (res) => {
  const { maxAge, ...clearCookieOptions } = COOKIE_OPTIONS;
  res.clearCookie(COOKIE_NAME, clearCookieOptions);
};

const generateToken = async (user, res) => {
  const sessionId = crypto.randomUUID();
  const sessionExpiresAt = new Date(Date.now() + SESSION_TIMEOUT_MS);

  user.sessionVersion = (user.sessionVersion || 0) + 1;
  user.sessionExpiresAt = sessionExpiresAt;
  user.lastLoginAt = new Date();
  user.lastActiveAt = new Date();
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      sessionVersion: user.sessionVersion,
      sessionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return token;
};

export default generateToken;
