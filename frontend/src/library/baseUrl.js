const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");

export const createApiBase = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (apiBaseUrl) {
    return `${apiBaseUrl}${normalizedPath}`;
  }

  return import.meta.env.MODE === "development"
    ? `http://localhost:9000${normalizedPath}`
    : normalizedPath;
};

export const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === "true";
