"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

const TAGLINE = "Master Native-Level English";

export function Onboarding() {
  const [stage, setStage] = useState<"login" | "accent">("login");
  const [selectedAccent, setSelectedAccent] = useState<"usa" | null>(null);
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const setAccent = useAppStore((s) => s.setAccent);

  const handleLogin = () => setStage("accent");
  const handleSelectAccent = (a: "usa") => setSelectedAccent(a);
  const handleBegin = () => {
    if (selectedAccent) {
      setAccent(selectedAccent);
      setOnboarded(true);
    }
  };

  if (stage === "login") {
    return (
      <div className="light fixed inset-0 z-50 flex items-center justify-center p-6 bg-[var(--bg)]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-sm text-center"
        >
          {/* Logo — clean text + small dot */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <span className="font-d text-4xl font-bold tracking-tight text-[var(--t1)]">
              AccentAI
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--t1)] mb-2" />
          </div>

          {/* Single static tagline */}
          <p className="text-sm text-[var(--t2)] mb-12">
            {TAGLINE}
          </p>

          {/* Primary CTA — solid black */}
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium hover:opacity-80 transition"
          >
            Try Demo →
          </button>

          {/* Secondary action — simple underlined text link */}
          <button
            onClick={handleLogin}
            className="mt-5 text-sm text-[var(--t2)] underline underline-offset-4 decoration-[var(--border2)] hover:text-[var(--t1)] hover:decoration-[var(--t1)] transition"
          >
            Continue with Email
          </button>

          {/* Tiny gray terms */}
          <p className="mt-12 text-[10px] text-[var(--t3)]">
            By continuing you agree to our Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    );
  }

  // accent select
  const comingSoon = [
    { flag: "🇩🇪", name: "German" },
    { flag: "🇫🇷", name: "French" },
    { flag: "🇪🇸", name: "Spanish" },
    { flag: "🇮🇹", name: "Italian" },
    { flag: "🇯🇵", name: "Japanese" },
    { flag: "🇰🇷", name: "Korean" },
    { flag: "🇨🇳", name: "Chinese" },
    { flag: "🇧🇷", name: "Portuguese" },
  ];

  return (
    <div className="light fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto safe-top">
      <div className="max-w-md mx-auto px-5 pt-16 pb-10 min-h-full flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <h1 className="font-d text-3xl font-bold tracking-tight text-[var(--t1)] mb-2">
            Choose Your Accent
          </h1>
          <p className="text-sm text-[var(--t2)]">
            Select the accent you want to master first
          </p>
        </motion.div>

        {/* Primary accent options */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {/* USA — selectable */}
          <button
            onClick={() => handleSelectAccent("usa")}
            className={`relative rounded-xl p-5 text-center border transition bg-white ${
              selectedAccent === "usa"
                ? "border-black"
                : "border-[var(--border)] hover:border-[var(--border2)]"
            }`}
          >
            {selectedAccent === "usa" && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-black flex items-center justify-center text-white text-[9px]"
              >
                ✓
              </motion.span>
            )}
            <div className="text-4xl mb-2">🇺🇸</div>
            <div className="font-d font-semibold text-sm text-[var(--t1)]">
              USA English
            </div>
            <div className="text-xs text-[var(--t3)] mt-0.5">American Accent</div>
          </button>

          {/* UK — coming soon */}
          <div className="relative rounded-xl p-5 text-center border border-[var(--border)] bg-white opacity-50">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-[var(--bg2)] text-[var(--t2)]">
              Soon
            </div>
            <div className="text-4xl mb-2">🇬🇧</div>
            <div className="font-d font-semibold text-sm text-[var(--t1)]">
              UK English
            </div>
            <div className="text-xs text-[var(--t3)] mt-0.5">British RP</div>
          </div>
        </div>

        {/* Coming soon section */}
        <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono mb-2 px-1">
          Coming Soon
        </div>
        <div className="grid grid-cols-4 gap-2 mb-10">
          {comingSoon.map((l) => (
            <div
              key={l.name}
              className="rounded-xl p-2.5 text-center bg-white border border-[var(--border)] opacity-50"
            >
              <div className="text-2xl mb-0.5">{l.flag}</div>
              <div className="text-[10px] text-[var(--t3)]">{l.name}</div>
            </div>
          ))}
        </div>

        {/* Begin button — solid black */}
        <div className="mt-auto">
          <button
            onClick={handleBegin}
            disabled={!selectedAccent}
            className="w-full py-3 rounded-xl bg-black text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition"
          >
            Begin Journey →
          </button>

          {selectedAccent && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs text-[var(--t3)] mt-3"
            >
              You picked{" "}
              <span className="text-[var(--t1)] font-medium">USA English</span>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
