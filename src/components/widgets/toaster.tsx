"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useToastStore, TOAST_GRADIENT } from "@/lib/toast-store";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-2 pointer-events-none safe-top px-3 w-full max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => {
          const gradient = t.gradient ?? TOAST_GRADIENT[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto relative w-full overflow-hidden rounded-2xl shadow-2xl"
              style={{
                background: gradient,
                boxShadow:
                  "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset",
              }}
            >
              {/* Shimmer sweep on entry */}
              <motion.div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                initial={{ x: "-120%" }}
                animate={{ x: "260%" }}
                transition={{ duration: 1.1, ease: "easeInOut", delay: 0.05 }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                  width: "60%",
                }}
              />
              {/* Subtle floating sparkle particles on badge/milestone toasts */}
              {(t.variant === "badge" || t.variant === "milestone") && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[..."✨⭐💫🌟"].map((ch, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-xs opacity-70"
                      style={{ left: `${15 + i * 25}%`, top: "10%" }}
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: [0, 36, 0], opacity: [0, 0.9, 0] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        delay: i * 0.18,
                        ease: "easeInOut",
                      }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              )}

              <div className="relative flex items-center gap-3 p-3.5 pr-9">
                <motion.div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                >
                  {t.emoji ?? ""}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm font-d truncate">
                    {t.title}
                  </div>
                  {t.subtitle && (
                    <div className="text-white/90 text-xs mt-0.5 truncate">
                      {t.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar showing time-to-dismiss */}
              {t.duration && t.duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-white/40"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: t.duration / 1000,
                    ease: "linear",
                  }}
                />
              )}

              <button
                onClick={() => dismiss(t.id)}
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
