"use client";

import { ReactNode } from "react";

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[390px] h-[844px] max-h-[85vh] rounded-[52px] bg-cream shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden border-[5px] border-black/[0.06]">
      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 pt-3 pb-2">
        <span className="text-[14px] font-semibold text-text-primary tracking-tight">9:41</span>
        <div className="flex items-center gap-[5px]">
          {/* Signal bars */}
          <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
            <rect x="0" y="7" width="3" height="4" rx="0.8" fill="#1A1A1A" />
            <rect x="4.5" y="5" width="3" height="6" rx="0.8" fill="#1A1A1A" />
            <rect x="9" y="2" width="3" height="9" rx="0.8" fill="#1A1A1A" />
            <rect x="13.5" y="0" width="3" height="11" rx="0.8" fill="#1A1A1A" />
          </svg>
          {/* WiFi */}
          <svg width="15" height="11" viewBox="0 0 16 12" fill="#1A1A1A">
            <path d="M8 11.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5zM4.46 7.54a5 5 0 017.08 0l-.94.94a3.5 3.5 0 00-5.2 0l-.94-.94zM1.76 4.76a9 9 0 0112.48 0l-.94.94a7.5 7.5 0 00-10.6 0l-.94-.94z" />
          </svg>
          {/* Battery */}
          <svg width="27" height="12" viewBox="0 0 27 13" fill="none">
            <rect x="0.5" y="0.5" width="23" height="12" rx="3" stroke="#1A1A1A" strokeOpacity="0.35" />
            <rect x="2" y="2" width="20" height="9" rx="2" fill="#1A1A1A" />
            <path d="M25 4.5v4a2 2 0 000-4z" fill="#1A1A1A" fillOpacity="0.4" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
