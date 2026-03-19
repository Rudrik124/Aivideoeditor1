import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, Sparkles, Share2, Play, Pause } from "lucide-react";
import { Button } from "../components/ui/button";

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPromptStyle(prompt: string): { label: string; filter: string; playbackRate: number } {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("cinematic") || normalized.includes("movie")) {
    return {
      label: "Cinematic look",
      filter: "contrast(1.2) saturate(1.15) brightness(0.92)",
      playbackRate: 1,
    };
  }

  return {
    label: "Balanced grade",
    filter: "contrast(1.05) saturate(1.08)",
    playbackRate: 1,
  };
}

export function ResultPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const stylePreset = useMemo(
    () => getPromptStyle(localStorage.getItem("prompt") || ""),
    []
  );

  // ✅ GET VIDEO FROM LOCAL STORAGE (SUPABASE URL)
  useEffect(() => {
    const generated = localStorage.getItem("generatedVideo");

    if (generated) {
      setVideoUrl(generated);
    } else {
      setVideoUrl(null);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = stylePreset.playbackRate;
    }
  }, [stylePreset.playbackRate, videoUrl]);

  const togglePlayback = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // ✅ FIXED DOWNLOAD
  const handleDownload = () => {
    if (!videoUrl) {
      alert("No video found to download.");
      return;
    }

    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "generated-video.mp4";
    a.click();
  };

  const handleShare = () => {
    if (!videoUrl) {
      alert("No video available to share.");
      return;
    }

    alert("Sharing coming soon");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Your Generated Video</h1>

      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4">
        {videoUrl ? (
          <>
            <div className="relative">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full rounded-lg"
                style={{ filter: stylePreset.filter }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />

              <button
                onClick={togglePlayback}
                className="absolute inset-0 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={40} />
                ) : (
                  <Play size={40} />
                )}
              </button>
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleDownload}>Download</Button>
              <Button onClick={handleShare}>Share</Button>
            </div>
          </>
        ) : (
          <p>No video found</p>
        )}
      </div>

      <Button className="mt-6" onClick={() => navigate("/")}>
        Create Another
      </Button>
    </div>
  );
}