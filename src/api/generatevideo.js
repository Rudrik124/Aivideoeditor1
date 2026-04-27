import { buildApiUrl } from "../lib/api";
import { buildVideoApiError, parseVideoApiResponse } from "../lib/video-response";

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
  const response = await fetch(buildApiUrl("/api/generate"), {
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

  const { data, rawBody, video, message } = await parseVideoApiResponse(response);
  const errorMessage = buildVideoApiError({ response, data, rawBody, message, video });

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  return { ...data, video };
};
