import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ArrowLeft, Download, RefreshCcw, Video } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ReferenceVideoResultScreen() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white pb-20"
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

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
<<<<<<< Updated upstream
          onClick={() => navigate("/tools")}
=======
          onClick={() => navigate("/features")}
>>>>>>> Stashed changes
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to selection</span>
        </motion.button>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-6 md:p-8"
        >
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Reference Video Generated
          </h1>
          <p className="text-[#94a3b8] mb-8 font-medium">Your generated video is ready for preview and export.</p>

          {/* Video Container */}
          <div className="relative aspect-video rounded-xl bg-[#0b0d1f] flex items-center justify-center mb-8 border border-[#3f4a67]/50 shadow-inner overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-cyan-500/10 mix-blend-overlay" />
            <Video className="w-14 h-14 text-cyan-500/50 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:text-cyan-400 transition-colors relative z-10" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl border border-cyan-300/40">
              <Download className="w-5 h-5 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/reference-video/setup")}
               className="h-14 px-8 border border-[#3f4a67] hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 text-[#cbd5e1] rounded-xl font-semibold transition-all bg-[#0b0d1f]/40"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              Generate Again
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
