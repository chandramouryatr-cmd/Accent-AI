"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Repeat, ArrowRight } from "lucide-react";
import type { MediaClipStep } from "@/lib/types";
import { speak as speakTTS } from "@/lib/tts";
import { useAppStore } from "@/lib/store";

interface Props {
  step: MediaClipStep;
  /** Unused — mood-based pitch requires direct TTS access via @/lib/tts. */
  speak?: (text: string) => void;
}

// Animated SVG "stage" depicting a speaker delivering a line with
// exaggerated facial expression + body language cues. Conveys the non-verbal
// context that sarcasm/humor depend on (the app is text + audio only).
//
// - Character head's facial expression animates based on `step.mood`:
//   sarcastic (raised eyebrow + smirk + eye-roll), genuine (relaxed smile),
//   deadpan (flat mouth + blank eyes, no movement), excited (wide eyes +
//   open smile + bounce), ironic (head tilt + half-smile + eye-roll).
// - Speech bubble types out the phrase (staggered word reveal) when the
//   user taps "▶ Play delivery".
// - TTS speaks the phrase with mood-appropriate pitch (sarcastic/ironic
//   lower; excited higher; deadpan flat).
// - Literal vs intended meaning shown side by side — the gap that defines
//   humor/irony.
// - "Compare moods" button re-plays the same phrase in a different mood
//   so the user hears how delivery flips meaning.

type Mood = MediaClipStep["mood"];

interface MoodConfig {
  badge: string;
  color: string;
  pitch: number;
  rate: number;
  browL: { dy: number; tilt: number };
  browR: { dy: number; tilt: number };
  mouthPath: string;
  mouthFill: boolean;
  eyeShape: "normal" | "wide" | "blank" | "rolling";
  headTilt: number;
  bounce: boolean;
  cheeks: boolean;
}

const MOODS: Record<Mood, MoodConfig> = {
  sarcastic: {
    badge: "↩ irony",
    color: "#a78bfa",
    pitch: 0.85,
    rate: 0.92,
    // Right eyebrow raised + angled (one-eyebrow raise), left flat.
    browL: { dy: 0, tilt: 0 },
    browR: { dy: -6, tilt: -14 },
    // Smirk — left corner slightly up, right corner pulled flat.
    mouthPath: "M 86 100 Q 100 102 114 97",
    mouthFill: false,
    eyeShape: "rolling",
    headTilt: 0,
    bounce: false,
    cheeks: false,
  },
  genuine: {
    badge: "✓ sincere",
    color: "#10b981",
    pitch: 1,
    rate: 0.95,
    browL: { dy: -2, tilt: 0 },
    browR: { dy: -2, tilt: 0 },
    // Genuine smile — both corners up.
    mouthPath: "M 83 97 Q 100 109 117 97",
    mouthFill: false,
    eyeShape: "normal",
    headTilt: 0,
    bounce: false,
    cheeks: true,
  },
  deadpan: {
    badge: "😐 deadpan",
    color: "#64748b",
    pitch: 0.8,
    rate: 0.9,
    browL: { dy: 0, tilt: 0 },
    browR: { dy: 0, tilt: 0 },
    // Straight-line mouth — zero expression.
    mouthPath: "M 86 100 L 114 100",
    mouthFill: false,
    eyeShape: "blank",
    headTilt: 0,
    bounce: false,
    cheeks: false,
  },
  excited: {
    badge: "✨ excited",
    color: "#f59e0b",
    pitch: 1.2,
    rate: 1.05,
    browL: { dy: -7, tilt: 0 },
    browR: { dy: -7, tilt: 0 },
    // Big open smile (filled) — both corners high.
    mouthPath: "M 82 95 Q 100 118 118 95 Q 100 105 82 95 Z",
    mouthFill: true,
    eyeShape: "wide",
    headTilt: 0,
    bounce: true,
    cheeks: true,
  },
  ironic: {
    badge: "↻ ironic",
    color: "#ec4899",
    pitch: 0.85,
    rate: 0.95,
    browL: { dy: -2, tilt: 0 },
    browR: { dy: -5, tilt: -8 },
    // Half-smile — slight upturn on one side.
    mouthPath: "M 86 99 Q 100 101 114 96",
    mouthFill: false,
    eyeShape: "rolling",
    headTilt: -7,
    bounce: false,
    cheeks: false,
  },
};

// Subset cycle for the "Compare moods" button — maximally contrasting trio
// (one ironic, one sincere, one flat). The user hears how the SAME phrase
// flips meaning across deliveries.
const COMPARE_CYCLE: Mood[] = ["sarcastic", "genuine", "deadpan"];

export function MediaClip({ step }: Props) {
  const {
    phrase,
    mood: initialMood,
    literalMeaning,
    intendedMeaning,
    title,
    description,
  } = step;
  const accent = useAppStore((s) => s.accent);
  const [currentMood, setCurrentMood] = useState<Mood>(initialMood);
  const [played, setPlayed] = useState(false);
  const [playbackId, setPlaybackId] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const words = useMemo(() => phrase.split(/\s+/).filter(Boolean), [phrase]);
  const mood = MOODS[currentMood];

  // Clean up any in-flight reveal timers on unmount.
  useEffect(
    () => () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    },
    []
  );

  const playWith = (m: Mood) => {
    setCurrentMood(m);
    setPlayed(true);
    setRevealedCount(0);
    setPlaybackId((id) => id + 1);
    const cfg = MOODS[m];
    speakTTS(phrase, { accent, pitch: cfg.pitch, rate: cfg.rate });
  };

  // Staggered word-reveal driver — re-runs on each playbackId bump.
  useEffect(() => {
    if (playbackId === 0) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    const per = Math.max(170, Math.min(330, 1700 / Math.max(words.length, 1)));
    words.forEach((_, i) => {
      const t = setTimeout(() => setRevealedCount(i + 1), (i + 1) * per);
      timersRef.current.push(t);
    });
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [playbackId, words]);

  const handleCompare = () => {
    const idx = COMPARE_CYCLE.indexOf(currentMood);
    const nextMood =
      idx >= 0
        ? COMPARE_CYCLE[(idx + 1) % COMPARE_CYCLE.length]
        : COMPARE_CYCLE[0];
    playWith(nextMood);
  };

  // Word layout inside the speech bubble (single row, centered).
  // Pure-functional position computation (no mutation during render).
  const fontSize = 7;
  const charW = fontSize * 0.55;
  const gap = 2.6;
  const wordWidths = words.map((w) => Math.max(w.length * charW, 6));
  const totalWidth =
    wordWidths.reduce((a, b) => a + b, 0) +
    gap * Math.max(0, words.length - 1);
  const bubbleW = Math.max(86, totalWidth + 18);
  const bubbleX = 100 - bubbleW / 2;
  const startX = 100 - totalWidth / 2;
  const wordXs = wordWidths.map((w, i) => {
    const prefix = wordWidths.slice(0, i).reduce((a, b) => a + b, 0) + gap * i;
    return startX + prefix + w / 2;
  });

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
      )}
      {description && (
        <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>
      )}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider"
            style={{ background: `${mood.color}22`, color: mood.color }}
          >
            {mood.badge}
          </span>
          <span className="text-[11px] text-[var(--t3)]">
            Delivery mood:{" "}
            <span className="font-semibold text-[var(--t2)]">{currentMood}</span>
          </span>
        </div>

        {/* SVG stage */}
        <svg
          viewBox="0 0 200 180"
          className="w-full max-w-sm mx-auto"
          role="img"
          aria-label={`Animated speaker delivering the phrase in a ${currentMood} mood`}
        >
          {/* Stage floor shadow */}
          <ellipse cx="100" cy="166" rx="56" ry="5" fill="rgba(99,102,241,0.18)" />

          {/* Speech bubble (appears after first play; remounts per playback
              so the staggered word reveal restarts cleanly). */}
          <AnimatePresence>
            {played && (
              <motion.g
                key={playbackId}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <rect
                  x={bubbleX}
                  y={8}
                  width={bubbleW}
                  height={20}
                  rx={6}
                  fill="var(--card)"
                  stroke={mood.color}
                  strokeWidth={0.7}
                />
                <path
                  d={`M ${100 - 4} 28 L ${100 + 4} 28 L 100 35 Z`}
                  fill="var(--card)"
                  stroke={mood.color}
                  strokeWidth={0.7}
                  strokeLinejoin="round"
                />
                {words.map((w, i) => {
                  const visible = i < revealedCount;
                  return (
                    <motion.text
                      key={i}
                      x={wordXs[i]}
                      y={22}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill="var(--t1)"
                      fontFamily="var(--font-sans), sans-serif"
                      fontWeight={600}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: visible ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {w}
                    </motion.text>
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>

          {/* Character group — outer bounce wrapper */}
          <motion.g
            animate={mood.bounce ? { y: [0, -3, 0] } : { y: 0 }}
            transition={
              mood.bounce
                ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            {/* Inner head-tilt wrapper */}
            <motion.g
              animate={{ rotate: mood.headTilt }}
              transition={{ type: "spring", stiffness: 80, damping: 12 }}
              style={{ transformOrigin: "100px 120px" }}
            >
              {/* Shoulders / torso */}
              <path
                d="M 60 168 Q 100 140 140 168 L 140 180 L 60 180 Z"
                fill="#6366f1"
                opacity={0.85}
              />
              {/* Neck */}
              <rect x="92" y="128" width="16" height="22" rx={3} fill="#fcd9b6" />

              {/* Head */}
              <circle
                cx="100"
                cy="95"
                r="36"
                fill="#fde2c4"
                stroke="#d4a373"
                strokeWidth={0.6}
              />

              {/* Hair */}
              <path
                d="M 66 82 Q 68 60 100 58 Q 132 60 134 82 Q 130 70 100 65 Q 70 70 66 82 Z"
                fill="#4a3528"
              />

              {/* Ears */}
              <circle
                cx="64"
                cy="96"
                r="4.5"
                fill="#fde2c4"
                stroke="#d4a373"
                strokeWidth={0.4}
              />
              <circle
                cx="136"
                cy="96"
                r="4.5"
                fill="#fde2c4"
                stroke="#d4a373"
                strokeWidth={0.4}
              />

              {/* Eyes (sclera) */}
              <ellipse
                cx="86"
                cy="90"
                rx="5.5"
                ry={mood.eyeShape === "wide" ? 6.5 : 4.5}
                fill="#ffffff"
                stroke="#1f2937"
                strokeWidth={0.5}
              />
              <ellipse
                cx="114"
                cy="90"
                rx="5.5"
                ry={mood.eyeShape === "wide" ? 6.5 : 4.5}
                fill="#ffffff"
                stroke="#1f2937"
                strokeWidth={0.5}
              />

              {/* Pupils */}
              {mood.eyeShape === "blank" ? (
                <>
                  <circle cx="86" cy="90" r="1.2" fill="#1f2937" opacity={0.4} />
                  <circle cx="114" cy="90" r="1.2" fill="#1f2937" opacity={0.4} />
                </>
              ) : mood.eyeShape === "rolling" ? (
                <>
                  <motion.g
                    animate={{
                      x: [0, 2.2, 0, -2.2, 0],
                      y: [0, -2.8, -2.8, -2.8, 0],
                    }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <circle cx="86" cy="90" r="2.2" fill="#1f2937" />
                  </motion.g>
                  <motion.g
                    animate={{
                      x: [0, 2.2, 0, -2.2, 0],
                      y: [0, -2.8, -2.8, -2.8, 0],
                    }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <circle cx="114" cy="90" r="2.2" fill="#1f2937" />
                  </motion.g>
                </>
              ) : (
                <>
                  <motion.circle
                    cx="86"
                    cy="90"
                    r="2.2"
                    fill="#1f2937"
                    animate={
                      mood.bounce ? { cy: [90, 88.5, 90] } : { cy: 90 }
                    }
                    transition={
                      mood.bounce
                        ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.2 }
                    }
                  />
                  <motion.circle
                    cx="114"
                    cy="90"
                    r="2.2"
                    fill="#1f2937"
                    animate={
                      mood.bounce ? { cy: [90, 88.5, 90] } : { cy: 90 }
                    }
                    transition={
                      mood.bounce
                        ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.2 }
                    }
                  />
                </>
              )}

              {/* Eye highlights (skip on blank/rolling — already animated) */}
              {mood.eyeShape === "normal" || mood.eyeShape === "wide" ? (
                <>
                  <circle cx="87.2" cy="88.4" r="0.75" fill="#ffffff" />
                  <circle cx="115.2" cy="88.4" r="0.75" fill="#ffffff" />
                </>
              ) : null}

              {/* Eyebrows — each independently translated + rotated */}
              <motion.g
                animate={{ y: mood.browL.dy }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <motion.rect
                  x="78"
                  y="80"
                  width="16"
                  height="2.6"
                  rx="1"
                  fill="#4a3528"
                  animate={{ rotate: mood.browL.tilt }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  style={{ transformOrigin: "86px 81.3px" }}
                />
              </motion.g>
              <motion.g
                animate={{ y: mood.browR.dy }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
              >
                <motion.rect
                  x="106"
                  y="80"
                  width="16"
                  height="2.6"
                  rx="1"
                  fill="#4a3528"
                  animate={{ rotate: mood.browR.tilt }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  style={{ transformOrigin: "114px 81.3px" }}
                />
              </motion.g>

              {/* Nose */}
              <path
                d="M 100 91 L 97 100 Q 100 102 103 100 Z"
                fill="#d4a373"
                opacity={0.6}
              />

              {/* Mouth */}
              <motion.path
                d={mood.mouthPath}
                stroke="#7c2d12"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={mood.mouthFill ? "#7c2d12" : "none"}
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Cheek tint for warm moods */}
              {mood.cheeks && (
                <>
                  <circle cx="73" cy="104" r="3.4" fill="#f87171" opacity={0.4} />
                  <circle cx="127" cy="104" r="3.4" fill="#f87171" opacity={0.4} />
                </>
              )}
            </motion.g>
          </motion.g>
        </svg>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            onClick={() => playWith(currentMood)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-[var(--grad-btn)] text-white text-xs font-semibold hover:opacity-90 transition"
          >
            <Play className="w-3.5 h-3.5" />
            {played ? "Replay" : "▶ Play delivery"}
          </button>
          <button
            type="button"
            onClick={handleCompare}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 border border-[var(--border)] bg-[rgba(99,102,241,0.04)] text-[var(--t2)] text-xs font-semibold hover:border-[var(--p3)] transition"
          >
            <Repeat className="w-3.5 h-3.5" /> Compare moods
          </button>
        </div>

        <p className="text-[11px] text-[var(--t3)] mt-2 italic">
          Watch the eyebrows, mouth shape, and eye movement — they carry the
          meaning the words alone don&apos;t.
        </p>
      </div>

      {/* Literal vs Intended meaning — the gap that defines humor/irony */}
      {(literalMeaning || intendedMeaning) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
          <div className="rounded-xl p-4 border border-[var(--border)] bg-[rgba(99,102,241,0.04)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--t3)] mb-1">
              What it says
            </div>
            <div className="text-sm text-[var(--t2)] leading-snug">
              {literalMeaning ?? "—"}
            </div>
          </div>
          <div
            className="rounded-xl p-4 border bg-[rgba(168,85,247,0.06)]"
            style={{ borderColor: "rgba(168,85,247,0.4)" }}
          >
            <div
              className="text-[10px] font-mono uppercase tracking-wider mb-1 flex items-center gap-1"
              style={{ color: "var(--p3)" }}
            >
              What it means <ArrowRight className="w-3 h-3" />
            </div>
            <div className="text-sm text-[var(--t1)] leading-snug font-medium">
              {intendedMeaning ?? "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
