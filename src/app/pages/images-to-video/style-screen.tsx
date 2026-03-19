import { useState } from "react";
import { motion } from "motion/react";
import { Film, Sparkles, Plane, Instagram, Music, Upload, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";

const videoStyles = [
  {
    id: "cinematic",
    title: "Cinematic",
    description: "Epic and dramatic with smooth transitions",
    icon: Film,
    gradient: "from-[#6366f1] to-[#8b5cf6]",
  },
  {
    id: "slideshow",
    title: "Slideshow",
    description: "Classic presentation style",
    icon: Sparkles,
    gradient: "from-[#8b5cf6] to-[#d946ef]",
  },
  {
    id: "travel",
    title: "Travel Vlog",
    description: "Adventure and exploration vibes",
    icon: Plane,
    gradient: "from-[#d946ef] to-[#ec4899]",
  },
  {
    id: "instagram",
    title: "Instagram Reel",
    description: "Trendy and social media ready",
    icon: Instagram,
    gradient: "from-[#ec4899] to-[#f59e0b]",
  },
];

const transitions = [
  { id: "fade", label: "Fade" },
  { id: "zoom", label: "Zoom" },
  { id: "slide", label: "Slide" },
  { id: "dissolve", label: "Dissolve" },
];

const musicOptions = [
  { id: "upbeat", label: "Upbeat & Energetic" },
  { id: "calm", label: "Calm & Relaxing" },
  { id: "epic", label: "Epic & Dramatic" },
  { id: "none", label: "No Music" },
];

export function ImagesToVideoStyleScreen() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState("cinematic");
  const [selectedTransition, setSelectedTransition] = useState("fade");
  const [selectedMusic, setSelectedMusic] = useState("upbeat");
  const [customAudio, setCustomAudio] = useState<File | null>(null);

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAudio(file);
      setSelectedMusic("custom");
    }
  };

  const handleGenerate = () => {
    navigate("/images-to-video/preview");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/images-to-video/arrange")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to arrangement</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Choose Your Style
          </h1>
          <p className="text-gray-600">Select video style, transitions, and music</p>
        </motion.div>

        {/* Video Styles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Video Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoStyles.map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                    selectedStyle === style.id
                      ? "border-[#6366f1] bg-[#6366f1]/5"
                      : "border-gray-200 hover:border-gray-300 bg-white/80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{style.title}</h3>
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
          </div>
        </motion.div>

        {/* Transitions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Transition Effects</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {transitions.map((transition) => (
              <button
                key={transition.id}
                onClick={() => setSelectedTransition(transition.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTransition === transition.id
                    ? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
                    : "border-gray-200 hover:border-gray-300 bg-white/80 text-gray-700"
                }`}
              >
                <span className="font-medium">{transition.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Music Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-[#6366f1]" />
            <h2 className="text-xl font-semibold text-gray-900">Background Music</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {musicOptions.map((music) => (
              <button
                key={music.id}
                onClick={() => setSelectedMusic(music.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedMusic === music.id
                    ? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
                    : "border-gray-200 hover:border-gray-300 bg-white/50 text-gray-700"
                }`}
              >
                <span className="font-medium">{music.label}</span>
              </button>
            ))}
          </div>

          {/* Custom Audio Upload */}
          <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-all">
            <input
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center gap-3">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                {customAudio ? customAudio.name : "Upload custom audio"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleGenerate}
            className="w-full h-14 text-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Video
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
