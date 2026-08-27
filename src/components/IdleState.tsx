"use client";

import { motion } from "framer-motion";
import { Mic, MessageCircle } from "lucide-react";

export default function IdleState({ onActivate }: { onActivate: () => void }) {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex flex-col items-center h-full w-full"
    >
      {/* Top pill */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex items-center gap-2 px-5 py-2 rounded-full glass border border-amber-start/30 mt-14"
      >
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center">
          <Mic className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-[13px] font-medium text-text-primary">Say anything!</span>
      </motion.div>

      {/* Center text */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-1 flex items-center justify-center px-8"
      >
        <h1 className="text-[36px] sm:text-[42px] font-medium text-center leading-[1.2] text-text-primary">
          Say anything to
          <br />
          <span className="gradient-text">midas AI.</span>
        </h1>
      </motion.div>

      {/* Bottom area */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="w-full px-6 pb-4"
      >
        {/* Chat icon button */}
        <div className="flex justify-start mb-5 ml-1">
          <div className="w-11 h-11 rounded-full glass-strong flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5 text-text-secondary" />
          </div>
        </div>

        {/* Mic button with Ready text */}
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onActivate}
            className="relative"
          >
            {/* Pulse rings */}
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-amber-start to-amber-end opacity-20 pulse-ring" />
            <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-amber-start to-amber-end opacity-15 pulse-ring" style={{ animationDelay: "0.7s" }} />

            {/* Button */}
            <div className="relative w-[60px] h-[60px] rounded-full bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center amber-glow-strong">
              <Mic className="w-6 h-6 text-white" />
            </div>
          </motion.button>
          <span className="text-[13px] font-medium text-text-secondary">Ready?</span>
        </div>
      </motion.div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 shrink-0">
        <div className="w-32 h-1 rounded-full bg-black/15" />
      </div>
    </motion.div>
  );
}
