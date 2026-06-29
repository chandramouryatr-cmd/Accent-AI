"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, usePhaseProgress, useOverallProgress } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSON_IDS, getLessonsForPhase } from "@/lib/lessons";
import { ProgressRing } from "@/components/widgets/progress-ring";
import { TIPS } from "@/lib/tips";
import { DailyChallengeCard } from "@/components/widgets/daily-challenge-card";
import { RecentLessonsCarousel } from "@/components/widgets/recent-lessons-carousel";
import { CoachInsights } from "@/components/widgets/coach-insights";

// ─── Animated Counter Hook ─────────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1200): number {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    if (typeof target !== "number" || isNaN(target)) return;
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

function AnimatedStatValue({ value }: { value: number | string }) {
  // If value is a string like "85%" or "3m", animate the numeric part
  const str = String(value);
  const match = str.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const num = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const animated = useAnimatedCounter(num);
  if (!match) return <>{str}</>;
  return <>{animated}{suffix}</>;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Tip of the Day ───────────────────────────────────────────────────────
function dayOfYearTipIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / 86400000
  );
  return dayOfYear % TIPS.length;
}

function TipOfTheDay() {
  const startIndex = useMemo(() => dayOfYearTipIndex(), []);
  const [idx, setIdx] = useState(startIndex);

  const tip = TIPS[idx];

  const handleNext = () => {
    setIdx((i) => (i + 1) % TIPS.length);
  };

  return (
    <div className="rounded-xl p-5 bg-[var(--card)] border border-[var(--border)]">
      {/* Top row: label + category badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
          Tip of the Day
        </span>
        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--t3)]">
          {tip.category}
        </span>
      </div>

      {/* Body: emoji + title/body */}
      <div className="flex items-start gap-4">
        <div className="text-3xl shrink-0 leading-none">
          {tip.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-d text-base font-bold text-[var(--t1)] mb-1">
                {tip.title}
              </div>
              <div className="text-sm text-[var(--t2)] leading-relaxed">
                {tip.body}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Next tip button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={handleNext}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--t2)] hover:bg-[var(--card-h)] hover:text-[var(--t1)] transition"
        >
          Next tip →
        </button>
      </div>
    </div>
  );
}

export function DashboardView() {
  const userName = useAppStore((s) => s.userName);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const speakingSecondsToday = useAppStore((s) => s.speakingSecondsToday);
  const lessons = useAppStore((s) => s.lessons);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const dailyGoal = useAppStore((s) => s.dailyGoal);
  const dailyGoalCompleted = useAppStore((s) => s.dailyGoalCompleted);
  const dailyGoalDate = useAppStore((s) => s.dailyGoalDate);
  const setDailyGoal = useAppStore((s) => s.setDailyGoal);

  const [showGoalPicker, setShowGoalPicker] = useState(false);

  // Resolve daily goal completed (reset if date changed)
  const resolvedDailyGoalCompleted = dailyGoalDate === todayStr() ? dailyGoalCompleted : 0;
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((resolvedDailyGoalCompleted / dailyGoal) * 100)) : 0;
  const goalComplete = resolvedDailyGoalCompleted >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - resolvedDailyGoalCompleted);

  // find current phase (first phase with incomplete lessons)
  const currentPhase = useMemo(() => {
    for (let i = 0; i < PHASES.length; i++) {
      const phaseLessons = getLessonsForPhase(i);
      const allDone = phaseLessons.every((l) => lessons[l.id]?.completed);
      if (!allDone) return i;
    }
    return PHASES.length - 1;
  }, [lessons]);

  const phase = PHASES[currentPhase];
  const phaseLessonIds = getLessonsForPhase(currentPhase).map((l) => l.id);
  const phaseProg = usePhaseProgress(currentPhase, phaseLessonIds);
  const overallProg = useOverallProgress(ALL_LESSON_IDS);

  // accuracy = avg of completed lesson scores
  const accuracy = useMemo(() => {
    const completed = Object.values(lessons).filter((l) => l.completed);
    if (completed.length === 0) return null;
    return Math.round(completed.reduce((sum, l) => sum + l.score, 0) / completed.length);
  }, [lessons]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // find next lesson to do
  const nextLesson = useMemo(() => {
    const phaseLessons = getLessonsForPhase(currentPhase);
    return phaseLessons.find((l) => !lessons[l.id]?.completed) || phaseLessons[0];
  }, [currentPhase, lessons]);

  // Mini sparkline data per stat card (last 7 days, derived from history)
  const sparklines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const history = useAppStore.getState().history;
    const calendar = useAppStore.getState().practiceCalendar;
    return {
      streak: days.map((d) => (calendar[dayKey(d)] || 0) > 0 ? 1 : 0),
      speaking: days.map((d) => {
        const h = history.filter((x) => x.date === dayKey(d));
        return h.length;
      }),
      accuracy: days.map((d) => {
        const h = history.filter((x) => x.date === dayKey(d));
        return h.length ? Math.round(h.reduce((s, x) => s + x.score, 0) / h.length) : 0;
      }),
      xp: days.map((d) => {
        const h = history.filter((x) => x.date === dayKey(d));
        return h.length; // proxy: each completed lesson ~+130 XP
      }),
    };
  }, [lessons]);

  const stats = [
    { icon: "🔥", val: streak, lbl: "Day Streak", spark: sparklines.streak },
    { icon: "🎙️", val: `${Math.round(speakingSecondsToday / 60)}m`, lbl: "Speaking Today", spark: sparklines.speaking },
    { icon: "🎯", val: accuracy === null ? "—" : `${accuracy}%`, lbl: "Accuracy", spark: sparklines.accuracy },
    { icon: "⚡", val: xp, lbl: "Total XP", spark: sparklines.xp },
  ];

  // weekly chart data — deterministic, based on actual history
  const weekData = useMemo(() => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;
    const history = useAppStore.getState().history;
    return days.map((d, i) => {
      const hist = history.filter((h) => {
        const hd = new Date(h.date).getDay();
        const hi = hd === 0 ? 6 : hd - 1;
        return hi === i;
      });
      // No random fallback — only show real data, 0 for days with no history
      const score = hist.length > 0
        ? Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length)
        : 0;
      return { day: d, score, isToday: i === todayIdx };
    });
  }, [lessons]);
  const maxScore = Math.max(...weekData.map((d) => d.score), 100);

  const handleContinue = () => {
    if (nextLesson) setActiveLesson(nextLesson.id);
  };

  return (
    <div className="space-y-5">
      {/* Greeting — clean, no gradients, no particles */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
        <h1 className="font-d text-2xl sm:text-3xl font-bold leading-tight text-[var(--t1)]">
          {greeting}, {userName}
        </h1>
        <p className="text-sm text-[var(--t2)] mt-1">
          {overallProg.done === 0
            ? "Start your first lesson to begin your journey."
            : overallProg.done === ALL_LESSON_IDS.length
            ? "You've completed every lesson. Keep practicing!"
            : `You've completed ${overallProg.done} of ${overallProg.total} lessons. Keep going.`}
        </p>
      </div>

      {/* Recent / Recommended lessons carousel */}
      <RecentLessonsCarousel />

      {/* Daily Goal — clean card, no glow */}
      <div
        className="relative rounded-xl p-5 bg-[var(--card)] border border-[var(--border)] cursor-pointer hover:border-[var(--border2)] transition"
        onClick={() => setShowGoalPicker(true)}
      >
        <div className="flex items-center gap-4">
          <ProgressRing
            pct={goalPct}
            size={72}
            stroke={5}
            label={`${resolvedDailyGoalCompleted}/${dailyGoal}`}
            gradient={false}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
              Daily Goal
            </div>
            <div className="font-d text-base font-bold text-[var(--t1)]">
              {goalComplete
                ? "Goal complete"
                : `${remaining} more lesson${remaining !== 1 ? "s" : ""} to hit your goal`}
            </div>
            <div className="text-xs text-[var(--t3)] mt-0.5">
              Tap to change your daily goal
            </div>
          </div>
        </div>

        {/* Goal picker modal */}
        <AnimatePresence>
          {showGoalPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-[var(--bg)]/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6"
              onClick={(e) => {
                e.stopPropagation();
                setShowGoalPicker(false);
              }}
            >
              <div className="text-sm text-[var(--t3)] mb-3 font-mono uppercase tracking-wider">
                Set Daily Goal
              </div>
              <div className="font-d text-3xl font-bold text-[var(--t1)] mb-4">
                {dailyGoal} lesson{dailyGoal !== 1 ? "s" : ""}/day
              </div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDailyGoal(dailyGoal - 1);
                  }}
                  className="w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--t1)] hover:bg-[var(--card-h)] transition"
                >
                  −
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDailyGoal(n);
                      }}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold transition ${
                        n === dailyGoal
                          ? "bg-[var(--p)] text-[var(--primary-foreground)]"
                          : "bg-[var(--card)] border border-[var(--border)] text-[var(--t3)] hover:border-[var(--border2)]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDailyGoal(dailyGoal + 1);
                  }}
                  className="w-10 h-10 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--t1)] hover:bg-[var(--card-h)] transition"
                >
                  +
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGoalPicker(false);
                }}
                className="px-6 py-2 rounded-xl bg-[var(--p)] text-[var(--primary-foreground)] text-sm font-semibold hover:opacity-80 transition"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats row — clean cards, no colored borders, grayscale sparklines */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => {
          const max = Math.max(...s.spark, 1);
          const total = s.spark.reduce((a: number, b: number) => a + b, 0);
          return (
            <div
              key={s.lbl}
              className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] text-center hover:border-[var(--border2)] transition"
            >
              <div className="text-lg mb-0.5">{s.icon}</div>
              <div className="font-d text-base font-bold text-[var(--t1)]">
                {s.val === "—" ? "—" : <AnimatedStatValue value={s.val} />}
              </div>
              <div className="text-[9px] text-[var(--t3)] uppercase tracking-wider mb-1">
                {s.lbl}
              </div>
              {/* Mini 7-day sparkline — grayscale */}
              <div className="flex items-end justify-between gap-px h-3 mt-1">
                {s.spark.map((v: number, si: number) => {
                  const h = total === 0 ? 2 : Math.max(2, (v / max) * 12);
                  const isToday = si === s.spark.length - 1;
                  return (
                    <motion.div
                      key={si}
                      className="flex-1 rounded-sm"
                      style={{
                        background: v > 0 ? "var(--t1)" : "var(--border)",
                        opacity: v > 0 ? (isToday ? 1 : 0.4) : 1,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: i * 0.05 + si * 0.02 + 0.2, duration: 0.4 }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current phase card — clean, no gradient, no shimmer */}
      <div className="rounded-xl p-5 bg-[var(--card)] border border-[var(--border)]">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
          Phase {currentPhase + 1} of {PHASES.length}
        </div>
        <div className="font-d text-xl font-bold mb-0.5 flex items-center gap-2 text-[var(--t1)]">
          <span>{phase.emoji}</span>
          <span>{phase.name}</span>
        </div>
        <div className="text-sm text-[var(--t2)] mb-4">{phase.desc}</div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[var(--t3)]">Progress</span>
              <span className="text-xs font-mono font-bold text-[var(--t1)]">{phaseProg.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--p)]"
                initial={{ width: 0 }}
                animate={{ width: `${phaseProg.pct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-[10px] text-[var(--t3)] mt-1.5">
              {phaseProg.done} of {phaseProg.total} lessons complete
            </div>
          </div>
          <ProgressRing pct={phaseProg.pct} size={62} stroke={4} label={`${phaseProg.pct}%`} gradient={false} />
        </div>

        <button
          onClick={handleContinue}
          className="mt-4 w-full py-3 rounded-xl bg-[var(--p)] text-[var(--primary-foreground)] font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-80 transition"
        >
          {phaseProg.done === 0 ? "Start Phase" : "Continue"} →
        </button>
      </div>

      {/* Weekly progress chart — solid bars, no gradients */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 flex items-center justify-between text-[var(--t1)]">
          <span>This Week</span>
          <span className="text-[10px] text-[var(--t3)] font-mono font-normal">↑ {overallProg.pct}% overall</span>
        </h2>
        <div className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)] relative overflow-hidden">
          {/* Background grid lines */}
          <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
            <div className="h-px bg-[var(--border)]" />
            <div className="h-px bg-[var(--border)]" />
            <div className="h-px bg-[var(--border)]" />
          </div>
          <div className="flex items-end justify-between gap-2 h-28 mb-2 relative">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex-1 w-full flex items-end relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.score / maxScore) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6, type: "spring" }}
                    className="w-full rounded-t-md relative"
                    style={{
                      background: d.isToday
                        ? "var(--p)"
                        : d.score > 0
                        ? "var(--t3)"
                        : "var(--border)",
                      minHeight: d.score > 0 ? 8 : 2,
                    }}
                  >
                    {d.score > 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.4 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--t2)] font-bold"
                      >
                        {d.score}
                      </motion.span>
                    )}
                  </motion.div>
                </div>
                <span className={`text-[10px] ${d.isToday ? "text-[var(--t1)] font-bold" : "text-[var(--t3)]"}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
          {/* Average line indicator — subtle dashed */}
          {(() => {
            const scores = weekData.filter((d) => d.score > 0).map((d) => d.score);
            if (scores.length === 0) return null;
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const avgPct = (avg / maxScore) * 100;
            return (
              <div className="absolute left-4 right-4 pointer-events-none" style={{ bottom: `calc(2rem + ${avgPct}% * 0.78)` }}>
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-dashed border-[var(--border2)]" />
                  <span className="text-[8px] font-mono text-[var(--t3)] font-bold bg-[var(--card)] px-1 rounded">
                    avg {avg}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* AI Recommendations — clean card, no colored accents */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 text-[var(--t1)]">AI Recommendations</h2>
        <div className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)] space-y-3">
          {[
            { icon: "🔊", title: "Practice \"th\" sound", sub: "Foundational for native flow" },
            { icon: "📝", title: "Word stress in multi-syllable words", sub: "Focus on: to-MOR-row, im-POR-tant" },
            { icon: "⚡", title: "Connected speech practice", sub: "Try linking \"want to\" → \"wanna\"" },
          ].map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--card-h)] flex items-center justify-center text-lg shrink-0">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--t1)]">{r.title}</div>
                <div className="text-xs text-[var(--t3)]">{r.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip of the Day */}
      <TipOfTheDay />

      {/* Daily Challenge */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 text-[var(--t1)]">Daily Challenge</h2>
        <DailyChallengeCard />
      </div>

      {/* Weak sounds — dynamic, derived from completed lesson scores */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 flex items-center justify-between text-[var(--t1)]">
          <span>Your Sound Profile</span>
          {overallProg.done > 0 && (
            <span className="text-[10px] text-[var(--t3)] font-mono font-normal">
              Based on {overallProg.done} lesson{overallProg.done !== 1 ? "s" : ""}
            </span>
          )}
        </h2>
        <div className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)]">
          {(() => {
            // Map each phoneme to the lesson IDs that train it
            const phonemeLessons: Record<string, string[]> = {
              "ð": ["p1l2", "p1l3", "p1l4"],   // voiced th — consonant clusters, mouth positioning, listening
              "θ": ["p1l2", "p1l3", "p1l4"],   // voiceless th
              "æ": ["p1l1", "p1l4", "p2l1"],   // trap vowel — vowel sounds, listening, core words
              "ŋ": ["p1l2", "p2l1", "p2l3"],   // ng — consonants, core words, silent letters
              "ɪ": ["p1l1", "p2l1", "p2l4"],   // short i — vowels, core words, drills
              "ʊ": ["p1l1", "p2l1", "p2l4"],   // short u
              "ɜː": ["p1l1", "p2l1", "p5l2"],  // er sound — vowels, core words, reduced vowels
              "ʒ": ["p1l2", "p2l1", "p5l3"],   // zh — consonants, core words, elision
            };
            const phonemeData = Object.entries(phonemeLessons).map(([ph, lessonIds]) => {
              const relevant = lessonIds
                .map((id) => lessons[id])
                .filter((l) => l?.completed);
              if (relevant.length === 0) {
                return { ph, lvl: "unknown" as const, avg: null, count: 0 };
              }
              const avg = Math.round(relevant.reduce((s, l) => s + l.score, 0) / relevant.length);
              const lvl = avg >= 85 ? "green" : avg >= 70 ? "yellow" : "red";
              return { ph, lvl: lvl as "red" | "yellow" | "green", avg, count: relevant.length };
            });
            // Minimal status dot colors (semantic only)
            const dotColors = {
              red: "var(--rd)",
              yellow: "var(--yl)",
              green: "var(--gr)",
              unknown: "var(--border2)",
            };
            const labels = {
              red: "Needs work",
              yellow: "Progressing",
              green: "Mastered",
              unknown: "Not started",
            };
            return (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {phonemeData.map((s) => (
                    <div
                      key={s.ph}
                      className="rounded-lg p-3 text-center cursor-default border border-[var(--border)] hover:border-[var(--border2)] transition"
                      title={s.avg !== null ? `${s.ph} — ${labels[s.lvl]} (avg ${s.avg}%, ${s.count} lesson${s.count !== 1 ? "s" : ""})` : `${s.ph} — Not started yet`}
                    >
                      <div className={`font-mono text-xl font-bold ${s.lvl === "unknown" ? "text-[var(--t3)]" : "text-[var(--t1)]"}`}>{s.ph}</div>
                      <div
                        className="inline-block w-1.5 h-1.5 rounded-full mt-1"
                        style={{ background: dotColors[s.lvl] }}
                      />
                      {s.avg !== null && (
                        <div className="text-[9px] text-[var(--t3)] mt-1 font-mono">{s.avg}%</div>
                      )}
                    </div>
                  ))}
                </div>
                {overallProg.done === 0 && (
                  <p className="text-center text-xs text-[var(--t3)] mt-3">
                    Complete lessons to see your phoneme mastery levels
                  </p>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Coach Insights — AI-powered personalized practice plan */}
      <CoachInsights />

      {/* Quick actions — clean ghost buttons */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 text-[var(--t1)]">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "📚", lbl: "Continue", tab: "journey" as const },
            { icon: "🎙️", lbl: "Practice", tab: "practice" as const },
            { icon: "📈", lbl: "Progress", tab: "progress" as const },
          ].map((a) => (
            <button
              key={a.lbl}
              onClick={() => setActiveTab(a.tab)}
              className="rounded-xl p-4 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border2)] hover:bg-[var(--card-h)] transition text-center"
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-medium text-[var(--t2)]">{a.lbl}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
