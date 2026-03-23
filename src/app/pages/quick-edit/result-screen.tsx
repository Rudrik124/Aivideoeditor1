import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, RotateCcw, Edit, Play, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

export function QuickEditResultScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700">Edit complete!</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Your Video is Ready
          </h1>
          <p className="text-gray-600">
            AI has automatically edited your video
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8"
        >
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#d946ef]/20" />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-white transition-colors"
            >
              <Play className="w-8 h-8 text-[#6366f1] ml-1" fill="currentColor" />
            </motion.button>

            {/* Subtitle Preview */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 px-6 py-2 rounded-lg">
              <p className="text-white text-sm">AI-generated subtitles</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-[#6366f1]/5 to-[#6366f1]/10 rounded-xl">
                <div className="text-xl font-bold text-[#6366f1] mb-1">24</div>
                <div className="text-xs text-gray-600">Auto Cuts</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#8b5cf6]/5 to-[#8b5cf6]/10 rounded-xl">
                <div className="text-xl font-bold text-[#8b5cf6] mb-1">100%</div>
                <div className="text-xs text-gray-600">Subtitles</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#d946ef]/5 to-[#d946ef]/10 rounded-xl">
                <div className="text-xl font-bold text-[#d946ef] mb-1">1:45</div>
                <div className="text-xs text-gray-600">Processing</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => alert("Download started!")}
                className="h-12 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={() => navigate("/reference-video/setup")}
                variant="outline"
                className="h-12 border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] rounded-xl"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Further
              </Button>

              <Button
                onClick={() => navigate("/quick-edit/style")}
                variant="outline"
                className="h-12 border-2 border-gray-300 hover:border-[#8b5cf6] hover:text-[#8b5cf6] rounded-xl"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
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
            className="h-12 px-8 border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] rounded-xl bg-white/60 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 mr-2" />
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
          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">✨ AI Enhancements Applied</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Auto-generated subtitles</li>
              <li>• Removed 8 seconds of silence</li>
              <li>• Applied face tracking</li>
              <li>• 24 smart cuts</li>
            </ul>
          </div>

          <div className="p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">📊 Video Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Format: YouTube Edit</li>
              <li>• Duration: 2:15</li>
              <li>• Resolution: 1080p</li>
              <li>• Size: 89 MB</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
