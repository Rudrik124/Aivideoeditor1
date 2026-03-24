import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, AudioLines, Image as ImageIcon, Instagram, Sparkles, Upload, Video, Youtube } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

export function ImagesToVideoUploadScreen() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState("16:9");

  const ratioOptions = ["16:9", "9:16", "4:3", "3:4", "1:1", "4:5", "2.35:1"];
  const ratioPreviewClasses: Record<string, string> = {
    "16:9": "w-10 h-6",
    "9:16": "w-6 h-10",
    "1:1": "w-8 h-8",
    "4:3": "w-9 h-7",
    "3:4": "w-7 h-9",
    "4:5": "w-7 h-9",
    "2.35:1": "w-11 h-5",
  };

  const getFrameType = (ratio: string) => {
    if (["9:16", "1:1", "4:5"].includes(ratio)) {
      return "Instagram";
    }
    if (["16:9", "2.35:1"].includes(ratio)) {
      return "YouTube";
    }
    return "Normal";
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    const files = Array.from(e.target.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    setMediaFiles((prev) => [...prev, ...files]);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const clampDuration = (minutes: number, seconds: number) => {
    let safeMinutes = Math.max(0, Math.min(3, Math.floor(minutes) || 0));
    let safeSeconds = Math.max(0, Math.min(59, Math.floor(seconds) || 0));
    if (safeMinutes === 3) {
      safeSeconds = 0;
    }
    return { safeMinutes, safeSeconds };
  };

  const handleMinutesInput = (value: string) => {
    const parsed = Number(value);
    const { safeMinutes, safeSeconds } = clampDuration(
      Number.isNaN(parsed) ? 0 : parsed,
      durationSeconds
    );
    setDurationMinutes(safeMinutes);
    setDurationSeconds(safeSeconds);
  };

  const handleSecondsInput = (value: string) => {
    const parsed = Number(value);
    const { safeMinutes, safeSeconds } = clampDuration(
      durationMinutes,
      Number.isNaN(parsed) ? 0 : parsed
    );
    setDurationMinutes(safeMinutes);
    setDurationSeconds(safeSeconds);
  };

  const canGenerate = prompt.trim().length > 0 && mediaFiles.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-5xl">
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
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6">
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-gray-600">Direct Pic to Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Direct Pic to Video
          </h1>
          <p className="text-gray-600">Generate video directly with prompt, media, audio, duration, and frame settings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8"
        >
          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Space for prompt</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the video you want to generate"
              className="min-h-[120px] text-base resize-none rounded-xl border-gray-300 focus:border-[#6366f1] focus:ring-[#6366f1] bg-white/50"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Space for pic and video</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-white/30 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-gray-600">
                <ImageIcon className="w-5 h-5" />
                <p className="text-sm">
                  {mediaFiles.length > 0 ? `${mediaFiles.length} media file(s) selected` : "Upload picture/video files"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Space for Audio</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-white/30 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-gray-600">
                <AudioLines className="w-5 h-5" />
                <p className="text-sm truncate">{audioFile ? audioFile.name : "Upload audio file"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Duration selection part</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Minutes</label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  step={1}
                  value={durationMinutes}
                  onChange={(event) => handleMinutesInput(event.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-300 bg-white/60"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Seconds</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={durationSeconds}
                  onChange={(event) => handleSecondsInput(event.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-300 bg-white/60"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Frame selection part</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-xl border-2 p-3 min-h-[96px] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedRatio === ratio
                      ? "border-[#7478f4] bg-[#ececff]"
                      : "border-gray-300 bg-white/40 hover:border-gray-400"
                  }`}
                >
                  <div
                    className={`${ratioPreviewClasses[ratio]} relative rounded-sm border-2 flex items-center justify-center ${
                      selectedRatio === ratio ? "border-[#5f63e6]" : "border-gray-500"
                    }`}
                  >
                    {getFrameType(ratio) === "Instagram" && (
                      <Instagram className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-[#5f63e6]" : "text-gray-500"}`} />
                    )}
                    {getFrameType(ratio) === "YouTube" && (
                      <Youtube className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-[#5f63e6]" : "text-gray-500"}`} />
                    )}
                    {getFrameType(ratio) === "Normal" && (
                      <Video className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-[#5f63e6]" : "text-gray-500"}`} />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 leading-none">{ratio}</div>
                  <div className="text-[11px] text-gray-500 leading-none">{getFrameType(ratio)}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Choosing 4:3, 3:4, 4:5, or 2.35:1 may crop some uploaded assets.
            </p>
          </div>

          <Button
            onClick={() => navigate("/images-to-video/preview")}
            disabled={!canGenerate}
            className="w-full h-14 text-lg bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl shadow-lg disabled:opacity-50"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate video button
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
