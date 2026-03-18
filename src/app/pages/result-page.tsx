import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, Sparkles, Share2, Play, Pause } from "lucide-react";
import { Button } from "../components/ui/button";
import { getVideoDraft } from "../temp-video-draft-store";

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

  if (normalized.includes("warm") || normalized.includes("sunset") || normalized.includes("gold")) {
    return {
      label: "Warm grade",
      filter: "sepia(0.2) saturate(1.3) hue-rotate(-10deg)",
      playbackRate: 1,
    };
  }

  if (normalized.includes("cool") || normalized.includes("night") || normalized.includes("blue")) {
    return {
      label: "Cool grade",
      filter: "contrast(1.1) saturate(1.1) hue-rotate(15deg)",
      playbackRate: 1,
    };
  }

  if (normalized.includes("slow") || normalized.includes("dramatic")) {
    return {
      label: "Slow cinematic",
      filter: "contrast(1.08) saturate(1.05)",
      playbackRate: 0.85,
    };
  }

  if (normalized.includes("fast") || normalized.includes("energetic") || normalized.includes("sports")) {
    return {
      label: "Fast-paced",
      filter: "contrast(1.12) saturate(1.22)",
      playbackRate: 1.15,
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
  const draft = getVideoDraft();
  const sourceVideo = useMemo(
    () => draft.uploadedFiles.find((file) => file.type.startsWith("video")) ?? draft.referenceVideo,
    [draft]
  );
  const stylePreset = useMemo(() => getPromptStyle(draft.prompt), [draft.prompt]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!sourceVideo) {
      setVideoUrl(null);
      return;
    }

    const url = URL.createObjectURL(sourceVideo);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sourceVideo]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = stylePreset.playbackRate;
    }
  }, [stylePreset.playbackRate, videoUrl]);

  const togglePlayback = () => {
    if (!videoRef.current) {
      return;
    }

    if (videoRef.current.paused) {
      void videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl || !sourceVideo) {
      alert("No video found to download. Upload a video first.");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = videoUrl;
    anchor.download = sourceVideo.name || "generated-video.mp4";
    anchor.click();
  };

  const handleShare = () => {
    if (!videoUrl) {
      alert("No video available to share yet.");
      return;
    }

    if (navigator.share) {
      void navigator
        .share({
          title: "My AI Video",
          text: "Check out my AI-generated video.",
          url: window.location.href,
        })
        .catch(() => {
          // Ignore cancellation from share dialog.
        });
      return;
    }

    alert("Share is not supported in this browser.");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700">Video ready!</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Your Video is Ready
          </h1>
          <p className="text-gray-600">
            Your AI-generated video has been created successfully
          </p>
        </motion.div>

        {/* Video Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8"
        >
          {/* Video Preview */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center group">
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ filter: stylePreset.filter }}
                  onClick={togglePlayback}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onLoadedMetadata={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                    setDuration(e.currentTarget.duration || 0);
                  }}
                  onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                    setCurrentTime(e.currentTarget.currentTime || 0);
                  }}
                  controls={false}
                />

                <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-[#8b5cf6]/10 to-[#d946ef]/10" />

                {/* Play/Pause Button Overlay */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={togglePlayback}
                  className="relative z-10 w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-white transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-[#6366f1]" fill="currentColor" />
                  ) : (
                    <Play className="w-8 h-8 text-[#6366f1] ml-1" fill="currentColor" />
                  )}
                </motion.button>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center justify-between text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 mx-4 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-white/90 px-6">
                <p className="text-lg font-medium mb-2">No video available yet</p>
                <p className="text-sm text-white/70">Upload at least one video before generating.</p>
              </div>
            )}

            {/* Quality Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
              4K • 60fps
            </div>

            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
              {stylePreset.label}
            </div>
          </div>

          {/* Video Details */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-[#6366f1]/5 to-[#6366f1]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#6366f1] mb-1">3840x2160</div>
                <div className="text-sm text-gray-600">Resolution</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#8b5cf6]/5 to-[#8b5cf6]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#8b5cf6] mb-1">{formatTime(duration)}</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#d946ef]/5 to-[#d946ef]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#d946ef] mb-1">
                  {sourceVideo ? `${(sourceVideo.size / 1024 / 1024).toFixed(1)} MB` : "-"}
                </div>
                <div className="text-sm text-gray-600">File Size</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownload}
                className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="h-12 px-6 text-base rounded-xl border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Another Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="h-12 px-8 text-base rounded-xl border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors bg-white/60 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Another Video
          </Button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "AI-Enhanced",
              description: "Automatic color grading and scene detection",
              gradient: "from-[#6366f1]/10 to-[#6366f1]/5",
            },
            {
              title: "Professional Quality",
              description: "Export in 4K resolution with 60fps",
              gradient: "from-[#8b5cf6]/10 to-[#8b5cf6]/5",
            },
            {
              title: "Fast Rendering",
              description: "Generate videos in under a minute",
              gradient: "from-[#d946ef]/10 to-[#d946ef]/5",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl bg-gradient-to-br ${feature.gradient} border border-gray-200`}
            >
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
