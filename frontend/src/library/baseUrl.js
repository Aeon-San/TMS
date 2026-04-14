const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");
const apiPort = import.meta.env.VITE_API_PORT || "5001";
const apiServicePrefix = trimTrailingSlash(
  import.meta.env.VITE_API_SERVICE_PREFIX || "/_/backend"
);

export const createApiBase = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (apiBaseUrl) {
    return `${apiBaseUrl}${normalizedPath}`;
  }

  return import.meta.env.MODE === "development"
    ? `http://localhost:${apiPort}${normalizedPath}`
    : `${apiServicePrefix}${normalizedPath}`;
};

export const useHashRouter = import.meta.env.VITE_USE_HASH_ROUTER === "true";
