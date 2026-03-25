import AppError from '../library/appError.js';
import { logger } from '../library/logger.js';
import { sendError } from '../library/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  logger.error('Request failed', {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    message: error.message,
    details: error.details,
  });

  if (res.headersSent) {
    return next(error);
  }

  return sendError(
    res,
    statusCode,
    statusCode >= 500 ? 'Internal server error' : error.message,
    statusCode >= 500 ? undefined : error.details
  );
};
