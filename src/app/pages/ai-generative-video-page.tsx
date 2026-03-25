import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, Sparkles, Video } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const ratioOptions = ["16:9", "9:16", "4:3", "3:4", "1:1", "4:5", "2.35:1"];
const particles = Array.from({ length: 40 }); 

export function AIGenerativeVideoPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const imagePreviewUrl = useMemo(() => {
    if (!referenceImage) {
      return "";
    }
    return URL.createObjectURL(referenceImage);
  }, [referenceImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReferenceImage(event.target.files[0]);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      setErrorMessage("Please enter a prompt.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("duration", String(durationMinutes * 60 + durationSeconds));
      formData.append("frame", selectedRatio);

      if (referenceImage) {
        formData.append("image", referenceImage);
      }

      const response = await fetch(`/api/generate`, {
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

      localStorage.setItem("generatedVideo", data.video);
      localStorage.removeItem("generatedVideoError");
      if (data.storage) {
        localStorage.setItem("generatedVideoStorage", data.storage);
      } else {
        localStorage.removeItem("generatedVideoStorage");
      }

      navigate("/result");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected generation error.";
      setErrorMessage(message);
      localStorage.removeItem("generatedVideo");
      localStorage.setItem("generatedVideoError", message);
    } finally {
      setIsGenerating(false);
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

      {/* Subtle Animated Light Rays */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-20">
        <motion.div
           animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
           transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[-20%] left-[-10%] w-[80vw] h-[30vh] bg-gradient-to-r from-transparent via-cyan-500 to-transparent blur-[90px] rotate-[35deg] transform origin-top-left"
        />
        <motion.div
           animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.15, 1] }}
           transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
           className="absolute bottom-[-20%] right-[-10%] w-[100vw] h-[25vh] bg-gradient-to-r from-transparent via-teal-500 to-transparent blur-[100px] rotate-[-25deg] transform origin-bottom-right"
        />
      </div>

      {/* Organic Breathing Glow Pulses */}
      <motion.div 
        animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[15%] left-[20%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[250px] pointer-events-none z-0 mix-blend-screen" 
      />
      <motion.div 
        animate={{ opacity: [0.03, 0.06, 0.03], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="fixed bottom-[10%] right-[15%] w-[60%] h-[60%] bg-teal-600/20 rounded-full blur-[250px] pointer-events-none z-0 mix-blend-screen" 
      />

      {/* Floating Cyan Particles - Parallax Effect */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 perspective-[1000px]">
          {particles.map((_, i) => {
            const isFlare = i % 8 === 0;
            const size = isFlare ? Math.random() * 40 + 20 : Math.random() * 2 + 1; 
            const depth = Math.random() * 100 + 50; 
            
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: isFlare ? size : size,
                  height: isFlare ? 2 : size, 
                  borderRadius: isFlare ? '100%' : '50%',
                  backgroundColor: isFlare ? 'rgba(34, 211, 238, 0.15)' : `rgba(165, 243, 252, ${Math.random() * 0.4 + 0.1})`,
                  filter: isFlare ? 'blur(3px)' : 'blur(0.5px)',
                  boxShadow: isFlare ? '0 0 20px rgba(34, 211, 238, 0.4)' : 'none',
                  rotate: isFlare ? Math.random() * 180 : 0
                }}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                  z: depth
                }}
                animate={{
                  y: [null, Math.random() * -150 - 50],
                  x: [null, (Math.random() - 0.5) * 60],
                  opacity: isFlare ? [0, 0.4, 0] : [0, 0.6, 0],
                }}
                transition={{
                  duration: Math.random() * 35 + 20, 
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      )}


      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-300 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Back to selection</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:bg-[#2d3142]/60 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">AI Generative Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 selection:bg-cyan-500/30">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
              Generate Video with AI
            </span>
          </h1>
          <p className="text-base md:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            Add a prompt, optionally upload an image, choose frame settings and duration, then generate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#1a1b2e]/40 backdrop-blur-3xl border border-[#3f4a67]/50 rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgba(11,13,31,0.5)]"
        >
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-cyan-50/80 uppercase tracking-wider">Enter prompt manually</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: A cinematic fly-through of a futuristic city at sunrise with smooth camera motion and volumetric light."
              className="min-h-[140px] text-base resize-none rounded-2xl border border-[#3f4a67] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 bg-[#0b0d1f]/50 text-white placeholder:text-slate-500 transition-all shadow-inner"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-cyan-50/80 uppercase tracking-wider">Frame selection</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-2xl border-2 p-5 min-h-[92px] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedRatio === ratio
                      ? "border-cyan-400 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      : "border-[#3f4a67] bg-[#0b0d1f]/40 hover:border-cyan-500/50 hover:bg-[#1a1b2e]/60"
                  }`}
                >
                  <Video className={`w-5 h-5 transition-colors ${selectedRatio === ratio ? "text-cyan-400" : "text-slate-500"}`} />
                  <div className={`text-xl font-bold leading-none transition-colors ${selectedRatio === ratio ? "text-white" : "text-slate-400"}`}>{ratio}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3 text-cyan-50/80 uppercase tracking-wider">Add picture (optional)</label>
            <div className="relative border-2 border-dashed border-[#3f4a67] hover:border-cyan-400/80 rounded-2xl p-6 bg-[#0b0d1f]/40 transition-all group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {referenceImage ? (
                <div className="flex items-center justify-between gap-4 relative z-20">
                  <div className="flex items-center gap-4 min-w-0">
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Reference"
                        className="w-14 h-14 rounded-xl object-cover border border-[#3f4a67]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#1a1b2e] border border-[#3f4a67]" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{referenceImage.name}</p>
                      <p className="text-xs text-cyan-400">Optional image ready</p>
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setReferenceImage(null);
                    }}
                    className="text-slate-400 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10 z-20"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <ImageIcon className="w-6 h-6" />
                  <p className="text-sm font-medium">Click to upload an optional image reference</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-semibold mb-3 text-cyan-50/80 uppercase tracking-wider">Duration selection (manual, max 3 min)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Minutes</label>
                <Input
                  type="number"
                  min={0}
                  max={3}
                  step={1}
                  value={durationMinutes}
                  onChange={(event) => handleMinutesInput(event.target.value)}
                  className="h-12 rounded-xl border border-[#3f4a67] bg-[#0b0d1f]/50 text-white font-semibold text-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Seconds</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={1}
                  value={durationSeconds}
                  onChange={(event) => handleSecondsInput(event.target.value)}
                  className="h-12 rounded-xl border border-[#3f4a67] bg-[#0b0d1f]/50 text-white font-semibold text-lg focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-center"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateVideo}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-16 text-lg rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(34,211,238,0.3)] hover:shadow-[0_8px_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed text-[#0b0d1f] font-bold"
          >
            <Video className="w-5 h-5 mr-3" />
            {isGenerating ? "Generating..." : "Generate Video"}
          </Button>

          {errorMessage && (
            <p className="mt-6 text-sm text-red-400 text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-lg">{errorMessage}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
