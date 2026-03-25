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
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/quick-edit/upload")}
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to upload</span>
        </motion.button>

        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Choose Editing Style
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">Select a style and customize AI options</p>
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
                className={`relative p-6 rounded-xl border transition-all text-left ${
                  selectedStyle === style.id
                    ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "border-[#3f4a67]/50 hover:border-cyan-500/30 bg-[#1a1b2e]/60 backdrop-blur-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{style.title}</h3>
                    <p className="text-sm text-[#cbd5e1]">{style.description}</p>
                  </div>
                  {selectedStyle === style.id && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                      <svg className="w-4 h-4 text-[#0b0d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-8 mb-8"
        >
          <h2 className="text-xl font-bold mb-6 text-white">AI Editing Options</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#2d3142]/40 border border-transparent hover:border-[#3f4a67]/50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-white">Auto Subtitles</h3>
                <p className="text-sm text-[#94a3b8]">Generate captions automatically</p>
              </div>
              <Switch
                checked={aiOptions.subtitles}
                onCheckedChange={() => toggleOption("subtitles")}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#2d3142]/40 border border-transparent hover:border-[#3f4a67]/50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-white">Auto Cuts</h3>
                <p className="text-sm text-[#94a3b8]">Remove silences and pauses</p>
              </div>
              <Switch
                checked={aiOptions.autoCuts}
                onCheckedChange={() => toggleOption("autoCuts")}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#2d3142]/40 border border-transparent hover:border-[#3f4a67]/50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-white">Background Music</h3>
                <p className="text-sm text-[#94a3b8]">Add trending background music</p>
              </div>
              <Switch
                checked={aiOptions.backgroundMusic}
                onCheckedChange={() => toggleOption("backgroundMusic")}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#2d3142]/40 border border-transparent hover:border-[#3f4a67]/50 transition-colors">
              <div className="flex-1">
                <h3 className="font-semibold text-white">Face Tracking</h3>
                <p className="text-sm text-[#94a3b8]">Keep faces centered in frame</p>
              </div>
              <Switch
                checked={aiOptions.faceTracking}
                onCheckedChange={() => toggleOption("faceTracking")}
                className="data-[state=checked]:bg-cyan-500"
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
             className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl border border-cyan-300/40"
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
           className="mt-6 p-4 bg-cyan-900/20 rounded-xl border border-cyan-500/20 text-center"
        >
          <p className="text-sm text-cyan-100">
            ⚡ <span className="font-medium">Quick processing:</span> Your video will be ready in under 2 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}
