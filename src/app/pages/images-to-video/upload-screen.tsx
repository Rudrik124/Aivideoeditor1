import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  AudioLines, 
  Image as ImageIcon, 
  Instagram, 
  Sparkles, 
  Upload, 
  Video, 
  Youtube,
  History,
  Settings2,
  Crown,
  Check,
  Zap,
  Download,
  Layers,
  User,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/auth-context";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { BrandLogo } from "../../components/brand-logo";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { LoadingModal, type LoadingState } from "../../components/loading-modal";
import { HistoryDialog, type HistoryItem, saveToHistory } from "../../components/history-dialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { PremiumModal } from "../../components/premium-modal";

export function ImagesToVideoUploadScreen() {
  const navigate = useNavigate();
  const { isLoggedIn, session, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "User";
  const [prompt, setPrompt] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  // -- History State --
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // -- Advanced Config State --
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [exportQuality, setExportQuality] = useState("1080p");
  const [fps, setFps] = useState(30);
  const [watermark, setWatermark] = useState(true);

  // -- Premium State --
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<"watermark" | "4k" | "60fps" | "general">("general");

  const handlePremiumIntercept = (feature: "watermark" | "4k" | "60fps") => {
    setPremiumFeature(feature);
    setIsPremiumModalOpen(true);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    console.log("Loading project from history:", item);
    if (item.tool === 'avatar' && item.config) {
      if (item.config.prompt) setPrompt(item.config.prompt);
      if (item.config.ratio) setSelectedRatio(item.config.ratio);
    }
    setIsHistoryOpen(false);
  };

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

  const handleGenerateVideo = async () => {
    if (!canGenerate || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setLoadingState("loading");
    setLoadingMessage("Generating your video...");

    try {
      const totalSeconds = durationMinutes * 60 + durationSeconds;

      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      formData.append("duration", String(totalSeconds));
      formData.append("frame", selectedRatio);

      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      if (audioFile) {
        formData.append("audio", audioFile);
      }

      const response = await fetch("/api/generate-from-media", {
        method: "POST",
        body: formData,
      });

      const rawBody = await response.text();
      let data: any = {};

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = { error: rawBody };
        }
      }

      if (!response.ok || !data.success || !data.video) {
        const message = data.error || data.detail || `Video generation failed (${response.status}).`;
        throw new Error(message);
      }

      setLoadingState("success");
      setLoadingMessage("Video generated successfully!");

      localStorage.setItem("generatedVideo", data.video);
      localStorage.removeItem("generatedVideoError");
      if (data.storage) {
        localStorage.setItem("generatedVideoStorage", data.storage);
      } else {
        localStorage.removeItem("generatedVideoStorage");
      }

      setTimeout(() => {
        setLoadingState(null);
        navigate("/images-to-video/preview");
      }, 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected generation error.";
      setLoadingState("error");
      setLoadingMessage(message);
      setErrorMessage(message);
      localStorage.removeItem("generatedVideo");
      localStorage.setItem("generatedVideoError", message);
    } finally {
      setIsGenerating(false);
    }
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
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div
              className="flex items-center gap-2 group cursor-pointer"
              onClick={() => window.location.reload()}
            >
              <div className="relative">
                {/* Theme Background Glow */}
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <BrandLogo size={48} className="relative z-10" />
              </div>
              <span className="text-xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                VIREONIX<span className="text-cyan-400">.AI</span>
              </span>
            </div>

            <button
              onClick={() => navigate("/features")}
              className="flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-widest">Back</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {isLoggedIn && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 transition-all text-white group shadow-xl"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <User className="w-3 h-3 text-[#0b0d1f]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{userName}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-[#0b0d1f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-[10px] font-bold uppercase tracking-[0.2em] group"
                        >
                          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 transition-all text-[#94a3b8] hover:text-white group shadow-xl"
            >
              <History className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">History</span>
            </button>

            <Dialog open={isAdvancedConfigOpen} onOpenChange={setIsAdvancedConfigOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 transition-all text-[#94a3b8] hover:text-white group shadow-xl">
                  <Settings2 className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                  <span className="text-xs font-bold uppercase tracking-widest">Advanced Config</span>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0b0d1f]/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-[425px] rounded-3xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
                    <Settings2 className="w-5 h-5 text-cyan-400" />
                    Production Settings
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-6 font-sans">
                  {/* Export Quality */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Quality</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {['720p', '1080p', '4K'].map((res) => {
                        const isPremium = res === '4K';
                        return (
                          <button
                            key={res}
                            onClick={() => isPremium ? handlePremiumIntercept("4k") : setExportQuality(res)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${
                              exportQuality === res 
                                ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                            }`}
                          >
                            <span>{res}</span>
                            {isPremium && (
                              <div className="flex items-center gap-1 text-[8px] text-amber-500">
                                <Crown className="w-2 h-2" />
                                <span>PREMIUM</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Frame Rate */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-3 h-3" /> Target Frame Rate
                    </label>
                    <div className="flex gap-2">
                      {[24, 30, 60].map((f) => {
                        const isPremium = f === 60;
                        return (
                          <button
                            key={f}
                            onClick={() => isPremium ? handlePremiumIntercept("60fps") : setFps(f)}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${
                              fps === f
                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                            }`}
                          >
                            <span>{f} FPS</span>
                            {isPremium && (
                              <div className="flex items-center gap-1 text-[8px] text-amber-500">
                                <Crown className="w-2 h-2" />
                                <span>PREMIUM</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Watermark Toggle */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                           <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white">Production Watermark</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Branded: VIREONIX</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-md text-amber-500 text-[8px] font-black uppercase tracking-widest">
                           <Crown className="w-3 h-3" />
                           <span>PREMIUM TO REMOVE</span>
                        </div>
                        <button
                          onClick={() => handlePremiumIntercept("watermark")}
                          className={`w-12 h-6 rounded-full relative transition-all bg-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.3)]`}
                        >
                          <div className={`absolute top-1 right-1 w-4 h-4 rounded-full bg-white transition-all`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button
                    onClick={() => setIsAdvancedConfigOpen(false)}
                    className="px-8 bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all py-6 h-auto"
                  >
                    Save Changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Direct Pic to Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Direct Pic to Video
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">Generate video directly with prompt, media, audio, duration, and frame settings</p>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-8"
        >
          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Space for prompt</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the video you want to generate"
               className="min-h-[120px] text-base resize-none rounded-xl border-[#3f4a67] focus:border-cyan-500 focus:ring-cyan-500/20 bg-[#0b0d1f]/60 text-white placeholder:text-[#64748b]"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Space for pic and video</label>
            <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/50 rounded-xl p-6 bg-[#0b0d1f]/40 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-[#94a3b8] font-medium">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <p className="text-sm">
                  {mediaFiles.length > 0 ? <span className="text-cyan-400 font-bold">{mediaFiles.length} media file(s) selected</span> : "Upload picture/video files"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Space for Audio</label>
            <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/50 rounded-xl p-6 bg-[#0b0d1f]/40 transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3 text-[#94a3b8] font-medium">
                <AudioLines className="w-5 h-5 text-cyan-400" />
                <p className="text-sm truncate">{audioFile ? <span className="text-cyan-400 font-bold">{audioFile.name}</span> : "Upload audio file"}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Duration selection part</label>
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
            <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">Frame selection part</label>
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
          {errorMessage && (
            <p className="mt-2 mb-4 text-sm text-red-400 text-center font-bold bg-red-500/10 border border-red-500/30 py-3 px-4 rounded-xl backdrop-blur-sm">
              {errorMessage}
            </p>
          )}

          <Button
          onClick={() => {
            const config = {
              prompt,
              duration: durationMinutes * 60 + durationSeconds,
              ratio: selectedRatio,
              mediaFiles: mediaFiles.map(f => f.name),
              audioFile: audioFile?.name,
              quality: exportQuality,
              fps,
              watermark
            };
            saveToHistory({
              title: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : ""),
              tool: 'avatar',
              config
            });
            handleGenerateVideo();
          }}
          disabled={!canGenerate || isGenerating}
             className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-300/40"
          >
            <Video className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate video"}
          </Button>
        </motion.div>
      </div>

      <LoadingModal
        state={loadingState}
        message={loadingMessage}
        onDismiss={() => {
          setLoadingState(null);
          setErrorMessage("");
        }}
      />

      <HistoryDialog 
        open={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen}
        onSelect={handleHistorySelect}
        currentTool="avatar"
      />

      <PremiumModal 
        open={isPremiumModalOpen} 
        onOpenChange={setIsPremiumModalOpen}
        feature={premiumFeature}
      />
    </div>
  );
}
