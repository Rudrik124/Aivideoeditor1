import { generateScenesFromPrompt } from "./generateScenesFromPrompt";
import { scenesToImages } from "./scenesToImages";

export type VideoPayload = {
  width: number;
  height: number;
  quality: string;
  draft: boolean;
  scenes: Array<{
    duration: number;
    "background-color": string;
    elements: Array<{
      type: "image";
      src: string;
      duration: number;
    }>;
  }>;
};

/**
 * Builds a JSON2Video payload using visual scenes instead of text
 * @param prompt User prompt to convert to visual scenes
 * @param duration Total video duration in seconds
 * @param aspectRatio Video aspect ratio (e.g., "16:9")
 * @returns JSON2Video API payload with image elements
 */
export function buildVideoPayloadFromScenes(
  prompt: string,
  duration: number = 10,
  aspectRatio: string = "16:9"
): VideoPayload {
  // Normalize inputs
  const normalizedPrompt = String(prompt || "").trim();
  const safeDuration = Math.max(3, Math.min(180, Number(duration) || 10));
  
  // Map aspect ratios to dimensions
  const ratioMap: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "4:3": { width: 1440, height: 1080 },
    "3:4": { width: 1080, height: 1440 },
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
    "2.35:1": { width: 1920, height: 816 },
  };
  
  const size = ratioMap[String(aspectRatio || "16:9")] || ratioMap["16:9"];

  // Generate visual scenes from prompt
  const scenes = generateScenesFromPrompt(normalizedPrompt);
  
  // Convert scenes to image elements
  const videoSegments = scenesToImages(scenes);

  // Distribute duration across video segments
  const durationPerSegment = safeDuration / videoSegments.length;

  // Build video payload with image elements (no text overlays)
  return {
    width: size.width,
    height: size.height,
    quality: "high",
    draft: false,
    scenes: [
      {
        duration: safeDuration,
        "background-color": "#0b1020",
        elements: videoSegments.map(segment => ({
          type: "image" as const,
          src: segment.src,
          duration: durationPerSegment,
        })),
      },
    ],
  };
}

export default buildVideoPayloadFromScenes;
