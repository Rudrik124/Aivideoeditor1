import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  AudioLines,
  Image as ImageIcon,
  Instagram,
  Sparkles,
  Upload,
  Video,
  Youtube,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

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

export function ReferenceVideoSetupScreen() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
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

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to selection</span>
        </motion.button>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Generating Using Reference Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Generate with Reference Video
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg max-w-2xl mx-auto">
            Provide a reference, add prompt and assets, choose duration and frame style, then generate.
          </p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 24 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-6 md:p-8"
        >
          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Reference video</label>
             <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/50 rounded-xl p-6 bg-[#0b0d1f]/40 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleReferenceVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-[#94a3b8] font-medium">
                <Upload className="w-5 h-5 text-cyan-400" />
                <p className="text-sm truncate">
                  {referenceVideo ? <span className="text-cyan-400 font-bold">{referenceVideo.name}</span> : "Upload reference video (required)"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the output style, scenes, pacing, and visual tone"
               className="min-h-[120px] text-base resize-none rounded-xl border-[#3f4a67] focus:border-cyan-500 focus:ring-cyan-500/20 bg-[#0b0d1f]/60 text-white placeholder:text-[#64748b]"
            />
          </div>

          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Picture and video assets</label>
             <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/50 rounded-xl p-6 bg-[#0b0d1f]/40 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-[#94a3b8] font-medium">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <p className="text-sm">
                  {mediaFiles.length > 0
                    ? <span className="text-cyan-400 font-bold">{mediaFiles.length} file(s) selected ({imageCount} image, {videoCount} video)</span>
                    : "Upload optional pictures/videos"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Audio</label>
             <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/50 rounded-xl p-6 bg-[#0b0d1f]/40 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
               <div className="flex items-center gap-3 text-[#94a3b8] font-medium">
                <AudioLines className="w-5 h-5 text-cyan-400" />
                <p className="text-sm truncate">{audioFile ? <span className="text-cyan-400 font-bold">{audioFile.name}</span> : "Upload optional audio"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Duration selection (manual, max 3 min)</label>
             <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Minutes</label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  step={1}
                  value={durationMinutes}
                  onChange={(event) => handleMinutesInput(event.target.value)}
                  className="h-14 text-base rounded-xl border border-[#3f4a67] focus:border-cyan-500 focus:ring-cyan-500/20 bg-[#0b0d1f]/60 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Seconds</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={durationSeconds}
                  onChange={(event) => handleSecondsInput(event.target.value)}
                  className="h-14 text-base rounded-xl border border-[#3f4a67] focus:border-cyan-500 focus:ring-cyan-500/20 bg-[#0b0d1f]/60 text-white"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
             <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Frame selection</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-xl border p-4 min-h-[96px] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedRatio === ratio
                      ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                      : "border-[#3f4a67]/50 bg-[#2d3142]/40 hover:border-cyan-500/30"
                  }`}
                >
                  <div
                    className={`${ratioPreviewClasses[ratio]} relative rounded-sm border-2 flex items-center justify-center ${
                      selectedRatio === ratio ? "border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "border-[#64748b]"
                    }`}
                  >
                    {getFrameType(ratio) === "Instagram" && (
                      <Instagram className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-cyan-400" : "text-[#64748b]"}`} />
                    )}
                    {getFrameType(ratio) === "YouTube" && (
                      <Youtube className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-cyan-400" : "text-[#64748b]"}`} />
                    )}
                    {getFrameType(ratio) === "Normal" && (
                      <Video className={`w-3.5 h-3.5 ${selectedRatio === ratio ? "text-cyan-400" : "text-[#64748b]"}`} />
                    )}
                  </div>
                  <div className={`text-sm font-bold leading-none ${selectedRatio === ratio ? "text-cyan-100" : "text-white"}`}>{ratio}</div>
                  <div className={`text-[11px] font-semibold leading-none ${selectedRatio === ratio ? "text-cyan-400" : "text-[#64748b]"}`}>{getFrameType(ratio)}</div>
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-[#64748b] mt-3">
              Choosing 4:3, 3:4, 4:5, or 2.35:1 may crop some uploaded assets.
            </p>
          </div>

          <Button
            onClick={() => navigate("/reference-video/processing")}
            disabled={!canGenerate}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-300/40"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
