import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Image as ImageIcon,
  Maximize2,
  Volume2,
  X,
  Scissors,
  FileAudio,
  Timer,
  Palette,
  Sparkle,
  Download
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
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
    ratio: '16:9'
  },
  {
    id: "instagram",
    title: "Instagram Reel",
    description: "Vertical trendy format",
    icon: Instagram,
    gradient: "from-pink-500/20 to-purple-600/20",
    ratio: '9:16'
  },
  {
    id: "tiktok",
    title: "TikTok Style",
    description: "Fast-paced transitions",
    icon: Music2,
    gradient: "from-cyan-500/20 to-blue-600/20",
    ratio: '9:16'
  },
  {
    id: "professional",
    title: "Professional Clean",
    description: "Polished corporate look",
    icon: Briefcase,
    gradient: "from-gray-700/20 to-gray-900/20",
    ratio: '16:9'
  },
];

export function QuickEditStyleScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // -- State Management --
  const [selectedStyle, setSelectedStyle] = useState("youtube");
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isCustomFrameOpen, setIsCustomFrameOpen] = useState(false);
  const [customFrame, setCustomFrame] = useState({ width: 1920, height: 1080 });
  const [fps, setFps] = useState(60);
  const [exportQuality, setExportQuality] = useState("1080p");

  const [mediaItems, setMediaItems] = useState<Array<{ id: string, file: File | null, preview: string, type: 'video' | 'image' }>>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [audioTracks, setAudioTracks] = useState<Array<{ id: string, name: string, type: 'extracted' | 'direct' }>>([]);
  const [showAudioChoice, setShowAudioChoice] = useState(false);

  const [aiOptions, setAiOptions] = useState({
    subtitles: true,
    autoCuts: true,
    backgroundMusic: false,
    faceTracking: true,
  });
  const [prompt, setPrompt] = useState("");

  // -- Initialize from Transition State --
  useEffect(() => {
    if (location.state) {
      const { initialMedia, initialAudio } = location.state as {
        initialMedia?: { name: string, type: 'video' | 'image', preview: string, file: File },
        initialAudio?: { name: string, type: 'extracted' | 'direct', file: File }
      };

      if (initialMedia && initialMedia.file) {
        // Re-create the preview URL in this component's context to ensure it hasn't been revoked
        const previewUrl = URL.createObjectURL(initialMedia.file);
        setMediaItems([{
          id: 'initial',
          file: initialMedia.file,
          preview: previewUrl,
          type: initialMedia.type
        }]);
        setActivePreviewId('initial');
      }

      if (initialAudio) {
        setAudioTracks([{
          id: 'initial-audio',
          name: initialAudio.name,
          type: initialAudio.type
        }]);
      }
    }
  }, [location.state]);

  // Keep track of mediaItems in a ref for cleanup on unmount
  const mediaItemsRef = useRef(mediaItems);
  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  // Handle cleanup of all blob URLs on unmount
  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach(item => {
        if (item.preview && item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  // -- Effects --
  useEffect(() => {
    const style = editingStyles.find(s => s.id === selectedStyle);
    if (style && !isCustomFrameOpen) {
      setAspectRatio(style.ratio);
      // Auto-set standard FPS based on style if needed
      if (style.id === 'youtube') setFps(60);
      else setFps(30);
    }
  }, [selectedStyle, isCustomFrameOpen]);

  const getRatioValue = () => {
    if (aspectRatio === '16:9') return 16 / 9;
    if (aspectRatio === '9:16') return 9 / 16;
    if (aspectRatio === '1:1') return 1;
    if (aspectRatio === '4:3') return 4 / 3;
    if (aspectRatio === '4:5') return 4 / 5;
    if (aspectRatio === 'Custom') return customFrame.width / customFrame.height;
    return 16 / 9;
  };

  // -- Handlers --
  const toggleOption = (option: keyof typeof aiOptions) => {
    setAiOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleMediaImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newItems = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
    }));
    setMediaItems(prev => {
      if (prev.length === 0 && newItems.length > 0) {
        setActivePreviewId(newItems[0].id);
      }
      return [...prev, ...newItems];
    });
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleAddAudio = (type: 'extracted' | 'direct') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'extracted' 
      ? 'video/*,image/*,.mp4,.mov,.jpeg,.jpg' 
      : 'audio/*,video/*,image/*,.m4a,.aac,.mp4,.mov,.jpeg,.jpg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setAudioTracks(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type
        }]);
      }
      setShowAudioChoice(false);
    };
    input.click();
  };

  const removeAudioTrack = (id: string) => {
    setAudioTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerate = () => {
    // Build the full editing configuration to pass to processing
    const editConfig = {
      mediaItems: mediaItems.map(item => ({
        id: item.id,
        file: item.file,
        preview: item.preview,
        type: item.type,
      })),
      selectedStyle,
      aspectRatio,
      fps,
      exportQuality,
      aiOptions,
      prompt,
      audioTracks,
    };
    navigate("/quick-edit/processing", { state: editConfig });
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
              <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-widest">Studio Engine Active</span>
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

        {/* Left Column: AI Control and Styling */}
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
                  className="min-h-[120px] text-sm resize-none rounded-xl border-white/10 focus:border-cyan-500/50 focus:ring-0 bg-black/40 text-slate-100 placeholder:text-slate-600 group-hover:bg-black/50 transition-all"
                />
              </div>

              <div className="flex gap-2 p-3 rounded-lg bg-cyan-900/10 border border-cyan-500/20">
                <Info className="w-3.5 h-3.5 text-cyan-400 flex-none mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Quick Edit will automatically apply cuts, transitions, and effects based on your chosen style and prompts.
                </p>
              </div>
            </div>

            {/* Quick Action Icons [NEW] */}
            <div className="space-y-3 pt-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-1">Quick Tools</label>
              <div className="flex gap-4">
                {[
                  { icon: Sparkle, label: 'Effects', color: 'text-amber-400' },
                  { icon: Palette, label: 'Filters', color: 'text-pink-400' },
                  { icon: Timer, label: 'Speed', color: 'text-cyan-400' },
                ].map((tool, index) => (
                  <button
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <tool.icon className={`w-5 h-5 ${tool.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Center Creation Canvas & Media Management */}
        <section className="flex-1 flex flex-col bg-black/10 relative overflow-hidden">

          {/* Main Preview Container */}
          <div className="flex-1 relative p-8 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>

            <motion.div
              layout
              animate={{
                aspectRatio: getRatioValue()
              }}
              className="relative h-full max-w-4xl max-h-[85%] rounded-2xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden shadow-cyan-500/5 flex items-center justify-center transition-all duration-500"
            >
              <AnimatePresence mode="wait">
                {activePreviewId && mediaItems.find(i => i.id === activePreviewId) ? (
                  <motion.div
                    key={activePreviewId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {mediaItems.find(i => i.id === activePreviewId)?.type === 'video' ? (
                      <video
                        src={mediaItems.find(i => i.id === activePreviewId)?.preview}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={mediaItems.find(i => i.id === activePreviewId)?.preview}
                        className="w-full h-full object-contain"
                        alt="Preview"
                      />
                    )}
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-16 h-16 text-cyan-400/10" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/10 transition-all">
                        <Play className="w-5 h-5 text-white/40 ml-1 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Source Preview</span>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* HUD Overlays */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-black uppercase leading-none mb-0.5">Frame Mode</span>
                    <span className="text-[10px] text-cyan-400 font-bold leading-none">{aspectRatio} • {fps}FPS</span>
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

          {/* Media Import & Arrangement Section */}
          <div className="flex-none p-6 space-y-6 border-t border-white/10 bg-black/20 backdrop-blur-md">

            {/* Horizontal Media Sequence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Media Sequence</span>
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{mediaItems.length} Items</span>
              </div>

              <div className="h-28 flex items-center gap-4 overflow-x-auto custom-scrollbar pb-2 px-2">
                {mediaItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setActivePreviewId(item.id)}
                    style={{ aspectRatio: getRatioValue() }}
                    className={`group relative flex-none h-full rounded-xl border transition-all cursor-pointer overflow-hidden ring-1 shadow-xl ${activePreviewId === item.id
                        ? 'border-cyan-500 ring-cyan-500/50 scale-[1.02] shadow-cyan-500/10'
                        : 'border-white/10 bg-slate-900 ring-white/5 hover:border-white/30'
                      }`}
                  >
                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => removeMediaItem(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[8px] font-black text-white/60 uppercase">
                      {item.type}
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={() => mediaInputRef.current?.click()}
                  style={{ aspectRatio: getRatioValue() }}
                  className="flex-none h-full rounded-xl border-2 border-dashed border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-slate-600 hover:text-cyan-400 flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Media</span>
                </button>

                <input
                  type="file"
                  ref={mediaInputRef}
                  multiple
                  accept="video/*,image/*"
                  onChange={handleMediaImport}
                  className="hidden"
                />
              </div>
            </div>

            {/* Audio Tracks Section [NEW] */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Audio Tracks</span>
                </div>
                <button
                  onClick={() => setShowAudioChoice(!showAudioChoice)}
                  className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" /> Add Audio
                </button>
              </div>

              <div className="relative">
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar px-2">
                  {audioTracks.length === 0 ? (
                    <div className="py-4 text-center rounded-xl bg-white/5 border border-dashed border-white/5">
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">No audio tracks added yet</span>
                    </div>
                  ) : (
                    audioTracks.map((track) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group hover:border-cyan-500/20 transition-all"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-none">
                            {track.type === 'extracted' ? <Scissors className="w-3.5 h-3.5 text-purple-400" /> : <Music className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-300 truncate tracking-tight">{track.name}</span>
                          <span className="flex-none text-[8px] font-black text-slate-600 uppercase bg-white/5 px-1.5 py-0.5 rounded">{track.type}</span>
                        </div>
                        <button
                          onClick={() => removeAudioTrack(track.id)}
                          className="p-1 px-1.5 rounded-md hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Choice Overlay */}
                <AnimatePresence>
                  {showAudioChoice && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 z-20 flex items-center justify-center gap-4 bg-[#0b0d1f]/90 backdrop-blur-md rounded-xl border border-white/10"
                    >
                      <button
                        onClick={() => handleAddAudio('extracted')}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/5 transition-all w-32"
                      >
                        <Scissors className="w-4 h-4 text-purple-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Extract Audio</span>
                      </button>
                      <div className="w-[1px] h-8 bg-white/10" />
                      <button
                        onClick={() => handleAddAudio('direct')}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-white/5 transition-all w-32"
                      >
                        <FileAudio className="w-4 h-4 text-cyan-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Upload File</span>
                      </button>
                      <button
                        onClick={() => setShowAudioChoice(false)}
                        className="absolute top-1 right-1 p-1 text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

        </section>

        {/* Right Column: Style Atelier and Frame Customization */}
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
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setIsCustomFrameOpen(false);
                    }}
                    className={`relative p-4 rounded-2xl border transition-all text-left group overflow-hidden ${selectedStyle === style.id && !isCustomFrameOpen
                        ? 'border-cyan-500/50 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                        : 'border-white/5 bg-white/5 hover:border-white/10'
                      }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-20 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative flex items-center gap-4">
                      <div className={`p-2 rounded-xl bg-black/40 border border-white/10 transition-colors ${selectedStyle === style.id ? 'text-cyan-400 border-cyan-400/30' : 'text-slate-500'}`}>
                        <style.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${selectedStyle === style.id ? 'text-cyan-100' : 'text-slate-400'}`}>
                          {style.title}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 mt-0.5">Platform Preset</span>
                      </div>
                      {selectedStyle === style.id && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Customize Frame Link */}
              <button
                onClick={() => {
                  setIsCustomFrameOpen(!isCustomFrameOpen);
                  if (!isCustomFrameOpen) setAspectRatio('Custom');
                }}
                className={`w-full py-3 rounded-xl border border-dashed transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${isCustomFrameOpen ? 'border-purple-500 text-purple-400 bg-purple-500/5' : 'border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                  }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Customize Frame
              </button>

              <AnimatePresence>
                {isCustomFrameOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-slate-600 uppercase px-1">Width (px)</label>
                        <input
                          type="number"
                          value={customFrame.width}
                          onChange={(e) => setCustomFrame(prev => ({ ...prev, width: Number(e.target.value) }))}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black text-slate-600 uppercase px-1">Height (px)</label>
                        <input
                          type="number"
                          value={customFrame.height}
                          onChange={(e) => setCustomFrame(prev => ({ ...prev, height: Number(e.target.value) }))}
                          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-purple-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-600 uppercase px-1">Frame Rate (FPS)</label>
                      <div className="flex gap-2">
                        {[24, 30, 60].map(f => (
                          <button
                            key={f}
                            onClick={() => setFps(f)}
                            className={`flex-1 py-1.5 rounded-lg border text-[9px] font-black transition-all ${fps === f ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-slate-600 hover:border-white/10'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['1:1', '4:3', '4:5'].map(r => (
                        <button
                          key={r}
                          onClick={() => setAspectRatio(r)}
                          className={`flex-1 py-1.5 rounded-lg border text-[9px] font-black transition-all ${aspectRatio === r ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-white/5 bg-white/5 text-slate-600 hover:border-white/10'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest">AI Boosted</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                Studio uses local GPU acceleration for real-time scene synthesis and platform-optimized rendering.
              </p>
            </div>

            {/* Project Export Quality [NEW] */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Export Master</label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '4k', label: 'Ultra HD', res: '4K • 30', active: 'border-emerald-500/50 text-emerald-100' },
                  { id: '1080p', label: 'Full HD', res: '1080p • 60', active: 'border-cyan-500/50 text-cyan-100' },
                  { id: '720p', label: 'Standard', res: '720p • 30', active: 'border-white/30 text-white' },
                  { id: '480p', label: 'Mobile', res: '480p • 30', active: 'border-white/10 text-slate-400' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setExportQuality(q.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${exportQuality === q.id ? q.active + ' bg-white/10 shadow-lg' : 'border-white/5 bg-white/5 text-slate-500 hover:border-white/10'
                      }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest">{q.label}</span>
                      <span className="text-[8px] font-bold opacity-60 mt-0.5">{q.res}</span>
                    </div>
                  </button>
                ))}
              </div>
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
              <span className="text-white">Timeline Hub</span>
              <div className="w-[1px] h-3 bg-white/10" />
              <span>{mediaItems.length} Layers • {audioTracks.length} Tracks</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 tracking-tighter uppercase font-black">Ready for Studio</div>
            </div>
          </div>

          <div className="h-10 w-full relative group">
            <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 transition-colors" />

            {/* Layers Visualization */}
            <div className="absolute inset-y-[2px] left-1 right-1 flex gap-1">
              {mediaItems.map((_, i) => (
                <div key={i} className="flex-1 h-full bg-cyan-500/20 border-x border-cyan-500/40 first:rounded-l-lg last:rounded-r-lg" />
              ))}
              {mediaItems.length === 0 && (
                <div className="flex-1 h-full bg-white/5 border border-dashed border-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">No Media Ingested</span>
                </div>
              )}
            </div>

            {/* Playhead */}
            <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-cyan-400 z-10 shadow-[0_0_10px_rgba(34,211,238,0.8)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400" />
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Format: {aspectRatio}</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>
            <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Pipeline Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/quick-edit/upload")}
              className="px-6 h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest transition-all"
            >
              Discard
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
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
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
