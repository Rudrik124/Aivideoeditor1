import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, Share2, Sparkles, Play } from "lucide-react";
import { Button } from "../../components/ui/button";

export function ImagesToVideoPreviewScreen() {
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
            <span className="text-sm text-green-700">Video created successfully!</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Preview Your Video
          </h1>
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
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => alert("Download started!")}
                className="flex-1 h-12 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </Button>
              <Button
                onClick={() => alert("Share options coming soon!")}
                variant="outline"
                className="h-12 px-6 border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] rounded-xl"
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
            className="h-12 px-8 border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] rounded-xl bg-white/60 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Another Video
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
