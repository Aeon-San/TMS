const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const hasStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(String(value || ''));

const isUsername = (value) => /^[a-zA-Z0-9._-]{3,24}$/.test(String(value || '').trim());

export const validateSignup = (req) => {
  const { name, email, password } = req.body;
  const issues = [];

  if (!name || String(name).trim().length < 2) issues.push({ field: 'name', message: 'Name must be at least 2 characters.' });
  if (!isEmail(email)) issues.push({ field: 'email', message: 'A valid email is required.' });
  if (!hasStrongPassword(password)) {
    issues.push({ field: 'password', message: 'Password must be 8+ chars and include upper, lower, and number.' });
  }

  return issues;
};

export const validateLogin = (req) => {
  const { email, password } = req.body;
  const issues = [];
  if (!isEmail(email)) issues.push({ field: 'email', message: 'A valid email is required.' });
  if (!password) issues.push({ field: 'password', message: 'Password is required.' });
  return issues;
};

export const validateForgotPassword = (req) => {
  const { email } = req.body;
  return isEmail(email) ? [] : [{ field: 'email', message: 'A valid email is required.' }];
};

export const validateResetPassword = (req) => {
  const { password } = req.body;
  return hasStrongPassword(password)
    ? []
    : [{ field: 'password', message: 'Password must be 8+ chars and include upper, lower, and number.' }];
};

export const validateProfileUpdate = (req) => {
  const { name, email, username, preferences } = req.body;
  const issues = [];

  if (name !== undefined && String(name).trim().length < 2) {
    issues.push({ field: 'name', message: 'Name must be at least 2 characters.' });
  }
  if (email !== undefined && !isEmail(email)) {
    issues.push({ field: 'email', message: 'A valid email is required.' });
  }
  if (username !== undefined && !isUsername(username)) {
    issues.push({ field: 'username', message: 'Username must be 3-24 chars and only use letters, numbers, dot, underscore, or hyphen.' });
  }
  if (preferences !== undefined && (typeof preferences !== 'object' || Array.isArray(preferences))) {
    issues.push({ field: 'preferences', message: 'preferences must be an object.' });
  }

  return issues;
};

export const validatePasswordChange = (req) => {
  const { currentPassword, newPassword } = req.body;
  const issues = [];

  if (!currentPassword) {
    issues.push({ field: 'currentPassword', message: 'Current password is required.' });
  }
  if (!hasStrongPassword(newPassword)) {
    issues.push({ field: 'newPassword', message: 'New password must be 8+ chars and include upper, lower, and number.' });
  }

  return issues;
};
