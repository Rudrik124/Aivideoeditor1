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
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center font-sans selection:bg-cyan-500/30 selection:text-white"
      style={{
        background: 'linear-gradient(135deg, #0b0d1f 0%, #1a1b2e 30%, #2d3142 60%, #3f4a67 85%, #1a1b2e 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Corner Vignettes */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }}
      />

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-12 text-center"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          >
            <Zap className="w-12 h-12 text-[#0b0d1f]" fill="currentColor" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            AI is Editing Your Video
          </h2>

          {/* Subtitle */}
          <p className="text-[#94a3b8] mb-8 font-medium">
            Please wait while we work our magic...
          </p>

          {/* Animated Progress Dots */}
          <div className="flex justify-center gap-2 mb-12">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
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
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                <span className="text-sm font-medium text-[#cbd5e1]">{step.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 text-sm font-medium text-[#64748b]"
          >
            This usually takes less than 2 minutes
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
