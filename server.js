import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
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
const processVideo = (input, output, duration = 10) => {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(0)
      .setDuration(duration)
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

// ✅ MAIN ROUTE - API Video Generation
// Accepts JSON with: { prompt, duration, frame }
app.post("/generate", async (req, res) => {
  const { prompt, duration, frame } = req.body;

  try {
    console.log("📍 [API] Video generation request received");

    if (!prompt || !String(prompt).trim()) {
      console.error("❌ [API] Missing prompt");
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const seconds = Math.max(3, Math.min(180, Number(duration) || 10));

    console.log("📝 [API] Generation config: duration=" + seconds + "s, ratio=" + (frame || "16:9"));

    // 🔥 STEP 1: GENERATE VIDEO WITH RUNAWAY API
    const fileName = `output-${Date.now()}.mp4`;
    const outputPath = `outputs/${fileName}`;
    
    let videoUrl = "";

    // Use Runaway API for prompt-based generation
    console.log("🎬 [API] Starting video generation...");
    videoUrl = await generateVideoWithRunaway(prompt, seconds, frame || "16:9");
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
      const { prompt, duration, frame } = req.body || {};
      const files = req.files || {};
      const mediaFiles = Array.isArray(files.media) ? files.media : [];
      const audioFiles = Array.isArray(files.audio) ? files.audio : [];

      console.log("📍 [API-MEDIA] Direct media generation request received");

      if (!prompt || !String(prompt).trim()) {
        console.error("❌ [API-MEDIA] Missing prompt");
        return res.status(400).json({ success: false, error: "Prompt is required" });
      }

      if (!mediaFiles.length) {
        console.error("❌ [API-MEDIA] No media files uploaded");
        return res.status(400).json({ success: false, error: "At least one image or video file is required" });
      }

      const seconds = Math.max(3, Math.min(180, Number(duration) || 10));
      const aspect = frame || "16:9";

      console.log("📝 [API-MEDIA] Config:", {
        prompt,
        durationSeconds: seconds,
        frame: aspect,
        mediaCount: mediaFiles.length,
        hasAudio: audioFiles.length > 0,
      });

      // Pick video or images as visual source
      const videoFile = mediaFiles.find((f) => f.mimetype?.startsWith("video/"));
      const imageFiles = mediaFiles.filter((f) => f.mimetype?.startsWith("image/"));

      if (!videoFile && !imageFiles.length) {
        console.error("❌ [API-MEDIA] Unsupported media types");
        return res.status(400).json({ success: false, error: "Upload at least one image or video file" });
      }

      const fileName = `direct-media-${Date.now()}.mp4`;
      const baseOutputPath = `outputs/${fileName}`;
      let finalOutputPath = baseOutputPath;
      const generatedTempFiles = [];

      // STEP 1: Build base video from uploaded media
      if (videoFile) {
        console.log("🎬 [API-MEDIA] Using uploaded video as source:", videoFile.originalname);
        await processVideo(videoFile.path, baseOutputPath, seconds);
      } else if (imageFiles.length === 1) {
        console.log("🖼️ [API-MEDIA] Using single uploaded image as source:", imageFiles[0].originalname);
        await createVideoFromImage(imageFiles[0].path, baseOutputPath, seconds, aspect);
      } else if (imageFiles.length > 1) {
        console.log("🖼️ [API-MEDIA] Building slideshow from", imageFiles.length, "images");
        const perImageSeconds = Math.max(1, Math.floor(seconds / imageFiles.length) || 1);

        const segmentBaseNames = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const baseName = `segment-${Date.now()}-${i}.mp4`;
          const segmentPath = `outputs/${baseName}`;
          await createVideoFromImage(imageFiles[i].path, segmentPath, perImageSeconds, aspect);
          segmentBaseNames.push(baseName);
          generatedTempFiles.push(segmentPath);
        }

        const listFileName = `concat-${Date.now()}.txt`;
        const listFilePath = `outputs/${listFileName}`;
        const listContent = segmentBaseNames.map((name) => `file '${name}'`).join("\n");
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
        const audioOutputPath = `outputs/with-audio-${Date.now()}.mp4`;

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
      }

      // STEP 3: If this is an images-only request, try full AI video generation with Veo.
      // We ignore the ffmpeg output and instead generate a new video from the images + prompt.
      if (!videoFile && imageFiles.length > 0) {
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
          });
        } catch (veoError) {
          console.error(
            "❌ [API-MEDIA] Veo generation failed, falling back to ffmpeg output:",
            veoError?.message || veoError,
          );
        }
      }

      // STEP 4: Optionally run AI transform using prompt + media (non-Veo path)
      finalOutputPath = await transformVideoWithPrompt(finalOutputPath, prompt, seconds, aspect);

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
      ].filter(Boolean);

      tempPaths.forEach((p) => {
        fs.unlink(p, () => {});
      });

      return res.json({
        success: true,
        video: publicUrl,
        storage: storagePath,
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