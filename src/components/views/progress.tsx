"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSONS, getLessonsForPhase } from "@/lib/lessons";
import { ProgressRing } from "@/components/widgets/progress-ring";
import { AchievementGallery } from "@/components/widgets/achievement-gallery";
import { PhonemeMastery } from "@/components/widgets/phoneme-mastery";
import { ShareCard, useShareCardState } from "@/components/widgets/share-card";

// ─── Practice Calendar Heatmap ─────────────────────────────────────────────
const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function heatColor(count: number): string {
  if (count <= 0) return "rgba(99,102,241,0.06)"; // dim
  if (count <= 2) return "rgba(99,102,241,0.35)"; // light
  if (count <= 4) return "rgba(99,102,241,0.65)"; // medium
  return "rgba(139,92,246,0.95)"; // bright (violet)
}

function PracticeCalendarHeatmap() {
  const practiceCalendar = useAppStore((s) => s.practiceCalendar);

  const { grid, monthLabels, todayKey, hasAny } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Sunday of the current week
    const currentSun = new Date(today);
    currentSun.setDate(currentSun.getDate() - today.getDay());
    // Start = 11 weeks before current week's Sunday
    const startSun = new Date(currentSun);
    startSun.setDate(startSun.getDate() - (WEEKS - 1) * 7);

    const tKey = dateKey(today);
    const cells: { date: string; count: number; isToday: boolean; isFuture: boolean }[] = [];
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const cellDate = new Date(startSun);
        cellDate.setDate(startSun.getDate() + w * 7 + d);
        const key = dateKey(cellDate);
        cells.push({
          date: key,
          count: practiceCalendar[key] || 0,
          isToday: key === tKey,
          isFuture: cellDate.getTime() > today.getTime(),
        });
      }
    }

    // Month labels — for each week column, show month name when first day of month appears in column
    const labels: (string | null)[] = [];
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const weekDates: Date[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const cellDate = new Date(startSun);
        cellDate.setDate(startSun.getDate() + w * 7 + d);
        weekDates.push(cellDate);
      }
      // Use the first day of the week that starts a new month, or the first day of the week
      const firstOfMonth = weekDates.find((d) => d.getDate() === 1);
      const refDate = firstOfMonth ?? weekDates[0];
      const m = refDate.getMonth();
      if (m !== lastMonth) {
        labels.push(MONTH_NAMES[m]);
        lastMonth = m;
      } else {
        labels.push(null);
      }
    }

    const any = Object.values(practiceCalendar).some((v) => v > 0);
    return { grid: cells, monthLabels: labels, todayKey: tKey, hasAny: any };
  }, [practiceCalendar]);

  if (!hasAny) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center"
      >
        <div className="text-3xl mb-2">🔥</div>
        <div className="font-d text-sm font-semibold text-[var(--t1)] mb-1">
          Practice Calendar
        </div>
        <div className="text-xs text-[var(--t3)]">
          Start practicing to fill your calendar! 🔥
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-d text-base font-bold">Practice Calendar</h2>
        <span className="text-[10px] text-[var(--t3)] font-mono uppercase tracking-wider">
          Last {WEEKS} weeks
        </span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pb-1">
        <div className="inline-flex flex-col gap-1 w-max">
          {/* Month labels row */}
          <div className="flex gap-1 pl-5">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="w-3 text-[9px] text-[var(--t3)] font-mono leading-none overflow-visible whitespace-nowrap"
              >
                {m || ""}
              </div>
            ))}
          </div>

          {/* Grid: day labels + cells */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 w-4 shrink-0">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div
                  key={d}
                  className="h-3 text-[9px] text-[var(--t3)] font-mono leading-[0.75rem] text-right pr-0.5"
                >
                  {d === 1 ? "M" : d === 3 ? "W" : d === 5 ? "F" : ""}
                </div>
              ))}
            </div>

            {/* Cells: 12 columns */}
            {Array.from({ length: WEEKS }).map((_, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {Array.from({ length: DAYS_PER_WEEK }).map((_, dayIdx) => {
                  const cell = grid[weekIdx * DAYS_PER_WEEK + dayIdx];
                  const bg = cell.isFuture ? "transparent" : heatColor(cell.count);
                  const border = cell.isToday
                    ? "1.5px solid rgba(99,102,241,0.9)"
                    : "1px solid var(--overlay-1)";
                  return (
                    <motion.div
                      key={dayIdx}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: (weekIdx * DAYS_PER_WEEK + dayIdx) * 0.004,
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                      title={
                        cell.isFuture
                          ? `${cell.date}`
                          : `${cell.date} — ${cell.count} lesson${cell.count === 1 ? "" : "s"}`
                      }
                      className="h-3 w-3 rounded-[3px] cursor-default"
                      style={{
                        background: bg,
                        border: border,
                        boxShadow: cell.isToday
                          ? "0 0 6px rgba(99,102,241,0.6)"
                          : "none",
                        animation: cell.isToday
                          ? "pulse 1.8s ease-in-out infinite"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-2 pl-5">
            <span className="text-[9px] text-[var(--t3)] font-mono uppercase tracking-wider">
              Less
            </span>
            <div
              className="h-3 w-3 rounded-[3px]"
              style={{ background: heatColor(0), border: "1px solid var(--overlay-1)" }}
              title="0 lessons"
            />
            <div
              className="h-3 w-3 rounded-[3px]"
              style={{ background: heatColor(1), border: "1px solid var(--overlay-1)" }}
              title="1-2 lessons"
            />
            <div
              className="h-3 w-3 rounded-[3px]"
              style={{ background: heatColor(3), border: "1px solid var(--overlay-1)" }}
              title="3-4 lessons"
            />
            <div
              className="h-3 w-3 rounded-[3px]"
              style={{ background: heatColor(5), border: "1px solid var(--overlay-1)" }}
              title="5+ lessons"
            />
            <span className="text-[9px] text-[var(--t3)] font-mono uppercase tracking-wider">
              More
            </span>
          </div>
        </div>
      </div>

      {/* Today marker label */}
      <div className="text-[10px] text-[var(--t3)] mt-2 text-center">
        Today: <span className="text-[var(--p3)] font-semibold">{todayKey}</span>
      </div>
    </motion.div>
  );
}

export function ProgressView() {
  const lessons = useAppStore((s) => s.lessons);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const history = useAppStore((s) => s.history);
  const badges = useAppStore((s) => s.badges);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

  const shareCard = useShareCardState();
  const [shareHover, setShareHover] = useState(false);

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
              <div className="mt-2 h-1.5 rounded-full bg-[var(--overlay-border-1)] overflow-hidden">
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
        <div className="flex flex-col items-end gap-2">
          <ProgressRing pct={overallPct} size={62} stroke={4} label={`${overallPct}%`} />
          <motion.button
            onClick={shareCard.openShare}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onMouseEnter={() => setShareHover(true)}
            onMouseLeave={() => setShareHover(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white border-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: shareHover
                ? "0 6px 20px rgba(99,102,241,0.5)"
                : "0 4px 12px rgba(99,102,241,0.35)",
              transition: "box-shadow 0.2s ease",
            }}
            aria-label="Share my progress"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share My Progress
          </motion.button>
        </div>
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

      {/* Practice Calendar Heatmap */}
      <PracticeCalendarHeatmap />

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
        <div className="flex items-center justify-end mb-1.5 -mt-1">
          <motion.button
            onClick={shareCard.openShare}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-[var(--t2)] hover:text-[var(--t1)] bg-transparent border border-[var(--border)] hover:border-[var(--p3)] transition"
            aria-label="Share my badges"
          >
            <Share2 className="w-3 h-3" />
            Share
          </motion.button>
        </div>
        <AchievementGallery />
      </div>

      {/* Phoneme Mastery — horizontal bars + spotlight on weakest */}
      <PhonemeMastery />

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

      {/* Share card modal — controlled by shareCard.open state */}
      <ShareCard open={shareCard.open} onOpenChange={shareCard.setOpen} />
    </div>
  );
}
