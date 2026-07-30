"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Eye, EyeOff, Brain } from "lucide-react";
import type { IpaTutorialStep } from "@/lib/types";

interface Props {
  step: IpaTutorialStep;
  speak: (text: string) => void;
}

// Interactive IPA reading primer (Phase 1).
// Eases learners into reading IPA before symbols appear everywhere.
// - Tap any phoneme card to hear the example word (raw IPA symbols don't
//   render in speech synthesis, so we speak the example word).
// - "Test yourself" mode hides the example words; learner guesses the sound,
//   taps once to reveal, taps again to play the audio.
// - Staggered entrance + tap feedback via framer-motion.
// - Card glows (ring + scale 1.05) while its audio is playing.

export function IpaTutorial({ step, speak }: Props) {
  const { groups, title, description } = step;
  const [testMode, setTestMode] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clean up any in-flight play timers on unmount.
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    },
    []
  );

  const toggleTest = () => {
    setTestMode((v) => !v);
    setRevealed(new Set());
    setPlayingKey(null);
  };

  const play = useCallback(
    (key: string, example: string) => {
      setPlayingKey(key);
      speak(example);
      // Clear any prior clear timer so the glow lasts the full duration.
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      const t = setTimeout(() => {
        setPlayingKey((cur) => (cur === key ? null : cur));
      }, 1300);
      timersRef.current.push(t);
    },
    [speak]
  );

  const handleTap = (key: string, example: string) => {
    if (testMode) {
      if (!revealed.has(key)) {
        // First tap in test mode reveals (no sound) — let the learner guess.
        setRevealed((prev) => {
          const next = new Set(prev);
          next.add(key);
          return next;
        });
        return;
      }
      // Already revealed → play the audio.
      play(key, example);
      return;
    }
    play(key, example);
  };

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
      )}
      {description && (
        <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>
      )}

      <p className="text-sm text-[var(--t3)] flex items-start gap-2">
        <Volume2 className="w-4 h-4 mt-0.5 shrink-0 text-[var(--p3)]" />
        <span>
          IPA gives every English sound one unique symbol. Tap any symbol to
          hear it.
        </span>
      </p>

      {/* Test-yourself toggle */}
      <button
        type="button"
        onClick={toggleTest}
        aria-pressed={testMode}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold border transition-colors ${
          testMode
            ? "bg-[var(--p3)] text-white border-[var(--p3)]"
            : "bg-[rgba(99,102,241,0.04)] text-[var(--t2)] border-[var(--border)] hover:border-[var(--p3)]"
        }`}
      >
        {testMode ? (
          <Brain className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
        {testMode ? "Test mode ON — tap to reveal" : "Test yourself"}
      </button>

      {groups.map((group, gi) => (
        <div key={`g-${gi}`} className="space-y-2">
          <h5 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--t3)]">
            {group.label}
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {group.phonemes.map((ph, pi) => {
              const key = `${gi}-${pi}`;
              const isPlaying = playingKey === key;
              const isRevealed = !testMode || revealed.has(key);
              return (
                <motion.button
                  type="button"
                  key={key}
                  onClick={() => handleTap(key, ph.example)}
                  initial={{ opacity: 0, y: 14, scale: 0.94 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: isPlaying ? 1.05 : 1,
                  }}
                  transition={{
                    delay: gi * 0.06 + pi * 0.04,
                    type: "spring",
                    stiffness: 220,
                    damping: 18,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-2xl p-4 text-left border transition-colors ${
                    isPlaying
                      ? "ring-2 ring-[var(--p3)] border-[var(--p3)] bg-[rgba(168,85,247,0.10)]"
                      : "border-[var(--border)] bg-[rgba(99,102,241,0.04)] hover:border-[var(--p3)]"
                  }`}
                  aria-label={`IPA symbol ${ph.ipa}. Example word ${
                    isRevealed ? ph.example : "hidden — tap to reveal"
                  }.`}
                >
                  <div className="flex items-baseline justify-between">
                    <span
                      className="font-mono text-2xl font-bold leading-none"
                      style={{ color: "var(--p3)" }}
                    >
                      {ph.ipa}
                    </span>
                    {testMode && !isRevealed ? (
                      <EyeOff className="w-3.5 h-3.5 text-[var(--t3)]" />
                    ) : isPlaying ? (
                      <Volume2 className="w-3.5 h-3.5 text-[var(--p3)] animate-pulse" />
                    ) : null}
                  </div>
                  <div className="mt-2">
                    {isRevealed ? (
                      <>
                        <div className="text-sm font-semibold text-[var(--t1)]">
                          {ph.example}
                        </div>
                        <div className="text-[11px] text-[var(--t3)] mt-0.5 leading-snug">
                          {ph.hint}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-[var(--t3)] italic mt-1">
                        Tap to reveal
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      {testMode && (
        <p className="text-[11px] text-[var(--t3)] italic">
          Tip: look at the symbol, say what you think it sounds like, then tap
          to reveal and play the answer.
        </p>
      )}
    </div>
  );
}
