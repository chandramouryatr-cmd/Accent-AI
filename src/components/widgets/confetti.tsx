"use client";

import { useEffect, useMemo, useState } from "react";

interface Props {
  count?: number;
  duration?: number; // ms
}

// Confetti burst — pure CSS animation, no deps.
const COLORS = ["#6366f1", "#8b5cf6", "#22d3ee", "#10b981", "#f59e0b", "#ec4899", "#a78bfa"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
}

export function Confetti({ count = 80, duration = 3000 }: Props) {
  // Pieces are derived purely from props (no setState needed).
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 600,
        duration: duration + Math.random() * 1500,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    [count, duration]
  );

  // Visibility flag — toggled OFF inside a setTimeout callback (allowed by
  // react-hooks/set-state-in-effect because it is not synchronous in the
  // effect body).
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration + 1500);
    return () => clearTimeout(t);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}ms linear ${p.delay}ms forwards`,
          }}
        />
      ))}
    </div>
  );
}
