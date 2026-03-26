import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { 
  Zap, 
  Activity, 
  Loader2, 
  CheckCircle2,
  Sparkles,
  ArrowLeft
} from "lucide-react";

export function QuickEditProcessingScreen() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Analyzing video sequence",
    "Detecting silences & jump-cuts",
    "Synthesizing smart captions",
    "Applying chosen style profile",
    "Final AI encoding"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    const fullTimer = setTimeout(() => {
      navigate("/quick-edit/result");
    }, 4500);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
      clearTimeout(fullTimer);
    };
  }, [navigate]);

  return (
    <div 
      className="h-screen w-full flex flex-col overflow-hidden font-sans text-slate-200"
      style={{
        background: 'linear-gradient(135deg, #0b0d1f 0%, #1a1b2e 30%, #2d3142 60%, #3f4a67 85%, #1a1b2e 100%)',
      }}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 500px rgba(11,13,31,0.95)' }} />
      </div>

      {/* Header */}
      <header className="h-16 flex-none border-b border-white/10 flex items-center justify-between px-6 bg-black/20 backdrop-blur-3xl z-20">
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 cursor-not-allowed">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase tracking-[0.1em]">Quick Edit <span className="text-cyan-400">Studio</span></h1>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
               <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Processing Node #84</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        
        <div className="max-w-4xl w-full flex flex-col gap-10">
          
          <div className="relative group p-[2px] rounded-2xl bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20">
            <div className="relative bg-[#0b0d1f]/60 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden p-10 flex flex-col items-center text-center gap-8">
                
                <div className="relative h-32 w-32">
                   <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                     className="absolute inset-0 rounded-full border border-dashed border-cyan-500/30"
                   />
                   <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                           <Zap className="w-8 h-8 text-[#0b0d1f]" fill="currentColor" />
                        </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest">Initializing Quick-Edit</h2>
                  <p className="text-sm text-[#94a3b8] font-medium max-w-md italic">
                    AI is currently analyzing your footage for silences, face-tracks, and optimal subtitle placement.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                      <span>AI Progress</span>
                      <span className="text-cyan-400">{progress}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                   </div>
                </div>

            </div>
          </div>

          {/* Execution Pipeline */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-3">
                {steps.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      opacity: idx <= currentStep ? 1 : 0.2,
                      x: idx === currentStep ? 5 : 0
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      idx === currentStep ? 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-white/5 bg-transparent'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-none">
                      {idx < currentStep ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : idx === currentStep ? (
                        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{step}</span>
                  </motion.div>
                ))}
             </div>

             <div className="bg-black/40 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                   <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Analytics</span>
                   </div>
                   <div className="space-y-4">
                      {[
                        { label: 'Compute Speed', val: '0.4s / frame', p: 92 },
                        { label: 'Analysis Depth', val: 'Advanced', p: 100 },
                        { label: 'AI Buffer', val: 'Optimized', p: 88 },
                      ].map((t) => (
                        <div key={t.label} className="space-y-1.5">
                           <div className="flex items-center justify-between text-[8px] font-black uppercase">
                              <span className="text-slate-600">{t.label}</span>
                              <span className="text-slate-300">{t.val}</span>
                           </div>
                           <div className="h-0.5 w-full bg-white/5 rounded-full">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${t.p}%` }} className="h-full bg-white/20" />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <span className="text-[8px] font-mono text-cyan-500/40">ENV_MODE: QUICK_ACCEL</span>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">System Stable</span>
                   </div>
                </div>
             </div>
          </div>

        </div>

      </main>

      <footer className="h-12 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center px-8 z-20">
         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>AI is working its magic...</span>
         </div>
      </footer>

    </div>
  );
}
