import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Film, Wand2 } from "lucide-react";

export function EditVideoProcessingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      navigate("/edit-video/editor");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-12 text-center"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-lg"
          >
            <Film className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Analyzing Video
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8">
            AI is detecting scenes, audio, and quality
          </p>

          {/* Animated Dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
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

          {/* Processing Steps */}
          <div className="mt-12 space-y-3 text-left max-w-md mx-auto">
            {["Detecting scenes", "Analyzing audio quality", "Identifying objects", "Preparing editor"].map(
              (step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <Wand2 className="w-4 h-4 text-[#6366f1]" />
                  <span>{step}</span>
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
