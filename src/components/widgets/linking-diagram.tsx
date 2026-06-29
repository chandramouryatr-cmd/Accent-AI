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
// Enhanced: multiple animated particles along flow lines, highlight glow
// on linked sound portions, arrow indicators showing direction, wave pattern
// between linked words, staggered entrance animation, phoneme badges.

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

  // Build a wave pattern path between two points (subtle sine wave along the arc)
  const wavePath = (x1: number, y1: number, x2: number, y2: number, segments: number = 12) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const arcHeight = -18;
    const amplitude = 3; // wave amplitude
    const points: string[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x1 + dx * t;
      // Quadratic bezier y + sine wave offset
      const baseY = y1 + dy * t + arcHeight * 4 * t * (1 - t);
      const waveOffset = Math.sin(t * Math.PI * 4) * amplitude * (1 - Math.abs(t - 0.5) * 2);
      const py = baseY + waveOffset;
      points.push(i === 0 ? `M ${px} ${py}` : `L ${px} ${py}`);
    }
    return points.join(" ");
  };

  // Check if a word is part of an active link
  const isWordInActiveLink = (idx: number) => {
    return linkFlow && links.some((l) => l.from === idx || l.to === idx);
  };

  // Determine which link pair is currently being highlighted during play
  // Use ref + interval to cycle without setState in effect body
  const [activeLinkIdx, setActiveLinkIdx] = useState(-1);
  const linkCycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (linkCycleRef.current) clearInterval(linkCycleRef.current);
    linkCycleRef.current = null;

    if (!linkFlow) return;
    let current = 0;
    // Defer the first setState so it's not synchronous within the effect
    const timeout = setTimeout(() => setActiveLinkIdx(0), 0);
    linkCycleRef.current = setInterval(() => {
      current = (current + 1) % links.length;
      setActiveLinkIdx(current);
    }, 800);
    return () => {
      clearTimeout(timeout);
      if (linkCycleRef.current) clearInterval(linkCycleRef.current);
    };
  }, [linkFlow, links.length]);

  // Reset activeLinkIdx when linkFlow turns off
  useEffect(() => {
    if (!linkFlow && activeLinkIdx !== -1) {
      const t = setTimeout(() => setActiveLinkIdx(-1), 0);
      return () => clearTimeout(t);
    }
  }, [linkFlow, activeLinkIdx]);

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
              const inActiveLink = isWordInActiveLink(i);
              // find any link where this is the "from" word
              const outgoingLink = links.find((l) => l.from === i);
              // find any link where this is the "to" word
              const incomingLink = links.find((l) => l.to === i);
              return (
                <motion.div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  initial={{ y: 30, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, scale: 1.04 }}
                  transition={{ delay: i * 0.15, type: "spring", stiffness: 200, damping: 15 }}
                  className="relative"
                >
                  <motion.div
                    className="rounded-xl px-4 py-2.5 font-d text-base cursor-pointer select-none relative overflow-hidden"
                    animate={{
                      boxShadow: isGlowing
                        ? "0 0 20px rgba(167,139,250,0.8)"
                        : inActiveLink
                          ? "0 0 12px rgba(167,139,250,0.4)"
                          : "0 0 0px rgba(0,0,0,0)",
                      backgroundColor: isGlowing
                        ? "rgba(167,139,250,0.22)"
                        : inActiveLink
                          ? "rgba(99,102,241,0.18)"
                          : "rgba(99,102,241,0.1)",
                      borderColor: isGlowing
                        ? "rgba(167,139,250,0.8)"
                        : inActiveLink
                          ? "rgba(99,102,241,0.5)"
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

                    {/* Highlight glow overlay on linked portion */}
                    {inActiveLink && (
                      <motion.div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.15), transparent)",
                        }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
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

                  {/* Arrow indicator for incoming link */}
                  {incomingLink && linkFlow && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 text-xs"
                      style={{ color: LINK_COLORS[incomingLink.type] }}
                    >
                      ▸
                    </motion.div>
                  )}

                  {/* Arrow indicator for outgoing link */}
                  {outgoingLink && linkFlow && (
                    <motion.div
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="absolute right-0 top-1/2 translate-x-3 -translate-y-1/2 text-xs"
                      style={{ color: LINK_COLORS[outgoingLink.type] }}
                    >
                      ▸
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
              <defs>
                {/* Glow filter for active links */}
                <filter id="link-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {linePoints.map((lp, i) => {
                const linkType = links.find((l) => l.from === lp.from && l.to === lp.to)?.type || "consonant-vowel";
                const color = LINK_COLORS[linkType];
                const isActiveLink = i === activeLinkIdx && linkFlow;
                const curve = curvePath(lp.x1, lp.y1, lp.x2, lp.y2);
                const wave = wavePath(lp.x1, lp.y1, lp.x2, lp.y2);

                // Arrowhead at destination — calculate direction at endpoint
                const arrowSize = 5;
                // Direction from control point to endpoint
                const midX = (lp.x1 + lp.x2) / 2;
                const midY = Math.min(lp.y1, lp.y2) - 18;
                const angle = Math.atan2(lp.y2 - midY, lp.x2 - midX);
                const arrowX1 = lp.x2 - arrowSize * Math.cos(angle - Math.PI / 6);
                const arrowY1 = lp.y2 - arrowSize * Math.sin(angle - Math.PI / 6);
                const arrowX2 = lp.x2 - arrowSize * Math.cos(angle + Math.PI / 6);
                const arrowY2 = lp.y2 - arrowSize * Math.sin(angle + Math.PI / 6);

                return (
                  <g key={i}>
                    {/* Subtle wave pattern between linked words */}
                    <motion.path
                      d={wave}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.15"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: linkFlow ? 1 : 0.3 }}
                      transition={{ duration: 1.2, delay: linkFlow ? i * 0.15 : 0 }}
                    />

                    {/* Main curved flow line */}
                    <motion.path
                      d={curve}
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
                      filter={isActiveLink ? "url(#link-glow)" : undefined}
                    />

                    {/* Animated particles along the curve — 3 staggered particles */}
                    {linkFlow && [0, 1, 2].map((particle) => (
                      <motion.circle
                        key={`particle-${particle}`}
                        r={2.5 - particle * 0.5}
                        fill={color}
                        opacity={0.9 - particle * 0.2}
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: ["0%", "100%"] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.15 + particle * 0.25,
                          ease: "easeInOut",
                        }}
                        style={{ offsetPath: `path("${curve}")` }}
                      />
                    ))}

                    {/* Arrowhead at destination showing flow direction */}
                    <motion.polygon
                      points={`${lp.x2},${lp.y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                      fill={color}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: linkFlow ? 0.9 : 0.3,
                        scale: linkFlow ? 1 : 0.6,
                      }}
                      transition={{ duration: 0.3, delay: linkFlow ? i * 0.15 + 0.3 : 0 }}
                      style={{ transformOrigin: `${lp.x2}px ${lp.y2}px` }}
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
