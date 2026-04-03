import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import os from "os";
import path from "path";
import dotenv from "dotenv";

// Load environment variables (including GEMINI_API_KEY and Supabase keys)
dotenv.config({ path: "./src/.env", override: true });

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

// ✅ INIT SUPABASE
const supabaseUrl = process.env.SUPABASE_URL || "https://cowdbhlpxzrlcbsxrvwh.supabase.co";

// Work around dotenv not loading SUPABASE_SERVICE_ROLE_KEY by also
// reading it directly from src/.env if needed.
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!serviceRoleKey) {
  try {
    const envText = fs.readFileSync("src/.env", "utf8");
    console.log("🔍 Raw src/.env length:", envText.length);
    console.log("🔍 src/.env has SUPABASE_SERVICE_ROLE_KEY:", envText.includes("SUPABASE_SERVICE_ROLE_KEY"));
    const match = envText.match(/SUPABASE_SERVICE_ROLE_KEY[^=]*=\s*(.*)/);
    if (match && match[1]) {
      // Remove optional surrounding quotes and whitespace
      const raw = match[1].trim();
      serviceRoleKey = raw.replace(/^"|"$/g, "");
    }
  } catch (e) {
    // ignore, will fall back to anon key
  }
}

console.log("🔍 Parsed service role key length:", serviceRoleKey ? serviceRoleKey.length : 0);
console.log(
  "🔍 Parsed service role key prefix:",
  serviceRoleKey ? serviceRoleKey.slice(0, 10) + "..." : "<none>",
);
console.log(
  "🔍 ENV SUPABASE_ANON_KEY prefix:",
  process.env.SUPABASE_ANON_KEY
    ? process.env.SUPABASE_ANON_KEY.slice(0, 10) + "..."
    : "<none>",
);

const supabaseKey = serviceRoleKey || process.env.SUPABASE_ANON_KEY || "sb_publishable_dATLFlK6takFJUF3dIGMuw_uFrcm0oI";
// Default to the actual image-to-video bucket if env is missing
const supabaseBucket = (process.env.SUPABASE_STORAGE_BUCKET || "Image-to-video_function").trim();
console.log("🔗 Supabase URL:", supabaseUrl);
console.log("🔗 Supabase key prefix:", supabaseKey ? supabaseKey.slice(0, 10) + "..." : "<none>");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🔗 Supabase bucket configured:", supabaseBucket);

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
const runawayApiKey = process.env.RUNAWAY_API_KEY || "key_0fc65dd204ead9462bff36bf4b74943618729c36bc8318c788454c72a3d9a5d2e7cc2bdaa5f105e163b7cf2b3b6154d171261ba204aff1bf033e569f9322ce5d";
const runawayApiUrl = "https://api.runwayml.com/v1";
const USE_MOCK_API = process.env.USE_MOCK_API === "true"; // Set USE_MOCK_API=true for testing without valid API key

// ✅ INIT GEMINI (used as understanding layer for media flows)
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const geminiModelId = process.env.GEMINI_MODEL_ID || "gemini-2.5-flash";
// ✅ Veo model for AI video generation (images only for now)
const veoModelId = process.env.VEO_MODEL_ID || "veo-3.1-generate-preview";

console.log("✅ Video generation service configured");
if (USE_MOCK_API) {
  console.log("⚠️  USING MOCK API (testing mode)");
} else {
  console.log("🔑 Using real Runaway API with new key");
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

const uploadVideoUrlToSupabase = async (videoUrl, fileName) => {
  const videoResponse = await fetch(videoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Unable to download generated video: ${videoResponse.status}`);
  }

  const arrayBuffer = await videoResponse.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const storagePath = `generated/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
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

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
};

const uploadToSupabase = async (filePath, fileName) => {
  const fileBuffer = fs.readFileSync(filePath);
  const storagePath = `generated/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage
    .from(supabaseBucket)
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

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);
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
// If the requested duration is longer than Veo's max per clip, this will
// generate multiple clips (4/6/8 seconds each) and concatenate them
// with ffmpeg before uploading a single final video to Supabase.
const generateVeoVideoFromImages = async (prompt, durationSeconds, aspectRatio, imageFiles) => {
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set for Veo generation");
  }

  const totalSecRaw = Number(durationSeconds) || 8;
  const totalSec = Math.max(4, Math.min(180, totalSecRaw));
  const aspect = aspectRatio || "16:9";

  // Decide how to split the requested duration into Veo-supported clip lengths.
  // Veo supports 4, 6, or 8 seconds; we approximate the total.
  const segmentDurations = [];
  let remaining = totalSec;

  while (remaining > 8) {
    segmentDurations.push(8);
    remaining -= 8;
  }

  if (remaining > 0) {
    if (remaining <= 4) segmentDurations.push(4);
    else if (remaining <= 6) segmentDurations.push(6);
    else segmentDurations.push(8);
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

  // Upload final video to Supabase storage
  const fileName = `veo-${Date.now()}.mp4`;
  const { publicUrl, storagePath } = await uploadToSupabase(finalOutputPath, fileName);
  console.log("✅ [Veo] Final Veo video stored in Supabase:", storagePath);

  // Clean up temporary files
  generatedTempFiles.forEach((p) => {
    fs.unlink(p, () => {});
  });

  return {
    publicUrl,
    storagePath,
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
  if (!runawayApiKey) {
    throw new Error("Missing RUNAWAY_API_KEY. Add it to your environment.");
  }

  console.log("🎬 [GenVideo] Generating video...");
  console.log("🔑 [GenVideo] API Key format check - starts with 'key_':", runawayApiKey.startsWith("key_"));
  console.log("🔑 [GenVideo] API Key length:", runawayApiKey.length);

  try {
    // Create a text-to-video request
    const requestBody = {
      prompt: prompt,
      duration: Math.max(3, Math.min(20, duration || 10)),
      aspect_ratio: aspectRatio,
    };

    console.log("📝 [GenVideo] Request body:", JSON.stringify(requestBody));
    console.log("🌐 [GenVideo] Calling endpoint:", `${runawayApiUrl}/text_to_video`);

    const response = await fetch(`${runawayApiUrl}/text_to_video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${runawayApiKey}`,
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

    console.log("✅ [GenVideo] Request accepted");

    // Check if we got a task ID or direct output
    if (data.taskId || data.task_id) {
      const taskId = data.taskId || data.task_id;
      console.log("📝 Got task ID:", taskId);

      // Poll for completion (max 5 minutes)
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(`${runawayApiUrl}/task/${taskId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${runawayApiKey}`,
          },
        });

        if (!statusResponse.ok) {
          throw new Error(`Failed to check task status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        console.log(`⏳ Task Status (${attempts + 1}/${maxAttempts}):`, statusData.status);

        if (statusData.status === "SUCCEEDED") {
          const videoUrl = statusData.output?.video || statusData.videoUrl || statusData.output?.[0];
          if (!videoUrl) {
            throw new Error("Task succeeded but no video URL in response");
          }
          console.log("✅ Video generated:", videoUrl);
          return videoUrl;
        }

        if (statusData.status === "FAILED") {
          throw new Error(`Task failed: ${statusData.error || "Unknown error"}`);
        }

        attempts++;
      }

      throw new Error("Video generation timed out after 5 minutes");
    }

    // If direct output (newer API)
    if (data.output?.video || data.videoUrl || (Array.isArray(data.output) && data.output[0])) {
      const videoUrl = data.output?.video || data.videoUrl || data.output?.[0];
      console.log("✅ Video generated directly:", videoUrl);
      return videoUrl;
    }

    throw new Error("Unexpected Runaway API response format: " + JSON.stringify(data));
  } catch (error) {
    console.error("❌ Runaway Generation Error:", error.message);
    throw error;
  }
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

    // Use Runaway API for prompt-based generation
    console.log("🎬 [API] Starting video generation...");
    videoUrl = await generateVideoWithRunaway(finalPrompt, seconds, frame || "16:9");
    console.log("✅ [API] Video generated successfully");

    // 🔥 STEP 2: UPLOAD TO SUPABASE STORAGE
    let storage = null;

    try {
      console.log("📤 [API] Uploading to storage...");
      const uploadResult = await uploadVideoUrlToSupabase(videoUrl, fileName);
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
      const { prompt, duration, frame, selectedEffect, selectedFilter, effectSettings, transitionPlan, editorSelections, quickEditMode } = req.body || {};
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

      const effects = {
        selectedEffect: resolvedSelectedEffect || "none",
        settings: resolvedEffectSettings,
      };

      const isQuickEditMode = String(quickEditMode || "").toLowerCase() === "true";

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

      console.log("📝 [API-MEDIA] Config:", {
        prompt,
        durationSeconds: seconds,
        frame: aspect,
        mediaCount: mediaFiles.length,
        hasAudio: audioFiles.length > 0,
        quickEditMode: isQuickEditMode,
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
        speed: parsedEditorSelections?.speed || { enabled: false },
        trim: parsedEditorSelections?.trim || { enabled: false },
        textOverlay: parsedEditorSelections?.textOverlay || { enabled: false },
        rotate: parsedEditorSelections?.rotate || { enabled: false },
        volume: parsedEditorSelections?.volume || { muted: false, level: 1 },
        zoom: parsedEditorSelections?.zoom || { enabled: false, mode: "in", amount: 1 },
        keyframe: parsedEditorSelections?.keyframe || { enabled: false, points: [] },
      });

      // Pick video or images as visual source
      const videoFile = mediaFiles.find((f) => f.mimetype?.startsWith("video/"));
      const imageFiles = mediaFiles.filter((f) => f.mimetype?.startsWith("image/"));

      if (!videoFile && !imageFiles.length) {
        console.error("❌ [API-MEDIA] Unsupported media types");
        return res.status(400).json({ success: false, error: "Upload at least one image or video file" });
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

          if (media.mimetype?.startsWith("video/")) {
            await processVideo(media.path, segmentPath, null);
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
        if (isQuickEditMode) {
          // Preserve full uploaded video for Quick Edit.
          await processVideo(videoFile.path, baseOutputPath, null);
          seconds = await getVideoDuration(baseOutputPath);
        } else {
          await processVideo(videoFile.path, baseOutputPath, seconds);
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

      // STEP 2: If audio is provided, merge it with the base video
      if (audioFiles.length) {
        const audioFile = audioFiles[0];
        const audioOutputPath = makeTempFilePath("with-audio.mp4");

        console.log("🎵 [API-MEDIA] Adding custom audio:", audioFile.originalname);

        await new Promise((resolve, reject) => {
          ffmpeg()
            .input(baseOutputPath)
            .input(audioFile.path)
            .outputOptions(["-c:v copy", "-c:a aac", "-shortest"])
            .output(audioOutputPath)
            .on("end", () => {
              console.log("✅ [API-MEDIA] Audio merged with video");
              resolve();
            })
            .on("error", (err) => {
              console.error("❌ [API-MEDIA] Error merging audio:", err);
              reject(err);
            })
            .run();
        });

        finalOutputPath = audioOutputPath;
        generatedTempFiles.push(audioOutputPath);
      }

      // STEP 3: If this is an images-only request, try full AI video generation with Veo.
      // We ignore the ffmpeg output and instead generate a new video from the images + prompt.
      if (!isQuickEditMode && !videoFile && imageFiles.length > 0) {
        try {
          console.log("🎨 [API-MEDIA] Using Veo for image-only AI video generation");
          const veoResult = await generateVeoVideoFromImages(prompt, seconds, aspect, imageFiles);

          // Clean up temporary files (best-effort)
          const tempPathsForVeo = [
            ...mediaFiles.map((f) => f.path),
            ...audioFiles.map((f) => f.path),
            ...generatedTempFiles,
            baseOutputPath !== finalOutputPath ? baseOutputPath : null,
            finalOutputPath,
          ].filter(Boolean);

          tempPathsForVeo.forEach((p) => {
            fs.unlink(p, () => {});
          });

          return res.json({
            success: true,
            video: veoResult.publicUrl,
            storage: veoResult.storagePath,
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
      const { publicUrl, storagePath } = await uploadToSupabase(finalOutputPath, fileName);
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