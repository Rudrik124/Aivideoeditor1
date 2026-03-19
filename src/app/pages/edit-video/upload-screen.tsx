import { useState } from "react";
import { motion } from "motion/react";
import { Upload, FileVideo, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

export function EditVideoUploadScreen() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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
    if (file && (file.type === "video/mp4" || file.type === "video/quicktime")) {
      handleFileUpload(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          navigate("/edit-video/processing");
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#6366f1]/5 via-[#8b5cf6]/5 to-[#d946ef]/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)] -z-10" />

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#d946ef] bg-clip-text text-transparent">
            Edit Existing Video
          </h1>
          <p className="text-gray-600">Upload your video to start editing with AI</p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
        >
          {!isUploading ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 md:p-16 text-center transition-all duration-200 ${
                isDragging
                  ? "border-[#6366f1] bg-[#6366f1]/5"
                  : "border-gray-300 hover:border-gray-400 bg-white/30"
              }`}
            >
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <div>
                  <p className="text-xl mb-2">
                    <span className="font-medium text-[#6366f1]">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-gray-500">Supported formats: MP4, MOV</p>
                  <p className="text-sm text-gray-400 mt-2">Maximum file size: 2GB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-200">
                <FileVideo className="w-8 h-8 text-[#6366f1]" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{uploadedFile?.name}</p>
                  <p className="text-sm text-gray-500">
                    {uploadedFile && (uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadProgress === 100 && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              {uploadProgress === 100 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-green-600 font-medium"
                >
                  Upload complete! Redirecting to editor...
                </motion.p>
              )}
            </div>
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: "AI-Powered", desc: "Automatic scene detection" },
            { title: "Fast Processing", desc: "Edit in real-time" },
            { title: "4K Support", desc: "Export in high quality" },
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 text-center"
            >
              <p className="font-medium text-gray-900 mb-1">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
