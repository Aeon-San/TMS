const stripTags = (value) =>
  String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();

export const sanitizeText = (value, { allowEmpty = true, maxLength = 5000 } = {}) => {
  if (value === undefined || value === null) {
    return allowEmpty ? '' : null;
  }

  return stripTags(value).slice(0, maxLength);
};

export const sanitizeArrayOfStrings = (value, maxItems = 20) => {
  if (!value) return [];
  const source = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(source.map((item) => sanitizeText(item, { maxLength: 50 })).filter(Boolean))].slice(0, maxItems);
};

export const sanitizeObjectStrings = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObjectStrings(item));
  }

  if (!input || typeof input !== 'object') {
    return typeof input === 'string' ? sanitizeText(input) : input;
  }

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, sanitizeText(value)];
      }
      if (Array.isArray(value) || (value && typeof value === 'object')) {
        return [key, sanitizeObjectStrings(value)];
      }
      return [key, value];
    })
  );
};
