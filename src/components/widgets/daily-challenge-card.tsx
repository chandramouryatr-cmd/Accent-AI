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

const STORAGE_KEY = "accentai-dc-completed";

// Subtle difficulty indicator — 3 dots, filled = level. Minimal, no color.
function DifficultyIndicator({ difficulty }: { difficulty: string }) {
  const level = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--t3)]">
        {difficulty}
      </span>
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={
              "w-1 h-1 rounded-full transition-colors " +
              (i < level ? "bg-[var(--t1)]" : "bg-[var(--border2)]")
            }
          />
        ))}
      </div>
    </div>
  );
}

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={
        "bg-[var(--card)] border rounded-xl overflow-hidden transition-colors " +
        (completed
          ? "border-[var(--border2)]"
          : "border-[var(--border)]")
      }
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="text-xl leading-none mt-0.5 shrink-0">
              {challenge.emoji}
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] font-mono text-[var(--t3)]">
                Daily Challenge
              </div>
              <div className="font-d font-bold text-sm text-[var(--t1)] mt-0.5 leading-snug">
                {challenge.focus}
              </div>
            </div>
          </div>
          <DifficultyIndicator difficulty={challenge.difficulty} />
        </div>

        {/* Phrase — prominent */}
        <div className="mb-4">
          <div className="font-d text-lg font-bold leading-snug text-[var(--t1)]">
            &ldquo;{challenge.phrase}&rdquo;
          </div>
          <div className="font-mono text-xs text-[var(--t3)] leading-relaxed mt-1.5">
            {challenge.ipa}
          </div>
        </div>

        {/* Tip — clean card with subtle background */}
        <div className="mb-4 flex gap-2.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)] p-3">
          <span className="text-sm leading-relaxed shrink-0" aria-hidden>
            💡
          </span>
          <p className="text-xs text-[var(--t2)] leading-relaxed flex-1">
            {challenge.tip}
          </p>
        </div>

        {/* Actions — primary/secondary hierarchy, min 40px height */}
        <div className="flex items-stretch gap-2">
          <button
            onClick={handlePlay}
            className="flex-1 min-h-[40px] px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold bg-[var(--p)] text-white transition hover:opacity-90 active:scale-[0.98]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Hear it
          </button>
          <button
            onClick={handlePlaySlow}
            aria-label="Play slowly"
            className="min-h-[40px] px-3.5 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold border border-[var(--border2)] text-[var(--t1)] hover:bg-[var(--card-h)] transition active:scale-[0.98]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Slow
          </button>
          <motion.button
            onClick={handleComplete}
            whileTap={{ scale: 0.98 }}
            className={
              "flex-1 min-h-[40px] px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition " +
              (completed
                ? "bg-[var(--p)] text-white"
                : "border border-[var(--p)] text-[var(--p)] hover:bg-[var(--card-h)]")
            }
          >
            {completed ? (
              <>
                <Check className="w-3.5 h-3.5" /> Done
              </>
            ) : (
              <>
                Mark Done <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Footer note — subtle separator */}
        <div className="mt-4 pt-3 flex items-center justify-between text-[10px] font-mono text-[var(--t3)] border-t border-[var(--border)]">
          <span>New challenge daily · {DAILY_CHALLENGES.length} total</span>
          <span className="flex items-center gap-1.5">
            {completed ? (
              <>
                <Check className="w-3 h-3 text-[var(--gr)]" />
                <span className="text-[var(--t2)]">Completed today</span>
              </>
            ) : (
              <span>Not done yet</span>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
