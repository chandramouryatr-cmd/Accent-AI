"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AICoachChat } from "./ai-coach-chat";

const ONBOARDING_SEEN_KEY = "accentai-coach-onboarding-seen";

export function AICoachFAB() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const activeLessonId = useAppStore((s) => s.activeLessonId);

  // Show the onboarding hint after a short delay, unless previously dismissed.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(ONBOARDING_SEEN_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (!seen) {
      const t = setTimeout(() => setShowHint(true), 1400);
      return () => clearTimeout(t);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setShowHint(false);
    try {
      window.localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Hide the FAB when a lesson modal is open.
  const isHidden = !!activeLessonId;

  return (
    <>
      <AnimatePresence>
        {!isHidden && (
          <motion.div
            className="fixed bottom-20 right-4 z-40 flex items-end gap-2"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            {/* Onboarding hint bubble */}
            <AnimatePresence>
              {showHint && !open && (
                <motion.button
                  onClick={handleOpen}
                  className="hidden sm:flex items-center gap-1.5 mb-1 px-3 py-2 rounded-2xl rounded-br-sm bg-[var(--card)] border border-[var(--border2)] text-xs text-[var(--t1)] backdrop-blur-md shadow-[0_4px_18px_rgba(0,0,0,0.4)]"
                  initial={{ opacity: 0, x: 12, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  aria-label="Ask me anything — open chat"
                >
                  <span className="relative flex items-center">
                    <span className="absolute inset-0 rounded-full bg-[var(--p3)] animate-ping opacity-40" />
                    <span className="relative">Ask me anything! 💬</span>
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* FAB button */}
            <motion.button
              onClick={handleOpen}
              aria-label="Open AccentAI Coach chat"
              className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_28px_rgba(99,102,241,0.5)]"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              {/* Gradient orb */}
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #8b5cf6 120deg, #22d3ee 240deg, #6366f1 360deg)",
                }}
              />
              {/* Pulsing glow rings */}
              <motion.span
                className="absolute -inset-1.5 rounded-full -z-10"
                style={{
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(139,92,246,0.25) 50%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 0.35, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Rotating sheen */}
              <motion.span
                className="absolute inset-0 rounded-full overflow-hidden"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
              >
                <span
                  className="absolute -inset-2"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                  }}
                />
              </motion.span>
              {/* Inner glass circle + icon */}
              <span className="relative w-10 h-10 rounded-full bg-[rgba(7,7,15,0.55)] backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AICoachChat open={open} onClose={() => setOpen(false)} />
    </>
  );
}
