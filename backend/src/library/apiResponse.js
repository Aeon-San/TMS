export const sendSuccess = (res, statusCode, payload = {}) => res.status(statusCode).json(payload);

export const sendError = (res, statusCode, message, details = undefined) => {
  const response = { message };
  if (details !== undefined) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};
