import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  Wand2,
  Scissors,
  Volume2,
  Type,
  Palette,
  Play,
  Pause,
  Download,
  Save,
  ArrowLeft,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";

const aiTools = [
  { icon: Wand2, label: "Auto Enhance", color: "text-[#6366f1]" },
  { icon: Scissors, label: "Background Removal", color: "text-[#8b5cf6]" },
  { icon: Volume2, label: "Noise Reduction", color: "text-[#d946ef]" },
  { icon: Type, label: "Subtitle Generator", color: "text-[#ec4899]" },
  { icon: Palette, label: "Color Correction", color: "text-[#f59e0b]" },
];

export function EditVideoDashboard() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [brightness, setBrightness] = useState([50]);
  const [contrast, setContrast] = useState([50]);
  const [speed, setSpeed] = useState([100]);
  const [resolution, setResolution] = useState("1080p");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-[#6366f1] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
              Video Editor
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6366f1] bg-white"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="4K">4K</option>
            </select>

            <Button
              variant="outline"
              className="h-9 px-4 border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1]"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Project
            </Button>

            <Button className="h-9 px-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Panel - AI Tools */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto"
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-4">AI Tools</h2>
          <div className="space-y-2">
            {aiTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left border border-transparent hover:border-gray-200"
                >
                  <Icon className={`w-5 h-5 ${tool.color}`} />
                  <span className="text-sm text-gray-700">{tool.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Center - Video Preview & Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Video Preview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1 p-6 flex items-center justify-center bg-gray-900"
          >
            <div className="relative w-full max-w-4xl aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl">
              {/* Mock Video */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 via-[#8b5cf6]/20 to-[#d946ef]/20" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-[#6366f1]" />
                  ) : (
                    <Play className="w-8 h-8 text-[#6366f1] ml-1" fill="currentColor" />
                  )}
                </button>
              </div>

              {/* Time Display */}
              <div className="absolute bottom-4 left-4 text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                00:00 / 02:34
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="h-48 bg-white border-t border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Timeline</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Scissors className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            {/* Timeline Clips */}
            <div className="relative h-20 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="absolute inset-0 flex gap-1 p-2">
                {[1, 2, 3, 4].map((clip) => (
                  <div
                    key={clip}
                    className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
              {/* Playhead */}
              <div className="absolute top-0 left-1/4 w-0.5 h-full bg-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Properties */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto"
        >
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Properties</h2>

          <div className="space-y-6">
            {/* Brightness */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Brightness</label>
              <Slider
                value={brightness}
                onValueChange={setBrightness}
                max={100}
                step={1}
                className="mb-2"
              />
              <div className="text-xs text-gray-500 text-right">{brightness[0]}%</div>
            </div>

            {/* Contrast */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Contrast</label>
              <Slider
                value={contrast}
                onValueChange={setContrast}
                max={100}
                step={1}
                className="mb-2"
              />
              <div className="text-xs text-gray-500 text-right">{contrast[0]}%</div>
            </div>

            {/* Speed */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Speed</label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={25}
                max={400}
                step={25}
                className="mb-2"
              />
              <div className="text-xs text-gray-500 text-right">{speed[0]}%</div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6" />

            {/* Action Buttons */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
              
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1]"
              >
                <Scissors className="w-4 h-4 mr-2" />
                Trim
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1]"
              >
                <Copy className="w-4 h-4 mr-2" />
                Split
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 hover:border-[#6366f1] hover:text-[#6366f1]"
              >
                <Scissors className="w-4 h-4 mr-2" />
                Cut
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
