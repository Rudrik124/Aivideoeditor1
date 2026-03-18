import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Download, Sparkles, Share2, Play } from "lucide-react";
import { Button } from "../components/ui/button";

export function ResultPage() {
  const navigate = useNavigate();

  const handleDownload = () => {
    // Simulate download
    alert("Video download started!");
  };

  const handleShare = () => {
    // Simulate share
    alert("Share options coming soon!");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200 mb-4"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700">Video ready!</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Your Video is Ready
          </h1>
          <p className="text-gray-600">
            Your AI-generated video has been created successfully
          </p>
        </motion.div>

        {/* Video Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8"
        >
          {/* Video Preview */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center group">
            {/* Mock Video Player */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#d946ef]/20" />
            
            {/* Play Button Overlay */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl group-hover:bg-white transition-colors"
            >
              <Play className="w-8 h-8 text-[#6366f1] ml-1" fill="currentColor" />
            </motion.button>

            {/* Mock Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center justify-between text-white text-sm">
                <span>00:00</span>
                <div className="flex-1 mx-4 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-white rounded-full" />
                </div>
                <span>02:34</span>
              </div>
            </div>

            {/* Quality Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
              4K • 60fps
            </div>
          </div>

          {/* Video Details */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-[#6366f1]/5 to-[#6366f1]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#6366f1] mb-1">3840x2160</div>
                <div className="text-sm text-gray-600">Resolution</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#8b5cf6]/5 to-[#8b5cf6]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#8b5cf6] mb-1">2:34</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-[#d946ef]/5 to-[#d946ef]/10 rounded-xl">
                <div className="text-2xl font-bold text-[#d946ef] mb-1">245 MB</div>
                <div className="text-sm text-gray-600">File Size</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleDownload}
                className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Video
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="h-12 px-6 text-base rounded-xl border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Another Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="h-12 px-8 text-base rounded-xl border-2 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1] transition-colors bg-white/60 backdrop-blur-sm"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Another Video
          </Button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              title: "AI-Enhanced",
              description: "Automatic color grading and scene detection",
              gradient: "from-[#6366f1]/10 to-[#6366f1]/5",
            },
            {
              title: "Professional Quality",
              description: "Export in 4K resolution with 60fps",
              gradient: "from-[#8b5cf6]/10 to-[#8b5cf6]/5",
            },
            {
              title: "Fast Rendering",
              description: "Generate videos in under a minute",
              gradient: "from-[#d946ef]/10 to-[#d946ef]/5",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl bg-gradient-to-br ${feature.gradient} border border-gray-200`}
            >
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
