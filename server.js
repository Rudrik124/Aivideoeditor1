import express from "express";
import cors from "cors";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_dATLFlK6takFJUF3dIGMuw_uFrcm0oI";
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "videos";
const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ INIT RUNAWAY API
const runawayApiKey = process.env.RUNAWAY_API_KEY || "key_0fc65dd204ead9462bff36bf4b74943618729c36bc8318c788454c72a3d9a5d2e7cc2bdaa5f105e163b7cf2b3b6154d171261ba204aff1bf033e569f9322ce5d";
const runawayApiUrl = "https://api.runwayml.com/v1";
const USE_MOCK_API = process.env.USE_MOCK_API === "true"; // Set USE_MOCK_API=true for testing without valid API key

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
    throw error;
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
    throw error;
  }

  const { data } = supabase.storage.from(supabaseBucket).getPublicUrl(storagePath);
  return { publicUrl: data.publicUrl, storagePath };
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

      // STEP 3: Upload final video to Supabase storage
      console.log("📤 [API-MEDIA] Uploading final video to storage...");
      const { publicUrl, storagePath } = await uploadToSupabase(finalOutputPath, fileName);
      console.log("✅ [API-MEDIA] Storage upload complete");

      // STEP 4: Clean up temporary files (best-effort)
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