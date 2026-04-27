export const generateVideo = async ({
  prompt,
  duration = 10,
  frame = "16:9",
  quality = "1080p",
  fps = 30,
  watermark = true,
  effects,
  provider,
} = {}) => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      duration,
      frame,
      quality,
      fps,
      watermark,
      effects,
      provider,
    }),
  });

  const rawBody = await response.text();
  let data = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { error: rawBody };
    }
  }

  const extractedError =
    (typeof data?.error === "string" && data.error) ||
    (typeof data?.error?.message === "string" && data.error.message) ||
    (typeof data?.detail === "string" && data.detail) ||
    (typeof data?.message === "string" && data.message) ||
    "";

  const hasVideo = typeof data?.video === "string" && data.video.trim().length > 0;
  if (!response.ok || data?.success !== true || !hasVideo) {
    const fallbackSnippet = rawBody ? String(rawBody).slice(0, 220) : "No response details.";
    throw new Error(
      extractedError || `Video generation failed (status ${response.status}). ${fallbackSnippet}`,
    );
  }

  return data;
};
