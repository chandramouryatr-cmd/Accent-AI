"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, X, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { getLessonsForPhase, ALL_LESSONS } from "@/lib/lessons";

interface BadgeDef {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  /** category for visual styling */
  category: "lesson" | "streak" | "phase" | "xp";
  /** function computing current progress (0..target) and target */
  progress: (state: {
    completedCount: number;
    streak: number;
    xp: number;
    lessons: Record<string, { completed: boolean }>;
  }) => { current: number; target: number };
}

const BADGES: BadgeDef[] = [
  {
    id: "first-score",
    emoji: "🎯",
    name: "First Score",
    desc: "Complete your first lesson",
    category: "lesson",
    progress: (s) => ({ current: Math.min(1, s.completedCount), target: 1 }),
  },
  {
    id: "streak-7",
    emoji: "🔥",
    name: "7-Day Streak",
    desc: "Practice 7 days in a row",
    category: "streak",
    progress: (s) => ({ current: Math.min(7, s.streak), target: 7 }),
  },
  ...PHASES.map((p, i) => ({
    id: `phase-${i + 1}`,
    emoji: p.emoji,
    name: p.badge.split(" ")[0],
    desc: `Complete Phase ${i + 1}: ${p.name}`,
    category: "phase" as const,
    progress: ((phaseIdx: number) => (s: { lessons: Record<string, { completed: boolean }> }) => {
      const phaseLessons = getLessonsForPhase(phaseIdx);
      const done = phaseLessons.filter((l) => s.lessons[l.id]?.completed).length;
      return { current: done, target: phaseLessons.length };
    })(i),
  })),
  {
    id: "50-lessons",
    emoji: "📚",
    name: "Scholar",
    desc: "Complete 50 lessons",
    category: "lesson",
    progress: (s) => ({ current: Math.min(50, s.completedCount), target: 50 }),
  },
  {
    id: "1000-xp",
    emoji: "💎",
    name: "XP Hunter",
    desc: "Earn 1,000 XP",
    category: "xp",
    progress: (s) => ({ current: Math.min(1000, s.xp), target: 1000 }),
  },
];

const CAT_COLOR: Record<BadgeDef["category"], string> = {
  lesson: "#a78bfa",
  streak: "#f59e0b",
  phase: "#22d3ee",
  xp: "#10b981",
};

/**
 * AchievementGallery — richer badge display with progress bars and
 * a detail popover showing the requirement and current progress.
 */
export function AchievementGallery() {
  const lessons = useAppStore((s) => s.lessons);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const [openId, setOpenId] = useState<string | null>(null);

  const completedCount = Object.values(lessons).filter((l) => l.completed).length;

  const badges = useMemo(() => {
    return BADGES.map((b) => {
      const p = b.progress({ completedCount, streak, xp, lessons });
      const earned = p.current >= p.target;
      return { ...b, current: p.current, target: p.target, earned, pct: Math.round((p.current / p.target) * 100) };
    });
  }, [completedCount, streak, xp, lessons]);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-d text-base font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
          <span>Achievements</span>
        </h2>
        <div className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
          <span className="text-[#f59e0b] font-bold">{earnedCount}</span>
          <span className="opacity-50"> / {badges.length} earned</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {badges.map((b, i) => {
          const color = CAT_COLOR[b.category];
          const isOpen = openId === b.id;
          return (
            <motion.div
              key={b.id}
              role="button"
              tabIndex={0}
              onClick={() => setOpenId(isOpen ? null : b.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpenId(isOpen ? null : b.id); } }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative rounded-2xl p-3 text-center border transition overflow-hidden cursor-pointer ${
                b.earned
                  ? "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)]"
                  : "bg-[var(--card)] border-[var(--border)]"
              }`}
              style={
                b.earned
                  ? { boxShadow: `0 0 16px ${color}22` }
                  : undefined
              }
            >
              {/* Earned shimmer sweep */}
              {b.earned && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 w-1/3"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}22, transparent)`,
                    }}
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 3 + i * 0.3,
                    }}
                  />
                </div>
              )}

              {/* Emoji with earned animation */}
              <div className="relative">
                <motion.div
                  className={`text-3xl mb-1 ${b.earned ? "" : "grayscale opacity-40"}`}
                  animate={b.earned ? { scale: [1, 1.08, 1] } : {}}
                  transition={{
                    duration: 3,
                    repeat: b.earned ? Infinity : 0,
                    repeatDelay: 2 + i * 0.2,
                    ease: "easeInOut",
                  }}
                >
                  {b.earned ? b.emoji : <Lock className="w-5 h-5 mx-auto text-[var(--t3)]" />}
                </motion.div>
                <div
                  className={`text-[10px] font-semibold leading-tight ${b.earned ? "" : "text-[var(--t3)]"}`}
                  style={b.earned ? { color } : undefined}
                >
                  {b.name}
                </div>
                {/* Mini progress bar (only when not earned) */}
                {!b.earned && (
                  <div className="mt-1.5 h-0.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.04 }}
                    />
                  </div>
                )}
                {b.earned && (
                  <div className="mt-1 flex items-center justify-center gap-0.5 text-[8px] font-mono text-[#10b981] uppercase tracking-wider">
                    <Check className="w-2 h-2" />
                    <span>Unlocked</span>
                  </div>
                )}
              </div>

              {/* Popout detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 w-44 rounded-xl p-3 bg-[var(--bg2)] border border-[var(--border2)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{b.emoji}</span>
                        <div
                          className="font-d text-xs font-bold"
                          style={{ color: b.earned ? color : "var(--t2)" }}
                        >
                          {b.name}
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenId(null)}
                        className="text-[var(--t3)] hover:text-[var(--t1)] -mt-0.5"
                        aria-label="Close"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-[var(--t2)] leading-relaxed mb-2">
                      {b.desc}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[var(--t3)] uppercase tracking-wider">Progress</span>
                      <span style={{ color }} className="font-bold">
                        {b.current} / {b.target}
                      </span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${b.pct}%`, background: color }}
                      />
                    </div>
                    <div className="mt-1.5 text-[9px] font-mono text-[var(--t3)] text-right">
                      {b.earned ? "✓ Unlocked" : `${100 - b.pct}% to go`}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
