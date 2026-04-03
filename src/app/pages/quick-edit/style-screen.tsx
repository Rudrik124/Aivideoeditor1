import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Instagram,
  Music2,
  Briefcase,
  ArrowLeft,
  Sparkles,
  Wand2,
  History as HistoryIcon,
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
  VolumeX,
  X,
  Scissors,
  FileAudio,
  Timer,
  Palette,
  Sparkle,
  Download,
  Copy,
  Type,
  RotateCw,
  Crop,
  ZoomIn,
  MonitorPlay,
  Film,
  Crown,
  Settings2,
  Check,
  Pause,
  Undo2,
  Redo2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";

import { HistoryDialog, type HistoryItem, saveToHistory } from "../../components/history-dialog";
import { PremiumModal } from "../../components/premium-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

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
    id: "cinematic",
    title: "Cinematic Film",
    description: "Ultra-wide cinematic look",
    icon: Film,
    gradient: "from-indigo-500/20 to-purple-600/20",
    ratio: '21:9'
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

const textFontOptions = [
  { id: 'serif', label: 'SERIF FONT', family: 'Georgia, Times New Roman, serif' },
  { id: 'sans', label: 'SANS SERIF FONT', family: 'Helvetica, Arial, sans-serif' },
  { id: 'script', label: 'SCRIPT FONT', family: 'Brush Script MT, cursive' },
  { id: 'display', label: 'DISPLAY FONT', family: 'Impact, fantasy' },
  { id: 'mono', label: 'MONOSPACE FONT', family: 'Courier New, monospace' },
  { id: 'handwritten', label: 'HANDWRITTEN FONT', family: 'Comic Sans MS, cursive' },
  { id: 'slab', label: 'SLAB SERIF FONT', family: 'Rockwell, Roboto Slab, serif' },
  { id: 'brush', label: 'BRUSH FONT', family: 'Segoe Script, Brush Script MT, cursive' },
  { id: 'calligraphy', label: 'CALLIGRAPHY FONT', family: 'Lucida Calligraphy, cursive' },
  { id: 'vintage', label: 'VINTAGE FONT', family: 'Copperplate, Papyrus, serif' },
];

const CANVAS_PREVIEW_EFFECTS = [
  'green-screen',
  'glitch',
  'text-animation',
  'motion-tracking',
];

const CANVAS_PREVIEW_FILTERS = [
  'vintage',
  'soft-glow',
  'retro-film',
];

export function QuickEditStyleScreen() {
    type FilterType =
      | 'none'
      | 'vintage'
      | 'black-white'
      | 'cinematic'
      | 'warm'
      | 'cool'
      | 'sepia'
      | 'hdr'
      | 'vivid'
      | 'soft-glow'
      | 'retro-film';

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

  const [watermark, setWatermark] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState<"watermark" | "4k" | "60fps" | "general">("general");

  const handlePremiumIntercept = (feature: "watermark" | "4k" | "60fps") => {
    setPremiumFeature(feature);
    setIsPremiumModalOpen(true);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    console.log("Loading project from history:", item);
    if (item.config) {
      if (item.config.style) setSelectedStyle(item.config.style);
      if (item.config.ratio) setAspectRatio(item.config.ratio);
      if (item.config.fps) setFps(item.config.fps);
      if (item.config.exportQuality) setExportQuality(item.config.exportQuality);
      if (item.config.watermark !== undefined) setWatermark(item.config.watermark);
      if (item.config.aiOptions) setAiOptions(prev => ({ ...prev, ...item.config.aiOptions }));
    }
    setIsHistoryOpen(false);
  };

  const [mediaItems, setMediaItems] = useState<Array<{ id: string, file: File | null, preview: string, type: 'video' | 'image', duration: number }>>([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [audioTracks, setAudioTracks] = useState<Array<{ id: string, name: string, type: 'extracted' | 'direct', file?: File }>>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showAudioChoice, setShowAudioChoice] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [history, setHistory] = useState<Array<string>>([]); // Store as JSON strings for easier comparison
  const [historyIndex, setHistoryIndex] = useState(-1);
  const createdPreviewUrlsRef = useRef<string[]>([]);

  // Manage audio object URL to prevent memory leaks
  useEffect(() => {
    if (audioTracks.length > 0 && audioTracks[0].file) {
      const url = URL.createObjectURL(audioTracks[0].file);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioTracks]);

  useEffect(() => {
    return () => {
      createdPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      createdPreviewUrlsRef.current = [];
    };
  }, []);

  const saveToUndo = useCallback((items: typeof mediaItems) => {
    const itemsStr = JSON.stringify(items);
    setHistory(prev => {
      // Don't save if identical to last state
      if (prev[historyIndex] === itemsStr) return prev;
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, itemsStr];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevItems = JSON.parse(history[historyIndex - 1]);
      setMediaItems(prevItems);
      setHistoryIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextItems = JSON.parse(history[historyIndex + 1]);
      setMediaItems(nextItems);
      setHistoryIndex(prev => prev + 1);
    }
  };

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        resolve(3.0); // Default 3s for images
        return;
      }
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => resolve(3.0);
      video.src = URL.createObjectURL(file);
    });
  };

  const getMediaDurationFromPreview = (previewUrl: string, type: 'video' | 'image'): Promise<number> => {
    return new Promise((resolve) => {
      if (type === 'image') {
        resolve(3.0);
        return;
      }
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Number(video.duration || 0);
        resolve(duration > 0 ? duration : 10);
      };
      video.onerror = () => resolve(10);
      video.src = previewUrl;
    });
  };

  const [aiOptions, setAiOptions] = useState({
    subtitles: true,
    autoCuts: true,
    backgroundMusic: false,
    faceTracking: true,
  });
  const [prompt, setPrompt] = useState("");
  const [isEffectsOpen, setIsEffectsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isTransitionsOpen, setIsTransitionsOpen] = useState(false);
  const [isTextToolOpen, setIsTextToolOpen] = useState(false);
  const [isSpeedOpen, setIsSpeedOpen] = useState(false);
  const [isTrimOpen, setIsTrimOpen] = useState(false);
  const [isRotateOpen, setIsRotateOpen] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isKeyframeOpen, setIsKeyframeOpen] = useState(false);
  const [isTextPlacementMode, setIsTextPlacementMode] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [overlayFontId, setOverlayFontId] = useState('serif');
  const [overlayFontSize, setOverlayFontSize] = useState(48);
  const [overlayColor, setOverlayColor] = useState('#FFFFFF');
  const [overlayPosX, setOverlayPosX] = useState(50);
  const [overlayPosY, setOverlayPosY] = useState(50);
  const [speedValue, setSpeedValue] = useState(1);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(1);
  const [zoomToolAmount, setZoomToolAmount] = useState(1);
  const [cropCenterX, setCropCenterX] = useState(50);
  const [cropCenterY, setCropCenterY] = useState(50);
  const [cropWidthPct, setCropWidthPct] = useState(100);
  const [cropHeightPct, setCropHeightPct] = useState(100);
  const [keyframeMode, setKeyframeMode] = useState<'none' | 'zoom-in' | 'zoom-out' | 'pulse'>('none');
  const [keyframeAmount, setKeyframeAmount] = useState(1.25);
  const [keyframeProgress, setKeyframeProgress] = useState(0);
  const [clipTrimRanges, setClipTrimRanges] = useState<Record<string, { start: number; end: number | null }>>({});

  type TransitionType =
    | 'none'
    | 'cross-dissolve'
    | 'slide-left'
    | 'slide-right'
    | 'dip-black'
    | 'dip-white'
    | 'zoom-transition'
    | 'blur-transition'
    | 'spin-transition'
    | 'glitch-transition'
    | 'flash-transition';

  const [clipTransitions, setClipTransitions] = useState<Record<string, TransitionType>>({});
  const [transitionOverlay, setTransitionOverlay] = useState<{
    fromId: string;
    toId: string;
    type: TransitionType;
    startAt: number;
    durationMs: number;
  } | null>(null);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [selectedEffect, setSelectedEffect] = useState<'none' | 'fade-in' | 'blur' | 'zoom' | 'color-correction' | 'vintage' | 'black-white' | 'cinematic' | 'warm' | 'cool' | 'sepia' | 'hdr' | 'vivid' | 'soft-glow' | 'retro-film' | 'green-screen' | 'slow-motion' | 'glitch' | 'transition' | 'slide-left' | 'slide-right' | 'text-animation' | 'motion-tracking'>('none');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('none');
  const [blurAmount, setBlurAmount] = useState(10);
  const [previewOpacity, setPreviewOpacity] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(1);
  const [saturation, setSaturation] = useState(1);
  const [slowMotionSpeed, setSlowMotionSpeed] = useState(0.25);
  const [glitchIntensity, setGlitchIntensity] = useState(1);
  const [animatedText, setAnimatedText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const greenScreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const greenScreenAnimationRef = useRef<number | null>(null);
  const previousFrameRef = useRef<ImageData | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const thumbnailVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const activePreviewItem = mediaItems.find((i) => i.id === activePreviewId) || null;

  const getTrimRangeForItem = useCallback((itemId: string, duration: number) => {
    const range = clipTrimRanges[itemId];
    const safeDuration = Math.max(0.01, Number(duration) || 0.01);
    const start = Math.max(0, Math.min(safeDuration - 0.01, Number(range?.start) || 0));
    const rawEnd = range?.end;
    const end = rawEnd == null
      ? safeDuration
      : Math.max(start + 0.01, Math.min(safeDuration, Number(rawEnd) || safeDuration));
    return { start, end };
  }, [clipTrimRanges]);

  const getEffectiveDurationForItem = useCallback((item: { id: string; type: 'video' | 'image'; duration: number }) => {
    if (item.type !== 'video') return item.duration;
    const { start, end } = getTrimRangeForItem(item.id, item.duration);
    return Math.max(0.01, end - start);
  }, [getTrimRangeForItem]);

  const getTotalEffectiveDuration = useCallback(() => {
    return mediaItems.reduce((acc, item) => acc + getEffectiveDurationForItem(item), 0);
  }, [mediaItems, getEffectiveDurationForItem]);

  const triggerClipTransition = useCallback((nextId: string) => {
    if (!activePreviewId || activePreviewId === nextId) {
      setActivePreviewId(nextId);
      return;
    }

    // Transition is primarily defined by the outgoing (currently playing) clip.
    // Keep next-clip fallback so existing assignments still work.
    const transitionType = clipTransitions[activePreviewId] || clipTransitions[nextId] || 'none';
    if (transitionType === 'none') {
      setActivePreviewId(nextId);
      return;
    }

    setTransitionOverlay({
      fromId: activePreviewId,
      toId: nextId,
      type: transitionType,
      startAt: performance.now(),
      durationMs: 1400,
    });
    setTransitionProgress(0);
    setActivePreviewId(nextId);
  }, [activePreviewId, clipTransitions]);

  const playNextMedia = useCallback(() => {
    const currentIndex = mediaItems.findIndex(i => i.id === activePreviewId);
    if (currentIndex !== -1 && currentIndex < mediaItems.length - 1) {
      const nextId = mediaItems[currentIndex + 1].id;
      triggerClipTransition(nextId);
      // Ensure we keep playing the next track
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [activePreviewId, mediaItems, triggerClipTransition]);

  const togglePlay = () => {
    const activeItem = mediaItems.find(i => i.id === activePreviewId);
    if (activeItem?.type === 'video' && videoRef.current) {
      const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime < trim.start || videoRef.current.currentTime > trim.end) {
          videoRef.current.currentTime = trim.start;
        }
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && mediaItems.length > 0) {
      const activeIndex = mediaItems.findIndex(i => i.id === activePreviewId);
      const activeItem = activeIndex >= 0 ? mediaItems[activeIndex] : null;
      const timeBefore = mediaItems
        .slice(0, activeIndex)
        .reduce((acc, item) => acc + getEffectiveDurationForItem(item), 0);
      const totalDuration = getTotalEffectiveDuration();

      let currentLocalTime = videoRef.current.currentTime;
      if (activeItem?.type === 'video') {
        const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
        if (currentLocalTime < trim.start) {
          videoRef.current.currentTime = trim.start;
          currentLocalTime = trim.start;
        }
        if (currentLocalTime >= trim.end) {
          videoRef.current.currentTime = trim.end;
          setProgress(((timeBefore + (trim.end - trim.start)) / (totalDuration || 1)) * 100 || 0);
          playNextMedia();
          return;
        }
        currentLocalTime = Math.max(0, currentLocalTime - trim.start);
      }

      const globalTime = timeBefore + currentLocalTime;
      const p = (globalTime / totalDuration) * 100;
      setProgress(p || 0);

      if (selectedEffect === 'fade-in') {
        const duration = videoRef.current.duration || 0;
        if (duration > 0) {
          const fadeWindow = duration * 0.5;
          const opacity = Math.min(1, videoRef.current.currentTime / Math.max(fadeWindow, 0.001));
          setPreviewOpacity(opacity);
        } else {
          setPreviewOpacity(0);
        }
      } else {
        setPreviewOpacity(1);
      }

      if (selectedEffect === 'zoom') {
        const duration = videoRef.current.duration || 0;
        const progress = duration > 0 ? videoRef.current.currentTime / duration : 0;
        setPreviewZoom(1 + progress * 1.5);
      } else {
        setPreviewZoom(1);
      }

      if (activeItem?.type === 'video') {
        const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
        const localDuration = Math.max(0.01, trim.end - trim.start);
        const localTime = Math.max(0, (videoRef.current.currentTime || 0) - trim.start);
        setKeyframeProgress(Math.max(0, Math.min(1, localTime / localDuration)));
      }
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const totalDuration = getTotalEffectiveDuration();
    if (totalDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const globalSeekTime = pos * totalDuration;

    // Find which item this global time corresponds to
    let accumulated = 0;
    for (const item of mediaItems) {
      const itemEffectiveDuration = getEffectiveDurationForItem(item);
      if (globalSeekTime <= accumulated + itemEffectiveDuration) {
        const offset = globalSeekTime - accumulated;
        triggerClipTransition(item.id);
        // Use a tiny timeout to let the video/img mount before seeking
        setTimeout(() => {
          if (videoRef.current && item.type === 'video') {
            const trim = getTrimRangeForItem(item.id, item.duration);
            videoRef.current.currentTime = Math.max(trim.start, Math.min(trim.end, trim.start + offset));
          }
        }, 10);
        break;
      }
      accumulated += itemEffectiveDuration;
    }
    setProgress(pos * 100);
  };

  // Sync background audio with main playback
  useEffect(() => {
    if (audioRef.current && audioTracks.length > 0) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioTracks.length]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = Math.max(0, Math.min(1, volumeLevel));
    }
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = Math.max(0, Math.min(1, volumeLevel));
    }
  }, [isMuted, volumeLevel]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // If autoplay with audio is blocked, force muted playback for reliable preview.
          setIsMuted(true);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(e => console.log("Video play failed", e));
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, activePreviewId]);

  useEffect(() => {
    if (selectedEffect === 'none') {
      setPreviewOpacity(1);
      setPreviewZoom(1);
      return;
    }
    if (selectedEffect === 'fade-in') {
      setPreviewOpacity(0);
    } else {
      setPreviewOpacity(1);
    }

    if (selectedEffect !== 'zoom') {
      setPreviewZoom(1);
    }
  }, [selectedEffect, activePreviewId]);

  useEffect(() => {
    if (!videoRef.current) return;
    const effectSpeed = selectedEffect === 'slow-motion' ? slowMotionSpeed : 1;
    const manualSpeed = Math.abs(speedValue - 1) > 0.001 ? speedValue : effectSpeed;
    const resolvedSpeed = Math.max(0.1, Math.min(3, manualSpeed));
    videoRef.current.playbackRate = resolvedSpeed;
  }, [selectedEffect, slowMotionSpeed, speedValue, activePreviewId]);

  useEffect(() => {
    const activeItem = mediaItems.find((i) => i.id === activePreviewId);
    if (!activeItem || activeItem.type !== 'video' || !videoRef.current) return;
    const trim = getTrimRangeForItem(activeItem.id, activeItem.duration);
    if (videoRef.current.currentTime < trim.start || videoRef.current.currentTime > trim.end) {
      videoRef.current.currentTime = trim.start;
    }
  }, [activePreviewId, mediaItems, getTrimRangeForItem, clipTrimRanges]);

  useEffect(() => {
    const activeCanvasMode = CANVAS_PREVIEW_EFFECTS.includes(selectedEffect)
      ? selectedEffect
      : CANVAS_PREVIEW_FILTERS.includes(selectedFilter)
      ? selectedFilter
      : null;

    if (!activeCanvasMode) {
      if (greenScreenAnimationRef.current !== null) {
        cancelAnimationFrame(greenScreenAnimationRef.current);
        greenScreenAnimationRef.current = null;
      }
      previousFrameRef.current = null;
      return;
    }

    const video = videoRef.current;
    const canvas = greenScreenCanvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGreenScreen = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (activeCanvasMode === 'green-screen') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (g > 120 && Math.abs(r - b) < 40) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }

        if (activeCanvasMode === 'glitch') {
          for (let i = 0; i < glitchIntensity * 30; i++) {
            const x = (Math.sin(Date.now() * 0.01 + i) + 1) * canvas.width * 0.5;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
            ctx.fillRect(x, y, 3, 1);
          }
        }

        if (activeCanvasMode === 'vintage') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Old-film wash: warmer lows + reduced saturation.
            data[i] = r * 0.7 + 20;
            data[i + 1] = g * 0.6 + 15;
            data[i + 2] = b * 0.5 + 10;

            const grain = (Math.random() - 0.5) * 30;
            data[i] = Math.max(0, Math.min(255, data[i] + grain));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
          }

          ctx.putImageData(imageData, 0, 0);
        }

        if (activeCanvasMode === 'soft-glow') {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.filter = 'blur(2px) brightness(1.1)';
          ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          ctx.filter = 'none';
        }

        if (activeCanvasMode === 'retro-film') {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            data[i + 2] = data[i + 2] * 0.85;
            data[i + 1] = Math.min(255, data[i + 1] * 1.05);

            if (Math.random() < 0.001) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
            }
          }

          ctx.putImageData(imageData, 0, 0);

          ctx.save();
          ctx.strokeStyle = 'rgba(0,0,0,0.08)';
          ctx.lineWidth = 1;
          for (let y = 0; y < canvas.height; y += 4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
          ctx.restore();
        }

        // Transition previews are handled by per-clip transition overlay,
        // not by global effect canvas rendering.

        if (activeCanvasMode === 'text-animation' && overlayText.trim().length > 0) {
          const textProgress = (video.currentTime * 2) % 2;
          const scale = 1 + Math.sin(textProgress * Math.PI) * 0.3;
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 64px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 20;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(scale, scale);
          ctx.fillText(overlayText, 0, 0);
          ctx.restore();
        }

        if (activeCanvasMode === 'motion-tracking') {
          const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (previousFrameRef.current) {
            const currentData = currentFrame.data;
            const prevData = previousFrameRef.current.data;
            const step = 80;
            for (let y = 0; y < canvas.height; y += step) {
              for (let x = 0; x < canvas.width; x += step) {
                const idx = (y * canvas.width + x) * 4;
                const motion = Math.abs(currentData[idx] - prevData[idx]) + Math.abs(currentData[idx + 1] - prevData[idx + 1]) + Math.abs(currentData[idx + 2] - prevData[idx + 2]);
                if (motion > 70) {
                  ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.8, motion / 255)})`;
                  ctx.beginPath();
                  ctx.arc(x, y, 10, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            }
          }
          previousFrameRef.current = currentFrame;
        }
      }

      if (isPlaying) {
        greenScreenAnimationRef.current = requestAnimationFrame(drawGreenScreen);
      }
    };

    drawGreenScreen();

    return () => {
      if (greenScreenAnimationRef.current !== null) {
        cancelAnimationFrame(greenScreenAnimationRef.current);
        greenScreenAnimationRef.current = null;
      }
    };
  }, [selectedEffect, selectedFilter, isPlaying, activePreviewId, glitchIntensity, overlayText]);

  // Keep timeline thumbnail videos in sync with the main preview transport state.
  useEffect(() => {
    mediaItems.forEach((item) => {
      if (item.type !== 'video') return;
      const thumbVideo = thumbnailVideoRefs.current[item.id];
      if (!thumbVideo) return;

      if (isPlaying && activePreviewId === item.id) {
        thumbVideo.play().catch(() => { });
      } else {
        thumbVideo.pause();
      }
    });
  }, [isPlaying, activePreviewId, mediaItems]);

  useEffect(() => {
    if (!transitionOverlay) return;

    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - transitionOverlay.startAt;
      const p = Math.min(1, elapsed / transitionOverlay.durationMs);
      setTransitionProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTransitionOverlay(null);
        setTransitionProgress(0);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [transitionOverlay]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let progressInterval: ReturnType<typeof setInterval>;
    const activeItem = mediaItems.find(i => i.id === activePreviewId);

    if (isPlaying && activeItem?.type === 'image') {
      const startTime = Date.now();
      const imageDuration = (activeItem.duration || 3) * 1000;

      progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const activeIndex = mediaItems.findIndex(i => i.id === activePreviewId);
        const timeBefore = mediaItems.slice(0, activeIndex).reduce((acc, item) => acc + item.duration, 0);
        const totalDuration = mediaItems.reduce((acc, item) => acc + item.duration, 0);

        const globalTime = timeBefore + Math.min(elapsed / 1000, activeItem.duration);
        const p = (globalTime / (totalDuration || 1)) * 100;
        setProgress(Math.min(p, 100) || 0);
        const localProgress = Math.min(1, (elapsed / 1000) / Math.max(0.01, activeItem.duration));
        setKeyframeProgress(localProgress);
      }, 100);

      timer = setTimeout(() => {
        playNextMedia();
      }, imageDuration);
    }
    return () => {
      clearTimeout(timer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isPlaying, activePreviewId, mediaItems, playNextMedia]);

  useEffect(() => {
    if (location.state && typeof location.state === 'object') {
      const state = location.state as any;
      const { initialMedia, initialAudio } = state;

      if (initialMedia && (initialMedia.file || initialMedia.preview)) {
        const preview = initialMedia.file
          ? URL.createObjectURL(initialMedia.file)
          : initialMedia.preview;

        if (initialMedia.file && preview) {
          createdPreviewUrlsRef.current.push(preview);
        }

        const initialType = initialMedia.type || 'video' as const;
        getMediaDurationFromPreview(preview, initialType).then((resolvedDuration) => {
          const newItem = {
            id: 'initial',
            file: initialMedia.file || null,
            preview,
            type: initialType,
            duration: resolvedDuration,
          };
          setMediaItems([newItem]);
          setActivePreviewId('initial');
          // Initialize undo history with initial state
          setHistory([JSON.stringify([newItem])]);
          setHistoryIndex(0);
        });
      }

      if (initialAudio && initialAudio.file) {
        setAudioTracks([{
          id: 'initial-audio',
          name: initialAudio.name,
          type: initialAudio.type || 'direct',
          file: initialAudio.file
        }]);
      }
    }
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
    if (aspectRatio === '21:9') return 21 / 9;
    if (aspectRatio === 'Custom') return customFrame.width / customFrame.height;
    return 16 / 9;
  };

  const getPreviewCssFilter = () => {
    if (selectedEffect === 'blur') return `blur(${blurAmount}px)`;
    if (selectedEffect === 'color-correction') return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation})`;
    return 'none';
  };

  const getPreviewFilterCss = () => {
    if (selectedEffect === 'black-white') return 'grayscale(1)';
    if (selectedEffect === 'cinematic') return 'contrast(1.4) brightness(1.1) saturate(1.2)';
    if (selectedEffect === 'warm') return 'sepia(0.22) saturate(1.15) hue-rotate(-10deg)';
    if (selectedEffect === 'cool') return 'saturate(1.08) hue-rotate(18deg)';
    if (selectedEffect === 'sepia') return 'sepia(1)';
    if (selectedEffect === 'hdr') return 'contrast(1.6) brightness(1.2) saturate(1.4)';
    if (selectedEffect === 'vivid') return 'contrast(1.3) brightness(1.1) saturate(2.5)';

    if (selectedFilter === 'black-white') return 'grayscale(1)';
    if (selectedFilter === 'cinematic') return 'contrast(1.4) brightness(1.1) saturate(1.2)';
    if (selectedFilter === 'warm') return 'sepia(0.22) saturate(1.15) hue-rotate(-10deg)';
    if (selectedFilter === 'cool') return 'saturate(1.08) hue-rotate(18deg)';
    if (selectedFilter === 'sepia') return 'sepia(1)';
    if (selectedFilter === 'hdr') return 'contrast(1.6) brightness(1.2) saturate(1.4)';
    if (selectedFilter === 'vivid') return 'contrast(1.3) brightness(1.1) saturate(2.5)';

    return 'none';
  };

  const getCombinedPreviewFilterCss = () => {
    const effectFilter = getPreviewCssFilter();
    const filterFilter = getPreviewFilterCss();
    if (effectFilter !== 'none' && filterFilter !== 'none') return `${effectFilter} ${filterFilter}`;
    if (effectFilter !== 'none') return effectFilter;
    if (filterFilter !== 'none') return filterFilter;
    return 'none';
  };

  const getCropInsets = () => {
    const halfW = cropWidthPct / 2;
    const halfH = cropHeightPct / 2;
    const left = Math.max(0, Math.min(100, cropCenterX - halfW));
    const right = Math.max(0, Math.min(100, 100 - (cropCenterX + halfW)));
    const top = Math.max(0, Math.min(100, cropCenterY - halfH));
    const bottom = Math.max(0, Math.min(100, 100 - (cropCenterY + halfH)));
    return { left, right, top, bottom };
  };

  const getPreviewClipPath = () => {
    const insets = getCropInsets();
    if (
      Math.abs(insets.left) < 0.001 &&
      Math.abs(insets.right) < 0.001 &&
      Math.abs(insets.top) < 0.001 &&
      Math.abs(insets.bottom) < 0.001
    ) {
      return 'none';
    }
    return `inset(${insets.top}% ${insets.right}% ${insets.bottom}% ${insets.left}%)`;
  };

  const getPreviewTransform = () => {
    const zoomScale = selectedEffect === 'zoom' ? previewZoom : 1;
    let keyframeScale = 1;
    if (keyframeMode === 'zoom-in') {
      keyframeScale = 1 + (keyframeAmount - 1) * keyframeProgress;
    } else if (keyframeMode === 'zoom-out') {
      keyframeScale = keyframeAmount - (keyframeAmount - 1) * keyframeProgress;
    } else if (keyframeMode === 'pulse') {
      keyframeScale = 1 + (keyframeAmount - 1) * Math.sin(keyframeProgress * Math.PI);
    }
    return `scale(${zoomScale * zoomToolAmount * keyframeScale}) rotate(${rotationDegrees}deg)`;
  };

  const activeTrim = activePreviewItem && activePreviewItem.type === 'video'
    ? getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration)
    : null;

  const hasTrimApplied = activeTrim
    ? activeTrim.start > 0 || (activeTrim.end < (activePreviewItem?.duration || 0) - 0.01)
    : false;

  // -- Handlers --
  const toggleOption = (option: keyof typeof aiOptions) => {
    setAiOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const copyActiveClip = () => {
    if (!activePreviewId) return;

    setMediaItems((prev) => {
      const index = prev.findIndex((item) => item.id === activePreviewId);
      if (index === -1) return prev;

      const source = prev[index];
      const nextId = Math.random().toString(36).substr(2, 9);
      const preview = source.file ? URL.createObjectURL(source.file) : source.preview;

      if (source.file) {
        createdPreviewUrlsRef.current.push(preview);
      }

      const copyItem = {
        ...source,
        id: nextId,
        preview,
      };

      const updated = [...prev];
      updated.splice(index + 1, 0, copyItem);
      saveToUndo(updated);
      setActivePreviewId(nextId);
      return updated;
    });
  };

  const handleMediaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = await Promise.all(files.map(async file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
      duration: await getMediaDuration(file)
    })));

    setActivePreviewId(newItems[0].id);
    setIsPlaying(false);

    setMediaItems(prev => {
      // Clear out initial empty placeholder if dragging in first real item
      const filteredPrev = prev.filter(p => p.id !== 'initial' || p.file !== null);
      const updated = [...filteredPrev, ...newItems];
      saveToUndo(updated);
      return updated;
    });

    if (e.target) {
      e.target.value = '';
    }
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
    input.accept = type === 'extracted' ? 'video/*' : 'audio/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setAudioTracks(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type,
          file
        }]);
      }
      setShowAudioChoice(false);
    };
    input.click();
  };

  const removeAudioTrack = (id: string) => {
    setAudioTracks(prev => prev.filter(t => t.id !== id));
  };

  const applyTransitionForActiveClip = (transition: TransitionType) => {
    if (!activePreviewId) return;

    setClipTransitions((prev) => ({ ...prev, [activePreviewId]: transition }));

    const currentIndex = mediaItems.findIndex((item) => item.id === activePreviewId);
    if (currentIndex !== -1 && currentIndex < mediaItems.length - 1) {
      const nextId = mediaItems[currentIndex + 1].id;
      setTransitionOverlay({
        fromId: activePreviewId,
        toId: nextId,
        type: transition,
        startAt: performance.now(),
        durationMs: 1400,
      });
      setTransitionProgress(0);
      setActivePreviewId(nextId);
    }

    setIsTransitionsOpen(false);
  };

  const handleGenerate = () => {
    const effectSettings = {
      blurAmount,
      brightness,
      contrast,
      saturation,
      slowMotionSpeed,
      glitchIntensity,
      animatedText: overlayText.trim().length > 0 ? overlayText : animatedText,
    };

    const mediaForProcessing = mediaItems
      .filter((item) => item.file)
      .map((item) => ({
        id: item.id,
        file: item.file,
        type: item.type,
        duration: item.duration,
      }));

    const transitionPlan = mediaForProcessing.map((item, index) => ({
      index,
      transition: clipTransitions[item.id] || 'none',
    }));

    const audioForProcessing = audioTracks
      .filter((track) => track.file)
      .map((track) => ({
        id: track.id,
        name: track.name,
        type: track.type,
        file: track.file,
      }));

    const editorSelections = {
      style: {
        selected: selectedStyle,
        aspectRatio,
        fps,
        exportQuality,
        watermark,
      },
      effect: {
        selected: selectedEffect,
        enabled: selectedEffect !== 'none',
        settings: effectSettings,
      },
      transitions: {
        transitionPlan,
        clipTransitions,
      },
      filters: {
        enabled: selectedFilter !== 'none' || selectedEffect === 'color-correction',
        selected: selectedFilter,
        brightness,
        contrast,
        saturation,
      },
      speed: {
        enabled: Math.abs(speedValue - 1) > 0.001 || selectedEffect === 'slow-motion',
        value: speedValue,
      },
      trim: {
        enabled: Object.keys(clipTrimRanges).length > 0,
        activeClipId: activePreviewId,
        start: activePreviewId ? (clipTrimRanges[activePreviewId]?.start ?? 0) : 0,
        end: activePreviewId ? (clipTrimRanges[activePreviewId]?.end ?? null) : null,
        clipRanges: clipTrimRanges,
      },
      textOverlay: {
        enabled: overlayText.trim().length > 0,
        text: overlayText,
        fontId: overlayFontId,
        fontFamily: textFontOptions.find((f) => f.id === overlayFontId)?.family || textFontOptions[0].family,
        fontSize: overlayFontSize,
        color: overlayColor,
        position: {
          x: overlayPosX,
          y: overlayPosY,
        },
      },
      rotate: {
        enabled: rotationDegrees % 360 !== 0,
        degrees: rotationDegrees,
      },
      volume: {
        muted: isMuted,
        level: isMuted ? 0 : volumeLevel,
      },
      zoom: {
        enabled: zoomToolAmount > 1.001 || selectedEffect === 'zoom',
        mode: 'in',
        amount: zoomToolAmount,
      },
      crop: {
        enabled:
          cropWidthPct < 99.99 ||
          cropHeightPct < 99.99 ||
          Math.abs(cropCenterX - 50) > 0.01 ||
          Math.abs(cropCenterY - 50) > 0.01,
        centerX: cropCenterX,
        centerY: cropCenterY,
        widthPct: cropWidthPct,
        heightPct: cropHeightPct,
      },
      keyframe: {
        enabled: keyframeMode !== 'none',
        mode: keyframeMode,
        amount: keyframeAmount,
        points:
          keyframeMode === 'none'
            ? []
            : [
                { time: 0, value: keyframeMode === 'zoom-out' ? keyframeAmount : 1 },
                { time: 1, value: keyframeMode === 'zoom-in' ? keyframeAmount : 1 },
              ],
      },
      aiOptions,
      prompt,
      media: {
        items: mediaForProcessing.map((item) => ({ id: item.id, type: item.type, duration: item.duration })),
        count: mediaForProcessing.length,
      },
      audio: {
        tracks: audioForProcessing.map((track) => ({ id: track.id, name: track.name, type: track.type })),
        count: audioForProcessing.length,
      },
    };

    saveToHistory({
      title: `${mediaItems.length > 0 ? mediaItems.length + ' Media Items' : 'Quick Edit'} • ${editingStyles.find(s => s.id === selectedStyle)?.title || selectedStyle}`,
      tool: 'quick-edit',
      config: {
        style: selectedStyle,
        ratio: aspectRatio,
        fps,
        exportQuality,
        watermark,
        aiOptions,
        selectedEffect,
        effectSettings,
        transitionPlan,
        editorSelections,
      }
    });
    navigate("/quick-edit/processing", {
      state: {
        selectedStyle,
        aspectRatio,
        fps,
        exportQuality,
        watermark,
        aiOptions,
        prompt,
        selectedEffect,
        selectedFilter,
        effectSettings,
        transitionPlan,
        editorSelections,
        mediaItems: mediaForProcessing,
        audioTracks: audioForProcessing,
      },
    });
  };

  const getTransitionLayerStyle = (
    layer: 'from' | 'to',
    type: TransitionType,
    p: number
  ): React.CSSProperties => {
    const isFrom = layer === 'from';
    const base: React.CSSProperties = { opacity: 1, transform: 'none', filter: 'none' };

    if (type === 'cross-dissolve') {
      base.opacity = isFrom ? 1 - p : p;
    } else if (type === 'slide-left') {
      base.transform = isFrom ? `translateX(${-p * 100}%)` : `translateX(${(1 - p) * 100}%)`;
    } else if (type === 'slide-right') {
      base.transform = isFrom ? `translateX(${p * 100}%)` : `translateX(${-(1 - p) * 100}%)`;
    } else if (type === 'zoom-transition') {
      base.opacity = isFrom ? 1 - p : p;
      base.transform = isFrom ? `scale(${1 + p * 0.25})` : `scale(${1.25 - p * 0.25})`;
    } else if (type === 'blur-transition') {
      base.opacity = isFrom ? 1 - p : p;
      base.filter = `blur(${isFrom ? p * 10 : (1 - p) * 10}px)`;
    } else if (type === 'spin-transition') {
      base.opacity = isFrom ? 1 - p : p;
      base.transform = `rotate(${isFrom ? -120 * p : 120 * (1 - p)}deg) scale(${isFrom ? 1 - p * 0.15 : 0.85 + p * 0.15})`;
    } else if (type === 'glitch-transition') {
      const jitter = Math.sin(p * 80) * (isFrom ? 6 : 4);
      base.opacity = isFrom ? 1 - p : p;
      base.transform = `translateX(${jitter}px)`;
      base.filter = `contrast(${1.2 + p}) saturate(${1.1 + p * 0.7}) hue-rotate(${isFrom ? p * 45 : (1 - p) * 45}deg)`;
    } else if (type === 'flash-transition') {
      base.opacity = isFrom ? 1 - p : p;
    } else if (type === 'dip-black' || type === 'dip-white') {
      base.opacity = isFrom ? (p < 0.5 ? 1 - p * 2 : 0) : (p < 0.5 ? 0 : (p - 0.5) * 2);
    }

    return base;
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

        <div className="flex items-center gap-3 z-50">
          <Dialog open={isAdvancedConfigOpen} onOpenChange={setIsAdvancedConfigOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-300">Advanced Config</span>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[#0b0d1f]/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-[425px] rounded-3xl shadow-2xl z-[100]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
                  <Settings2 className="w-5 h-5 text-cyan-400" />
                  Production Settings
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-6 font-sans">
                {/* Export Quality */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Export Quality</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['720p', '1080p', '4K'].map((res) => {
                      const isPremium = res === '4K';
                      return (
                        <button
                          key={res}
                          onClick={() => isPremium ? handlePremiumIntercept("4k") : setExportQuality(res)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${exportQuality === res
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                            }`}
                        >
                          <span>{res}</span>
                          {isPremium && (
                            <div className="flex items-center gap-1 text-[8px] text-amber-500">
                              <Crown className="w-2 h-2" />
                              <span>PREMIUM</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frame Rate */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" /> Target Frame Rate
                  </label>
                  <div className="flex gap-2">
                    {[24, 30, 60].map((f) => {
                      const isPremium = f === 60;
                      return (
                        <button
                          key={f}
                          onClick={() => isPremium ? handlePremiumIntercept("60fps") : setFps(f)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex flex-col items-center gap-1 ${fps === f
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                            }`}
                        >
                          <span>{f} FPS</span>
                          {isPremium && (
                            <div className="flex items-center gap-1 text-[8px] text-amber-500">
                              <Crown className="w-2 h-2" />
                              <span>PREMIUM</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Watermark Toggle */}
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Production Watermark</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Branded: VIREONIX</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-md text-amber-500 text-[8px] font-black uppercase tracking-widest">
                        <Crown className="w-3 h-3" />
                        <span>PREMIUM TO REMOVE</span>
                      </div>
                      <button
                        onClick={() => handlePremiumIntercept("watermark")}
                        className={`w-12 h-6 rounded-full relative transition-all bg-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.3)]`}
                      >
                        <div className={`absolute top-1 right-1 w-4 h-4 rounded-full bg-white transition-all`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                  onClick={() => setIsAdvancedConfigOpen(false)}
                  className="px-8 bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all py-6 h-auto"
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <motion.button
            onClick={() => setIsHistoryOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2 transition-colors z-50"
          >
            <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
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



            {/* Quick Action Icons [NEW] */}
            <div className="space-y-3 pt-2">
              <label className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">Quick Tools</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'effects', icon: Sparkle, label: 'Effects', color: 'text-amber-300' },
                  { id: 'transitions', icon: Layers, label: 'Transitions', color: 'text-cyan-300' },
                  { id: 'filters', icon: Palette, label: 'Filters', color: 'text-pink-300' },
                  { id: 'speed', icon: Timer, label: 'Speed', color: 'text-cyan-300' },
                  { id: 'trim', icon: Scissors, label: 'Trim', color: 'text-green-300' },
                  { id: 'copy', icon: Copy, label: 'Copy', color: 'text-blue-300' },
                  { id: 'text-tool', icon: Type, label: 'Text', color: 'text-purple-300' },
                  { id: 'rotate', icon: RotateCw, label: 'Rotate', color: 'text-teal-300' },
                  { id: 'volume', icon: Volume2, label: 'Volume', color: 'text-indigo-300' },
                  { id: 'crop', icon: Crop, label: 'Crop', color: 'text-red-300' },
                  { id: 'zoom', icon: ZoomIn, label: 'Zoom', color: 'text-yellow-300' },
                  { id: 'keyframe', icon: MonitorPlay, label: 'Keyframe', color: 'text-emerald-300' },
                ].map((tool, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if ((tool as any).id === 'effects') {
                        setIsEffectsOpen(true);
                      }
                      if ((tool as any).id === 'filters') {
                        setIsFiltersOpen(true);
                      }
                      if ((tool as any).id === 'transitions') {
                        setIsTransitionsOpen(true);
                      }
                      if ((tool as any).id === 'text-tool') {
                        setIsTextToolOpen(true);
                      }
                      if ((tool as any).id === 'speed') {
                        setIsSpeedOpen(true);
                      }
                      if ((tool as any).id === 'trim') {
                        setIsTrimOpen(true);
                      }
                      if ((tool as any).id === 'rotate') {
                        setIsRotateOpen(true);
                      }
                      if ((tool as any).id === 'volume') {
                        setIsVolumeOpen(true);
                      }
                      if ((tool as any).id === 'crop') {
                        setIsCropOpen(true);
                      }
                      if ((tool as any).id === 'zoom') {
                        setIsZoomOpen(true);
                      }
                      if ((tool as any).id === 'copy') {
                        copyActiveClip();
                      }
                      if ((tool as any).id === 'keyframe') {
                        setIsKeyframeOpen(true);
                      }
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all group"
                  >
                    <tool.icon className={`w-5 h-5 ${tool.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[8px] font-bold text-slate-200 uppercase tracking-widest">{tool.label}</span>
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
              ref={previewFrameRef}
              layout
              animate={{
                aspectRatio: getRatioValue()
              }}
              onClick={(e) => {
                if (!isTextPlacementMode || !previewFrameRef.current) return;
                const rect = previewFrameRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setOverlayPosX(Math.max(0, Math.min(100, x)));
                setOverlayPosY(Math.max(0, Math.min(100, y)));
                setIsTextPlacementMode(false);
              }}
              className={`relative h-full max-w-4xl max-h-[85%] rounded-2xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden shadow-cyan-500/5 flex items-center justify-center transition-all duration-500 ${isTextPlacementMode ? 'cursor-crosshair' : 'cursor-default'}`}
            >
              <AnimatePresence mode="popLayout">
                {activePreviewId && mediaItems.find(i => i.id === activePreviewId) ? (
                  <motion.div
                    key={activePreviewId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    {mediaItems.find(i => i.id === activePreviewId)?.type === 'video' ? (
                      <>
                        <video
                          ref={videoRef}
                          onTimeUpdate={handleTimeUpdate}
                          onEnded={playNextMedia}
                          onLoadedMetadata={() => {
                            if (selectedEffect === 'fade-in') {
                              setPreviewOpacity(0);
                            } else {
                              setPreviewOpacity(1);
                            }
                            if (selectedEffect !== 'zoom') {
                              setPreviewZoom(1);
                            }
                          }}
                          onCanPlay={(e) => {
                            if (isPlaying) e.currentTarget.play().catch(() => { });
                          }}
                          src={mediaItems.find(i => i.id === activePreviewId)?.preview}
                          className={CANVAS_PREVIEW_EFFECTS.includes(selectedEffect) || CANVAS_PREVIEW_FILTERS.includes(selectedFilter) ? 'hidden' : 'w-full h-full object-contain'}
                          style={{
                            opacity: selectedEffect === 'fade-in' ? previewOpacity : 1,
                            filter: getCombinedPreviewFilterCss(),
                            transform: getPreviewTransform(),
                            clipPath: getPreviewClipPath(),
                            transformOrigin: 'center center'
                          }}
                          muted={isMuted}
                          playsInline
                          loop={false}
                        />
                        {(CANVAS_PREVIEW_EFFECTS.includes(selectedEffect) || CANVAS_PREVIEW_FILTERS.includes(selectedFilter)) && (
                          <canvas
                            ref={greenScreenCanvasRef}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        <img
                          src={mediaItems.find(i => i.id === activePreviewId)?.preview}
                          className="w-full h-full object-contain"
                          style={{
                            opacity: selectedEffect === 'fade-in' ? previewOpacity : 1,
                            filter: getCombinedPreviewFilterCss(),
                            transform: getPreviewTransform(),
                            clipPath: getPreviewClipPath(),
                            transformOrigin: 'center center'
                          }}
                          alt="Preview"
                        />
                        {audioUrl && (
                          <audio
                            ref={audioRef}
                            src={audioUrl}
                            muted={isMuted}
                            className="hidden"
                          />
                        )}
                      </>
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

              {transitionOverlay && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  {(() => {
                    const fromItem = mediaItems.find((m) => m.id === transitionOverlay.fromId);
                    const toItem = mediaItems.find((m) => m.id === transitionOverlay.toId);
                    if (!fromItem || !toItem) return null;

                    const transitionFilter = getCombinedPreviewFilterCss();
                    const fromStyle = {
                      ...getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress),
                      filter: transitionFilter !== 'none'
                        ? `${getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter === 'none' ? '' : `${getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter} `}${transitionFilter}`.trim()
                        : getTransitionLayerStyle('from', transitionOverlay.type, transitionProgress).filter,
                    };
                    const toStyle = {
                      ...getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress),
                      filter: transitionFilter !== 'none'
                        ? `${getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter === 'none' ? '' : `${getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter} `}${transitionFilter}`.trim()
                        : getTransitionLayerStyle('to', transitionOverlay.type, transitionProgress).filter,
                    };

                    return (
                      <>
                        <div className="absolute inset-0" style={fromStyle}>
                          {fromItem.type === 'video' ? (
                            <video src={fromItem.preview} className="w-full h-full object-contain" muted playsInline autoPlay loop />
                          ) : (
                            <img src={fromItem.preview} className="w-full h-full object-contain" alt="Transition from" />
                          )}
                        </div>
                        <div className="absolute inset-0" style={toStyle}>
                          {toItem.type === 'video' ? (
                            <video src={toItem.preview} className="w-full h-full object-contain" muted playsInline autoPlay loop />
                          ) : (
                            <img src={toItem.preview} className="w-full h-full object-contain" alt="Transition to" />
                          )}
                        </div>
                        {(transitionOverlay.type === 'dip-black' || transitionOverlay.type === 'dip-white' || transitionOverlay.type === 'flash-transition') && (
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                transitionOverlay.type === 'dip-white' || transitionOverlay.type === 'flash-transition'
                                  ? '#ffffff'
                                  : '#000000',
                              opacity:
                                transitionOverlay.type === 'flash-transition'
                                  ? Math.max(0, 1 - Math.abs(transitionProgress - 0.5) * 4)
                                  : transitionProgress < 0.5
                                    ? transitionProgress * 2
                                    : (1 - transitionProgress) * 2,
                            }}
                          />
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {selectedEffect !== 'text-animation' && overlayText.trim().length > 0 && (
                <div
                  className="absolute z-40 pointer-events-none select-none"
                  style={{
                    left: `${overlayPosX}%`,
                    top: `${overlayPosY}%`,
                    transform: 'translate(-50%, -50%)',
                    fontFamily: textFontOptions.find((f) => f.id === overlayFontId)?.family || textFontOptions[0].family,
                    fontSize: `${overlayFontSize}px`,
                    color: overlayColor,
                    textShadow: '0 4px 14px rgba(0,0,0,0.8)',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    textAlign: 'center',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '88%',
                  }}
                >
                  {overlayText}
                </div>
              )}

              {/* HUD Overlays */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="px-2.5 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-black uppercase leading-none mb-0.5">Frame Mode</span>
                    <span className="text-[10px] text-cyan-400 font-bold leading-none">{aspectRatio} • {fps}FPS</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[70%] z-40">
                {Math.abs(speedValue - 1) > 0.001 && (
                  <div className="px-2 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-black uppercase tracking-widest text-cyan-200">
                    Speed {speedValue.toFixed(2)}x
                  </div>
                )}
                {hasTrimApplied && activeTrim && (
                  <div className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                    Trim {activeTrim.start.toFixed(2)}s-{activeTrim.end.toFixed(2)}s
                  </div>
                )}
                {rotationDegrees % 360 !== 0 && (
                  <div className="px-2 py-1 rounded-md bg-teal-500/20 border border-teal-400/40 text-[9px] font-black uppercase tracking-widest text-teal-200">
                    Rotate {rotationDegrees}°
                  </div>
                )}
                {(isMuted || Math.abs(volumeLevel - 1) > 0.001) && (
                  <div className="px-2 py-1 rounded-md bg-indigo-500/20 border border-indigo-400/40 text-[9px] font-black uppercase tracking-widest text-indigo-200">
                    {isMuted ? 'Muted' : `Volume ${Math.round(volumeLevel * 100)}%`}
                  </div>
                )}
                {(cropWidthPct < 99.99 || cropHeightPct < 99.99) && (
                  <div className="px-2 py-1 rounded-md bg-red-500/20 border border-red-400/40 text-[9px] font-black uppercase tracking-widest text-red-200">
                    Crop {Math.round(cropWidthPct)}% x {Math.round(cropHeightPct)}%
                  </div>
                )}
                {zoomToolAmount > 1.001 && (
                  <div className="px-2 py-1 rounded-md bg-yellow-500/20 border border-yellow-400/40 text-[9px] font-black uppercase tracking-widest text-yellow-200">
                    Zoom {zoomToolAmount.toFixed(2)}x
                  </div>
                )}
                {keyframeMode !== 'none' && (
                  <div className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[9px] font-black uppercase tracking-widest text-emerald-200">
                    Keyframe {keyframeMode}
                  </div>
                )}
              </div>

              {/* Transport Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
                <button className="text-slate-400 hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-[#0b0d1f] hover:scale-105 transition-all">
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Media Sequence</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={undo}
                      disabled={historyIndex <= 0}
                      className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-1 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Redo2 className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <div className="w-[1px] h-3 bg-white/5 mx-1" />
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1 rounded hover:bg-white/5 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  </div>
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
                    onClick={() => triggerClipTransition(item.id)}
                    style={{ aspectRatio: getRatioValue() }}
                    className={`group relative flex-none h-full rounded-xl border transition-all cursor-pointer overflow-hidden ring-1 shadow-xl ${activePreviewId === item.id
                      ? 'border-cyan-500 ring-cyan-500/50 scale-[1.02] shadow-cyan-500/10'
                      : 'border-white/10 bg-slate-900 ring-white/5 hover:border-white/30'
                      }`}
                  >
                      {item.type === 'video' ? (
                        <video
                          ref={(el) => {
                            thumbnailVideoRefs.current[item.id] = el;
                          }}
                          src={item.preview}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          autoPlay={activePreviewId === item.id && isPlaying}
                          loop={activePreviewId === item.id && isPlaying}
                          preload="metadata"
                        />
                      ) : (
                        <img src={item.preview} alt="" className="w-full h-full object-cover" />
                      )}
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
                    {!!clipTransitions[item.id] && clipTransitions[item.id] !== 'none' && (
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-[8px] font-black text-cyan-300 uppercase">
                        {clipTransitions[item.id]}
                      </div>
                    )}
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

          <div className="h-10 w-full relative group cursor-pointer" onClick={handleTimelineClick}>
            <div className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 transition-colors" />

            <div className="absolute inset-y-[2px] left-1 right-1 flex gap-[2px] pointer-events-none">
              {mediaItems.map((item, i) => {
                const totalDuration = mediaItems.reduce((acc, item) => acc + item.duration, 0);
                const widthPercent = (item.duration / (totalDuration || 1)) * 100;
                const isActive = activePreviewId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full transition-all duration-500 relative ${i === 0 ? 'rounded-l-lg' : ''} ${i === mediaItems.length - 1 ? 'rounded-r-lg' : ''} ${isActive
                      ? 'bg-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] border-x border-cyan-400/50 z-10'
                      : 'bg-white/5 border-x border-white/10'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTimelineGlow"
                        className="absolute inset-0 bg-cyan-400/10 blur-sm"
                      />
                    )}
                  </div>
                );
              })}
              {mediaItems.length === 0 && (
                <div className="flex-1 h-full bg-white/5 border border-dashed border-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">No Media Sequence</span>
                </div>
              )}
            </div>

            {/* Playhead */}
            <motion.div
              initial={false}
              animate={{ left: `${progress}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 bottom-0 w-[1px] bg-cyan-400 z-20 shadow-[0_0_15px_rgba(34,211,238,0.8)] pointer-events-none"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400" />
              <div className="absolute inset-y-0 left-[-1px] right-[-1px] bg-cyan-400/20 blur-[2px]" />
            </motion.div>
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

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[121] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsFiltersOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Filters</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Choose a visual filter</p>
                </div>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedFilter('none');
                    setIsFiltersOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'none' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  No Filter
                </button>
                <button
                  onClick={() => { setSelectedFilter('vintage'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'vintage' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Vintage (Old Film)
                </button>
                <button
                  onClick={() => { setSelectedFilter('black-white'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'black-white' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Black and White
                </button>
                <button
                  onClick={() => { setSelectedFilter('cinematic'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'cinematic' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Cinematic
                </button>
                <button
                  onClick={() => { setSelectedFilter('warm'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'warm' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Warm
                </button>
                <button
                  onClick={() => { setSelectedFilter('cool'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'cool' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Cool
                </button>
                <button
                  onClick={() => { setSelectedFilter('sepia'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'sepia' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => { setSelectedFilter('hdr'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'hdr' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  HDR
                </button>
                <button
                  onClick={() => { setSelectedFilter('vivid'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'vivid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Vivid
                </button>
                <button
                  onClick={() => { setSelectedFilter('soft-glow'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'soft-glow' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Soft Glow
                </button>
                <button
                  onClick={() => { setSelectedFilter('retro-film'); setIsFiltersOpen(false); }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedFilter === 'retro-film' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Retro Film (VHS)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEffectsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsEffectsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Effects</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Choose an effect for preview</p>
                </div>
                <button
                  onClick={() => setIsEffectsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedEffect('none');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'none' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  No Effect
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('fade-in');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'fade-in' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Fade In
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('blur');
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'blur' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Blur
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('zoom');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'zoom' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Zoom
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('color-correction');
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'color-correction' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Color Correction
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('green-screen');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'green-screen' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Green Screen
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('slow-motion');
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'slow-motion' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Slow Motion
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('glitch');
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'glitch' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Glitch
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('transition');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Transition
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('text-animation');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'text-animation' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Text Animation
                </button>
                <button
                  onClick={() => {
                    setSelectedEffect('motion-tracking');
                    setIsEffectsOpen(false);
                  }}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${selectedEffect === 'motion-tracking' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Motion Tracking
                </button>

                {selectedEffect === 'blur' && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-2">
                      <span>Blur Amount</span>
                      <span>{blurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                    <button
                      onClick={() => setIsEffectsOpen(false)}
                      className="mt-3 w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                    >
                      Apply Blur
                    </button>
                  </div>
                )}

                {selectedEffect === 'color-correction' && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                        <span>Brightness</span>
                        <span>{brightness.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                        <span>Contrast</span>
                        <span>{contrast.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                        <span>Saturation</span>
                        <span>{saturation.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <button
                      onClick={() => setIsEffectsOpen(false)}
                      className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                    >
                      Apply Color
                    </button>
                  </div>
                )}

                {selectedEffect === 'slow-motion' && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                      <span>Speed</span>
                      <span>{slowMotionSpeed.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={slowMotionSpeed}
                      onChange={(e) => setSlowMotionSpeed(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                    <button
                      onClick={() => setIsEffectsOpen(false)}
                      className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                    >
                      Apply Slow Motion
                    </button>
                  </div>
                )}

                {selectedEffect === 'glitch' && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                      <span>Glitch Intensity</span>
                      <span>{glitchIntensity.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.5}
                      value={glitchIntensity}
                      onChange={(e) => setGlitchIntensity(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                    <button
                      onClick={() => setIsEffectsOpen(false)}
                      className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                    >
                      Apply Glitch
                    </button>
                  </div>
                )}

                {selectedEffect === 'text-animation' && (
                  <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Overlay Text</label>
                    <input
                      value={animatedText}
                      onChange={(e) => {
                        setAnimatedText(e.target.value);
                        setOverlayText(e.target.value);
                      }}
                      placeholder="Enter text"
                      className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                      onClick={() => setIsEffectsOpen(false)}
                      className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                    >
                      Apply Text
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTransitionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[121] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsTransitionsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Transitions</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Assign transition to selected clip</p>
                </div>
                <button
                  onClick={() => setIsTransitionsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                {activePreviewId
                  ? `Selected Clip: ${activePreviewId.slice(0, 8)} • ${clipTransitions[activePreviewId] || 'none'}`
                  : 'Select a clip from Media Sequence first'}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => applyTransitionForActiveClip('cross-dissolve')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'cross-dissolve' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Cross Dissolve
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('slide-left')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'slide-left' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Slide Left
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('slide-right')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'slide-right' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Slide Right
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('dip-black')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'dip-black' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Dip to Black
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('dip-white')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'dip-white' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Dip to White
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('zoom-transition')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'zoom-transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Zoom Transition
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('blur-transition')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'blur-transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Blur Transition
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('spin-transition')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'spin-transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Spin Transition
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('glitch-transition')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'glitch-transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Glitch Transition
                </button>
                <button
                  onClick={() => applyTransitionForActiveClip('flash-transition')}
                  className={`w-full px-3 py-3 rounded-xl text-left text-[11px] font-bold uppercase tracking-widest transition-colors ${activePreviewId && clipTransitions[activePreviewId] === 'flash-transition' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}
                >
                  Flash Transition
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSpeedOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsSpeedOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Speed</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Control preview and export playback speed</p>
                </div>
                <button
                  onClick={() => setIsSpeedOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span>Playback Speed</span>
                  <span>{speedValue.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={2}
                  step={0.05}
                  value={speedValue}
                  onChange={(e) => setSpeedValue(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex gap-2">
                  {[0.5, 1, 1.25, 1.5, 2].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSpeedValue(preset)}
                      className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${Math.abs(speedValue - preset) < 0.001 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                      {preset}x
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsSpeedOpen(false)}
                  className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Apply Speed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTrimOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsTrimOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Trim</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Cut start/end for selected video clip</p>
                </div>
                <button
                  onClick={() => setIsTrimOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activePreviewItem?.type === 'video' ? (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    Clip Duration: {activePreviewItem.duration.toFixed(2)}s
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                      <span>Trim Start</span>
                      <span>{getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).start.toFixed(2)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, activePreviewItem.duration - 0.01)}
                      step={0.01}
                      value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).start}
                      onChange={(e) => {
                        const nextStart = Number(e.target.value);
                        const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                        const safeEnd = Math.max(nextStart + 0.01, current.end);
                        setClipTrimRanges((prev) => ({
                          ...prev,
                          [activePreviewItem.id]: {
                            start: nextStart,
                            end: Math.min(activePreviewItem.duration, safeEnd),
                          },
                        }));
                        if (videoRef.current) {
                          videoRef.current.currentTime = nextStart;
                        }
                      }}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                      <span>Trim End</span>
                      <span>{getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).end.toFixed(2)}s</span>
                    </div>
                    <input
                      type="range"
                      min={0.01}
                      max={activePreviewItem.duration}
                      step={0.01}
                      value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).end}
                      onChange={(e) => {
                        const nextEnd = Number(e.target.value);
                        const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                        setClipTrimRanges((prev) => ({
                          ...prev,
                          [activePreviewItem.id]: {
                            start: current.start,
                            end: Math.max(current.start + 0.01, nextEnd),
                          },
                        }));
                      }}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Start (s)</label>
                      <input
                        type="number"
                        min={0}
                        max={Math.max(0, activePreviewItem.duration - 0.01)}
                        step={0.01}
                        value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).start.toFixed(2)}
                        onChange={(e) => {
                          const nextStart = Number(e.target.value);
                          const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                          const safeStart = Math.max(0, Math.min(activePreviewItem.duration - 0.01, nextStart));
                          const safeEnd = Math.max(safeStart + 0.01, current.end);
                          setClipTrimRanges((prev) => ({
                            ...prev,
                            [activePreviewItem.id]: {
                              start: safeStart,
                              end: Math.min(activePreviewItem.duration, safeEnd),
                            },
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">End (s)</label>
                      <input
                        type="number"
                        min={0.01}
                        max={activePreviewItem.duration}
                        step={0.01}
                        value={getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration).end.toFixed(2)}
                        onChange={(e) => {
                          const nextEnd = Number(e.target.value);
                          const current = getTrimRangeForItem(activePreviewItem.id, activePreviewItem.duration);
                          const safeEnd = Math.max(current.start + 0.01, Math.min(activePreviewItem.duration, nextEnd));
                          setClipTrimRanges((prev) => ({
                            ...prev,
                            [activePreviewItem.id]: {
                              start: current.start,
                              end: safeEnd,
                            },
                          }));
                        }}
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activePreviewItem) {
                        setClipTrimRanges((prev) => ({
                          ...prev,
                          [activePreviewItem.id]: { start: 0, end: activePreviewItem.duration },
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Reset Trim
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Select a video clip to use trim.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRotateOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsRotateOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Rotate</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Rotate preview and export output</p>
                </div>
                <button
                  onClick={() => setIsRotateOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span>Rotation</span>
                  <span>{rotationDegrees}°</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotationDegrees(deg)}
                      className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${rotationDegrees === deg ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsRotateOpen(false)}
                  className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Apply Rotation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVolumeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsVolumeOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Volume</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Adjust preview and export volume</p>
                </div>
                <button
                  onClick={() => setIsVolumeOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={`w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${isMuted ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>

                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span>Volume Level</span>
                  <span>{Math.round(volumeLevel * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volumeLevel}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setVolumeLevel(next);
                    if (next > 0 && isMuted) {
                      setIsMuted(false);
                    }
                  }}
                  className="w-full accent-cyan-400"
                />

                <button
                  onClick={() => setIsVolumeOpen(false)}
                  className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Apply Volume
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCropOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsCropOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Crop</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Crop area for preview and export</p>
                </div>
                <button
                  onClick={() => setIsCropOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                    <span>Crop Width</span>
                    <span>{Math.round(cropWidthPct)}%</span>
                  </div>
                  <input type="range" min={30} max={100} step={1} value={cropWidthPct} onChange={(e) => setCropWidthPct(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                    <span>Crop Height</span>
                    <span>{Math.round(cropHeightPct)}%</span>
                  </div>
                  <input type="range" min={30} max={100} step={1} value={cropHeightPct} onChange={(e) => setCropHeightPct(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                    <span>Center X</span>
                    <span>{Math.round(cropCenterX)}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={cropCenterX} onChange={(e) => setCropCenterX(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                    <span>Center Y</span>
                    <span>{Math.round(cropCenterY)}%</span>
                  </div>
                  <input type="range" min={0} max={100} step={1} value={cropCenterY} onChange={(e) => setCropCenterY(Number(e.target.value))} className="w-full accent-cyan-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setCropWidthPct(100);
                      setCropHeightPct(100);
                      setCropCenterX(50);
                      setCropCenterY(50);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsCropOpen(false)}
                    className="px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                  >
                    Apply Crop
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsZoomOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Zoom</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Adjust zoom for preview and export</p>
                </div>
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  <span>Zoom Level</span>
                  <span>{zoomToolAmount.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={zoomToolAmount}
                  onChange={(e) => setZoomToolAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <button
                  onClick={() => setZoomToolAmount(1)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                >
                  Reset Zoom
                </button>
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Apply Zoom
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isKeyframeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[123] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setIsKeyframeOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Keyframe</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Animate motion over clip time</p>
                </div>
                <button
                  onClick={() => setIsKeyframeOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'zoom-in', label: 'Zoom In' },
                    { id: 'zoom-out', label: 'Zoom Out' },
                    { id: 'pulse', label: 'Pulse' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setKeyframeMode(preset.id as 'none' | 'zoom-in' | 'zoom-out' | 'pulse')}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${keyframeMode === preset.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">
                    <span>Strength</span>
                    <span>{keyframeAmount.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.05}
                    max={1.8}
                    step={0.05}
                    value={keyframeAmount}
                    onChange={(e) => setKeyframeAmount(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                    disabled={keyframeMode === 'none'}
                  />
                </div>

                <button
                  onClick={() => setIsKeyframeOpen(false)}
                  className="w-full px-3 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Apply Keyframe
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTextToolOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[122] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => {
              setIsTextToolOpen(false);
              setIsTextPlacementMode(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b0d1f]/95 shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Text Overlay</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Select font and place text in preview</p>
                </div>
                <button
                  onClick={() => {
                    setIsTextToolOpen(false);
                    setIsTextPlacementMode(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Text</label>
                  <Textarea
                    value={overlayText}
                    onChange={(e) => {
                      setOverlayText(e.target.value);
                      setAnimatedText(e.target.value);
                    }}
                    placeholder="Enter text"
                    className="mt-2 bg-black/30 border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Font</label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {textFontOptions.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setOverlayFontId(font.id)}
                        className={`px-3 py-2 rounded-lg text-left text-[10px] font-bold uppercase tracking-wide border transition-colors ${overlayFontId === font.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                        style={{ fontFamily: font.family }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Size</label>
                    <input
                      type="range"
                      min={18}
                      max={96}
                      value={overlayFontSize}
                      onChange={(e) => setOverlayFontSize(Number(e.target.value))}
                      className="w-full mt-2 accent-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Color</label>
                    <input
                      type="color"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="w-full mt-2 h-9 rounded-lg bg-transparent border border-white/10"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setIsTextPlacementMode(true);
                        setIsTextToolOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${isTextPlacementMode ? 'bg-cyan-500 text-[#0b0d1f] border-cyan-400' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                      {isTextPlacementMode ? 'Click Preview to Place' : 'Place on Preview'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">X Position</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overlayPosX}
                      onChange={(e) => setOverlayPosX(Number(e.target.value))}
                      className="w-full mt-2 accent-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Y Position</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overlayPosY}
                      onChange={(e) => setOverlayPosY(Number(e.target.value))}
                      className="w-full mt-2 accent-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setOverlayText('');
                      setAnimatedText('');
                      setIsTextPlacementMode(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/25 transition-colors"
                  >
                    Delete Text
                  </button>
                  <button
                    onClick={() => {
                      setIsTextToolOpen(false);
                      setIsTextPlacementMode(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-[#0b0d1f] text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors"
                  >
                    Apply Text Overlay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistoryDialog
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        onSelect={handleHistorySelect}
        currentTool="quick-edit"
      />

      <PremiumModal
        open={isPremiumModalOpen}
        onOpenChange={setIsPremiumModalOpen}
        feature={premiumFeature}
      />

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
