import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, RotateCcw, Edit, Play, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

export function QuickEditResultScreen() {
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
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Edit complete!</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Your Video is Ready
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">
            AI has automatically edited your video
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 overflow-hidden mb-8"
        >
          <div className="relative aspect-video bg-gradient-to-br from-[#0b0d1f] to-[#1a1b2e] flex items-center justify-center group overflow-hidden border-b border-[#3f4a67]/50">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-teal-500/10" />
            
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(34,211,238,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all border border-white/20"
            >
              <Play className="w-8 h-8 text-[#0b0d1f] ml-1" fill="currentColor" />
            </motion.button>

            {/* Subtitle Preview */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0b0d1f]/80 backdrop-blur-md px-6 py-2 rounded-lg border border-[#3f4a67]/50">
              <p className="text-white text-sm font-medium">AI-generated subtitles</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-cyan-400 mb-1 drop-shadow-sm">24</div>
                <div className="text-xs text-[#94a3b8] font-medium">Auto Cuts</div>
              </div>
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-blue-400 mb-1 drop-shadow-sm">100%</div>
                <div className="text-xs text-[#94a3b8] font-medium">Subtitles</div>
              </div>
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-teal-400 mb-1 drop-shadow-sm">1:45</div>
                <div className="text-xs text-[#94a3b8] font-medium">Processing</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => alert("Download started!")}
                className="h-12 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 text-[#0b0d1f] font-bold hover:opacity-90 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl border border-cyan-300/40"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={() => navigate("/reference-video/setup")}
                variant="outline"
                className="h-12 border border-[#3f4a67] hover:border-cyan-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 shadow-sm transition-all"
              >
                <Edit className="w-4 h-4 mr-2 text-blue-400" />
                Edit Further
              </Button>

              <Button
                onClick={() => navigate("/quick-edit/style")}
                variant="outline"
                className="h-12 border border-[#3f4a67] hover:border-teal-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-teal-400" />
                Regenerate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Another */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="text-center mb-8"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
             className="h-12 px-8 border border-[#3f4a67] hover:border-cyan-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] font-semibold transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            Create Another Video
          </Button>
        </motion.div>

        {/* Applied Features */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="p-6 bg-[#1a1b2e]/40 backdrop-blur-md rounded-xl border border-[#3f4a67]/50 shadow-md">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> AI Enhancements Applied</h3>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Auto-generated subtitles</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Removed 8 seconds of silence</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Applied face tracking</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>24 smart cuts</li>
            </ul>
          </div>

          <div className="p-6 bg-[#1a1b2e]/40 backdrop-blur-md rounded-xl border border-[#3f4a67]/50 shadow-md">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-[10px] font-bold text-[#0b0d1f]">i</div> Video Details</h3>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Format: YouTube Edit</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Duration: 2:15</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Resolution: 1080p</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Size: 89 MB</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
