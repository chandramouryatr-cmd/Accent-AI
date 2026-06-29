"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface Burst {
  id: number;
  amount: number;
  ts: number;
}

/**
 * XPBurst — watches the global `xp` value and emits a floating "+N XP"
 * animation whenever it increases. Mounted once at the app shell level.
 *
 * The animation rises from the top-right XP pill (where the user's total
 * XP is displayed in the header) and fades out as it floats upward,
 * with sparkle particles trailing behind for visual delight.
 */
export function XPBurst() {
  const xp = useAppStore((s) => s.xp);
  const prevXpRef = useRef(xp);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const burstIdRef = useRef(0);

  useEffect(() => {
    const prev = prevXpRef.current;
    if (xp > prev) {
      const amount = xp - prev;
      const id = ++burstIdRef.current;
      setBursts((b) => [...b, { id, amount, ts: Date.now() }]);
      // Auto-remove after animation completes
      window.setTimeout(() => {
        setBursts((b) => b.filter((x) => x.id !== id));
      }, 2400);
    }
    prevXpRef.current = xp;
  }, [xp]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="absolute top-12 right-4 sm:right-6 flex items-center gap-1.5"
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -90, scale: 0.9 }}
            transition={{
              duration: 1.6,
              ease: "easeOut",
              scale: { duration: 0.3, type: "spring", stiffness: 380, damping: 14 },
            }}
          >
            {/* Glow halo */}
            <div
              className="absolute inset-0 -m-3 rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)",
                filter: "blur(6px)",
              }}
            />
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a78bfa] shadow-[0_0_20px_rgba(139,92,246,0.55)] border border-white/20">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
              <span className="font-mono font-bold text-sm text-white tracking-wide">
                +{burst.amount} XP
              </span>
            </div>
            {/* Trailing sparkle particles */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#a78bfa" : "#22d3ee",
                  boxShadow: `0 0 6px ${i % 2 === 0 ? "rgba(167,139,250,0.8)" : "rgba(34,211,238,0.8)"}`,
                  left: `${20 + i * 8}px`,
                  top: `${10 + (i % 2) * 8}px`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: [0, (i - 2) * 14],
                  y: [0, 30 + i * 6],
                }}
                transition={{
                  duration: 1.4,
                  delay: 0.1 + i * 0.04,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
