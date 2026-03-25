import { sendError } from '../library/apiResponse.js';

export const requireGlobalRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return sendError(res, 403, 'Forbidden');
  }
  return next();
};
