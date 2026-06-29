"use client";

import { motion } from "framer-motion";
import type { StressBarsStep } from "@/lib/types";

interface Props {
  step: StressBarsStep;
  speak: (text: string) => void;
}

// Animated bars showing syllable stress in a word.
// Stressed syllables are tall + bright; unstressed are short + dim.

export function StressBars({ step, speak }: Props) {
  const { syllables, word, description, title } = step;
  const max = Math.max(...syllables.map((s) => s.text.length));

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <div className="flex items-end justify-center gap-2 h-40">
          {syllables.map((syl, i) => (
            <div key={i} className="flex flex-col items-center gap-2" style={{ flex: 1, maxWidth: 90 }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: syl.stressed ? "100%" : "38%",
                  opacity: 1,
                }}
                transition={{
                  delay: 0.15 * i,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                className="w-full rounded-t-lg relative overflow-hidden"
                style={{
                  background: syl.stressed
                    ? "linear-gradient(180deg, #6366f1, #8b5cf6)"
                    : "rgba(255,255,255,0.08)",
                  border: syl.stressed ? "1px solid rgba(167,139,250,0.5)" : "1px solid var(--border)",
                }}
              >
                {syl.stressed && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.2))",
                    }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                )}
                {syl.stressed && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px]">⬆</div>
                )}
              </motion.div>
              <div
                className={`text-sm font-mono ${
                  syl.stressed ? "text-[#a78bfa] font-bold" : "text-[var(--t3)]"
                }`}
              >
                {syl.text}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-[var(--grad-btn)]" />
            <span className="text-[var(--t2)]">Stressed</span>
            <span className="inline-block w-3 h-3 rounded bg-[rgba(255,255,255,0.08)] ml-2" />
            <span className="text-[var(--t2)]">Unstressed</span>
          </div>
          <button
            onClick={() => speak(word)}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            ▶ Hear
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--t3)] font-mono">
          {syllables.map((s, i) => (s.stressed ? s.text.toUpperCase() : s.text.toLowerCase())).join(" · ")}
        </p>
      </div>
    </div>
  );
}
