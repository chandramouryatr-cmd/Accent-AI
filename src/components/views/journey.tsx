"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ChevronDown, Play, Search, Star } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSONS, getLessonsForPhase } from "@/lib/lessons";
import { DifficultyBadge } from "@/components/widgets/difficulty-badge";

/** Check if a completed lesson needs review (>2 days since completion or last review) */
function needsReview(completedAt: number | null, lastReviewedAt: number | null): boolean {
  if (!completedAt) return false;
  const referenceTime = lastReviewedAt && lastReviewedAt > completedAt ? lastReviewedAt : completedAt;
  const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
  return Date.now() - referenceTime > twoDaysMs;
}

/** Animated "🔄 Review" badge */
function ReviewBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-[9px] font-bold text-[#f59e0b] shrink-0"
    >
      <motion.span
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="inline-block text-[10px]"
      >
        🔄
      </motion.span>
      Review
    </motion.span>
  );
}

export function JourneyView() {
  const lessons = useAppStore((s) => s.lessons);
  const expandedPhase = useAppStore((s) => s.expandedPhase);
  const setExpandedPhase = useAppStore((s) => s.setExpandedPhase);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const accent = useAppStore((s) => s.accent);
  const bookmarkedLessons = useAppStore((s) => s.bookmarkedLessons);
  const toggleBookmark = useAppStore((s) => s.toggleBookmark);
  const devMode = useAppStore((s) => s.devMode);

  const [searchQuery, setSearchQuery] = useState("");

  // Precompute progress + unlock state for all phases
  const phaseInfo = useMemo(() => {
    const unlocked = [true];
    for (let i = 1; i < PHASES.length; i++) {
      const prevLessons = getLessonsForPhase(i - 1);
      const prevDone = prevLessons.every((l) => lessons[l.id]?.completed);
      unlocked.push(prevDone || devMode);  // devMode unlocks everything
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
  }, [lessons, devMode]);

  // Filter logic
  const isSearching = searchQuery.trim().length > 0;

  // Flat list of all lessons with their phase index (for search results)
  const allLessonsFlat = useMemo(() => {
    return ALL_LESSONS.map((lesson) => {
      const prog = lessons[lesson.id];
      const isBookmarked = bookmarkedLessons.includes(lesson.id);
      let status: "completed" | "in-progress" | "not-started";
      if (prog?.completed) {
        status = "completed";
      } else if (prog && !prog.completed) {
        status = "in-progress";
      } else {
        status = "not-started";
      }
      return { lesson, phaseIdx: lesson.phaseId, status, isBookmarked };
    });
  }, [lessons, bookmarkedLessons]);

  // Apply search
  const filteredLessons = useMemo(() => {
    if (!isSearching) return allLessonsFlat;
    const q = searchQuery.trim().toLowerCase();
    return allLessonsFlat.filter((item) =>
      item.lesson.title.toLowerCase().includes(q)
    );
  }, [allLessonsFlat, isSearching, searchQuery]);

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

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--t3)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] text-sm text-[var(--t1)] placeholder:text-[var(--t3)] outline-none focus:border-[var(--p3)] transition"
        />
      </div>

      {/* Search results — flat list */}
      {isSearching ? (
        <div className="space-y-2">
          {filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-sm text-[var(--t2)]">No lessons match your search</div>
            </div>
          ) : (
            filteredLessons.map(({ lesson, phaseIdx, status, isBookmarked }) => {
              const prog = lessons[lesson.id];
              const isLessonDone = status === "completed";
              const isLessonInProgress = status === "in-progress";
              const showReviewBadge = isLessonDone && needsReview(prog?.completedAt ?? null, prog?.lastReviewedAt ?? null);
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] transition flex items-center gap-3 p-3"
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
                    {isLessonDone ? <Check className="w-4 h-4" /> : phaseIdx + 1}
                  </div>
                  <button
                    onClick={() => setActiveLesson(lesson.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="text-sm font-medium text-[var(--t1)] truncate flex items-center gap-2">
                      <span className="truncate">{lesson.title}</span>
                      {showReviewBadge && <ReviewBadge />}
                    </div>
                    <div className="text-[10px] text-[var(--t3)] flex items-center gap-2 flex-wrap">
                      <span>Phase {phaseIdx + 1}</span>
                      <span>⏱ {lesson.duration} min</span>
                      <span>⚡ {lesson.xp} XP</span>
                      <DifficultyBadge lesson={lesson} size="xs" animate={false} />
                      {isLessonDone && <span className="text-[#10b981]">✓ {prog.score}%</span>}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(lesson.id);
                    }}
                    className="shrink-0 p-1 hover:scale-110 transition-transform"
                  >
                    <motion.div
                      key={isBookmarked ? "filled" : "outline"}
                      initial={isBookmarked ? { scale: 0.5 } : undefined}
                      animate={{ scale: 1 }}
                      transition={isBookmarked ? { type: "spring", stiffness: 400, damping: 10 } : {}}
                    >
                      {isBookmarked ? (
                        <Star className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
                      ) : (
                        <Star className="w-5 h-5 text-[var(--t3)]" />
                      )}
                    </motion.div>
                  </button>
                  <button
                    onClick={() => setActiveLesson(lesson.id)}
                    className="shrink-0"
                  >
                    <Play className="w-4 h-4 text-[var(--t3)]" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      ) : (
        /* Normal phase-grouped view */
        <div className="relative">
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
                  {/* Phase color gradient background */}
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.04]"
                    style={{ background: `linear-gradient(135deg, ${phase.color}66, transparent)` }}
                  />
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
                        : "bg-[var(--overlay-1)] border-[var(--border)]"
                    } ${!isUnlocked ? "opacity-60" : ""}`}
                    style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
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
                          <div className="flex-1 h-1.5 rounded-full bg-[var(--overlay-border-1)] overflow-hidden">
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
                              const isBookmarked = bookmarkedLessons.includes(lesson.id);
                              const showReviewBadge = isLessonDone && needsReview(prog?.completedAt ?? null, prog?.lastReviewedAt ?? null);
                              return (
                                <motion.div
                                  key={lesson.id}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: li * 0.06, duration: 0.25 }}
                                  className="w-full p-3 rounded-xl bg-[var(--bg2)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition flex items-center gap-3 text-left relative"
                                >
                                  {/* Colored progress indicator */}
                                  <div
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full"
                                    style={{
                                      height: isLessonDone ? "60%" : isLessonInProgress ? "40%" : "15%",
                                      background: isLessonDone ? "#10b981" : isLessonInProgress ? "#6366f1" : "var(--border2)",
                                      boxShadow: isLessonDone ? "0 0 6px rgba(16,185,129,0.4)" : "none",
                                    }}
                                  />
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
                                  <button
                                    onClick={() => setActiveLesson(lesson.id)}
                                    className="flex-1 min-w-0"
                                  >
                                    <div className="text-sm font-medium text-[var(--t1)] truncate flex items-center gap-2">
                                      <span className="truncate">{lesson.title}</span>
                                      {showReviewBadge && <ReviewBadge />}
                                    </div>
                                    <div className="text-[10px] text-[var(--t3)] flex items-center gap-2 flex-wrap">
                                      <span>⏱ {lesson.duration} min</span>
                                      <span>⚡ {lesson.xp} XP</span>
                                      <DifficultyBadge lesson={lesson} size="xs" animate={false} />
                                      {isLessonDone && <span className="text-[#10b981]">✓ {prog.score}%</span>}
                                    </div>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBookmark(lesson.id);
                                    }}
                                    className="shrink-0 p-1 hover:scale-110 transition-transform"
                                  >
                                    <motion.div
                                      key={isBookmarked ? "filled" : "outline"}
                                      initial={isBookmarked ? { scale: 0.5 } : undefined}
                                      animate={{ scale: 1 }}
                                      transition={isBookmarked ? { type: "spring", stiffness: 400, damping: 10 } : {}}
                                    >
                                      {isBookmarked ? (
                                        <Star className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
                                      ) : (
                                        <Star className="w-5 h-5 text-[var(--t3)]" />
                                      )}
                                    </motion.div>
                                  </button>
                                  <button
                                    onClick={() => setActiveLesson(lesson.id)}
                                    className="shrink-0"
                                  >
                                    <Play className="w-4 h-4 text-[var(--t3)]" />
                                  </button>
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className="px-3 pb-3">
                            <div className="rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] flex items-center gap-3 relative overflow-hidden">
                              {/* Golden shimmer */}
                              <div className="absolute inset-0 pointer-events-none">
                                <motion.div
                                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[rgba(245,158,11,0.12)] to-transparent"
                                  animate={{ x: ["-100%", "300%"] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                                />
                              </div>
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
      )}
    </div>
  );
}
