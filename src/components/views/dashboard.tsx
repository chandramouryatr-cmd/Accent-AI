"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, usePhaseProgress, useOverallProgress } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSON_IDS, getLessonsForPhase, lessonIdFor } from "@/lib/lessons";
import { ProgressRing } from "@/components/widgets/progress-ring";
import { WaveformCanvas } from "@/components/widgets/waveform-canvas";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
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

  const stats = [
    { icon: "🔥", val: streak, lbl: "Day Streak", color: "#f59e0b" },
    { icon: "🎙️", val: `${Math.round(speakingSecondsToday / 60)}m`, lbl: "Speaking Today", color: "#22d3ee" },
    { icon: "🎯", val: accuracy === null ? "—" : `${accuracy}%`, lbl: "Accuracy", color: "#10b981" },
    { icon: "⚡", val: xp, lbl: "Total XP", color: "#a78bfa" },
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
    <div className="space-y-5 relative">
      {/* Floating gradient orbs */}
      <div className="absolute top-20 -left-20 w-48 h-48 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}>
        <motion.div
          className="w-full h-full rounded-full"
          animate={{ x: [0, 15, 0], y: [0, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute top-72 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)" }}>
        <motion.div
          className="w-full h-full rounded-full"
          animate={{ x: [0, -12, 0], y: [0, 12, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="absolute top-[500px] left-10 w-40 h-40 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }}>
        <motion.div
          className="w-full h-full rounded-full"
          animate={{ x: [0, 10, 0], y: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Greeting */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
            AI Coach Active
          </span>
        </div>
        <h1 className="font-d text-2xl font-bold">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-sm text-[var(--t2)] mt-0.5">
          {overallProg.done === 0
            ? "Start your first lesson to begin your journey!"
            : overallProg.done === ALL_LESSON_IDS.length
            ? "🎉 You've completed every lesson! Keep practicing."
            : `You've completed ${overallProg.done} of ${overallProg.total} lessons. Keep going!`}
        </p>
      </div>

      {/* Daily Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={`relative rounded-3xl p-5 overflow-hidden border transition-all duration-500 ${
          goalComplete
            ? "border-[rgba(16,185,129,0.5)]"
            : "border-[var(--border)]"
        }`}
        style={{
          background: goalComplete
            ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(34,211,238,0.08))"
            : "var(--card)",
        }}
        onClick={() => setShowGoalPicker(true)}
      >
        {goalComplete && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}
        <div className="relative flex items-center gap-4 cursor-pointer">
          <ProgressRing
            pct={goalPct}
            size={72}
            stroke={5}
            label={`${resolvedDailyGoalCompleted}/${dailyGoal}`}
            gradient={!goalComplete}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
              Daily Goal
            </div>
            <div className="font-d text-base font-bold text-[var(--t1)]">
              {goalComplete
                ? "🎉 Goal complete! You're on fire!"
                : `${remaining} more lesson${remaining !== 1 ? "s" : ""} to hit your goal!`}
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
              className="absolute inset-0 z-10 bg-[var(--bg)]/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6"
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
                  className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--t1)] hover:bg-[var(--card-h)] transition"
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
                      className={`w-6 h-6 rounded-full text-[10px] font-bold transition ${
                        n === dailyGoal
                          ? "bg-[var(--grad-btn)] text-white"
                          : "bg-[var(--card)] border border-[var(--border)] text-[var(--t3)] hover:border-[var(--p3)]"
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
                  className="w-10 h-10 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-lg font-bold text-[var(--t1)] hover:bg-[var(--card-h)] transition"
                >
                  +
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGoalPicker(false);
                }}
                className="px-6 py-2 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.lbl}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
            className="rounded-2xl p-3 bg-[var(--card)] border border-[var(--border)] text-center relative overflow-hidden"
            style={{ borderLeft: `4px solid ${s.color}` }}
          >
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="font-d text-base font-bold" style={{ color: s.color }}>
              {s.val}
            </div>
            <div className="text-[9px] text-[var(--t3)] uppercase tracking-wider">{s.lbl}</div>
          </motion.div>
        ))}
      </div>

      {/* Current phase card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-5 overflow-hidden shimmer-sweep"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12), rgba(34,211,238,0.06))",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
        {/* Shimmer sweep overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          />
        </div>
        <div className="relative">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
            📍 Phase {currentPhase + 1} of {PHASES.length}
          </div>
          <div className="font-d text-xl font-bold mb-0.5 flex items-center gap-2">
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
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-[var(--grad-btn)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${phaseProg.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="text-[10px] text-[var(--t3)] mt-1.5">
                {phaseProg.done} of {phaseProg.total} lessons complete
              </div>
            </div>
            <div className="animate-pulse-glow rounded-full">
              <ProgressRing pct={phaseProg.pct} size={62} stroke={4} label={`${phaseProg.pct}%`} />
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="mt-4 w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            {phaseProg.done === 0 ? "Start Phase →" : "Continue →"}
          </button>
        </div>
      </motion.div>

      {/* Weekly progress chart */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 flex items-center justify-between">
          <span>This Week</span>
          <span className="text-[10px] text-[#10b981] font-mono font-normal">↑ {overallProg.pct}% overall</span>
        </h2>
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-end justify-between gap-2 h-28 mb-2">
            {weekData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.score / maxScore) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6, type: "spring" }}
                    className={`w-full rounded-t-md relative ${d.isToday ? "animate-pulse-glow" : ""}`}
                    style={{
                      background: d.isToday
                        ? "linear-gradient(180deg, #6366f1, #22d3ee)"
                        : "linear-gradient(180deg, rgba(99,102,241,0.4), rgba(99,102,241,0.2))",
                      minHeight: d.score > 0 ? 8 : 2,
                      boxShadow: d.isToday ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                    }}
                  >
                    {d.score > 0 && (
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--t2)]">
                        {d.score}
                      </span>
                    )}
                  </motion.div>
                </div>
                <span className={`text-[10px] ${d.isToday ? "text-[var(--p3)] font-bold" : "text-[var(--t3)]"}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">AI Recommendations</h2>
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] space-y-3">
          {[
            { icon: "🔊", title: "Practice \"th\" sound", sub: "Foundational for native flow" },
            { icon: "📝", title: "Word stress in multi-syllable words", sub: "Focus on: to-MOR-row, im-POR-tant" },
            { icon: "⚡", title: "Connected speech practice", sub: "Try linking \"want to\" → \"wanna\"" },
          ].map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}
              className="flex items-start gap-3 pl-3 border-l-2 border-[rgba(99,102,241,0.4)]"
            >
              <div className="w-9 h-9 rounded-xl bg-[rgba(99,102,241,0.12)] flex items-center justify-center text-lg shrink-0">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--t1)]">{r.title}</div>
                <div className="text-xs text-[var(--t3)]">{r.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weak sounds */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Your Sound Profile</h2>
        <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]">
          <div className="grid grid-cols-4 gap-2">
            {[
              { ph: "ð", lvl: "red" },
              { ph: "θ", lvl: "red" },
              { ph: "æ", lvl: "yellow" },
              { ph: "ŋ", lvl: "yellow" },
              { ph: "ɪ", lvl: "green" },
              { ph: "ʊ", lvl: "yellow" },
              { ph: "ɜː", lvl: "green" },
              { ph: "ʒ", lvl: "red" },
            ].map((s) => {
              const colors = {
                red: "rgba(239,68,68,0.15)",
                yellow: "rgba(245,158,11,0.15)",
                green: "rgba(16,185,129,0.15)",
              };
              const dotColors = {
                red: "#ef4444",
                yellow: "#f59e0b",
                green: "#10b981",
              };
              return (
                <motion.div
                  key={s.ph}
                  whileHover={{ scale: 1.08, boxShadow: "0 0 16px " + dotColors[s.lvl as keyof typeof dotColors] + "33" }}
                  className="rounded-xl p-3 text-center cursor-default transition-shadow"
                  style={{ background: colors[s.lvl as keyof typeof colors] }}
                >
                  <div className="font-mono text-xl font-bold text-[var(--t1)]">{s.ph}</div>
                  <div
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1"
                    style={{ background: dotColors[s.lvl as keyof typeof dotColors], boxShadow: `0 0 6px ${dotColors[s.lvl as keyof typeof dotColors]}66` }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "📚", lbl: "Continue", tab: "journey" as const },
            { icon: "🎙️", lbl: "Practice", tab: "practice" as const },
            { icon: "📈", lbl: "Progress", tab: "progress" as const },
          ].map((a) => (
            <motion.button
              key={a.lbl}
              onClick={() => setActiveTab(a.tab)}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition text-center"
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="text-xs font-medium text-[var(--t2)]">{a.lbl}</div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
