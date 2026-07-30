"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, RotateCcw, Eye, EyeOff, Volume2 } from "lucide-react";
import type { PhoneCallStep } from "@/lib/types";
import { speak, stopSpeaking, unlockPhoneAudio } from "@/lib/tts";
import { useAppStore } from "@/lib/store";
import { MicWaveform } from "@/components/widgets/mic-waveform";

interface Props {
  step: PhoneCallStep;
  /** Unused — kept for API compatibility with the StepRenderer dispatcher.
   *  We import `speak` directly from `@/lib/tts` so we can pass `phoneMode`
   *  and `onEnd`, which the generic prop signature cannot express. */
  speak?: (t: string) => void;
}

type CallState = "ringing" | "active" | "ended";

interface RatingOption {
  emoji: string;
  label: string;
  value: number;
  feedback: string;
}

const RATING_OPTIONS: RatingOption[] = [
  {
    emoji: "😕",
    label: "Hard to catch",
    value: 1,
    feedback:
      "Totally normal on a real phone. Replay it with your eyes closed — the key details usually jump out on the second listen once your ear has tuned to the filter.",
  },
  {
    emoji: "🙂",
    label: "Got the gist",
    value: 2,
    feedback:
      "Solid. You picked up enough to respond. Re-listen for the exact details you missed — dates, times, and names are the usual casualties of phone audio.",
  },
  {
    emoji: "😄",
    label: "Caught it all",
    value: 3,
    feedback:
      "Excellent ear — you're ready for a real conference call. The low-fi filter didn't fool you, which means your brain has already learned to fill in the missing frequencies.",
  },
];

function fmtTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/**
 * Phase 7 — phone-call practice.
 *
 * Renders the caller's line THROUGH the TTS `phoneMode` filter (bandpass +
 * 400Hz line tone + static ambience — see `@/lib/tts`). The UI mimics a real
 * phone call: a ringing device that shakes, an Answer button, a call timer
 * that counts up while the audio plays, a "listen for" hint card, a
 * transcript-reveal toggle (only available after the user has listened at
 * least once, to encourage ear-first training), a hang-up / replay control,
 * and a self-rating "Did you catch it?" quiz that awards tailored feedback.
 */
export function PhoneCall({ step }: Props) {
  const accent = useAppStore((s) => s.accent);

  const [callState, setCallState] = useState<CallState>("ringing");
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Call timer ticks while audio is actively playing.
  useEffect(() => {
    if (!playing) return;
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing]);

  // Stop any lingering TTS / ambience on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopSpeaking();
    };
  }, []);

  const startCall = () => {
    unlockPhoneAudio();
    setCallState("active");
    setHasListened(true);
    setRating(null);
    setSeconds(0);
    setPlaying(true);
    speak(step.line, {
      accent,
      phoneMode: true,
      onEnd: () => {
        setPlaying(false);
      },
    });
  };

  const handleAnswer = () => startCall();

  const handleReplay = () => {
    // Treat replay as a fresh answered call so the timer resets and the
    // ringing animation doesn't replay.
    startCall();
  };

  const handleHangUp = () => {
    stopSpeaking();
    setPlaying(false);
    setCallState("ended");
  };

  const ringShake =
    callState === "ringing"
      ? { x: [0, -2, 2, -2, 2, 0], rotate: [0, -0.7, 0.7, -0.7, 0.7, 0] }
      : { x: 0, rotate: 0 };
  const ringTransition =
    callState === "ringing"
      ? { duration: 0.45, repeat: Infinity, repeatDelay: 0.35, ease: "easeInOut" as const }
      : { duration: 0.2 };

  return (
    <div className="space-y-4">
      {step.title && (
        <h2 className="font-d text-2xl font-bold text-[var(--t1)]">{step.title}</h2>
      )}
      {step.description && (
        <p className="text-[var(--t2)] text-sm leading-relaxed">{step.description}</p>
      )}

      {/* Phone frame */}
      <motion.div
        animate={ringShake}
        transition={ringTransition}
        className="mx-auto max-w-sm rounded-[2rem] p-4 bg-gradient-to-b from-[rgba(99,102,241,0.08)] to-[rgba(99,102,241,0.02)] border border-[var(--border)] shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-[var(--t3)]">
          <span>
            {callState === "ringing"
              ? "📞 Incoming call"
              : callState === "active"
                ? "📞 On call"
                : "📞 Call ended"}
          </span>
          <span className={playing ? "text-[var(--p3)]" : ""}>{fmtTime(seconds)}</span>
        </div>

        {/* Caller screen */}
        <div className="rounded-[1.5rem] p-5 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] mt-2 text-center">
          <motion.div
            animate={
              callState === "ringing"
                ? { scale: [1, 1.08, 1] }
                : { scale: 1 }
            }
            transition={
              callState === "ringing"
                ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" as const }
                : { duration: 0.2 }
            }
            className="text-4xl mb-2"
            aria-hidden
          >
            📱
          </motion.div>
          <div className="font-d text-base font-semibold text-[var(--t1)]">
            {step.caller}
          </div>
          <div className="text-[10px] font-mono text-[var(--t3)] mt-1">
            {callState === "ringing"
              ? "calling…"
              : callState === "active"
                ? playing
                  ? "connected · low-fi audio"
                  : "connected · paused"
                : "call ended"}
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-center">
        <AnimatePresence mode="wait">
          {callState === "ringing" && (
            <motion.button
              key="answer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnswer}
              className="px-6 py-3 rounded-full bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 shadow-[0_4px_18px_rgba(16,185,129,0.35)] hover:bg-emerald-600 transition"
            >
              <Phone className="w-4 h-4" /> Answer
            </motion.button>
          )}
          {callState === "active" && (
            <motion.button
              key="hangup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHangUp}
              className="px-6 py-3 rounded-full bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-[0_4px_18px_rgba(244,63,94,0.35)] hover:bg-rose-600 transition"
            >
              <PhoneOff className="w-4 h-4" /> Hang up
            </motion.button>
          )}
          {callState === "ended" && (
            <motion.button
              key="replay"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReplay}
              className="px-6 py-3 rounded-full bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center gap-2 shadow-[0_4px_18px_rgba(99,102,241,0.35)] hover:opacity-90 transition"
            >
              <RotateCcw className="w-4 h-4" /> Replay call
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform — only visible while the call is active */}
      <AnimatePresence>
        {callState === "active" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl p-3 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]"
          >
            <MicWaveform height={64} active={playing} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listen-for hint */}
      {step.listenFor && (
        <div className="rounded-2xl p-4 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.25)]">
          <div className="flex items-start gap-3">
            <Volume2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono mb-1">
                Listen for
              </div>
              <div className="text-sm text-[var(--t1)] font-medium leading-snug">
                {step.listenFor}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript reveal — only after the user has listened at least once */}
      {hasListened && (
        <div className="rounded-2xl p-4 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setShowTranscript((v) => !v)}
            className="flex items-center gap-2 text-xs font-mono text-[var(--p3)] hover:underline"
          >
            {showTranscript ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </button>
          <AnimatePresence initial={false}>
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="font-d text-base text-[var(--t1)] leading-relaxed">
                    {step.line}
                  </div>
                  {step.ipa && (
                    <div className="font-mono text-sm text-[var(--t3)] mt-2">
                      {step.ipa}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Self-rating quiz */}
      {hasListened && (
        <div className="rounded-2xl p-4 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--t3)] mb-3 text-center">
            Did you catch it?
          </div>
          <div className="flex justify-center gap-3">
            {RATING_OPTIONS.map((r) => {
              const selected = rating === r.value;
              return (
                <motion.button
                  key={r.value}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setRating(r.value)}
                  aria-pressed={selected}
                  aria-label={`${r.emoji} ${r.label}`}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition w-[5.5rem] ${
                    selected
                      ? "bg-[var(--grad-btn)] text-white border-transparent shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                      : "bg-[rgba(255,255,255,0.03)] border-[var(--border)] hover:border-[var(--p3)]"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {r.emoji}
                  </span>
                  <span className="text-[10px] font-mono leading-tight text-center">
                    {r.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {rating !== null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 text-center text-xs text-[var(--t2)] leading-relaxed"
              >
                {RATING_OPTIONS.find((r) => r.value === rating)?.feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
