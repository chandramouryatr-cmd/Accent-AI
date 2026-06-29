"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { VowelChartStep } from "@/lib/types";

interface Props {
  step: VowelChartStep;
  speak: (text: string) => void;
}

// IPA vowel quadrilateral — the classic trapezoid used in phonetics.
// Vowels are plotted as animated dots the user can tap to hear.
// Enhanced: gradient fill (warm front / cool back), multi-ring pulse,
// animated connection lines between selections, hover tooltips with
// example words, prominent axis labels with arrows, and a Play-All tour.

export function VowelChart({ step, speak }: Props) {
  const [active, setActive] = useState<string | null>(step.highlight ?? null);
  const [prev, setPrev] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [playAllIdx, setPlayAllIdx] = useState<number>(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const toX = (x: number) => 10 + (x / 100) * 80;
  const toY = (y: number) => 15 + (y / 100) * 80;

  // Build the trapezoid polygon points
  const trapPts = `${toX(0)},${toY(0)} ${toX(100)},${toY(0)} ${toX(100)},${toY(100)} ${toX(0)},${toY(100)}`;

  const selectVowel = (ipa: string, idx: number, withSpeak: boolean) => {
    setPrev(active);
    setActive(ipa);
    if (withSpeak) speak(ipa);
    void idx;
  };

  // Play all — sequentially highlight + speak each vowel
  const playAll = () => {
    // Clear any existing timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    step.vowels.forEach((v, i) => {
      const t = setTimeout(() => {
        setPrev(active);
        setActive(v.ipa);
        setPlayAllIdx(i);
        speak(v.ipa);
      }, i * 1100);
      timersRef.current.push(t);
    });
    const end = setTimeout(() => setPlayAllIdx(-1), step.vowels.length * 1100 + 200);
    timersRef.current.push(end);
  };

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Current and previous vowel positions (for connection line)
  const curV = step.vowels.find((v) => v.ipa === active);
  const prevV = step.vowels.find((v) => v.ipa === prev);

  return (
    <div className="space-y-3">
      {step.title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{step.title}</h4>}
      <p className="text-[var(--t2)] text-sm leading-relaxed">{step.description}</p>

      <div className="rounded-2xl p-4 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <svg viewBox="0 0 100 100" className="w-full max-w-[360px] mx-auto block" style={{ aspectRatio: "1" }}>
          <defs>
            {/* Warm-to-cool gradient fill inside the trapezoid */}
            <linearGradient id="vowelFill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#ec4899" stopOpacity="0.10" />
              <stop offset="65%" stopColor="#8b5cf6" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.20" />
            </linearGradient>
            <filter id="vowelGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trapezoid with gradient fill */}
          <motion.polygon
            points={trapPts}
            fill="url(#vowelFill)"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="0.7"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
          />

          {/* Grid lines (front-back, high-low) */}
          <line x1={toX(50)} y1={toY(0)} x2={toX(50)} y2={toY(100)} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,1" />
          <line x1={toX(0)} y1={toY(50)} x2={toX(100)} y2={toY(50)} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,1" />

          {/* Prominent axis labels with arrow indicators */}
          <g>
            {/* FRONT label with left-arrow */}
            <motion.g
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <text x={toX(0)} y={toY(0) - 4} fontSize="3.4" fontWeight="700" fill="#f59e0b" textAnchor="middle" fontFamily="var(--font-mono), monospace" letterSpacing="0.4">FRONT</text>
              <path d={`M ${toX(0) - 5} ${toY(0) - 1.5} L ${toX(0) + 5} ${toY(0) - 1.5} M ${toX(0) - 4} ${toY(0) - 2.5} L ${toX(0) - 5} ${toY(0) - 1.5} L ${toX(0) - 4} ${toY(0) - 0.5}`} fill="none" stroke="#f59e0b" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            {/* BACK label with right-arrow */}
            <motion.g
              initial={{ opacity: 0, x: 3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <text x={toX(100)} y={toY(0) - 4} fontSize="3.4" fontWeight="700" fill="#22d3ee" textAnchor="middle" fontFamily="var(--font-mono), monospace" letterSpacing="0.4">BACK</text>
              <path d={`M ${toX(100) - 5} ${toY(0) - 1.5} L ${toX(100) + 5} ${toY(0) - 1.5} M ${toX(100) + 4} ${toY(0) - 2.5} L ${toX(100) + 5} ${toY(0) - 1.5} L ${toX(100) + 4} ${toY(0) - 0.5}`} fill="none" stroke="#22d3ee" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            {/* HIGH label with up-arrow */}
            <motion.g
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <text x={toX(0) - 4.5} y={toY(0) + 1} fontSize="3.4" fontWeight="700" fill="#a78bfa" textAnchor="end" fontFamily="var(--font-mono), monospace" letterSpacing="0.3">HIGH</text>
              <path d={`M ${toX(0) - 1.5} ${toY(0) - 1} L ${toX(0) - 1.5} ${toY(0) + 4} M ${toX(0) - 2.5} ${toY(0)} L ${toX(0) - 1.5} ${toY(0) - 1} L ${toX(0) - 0.5} ${toY(0)}`} fill="none" stroke="#a78bfa" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            {/* LOW label with down-arrow */}
            <motion.g
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <text x={toX(0) - 4.5} y={toY(100) + 1} fontSize="3.4" fontWeight="700" fill="#a78bfa" textAnchor="end" fontFamily="var(--font-mono), monospace" letterSpacing="0.3">LOW</text>
              <path d={`M ${toX(0) - 1.5} ${toY(100) - 4} L ${toX(0) - 1.5} ${toY(100) + 1} M ${toX(0) - 2.5} ${toY(100)} L ${toX(0) - 1.5} ${toY(100) + 1} L ${toX(0) - 0.5} ${toY(100)}`} fill="none" stroke="#a78bfa" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
          </g>

          {/* Animated connection line from previous selection to current */}
          {curV && prevV && prevV.ipa !== curV.ipa && (
            <motion.path
              d={`M ${toX(prevV.x)} ${toY(prevV.y)} Q ${(toX(prevV.x) + toX(curV.x)) / 2} ${Math.min(toY(prevV.y), toY(curV.y)) - 6} ${toX(curV.x)} ${toY(curV.y)}`}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="0.5"
              strokeDasharray="1.2,0.8"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 0.6 }}
              style={{ pointerEvents: "none" }}
            />
          )}

          {/* Vowel dots */}
          {step.vowels.map((v, i) => {
            const isActive = active === v.ipa;
            const isHovered = hovered === v.ipa;
            const isPlayAll = playAllIdx === i;
            const ringColor = v.color || "#6366f1";
            return (
              <g key={v.ipa}>
                {/* Multi-ring pulse on active dot */}
                {isActive && [0, 1, 2].map((ring) => (
                  <motion.circle
                    key={ring}
                    cx={toX(v.x)}
                    cy={toY(v.y)}
                    r="3"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="0.5"
                    initial={{ scale: 0.6, opacity: 0.7 }}
                    animate={{ scale: 1 + ring * 0.8, opacity: 0 }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: ring * 0.35, ease: "easeOut" }}
                    style={{ transformOrigin: `${toX(v.x)}px ${toY(v.y)}px`, pointerEvents: "none" }}
                  />
                ))}

                {/* Hover ring */}
                {(isHovered || isPlayAll) && !isActive && (
                  <circle
                    cx={toX(v.x)}
                    cy={toY(v.y)}
                    r="5"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="0.4"
                    opacity="0.5"
                    style={{ pointerEvents: "none" }}
                  />
                )}

                {/* Dot — scales up on hover/active */}
                <motion.circle
                  cx={toX(v.x)}
                  cy={toY(v.y)}
                  r={isActive ? 4 : isHovered ? 3.4 : 2.8}
                  fill={v.color || "#6366f1"}
                  stroke="white"
                  strokeWidth="0.4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 200, damping: 14 }}
                  style={{ cursor: "pointer", transformOrigin: `${toX(v.x)}px ${toY(v.y)}px` }}
                  onMouseEnter={() => setHovered(v.ipa)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => {
                    selectVowel(v.ipa, i, true);
                  }}
                  filter={isActive ? "url(#vowelGlow)" : undefined}
                />

                {/* IPA label */}
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

                {/* Label (example word hint) */}
                {v.label && (
                  <text
                    x={toX(v.x)}
                    y={toY(v.y) + 6}
                    fontSize="2.4"
                    fill={isActive || isHovered ? "rgba(240,239,255,0.85)" : "rgba(240,239,255,0.4)"}
                    textAnchor="middle"
                    fontFamily="var(--font-sans), sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {v.label}
                  </text>
                )}

                {/* Hover tooltip — example word */}
                {(isHovered || isPlayAll) && v.label && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect x={toX(v.x) - 9} y={toY(v.y) - 13} width="18" height="5" rx="1" fill="rgba(20,20,40,0.95)" stroke={ringColor} strokeWidth="0.3" />
                    <text x={toX(v.x)} y={toY(v.y) - 9.4} fontSize="2.6" fontWeight="700" fill={ringColor} textAnchor="middle" fontFamily="var(--font-mono), monospace">
                      {v.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--t3)]">
            {active ? (
              <>Selected: <span className="font-mono font-bold text-[var(--t1)]">{active}</span>{curV?.label && <span className="ml-1 text-[var(--t2)]">— "{curV.label}"</span>}</>
            ) : (
              "Tap any dot to hear the sound"
            )}
          </p>
          <button
            onClick={playAll}
            disabled={playAllIdx >= 0}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-50"
          >
            {playAllIdx >= 0 ? `Playing ${playAllIdx + 1}/${step.vowels.length}` : "▶ Play all"}
          </button>
        </div>
      </div>
    </div>
  );
}
