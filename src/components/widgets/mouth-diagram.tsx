"use client";

import { motion } from "framer-motion";
import type { MouthDiagramStep } from "@/lib/types";

interface Props {
  step: MouthDiagramStep;
  speak: (text: string) => void;
}

// SVG cross-section of a mouth, with animated tongue and lips positioned
// for the target sound. Tongue position uses framer-motion spring.

export function MouthDiagram({ step, speak }: Props) {
  const { tonguePosition, lipShape, sound, exampleWord, description, title } = step;

  const tongueConfigs: Record<string, { cy: number; rx: number; ry: number; rotate: number }> = {
    "front-high": { cy: 145, rx: 38, ry: 22, rotate: -8 },
    "front-mid": { cy: 160, rx: 40, ry: 24, rotate: -4 },
    "front-low": { cy: 185, rx: 44, ry: 18, rotate: 0 },
    "central-mid": { cy: 168, rx: 50, ry: 22, rotate: 0 },
    "back-high": { cy: 145, rx: 38, ry: 22, rotate: 10 },
    "back-low": { cy: 185, rx: 44, ry: 18, rotate: 6 },
    "between-teeth": { cy: 120, rx: 36, ry: 16, rotate: 0 },
    neutral: { cy: 165, rx: 46, ry: 22, rotate: 0 },
  };
  const cfg = tongueConfigs[tonguePosition] || tongueConfigs.neutral;

  const lipConfigs: Record<string, { upperLipY: number; lowerLipY: number; lipWidth: number }> = {
    relaxed: { upperLipY: 105, lowerLipY: 200, lipWidth: 70 },
    rounded: { upperLipY: 115, lowerLipY: 190, lipWidth: 48 },
    spread: { upperLipY: 108, lowerLipY: 198, lipWidth: 86 },
    "slightly-open": { upperLipY: 100, lowerLipY: 205, lipWidth: 72 },
  };
  const lips = lipConfigs[lipShape] || lipConfigs.relaxed;

  return (
    <div className="space-y-4">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>

      <div className="relative rounded-2xl p-4 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <svg viewBox="0 0 280 280" className="w-full max-w-[320px] mx-auto block">
          <defs>
            <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
            <radialGradient id="throatGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0c0c1a" />
            </radialGradient>
          </defs>

          {/* Head outline (side profile) */}
          <path
            d="M 230 60 Q 265 100 260 160 Q 255 220 220 250 L 220 270 L 30 270 L 30 250 Q 10 230 15 180 Q 20 130 50 100 Q 80 70 130 60 Q 180 55 230 60 Z"
            fill="rgba(99,102,241,0.04)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />

          {/* Throat / back of mouth (dark cavity) */}
          <ellipse cx="60" cy="170" rx="50" ry="55" fill="url(#throatGrad)" opacity="0.8" />

          {/* Roof of mouth (hard palate) */}
          <path
            d="M 90 110 Q 150 95 215 110"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Teeth (upper) */}
          <rect x="180" y="105" width="40" height="8" rx="2" fill="#f8fafc" />
          {/* Teeth (lower) */}
          <rect
            x="180"
            y={lips.upperLipY + (lips.lowerLipY - lips.upperLipY) - 8}
            width="40"
            height="8"
            rx="2"
            fill="#f8fafc"
          />

          {/* Upper lip */}
          <motion.ellipse
            cx="200"
            cy={lips.upperLipY}
            rx={lips.lipWidth / 2}
            ry="6"
            fill="url(#lipGrad)"
            animate={{ cy: lips.upperLipY, rx: lips.lipWidth / 2 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          />
          {/* Lower lip */}
          <motion.ellipse
            cx="200"
            cy={lips.lowerLipY}
            rx={lips.lipWidth / 2}
            ry="6"
            fill="url(#lipGrad)"
            animate={{ cy: lips.lowerLipY, rx: lips.lipWidth / 2 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          />

          {/* Tongue (animated blob) */}
          <motion.ellipse
            cx="140"
            cy={cfg.cy}
            rx={cfg.rx}
            ry={cfg.ry}
            fill="url(#tongueGrad)"
            animate={{ cy: cfg.cy, rx: cfg.rx, ry: cfg.ry }}
            transition={{ type: "spring", stiffness: 90, damping: 12 }}
            style={{ transformOrigin: "140px 165px", rotate: `${cfg.rotate}deg` }}
          />

          {/* Sound label */}
          {sound && (
            <g>
              <circle cx="240" cy="40" r="22" fill="url(#tongueGrad)" opacity="0.2" />
              <text
                x="240"
                y="48"
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize="22"
                fontWeight="700"
                fill="#a78bfa"
              >
                {sound}
              </text>
            </g>
          )}

          {/* Airflow indicator (animated dots) */}
          {tonguePosition === "between-teeth" && (
            <g>
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={220 + i * 8}
                  cy={115}
                  r="2"
                  fill="#22d3ee"
                  initial={{ opacity: 0 }}
                  animate={{ x: [0, 30, 60], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                />
              ))}
            </g>
          )}
        </svg>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#f97316]" />
            <span className="text-[var(--t2)]">Tongue: {tonguePosition.replace("-", " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#ec4899]" />
            <span className="text-[var(--t2)]">Lips: {lipShape}</span>
          </div>
        </div>

        {exampleWord && (
          <button
            onClick={() => speak(exampleWord)}
            className="mt-3 w-full rounded-xl py-2.5 px-4 bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <span>▶</span> Hear: {exampleWord}
          </button>
        )}
      </div>
    </div>
  );
}
