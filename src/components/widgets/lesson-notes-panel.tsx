"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Save,
  Check,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getLesson } from "@/lib/lessons";

interface Props {
  lessonId: string;
  lessonTitle: string;
}

const MAX_CHARS = 5000;
const DEBOUNCE_MS = 800;

const SUGGESTED_PROMPTS: string[] = [
  "What was your biggest takeaway from this lesson?",
  "Which word or sound was hardest for you? Why?",
  "When will you use this in real life? Give a concrete example.",
  "What's one thing you want to practice more tomorrow?",
  "Note any tongue/mouth position that surprised you.",
];

/**
 * Self-contained "Lesson Notes" panel — a personal notebook entry for a
 * single lesson. Auto-saves (debounced) to the Zustand store, shows
 * suggested prompts when empty, and lets the user peek at recent notes
 * from OTHER lessons as read-only references.
 */
export function LessonNotesPanel({ lessonId, lessonTitle }: Props) {
  const lessonNotes = useAppStore((s) => s.lessonNotes);
  const setLessonNote = useAppStore((s) => s.setLessonNote);
  const deleteLessonNote = useAppStore((s) => s.deleteLessonNote);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

  const storedNote = lessonNotes[lessonId] ?? "";

  // Local draft so the textarea updates instantly while we debounce the
  // store write. Hydrates from the store on lessonId change.
  const [draft, setDraft] = useState<string>(storedNote);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showOtherNotes, setShowOtherNotes] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  // Track the lessonId we're currently editing so we can re-hydrate the
  // draft when the user swaps to a different lesson without unmounting.
  const [trackedLessonId, setTrackedLessonId] = useState<string>(lessonId);
  if (trackedLessonId !== lessonId) {
    setTrackedLessonId(lessonId);
    setDraft(storedNote);
    setStatus("idle");
    setConfirmClear(false);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const flushSave = useCallback(
    (text: string) => {
      setLessonNote(lessonId, text);
      setStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setStatus("idle"), 1800);
    },
    [lessonId, setLessonNote]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value.slice(0, MAX_CHARS);
      setDraft(next);
      setConfirmClear(false);
      setStatus("saving");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        flushSave(next);
      }, DEBOUNCE_MS);
    },
    [flushSave]
  );

  const handleBlurSave = useCallback(() => {
    if (draft !== storedNote) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      flushSave(draft);
    }
  }, [draft, storedNote, flushSave]);

  const handleClear = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    deleteLessonNote(lessonId);
    setDraft("");
    setConfirmClear(false);
    setStatus("idle");
  }, [confirmClear, deleteLessonNote, lessonId]);

  const handlePromptClick = useCallback(
    (prompt: string) => {
      const next = (prompt + "\n\n").slice(0, MAX_CHARS);
      setDraft(next);
      setStatus("saving");
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        flushSave(next);
      }, DEBOUNCE_MS);
      // Focus the textarea after picking a prompt
      const ta = document.getElementById<HTMLTextAreaElement>(
        `lesson-notes-ta-${lessonId}`
      );
      if (ta) {
        ta.focus();
        const len = ta.value.length;
        ta.setSelectionRange(len, len);
      }
    },
    [lessonId, flushSave]
  );

  // ── Other lessons' notes (read-only references) ──
  // Most recent 3 by lesson completion time (fallback: lesson order).
  const otherNotes = useMemo(() => {
    const lessons = useAppStore.getState().lessons;
    return Object.entries(lessonNotes)
      .filter(([id, text]) => id !== lessonId && text.trim().length > 0)
      .map(([id, text]) => {
        const lesson = getLesson(id);
        const completedAt = lessons[id]?.completedAt ?? 0;
        return {
          id,
          text,
          title: lesson?.title ?? id,
          phaseId: lesson?.phaseId ?? 0,
          lessonIndex: lesson?.lessonIndex ?? 0,
          completedAt,
        };
      })
      .sort((a, b) => {
        // Most recently completed lessons first; lessons with no completion
        // time fall back to catalog order (phaseId, lessonIndex).
        if (a.completedAt !== b.completedAt) {
          return b.completedAt - a.completedAt;
        }
        if (a.phaseId !== b.phaseId) return a.phaseId - b.phaseId;
        return a.lessonIndex - b.lessonIndex;
      })
      .slice(0, 3);
  }, [lessonNotes, lessonId]);

  const charCount = draft.length;
  const isEmpty = draft.trim().length === 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      aria-label={`Lesson notes for ${lessonTitle}`}
      className="relative rounded-2xl border border-[var(--border2)] bg-[var(--card)] backdrop-blur-md overflow-hidden"
      style={{
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Decorative gradient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ background: "var(--grad-btn)" }}
        >
          <NotebookPen className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
            Lesson Notes
          </div>
          <div className="text-sm font-d font-semibold text-[var(--t1)] truncate">
            {lessonTitle}
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {status === "saving" && (
            <motion.div
              key="saving"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--t3)]"
            >
              <Save className="w-3 h-3 animate-pulse" />
              <span>Saving…</span>
            </motion.div>
          )}
          {status === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.7, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -4 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="flex items-center gap-1.5 text-[10px] font-mono text-[#10b981]"
            >
              <Check className="w-3 h-3" />
              <span>Saved ✓</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Body */}
      <div className="relative p-4 space-y-3">
        {/* Suggested prompts (only when empty) */}
        <AnimatePresence initial={false}>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
                <Sparkles className="w-3 h-3 text-[var(--p3)]" />
                <span>Prompts to get you started</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handlePromptClick(p)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--bg2)] border border-[var(--border2)] text-[11px] text-[var(--t2)] hover:text-[var(--t1)] hover:border-[var(--p3)] transition-colors text-left max-w-full"
                    title={p}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="relative">
          <textarea
            id={`lesson-notes-ta-${lessonId}`}
            value={draft}
            onChange={handleChange}
            onBlur={handleBlurSave}
            placeholder="Write your personal notes for this lesson…"
            maxLength={MAX_CHARS}
            spellCheck
            className="w-full min-h-[200px] resize-y rounded-xl p-3 bg-[var(--bg2)] border border-[var(--border2)] text-sm text-[var(--t1)] placeholder:text-[var(--t3)] outline-none transition focus:border-[var(--p)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)] leading-relaxed"
            style={{ fontFamily: "inherit" }}
            aria-label={`Notes for ${lessonTitle}`}
          />
        </div>

        {/* Footer row: char count + clear */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono text-[var(--t3)] tabular-nums">
            <span
              className={
                charCount > MAX_CHARS - 200
                  ? "text-[#f59e0b]"
                  : charCount >= MAX_CHARS
                  ? "text-[#ef4444]"
                  : ""
              }
            >
              {charCount}
            </span>
            <span> / {MAX_CHARS}</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {!isEmpty && (
              <motion.div
                key={confirmClear ? "confirm" : "idle"}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                className="flex items-center gap-1.5"
              >
                {confirmClear ? (
                  <>
                    <span className="text-[10px] text-[var(--t2)] mr-1">
                      Sure?
                    </span>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-2 py-1 rounded-lg bg-[#ef4444]/15 border border-[#ef4444]/40 text-[10px] font-semibold text-[#ef4444] hover:bg-[#ef4444]/25 transition"
                    >
                      Yes, clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border2)] text-[10px] font-semibold text-[var(--t2)] hover:bg-[var(--card-h)] transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border2)] text-[10px] font-semibold text-[var(--t3)] hover:text-[#ef4444] hover:border-[#ef4444]/40 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear notes
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Other lessons' notes — expandable */}
        {otherNotes.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setShowOtherNotes((v) => !v)}
              className="w-full flex items-center gap-2 text-left py-1.5 group"
              aria-expanded={showOtherNotes}
            >
              {showOtherNotes ? (
                <ChevronDown className="w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--p3)] transition" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--p3)] transition" />
              )}
              <FileText className="w-3.5 h-3.5 text-[var(--t3)] group-hover:text-[var(--p3)] transition" />
              <span className="text-[11px] font-semibold text-[var(--t2)] group-hover:text-[var(--t1)] transition">
                Saved notes from other lessons
              </span>
              <span className="ml-auto text-[10px] font-mono text-[var(--t3)]">
                {otherNotes.length}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {showOtherNotes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {otherNotes.map((n) => (
                      <motion.button
                        key={n.id}
                        type="button"
                        onClick={() => setActiveLesson(n.id)}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full text-left p-2.5 rounded-lg bg-[var(--bg2)] border border-[var(--border2)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(99,102,241,0.12)] text-[var(--p3)] uppercase tracking-wider">
                            P{n.phaseId + 1}
                          </span>
                          <span className="text-[11px] font-semibold text-[var(--t1)] truncate flex-1">
                            {n.title}
                          </span>
                          <ChevronRight className="w-3 h-3 text-[var(--t3)] shrink-0" />
                        </div>
                        <p className="text-[10px] text-[var(--t3)] line-clamp-2 leading-relaxed">
                          {n.text.slice(0, 80)}
                          {n.text.length > 80 ? "…" : ""}
                        </p>
                      </motion.button>
                    ))}
                    <p className="text-[9px] text-[var(--t3)] text-center pt-1 italic">
                      Tap any note to open that lesson
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
}

// ─── Standalone "My Lesson Notes" list view (used by More view) ───

/**
 * Lists every saved note across all lessons. Sort order: by note length
 * descending — longer, more thoughtful notes surface first. Ties broken
 * alphabetically by lesson title. Documented in worklog.
 */
export function MyLessonNotesList() {
  const lessonNotes = useAppStore((s) => s.lessonNotes);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const deleteLessonNote = useAppStore((s) => s.deleteLessonNote);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const entries = useMemo(() => {
    return Object.entries(lessonNotes)
      .filter(([, text]) => text.trim().length > 0)
      .map(([id, text]) => {
        const lesson = getLesson(id);
        return {
          id,
          text,
          title: lesson?.title ?? id,
          phaseId: lesson?.phaseId ?? 0,
          lessonIndex: lesson?.lessonIndex ?? 0,
          length: text.trim().length,
        };
      })
      .sort((a, b) => {
        // Longest notes first; ties broken by phase/lesson catalog order.
        if (b.length !== a.length) return b.length - a.length;
        if (a.phaseId !== b.phaseId) return a.phaseId - b.phaseId;
        return a.lessonIndex - b.lessonIndex;
      });
  }, [lessonNotes]);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center">
        <div className="text-3xl mb-2">📔</div>
        <div className="text-sm text-[var(--t2)] max-w-xs mx-auto">
          No notes yet — open any lesson and tap the notebook icon to start
          journaling your progress.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
      {entries.map((entry) => {
        const isConfirm = confirmDeleteId === entry.id;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] transition group"
          >
            <div className="flex items-start gap-2">
              <button
                onClick={() => setActiveLesson(entry.id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(99,102,241,0.12)] text-[var(--p3)] uppercase tracking-wider shrink-0">
                    P{entry.phaseId + 1}
                  </span>
                  <span className="text-sm font-semibold text-[var(--t1)] truncate group-hover:text-[var(--p3)] transition">
                    {entry.title}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--t2)] line-clamp-2 leading-relaxed">
                  {entry.text.slice(0, 100)}
                  {entry.text.length > 100 ? "…" : ""}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9px] text-[var(--t3)] font-mono">
                  <span>{entry.length} chars</span>
                  <span>·</span>
                  <span>{entry.text.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </button>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isConfirm ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteLessonNote(entry.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#ef4444]/15 border border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/25 transition"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[var(--card)] border border-[var(--border2)] text-[var(--t2)] hover:bg-[var(--card-h)] transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(entry.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--t3)] hover:text-[#ef4444] transition"
                    aria-label={`Delete note for ${entry.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Helper to count total notes for header display.
export function useLessonNoteCount(): number {
  const lessonNotes = useAppStore((s) => s.lessonNotes);
  return useMemo(
    () =>
      Object.values(lessonNotes).filter((t) => t.trim().length > 0).length,
    [lessonNotes]
  );
}
