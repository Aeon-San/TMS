const formatMeta = (meta = {}) => {
  const safeMeta = { ...meta };
  if (safeMeta.password) delete safeMeta.password;
  if (safeMeta.token) delete safeMeta.token;
  if (safeMeta.resetPasswordToken) delete safeMeta.resetPasswordToken;
  return safeMeta;
};

export const logger = {
  info(message, meta = {}) {
    console.log(`[INFO] ${message}`, formatMeta(meta));
  },
  warn(message, meta = {}) {
    console.warn(`[WARN] ${message}`, formatMeta(meta));
  },
  error(message, meta = {}) {
    console.error(`[ERROR] ${message}`, formatMeta(meta));
  },
};
