import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Sparkles, Wand2, Upload, FileVideo, Zap } from "lucide-react";

const videoTypes = [
  {
    id: "ai-generated",
    title: "AI Generated Video",
    description: "Create stunning videos from text prompts using AI",
    icon: Sparkles,
    gradient: "from-[#6366f1] to-[#8b5cf6]",
    popular: true,
  },
  {
    id: "reference-video",
    title: "Generate Using Reference Video",
    description: "Generate new videos using reference video, prompt, media, and audio",
    icon: FileVideo,
    gradient: "from-[#8b5cf6] to-[#d946ef]",
    popular: false,
  },
  {
    id: "media-to-video",
    title: "Direct Pic to Video",
    description: "Generate video from prompt, picture/video assets, audio, duration, and frame selection",
    icon: Upload,
    gradient: "from-[#d946ef] to-[#ec4899]",
    popular: false,
  },
  {
    id: "quick-edit",
    title: "Quick AI Edit",
    description: "Fast automatic editing with AI-powered enhancements",
    icon: Zap,
    gradient: "from-[#ec4899] to-[#f97316]",
    popular: false,
  },
];

export function VideoTypePage() {
  const navigate = useNavigate();

  const handleSelectType = (typeId: string) => {
    // Navigate to the appropriate flow based on type
    switch (typeId) {
      case "ai-generated":
        navigate("/create");
        break;
      case "reference-video":
        navigate("/reference-video/setup");
        break;
      case "media-to-video":
        navigate("/images-to-video/upload");
        break;
      case "quick-edit":
        navigate("/quick-edit/upload");
        break;
      default:
        navigate("/create");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Logo/Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6"
          >
            <Wand2 className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-gray-600">AI-Powered Platform</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            AI Video Editor
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you want to create your video
          </p>
        </motion.div>

        {/* Video Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {videoTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <button
                  onClick={() => handleSelectType(type.id)}
                  className="relative w-full text-left group"
                >
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-[#6366f1]/30">
                    {/* Popular Badge */}
                    {type.popular && (
                      <div className="absolute -top-3 -right-3">
                        <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white text-xs px-3 py-1 rounded-full shadow-lg">
                          Popular
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">
                      {type.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {type.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-[#6366f1] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm">Get started</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
              <span>4K Export Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              <span>60+ AI Effects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d946ef]" />
              <span>No Watermark</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
              <span>Lightning Fast</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}