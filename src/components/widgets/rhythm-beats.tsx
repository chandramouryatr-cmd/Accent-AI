"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { RhythmStep } from "@/lib/types";

interface Props {
  step: RhythmStep;
  speak: (text: string) => void;
}

// Animated rhythm visualization — beats pulse in sequence showing
// stressed vs unstressed syllables and their relative durations.
// Enhanced: circle beats with beat numbers, metronome sweep line,
// gradient glow on heavy beats, shadow/depth, ripple on active beat,
// speed control (0.5x/1x/1.5x), grid timeline backdrop, progress indicator.

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
    const realElapsed = progress * totalDur;
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
      speak(phrase);
    }
  };

  // SVG viewBox dimensions for the circle visualization
  const vbW = 100;
  const vbH = 50;
  const circleR = 5.5;
  const spacing = vbW / (beats.length + 1);

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
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
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

        {/* Circle beat visualization with SVG */}
        <div className="relative">
          <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ aspectRatio: `${vbW}/${vbH}` }}>
            <defs>
              {/* Gradient glow for stressed beats */}
              <radialGradient id="beat-glow-heavy" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#6366f1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </radialGradient>
              {/* Gradient for unstressed beats */}
              <radialGradient id="beat-glow-light" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.15)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" stopOpacity="0" />
              </radialGradient>
              {/* Drop shadow filter */}
              <filter id="beat-shadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.5" />
              </filter>
              {/* Active glow filter */}
              <filter id="beat-active-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Pulse glow filter for heavy beats when playing */}
              <filter id="beat-pulse-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal baseline */}
            <line x1="2" y1={vbH / 2} x2={vbW - 2} y2={vbH / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.3" />

            {/* Metronome sweep line */}
            {playing && (
              <motion.line
                x1={2 + progress * (vbW - 4)}
                y1="2"
                x2={2 + progress * (vbW - 4)}
                y2={vbH - 2}
                stroke="#22d3ee"
                strokeWidth="0.5"
                strokeDasharray="1,0.5"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}

            {/* Beat circles */}
            {beats.map((b, i) => {
              const cx = spacing * (i + 1);
              const cy = vbH / 2;
              const isActive = activeBeat === i;
              // Scale circle radius based on duration relative to max
              const maxDur = Math.max(...beats.map((x) => x.duration));
              const sizeScale = 0.7 + (b.duration / maxDur) * 0.5;
              const r = circleR * sizeScale;

              return (
                <g key={i}>
                  {/* Ripple effect on active beat */}
                  <AnimatePresence>
                    {isActive && (
                      <>
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill="none"
                          stroke={b.stressed ? "#a78bfa" : "#22d3ee"}
                          strokeWidth="0.4"
                          initial={{ r, opacity: 0.8 }}
                          animate={{ r: r + 8, opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        <motion.circle
                          cx={cx}
                          cy={cy}
                          r={r}
                          fill="none"
                          stroke={b.stressed ? "#a78bfa" : "#22d3ee"}
                          strokeWidth="0.3"
                          initial={{ r, opacity: 0.6 }}
                          animate={{ r: r + 14, opacity: 0 }}
                          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
                        />
                      </>
                    )}
                  </AnimatePresence>

                  {/* Gradient glow behind stressed beats */}
                  {b.stressed && (
                    <motion.circle
                      cx={cx}
                      cy={cy}
                      r={r + 3}
                      fill="url(#beat-glow-heavy)"
                      animate={isActive ? { opacity: [0.4, 0.9, 0.4], r: [r + 3, r + 5, r + 3] } : { opacity: 0.3, r: r + 3 }}
                      transition={isActive ? { duration: 0.6, repeat: Infinity } : { duration: 0.3 }}
                    />
                  )}

                  {/* Main beat circle with shadow */}
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={isActive
                      ? b.stressed ? "#6366f1" : "#22d3ee"
                      : b.stressed ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.08)"}
                    stroke={isActive
                      ? b.stressed ? "#a78bfa" : "#67e8f9"
                      : b.stressed ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.15)"}
                    strokeWidth={isActive ? 1 : 0.5}
                    filter={isActive ? "url(#beat-active-glow)" : "url(#beat-shadow)"}
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  />

                  {/* Beat number inside circle */}
                  <motion.text
                    x={cx}
                    y={cy + 1.2}
                    textAnchor="middle"
                    fontSize={r * 0.85}
                    fontWeight="bold"
                    fontFamily="var(--font-mono), monospace"
                    fill={isActive ? "#ffffff" : b.stressed ? "rgba(240,239,255,0.8)" : "rgba(240,239,255,0.4)"}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ duration: 0.15 }}
                    style={{ transformOrigin: `${cx}px ${cy}px` }}
                  >
                    {i + 1}
                  </motion.text>

                  {/* Stressed indicator dot above */}
                  {b.stressed && (
                    <motion.circle
                      cx={cx}
                      cy={cy - r - 2.5}
                      r="1"
                      fill="#a78bfa"
                      animate={playing ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.6 }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </g>
              );
            })}
          </svg>
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
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6366f1]" /> Stressed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.1)]" /> Unstressed
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
