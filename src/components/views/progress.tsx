"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSONS, getLessonsForPhase } from "@/lib/lessons";
import { ProgressRing } from "@/components/widgets/progress-ring";

const ALL_BADGES = [
  { id: "first-score", emoji: "🎯", name: "First Score", desc: "Complete your first lesson" },
  { id: "streak-7", emoji: "🔥", name: "7-Day Streak", desc: "Practice 7 days in a row" },
  { id: "phase-1", emoji: "🔈", name: "Sound Seeker", desc: "Complete Phase 1" },
  { id: "phase-2", emoji: "📖", name: "Word Warrior", desc: "Complete Phase 2" },
  { id: "phase-3", emoji: "🎵", name: "Rhythm Rider", desc: "Complete Phase 3" },
  { id: "phase-4", emoji: "💬", name: "Chat Champion", desc: "Complete Phase 4" },
  { id: "phase-5", emoji: "⚡", name: "Speed Speaker", desc: "Complete Phase 5" },
  { id: "phase-6", emoji: "🪞", name: "Mirror Master", desc: "Complete Phase 6" },
  { id: "phase-7", emoji: "🌍", name: "World Ready", desc: "Complete Phase 7" },
  { id: "phase-8", emoji: "👑", name: "Accent Master", desc: "Complete Phase 8" },
  { id: "50-lessons", emoji: "📚", name: "Scholar", desc: "Complete 50 lessons" },
  { id: "1000-xp", emoji: "💎", name: "XP Hunter", desc: "Earn 1000 XP" },
];

export function ProgressView() {
  const lessons = useAppStore((s) => s.lessons);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const history = useAppStore((s) => s.history);
  const badges = useAppStore((s) => s.badges);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

  const completedCount = Object.values(lessons).filter((l) => l.completed).length;
  const totalLessons = ALL_LESSONS.length;
  const overallPct = Math.round((completedCount / totalLessons) * 100);

  // Compute which badges are earned based on state
  const earnedBadges = useMemo(() => {
    const earned = new Set<string>(badges);
    if (completedCount >= 1) earned.add("first-score");
    if (streak >= 7) earned.add("streak-7");
    PHASES.forEach((p) => {
      const phaseLessons = getLessonsForPhase(p.id);
      const allDone = phaseLessons.every((l) => lessons[l.id]?.completed);
      if (allDone) earned.add(`phase-${p.id + 1}`);
    });
    if (completedCount >= 50) earned.add("50-lessons");
    if (xp >= 1000) earned.add("1000-xp");
    return earned;
  }, [badges, completedCount, streak, lessons, xp]);

  // Rank
  const rank = useMemo(() => {
    if (overallPct >= 100) return { name: "Accent Master", emoji: "👑", next: null, pct: 100 };
    if (overallPct >= 75) return { name: "Native-like Speaker", emoji: "🌟", next: "Accent Master", pct: overallPct };
    if (overallPct >= 50) return { name: "Fluent Speaker", emoji: "🏆", next: "Native-like Speaker", pct: overallPct };
    if (overallPct >= 25) return { name: "Clear Speaker", emoji: "💬", next: "Fluent Speaker", pct: overallPct };
    if (overallPct >= 1) return { name: "Beginner Speaker", emoji: "🌱", next: "Clear Speaker", pct: overallPct };
    return { name: "New Learner", emoji: "🌱", next: "Beginner Speaker", pct: 0 };
  }, [overallPct]);

  const rankSteps = [
    { name: "New Learner", emoji: "🌱" },
    { name: "Beginner Speaker", emoji: "📖" },
    { name: "Clear Speaker", emoji: "💬" },
    { name: "Fluent Speaker", emoji: "🏆" },
    { name: "Native-like Speaker", emoji: "🌟" },
    { name: "Accent Master", emoji: "👑" },
  ];
  const currentRankIdx = rankSteps.findIndex((r) => r.name === rank.name);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-d text-3xl font-bold mb-1">
          Your <span className="grad-text">Progress</span>
        </h1>
        <p className="text-sm text-[var(--t2)]">Track your accent mastery journey</p>
      </div>

      {/* Rank card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] flex items-center gap-4 relative overflow-hidden"
      >
        {/* Shimmer sweep on progress bar */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          />
        </div>
        <div className="text-5xl animate-gold-glow rounded-full p-1">{rank.emoji}</div>
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">Current Rank</div>
          <div className="font-d text-lg font-bold text-[var(--t1)]">{rank.name}</div>
          {rank.next && (
            <>
              <div className="mt-2 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--grad-btn)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${rank.pct}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="text-[10px] text-[var(--t3)] mt-1">
                {overallPct}% to {rank.next}
              </div>
            </>
          )}
        </div>
        <ProgressRing pct={overallPct} size={62} stroke={4} label={`${overallPct}%`} />
      </motion.div>

      {/* Rank ladder */}
      <div className="flex items-center justify-between px-1 relative">
        {/* Animated connector line */}
        <div className="absolute inset-x-8 top-4 h-0.5 bg-[var(--border)]" />
        <motion.div
          className="absolute top-4 h-0.5 bg-[var(--grad-btn)] origin-left"
          initial={{ width: 0 }}
          animate={{ width: `${(currentRankIdx / (rankSteps.length - 1)) * 100}%`, left: "2rem", right: "auto" }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ maxWidth: "calc(100% - 4rem)" }}
        />
        {rankSteps.map((r, i) => (
          <div key={r.name} className="flex flex-col items-center gap-1 flex-1 relative z-10">
            <motion.div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition ${
                i <= currentRankIdx
                  ? "bg-[var(--grad-btn)] text-white"
                  : "bg-[var(--card)] text-[var(--t3)] border border-[var(--border)]"
              }`}
              animate={i === currentRankIdx ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: i === currentRankIdx ? Infinity : 0, ease: "easeInOut" }}
              style={i === currentRankIdx ? { boxShadow: "0 0 16px rgba(99,102,241,0.5)" } : {}}
            >
              {r.emoji}
            </motion.div>
            <span
              className={`text-[9px] text-center leading-tight ${
                i === currentRankIdx ? "text-[var(--p3)] font-bold" : "text-[var(--t3)]"
              }`}
            >
              {r.name}
            </span>
          </div>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] text-center"
          style={{ borderTop: "3px solid var(--p)" }}
        >
          <div className="font-d text-2xl font-bold text-[var(--p3)]">{completedCount}</div>
          <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider">Lessons</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] text-center"
          style={{ borderTop: "3px solid #f59e0b" }}
        >
          <div className="font-d text-2xl font-bold text-[#f59e0b]">{xp}</div>
          <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider">Total XP</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] text-center"
          style={{ borderTop: "3px solid #10b981" }}
        >
          <div className="font-d text-2xl font-bold text-[#10b981]">{earnedBadges.size}</div>
          <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider">Badges</div>
        </motion.div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Badges Earned</h2>
        <div className="grid grid-cols-3 gap-2">
          {ALL_BADGES.map((b) => {
            const earned = earnedBadges.has(b.id);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={earned ? { opacity: 1, scale: [1, 1.02, 1] } : { opacity: 1, scale: 1 }}
                transition={earned ? { duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" } : {}}
                className={`rounded-2xl p-3 text-center border transition ${
                  earned
                    ? "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.3)] animate-gold-glow"
                    : "bg-[var(--card)] border-[var(--border)] opacity-40"
                }`}
              >
                <div className={`text-3xl mb-1 ${earned ? "" : "grayscale"}`}>{b.emoji}</div>
                <div className={`text-[10px] font-semibold ${earned ? "text-[#f59e0b]" : "text-[var(--t3)]"}`}>
                  {b.name}
                </div>
                <div className="text-[8px] text-[var(--t3)] mt-0.5 leading-tight">{b.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Recent Activity</h2>
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          {history.length === 0 ? (
            <div className="text-center py-6 text-sm text-[var(--t3)]">
              No activity yet. Start a lesson to begin!
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 8).map((h, i) => {
                const lesson = ALL_LESSONS.find((l) => l.id === h.lessonId);
                return (
                  <button
                    key={i}
                    onClick={() => h.lessonId && setActiveLesson(h.lessonId)}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--p3)] transition flex items-center gap-3 text-left"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{
                        background:
                          h.score >= 80
                            ? "rgba(16,185,129,0.15)"
                            : h.score >= 70
                            ? "rgba(99,102,241,0.15)"
                            : "rgba(245,158,11,0.15)",
                        color:
                          h.score >= 80 ? "#10b981" : h.score >= 70 ? "#a78bfa" : "#f59e0b",
                      }}
                    >
                      {h.score}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--t1)] truncate">
                        {lesson?.title || h.lessonId}
                      </div>
                      <div className="text-[10px] text-[var(--t3)]">
                        {new Date(h.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
