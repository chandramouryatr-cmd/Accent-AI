"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LinkingStep } from "@/lib/types";

interface Props {
  step: LinkingStep;
  speak: (text: string) => void;
}

// Connected-speech linking visualization.
// Words are shown as cards; curved animated SVG flow lines link them.
// Enhanced: animated SVG curves with dashed flow, sequential "play linked"
// (words glow in sequence, then link lines animate), "play separate" button
// (words play with gaps), visual phoneme badges between words, hover lift.

const LINK_COLORS: Record<string, string> = {
  "consonant-vowel": "#22d3ee",
  "consonant-consonant": "#ec4899",
  "vowel-vowel": "#f59e0b",
};

// Resulting phoneme displayed between linked words (decorative — derived from link type)
const LINK_PHONEME: Record<string, string> = {
  "consonant-vowel": "C→V",
  "consonant-consonant": "C·C",
  "vowel-vowel": "/j/",
};

export function LinkingDiagram({ step, speak }: Props) {
  const { words, links, description, title } = step;
  const [glowIdx, setGlowIdx] = useState(-1); // which word is glowing
  const [linkFlow, setLinkFlow] = useState(false); // animate link lines
  const [playingLinked, setPlayingLinked] = useState(false);
  const [playingSeparate, setPlayingSeparate] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Word card layout — we use a stable layout based on word widths
  // The SVG overlay sits absolutely on top of the word row
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [linePoints, setLinePoints] = useState<{ from: number; to: number; x1: number; y1: number; x2: number; y2: number }[]>([]);

  // After mount, measure card positions
  useEffect(() => {
    const measure = () => {
      const container = cardRefs.current[0]?.parentElement;
      if (!container) return;
      const cBox = container.getBoundingClientRect();
      const next: typeof linePoints = [];
      links.forEach((l) => {
        const a = cardRefs.current[l.from];
        const b = cardRefs.current[l.to];
        if (!a || !b) return;
        const aBox = a.getBoundingClientRect();
        const bBox = b.getBoundingClientRect();
        next.push({
          from: l.from,
          to: l.to,
          x1: aBox.right - cBox.left,
          y1: aBox.top - cBox.top + aBox.height / 2,
          x2: bBox.left - cBox.left,
          y2: bBox.top - cBox.top + bBox.height / 2,
        });
      });
      setLinePoints(next);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [links, words]);

  // Play linked — glow words in sequence, then animate link lines, then speak full phrase
  const playLinked = () => {
    if (playingLinked || playingSeparate) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setPlayingLinked(true);

    words.forEach((_, i) => {
      const t = setTimeout(() => setGlowIdx(i), i * 280);
      timersRef.current.push(t);
    });
    const flowStart = words.length * 280 + 100;
    const flowT = setTimeout(() => setLinkFlow(true), flowStart);
    const speakT = setTimeout(() => speak(words.join(" ")), flowStart + 400);
    const reset = setTimeout(() => {
      setGlowIdx(-1);
      setLinkFlow(false);
      setPlayingLinked(false);
    }, flowStart + 2400);
    timersRef.current.push(flowT, speakT, reset);
  };

  // Play separate — speak each word with a gap (no link animation)
  const playSeparate = () => {
    if (playingLinked || playingSeparate) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setPlayingSeparate(true);

    words.forEach((w, i) => {
      const t1 = setTimeout(() => {
        setGlowIdx(i);
        speak(w);
      }, i * 700);
      const t2 = setTimeout(() => setGlowIdx(-1), i * 700 + 500);
      timersRef.current.push(t1, t2);
    });
    const end = setTimeout(() => setPlayingSeparate(false), words.length * 700 + 200);
    timersRef.current.push(end);
  };

  useEffect(() => () => { timersRef.current.forEach((t) => clearTimeout(t)); }, []);

  // Build curved path between two points
  const curvePath = (x1: number, y1: number, x2: number, y2: number) => {
    const midX = (x1 + x2) / 2;
    const midY = Math.min(y1, y2) - 18; // arc upward
    return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
  };

  return (
    <div className="space-y-3">
      {title && <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>}
      {description && <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>}

      <div className="rounded-2xl p-5 bg-[rgba(99,102,241,0.04)] border border-[var(--border)]">
        {/* Word cards row with absolutely-positioned SVG overlay */}
        <div className="relative py-3">
          <div className="flex flex-wrap items-center justify-center gap-3 relative">
            {words.map((w, i) => {
              const isGlowing = glowIdx === i;
              // find any link where this is the "from" word
              const outgoingLink = links.find((l) => l.from === i);
              return (
                <motion.div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ y: -4, scale: 1.04 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  <motion.div
                    className="rounded-xl px-4 py-2.5 font-d text-base cursor-pointer select-none"
                    animate={{
                      boxShadow: isGlowing
                        ? "0 0 20px rgba(167,139,250,0.8)"
                        : "0 0 0px rgba(0,0,0,0)",
                      backgroundColor: isGlowing
                        ? "rgba(167,139,250,0.22)"
                        : "rgba(99,102,241,0.1)",
                      borderColor: isGlowing
                        ? "rgba(167,139,250,0.8)"
                        : "rgba(99,102,241,0.3)",
                    }}
                    style={{
                      border: "1px solid rgba(99,102,241,0.3)",
                      background: "rgba(99,102,241,0.1)",
                    }}
                    onClick={() => {
                      setGlowIdx(i);
                      speak(w);
                      window.setTimeout(() => setGlowIdx(-1), 600);
                    }}
                  >
                    {w}
                  </motion.div>

                  {/* Resulting phoneme badge below outgoing link */}
                  {outgoingLink && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: linkFlow ? 1 : 0.6, opacity: linkFlow ? 1 : 0.5 }}
                      transition={{ type: "spring", delay: linkFlow ? 0.1 : 0 }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold whitespace-nowrap z-10"
                      style={{
                        background: LINK_COLORS[outgoingLink.type],
                        color: outgoingLink.type === "consonant-consonant" ? "white" : "black",
                      }}
                    >
                      {LINK_PHONEME[outgoingLink.type]}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* SVG overlay for curved flow lines */}
          {linePoints.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
              style={{ overflow: "visible" }}
            >
              {linePoints.map((lp, i) => {
                const linkType = links.find((l) => l.from === lp.from && l.to === lp.to)?.type || "consonant-vowel";
                const color = LINK_COLORS[linkType];
                return (
                  <g key={i}>
                    <motion.path
                      d={curvePath(lp.x1, lp.y1, lp.x2, lp.y2)}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4,3"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: linkFlow ? 1 : 0.35,
                        opacity: linkFlow ? 0.95 : 0.4,
                      }}
                      transition={{ duration: linkFlow ? 0.6 : 0.3, delay: linkFlow ? i * 0.15 : 0 }}
                    />
                    {/* Animated flowing dot along the curve */}
                    {linkFlow && (
                      <motion.circle
                        r="3"
                        fill={color}
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: ["0%", "100%"] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        style={{ offsetPath: `path("${curvePath(lp.x1, lp.y1, lp.x2, lp.y2)}")` }}
                      />
                    )}
                    {/* Arrowhead at the destination */}
                    <motion.circle
                      cx={lp.x2}
                      cy={lp.y2}
                      r="2"
                      fill={color}
                      animate={{ opacity: linkFlow ? [0.4, 1, 0.4] : 0.4 }}
                      transition={{ duration: 0.8, repeat: linkFlow ? Infinity : 0 }}
                    />
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22d3ee]" />
            <span className="text-[var(--t2)]">C–V link</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ec4899]" />
            <span className="text-[var(--t2)]">C–C link</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span className="text-[var(--t2)]">V–V glide</span>
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={playLinked}
            disabled={playingLinked || playingSeparate}
            className="flex-1 rounded-xl py-2.5 px-4 bg-[var(--grad-btn)] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
          >
            ▶ Hear linked
          </button>
          <button
            onClick={playSeparate}
            disabled={playingLinked || playingSeparate}
            className="flex-1 rounded-xl py-2.5 px-4 bg-[rgba(255,255,255,0.06)] border border-[var(--border)] text-[var(--t1)] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[rgba(255,255,255,0.1)] transition disabled:opacity-50"
          >
            ▶ Hear separate
          </button>
        </div>
        {(playingLinked || playingSeparate) && (
          <p className="mt-2 text-center text-[11px] text-[var(--t3)]">
            {playingLinked ? "Linked: words flow together" : "Separate: gaps between each word"}
          </p>
        )}
      </div>
    </div>
  );
}
