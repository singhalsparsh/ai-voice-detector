"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FolderOpen, FileAudio, Trash2, Check, AlertTriangle,
  Play, Loader2, Database, Brain,
} from "lucide-react";

const API_URL = "http://localhost:8000";

interface UploadedFile {
  id: string;
  file: File;
  label: "real" | "ai_generated";
  status: "pending" | "uploading" | "done" | "error";
}

export default function AdminPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [serverStatus, setServerStatus] = useState<"unknown" | "online" | "offline">("unknown");
  const [modelStatus, setModelStatus] = useState<{ loaded: boolean; name?: string }>({ loaded: false });
  const realInputRef = useRef<HTMLInputElement>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  // Check server status
  const checkServer = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/`);
      const data = await res.json();
      setServerStatus("online");
      setModelStatus({ loaded: data.model_loaded, name: data.model_loaded ? "Loaded" : undefined });
    } catch {
      setServerStatus("offline");
    }
  }, []);

  // Upload handler
  const handleFiles = useCallback((newFiles: FileList | null, label: "real" | "ai_generated") => {
    if (!newFiles) return;
    const items: UploadedFile[] = Array.from(newFiles).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      label,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  // Upload to server
  const uploadAll = useCallback(async () => {
    setIsUploading(true);
    checkServer();

    for (const item of files.filter((f) => f.status === "pending")) {
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "uploading" } : f));

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("label", item.label);

      try {
        const res = await fetch(`${API_URL}/api/v1/admin/upload-training`, {
          method: "POST",
          body: formData,
        });
        setFiles((prev) => prev.map((f) =>
          f.id === item.id ? { ...f, status: res.ok ? "done" : "error" } : f
        ));
      } catch {
        setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "error" } : f));
      }
    }

    setIsUploading(false);
  }, [files, checkServer]);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearAll = () => setFiles([]);

  const realCount = files.filter((f) => f.label === "real").length;
  const aiCount = files.filter((f) => f.label === "ai_generated").length;

  return (
    <div className="space-y-6">
      {/* Server status */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-amber-end" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Backend Server</p>
            <p className="text-xs text-text-muted">
              {serverStatus === "online" ? "Connected" : serverStatus === "offline" ? "Offline" : "Click to check"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {modelStatus.loaded && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald/10 border border-emerald/20">
              <Brain className="w-3.5 h-3.5 text-emerald" />
              <span className="text-xs font-medium text-emerald">Model Loaded</span>
            </div>
          )}
          <button onClick={checkServer}
            className="px-3 py-1.5 rounded-lg text-xs font-medium glass hover:bg-white/60 transition-colors">
            Check Status
          </button>
        </div>
      </motion.div>

      {/* Upload zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Real voice uploads */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5">
          <input ref={realInputRef} type="file" accept="audio/*" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files, "real")} />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald" />
            <h3 className="text-sm font-bold text-text-primary">Real Human Voice</h3>
            <span className="ml-auto text-xs text-text-muted">{realCount} files</span>
          </div>
          <button onClick={() => realInputRef.current?.click()}
            className="w-full py-8 rounded-xl border-2 border-dashed border-emerald/20 hover:border-emerald/40 flex flex-col items-center gap-2 transition-colors">
            <Upload className="w-6 h-6 text-emerald/60" />
            <span className="text-xs text-text-muted">Drop real voice files here</span>
          </button>
        </motion.div>

        {/* AI-generated voice uploads */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5">
          <input ref={aiInputRef} type="file" accept="audio/*" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files, "ai_generated")} />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-rose" />
            <h3 className="text-sm font-bold text-text-primary">AI-Generated Voice</h3>
            <span className="ml-auto text-xs text-text-muted">{aiCount} files</span>
          </div>
          <button onClick={() => aiInputRef.current?.click()}
            className="w-full py-8 rounded-xl border-2 border-dashed border-rose/20 hover:border-rose/40 flex flex-col items-center gap-2 transition-colors">
            <Upload className="w-6 h-6 text-rose/60" />
            <span className="text-xs text-text-muted">Drop AI voice files here</span>
          </button>
        </motion.div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-text-primary">Uploaded Files ({files.length})</h3>
            <div className="flex gap-2">
              <button onClick={clearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-rose transition-colors">
                Clear All
              </button>
              <button onClick={uploadAll} disabled={isUploading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-start to-amber-end text-white shadow-md disabled:opacity-50">
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {isUploading ? "Uploading..." : "Upload All"}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence>
              {files.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/40 border border-white/30">
                  <FileAudio className="w-4 h-4 text-text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{item.file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        item.label === "real" ? "bg-emerald/10 text-emerald" : "bg-rose/10 text-rose"
                      }`}>
                        {item.label === "real" ? "Real" : "AI"}
                      </span>
                      <span className="text-[10px] text-text-muted">{(item.file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                  {item.status === "done" && <Check className="w-4 h-4 text-emerald shrink-0" />}
                  {item.status === "error" && <AlertTriangle className="w-4 h-4 text-rose shrink-0" />}
                  {item.status === "uploading" && <Loader2 className="w-4 h-4 text-amber-end animate-spin shrink-0" />}
                  {item.status === "pending" && (
                    <button onClick={() => removeFile(item.id)}>
                      <Trash2 className="w-4 h-4 text-text-muted hover:text-rose transition-colors shrink-0" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Train model section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-amber-end" />
          <h3 className="text-sm font-bold text-text-primary">Train Model</h3>
        </div>
        <p className="text-xs text-text-muted mb-4">
          After uploading training files, run the training script on the server:
        </p>
        <div className="bg-black/[0.04] rounded-xl p-4 font-mono text-xs text-text-secondary overflow-x-auto">
          <code>cd backend &amp;&amp; python train_model.py --data_dir ./data --output ./models/voice_classifier.pkl</code>
        </div>
        <p className="text-[11px] text-text-muted mt-3">
          Files should be placed in <code className="px-1 py-0.5 bg-black/[0.04] rounded">backend/data/real/</code> and <code className="px-1 py-0.5 bg-black/[0.04] rounded">backend/data/ai_generated/</code> directories.
        </p>
      </motion.div>
    </div>
  );
}
