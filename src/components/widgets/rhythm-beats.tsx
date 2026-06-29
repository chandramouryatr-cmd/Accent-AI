"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { RhythmStep } from "@/lib/types";

interface Props {
  step: RhythmStep;
  speak: (text: string) => void;
}

// Animated rhythm visualization — beats pulse in sequence showing
// stressed vs unstressed syllables and their relative durations.
// Enhanced: metronome pendulum, beat numbers, speed control (0.5x/1x/1.5x),
// grid timeline backdrop, glowing top edge on stressed bars, progress indicator.

const SPEEDS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
];

export function RhythmBeats({ step, speak }: Props) {
  const { beats, phrase, description, title } = step;
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0..1 across whole rhythm
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const totalDur = beats.reduce((sum, b) => sum + b.duration, 0);

  // Cumulative durations (in duration units) — used to derive active beat from progress
  const cum = (() => {
    const arr: number[] = [];
    let acc = 0;
    beats.forEach((b, i) => {
      acc += b.duration;
      arr[i] = acc;
    });
    return arr;
  })();

  // Derive the currently active beat index from progress (no ref / no stale closures)
  const activeBeat = (() => {
    if (!playing) return -1;
    const realElapsed = progress * totalDur; // duration units (already scaled by speed in rAF)
    for (let i = 0; i < cum.length; i++) {
      if (realElapsed <= cum[i]) return i;
    }
    return beats.length - 1;
  })();

  useEffect(() => {
    if (!playing) return;
    let startTime: number | undefined;
    const totalRealDur = (totalDur / speed) * 350; // ms
    const tick = (now: number) => {
      if (startTime === undefined) startTime = now;
      const p = Math.min((now - startTime) / totalRealDur, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
        setProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, totalDur]);

  const handlePlayStop = () => {
    if (playing) {
      setPlaying(false);
      setProgress(0);
    } else {
      setProgress(0);
      setPlaying(true);
      // Speak at requested speed — Web Speech uses default rate; visual speed only (per spec)
      speak(phrase);
    }
  };

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        {/* Metronome / playhead indicator at top */}
        <div className="relative h-12 mb-4 flex items-center justify-center overflow-hidden">
          {/* Pendulum */}
          <motion.div
            className="absolute left-1/2 top-0 origin-top"
            style={{ width: 2, height: 40, background: "linear-gradient(180deg, #a78bfa, transparent)" }}
            animate={playing ? { rotate: [-22, 22, -22] } : { rotate: 0 }}
            transition={playing ? { duration: 0.8 / speed, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          >
            <div className="absolute -bottom-1 -left-2 w-4 h-4 rounded-full bg-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
          </motion.div>
          {/* Tick marks left/right */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--t3)]">◀</div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--t3)]">▶</div>
          {/* Center label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[var(--t3)] uppercase tracking-widest">
            {playing ? `${speed}x tempo` : "Metronome"}
          </div>
        </div>

        {/* Phrase display with active highlighting */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
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

        {/* Beat numbers */}
        <div className="flex items-end justify-center gap-1.5 mb-1">
          {beats.map((b, i) => {
            const isActive = activeBeat === i;
            return (
              <div
                key={i}
                className="text-center text-[10px] font-mono font-bold transition-colors"
                style={{
                  flex: b.duration,
                  minWidth: 24,
                  color: isActive ? "#a78bfa" : "rgba(240,239,255,0.35)",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Beat timeline with grid backdrop */}
        <div className="relative">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((g) => (
              <div key={g} className="border-t border-dashed border-[rgba(255,255,255,0.05)]" />
            ))}
          </div>
          {/* Vertical playhead line */}
          {playing && (
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-[#22d3ee] z-10 pointer-events-none"
              style={{ left: `${progress * 100}%` }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}

          <div className="flex items-end justify-center gap-1.5 h-20 relative">
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
                  {/* Glowing top edge on stressed bars */}
                  {b.stressed && (
                    <div
                      className="absolute -top-1 left-0 right-0 h-1 rounded-full"
                      style={{
                        background: isActive ? "#a78bfa" : "#6366f1",
                        boxShadow: isActive
                          ? "0 0 12px 2px rgba(167,139,250,0.8)"
                          : "0 0 6px 1px rgba(99,102,241,0.5)",
                      }}
                    />
                  )}
                  {b.stressed && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs">●</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #6366f1, #22d3ee)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-xs gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded bg-[#6366f1]" /> Stressed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded bg-[rgba(255,255,255,0.1)]" /> Unstressed
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed control */}
            <div className="flex items-center gap-1 rounded-lg bg-[rgba(255,255,255,0.04)] p-0.5 border border-[var(--border)]">
              {SPEEDS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSpeed(s.value)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition ${
                    speed === s.value
                      ? "bg-[var(--grad-btn)] text-white"
                      : "text-[var(--t3)] hover:text-[var(--t1)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={handlePlayStop}
              className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
            >
              {playing ? "⏸ Stop" : "▶ Play"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
