import { useState } from "react";
import { motion } from "framer-motion";
import {
  Youtube,
  Instagram,
  Music2,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Wand2,
  History,
  Trash2,
  RefreshCw,
  Music,
  Mic,
  Plus,
  Monitor,
  Smartphone,
  Play,
  Settings,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Zap,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";

const editingStyles = [
  {
    id: "youtube",
    title: "YouTube Edit",
    description: "Professional vlog style",
    icon: Youtube,
    gradient: "from-red-500/20 to-red-600/20",
  },
  {
    id: "instagram",
    title: "Instagram Reel",
    description: "Vertical trendy format",
    icon: Instagram,
    gradient: "from-pink-500/20 to-purple-600/20",
  },
  {
    id: "tiktok",
    title: "TikTok Style",
    description: "Fast-paced transitions",
    icon: Music2,
    gradient: "from-cyan-500/20 to-blue-600/20",
  },
  {
    id: "professional",
    title: "Professional Clean",
    description: "Polished corporate look",
    icon: Briefcase,
    gradient: "from-gray-700/20 to-gray-900/20",
  },
];

export function QuickEditStyleScreen() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState("youtube");
  const [aiOptions, setAiOptions] = useState({
    subtitles: true,
    autoCuts: true,
    backgroundMusic: false,
    faceTracking: true,
  });
  const [prompt, setPrompt] = useState("");

  const toggleOption = (option: keyof typeof aiOptions) => {
    setAiOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleGenerate = () => {
    navigate("/quick-edit/processing");
  };

  return (
    <div 
      className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white text-slate-200"
      style={{
        background: 'linear-gradient(135deg, #0b0d1f 0%, #1a1b2e 30%, #2d3142 60%, #3f4a67 85%, #1a1b2e 100%)',
      }}
    >
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }} />
      </div>

      {/* Top Header */}
      <header className="h-16 flex-none border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/quick-edit/upload")}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-[0.1em]">Quick Edit <span className="text-cyan-400">Studio</span></h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
               <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-widest">AI Engine Initialized</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-300">Advanced Config</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2"
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold text-slate-300">Edit History</span>
          </motion.button>
        </div>
      </header>

      {/* Main Multi-Pane Studio Area */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Command Hub */}
        <aside className="w-[340px] flex-none border-r border-white/10 flex flex-col bg-[#0b0d1f]/40 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            
            {/* AI Control Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                   <Zap className="w-3.5 h-3.5 text-cyan-400" />
                 </div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Control Center</label>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'subtitles', label: 'Smart Subtitles', icon: Layers, color: 'text-purple-400' },
                  { id: 'autoCuts', label: 'AI Auto-Cuts', icon: Trash2, color: 'text-red-400' },
                  { id: 'backgroundMusic', label: 'Trending Music', icon: Music, color: 'text-amber-400' },
                  { id: 'faceTracking', label: 'Face Tracking', icon: Monitor, color: 'text-emerald-400' },
                ].map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                       <opt.icon className={`w-4 h-4 ${opt.color}`} />
                       <span className="text-[11px] font-bold text-slate-200">{opt.label}</span>
                    </div>
                    <Switch
                      checked={aiOptions[opt.id as keyof typeof aiOptions]}
                      onCheckedChange={() => toggleOption(opt.id as keyof typeof aiOptions)}
                      className="scale-75 data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt Enhancement */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                     <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                   </div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Style Instruction</label>
                </div>
              </div>
              
              <div className="group relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell AI how to edit the mood or tone..."
                  className="min-h-[100px] text-sm resize-none rounded-xl border-white/10 focus:border-cyan-500/50 focus:ring-0 bg-black/40 text-slate-100 placeholder:text-slate-600 group-hover:bg-black/50 transition-all"
                />
              </div>
              
              <div className="flex gap-2 p-2.5 rounded-lg bg-cyan-900/10 border border-cyan-500/20">
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-none mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Quick Edit will automatically apply cuts and effects based on your chosen style.
                </p>
              </div>
            </div>

            {/* Audio Studio */}
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                     <Music2 className="w-3.5 h-3.5 text-amber-400" />
                   </div>
                   <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Audio Finishing</label>
                </div>
                
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-4">
                  <div className="h-8 flex items-center justify-center gap-[2px] opacity-40">
                    {[3,2,5,7,4,3,2,1,2,3,4,6,8,6,3,1,2,5,3,2].map((h, i) => (
                      <div key={i} className="w-[3px] bg-cyan-400 rounded-full" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 py-1 px-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold flex items-center justify-center gap-1.5 text-slate-300 hover:bg-white/10 transition-all">
                      <Music className="w-3 h-3 text-cyan-400" />
                      Music
                    </button>
                    <button className="flex-1 py-1 px-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold flex items-center justify-center gap-1.5 text-slate-300 hover:bg-white/10 transition-all">
                      <Mic className="w-3 h-3 text-purple-400" />
                      Voice
                    </button>
                  </div>
                </div>
            </div>

          </div>
        </aside>

        {/* Center Creation Canvas */}
        <section className="flex-1 flex flex-col bg-black/10 relative">
          
          {/* Main Preview Container */}
          <div className="flex-1 relative p-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <motion.div 
              layout
              className="relative aspect-video w-full max-w-4xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden ring-1 ring-white/10 flex items-center justify-center"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                 <Video className="w-16 h-16 text-cyan-400/20" />
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/10 transition-all">
                       <Play className="w-5 h-5 text-white/40 ml-1 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Source Preview</span>
                 </div>
              </div>

              {/* HUD Overlays */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3">
                   <div className="flex flex-col">
                      <span className="text-[8px] text-slate-500 font-black uppercase leading-none mb-0.5">Quick Mode</span>
                      <span className="text-[10px] text-emerald-400 font-bold leading-none">Standard Edit</span>
                   </div>
                </div>
              </div>

              {/* Transport Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                 <button className="text-slate-400 hover:text-white transition-colors">
                   <RefreshCw className="w-4 h-4" />
                 </button>
                 <button className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#0b0d1f] hover:scale-105 transition-all">
                   <Play className="w-5 h-5 fill-current ml-0.5" />
                 </button>
                 <button className="text-slate-400 hover:text-white transition-colors">
                   <Settings className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          </div>

          {/* Quick Scene View */}
          <div className="h-32 border-t border-white/10 bg-black/20 backdrop-blur-md flex items-center px-8 gap-4 overflow-x-auto custom-scrollbar">
            {[1, 2, 3, 4].map((scene) => (
              <div key={scene} className="flex-none w-40 aspect-video rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-center flex items-center justify-center cursor-pointer">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Block {scene}</span>
              </div>
            ))}
            <button className="flex-none p-4 rounded-xl border-2 border-dashed border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all text-slate-600 hover:text-cyan-400">
               <Plus className="w-5 h-5" />
            </button>
          </div>

        </section>

        {/* Right Style Atelier */}
        <aside className="w-[320px] flex-none border-l border-white/10 flex flex-col bg-[#0b0d1f]/40 backdrop-blur-3xl overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                   <Layers className="w-3.5 h-3.5 text-pink-400" />
                 </div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Style Atelier</label>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {editingStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`relative p-4 rounded-2xl border transition-all text-left group overflow-hidden ${
                      selectedStyle === style.id 
                      ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative flex items-center gap-4">
                       <div className={`p-2 rounded-xl bg-black/40 border border-white/10 transition-colors ${selectedStyle === style.id ? 'text-cyan-400 border-cyan-400/30' : 'text-slate-500'}`}>
                         <style.icon className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col">
                         <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${selectedStyle === style.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                           {style.title}
                         </span>
                         <span className="text-[9px] font-bold text-slate-500 mt-0.5">Quick Profile</span>
                       </div>
                       {selectedStyle === style.id && (
                         <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                       )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/20">
               <div className="flex items-center gap-3 mb-2">
                 <Sparkles className="w-4 h-4 text-cyan-400" />
                 <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">AI Boosted</span>
               </div>
               <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                 Quick Edit uses accelerated cloud rendering for sub-2 minute turnaround times.
               </p>
            </div>

          </div>
        </aside>

      </main>

      {/* Footer Timeline & Controls */}
      <footer className="h-44 flex-none border-t border-white/10 bg-black/40 backdrop-blur-3xl z-20 flex flex-col p-6 gap-6 relative">
        
        {/* Timeline Visualizer */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <span className="text-white">Timeline</span>
              <div className="w-[1px] h-3 bg-white/10" />
              <span>00:00 / 02:00</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 tracking-tighter uppercase font-black">AI Ready</div>
            </div>
          </div>
          
          <div className="h-10 w-full relative group">
            <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 transition-colors" />
            <div className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-cyan-500/10 border-x border-cyan-500/40" />
            
            {/* Scale Markings */}
            <div className="absolute bottom-1 inset-x-4 flex justify-between opacity-10 pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className={`w-[1px] bg-white ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest">
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>Format: Vertical</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
             </button>
             <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">Export Verified</span>
             </div>
          </div>

          <div className="flex items-center gap-3">
               <button 
                 onClick={() => navigate("/quick-edit/upload")}
                 className="px-6 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
               >
                 Cancel
               </button>
               <motion.button
                 whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(34,211,238,0.4)' }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleGenerate}
                 className="relative h-12 px-10 rounded-xl flex items-center gap-3 transition-all overflow-hidden bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 text-[#0b0d1f] cursor-pointer"
               >
                 <motion.div 
                   animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-white/20 blur-xl"
                 />
                 <Sparkles className="w-4 h-4 relative z-10" />
                 <span className="text-sm font-black uppercase tracking-[0.2em] relative z-10">Generate Quick Edit</span>
               </motion.button>
          </div>
        </div>

      </footer>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.2);
        }
      `}} />

    </div>
  );
}
