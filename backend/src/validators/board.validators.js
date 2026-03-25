export const validateBoardPayload = (req) => {
  const { name } = req.body;
  if (!name || String(name).trim().length < 2) {
    return [{ field: 'name', message: 'Board name must be at least 2 characters.' }];
  }
  return [];
};

export const validateBoardInvite = (req) => {
  const { email, role } = req.body;
  const issues = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    issues.push({ field: 'email', message: 'A valid email is required.' });
  }
  if (role !== undefined && !['admin', 'member'].includes(role)) {
    issues.push({ field: 'role', message: 'Role must be admin or member.' });
  }
  return issues;
};
