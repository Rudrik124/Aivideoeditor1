import { useState } from "react";
import { motion } from "motion/react";
import { Youtube, Instagram, Music2, Briefcase, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";

const editingStyles = [
  {
    id: "youtube",
    title: "YouTube Edit",
    description: "Professional vlog style with dynamic cuts",
    icon: Youtube,
    gradient: "from-red-500 to-red-600",
  },
  {
    id: "instagram",
    title: "Instagram Reel",
    description: "Vertical format with trendy effects",
    icon: Instagram,
    gradient: "from-pink-500 to-purple-600",
  },
  {
    id: "tiktok",
    title: "TikTok Style",
    description: "Fast-paced with popular transitions",
    icon: Music2,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "professional",
    title: "Professional Clean",
    description: "Corporate and polished look",
    icon: Briefcase,
    gradient: "from-gray-700 to-gray-900",
  },
];

export function QuickEditStyleScreen() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState("youtube");
  const [aiOptions, setAiOptions] = useState({
    subtitles: true,
    autoCuts: true,
    backgroundMusic: false,
    faceTracking: true,
  });

  const toggleOption = (option: keyof typeof aiOptions) => {
    setAiOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleGenerate = () => {
    navigate("/quick-edit/processing");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/quick-edit/upload")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to upload</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Choose Editing Style
          </h1>
          <p className="text-gray-600">Select a style and customize AI options</p>
        </motion.div>

        {/* Editing Styles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          {editingStyles.map((style) => {
            const Icon = style.icon;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                  selectedStyle === style.id
                    ? "border-[#6366f1] bg-[#6366f1]/5 shadow-lg"
                    : "border-gray-200 hover:border-gray-300 bg-white/80"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{style.title}</h3>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                  {selectedStyle === style.id && (
                    <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* AI Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900">AI Editing Options</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Auto Subtitles</h3>
                <p className="text-sm text-gray-500">Generate captions automatically</p>
              </div>
              <Switch
                checked={aiOptions.subtitles}
                onCheckedChange={() => toggleOption("subtitles")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Auto Cuts</h3>
                <p className="text-sm text-gray-500">Remove silences and pauses</p>
              </div>
              <Switch
                checked={aiOptions.autoCuts}
                onCheckedChange={() => toggleOption("autoCuts")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Background Music</h3>
                <p className="text-sm text-gray-500">Add trending background music</p>
              </div>
              <Switch
                checked={aiOptions.backgroundMusic}
                onCheckedChange={() => toggleOption("backgroundMusic")}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Face Tracking</h3>
                <p className="text-sm text-gray-500">Keep faces centered in frame</p>
              </div>
              <Switch
                checked={aiOptions.faceTracking}
                onCheckedChange={() => toggleOption("faceTracking")}
              />
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleGenerate}
            className="w-full h-14 text-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Quick Edit
          </Button>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10 rounded-xl border border-[#6366f1]/20 text-center"
        >
          <p className="text-sm text-gray-700">
            ⚡ <span className="font-medium">Quick processing:</span> Your video will be ready in under 2 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
