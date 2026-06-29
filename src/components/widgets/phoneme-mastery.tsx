"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS } from "@/lib/lessons";

interface PhonemeStat {
  ph: string;
  example: string;
  avg: number;
  count: number;
  lessonId: string; // best lesson to practice this phoneme
}

// Maps phonemes → lesson IDs that train them (reused from dashboard).
// Lesson IDs follow the pattern `p<phase#>l<lesson#>` (no dash).
const PHONEME_LESSONS: Record<string, { ids: string[]; example: string }> = {
  "ð": { ids: ["p1l2", "p1l3", "p1l4"], example: "the, this, mother" },
  "θ": { ids: ["p1l2", "p1l3", "p1l4"], example: "think, three, bath" },
  "æ": { ids: ["p1l1", "p1l4", "p2l1"], example: "cat, bad, ask" },
  "ŋ": { ids: ["p1l2", "p2l1", "p2l3"], example: "sing, going, think" },
  "ɪ": { ids: ["p1l1", "p2l1", "p2l4"], example: "ship, sit, bit" },
  "ʊ": { ids: ["p1l1", "p2l1", "p2l4"], example: "book, put, good" },
  "ɜː": { ids: ["p1l1", "p2l1", "p5l2"], example: "bird, work, learn" },
  "ʒ": { ids: ["p1l2", "p2l1", "p5l3"], example: "measure, vision" },
  "ɑː": { ids: ["p1l1", "p2l1"], example: "father, car" },
  "iː": { ids: ["p1l1", "p1l4"], example: "see, sheep, eat" },
  "uː": { ids: ["p1l1", "p1l4"], example: "food, pool, two" },
  "r": { ids: ["p1l3", "p4l1"], example: "red, around, very" },
};

function levelColor(avg: number): { bg: string; bar: string; text: string; label: string } {
  if (avg >= 85) return { bg: "rgba(16,185,129,0.10)", bar: "#10b981", text: "#10b981", label: "Mastered" };
  if (avg >= 70) return { bg: "rgba(245,158,11,0.10)", bar: "#f59e0b", text: "#f59e0b", label: "Progressing" };
  return { bg: "rgba(239,68,68,0.10)", bar: "#ef4444", text: "#ef4444", label: "Needs work" };
}

/**
 * PhonemeMastery — Horizontal bars showing mastery level per phoneme,
 * sorted from weakest to strongest. Each row has a "Practice" button
 * that opens the most relevant lesson for that phoneme.
 *
 * Shown only when at least one lesson has been completed.
 */
export function PhonemeMastery() {
  const lessons = useAppStore((s) => s.lessons);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

  const stats = useMemo<PhonemeStat[]>(() => {
    const out: PhonemeStat[] = [];
    for (const [ph, { ids, example }] of Object.entries(PHONEME_LESSONS)) {
      const relevant = ids
        .map((id) => lessons[id])
        .filter((l) => l?.completed);
      if (relevant.length === 0) continue;
      const avg = Math.round(relevant.reduce((s, l) => s + l.score, 0) / relevant.length);
      // Find the most relevant lesson to practice (the one with the lowest score)
      const sortedById = [...relevant].sort((a, b) => a.score - b.score);
      const bestLessonId = ids.find((id) => lessons[id] === sortedById[0]) || ids[0];
      out.push({ ph, example, avg, count: relevant.length, lessonId: bestLessonId });
    }
    // Sort from weakest (lowest avg) to strongest
    out.sort((a, b) => a.avg - b.avg);
    return out;
  }, [lessons]);

  if (stats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] text-center"
      >
        <div className="text-3xl mb-2">🎯</div>
        <div className="font-d text-sm font-semibold text-[var(--t1)] mb-1">
          Phoneme Mastery
        </div>
        <div className="text-xs text-[var(--t3)]">
          Complete lessons to see which sounds you've mastered and which need work
        </div>
      </motion.div>
    );
  }

  // Find the overall weakest phoneme for the spotlight card
  const weakest = stats[0];
  const strongest = stats[stats.length - 1];
  const weakestColor = levelColor(weakest.avg);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-d text-base font-bold flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--p3)]" />
          <span>Phoneme Mastery</span>
        </h2>
        <span className="text-[10px] font-mono text-[var(--t3)] uppercase tracking-wider">
          {stats.length} sounds tracked
        </span>
      </div>

      {/* Spotlight: weakest phoneme recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-3 border relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${weakestColor.bg}, rgba(99,102,241,0.04))`,
          borderColor: `${weakestColor.bar}44`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-bold shrink-0"
            style={{ background: `${weakestColor.bar}22`, color: weakestColor.bar }}
          >
            {weakest.ph}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
              Focus next
            </div>
            <div className="font-d text-sm font-bold text-[var(--t1)]">
              Practice /{weakest.ph}/ — {weakestColor.label}
            </div>
            <div className="text-[10px] text-[var(--t3)] mt-0.5">
              e.g. {weakest.example} · avg {weakest.avg}%
            </div>
          </div>
          <motion.button
            onClick={() => setActiveLesson(weakest.lessonId)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${weakestColor.bar}, ${weakestColor.bar}cc)`,
              boxShadow: `0 0 14px ${weakestColor.bar}55`,
            }}
          >
            Practice →
          </motion.button>
        </div>
      </motion.div>

      {/* Phoneme bars — weakest first */}
      <div className="rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] space-y-2.5">
        {stats.map((s, i) => {
          const c = levelColor(s.avg);
          const trend =
            s.avg === weakest.avg
              ? "down"
              : s.avg === strongest.avg
              ? "up"
              : "neutral";
          return (
            <motion.div
              key={s.ph}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 text-center font-mono text-sm font-bold shrink-0"
                style={{ color: c.text }}
              >
                {s.ph}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-[var(--t3)] truncate">
                    {s.example}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold flex items-center gap-0.5"
                    style={{ color: c.text }}
                  >
                    {trend === "up" && <TrendingUp className="w-2.5 h-2.5" />}
                    {trend === "down" && <TrendingDown className="w-2.5 h-2.5" />}
                    {trend === "neutral" && <Minus className="w-2.5 h-2.5 opacity-40" />}
                    {s.avg}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--overlay-1)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.bar, boxShadow: `0 0 6px ${c.bar}55` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.avg}%` }}
                    transition={{ duration: 0.8, delay: i * 0.04 + 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <button
                onClick={() => setActiveLesson(s.lessonId)}
                className="shrink-0 text-[9px] uppercase tracking-wider font-mono text-[var(--t3)] hover:text-[var(--p3)] transition px-1.5 py-1 rounded hover:bg-[var(--card-h)]"
                aria-label={`Practice phoneme ${s.ph}`}
              >
                Train
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
