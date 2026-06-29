"use client";

import { motion } from "framer-motion";
import type { Lesson, LessonDifficulty } from "@/lib/types";
import { getLessonDifficulty } from "@/lib/types";

const CONFIG: Record<
  LessonDifficulty,
  { label: string; bg: string; color: string; border: string; dot: string }
> = {
  easy: {
    label: "Easy",
    bg: "rgba(16,185,129,0.12)",
    color: "#10b981",
    border: "rgba(16,185,129,0.32)",
    dot: "#10b981",
  },
  medium: {
    label: "Medium",
    bg: "rgba(245,158,11,0.12)",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.32)",
    dot: "#f59e0b",
  },
  hard: {
    label: "Hard",
    bg: "rgba(239,68,68,0.12)",
    color: "#ef4444",
    border: "rgba(239,68,68,0.32)",
    dot: "#ef4444",
  },
};

interface Props {
  lesson: Pick<Lesson, "phaseId" | "lessonIndex" | "difficulty">;
  size?: "xs" | "sm" | "md";
  /** When true, disables the spring-in animation (useful inside lists that already animate). */
  animate?: boolean;
}

/**
 * DifficultyBadge — a small pill that shows a lesson's difficulty
 * (Easy / Medium / Hard) with a matching colored dot. The difficulty is
 * derived from the lesson's phaseId + lessonIndex via `getLessonDifficulty`
 * unless an explicit `difficulty` is set on the lesson.
 */
export function DifficultyBadge({ lesson, size = "sm", animate = true }: Props) {
  const difficulty = lesson.difficulty ?? getLessonDifficulty(lesson);
  const cfg = CONFIG[difficulty];

  const sizeClasses =
    size === "xs"
      ? "text-[8px] px-1.5 py-0.5 gap-0.5"
      : size === "sm"
      ? "text-[9px] px-1.5 py-0.5 gap-1"
      : "text-[11px] px-2 py-1 gap-1.5";

  const dotSize =
    size === "xs" ? "w-1 h-1" : size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  const content = (
    <>
      <span
        className={`${dotSize} rounded-full shrink-0`}
        style={{ background: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}aa` }}
        aria-hidden="true"
      />
      <span className="font-bold uppercase tracking-wider leading-none">
        {cfg.label}
      </span>
    </>
  );

  if (!animate) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-mono ${sizeClasses}`}
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        aria-label={`Difficulty: ${cfg.label}`}
        role="status"
      >
        {content}
      </span>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={`inline-flex items-center rounded-full font-mono ${sizeClasses}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
      aria-label={`Difficulty: ${cfg.label}`}
      role="status"
    >
      {content}
    </motion.span>
  );
}
