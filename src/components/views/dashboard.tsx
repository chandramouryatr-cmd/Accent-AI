"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore, usePhaseProgress, useOverallProgress } from "@/lib/store";
import { PHASES } from "@/lib/types";
import { ALL_LESSON_IDS, getLessonsForPhase, lessonIdFor } from "@/lib/lessons";
import { ProgressRing } from "@/components/widgets/progress-ring";
import { WaveformCanvas } from "@/components/widgets/waveform-canvas";

export function DashboardView() {
  const userName = useAppStore((s) => s.userName);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const speakingSecondsToday = useAppStore((s) => s.speakingSecondsToday);
  const lessons = useAppStore((s) => s.lessons);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

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

  // weekly chart data (simulated based on history)
  const weekData = useMemo(() => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const today = new Date().getDay();
    const todayIdx = today === 0 ? 6 : today - 1;
    return days.map((d, i) => {
      const hist = useAppStore.getState().history.filter((h) => {
        const hd = new Date(h.date).getDay();
        const hi = hd === 0 ? 6 : hd - 1;
        return hi === i;
      });
      const score = hist.length > 0
        ? Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length)
        : i < todayIdx
        ? 60 + Math.floor(Math.random() * 30)
        : 0;
      return { day: d, score, isToday: i === todayIdx };
    });
  }, []);
  const maxScore = Math.max(...weekData.map((d) => d.score), 100);

  const handleContinue = () => {
    if (nextLesson) setActiveLesson(nextLesson.id);
  };

  return (
    <div className="space-y-5">
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

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.lbl}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-3 bg-[var(--card)] border border-[var(--border)] text-center"
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
        className="relative rounded-3xl p-5 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12), rgba(34,211,238,0.06))",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
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
            <ProgressRing pct={phaseProg.pct} size={62} stroke={4} label={`${phaseProg.pct}%`} />
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
                    className="w-full rounded-t-md relative"
                    style={{
                      background: d.isToday
                        ? "linear-gradient(180deg, #6366f1, #22d3ee)"
                        : "rgba(99,102,241,0.3)",
                      minHeight: d.score > 0 ? 8 : 2,
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
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[rgba(99,102,241,0.12)] flex items-center justify-center text-lg shrink-0">
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
                <div
                  key={s.ph}
                  className="rounded-xl p-3 text-center"
                  style={{ background: colors[s.lvl as keyof typeof colors] }}
                >
                  <div className="font-mono text-xl font-bold text-[var(--t1)]">{s.ph}</div>
                  <div
                    className="inline-block w-1.5 h-1.5 rounded-full mt-1"
                    style={{ background: dotColors[s.lvl as keyof typeof dotColors] }}
                  />
                </div>
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
            <button
              key={a.lbl}
              onClick={() => setActiveTab(a.tab)}
              className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition text-center"
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
