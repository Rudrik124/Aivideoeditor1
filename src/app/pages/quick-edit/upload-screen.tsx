import { useState } from "react";
import { motion } from "motion/react";
import { Upload, Link as LinkIcon, Zap, ArrowLeft, Video, Sparkles } from "lucide-react";
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
      }}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }} />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl relative z-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
<<<<<<< Updated upstream
          onClick={() => navigate("/tools")}
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-12"
=======
          onClick={() => navigate("/features")}
          className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-cyan-400 transition-colors mb-8"
>>>>>>> Stashed changes
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Selection</span>
        </motion.button>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-8 shadow-xl">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-cyan-100 uppercase tracking-[0.2em]">Lightning Fast Edit</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_4px_12px_rgba(34,211,238,0.2)] uppercase tracking-tight">
            Quick AI <span className="text-white opacity-80">Forge</span>
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg max-w-2xl mx-auto">
            Ignite your content with neural-driven cuts and professional grading.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-2xl mx-auto">
          
          {/* Method Selector */}
          <div className="flex p-1 rounded-2xl bg-black/40 border border-white/10 mb-2">
            <button
               onClick={() => setUploadMethod("file")}
               className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === 'file' ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Direct Upload
            </button>
            <button
               onClick={() => setUploadMethod("link")}
               className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${uploadMethod === 'link' ? 'bg-white/10 text-white border border-white/10 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               Neural Link
            </button>
          </div>

          {/* Core Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative group rounded-3xl bg-[#1a1b2e]/60 backdrop-blur-2xl border transition-all overflow-hidden ${isDragging ? 'border-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.2)]' : 'border-white/10'}`}
          >
            {uploadMethod === 'file' ? (
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="p-16 flex flex-col items-center justify-center text-center gap-6 relative"
              >
                 <input type="file" accept="video/*" onChange={handleFileInput} className="absolute inset-0 opacity-0 cursor-pointer" />
                 
                 <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                    <Video className="w-10 h-10 text-cyan-400" />
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-wider">
                      {uploadedFile ? <span className="text-cyan-400 italic">Ready for Forge</span> : "Relinquish Source"}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
                      {uploadedFile ? uploadedFile.name : "Drag and drop or click to ingest"}
                    </p>
                 </div>
              </div>
            ) : (
              <div className="p-12 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Source Protocol (URL)</label>
                    <Input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      placeholder="HTTPS://..."
                      className="h-16 text-lg rounded-xl bg-black/40 border-white/10 focus:border-cyan-500 focus:ring-0 text-white placeholder:text-slate-700"
                    />
                 </div>
                 <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-900/10 border border-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                      AI will automatically fetch and analyze the remote stream for editing optimization.
                    </p>
                 </div>
              </div>
            )}
          </motion.div>

          <Button
            onClick={handleContinue}
            disabled={!uploadedFile && !videoLink}
            className="w-full h-16 text-lg font-black bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 hover:opacity-95 text-[#0b0d1f] shadow-2xl rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-[0.3em] transition-all"
          >
            Continue to Studio
          </Button>

        </div>
      </div>
    </div>
  );
}
