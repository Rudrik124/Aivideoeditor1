import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Video } from "lucide-react";
import { Progress } from "../components/ui/progress";

const statusMessages = [
  "Analyzing clips",
  "Detecting scenes",
  "Applying AI enhancements",
  "Generating transitions",
  "Syncing audio",
  "Color grading",
  "Applying effects",
  "Rendering final video",
];

export function ProcessingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(statusMessages[0]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (isPaused) {
          return prev;
        }
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => navigate("/result"), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(progressInterval);
  }, [isPaused, navigate]);

  useEffect(() => {
    // Update status message based on progress
    const newIndex = Math.min(
      Math.floor((progress / 100) * statusMessages.length),
      statusMessages.length - 1
    );
    if (newIndex !== statusIndex) {
      setStatusIndex(newIndex);
      setCurrentStatus(statusMessages[newIndex]);
    }
  }, [progress, statusIndex]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
        >
          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg"
            >
              <Video className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Creating Your Video
          </h2>

          {/* Status Message */}
          <motion.div
            key={currentStatus}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#6366f1]/10 rounded-full">
              <Loader2 className="w-4 h-4 text-[#6366f1] animate-spin" />
              <span className="text-sm text-gray-700">{currentStatus}</span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progress} className="h-3" />
          </div>

          {/* Progress Percentage */}
          <div className="text-center">
            <motion.span
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent"
            >
              {progress}%
            </motion.span>
          </div>

          {/* Info Text */}
          <p className="text-center text-gray-500 mt-6 text-sm">
            This usually takes 30-60 seconds. Please don't close this window.
          </p>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white/70 hover:bg-white transition-colors"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]"
              />
            ))}
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200"
        >
          <div className="space-y-3">
            {statusMessages.map((status, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                  index <= statusIndex ? "text-gray-700" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < statusIndex
                      ? "bg-[#6366f1]"
                      : index === statusIndex
                      ? "bg-[#8b5cf6] animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span>{status}</span>
                {index < statusIndex && (
                  <span className="ml-auto text-green-600 text-xs">✓</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
