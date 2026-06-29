"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Play, NotebookPen, Share2 } from "lucide-react";
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

export function MoreView() {
  const accent = useAppStore((s) => s.accent);
  const setAccent = useAppStore((s) => s.setAccent);
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);
  const resetAll = useAppStore((s) => s.resetAll);
  const lessons = useAppStore((s) => s.lessons);
  const bookmarkedLessons = useAppStore((s) => s.bookmarkedLessons);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const { theme, setTheme } = useTheme();
  const [showReset, setShowReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
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
      <div className="text-center">
        <h1 className="font-d text-3xl font-bold mb-1">
          <span className="grad-text">More</span>
        </h1>
        <p className="text-sm text-[var(--t2)]">Settings & options</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)] flex items-center gap-4">
        <div className="relative">
          {/* Animated gradient ring */}
          <div className="absolute -inset-1 rounded-full animate-gradient-ring" style={{ background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #22d3ee, #6366f1)", opacity: 0.6 }} />
          <div className="relative w-14 h-14 rounded-full bg-[var(--grad-btn)] flex items-center justify-center text-2xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
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
                className="px-3 py-1.5 rounded-lg bg-[var(--grad-btn)] text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="font-d font-bold text-base text-[var(--t1)]">{userName}</div>
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

      {/* Accent selector */}
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
              style={accent === a ? { boxShadow: "0 0 20px rgba(99,102,241,0.2)" } : {}}
            >
              {/* Checkmark animation */}
              {accent === a && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--p)] flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.div>
              )}
              <span className="text-2xl">{a === "usa" ? "🇺🇸" : "🇬🇧"}</span>
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

      {/* Theme selector */}
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
            style={theme === "dark" ? { boxShadow: "0 0 20px rgba(99,102,241,0.2)" } : {}}
          >
            {theme === "dark" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--p)] flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            )}
            <span className="text-2xl">🌙</span>
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
            style={theme === "light" ? { boxShadow: "0 0 20px rgba(99,102,241,0.2)" } : {}}
          >
            {theme === "light" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--p)] flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            )}
            <span className="text-2xl">☀️</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-[var(--t1)]">Light</div>
              <div className="text-[10px] text-[var(--t3)]">Daytime</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* XP Shop */}
      <div>
        <XPShop />
      </div>

      {/* Phase overview */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">All Phases</h2>
        <div className="space-y-2">
          {PHASES.map((p) => {
            const phaseLessons = getLessonsForPhase(p.id);
            const done = phaseLessons.filter((l) => lessons[l.id]?.completed).length;
            const total = phaseLessons.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <div
                key={p.id}
                className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] flex items-center gap-3"
              >
                <div className="text-2xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)] truncate">
                    Phase {p.id + 1}: {p.name}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-[var(--overlay-border-1)] overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--grad-btn)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--t2)]">
                  {done}/{total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bookmarked Lessons */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
          Bookmarked Lessons
        </h2>
        {bookmarkedLessons.length === 0 ? (
          <div className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center">
            <div className="text-3xl mb-2">⭐</div>
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

      {/* My Lesson Notes */}
      <div>
        <h2 className="font-d text-base font-bold mb-2 flex items-center gap-2">
          <NotebookPen className="w-4 h-4 text-[var(--p3)]" />
          My Lesson Notes
          {noteCount > 0 && (
            <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.12)] text-[var(--p3)]">
              {noteCount} {noteCount === 1 ? "note" : "notes"}
            </span>
          )}
        </h2>
        {/* Sort order is documented in lesson-notes-panel.tsx: longest notes first
            (ties broken by phase / lesson catalog order). */}
        <MyLessonNotesList />
      </div>

      {/* About */}
      <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)]">
        <h3 className="font-d font-bold text-base mb-2">About <span className="grad-text">AccentAI</span></h3>
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
          className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white border-0"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 6px 20px rgba(99,102,241,0.4)",
          }}
          aria-label="Share my stats"
        >
          <Share2 className="w-4 h-4" />
          Share My Stats
        </motion.button>
        <p className="mt-2 text-center text-[10px] text-[var(--t3)] font-mono">
          Generate a beautiful downloadable PNG summary of your journey
        </p>
      </div>

      {/* Reset */}
      <div className="rounded-2xl p-5 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.25)]">
        {showReset ? (
          <div className="space-y-3">
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
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-[#ef4444] text-white text-xs font-semibold"
              >
                Yes, reset
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#ef4444]">Start Fresh</div>
              <div className="text-[10px] text-[var(--t3)]">Reset all progress</div>
            </div>
          </button>
        )}
      </div>

      {/* Share card modal — opened from the "Share My Stats" button above */}
      <ShareCard open={shareCard.open} onOpenChange={shareCard.setOpen} />
    </div>
  );
}
