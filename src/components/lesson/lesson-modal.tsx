"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check, RotateCcw, NotebookPen, Volume2 } from "lucide-react";
import type { Lesson, LessonStep } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { speak, stopSpeaking, loadVoices, unlockTTS, isSpeaking, onSpeakingChange } from "@/lib/tts";
import { MouthDiagram } from "@/components/widgets/mouth-diagram";
import { VowelChart } from "@/components/widgets/vowel-chart";
import { StressBars } from "@/components/widgets/stress-bars";
import { RhythmBeats } from "@/components/widgets/rhythm-beats";
import { LinkingDiagram } from "@/components/widgets/linking-diagram";
import { IntonationContour } from "@/components/widgets/intonation-contour";
import { LessonNotesPanel } from "@/components/widgets/lesson-notes-panel";
import { CompareWave } from "@/components/widgets/compare-wave";
import { MicWaveform } from "@/components/widgets/mic-waveform";
import { Confetti } from "@/components/widgets/confetti";
import { ProgressRing } from "@/components/widgets/progress-ring";
import { DifficultyBadge } from "@/components/widgets/difficulty-badge";
import { IntroIllustration } from "@/components/widgets/intro-illustration";

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onNext?: () => void;
}

/**
 * Returns the "primary audio" text for a lesson step — the text that should
 * be spoken when the user presses Space (or wants a quick replay).
 * Returns `null` for step types that have no meaningful auto-play audio.
 */
function getPrimaryAudioText(step: LessonStep | undefined): string | null {
  if (!step) return null;
  switch (step.type) {
    case "intro":
      return step.title;
    case "example":
      return step.phrase;
    case "mouth-diagram":
      return step.exampleWord || null;
    case "compare":
      return step.nativePhrase;
    case "stress-bars":
      return step.word;
    case "rhythm":
      return step.phrase;
    case "linking":
      return step.words.join(" ");
    case "shadow":
      return step.phrase;
    case "intonation":
      return step.phrase;
    case "practice":
      return step.phrase;
    // No primary audio: concept, vowel-chart, tap-pronounce, tip, quiz, completion
    default:
      return null;
  }
}

/** Step transition variants — direction: 1 = forward, −1 = backward.
 *  Uses `custom` prop so exiting components receive the *latest*
 *  direction value (fixes stale-closure bug with inline objects). */
const stepVariants = {
  enter: (direction: number) => ({
    x: direction * 30,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction * -30,
    opacity: 0,
    scale: 0.99,
  }),
};

const stepTransition = {
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quad — snappy feel
};

/** Brief fade overlay that appears between step transitions.
 *  Mounts with a subtle bg tint and fades out, giving a
 *  polished cross-fade feel without blocking interaction. */
function StepTransitionOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0.1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute inset-0 bg-[var(--bg)] z-[5] pointer-events-none"
    />
  );
}

const VISUAL_EMOJI: Record<string, string> = {
  wave: "🌊",
  mouth: "👄",
  "ipa-chart": "🔤",
  "vowel-chart": "🎯",
  "compare-wave": "📊",
  rhythm: "🎵",
  "phoneme-grid": "🔡",
  "stress-bars": "📈",
  linking: "🔗",
  shadow: "🪞",
  intonation: "📐",
  "emoji-burst": "✨",
};

/** Step type → emoji icon mapping */
const STEP_ICON: Record<string, string> = {
  intro: "👋", concept: "📖", example: "💬", "mouth-diagram": "👄",
  "vowel-chart": "🎯", compare: "📊", "stress-bars": "📈", rhythm: "🎵",
  linking: "🔗", shadow: "🪞", intonation: "📐", "tap-pronounce": "👆",
  tip: "💡", practice: "🎙", quiz: "❓", completion: "🏆"
};

// (Category tint/glow system removed for minimal design — solid colors only)

// Module-level map to persist timer state across modal mount/unmount cycles
const lessonTimerAccumulated: Map<string, number> = new Map();

/** Format seconds as mm:ss */
function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function LessonModal({ lesson, onClose, onNext }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Briefly shows a "⌨ Press Space to play" hint when a step with audio loads.
  const [showSpaceHint, setShowSpaceHint] = useState(false);
  // Track the previous stepIdx so we can reset per-step interactive state
  // when the step changes — using the official "adjust state during render"
  // pattern instead of setState-in-effect (react-hooks/set-state-in-effect).
  const [prevStepIdx, setPrevStepIdx] = useState(stepIdx);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const ttsSpeed = 1;
  // Speaking state — drives the header indicator (Bug 3 fix)
  const [speaking, setSpeaking] = useState(false);

  // ── Lesson Timer ──
  const [timerDisplay, setTimerDisplay] = useState("0:00");
  const timerStartRef = useRef<number>(Date.now());
  const timerAccumulatedRef = useRef<number>(lessonTimerAccumulated.get(lesson.id) ?? 0);

  // Scroll container ref — reset to top on step change (Bug 1 fix)
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Root ref — for attaching one-time TTS unlock listener (Bug 3 fix)
  const rootRef = useRef<HTMLDivElement>(null);

  const accent = useAppStore((s) => s.accent);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const markReviewed = useAppStore((s) => s.markReviewed);
  const lessons = useAppStore((s) => s.lessons);
  const addSpeakingTime = useAppStore((s) => s.addSpeakingTime);
  const hasLessonNote = useAppStore((s) => (s.lessonNotes[lesson.id] ?? "").trim().length > 0);

  const step = lesson.steps[stepIdx];
  const isLast = stepIdx === lesson.steps.length - 1;
  const isFirst = stepIdx === 0;
  const totalSteps = lesson.steps.length;
  const pct = Math.round(((stepIdx + 1) / totalSteps) * 100);

  // Preload voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  // Reset scroll position to top whenever the step changes (Bug 1 fix).
  // Without this, scrolling down on step N opens step N+1 already scrolled
  // to the bottom.
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [stepIdx]);

  // Unlock TTS on first user interaction with the modal (Bug 3 fix).
  // Mobile Safari / Chrome Android block speechSynthesis.speak() until a
  // user gesture has occurred. We attach a one-time pointerdown listener
  // to the modal root that calls unlockTTS() and then removes itself.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onFirstInteract = () => {
      unlockTTS();
      root.removeEventListener("pointerdown", onFirstInteract);
    };
    root.addEventListener("pointerdown", onFirstInteract);
    return () => root.removeEventListener("pointerdown", onFirstInteract);
  }, []);

  // Subscribe to TTS speaking state so the header indicator stays in sync
  // with actual audio playback (Bug 3 fix).
  useEffect(() => {
    const unsub = onSpeakingChange(() => setSpeaking(isSpeaking()));
    setSpeaking(isSpeaking());
    return unsub;
  }, []);

  // ── Timer tick effect ──
  useEffect(() => {
    timerStartRef.current = Date.now();
    const tick = () => {
      const elapsed = timerAccumulatedRef.current + (Date.now() - timerStartRef.current) / 1000;
      setTimerDisplay(formatTimer(elapsed));
    };
    tick(); // initial tick
    const id = setInterval(tick, 1000);
    return () => {
      clearInterval(id);
      // Save accumulated time for this lesson when modal unmounts (pause)
      const elapsed = timerAccumulatedRef.current + (Date.now() - timerStartRef.current) / 1000;
      timerAccumulatedRef.current = elapsed;
      lessonTimerAccumulated.set(lesson.id, elapsed);
    };
  }, [lesson.id]);

  // Reset per-step interactive state when stepIdx changes.
  // Official React pattern: adjust state during render based on a tracked
  // previous value. React re-renders immediately without committing the
  // stale intermediate state. (Avoids setState-in-effect cascades.)
  if (stepIdx !== prevStepIdx) {
    setPrevStepIdx(stepIdx);
    setQuizAnswer(null);
    setPracticeScore(null);
    setRecording(false);
    // Reset the Space-to-play hint based on whether the new step has audio.
    setShowSpaceHint(!!getPrimaryAudioText(lesson.steps[stepIdx]));
  }

  // Stop TTS on unmount or step change
  useEffect(() => {
    return () => stopSpeaking();
  }, [stepIdx]);

  // Auto-hide the "Press Space to play" hint after 3s when it's showing.
  // The hint itself is shown/hidden via the render-time adjustment above
  // (avoids setState-in-effect cascades).
  useEffect(() => {
    if (!showSpaceHint) return;
    const t = setTimeout(() => setShowSpaceHint(false), 3000);
    return () => clearTimeout(t);
  }, [showSpaceHint]);

  const handleSpeak = useCallback(
    (text: string) => {
      speak(text, { accent, rate: ttsSpeed });
    },
    [accent, ttsSpeed]
  );

  const goNext = useCallback(() => {
    if (isLast) {
      // already at completion step
      return;
    }
    setDirection(1);
    setStepIdx((i) => i + 1);
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (isFirst) return;
    setDirection(-1);
    setStepIdx((i) => i - 1);
  }, [isFirst]);

  // Mark completion when reaching completion step
  const completionStep = lesson.steps.find((s) => s.type === "completion");
  const alreadyCompleted = lessons[lesson.id]?.completed;

  const handleComplete = useCallback(() => {
    if (alreadyCompleted) return;
    if (completionStep?.type === "completion") {
      // Calculate total time spent
      const elapsed = timerAccumulatedRef.current + (Date.now() - timerStartRef.current) / 1000;
      completeLesson(
        lesson.id,
        practiceScore ?? 85,
        completionStep.xp,
        completionStep.badge,
        Math.floor(elapsed)
      );
      // Mark as reviewed since they just completed it
      markReviewed(lesson.id);
      addSpeakingTime(8);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      // Clear timer state for this lesson
      lessonTimerAccumulated.delete(lesson.id);
    }
  }, [alreadyCompleted, completionStep, completeLesson, markReviewed, lesson.id, practiceScore, addSpeakingTime]);

  // Auto-trigger completion when user reaches the completion step.
  // handleComplete calls setState (setShowConfetti + store actions), so we
  // defer it out of the synchronous effect body to satisfy
  // react-hooks/set-state-in-effect (no cascading renders).
  useEffect(() => {
    if (step?.type !== "completion" || alreadyCompleted) return;
    const id = setTimeout(() => handleComplete(), 0);
    return () => clearTimeout(id);
  }, [step, alreadyCompleted, handleComplete]);

  // ESC to close, Arrows to navigate, Space to play step audio
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close the notes panel first if it's open; otherwise close the lesson.
        if (showNotesPanel) {
          setShowNotesPanel(false);
          return;
        }
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        goNext();
        return;
      }
      if (e.key === "ArrowLeft") {
        goPrev();
        return;
      }
      // Space → play the current step's primary audio
      if (e.key === " " || e.code === "Space") {
        // When the notes panel is open, the user is taking notes — don't
        // hijack Space for audio playback.
        if (showNotesPanel) return;
        const target = e.target as HTMLElement | null;
        const isTyping =
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable);
        if (isTyping) return;

        // Don't capture Space when another overlay is open that needs it
        // (AI Coach chat input, or this very shortcuts overlay).
        const coachOpen = document.querySelector(
          '[aria-label="AccentAI Coach chat"]'
        );
        if (coachOpen) return;
        const overlay = document.getElementById("shortcuts-overlay");
        if (overlay && !overlay.classList.contains("hidden")) return;

        // If an interactive element (button / link) is focused, let the
        // browser's native Space-to-click behaviour win so users who tab
        // through the UI can still activate controls with Space.
        const active = document.activeElement as HTMLElement | null;
        if (
          active &&
          (active.tagName === "BUTTON" ||
            active.tagName === "A" ||
            active.getAttribute("role") === "button")
        ) {
          return;
        }

        const text = getPrimaryAudioText(step);
        if (text) {
          e.preventDefault();
          handleSpeak(text);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose, step, handleSpeak, showNotesPanel]);

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[var(--bg)] flex flex-col overflow-hidden"
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
      {showConfetti && <Confetti count={100} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)] safe-top">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--card-h)] transition"
          aria-label="Close lesson"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 px-3 text-center">
          <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider font-mono">
            Phase {lesson.phaseId + 1} · Lesson {lesson.lessonIndex + 1}
          </div>
          <div className="text-sm font-d font-semibold truncate">{lesson.title}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={() => setShowNotesPanel(true)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--card-h)] transition text-[var(--t2)] hover:text-[var(--p3)]"
            aria-label="Open lesson notes"
            aria-expanded={showNotesPanel}
          >
            <NotebookPen style={{ width: 18, height: 18 }} />
            <AnimatePresence>
              {hasLessonNote && (
                <motion.span
                  key="note-dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--p3)] ring-2 ring-[var(--bg2)]"
                  style={{ boxShadow: "0 0 6px rgba(167,139,250,0.8)" }}
                />
              )}
            </AnimatePresence>
          </motion.button>
          {/* Speaking indicator (Bug 3 fix) — pulsing dot + icon while TTS is active */}
          {speaking && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border2)] text-[11px] font-mono text-[var(--t2)]"
              aria-label="Audio playing"
            >
              <motion.span
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-[var(--p)]"
              />
              <Volume2 className="w-3 h-3" />
            </span>
          )}
          {/* Timer display */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--border2)] text-[11px] font-mono text-[var(--t2)]">
            <span className="text-[10px]">⏱</span>
            <span>{timerDisplay}</span>
          </div>
          <span className="text-xs font-mono text-[var(--t2)]">{stepIdx + 1}/{totalSteps}</span>
          <ProgressRing pct={pct} size={36} stroke={3} />
        </div>
      </div>

      {/* ── Minimal step progress bar ── */}
      <div className="px-3 py-2 bg-[var(--bg)] border-b border-[var(--border)]">
        <div className="relative max-w-2xl mx-auto" style={{ height: 32 }}>
          {/* Thin gray track */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-[var(--border)]" />

          {/* Solid fill up to the current step */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-[var(--p)] transition-all duration-300 ease-out"
            style={{
              left: 0,
              width: `${(stepIdx / Math.max(totalSteps - 1, 1)) * 100}%`,
            }}
          />

          {/* Step dots — current = solid p, past = solid gray, upcoming = outline */}
          <div className="absolute inset-0 flex items-center justify-between">
            {lesson.steps.map((s, i) => {
              const isCurrent = i === stepIdx;
              const isPast = i < stepIdx;
              const isUpcoming = i > stepIdx;
              const icon = STEP_ICON[s.type] || "•";
              const stepTitle = s.title || s.type.replace(/-/g, " ");

              return (
                <button
                  key={i}
                  onClick={() => { setDirection(i > stepIdx ? 1 : -1); setStepIdx(i); }}
                  className="relative flex items-center justify-center rounded-full cursor-pointer group transition-transform hover:scale-110 active:scale-95"
                  style={{
                    width: isCurrent ? 26 : 20,
                    height: isCurrent ? 26 : 20,
                    fontSize: isCurrent ? 11 : 9,
                    background: isCurrent
                      ? "var(--p)"
                      : isPast
                      ? "var(--t2)"
                      : "var(--bg)",
                    border: isUpcoming ? "1px solid var(--border2)" : "none",
                    color: isCurrent ? "#fff" : isPast ? "var(--bg)" : "var(--t3)",
                  }}
                  aria-label={`Step ${i + 1}: ${stepTitle}`}
                >
                  <span className="leading-none select-none">{icon}</span>

                  {/* Hover tooltip */}
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[var(--bg3)] border border-[var(--border2)] text-[9px] text-[var(--t2)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono z-20">
                    {stepTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        {/* Subtle fade overlay between steps */}
        <AnimatePresence>
          <StepTransitionOverlay key={stepIdx} />
        </AnimatePresence>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIdx}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
            className="max-w-2xl mx-auto px-5 py-6 pb-32"
          >
            {/* Step-type chip with icon + label, animated entrance */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
                <span className="text-sm leading-none">
                  {STEP_ICON[step?.type || ""] || "•"}
                </span>
                <span>{step?.type?.replace("-", " ")}</span>
                <span className="opacity-50">·</span>
                <span>Step {stepIdx + 1} of {totalSteps}</span>
              </div>
            </motion.div>
            <StepRenderer
              step={step}
              lesson={lesson}
              speak={handleSpeak}
              quizAnswer={quizAnswer}
              setQuizAnswer={setQuizAnswer}
              practiceScore={practiceScore}
              setPracticeScore={setPracticeScore}
              recording={recording}
              setRecording={setRecording}
              isLast={isLast}
              onComplete={handleComplete}
              onNext={onNext}
              timeSpentSeconds={timerAccumulatedRef.current + (Date.now() - timerStartRef.current) / 1000}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* "Press Space to play" hint — appears briefly above the footer when a
          step with audio loads. pointer-events-none so it never blocks taps. */}
      <AnimatePresence>
        {showSpaceHint && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-24 z-30 pointer-events-none"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg2)] border border-[var(--border)] text-xs text-[var(--t2)]">
              <kbd className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--bg3)] border border-[var(--border2)] text-[var(--t1)]">
                Space
              </kbd>
              <span>Press Space to play</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer nav — z-20 ensures it stays above content + transition overlay */}
      <div className="relative z-20 border-t border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center gap-3 safe-bottom">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--card-h)] transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1" />
        {step?.type === "completion" ? (
          onNext ? (
            <button
              onClick={onNext}
              className="px-5 py-2.5 rounded-xl bg-[var(--p)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
            >
              Next Lesson <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[var(--p)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
            >
              <Check className="w-4 h-4" /> Finish
            </button>
          )
        ) : (
          <button
            onClick={goNext}
            className="px-5 py-2.5 rounded-xl bg-[var(--p)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            {isLast ? "Complete" : "Continue"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Lesson Notes — slide-in side panel overlay */}
      <AnimatePresence>
        {showNotesPanel && (
          <motion.div
            key="notes-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-end"
            onClick={() => setShowNotesPanel(false)}
            aria-hidden="false"
          >
            <motion.div
              key="notes-panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md bg-[var(--bg)] border-l border-[var(--border2)] flex flex-col safe-top safe-bottom"
              role="dialog"
              aria-label={`Notes panel for ${lesson.title}`}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                    style={{ background: "var(--p)" }}
                  >
                    <NotebookPen style={{ width: 14, height: 14 }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)]">
                      My Notebook
                    </div>
                    <div className="text-xs font-d font-semibold text-[var(--t1)] truncate max-w-[200px] sm:max-w-xs">
                      {lesson.title}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--card-h)] transition text-[var(--t2)] hover:text-[var(--t1)]"
                  aria-label="Close notes panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-4">
                <LessonNotesPanel lessonId={lesson.id} lessonTitle={lesson.title} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>{/* end z-10 inner wrapper */}
    </motion.div>
  );
}

// ─── Step Renderer ───

interface StepRendererProps {
  step: LessonStep;
  lesson: Lesson;
  speak: (text: string) => void;
  quizAnswer: number | null;
  setQuizAnswer: (n: number | null) => void;
  practiceScore: number | null;
  setPracticeScore: (n: number | null) => void;
  recording: boolean;
  setRecording: (b: boolean) => void;
  isLast: boolean;
  onComplete: () => void;
  onNext?: () => void;
  timeSpentSeconds: number;
}

function StepRenderer(props: StepRendererProps) {
  const { step, lesson, speak } = props;

  switch (step.type) {
    case "intro":
      return <IntroStepView step={step} lesson={lesson} />;
    case "concept":
      return <ConceptStepView step={step} />;
    case "example":
      return <ExampleStepView step={step} speak={speak} />;
    case "mouth-diagram":
      return <MouthDiagram step={step} speak={speak} />;
    case "vowel-chart":
      return <VowelChart step={step} speak={speak} />;
    case "compare":
      return <CompareWave step={step} speak={speak} />;
    case "stress-bars":
      return <StressBars step={step} speak={speak} />;
    case "rhythm":
      return <RhythmBeats step={step} speak={speak} />;
    case "linking":
      return <LinkingDiagram step={step} speak={speak} />;
    case "intonation":
      return <IntonationContour step={step} speak={speak} />;
    case "shadow":
      return <ShadowStepView step={step} speak={speak} />;
    case "tap-pronounce":
      return <TapPronounceStepView step={step} speak={speak} />;
    case "tip":
      return <TipStepView step={step} />;
    case "practice":
      return <PracticeStepView {...props} />;
    case "quiz":
      return <QuizStepView {...props} />;
    case "completion":
      return <CompletionStepView step={step} onNext={props.onNext} timeSpentSeconds={props.timeSpentSeconds} practiceScore={props.practiceScore} />;
    default:
      return <div>Unknown step type</div>;
  }
}

// ─── Individual step views ───

function IntroStepView({ step, lesson }: {
  step: Extract<LessonStep, { type: "intro" }>;
  lesson: Lesson;
}) {
  return (
    <div className="space-y-5 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex flex-col items-center gap-1.5 mb-2"
      >
        <div className="animate-gentle-float">
          <IntroIllustration visual={step.visual} emoji={step.emoji} size={120} />
        </div>
        {step.emoji && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-2xl"
            aria-hidden="true"
          >
            {step.emoji}
          </motion.span>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--t3)] font-mono">
            Lesson Introduction
          </div>
          <DifficultyBadge lesson={lesson} size="sm" />
        </div>
        <h1 className="font-d text-3xl font-bold mb-2 text-[var(--t1)]">
          {step.title}
        </h1>
        <p className="text-[var(--t2)] text-base mb-4">{step.subtitle}</p>
        <p className="text-[var(--t2)] text-sm leading-relaxed max-w-md mx-auto">
          {step.description}
        </p>
      </motion.div>
    </div>
  );
}

function ConceptStepView({ step }: { step: Extract<LessonStep, { type: "concept" }> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(99,102,241,0.15)] text-[#a78bfa] font-mono font-bold uppercase tracking-wider border border-[rgba(99,102,241,0.2)]">
          Concept
        </span>
        {step.visualLabel && (
          <span className="text-[10px] text-[var(--t3)] px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)]">
            {step.visualLabel}
          </span>
        )}
      </div>
      <h2 className="font-d text-2xl font-bold text-[var(--t1)]">{step.title}</h2>
      <div className="space-y-3">
        {step.body.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-[var(--t2)] text-sm leading-relaxed"
          >
            {p}
          </motion.p>
        ))}
      </div>
      {step.bulletPoints && step.bulletPoints.length > 0 && (
        <ul className="space-y-2 mt-2">
          {step.bulletPoints.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.12)] hover:border-[rgba(99,102,241,0.25)] transition-colors"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--grad-btn)] mt-1.5 shrink-0 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
              <span className="text-[var(--t2)] text-sm font-mono">{b}</span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExampleStepView({ step, speak }: { step: Extract<LessonStep, { type: "example" }>; speak: (t: string) => void }) {
  const words = step.phrase.split(/\s+/);
  return (
    <div className="space-y-4">
      {step.title && (
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[rgba(34,211,238,0.15)] text-[#22d3ee] font-mono font-bold uppercase tracking-wider border border-[rgba(34,211,238,0.2)]">
            Example
          </span>
        </div>
      )}
      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.25)] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[rgba(99,102,241,0.06)] blur-[40px] pointer-events-none" />
        
        <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
          {words.map((w, i) => {
            const cleaned = w.replace(/[.,!?;:"']/g, "");
            const isHl = step.highlightWords?.some((hw) => hw.replace(/[.,!?;:"']/g, "") === cleaned);
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speak(w)}
                className={`px-2.5 py-1.5 rounded-lg text-base font-d transition ${
                  isHl
                    ? "bg-[var(--grad-btn)] text-white font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                    : "bg-[var(--card-h)] text-[var(--t2)] hover:text-[var(--t1)] border border-[var(--border)]"
                }`}
              >
                {w}
              </motion.button>
            );
          })}
        </div>
        <div className="text-center font-mono text-sm text-[var(--t3)] mb-4 relative z-10">{step.ipa}</div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => speak(step.phrase)}
          className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition relative z-10"
          style={{ boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}
        >
          <span className="text-lg">▶</span> Play full phrase
        </motion.button>
      </div>
      {step.tapWords && step.tapWords.length > 0 && (
        <div>
          <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider font-mono mb-2">
            Tap to hear individual words
          </div>
          <div className="flex flex-wrap gap-2">
            {step.tapWords.map((tw, i) => (
              <button
                key={i}
                onClick={() => speak(tw.word)}
                className="px-3 py-2 rounded-xl bg-[var(--card-h)] border border-[var(--border)] hover:border-[var(--p3)] transition text-left"
              >
                <div className="font-d text-sm">{tw.word}</div>
                <div className="font-mono text-[10px] text-[var(--t3)]">{tw.ipa}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      {step.tip && (
        <div className="rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-xs text-[var(--t2)]">
          <strong className="text-[#f59e0b]">💡 Tip:</strong> {step.tip}
        </div>
      )}
    </div>
  );
}

function TapPronounceStepView({ step, speak }: { step: Extract<LessonStep, { type: "tap-pronounce" }>; speak: (t: string) => void }) {
  return (
    <div className="space-y-4">
      {step.title && <h2 className="font-d text-2xl font-bold">{step.title}</h2>}
      {step.description && <p className="text-[var(--t2)] text-sm leading-relaxed">{step.description}</p>}
      <div className="grid grid-cols-2 gap-3">
        {step.words.map((w, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => speak(w.word)}
            className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--p3)] hover:bg-[var(--card-h)] transition text-left group"
          >
            <div className="font-d text-lg text-[var(--t1)] group-hover:text-[var(--p3)] transition">
              {w.word}
            </div>
            <div className="font-mono text-xs text-[var(--t3)] mt-1">{w.ipa}</div>
            {w.meaning && (
              <div className="text-[10px] text-[var(--t2)] mt-1.5 px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.1)] inline-block">
                {w.meaning}
              </div>
            )}
            <div className="text-right text-[var(--t3)] text-xs mt-2">tap ▶</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function TipStepView({ step }: { step: Extract<LessonStep, { type: "tip" }> }) {
  const variantStyles = {
    info: { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.3)", color: "#a78bfa", icon: "💡" },
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.3)", color: "#10b981", icon: "✓" },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", color: "#f59e0b", icon: "⚠" },
  };
  const v = variantStyles[step.variant || "info"];
  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-5 border"
        style={{ background: v.bg, borderColor: v.border }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{v.icon}</span>
          {step.title && <h3 className="font-d text-lg font-bold" style={{ color: v.color }}>{step.title}</h3>}
        </div>
        <p className="text-[var(--t2)] text-sm leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
}

function ShadowStepView({ step, speak }: { step: Extract<LessonStep, { type: "shadow" }>; speak: (t: string) => void }) {
  const [count, setCount] = useState(3);
  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);
  return (
    <div className="space-y-4">
      {step.title && <h2 className="font-d text-2xl font-bold">{step.title}</h2>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{step.description}</p>
      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[var(--border)]">
        <div className="text-center mb-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2">
            Shadow this phrase
          </div>
          <div className="font-d text-xl text-[var(--t1)]">{step.phrase}</div>
          <div className="font-mono text-sm text-[var(--t3)] mt-1">{step.ipa}</div>
        </div>
        <button
          onClick={() => {
            speak(step.phrase);
            setCount(3);
          }}
          className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          {count > 0 && count < 3 ? `Repeat in ${count}...` : "▶ Listen & Repeat"}
        </button>
      </div>
    </div>
  );
}

function PracticeStepView({
  step,
  speak,
  recording,
  setRecording,
  practiceScore,
  setPracticeScore,
}: StepRendererProps) {
  const s = step as Extract<LessonStep, { type: "practice" }>;
  const pass = s.passScore ?? 70;

  useEffect(() => {
    if (recording) {
      const t1 = setTimeout(() => {
        // simulate analysis
        const score = 65 + Math.floor(Math.random() * 30);
        setPracticeScore(score);
        setRecording(false);
      }, 3500);
      return () => clearTimeout(t1);
    }
  }, [recording, setPracticeScore, setRecording]);

  const passed = practiceScore !== null && practiceScore >= pass;

  return (
    <div className="space-y-4">
      {s.title && <h2 className="font-d text-2xl font-bold">{s.title}</h2>}
      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[var(--border)]">
        <div className="text-center mb-3">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2">
            Your turn to speak
          </div>
          <div className="font-d text-xl text-[var(--t1)]">{s.phrase}</div>
          <div className="font-mono text-sm text-[var(--t3)] mt-1">{s.ipa}</div>
        </div>

        <button
          onClick={() => speak(s.phrase)}
          className="w-full py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border2)] text-sm font-semibold mb-4 flex items-center justify-center gap-2 hover:bg-[var(--card)] transition"
        >
          ▶ Hear the target
        </button>

        <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg2)]">
          <MicWaveform height={100} active={recording} />
        </div>

        <div className="mt-4 flex flex-col items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (recording) {
                setRecording(false);
              } else {
                setPracticeScore(null);
                setRecording(true);
              }
            }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold relative"
            style={{
              background: recording
                ? "radial-gradient(circle, #ef4444, #dc2626)"
                : "var(--grad-btn)",
              color: "white",
              boxShadow: recording
                ? "0 0 40px rgba(239,68,68,0.5)"
                : "0 0 30px rgba(99,102,241,0.4)",
            }}
          >
            {recording ? (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ■
              </motion.span>
            ) : (
              "🎙"
            )}
            {recording && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[#ef4444]"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
          </motion.button>
          <div className="text-xs text-[var(--t3)]">
            {recording ? "Recording... tap to stop" : "Tap to record"}
          </div>
        </div>

        {practiceScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: passed ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${passed ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
              }}
            >
              <div
                className="font-d text-3xl font-bold"
                style={{ color: passed ? "#10b981" : "#f59e0b" }}
              >
                {practiceScore}%
              </div>
              <div className="text-xs text-[var(--t2)] mt-1">
                {passed ? "🎉 Great job! You passed." : "Almost there — try again!"}
              </div>
            </div>
          </motion.div>
        )}

        {s.tip && (
          <div className="mt-3 rounded-xl p-3 bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] text-xs text-[var(--t2)]">
            <strong className="text-[#f59e0b]">💡 Tip:</strong> {s.tip}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizStepView({
  step,
  quizAnswer,
  setQuizAnswer,
}: StepRendererProps) {
  const s = step as Extract<LessonStep, { type: "quiz" }>;
  const answered = quizAnswer !== null;
  const isCorrect = answered && quizAnswer === s.correct;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(167,139,250,0.15)] text-[#a78bfa] font-mono font-bold uppercase tracking-wider">
          Quiz
        </span>
      </div>
      <h2 className="font-d text-xl font-bold text-[var(--t1)] leading-snug">{s.question}</h2>
      <div className="space-y-2">
        {s.options.map((opt, i) => {
          const isSelected = quizAnswer === i;
          const isCorrectOpt = i === s.correct;
          let style = "bg-[var(--card)] border-[var(--border)] hover:border-[var(--p3)]";
          if (answered) {
            if (isCorrectOpt) {
              style = "bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.5)]";
            } else if (isSelected) {
              style = "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.5)]";
            } else {
              style = "bg-[var(--card)] border-[var(--border)] opacity-50";
            }
          }
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              disabled={answered}
              onClick={() => setQuizAnswer(i)}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between gap-3 transition ${style}`}
            >
              <span className="text-sm font-medium text-[var(--t1)]">{opt}</span>
              {answered && isCorrectOpt && <Check className="w-5 h-5 text-[#10b981]" />}
              {answered && isSelected && !isCorrectOpt && <X className="w-5 h-5 text-[#ef4444]" />}
            </motion.button>
          );
        })}
      </div>
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 border ${
            isCorrect
              ? "bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.3)]"
              : "bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.3)]"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-bold ${isCorrect ? "text-[#10b981]" : "text-[#ef4444]"}`}>
              {isCorrect ? "✓ Correct!" : "✗ Not quite"}
            </span>
          </div>
          <p className="text-[var(--t2)] text-sm leading-relaxed">{s.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

function CompletionStepView({
  step,
  onNext,
  timeSpentSeconds,
  practiceScore,
}: {
  step: Extract<LessonStep, { type: "completion" }>;
  onNext?: () => void;
  timeSpentSeconds: number;
  practiceScore: number | null;
}) {
  const [displayXp, setDisplayXp] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const targetXp = step.xp;
  const score = practiceScore ?? 85;

  // Animated XP counter with ease-out over 800ms
  useEffect(() => {
    if (targetXp <= 0) return;
    const duration = 800;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.round(eased * targetXp));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [targetXp]);

  // Animated score counter
  useEffect(() => {
    const duration = 1000;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  // Star particles — explode outward from badge center
  const starParticles = useMemo(() => {
    const colors = ["#6366f1", "#8b5cf6", "#22d3ee", "#f59e0b", "#10b981", "#a78bfa", "#67e8f9", "#fb923c", "#34d399"];
    return Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 60 + Math.random() * 50;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        char: i % 3 === 0 ? "✦" : "•",
        size: i % 3 === 0 ? 14 : 10,
        delay: 0.15 + i * 0.03,
        color: colors[i],
      };
    });
  }, []);

  return (
    <div className="text-center space-y-5 py-8 relative overflow-hidden">
      {/* Background celebration glow — pulsing radial gradient */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.12) 35%, rgba(34,211,238,0.06) 65%, transparent 100%)",
        }}
        animate={{
          scale: [0.8, 1.2, 0.95, 1.1, 1],
          opacity: [0, 0.7, 0.4, 0.6, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />

      {/* Star particles exploding outward */}
      {starParticles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute pointer-events-none z-20"
          style={{
            top: "38%",
            left: "50%",
            fontSize: p.size,
            color: p.color,
            textShadow: `0 0 6px ${p.color}88`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1.3, 1, 0.2],
          }}
          transition={{
            duration: 1.2,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          {p.char}
        </motion.span>
      ))}

      {/* Badge with spring bounce + continuous float — staggered 0ms */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0 }}
        className="relative z-10 inline-block"
      >
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl"
        >
          🏆
        </motion.div>
      </motion.div>

      {/* Title + subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h1 className="font-d text-3xl font-bold mb-2">
          <span className="grad-text">{step.title}</span>
        </h1>
        <p className="text-[var(--t2)] text-base max-w-md mx-auto">{step.subtitle}</p>
      </motion.div>

      {/* Animated XP counter with glow — staggered 200ms */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full relative overflow-hidden"
        style={{
          background: "var(--grad-btn)",
          boxShadow: "0 0 30px rgba(99,102,241,0.5), 0 0 60px rgba(99,102,241,0.2)",
        }}
      >
        {/* Shimmer sweep on XP badge */}
        <motion.div
          className="absolute inset-y-0 w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        />
        <span className="text-xl relative z-10">⚡</span>
        <span className="font-d text-xl font-bold text-white relative z-10">
          +{displayXp} XP
        </span>
      </motion.div>

      {/* Score ring — staggered 400ms */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="relative">
          <ProgressRing pct={score} size={80} stroke={5} label={`${displayScore}%`} />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
          Accuracy Score
        </div>
      </motion.div>

      {step.badge && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-sm font-semibold text-[#f59e0b] animate-achievement-burst"
        >
          <motion.span
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            🏅
          </motion.span>
          <span>Badge unlocked: {step.badge}</span>
        </motion.div>
      )}

      {/* Time spent on lesson */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm text-[var(--t2)]">
          <span className="text-base">⏱</span>
          <span className="font-mono font-semibold">{formatTimer(timeSpentSeconds)}</span>
          <span className="text-[var(--t3)]">spent</span>
        </div>
        <div className="text-[10px] text-[var(--t3)] font-mono flex items-center gap-1">
          <span>🔄</span> Next review suggested in 2 days
        </div>
      </motion.div>

      {/* Next lesson preview + button — staggered 600ms */}
      {step.nextLessonTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-2"
        >
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
            Up Next
          </div>
          <div className="font-d text-lg text-[var(--t1)]">{step.nextLessonTitle}</div>
          {onNext && (
            <motion.button
              onClick={onNext}
              className="mt-3 px-8 py-3 rounded-xl bg-[var(--grad-btn)] text-white font-semibold text-sm hover:opacity-90 transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, type: "spring" }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Next Lesson
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
