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
    <div className="min-h-screen flex flex-col bg-[var(--bg)] relative overflow-hidden">
      {/* Animated gradient orb behind header */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none z-0 opacity-60">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[rgba(7,7,15,0.85)] border-b border-[var(--border)] safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-d text-lg font-bold flex items-center">
            <span
              className="animate-gradient-text"
              style={{
                backgroundImage: "linear-gradient(120deg, var(--p), var(--p2), var(--p3), var(--p))",
              }}
            >
              AccentAI
            </span>
            <motion.span
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#22d3ee] ml-0.5 align-middle"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] animate-pill-glow-amber">
              <Flame className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="text-xs font-mono font-bold text-[#f59e0b]">{streak}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)] animate-pill-glow-violet">
              <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span className="text-xs font-mono font-bold text-[#a78bfa]">{xp}</span>
            </div>
            <motion.button
              onClick={() => setActiveTab("more")}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.2)] transition"
              aria-label="Open XP Shop"
              title="XP Shop"
            >
              <span className="text-sm">🛍️</span>
            </motion.button>
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

      {/* Bottom nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-[rgba(7,7,15,0.95)] border-t border-[var(--border)] safe-bottom">
        <nav className="max-w-3xl mx-auto px-2 py-2 flex items-center justify-around">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <motion.button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg min-w-[56px] transition"
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <div className="absolute inset-0 bg-[rgba(99,102,241,0.15)]" />
                    {/* Top accent line */}
                    <motion.div
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                      style={{ background: "var(--grad-btn)", boxShadow: "0 0 6px rgba(99,102,241,0.6)" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                    />
                  </motion.div>
                )}
                <motion.span
                  className={`relative text-lg ${isActive ? "" : "opacity-50"}`}
                  animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {t.icon}
                </motion.span>
                <span
                  className={`relative text-[10px] font-medium ${
                    isActive ? "text-[var(--p3)]" : "text-[var(--t3)]"
                  }`}
                >
                  {t.label}
                </span>
                {/* Glowing dot indicator under active tab */}
                {isActive && (
                  <motion.div
                    layoutId="tab-dot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--p3)]"
                    style={{ boxShadow: "0 0 8px rgba(167,139,250,0.6)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
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
