import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Sparkles, FileVideo, Zap, Image as ImageIcon, ArrowLeft, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/auth-context";
import { SuccessToast } from "../components/success-toast";

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

export function FeaturesSelectionPage() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    // Check if user just logged in
    const loginFlag = localStorage.getItem("justLoggedIn");
    if (loginFlag && isLoggedIn) {
      setShowLoginSuccess(true);
      localStorage.removeItem("justLoggedIn");
    }
  }, [isLoggedIn]);

  return (
    <div
      className="min-h-screen relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white"
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

      {/* Header with Back Button and User Actions */}
      <div className="pt-24 px-6 lg:px-12 flex justify-between items-center max-w-7xl mx-auto relative z-10 w-full">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-cyan-100 hover:text-cyan-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </motion.button>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {isLoggedIn && (
            <button 
              onClick={() => logout()}
              className="text-sm font-semibold text-cyan-50 transition-all bg-white/5 hover:bg-white/10 px-6 py-2 rounded-full border border-cyan-500/20 backdrop-blur-xl hover:shadow-[0_8px_40px_rgba(34,211,238,0.3)] group flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="group-hover:text-cyan-300 transition-colors">Logout</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-start justify-center px-6 relative z-10 pt-12">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
              Select Your Workflow
            </h1>
            <p className="text-lg md:text-xl text-[#94a3b8] font-medium">
              Choose how you want to create your video
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.03, boxShadow: `0 40px 80px -15px ${feature.glow}` }}
                  onClick={() => navigate(feature.route)}
                  className="group relative bg-[#1a1b2e]/50 hover:bg-[#2d3142]/70 border border-[#3f4a67]/50 hover:border-cyan-500/40 backdrop-blur-2xl rounded-3xl p-8 cursor-pointer transition-all duration-500 overflow-hidden shadow-[0_8px_30px_rgba(11,13,31,0.5)] hover:shadow-[0_20px_60px_rgba(34,211,238,0.2)]"
                >
                  {/* Glowing background inside card */}
                  <div className={`absolute -top-40 -right-40 w-[700px] h-[700px] bg-gradient-to-bl ${feature.gradient} opacity-0 group-hover:opacity-[0.1] rounded-full blur-[120px] transition-opacity duration-700 pointer-events-none`} />

                  {feature.badge && (
                    <div className="absolute top-6 right-6 z-20">
                      <div className={`bg-gradient-to-r ${feature.gradient} text-[#0b0d1f] text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-cyan-500/20 uppercase tracking-[0.15em] drop-shadow-md`}>
                        {feature.badge}
                      </div>
                    </div>
                  )}

                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/25 group-hover:scale-[1.12] group-hover:rotate-6 transition-transform duration-500 border border-white/20 relative overflow-hidden`}>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Icon className="w-12 h-12 text-[#0b0d1f] relative z-10 drop-shadow-lg" />
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight relative z-10 transition-colors duration-300 group-hover:text-cyan-50">
                    {feature.title}
                  </h3>
                  <p className="text-[#cbd5e1] group-hover:text-white leading-relaxed text-base md:text-lg transition-colors duration-300 relative z-10">
                    {feature.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-cyan-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 border border-cyan-500/40 backdrop-blur-xl z-10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showLoginSuccess && (
        <SuccessToast
          message="✅ Login successful! Welcome back!"
          onDismiss={() => setShowLoginSuccess(false)}
        />
      )}

      {/* Shimmer CSS */}
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
