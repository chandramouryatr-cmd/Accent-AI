"use client";

import { motion } from "framer-motion";

interface Props {
  pct: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
  gradient?: boolean;
}

// Circular progress ring with animated fill + centered label.

export function ProgressRing({ pct, size = 62, stroke = 4, label, gradient = true }: Props) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = circ - (clamped / 100) * circ;

  const gradId = `ring-grad-${size}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      )}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={gradient ? `url(#${gradId})` : "#6366f1"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {label !== undefined && (
        <text
          x="50%"
          y="50%"
          dy="0.35em"
          textAnchor="middle"
          fontFamily="var(--font-mono), monospace"
          fontSize={size * 0.18}
          fontWeight="700"
          fill="var(--t1)"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
