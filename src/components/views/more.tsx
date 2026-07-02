"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Star, Play, NotebookPen, Share2, Terminal, Check } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { PHASES } from "@/lib/types";
import { getLessonsForPhase, getLesson } from "@/lib/lessons";
import { XPShop } from "@/components/widgets/xp-shop";
import {
  MyLessonNotesList,
  useLessonNoteCount,
} from "@/components/widgets/lesson-notes-panel";
import { ShareCard, useShareCardState } from "@/components/widgets/share-card";

// ─── Visual helpers ──────────────────────────────────────────────────────────

/** Staggered fade-in-up wrapper for each section. */
function Section({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.05 + index * 0.06,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/** Subtle gradient divider line between sections. */
function Divider() {
  return (
    <div
      className="h-px w-full"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, var(--border2) 50%, transparent 100%)",
        opacity: 0.6,
      }}
    />
  );
}

/** Spring-bounce checkmark badge used on selected selector cards. */
function SelectedCheck({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -45 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 18,
        delay,
      }}
      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--p)] flex items-center justify-center"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <motion.path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, delay: delay + 0.1, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}

/** Minimal inline toggle switch for Developer Mode. */
function DevToggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-[var(--p)]" : "bg-[var(--card-h)] border border-[var(--border)]"}`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: on ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function MoreView() {
  const accent = useAppStore((s) => s.accent);
  const setAccent = useAppStore((s) => s.setAccent);
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);
  const resetAll = useAppStore((s) => s.resetAll);
  const lessons = useAppStore((s) => s.lessons);
  const bookmarkedLessons = useAppStore((s) => s.bookmarkedLessons);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const devMode = useAppStore((s) => s.devMode);
  const setDevMode = useAppStore((s) => s.setDevMode);
  const { theme, setTheme } = useTheme();
  const [showReset, setShowReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [resetHovered, setResetHovered] = useState(false);
  const noteCount = useLessonNoteCount();
  const shareCard = useShareCardState();

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim().slice(0, 20));
      setEditingName(false);
    }
  };

  const handleReset = () => {
    resetAll();
    setShowReset(false);
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="font-d text-3xl font-bold mb-1 text-[var(--t1)]">
          More
          {devMode && (
            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--p)] text-white align-middle">
              DEV
            </span>
          )}
        </h1>
        <p className="text-sm text-[var(--t2)]">Settings &amp; options</p>
      </motion.div>

      {/* Profile card — simple avatar */}
      <Section index={0}>
        <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)] flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="relative w-14 h-14 rounded-full bg-[var(--p)] flex items-center justify-center text-2xl font-bold text-white"
          >
            {userName.charAt(0).toUpperCase()}
          </motion.div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg2)] border border-[var(--border2)] text-sm text-[var(--t1)] outline-none focus:border-[var(--p3)]"
                  placeholder="Your name"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1.5 rounded-lg bg-[var(--p)] text-white text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div className="font-d font-bold text-base text-[var(--t1)]">
                  {userName}
                </div>
                <button
                  onClick={() => {
                    setNameInput(userName);
                    setEditingName(true);
                  }}
                  className="text-xs text-[var(--p3)] hover:underline"
                >
                  Edit name
                </button>
              </>
            )}
          </div>
        </div>
      </Section>

      <Divider />

      {/* Accent selector — animated checkmark + flag wave */}
      <Section index={1}>
        <div>
          <h2 className="font-d text-base font-bold mb-2">Accent</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["usa", "uk"] as const).map((a) => (
              <motion.button
                key={a}
                onClick={() => setAccent(a)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 relative overflow-hidden ${
                  accent === a
                    ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                {accent === a && <SelectedCheck />}
                {/* Country flag with wave animation when selected */}
                <motion.span
                  className="text-2xl inline-block origin-bottom-left"
                  animate={
                    accent === a
                      ? {
                          rotate: [0, -8, 0, 8, 0],
                          skewX: [0, 6, 0, -6, 0],
                        }
                      : { rotate: 0, skewX: 0 }
                  }
                  transition={{
                    duration: 2,
                    repeat: accent === a ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  {a === "usa" ? "🇺🇸" : "🇬🇧"}
                </motion.span>
                <div className="text-left">
                  <div className="text-sm font-semibold text-[var(--t1)]">
                    {a === "usa" ? "USA English" : "UK English"}
                  </div>
                  <div className="text-[10px] text-[var(--t3)]">
                    {a === "usa" ? "American" : "British RP"}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* Theme selector — sun rotates in, moon fades out */}
      <Section index={2}>
        <div>
          <h2 className="font-d text-base font-bold mb-2">Appearance</h2>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={() => setTheme("dark")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 relative overflow-hidden ${
                theme === "dark"
                  ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              {theme === "dark" && <SelectedCheck />}
              {/* Moon icon — fades/pulses when dark theme active, dims when not */}
              <motion.span
                key={`moon-${theme}`}
                className="text-2xl inline-block"
                initial={{ opacity: 0, scale: 0.7, filter: "brightness(2)" }}
                animate={
                  theme === "dark"
                    ? {
                        opacity: [0.6, 1, 0.6],
                        scale: 1,
                        filter: "brightness(1)",
                      }
                    : { opacity: 0.45, scale: 0.92, filter: "brightness(0.7)" }
                }
                transition={
                  theme === "dark"
                    ? {
                        opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
                        scale: { type: "spring", stiffness: 220, damping: 14 },
                      }
                    : { duration: 0.4 }
                }
              >
                🌙
              </motion.span>
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--t1)]">Dark</div>
                <div className="text-[10px] text-[var(--t3)]">Easy on eyes</div>
              </div>
            </motion.button>
            <motion.button
              onClick={() => setTheme("light")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 relative overflow-hidden ${
                theme === "light"
                  ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              {theme === "light" && <SelectedCheck />}
              {/* Sun icon — rotates in when light theme active */}
              <motion.span
                key={`sun-${theme}`}
                className="text-2xl inline-block"
                initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
                animate={
                  theme === "light"
                    ? { rotate: 0, opacity: 1, scale: 1 }
                    : { rotate: 180, opacity: 0.4, scale: 0.85 }
                }
                transition={{
                  rotate: { type: "spring", stiffness: 180, damping: 16 },
                  opacity: { duration: 0.4 },
                  scale: { type: "spring", stiffness: 200, damping: 16 },
                }}
              >
                ☀️
              </motion.span>
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--t1)]">Light</div>
                <div className="text-[10px] text-[var(--t3)]">Daytime</div>
              </div>
            </motion.button>
          </div>
        </div>
      </Section>

      <Divider />

      {/* XP Shop */}
      <Section index={3}>
        <XPShop />
      </Section>

      <Divider />

      {/* Phase overview */}
      <Section index={4}>
        <div>
          <h2 className="font-d text-base font-bold mb-2">All Phases</h2>
          <div className="space-y-2">
            {PHASES.map((p, idx) => {
              const phaseLessons = getLessonsForPhase(p.id);
              const done = phaseLessons.filter((l) => lessons[l.id]?.completed).length;
              const total = phaseLessons.length;
              const pct = total === 0 ? 0 : Math.round((done / total) * 100);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                  className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] flex items-center gap-3"
                >
                  <motion.div
                    className="text-2xl"
                    whileHover={{ scale: 1.15, rotate: 5 }}
                  >
                    {p.emoji}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--t1)] truncate">
                      Phase {p.id + 1}: {p.name}
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-[var(--overlay-border-1)] overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--p)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + idx * 0.05 }}
                      />
                    </div>
                  </div>
                  <div className="text-xs font-mono text-[var(--t2)]">
                    {done}/{total}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      <Divider />

      {/* Bookmarked Lessons */}
      <Section index={5}>
        <div>
          <h2 className="font-d text-base font-bold mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
            Bookmarked Lessons
          </h2>
          {bookmarkedLessons.length === 0 ? (
            <div className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center">
              <motion.div
                className="text-3xl mb-2 inline-block"
                animate={{ y: [0, -4, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
              >
                ⭐
              </motion.div>
              <div className="text-sm text-[var(--t2)]">
                No bookmarked lessons yet. Tap the star icon on any lesson to save it for quick access.
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {bookmarkedLessons.map((lessonId) => {
                const lesson = getLesson(lessonId);
                if (!lesson) return null;
                const prog = lessons[lessonId];
                const isDone = prog?.completed;
                return (
                  <button
                    key={lessonId}
                    onClick={() => setActiveLesson(lessonId)}
                    className="w-full p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition flex items-center gap-3 text-left"
                  >
                    <div className="text-lg">⭐</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--t1)] truncate">
                        {lesson.title}
                      </div>
                      <div className="text-[10px] text-[var(--t3)] flex items-center gap-2">
                        <span>Phase {lesson.phaseId + 1}</span>
                        <span>⏱ {lesson.duration} min</span>
                        <span>⚡ {lesson.xp} XP</span>
                        {isDone && <span className="text-[#10b981]">✓ {prog.score}%</span>}
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-[var(--t3)] shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      <Divider />

      {/* My Lesson Notes */}
      <Section index={6}>
        <div>
          <h2 className="font-d text-base font-bold mb-2 flex items-center gap-2">
            <NotebookPen className="w-4 h-4 text-[var(--p3)]" />
            My Lesson Notes
            {noteCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--card-h)] text-[var(--t2)]"
              >
                {noteCount} {noteCount === 1 ? "note" : "notes"}
              </motion.span>
            )}
          </h2>
          {/* Sort order is documented in lesson-notes-panel.tsx: longest notes first
              (ties broken by phase / lesson catalog order). */}
          <MyLessonNotesList />
        </div>
      </Section>

      <Divider />

      {/* About */}
      <Section index={7}>
        <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)]">
          <h3 className="font-d font-bold text-base mb-2 text-[var(--t1)]">
            About{" "}
            <span className="text-[var(--t1)]">AccentAI</span>
          </h3>
          <p className="text-xs text-[var(--t2)] leading-relaxed">
            AccentAI is a comprehensive English accent training app with 8 phases and 32 detailed lessons.
            Every lesson features interactive animations, real IPA phonetics, mouth-position diagrams,
            rhythm visualizations, and AI-powered feedback. Master native-level English one micro-skill at a time.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--t3)]">
            <span className="px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.1)]">v1.0</span>
            <span>•</span>
            <span>32 lessons</span>
            <span>•</span>
            <span>16 interactive widgets</span>
          </div>

          {/* Share My Stats button */}
          <motion.button
            onClick={shareCard.openShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border-0 bg-[var(--p)]"
            aria-label="Share my stats"
          >
            <Share2 className="w-4 h-4" />
            Share My Stats
          </motion.button>
          <p className="mt-2 text-center text-[10px] text-[var(--t3)] font-mono">
            Generate a beautiful downloadable PNG summary of your journey
          </p>
        </div>
      </Section>

      <Divider />

      {/* Developer Mode — unlock all phases/lessons/shop for testing */}
      <Section index={8}>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--t1)]" />
              <span className="font-d font-bold text-sm text-[var(--t1)]">Developer Mode</span>
            </div>
            <DevToggle on={devMode} onClick={() => setDevMode(!devMode)} />
          </div>
          <p className="mt-2 text-xs text-[var(--t2)]">
            Unlocks all phases, lessons, and XP shop items for free. For testing and exploration.
          </p>
          {devMode && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
              <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">Unlocked</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--t2)]">
                  <Check className="w-3 h-3 text-[var(--p)]" /> All 8 Phases
                </div>
                <div className="flex items-center gap-1.5 text-[var(--t2)]">
                  <Check className="w-3 h-3 text-[var(--p)]" /> All 32 Lessons
                </div>
                <div className="flex items-center gap-1.5 text-[var(--t2)]">
                  <Check className="w-3 h-3 text-[var(--p)]" /> Free XP Shop
                </div>
                <div className="flex items-center gap-1.5 text-[var(--t2)]">
                  <Check className="w-3 h-3 text-[var(--p)]" /> Unlimited XP
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Divider />

      {/* Reset — pulsing red warning glow on hover */}
      <Section index={9}>
        <motion.div
          onHoverStart={() => setResetHovered(true)}
          onHoverEnd={() => setResetHovered(false)}
          animate={
            resetHovered && !showReset
              ? {
                  boxShadow: [
                    "0 0 12px rgba(239,68,68,0.35), inset 0 0 0 1px rgba(239,68,68,0.3)",
                    "0 0 28px rgba(239,68,68,0.6), inset 0 0 0 2px rgba(239,68,68,0.65)",
                    "0 0 12px rgba(239,68,68,0.35), inset 0 0 0 1px rgba(239,68,68,0.3)",
                  ],
                }
              : {
                  boxShadow:
                    "0 0 0 rgba(239,68,68,0), inset 0 0 0 1px rgba(239,68,68,0.25)",
                }
          }
          transition={
            resetHovered && !showReset
              ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
          className="rounded-2xl p-5 bg-[rgba(239,68,68,0.06)] border-0"
        >
          {showReset ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="text-sm font-semibold text-[#ef4444]">Reset all progress?</div>
              <p className="text-xs text-[var(--t2)]">
                This will erase your XP, streak, lesson progress, and badges. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReset(false)}
                  className="flex-1 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)]"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl bg-[#ef4444] text-white text-xs font-semibold shadow-[0_2px_10px_rgba(239,68,68,0.4)]"
                >
                  Yes, reset
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowReset(true)}
              className="w-full flex items-center gap-3 text-left"
            >
              <motion.div
                animate={resetHovered ? { rotate: [0, -180, -360] } : { rotate: 0 }}
                transition={
                  resetHovered
                    ? { duration: 1.2, repeat: Infinity, ease: "linear" }
                    : { duration: 0.3 }
                }
                className="text-2xl"
              >
                🔄
              </motion.div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#ef4444]">Start Fresh</div>
                <div className="text-[10px] text-[var(--t3)]">
                  Reset all progress — this cannot be undone
                </div>
              </div>
            </button>
          )}
        </motion.div>
      </Section>

      {/* Share card modal — opened from the "Share My Stats" button above */}
      <ShareCard open={shareCard.open} onOpenChange={shareCard.setOpen} />
    </div>
  );
}
