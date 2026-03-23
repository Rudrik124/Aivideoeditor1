import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  AudioLines,
  Clock3,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

const ratioOptions = ["16:9", "9:16", "4:3", "3:4", "1:1", "4:5", "2.35:1"];

export function ReferenceVideoSetupScreen() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const imageCount = useMemo(
    () => mediaFiles.filter((file) => file.type.startsWith("image/")).length,
    [mediaFiles]
  );
  const videoCount = useMemo(
    () => mediaFiles.filter((file) => file.type.startsWith("video/")).length,
    [mediaFiles]
  );

  const handleDurationInput = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      setDurationMinutes(1);
      return;
    }
    const clamped = Math.max(1, Math.min(3, parsed));
    setDurationMinutes(clamped);
  };

  const handleReferenceVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReferenceVideo(file);
    }
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }
    const next = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    setMediaFiles((prev) => [...prev, ...next]);
  };

  const handleAudioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const canGenerate = prompt.trim().length > 0 && referenceVideo !== null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to selection</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6">
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-gray-600">Generating Using Reference Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Generate with Reference Video
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Provide a reference, add prompt and assets, choose duration and frame style, then generate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8"
        >
          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Reference video</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-white/30 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleReferenceVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-gray-600">
                <Upload className="w-5 h-5" />
                <p className="text-sm truncate">
                  {referenceVideo ? referenceVideo.name : "Upload reference video (required)"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the output style, scenes, pacing, and visual tone"
              className="min-h-[120px] text-base resize-none rounded-xl border-gray-300 focus:border-[#6366f1] focus:ring-[#6366f1] bg-white/50"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Picture and video assets</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-white/30 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-gray-600">
                <ImageIcon className="w-5 h-5" />
                <p className="text-sm">
                  {mediaFiles.length > 0
                    ? `${mediaFiles.length} file(s) selected (${imageCount} image, ${videoCount} video)`
                    : "Upload optional pictures/videos"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Audio</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-white/30 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-gray-600">
                <AudioLines className="w-5 h-5" />
                <p className="text-sm truncate">{audioFile ? audioFile.name : "Upload optional audio"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Duration selection (manual, max 3 min)</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {[1, 2, 3].map((minute) => (
                <button
                  key={minute}
                  onClick={() => setDurationMinutes(minute)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 transition-all ${
                    durationMinutes === minute
                      ? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
                      : "border-gray-300 bg-white/40 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Clock3 className="w-4 h-4" />
                  <span>{minute} min</span>
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={3}
                step={1}
                value={durationMinutes}
                onChange={(event) => handleDurationInput(event.target.value)}
                className="h-12 w-full sm:w-40 rounded-xl border-2 border-gray-300 bg-white/60 px-3 text-sm text-gray-700 focus:outline-none focus:border-[#6366f1]"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Frame selection</label>
            <div className="grid grid-cols-2 gap-3">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-xl border-2 p-4 transition-all text-left ${
                    selectedRatio === ratio
                      ? "border-[#6366f1] bg-[#6366f1]/10"
                      : "border-gray-300 bg-white/40 hover:border-gray-400"
                  }`}
                >
                  <div className="text-sm text-gray-500 mb-2">Aspect Ratio</div>
                  <div className="text-xl font-semibold text-gray-900">{ratio}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => navigate("/reference-video/processing")}
            disabled={!canGenerate}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
