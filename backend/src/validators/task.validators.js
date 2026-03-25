const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_DEADLINE_FILTERS = ['All', 'Today', 'This Week', 'Overdue', 'No Deadline'];
const VALID_SORTS = ['newest', 'oldest', 'priority', 'deadline', 'title'];

export const validateTaskPayload = (req) => {
  const { taskName, priority, taskStatus, dueDate } = req.body;
  const issues = [];

  if (req.method === 'POST' && (!taskName || String(taskName).trim().length < 3)) {
    issues.push({ field: 'taskName', message: 'Task name must be at least 3 characters.' });
  }
  if (taskName !== undefined && String(taskName).trim().length < 3) {
    issues.push({ field: 'taskName', message: 'Task name must be at least 3 characters.' });
  }
  if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
    issues.push({ field: 'priority', message: 'Invalid priority value.' });
  }
  if (taskStatus !== undefined && !VALID_STATUSES.includes(taskStatus)) {
    issues.push({ field: 'taskStatus', message: 'Invalid task status value.' });
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(new Date(dueDate).getTime())) {
    issues.push({ field: 'dueDate', message: 'Invalid due date.' });
  }

  return issues;
};

export const validateTaskAssignment = (req) => {
  const { userIds } = req.body;
  if (userIds !== undefined && !Array.isArray(userIds)) {
    return [{ field: 'userIds', message: 'userIds must be an array.' }];
  }
  return [];
};

export const validateCommentPayload = (req) => {
  const { content, mentions } = req.body;
  const issues = [];
  if (!content || String(content).trim().length < 1) {
    issues.push({ field: 'content', message: 'Comment content is required.' });
  }
  if (mentions !== undefined && !Array.isArray(mentions)) {
    issues.push({ field: 'mentions', message: 'mentions must be an array.' });
  }
  return issues;
};

export const validateTaskListQuery = (req) => {
  const { page, limit, deadlineFilter, sortBy } = req.query;
  const issues = [];
  const pageNumber = Number(page || 1);
  const limitNumber = Number(limit || 50);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) issues.push({ field: 'page', message: 'page must be a positive integer.' });
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) issues.push({ field: 'limit', message: 'limit must be between 1 and 100.' });
  if (deadlineFilter !== undefined && !VALID_DEADLINE_FILTERS.includes(deadlineFilter)) issues.push({ field: 'deadlineFilter', message: 'Invalid deadline filter.' });
  if (sortBy !== undefined && !VALID_SORTS.includes(sortBy)) issues.push({ field: 'sortBy', message: 'Invalid sort option.' });

  return issues;
};
