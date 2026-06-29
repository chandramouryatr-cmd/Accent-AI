"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Zap, Moon, Sun } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { DashboardView } from "@/components/views/dashboard";
import { JourneyView } from "@/components/views/journey";
import { PracticeView } from "@/components/views/practice";
import { ProgressView } from "@/components/views/progress";
import { MoreView } from "@/components/views/more";
import { LessonModal } from "@/components/lesson/lesson-modal";
import { getLesson, ALL_LESSON_IDS } from "@/lib/lessons";

const TABS = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "journey", label: "Journey", icon: "🗺️" },
  { id: "practice", label: "Practice", icon: "🎙️" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "more", label: "More", icon: "⋯" },
] as const;

export function AppShell() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const activeLessonId = useAppStore((s) => s.activeLessonId);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const accent = useAppStore((s) => s.accent);
  const { theme, toggleTheme } = useTheme();

  const activeLesson = useMemo(
    () => (activeLessonId ? getLesson(activeLessonId) : undefined),
    [activeLessonId]
  );

  // next lesson in sequence
  const nextLesson = useMemo(() => {
    if (!activeLessonId) return undefined;
    const idx = ALL_LESSON_IDS.indexOf(activeLessonId);
    if (idx === -1 || idx >= ALL_LESSON_IDS.length - 1) return undefined;
    return getLesson(ALL_LESSON_IDS[idx + 1]);
  }, [activeLessonId]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[rgba(7,7,15,0.85)] border-b border-[var(--border)] safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-d text-lg font-bold">
            <span className="grad-text">AccentAI</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22d3ee] ml-0.5 align-middle" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)]">
              <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="text-xs font-mono font-bold text-[#f59e0b]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)]">
              <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span className="text-xs font-mono font-bold text-[#a78bfa]">{xp}</span>
            </div>
            <div className="px-2 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs">
              {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()}
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--card-h)] transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <DashboardView />}
            {activeTab === "journey" && <JourneyView />}
            {activeTab === "practice" && <PracticeView />}
            {activeTab === "progress" && <ProgressView />}
            {activeTab === "more" && <MoreView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-[rgba(7,7,15,0.95)] border-t border-[var(--border)] safe-bottom">
        <nav className="max-w-3xl mx-auto px-2 py-2 flex items-center justify-around">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] transition"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg bg-[rgba(99,102,241,0.15)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative text-lg ${isActive ? "" : "opacity-50"}`}>{t.icon}</span>
                <span
                  className={`relative text-[10px] font-medium ${
                    isActive ? "text-[var(--p3)]" : "text-[var(--t3)]"
                  }`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </nav>
      </footer>

      {/* Lesson modal */}
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            lesson={activeLesson}
            onClose={() => setActiveLesson(null)}
            onNext={
              nextLesson
                ? () => {
                    setActiveLesson(nextLesson.id);
                  }
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
