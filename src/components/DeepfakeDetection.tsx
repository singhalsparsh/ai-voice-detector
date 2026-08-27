"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileAudio,
  Mic,
  RotateCcw,
  Activity,
  Waves,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Gauge,
  Zap,
  Sparkles,
  Clock,
  Star,
  Image,
  Video,
  Music,
  ArrowRight,
  Play
} from "lucide-react";

type DetectionState = "upload" | "scanning" | "result" | "error";

interface DetectionMetrics {
  pitch_anomaly: number;
  spectral_centroid: number;
  mfcc_variance: number;
  zero_crossing_rate: number;
  spectral_rolloff: number;
  spectral_bandwidth: number;
  rms_energy: number;
}

interface DetectionResult {
  is_ai: boolean;
  confidence: number;
  metrics: DetectionMetrics;
  filename: string;
  duration_seconds: number;
  model_used: string;
}

const API_URL = "http://localhost:8000/api/v1/detect";

// ===== CONFIDENCE RING =====
const ConfidenceRing = ({ value, isAi }: { value: number; isAi: boolean }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = isAi ? "#EF4444" : "#10B981";

  return (
    <div className="relative w-[200px] h-[200px] flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {value.toFixed(1)}%
        </motion.span>
        <span className="text-xs text-gray-400 mt-0.5">Confidence</span>
      </div>
    </div>
  );
};

// ===== METRIC CARD =====
const MetricCard = ({ label, value, unit, icon: Icon, color = "purple" }: any) => {
  const colors: Record<string, string> = {
    purple: "from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/20",
    amber: "from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20",
    emerald: "from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20",
    rose: "from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/20",
  };

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`glass border ${colors[color]} p-4 rounded-xl space-y-2`}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value.toFixed(2)}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{unit}</p>
    </motion.div>
  );
};

// ===== SCANNING ANIMATION =====
const ScanningAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="flex items-end justify-center gap-1 h-32 w-full max-w-md">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-purple-500 via-cyan-500 to-amber-500"
            animate={{
              height: [`${15 + Math.random() * 20}%`, `${30 + Math.random() * 70}%`, `${15 + Math.random() * 20}%`],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.03,
            }}
          />
        ))}
      </div>
      <div className="text-center space-y-2">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg font-semibold text-white"
        >
          Analyzing audio...
        </motion.p>
        <p className="text-sm text-gray-400">Extracting spectral features & voice patterns</p>
      </div>
      <div className="w-64 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-500 to-amber-500"
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </div>
  );
};

// ===== UPLOAD STATE =====
const UploadState = ({ onFileSelect, isDragOver, onDragOver, onDragLeave, onDrop, onRecord, isRecording }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Deepfake Voice Detection</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Detect AI-Generated Voices
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Wondering if that voice clip is real? Upload it now. Our AI detects deepfake voices in real-time.
        </p>
      </div>

      {/* Media Type Tabs */}
      <div className="flex items-center justify-center gap-3">
        {[
          { icon: Image, label: "Image", active: false },
          { icon: Video, label: "Video", active: false },
          { icon: Music, label: "Voice", active: true },
        ].map((item) => (
          <button
            key={item.label}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              item.active
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onFileSelect}
        className={`glass-card-lg border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-purple-500 bg-purple-500/10"
            : "border-white/10 hover:border-purple-500/30"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border border-white/5">
            <Upload className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-medium text-lg">
              {isDragOver ? "Drop your audio file here" : "Drag & drop an audio file or click"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              WAV, MP3, AAC, OGG, FLAC up to 25MB
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" size={14} />
          <span>18,000+ audio files verified successfully</span>
        </div>
        <div className="w-px h-6 bg-white/5" />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" size={14} />
          <span>Real-time detection</span>
        </div>
      </div>

      {/* Analyze Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full max-w-md mx-auto block py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/40"
      >
        <span className="flex items-center justify-center gap-2">
          Analyze Audio
          <ArrowRight size={18} />
        </span>
      </motion.button>

      {/* Example Voices */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500">No audio? Try with example voices:</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {["Voice 1", "Voice 2", "Voice 3", "Voice 4"].map((voice) => (
            <button
              key={voice}
              className="px-4 py-2 rounded-full glass text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <Play size={12} className="text-purple-400" />
                {voice}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-gray-600 uppercase">or</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Live Record */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onRecord}
        className="w-full glass p-5 rounded-xl flex items-center gap-5 hover:bg-white/5 transition-all"
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            isRecording
              ? "bg-red-500 rec-pulse"
              : "bg-gradient-to-br from-purple-500 to-cyan-500"
          }`}
        >
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <p className="text-base font-semibold text-white">
            {isRecording ? "Recording..." : "Live Record"}
          </p>
          <p className="text-sm text-gray-400">
            {isRecording ? "Tap to stop and analyze" : "Record directly from your microphone"}
          </p>
        </div>
      </motion.button>
    </motion.div>
  );
};

// ===== RESULT STATE =====
const ResultState = ({ result, onReset }: { result: DetectionResult; onReset: () => void }) => {
  const isAi = result.is_ai;
  const metrics = result.metrics;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8"
    >
      {/* Status Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`flex items-center gap-4 p-5 rounded-2xl ${
          isAi
            ? "bg-rose-500/10 border border-rose-500/20"
            : "bg-emerald-500/10 border border-emerald-500/20"
        }`}
      >
        {isAi ? (
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
        ) : (
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        )}
        <div>
          <p className={`text-lg font-bold ${isAi ? "text-rose-400" : "text-emerald-400"}`}>
            {isAi ? "⚠️ AI-GENERATED VOICE" : "✅ AUTHENTIC VOICE"}
          </p>
          <p className="text-sm text-gray-400">
            {isAi ? "AI-generated audio detected" : "Natural human voice confirmed"}
            {result.filename && ` · ${result.filename}`}
            {result.duration_seconds > 0 && ` · ${result.duration_seconds.toFixed(1)}s`}
          </p>
        </div>
      </motion.div>

      {/* Confidence Ring */}
      <div className="flex justify-center py-4">
        <ConfidenceRing value={result.confidence} isAi={isAi} />
      </div>

      {/* Metrics */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Acoustic Metrics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Pitch Anomaly"
            value={metrics.pitch_anomaly}
            unit="Normalized"
            icon={Waves}
            color="purple"
          />
          <MetricCard
            label="Spectral Centroid"
            value={metrics.spectral_centroid}
            unit="Hz"
            icon={BarChart3}
            color="cyan"
          />
          <MetricCard
            label="MFCC Variance"
            value={metrics.mfcc_variance}
            unit="Coefficient"
            icon={Activity}
            color="amber"
          />
          <MetricCard
            label="Zero Crossing Rate"
            value={metrics.zero_crossing_rate}
            unit="Ratio"
            icon={Activity}
            color="emerald"
          />
          <MetricCard
            label="Spectral Rolloff"
            value={metrics.spectral_rolloff}
            unit="Hz"
            icon={BarChart3}
            color="rose"
          />
          <MetricCard
            label="RMS Energy"
            value={metrics.rms_energy}
            unit="dB"
            icon={Waves}
            color="cyan"
          />
        </div>
      </div>

      {/* Model Info */}
      <p className="text-center text-xs text-gray-500">
        Model: {result.model_used || "Wav2Vec2 Deepfake Detector"}
      </p>

      {/* Reset Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onReset}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-purple-500/20 transition-all"
      >
        Analyze Another File
      </motion.button>
    </motion.div>
  );
};

// ===== ERROR STATE =====
const ErrorState = ({ message, onReset }: { message: string; onReset: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex flex-col items-center justify-center py-16 px-4 space-y-6"
  >
    <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
      <XCircle className="w-10 h-10 text-rose-400" />
    </div>
    <div className="text-center">
      <h3 className="text-xl font-semibold text-white">Detection Failed</h3>
      <p className="text-gray-400 mt-1 max-w-md">{message}</p>
    </div>
    <button
      onClick={onReset}
      className="flex items-center gap-2 px-6 py-3 rounded-xl glass hover:bg-white/5 transition-all font-medium text-white"
    >
      <RotateCcw className="w-4 h-4" />
      Try Again
    </button>
  </motion.div>
);

// ===== MAIN COMPONENT =====
export default function DeepfakeDetection() {
  const [state, setState] = useState<DetectionState>("upload");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFile = useCallback(async (file: File) => {
    setUploadedFile(file);
    setState("scanning");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Detection failed" }));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data: DetectionResult = await res.json();
      setResult(data);
      setState("result");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error — is the backend running?";
      setErrorMsg(message);
      setState("error");
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["mp3", "wav", "flac", "ogg", "m4a", "aac"];
    if (validExts.includes(ext || "") || file.type.startsWith("audio/")) {
      detectFile(file);
    } else {
      setErrorMsg("Unsupported file format. Please upload MP3, WAV, FLAC, OGG, or M4A.");
      setState("error");
    }
  }, [detectFile]);

  const reset = useCallback(() => {
    setState("upload");
    setUploadedFile(null);
    setResult(null);
    setErrorMsg("");
    setIsRecording(false);
  }, []);

  const handleRecord = useCallback(() => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        const dummyFile = new File([""], "recording.wav", { type: "audio/wav" });
        detectFile(dummyFile);
      }, 3000);
    }
  }, [isRecording, detectFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  return (
    <div className="w-full min-h-[500px] flex items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,.flac,.ogg,.m4a,audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <AnimatePresence mode="wait">
        {state === "upload" && (
          <UploadState
            key="upload"
            onFileSelect={() => fileInputRef.current?.click()}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRecord={handleRecord}
            isRecording={isRecording}
          />
        )}

        {state === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto px-4"
          >
            {uploadedFile && (
              <div className="flex items-center gap-4 p-4 glass-card mb-8">
                <FileAudio className="w-6 h-6 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(uploadedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
              </div>
            )}
            <ScanningAnimation />
          </motion.div>
        )}

        {state === "result" && result && (
          <ResultState key="result" result={result} onReset={reset} />
        )}

        {state === "error" && (
          <ErrorState key="error" message={errorMsg} onReset={reset} />
        )}
      </AnimatePresence>
    </div>
  );
}