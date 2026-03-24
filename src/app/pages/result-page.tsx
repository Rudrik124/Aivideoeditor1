import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, Sparkles, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";

export function ResultPage() {
  const navigate = useNavigate();

  // ✅ GET VIDEO FROM BACKEND
  const videoUrl = localStorage.getItem("generatedVideo");
  const storagePath = localStorage.getItem("generatedVideoStorage");
  const generationError = localStorage.getItem("generatedVideoError");

  const handleDownload = () => {
    if (!videoUrl) {
      alert("No video available");
      return;
    }

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "generated-video.mp4";
    link.click();
  };

  const handleShare = () => {
    if (!videoUrl) {
      alert("No video available");
      return;
    }

    navigator.clipboard.writeText(videoUrl);
    alert("Video link copied!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700">Video ready!</span>
          </div>

          <h1 className="text-4xl font-bold mb-3">
            Your Video is Ready 🎬
          </h1>

          {storagePath && (
            <p className="text-sm text-green-700">Saved to Supabase: {storagePath}</p>
          )}
        </motion.div>

        {/* 🎥 VIDEO PLAYER */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-8">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
          ) : (
            <div className="text-center">
              <p className="text-gray-500">No video found</p>
              {generationError && (
                <p className="text-sm text-red-600 mt-2">{generationError}</p>
              )}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={handleDownload}
            className="flex-1 h-12 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="h-12 px-6"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>

        {/* BACK BUTTON */}
        <div className="text-center">
          <Button onClick={() => navigate("/")}>
            <Sparkles className="w-5 h-5 mr-2" />
            Create Another Video
          </Button>
        </div>
      </div>
    </div>
  );
}