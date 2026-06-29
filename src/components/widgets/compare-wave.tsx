"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CompareStep } from "@/lib/types";

interface Props {
  step: CompareStep;
  speak: (text: string) => void;
}

// Side-by-side waveform comparison: native (indigo→violet) vs learner (cyan→blue).
// Enhanced: left-to-right clip-path reveal, animated match badge (count-up),
// synced playhead sweep across both waves, red diff overlay on the learner wave,
// staggered slide-in labels, "Play comparison" button that fires both TTS calls
// sequentially with active-phase indication.

const BAR_COUNT = 40;
const NATIVE_DUR = 2400; // ms per phrase
const COMPARE_DUR = 4800; // 2 phrases back-to-back

type ComparePhase = "native" | "learner" | null;

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

  const nativeBars = useMemo(() => genBars(1, BAR_COUNT, true), []);
  const learnerBars = useMemo(() => genBars(3, BAR_COUNT, false), []);

  // Per-card solo playback state
  const [nativePlaying, setNativePlaying] = useState(false);
  const [learnerPlaying, setLearnerPlaying] = useState(false);
  const [nativeProgress, setNativeProgress] = useState(0);
  const [learnerProgress, setLearnerProgress] = useState(0);

  // Synchronized comparison state — single playhead sweeps both waves together
  const [comparing, setComparing] = useState(false);
  const [compareProgress, setCompareProgress] = useState(0);
  const [comparePhase, setComparePhase] = useState<ComparePhase>(null);

  // Diff zones — indices where the two waveforms differ most
  const diffIndices = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i < BAR_COUNT; i++) {
      if (Math.abs(nativeBars[i] - learnerBars[i]) > 0.35) s.add(i);
    }
    return s;
  }, [nativeBars, learnerBars]);

  // Comparison scores (computed deterministically)
  const nativeScore = useMemo(
    () => 90 + (nativeBars.reduce((a, b) => a + b, 0) % 8),
    [nativeBars],
  );
  const learnerScore = useMemo(
    () => 58 + (learnerBars.reduce((a, b) => a + b, 0) % 12),
    [learnerBars],
  );
  const matchScore = learnerScore; // "Match %" — how closely learner matches native

  // Count-up animation for the Match badge
  const [displayMatch, setDisplayMatch] = useState(0);
  useEffect(() => {
    const controls = animate(0, matchScore, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayMatch(Math.round(v)),
    });
    return () => controls.stop();
  }, [matchScore]);

  // Solo playback rAF — native
  useEffect(() => {
    if (!nativePlaying) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / NATIVE_DUR, 1);
      setNativeProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setNativePlaying(false);
        setNativeProgress(0);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [nativePlaying]);

  // Solo playback rAF — learner
  useEffect(() => {
    if (!learnerPlaying) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / NATIVE_DUR, 1);
      setLearnerProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setLearnerPlaying(false);
        setLearnerProgress(0);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [learnerPlaying]);

  // Comparison sweep — drives both playheads simultaneously + sequential TTS
  useEffect(() => {
    if (!comparing) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const speakLearnerTimer: ReturnType<typeof setTimeout> = setTimeout(
      () => speak(learnerPhrase),
      NATIVE_DUR + 120,
    );
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / COMPARE_DUR, 1);
      setCompareProgress(p);
      setComparePhase(p < 0.5 ? "native" : "learner");
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setComparing(false);
        setComparePhase(null);
        setCompareProgress(0);
      }
    };
    raf = requestAnimationFrame(tick);
    speak(nativePhrase);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(speakLearnerTimer);
    };
  }, [comparing]);

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
  const playComparison = () => {
    if (comparing) return;
    setComparing(true);
    setCompareProgress(0);
    setComparePhase("native");
  };

  // Traveling-wave height modulation
  const computeAnimatedHeight = (
    base: number,
    i: number,
    playing: boolean,
    progress: number,
  ) => {
    if (!playing) return base * 100;
    const head = progress * BAR_COUNT;
    const dist = i - head;
    const wave = Math.exp(-(dist * dist) / 12) * 0.4;
    return Math.min(100, (base + wave) * 100);
  };
  const computeCompareHeight = (base: number, i: number) => {
    const head = compareProgress * BAR_COUNT;
    const dist = i - head;
    const wave = Math.exp(-(dist * dist) / 12) * 0.4;
    return Math.min(100, (base + wave) * 100);
  };

  // Gradient waveforms per design spec
  const nativeGrad = "linear-gradient(180deg, #6366f1, #8b5cf6)"; // indigo → violet
  const learnerGrad = "linear-gradient(180deg, #22d3ee, #3b82f6)"; // cyan → blue

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
      )}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>

      {/* Score badge — Native vs Learner + animated Match % count-up */}
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-xl p-3 bg-[rgba(99,102,241,0.08)] border border-[var(--border)] flex items-center justify-around gap-2"
      >
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
            Native flow
          </div>
          <div className="text-2xl font-bold font-mono text-[#8b5cf6]">{nativeScore}%</div>
        </div>
        <div className="text-2xl text-[var(--t3)] font-mono">vs</div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
            Learner
          </div>
          <div className="text-2xl font-bold font-mono text-[#22d3ee]">{learnerScore}%</div>
        </div>
        <div className="w-px h-10 bg-[var(--border2)]" />
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
            Match
          </div>
          <motion.div
            className="text-2xl font-bold font-mono"
            style={{
              background: "linear-gradient(135deg, #6366f1, #22d3ee)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {displayMatch}%
          </motion.div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {/* Native */}
        <WaveformCard
          label="Native"
          sublabel="✓ Model"
          phrase={nativePhrase}
          ipa={nativeIpa}
          bars={nativeBars}
          diffIndices={new Set<number>()}
          gradient={nativeGrad}
          accentColor="#8b5cf6"
          ringColor="rgba(139,92,246,0.25)"
          tintFrom="rgba(99,102,241,0.10)"
          tintTo="rgba(139,92,246,0.03)"
          labelDelay={0.1}
          isActive={comparing ? comparePhase === "native" : nativePlaying}
          isDimmed={comparing && comparePhase !== "native"}
          soloPlaying={nativePlaying}
          soloProgress={nativeProgress}
          comparing={comparing}
          compareProgress={compareProgress}
          computeSoloHeight={computeAnimatedHeight}
          computeCompareHeight={computeCompareHeight}
          onPlay={playNative}
          showDiffOverlay={false}
        />

        {/* Learner */}
        <WaveformCard
          label="Your attempt"
          sublabel="⚠ Needs work"
          phrase={learnerPhrase}
          ipa={learnerIpa}
          bars={learnerBars}
          diffIndices={diffIndices}
          gradient={learnerGrad}
          accentColor="#22d3ee"
          ringColor="rgba(34,211,238,0.25)"
          tintFrom="rgba(34,211,238,0.10)"
          tintTo="rgba(59,130,246,0.03)"
          labelDelay={0.25}
          isActive={comparing ? comparePhase === "learner" : learnerPlaying}
          isDimmed={comparing && comparePhase !== "learner"}
          soloPlaying={learnerPlaying}
          soloProgress={learnerProgress}
          comparing={comparing}
          compareProgress={compareProgress}
          computeSoloHeight={computeAnimatedHeight}
          computeCompareHeight={computeCompareHeight}
          onPlay={playLearner}
          showDiffOverlay
        />
      </div>

      {/* Play comparison button — sequential TTS + synced playhead */}
      <motion.button
        onClick={playComparison}
        disabled={comparing}
        whileHover={!comparing ? { scale: 1.02 } : {}}
        whileTap={!comparing ? { scale: 0.98 } : {}}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white border-0 flex items-center justify-center gap-2 disabled:opacity-70 transition"
        style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
          boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
        }}
      >
        <motion.span
          animate={comparing ? { rotate: 360 } : { rotate: 0 }}
          transition={
            comparing
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : { duration: 0.2 }
          }
          className="inline-block"
        >
          ▶
        </motion.span>
        {comparing
          ? comparePhase === "native"
            ? "Playing native…"
            : "Playing your attempt…"
          : "Play comparison"}
      </motion.button>

      <div className="rounded-xl p-3 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] text-xs text-[var(--t2)]">
        <strong className="text-[var(--t1)]">What to notice:</strong> The native speaker&apos;s waveform is
        smooth and continuous — words flow together. The learner&apos;s is choppy with gaps between words.
        Red highlights mark the spots where the two patterns differ most. Aim for the native pattern by
        linking words and reducing unstressed syllables.
      </div>
    </div>
  );
}

// ─── Sub-component: a single waveform card (native OR learner) ───────────────

interface WaveformCardProps {
  label: string;
  sublabel: string;
  phrase: string;
  ipa: string;
  bars: number[];
  diffIndices: Set<number>;
  gradient: string;
  accentColor: string;
  ringColor: string;
  tintFrom: string;
  tintTo: string;
  labelDelay: number;
  isActive: boolean;
  isDimmed: boolean;
  soloPlaying: boolean;
  soloProgress: number;
  comparing: boolean;
  compareProgress: number;
  computeSoloHeight: (
    base: number,
    i: number,
    playing: boolean,
    progress: number,
  ) => number;
  computeCompareHeight: (base: number, i: number) => number;
  onPlay: () => void;
  showDiffOverlay: boolean;
}

function WaveformCard({
  label,
  sublabel,
  phrase,
  ipa,
  bars,
  diffIndices,
  gradient,
  accentColor,
  ringColor,
  tintFrom,
  tintTo,
  labelDelay,
  isActive,
  isDimmed,
  soloPlaying,
  soloProgress,
  comparing,
  compareProgress,
  computeSoloHeight,
  computeCompareHeight,
  onPlay,
  showDiffOverlay,
}: WaveformCardProps) {
  // Playhead position: in compare mode use shared compareProgress; in solo mode use soloProgress
  const playheadPct = comparing ? compareProgress * 100 : soloProgress * 100;
  const showPlayhead = comparing || soloPlaying;

  // Bar height computation: in compare mode use shared head position so both
  // waveforms ripple together; otherwise use per-card solo animation.
  const barHeight = (v: number, i: number) =>
    comparing
      ? computeCompareHeight(v, i)
      : computeSoloHeight(v, i, soloPlaying, soloProgress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: isDimmed ? "brightness(0.7)" : "brightness(1)",
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tintFrom}, ${tintTo})`,
        border: `1px solid ${ringColor}`,
        boxShadow: isActive ? `0 0 24px ${ringColor}` : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: labelDelay, duration: 0.45, ease: "easeOut" }}
          className="flex items-center gap-2"
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {label}
          </span>
          <span className="text-[10px] text-[var(--t3)]">{sublabel}</span>
        </motion.div>
        <button
          onClick={onPlay}
          disabled={soloPlaying || comparing}
          className="text-xs px-2 py-1 rounded-lg font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          style={{ background: accentColor }}
        >
          {soloPlaying ? "▶ playing…" : "▶"}
        </button>
      </div>
      <div className="text-[var(--t1)] font-d text-base mb-1">{phrase}</div>
      <div className="text-[var(--t3)] font-mono text-xs mb-3">{ipa}</div>

      <div className="relative">
        {/* Playhead line — synced across both waveforms during comparison */}
        {showPlayhead && (
          <motion.div
            className="absolute top-0 bottom-0 w-0.5 pointer-events-none z-10"
            style={{
              left: `${playheadPct}%`,
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        {/* Left-to-right reveal wrapper — clip-path animates from full-right-block to open */}
        <motion.div
          className="flex items-center gap-0.5 h-12"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        >
          {bars.map((v, i) => {
            const isDiff = diffIndices.has(i);
            return (
              <div key={i} className="flex-1 relative h-full flex items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight(v, i)}%` }}
                  transition={{
                    delay: i * 0.012,
                    duration: soloPlaying || comparing ? 0.12 : 0.3,
                    ease: "easeOut",
                  }}
                  className="w-full rounded-full relative"
                  style={{
                    background: gradient,
                    boxShadow: isDiff && showDiffOverlay
                      ? "0 0 6px rgba(239,68,68,0.55)"
                      : `0 0 4px ${accentColor}40`,
                  }}
                />
                {/* Red diff overlay on learner bars that don't match native */}
                {isDiff && showDiffOverlay && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + i * 0.012, duration: 0.3 }}
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(239,68,68,0.55), rgba(239,68,68,0.35))",
                      mixBlendMode: "screen",
                    }}
                  />
                )}
              </div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
