import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, FileVideo, Zap, MonitorPlay, EyeOff, Rocket, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

const features = [
  {
    id: "ai-generated",
    title: "AI Generated Video",
    description: "Create stunning videos from text prompts using AI",
    icon: Sparkles,
    gradient: "from-cyan-400 to-blue-500", 
    glow: "rgba(34, 211, 238, 0.25)",
    badge: "",
    route: "/create",
  },
  {
    id: "reference-video",
    title: "Generate Using Reference",
    description: "Generate new videos using reference video, prompt, and media",
    icon: FileVideo,
    gradient: "from-cyan-400 to-blue-500", 
    glow: "rgba(34, 211, 238, 0.25)",
    badge: "POPULAR",
    route: "/reference-video/setup",
  },
  {
    id: "media-to-video",
    title: "Direct Pic to Video",
    description: "Convert images or clips into AI-generated videos with audio and duration control",
    icon: ImageIcon,
    gradient: "from-cyan-400 to-blue-500", 
    glow: "rgba(34, 211, 238, 0.25)",
    badge: "",
    route: "/images-to-video/upload",
  },
  {
    id: "quick-edit",
    title: "Quick AI Edit",
    description: "Automatically edit videos with AI-powered enhancements",
    icon: Zap,
    gradient: "from-cyan-400 to-blue-500", 
    glow: "rgba(34, 211, 238, 0.25)",
    badge: "",
    route: "/quick-edit/upload",
  },
];

const particles = Array.from({ length: 60 }); 

export function VideoTypePage() {
  const navigate = useNavigate();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
        animate={{ opacity: [0.05, 0.12, 0.05], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-[15%] left-[20%] w-[50%] h-[50%] bg-cyan-600/20 rounded-full blur-[250px] pointer-events-none z-0 mix-blend-screen" 
      />
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.08, 1] }}
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
                  opacity: isFlare ? [0, 0.5, 0] : [0, 0.8, 0],
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

      {/* Header */}
      <div className="pt-8 px-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto relative z-10 w-full mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] group-hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-[#0b0d1f]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            AIVideo
          </span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button className="text-sm font-semibold text-cyan-50 transition-all bg-white/5 hover:bg-white/10 px-7 py-3 rounded-full border border-cyan-500/20 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_40px_rgba(34,211,238,0.3)] group">
            <span className="group-hover:text-cyan-300 transition-colors">Login</span>
          </button>
        </motion.div>
      </div>

      <div className="container mx-auto px-6 pt-12 pb-16 max-w-7xl relative z-10">
        
        {/* HERO SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto mb-32"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#1a1b2e]/60 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-cyan-500/20 mb-8 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:bg-[#2d3142]/60 transition-colors cursor-default"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-100 tracking-wide uppercase font-sans tracking-[0.2em]">Next-Gen Creation</span>
          </motion.div>

          {/* Heading - Massive Cyan Gradient Glow Text */}
          <h1 className="text-6xl md:text-7xl lg:text-[7.5rem] font-black tracking-tighter mb-8 leading-[1.1] selection:bg-cyan-500/30 relative">
            <span className="absolute inset-0 blur-[60px] opacity-30 bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent pointer-events-none">
              AI Video Editor
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-teal-300 relative z-10 drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
              AI Video Editor
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-[#94a3b8] font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
            Create stunning videos using AI in seconds.
          </p>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 0 80px rgba(34, 211, 238, 0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="relative px-12 md:px-14 py-4 md:py-5 rounded-full bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-400 text-[#0b0d1f] text-lg md:text-xl font-bold shadow-2xl shadow-cyan-500/30 transition-all overflow-hidden group border border-cyan-300/40"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
            <span className="relative z-10 flex items-center gap-3 drop-shadow-sm">
              Start Creating <Rocket className="w-5 h-5 text-[#0b0d1f]" />
            </span>
          </motion.button>
        </motion.div>

        {/* FEATURES SECTION (2x2 Grid) */}
        <div id="features" className="scroll-mt-32">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Platform Features</h2>
            <p className="text-[#94a3b8] font-medium text-lg">Select a workflow to begin</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6, scale: 1.02, boxShadow: `0 30px 60px -15px ${feature.glow}` }}
                  onClick={() => navigate(feature.route)}
                  className="group relative bg-[#1a1b2e]/40 hover:bg-[#2d3142]/60 border border-[#3f4a67]/50 hover:border-cyan-500/30 backdrop-blur-2xl rounded-3xl p-8 cursor-pointer transition-all duration-500 overflow-hidden shadow-[0_8px_30px_rgba(11,13,31,0.5)]"
                >
                  {/* Glowing background inside card */}
                  <div className={`absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-bl ${feature.gradient} opacity-0 group-hover:opacity-[0.08] rounded-full blur-[100px] transition-opacity duration-700 pointer-events-none`} />
                  
                  {feature.badge && (
                    <div className="absolute top-8 right-8 z-20">
                      <div className={`bg-gradient-to-r ${feature.gradient} text-[#0b0d1f] text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/20 uppercase tracking-[0.2em] font-sans drop-shadow-md`}>
                        {feature.badge}
                      </div>
                    </div>
                  )}

                  <div className={`w-20 h-20 rounded-[1.25rem] bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/20 group-hover:scale-[1.15] group-hover:rotate-6 transition-transform duration-500 border border-white/20 relative overflow-hidden`}>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Icon className="w-10 h-10 text-[#0b0d1f] relative z-10 drop-shadow-sm" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight relative z-10 transition-colors duration-300 group-hover:text-cyan-50">
                    {feature.title}
                  </h3>
                  <p className="text-[#cbd5e1] group-hover:text-white leading-relaxed text-base md:text-lg max-w-[90%] transition-colors duration-300 relative z-10">
                    {feature.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-[#1a1b2e] flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 border border-cyan-500/30 backdrop-blur-xl z-10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <svg className="w-5 h-5 text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM HIGHLIGHTS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-32 pt-12 border-t border-[#3f4a67]/40 relative z-10 flex flex-wrap justify-center gap-8 md:gap-16 lg:gap-24"
        >
          {[
            { text: "4K Export Quality", icon: MonitorPlay },
            { text: "60+ AI Effects", icon: Sparkles },
            { text: "No Watermark", icon: EyeOff },
            { text: "Lightning Fast", icon: Rocket }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4 group cursor-default">
                <div className="w-14 h-14 rounded-full bg-[#1a1b2e]/60 border border-[#3f4a67] group-hover:border-cyan-400/50 group-hover:bg-[#2d3142]/80 transition-all duration-300 flex items-center justify-center backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <Icon className="w-6 h-6 text-cyan-500 group-hover:text-cyan-300 drop-shadow-md transition-colors" />
                </div>
                <span className="text-[#94a3b8] font-semibold text-lg tracking-wide group-hover:text-cyan-100 transition-colors duration-300">{item.text}</span>
              </div>
            );
          })}
        </motion.div>

      </div>
      
      {/* Sparkles shimmer CSS */}
      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}