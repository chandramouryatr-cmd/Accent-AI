"use client";

import { motion } from "framer-motion";
import type { CompareStep } from "@/lib/types";

interface Props {
  step: CompareStep;
  speak: (text: string) => void;
}

// Side-by-side waveform comparison: native (smooth, full) vs learner (choppy, reduced).

export function CompareWave({ step, speak }: Props) {
  const { nativePhrase, learnerPhrase, nativeIpa, learnerIpa, description, title } = step;

  // Generate fake-but-realistic waveform bars
  const genBars = (seed: number, count: number, full: boolean) => {
    return Array.from({ length: count }, (_, i) => {
      const v = full
        ? 0.5 + 0.5 * Math.abs(Math.sin(i * 0.4 + seed))
        : 0.2 + 0.3 * Math.abs(Math.sin(i * 0.8 + seed)) * (i % 3 === 0 ? 1 : 0.4);
      return v;
    });
  };

  const nativeBars = genBars(1, 40, true);
  const learnerBars = genBars(3, 40, false);

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>

      <div className="space-y-3">
        {/* Native */}
        <div className="rounded-2xl p-4 bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">Native</span>
              <span className="text-[10px] text-[var(--t3)]">✓ Model</span>
            </div>
            <button
              onClick={() => speak(nativePhrase)}
              className="text-xs px-2 py-1 rounded-lg bg-[#10b981] text-white font-semibold hover:opacity-90 transition"
            >
              ▶
            </button>
          </div>
          <div className="text-[var(--t1)] font-d text-base mb-1">{nativePhrase}</div>
          <div className="text-[var(--t3)] font-mono text-xs mb-3">{nativeIpa}</div>
          <div className="flex items-center gap-0.5 h-12">
            {nativeBars.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${v * 100}%` }}
                transition={{ delay: i * 0.015, duration: 0.3 }}
                className="flex-1 rounded-full"
                style={{ background: "linear-gradient(180deg, #10b981, #059669)" }}
              />
            ))}
          </div>
        </div>

        {/* Learner */}
        <div className="rounded-2xl p-4 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.25)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#ef4444] uppercase tracking-wider">Learner</span>
              <span className="text-[10px] text-[var(--t3)]">⚠ Needs work</span>
            </div>
            <button
              onClick={() => speak(learnerPhrase)}
              className="text-xs px-2 py-1 rounded-lg bg-[#ef4444] text-white font-semibold hover:opacity-90 transition"
            >
              ▶
            </button>
          </div>
          <div className="text-[var(--t1)] font-d text-base mb-1">{learnerPhrase}</div>
          <div className="text-[var(--t3)] font-mono text-xs mb-3">{learnerIpa}</div>
          <div className="flex items-center gap-0.5 h-12">
            {learnerBars.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${v * 100}%` }}
                transition={{ delay: 0.3 + i * 0.015, duration: 0.3 }}
                className="flex-1 rounded-full"
                style={{ background: "linear-gradient(180deg, #ef4444, #dc2626)" }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-3 bg-[rgba(99,102,241,0.06)] border border-[var(--border)] text-xs text-[var(--t2)]">
        <strong className="text-[var(--t1)]">What to notice:</strong> The native speaker&apos;s waveform is
        smooth and continuous — words flow together. The learner&apos;s is choppy with gaps between words.
        Aim for the native pattern by linking words and reducing unstressed syllables.
      </div>
    </div>
  );
}
