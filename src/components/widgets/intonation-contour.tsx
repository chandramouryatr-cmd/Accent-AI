"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { IntonationStep } from "@/lib/types";

interface Props {
  step: IntonationStep;
  speak: (text: string) => void;
}

// Pitch contour SVG — animated path showing how pitch moves across a phrase.
// Enhanced: filled gradient area under curve, word markers along x-axis,
// vertical playhead, glow on contour path, pattern description text,
// larger moving dot with comet trail.

const PATTERN_DESC: Record<string, string> = {
  rising: "Rising = question / uncertainty / list item",
  falling: "Falling = statement / finality / command",
  "rise-fall": "Rise-fall = surprise / emphasis / impressed",
  "fall-rise": "Fall-rise = reservation / uncertainty / warning",
  level: "Level = neutral / routine / bored",
};

export function IntonationContour({ step, speak }: Props) {
  const { contour, phrase, pattern, description, title } = step;
  const [playhead, setPlayhead] = useState(0); // 0..1 progress along the contour
  const [playing, setPlaying] = useState(false);

  const toX = (x: number) => 5 + (x / 100) * 90;
  const toY = (y: number) => 55 - (y / 100) * 50;

  const pathD = contour
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.x)} ${toY(p.y)}`)
    .join(" ");

  // Filled area under the contour (down to baseline y=55)
  const fillD = `${pathD} L ${toX(contour[contour.length - 1].x)} 55 L ${toX(contour[0].x)} 55 Z`;

  const patternColors: Record<string, string> = {
    rising: "#10b981",
    falling: "#ef4444",
    "rise-fall": "#a78bfa",
    "fall-rise": "#f59e0b",
    level: "#22d3ee",
  };
  const color = patternColors[pattern] || "#6366f1";

  // Word markers — split phrase into words and distribute along x-axis
  const words = phrase.split(/\s+/).filter(Boolean);
  const wordMarkers = words.map((w, i) => ({
    word: w,
    x: 5 + ((i + 0.5) / words.length) * 90,
  }));

  // Playhead driver
  useEffect(() => {
    if (!playing) return;
    let raf: ReturnType<typeof requestAnimationFrame>;
    let start: number;
    const dur = 2600;
    const tick = (now: number) => {
      if (start === undefined) start = now;
      const p = Math.min((now - start) / dur, 1);
      setPlayhead(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPlaying(false);
        setPlayhead(0);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const handlePlay = () => {
    setPlaying(true);
    setPlayhead(0);
    speak(phrase);
  };

  // Compute current playhead X position from progress
  const playheadX = 5 + playhead * 90;

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <svg viewBox="0 0 100 60" className="w-full" style={{ aspectRatio: "100/60" }}>
          <defs>
            <linearGradient id={`inton-stroke-${pattern}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="50%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`inton-fill-${pattern}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
            <filter id={`inton-glow-${pattern}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Pitch axis labels */}
          <text x="2" y="8" fontSize="3" fill="rgba(240,239,255,0.4)" fontFamily="var(--font-mono), monospace">HIGH</text>
          <text x="2" y="55" fontSize="3" fill="rgba(240,239,255,0.4)" fontFamily="var(--font-mono), monospace">LOW</text>

          {/* Reference line (middle) */}
          <line x1="5" y1="30" x2="95" y2="30" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="2,1" />

          {/* Word markers (vertical guides) */}
          {wordMarkers.map((m, i) => (
            <line
              key={i}
              x1={m.x}
              y1="8"
              x2={m.x}
              y2="55"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.25"
              strokeDasharray="1,1"
            />
          ))}

          {/* Filled gradient area under contour */}
          <motion.path
            d={fillD}
            fill={`url(#inton-fill-${pattern})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6 }}
            style={{ pointerEvents: "none" }}
          />

          {/* Animated contour path with glow */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#inton-stroke-${pattern})`}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#inton-glow-${pattern})`}
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

          {/* Vertical playhead line that moves across the contour */}
          {playing && (
            <motion.line
              x1={playheadX}
              y1="5"
              x2={playheadX}
              y2="55"
              stroke={color}
              strokeWidth="0.4"
              strokeDasharray="1,0.5"
              opacity="0.7"
            />
          )}

          {/* Comet trail — three fading dots behind the moving dot */}
          {playing && [0, 1, 2].map((trail) => {
            const trailP = Math.max(0, playhead - trail * 0.04);
            return (
              <circle
                key={trail}
                cx={5 + trailP * 90}
                cy={(function () {
                  // Sample y from contour at progress trailP
                  const idx = Math.min(contour.length - 1, Math.floor(trailP * (contour.length - 1)));
                  const segP = trailP * (contour.length - 1) - idx;
                  const a = contour[idx];
                  const b = contour[Math.min(idx + 1, contour.length - 1)];
                  const yLerp = a.y + (b.y - a.y) * segP;
                  return toY(yLerp);
                })()}
                r={1.6 - trail * 0.4}
                fill={color}
                opacity={0.6 - trail * 0.2}
              />
            );
          })}

          {/* Moving dot along path (larger, with glow) */}
          <motion.circle
            r="2.4"
            fill="white"
            stroke={color}
            strokeWidth="0.6"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            style={{
              offsetPath: `path("${pathD}")`,
              filter: `drop-shadow(0 0 3px ${color})`,
            }}
          />

          {/* Word labels below contour */}
          {wordMarkers.map((m, i) => (
            <text
              key={i}
              x={m.x}
              y="59"
              fontSize="2.5"
              fill="rgba(240,239,255,0.6)"
              textAnchor="middle"
              fontFamily="var(--font-sans), sans-serif"
            >
              {m.word}
            </text>
          ))}
        </svg>

        {/* Pattern description text */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            style={{ background: `${color}33`, color }}
          >
            {pattern.toUpperCase()}
          </span>
          <span className="text-[var(--t3)]">{PATTERN_DESC[pattern] || ""}</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[var(--t3)]">{playing ? "Playing…" : "Tap Hear to play the contour"}</span>
          <button
            onClick={handlePlay}
            disabled={playing}
            className="rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-50"
          >
            ▶ Hear
          </button>
        </div>
      </div>
    </div>
  );
}
