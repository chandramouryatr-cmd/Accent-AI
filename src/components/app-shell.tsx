"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { DashboardView } from "@/components/views/dashboard";
import { JourneyView } from "@/components/views/journey";
import { PracticeView } from "@/components/views/practice";
import { ProgressView } from "@/components/views/progress";
import { MoreView } from "@/components/views/more";
import { LessonModal } from "@/components/lesson/lesson-modal";
import { AICoachFAB } from "@/components/ai-coach/ai-coach-fab";
import { Toaster } from "@/components/widgets/toaster";
import { ToastWatcher } from "@/components/widgets/toast-watcher";
import { XPBurst } from "@/components/widgets/xp-burst";
import { ShortcutsOverlay, useKeyboardShortcuts } from "@/components/widgets/keyboard-shortcuts";
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

  // Wire up global keyboard shortcuts (Cmd+K, 1-5, ?, Esc)
  useKeyboardShortcuts();

  // next lesson in sequence
  const nextLesson = useMemo(() => {
    if (!activeLessonId) return undefined;
    const idx = ALL_LESSON_IDS.indexOf(activeLessonId);
    if (idx === -1 || idx >= ALL_LESSON_IDS.length - 1) return undefined;
    return getLesson(ALL_LESSON_IDS[idx + 1]);
  }, [activeLessonId]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] relative">
      {/* Top bar — minimal solid */}
      <header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)] safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo — solid text, no gradient */}
          <div className="font-d text-lg font-bold text-[var(--t1)]">
            AccentAI
          </div>

          {/* Right side — minimal pills + toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--card)] text-xs text-[var(--t2)]">
              <span aria-hidden="true">🔥</span>
              <span className="font-mono font-medium">{streak}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--card)] text-xs text-[var(--t2)]">
              <span aria-hidden="true">⚡</span>
              <span className="font-mono font-medium">{xp}</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--t2)]">
              {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()}
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--card-h)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5 pb-28 relative z-10">
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

      {/* Bottom nav — minimal */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--bg)]/95 backdrop-blur-sm border-t border-[var(--border)] safe-bottom">
        <nav aria-label="Main navigation" className="max-w-3xl mx-auto px-2 py-2 flex items-center justify-around">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] hover:bg-[var(--card-h)] transition-colors"
                aria-label={t.label}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Subtle active background indicator with spring layout transition */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg bg-[var(--card-h)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span
                  className={`relative text-lg ${isActive ? "" : "opacity-50"}`}
                  aria-hidden="true"
                >
                  {t.icon}
                </span>
                <span
                  className={`relative text-[10px] font-medium ${
                    isActive ? "text-[var(--t1)]" : "text-[var(--t3)]"
                  }`}
                >
                  {t.label}
                </span>
                {/* Simple dot indicator under active tab */}
                {isActive && (
                  <motion.div
                    layoutId="tab-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--p)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </footer>

      {/* Lesson modal */}
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            key={activeLesson.id}
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

      {/* AI Pronunciation Coach — floating button + chat modal */}
      <AICoachFAB />

      {/* Toast notifications (lesson complete, badge earned, etc.) */}
      <Toaster />
      <ToastWatcher />

      {/* Floating "+N XP" burst animation when XP increases */}
      <XPBurst />

      {/* Keyboard shortcuts help overlay (press ?) */}
      <ShortcutsOverlay />
    </div>
  );
}
