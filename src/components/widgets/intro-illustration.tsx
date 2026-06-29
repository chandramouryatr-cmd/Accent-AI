"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { StepVisual } from "@/lib/types";

interface Props {
  visual: StepVisual;
  /** Optional emoji — currently used by the emoji-burst variant as the
   *  central particle. */
  emoji?: string;
  /** Pixel size of the square illustration. Default 120. */
  size?: number;
}

/**
 * Compact animated SVG illustration used at the top of the lesson intro
 * step. Picks one of six looping Framer Motion animations based on the
 * step's `visual` field. Lightweight: pure SVG primitives, no images.
 *
 * Palette comes from the existing CSS variables:
 *   --p  indigo   #6366f1
 *   --p2 violet   #8b5cf6
 *   --p3 light violet #a78bfa
 *   --c  cyan     #22d3ee
 *   --c2 light cyan #67e8f9
 */
export function IntroIllustration({ visual, emoji, size = 120 }: Props) {
  const wrapStyle = { width: size, height: size };

  let svg: ReactNode;
  switch (visual) {
    case "wave":
    case "compare-wave":
    case "linking":
    case "intonation":
      svg = <WaveIllustration />;
      break;
    case "mouth":
      svg = <MouthIllustration />;
      break;
    case "ipa-chart":
    case "vowel-chart":
      svg = <VowelQuadrilateralIllustration />;
      break;
    case "rhythm":
    case "stress-bars":
      svg = <RhythmIllustration />;
      break;
    case "emoji-burst":
      svg = <EmojiBurstIllustration emoji={emoji} />;
      break;
    case "phoneme-grid":
    case "shadow":
    default:
      svg = <GradientOrbIllustration />;
      break;
  }

  return (
    <div
      style={wrapStyle}
      className="relative shrink-0"
      aria-hidden="true"
    >
      {svg}
    </div>
  );
}

/* ─── Shared SVG primitives ─── */

const VIEWBOX = "0 0 120 120";
const CENTER = 60;

/** Helper to make a motion circle scale from its own center. */
const centerOrigin = {
  transformBox: "fill-box" as const,
  transformOrigin: "center" as const,
};

/* ─── Variant 1: Wave ───
 * Concentric circles pulsing outward — sound wave metaphor. */
function WaveIllustration() {
  const rings = [0, 1, 2, 3];
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="ii-wave-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--c2)" />
          <stop offset="60%" stopColor="var(--p)" />
          <stop offset="100%" stopColor="var(--p2)" />
        </radialGradient>
      </defs>

      {/* Pulsing concentric rings */}
      {rings.map((i) => (
        <motion.circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={12}
          fill="none"
          stroke="var(--c)"
          strokeWidth={2}
          style={centerOrigin}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 2.6], opacity: [0, 0.7, 0] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Glow halo */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={20}
        fill="url(#ii-wave-core)"
        opacity={0.5}
        style={centerOrigin}
        animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.65, 0.45] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core dot */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={9}
        fill="url(#ii-wave-core)"
        style={centerOrigin}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Decorative frequency tick marks positioned around the wave */}
      {[
        { x1: 60, y1: 14, x2: 60, y2: 20 },
        { x1: 106, y1: 60, x2: 100, y2: 60 },
        { x1: 60, y1: 106, x2: 60, y2: 100 },
        { x1: 14, y1: 60, x2: 20, y2: 60 },
      ].map((ln, i) => (
        <motion.line
          key={i}
          x1={ln.x1}
          y1={ln.y1}
          x2={ln.x2}
          y2={ln.y2}
          stroke="var(--p3)"
          strokeWidth={2}
          strokeLinecap="round"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ─── Variant 2: Mouth ───
 * Simplified mouth that opens and closes — articulation metaphor. */
function MouthIllustration() {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="ii-mouth-lip" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--p)" />
          <stop offset="50%" stopColor="var(--p2)" />
          <stop offset="100%" stopColor="var(--c)" />
        </linearGradient>
        <linearGradient id="ii-mouth-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.32)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0.18)" />
        </linearGradient>
      </defs>

      {/* Outer glow */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={48}
        fill="var(--p)"
        opacity={0.08}
        style={centerOrigin}
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Upper lip (static curve) */}
      <path
        d="M 24 56 Q 60 42 96 56 Q 60 50 24 56 Z"
        fill="url(#ii-mouth-lip)"
        opacity={0.92}
      />

      {/* Mouth opening — animated open/close */}
      <motion.path
        d="M 28 58 Q 60 70 92 58 Q 60 58 28 58 Z"
        fill="url(#ii-mouth-fill)"
        stroke="var(--p2)"
        strokeWidth={1.2}
        strokeOpacity={0.5}
        animate={{
          d: [
            "M 28 58 Q 60 70 92 58 Q 60 58 28 58 Z",
            "M 28 58 Q 60 92 92 58 Q 60 74 28 58 Z",
            "M 28 58 Q 60 70 92 58 Q 60 58 28 58 Z",
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Tongue hint (small bump in mouth opening) */}
      <motion.ellipse
        cx={CENTER}
        cy={70}
        rx={18}
        ry={4}
        fill="var(--c2)"
        opacity={0.55}
        animate={{ cy: [70, 78, 70], ry: [4, 6, 4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Lower lip (animated — moves down when mouth opens) */}
      <motion.path
        d="M 24 58 Q 60 64 96 58 Q 60 78 24 58 Z"
        fill="url(#ii-mouth-lip)"
        opacity={0.92}
        animate={{
          d: [
            "M 24 58 Q 60 64 96 58 Q 60 78 24 58 Z",
            "M 24 58 Q 60 70 96 58 Q 60 92 24 58 Z",
            "M 24 58 Q 60 64 96 58 Q 60 78 24 58 Z",
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Sound particles emerging when mouth "opens" */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={CENTER - 18 + i * 18}
          cy={36}
          r={2.5}
          fill="var(--c2)"
          animate={{
            y: [0, -16],
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: 0.3 + i * 0.25,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  );
}

/* ─── Variant 3: Vowel quadrilateral ───
 * Classic IPA trapezoid with dots orbiting inside. */
function VowelQuadrilateralIllustration() {
  // Trapezoid corners (front-left, front-right, back-right, back-left)
  const corners = [
    { x: 20, y: 28 },
    { x: 100, y: 28 },
    { x: 100, y: 78 },
    { x: 20, y: 92 },
  ];
  const trapPts = corners.map((c) => `${c.x},${c.y}`).join(" ");

  // Dots that wander inside the trapezoid
  const dots = [
    { from: { x: 30, y: 38 }, to: { x: 50, y: 60 }, color: "var(--c)" },
    { from: { x: 80, y: 38 }, to: { x: 90, y: 70 }, color: "var(--p)" },
    { from: { x: 60, y: 70 }, to: { x: 35, y: 80 }, color: "var(--p2)" },
    { from: { x: 90, y: 60 }, to: { x: 60, y: 50 }, color: "var(--c2)" },
  ];

  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="ii-vowel-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.15)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0.10)" />
        </linearGradient>
      </defs>

      {/* Outer glow */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={50}
        fill="var(--p)"
        opacity={0.06}
        style={centerOrigin}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Trapezoid fill */}
      <polygon
        points={trapPts}
        fill="url(#ii-vowel-fill)"
        stroke="var(--p3)"
        strokeWidth={1.5}
        strokeOpacity={0.7}
      />

      {/* Axis labels */}
      <text x={18} y={22} fontSize={7} fill="var(--t3)" fontFamily="monospace">
        front
      </text>
      <text x={86} y={22} fontSize={7} fill="var(--t3)" fontFamily="monospace">
        back
      </text>
      <text x={4} y={32} fontSize={7} fill="var(--t3)" fontFamily="monospace">
        high
      </text>
      <text x={6} y={92} fontSize={7} fill="var(--t3)" fontFamily="monospace">
        low
      </text>

      {/* Animated dots inside the trapezoid */}
      {dots.map((d, i) => (
        <motion.g key={i}>
          {/* Pulse ring */}
          <motion.circle
            cx={d.from.x}
            cy={d.from.y}
            r={5}
            fill="none"
            stroke={d.color}
            strokeWidth={1.2}
            animate={{
              cx: [d.from.x, d.to.x, d.from.x],
              cy: [d.from.y, d.to.y, d.from.y],
              r: [4, 9, 4],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
          {/* Core dot */}
          <motion.circle
            cx={d.from.x}
            cy={d.from.y}
            r={3.5}
            fill={d.color}
            animate={{
              cx: [d.from.x, d.to.x, d.from.x],
              cy: [d.from.y, d.to.y, d.from.y],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

/* ─── Variant 4: Rhythm ───
 * Four beats pulsing in sequence — metronome / rhythm metaphor. */
function RhythmIllustration() {
  const beats = [
    { x: 24, heavy: true },
    { x: 48, heavy: false },
    { x: 72, heavy: false },
    { x: 96, heavy: true },
  ];
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="ii-rhythm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--c2)" />
          <stop offset="100%" stopColor="var(--p)" />
        </radialGradient>
      </defs>

      {/* Baseline */}
      <line
        x1={14}
        y1={90}
        x2={106}
        y2={90}
        stroke="var(--border2)"
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />

      {/* Beat circles */}
      {beats.map((b, i) => (
        <motion.g key={i}>
          {/* Outer pulse ring */}
          <motion.circle
            cx={b.x}
            cy={90}
            r={b.heavy ? 14 : 10}
            fill="none"
            stroke={b.heavy ? "var(--c)" : "var(--p3)"}
            strokeWidth={1.5}
            style={centerOrigin}
            animate={{ scale: [0.6, 1.6], opacity: [0.8, 0] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeOut",
            }}
          />
          {/* Glow */}
          <motion.circle
            cx={b.x}
            cy={90}
            r={b.heavy ? 11 : 7}
            fill="url(#ii-rhythm-glow)"
            opacity={0.45}
            style={centerOrigin}
            animate={{
              scale: [0.8, b.heavy ? 1.4 : 1.15, 0.8],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
          {/* Core */}
          <motion.circle
            cx={b.x}
            cy={90}
            r={b.heavy ? 6 : 4}
            fill={b.heavy ? "var(--c2)" : "var(--p3)"}
            style={centerOrigin}
            animate={{
              scale: [1, b.heavy ? 1.5 : 1.2, 1],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          />
        </motion.g>
      ))}

      {/* Metronome sweep line — pivots at the bottom (60, 90) */}
      <motion.line
        x1={CENTER}
        y1={20}
        x2={CENTER}
        y2={90}
        stroke="var(--c2)"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.6}
        style={{ transformOrigin: "60px 90px" }}
        animate={{ rotate: [-32, 32, -32] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Apex pivot */}
      <circle cx={CENTER} cy={20} r={3} fill="var(--p2)" />
    </svg>
  );
}

/* ─── Variant 5: Emoji burst ───
 * Particles flying outward from a central sparkle. */
function EmojiBurstIllustration({ emoji }: { emoji?: string }) {
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      x: Math.cos(angle) * 38,
      y: Math.sin(angle) * 38,
      color: i % 2 === 0 ? "var(--c)" : "var(--p2)",
      delay: i * 0.06,
    };
  });

  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="ii-burst-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--c2)" />
          <stop offset="50%" stopColor="var(--p2)" />
          <stop offset="100%" stopColor="var(--p)" />
        </radialGradient>
      </defs>

      {/* Outer pulse */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={42}
        fill="none"
        stroke="var(--p2)"
        strokeWidth={1.5}
        style={centerOrigin}
        animate={{ scale: [0.6, 1.3], opacity: [0.7, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={3}
          fill={p.color}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: [0, p.x],
            y: [0, p.y],
            opacity: [0, 1, 0],
            scale: [0.4, 1.1, 0.3],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Central core */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={16}
        fill="url(#ii-burst-core)"
        style={centerOrigin}
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center emoji or sparkle */}
      {emoji ? (
        <motion.text
          x={CENTER}
          y={CENTER + 7}
          textAnchor="middle"
          fontSize={20}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={centerOrigin}
        >
          {emoji}
        </motion.text>
      ) : (
        <motion.path
          d="M 60 50 L 62 58 L 70 60 L 62 62 L 60 70 L 58 62 L 50 60 L 58 58 Z"
          fill="white"
          style={centerOrigin}
          animate={{ rotate: [0, 90], scale: [1, 1.15, 1] }}
          transition={{
            rotate: { duration: 6, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      )}
    </svg>
  );
}

/* ─── Variant 6 (default): Gradient orb ───
 * Generic pulsing orb with rotating glow ring. */
function GradientOrbIllustration() {
  return (
    <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="ii-orb-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--c2)" />
          <stop offset="50%" stopColor="var(--p2)" />
          <stop offset="100%" stopColor="var(--p)" />
        </radialGradient>
        <linearGradient id="ii-orb-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--c)" stopOpacity={0.9} />
          <stop offset="50%" stopColor="var(--p2)" stopOpacity={0.4} />
          <stop offset="100%" stopColor="var(--p)" stopOpacity={0.9} />
        </linearGradient>
      </defs>

      {/* Rotating glow ring */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={42}
        fill="none"
        stroke="url(#ii-orb-ring)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="60 200"
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />

      {/* Pulse halo */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={36}
        fill="var(--p)"
        opacity={0.18}
        style={centerOrigin}
        animate={{ scale: [1, 1.2, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core orb */}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={22}
        fill="url(#ii-orb-core)"
        style={centerOrigin}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Center sparkle */}
      <motion.path
        d="M 60 48 L 62 58 L 72 60 L 62 62 L 60 72 L 58 62 L 48 60 L 58 58 Z"
        fill="white"
        opacity={0.92}
        style={centerOrigin}
        animate={{ rotate: [0, 90], scale: [0.9, 1.1, 0.9] }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      />
    </svg>
  );
}
