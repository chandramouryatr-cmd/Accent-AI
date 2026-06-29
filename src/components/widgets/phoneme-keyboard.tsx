"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";
import { speak } from "@/lib/tts";
import { useAppStore } from "@/lib/store";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

/* ─── Phoneme data ─── */

interface Phoneme {
  symbol: string;
  name: string;
  example: string;
}

const VOWELS: Phoneme[] = [
  { symbol: "iː", name: "ee", example: "see" },
  { symbol: "ɪ", name: "short i", example: "sit" },
  { symbol: "e", name: "short e", example: "bed" },
  { symbol: "æ", name: "ash", example: "cat" },
  { symbol: "ɑː", name: "long ah", example: "father" },
  { symbol: "ɔː", name: "long aw", example: "thought" },
  { symbol: "ʊ", name: "short u", example: "book" },
  { symbol: "uː", name: "oo", example: "food" },
  { symbol: "ʌ", name: "strut", example: "cup" },
  { symbol: "ɜː", name: "nurse", example: "bird" },
  { symbol: "ə", name: "schwa", example: "about" },
];

const DIPHTHONGS: Phoneme[] = [
  { symbol: "eɪ", name: "ay", example: "day" },
  { symbol: "aɪ", name: "eye", example: "my" },
  { symbol: "ɔɪ", name: "oy", example: "boy" },
  { symbol: "aʊ", name: "ow", example: "how" },
  { symbol: "oʊ", name: "oh", example: "go" },
  { symbol: "ɪə", name: "ear", example: "near" },
  { symbol: "eə", name: "air", example: "hair" },
  { symbol: "ʊə", name: "ure", example: "pure" },
];

const CONSONANTS: Phoneme[] = [
  { symbol: "p", name: "p", example: "pen" },
  { symbol: "b", name: "b", example: "bad" },
  { symbol: "t", name: "t", example: "tea" },
  { symbol: "d", name: "d", example: "did" },
  { symbol: "k", name: "k", example: "cat" },
  { symbol: "ɡ", name: "g", example: "got" },
  { symbol: "f", name: "f", example: "fun" },
  { symbol: "v", name: "v", example: "van" },
  { symbol: "θ", name: "theta", example: "think" },
  { symbol: "ð", name: "eth", example: "this" },
  { symbol: "s", name: "s", example: "see" },
  { symbol: "z", name: "z", example: "zoo" },
  { symbol: "ʃ", name: "esh", example: "she" },
  { symbol: "ʒ", name: "ezh", example: "measure" },
  { symbol: "h", name: "h", example: "hat" },
  { symbol: "m", name: "m", example: "man" },
  { symbol: "n", name: "n", example: "no" },
  { symbol: "ŋ", name: "eng", example: "sing" },
  { symbol: "l", name: "l", example: "let" },
  { symbol: "r", name: "r", example: "red" },
  { symbol: "w", name: "w", example: "we" },
  { symbol: "j", name: "y", example: "yes" },
  { symbol: "tʃ", name: "ch", example: "chain" },
  { symbol: "dʒ", name: "j", example: "jam" },
];

type Category = "vowels" | "diphthongs" | "consonants";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "vowels", label: "Vowels" },
  { id: "diphthongs", label: "Diphthongs" },
  { id: "consonants", label: "Consonants" },
];

const PHONEME_MAP: Record<Category, Phoneme[]> = {
  vowels: VOWELS,
  diphthongs: DIPHTHONGS,
  consonants: CONSONANTS,
};

/* ─── Category colors ─── */
const CATEGORY_COLORS: Record<Category, { bg: string; border: string; glow: string; active: string }> = {
  vowels: {
    bg: "rgba(99, 102, 241, 0.10)",
    border: "rgba(99, 102, 241, 0.25)",
    glow: "rgba(99, 102, 241, 0.5)",
    active: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  diphthongs: {
    bg: "rgba(34, 211, 238, 0.10)",
    border: "rgba(34, 211, 238, 0.25)",
    glow: "rgba(34, 211, 238, 0.5)",
    active: "linear-gradient(135deg, #22d3ee, #06b6d4)",
  },
  consonants: {
    bg: "rgba(16, 185, 129, 0.10)",
    border: "rgba(16, 185, 129, 0.25)",
    glow: "rgba(16, 185, 129, 0.5)",
    active: "linear-gradient(135deg, #10b981, #059669)",
  },
};

/* ─── Phoneme Button ─── */

function PhonemeButton({ phoneme, category }: { phoneme: Phoneme; category: Category }) {
  const accent = useAppStore((s) => s.accent);
  const [playing, setPlaying] = useState(false);
  const colors = CATEGORY_COLORS[category];

  const handlePlay = useCallback(() => {
    setPlaying(true);
    speak(phoneme.example, {
      accent,
      rate: 0.7,
      onEnd: () => setPlaying(false),
    });
  }, [phoneme.example, accent]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          onClick={handlePlay}
          whileHover={{
            scale: 1.08,
            boxShadow: `0 0 14px ${colors.glow}`,
          }}
          whileTap={{ scale: 0.92 }}
          animate={
            playing
              ? {
                  scale: [1, 1.12, 0.95, 1.05, 1],
                  boxShadow: [
                    `0 0 0px ${colors.glow}`,
                    `0 0 20px ${colors.glow}`,
                    `0 0 6px ${colors.glow}`,
                    `0 0 14px ${colors.glow}`,
                    `0 0 0px ${colors.glow}`,
                  ],
                }
              : {}
          }
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative flex flex-col items-center justify-center rounded-lg px-1.5 py-2 font-mono text-sm transition-colors select-none"
          style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            minWidth: 44,
            minHeight: 44,
          }}
          aria-label={`Play phoneme ${phoneme.name}, as in ${phoneme.example}`}
        >
          <span className="text-[var(--t1)] text-base leading-none">
            /{phoneme.symbol}/
          </span>
          {playing && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Volume2 className="w-3 h-3" style={{ color: colors.glow.replace("0.5", "1") }} />
            </motion.div>
          )}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={6}
        className="font-mono text-xs"
        style={{
          background: "var(--bg3)",
          border: `1px solid ${colors.border}`,
          color: "var(--t1)",
        }}
      >
        <span className="font-bold">/{phoneme.symbol}/</span>{" "}
        <span className="text-[var(--t2)]">→ {phoneme.example}</span>
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Main Phoneme Keyboard ─── */

export function PhonemeKeyboard() {
  const [category, setCategory] = useState<Category>("vowels");

  const phonemes = PHONEME_MAP[category];
  const colors = CATEGORY_COLORS[category];

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        maxHeight: 210,
      }}
    >
      {/* Category tabs */}
      <div
        className="flex p-1 gap-1 border-b"
        style={{
          background: "var(--bg2)",
          borderColor: "var(--border)",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.id;
          const catColors = CATEGORY_COLORS[cat.id];
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="relative flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
              style={{
                color: isActive ? "white" : "var(--t3)",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="phoneme-cat-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: catColors.active,
                    boxShadow: `0 0 12px ${catColors.glow}`,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Phoneme grid */}
      <div className="overflow-y-auto p-2" style={{ maxHeight: 160 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap gap-1.5 justify-center"
          >
            {phonemes.map((p, i) => (
              <motion.div
                key={p.symbol}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.02,
                  type: "spring",
                  stiffness: 350,
                  damping: 20,
                }}
              >
                <PhonemeButton phoneme={p} category={category} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5" style={{ background: colors.active }} />
    </div>
  );
}
