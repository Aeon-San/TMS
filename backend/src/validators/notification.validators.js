export const validateNotificationListQuery = (req) => {
  const { page, limit } = req.query;
  const issues = [];
  const pageNumber = Number(page || 1);
  const limitNumber = Number(limit || 20);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) issues.push({ field: 'page', message: 'page must be a positive integer.' });
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) issues.push({ field: 'limit', message: 'limit must be between 1 and 100.' });

  return issues;
};
