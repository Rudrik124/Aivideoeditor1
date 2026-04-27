const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");

export const buildApiUrl = (path: string) => {
  if (!apiBaseUrl) {
    return path;
  }

  const normalizedPath = String(path || "").replace(/^\/api/, "");
  return `${apiBaseUrl}${normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`}`;
};
