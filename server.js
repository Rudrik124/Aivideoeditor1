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

// ✅ INIT REPLICATE
const replicateModel = process.env.REPLICATE_MODEL || "kwaivgi/kling-v1.6-pro";
const replicateApiToken = (process.env.REPLICATE_API_TOKEN || "r8_FgZyAFlUCrgxoznobM5FbNhlyYUzqme2DB0kC").trim();

// ✅ INIT SUPABASE
const supabaseUrl = process.env.SUPABASE_URL || "https://cowdbhlpxzrlcbsxrvwh.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_dATLFlK6takFJUF3dIGMuw_uFrcm0oI";
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "videos";
const supabase = createClient(supabaseUrl, supabaseKey);

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

const createReplicateVideo = async (promptText, duration = 10, frame = "16:9", replicateApiToken = "") => {
  if (!replicateApiToken) {
    throw new Error("Missing REPLICATE_API_TOKEN. Add it to your environment to enable prompt-to-video generation.");
  }

  const durationSeconds = Math.max(3, Math.min(20, Number(duration) || 8));

  const createResponse = await fetch(`https://api.replicate.com/v1/models/${replicateModel}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${replicateApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: {
        prompt: promptText,
        aspect_ratio: frame,
        duration: durationSeconds,
      },
    }),
  });

  const rawCreateBody = await createResponse.text();
  let created;
  try {
    created = rawCreateBody ? JSON.parse(rawCreateBody) : {};
  } catch {
    created = { detail: rawCreateBody };
  }

  if (!createResponse.ok) {
    if (createResponse.status === 401) {
      throw new Error("Replicate authentication failed: invalid or expired API token.");
    }
    throw new Error(created.detail || created.error || `Replicate prediction creation failed (${createResponse.status}).`);
  }

  let prediction = created;
  const maxPolls = 120;
  let pollCount = 0;

  while (pollCount < maxPolls && prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
    await sleep(2500);
    const statusResponse = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Token ${replicateApiToken}`,
      },
    });
    const rawStatusBody = await statusResponse.text();
    try {
      prediction = rawStatusBody ? JSON.parse(rawStatusBody) : prediction;
    } catch {
      throw new Error(`Replicate status check failed (${statusResponse.status}).`);
    }
    pollCount += 1;
  }

  if (prediction.status !== "succeeded") {
    throw new Error(prediction.error || `Replicate generation ended with status: ${prediction.status}`);
  }

  const outputUrl = extractOutputUrl(prediction.output);
  if (!outputUrl) {
    throw new Error("Replicate succeeded but no output video URL was returned.");
  }

  return outputUrl;
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

// ✅ MAIN ROUTE
app.post("/generate", upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
  const { prompt, duration, frame } = req.body;

  try {
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const seconds = Math.max(3, Math.min(180, Number(duration) || 10));
    const uploadedSource = req.files?.file?.[0] || null;
    const effectiveReplicateToken = String(replicateApiToken || "").trim();

    console.log("Prompt:", prompt);
    console.log("Duration:", seconds);
    console.log("Frame:", frame || "16:9");
    if (uploadedSource) {
      console.log("Input File:", uploadedSource.path);
    }

    // 🔥 STEP 1: GENERATE VIDEO
    const fileName = `output-${Date.now()}.mp4`;
    const outputPath = `outputs/${fileName}`;
    let remoteGeneratedUrl = "";

    if (uploadedSource) {
      await processVideo(uploadedSource.path, outputPath, seconds);
    } else {
      remoteGeneratedUrl = await createReplicateVideo(prompt, seconds, frame || "16:9", effectiveReplicateToken);
    }

    // 🔥 STEP 2: UPLOAD TO SUPABASE STORAGE
    let videoUrl = remoteGeneratedUrl || `http://localhost:5000/videos/${fileName}`;
    let storage = null;

    try {
      const uploadResult = remoteGeneratedUrl
        ? await uploadVideoUrlToSupabase(remoteGeneratedUrl, fileName)
        : await uploadToSupabase(outputPath, fileName);
      videoUrl = uploadResult.publicUrl;
      storage = uploadResult.storagePath;
    } catch (storageError) {
      console.error("⚠️ Supabase upload failed, using local URL:", storageError.message);
    }

    // 🔥 STEP 3: RETURN RESPONSE
    res.json({
      success: true,
      video: videoUrl,
      storage,
    });

  } catch (error) {
    console.error("❌ Error:", error);

    const errorMessage = error?.message || "Unknown generation error.";
    const isBillingError = /insufficient credit|billing/i.test(errorMessage);

    if (isBillingError) {
      return res.status(402).json({
        success: false,
        error: "Replicate billing required: your account has insufficient credits. Add credits in Replicate billing and try again.",
      });
    }

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