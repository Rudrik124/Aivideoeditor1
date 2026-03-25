import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, Share2, Sparkles, Play } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ImagesToVideoPreviewScreen() {
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

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-6 py-2.5 rounded-full border border-emerald-500/20 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-sm font-semibold text-emerald-300 tracking-wide uppercase font-sans tracking-[0.1em]">Video created successfully!</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Preview Your Video
          </h1>
        </motion.div>

        {/* Video Player */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 overflow-hidden mb-8"
        >
          <div className="relative aspect-video bg-[#0b0d1f] flex items-center justify-center group border-b border-[#3f4a67]/50">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-cyan-500/10 mix-blend-overlay" />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-cyan-500/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] border border-cyan-400/30 group-hover:bg-cyan-400/30 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all"
            >
              <Play className="w-8 h-8 text-cyan-300 ml-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" fill="currentColor" />
            </motion.button>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => alert("Download started!")}
                 className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl border border-cyan-300/40"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </Button>
              <Button
                onClick={() => alert("Share options coming soon!")}
                variant="outline"
                className="h-14 px-8 border border-[#3f4a67] hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 text-[#cbd5e1] rounded-xl font-semibold transition-all bg-[#0b0d1f]/40"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Another */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="text-center"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="h-14 px-8 border border-[#3f4a67] hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-300 text-[#cbd5e1] rounded-xl font-semibold transition-all bg-[#1a1b2e]/60 backdrop-blur-xl shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            Create Another Video
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
