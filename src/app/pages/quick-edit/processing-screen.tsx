import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Zap } from "lucide-react";

export function QuickEditProcessingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/quick-edit/result");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-12 text-center"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center shadow-lg"
          >
            <Zap className="w-12 h-12 text-white" fill="currentColor" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            AI is Editing Your Video
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 mb-8">
            Please wait while we work our magic...
          </p>

          {/* Animated Progress Dots */}
          <div className="flex justify-center gap-2 mb-12">
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
          <div className="space-y-4 text-left max-w-sm mx-auto">
            {[
              { label: "Analyzing content", delay: 0 },
              { label: "Applying AI cuts", delay: 0.3 },
              { label: "Generating subtitles", delay: 0.6 },
              { label: "Adding effects", delay: 0.9 },
              { label: "Finalizing video", delay: 1.2 },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] animate-pulse" />
                <span className="text-sm text-gray-600">{step.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 text-sm text-gray-500"
          >
            This usually takes less than 2 minutes
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
