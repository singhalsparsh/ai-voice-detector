"use client";

import { motion } from "framer-motion";
import { Mic, MessageCircle, Settings, Square } from "lucide-react";
import { useState, useEffect } from "react";

export default function ListeningState({ onStop }: { onStop: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  const fullText =
    "Hi midas, I need your help with stocks. Can you recommend best performing stocks for long ter";

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCharIdx((idx) => {
        if (idx >= fullText.length) {
          clearInterval(interval);
          return idx;
        }
        return idx + 1;
      });
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown from 05:00
  const totalSeconds = 300;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const rMin = String(Math.floor(remaining / 60)).padStart(2, "0");
  const rSec = String(remaining % 60).padStart(2, "0");

  const visibleText = fullText.slice(0, charIdx);
  // Split: older text is faded, last 30 chars are bold/active
  const splitPoint = Math.max(0, visibleText.length - 35);
  const fadedText = visibleText.slice(0, splitPoint);
  const activeText = visibleText.slice(splitPoint);

  return (
    <motion.div
      key="listening"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex flex-col h-full w-full"
    >
      {/* Top pill */}
      <div className="flex justify-center pt-14 pb-2 shrink-0">
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 px-5 py-2 rounded-full glass border border-amber-start/30"
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center">
            <Mic className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-[13px] font-medium text-text-primary">Say anything!</span>
        </motion.div>
      </div>

      {/* Live transcription */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="flex-1 flex flex-col justify-center w-full px-8"
      >
        <p className="text-[26px] sm:text-[28px] leading-[1.35] font-light">
          <span className="text-text-muted/50">{fadedText}</span>
          <span className="text-text-primary font-medium">{activeText}</span>
          <span className="typing-cursor inline-block w-[2px] h-7 bg-amber-end align-middle ml-0.5 rounded-full" />
        </p>
      </motion.div>

      {/* Audio visualizer bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full px-10 mb-3 shrink-0"
      >
        <div className="flex items-end justify-center gap-[2.5px] h-16">
          {Array.from({ length: 35 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[2.5px] rounded-full bg-gradient-to-t from-amber-start/40 to-amber-end/80"
              animate={{
                height: [
                  `${15 + Math.random() * 20}%`,
                  `${40 + Math.random() * 60}%`,
                  `${15 + Math.random() * 20}%`,
                ],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.03,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom controls */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full px-6 pb-4 shrink-0"
      >
        <div className="flex items-center justify-between">
          {/* Chat button */}
          <div className="w-11 h-11 rounded-full glass-strong flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5 text-text-secondary" />
          </div>

          {/* Stop button + timer */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-[52px] h-[52px] rounded-xl bg-white border-2 border-amber-end/30 flex items-center justify-center shadow-md">
              <Square className="w-5 h-5 text-amber-end" />
            </div>
            <span className="text-[13px] font-medium text-text-primary tabular-nums">
              {rMin}:{rSec}
            </span>
          </motion.button>

          {/* Settings button */}
          <div className="w-11 h-11 rounded-full glass-strong flex items-center justify-center">
            <Settings className="w-4.5 h-4.5 text-text-secondary" />
          </div>
        </div>
      </motion.div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 shrink-0">
        <div className="w-32 h-1 rounded-full bg-black/15" />
      </div>
    </motion.div>
  );
}
