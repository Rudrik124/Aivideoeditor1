// ⚠️ DEPRECATED: This file is no longer used.
// Video generation is now handled by the backend at /generate endpoint,
// which uses Runaway API for text-to-video generation.

export const generateVideo = async (prompt) => {
  console.warn("⚠️ generateVideo() is deprecated. Use POST /generate endpoint instead.");
  throw new Error("This function has been deprecated. Use POST /generate endpoint on backend.");
};