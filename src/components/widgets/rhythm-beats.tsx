"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { RhythmStep } from "@/lib/types";

interface Props {
  step: RhythmStep;
  speak: (text: string) => void;
}

// Animated rhythm visualization — beats pulse in sequence showing
// stressed vs unstressed syllables and their relative durations.

export function RhythmBeats({ step, speak }: Props) {
  const { beats, phrase, description, title } = step;
  const [activeBeat, setActiveBeat] = useState(-1);
  const [playing, setPlaying] = useState(false);

  // Total duration to drive the pulse animation
  const totalDur = beats.reduce((sum, b) => sum + b.duration, 0);

  useEffect(() => {
    if (!playing) return;
    let elapsed = 0;
    let cancelled = false;
    const run = (i: number) => {
      if (cancelled || i >= beats.length) {
        setPlaying(false);
        setActiveBeat(-1);
        return;
      }
      setActiveBeat(i);
      elapsed += beats[i].duration;
      const scaledDur = beats[i].duration * 350; // ms
      setTimeout(() => run(i + 1), scaledDur);
    };
    run(0);
    return () => {
      cancelled = true;
    };
  }, [playing, beats]);

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        {/* Phrase display with active highlighting */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
          {beats.map((b, i) => (
            <motion.span
              key={i}
              animate={{
                scale: activeBeat === i ? 1.18 : 1,
                color: activeBeat === i ? "#a78bfa" : b.stressed ? "#f0efff" : "rgba(240,239,255,0.5)",
                fontWeight: b.stressed ? 700 : 400,
              }}
              transition={{ duration: 0.15 }}
              className="font-d text-lg"
            >
              {b.text}
            </motion.span>
          ))}
        </div>

        {/* Beat timeline */}
        <div className="flex items-end justify-center gap-1.5 h-20">
          {beats.map((b, i) => {
            const isActive = activeBeat === i;
            const heightPct = (b.duration / Math.max(...beats.map((x) => x.duration))) * 100;
            return (
              <motion.div
                key={i}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: `${Math.max(heightPct, 20)}%`,
                  opacity: 1,
                  backgroundColor: isActive
                    ? b.stressed
                      ? "#6366f1"
                      : "#22d3ee"
                    : b.stressed
                    ? "rgba(99,102,241,0.4)"
                    : "rgba(255,255,255,0.1)",
                }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                className="rounded-t-md relative"
                style={{
                  minWidth: 24,
                  flex: b.duration,
                  border: isActive ? "1px solid rgba(255,255,255,0.4)" : "none",
                }}
              >
                {b.stressed && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">●</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded bg-[#6366f1]" /> Stressed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded bg-[rgba(255,255,255,0.1)]" /> Unstressed
            </span>
          </div>
          <button
            onClick={() => {
              if (playing) {
                setPlaying(false);
                setActiveBeat(-1);
              } else {
                setPlaying(true);
                speak(phrase);
              }
            }}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            {playing ? "⏸ Stop" : "▶ Play"}
          </button>
        </div>
      </div>
    </div>
  );
}
