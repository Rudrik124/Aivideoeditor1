import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Download, 
  RefreshCcw, 
  Video, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  Files, 
  ShieldCheck,
  Zap,
  Youtube,
  Instagram,
  Smartphone
} from "lucide-react";
import { Button } from "../../components/ui/button";

export function QuickEditResultScreen() {
  const navigate = useNavigate();

  return (
    <div 
      className="h-screen w-full flex flex-col overflow-hidden font-sans text-slate-200"
      style={{
        background: 'linear-gradient(135deg, #0b0d1f 0%, #1a1b2e 30%, #2d3142 60%, #3f4a67 85%, #1a1b2e 100%)',
      }}
    >
<<<<<<< Updated upstream
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }} />
=======
      {/* Corner Vignettes */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }}
      />

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Edit complete!</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
            Your Video is Ready
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">
            AI has automatically edited your video
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#1a1b2e]/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(11,13,31,0.5)] border border-[#3f4a67]/50 overflow-hidden mb-8"
        >
          <div className="relative aspect-video bg-gradient-to-br from-[#0b0d1f] to-[#1a1b2e] flex items-center justify-center group overflow-hidden border-b border-[#3f4a67]/50">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-teal-500/10" />
            
            <motion.button
              whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(34,211,238,0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all border border-white/20"
            >
              <Play className="w-8 h-8 text-[#0b0d1f] ml-1" fill="currentColor" />
            </motion.button>

            {/* Subtitle Preview */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0b0d1f]/80 backdrop-blur-md px-6 py-2 rounded-lg border border-[#3f4a67]/50">
              <p className="text-white text-sm font-medium">AI-generated subtitles</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-cyan-400 mb-1 drop-shadow-sm">24</div>
                <div className="text-xs text-[#94a3b8] font-medium">Auto Cuts</div>
              </div>
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-blue-400 mb-1 drop-shadow-sm">100%</div>
                <div className="text-xs text-[#94a3b8] font-medium">Subtitles</div>
              </div>
              <div className="text-center p-4 bg-[#1a1b2e]/40 rounded-xl border border-[#3f4a67]/30 shadow-inner">
                <div className="text-xl font-bold text-teal-400 mb-1 drop-shadow-sm">1:45</div>
                <div className="text-xs text-[#94a3b8] font-medium">Processing</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                onClick={() => alert("Download started!")}
                className="h-12 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 text-[#0b0d1f] font-bold hover:opacity-90 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all rounded-xl border border-cyan-300/40"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              <Button
                onClick={() => navigate("/reference-video/setup")}
                variant="outline"
                className="h-12 border border-[#3f4a67] hover:border-cyan-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 shadow-sm transition-all"
              >
                <Edit className="w-4 h-4 mr-2 text-blue-400" />
                Edit Further
              </Button>

              <Button
                onClick={() => navigate("/quick-edit/style")}
                variant="outline"
                className="h-12 border border-[#3f4a67] hover:border-teal-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-teal-400" />
                Regenerate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Create Another */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="text-center mb-8"
        >
          <Button
            onClick={() => navigate("/features")}
            variant="outline"
             className="h-12 px-8 border border-[#3f4a67] hover:border-cyan-500/50 hover:bg-[#2d3142]/60 text-white rounded-xl bg-[#1a1b2e]/40 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.2)] font-semibold transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
            Create Another Video
          </Button>
        </motion.div>

        {/* Applied Features */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="p-6 bg-[#1a1b2e]/40 backdrop-blur-md rounded-xl border border-[#3f4a67]/50 shadow-md">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /> AI Enhancements Applied</h3>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Auto-generated subtitles</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Removed 8 seconds of silence</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>Applied face tracking</li>
               <li className="flex items-center"><span className="text-cyan-500 mr-2 text-lg leading-none">•</span>24 smart cuts</li>
            </ul>
          </div>

          <div className="p-6 bg-[#1a1b2e]/40 backdrop-blur-md rounded-xl border border-[#3f4a67]/50 shadow-md">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-[10px] font-bold text-[#0b0d1f]">i</div> Video Details</h3>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Format: YouTube Edit</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Duration: 2:15</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Resolution: 1080p</li>
               <li className="flex items-center"><span className="text-blue-400 mr-2 text-lg leading-none">•</span>Size: 89 MB</li>
            </ul>
          </div>
        </motion.div>
>>>>>>> Stashed changes
      </div>

      {/* Header */}
      <header className="h-16 flex-none border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/tools")}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-[0.1em]">Quick Edit <span className="text-cyan-400">Studio</span></h1>
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-emerald-500" />
               <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Optimized & Rendered</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300 hover:bg-white/10 flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5" />
              Share Link
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Export Specs */}
        <aside className="w-80 flex-none border-r border-white/10 bg-[#0b0d1f]/40 backdrop-blur-3xl p-8 flex flex-col gap-8 overflow-y-auto">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Quick Metrics</label>
              <div className="space-y-3">
                 {[
                   { label: 'Edit Time', val: '4.2 seconds', icon: Zap },
                   { label: 'Scene Cuts', val: '12 Smart Cuts', icon: Video },
                   { label: 'Resolution', val: 'Full HD 1080p', icon: Files },
                 ].map((detail) => (
                   <div key={detail.label} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                      <detail.icon className="w-4 h-4 text-cyan-400" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">{detail.label}</span>
                         <span className="text-xs font-bold text-white">{detail.val}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-5 rounded-xl border border-dashed border-white/10 bg-white/5 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">
                AI has automatically removed silences and applied color grading.
              </p>
           </div>
        </aside>

        {/* Center Dashboard */}
        <section className="flex-1 p-12 flex flex-col gap-8 bg-black/10 overflow-y-auto">
           
           <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Edit Ready</h2>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button 
                  onClick={() => navigate("/quick-edit/style")}
                  className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2"
                 >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Re-Edit
                 </button>
              </div>
           </div>

           <div className="relative flex-1 min-h-[400px]">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-lg opacity-20" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl bg-[#0b0d1f] flex flex-col overflow-hidden relative shadow-2xl">
                 <div className="flex-1 relative flex items-center justify-center bg-black/40">
                    <Video className="w-16 h-16 text-cyan-500/10" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-cyan-500/5 animate-pulse" />
                 </div>

                 {/* Download Bar */}
                 <div className="h-20 bg-[#1a1b2e]/60 backdrop-blur-xl border-t border-white/10 px-8 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-white">quick_edit_export.mp4</span>
                       <span className="text-[10px] font-bold text-slate-500 uppercase">32.8 MB • Social Optimized</span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34,211,238,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 text-[#0b0d1f] text-sm font-black uppercase tracking-widest flex items-center gap-3"
                    >
                       <Download className="w-4 h-4" />
                       Save to Device
                    </motion.button>
                 </div>
              </div>
           </div>

           {/* Platforms Grid */}
           <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'YouTube Shorts', icon: Youtube },
                { label: 'Instagram Reels', icon: Instagram },
                { label: 'TikTok', icon: Smartphone },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer group text-center flex flex-col items-center">
                   <item.icon className="w-6 h-6 mb-3 text-slate-400 group-hover:text-cyan-400" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</h3>
                </div>
              ))}
           </div>

        </section>

      </main>

    </div>
  );
}
