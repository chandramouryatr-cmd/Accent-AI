"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CompareStep } from "@/lib/types";

interface Props {
  step: CompareStep;
  speak: (text: string) => void;
}

// Side-by-side waveform comparison: native (smooth, full) vs learner (choppy, reduced).
// Enhanced: animated playhead across bars during playback, diff-highlighting zones
// where waveforms differ most, comparison score badge, animated wave pattern
// (bars rise/fall in a wave), subtle background gradients (green/red tints).

export function CompareWave({ step, speak }: Props) {
  const { nativePhrase, learnerPhrase, nativeIpa, learnerIpa, description, title } = step;

  // Generate fake-but-realistic waveform bars (stable per mount via useMemo)
  const genBars = (seed: number, count: number, full: boolean) => {
    return Array.from({ length: count }, (_, i) => {
      const v = full
        ? 0.5 + 0.5 * Math.abs(Math.sin(i * 0.4 + seed))
        : 0.2 + 0.3 * Math.abs(Math.sin(i * 0.8 + seed)) * (i % 3 === 0 ? 1 : 0.4);
      return v;
    });
  };

  const BAR_COUNT = 40;
  const nativeBars = useMemo(() => genBars(1, BAR_COUNT, true), []);
  const learnerBars = useMemo(() => genBars(3, BAR_COUNT, false), []);

  const [nativePlaying, setNativePlaying] = useState(false);
  const [learnerPlaying, setLearnerPlaying] = useState(false);
  const [nativeProgress, setNativeProgress] = useState(0);
  const [learnerProgress, setLearnerProgress] = useState(0);

  // Diff zones — indices where the two waveforms differ most
  const diffIndices = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < BAR_COUNT; i++) {
      if (Math.abs(nativeBars[i] - learnerBars[i]) > 0.35) s.add(i);
    }
    return s;
  }, [nativeBars, learnerBars]);

  // Comparison scores (computed deterministically)
  const nativeScore = useMemo(() => 90 + (nativeBars.reduce((a, b) => a + b, 0) % 8), [nativeBars]);
  const learnerScore = useMemo(() => 58 + (learnerBars.reduce((a, b) => a + b, 0) % 12), [learnerBars]);

  // Drive playhead animation with rAF
  useEffect(() => {
    if (!nativePlaying) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const dur = 2400;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / dur, 1);
      setNativeProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setNativePlaying(false); setNativeProgress(0); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nativePlaying]);

  useEffect(() => {
    if (!learnerPlaying) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const dur = 2400;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / dur, 1);
      setLearnerProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setLearnerPlaying(false); setLearnerProgress(0); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [learnerPlaying]);

  const playNative = () => {
    setNativePlaying(true);
    setNativeProgress(0);
    speak(nativePhrase);
  };
  const playLearner = () => {
    setLearnerPlaying(true);
    setLearnerProgress(0);
    speak(learnerPhrase);
  };

  // Wave animation: when playing, modulate bar heights with a traveling wave
  const computeAnimatedHeight = (base: number, i: number, playing: boolean, progress: number) => {
    if (!playing) return base * 100;
    // Traveling wave that follows the playhead
    const head = progress * BAR_COUNT;
    const dist = i - head;
    const wave = Math.exp(-(dist * dist) / 12) * 0.4; // gaussian envelope around playhead
    return Math.min(100, (base + wave) * 100);
  };

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>

      {/* Comparison score badge */}
      <div className="rounded-xl p-3 bg-[rgba(99,102,241,0.08)] border border-[var(--border)] flex items-center justify-around gap-2">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">Native flow</div>
          <div className="text-2xl font-bold text-[#10b981] font-mono">{nativeScore}%</div>
        </div>
        <div className="text-2xl text-[var(--t3)] font-mono">vs</div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">Learner</div>
          <div className="text-2xl font-bold text-[#ef4444] font-mono">{learnerScore}%</div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Native */}
        <div
          className="rounded-2xl p-4 border border-[rgba(16,185,129,0.25)] relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.03))" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">Native</span>
              <span className="text-[10px] text-[var(--t3)]">✓ Model</span>
            </div>
            <button
              onClick={playNative}
              disabled={nativePlaying}
              className="text-xs px-2 py-1 rounded-lg bg-[#10b981] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {nativePlaying ? "▶ playing…" : "▶"}
            </button>
          </div>
          <div className="text-[var(--t1)] font-d text-base mb-1">{nativePhrase}</div>
          <div className="text-[var(--t3)] font-mono text-xs mb-3">{nativeIpa}</div>

          <div className="relative">
            {/* Playhead line */}
            {nativePlaying && (
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10"
                style={{ left: `${nativeProgress * 100}%` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
            <div className="flex items-center gap-0.5 h-12">
              {nativeBars.map((v, i) => {
                const isDiff = diffIndices.has(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${computeAnimatedHeight(v, i, nativePlaying, nativeProgress)}%` }}
                    transition={{
                      delay: i * 0.015,
                      duration: nativePlaying ? 0.12 : 0.3,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-full relative"
                    style={{
                      background: isDiff
                        ? "linear-gradient(180deg, #34d399, #059669)"
                        : "linear-gradient(180deg, #10b981, #059669)",
                      boxShadow: isDiff ? "0 0 4px rgba(16,185,129,0.5)" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Learner */}
        <div
          className="rounded-2xl p-4 border border-[rgba(239,68,68,0.25)] relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.03))" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#ef4444] uppercase tracking-wider">Learner</span>
              <span className="text-[10px] text-[var(--t3)]">⚠ Needs work</span>
            </div>
            <button
              onClick={playLearner}
              disabled={learnerPlaying}
              className="text-xs px-2 py-1 rounded-lg bg-[#ef4444] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {learnerPlaying ? "▶ playing…" : "▶"}
            </button>
          </div>
          <div className="text-[var(--t1)] font-d text-base mb-1">{learnerPhrase}</div>
          <div className="text-[var(--t3)] font-mono text-xs mb-3">{learnerIpa}</div>

          <div className="relative">
            {learnerPlaying && (
              <motion.div
                className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none z-10"
                style={{ left: `${learnerProgress * 100}%` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
            <div className="flex items-center gap-0.5 h-12">
              {learnerBars.map((v, i) => {
                const isDiff = diffIndices.has(i);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${computeAnimatedHeight(v, i, learnerPlaying, learnerProgress)}%` }}
                    transition={{
                      delay: 0.3 + i * 0.015,
                      duration: learnerPlaying ? 0.12 : 0.3,
                      ease: "easeOut",
                    }}
                    className="flex-1 rounded-full relative"
                    style={{
                      background: isDiff
                        ? "linear-gradient(180deg, #f87171, #b91c1c)"
                        : "linear-gradient(180deg, #ef4444, #dc2626)",
                      boxShadow: isDiff ? "0 0 4px rgba(239,68,68,0.5)" : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-3 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] text-xs text-[var(--t2)]">
        <strong className="text-[var(--t1)]">What to notice:</strong> The native speaker&apos;s waveform is
        smooth and continuous — words flow together. The learner&apos;s is choppy with gaps between words.
        Brighter bars mark the spots where the two patterns differ most. Aim for the native pattern by
        linking words and reducing unstressed syllables.
      </div>
    </div>
  );
}
