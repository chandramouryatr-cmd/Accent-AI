"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { WaveformCanvas } from "@/components/widgets/waveform-canvas";

const TAGLINES = [
  "Master Native-Level English",
  "Train Your Accent with AI",
  "Speak Like a Native",
  "32 Lessons · 8 Phases",
];

export function Onboarding() {
  const [stage, setStage] = useState<"login" | "accent">("login");
  const [selectedAccent, setSelectedAccent] = useState<"usa" | null>(null);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setAccent = useAppStore((s) => s.setAccent);

  // Cycle taglines — useEffect (not useState) for side effects with cleanup
  useEffect(() => {
    const t = setInterval(() => setTaglineIdx((i) => (i + 1) % TAGLINES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = () => setStage("accent");
  const handleSelectAccent = (a: "usa") => setSelectedAccent(a);
  const handleBegin = () => {
    if (selectedAccent) {
      setAccent(selectedAccent);
      setOnboarded(true);
    }
  };

  if (stage === "login") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[var(--bg)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <WaveformCanvas height={0} className="!h-full" />
          <div className="absolute inset-0">
            <WaveformCanvas height={800} />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative w-full max-w-sm rounded-3xl p-7 backdrop-blur-xl"
          style={{
            background: "rgba(11,11,26,0.88)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div className="text-center mb-6">
            <div className="font-d text-4xl font-bold mb-3">
              <span className="grad-text">AccentAI</span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#22d3ee] ml-1 align-middle" />
            </div>
            <div className="h-6 overflow-hidden">
              <motion.div
                key={taglineIdx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-sm text-[var(--t2)]"
              >
                {TAGLINES[taglineIdx]}
              </motion.div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-100 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-100 transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border2)] text-white text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-[rgba(255,255,255,0.08)] transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              Continue with Email
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--t3)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            Try Demo →
          </button>

          <p className="text-center text-[10px] text-[var(--t3)] mt-4">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    );
  }

  // accent select
  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto p-5 safe-top">
      <div className="max-w-md mx-auto pt-6">
        <div className="text-center mb-8">
          <h1 className="font-d text-3xl font-bold mb-2">
            Choose Your <span className="grad-text">Accent</span>
          </h1>
          <p className="text-[var(--t2)] text-sm">Select the accent you want to master first</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => handleSelectAccent("usa")}
            className={`relative rounded-2xl p-5 text-center transition border-2 ${
              selectedAccent === "usa"
                ? "border-[var(--p)] bg-[rgba(99,102,241,0.12)]"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border2)]"
            }`}
          >
            {selectedAccent === "usa" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--grad-btn)] flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            )}
            <div className="text-5xl mb-2">🇺🇸</div>
            <div className="font-d font-semibold text-base">USA English</div>
            <div className="text-xs text-[var(--t3)] mt-1">American Accent</div>
          </button>

          <div className="relative rounded-2xl p-5 text-center border-2 border-[var(--border)] bg-[var(--card)] opacity-60">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]">
              Soon
            </div>
            <div className="text-5xl mb-2">🇬🇧</div>
            <div className="font-d font-semibold text-base">UK English</div>
            <div className="text-xs text-[var(--t3)] mt-1">British RP</div>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2 px-1">
          Coming Soon
        </div>
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { flag: "🇩🇪", name: "German" },
            { flag: "🇫🇷", name: "French" },
            { flag: "🇪🇸", name: "Spanish" },
            { flag: "🇮🇹", name: "Italian" },
            { flag: "🇯🇵", name: "Japanese" },
            { flag: "🇰🇷", name: "Korean" },
            { flag: "🇨🇳", name: "Chinese" },
            { flag: "🇧🇷", name: "Portuguese" },
          ].map((l) => (
            <div
              key={l.name}
              className="rounded-xl p-2.5 text-center bg-[var(--card)] border border-[var(--border)] opacity-50"
            >
              <div className="text-2xl mb-0.5">{l.flag}</div>
              <div className="text-[10px] text-[var(--t3)]">{l.name}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleBegin}
          disabled={!selectedAccent}
          className="w-full py-3.5 rounded-xl bg-[var(--grad-btn)] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
        >
          Begin Journey →
        </button>
      </div>
    </div>
  );
}
