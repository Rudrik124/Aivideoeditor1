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

// ✅ VIDEO PROCESS FUNCTION (uploaded source)
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

// ✅ START SERVER
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});