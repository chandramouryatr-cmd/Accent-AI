"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Check, Clock, Zap, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS, getLessonsForPhase } from "@/lib/lessons";
import { PHASES } from "@/lib/types";

/**
 * RecentLessonsCarousel — Horizontal scroller showing lessons the user
 * has touched (in-progress or completed), most recent first. Allows one
 * tap to resume. Completed lessons show their best score; in-progress
 * lessons show a "Resume" pill.
 *
 * Falls back to "Recommended Next Lessons" (next 3 incomplete lessons
 * in order) when no lessons have been started yet.
 */
export function RecentLessonsCarousel() {
  const lessons = useAppStore((s) => s.lessons);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  // Build list of lessons the user has touched (in-progress + completed),
  // sorted by most recently touched (using completedAt; for in-progress,
  // we use the entry's presence in store as a proxy).
  const recent = useMemo(() => {
    const touched = ALL_LESSONS.filter((l) => lessons[l.id]);
    touched.sort((a, b) => {
      const ta = lessons[a.id]?.completedAt ?? 0;
      const tb = lessons[b.id]?.completedAt ?? 0;
      // In-progress (completedAt null) treated as just-touched → sort first
      const aTime = ta || Date.now();
      const bTime = tb || Date.now();
      return bTime - aTime;
    });
    return touched.slice(0, 6);
  }, [lessons]);

  // Fallback: next 3 incomplete lessons if nothing started
  const recommended = useMemo(() => {
    if (recent.length > 0) return [];
    const next: typeof ALL_LESSONS = [];
    for (const l of ALL_LESSONS) {
      if (!lessons[l.id]?.completed) {
        next.push(l);
        if (next.length >= 3) break;
      }
    }
    return next;
  }, [recent, lessons]);

  const items = recent.length > 0 ? recent : recommended;
  const isResume = recent.length > 0;

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-d text-base font-bold flex items-center gap-2">
          <span>{isResume ? "📚" : "✨"}</span>
          <span>{isResume ? "Continue Learning" : "Start Here"}</span>
        </h2>
        <button
          onClick={() => setActiveTab("journey")}
          className="text-[10px] text-[var(--t3)] hover:text-[var(--p3)] transition flex items-center gap-0.5 font-mono uppercase tracking-wider"
        >
          All
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
        {items.map((lesson, i) => {
          const prog = lessons[lesson.id];
          const isDone = prog?.completed;
          const isInProgress = prog && !prog.completed;
          const phase = PHASES[lesson.phaseId];
          const phaseLessons = getLessonsForPhase(lesson.phaseId);
          const lessonNumber = phaseLessons.findIndex((l) => l.id === lesson.id) + 1;

          return (
            <motion.button
              key={lesson.id}
              onClick={() => setActiveLesson(lesson.id)}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="snap-start shrink-0 w-[210px] text-left rounded-2xl p-3.5 bg-[var(--card)] border border-[var(--border)] hover:border-[rgba(99,102,241,0.45)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.18)] transition relative overflow-hidden group"
            >
              {/* Phase color tint overlay */}
              <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{ background: phase.color }}
              />

              {/* Phase tag */}
              <div className="relative flex items-center justify-between mb-2">
                <div className="text-[9px] uppercase tracking-wider font-mono text-[var(--t3)] flex items-center gap-1">
                  <span>{phase.emoji}</span>
                  <span>P{lesson.phaseId + 1}·L{lessonNumber}</span>
                </div>
                {isDone ? (
                  <div className="w-5 h-5 rounded-full bg-[var(--grad-btn)] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : isInProgress ? (
                  <div className="px-1.5 py-0.5 rounded-full bg-[rgba(99,102,241,0.15)] text-[var(--p3)] text-[8px] font-bold uppercase tracking-wider">
                    Resume
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[var(--card-h)] border border-[var(--border)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(99,102,241,0.2)] transition">
                    <Play className="w-2.5 h-2.5 text-[var(--t3)] group-hover:text-[var(--p3)] transition" fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="relative font-d text-sm font-bold text-[var(--t1)] leading-snug mb-1 line-clamp-2 min-h-[2.4em]">
                {lesson.title}
              </div>
              <div className="relative text-[10px] text-[var(--t3)] mb-2.5 line-clamp-1">
                {lesson.subtitle}
              </div>

              {/* Meta row */}
              <div className="relative flex items-center gap-2 text-[10px] text-[var(--t3)] font-mono">
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {lesson.duration}m
                </span>
                <span className="flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-[#a78bfa]" />
                  {lesson.xp} XP
                </span>
                {isDone && (
                  <span className="ml-auto text-[#10b981] font-bold">
                    {prog.score}%
                  </span>
                )}
              </div>

              {/* Progress bar (only for in-progress) */}
              {isInProgress && prog.stepsViewed > 0 && (
                <div className="relative mt-2 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--p)] to-[var(--p3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (prog.stepsViewed / lesson.steps.length) * 100)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04 + 0.1 }}
                  />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
