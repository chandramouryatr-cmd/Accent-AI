"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check, RotateCcw } from "lucide-react";
import type { Lesson, LessonStep } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { speak, stopSpeaking, loadVoices } from "@/lib/tts";
import { WaveformCanvas } from "@/components/widgets/waveform-canvas";
import { MouthDiagram } from "@/components/widgets/mouth-diagram";
import { VowelChart } from "@/components/widgets/vowel-chart";
import { StressBars } from "@/components/widgets/stress-bars";
import { RhythmBeats } from "@/components/widgets/rhythm-beats";
import { LinkingDiagram } from "@/components/widgets/linking-diagram";
import { IntonationContour } from "@/components/widgets/intonation-contour";
import { CompareWave } from "@/components/widgets/compare-wave";
import { MicWaveform } from "@/components/widgets/mic-waveform";
import { Confetti } from "@/components/widgets/confetti";
import { ProgressRing } from "@/components/widgets/progress-ring";

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onNext?: () => void;
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

export function LessonModal({ lesson, onClose, onNext }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Track the previous stepIdx so we can reset per-step interactive state
  // when the step changes — using the official "adjust state during render"
  // pattern instead of setState-in-effect (react-hooks/set-state-in-effect).
  const [prevStepIdx, setPrevStepIdx] = useState(stepIdx);
  const accent = useAppStore((s) => s.accent);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const lessons = useAppStore((s) => s.lessons);
  const addSpeakingTime = useAppStore((s) => s.addSpeakingTime);

  const step = lesson.steps[stepIdx];
  const isLast = stepIdx === lesson.steps.length - 1;
  const isFirst = stepIdx === 0;
  const totalSteps = lesson.steps.length;
  const pct = Math.round(((stepIdx + 1) / totalSteps) * 100);

  // Preload voices on mount
  useEffect(() => {
    loadVoices();
  }, []);

  // Reset per-step interactive state when stepIdx changes.
  // Official React pattern: adjust state during render based on a tracked
  // previous value. React re-renders immediately without committing the
  // stale intermediate state. (Avoids setState-in-effect cascades.)
  if (stepIdx !== prevStepIdx) {
    setPrevStepIdx(stepIdx);
    setQuizAnswer(null);
    setPracticeScore(null);
    setRecording(false);
  }

  // Stop TTS on unmount or step change
  useEffect(() => {
    return () => stopSpeaking();
  }, [stepIdx]);

  const handleSpeak = useCallback(
    (text: string) => {
      speak(text, { accent, rate: 0.95 });
    },
    [accent]
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
      completeLesson(
        lesson.id,
        practiceScore ?? 85,
        completionStep.xp,
        completionStep.badge
      );
      addSpeakingTime(8);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [alreadyCompleted, completionStep, completeLesson, lesson.id, practiceScore, addSpeakingTime]);

  // Auto-trigger completion when user reaches the completion step.
  // handleComplete calls setState (setShowConfetti + store actions), so we
  // defer it out of the synchronous effect body to satisfy
  // react-hooks/set-state-in-effect (no cascading renders).
  useEffect(() => {
    if (step?.type !== "completion" || alreadyCompleted) return;
    const id = setTimeout(() => handleComplete(), 0);
    return () => clearTimeout(id);
  }, [step, alreadyCompleted, handleComplete]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[var(--bg)] flex flex-col"
    >
      {showConfetti && <Confetti count={100} />}

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg2)]/80 backdrop-blur safe-top">
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
          <span className="text-xs font-mono text-[var(--t2)]">{stepIdx + 1}/{totalSteps}</span>
          <ProgressRing pct={pct} size={36} stroke={3} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg2)]">
        <motion.div
          className="h-full bg-[var(--grad-btn)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIdx}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto px-5 py-6 pb-32"
          >
            <StepRenderer
              step={step}
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
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="border-t border-[var(--border)] bg-[var(--bg2)]/95 backdrop-blur px-4 py-3 flex items-center gap-3 safe-bottom">
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
              className="px-5 py-2.5 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
            >
              Next Lesson <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
            >
              <Check className="w-4 h-4" /> Finish
            </button>
          )
        ) : (
          <button
            onClick={goNext}
            className="px-5 py-2.5 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            {isLast ? "Complete" : "Continue"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Step Renderer ───

interface StepRendererProps {
  step: LessonStep;
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
}

function StepRenderer(props: StepRendererProps) {
  const { step, speak } = props;

  switch (step.type) {
    case "intro":
      return <IntroStepView step={step} speak={speak} />;
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
      return <CompletionStepView step={step} onNext={props.onNext} />;
    default:
      return <div>Unknown step type</div>;
  }
}

// ─── Individual step views ───

function IntroStepView({ step, speak }: { step: Extract<LessonStep, { type: "intro" }>; speak: (t: string) => void }) {
  return (
    <div className="space-y-5 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="text-7xl mb-2"
      >
        {step.emoji || VISUAL_EMOJI[step.visual] || "✨"}
      </motion.div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--t3)] font-mono mb-2">
          Lesson Introduction
        </div>
        <h1 className="font-d text-3xl font-bold mb-2">
          <span className="grad-text">{step.title}</span>
        </h1>
        <p className="text-[var(--t2)] text-base mb-4">{step.subtitle}</p>
        <p className="text-[var(--t2)] text-sm leading-relaxed max-w-md mx-auto">
          {step.description}
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
        <WaveformCanvas height={140} />
      </div>
      <button
        onClick={() => speak(step.title)}
        className="px-5 py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border2)] text-sm font-semibold flex items-center gap-2 mx-auto hover:bg-[var(--card)] transition"
      >
        ▶ Hear the title
      </button>
    </div>
  );
}

function ConceptStepView({ step }: { step: Extract<LessonStep, { type: "concept" }> }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.15)] text-[#a78bfa] font-mono font-bold uppercase tracking-wider">
          Concept
        </span>
        <span className="text-[10px] text-[var(--t3)]">{step.visualLabel}</span>
      </div>
      <h2 className="font-d text-2xl font-bold text-[var(--t1)]">{step.title}</h2>
      <div className="space-y-3">
        {step.body.map((p, i) => (
          <p key={i} className="text-[var(--t2)] text-sm leading-relaxed">
            {p}
          </p>
        ))}
      </div>
      {step.bulletPoints && step.bulletPoints.length > 0 && (
        <ul className="space-y-2 mt-2">
          {step.bulletPoints.map((b, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(99,102,241,0.06)] border border-[var(--border)]"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--grad-btn)] mt-1.5 shrink-0" />
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(34,211,238,0.15)] text-[#22d3ee] font-mono font-bold uppercase tracking-wider">
            Example
          </span>
        </div>
      )}
      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.25)]">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {words.map((w, i) => {
            const cleaned = w.replace(/[.,!?;:"']/g, "");
            const isHl = step.highlightWords?.some((hw) => hw.replace(/[.,!?;:"']/g, "") === cleaned);
            return (
              <button
                key={i}
                onClick={() => speak(w)}
                className={`px-2.5 py-1.5 rounded-lg text-base font-d transition ${
                  isHl
                    ? "bg-[var(--grad-btn)] text-white font-semibold"
                    : "bg-[var(--card-h)] text-[var(--t2)] hover:text-[var(--t1)]"
                }`}
              >
                {w}
              </button>
            );
          })}
        </div>
        <div className="text-center font-mono text-sm text-[var(--t3)] mb-4">{step.ipa}</div>
        <button
          onClick={() => speak(step.phrase)}
          className="w-full py-3 rounded-xl bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          <span className="text-lg">▶</span> Play full phrase
        </button>
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
        <div className="rounded-xl overflow-hidden border border-[var(--border)] mb-3">
          <WaveformCanvas height={80} />
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
}: {
  step: Extract<LessonStep, { type: "completion" }>;
  onNext?: () => void;
}) {
  return (
    <div className="text-center space-y-6 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="text-8xl"
      >
        🏆
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-d text-3xl font-bold mb-2">
          <span className="grad-text">{step.title}</span>
        </h1>
        <p className="text-[var(--t2)] text-base max-w-md mx-auto">{step.subtitle}</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--grad-btn)] text-white font-d text-xl font-bold shadow-lg"
      >
        <span>⚡</span>
        <span>+{step.xp} XP</span>
      </motion.div>

      {step.badge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="inline-block px-4 py-2 rounded-full bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.3)] text-sm font-semibold text-[#f59e0b]"
        >
          🏅 Badge unlocked: {step.badge}
        </motion.div>
      )}

      {step.nextLessonTitle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="pt-4"
        >
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
            Up Next
          </div>
          <div className="font-d text-lg text-[var(--t1)]">{step.nextLessonTitle}</div>
        </motion.div>
      )}
    </div>
  );
}
