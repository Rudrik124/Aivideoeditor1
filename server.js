import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import { fal } from "@fal-ai/client";
import fs from "fs";
import os from "os";
import path from "path";
import dotenv from "dotenv";

// Load environment variables (including GEMINI_API_KEY and Supabase keys)
dotenv.config({ path: "./src/.env", override: true });

const readEnv = (name) => process.env[name] || process.env[`VITE_${name}`] || "";

const falApiKey = readEnv("FAL_API_KEY");
fal.config({
  credentials: falApiKey,
});

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SERVE OUTPUT VIDEOS (IMPORTANT)
app.use("/videos", express.static("outputs"));

// ✅ SET FFMPEG
ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ FILE UPLOAD
const upload = multer({ dest: "uploads/" });

// Ensure working directories exist.
fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("outputs", { recursive: true });

const tempWorkDir = path.join(os.tmpdir(), "aivideoeditor1-temp");
fs.mkdirSync(tempWorkDir, { recursive: true });

const makeTempFilePath = (suffix) => {
  const safeSuffix = String(suffix || "temp.bin").replace(/[^a-zA-Z0-9._-]/g, "_");
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return path.join(tempWorkDir, `${unique}-${safeSuffix}`);
};

// ✅ INIT SUPABASE (env-only, no hardcoded secrets)
const supabaseUrl = readEnv("SUPABASE_URL");
const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

console.log("🔍 Parsed service role key length:", serviceRoleKey ? serviceRoleKey.length : 0);
console.log(
  "🔍 Parsed service role key prefix:",
  serviceRoleKey ? serviceRoleKey.slice(0, 10) + "..." : "<none>",
);
console.log(
  "🔍 ENV SUPABASE_ANON_KEY prefix:",
  readEnv("SUPABASE_ANON_KEY")
    ? readEnv("SUPABASE_ANON_KEY").slice(0, 10) + "..."
    : "<none>",
);

const supabaseKey = serviceRoleKey || readEnv("SUPABASE_ANON_KEY") || "";
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY in environment.");
}
// Bucket mapping by function.
const SUPABASE_BUCKETS = {
  AI_GENERATED: (readEnv("SUPABASE_BUCKET_AI_GENERATED") || "AI_Generated_Video").trim(),
  IMAGE_TO_VIDEO: (readEnv("SUPABASE_BUCKET_IMAGE_TO_VIDEO") || "Image-to-video_function").trim(),
  REFERENCE_VIDEO: (readEnv("SUPABASE_BUCKET_REFERENCE_VIDEO") || "Reference_video_function").trim(),
  QUICK_EDITS: (readEnv("SUPABASE_BUCKET_QUICK_EDITS") || "quick_edits").trim(),
};

const supabaseBucket = (readEnv("SUPABASE_STORAGE_BUCKET") || SUPABASE_BUCKETS.IMAGE_TO_VIDEO).trim();
console.log("🔗 Supabase URL:", supabaseUrl);
console.log("🔗 Supabase key prefix:", supabaseKey ? supabaseKey.slice(0, 10) + "..." : "<none>");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🔗 Supabase bucket configured:", supabaseBucket);
console.log("🔗 Supabase bucket map:", SUPABASE_BUCKETS);

// Optional: log available buckets at startup for debugging
supabase.storage
  .listBuckets()
  .then((res) => {
    if (Array.isArray(res.data)) {
      console.log(
        "📦 Supabase buckets:",
        res.data.map((b) => b.name),
      );
    } else if (res.error) {
      console.log("⚠️ Could not list buckets:", res.error.message || res.error);
    }
  })
  .catch((e) => {
    console.log("⚠️ Error listing buckets:", e?.message || e);
  });

// ✅ INIT RUNAWAY API
const runawayApiKey = readEnv("RUNAWAY_API_KEY") || readEnv("RUNWAY_API_KEY") || "";
const runawayApiUrl = readEnv("RUNAWAY_API_URL") || "https://api.runwayml.com/v1";
const USE_MOCK_API = readEnv("USE_MOCK_API") === "true"; // Set USE_MOCK_API=true for testing without valid API key

// ✅ INIT NOVITA API (optional provider for text-to-video)
const novitaApiKey = readEnv("NOVITA_API_KEY") || "";
const novitaApiUrl = readEnv("NOVITA_API_URL") || "";
const videoProvider = (readEnv("VIDEO_PROVIDER") || "runway").toLowerCase();
const novitaModelName = readEnv("NOVITA_MODEL_NAME") || "";

// ✅ INIT GEMINI (used as understanding layer for media flows)
const geminiApiKey = readEnv("GEMINI_API_KEY") || "";
const geminiModelId = readEnv("GEMINI_MODEL_ID") || "gemini-2.5-flash";
// ✅ Veo model for AI video generation (images only for now)
const veoModelId = readEnv("VEO_MODEL_ID") || "veo-3.1-generate-preview";

console.log("✅ Video generation service configured");
if (USE_MOCK_API) {
  console.log("⚠️  USING MOCK API (testing mode)");
} else {
  console.log("🔑 Using real video provider:", videoProvider);
}

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ VIDEO PROCESS FUNCTION (uploaded source - trims/exports video)
const processVideo = (input, output, duration = null) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(input).setStartTime(0);

    if (Number.isFinite(Number(duration)) && Number(duration) > 0) {
      command = command.setDuration(Number(duration));
    }

    command
      .output(output)
      .on("end", () => {
        console.log("✅ Video processed");
        resolve(output);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg Error:", err);
        reject(err);
      })
      .run();
  });
};

const processVideoRange = (input, output, start = 0, duration = null) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(input).setStartTime(Math.max(0, Number(start) || 0));

    if (Number.isFinite(Number(duration)) && Number(duration) > 0) {
      command = command.setDuration(Number(duration));
    }

    command
      .output(output)
      .on("end", () => {
        console.log("✅ Video range processed");
        resolve(output);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg Range Error:", err);
        reject(err);
      })
      .run();
  });
};

const getVideoDuration = (inputPath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        resolve(10);
        return;
      }
      const duration = Number(metadata?.format?.duration || 10);
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 10);
    });
  });
};

// ✅ Trim/merge audio to match a given video
const mergeVideoWithTrimmedAudio = async (videoPath, audioPath) => {
  if (!videoPath || !audioPath) return videoPath;

  const videoDuration = await getVideoDuration(videoPath);
  const trimmedAudioPath = makeTempFilePath("trimmed-audio.mp4");

  // First, trim the audio to the video duration so that if the
  // audio is longer (e.g. 10s vs 5s video), only the first part
  // is kept and the rest is discarded.
  await new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .outputOptions([`-t ${videoDuration.toFixed(3)}`])
      .output(trimmedAudioPath)
      .on("end", () => resolve())
      .on("error", (err) => {
        console.error("❌ [AUDIO] Error trimming audio:", err);
        reject(err);
      })
      .run();
  });

  const outputPath = makeTempFilePath("with-audio.mp4");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(trimmedAudioPath)
      .outputOptions(["-c:v copy", "-c:a aac"])
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [AUDIO] Audio merged with video (trimmed to duration)");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [AUDIO] Error merging audio:", err);
        reject(err);
      })
      .run();
  });

  // Best-effort cleanup of the temporary trimmed audio file
  fs.unlink(trimmedAudioPath, () => {});

  return outputPath;
};

// ✅ Adjust a generated video to match the user-selected frame
// (aspect ratio) after the API has produced it.
const adjustVideoToFrame = async (inputPath, frame) => {
  if (!inputPath) return inputPath;

  const resolutionMap = {
    "16:9": "1920x1080",
    "9:16": "1080x1920",
    "1:1": "1080x1080",
    "4:3": "1440x1080",
    "3:4": "1080x1440",
    "4:5": "1080x1350",
    "2.35:1": "1920x817",
  };

  const size = resolutionMap[frame] || resolutionMap["16:9"];
  if (!size) return inputPath;

  const [wStr, hStr] = size.split("x");
  const w = Number(wStr) || 1920;
  const h = Number(hStr) || 1080;

  const outputPath = makeTempFilePath("frame-adjusted.mp4");

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilters(
        `scale=${w}:${h}:force_original_aspect_ratio=cover,crop=${w}:${h}`,
      )
      .outputOptions(["-c:a copy"])
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [FRAME] Adjusted video to frame", frame, `(${w}x${h})`);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [FRAME] Error adjusting frame:", err);
        reject(err);
      })
      .run();
  });

  return outputPath;
};

// ✅ IMAGE → VIDEO FUNCTION (loops single image for given duration)
const createVideoFromImage = (imagePath, outputPath, duration = 10, frame = "16:9") => {
  const resolutionMap = {
    "16:9": "1920x1080",
    "9:16": "1080x1920",
    "1:1": "1080x1080",
    "4:3": "1440x1080",
    "3:4": "1080x1440",
    "4:5": "1080x1350",
    "2.35:1": "1920x817",
  };

  const size = resolutionMap[frame] || resolutionMap["16:9"];

  return new Promise((resolve, reject) => {
    let command = ffmpeg(imagePath)
      .loop()
      .setDuration(duration)
      .outputOptions([
        "-c:v libx264",
        `-t ${duration}`,
        "-pix_fmt yuv420p",
      ]);

    if (size) {
      command = command.size(size);
    }

    command
      .output(outputPath)
      .on("end", () => {
        console.log("✅ Image converted to video");
        resolve(outputPath);
      })
      .on("error", (err) => {
        console.error("❌ FFmpeg Image->Video Error:", err);
        reject(err);
      })
      .run();
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractOutputUrl = (predictionOutput) => {
  if (!predictionOutput) {
    return "";
  }
  if (typeof predictionOutput === "string") {
    return predictionOutput;
  }
  if (Array.isArray(predictionOutput) && predictionOutput.length > 0) {
    return typeof predictionOutput[0] === "string" ? predictionOutput[0] : "";
  }
  if (typeof predictionOutput === "object") {
    if (typeof predictionOutput.url === "string") {
      return predictionOutput.url;
    }
    if (typeof predictionOutput.video === "string") {
      return predictionOutput.video;
    }
  }
  return "";
};

const getSupabasePlaybackUrl = async (bucketName, storagePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }

    if (error) {
      console.warn("⚠️ [STORAGE] createSignedUrl failed, trying public URL:", error.message || error);
    }
  } catch (error) {
    console.warn("⚠️ [STORAGE] createSignedUrl threw error, trying public URL:", error?.message || error);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  return data.publicUrl;
};

const uploadVideoUrlToSupabase = async (videoUrl, fileName, bucketName = supabaseBucket) => {
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Unable to download generated video: ${videoResponse.status}`);
  }

  const arrayBuffer = await videoResponse.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const storagePath = `generated/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    console.error("❌ [STORAGE] uploadVideoUrlToSupabase error:", error.message || error);

    // Fallback: if Supabase upload fails (e.g. bucket not found),
    // still return a URL from the local /videos static route based
    // on a temporary output file so the frontend can play it.
    try {
      const tempFilePath = `outputs/${fileName}`;
      fs.writeFileSync(tempFilePath, fileBuffer);
      const publicUrl = `http://localhost:5000/videos/${fileName}`;
      console.warn("⚠️ [STORAGE] Falling back to local /videos URL:", publicUrl);
      return { publicUrl, storagePath: null };
    } catch (fallbackError) {
      console.error("❌ [STORAGE] Fallback URL construction failed:", fallbackError.message || fallbackError);
      throw error;
    }
  }

  const playbackUrl = await getSupabasePlaybackUrl(bucketName, storagePath);
  return { publicUrl: playbackUrl, storagePath };
};

const uploadToSupabase = async (filePath, fileName, bucketName = supabaseBucket) => {
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `generated/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    console.error("❌ [STORAGE] uploadToSupabase error:", error.message || error);

    // Fallback: if storage upload fails (e.g. bucket not found),
    // still return a usable URL from the local /videos static route
    // so the user gets a playable video.
    try {
      const relative = filePath.replace(/^outputs[\\/]/, "");
      const publicUrl = `http://localhost:5000/videos/${relative}`;
      console.warn("⚠️ [STORAGE] Falling back to local /videos URL:", publicUrl);
      return { publicUrl, storagePath: null };
    } catch (fallbackError) {
      console.error("❌ [STORAGE] Fallback URL construction failed:", fallbackError.message || fallbackError);
      throw error;
    }
  }

  const playbackUrl = await getSupabasePlaybackUrl(bucketName, storagePath);
  return { publicUrl: playbackUrl, storagePath };
};

const uploadReferenceMediaToSupabase = async (sourcePath, originalName) => {
  const fileBuffer = fs.readFileSync(sourcePath);
  const safeName = String(originalName || "reference.bin").replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `reference/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(SUPABASE_BUCKETS.REFERENCE_VIDEO)
    .upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(SUPABASE_BUCKETS.REFERENCE_VIDEO).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
};

// ✅ Upload a local media file (image/video) to Gemini Files API
// Returns the File's uri and downloadUri if available.
const uploadMediaToGeminiFile = async (filePath, displayName, mimeType) => {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const boundary = `Boundary${Date.now()}`;
  const metadata = JSON.stringify({
    file: {
      displayName: displayName || "upload",
    },
  });

  const fileBuffer = fs.readFileSync(filePath);

  const bodyParts = [];
  bodyParts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadata}\r\n`,
      "utf8",
    ),
  );
  bodyParts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Type: ${mimeType || "application/octet-stream"}\r\n\r\n`,
      "utf8",
    ),
  );
  bodyParts.push(fileBuffer);
  bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"));

  const body = Buffer.concat(bodyParts);

  const response = await fetch("https://generativelanguage.googleapis.com/upload/v1beta/files", {
    method: "POST",
    headers: {
      "x-goog-api-key": geminiApiKey,
      "X-Goog-Upload-Protocol": "multipart",
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("❌ [Files] media.upload failed:", response.status, text);
    throw new Error("Failed to upload media to Gemini Files API");
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid response from Gemini Files API");
  }

  const file = json.file || json;
  return {
    uri: file.uri || file.name || "",
    downloadUri: file.downloadUri || "",
  };
};

// ✅ Download a Gemini File given its downloadUri into a Buffer
const downloadGeminiFileToBuffer = async (downloadUri) => {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const response = await fetch(downloadUri, {
    headers: {
      "x-goog-api-key": geminiApiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("❌ [Files] download failed:", response.status, text);
    throw new Error("Failed to download Gemini file");
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

// ✅ Use Veo (Gemini Gen Media) to generate a video from images + prompt
// This is used ONLY when the user uploaded images (no videos).
// The API can only generate short clips (below ~10 seconds), so we
// split the requested duration into multiple segments (e.g. 6+6+6+6+6
// for 30 seconds), generate each segment, then concatenate them locally.
//
// This helper now returns a local video path so the caller can
// optionally merge audio and then upload the final file to Supabase.
const generateVeoVideoFromImages = async (
  prompt,
  durationSeconds,
  aspectRatio,
  imageFiles,
) => {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set for Veo generation");
  }

  const totalSecRaw = Number(durationSeconds) || 8;
  const totalSec = Math.max(4, Math.min(180, totalSecRaw));
  const aspect = aspectRatio || "16:9";

  // Split duration into API-friendly segments (<= 10s each).
  // We bias towards ~6 second chunks so that, for example,
  // 30 seconds becomes 6+6+6+6+6.
  const MAX_SEGMENT = 10;
  const PREFERRED_SEGMENT = 6;

  const segmentDurations = [];
  let remaining = totalSec;

  while (remaining > MAX_SEGMENT) {
    segmentDurations.push(PREFERRED_SEGMENT);
    remaining -= PREFERRED_SEGMENT;
  }

  if (remaining > 0) {
    const last = Math.max(3, Math.min(MAX_SEGMENT, remaining));
    segmentDurations.push(last);
  }

  console.log("🎬 [Veo] Target duration split into segments:", segmentDurations);

  // Upload up to 3 images to Files API once and reuse them for all segments.
  const imagesToUse = imageFiles.slice(0, 3);
  const uploadedImages = [];

  for (const img of imagesToUse) {
    try {
      console.log("📤 [Veo] Uploading image to Gemini Files:", img.originalname);
      const uploaded = await uploadMediaToGeminiFile(img.path, img.originalname, img.mimetype);
      if (uploaded.uri) {
        uploadedImages.push(uploaded);
      }
    } catch (e) {
      console.error("❌ [Veo] Failed to upload image:", e?.message || e);
    }
  }

  if (!uploadedImages.length) {
    throw new Error("No images could be uploaded to Gemini Files for Veo");
  }

  const segmentPaths = [];
  const generatedTempFiles = [];

  // Helper to run one Veo generation for a given segment duration
  const runVeoSegment = async (segmentDuration, index) => {
    const instances = [
      {
        prompt: String(prompt || ""),
        aspectRatio: aspect,
        durationSeconds: segmentDuration,
        referenceImages: uploadedImages.map((img) => ({
          image: {
            fileUri: img.uri,
          },
        })),
      },
    ];

    // Also set the main starting frame as the first image, if present.
    if (uploadedImages[0]) {
      instances[0].image = {
        fileUri: uploadedImages[0].uri,
      };
    }

    console.log("🎬 [Veo] Starting Veo segment", {
      index,
      durationSeconds: segmentDuration,
      aspectRatio: aspect,
      imageCount: uploadedImages.length,
    });

    const requestBody = {
      instances,
      parameters: {
        aspectRatio: aspect,
        durationSeconds: segmentDuration,
        resolution: "720p",
        personGeneration: "allow_all",
      },
    };

    const initialResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${veoModelId}:predictLongRunning`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    const initialText = await initialResponse.text();
    if (!initialResponse.ok) {
      console.error("❌ [Veo] predictLongRunning failed:", initialResponse.status, initialText);
      throw new Error("Veo video generation request failed");
    }

    let initialJson;
    try {
      initialJson = JSON.parse(initialText);
    } catch (e) {
      throw new Error("Invalid Veo operation response");
    }

    const operationName = initialJson.name || initialJson.operation?.name;
    if (!operationName) {
      throw new Error("Missing operation name in Veo response");
    }

    console.log("⏳ [Veo] Operation started:", operationName);

    // Poll the long-running operation until done or timeout
    const maxAttempts = 60; // up to ~5 minutes with 5s interval
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await sleep(5000);

      const opResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${encodeURIComponent(operationName)}`,
        {
          headers: {
            "x-goog-api-key": geminiApiKey,
          },
        },
      );

      const opText = await opResponse.text();
      if (!opResponse.ok) {
        console.error("❌ [Veo] Operation status failed:", opResponse.status, opText);
        throw new Error("Failed to check Veo operation status");
      }

      let opJson;
      try {
        opJson = JSON.parse(opText);
      } catch (e) {
        throw new Error("Invalid Veo operation status response");
      }

      if (!opJson.done) {
        console.log(`⏳ [Veo] Waiting for completion (${attempt + 1}/${maxAttempts})...`);
        continue;
      }

      if (opJson.error) {
        console.error("❌ [Veo] Operation error:", opJson.error);
        throw new Error("Veo operation failed");
      }

      const response = opJson.response || {};
      const generatedList =
        response.generated_videos || response.generatedVideos || [];

      let videoFile = null;
      if (Array.isArray(generatedList) && generatedList.length > 0) {
        videoFile = generatedList[0].video || generatedList[0];
      } else if (response.video) {
        videoFile = response.video;
      }

      if (!videoFile) {
        console.error("❌ [Veo] No video in operation response:", response);
        throw new Error("Veo did not return a generated video");
      }

      // Prefer the provided downloadUri, fall back to files.get if needed.
      let downloadUri = videoFile.downloadUri || videoFile.download_uri || "";
      let fileUri = videoFile.uri || videoFile.name || "";

      if (!downloadUri && fileUri) {
        const fileMetaResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/${encodeURIComponent(
            fileUri,
          )}`,
          {
            headers: {
              "x-goog-api-key": geminiApiKey,
            },
          },
        );

        const fileMetaText = await fileMetaResp.text();
        if (!fileMetaResp.ok) {
          console.error("❌ [Veo] files.get failed:", fileMetaResp.status, fileMetaText);
          throw new Error("Failed to fetch Veo video file metadata");
        }

        let fileMeta;
        try {
          fileMeta = JSON.parse(fileMetaText);
        } catch (e) {
          throw new Error("Invalid Veo file metadata response");
        }

        downloadUri = fileMeta.downloadUri || fileMeta.download_uri || "";
      }

      if (!downloadUri) {
        throw new Error("Veo video has no download URI");
      }

      console.log("📥 [Veo] Downloading generated video from:", downloadUri);
      const videoBuffer = await downloadGeminiFileToBuffer(downloadUri);

      const segmentFileName = `veo-segment-${Date.now()}-${index}.mp4`;
      const segmentPath = `outputs/${segmentFileName}`;
      fs.writeFileSync(segmentPath, videoBuffer);
      segmentPaths.push(segmentPath);
      generatedTempFiles.push(segmentPath);

      return;
    }

    throw new Error("Veo operation timed out before completion");
  };

  // Generate each segment sequentially
  for (let i = 0; i < segmentDurations.length; i++) {
    await runVeoSegment(segmentDurations[i], i);
  }

  // If only one segment, upload it directly.
  let finalOutputPath = segmentPaths[0];

  if (segmentPaths.length > 1) {
    const baseNameList = segmentPaths.map((p, idx) => {
      const name = p.split("/").pop() || `veo-segment-${idx}.mp4`;
      return name;
    });

    const listFileName = `veo-concat-${Date.now()}.txt`;
    const listFilePath = `outputs/${listFileName}`;
    const listContent = baseNameList.map((name) => `file '${name}'`).join("\n");
    fs.writeFileSync(listFilePath, listContent);
    generatedTempFiles.push(listFilePath);

    const concatenatedPath = `outputs/veo-final-${Date.now()}.mp4`;

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(listFilePath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy"])
        .output(concatenatedPath)
        .on("end", () => {
          console.log("✅ [Veo] Concatenated Veo segments into final video");
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ [Veo] Error concatenating segments:", err);
          reject(err);
        })
        .run();
    });

    finalOutputPath = concatenatedPath;
    generatedTempFiles.push(concatenatedPath);
  }

  // Clean up only intermediate segment files; keep the final output
  // so the caller can merge audio and upload as needed.
  generatedTempFiles.forEach((p) => {
    if (p !== finalOutputPath) {
      fs.unlink(p, () => {});
    }
  });

  return {
    localPath: finalOutputPath,
    durationSeconds: totalSec,
  };
};

// 🔌 OPTIONAL AI TRANSFORM FOR MEDIA FLOW
// This is where we will later plug in an external
// AI provider that uses both the prompt and the
// uploaded images/video to generate a new clip.
//
// For now it is a no-op that just returns the
// original video path so the flow is complete
// even without a real API key.
const transformVideoWithPrompt = async (inputPath, prompt, duration, frame) => {
  if (!inputPath) return inputPath;

  const safePrompt = String(prompt || "").trim();
  if (!safePrompt) {
    return inputPath;
  }

  // MOCK / PLACEHOLDER BEHAVIOR
  if (USE_MOCK_API) {
    console.log("🎨 [API-MEDIA] Mock AI transform (prompt only):", safePrompt);
    console.log("🎨 [API-MEDIA] Duration:", duration, "seconds, frame:", frame || "16:9");
    // In mock mode we just keep the ffmpeg output.
    return inputPath;
  }

  // REAL AI INTEGRATION WILL GO HERE.
  if (!geminiApiKey) {
    console.warn("⚠️ [API-MEDIA] GEMINI_API_KEY is not set – returning base video.");
    return inputPath;
  }

  try {
    const summaryPrompt = [
      "You are assisting an AI video pipeline.",
      "We already rendered a base video from user-uploaded images or clips using ffmpeg.",
      "The user prompt is:",
      safePrompt,
      "Duration (seconds):",
      String(duration || 0),
      "Aspect ratio:",
      frame || "16:9",
      "Return a short textual description of how the final video should look.",
    ].join(" ");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModelId}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: summaryPrompt }],
          },
        ],
      }),
    });

    const text = await response.text();
    if (!response.ok) {
      console.warn("⚠️ [API-MEDIA] Gemini call failed:", response.status, text);
    } else {
      console.log("🧠 [API-MEDIA] Gemini understanding response:", text.slice(0, 500));
    }
  } catch (error) {
    console.error("❌ [API-MEDIA] Error calling Gemini API:", error?.message || error);
  }

  // For now we keep the ffmpeg-generated video as the final output.
  return inputPath;
};

const buildAtempoChain = (speed) => {
  const factors = [];
  let remaining = speed;

  while (remaining < 0.5) {
    factors.push(0.5);
    remaining /= 0.5;
  }
  while (remaining > 2.0) {
    factors.push(2.0);
    remaining /= 2.0;
  }

  factors.push(Math.max(0.5, Math.min(2.0, remaining)));
  return factors.map((f) => `atempo=${f.toFixed(3)}`).join(",");
};

const hasAudioStream = (inputPath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        resolve(false);
        return;
      }
      const streams = Array.isArray(metadata?.streams) ? metadata.streams : [];
      resolve(streams.some((s) => s?.codec_type === "audio"));
    });
  });
};

const applyEditorAdjustments = async (inputPath, editorSelections) => {
  if (!inputPath || !editorSelections || typeof editorSelections !== "object") {
    return inputPath;
  }

  const trim = editorSelections?.trim || {};
  const speed = editorSelections?.speed || {};
  const rotate = editorSelections?.rotate || {};
  const volume = editorSelections?.volume || {};
  const zoom = editorSelections?.zoom || {};
  const crop = editorSelections?.crop || {};
  const keyframe = editorSelections?.keyframe || {};

  const trimEnabled = Boolean(trim?.enabled);
  const speedEnabled = Boolean(speed?.enabled);
  const rotateEnabled = Boolean(rotate?.enabled);
  const zoomEnabled = Boolean(zoom?.enabled);
  const cropEnabled = Boolean(crop?.enabled);
  const keyframeEnabled = Boolean(keyframe?.enabled);

  const speedValue = Math.max(0.1, Math.min(3, Number(speed?.value) || 1));
  const rotateDegreesRaw = Number(rotate?.degrees);
  const rotateDegrees = Number.isFinite(rotateDegreesRaw)
    ? ((Math.round(rotateDegreesRaw) % 360) + 360) % 360
    : 0;
  const muted = Boolean(volume?.muted);
  const volumeLevel = Math.max(0, Math.min(2, Number(volume?.level) || 1));
  const zoomAmount = Math.max(1, Math.min(3, Number(zoom?.amount) || 1));
  const cropWidthPct = Math.max(10, Math.min(100, Number(crop?.widthPct) || 100));
  const cropHeightPct = Math.max(10, Math.min(100, Number(crop?.heightPct) || 100));
  const cropCenterX = Math.max(0, Math.min(100, Number(crop?.centerX) || 50));
  const cropCenterY = Math.max(0, Math.min(100, Number(crop?.centerY) || 50));
  const keyframeMode = String(keyframe?.mode || "none");
  const keyframeAmount = Math.max(1.05, Math.min(1.8, Number(keyframe?.amount) || 1.25));

  const start = Math.max(0, Number(trim?.start) || 0);
  const endRaw = trim?.end == null ? null : Number(trim?.end);
  const end = Number.isFinite(endRaw) ? Math.max(start + 0.01, endRaw) : null;
  const duration = end != null ? Math.max(0.01, end - start) : null;
  const hasPerClipTrim = Boolean(trim?.clipRanges && Object.keys(trim.clipRanges || {}).length > 0);

  const needsTrim = !hasPerClipTrim && trimEnabled && (start > 0 || duration != null);
  const needsSpeed = speedEnabled && Math.abs(speedValue - 1) > 0.001;
  const needsRotate = rotateEnabled && rotateDegrees !== 0;
  const needsVolume = muted || Math.abs(volumeLevel - 1) > 0.001;
  const needsZoom = zoomEnabled && zoomAmount > 1.001;
  const needsCrop =
    cropEnabled &&
    (cropWidthPct < 99.99 || cropHeightPct < 99.99 || Math.abs(cropCenterX - 50) > 0.01 || Math.abs(cropCenterY - 50) > 0.01);
  const needsKeyframe = keyframeEnabled && keyframeMode !== "none";

  if (!needsTrim && !needsSpeed && !needsRotate && !needsVolume && !needsZoom && !needsCrop && !needsKeyframe) {
    return inputPath;
  }

  const outputPath = makeTempFilePath("editor-adjusted.mp4");
  const videoFilters = [];
  const audioFilters = [];

  if (needsSpeed) {
    const stretch = 1 / speedValue;
    videoFilters.push(`setpts=${stretch.toFixed(5)}*PTS`);
    audioFilters.push(buildAtempoChain(speedValue));
  }

  if (needsRotate) {
    if (rotateDegrees === 90) {
      videoFilters.push("transpose=1");
    } else if (rotateDegrees === 180) {
      videoFilters.push("transpose=1,transpose=1");
    } else if (rotateDegrees === 270) {
      videoFilters.push("transpose=2");
    }
  }

  if (needsCrop) {
    const xPct = Math.max(0, Math.min(100 - cropWidthPct, cropCenterX - cropWidthPct / 2));
    const yPct = Math.max(0, Math.min(100 - cropHeightPct, cropCenterY - cropHeightPct / 2));
    videoFilters.push(
      `crop=iw*${(cropWidthPct / 100).toFixed(4)}:ih*${(cropHeightPct / 100).toFixed(4)}:iw*${(xPct / 100).toFixed(4)}:ih*${(yPct / 100).toFixed(4)}`,
    );
  }

  if (needsZoom) {
    videoFilters.push(
      `scale=iw*${zoomAmount.toFixed(4)}:ih*${zoomAmount.toFixed(4)},crop=iw/${zoomAmount.toFixed(4)}:ih/${zoomAmount.toFixed(4)}`,
    );
  }

  if (needsKeyframe) {
    const animDuration = Math.max(0.1, Number(duration) || 10);
    let zoomExpr = "1";
    if (keyframeMode === "zoom-in") {
      zoomExpr = `1+${(keyframeAmount - 1).toFixed(4)}*(t/${animDuration.toFixed(4)})`;
    } else if (keyframeMode === "zoom-out") {
      zoomExpr = `${keyframeAmount.toFixed(4)}-${(keyframeAmount - 1).toFixed(4)}*(t/${animDuration.toFixed(4)})`;
    } else if (keyframeMode === "pulse") {
      zoomExpr = `1+${(keyframeAmount - 1).toFixed(4)}*(0.5+0.5*sin(2*PI*t/${animDuration.toFixed(4)}))`;
    }

    videoFilters.push(
      `scale=iw*(${zoomExpr}):ih*(${zoomExpr}),crop=iw/(${zoomExpr}):ih/(${zoomExpr})`,
    );
  }

  if (needsVolume) {
    audioFilters.push(`volume=${muted ? 0 : volumeLevel.toFixed(3)}`);
  }

  const hasAudio = await hasAudioStream(inputPath);
  const safeAudioFilters = hasAudio ? audioFilters : [];

  console.log("🎚️ [API-MEDIA] Applying editor adjustments", {
    trim: {
      enabled: trimEnabled,
      start,
      end,
      duration,
    },
    speed: {
      enabled: speedEnabled,
      value: speedValue,
    },
    rotate: {
      enabled: rotateEnabled,
      degrees: rotateDegrees,
    },
    zoom: {
      enabled: zoomEnabled,
      amount: zoomAmount,
    },
    crop: {
      enabled: cropEnabled,
      centerX: cropCenterX,
      centerY: cropCenterY,
      widthPct: cropWidthPct,
      heightPct: cropHeightPct,
    },
    keyframe: {
      enabled: keyframeEnabled,
      mode: keyframeMode,
      amount: keyframeAmount,
    },
    volume: {
      muted,
      level: volumeLevel,
      hasAudio,
    },
    videoFilters,
    audioFilters: safeAudioFilters,
  });

  await new Promise((resolve, reject) => {
    let command = ffmpeg().input(inputPath);

    if (needsTrim) {
      command = command.setStartTime(start);
      if (duration != null) {
        command = command.setDuration(duration);
      }
    }

    if (videoFilters.length) {
      command = command.videoFilters(videoFilters);
    }

    if (safeAudioFilters.length) {
      command = command.audioFilters(safeAudioFilters);
    }

    const outputOptions = ["-c:v libx264", "-pix_fmt yuv420p", "-movflags +faststart"];
    if (hasAudio) {
      outputOptions.push("-c:a aac");
    } else {
      outputOptions.push("-an");
    }

    command
      .outputOptions(outputOptions)
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [API-MEDIA] Editor adjustments rendering complete");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [API-MEDIA] Editor adjustments rendering failed:", err);
        reject(err);
      })
      .run();
  });

  return outputPath;
};

const escapeDrawtext = (text = "") => {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
};

const applyEffectsToVideo = async (inputPath, effects, durationSeconds = 10) => {
  const selectedEffect = String(effects?.selectedEffect || "none");
  const settings = effects?.settings || {};

  if (!inputPath || selectedEffect === "none") {
    console.log("ℹ️ [API-MEDIA] No deterministic effect applied. selectedEffect=", selectedEffect);
    return inputPath;
  }

  const outputPath = makeTempFilePath("effect.mp4");
  const videoFilters = [];
  let audioFilter = "";

  if (selectedEffect === "fade-in" || selectedEffect === "transition") {
    const fadeDuration = Math.min(4, Math.max(2, Number(durationSeconds || 10) * 0.4));
    const fadeOutStart = Math.max(0, Number(durationSeconds || 10) - fadeDuration);
    videoFilters.push(`fade=t=in:st=0:d=${fadeDuration}`);
    videoFilters.push(`fade=t=out:st=${fadeOutStart}:d=${fadeDuration}`);
  }

  if (selectedEffect === "blur") {
    const blur = Math.max(0, Math.min(30, Number(settings.blurAmount) || 10));
    videoFilters.push(`boxblur=${blur}:1`);
  }

  if (selectedEffect === "color-correction") {
    const rawBrightness = Number(settings.brightness);
    const rawContrast = Number(settings.contrast);
    const rawSaturation = Number(settings.saturation);

    const eqBrightness = Math.max(-1, Math.min(1, (Number.isFinite(rawBrightness) ? rawBrightness : 1) - 1));
    const eqContrast = Math.max(0.1, Math.min(3, Number.isFinite(rawContrast) ? rawContrast : 1));
    const eqSaturation = Math.max(0, Math.min(3, Number.isFinite(rawSaturation) ? rawSaturation : 1));

    videoFilters.push(`eq=brightness=${eqBrightness.toFixed(3)}:contrast=${eqContrast.toFixed(3)}:saturation=${eqSaturation.toFixed(3)}`);
  }

  if (selectedEffect === "vintage") {
    // Old-film look: lowered saturation + warm tone curve + temporal grain.
    videoFilters.push("eq=saturation=0.72:contrast=0.93:brightness=0.03");
    videoFilters.push("curves=r='0/0.08 0.60/0.52 1/0.92':g='0/0.06 0.70/0.56 1/0.86':b='0/0.05 0.80/0.52 1/0.76'");
    videoFilters.push("noise=alls=14:allf=t+u");
  }

  if (selectedEffect === "black-white") {
    videoFilters.push("hue=s=0");
  }

  if (selectedEffect === "cinematic") {
    videoFilters.push("eq=contrast=1.4:brightness=0.08:saturation=1.2");
    videoFilters.push("colorbalance=rs=0.08:gs=0.02:bs=-0.08");
  }

  if (selectedEffect === "warm") {
    videoFilters.push("colorbalance=rs=0.12:gs=0.05:bs=-0.10");
    videoFilters.push("eq=saturation=1.1:brightness=0.03");
  }

  if (selectedEffect === "cool") {
    videoFilters.push("colorbalance=rs=-0.10:gs=-0.05:bs=0.14");
    videoFilters.push("eq=saturation=1.05");
  }

  if (selectedEffect === "sepia") {
    videoFilters.push("colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131");
  }

  if (selectedEffect === "hdr") {
    videoFilters.push("eq=contrast=1.6:brightness=0.10:saturation=1.4");
    videoFilters.push("unsharp=5:5:1.1:5:5:0.0");
  }

  if (selectedEffect === "vivid") {
    videoFilters.push("eq=saturation=2.5:contrast=1.3:brightness=0.07");
  }

  if (selectedEffect === "soft-glow") {
    videoFilters.push("gblur=sigma=1.2,eq=brightness=0.08:contrast=1.05");
  }

  if (selectedEffect === "retro-film") {
    videoFilters.push("eq=saturation=0.92:contrast=1.06:brightness=0.02");
    videoFilters.push("colorbalance=rs=-0.03:gs=0.05:bs=-0.08");
    videoFilters.push("noise=alls=10:allf=t+u");
    videoFilters.push("drawgrid=width=iw:height=4:thickness=1:color=black@0.08");
  }

  if (selectedEffect === "slow-motion") {
    const speed = Math.max(0.1, Math.min(1, Number(settings.slowMotionSpeed) || 0.25));
    const stretch = 1 / speed;
    videoFilters.push(`setpts=${stretch.toFixed(3)}*PTS`);
    // Keep as video-speed effect for robustness even when input has no audio stream.
    audioFilter = "";
  }

  if (selectedEffect === "glitch") {
    const intensity = Math.max(0, Math.min(3, Number(settings.glitchIntensity) || 1));
    const noiseLevel = Math.round(10 + intensity * 20);
    videoFilters.push(`noise=alls=${noiseLevel}:allf=t+u`);
  }

  if (selectedEffect === "zoom") {
    videoFilters.push("scale=iw*1.2:ih*1.2,crop=iw/1.2:ih/1.2");
  }

  if (selectedEffect === "green-screen") {
    // Use strong green suppression so the effect is visible even when true chroma scenes are absent.
    videoFilters.push("lutrgb=g='val*0.15'");
  }

  if (selectedEffect === "text-animation") {
    const text = escapeDrawtext(settings.animatedText || "YOUR TEXT HERE");
    videoFilters.push(`drawtext=text='${text}':x=(w-text_w)/2:y=(h-text_h)/2:fontsize=64:fontcolor=white:shadowcolor=black@0.8:shadowx=2:shadowy=2:alpha='0.7+0.3*sin(2*PI*t)'`);
  }

  if (selectedEffect === "motion-tracking") {
    // Approximate motion highlight effect with frame-difference style rendering.
    videoFilters.push("tblend=all_mode=difference,eq=contrast=2.0:brightness=0.05:saturation=0");
  }

  if (!videoFilters.length && !audioFilter) {
    console.log("ℹ️ [API-MEDIA] Effect skipped - no filters produced", {
      selectedEffect,
      hasAudioFilter: Boolean(audioFilter),
    });
    return inputPath;
  }

  console.log("🎚️ [API-MEDIA] Effect filter chain", {
    selectedEffect,
    videoFilters,
    audioFilter: audioFilter || "none",
  });

  await new Promise((resolve, reject) => {
    let command = ffmpeg().input(inputPath);

    if (videoFilters.length) {
      command = command.videoFilters(videoFilters);
    }

    if (audioFilter) {
      command = command.audioFilters([audioFilter]);
    }

    command
      .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-c:a aac", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [API-MEDIA] Effect rendering complete:", selectedEffect);
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [API-MEDIA] Effect rendering failed:", err);
        reject(err);
      })
      .run();
  });

  return outputPath;
};

const applyTextOverlayToVideo = async (inputPath, textOverlay) => {
  const enabled = Boolean(textOverlay?.enabled);
  const text = String(textOverlay?.text || "").trim();

  if (!inputPath || !enabled || !text) {
    return inputPath;
  }

  const size = Math.max(16, Math.min(180, Number(textOverlay?.fontSize) || 48));
  const xPercent = Math.max(0, Math.min(100, Number(textOverlay?.position?.x) || 50));
  const yPercent = Math.max(0, Math.min(100, Number(textOverlay?.position?.y) || 50));
  const color = /^#[0-9a-fA-F]{6,8}$/.test(String(textOverlay?.color || ""))
    ? String(textOverlay.color)
    : "#ffffff";
  const escapedText = escapeDrawtext(text);
  const outputPath = makeTempFilePath("text-overlay.mp4");
  const xExpr = `(w-text_w)*${(xPercent / 100).toFixed(4)}`;
  const yExpr = `(h-text_h)*${(yPercent / 100).toFixed(4)}`;
  const drawTextFilter = [
    `drawtext=text='${escapedText}'`,
    `fontsize=${size}`,
    `font='${String(textOverlay?.fontFamily || "Arial").replace(/'/g, "")}'`,
    `fontcolor=${color}`,
    `x=${xExpr}`,
    `y=${yExpr}`,
    "shadowcolor=black@0.7",
    "shadowx=2",
    "shadowy=2",
  ].join(":");

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputPath)
      .videoFilters([drawTextFilter])
      .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-c:a copy", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [API-MEDIA] Text overlay rendering complete");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [API-MEDIA] Text overlay rendering failed:", err);
        reject(err);
      })
      .run();
  });

  return outputPath;
};

const inferEffectFromPrompt = (promptText = "") => {
  const p = String(promptText || "").toLowerCase();
  if (!p) return "none";
  if (p.includes("fade")) return "fade-in";
  if (p.includes("blur")) return "blur";
  if (p.includes("zoom")) return "zoom";
  if (p.includes("black and white") || p.includes("black-white") || p.includes("bw") || p.includes("grayscale")) return "black-white";
  if (p.includes("cinematic") || p.includes("movie look") || p.includes("teal orange")) return "cinematic";
  if (p.includes("warm")) return "warm";
  if (p.includes("cool")) return "cool";
  if (p.includes("sepia")) return "sepia";
  if (p.includes("hdr") || p.includes("high detail") || p.includes("high dynamic")) return "hdr";
  if (p.includes("vivid") || p.includes("super saturated")) return "vivid";
  if (p.includes("soft glow") || p.includes("bloom")) return "soft-glow";
  if (p.includes("retro film") || p.includes("vhs") || p.includes("scanline")) return "retro-film";
  if (p.includes("color") || p.includes("saturation") || p.includes("contrast") || p.includes("brightness")) return "color-correction";
  if (p.includes("vintage") || p.includes("old film")) return "vintage";
  if (p.includes("green screen") || p.includes("chroma")) return "green-screen";
  if (p.includes("slow")) return "slow-motion";
  if (p.includes("glitch")) return "glitch";
  if (p.includes("transition")) return "transition";
  if (p.includes("text")) return "text-animation";
  if (p.includes("motion tracking")) return "motion-tracking";
  return "none";
};

const mapClipTransitionToXfade = (transition = "none") => {
  const t = String(transition || "none");
  if (t === "cross-dissolve") return "dissolve";
  if (t === "slide-left") return "slideleft";
  if (t === "slide-right") return "slideright";
  if (t === "dip-black") return "fadeblack";
  if (t === "dip-white") return "fadewhite";
  if (t === "zoom-transition") return "zoomin";
  if (t === "blur-transition") return "hblur";
  if (t === "spin-transition") return "radial";
  if (t === "glitch-transition") return "pixelize";
  if (t === "flash-transition") return "fadefast";
  return "dissolve";
};

const mergeSegmentsWithTransitions = async (segmentPaths, transitions, outputPath) => {
  if (!segmentPaths.length) {
    throw new Error("No segments provided for merge");
  }

  if (segmentPaths.length === 1) {
    await new Promise((resolve, reject) => {
      ffmpeg(segmentPaths[0])
        .outputOptions(["-c:v libx264", "-pix_fmt yuv420p", "-an"])
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
    return;
  }

  const durations = [];
  for (const p of segmentPaths) {
    const d = await getVideoDuration(p);
    durations.push(Math.max(0.5, Number(d) || 1));
  }

  let cumulative = durations[0];
  let currentLabel = "[0:v]";
  const chains = [];

  for (let i = 1; i < segmentPaths.length; i++) {
    // Transition is assigned on the outgoing clip (i-1) in editor UI.
    // Keep fallback to [i] for backward compatibility with older payloads.
    const transitionName = transitions?.[i - 1] || transitions?.[i] || "none";
    const xfadeType = mapClipTransitionToXfade(transitionName);
    const isNone = transitionName === "none";
    const transitionDuration = isNone ? 0.001 : 0.8;
    const offset = Math.max(0, cumulative - transitionDuration);
    const outLabel = `[v${i}]`;

    console.log("🎞️ [API-MEDIA] Merge transition", {
      joinIndex: i - 1,
      fromSegment: i - 1,
      toSegment: i,
      transitionName,
      xfadeType,
      offset,
      transitionDuration,
    });

    chains.push(`${currentLabel}[${i}:v]xfade=transition=${xfadeType}:duration=${transitionDuration}:offset=${offset}${outLabel}`);
    currentLabel = outLabel;
    cumulative = cumulative + durations[i] - transitionDuration;
  }

  await new Promise((resolve, reject) => {
    let command = ffmpeg();
    segmentPaths.forEach((p) => {
      command = command.input(p);
    });

    command
      .complexFilter(chains)
      .outputOptions(["-map", currentLabel, "-c:v libx264", "-pix_fmt yuv420p", "-an", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => {
        console.log("✅ [API-MEDIA] Transition merge complete");
        resolve();
      })
      .on("error", (err) => {
        console.error("❌ [API-MEDIA] Transition merge failed:", err);
        reject(err);
      })
      .run();
  });
};

// ✅ RUNAWAY API FUNCTION
const generateVideoWithRunaway = async (prompt, duration = 10, aspectRatio = "16:9") => {
  // MOCK MODE - for testing without valid API key
  if (USE_MOCK_API) {
    console.log("🎬 [MockAPI] Generating mock video...");
    console.log("📝 [MockAPI] Prompt:", prompt);
    console.log("⏱️  [MockAPI] Duration:", duration, "seconds");
    console.log("📐 [MockAPI] Aspect ratio:", aspectRatio);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock video URL (placeholder)
    const mockUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4";
    console.log("✅ [MockAPI] Mock video ready:", mockUrl);
    return mockUrl;
  }

  // REAL API MODE
  dotenv.config({ path: "./src/.env", override: true });
  const activeFalApiKey = readEnv("FAL_API_KEY") || falApiKey;
  const falEndpoint = "https://api.fal.ai/models/bytedance/seedance-2.0/text-to-video";

  if (!activeFalApiKey) {
    throw new Error("Missing FAL_API_KEY. Add it to your environment.");
  }

  console.log("🎬 [GenVideo] Generating video...");
  console.log("🔑 [GenVideo] FAL API Key length:", activeFalApiKey.length);

  try {
    // Submit text-to-video generation request
    const requestBody = {
      prompt: prompt,
      duration: Math.max(3, Math.min(20, duration || 10)),
      aspect_ratio: aspectRatio,
    };

    console.log("📝 [GenVideo] Request body:", JSON.stringify(requestBody));
    console.log("🌐 [GenVideo] Calling endpoint:", falEndpoint);

    const response = await fetch(falEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Key ${activeFalApiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "aivideoeditor/1.0",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("📥 [GenVideo] Raw response status:", response.status);
    console.log("📥 [GenVideo] Raw response headers:", {
      "content-type": response.headers.get("content-type"),
      "x-request-id": response.headers.get("x-request-id"),
    });
    console.log("📥 [GenVideo] Raw response text:", responseText);

    if (!response.ok) {
      console.error("❌ [GenVideo] API error (status " + response.status + ")");
      console.error("❌ [GenVideo] Full response:", responseText);
      let errorMsg = "Video generation service temporarily unavailable";
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.error) errorMsg = errorData.error;
        else if (errorData.detail) errorMsg = errorData.detail;
        else if (errorData.message) errorMsg = errorData.message;
      } catch (e) {
        errorMsg = responseText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ [GenVideo] Invalid response format");
      throw new Error("Video generation service returned an invalid response");
    }

    const requestId = data.request_id || data.requestId || data.id;
    if (!requestId) {
      throw new Error("fal.ai submit response missing request_id");
    }

    console.log("✅ [GenVideo] Request accepted with request_id:", requestId);

    const maxAttempts = 60; // 5 minutes with 5-second intervals
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await sleep(5000);

      const statusResponse = await fetch(`${falEndpoint}/queue/${encodeURIComponent(requestId)}/status`, {
        method: "GET",
        headers: {
          "Authorization": `Key ${activeFalApiKey}`,
        },
      });

      const statusText = await statusResponse.text();
      if (!statusResponse.ok) {
        throw new Error(`Failed to check fal.ai status (${statusResponse.status}): ${statusText}`);
      }

      let statusData = {};
      try {
        statusData = JSON.parse(statusText || "{}");
      } catch {
        throw new Error("fal.ai status response returned invalid JSON");
      }

      const status = String(statusData.status || statusData.state || "").toUpperCase();
      console.log(`⏳ [GenVideo] fal.ai status (${attempt}/${maxAttempts}):`, status || "UNKNOWN");

      if (status === "COMPLETED") {
        const resultResponse = await fetch(`${falEndpoint}/queue/${encodeURIComponent(requestId)}`, {
          method: "GET",
          headers: {
            "Authorization": `Key ${activeFalApiKey}`,
          },
        });

        const resultText = await resultResponse.text();
        if (!resultResponse.ok) {
          throw new Error(`Failed to fetch fal.ai result (${resultResponse.status}): ${resultText}`);
        }

        let resultData = {};
        try {
          resultData = JSON.parse(resultText || "{}");
        } catch {
          throw new Error("fal.ai result response returned invalid JSON");
        }

        const output = resultData.output || resultData.data || resultData;
        const videoUrl =
          output?.video?.url ||
          output?.video_url ||
          output?.url ||
          output?.video?.[0]?.url ||
          output?.videos?.[0]?.url ||
          (Array.isArray(output) && typeof output[0] === "string" ? output[0] : "");

        if (!videoUrl) {
          throw new Error("fal.ai completed but no video URL found in result");
        }

        console.log("✅ [GenVideo] Video generated:", videoUrl);
        return videoUrl;
      }

      if (status === "FAILED" || status === "ERROR" || status === "CANCELED" || status === "CANCELLED") {
        const reason = statusData.error || statusData.message || statusText || "Unknown fal.ai failure";
        throw new Error(`fal.ai task failed: ${reason}`);
      }
    }

    throw new Error("Video generation timed out after 5 minutes");
  } catch (error) {
    console.error("❌ Runaway Generation Error:", error.message);
    throw error;
  }
};

// ✅ NOVITA TXT2VIDEO FUNCTION (async task API)
const generateVideoWithNovita = async (prompt, duration = 10, aspectRatio = "16:9") => {
  if (!novitaApiKey) {
    throw new Error("Missing NOVITA_API_KEY. Add it to your environment.");
  }
  if (!novitaApiUrl) {
    throw new Error("Missing NOVITA_API_URL. Add it to your environment.");
  }
  if (!novitaModelName) {
    throw new Error("Missing NOVITA_MODEL_NAME. Add it to your environment.");
  }

  const ratioMap = {
    "16:9": { width: 1024, height: 576 },
    "9:16": { width: 576, height: 1024 },
    "1:1": { width: 768, height: 768 },
    "4:3": { width: 960, height: 720 },
    "3:4": { width: 720, height: 960 },
  };

  const mapped = ratioMap[String(aspectRatio || "16:9")] || ratioMap["16:9"];

  // Novita txt2video requires frame-counted prompt segments.
  // We clamp duration to a practical range and map seconds to frames (8-64).
  const clampedSeconds = Math.max(3, Math.min(20, Number(duration) || 10));
  const frames = Math.max(8, Math.min(64, Math.round(clampedSeconds * 3.2)));

  const requestBody = {
    model_name: novitaModelName,
    width: mapped.width,
    height: mapped.height,
    steps: 20,
    seed: -1,
    prompts: [
      {
        frames,
        prompt: String(prompt || "").trim(),
      },
    ],
    negative_prompt:
      "nsfw, low quality, worst quality, blurry, watermark, text, logo",
  };

  console.log("🎬 [Novita] Creating async txt2video task...");
  const createResponse = await fetch(`${novitaApiUrl}/v3/async/txt2video`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${novitaApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const createText = await createResponse.text();
  if (!createResponse.ok) {
    throw new Error(`Novita task creation failed (${createResponse.status}): ${createText}`);
  }

  let createData = {};
  try {
    createData = JSON.parse(createText || "{}");
  } catch {
    throw new Error("Novita task creation returned invalid JSON.");
  }

  const taskId = createData.task_id || createData.taskId || createData?.task?.task_id;
  if (!taskId) {
    throw new Error("Novita response missing task_id.");
  }

  console.log("📝 [Novita] Task created:", taskId);

  const maxAttempts = 90; // ~7.5 minutes @ 5s
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await sleep(5000);

    const statusResponse = await fetch(
      `${novitaApiUrl}/v3/async/task-result?task_id=${encodeURIComponent(taskId)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${novitaApiKey}`,
        },
      },
    );

    const statusText = await statusResponse.text();
    if (!statusResponse.ok) {
      throw new Error(`Novita task polling failed (${statusResponse.status}): ${statusText}`);
    }

    let statusData = {};
    try {
      statusData = JSON.parse(statusText || "{}");
    } catch {
      throw new Error("Novita task polling returned invalid JSON.");
    }

    const status = String(statusData?.task?.status || "").toUpperCase();
    const videoUrl =
      statusData?.videos?.[0]?.video_url ||
      statusData?.videos?.[0]?.url ||
      statusData?.video_url ||
      "";

    console.log(`⏳ [Novita] Task status (${attempt}/${maxAttempts}):`, status || "UNKNOWN");

    if (status.includes("SUCCEED") || status.includes("SUCCESS") || status === "COMPLETED") {
      if (!videoUrl) {
        throw new Error("Novita task succeeded but no video URL was returned.");
      }
      console.log("✅ [Novita] Video generated:", videoUrl);
      return videoUrl;
    }

    if (status.includes("FAIL") || status.includes("ERROR") || status.includes("CANCEL")) {
      const reason = statusData?.task?.reason || "Unknown Novita failure";
      throw new Error(`Novita task failed: ${reason}`);
    }
  }

  throw new Error("Novita task timed out while waiting for result.");
};

const buildEffectPromptSnippet = (effects) => {
  if (!effects || effects.selectedEffect === "none") {
    return "";
  }

  const selected = String(effects.selectedEffect || "none");
  const settings = effects.settings || {};

  switch (selected) {
    case "fade-in":
      return "Add a soft fade-in transition at the beginning of the clip.";
    case "blur":
      return `Apply a blur effect with medium strength (${Number(settings.blurAmount) || 10}px feel).`;
    case "zoom":
      return "Apply a progressive cinematic zoom-in from start to end.";
    case "color-correction":
      return `Use color correction with brightness ${Number(settings.brightness) || 1}, contrast ${Number(settings.contrast) || 1}, saturation ${Number(settings.saturation) || 1}.`;
    case "vintage":
      return "Apply a vintage old-film treatment with reduced saturation, warm tones, and subtle grain.";
    case "black-white":
      return "Apply a true black-and-white monochrome grade.";
    case "cinematic":
      return "Apply a cinematic movie look with higher contrast and stylized color separation.";
    case "warm":
      return "Apply a warm color grade with boosted reds/yellows and softer blues.";
    case "cool":
      return "Apply a cool color grade with boosted blue tones and reduced reds.";
    case "sepia":
      return "Apply a sepia old-photo color transformation.";
    case "hdr":
      return "Apply an HDR-like punch with high contrast, brightness, and detail.";
    case "vivid":
      return "Apply a vivid high-saturation color grade.";
    case "soft-glow":
      return "Apply a soft glow bloom effect on highlights.";
    case "retro-film":
      return "Apply a retro VHS film look with grain and scanline texture.";
    case "green-screen":
      return "Apply a chroma key green-screen style where green background is removed.";
    case "slow-motion":
      return `Apply slow-motion pacing around ${(Number(settings.slowMotionSpeed) || 0.25).toFixed(2)}x speed style.`;
    case "glitch":
      return `Add a digital glitch effect with intensity ${Number(settings.glitchIntensity) || 1}.`;
    case "transition":
      return "Use a dissolve transition look from black into the scene.";
    case "text-animation":
      return `Overlay animated center text: \"${String(settings.animatedText || "YOUR TEXT HERE").slice(0, 120)}\".`;
    case "motion-tracking":
      return "Add motion-tracking style highlights that follow movement regions.";
    default:
      return "";
  }
};

// ✅ MAIN ROUTE - API Video Generation
// Accepts JSON with: { prompt, duration, frame }
app.post("/generate", async (req, res) => {
  const { prompt, duration, frame, effects } = req.body;

  try {
    console.log("📍 [API] Video generation request received");

    if (!prompt || !String(prompt).trim()) {
      console.error("❌ [API] Missing prompt");
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const seconds = Math.max(3, Math.min(180, Number(duration) || 10));
    const effectPromptSnippet = buildEffectPromptSnippet(effects);
    const finalPrompt = [String(prompt || "").trim(), effectPromptSnippet].filter(Boolean).join(" ");

    console.log("📝 [API] Generation config: duration=" + seconds + "s, ratio=" + (frame || "16:9"));
    if (effects?.selectedEffect && effects.selectedEffect !== "none") {
      console.log("✨ [API] Requested effect:", effects.selectedEffect);
    }

    // 🔥 STEP 1: GENERATE VIDEO WITH RUNAWAY API
    const fileName = `output-${Date.now()}.mp4`;
    const outputPath = `outputs/${fileName}`;
    
    let videoUrl = "";

    // AI-generated flow uses Runway only (env key: RUNAWAY_API_KEY)
    console.log("🎬 [API] Starting video generation...");
    videoUrl = await generateVideoWithRunaway(finalPrompt, seconds, frame || "16:9");
    console.log("✅ [API] Video generated successfully");

    // 🔥 STEP 2: UPLOAD TO SUPABASE STORAGE
    let storage = null;

    try {
      console.log("📤 [API] Uploading to storage...");
      const uploadResult = await uploadVideoUrlToSupabase(
        videoUrl,
        fileName,
        SUPABASE_BUCKETS.AI_GENERATED,
      );
      videoUrl = uploadResult.publicUrl;
      storage = uploadResult.storagePath;
      console.log("✅ [API] Storage upload complete");
    } catch (storageError) {
      console.warn("⚠️ [API] Storage upload failed, using direct URL");
    }

    // 🔥 STEP 3: RETURN RESPONSE
    res.json({
      success: true,
      video: videoUrl,
      storage,
    });

  } catch (error) {
    const errorMessage = error?.message || "Video generation failed. Please try again.";
    console.error("❌ [API] Error:", errorMessage);
    
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// ✅ DIRECT MEDIA-BASED GENERATION (prompt + uploaded pic/video + optional audio)
// Expects multipart/form-data with fields: prompt, duration, frame
// and files: media (one or many images/videos), audio (optional)
app.post(
  "/generate-from-media",
  upload.fields([
    { name: "media", maxCount: 20 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        prompt,
        duration,
        frame,
        selectedEffect,
        selectedFilter,
        effectSettings,
        transitionPlan,
        editorSelections,
        quickEditMode,
        speedValue,
        trimEnabled,
        trimStart,
        trimEnd,
        trimClipRanges,
        rotateDegrees,
        volumeMuted,
        volumeLevel,
        zoomEnabled,
        zoomAmount,
        cropEnabled,
        cropCenterX,
        cropCenterY,
        cropWidthPct,
        cropHeightPct,
        keyframeEnabled,
        keyframeMode,
        keyframeAmount,
      } = req.body || {};
      const files = req.files || {};
      const mediaFiles = Array.isArray(files.media) ? files.media : [];
      const audioFiles = Array.isArray(files.audio) ? files.audio : [];
      let parsedEffectSettings = {};
      let parsedTransitionPlan = [];
      let parsedEditorSelections = {};

      try {
        parsedEffectSettings = effectSettings ? JSON.parse(effectSettings) : {};
      } catch (e) {
        parsedEffectSettings = {};
      }

      try {
        parsedTransitionPlan = transitionPlan ? JSON.parse(transitionPlan) : [];
      } catch (e) {
        parsedTransitionPlan = [];
      }

      try {
        parsedEditorSelections = editorSelections ? JSON.parse(editorSelections) : {};
      } catch (e) {
        parsedEditorSelections = {};
      }

      let parsedTrimClipRanges = {};
      try {
        parsedTrimClipRanges = trimClipRanges ? JSON.parse(trimClipRanges) : {};
      } catch (e) {
        parsedTrimClipRanges = {};
      }

      const resolvedSpeedValue = Math.max(
        0.1,
        Math.min(
          3,
          Number(parsedEditorSelections?.speed?.value ?? speedValue ?? 1) || 1,
        ),
      );

      const resolvedTrim = {
        enabled:
          typeof parsedEditorSelections?.trim?.enabled === "boolean"
            ? parsedEditorSelections.trim.enabled
            : String(trimEnabled || "").toLowerCase() === "true",
        start: Number(parsedEditorSelections?.trim?.start ?? trimStart ?? 0) || 0,
        end:
          parsedEditorSelections?.trim?.end != null
            ? Number(parsedEditorSelections.trim.end)
            : trimEnd === "" || trimEnd == null
            ? null
            : Number(trimEnd),
        clipRanges:
          parsedEditorSelections?.trim?.clipRanges && typeof parsedEditorSelections.trim.clipRanges === "object"
            ? parsedEditorSelections.trim.clipRanges
            : parsedTrimClipRanges,
      };

      const resolvedRotate = {
        enabled:
          typeof parsedEditorSelections?.rotate?.enabled === "boolean"
            ? parsedEditorSelections.rotate.enabled
            : Number(parsedEditorSelections?.rotate?.degrees ?? rotateDegrees ?? 0) % 360 !== 0,
        degrees: Number(parsedEditorSelections?.rotate?.degrees ?? rotateDegrees ?? 0) || 0,
      };

      const resolvedVolume = {
        muted:
          typeof parsedEditorSelections?.volume?.muted === "boolean"
            ? parsedEditorSelections.volume.muted
            : String(volumeMuted || "").toLowerCase() === "true",
        level: Number(parsedEditorSelections?.volume?.level ?? volumeLevel ?? 1) || 1,
      };

      const resolvedZoom = {
        enabled:
          typeof parsedEditorSelections?.zoom?.enabled === "boolean"
            ? parsedEditorSelections.zoom.enabled
            : String(zoomEnabled || "").toLowerCase() === "true",
        amount: Number(parsedEditorSelections?.zoom?.amount ?? zoomAmount ?? 1) || 1,
      };

      const resolvedCrop = {
        enabled:
          typeof parsedEditorSelections?.crop?.enabled === "boolean"
            ? parsedEditorSelections.crop.enabled
            : String(cropEnabled || "").toLowerCase() === "true",
        centerX: Number(parsedEditorSelections?.crop?.centerX ?? cropCenterX ?? 50) || 50,
        centerY: Number(parsedEditorSelections?.crop?.centerY ?? cropCenterY ?? 50) || 50,
        widthPct: Number(parsedEditorSelections?.crop?.widthPct ?? cropWidthPct ?? 100) || 100,
        heightPct: Number(parsedEditorSelections?.crop?.heightPct ?? cropHeightPct ?? 100) || 100,
      };

      const resolvedKeyframe = {
        enabled:
          typeof parsedEditorSelections?.keyframe?.enabled === "boolean"
            ? parsedEditorSelections.keyframe.enabled
            : String(keyframeEnabled || "").toLowerCase() === "true",
        mode: String(parsedEditorSelections?.keyframe?.mode ?? keyframeMode ?? "none"),
        amount: Number(parsedEditorSelections?.keyframe?.amount ?? keyframeAmount ?? 1.25) || 1.25,
        points: Array.isArray(parsedEditorSelections?.keyframe?.points)
          ? parsedEditorSelections.keyframe.points
          : [],
      };

      const resolvedEditorSelections = {
        ...parsedEditorSelections,
        speed: {
          ...(parsedEditorSelections?.speed || {}),
          value: resolvedSpeedValue,
          enabled:
            typeof parsedEditorSelections?.speed?.enabled === "boolean"
              ? parsedEditorSelections.speed.enabled
              : Math.abs(resolvedSpeedValue - 1) > 0.001,
        },
        trim: resolvedTrim,
        rotate: resolvedRotate,
        volume: resolvedVolume,
        zoom: resolvedZoom,
        crop: resolvedCrop,
        keyframe: resolvedKeyframe,
      };

      const selectedEffectFromEditor = parsedEditorSelections?.effect?.selected;
      const inferredEffect = inferEffectFromPrompt(prompt);
      const resolvedSelectedEffect = selectedEffectFromEditor && selectedEffectFromEditor !== "none"
        ? selectedEffectFromEditor
        : selectedEffect && selectedEffect !== "none"
        ? selectedEffect
        : inferredEffect;

      const resolvedEffectSettings =
        parsedEditorSelections?.effect?.settings && Object.keys(parsedEditorSelections.effect.settings).length
          ? parsedEditorSelections.effect.settings
          : parsedEffectSettings;

      const resolvedTransitionPlan = Array.isArray(parsedEditorSelections?.transitions?.transitionPlan)
        ? parsedEditorSelections.transitions.transitionPlan
        : parsedTransitionPlan;

      const resolvedSelectedFilter =
        parsedEditorSelections?.filters?.selected && parsedEditorSelections.filters.selected !== "none"
          ? String(parsedEditorSelections.filters.selected)
          : selectedFilter && selectedFilter !== "none"
          ? String(selectedFilter)
          : "none";

      const resolvedTextOverlay = parsedEditorSelections?.textOverlay || { enabled: false };

      const selectedFontLabel = resolvedTextOverlay?.fontFamily || resolvedTextOverlay?.fontId || "none";
      const transitionSummary = Array.isArray(resolvedTransitionPlan)
        ? resolvedTransitionPlan
            .map((row) => `#${Number(row?.index) || 0}:${String(row?.transition || "none")}`)
            .join(", ")
        : "";

      const effects = {
        selectedEffect: resolvedSelectedEffect || "none",
        settings: resolvedEffectSettings,
      };

      const requestedTool = String(req.body?.tool || req.body?.flow || "").toLowerCase();
      const flowHeader = String(req.get("x-vireonix-flow") || "").toLowerCase();
      const isQuickEditMode =
        String(quickEditMode || "").toLowerCase() === "true" ||
        requestedTool === "quick-edit" ||
        flowHeader === "quick-edit";

      console.log("📍 [API-MEDIA] Direct media generation request received");

      if (!prompt || !String(prompt).trim()) {
        console.error("❌ [API-MEDIA] Missing prompt");
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }

      if (!mediaFiles.length) {
        console.error("❌ [API-MEDIA] No media files uploaded");
        return res.status(400).json({ success: false, error: "At least one image or video file is required" });
      }

      let seconds = Math.max(3, Math.min(180, Number(duration) || 10));
      const aspect = frame || "16:9";

      // Pick media source and determine storage bucket before any logging/processing.
      const videoFile = mediaFiles.find((f) => f.mimetype?.startsWith("video/"));
      const imageFiles = mediaFiles.filter((f) => f.mimetype?.startsWith("image/"));
      const outputBucket = isQuickEditMode
        ? SUPABASE_BUCKETS.QUICK_EDITS
        : !videoFile && imageFiles.length > 0
        ? SUPABASE_BUCKETS.IMAGE_TO_VIDEO
        : SUPABASE_BUCKETS.AI_GENERATED;

      console.log("📝 [API-MEDIA] Config:", {
        prompt,
        durationSeconds: seconds,
        frame: aspect,
        mediaCount: mediaFiles.length,
        hasAudio: audioFiles.length > 0,
        quickEditMode: isQuickEditMode,
        requestedTool,
        flowHeader,
        outputBucket,
        selectedEffectIncoming: selectedEffect || "none",
        selectedFilterIncoming: selectedFilter || "none",
        selectedEffectFromEditor: selectedEffectFromEditor || "none",
        selectedEffectResolved: effects.selectedEffect,
        selectedFilterResolved: resolvedSelectedFilter,
      });

      console.log("🛠️ [API-MEDIA] Editor selections:", {
        effect: {
          selected: parsedEditorSelections?.effect?.selected || "none",
          enabled: Boolean(parsedEditorSelections?.effect?.enabled),
          settings: parsedEditorSelections?.effect?.settings || {},
        },
        transitions: {
          transitionPlan: parsedEditorSelections?.transitions?.transitionPlan || parsedTransitionPlan,
          clipTransitions: parsedEditorSelections?.transitions?.clipTransitions || {},
        },
        filters: parsedEditorSelections?.filters || { enabled: false },
        speed: resolvedEditorSelections?.speed || { enabled: false },
        trim: resolvedEditorSelections?.trim || { enabled: false },
        textOverlay: parsedEditorSelections?.textOverlay || { enabled: false },
        rotate: resolvedEditorSelections?.rotate || { enabled: false },
        volume: resolvedEditorSelections?.volume || { muted: false, level: 1 },
        zoom: resolvedEditorSelections?.zoom || { enabled: false, mode: "in", amount: 1 },
        crop: resolvedEditorSelections?.crop || { enabled: false, widthPct: 100, heightPct: 100, centerX: 50, centerY: 50 },
        keyframe: resolvedEditorSelections?.keyframe || { enabled: false, mode: "none", amount: 1.25, points: [] },
      });

      console.log("🎯 [API-MEDIA] Selected controls:", {
        effect: effects.selectedEffect || "none",
        filter: resolvedSelectedFilter || "none",
        font: selectedFontLabel,
        speed: resolvedEditorSelections?.speed?.value || 1,
        trim: resolvedEditorSelections?.trim || { enabled: false },
        rotate: resolvedEditorSelections?.rotate || { enabled: false, degrees: 0 },
        volume: resolvedEditorSelections?.volume || { muted: false, level: 1 },
        zoom: resolvedEditorSelections?.zoom || { enabled: false, amount: 1 },
        crop: resolvedEditorSelections?.crop || { enabled: false, widthPct: 100, heightPct: 100 },
        keyframe: resolvedEditorSelections?.keyframe || { enabled: false, mode: "none", amount: 1.25 },
        textEnabled: Boolean(resolvedTextOverlay?.enabled),
        text: String(resolvedTextOverlay?.text || "").slice(0, 80),
        transitions: transitionSummary || "none",
      });

      if (!videoFile && !imageFiles.length) {
        console.error("❌ [API-MEDIA] Unsupported media types");
        return res.status(400).json({ success: false, error: "Upload at least one image or video file" });
      }

      // Store uploaded reference videos in dedicated reference bucket.
      const referenceVideoFiles = mediaFiles.filter((f) => f.mimetype?.startsWith("video/"));
      if (referenceVideoFiles.length > 0) {
        await Promise.allSettled(
          referenceVideoFiles.map(async (file) => {
            try {
              const uploadedRef = await uploadReferenceMediaToSupabase(file.path, file.originalname);
              console.log("📚 [API-MEDIA] Reference video stored:", uploadedRef.storagePath);
            } catch (refErr) {
              console.warn("⚠️ [API-MEDIA] Reference video upload failed:", file.originalname, refErr?.message || refErr);
            }
          }),
        );
      }

      const fileName = `direct-media-${Date.now()}.mp4`;
      const baseOutputPath = makeTempFilePath(fileName);
      let finalOutputPath = baseOutputPath;
      const generatedTempFiles = [];

      // STEP 1: Build base video from uploaded media
      if (isQuickEditMode && mediaFiles.length > 1) {
        console.log("🎞️ [API-MEDIA] Quick Edit multi-clip mode with transitions");

        const segmentPaths = [];
        for (let i = 0; i < mediaFiles.length; i++) {
          const media = mediaFiles[i];
          const segmentPath = makeTempFilePath(`qclip-${i}.mp4`);
          const mediaMeta = resolvedEditorSelections?.media?.items?.[i] || {};
          const mediaId = mediaMeta?.id;
          const rawClipTrim = mediaId ? resolvedEditorSelections?.trim?.clipRanges?.[mediaId] : null;
          const trimStart = Math.max(0, Number(rawClipTrim?.start) || 0);
          const trimEndRaw = rawClipTrim?.end == null ? null : Number(rawClipTrim?.end);
          const trimEnd = Number.isFinite(trimEndRaw) ? Math.max(trimStart + 0.01, trimEndRaw) : null;
          const trimDuration = trimEnd == null ? null : Math.max(0.01, trimEnd - trimStart);

          if (media.mimetype?.startsWith("video/")) {
            await processVideoRange(media.path, segmentPath, trimStart, trimDuration);
          } else if (media.mimetype?.startsWith("image/")) {
            await createVideoFromImage(media.path, segmentPath, 3, aspect);
          }

          segmentPaths.push(segmentPath);
          generatedTempFiles.push(segmentPath);
        }

        const transitionsByIndex = mediaFiles.map((_, index) => {
          const row = resolvedTransitionPlan.find((p) => Number(p.index) === index);
          return row?.transition || "none";
        });

        await mergeSegmentsWithTransitions(segmentPaths, transitionsByIndex, baseOutputPath);
        seconds = await getVideoDuration(baseOutputPath);
      } else if (videoFile) {
        console.log("🎬 [API-MEDIA] Using uploaded video as source:", videoFile.originalname);
        const primaryMediaId = resolvedEditorSelections?.media?.items?.[0]?.id;
        const rawPrimaryTrim = primaryMediaId
          ? resolvedEditorSelections?.trim?.clipRanges?.[primaryMediaId]
          : null;
        const primaryTrimStart = Math.max(0, Number(rawPrimaryTrim?.start) || 0);
        const primaryTrimEndRaw = rawPrimaryTrim?.end == null ? null : Number(rawPrimaryTrim?.end);
        const primaryTrimEnd = Number.isFinite(primaryTrimEndRaw)
          ? Math.max(primaryTrimStart + 0.01, primaryTrimEndRaw)
          : null;
        const primaryTrimDuration = primaryTrimEnd == null
          ? null
          : Math.max(0.01, primaryTrimEnd - primaryTrimStart);

        if (isQuickEditMode) {
          // Preserve full uploaded video for Quick Edit.
          await processVideoRange(videoFile.path, baseOutputPath, primaryTrimStart, primaryTrimDuration);
          seconds = await getVideoDuration(baseOutputPath);
        } else {
          await processVideoRange(videoFile.path, baseOutputPath, primaryTrimStart, seconds);
        }
      } else if (imageFiles.length === 1) {
        console.log("🖼️ [API-MEDIA] Using single uploaded image as source:", imageFiles[0].originalname);
        await createVideoFromImage(imageFiles[0].path, baseOutputPath, seconds, aspect);
      } else if (imageFiles.length > 1) {
        console.log("🖼️ [API-MEDIA] Building slideshow from", imageFiles.length, "images");
        const perImageSeconds = Math.max(1, Math.floor(seconds / imageFiles.length) || 1);

        const segmentPaths = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const segmentPath = makeTempFilePath(`segment-${i}.mp4`);
          await createVideoFromImage(imageFiles[i].path, segmentPath, perImageSeconds, aspect);
          segmentPaths.push(segmentPath);
          generatedTempFiles.push(segmentPath);
        }

        const listFilePath = makeTempFilePath("concat.txt");
        const listContent = segmentPaths
          .map((p) => `file '${p.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`)
          .join("\n");
        fs.writeFileSync(listFilePath, listContent);
        generatedTempFiles.push(listFilePath);

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(listFilePath)
            .inputOptions(["-f concat", "-safe 0"])
            .outputOptions(["-c copy"])
            .output(baseOutputPath)
            .on("end", () => {
              console.log("✅ [API-MEDIA] Slideshow video created from images");
              resolve();
            })
            .on("error", (err) => {
              console.error("❌ [API-MEDIA] Error creating slideshow:", err);
              reject(err);
            })
            .run();
        });
      }

      // STEP 2: If this is an images-only request, try full AI video generation with Veo.
      // We ignore the ffmpeg output and instead generate a new AI video from the images + prompt.
      if (!isQuickEditMode && !videoFile && imageFiles.length > 0) {
        try {
          console.log("🎨 [API-MEDIA] Using Veo for image-only AI video generation");
          const veoResult = await generateVeoVideoFromImages(
            prompt,
            seconds,
            aspect,
            imageFiles,
          );

          let veoOutputPath = veoResult.localPath;

          // Merge audio (if provided) after AI video generation, trimming
          // audio to match the selected video duration. Any failure here
          // should log and fall back to the video without custom audio
          // instead of failing the whole request.
          if (audioFiles.length && veoOutputPath) {
            const audioFile = audioFiles[0];
            try {
              console.log("🎵 [API-MEDIA] Merging custom audio with Veo output:", audioFile.originalname);
              const withAudioPath = await mergeVideoWithTrimmedAudio(veoOutputPath, audioFile.path);
              if (withAudioPath && withAudioPath !== veoOutputPath) {
                generatedTempFiles.push(veoOutputPath);
                veoOutputPath = withAudioPath;
              }
            } catch (audioErr) {
              console.warn("⚠️ [API-MEDIA] Audio merge failed, continuing without custom audio:", audioErr?.message || audioErr);
            }
          }

          // Adjust the generated video to the user-selected frame ratio
          // (e.g., if the API only supports a couple of ratios). If this
          // step fails we still return the unadjusted video.
          try {
            const frameAdjustedPath = await adjustVideoToFrame(veoOutputPath, aspect);
            if (frameAdjustedPath && frameAdjustedPath !== veoOutputPath) {
              generatedTempFiles.push(veoOutputPath);
              veoOutputPath = frameAdjustedPath;
            }
          } catch (frameErr) {
            console.warn("⚠️ [API-MEDIA] Frame adjustment failed, returning original Veo output:", frameErr?.message || frameErr);
          }

          // Upload the final Veo-based video into the IMAGE_TO_VIDEO bucket.
          console.log("📤 [API-MEDIA] Uploading Veo output to storage...");
          const uploadResult = await uploadToSupabase(
            veoOutputPath,
            fileName,
            SUPABASE_BUCKETS.IMAGE_TO_VIDEO,
          );

          // Clean up temporary files (best-effort)
          const tempPathsForVeo = [
            ...mediaFiles.map((f) => f.path),
            ...audioFiles.map((f) => f.path),
            ...generatedTempFiles,
            baseOutputPath !== finalOutputPath ? baseOutputPath : null,
            veoOutputPath,
          ].filter(Boolean);

          tempPathsForVeo.forEach((p) => {
            fs.unlink(p, () => {});
          });

          return res.json({
            success: true,
            video: uploadResult.publicUrl,
            storage: uploadResult.storagePath,
            appliedEffect: effects.selectedEffect || "none",
          });
        } catch (veoError) {
          console.error(
            "❌ [API-MEDIA] Veo generation failed, falling back to ffmpeg output:",
            veoError?.message || veoError,
          );
        }
      }

      // STEP 4: Optional AI transform for non-quick-edit flows only.
      if (!isQuickEditMode) {
        finalOutputPath = await transformVideoWithPrompt(finalOutputPath, prompt, seconds, aspect);
      }

      // STEP 4.05: Apply editor controls (trim/speed/rotate/volume) before effects.
      const adjustedPath = await applyEditorAdjustments(finalOutputPath, resolvedEditorSelections);
      if (adjustedPath !== finalOutputPath) {
        generatedTempFiles.push(finalOutputPath);
        finalOutputPath = adjustedPath;
      }

      // STEP 4.1: Apply deterministic post-processing effects for export output
      console.log("🎛️ [API-MEDIA] Applying export post-processing", {
        effect: effects.selectedEffect || "none",
        filter: resolvedSelectedFilter,
        textOverlay: Boolean(resolvedTextOverlay?.enabled && String(resolvedTextOverlay?.text || "").trim()),
      });

      const effectedPath = await applyEffectsToVideo(finalOutputPath, effects, seconds);
      if (effectedPath !== finalOutputPath) {
        generatedTempFiles.push(finalOutputPath);
        finalOutputPath = effectedPath;
      }

      // Apply selected filter as an additional pass so filter + effect can both appear in exports.
      if (resolvedSelectedFilter !== "none" && resolvedSelectedFilter !== effects.selectedEffect) {
        console.log("🎨 [API-MEDIA] Applying dedicated filter pass", {
          selectedFilter: resolvedSelectedFilter,
          baseEffect: effects.selectedEffect || "none",
        });
        const filteredPath = await applyEffectsToVideo(
          finalOutputPath,
          { selectedEffect: resolvedSelectedFilter, settings: resolvedEffectSettings },
          seconds,
        );
        if (filteredPath !== finalOutputPath) {
          generatedTempFiles.push(finalOutputPath);
          finalOutputPath = filteredPath;
        }
      }

      const textOverlayPath = await applyTextOverlayToVideo(finalOutputPath, resolvedTextOverlay);
      if (textOverlayPath !== finalOutputPath) {
        generatedTempFiles.push(finalOutputPath);
        finalOutputPath = textOverlayPath;
      }

      // STEP 5: Upload final video to Supabase storage
      console.log("📤 [API-MEDIA] Uploading final video to storage...");
      const { publicUrl, storagePath } = await uploadToSupabase(finalOutputPath, fileName, outputBucket);
      console.log("✅ [API-MEDIA] Storage upload complete");

      // STEP 6: Clean up temporary files (best-effort)
      const tempPaths = [
        ...mediaFiles.map((f) => f.path),
        ...audioFiles.map((f) => f.path),
        ...generatedTempFiles,
        baseOutputPath !== finalOutputPath ? baseOutputPath : null,
        finalOutputPath,
      ].filter(Boolean);

      tempPaths.forEach((p) => {
        fs.unlink(p, () => {});
      });

      return res.json({
        success: true,
        video: publicUrl,
        storage: storagePath,
        appliedEffect: effects.selectedEffect || "none",
        appliedFilter: resolvedSelectedFilter,
      });
    } catch (error) {
      const message = error?.message || "Media-based video generation failed.";
      console.error("❌ [API-MEDIA] Error:", message);
      return res.status(500).json({ success: false, error: message });
    }
  }
);

// ✅ START SERVER
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});