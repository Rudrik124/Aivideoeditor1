import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Link as LinkIcon, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function QuickEditUploadScreen() {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");
  const [videoLink, setVideoLink] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setUploadedFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleContinue = () => {
    if (uploadedFile || videoLink) {
      navigate("/quick-edit/style");
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

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to selection</span>
        </motion.button>

        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Lightning Fast</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Quick AI Edit
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">Upload your video or paste a link to get started</p>
        </motion.div>

        {/* Upload Method Toggle */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="flex justify-center gap-4 mb-8"
        >
          <button
            onClick={() => setUploadMethod("file")}
            className={`px-6 py-3 rounded-xl border transition-all ${
              uploadMethod === "file"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                : "border-[#3f4a67]/50 bg-[#1a1b2e]/60 text-[#cbd5e1] hover:border-cyan-500/30"
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-semibold">Upload File</span>
          </button>

          <button
            onClick={() => setUploadMethod("link")}
            className={`px-6 py-3 rounded-xl border transition-all ${
              uploadMethod === "link"
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                : "border-[#3f4a67]/50 bg-[#1a1b2e]/60 text-[#cbd5e1] hover:border-cyan-500/30"
            }`}
          >
            <LinkIcon className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-semibold">Paste Link</span>
          </button>
        </motion.div>

        {/* Upload Area */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 p-8 mb-8"
        >
          {uploadMethod === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-[#3f4a67] hover:border-cyan-400/50 bg-[#0b0d1f]/40"
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                  <Upload className="w-8 h-8 text-[#0b0d1f]" />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-medium mb-2 text-white">
                    {uploadedFile ? (
                      <span className="text-cyan-400 font-bold drop-shadow-sm">✓ {uploadedFile.name}</span>
                    ) : (
                      <>
                        <span className="text-cyan-400 font-bold drop-shadow-sm">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-sm text-[#64748b] font-medium">MP4, MOV, AVI (Max 1GB)</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-[#cbd5e1] mb-3">
                Video URL
              </label>
              <Input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video link"
                className="h-14 text-base rounded-xl bg-[#0b0d1f]/60 border-[#3f4a67] focus:border-cyan-500 focus:ring-cyan-500/20 text-white placeholder:text-[#64748b]"
              />
              <p className="text-xs font-medium text-[#64748b] mt-3">
                Supports YouTube, Vimeo, and direct video links
              </p>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleContinue}
            disabled={!uploadedFile && !videoLink}
             className="w-full h-14 text-lg font-bold bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-90 text-[#0b0d1f] shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-300/40"
          >
            Continue
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: "AI Auto-Cut", desc: "Remove silences automatically" },
            { title: "Smart Subtitles", desc: "Auto-generated captions" },
            { title: "< 2 min", desc: "Processing time" },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-[#1a1b2e]/40 backdrop-blur-md rounded-xl border border-[#3f4a67]/50 text-center shadow-md"
            >
              <p className="font-bold text-white mb-1">{feature.title}</p>
              <p className="text-sm font-medium text-[#94a3b8]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
