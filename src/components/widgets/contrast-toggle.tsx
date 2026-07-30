"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Repeat, Square, Volume2, Zap } from "lucide-react";
import type { ContrastStep } from "@/lib/types";
import { speak } from "@/lib/tts";
import { useAppStore } from "@/lib/store";

interface Props {
  step: ContrastStep;
  /** Accepted for interface compatibility with the StepRenderer dispatch —
   *  unused. We import `speak` from @/lib/tts directly so we can pass a
   *  per-form `rate` to TTS. */
  speak?: (text: string) => void;
}

type FormKey = "textbook" | "compressed";
type ABPhase = "idle" | "textbook" | "gap" | "compressed";

/** Rough duration estimate (ms) for TTS playback — used as a fallback timer
 *  in case the speechSynthesis `onEnd` event doesn't fire (rare but possible
 *  on mobile). ~150 wpm at rate=1. */
function estimateDur(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const baseMs = (words / 150) * 60 * 1000;
  return baseMs / Math.max(0.1, rate);
}

/** Normalize a token for diff comparison: lowercase + strip apostrophes
 *  so "I'm" and "im" compare equal. */
function normalize(token: string): string {
  return token.toLowerCase().replace(/[''`]/g, "");
}

/** A textbook token is "preserved" if any compressed token (normalized)
 *  contains it OR (for short tokens like "I") any compressed token starts
 *  with it. Otherwise it was reduced/dropped → strikethrough. */
function makeIsReduced(textbookTokens: string[], compressedTokens: string[]) {
  const compressedNorm = compressedTokens.map(normalize);
  return (token: string): boolean => {
    const low = normalize(token);
    if (low.length === 0) return true;
    // Exact-match preservation (case-insensitive, apostrophe-stripped)
    if (compressedNorm.includes(low)) return false;
    // Substring preservation for tokens >= 2 chars
    if (low.length >= 2) {
      for (const c of compressedNorm) {
        if (c.includes(low)) return false;
      }
    }
    // Prefix preservation (catches "I" → "I'm")
    for (const c of compressedNorm) {
      if (c.startsWith(low) && low.length >= 1) return false;
    }
    return true;
  };
}

/** A compressed token is "new" (a compression/reduction) if no textbook
 *  token (normalized) contains it and no textbook token starts with it. */
function makeIsNew(textbookTokens: string[], compressedTokens: string[]) {
  const textbookNorm = textbookTokens.map(normalize);
  return (token: string): boolean => {
    const low = normalize(token);
    if (low.length === 0) return false;
    if (textbookNorm.includes(low)) return false;
    if (low.length >= 2) {
      for (const t of textbookNorm) {
        if (t.includes(low)) return false;
        if (low.includes(t) && t.length >= 2) return false;
      }
    }
    // Prefix check (catches "I'm" → textbook "I")
    for (const t of textbookNorm) {
      if (low.startsWith(t) && t.length >= 1) return false;
    }
    return true;
  };
}

export function ContrastToggle({ step }: Props) {
  const accent = useAppStore((s) => s.accent);
  const { phrase, textbookForm, compressedForm, title, description } = step;
  const [active, setActive] = useState<FormKey>("textbook");
  const [abPhase, setAbPhase] = useState<ABPhase>("idle");
  const abTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const textbookRate = textbookForm.rate ?? 0.85;
  const compressedRate = compressedForm.rate ?? 1.15;

  const textbookTokens = useMemo(
    () => textbookForm.text.split(/\s+/).filter(Boolean),
    [textbookForm.text],
  );
  const compressedTokens = useMemo(
    () => compressedForm.text.split(/\s+/).filter(Boolean),
    [compressedForm.text],
  );

  const isReduced = useMemo(
    () => makeIsReduced(textbookTokens, compressedTokens),
    [textbookTokens, compressedTokens],
  );
  const isNew = useMemo(
    () => makeIsNew(textbookTokens, compressedTokens),
    [textbookTokens, compressedTokens],
  );

  // Cleanup any pending A/B timers on unmount
  useEffect(() => {
    const timers = abTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.length = 0;
    };
  }, []);

  const pushTimer = (t: ReturnType<typeof setTimeout>) => {
    abTimersRef.current.push(t);
  };

  const clearABTimers = () => {
    abTimersRef.current.forEach((t) => clearTimeout(t));
    abTimersRef.current = [];
  };

  const playForm = (form: FormKey) => {
    // Cancel any in-flight A/B playback
    clearABTimers();
    setAbPhase("idle");
    const text = form === "textbook" ? textbookForm.text : compressedForm.text;
    const rate = form === "textbook" ? textbookRate : compressedRate;
    speak(text, { accent, rate });
  };

  const stopAB = () => {
    clearABTimers();
    setAbPhase("idle");
    // stopSpeaking is not imported to keep surface small; speak() with the
    // next utterance cancels the current one anyway. For a hard stop we
    // cancel via the speechSynthesis API.
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  };

  const playAB = () => {
    if (abPhase !== "idle") return;
    setAbPhase("textbook");

    // Flag guards against double-fire (onEnd + fallback)
    let movedToGap = false;
    let movedToCompressed = false;
    let finished = false;

    const moveToCompressed = () => {
      if (movedToCompressed) return;
      movedToCompressed = true;
      setAbPhase("compressed");
      const t2 = setTimeout(() => {
        let done = false;
        const finish = () => {
          if (done || finished) return;
          done = true;
          finished = true;
          setAbPhase("idle");
        };
        speak(compressedForm.text, {
          accent,
          rate: compressedRate,
          onEnd: finish,
        });
        // Fallback in case onEnd never fires
        const fb = setTimeout(finish, estimateDur(compressedForm.text, compressedRate) + 2500);
        pushTimer(fb);
      }, 600);
      pushTimer(t2);
    };

    const moveToGap = () => {
      if (movedToGap) return;
      movedToGap = true;
      // The 600ms gap is enforced inside moveToCompressed's timer.
      moveToCompressed();
    };

    speak(textbookForm.text, {
      accent,
      rate: textbookRate,
      onEnd: moveToGap,
    });
    // Fallback in case onEnd never fires
    const fb1 = setTimeout(moveToGap, estimateDur(textbookForm.text, textbookRate) + 3000);
    pushTimer(fb1);
  };

  const abStatusLabel: string = (() => {
    if (abPhase === "textbook") return "▶ Playing textbook…";
    if (abPhase === "gap") return "▶ Loading compressed…";
    if (abPhase === "compressed") return "▶ Playing compressed…";
    return "";
  })();

  const activeForm = active === "textbook" ? textbookForm : compressedForm;
  const activeRate = active === "textbook" ? textbookRate : compressedRate;

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
      )}

      {/* Phrase heading */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl p-4 border border-[var(--border)] bg-[rgba(99,102,241,0.04)] text-center"
      >
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-1">
          Phrase
        </div>
        <div className="font-d font-semibold text-lg text-[var(--t1)]">
          “{phrase}”
        </div>
      </motion.div>

      {description && (
        <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>
      )}

      {/* Two-segment toggle */}
      <div
        className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-[var(--border)]"
        style={{ background: "var(--card)" }}
      >
        <button
          onClick={() => setActive("textbook")}
          className="relative py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition"
          style={{
            background: active === "textbook" ? "var(--card-h)" : "transparent",
            color: active === "textbook" ? "var(--t1)" : "var(--t3)",
          }}
        >
          <BookOpen className="w-4 h-4" /> Textbook
          {active === "textbook" && (
            <motion.span
              layoutId="contrast-active-pill"
              className="absolute inset-0 -z-10 rounded-lg"
              style={{ background: "var(--card-h)" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
          )}
        </button>
        <button
          onClick={() => setActive("compressed")}
          className="relative py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition"
          style={{
            background: active === "compressed" ? "var(--grad-btn)" : "transparent",
            color: active === "compressed" ? "var(--primary-foreground)" : "var(--t3)",
          }}
        >
          <Zap className="w-4 h-4" /> Compressed
          {active === "compressed" && (
            <motion.span
              layoutId="contrast-active-pill"
              className="absolute inset-0 -z-10 rounded-lg"
              style={{ background: "var(--grad-btn)" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            />
          )}
        </button>
      </div>

      {/* Active form view */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-2xl p-5 border border-[var(--border)] bg-[rgba(99,102,241,0.04)] space-y-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-full"
              style={{
                background:
                  active === "textbook"
                    ? "var(--card-h)"
                    : "var(--grad-btn)",
                color:
                  active === "textbook"
                    ? "var(--t1)"
                    : "var(--primary-foreground)",
              }}
            >
              {active === "textbook" ? "📖 Textbook" : "⚡ Compressed"}
            </span>
            <span className="text-[10px] text-[var(--t3)] font-mono">
              rate {activeRate.toFixed(2)}×
            </span>
          </div>

          <div className="font-d font-semibold text-xl text-[var(--t1)] leading-snug">
            {activeForm.text}
          </div>
          <div className="font-mono text-sm text-[var(--t3)] break-words">
            {activeForm.ipa}
          </div>

          <button
            onClick={() => playForm(active)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-90"
            style={{
              background: "var(--grad-btn)",
              color: "var(--primary-foreground)",
            }}
          >
            <Volume2 className="w-3.5 h-3.5" /> Hear
          </button>
        </motion.div>
      </AnimatePresence>

      {/* A/B Compare button + status */}
      <motion.button
        onClick={abPhase === "idle" ? playAB : stopAB}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition border border-[var(--border)]"
        style={{
          background: abPhase !== "idle" ? "var(--card-h)" : "var(--card)",
          color: "var(--t1)",
        }}
      >
        {abPhase !== "idle" ? (
          <>
            <Square className="w-3.5 h-3.5" /> Stop
          </>
        ) : (
          <>
            <Repeat className="w-4 h-4" /> A/B Compare
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {abPhase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl px-3 py-2 border border-[var(--border)] bg-[rgba(99,102,241,0.06)] text-xs font-mono text-[var(--t2)] text-center"
          >
            {abStatusLabel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual diff — show both forms side by side with highlights */}
      <div className="rounded-2xl p-4 border border-[var(--border)] bg-[rgba(99,102,241,0.04)] space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
          Visual diff — what got compressed
        </div>

        {/* Textbook row */}
        <div className="space-y-1">
          <div className="text-[10px] text-[var(--t3)] font-mono flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Textbook
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            {textbookTokens.map((tok, i) => {
              const reduced = isReduced(tok);
              return (
                <motion.span
                  key={`tb-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className="text-sm font-d text-[var(--t1)]"
                  style={{
                    textDecoration: reduced ? "line-through" : "none",
                    textDecorationColor: reduced
                      ? "rgba(239,68,68,0.6)"
                      : undefined,
                    textDecorationThickness: reduced ? "2px" : undefined,
                    color: reduced ? "var(--t3)" : "var(--t1)",
                  }}
                >
                  {tok}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* Arrow divider */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-[var(--t3)] text-xs"
          >
            ↓ compressed
          </motion.div>
        </div>

        {/* Compressed row */}
        <div className="space-y-1">
          <div className="text-[10px] text-[var(--t3)] font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" /> Compressed
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            {compressedTokens.map((tok, i) => {
              const fresh = isNew(tok);
              return (
                <motion.span
                  key={`cp-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.04, duration: 0.25 }}
                  className="text-sm font-d"
                  style={{
                    background: fresh ? "rgba(34,211,238,0.18)" : "transparent",
                    border: fresh
                      ? "1px solid rgba(34,211,238,0.5)"
                      : "1px solid transparent",
                    color: fresh ? "var(--c)" : "var(--t1)",
                    padding: fresh ? "1px 6px" : "1px 0",
                    borderRadius: fresh ? "6px" : "0",
                  }}
                >
                  {tok}
                </motion.span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
