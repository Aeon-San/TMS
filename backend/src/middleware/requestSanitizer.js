import { sanitizeObjectStrings } from '../library/sanitize.js';

export const requestSanitizer = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObjectStrings(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObjectStrings(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObjectStrings(req.params);
  }
  next();
};
