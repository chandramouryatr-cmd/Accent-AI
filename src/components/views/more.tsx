"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { PHASES } from "@/lib/types";
import { getLessonsForPhase } from "@/lib/lessons";

export function MoreView() {
  const accent = useAppStore((s) => s.accent);
  const setAccent = useAppStore((s) => s.setAccent);
  const userName = useAppStore((s) => s.userName);
  const setUserName = useAppStore((s) => s.setUserName);
  const resetAll = useAppStore((s) => s.resetAll);
  const lessons = useAppStore((s) => s.lessons);
  const { theme, setTheme } = useTheme();
  const [showReset, setShowReset] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim().slice(0, 20));
      setEditingName(false);
    }
  };

  const handleReset = () => {
    resetAll();
    setShowReset(false);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="font-d text-3xl font-bold mb-1">
          <span className="grad-text">More</span>
        </h1>
        <p className="text-sm text-[var(--t2)]">Settings & options</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)] flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--grad-btn)] flex items-center justify-center text-2xl font-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          {editingName ? (
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg2)] border border-[var(--border2)] text-sm text-[var(--t1)] outline-none focus:border-[var(--p3)]"
                placeholder="Your name"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 rounded-lg bg-[var(--grad-btn)] text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <div className="font-d font-bold text-base text-[var(--t1)]">{userName}</div>
              <button
                onClick={() => {
                  setNameInput(userName);
                  setEditingName(true);
                }}
                className="text-xs text-[var(--p3)] hover:underline"
              >
                Edit name
              </button>
            </>
          )}
        </div>
      </div>

      {/* Accent selector */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Accent</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["usa", "uk"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccent(a)}
              className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 ${
                accent === a
                  ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <span className="text-2xl">{a === "usa" ? "🇺🇸" : "🇬🇧"}</span>
              <div className="text-left">
                <div className="text-sm font-semibold text-[var(--t1)]">
                  {a === "usa" ? "USA English" : "UK English"}
                </div>
                <div className="text-[10px] text-[var(--t3)]">
                  {a === "usa" ? "American" : "British RP"}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme selector */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">Appearance</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTheme("dark")}
            className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 ${
              theme === "dark"
                ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <span className="text-2xl">🌙</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-[var(--t1)]">Dark</div>
              <div className="text-[10px] text-[var(--t3)]">Easy on eyes</div>
            </div>
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`rounded-2xl p-4 border-2 transition flex items-center gap-3 ${
              theme === "light"
                ? "border-[var(--p)] bg-[rgba(99,102,241,0.1)]"
                : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <span className="text-2xl">☀️</span>
            <div className="text-left">
              <div className="text-sm font-semibold text-[var(--t1)]">Light</div>
              <div className="text-[10px] text-[var(--t3)]">Daytime</div>
            </div>
          </button>
        </div>
      </div>

      {/* Phase overview */}
      <div>
        <h2 className="font-d text-base font-bold mb-2">All Phases</h2>
        <div className="space-y-2">
          {PHASES.map((p) => {
            const phaseLessons = getLessonsForPhase(p.id);
            const done = phaseLessons.filter((l) => lessons[l.id]?.completed).length;
            const total = phaseLessons.length;
            const pct = total === 0 ? 0 : Math.round((done / total) * 100);
            return (
              <div
                key={p.id}
                className="rounded-xl p-3 bg-[var(--card)] border border-[var(--border)] flex items-center gap-3"
              >
                <div className="text-2xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[var(--t1)] truncate">
                    Phase {p.id + 1}: {p.name}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                    <motion.div
                      className="h-full bg-[var(--grad-btn)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
                <div className="text-xs font-mono text-[var(--t2)]">
                  {done}/{total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl p-5 bg-[var(--card)] border border-[var(--border)]">
        <h3 className="font-d font-bold text-base mb-2">About AccentAI</h3>
        <p className="text-xs text-[var(--t2)] leading-relaxed">
          AccentAI is a comprehensive English accent training app with 8 phases and 32 detailed lessons.
          Every lesson features interactive animations, real IPA phonetics, mouth-position diagrams,
          rhythm visualizations, and AI-powered feedback. Master native-level English one micro-skill at a time.
        </p>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--t3)]">
          <span className="px-2 py-0.5 rounded-full bg-[rgba(99,102,241,0.1)]">v1.0</span>
          <span>•</span>
          <span>32 lessons</span>
          <span>•</span>
          <span>16 interactive widgets</span>
        </div>
      </div>

      {/* Reset */}
      <div className="rounded-2xl p-5 bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.25)]">
        {showReset ? (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[#ef4444]">Reset all progress?</div>
            <p className="text-xs text-[var(--t2)]">
              This will erase your XP, streak, lesson progress, and badges. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-semibold text-[var(--t2)]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-[#ef4444] text-white text-xs font-semibold"
              >
                Yes, reset
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-3 text-left"
          >
            <div className="text-2xl">🔄</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#ef4444]">Start Fresh</div>
              <div className="text-[10px] text-[var(--t3)]">Reset all progress</div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
