import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Image as ImageIcon, Sparkles, Video } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const ratioOptions = ["16:9", "9:16", "4:3", "3:4", "1:1", "4:5", "2.35:1"];

export function AIGenerativeVideoPage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] -z-10" />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to selection</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-6">
            <Sparkles className="w-4 h-4 text-[#6366f1]" />
            <span className="text-sm text-gray-600">AI Generative Video</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Generate Video with AI
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Add a prompt, optionally upload an image, choose frame settings and duration, then generate.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8"
        >
          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Enter prompt manually</label>
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: A cinematic fly-through of a futuristic city at sunrise with smooth camera motion and volumetric light."
              className="min-h-[120px] text-base resize-none rounded-xl border-gray-300 focus:border-[#6366f1] focus:ring-[#6366f1] bg-white/50"
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Frame selection</label>
            <div className="grid grid-cols-2 gap-3">
              {ratioOptions.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-2xl border-2 p-5 min-h-[92px] transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedRatio === ratio
                      ? "border-[#7478f4] bg-[#ececff]"
                      : "border-gray-300 bg-white/40 hover:border-gray-400"
                  }`}
                >
                  <Video className={`w-4 h-4 ${selectedRatio === ratio ? "text-[#5f63e6]" : "text-gray-500"}`} />
                  <div className="text-2xl font-semibold text-gray-900 leading-none">{ratio}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Add picture (optional)</label>
            <div className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-6 bg-white/30 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {referenceImage ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Reference"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800 truncate">{referenceImage.name}</p>
                      <p className="text-xs text-gray-500">Optional image ready</p>
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setReferenceImage(null);
                    }}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <ImageIcon className="w-5 h-5" />
                  <p className="text-sm">Click to upload an optional image reference</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm mb-3 text-gray-700">Duration selection (manual, max 3 min)</label>
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

          <Button
            onClick={handleGenerateVideo}
            disabled={!prompt.trim() || isGenerating}
            className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Video className="w-5 h-5 mr-2" />
            {isGenerating ? "Generating..." : "Generate Video"}
          </Button>

          {errorMessage && (
            <p className="mt-4 text-sm text-red-600 text-center">{errorMessage}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
