"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Mic, RotateCcw, Volume2 } from "lucide-react";
import type { RolePlayStep } from "@/lib/types";
import { MicWaveform } from "@/components/widgets/mic-waveform";

interface Props {
  step: RolePlayStep;
  speak: (text: string) => void;
}

interface UserResult {
  score: number;
  tip: string;
}

const TIPS = [
  "Your rising intonation on the question was good — keep it!",
  "Nice pacing — you held the stressed word long enough.",
  "Good rhythm — the unstressed words were light and quick.",
  "Watch the ending: native speakers soften the final consonant.",
  "Strong stress on the right syllable. Try linking into the next word.",
  "Clear vowels. Try dropping your pitch slightly at the end.",
  "Relaxed jaw — the reduced syllables blended smoothly.",
  "Loudness peaked on the right word. Keep that contrast sharp.",
];

function randomTip(): string {
  return TIPS[Math.floor(Math.random() * TIPS.length)]!;
}

function randomScore(): number {
  // 65–95 inclusive
  return Math.floor(Math.random() * (95 - 65 + 1)) + 65;
}

function scoreTone(score: number): { bg: string; fg: string } {
  if (score >= 85) return { bg: "rgba(34,197,94,0.18)", fg: "rgb(22,163,74)" };
  if (score >= 75) return { bg: "rgba(234,179,8,0.18)", fg: "rgb(161,98,7)" };
  return { bg: "rgba(239,68,68,0.18)", fg: "rgb(220,38,38)" };
}

export function RolePlay({ step, speak }: Props) {
  const { scenario, turns, title, description } = step;
  const [currentTurn, setCurrentTurn] = useState(0);
  const [userResults, setUserResults] = useState<Record<number, UserResult>>({});
  const [recordingTurn, setRecordingTurn] = useState<number | null>(null);
  const [recCountdown, setRecCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayedRef = useRef<Set<number>>(new Set());

  const visibleTurns = turns.slice(0, Math.min(currentTurn + 1, turns.length));
  const activeTurn = turns[currentTurn];
  const isLastTurn = currentTurn === turns.length - 1;

  const userTurnCount = useMemo(
    () => turns.filter((t) => t.speaker === "user").length,
    [turns],
  );

  const avgScore = useMemo(() => {
    const scores = Object.values(userResults).map((r) => r.score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [userResults]);

  // Auto-scroll to newest turn / recording UI
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [currentTurn, recordingTurn, userResults, completed, recCountdown]);

  // Auto-play coach turns once when they become the active turn
  useEffect(() => {
    if (completed) return;
    if (currentTurn >= turns.length) return;
    const turn = turns[currentTurn];
    if (!turn) return;
    if (turn.speaker !== "coach") return;
    if (autoPlayedRef.current.has(currentTurn)) return;
    autoPlayedRef.current.add(currentTurn);
    const t = setTimeout(() => speak(turn.text), 380);
    return () => clearTimeout(t);
  }, [currentTurn, turns, completed, speak]);

  // Recording countdown driver — fires when recordingTurn becomes non-null.
  // The initial countdown value (3) is set in `handleMic` so the effect body
  // never calls setState synchronously. Here we only arm the 1s interval that
  // ticks down 3 → 2 → 1 → 0 and finalizes the result.
  useEffect(() => {
    if (recordingTurn === null) return;
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setRecCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        const idx = recordingTurn;
        const score = randomScore();
        const tip = randomTip();
        setUserResults((prev) => ({ ...prev, [idx]: { score, tip } }));
        setRecordingTurn(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [recordingTurn]);

  const canAdvance = (() => {
    if (!activeTurn) return false;
    if (activeTurn.speaker === "coach") return true;
    return Boolean(userResults[currentTurn]);
  })();

  const handleMic = (turnIdx: number) => {
    if (recordingTurn !== null) return;
    if (userResults[turnIdx]) return;
    setRecCountdown(3);
    setRecordingTurn(turnIdx);
  };

  const handleNext = () => {
    if (!canAdvance) return;
    if (isLastTurn) {
      setCompleted(true);
      return;
    }
    setCurrentTurn((t) => Math.min(t + 1, turns.length - 1));
  };

  const handleReplay = () => {
    setCurrentTurn(0);
    setUserResults({});
    setCompleted(false);
    setRecordingTurn(null);
    setRecCountdown(0);
    autoPlayedRef.current.clear();
  };

  // ── Completion summary ───────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="space-y-4">
        {title && (
          <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl p-6 text-center border border-[var(--border)] bg-[rgba(99,102,241,0.04)]"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
            style={{ background: "var(--grad-btn)" }}
          >
            <CheckCircle2
              className="w-8 h-8"
              style={{ color: "var(--primary-foreground)" }}
            />
          </motion.div>
          <h5 className="font-d font-semibold text-xl text-[var(--t1)] mb-1">
            Role-play complete!
          </h5>
          <p className="text-[var(--t2)] text-sm mb-3">{scenario}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(99,102,241,0.10)] border border-[var(--border)]">
            <span className="text-sm text-[var(--t2)]">Avg score:</span>
            <span className="text-lg font-bold font-mono text-[var(--t1)]">
              {avgScore}%
            </span>
          </div>
          <p className="text-xs text-[var(--t3)] mt-3">
            You completed {userTurnCount} exchange{userTurnCount === 1 ? "" : "s"}.
            Replay the dialogue to push your average higher.
          </p>
        </motion.div>
        <button
          onClick={handleReplay}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-[var(--t1)] border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card-h)] transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Replay role-play
        </button>
      </div>
    );
  }

  // ── Active dialogue ──────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {title && (
        <h4 className="font-d font-semibold text-lg text-[var(--t1)]">{title}</h4>
      )}

      {/* Scenario header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl p-4 border border-[var(--border)] flex items-center gap-3"
        style={{ background: "var(--grad-btn)" }}
      >
        <span className="text-2xl" aria-hidden>
          🎭
        </span>
        <div className="min-w-0">
          <div
            className="text-[10px] uppercase tracking-wider font-mono"
            style={{ color: "var(--primary-foreground)", opacity: 0.6 }}
          >
            Scenario
          </div>
          <div
            className="font-d font-semibold text-sm"
            style={{ color: "var(--primary-foreground)" }}
          >
            {scenario}
          </div>
        </div>
      </motion.div>

      {description && (
        <p className="text-[var(--t2)] text-sm leading-relaxed">{description}</p>
      )}

      {/* Dialogue scroll area */}
      <div
        ref={scrollRef}
        className="max-h-96 overflow-y-auto rounded-2xl p-3 space-y-3 border border-[var(--border)] bg-[rgba(99,102,241,0.04)]"
        style={{ scrollbarWidth: "thin" }}
      >
        <AnimatePresence initial={false}>
          {visibleTurns.map((turn, idx) => {
            const isCoach = turn.speaker === "coach";
            const userResult = userResults[idx];
            const isRecording = recordingTurn === idx;
            const isActive = idx === currentTurn;
            return (
              <motion.div
                key={`${idx}-${turn.speaker}`}
                layout
                initial={{ opacity: 0, y: 16, x: isCoach ? -16 : 16 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex ${isCoach ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[88%] ${
                    isCoach ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: isCoach ? "var(--grad-btn)" : "rgba(34,211,238,0.85)",
                      color: isCoach ? "var(--primary-foreground)" : "#06222a",
                    }}
                    aria-hidden
                  >
                    {isCoach ? "🧑‍🏫" : "🧑"}
                  </div>

                  {/* Bubble */}
                  <div
                    className="rounded-2xl px-3.5 py-2.5 space-y-2 min-w-0"
                    style={{
                      background: isCoach ? "var(--grad-btn)" : "rgba(34,211,238,0.10)",
                      border: isCoach
                        ? "1px solid var(--border)"
                        : "1px solid rgba(34,211,238,0.35)",
                      color: isCoach ? "var(--primary-foreground)" : "var(--t1)",
                    }}
                  >
                    {turn.cue && (
                      <div
                        className="text-[10px] uppercase tracking-wider font-mono"
                        style={{
                          color: isCoach
                            ? "var(--primary-foreground)"
                            : "var(--t3)",
                          opacity: isCoach ? 0.6 : 1,
                        }}
                      >
                        {turn.cue}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed break-words">
                      {turn.text}
                    </div>

                    {/* Coach: Hear button (replayable any time) */}
                    {isCoach && (
                      <button
                        onClick={() => speak(turn.text)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-lg transition hover:opacity-80"
                        style={{
                          background: isCoach
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(34,211,238,0.18)",
                          color: isCoach ? "var(--primary-foreground)" : "var(--t1)",
                        }}
                      >
                        <Volume2 className="w-3 h-3" /> Hear
                      </button>
                    )}

                    {/* User: mic / recording / result */}
                    {!isCoach && (
                      <div className="space-y-2">
                        <AnimatePresence mode="wait">
                          {isRecording ? (
                            <motion.div
                              key="rec"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-1 overflow-hidden"
                            >
                              <div className="flex items-center gap-1.5 text-[11px] text-[var(--t3)] font-mono">
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Recording… {recCountdown}s
                              </div>
                              <MicWaveform height={44} active />
                            </motion.div>
                          ) : userResult ? (
                            <motion.div
                              key="res"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-1.5"
                            >
                              <div className="flex items-center gap-2 text-[11px] flex-wrap">
                                <span
                                  className="px-2 py-0.5 rounded-full font-bold font-mono"
                                  style={{
                                    background: scoreTone(userResult.score).bg,
                                    color: scoreTone(userResult.score).fg,
                                  }}
                                >
                                  {userResult.score}%
                                </span>
                                <span className="text-[var(--t3)]">
                                  intonation &amp; pacing
                                </span>
                              </div>
                              <p className="text-[11px] text-[var(--t2)] leading-relaxed">
                                💡 {userResult.tip}
                              </p>
                            </motion.div>
                          ) : (
                            <motion.button
                              key="mic"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => handleMic(idx)}
                              disabled={recordingTurn !== null || !isActive}
                              whileHover={
                                isActive && recordingTurn === null
                                  ? { scale: 1.02 }
                                  : {}
                              }
                              whileTap={
                                isActive && recordingTurn === null
                                  ? { scale: 0.98 }
                                  : {}
                              }
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition disabled:opacity-50"
                              style={{
                                borderColor: "rgba(34,211,238,0.5)",
                                color: "var(--t1)",
                                background: "rgba(34,211,238,0.10)",
                              }}
                            >
                              <Mic className="w-3 h-3" />
                              {isActive ? "Tap to respond" : "Locked"}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Next turn / Finish button */}
      <motion.button
        onClick={handleNext}
        disabled={!canAdvance}
        whileHover={canAdvance ? { scale: 1.01 } : {}}
        whileTap={canAdvance ? { scale: 0.99 } : {}}
        className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition"
        style={{
          background: "var(--grad-btn)",
          color: "var(--primary-foreground)",
        }}
      >
        {isLastTurn ? (
          <>
            <CheckCircle2 className="w-4 h-4" /> Finish role-play
          </>
        ) : (
          <>
            Next turn <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {!canAdvance && activeTurn?.speaker === "user" && (
        <p className="text-center text-[11px] text-[var(--t3)]">
          Tap your microphone to respond before continuing.
        </p>
      )}
    </div>
  );
}
