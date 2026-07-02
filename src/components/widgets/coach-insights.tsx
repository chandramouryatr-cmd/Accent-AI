"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Target,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { ALL_LESSONS } from "@/lib/lessons";

// ─── Types ───────────────────────────────────────────────────────────────

interface PhonemeScore {
  phoneme: string;
  example?: string;
  score: number;
  count?: number;
  /** best lesson id to practice this phoneme */
  lessonId?: string;
}

interface FocusArea {
  phoneme: string;
  score: number;
  reason: string;
}

interface RecommendedLesson {
  phase: number;
  lesson: string;
  reason: string;
}

interface InsightsPlan {
  focusAreas: FocusArea[];
  recommendedLessons: RecommendedLesson[];
  tips: string[];
}

type ViewState = "idle" | "loading" | "success" | "error";

interface CachedInsight {
  parsed: InsightsPlan | null;
  rawText: string | null;
  generatedAt: number;
  /** snapshot of phoneme mastery signature (for invalidation) */
  signature: string;
}

// ─── Phoneme → lessons mapping (kept in sync with PhonemeMastery widget) ─

const PHONEME_LESSONS: Record<string, { ids: string[]; example: string }> = {
  ð: { ids: ["p1l2", "p1l3", "p1l4"], example: "the, this, mother" },
  θ: { ids: ["p1l2", "p1l3", "p1l4"], example: "think, three, bath" },
  æ: { ids: ["p1l1", "p1l4", "p2l1"], example: "cat, bad, ask" },
  ŋ: { ids: ["p1l2", "p2l1", "p2l3"], example: "sing, going, think" },
  ɪ: { ids: ["p1l1", "p2l1", "p2l4"], example: "ship, sit, bit" },
  ʊ: { ids: ["p1l1", "p2l1", "p2l4"], example: "book, put, good" },
  "ɜː": { ids: ["p1l1", "p2l1", "p5l2"], example: "bird, work, learn" },
  ʒ: { ids: ["p1l2", "p2l1", "p5l3"], example: "measure, vision" },
  "ɑː": { ids: ["p1l1", "p2l1"], example: "father, car" },
  "iː": { ids: ["p1l1", "p1l4"], example: "see, sheep, eat" },
  "uː": { ids: ["p1l1", "p1l4"], example: "food, pool, two" },
  r: { ids: ["p1l3", "p4l1"], example: "red, around, very" },
};

const STORAGE_KEY_PREFIX = "accentai-coach-insights-";
const FIRST_TOKEN_TIMEOUT_MS = 30_000;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function storageKeyForToday() {
  return `${STORAGE_KEY_PREFIX}${todayStr()}`;
}

// ─── Phoneme mastery derivation ──────────────────────────────────────────

function derivePhonemeMastery(
  lessons: Record<string, { completed?: boolean; score: number }>
): PhonemeScore[] {
  const out: PhonemeScore[] = [];
  for (const [ph, { ids, example }] of Object.entries(PHONEME_LESSONS)) {
    const relevant = ids
      .map((id) => lessons[id])
      .filter((l) => l?.completed);
    if (relevant.length === 0) continue;
    const avg = Math.round(
      relevant.reduce((s, l) => s + l.score, 0) / relevant.length
    );
    const sortedById = [...relevant].sort((a, b) => a.score - b.score);
    const bestLessonId =
      ids.find((id) => lessons[id] === sortedById[0]) || ids[0];
    out.push({
      phoneme: ph,
      example,
      score: avg,
      count: relevant.length,
      lessonId: bestLessonId,
    });
  }
  out.sort((a, b) => a.score - b.score);
  return out;
}

// ─── JSON parsing helpers (robust against markdown / extra text) ─────────

function extractJson(text: string): InsightsPlan | null {
  if (!text) return null;
  const trimmed = text.trim();

  // Attempt 1: direct parse
  try {
    return normalizePlan(JSON.parse(trimmed));
  } catch {
    /* continue */
  }

  // Attempt 2: unwrap ```json ... ``` or ``` ... ``` fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      return normalizePlan(JSON.parse(fenceMatch[1].trim()));
    } catch {
      /* continue */
    }
  }

  // Attempt 3: grab substring between first { and last }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return normalizePlan(JSON.parse(slice));
    } catch {
      /* continue */
    }
  }

  return null;
}

function normalizePlan(raw: unknown): InsightsPlan | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const focusAreas = Array.isArray(obj.focusAreas)
    ? (obj.focusAreas as unknown[])
        .map((item) => normalizeFocusArea(item))
        .filter((x): x is FocusArea => x !== null)
    : [];
  const recommendedLessons = Array.isArray(obj.recommendedLessons)
    ? (obj.recommendedLessons as unknown[])
        .map((item) => normalizeRecommendedLesson(item))
        .filter((x): x is RecommendedLesson => x !== null)
    : [];
  const tips = Array.isArray(obj.tips)
    ? (obj.tips as unknown[])
        .map((t) => (typeof t === "string" ? t : String(t ?? "")))
        .filter((s) => s.length > 0)
        .slice(0, 4)
    : [];

  if (focusAreas.length === 0 && recommendedLessons.length === 0 && tips.length === 0) {
    return null;
  }
  return { focusAreas, recommendedLessons, tips };
}

function normalizeFocusArea(item: unknown): FocusArea | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;
  const phoneme =
    typeof obj.phoneme === "string"
      ? obj.phoneme.replace(/^\/+|\/+$/g, "").trim()
      : "";
  const score =
    typeof obj.score === "number"
      ? Math.max(0, Math.min(100, Math.round(obj.score)))
      : typeof obj.score === "string"
      ? parseInt(obj.score, 10) || 0
      : 0;
  const reason =
    typeof obj.reason === "string" ? obj.reason : typeof obj.reason === "object" && obj.reason ? JSON.stringify(obj.reason) : "";
  if (!phoneme) return null;
  return { phoneme, score, reason };
}

function normalizeRecommendedLesson(item: unknown): RecommendedLesson | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;
  const phase =
    typeof obj.phase === "number"
      ? Math.max(1, Math.min(8, Math.round(obj.phase)))
      : typeof obj.phase === "string"
      ? parseInt(obj.phase, 10) || 1
      : 1;
  const lesson = typeof obj.lesson === "string" ? obj.lesson : "";
  const reason =
    typeof obj.reason === "string"
      ? obj.reason
      : typeof obj.reason === "object" && obj.reason
      ? JSON.stringify(obj.reason)
      : "";
  if (!lesson) return null;
  return { phase, lesson, reason };
}

// ─── Sub-components ──────────────────────────────────────────────────────

function FocusAreaCard({ area, index }: { area: FocusArea; index: number }) {
  const label =
    area.score >= 85
      ? "Mastered"
      : area.score >= 70
      ? "Progressing"
      : "Needs work";
  // Semantic accent (meaningful: green = mastered, amber = progressing, red = needs work)
  const accent =
    area.score >= 85
      ? "var(--gr)"
      : area.score >= 70
      ? "var(--yl)"
      : "var(--rd)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        delay: index * 0.06,
      }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3.5"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-base font-bold shrink-0 bg-[var(--card-h)] border border-[var(--border)] text-[var(--t1)]">
          /{area.phoneme}/
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-[0.1em] font-mono text-[var(--t3)] flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: accent }}
                aria-hidden
              />
              {label}
            </span>
            <span className="font-mono text-sm font-bold text-[var(--t1)] tabular-nums">
              {area.score}
              <span className="text-[var(--t3)] text-[10px] font-normal ml-0.5">
                %
              </span>
            </span>
          </div>
          {/* Thin score bar: var(--border) track, semantic fill */}
          <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${area.score}%` }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                delay: index * 0.06 + 0.1,
              }}
              className="h-full rounded-full"
              style={{ background: accent }}
            />
          </div>
        </div>
      </div>
      {area.reason && (
        <p className="text-xs text-[var(--t2)] leading-relaxed mt-3 pt-3 border-t border-[var(--border)]">
          {area.reason}
        </p>
      )}
    </motion.div>
  );
}

function RecommendedLessonCard({
  rec,
  index,
  onOpen,
}: {
  rec: RecommendedLesson;
  index: number;
  onOpen: (lessonTitle: string) => void;
}) {
  // Find the matching lesson by title (case-insensitive trim)
  const lesson = useMemo(() => {
    const title = rec.lesson.trim().toLowerCase();
    return (
      ALL_LESSONS.find((l) => l.title.trim().toLowerCase() === title) ||
      ALL_LESSONS.find(
        (l) => l.phaseId === rec.phase - 1 && l.title.trim().toLowerCase().includes(title.slice(0, 8))
      )
    );
  }, [rec.lesson, rec.phase]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        delay: 0.1 + index * 0.06,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => lesson && onOpen(lesson.title)}
      disabled={!lesson}
      className="w-full text-left bg-[var(--card)] border border-[var(--border)] rounded-lg p-3.5 hover:border-[var(--border2)] hover:bg-[var(--card-h)] transition group"
      style={{ cursor: lesson ? "pointer" : "default" }}
      aria-label={`Open lesson: ${rec.lesson}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--card-h)] border border-[var(--border)] flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-[var(--t1)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded bg-[var(--card-h)] text-[var(--t3)] border border-[var(--border)] shrink-0">
              P{rec.phase}
            </span>
            <span className="font-d text-sm font-bold text-[var(--t1)] truncate">
              {rec.lesson}
            </span>
          </div>
          {rec.reason && (
            <p className="text-xs text-[var(--t2)] leading-relaxed line-clamp-2">
              {rec.reason}
            </p>
          )}
        </div>
        {lesson && (
          <ChevronRight className="w-4 h-4 text-[var(--t3)] group-hover:text-[var(--t1)] group-hover:translate-x-0.5 transition shrink-0" />
        )}
      </div>
    </motion.button>
  );
}

function TipItem({ tip, index }: { tip: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
      className="flex items-start gap-3"
    >
      <span
        className="font-mono text-[10px] font-bold text-[var(--t3)] mt-0.5 shrink-0 tabular-nums"
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-xs text-[var(--t2)] leading-relaxed flex-1">
        {tip}
      </span>
    </motion.li>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-1"
    >
      {/* Spinner + status row */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--p)] animate-spin shrink-0" />
        <div>
          <div className="text-sm font-d font-semibold text-[var(--t1)]">
            Analyzing your pronunciation…
          </div>
          <div className="text-[11px] text-[var(--t3)] mt-0.5 font-mono">
            Reading phoneme scores · picking lessons · crafting tips
          </div>
        </div>
      </div>

      {/* Skeleton — Focus Areas preview */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3.5 h-3.5 rounded-sm bg-[var(--card-h)] animate-pulse" />
          <div className="h-3 w-28 rounded bg-[var(--card-h)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-[var(--border)] p-3.5"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-12 h-12 rounded-xl bg-[var(--card-h)] animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-20 rounded bg-[var(--card-h)] animate-pulse" />
                  <div className="h-1 w-full rounded bg-[var(--card-h)] animate-pulse" />
                </div>
              </div>
              <div className="h-2 w-3/4 rounded bg-[var(--card-h)] animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Skeleton — Recommended Lessons preview */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3.5 h-3.5 rounded-sm bg-[var(--card-h)] animate-pulse" />
          <div className="h-3 w-32 rounded bg-[var(--card-h)] animate-pulse" />
        </div>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--border)] p-3.5 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--card-h)] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-2/3 rounded bg-[var(--card-h)] animate-pulse" />
              <div className="h-2 w-1/2 rounded bg-[var(--card-h)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function CoachInsights() {
  const lessons = useAppStore((s) => s.lessons);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const accent = useAppStore((s) => s.accent);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);

  const [view, setView] = useState<ViewState>("idle");
  const [parsed, setParsed] = useState<InsightsPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Derive phoneme mastery data (weakest first)
  const phonemeMastery = useMemo(() => derivePhonemeMastery(lessons), [lessons]);

  // Build a signature so cache invalidates if phoneme scores change
  const signature = useMemo(() => {
    return phonemeMastery
      .map((p) => `${p.phoneme}:${p.score}:${p.count ?? 0}`)
      .join("|");
  }, [phonemeMastery]);

  const completedCount = useMemo(
    () => Object.values(lessons).filter((l) => l?.completed).length,
    [lessons]
  );

  // Load cached insights for today on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKeyForToday());
      if (!raw) return;
      const cached = JSON.parse(raw) as CachedInsight;
      // Only restore if the phoneme signature hasn't materially changed
      // (allow restore even if signature differs by a little — focus on date key)
      if (cached && (cached.parsed || cached.rawText)) {
        setParsed(cached.parsed);
        setRawText(cached.rawText);
        setView("success");
      }
    } catch {
      /* ignore malformed cache */
    }
  }, []);

  // Cleanup any in-flight request on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  const handleGetInsights = useCallback(async () => {
    setError(null);

    // Abort any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setView("loading");
    setParsed(null);
    setRawText(null);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FIRST_TOKEN_TIMEOUT_MS);

    // Build completed lessons list
    const completedLessons = Object.entries(lessons)
      .filter(([, p]) => p?.completed)
      .map(([id]) => id);

    // Top 5 weakest phonemes for the model
    const topPhonemes = phonemeMastery.slice(0, 5).map((p) => ({
      phoneme: p.phoneme,
      score: p.score,
      example: p.example,
      count: p.count,
    }));

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "insights",
          messages: [],
          context: {
            accent,
            xp,
            streak,
            completedLessons,
            phonemeMastery: topPhonemes,
          },
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) detail = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(detail);
      }

      if (!res.body) {
        throw new Error("No response body received.");
      }

      // Consume SSE stream and accumulate text
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";
      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

          const dataStr = trimmedLine.slice(5).trim();
          if (dataStr === "[DONE]") {
            break;
          }

          try {
            const parsedChunk = JSON.parse(dataStr);
            if (parsedChunk.error) {
              throw new Error(parsedChunk.error);
            }
            if (typeof parsedChunk.token === "string") {
              if (!firstTokenReceived) {
                firstTokenReceived = true;
                clearTimeout(timeoutId);
              }
              accumulated += parsedChunk.token;
            }
          } catch (parseErr) {
            // Re-throw our own thrown errors (with a real message)
            if (
              parseErr instanceof Error &&
              !parseErr.message.startsWith("Unexpected")
            ) {
              throw parseErr;
            }
            // Skip malformed JSON lines (expected for partial SSE chunks)
          }
        }
      }

      clearTimeout(timeoutId);

      const text = accumulated.trim();
      if (!text) {
        throw new Error("The coach didn't return any insights. Please try again.");
      }

      const plan = extractJson(text);
      setParsed(plan);
      setRawText(plan ? null : text);
      setView("success");

      // Cache the result (date-keyed)
      try {
        const payload: CachedInsight = {
          parsed: plan,
          rawText: plan ? null : text,
          generatedAt: Date.now(),
          signature,
        };
        window.localStorage.setItem(
          storageKeyForToday(),
          JSON.stringify(payload)
        );
      } catch {
        /* ignore storage errors */
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out — the coach took too long. Please try again.");
      } else {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
      }
      setView("error");
    } finally {
      abortRef.current = null;
    }
  }, [lessons, phonemeMastery, accent, xp, streak, signature]);

  const handleOpenLesson = useCallback(
    (lessonTitle: string) => {
      const lesson = ALL_LESSONS.find((l) => l.title === lessonTitle);
      if (lesson) {
        setActiveLesson(lesson.id);
      }
    },
    [setActiveLesson]
  );

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative"
      aria-label="Coach Insights"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-d text-base font-bold flex items-center gap-2 text-[var(--t1)]">
          <Sparkles className="w-4 h-4 text-[var(--t1)]" strokeWidth={2.25} />
          <span>Coach Insights</span>
        </h2>
        {view === "success" && (
          <button
            onClick={handleGetInsights}
            className="text-[10px] font-mono uppercase tracking-[0.1em] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--t2)] hover:text-[var(--t1)] hover:border-[var(--border2)] transition"
            aria-label="Refresh insights"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        )}
      </div>

      {/* Solid card: white bg + thin border, no gradient, no blur, no orbs */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl">
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* ─── IDLE STATE ─── */}
            {view === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-4"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-[var(--card-h)] border border-[var(--border)]">
                  <Sparkles className="w-6 h-6 text-[var(--t1)]" strokeWidth={2} />
                </div>
                <div className="font-d text-lg font-bold text-[var(--t1)] mb-1.5">
                  Get your AI practice plan
                </div>
                <p className="text-xs text-[var(--t2)] leading-relaxed max-w-xs mx-auto mb-4">
                  {completedCount === 0
                    ? "I'll analyze your starting point and recommend the perfect first lessons."
                    : phonemeMastery.length === 0
                    ? "Complete a few lessons so I can spot your weakest sounds."
                    : `Based on ${phonemeMastery.length} sound${
                        phonemeMastery.length !== 1 ? "s" : ""
                      } tracked — I'll build a personalized plan in seconds.`}
                </p>

                {/* Insight type chips — preview what you'll get */}
                <div className="flex items-center justify-center gap-1.5 mb-5">
                  {[
                    { icon: Target, label: "Focus Areas" },
                    { icon: BookOpen, label: "Lessons" },
                    { icon: Lightbulb, label: "Tips" },
                  ].map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg2)] border border-[var(--border)] text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--t3)]"
                    >
                      <chip.icon className="w-3 h-3" strokeWidth={2} />
                      {chip.label}
                    </span>
                  ))}
                </div>

                <motion.button
                  onClick={handleGetInsights}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 bg-[var(--p)] text-white rounded-xl px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
                >
                  <Zap className="w-4 h-4" strokeWidth={2.25} />
                  Get AI Insights
                </motion.button>
              </motion.div>
            )}

            {/* ─── LOADING STATE ─── */}
            {view === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState />
              </motion.div>
            )}

            {/* ─── ERROR STATE ─── */}
            {view === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-[var(--card-h)] border border-[var(--border)]">
                  <AlertTriangle className="w-5 h-5 text-[var(--rd)]" strokeWidth={2} />
                </div>
                <div className="font-d text-sm font-bold text-[var(--t1)] mb-1">
                  Couldn&apos;t fetch insights
                </div>
                <p className="text-xs text-[var(--t2)] max-w-xs mb-4 leading-relaxed">
                  {error || "Something went wrong."}
                </p>
                <button
                  onClick={handleGetInsights}
                  className="inline-flex items-center gap-2 px-4 min-h-[36px] rounded-xl text-xs font-semibold border border-[var(--border2)] text-[var(--t1)] hover:bg-[var(--card-h)] transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try again
                </button>
              </motion.div>
            )}

            {/* ─── SUCCESS STATE ─── */}
            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* If we have structured JSON → render 3 sections */}
                {parsed ? (
                  <>
                    {/* Focus Areas */}
                    {parsed.focusAreas.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-3.5 h-3.5 text-[var(--t1)]" strokeWidth={2.25} />
                          <h3 className="font-d text-sm font-bold text-[var(--t1)]">
                            Your Focus Areas
                          </h3>
                          <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--t3)] ml-auto">
                            {parsed.focusAreas.length} sound
                            {parsed.focusAreas.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {parsed.focusAreas
                            .slice(0, 4)
                            .map((area, i) => (
                              <FocusAreaCard
                                key={`${area.phoneme}-${i}`}
                                area={area}
                                index={i}
                              />
                            ))}
                        </div>
                      </section>
                    )}

                    {/* Recommended Lessons */}
                    {parsed.recommendedLessons.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-3.5 h-3.5 text-[var(--t1)]" strokeWidth={2.25} />
                          <h3 className="font-d text-sm font-bold text-[var(--t1)]">
                            Recommended Lessons
                          </h3>
                          <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--t3)] ml-auto">
                            tap to open
                          </span>
                        </div>
                        <div className="space-y-2">
                          {parsed.recommendedLessons
                            .slice(0, 3)
                            .map((rec, i) => (
                              <RecommendedLessonCard
                                key={`${rec.lesson}-${i}`}
                                rec={rec}
                                index={i}
                                onOpen={handleOpenLesson}
                              />
                            ))}
                        </div>
                      </section>
                    )}

                    {/* Practice Tips */}
                    {parsed.tips.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-3.5 h-3.5 text-[var(--t1)]" strokeWidth={2.25} />
                          <h3 className="font-d text-sm font-bold text-[var(--t1)]">
                            Practice Tips
                          </h3>
                          <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-[var(--t3)] ml-auto">
                            {parsed.tips.length} tip
                            {parsed.tips.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <ul className="space-y-2.5">
                          {parsed.tips.map((tip, i) => (
                            <TipItem key={i} tip={tip} index={i} />
                          ))}
                        </ul>
                      </section>
                    )}

                    {/* Footer note */}
                    <div className="text-[10px] text-[var(--t3)] font-mono text-center pt-3 mt-1 border-t border-[var(--border)]">
                      Generated by AccentAI Coach ·{" "}
                      <button
                        onClick={handleGetInsights}
                        className="text-[var(--t1)] hover:underline underline-offset-2 transition"
                      >
                        regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  // Fallback: raw text response
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--t1)]" strokeWidth={2.25} />
                      <h3 className="font-d text-sm font-bold text-[var(--t1)]">
                        Coach Advice
                      </h3>
                    </div>
                    <div className="rounded-lg p-3.5 bg-[var(--bg2)] border border-[var(--border)] text-xs text-[var(--t2)] leading-relaxed whitespace-pre-wrap">
                      {rawText}
                    </div>
                    <div className="text-[10px] text-[var(--t3)] font-mono text-center pt-3 mt-3 border-t border-[var(--border)]">
                      Generated by AccentAI Coach
                    </div>
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
