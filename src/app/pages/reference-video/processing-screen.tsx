import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Film, Wand2 } from "lucide-react";

export function ReferenceVideoProcessingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/reference-video/result");
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white flex items-center justify-center"
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.5)] border border-cyan-300/30"
          >
            <Film className="w-12 h-12 text-[#0b0d1f]" fill="currentColor" />
          </motion.div>

          <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Generating with Reference
          </h2>
          <p className="text-[#94a3b8] mb-8 font-medium">
            Building scenes from your reference video, prompt, assets, and audio.
          </p>

          <div className="mt-8 space-y-3 text-left max-w-md mx-auto">
            {["Reading reference video", "Composing prompt-driven shots", "Applying frame ratio", "Rendering final output"].map(
              (step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.25 }}
                  className="flex items-center gap-3 text-sm font-semibold text-cyan-100"
                >
                  <Wand2 className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
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
