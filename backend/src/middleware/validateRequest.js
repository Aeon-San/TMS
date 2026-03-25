import { sendError } from '../library/apiResponse.js';

const validateRequest = (validator) => (req, res, next) => {
  const issues = validator(req);
  if (issues.length > 0) {
    return sendError(res, 422, 'Validation failed', issues);
  }
  return next();
};

export default validateRequest;
