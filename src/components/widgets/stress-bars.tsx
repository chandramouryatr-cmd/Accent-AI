"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { StressBarsStep } from "@/lib/types";

interface Props {
  step: StressBarsStep;
  speak: (text: string) => void;
}

// Animated bars showing syllable stress in a word.
// Stressed syllables are tall + bright; unstressed are short + dim.
// Enhanced: tap any syllable bar to hear just that syllable, rubber-band
// stretch effect on stressed bars, schwa /ə/ marker on unstressed bars,
// sequential "lighting up" play button, sharper 100% / 35% height contrast,
// subtle particle effects rising from stressed bars.

export function StressBars({ step, speak }: Props) {
  const { syllables, word, description, title } = step;
  const [activeIdx, setActiveIdx] = useState(-1);
  const [sequential, setSequential] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Stressed bars get a slightly stretched width — the "rubber band" effect
  // visually emphasizes that stressed syllables are longer in real speech.
  const stretched = (i: number) => (syllables[i].stressed ? 1.35 : 1);

  // Tap-to-hear for an individual syllable
  const tapSyllable = (i: number) => {
    setActiveIdx(i);
    speak(syllables[i].text);
    window.setTimeout(() => setActiveIdx(-1), 600);
  };

  // Sequential play — bars light up in order as the word is spoken
  const playSequential = () => {
    if (sequential) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setSequential(true);
    speak(word);
    syllables.forEach((s, i) => {
      const t1 = setTimeout(() => setActiveIdx(i), i * 450);
      const t2 = setTimeout(() => setActiveIdx(-1), i * 450 + 420);
      timersRef.current.push(t1, t2);
    });
    const end = setTimeout(() => setSequential(false), syllables.length * 450 + 500);
    timersRef.current.push(end);
  };

  useEffect(() => () => { timersRef.current.forEach((t) => clearTimeout(t)); }, []);

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <div className="flex items-end justify-center gap-2 h-40">
          {syllables.map((syl, i) => {
            const isActive = activeIdx === i;
            return (
              <motion.button
                key={i}
                onClick={() => tapSyllable(i)}
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: syl.stressed ? "100%" : "35%",
                  opacity: 1,
                  scaleX: isActive ? 1.05 : 1,
                }}
                transition={{
                  delay: 0.15 * i,
                  type: "spring",
                  stiffness: 120,
                  damping: 14,
                }}
                className="flex flex-col items-center gap-2 cursor-pointer relative group"
                style={{
                  flex: stretched(i),
                  maxWidth: syl.stressed ? 110 : 80,
                }}
              >
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  animate={{
                    height: syl.stressed ? "100%" : "35%",
                    backgroundColor: isActive
                      ? syl.stressed ? "#8b5cf6" : "#22d3ee"
                      : syl.stressed ? "#6366f1" : "rgba(255,255,255,0.06)",
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: syl.stressed
                      ? "linear-gradient(180deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.06)",
                    border: syl.stressed
                      ? "1px solid rgba(167,139,250,0.5)"
                      : "1px solid var(--border)",
                    boxShadow: isActive && syl.stressed
                      ? "0 0 18px rgba(139,92,246,0.6)"
                      : isActive
                      ? "0 0 12px rgba(34,211,238,0.5)"
                      : "none",
                  }}
                >
                  {/* Stressed: shimmer overlay */}
                  {syl.stressed && (
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.22))" }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}

                  {/* Stressed: up-arrow + stress marker */}
                  {syl.stressed && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">⬆</div>
                  )}

                  {/* Stressed: primary-stress apostrophe (IPA convention) */}
                  {syl.stressed && (
                    <div className="absolute top-1 left-1 text-[10px] text-white/80 font-mono font-bold">ˈ</div>
                  )}

                  {/* Unstressed: schwa indicator overlay */}
                  {!syl.stressed && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-mono text-[var(--t3)] opacity-60">/ə/</span>
                    </div>
                  )}

                  {/* Active tap ripple */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 border-2 border-white/50 rounded-t-lg"
                      initial={{ opacity: 0.8, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </motion.div>

                {/* Particle effects rising from stressed syllables */}
                {syl.stressed && [0, 1, 2].map((p) => (
                  <motion.div
                    key={p}
                    className="absolute top-0 left-1/2 w-1 h-1 rounded-full bg-[#a78bfa] pointer-events-none"
                    initial={{ opacity: 0, y: 0, x: (p - 1) * 6 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-5, -25],
                      x: [(p - 1) * 6, (p - 1) * 12],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: p * 0.5 + i * 0.15,
                      ease: "easeOut",
                    }}
                  />
                ))}

                <div
                  className={`text-sm font-mono transition-colors ${
                    syl.stressed ? "text-[#a78bfa] font-bold" : "text-[var(--t3)]"
                  } ${isActive ? "scale-110" : ""}`}
                >
                  {syl.text}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-[var(--grad-btn)]" />
            <span className="text-[var(--t2)]">Stressed</span>
            <span className="inline-block w-3 h-3 rounded bg-[rgba(255,255,255,0.08)] ml-2" />
            <span className="text-[var(--t2)]">Unstressed (/ə/)</span>
          </div>
          <button
            onClick={playSequential}
            disabled={sequential}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {sequential ? "Playing…" : "▶ Hear"}
          </button>
        </div>

        <p className="mt-3 text-xs text-[var(--t3)] font-mono">
          {syllables.map((s, i) => (s.stressed ? s.text.toUpperCase() : s.text.toLowerCase())).join(" · ")}
        </p>
        <p className="mt-1 text-[10px] text-[var(--t3)]">Tap any bar to hear that syllable alone</p>
      </div>
    </div>
  );
}
