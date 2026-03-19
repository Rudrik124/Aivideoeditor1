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
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#6366f1] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to selection</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 mb-4">
            <Zap className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-sm text-gray-600">Lightning Fast</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Quick AI Edit
          </h1>
          <p className="text-gray-600">Upload your video or paste a link to get started</p>
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
            className={`px-6 py-3 rounded-xl border-2 transition-all ${
              uploadMethod === "file"
                ? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
                : "border-gray-300 bg-white/80 text-gray-700 hover:border-gray-400"
            }`}
          >
            <Upload className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Upload File</span>
          </button>

          <button
            onClick={() => setUploadMethod("link")}
            className={`px-6 py-3 rounded-xl border-2 transition-all ${
              uploadMethod === "link"
                ? "border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]"
                : "border-gray-300 bg-white/80 text-gray-700 hover:border-gray-400"
            }`}
          >
            <LinkIcon className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Paste Link</span>
          </button>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
        >
          {uploadMethod === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                isDragging
                  ? "border-[#6366f1] bg-[#6366f1]/5"
                  : "border-gray-300 hover:border-gray-400 bg-white/30"
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg mb-1">
                    {uploadedFile ? (
                      <span className="text-green-600 font-medium">✓ {uploadedFile.name}</span>
                    ) : (
                      <>
                        <span className="font-medium text-[#6366f1]">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">MP4, MOV, AVI (Max 1GB)</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Video URL
              </label>
              <Input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=... or direct video link"
                className="h-12 text-base rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-2">
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
            className="w-full h-12 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] hover:opacity-90 transition-opacity rounded-xl disabled:opacity-50"
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
              className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 text-center"
            >
              <p className="font-medium text-gray-900 mb-1">{feature.title}</p>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
