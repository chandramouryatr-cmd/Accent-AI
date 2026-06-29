"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { VowelChartStep } from "@/lib/types";

interface Props {
  step: VowelChartStep;
  speak: (text: string) => void;
}

// IPA vowel quadrilateral — the classic trapezoid used in phonetics.
// Vowels are plotted as animated dots the user can tap to hear.

export function VowelChart({ step, speak }: Props) {
  const [active, setActive] = useState<string | null>(step.highlight ?? null);

  // The trapezoid is drawn within a 100×100 viewBox (we scale to actual size).
  // Corners: top-left (10,15) front-high, top-right (75,15) back-high,
  // bottom-right (90,85) back-low, bottom-left (15,95) front-low.
  // x: 0=front, 100=back. y: 0=high, 100=low.

  const toX = (x: number) => 10 + (x / 100) * 80;
  const toY = (y: number) => 15 + (y / 100) * 80;

  return (
    <div className="space-y-3">
      {step.title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{step.title}</h4>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{step.description}</p>

      <div className="rounded-2xl p-4 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <svg viewBox="0 0 100 100" className="w-full max-w-[360px] mx-auto block" style={{ aspectRatio: "1" }}>
          {/* Trapezoid outline */}
          <motion.polygon
            points={`${toX(0)},${toY(0)} ${toX(100)},${toY(0)} ${toX(100)},${toY(100)} ${toX(0)},${toY(100)}`}
            fill="rgba(99,102,241,0.06)"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
          />

          {/* Grid lines (front-back, high-low) */}
          <line x1={toX(50)} y1={toY(0)} x2={toX(50)} y2={toY(100)} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,1" />
          <line x1={toX(0)} y1={toY(50)} x2={toX(100)} y2={toY(50)} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* Axis labels */}
          <text x={toX(0)} y={toY(0) - 3} fontSize="3" fill="rgba(240,239,255,0.5)" textAnchor="middle" fontFamily="var(--font-mono), monospace">FRONT</text>
          <text x={toX(100)} y={toY(0) - 3} fontSize="3" fill="rgba(240,239,255,0.5)" textAnchor="middle" fontFamily="var(--font-mono), monospace">BACK</text>
          <text x={toX(0) - 4} y={toY(0) + 1} fontSize="3" fill="rgba(240,239,255,0.5)" textAnchor="end" fontFamily="var(--font-mono), monospace">HIGH</text>
          <text x={toX(0) - 4} y={toY(100) + 1} fontSize="3" fill="rgba(240,239,255,0.5)" textAnchor="end" fontFamily="var(--font-mono), monospace">LOW</text>

          {/* Vowel dots */}
          {step.vowels.map((v, i) => {
            const isActive = active === v.ipa;
            return (
              <g key={v.ipa}>
                <motion.circle
                  cx={toX(v.x)}
                  cy={toY(v.y)}
                  r={isActive ? 4 : 2.8}
                  fill={v.color || "#6366f1"}
                  stroke="white"
                  strokeWidth="0.4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200, damping: 14 }}
                  style={{ cursor: "pointer", transformOrigin: `${toX(v.x)}px ${toY(v.y)}px` }}
                  onClick={() => {
                    setActive(v.ipa);
                    speak(v.ipa);
                  }}
                />
                <text
                  x={toX(v.x)}
                  y={toY(v.y) - 4.5}
                  fontSize="3.4"
                  fontWeight="700"
                  fill={isActive ? v.color || "#a78bfa" : "rgba(240,239,255,0.85)"}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), monospace"
                  style={{ pointerEvents: "none" }}
                >
                  {v.ipa}
                </text>
                {v.label && (
                  <text
                    x={toX(v.x)}
                    y={toY(v.y) + 6}
                    fontSize="2.4"
                    fill="rgba(240,239,255,0.4)"
                    textAnchor="middle"
                    fontFamily="var(--font-sans), sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {v.label}
                  </text>
                )}
                {isActive && (
                  <motion.circle
                    cx={toX(v.x)}
                    cy={toY(v.y)}
                    r="6"
                    fill="none"
                    stroke={v.color || "#6366f1"}
                    strokeWidth="0.5"
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ transformOrigin: `${toX(v.x)}px ${toY(v.y)}px` }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        <p className="mt-3 text-center text-xs text-[var(--t3)]">
          Tap any dot to hear the sound
        </p>
      </div>
    </div>
  );
}
