"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Check, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { speak } from "@/lib/tts";
import {
  getDailyChallenge,
  getDailyChallengeId,
  DAILY_CHALLENGES,
} from "@/lib/daily-challenges";
import { useToastStore } from "@/lib/toast-store";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const STORAGE_KEY = "accentai-dc-completed";

export function DailyChallengeCard() {
  const accent = useAppStore((s) => s.accent);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const pushToast = useToastStore((s) => s.push);

  const challenge = getDailyChallenge();
  const todayId = getDailyChallengeId();
  // Read initial state from localStorage synchronously during render.
  // Wrap in try/catch and guard against SSR (typeof window check).
  const [completed, setCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const map = JSON.parse(raw) as Record<string, boolean>;
        return !!map[todayId];
      }
    } catch {
      // ignore
    }
    return false;
  });

  const handlePlay = () => {
    speak(challenge.phrase, { accent, rate: 0.9 });
  };

  const handlePlaySlow = () => {
    speak(challenge.phrase, { accent, rate: 0.6 });
  };

  const handleComplete = () => {
    if (completed) {
      // Already done — open practice for more
      setActiveTab("practice");
      return;
    }
    // Mark as done
    setCompleted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      map[todayId] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
    pushToast({
      variant: "milestone",
      emoji: "⭐",
      title: "Challenge Complete!",
      subtitle: "Great work — see you tomorrow!",
      duration: 4500,
    });
  };

  const accentColor = DIFFICULTY_COLORS[challenge.difficulty] ?? "#a78bfa";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(34,211,238,0.05) 100%)",
        borderColor: "rgba(99,102,241,0.25)",
      }}
    >
      {/* Animated mesh background */}
      <motion.div
        aria-hidden
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        }}
      />

      <div className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">{challenge.emoji}</span>
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
                Daily Challenge
              </div>
              <div className="font-d font-bold text-sm">
                Master the {challenge.focus}
              </div>
            </div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{
              color: accentColor,
              background: `${accentColor}20`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {challenge.difficulty.toUpperCase()}
          </span>
        </div>

        {/* Phrase */}
        <div className="rounded-xl p-3 mb-3 bg-[rgba(0,0,0,0.25)] border border-[var(--border)]">
          <div className="font-d text-base font-semibold mb-1.5 leading-snug">
            “{challenge.phrase}”
          </div>
          <div className="font-mono text-xs text-[var(--t2)] leading-relaxed">
            {challenge.ipa}
          </div>
        </div>

        {/* Tip */}
        <div className="flex gap-2 mb-3 rounded-lg p-2.5 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.18)]">
          <span className="text-sm leading-relaxed">💡</span>
          <p className="text-xs text-[var(--t2)] leading-relaxed flex-1">
            {challenge.tip}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a78bfa)",
              color: "white",
            }}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Hear it
          </button>
          <button
            onClick={handlePlaySlow}
            className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold bg-[var(--card)] border border-[var(--border2)] text-[var(--t2)] hover:bg-[var(--card-h)] transition"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Slow
          </button>
          <motion.button
            onClick={handleComplete}
            whileTap={{ scale: 0.94 }}
            className="flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition"
            style={{
              background: completed
                ? "linear-gradient(135deg, #10b981, #22d3ee)"
                : "rgba(16,185,129,0.15)",
              color: completed ? "white" : "#10b981",
              border: completed
                ? "none"
                : "1px solid rgba(16,185,129,0.4)",
            }}
          >
            {completed ? (
              <>
                <Check className="w-3.5 h-3.5" /> Done!
              </>
            ) : (
              <>
                Mark Done <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Footer note */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--t3)]">
          <span className="font-mono">
            🔄 New challenge every day · {DAILY_CHALLENGES.length} total
          </span>
          <span>{completed ? "✓ Completed today" : "Not done yet"}</span>
        </div>
      </div>
    </motion.div>
  );
}
