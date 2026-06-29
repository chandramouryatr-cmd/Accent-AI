"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { WaveformCanvas } from "@/components/widgets/waveform-canvas";

const TAGLINES = [
  "Master Native-Level English",
  "Train Your Accent with AI",
  "Speak Like a Native",
  "32 Lessons · 8 Phases",
];

const FLOATING_PHONEMES = [
  { ch: "/θ/", x: "8%", y: "20%", delay: 0, color: "#6366f1", size: "text-5xl" },
  { ch: "/æ/", x: "82%", y: "15%", delay: 0.5, color: "#a78bfa", size: "text-4xl" },
  { ch: "/ʃ/", x: "15%", y: "75%", delay: 1.0, color: "#ec4899", size: "text-5xl" },
  { ch: "/ŋ/", x: "88%", y: "65%", delay: 1.5, color: "#22d3ee", size: "text-4xl" },
  { ch: "/ɑː/", x: "5%", y: "50%", delay: 0.8, color: "#f59e0b", size: "text-3xl" },
  { ch: "/ð/", x: "92%", y: "35%", delay: 1.3, color: "#10b981", size: "text-4xl" },
  { ch: "/ɜː/", x: "78%", y: "82%", delay: 0.3, color: "#8b5cf6", size: "text-3xl" },
  { ch: "/r/", x: "22%", y: "10%", delay: 1.7, color: "#ec4899", size: "text-3xl" },
];

export function Onboarding() {
  const [stage, setStage] = useState<"login" | "accent">("login");
  const [selectedAccent, setSelectedAccent] = useState<"usa" | null>(null);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setAccent = useAppStore((s) => s.setAccent);

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
        {/* Background waveform layers */}
        <div className="absolute inset-0 pointer-events-none">
          <WaveformCanvas height={0} className="!h-full" />
          <div className="absolute inset-0">
            <WaveformCanvas height={800} />
          </div>
        </div>

        {/* Floating phoneme characters */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_PHONEMES.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute ${p.size} font-mono font-bold pointer-events-none select-none`}
              style={{
                left: p.x,
                top: p.y,
                color: p.color,
                opacity: 0.16,
                filter: `drop-shadow(0 0 20px ${p.color}40)`,
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, -22, 0],
                opacity: [0, 0.18, 0],
                rotate: [0, 6, -6, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
            >
              {p.ch}
            </motion.div>
          ))}
        </div>

        {/* Central radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.18),transparent_70%)] pointer-events-none" />
        {/* Secondary glow — violet */}
        <motion.div
          aria-hidden
          className="absolute top-1/3 left-2/3 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative w-full max-w-sm rounded-3xl p-7 backdrop-blur-xl"
          style={{
            background: "rgba(11,11,26,0.88)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1) inset",
          }}
        >
          {/* Animated logo orb */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #22d3ee 100%)",
              boxShadow:
                "0 8px 24px rgba(99,102,241,0.4), 0 0 0 4px rgba(11,11,26,1)",
            }}
            animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl">👄</span>
          </motion.div>

          <div className="text-center mb-6 mt-4">
            <div className="font-d text-4xl font-bold mb-3">
              <span className="grad-text">AccentAI</span>
              <motion.span
                className="inline-block w-2 h-2 rounded-full bg-[#22d3ee] ml-1 align-middle"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={taglineIdx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-[var(--t2)]"
                >
                  {TAGLINES[taglineIdx]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature pills */}
            <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
              {[
                { emoji: "🎯", label: "IPA" },
                { emoji: "👄", label: "Mouth diagrams" },
                { emoji: "🔊", label: "Native audio" },
                { emoji: "📊", label: "Live feedback" },
              ].map((f, i) => (
                <motion.span
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.3 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-[var(--t2)]"
                >
                  <span>{f.emoji}</span>
                  <span>{f.label}</span>
                </motion.span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-100 transition shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-gray-100 transition shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.32 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </motion.button>
            <motion.button
              onClick={handleLogin}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border2)] text-white text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-[rgba(255,255,255,0.08)] transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="3"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              Continue with Email
            </motion.button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--t3)]">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02, brightness: 1.1 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-bold hover:opacity-90 transition relative overflow-hidden"
          >
            <motion.span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-120%" }}
              animate={{ x: "260%" }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                width: "50%",
              }}
            />
            <span className="relative">Try Demo →</span>
          </motion.button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-[var(--t3)]">
            <span className="flex items-center gap-1">
              <span className="text-amber-400">★</span> 4.9 rating
            </span>
            <span>·</span>
            <span>👥 12k+ learners</span>
            <span>·</span>
            <span>📚 32 lessons</span>
          </div>

          <p className="text-center text-[10px] text-[var(--t3)] mt-3">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    );
  }

  // accent select
  const comingSoon = [
    { flag: "🇩🇪", name: "German" },
    { flag: "🇫🇷", name: "French" },
    { flag: "🇪🇸", name: "Spanish" },
    { flag: "🇮🇹", name: "Italian" },
    { flag: "🇯🇵", name: "Japanese" },
    { flag: "🇰🇷", name: "Korean" },
    { flag: "🇨🇳", name: "Chinese" },
    { flag: "🇧🇷", name: "Portuguese" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto p-5 safe-top">
      {/* Background orbs */}
      <motion.div
        aria-hidden
        className="fixed top-20 left-10 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="fixed bottom-32 right-10 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="max-w-md mx-auto pt-6 relative">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #22d3ee 100%)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
            }}
          >
            <span className="text-2xl">🌍</span>
          </motion.div>
          <h1 className="font-d text-3xl font-bold mb-2">
            Choose Your <span className="grad-text">Accent</span>
          </h1>
          <p className="text-[var(--t2)] text-sm">
            Select the accent you want to master first
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button
            onClick={() => handleSelectAccent("usa")}
            whileHover={{ scale: selectedAccent === "usa" ? 1 : 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-2xl p-5 text-center transition border-2 overflow-hidden ${
              selectedAccent === "usa"
                ? "border-[var(--p)] bg-[rgba(99,102,241,0.12)]"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--border2)]"
            }`}
          >
            {selectedAccent === "usa" && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--grad-btn)] flex items-center justify-center text-white text-xs"
              >
                ✓
              </motion.div>
            )}
            {selectedAccent === "usa" && (
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(99,102,241,0.18), transparent 60%)",
                }}
              />
            )}
            <motion.div
              animate={
                selectedAccent === "usa"
                  ? { scale: [1, 1.15, 1], y: [0, -3, 0] }
                  : {}
              }
              transition={{ duration: 0.6 }}
              className="text-5xl mb-2 relative"
            >
              🇺🇸
            </motion.div>
            <div className="font-d font-semibold text-base relative">USA English</div>
            <div className="text-xs text-[var(--t3)] mt-1 relative">American Accent</div>
            {selectedAccent === "usa" && (
              <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[rgba(16,185,129,0.15)] text-[#10b981] relative">
                ✓ Ready
              </div>
            )}
          </motion.button>

          <div className="relative rounded-2xl p-5 text-center border-2 border-[var(--border)] bg-[var(--card)] opacity-60 overflow-hidden">
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
          {comingSoon.map((l, i) => (
            <motion.div
              key={l.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl p-2.5 text-center bg-[var(--card)] border border-[var(--border)] opacity-50"
            >
              <div className="text-2xl mb-0.5">{l.flag}</div>
              <div className="text-[10px] text-[var(--t3)]">{l.name}</div>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={handleBegin}
          disabled={!selectedAccent}
          whileHover={selectedAccent ? { scale: 1.01 } : {}}
          whileTap={selectedAccent ? { scale: 0.98 } : {}}
          className="w-full py-3.5 rounded-xl bg-[var(--grad-btn)] text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition relative overflow-hidden"
        >
          {selectedAccent && (
            <motion.span
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-120%" }}
              animate={{ x: "260%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                width: "50%",
              }}
            />
          )}
          <span className="relative">Begin Journey →</span>
        </motion.button>

        {selectedAccent && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-[var(--t3)] mt-3"
          >
            🎯 You picked <span className="text-[var(--t2)] font-semibold">USA English</span> — tap above to start!
          </motion.p>
        )}
      </div>
    </div>
  );
}
