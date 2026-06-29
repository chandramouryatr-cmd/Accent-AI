"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS } from "@/lib/lessons";

// ─── Chart geometry ────────────────────────────────────────────────────────
const W = 320; // SVG viewBox width
const H = 130; // SVG viewBox height
const PAD_X = 14;
const PAD_TOP = 14;
const PAD_BOTTOM = 22;
const MAX_SESSIONS = 20;

interface Pt {
  x: number;
  y: number;
  score: number;
  date: string;
  label: string;
  lessonTitle: string;
}

interface HistoryEntry {
  date: string;
  score: number;
  lessonId: string;
}

/**
 * Build a smooth SVG path through `points` using quadratic bezier segments
 * between consecutive midpoints. Each data point acts as a control handle
 * for its surrounding segments, producing a natural-looking curve.
 */
function buildSmoothPath(points: Pt[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    // Quadratic curve: control point = prev data point, end = midpoint.
    parts.push(`Q ${prev.x} ${prev.y} ${midX} ${midY}`);
  }
  // Close the gap from the last midpoint to the final data point.
  const last = points[points.length - 1];
  parts.push(`L ${last.x} ${last.y}`);
  return parts.join(" ");
}

function scoreColor(s: number): string {
  if (s >= 80) return "#10b981";
  if (s >= 70) return "#a78bfa";
  if (s >= 50) return "#f59e0b";
  return "#ef4444";
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-2 text-center bg-[var(--bg2)] border border-[var(--border)]">
      <div className="text-[9px] uppercase tracking-wider text-[var(--t3)] font-mono mb-0.5">
        {label}
      </div>
      <div className="text-sm font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

/**
 * PracticeHistory — a sparkline chart of the user's practice scores over
 * their last (up to 20) sessions. Shows a smoothed line with a gradient
 * fill underneath, animated draw-on-mount, hover dots with tooltips, and
 * min/max/avg stats plus a trend indicator below.
 *
 * Shown in the Progress view.
 */
export function PracticeHistory() {
  const history = useAppStore((s) => s.history);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // `history` is stored newest-first; we want oldest → newest on the chart.
  const data: HistoryEntry[] = useMemo(
    () => history.slice(0, MAX_SESSIONS).reverse(),
    [history]
  );

  // Empty state — no practice history yet.
  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center"
      >
        <div className="text-3xl mb-2">📈</div>
        <div className="font-d text-sm font-semibold text-[var(--t1)] mb-1 flex items-center justify-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[var(--p3)]" />
          Score Trend
        </div>
        <div className="text-xs text-[var(--t3)]">
          No practice history yet — complete a lesson to see your trend!
        </div>
      </motion.div>
    );
  }

  const n = data.length;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const xStep = n > 1 ? innerW / (n - 1) : 0;

  // Map each history entry to (x, y) in viewBox space.
  const points: Pt[] = data.map((d, i) => {
    const lesson = ALL_LESSONS.find((l) => l.id === d.lessonId);
    return {
      x: PAD_X + (n > 1 ? i * xStep : innerW / 2),
      y: PAD_TOP + innerH * (1 - Math.max(0, Math.min(100, d.score)) / 100),
      score: d.score,
      date: d.date,
      label: formatDateShort(d.date),
      lessonTitle: lesson?.title || d.lessonId,
    };
  });

  const linePath = buildSmoothPath(points);
  const bottomY = PAD_TOP + innerH;
  const areaPath =
    n > 1
      ? `${linePath} L ${points[n - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
      : `M ${points[0].x} ${points[0].y} L ${points[0].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;

  // Stats
  const scores = points.map((p) => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Trend: compare the average of the first quarter to the last quarter.
  // Requires at least 4 sessions to be meaningful.
  let trend: "up" | "down" | "stable" = "stable";
  if (n >= 4) {
    const quarter = Math.max(1, Math.floor(n / 4));
    const firstAvg = scores.slice(0, quarter).reduce((a, b) => a + b, 0) / quarter;
    const lastAvg = scores.slice(-quarter).reduce((a, b) => a + b, 0) / quarter;
    const delta = lastAvg - firstAvg;
    if (delta > 5) trend = "up";
    else if (delta < -5) trend = "down";
  }

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: "#10b981",
      label: "Improving",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.32)",
      arrow: "↑",
    },
    down: {
      icon: TrendingDown,
      color: "#ef4444",
      label: "Declining",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.32)",
      arrow: "↓",
    },
    stable: {
      icon: Minus,
      color: "#a78bfa",
      label: "Stable",
      bg: "rgba(99,102,241,0.12)",
      border: "rgba(99,102,241,0.32)",
      arrow: "→",
    },
  }[trend];
  const TrendIcon = trendConfig.icon;

  // Pick 3 x-axis labels (first / middle / last) — dates by default, but
  // fall back to session indices when there are too many sessions to fit
  // readable date labels.
  const useIndexLabels = n > 12;
  const axisLabels: { pos: number; text: string }[] = [];
  if (n === 1) {
    axisLabels.push({ pos: points[0].x, text: useIndexLabels ? "1" : points[0].label });
  } else {
    axisLabels.push({
      pos: points[0].x,
      text: useIndexLabels ? "1" : points[0].label,
    });
    const mid = Math.floor((n - 1) / 2);
    axisLabels.push({
      pos: points[mid].x,
      text: useIndexLabels ? String(mid + 1) : points[mid].label,
    });
    axisLabels.push({
      pos: points[n - 1].x,
      text: useIndexLabels ? String(n) : points[n - 1].label,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-d text-base font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--p3)]" />
          <span>Score Trend</span>
        </h2>
        <span className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
          Last {n} session{n === 1 ? "" : "s"}
        </span>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto block"
          role="img"
          aria-label={`Practice score trend across ${n} session${n === 1 ? "" : "s"}, average ${avg}%`}
        >
          <defs>
            <linearGradient id="practice-history-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="practice-history-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines at 25/50/75 */}
          {[25, 50, 75].map((pct) => (
            <line
              key={pct}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_TOP + innerH * (1 - pct / 100)}
              y2={PAD_TOP + innerH * (1 - pct / 100)}
              stroke="var(--border)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
              opacity="0.6"
            />
          ))}

          {/* Y-axis min/max hints */}
          <text
            x={PAD_X - 2}
            y={PAD_TOP + 3}
            textAnchor="start"
            className="fill-[var(--t3)]"
            style={{ fontSize: "7px", fontFamily: "var(--font-mono, monospace)" }}
          >
            100
          </text>
          <text
            x={PAD_X - 2}
            y={bottomY}
            textAnchor="start"
            className="fill-[var(--t3)]"
            style={{ fontSize: "7px", fontFamily: "var(--font-mono, monospace)" }}
          >
            0
          </text>

          {/* Gradient fill below the line */}
          <motion.path
            d={areaPath}
            fill="url(#practice-history-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          />

          {/* The smooth sparkline itself — animated draw on mount */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#practice-history-stroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Hover dots — one per data point */}
          {points.map((p, i) => {
            const isHovered = hoverIdx === i;
            const c = scoreColor(p.score);
            return (
              <g key={i}>
                {/* Invisible wider hit area */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={11}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onTouchStart={() => setHoverIdx(i)}
                />
                {/* Visible dot — scales on hover */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 3}
                  fill="#fff"
                  stroke={c}
                  strokeWidth={isHovered ? 2.5 : 2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.4 + i * 0.035,
                    type: "spring",
                    stiffness: 320,
                    damping: 18,
                  }}
                  style={{ pointerEvents: "none" }}
                />
                {/* Glow on hover */}
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={9}
                    fill={c}
                    opacity={0.18}
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </g>
            );
          })}

          {/* X-axis labels (3 of them) */}
          {axisLabels.map((l, i) => (
            <text
              key={i}
              x={l.pos}
              y={H - 6}
              textAnchor={i === 0 ? "start" : i === axisLabels.length - 1 ? "end" : "middle"}
              className="fill-[var(--t3)]"
              style={{ fontSize: "8px", fontFamily: "var(--font-mono, monospace)" }}
            >
              {l.text}
            </text>
          ))}
        </svg>

        {/* Hover tooltip — HTML overlay positioned over the hovered dot */}
        {hoverIdx !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg bg-[var(--bg2)] border border-[var(--border)] shadow-lg"
            style={{
              left: `${(points[hoverIdx].x / W) * 100}%`,
              top: `${(points[hoverIdx].y / H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 10px))",
              maxWidth: "70%",
            }}
          >
            <div className="text-[9px] font-mono text-[var(--t3)] uppercase tracking-wider">
              Session {hoverIdx + 1} · {points[hoverIdx].label}
            </div>
            <div
              className="text-sm font-bold font-mono leading-tight"
              style={{ color: scoreColor(points[hoverIdx].score) }}
            >
              {points[hoverIdx].score}%
            </div>
            <div className="text-[9px] text-[var(--t3)] max-w-[140px] truncate">
              {points[hoverIdx].lessonTitle}
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats + trend */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <StatBox label="Min" value={`${min}%`} color="#ef4444" />
        <StatBox label="Max" value={`${max}%`} color="#10b981" />
        <StatBox label="Avg" value={`${avg}%`} color="#a78bfa" />
        <div
          className="rounded-xl p-2 text-center border"
          style={{ background: trendConfig.bg, borderColor: trendConfig.border }}
        >
          <div className="text-[9px] uppercase tracking-wider text-[var(--t3)] font-mono mb-0.5 flex items-center justify-center gap-1">
            <TrendIcon className="w-2.5 h-2.5" style={{ color: trendConfig.color }} />
            Trend
          </div>
          <div
            className="text-xs font-bold font-mono flex items-center justify-center gap-1"
            style={{ color: trendConfig.color }}
          >
            <span className="text-sm leading-none">{trendConfig.arrow}</span>
            <span className="truncate">{trendConfig.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
