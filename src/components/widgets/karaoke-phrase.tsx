"use client";

// Phase 3 — karaoke-style phrase with a bouncing ball that arcs from word to
// word as TTS plays. Bold/larger anchor words (content words) make the rhythm
// visible; the ball bounces higher before stressed words and squashes on
// landing. A progress bar tracks playback; words glow as the ball passes.

import { motion, useMotionValue, animate } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Square } from "lucide-react";
import type { KaraokeStep } from "@/lib/types";

interface Props {
  step: KaraokeStep;
  speak: (text: string) => void;
}

const BASE_MS = 460; // ms per duration unit
const BALL = 14; // ball diameter (px)

export function KaraokePhrase({ step, speak }: Props) {
  const { phrase, words, description, title } = step;
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const positionsRef = useRef<{ x: number; y: number }[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastIdxRef = useRef<number>(-1);

  // Motion values for the ball — updated every frame WITHOUT triggering React
  // re-renders. Only `currentIdx` (changes a few times per phrase) is React
  // state, so we get smooth 60fps motion + minimal render cost.
  const ballX = useMotionValue(0);
  const ballY = useMotionValue(0);
  const ballSX = useMotionValue(1);
  const ballSY = useMotionValue(1);
  const ballOpacity = useMotionValue(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const totalDuration = words.reduce((s, w) => s + (w.duration ?? 1) * BASE_MS, 0);

  // Measure each word's center-x and top-y relative to the container.
  // Called on mount, on play, and on resize-while-playing so the ball stays
  // aligned to the actual rendered word positions (which change with layout).
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    positionsRef.current = wordRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cRect.left, y: r.top - cRect.top };
    });
  }, []);

  const placeBallOn = useCallback((idx: number) => {
    const pos = positionsRef.current[idx];
    if (!pos) return;
    ballX.set(pos.x - BALL / 2);
    ballY.set(pos.y - BALL - 8);
    ballOpacity.set(1);
  }, [ballX, ballY, ballOpacity]);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsPlaying(false);
    setProgress(0);
    setCurrentIdx(-1);
    lastIdxRef.current = -1;
    placeBallOn(0);
  }, [placeBallOn]);

  const play = useCallback(() => {
    measure();
    const positions = positionsRef.current;
    if (positions.length === 0) return;

    placeBallOn(0);
    setIsPlaying(true);
    setIsFinished(false);
    setProgress(0);
    setCurrentIdx(0);
    lastIdxRef.current = 0;
    startRef.current = performance.now();
    speak(phrase);

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / totalDuration, 1);
      setProgress(p);

      // Find which word's interval we're currently in.
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < words.length; i++) {
        const d = (words[i].duration ?? 1) * BASE_MS;
        if (elapsed < acc + d) {
          idx = i;
          break;
        }
        acc += d;
        idx = i;
      }
      if (p >= 1) idx = words.length - 1;

      // On entering a new word: update highlight + squash-stretch on stressed.
      if (idx !== lastIdxRef.current) {
        lastIdxRef.current = idx;
        setCurrentIdx(idx);
        if (words[idx]?.stressed) {
          animate(ballSX, [1, 1.45, 0.8, 1], { duration: 0.45, ease: "easeOut" });
          animate(ballSY, [1, 0.55, 1.2, 1], { duration: 0.45, ease: "easeOut" });
        }
      }

      // Ball position: arc from previous word to current word during the first
      // 40% of the current word's interval, then dwell above the current word.
      const d = (words[idx].duration ?? 1) * BASE_MS;
      const localT = Math.max(0, Math.min(1, (elapsed - acc) / d));
      const arcRatio = 0.4;
      const prevPos = positions[idx - 1];
      const curPos = positions[idx];
      if (curPos) {
        if (idx === 0 || localT >= arcRatio) {
          ballX.set(curPos.x - BALL / 2);
          ballY.set(curPos.y - BALL - 8);
        } else if (prevPos) {
          const t = localT / arcRatio; // 0..1 across the arc phase
          const x = prevPos.x + (curPos.x - prevPos.x) * t;
          const baseY = Math.min(prevPos.y, curPos.y);
          // Higher arc before stressed words (karaoke "anticipation" bounce).
          const arcH = words[idx].stressed ? 56 : 26;
          const y = baseY - 4 * arcH * t * (1 - t); // parabola, peak at t=0.5
          ballX.set(x - BALL / 2);
          ballY.set(y - BALL - 8);
        }
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setIsPlaying(false);
        setIsFinished(true);
        setCurrentIdx(-1);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [measure, placeBallOn, words, totalDuration, ballX, ballY, ballSX, ballSY, speak, phrase]);

  // On mount: measure + place the ball on the first word (so the user sees
  // where the beat starts before pressing Play).
  useEffect(() => {
    measure();
    placeBallOn(0);
  }, [measure, placeBallOn]);

  // Cancel any in-flight rAF on unmount.
  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  // Re-measure on resize so ball stays aligned if layout reflows.
  useEffect(() => {
    const handler = () => {
      if (rafRef.current != null) measure();
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [measure]);

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        <div ref={containerRef} className="relative pt-12 pb-3 px-2 select-none">
          {/* Bouncing ball — positioned via motion values, lives above the words */}
          <motion.div
            aria-hidden
            className="absolute top-0 left-0 rounded-full pointer-events-none"
            style={{
              width: BALL,
              height: BALL,
              x: ballX,
              y: ballY,
              scaleX: ballSX,
              scaleY: ballSY,
              opacity: ballOpacity,
              background: "var(--p3)",
              boxShadow: "0 0 14px 2px rgba(217,70,239,0.55)",
            }}
          />
          <p className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-4 leading-relaxed">
            {words.map((w, i) => {
              const isCurrent = currentIdx === i;
              const baseColor = w.stressed ? "var(--t1)" : "var(--t2)";
              return (
                <span
                  key={i}
                  ref={(el: HTMLSpanElement | null) => {
                    wordRefs.current[i] = el;
                  }}
                  className={w.stressed ? "font-bold text-xl" : "text-base font-normal"}
                >
                  <motion.span
                    animate={{
                      color: isCurrent ? "var(--p3)" : baseColor,
                      scale: isCurrent ? 1.12 : 1,
                    }}
                    transition={{ duration: 0.18 }}
                    className="inline-block"
                  >
                    {w.text}
                  </motion.span>
                </span>
              );
            })}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, background: "var(--grad-btn)", transition: "width 80ms linear" }}
          />
        </div>

        {/* Play / Stop / Replay */}
        <div className="mt-4 flex items-center justify-center">
          {isPlaying ? (
            <button
              onClick={stop}
              className="rounded-lg px-4 py-2 bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-[var(--t1)] text-sm font-semibold flex items-center gap-2 hover:bg-[rgba(255,255,255,0.12)] transition"
            >
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
          ) : (
            <button
              onClick={play}
              className="rounded-lg px-4 py-2 bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition"
            >
              {isFinished ? (
                <><RotateCcw className="w-4 h-4" /> Replay</>
              ) : (
                <><Play className="w-4 h-4" /> Play</>
              )}
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--t3)] text-center">
          Bold words are content words — the ball bounces higher and lands on each beat as you hear it.
        </p>
      </div>
    </div>
  );
}
