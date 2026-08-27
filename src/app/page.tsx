"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Shield, Sparkles, Menu, X, Zap } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import DeepfakeDetection from "@/components/DeepfakeDetection";

export default function Home() {
  const [tab, setTab] = useState<"voice" | "detect">("voice");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-aurora grid-pattern flex flex-col relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="orb w-[500px] h-[500px] bg-purple-600 top-[-10%] left-[-10%]" />
      <div className="orb w-[400px] h-[400px] bg-cyan-500 bottom-[-10%] right-[-10%]" />
      <div className="orb w-[300px] h-[300px] bg-amber-500 top-[50%] left-[50%] -translate-x-1/2" />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Zap size={18} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 blur-xl opacity-20" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-bold text-white tracking-tight">midas</span>
              <span className="text-xl font-bold text-gradient-primary">AI</span>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
            <button
              onClick={() => setTab("voice")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                tab === "voice"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Mic size={15} />
              Voice Assistant
            </button>
            <button
              onClick={() => setTab("detect")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                tab === "detect"
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Shield size={15} />
              AI Detection
            </button>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <button
                  onClick={() => { setTab("voice"); setIsMobileMenuOpen(false); }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                    tab === "voice"
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Mic size={16} />
                  Voice Assistant
                </button>
                <button
                  onClick={() => { setTab("detect"); setIsMobileMenuOpen(false); }}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-3 ${
                    tab === "detect"
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Shield size={16} />
                  AI Detection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 flex items-center justify-center w-full pt-16">
        <div className="w-full max-w-6xl h-full flex items-center justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full flex items-center justify-center"
            >
              {tab === "voice" ? <VoiceAssistant /> : <DeepfakeDetection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 border-t border-white/5 bg-black/30 backdrop-blur-sm">
        <p className="text-xs text-gray-500">
          Powered by <span className="text-gradient-primary font-medium">Midas AI</span>
          <span className="mx-2 text-gray-700">·</span>
          <span className="text-gray-600">Advanced Voice Detection</span>
        </p>
      </footer>
    </div>
  );
}