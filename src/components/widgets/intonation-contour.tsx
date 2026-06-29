"use client";

import { motion } from "framer-motion";
import type { IntonationStep } from "@/lib/types";

interface Props {
  step: IntonationStep;
  speak: (text: string) => void;
}

// Pitch contour SVG — animated path showing how pitch moves across a phrase.

export function IntonationContour({ step, speak }: Props) {
  const { contour, phrase, pattern, description, title } = step;

  // viewBox 100x60
  const toX = (x: number) => 5 + (x / 100) * 90;
  const toY = (y: number) => 55 - (y / 100) * 50;

  const pathD = contour
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.y)}`)
    .join(" ");

  const patternColors: Record<string, string> = {
    rising: "#10b981",
    falling: "#ef4444",
    "rise-fall": "#a78bfa",
    "fall-rise": "#f59e0b",
    level: "#22d3ee",
  };
  const color = patternColors[pattern] || "#6366f1";

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <svg viewBox="0 0 100 60" className="w-full" style={{ aspectRatio: "100/60" }}>
          <defs>
            <linearGradient id={`inton-${pattern}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Pitch axis labels */}
          <text x="2" y="8" fontSize="3" fill="rgba(240,239,255,0.4)" fontFamily="var(--font-mono), monospace">HIGH</text>
          <text x="2" y="55" fontSize="3" fill="rgba(240,239,255,0.4)" fontFamily="var(--font-mono), monospace">LOW</text>

          {/* Reference line (middle) */}
          <line x1="5" y1="30" x2="95" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="2,1" />

          {/* Animated contour path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#inton-${pattern})`}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          />

          {/* Contour points */}
          {contour.map((p, i) => (
            <motion.circle
              key={i}
              cx={toX(p.x)}
              cy={toY(p.y)}
              r="1.2"
              fill={color}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1, type: "spring" }}
            />
          ))}

          {/* Moving dot along path */}
          <motion.circle
            r="1.8"
            fill="white"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            style={{
              offsetPath: `path("${pathD}")`,
            }}
          />
        </svg>

        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
              style={{ background: `${color}33`, color }}
            >
              {pattern.toUpperCase()}
            </span>
          </div>
          <button
            onClick={() => speak(phrase)}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition"
          >
            ▶ Hear
          </button>
        </div>
      </div>
    </div>
  );
}
