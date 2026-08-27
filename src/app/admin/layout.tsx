"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-gradient">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/"
            className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center hover:bg-white/60 transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-start to-amber-end flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary">Admin Panel</h1>
              <p className="text-xs text-text-muted">Training Data Management</p>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
