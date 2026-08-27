"use client";

import { motion } from "framer-motion";
import {
  Search,
  Play,
  Mic,
  Send,
  Paperclip,
  Diamond,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react";

const stocks = [
  {
    name: "Apple, Inc",
    ticker: "$AAPL",
    sector: "Technology",
    price: "$187.28",
    change: "+3.2%",
    up: true,
    bg: "#333",
    icon: "🍎",
  },
  {
    name: "The Home Depot",
    ticker: "$THD",
    sector: "Appliance",
    price: "$14.28",
    change: "+2.4%",
    up: true,
    bg: "#F96302",
    icon: "🏠",
  },
  {
    name: "Tesla Motors",
    ticker: "$TSLA",
    sector: "Technology",
    price: "$98.44",
    change: "-1.5%",
    up: false,
    bg: "#CC0000",
    icon: "⚡",
  },
  {
    name: "Nike Sports",
    ticker: "$NIKE",
    sector: "Sports",
    price: "$13.07",
    change: "+1.8%",
    up: true,
    bg: "#111",
    icon: "✓",
  },
  {
    name: "Microsoft Inc",
    ticker: "$MSFT",
    sector: "Technology",
    price: "$12.8",
    change: "+0.9%",
    up: true,
    bg: "#00A4EF",
    icon: "⊞",
  },
];

function AudioWaveform() {
  const bars = 45;
  return (
    <div className="flex items-center gap-[1.5px] h-7 flex-1 overflow-hidden">
      {Array.from({ length: bars }).map((_, i) => {
        const height = 6 + Math.sin(i * 0.4) * 14 + Math.cos(i * 0.7) * 6;
        return (
          <div
            key={i}
            className="w-[2px] rounded-full bg-white/60"
            style={{ height: `${Math.max(4, height)}px` }}
          />
        );
      })}
    </div>
  );
}

export default function ChatState({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative flex flex-col h-full w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <Diamond className="w-5 h-5 text-amber-end" />
          <div>
            <h2 className="text-[15px] font-bold text-text-primary leading-tight">Finpal AI Assistant</h2>
            <p className="text-[10px] text-text-muted leading-tight">GPT-7 · 251 Chats Left</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/50 border border-white/60 flex items-center justify-center">
          <Search className="w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
        {/* Audio player pill */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-gradient-to-r from-amber-start to-amber-end p-3 flex items-center gap-3 shadow-md"
        >
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
          </div>
          <AudioWaveform />
          <span className="text-[11px] font-semibold text-white shrink-0">02:12</span>
        </motion.div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 px-0.5">
          <span className="text-[11px] text-text-muted">11:25</span>
          <span className="text-[10px] text-text-muted">✓✓</span>
        </div>

        {/* AI Response + Stocks in glass card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-4 space-y-3"
        >
          <p className="text-[12.5px] leading-[1.65] text-text-primary">
            Certainly! I&apos;m glad you reached out for help with stocks. For long-term investing,
            it&apos;s essential to focus on companies with strong fundamentals, consistent growth,
            and a robust market presence.
          </p>

          {/* Hi-Growth Stocks divider */}
          <div className="pt-1 border-t border-black/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-[11px] font-bold text-text-primary">Hi-Growth Stocks</span>
              </div>
              <div className="flex items-center gap-0.5 text-[10px] text-text-muted">
                <span>1y return</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            {/* Stock list */}
            {stocks.map((stock, i) => (
              <motion.div
                key={stock.ticker}
                initial={{ x: 8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px]"
                    style={{ backgroundColor: stock.bg + "18", color: stock.bg }}
                  >
                    {stock.icon}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-text-primary leading-tight">
                      {stock.name}
                    </p>
                    <p className="text-[10px] text-text-muted leading-tight">
                      {stock.ticker} · {stock.sector}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-text-primary">{stock.price}</p>
                  <div className="flex items-center gap-0.5 justify-end">
                    {stock.up ? (
                      <TrendingUp className="w-2.5 h-2.5 text-stock-green" />
                    ) : (
                      <TrendingDown className="w-2.5 h-2.5 text-stock-red" />
                    )}
                    <span
                      className={`text-[10px] font-medium ${
                        stock.up ? "text-stock-green" : "text-stock-red"
                      }`}
                    >
                      {stock.change}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom area: chat input + user message */}
      <div className="px-4 pt-2 pb-3 space-y-2.5 shrink-0">
        {/* Chat input bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl flex items-center gap-2 px-3 py-2"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-[13px] text-text-muted">Chatting...</span>
          </div>
          <Paperclip className="w-4 h-4 text-text-muted" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center shrink-0">
            <Send className="w-3.5 h-3.5 text-white ml-0.5" />
          </div>
        </motion.div>

        {/* User message bubble */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end"
        >
          <div className="flex items-end gap-1.5">
            <div className="bg-gradient-to-r from-amber-start to-amber-end text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm">
              <p className="text-[13px] font-medium">Awesome, thanks!!</p>
            </div>
            <div className="flex flex-col items-end shrink-0 pb-1">
              <span className="text-[10px] text-text-muted">11:25</span>
              <span className="text-[9px] text-text-muted">✓✓</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 shrink-0">
        <div className="w-32 h-1 rounded-full bg-black/15" />
      </div>
    </motion.div>
  );
}
