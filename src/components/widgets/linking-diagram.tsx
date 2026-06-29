"use client";

import { motion } from "framer-motion";
import type { LinkingStep } from "@/lib/types";

interface Props {
  step: LinkingStep;
  speak: (text: string) => void;
}

// Connected-speech linking visualization.
// Words are shown as cards; curved animated arrows link them.

export function LinkingDiagram({ step, speak }: Props) {
  const { words, links, description, title } = step;

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-center gap-2 relative">
          {words.map((w, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="rounded-xl px-4 py-2.5 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] font-d text-base">
                {w}
              </div>
              {/* Link indicator to the right */}
              {links.filter((l) => l.from === i).map((l, li) => (
                <motion.div
                  key={li}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 + li * 0.1, type: "spring" }}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10"
                >
                  <div
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                      l.type === "consonant-vowel"
                        ? "bg-[#22d3ee] text-black"
                        : l.type === "vowel-vowel"
                        ? "bg-[#f59e0b] text-black"
                        : "bg-[#ec4899] text-white"
                    }`}
                    title={l.type}
                  >
                    →
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22d3ee]" />
            <span className="text-[var(--t2)]">C–V link</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
            <span className="text-[var(--t2)]">C–C link</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-[var(--t2)]">V–V glide</span>
          </span>
        </div>

        <button
          onClick={() => speak(words.join(" "))}
          className="mt-4 w-full rounded-xl py-2.5 px-4 bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
        >
          ▶ Hear linked
        </button>
      </div>
    </div>
  );
}
