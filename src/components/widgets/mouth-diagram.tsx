"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { MouthDiagramStep } from "@/lib/types";

interface Props {
  step: MouthDiagramStep;
  speak: (text: string) => void;
}

// SVG cross-section of a mouth, with animated tongue and lips positioned
// for the target sound. Tongue position uses framer-motion spring.
// Includes airflow particles, glow on the tongue, FRONT/BACK labels,
// a "speaking" animation state, and a Try-It (visual-only) button.

export function MouthDiagram({ step, speak }: Props) {
  const { tonguePosition, lipShape, sound, exampleWord, description, title } = step;
  const [speaking, setSpeaking] = useState(false);
  const [tryIt, setTryIt] = useState(false);

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

  // Determine tongue position label for the FRONT/BACK indicator
  const isFront = tonguePosition.startsWith("front") || tonguePosition === "between-teeth";
  const isBack = tonguePosition.startsWith("back");
  const isCentral = tonguePosition.startsWith("central") || tonguePosition === "neutral";

  const triggerSpeak = () => {
    if (!exampleWord) return;
    setSpeaking(true);
    speak(exampleWord);
    window.setTimeout(() => setSpeaking(false), 1400);
  };
  const triggerTryIt = () => {
    setTryIt(true);
    setSpeaking(true);
    window.setTimeout(() => {
      setTryIt(false);
      setSpeaking(false);
    }, 1600);
  };

  // Airflow particles — always show, denser when speaking
  const particleCount = speaking ? 7 : 4;

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
            <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167,139,250,0.16)" />
              <stop offset="55%" stopColor="rgba(99,102,241,0.06)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.05)" />
            </linearGradient>
            <radialGradient id="tongueGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#f97316" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="airflowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Head outline (side profile) — polished with gradient fill */}
          <motion.path
            d="M 230 60 Q 265 100 260 160 Q 255 220 220 250 L 220 270 L 30 270 L 30 250 Q 10 230 15 180 Q 20 130 50 100 Q 80 70 130 60 Q 180 55 230 60 Z"
            fill="url(#headGrad)"
            stroke="rgba(167,139,250,0.32)"
            strokeWidth="1.6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Position indicator labels: FRONT / BACK arrows */}
          <g opacity="0.65">
            <text x="200" y="262" textAnchor="middle" fontSize="8" fontWeight="700" fill="#22d3ee" fontFamily="var(--font-mono), monospace" letterSpacing="1">
              FRONT
            </text>
            <text x="70" y="262" textAnchor="middle" fontSize="8" fontWeight="700" fill="#a78bfa" fontFamily="var(--font-mono), monospace" letterSpacing="1">
              BACK
            </text>
            {/* Direction arrows under labels */}
            <motion.path
              d="M 180 268 L 220 268 M 215 264 L 220 268 L 215 272"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ opacity: isFront ? [0.4, 1, 0.4] : 0.35 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <motion.path
              d="M 90 268 L 50 268 M 55 264 L 50 268 L 55 272"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ opacity: isBack ? [0.4, 1, 0.4] : 0.35 }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </g>

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

          {/* Tongue glow (subtle aura behind tongue) */}
          <motion.ellipse
            cx="140"
            cy={cfg.cy}
            rx={cfg.rx + 14}
            ry={cfg.ry + 14}
            fill="url(#tongueGlow)"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: speaking ? 0.9 : 0.55, scale: 1 }}
            transition={{ duration: 0.6 }}
            style={{ transformOrigin: "140px 165px" }}
          />

          {/* Upper lip */}
          <motion.ellipse
            cx="200"
            cy={lips.upperLipY}
            rx={lips.lipWidth / 2}
            ry="6"
            fill="url(#lipGrad)"
            animate={{
              cy: speaking ? [lips.upperLipY, lips.upperLipY - 4, lips.upperLipY] : lips.upperLipY,
              rx: lips.lipWidth / 2,
            }}
            transition={{ duration: 0.6, repeat: speaking ? 2 : 0, ease: "easeInOut" }}
          />
          {/* Lower lip */}
          <motion.ellipse
            cx="200"
            cy={lips.lowerLipY}
            rx={lips.lipWidth / 2}
            ry="6"
            fill="url(#lipGrad)"
            animate={{
              cy: speaking ? [lips.lowerLipY, lips.lowerLipY + 5, lips.lowerLipY] : lips.lowerLipY,
              rx: lips.lipWidth / 2,
            }}
            transition={{ duration: 0.6, repeat: speaking ? 2 : 0, ease: "easeInOut" }}
          />

          {/* Tongue (animated blob) — wiggles when speaking */}
          <motion.ellipse
            cx="140"
            cy={cfg.cy}
            rx={cfg.rx}
            ry={cfg.ry}
            fill="url(#tongueGrad)"
            animate={{
              cy: speaking ? [cfg.cy, cfg.cy + 4, cfg.cy - 3, cfg.cy] : cfg.cy,
              rx: cfg.rx,
              ry: cfg.ry,
              rotate: speaking ? [cfg.rotate, cfg.rotate + 4, cfg.rotate - 3, cfg.rotate] : cfg.rotate,
            }}
            transition={{
              duration: 0.55,
              repeat: speaking ? 2 : 0,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "140px 165px" }}
          />

          {/* Sound label */}
          {sound && (
            <g>
              <motion.circle
                cx="240"
                cy="40"
                r="22"
                fill="url(#tongueGrad)"
                opacity="0.2"
                animate={{ r: speaking ? [22, 26, 22] : 22 }}
                transition={{ duration: 0.6, repeat: speaking ? 2 : 0 }}
              />
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

          {/* Airflow particles for ALL sounds — small dots flowing from throat out through lips */}
          <g>
            {Array.from({ length: particleCount }).map((_, i) => (
              <motion.circle
                key={i}
                cy={lips.upperLipY + (lips.lowerLipY - lips.upperLipY) / 2}
                r={speaking ? 2.4 : 1.6}
                fill="url(#airflowGrad)"
                initial={{ cx: 60, opacity: 0 }}
                animate={{
                  cx: [60, 130, 200, 250],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: speaking ? 0.9 : 1.6,
                  repeat: Infinity,
                  delay: i * (speaking ? 0.12 : 0.4),
                  ease: "easeIn",
                }}
              />
            ))}
          </g>

          {/* "Speaking" indicator pill (top-left) */}
          <AnimatePresence>
            {speaking && (
              <motion.g
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                <rect x="14" y="14" width="58" height="16" rx="8" fill="rgba(34,211,238,0.18)" stroke="rgba(34,211,238,0.5)" strokeWidth="0.6" />
                <circle cx="22" cy="22" r="2" fill="#22d3ee">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
                </circle>
                <text x="50" y="25" textAnchor="middle" fontSize="7" fontWeight="700" fill="#22d3ee" fontFamily="var(--font-mono), monospace" letterSpacing="1">
                  SPEAKING
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Central marker (small dot at center of mouth for reference) */}
          {isCentral && (
            <circle cx="140" cy="165" r="1.5" fill="rgba(167,139,250,0.6)" />
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

        <div className="mt-3 flex gap-2">
          {exampleWord && (
            <button
              onClick={triggerSpeak}
              className="flex-1 rounded-xl py-2.5 px-4 bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <span>▶</span> Hear: {exampleWord}
            </button>
          )}
          <button
            onClick={triggerTryIt}
            className="flex-1 rounded-xl py-2.5 px-4 bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.4)] text-[#22d3ee] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[rgba(34,211,238,0.18)] transition"
          >
            <span>👁</span> Try it
          </button>
        </div>
        {tryIt && (
          <p className="mt-2 text-center text-[11px] text-[var(--t3)]">Visual-only — no sound. Watch the tongue & lips move.</p>
        )}
      </div>
    </div>
  );
}
