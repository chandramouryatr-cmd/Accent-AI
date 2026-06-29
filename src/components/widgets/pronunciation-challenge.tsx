"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RotateCcw, Trophy, Volume2, Target, Ear } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { speak } from "@/lib/tts";
import {
  CHALLENGE_CONFIG,
  generateMinimalPairRound,
  generateStressRound,
  generateDiscriminationRound,
  type ChallengeType,
} from "@/lib/challenge-data";

// ─── Types ─────────────────────────────────────────────────────────────────

type Phase = "menu" | "playing" | "result";

interface RoundState {
  round: number;
  timeLeft: number;
  combo: number;
  maxCombo: number;
  score: number;
  correct: number;
  wrong: number;
  answered: boolean;
  feedback: "correct" | "wrong" | null;
}

interface MinimalPairRound {
  type: "minimal-pair";
  pair: ReturnType<typeof generateMinimalPairRound>;
}

interface StressRound {
  type: "speed-stress";
  data: ReturnType<typeof generateStressRound>;
}

interface DiscriminationRound {
  type: "sound-discrimination";
  data: ReturnType<typeof generateDiscriminationRound>;
}

type GameRound = MinimalPairRound | StressRound | DiscriminationRound;

// ─── Timer Ring Component ──────────────────────────────────────────────────

function TimerRing({ timeLeft, maxTime }: { timeLeft: number; maxTime: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / maxTime;
  const dashOffset = circumference * (1 - progress);

  const color =
    timeLeft <= 1.5 ? "#ef4444" : timeLeft <= 3 ? "#f59e0b" : "#22d3ee";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96">
        {/* Background ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="5"
        />
        {/* Progress ring */}
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: dashOffset, stroke: color }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      <motion.span
        key={Math.ceil(timeLeft)}
        className="relative font-mono text-2xl font-bold"
        style={{ color }}
        initial={{ scale: 1.2, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {Math.ceil(timeLeft)}
      </motion.span>
    </div>
  );
}

// ─── Combo Badge ───────────────────────────────────────────────────────────

function ComboBadge({ combo }: { combo: number }) {
  if (combo <= 1) return null;

  const colors: Record<number, string> = {
    2: "#22d3ee",
    3: "#f59e0b",
    4: "#ef4444",
  };
  const color = colors[combo] ?? "#ef4444";

  return (
    <motion.div
      key={combo}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="absolute -top-3 -right-3 px-2.5 py-1 rounded-full font-mono font-bold text-xs text-white"
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        boxShadow: `0 0 16px ${color}60`,
      }}
    >
      ×{combo}
    </motion.div>
  );
}

// ─── Flash Feedback ────────────────────────────────────────────────────────

function FlashFeedback({ type }: { type: "correct" | "wrong" }) {
  return (
    <motion.div
      initial={{ opacity: 0.8, scale: 1 }}
      animate={{ opacity: 0, scale: 1.3 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        background:
          type === "correct"
            ? "radial-gradient(circle, rgba(16,185,129,0.3), transparent 70%)"
            : "radial-gradient(circle, rgba(239,68,68,0.3), transparent 70%)",
      }}
    />
  );
}

// ─── Challenge Menu ────────────────────────────────────────────────────────

function ChallengeMenu({
  highScore,
  onStart,
}: {
  highScore: number;
  onStart: (type: ChallengeType) => void;
}) {
  const challenges: {
    type: ChallengeType;
    icon: React.ReactNode;
    title: string;
    desc: string;
    gradient: string;
    borderColor: string;
  }[] = [
    {
      type: "minimal-pair",
      icon: <Target className="w-6 h-6" />,
      title: "Minimal Pair Blitz",
      desc: "Hear a word, tap the correct phoneme",
      gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      borderColor: "rgba(99,102,241,0.4)",
    },
    {
      type: "speed-stress",
      icon: <Zap className="w-6 h-6" />,
      title: "Speed Stress",
      desc: "Tap the stressed syllable — fast!",
      gradient: "linear-gradient(135deg, #f59e0b, #f97316)",
      borderColor: "rgba(245,158,11,0.4)",
    },
    {
      type: "sound-discrimination",
      icon: <Ear className="w-6 h-6" />,
      title: "Sound Discrimination",
      desc: "Same or different? Listen closely",
      gradient: "linear-gradient(135deg, #22d3ee, #06b6d4)",
      borderColor: "rgba(34,211,238,0.4)",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] mb-3"
        >
          <Zap className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-sm font-bold text-[#f59e0b]">Challenge Mode</span>
        </motion.div>
        <h2 className="font-d text-2xl font-bold mb-1">
          Pronunciation <span className="grad-text">Challenge</span>
        </h2>
        <p className="text-sm text-[var(--t2)]">
          10 rounds · 5 seconds each · Build combos!
        </p>
      </div>

      {/* High Score */}
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.2)]"
        >
          <Trophy className="w-4 h-4 text-[#a78bfa]" />
          <span className="text-xs text-[var(--t2)]">High Score:</span>
          <span className="font-mono font-bold text-[#a78bfa]">{highScore}</span>
        </motion.div>
      )}

      {/* Challenge Cards */}
      <div className="space-y-3">
        {challenges.map((c, i) => (
          <motion.button
            key={c.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onStart(c.type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full relative rounded-2xl p-4 text-left overflow-hidden group"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: `1px solid ${c.borderColor}`,
            }}
          >
            {/* Mesh gradient orb */}
            <motion.div
              aria-hidden
              className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-40"
              style={{
                background: `radial-gradient(circle, ${c.borderColor}, transparent 70%)`,
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ background: c.gradient }}
              >
                {c.icon}
              </div>
              <div>
                <div className="font-d font-bold text-[var(--t1)] text-sm">
                  {c.title}
                </div>
                <div className="text-xs text-[var(--t2)] mt-0.5">
                  {c.desc}
                </div>
              </div>
              <motion.div
                className="ml-auto text-[var(--t3)] group-hover:text-[var(--t1)] transition-colors"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-xl p-3 bg-[rgba(99,102,241,0.05)] border border-[var(--border)] text-[10px] text-[var(--t3)] space-y-1">
        <div className="font-semibold text-[var(--t2)] text-xs mb-1">How it works</div>
        <div>• Answer correctly to build your combo (×1 → ×2 → ×3 → ×4)</div>
        <div>• Wrong answers reset your combo to ×1</div>
        <div>• Points = 10 × combo multiplier per correct answer</div>
        <div>• Answer fast for time bonus points!</div>
      </div>
    </div>
  );
}

// ─── Minimal Pair Round UI ────────────────────────────────────────────────

function MinimalPairRoundUI({
  round,
  onAnswer,
  accent,
}: {
  round: MinimalPairRound;
  onAnswer: (correct: boolean) => void;
  accent: "usa" | "uk";
}) {
  const { pair } = round.pair;

  const handlePlay = () => {
    speak(round.pair.playWord, { accent, rate: 0.85 });
  };

  // Auto-play on mount
  useEffect(() => {
    const t = setTimeout(() => {
      speak(round.pair.playWord, { accent, rate: 0.85 });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5">
      {/* Play button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={handlePlay}
          whileTap={{ scale: 0.93 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 24px rgba(99,102,241,0.4)",
          }}
        >
          <Volume2 className="w-7 h-7 text-white" />
        </motion.button>
        <span className="text-xs text-[var(--t3)]">Tap to replay</span>
      </div>

      {/* Question */}
      <div className="text-center">
        <div className="text-xs text-[var(--t3)] uppercase font-mono tracking-wider mb-1">
          Which phoneme did you hear?
        </div>
        <div className="font-mono text-lg text-[var(--t2)]">
          {round.pair.playIpa}
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-3">
        {round.pair.options.map((opt) => (
          <motion.button
            key={opt.value}
            onClick={() => onAnswer(opt.value === round.pair.correctPhoneme)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="flex-1 py-4 rounded-xl text-center transition"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <div className="font-mono text-xl font-bold text-[var(--p3)]">
              {opt.label}
            </div>
            <div className="text-xs text-[var(--t2)] mt-1">{opt.displayWord}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Speed Stress Round UI ────────────────────────────────────────────────

function SpeedStressRoundUI({
  round,
  onAnswer,
  accent,
}: {
  round: StressRound;
  onAnswer: (correct: boolean) => void;
  accent: "usa" | "uk";
}) {
  const { word } = round.data;

  useEffect(() => {
    const t = setTimeout(() => {
      speak(word.word, { accent, rate: 0.8 });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const handlePlay = () => {
    speak(word.word, { accent, rate: 0.8 });
  };

  return (
    <div className="space-y-5">
      {/* Play button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={handlePlay}
          whileTap={{ scale: 0.93 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            boxShadow: "0 0 24px rgba(245,158,11,0.4)",
          }}
        >
          <Volume2 className="w-7 h-7 text-white" />
        </motion.button>
        <span className="text-xs text-[var(--t3)]">Tap to replay</span>
      </div>

      {/* Question */}
      <div className="text-center">
        <div className="text-xs text-[var(--t3)] uppercase font-mono tracking-wider mb-1">
          Which syllable is stressed?
        </div>
        <div className="font-d text-lg text-[var(--t1)] font-bold">{word.word}</div>
        <div className="font-mono text-sm text-[var(--t2)]">{word.ipa}</div>
      </div>

      {/* Syllable options */}
      <div className="flex gap-2 flex-wrap justify-center">
        {round.data.options.map((opt) => (
          <motion.button
            key={opt.label}
            onClick={() => onAnswer(opt.isStressed)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="px-5 py-3 rounded-xl font-d font-bold text-base transition"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
              color: "var(--t1)",
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Discrimination Round UI ──────────────────────────────────────────────

function DiscriminationRoundUI({
  round,
  onAnswer,
  accent,
}: {
  round: DiscriminationRound;
  onAnswer: (correct: boolean) => void;
  accent: "usa" | "uk";
}) {
  const { pair } = round.data;
  const [playedCount, setPlayedCount] = useState(0);

  const playBoth = useCallback(() => {
    speak(pair.word1, {
      accent,
      rate: 0.85,
      onEnd: () => {
        setTimeout(() => {
          speak(pair.word2, {
            accent,
            rate: 0.85,
            onEnd: () => setPlayedCount((c) => c + 1),
          });
        }, 600);
      },
    });
  }, [pair, accent]);

  useEffect(() => {
    const t = setTimeout(playBoth, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-5">
      {/* Play button */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          onClick={playBoth}
          whileTap={{ scale: 0.93 }}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
            boxShadow: "0 0 24px rgba(34,211,238,0.4)",
          }}
        >
          <Volume2 className="w-7 h-7 text-white" />
        </motion.button>
        <span className="text-xs text-[var(--t3)]">Tap to replay both</span>
      </div>

      {/* Word display */}
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <div className="font-d text-lg font-bold text-[var(--t1)]">
            {pair.word1}
          </div>
          <div className="font-mono text-xs text-[var(--t3)]">{pair.ipa1}</div>
        </div>
        <div className="text-[var(--t3)] text-xl">vs</div>
        <div className="text-center">
          <div className="font-d text-lg font-bold text-[var(--t1)]">
            {pair.word2}
          </div>
          <div className="font-mono text-xs text-[var(--t3)]">{pair.ipa2}</div>
        </div>
      </div>

      {/* Question */}
      <div className="text-center text-xs text-[var(--t3)] uppercase font-mono tracking-wider">
        Same or Different?
      </div>

      {/* Options */}
      <div className="flex gap-3">
        {round.data.options.map((opt) => (
          <motion.button
            key={String(opt.value)}
            onClick={() => onAnswer(opt.value === pair.same)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            className="flex-1 py-4 rounded-xl text-center font-d font-bold text-base transition"
            style={{
              background: "rgba(34,211,238,0.08)",
              border: "1px solid rgba(34,211,238,0.25)",
              color: "var(--t1)",
            }}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Result Screen ─────────────────────────────────────────────────────────

function ResultScreen({
  score,
  maxCombo,
  correct,
  wrong,
  timeBonus,
  isNewHighScore,
  onPlayAgain,
  onBack,
}: {
  score: number;
  maxCombo: number;
  correct: number;
  wrong: number;
  timeBonus: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onBack: () => void;
}) {
  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="space-y-5"
    >
      {/* Title */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
          className="text-5xl mb-2"
        >
          {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "👍" : "💪"}
        </motion.div>
        <h2 className="font-d text-2xl font-bold">
          {accuracy >= 80
            ? "Outstanding!"
            : accuracy >= 50
            ? "Good Effort!"
            : "Keep Practicing!"}
        </h2>
      </div>

      {/* New High Score Banner */}
      {isNewHighScore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]"
        >
          <Trophy className="w-4 h-4 text-[#f59e0b]" />
          <span className="text-sm font-bold text-[#f59e0b]">New High Score!</span>
        </motion.div>
      )}

      {/* Score */}
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        className="text-center py-6 rounded-2xl relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08), rgba(34,211,238,0.06))",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        {/* Mesh orbs */}
        <motion.div
          aria-hidden
          className="absolute -top-8 -left-8 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(167,139,250,0.2), transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="font-mono text-5xl font-bold grad-text">{score}</div>
        <div className="text-xs text-[var(--t3)] mt-1 uppercase tracking-wider">
          Total Points
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Accuracy", value: `${accuracy}%`, color: "#10b981" },
          { label: "Max Combo", value: `×${maxCombo}`, color: "#22d3ee" },
          { label: "Correct", value: `${correct}`, color: "#a78bfa" },
          { label: "Time Bonus", value: `+${timeBonus}`, color: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="rounded-xl p-3 text-center"
            style={{
              background: "rgba(0,0,0,0.2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="font-mono text-lg font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div className="text-[10px] text-[var(--t3)] uppercase tracking-wider mt-0.5">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-[var(--t2)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-h)] transition flex items-center justify-center gap-2"
        >
          ← Menu
        </motion.button>
        <motion.button
          onClick={onPlayAgain}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            boxShadow: "0 0 20px rgba(99,102,241,0.3)",
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Play Again
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main Pronunciation Challenge Component ───────────────────────────────

export function PronunciationChallenge() {
  const accent = useAppStore((s) => s.accent);
  const challengeHighScore = useAppStore((s) => s.challengeHighScore);
  const setChallengeHighScore = useAppStore((s) => s.setChallengeHighScore);

  const [phase, setPhase] = useState<Phase>("menu");
  const [challengeType, setChallengeType] = useState<ChallengeType>("minimal-pair");
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [roundState, setRoundState] = useState<RoundState>({
    round: 1,
    timeLeft: CHALLENGE_CONFIG.timePerRound,
    combo: 1,
    maxCombo: 1,
    score: 0,
    correct: 0,
    wrong: 0,
    answered: false,
    feedback: null,
  });
  const [timeBonusTotal, setTimeBonusTotal] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const roundStartRef = useRef<number>(Date.now());

  // ─── Generate a new round ───────────────────────────────────────────

  const generateRound = useCallback(
    (type: ChallengeType): GameRound => {
      switch (type) {
        case "minimal-pair":
          return { type: "minimal-pair", pair: generateMinimalPairRound() };
        case "speed-stress":
          return { type: "speed-stress", data: generateStressRound() };
        case "sound-discrimination":
          return {
            type: "sound-discrimination",
            data: generateDiscriminationRound(),
          };
      }
    },
    []
  );

  // ─── Start game ─────────────────────────────────────────────────────

  const startGame = useCallback(
    (type: ChallengeType) => {
      setChallengeType(type);
      setCurrentRound(generateRound(type));
      setRoundState({
        round: 1,
        timeLeft: CHALLENGE_CONFIG.timePerRound,
        combo: 1,
        maxCombo: 1,
        score: 0,
        correct: 0,
        wrong: 0,
        answered: false,
        feedback: null,
      });
      setTimeBonusTotal(0);
      setIsNewHighScore(false);
      setPhase("playing");
      roundStartRef.current = Date.now();
    },
    [generateRound]
  );

  // ─── Timer logic ────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "playing" || roundState.answered) return;

    timerRef.current = setInterval(() => {
      setRoundState((prev) => {
        const newTimeLeft = prev.timeLeft - 0.1;
        if (newTimeLeft <= 0) {
          // Time's up — count as wrong
          return {
            ...prev,
            timeLeft: 0,
            answered: true,
            feedback: "wrong",
            wrong: prev.wrong + 1,
            combo: 1,
          };
        }
        return { ...prev, timeLeft: Math.max(0, newTimeLeft) };
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, roundState.answered, roundState.round]);

  // ─── Handle answer ──────────────────────────────────────────────────

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (roundState.answered) return;

      if (timerRef.current) clearInterval(timerRef.current);

      const timeTaken = (Date.now() - roundStartRef.current) / 1000;
      const timeRemaining = Math.max(0, CHALLENGE_CONFIG.timePerRound - timeTaken);
      const timeBonus =
        correct && timeRemaining >= CHALLENGE_CONFIG.timeBonusThreshold
          ? CHALLENGE_CONFIG.timeBonusPoints
          : 0;

      const newCombo = correct
        ? Math.min(roundState.combo + 1, CHALLENGE_CONFIG.maxCombo)
        : 1;
      const points = correct ? CHALLENGE_CONFIG.basePoints * roundState.combo : 0;

      setRoundState((prev) => ({
        ...prev,
        answered: true,
        feedback: correct ? "correct" : "wrong",
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        score: prev.score + points + timeBonus,
      }));

      if (timeBonus > 0) {
        setTimeBonusTotal((t) => t + timeBonus);
      }

      // Auto-advance after delay
      setTimeout(() => {
        setRoundState((prev) => {
          if (prev.round >= CHALLENGE_CONFIG.roundsPerGame) {
            // Game over
            const finalScore = prev.score;
            const currentHigh = challengeHighScore;
            if (finalScore > currentHigh) {
              setChallengeHighScore(finalScore);
              setIsNewHighScore(true);
            }
            setPhase("result");
            return prev;
          }

          // Next round
          setCurrentRound(generateRound(challengeType));
          roundStartRef.current = Date.now();
          return {
            ...prev,
            round: prev.round + 1,
            timeLeft: CHALLENGE_CONFIG.timePerRound,
            answered: false,
            feedback: null,
          };
        });
      }, 1200);
    },
    [
      roundState.answered,
      roundState.combo,
      challengeHighScore,
      setChallengeHighScore,
      generateRound,
      challengeType,
    ]
  );

  // ─── Reset to menu ─────────────────────────────────────────────────

  const goToMenu = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("menu");
    setCurrentRound(null);
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="relative rounded-2xl overflow-hidden border" style={{
      background:
        "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 50%, rgba(34,211,238,0.03) 100%)",
      borderColor: "rgba(99,102,241,0.2)",
    }}>
      {/* Animated mesh gradient border effect */}
      <motion.div
        aria-hidden
        className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <div className="relative p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {/* ─── Menu Phase ─── */}
          {phase === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <ChallengeMenu highScore={challengeHighScore} onStart={startGame} />
            </motion.div>
          )}

          {/* ─── Playing Phase ─── */}
          {phase === "playing" && currentRound && (
            <motion.div
              key={`playing-${roundState.round}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 relative"
            >
              {/* Top bar: Round + Timer + Combo + Score */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-[var(--t3)]">
                  Round{" "}
                  <span className="text-[var(--t1)] font-bold">
                    {roundState.round}/{CHALLENGE_CONFIG.roundsPerGame}
                  </span>
                </div>
                <TimerRing
                  timeLeft={roundState.timeLeft}
                  maxTime={CHALLENGE_CONFIG.timePerRound}
                />
                <div className="relative">
                  <div className="text-xs font-mono text-[var(--t3)] text-right">
                    Score
                  </div>
                  <div className="font-mono text-lg font-bold text-[var(--p3)] text-right">
                    {roundState.score}
                  </div>
                  <ComboBadge combo={roundState.combo} />
                </div>
              </div>

              {/* Challenge type indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,0,0,0.2)] border border-[var(--border)]">
                {challengeType === "minimal-pair" && (
                  <Target className="w-3.5 h-3.5 text-[#a78bfa]" />
                )}
                {challengeType === "speed-stress" && (
                  <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                )}
                {challengeType === "sound-discrimination" && (
                  <Ear className="w-3.5 h-3.5 text-[#22d3ee]" />
                )}
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--t3)]">
                  {challengeType === "minimal-pair"
                    ? "Minimal Pair Blitz"
                    : challengeType === "speed-stress"
                    ? "Speed Stress"
                    : "Sound Discrimination"}
                </span>
              </div>

              {/* Round content */}
              <div className="relative min-h-[260px]">
                {/* Flash feedback overlay */}
                <AnimatePresence>
                  {roundState.feedback && (
                    <FlashFeedback key="flash" type={roundState.feedback} />
                  )}
                </AnimatePresence>

                {/* Correct/Wrong indicator */}
                <AnimatePresence>
                  {roundState.feedback && (
                    <motion.div
                      key="feedback-label"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                      }}
                      className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
                    >
                      <div
                        className="px-6 py-3 rounded-xl font-d font-bold text-lg"
                        style={{
                          background: roundState.feedback === "correct"
                            ? "rgba(16,185,129,0.2)"
                            : "rgba(239,68,68,0.2)",
                          border:
                            roundState.feedback === "correct"
                              ? "1px solid rgba(16,185,129,0.4)"
                              : "1px solid rgba(239,68,68,0.4)",
                          color:
                            roundState.feedback === "correct" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {roundState.feedback === "correct"
                          ? roundState.combo > 2
                            ? `✓ ×${roundState.combo - 1} Combo!`
                            : "✓ Correct!"
                          : "✗ Wrong!"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Round UI */}
                {!roundState.answered && (
                  <>
                    {currentRound.type === "minimal-pair" && (
                      <MinimalPairRoundUI
                        round={currentRound}
                        onAnswer={handleAnswer}
                        accent={accent}
                      />
                    )}
                    {currentRound.type === "speed-stress" && (
                      <SpeedStressRoundUI
                        round={currentRound}
                        onAnswer={handleAnswer}
                        accent={accent}
                      />
                    )}
                    {currentRound.type === "sound-discrimination" && (
                      <DiscriminationRoundUI
                        round={currentRound}
                        onAnswer={handleAnswer}
                        accent={accent}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5">
                {Array.from({ length: CHALLENGE_CONFIG.roundsPerGame }).map((_, i) => {
                  const isPast = i < roundState.round - 1;
                  const isCurrent = i === roundState.round - 1;
                  return (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: isCurrent
                          ? "var(--p3)"
                          : isPast
                          ? "rgba(16,185,129,0.5)"
                          : "rgba(255,255,255,0.1)",
                      }}
                      animate={
                        isCurrent
                          ? { scale: [1, 1.4, 1] }
                          : {}
                      }
                      transition={{
                        duration: 0.8,
                        repeat: isCurrent ? Infinity : 0,
                      }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ─── Result Phase ─── */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultScreen
                score={roundState.score}
                maxCombo={roundState.maxCombo}
                correct={roundState.correct}
                wrong={roundState.wrong}
                timeBonus={timeBonusTotal}
                isNewHighScore={isNewHighScore}
                onPlayAgain={() => startGame(challengeType)}
                onBack={goToMenu}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
