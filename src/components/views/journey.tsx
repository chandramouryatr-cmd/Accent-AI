"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ChevronDown, Play } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { getLessonsForPhase } from "@/lib/lessons";

export function JourneyView() {
  const lessons = useAppStore((s) => s.lessons);
  const expandedPhase = useAppStore((s) => s.expandedPhase);
  const setExpandedPhase = useAppStore((s) => s.setExpandedPhase);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const accent = useAppStore((s) => s.accent);

  // Precompute progress + unlock state for all phases
  const phaseInfo = useMemo(() => {
    const unlocked = [true];
    for (let i = 1; i < PHASES.length; i++) {
      const prevLessons = getLessonsForPhase(i - 1);
      const prevDone = prevLessons.every((l) => lessons[l.id]?.completed);
      unlocked.push(prevDone);
    }
    return PHASES.map((phase, i) => {
      const phaseLessons = getLessonsForPhase(i);
      const done = phaseLessons.filter((l) => lessons[l.id]?.completed).length;
      const total = phaseLessons.length;
      return {
        phase,
        lessons: phaseLessons,
        done,
        total,
        pct: total === 0 ? 0 : Math.round((done / total) * 100),
        isUnlocked: unlocked[i],
        isDone: done === total,
      };
    });
  }, [lessons]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs mb-3">
          {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()} English Accent
        </div>
        <h1 className="font-d text-3xl font-bold mb-1">
          Your Learning <span className="grad-text">Journey</span>
        </h1>
        <p className="text-sm text-[var(--t2)]">
          Complete phases to unlock native-level fluency
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#6366f1] via-[#8b5cf6] to-[#22d3ee] opacity-30" />

        <div className="space-y-3">
          {phaseInfo.map(({ phase, lessons: phaseLessons, done, total, pct, isUnlocked, isDone }, i) => {
            const isExpanded = expandedPhase === i;
            const isCurrent = isUnlocked && !isDone;

            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-16"
              >
                <div
                  className={`absolute left-0 top-3 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    isDone
                      ? "bg-[var(--grad-btn)] text-white"
                      : isCurrent
                      ? "bg-[rgba(99,102,241,0.15)] border-2 border-[var(--p)]"
                      : "bg-[var(--card)] border border-[var(--border)] opacity-50"
                  }`}
                >
                  {isDone ? <Check className="w-6 h-6" /> : !isUnlocked ? <Lock className="w-5 h-5" /> : phase.emoji}
                </div>

                <div
                  className={`rounded-2xl border overflow-hidden transition ${
                    isCurrent
                      ? "bg-[rgba(99,102,241,0.06)] border-[rgba(99,102,241,0.3)]"
                      : "bg-[var(--card)] border-[var(--border)]"
                  } ${!isUnlocked ? "opacity-60" : ""}`}
                >
                  <button
                    onClick={() => isUnlocked && setExpandedPhase(isExpanded ? null : i)}
                    disabled={!isUnlocked}
                    className="w-full p-4 text-left flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
                          Phase {i + 1}
                        </span>
                        {isDone && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] font-bold">
                            DONE
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(99,102,241,0.15)] text-[#a78bfa] font-bold animate-pulse">
                            CURRENT
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(245,158,11,0.15)] text-[#f59e0b] font-bold">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <h3 className="font-d font-bold text-base text-[var(--t1)]">{phase.name}</h3>
                      <p className="text-xs text-[var(--t2)]">{phase.desc}</p>

                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                          <motion.div
                            className="h-full bg-[var(--grad-btn)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--t2)]">
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    {isUnlocked && (
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronDown className="w-4 h-4 text-[var(--t3)]" />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && isUnlocked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-[var(--border)]"
                      >
                        <div className="p-3 space-y-2">
                          {phaseLessons.map((lesson, li) => {
                            const prog = lessons[lesson.id];
                            const isLessonDone = prog?.completed;
                            const isLessonInProgress = prog && !prog.completed;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson.id)}
                                className="w-full p-3 rounded-xl bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition flex items-center gap-3 text-left"
                              >
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-mono font-bold shrink-0 ${
                                    isLessonDone
                                      ? "bg-[var(--grad-btn)] text-white"
                                      : isLessonInProgress
                                      ? "bg-[rgba(99,102,241,0.15)] text-[var(--p3)]"
                                      : "bg-[var(--card)] text-[var(--t3)] border border-[var(--border)]"
                                  }`}
                                >
                                  {isLessonDone ? <Check className="w-4 h-4" /> : li + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-[var(--t1)] truncate">
                                    {lesson.title}
                                  </div>
                                  <div className="text-[10px] text-[var(--t3)] flex items-center gap-2">
                                    <span>⏱ {lesson.duration} min</span>
                                    <span>⚡ {lesson.xp} XP</span>
                                    {isLessonDone && <span className="text-[#10b981]">✓ {prog.score}%</span>}
                                  </div>
                                </div>
                                <Play className="w-4 h-4 text-[var(--t3)] shrink-0" />
                              </button>
                            );
                          })}
                        </div>

                        <div className="px-3 pb-3">
                          <div className="rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] flex items-center gap-3">
                            <div className="text-2xl">🏅</div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
                                Phase Badge
                              </div>
                              <div className="text-sm font-semibold text-[#f59e0b]">{phase.badge}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
