"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Volume2,
  Check,
  X,
  RotateCcw,
  ChevronRight,
  Zap,
  Trophy,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useAppStore, type LessonProgress } from "@/lib/store";
import { speak } from "@/lib/tts";
import {
  PHONEME_DRILL_DATA,
  DRILL_ROUNDS_TOTAL,
  comboMultiplier,
  comboLevel,
  deriveMastery,
  masteryTierFromScore,
  type DrillWord,
} from "@/lib/phoneme-data";

// ─── Types ────────────────────────────────────────────────────────────────

type Phase = "setup" | "drill" | "results";

type Feedback = "none" | "correct" | "incorrect";

interface RoundState {
  target: string; // phoneme symbol
  word: string; // spoken word (correct answer)
  options: string[]; // shuffled options
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeRound(phoneme: string): RoundState {
  const entry = PHONEME_DRILL_DATA.find((p) => p.phoneme === phoneme);
  if (!entry) {
    return { target: phoneme, word: phoneme, options: [phoneme] };
  }
  const w: DrillWord = pickRandom(entry.words);
  // 2-4 options: always include the target word + 2-3 distractors
  const distractorCount = Math.min(3, w.distractors.length);
  const distractors = shuffle(w.distractors).slice(0, distractorCount);
  const options = shuffle([w.word, ...distractors]);
  return { target: phoneme, word: w.word, options };
}

function calcXP(correct: number, maxComboStreak: number, perfect: boolean): number {
  const maxMult = comboMultiplier(maxComboStreak);
  const level = comboLevel(maxMult);
  const base = 10;
  const comboBonus = level * 5;
  const perfectBonus = perfect ? 20 : 0;
  return base + comboBonus + perfectBonus;
}

// ─── Mastery Ring (SVG) ───────────────────────────────────────────────────

function MasteryRing({
  score,
  color,
  size = 56,
}: {
  score: number | null;
  color: string;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = score === null ? 0 : Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - pct / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute -top-1 -right-1"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={3}
      />
      {score !== null && (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      {score === null ? (
        <circle cx={size / 2} cy={size / 2} r={2.5} fill="rgba(255,255,255,0.18)" />
      ) : null}
    </svg>
  );
}

// ─── Phoneme Selector Grid (Setup) ────────────────────────────────────────

function PhonemeSelector({
  onPick,
  onSurprise,
}: {
  onPick: (phoneme: string) => void;
  onSurprise: () => void;
}) {
  const lessons = useAppStore((s) => s.lessons);

  // Pre-compute mastery + weakest phoneme (memoized)
  const entries = useMemo(() => {
    return PHONEME_DRILL_DATA.map((p) => {
      const score = deriveMastery(
        p.phoneme,
        lessons as Record<string, LessonProgress | undefined>
      );
      const info = masteryTierFromScore(score);
      return { phoneme: p.phoneme, example: p.example, score, info };
    });
  }, [lessons]);

  const weakest = useMemo(() => {
    const tracked = entries.filter((e) => e.score !== null);
    if (tracked.length === 0) return null;
    tracked.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return tracked[0];
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Hero */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(34,211,238,0.18))",
            border: "1px solid rgba(99,102,241,0.35)",
            boxShadow: "0 0 24px rgba(99,102,241,0.25)",
          }}
        >
          <Target className="w-6 h-6 text-[var(--p3)]" />
        </motion.div>
        <h2 className="font-d text-2xl sm:text-3xl font-bold mb-1">
          Phoneme <span className="grad-text">Drill</span>
        </h2>
        <p className="text-sm text-[var(--t2)]">
          Targeted practice for stubborn sounds
        </p>
      </div>

      {/* Surprise me */}
      <motion.button
        onClick={onSurprise}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-2xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition"
        style={{
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.95), rgba(249,115,22,0.95))",
          boxShadow: "0 0 18px rgba(245,158,11,0.35)",
        }}
      >
        <Sparkles className="w-4 h-4" />
        {weakest
          ? `Surprise me — your weakest is /${weakest.phoneme}/ (${weakest.score}%)`
          : "Surprise me — pick a random phoneme"}
      </motion.button>

      {/* Phoneme grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {entries.map((e, i) => {
          const isWeakest = weakest?.phoneme === e.phoneme;
          return (
            <motion.button
              key={e.phoneme}
              onClick={() => onPick(e.phoneme)}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.04 * i, type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition"
              style={{
                background: `linear-gradient(135deg, ${e.info.color}14, rgba(99,102,241,0.04))`,
                border: `1px solid ${e.info.color}33`,
                minHeight: 88,
              }}
              aria-label={`Drill phoneme /${e.phoneme}/${
                e.score !== null ? `, mastery ${e.score}%` : ", untracked"
              }${isWeakest ? ", your weakest" : ""}`}
            >
              <MasteryRing score={e.score} color={e.info.color} size={36} />

              {isWeakest && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, #f97316)",
                    boxShadow: "0 0 8px rgba(245,158,11,0.5)",
                  }}
                >
                  Weakest
                </motion.span>
              )}

              <div
                className="font-mono text-2xl sm:text-3xl font-bold leading-none"
                style={{ color: e.info.color }}
              >
                {e.phoneme}
              </div>
              <div className="text-[9px] sm:text-[10px] text-[var(--t3)] text-center leading-tight line-clamp-2 mt-0.5">
                {e.example}
              </div>
              {e.score !== null && (
                <div
                  className="text-[9px] font-mono font-bold mt-0.5"
                  style={{ color: e.info.color }}
                >
                  {e.score}%
                </div>
              )}
              {e.score === null && (
                <div className="text-[8px] uppercase tracking-wider text-[var(--t3)] mt-0.5">
                  untracked
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-[var(--t3)] text-center px-4">
        Tap a phoneme to start a 10-round drill. Each round: hear a word, pick the
        one you heard from minimal-pair options, build a combo.
      </p>
    </motion.div>
  );
}

// ─── Drill Header (combo, score, exit) ────────────────────────────────────

function DrillHeader({
  target,
  correct,
  total,
  streak,
  maxComboStreak,
  onChange,
  onExit,
}: {
  target: string;
  correct: number;
  total: number;
  streak: number;
  maxComboStreak: number;
  onChange: () => void;
  onExit: () => void;
}) {
  const mult = comboMultiplier(streak);
  const maxMult = comboMultiplier(maxComboStreak);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Left: target + change link */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono text-2xl font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.18))",
            border: "1px solid rgba(99,102,241,0.35)",
            color: "var(--p3)",
          }}
        >
          {target}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
            Target phoneme
          </div>
          <button
            onClick={onChange}
            className="text-xs text-[var(--t2)] hover:text-[var(--p3)] transition flex items-center gap-1"
          >
            change phoneme
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Middle: score */}
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="text-[9px] uppercase tracking-wider text-[var(--t3)] font-mono">
            Score
          </div>
          <div className="text-sm font-bold font-mono text-[var(--t1)]">
            <span className="text-[var(--p3)]">{correct}</span>
            <span className="text-[var(--t3)]">/{total}</span>
          </div>
        </div>
      </div>

      {/* Right: combo + exit */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={mult}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            style={{
              background:
                mult === 1
                  ? "var(--card)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border:
                mult === 1
                  ? "1px solid var(--border)"
                  : "1px solid rgba(139,92,246,0.5)",
              boxShadow:
                mult > 1 ? `0 0 16px rgba(139,92,246,${0.3 + mult * 0.05})` : "none",
            }}
          >
            <Zap
              className={`w-3.5 h-3.5 ${mult > 1 ? "text-white" : "text-[var(--t3)]"}`}
              fill={mult > 1 ? "currentColor" : "none"}
            />
            <span
              className={`text-sm font-bold font-mono ${
                mult > 1 ? "text-white" : "text-[var(--t2)]"
              }`}
            >
              ×{mult}
            </span>
            <span
              className={`text-[10px] font-mono ${
                mult > 1 ? "text-white/80" : "text-[var(--t3)]"
              }`}
            >
              🔥{streak}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={onExit}
          aria-label="Exit drill"
          className="w-9 h-9 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--t3)] hover:text-[var(--rd)] hover:border-[rgba(239,68,68,0.3)] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hidden max combo info for a11y */}
        <span className="sr-only">
          Max combo multiplier reached: ×{maxMult} with streak {maxComboStreak}.
        </span>
      </div>
    </div>
  );
}

// ─── Drill Round Card ─────────────────────────────────────────────────────

function RoundCard({
  round,
  total,
  roundState,
  feedback,
  selected,
  onListen,
  onSelect,
  onContinue,
  isPlaying,
}: {
  round: number;
  total: number;
  roundState: RoundState;
  feedback: Feedback;
  selected: string | null;
  onListen: () => void;
  onSelect: (opt: string) => void;
  onContinue: () => void;
  isPlaying: boolean;
}) {
  const progressPct = ((round + (feedback !== "none" ? 1 : 0)) / total) * 100;
  const answered = feedback !== "none";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background:
          feedback === "correct"
            ? "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(34,211,238,0.08))"
            : feedback === "incorrect"
            ? "linear-gradient(135deg, rgba(239,68,68,0.16), rgba(245,158,11,0.08))"
            : "var(--card)",
        border:
          feedback === "correct"
            ? "1px solid rgba(16,185,129,0.4)"
            : feedback === "incorrect"
            ? "1px solid rgba(239,68,68,0.4)"
            : "1px solid transparent",
        backgroundImage:
          feedback === "none"
            ? "linear-gradient(var(--card), var(--card)), linear-gradient(135deg, rgba(99,102,241,0.4), rgba(34,211,238,0.3))"
            : undefined,
        backgroundOrigin:
          feedback === "none" ? "border-box" : undefined,
        backgroundClip:
          feedback === "none" ? "padding-box, border-box" : undefined,
        boxShadow:
          feedback === "correct"
            ? "0 0 24px rgba(16,185,129,0.18)"
            : feedback === "incorrect"
            ? "0 0 24px rgba(239,68,68,0.18)"
            : "0 4px 32px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Round meta + progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
          Round {Math.min(round + 1, total)} / {total}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
          /{roundState.target}/ drill
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[var(--overlay-1)] overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--p), var(--p2), var(--c))",
            boxShadow: "0 0 8px rgba(99,102,241,0.4)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Listen button */}
      <motion.button
        onClick={onListen}
        disabled={answered}
        whileHover={{ scale: answered ? 1 : 1.02 }}
        whileTap={{ scale: answered ? 1 : 0.98 }}
        className="w-full py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition mb-5 disabled:opacity-60"
        style={{
          background: isPlaying
            ? "linear-gradient(135deg, #8b5cf6, #22d3ee)"
            : "var(--grad-btn)",
          boxShadow: isPlaying
            ? "0 0 24px rgba(139,92,246,0.45)"
            : "0 0 14px rgba(99,102,241,0.3)",
        }}
        aria-label="Play the word and listen"
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 animate-pulse" />
            Playing…
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4" />
            Listen
          </>
        )}
      </motion.button>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {roundState.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === roundState.word;
          const showCorrect = answered && isCorrectAnswer;
          const showWrong = answered && isSelected && !isCorrectAnswer;

          let bg = "var(--card-h)";
          let border = "1px solid var(--border)";
          let textColor = "var(--t1)";
          let icon: React.ReactNode = null;

          if (answered) {
            if (showCorrect) {
              bg = "linear-gradient(135deg, rgba(16,185,129,0.22), rgba(16,185,129,0.12))";
              border = "1px solid rgba(16,185,129,0.55)";
              textColor = "#10b981";
              icon = <Check className="w-4 h-4" />;
            } else if (showWrong) {
              bg = "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.12))";
              border = "1px solid rgba(239,68,68,0.55)";
              textColor = "#ef4444";
              icon = <X className="w-4 h-4" />;
            } else {
              bg = "var(--card)";
              border = "1px solid var(--border)";
              textColor = "var(--t3)";
            }
          }

          return (
            <motion.button
              key={opt}
              onClick={() => !answered && onSelect(opt)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.02, y: -1 } : {}}
              whileTap={!answered ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative px-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-between gap-2 transition min-h-[52px]"
              style={{
                background: bg,
                border,
                color: textColor,
              }}
            >
              <span className="font-d">{opt}</span>
              {icon && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className="shrink-0"
                >
                  {icon}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback / continue */}
      <AnimatePresence mode="wait">
        {feedback === "correct" && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981]">
              <Check className="w-4 h-4" />
              Correct! Next word…
            </div>
            <div className="text-[10px] font-mono text-[#10b981]/80">
              auto-advance
            </div>
          </motion.div>
        )}
        {feedback === "incorrect" && (
          <motion.div
            key="incorrect"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-[#ef4444]">
              <X className="w-4 h-4" />
              Not quite — the word was{" "}
              <span className="font-d font-bold text-[var(--t1)]">
                “{roundState.word}”
              </span>
            </div>
            <motion.button
              onClick={onContinue}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              Tap to continue →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-listen hint after answering */}
      {answered && (
        <motion.button
          onClick={onListen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 w-full text-xs text-[var(--t3)] hover:text-[var(--p3)] transition flex items-center justify-center gap-1.5"
        >
          <Volume2 className="w-3 h-3" />
          Hear it again
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────

function ResultsScreen({
  correct,
  total,
  maxComboStreak,
  xp,
  onAgain,
  onDifferent,
  onDone,
}: {
  correct: number;
  total: number;
  maxComboStreak: number;
  xp: number;
  onAgain: () => void;
  onDifferent: () => void;
  onDone: () => void;
}) {
  const perfect = correct === total;
  const pct = Math.round((correct / total) * 100);
  const maxMult = comboMultiplier(maxComboStreak);

  const headline = perfect
    ? "Flawless run! 🎉"
    : pct >= 70
    ? "Solid drill! 💪"
    : pct >= 40
    ? "Keep at it 🔁"
    : "Tough one — try again!";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="relative rounded-2xl p-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.10), rgba(34,211,238,0.06))",
        border: "1px solid rgba(99,102,241,0.3)",
        boxShadow: "0 0 40px rgba(99,102,241,0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Confetti for perfect */}
      {perfect && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: [
                  "#f59e0b",
                  "#22d3ee",
                  "#a78bfa",
                  "#10b981",
                  "#6366f1",
                  "#ef4444",
                  "#8b5cf6",
                  "#67e8f9",
                  "#f472b6",
                  "#facc15",
                ][i],
                top: "10%",
                left: `${10 + (i * 8)}%`,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: [0, 380 + (i % 3) * 30],
                opacity: [1, 1, 0],
                rotate: [0, 180, 360],
                x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 4)],
              }}
              transition={{
                duration: 1.4 + (i % 3) * 0.3,
                ease: "easeOut",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative text-center">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3"
          style={{
            background: perfect
              ? "linear-gradient(135deg, #f59e0b, #f97316)"
              : "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.25))",
            boxShadow: perfect
              ? "0 0 32px rgba(245,158,11,0.45)"
              : "0 0 20px rgba(99,102,241,0.3)",
          }}
        >
          <Trophy
            className={`w-8 h-8 ${perfect ? "text-white" : "text-[var(--p3)]"}`}
            fill={perfect ? "currentColor" : "none"}
          />
        </motion.div>

        <h3 className="font-d text-2xl font-bold mb-1">{headline}</h3>
        <p className="text-xs text-[var(--t3)] mb-5">Drill complete</p>

        {/* Big score */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.2 }}
          className="mb-5"
        >
          <div className="font-d text-5xl font-bold">
            <span
              style={{
                color: perfect ? "#10b981" : pct >= 70 ? "#a78bfa" : "#f59e0b",
              }}
            >
              {correct}
            </span>
            <span className="text-[var(--t3)] text-3xl">/{total}</span>
          </div>
          <div className="text-xs text-[var(--t3)] mt-1 font-mono">{pct}% accuracy</div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="text-[9px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
              Max combo
            </div>
            <div className="flex items-baseline gap-1">
              <Zap
                className="w-3.5 h-3.5 text-[var(--p3)]"
                fill={maxMult > 1 ? "currentColor" : "none"}
              />
              <span className="font-d text-xl font-bold text-[var(--t1)]">
                ×{maxMult}
              </span>
              <span className="text-[10px] text-[var(--t3)] font-mono">
                · 🔥{maxComboStreak}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.12))",
              border: "1px solid rgba(99,102,241,0.35)",
            }}
          >
            <div className="text-[9px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
              XP earned
            </div>
            <div className="flex items-baseline gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--c)]" />
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 14 }}
                className="font-d text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #22d3ee)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                +{xp}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* XP breakdown */}
        <div className="text-[10px] text-[var(--t3)] font-mono mb-5 leading-relaxed">
          10 base + {comboLevel(maxMult) * 5} combo bonus
          {perfect ? " + 20 perfect bonus" : ""}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <motion.button
            onClick={onAgain}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: "var(--grad-btn)",
              boxShadow: "0 0 16px rgba(99,102,241,0.35)",
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Drill again
          </motion.button>
          <div className="grid grid-cols-2 gap-2.5">
            <motion.button
              onClick={onDifferent}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)] hover:bg-[var(--card)] transition flex items-center justify-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              Try different
            </motion.button>
            <motion.button
              onClick={onDone}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)] hover:bg-[var(--card)] transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Done
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export function PhonemeDrill({ onDone }: { onDone?: () => void }) {
  const accent = useAppStore((s) => s.accent);
  const addXP = useAppStore((s) => s.addXP);

  const [phase, setPhase] = useState<Phase>("setup");
  const [target, setTarget] = useState<string>("");
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxComboStreak, setMaxComboStreak] = useState(0);
  const [roundState, setRoundState] = useState<RoundState | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [awardedXP, setAwardedXP] = useState(0);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build the first round whenever we enter the drill phase (target set).
  const startDrill = useCallback((phoneme: string) => {
    setTarget(phoneme);
    setRound(0);
    setCorrect(0);
    setStreak(0);
    setMaxComboStreak(0);
    setSelected(null);
    setFeedback("none");
    setAwardedXP(0);
    setRoundState(makeRound(phoneme));
    setPhase("drill");
  }, []);

  const clearAutoAdvance = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAutoAdvance();
  }, []);

  const handleListen = useCallback(() => {
    if (!roundState) return;
    setIsPlaying(true);
    speak(roundState.word, {
      accent,
      rate: 0.95,
      onEnd: () => setIsPlaying(false),
    });
  }, [roundState, accent]);

  // Finish the drill — compute XP and transition to results screen.
  // Declared as a useCallback before handleSelect/handleContinue so the
  // `react-hooks/immutability` lint rule is satisfied (no use-before-define).
  const finishDrill = useCallback(
    (finalCorrect: number, finalMaxStreak: number) => {
      const perfect = finalCorrect === DRILL_ROUNDS_TOTAL;
      const xp = calcXP(finalCorrect, finalMaxStreak, perfect);
      setAwardedXP(xp);
      addXP(xp, "phoneme-drill");
      setPhase("results");
    },
    [addXP]
  );

  const handleSelect = useCallback(
    (opt: string) => {
      if (!roundState || feedback !== "none") return;
      setSelected(opt);
      const isCorrect = opt === roundState.word;

      if (isCorrect) {
        setFeedback("correct");
        const newCorrect = correct + 1;
        const newStreak = streak + 1;
        const newMaxCombo = Math.max(maxComboStreak, newStreak);
        setCorrect(newCorrect);
        setStreak(newStreak);
        setMaxComboStreak(newMaxCombo);

        // Auto-advance after 800ms (unless this is the final round)
        const isLastRound = round + 1 >= DRILL_ROUNDS_TOTAL;
        if (!isLastRound) {
          clearAutoAdvance();
          autoAdvanceTimer.current = setTimeout(() => {
            const nextRound = round + 1;
            setRound(nextRound);
            setRoundState(makeRound(target));
            setSelected(null);
            setFeedback("none");
            autoAdvanceTimer.current = null;
          }, 800);
        } else {
          // Schedule results screen after the same delay
          clearAutoAdvance();
          autoAdvanceTimer.current = setTimeout(() => {
            finishDrill(newCorrect, newMaxCombo);
            autoAdvanceTimer.current = null;
          }, 800);
        }
      } else {
        setFeedback("incorrect");
        setStreak(0);
      }
    },
    [roundState, feedback, correct, streak, maxComboStreak, round, target, finishDrill]
  );

  const handleContinue = useCallback(() => {
    // Manual continue after incorrect — go to next round or finish
    const isLastRound = round + 1 >= DRILL_ROUNDS_TOTAL;
    if (!isLastRound) {
      const nextRound = round + 1;
      setRound(nextRound);
      setRoundState(makeRound(target));
      setSelected(null);
      setFeedback("none");
    } else {
      finishDrill(correct, maxComboStreak);
    }
  }, [round, target, correct, maxComboStreak, finishDrill]);

  const handleSurprise = useCallback(() => {
    const lessons = useAppStore.getState().lessons;
    // Build (phoneme, score) pairs from PHONEME_DRILL_DATA using mastery derivation.
    const tracked = PHONEME_DRILL_DATA.map((p) => ({
      phoneme: p.phoneme,
      score: deriveMastery(
        p.phoneme,
        lessons as Record<string, LessonProgress | undefined>
      ),
    })).filter((e) => e.score !== null) as { phoneme: string; score: number }[];

    let pick: string;
    if (tracked.length > 0) {
      tracked.sort((a, b) => a.score - b.score);
      // Pick the weakest (with a tiny randomization among ties)
      const weakestScore = tracked[0].score;
      const tied = tracked.filter((e) => e.score === weakestScore);
      pick = tied[Math.floor(Math.random() * tied.length)].phoneme;
    } else {
      pick = pickRandom(PHONEME_DRILL_DATA).phoneme;
    }
    startDrill(pick);
  }, [startDrill]);

  const handleAgain = useCallback(() => {
    if (target) startDrill(target);
  }, [target, startDrill]);

  const handleDifferent = useCallback(() => {
    clearAutoAdvance();
    setPhase("setup");
    setRoundState(null);
    setSelected(null);
    setFeedback("none");
  }, []);

  const handleDone = useCallback(() => {
    clearAutoAdvance();
    setPhase("setup");
    setRoundState(null);
    setSelected(null);
    setFeedback("none");
    setTarget("");
    onDone?.();
  }, [onDone]);

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <PhonemeSelector
            key="setup"
            onPick={(ph) => startDrill(ph)}
            onSurprise={handleSurprise}
          />
        )}

        {phase === "drill" && roundState && (
          <motion.div
            key="drill"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <DrillHeader
              target={target}
              correct={correct}
              total={Math.min(round + 1, DRILL_ROUNDS_TOTAL)}
              streak={streak}
              maxComboStreak={maxComboStreak}
              onChange={handleDifferent}
              onExit={handleDone}
            />
            <RoundCard
              round={round}
              total={DRILL_ROUNDS_TOTAL}
              roundState={roundState}
              feedback={feedback}
              selected={selected}
              onListen={handleListen}
              onSelect={handleSelect}
              onContinue={handleContinue}
              isPlaying={isPlaying}
            />
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ResultsScreen
              correct={correct}
              total={DRILL_ROUNDS_TOTAL}
              maxComboStreak={maxComboStreak}
              xp={awardedXP}
              onAgain={handleAgain}
              onDifferent={handleDifferent}
              onDone={handleDone}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhonemeDrill;
