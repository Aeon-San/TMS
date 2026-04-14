const isProduction = process.env.NODE_ENV === 'production';

export const SESSION_TIMEOUT_MS = Number(process.env.SESSION_TIMEOUT_MS || 1000 * 60 * 60 * 12);
export const SESSION_ACTIVITY_UPDATE_WINDOW_MS = Number(process.env.SESSION_ACTIVITY_UPDATE_WINDOW_MS || 1000 * 60 * 5);
export const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || '12h';
export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'JwtToken';
export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? 'strict' : 'lax',
  secure: isProduction,
  path: '/',
  maxAge: SESSION_TIMEOUT_MS,
};

export const CORS_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

export const API_BODY_LIMIT = process.env.API_BODY_LIMIT || '1mb';
