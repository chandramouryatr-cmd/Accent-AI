"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Volume2,
  X,
  Search,
  Loader2,
  AlertCircle,
  Compass,
  History,
  ExternalLink,
} from "lucide-react";
import { speak as speakTTS, unlockTTS } from "@/lib/tts";

/* ────────────────────────────────────────────────────────────────────
 * DictionaryLookup
 *
 * A two-stage widget:
 *   1. A floating "📖 Dictionary" pill that appears whenever the user
 *      selects a word anywhere in the app (mouseup / keyboard selection
 *      / mobile long-press). Positioned just above the selection rect.
 *   2. A centered modal popup that opens when the pill is clicked. Shows
 *      the word, IPA, audio button, definitions, examples, synonyms, and
 *      a Cancel button. Falls back to in-app TTS when the dictionary
 *      service has no native audio.
 *
 * Wired globally via AppShell so it works on every view.
 * ──────────────────────────────────────────────────────────────────── */

interface SelectionInfo {
  text: string;
  rect: { top: number; left: number; width: number; height: number };
}

interface Meaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    example?: string;
    synonyms?: string[];
    antonyms?: string[];
  }[];
  synonyms?: string[];
  antonyms?: string[];
}

interface DictResult {
  word: string;
  phonetic?: string;
  ipa?: string;
  audioUrl?: string;
  meanings: Meaning[];
  origin?: string;
  sourceUrl?: string;
  fromCache?: boolean;
}

const RECENT_KEY = "accentai-dict-recent";
const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function saveRecent(word: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = loadRecent();
    const lower = word.toLowerCase();
    const next = [word, ...prev.filter((w) => w.toLowerCase() !== lower)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

/** A single-word selection is 1–64 chars, letters + optional internal
 *  apostrophes / hyphens, no whitespace. */
function isSingleWord(text: string): boolean {
  const t = text.trim();
  if (t.length < 2 || t.length > 64) return false;
  return /^[A-Za-z][A-Za-z''\-]*$/.test(t);
}

export function DictionaryLookup() {
  /* ── Floating-pill selection state ── */
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [pillVisible, setPillVisible] = useState(false);

  /* ── Modal state ── */
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "notfound" | "ok">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [suggestion, setSuggestion] = useState<string | undefined>();
  const [recent, setRecent] = useState<string[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playedOnce, setPlayedOnce] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* Ref mirror of the last selected word so the pill's click handler still has
     the word even if the native selection collapses on mobile before the
     click fires (common on touch: tapping the pill can momentarily clear the
     selection via selectionchange, unmounting the pill before onClick). */
  const lastWordRef = useRef<string>("");

  /* ── Listen for text selection across the document ── */
  useEffect(() => {
    let rafId = 0;
    const check = () => {
      rafId = 0;
      // Don't show the pill while the modal is open
      if (open) {
        setSelection(null);
        setPillVisible(false);
        return;
      }
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!sel || !text || !isSingleWord(text)) {
        setSelection(null);
        setPillVisible(false);
        return;
      }
      // Ignore selections inside form fields / editable regions / our own popup
      const anchor = sel.anchorNode;
      if (!anchor) {
        setSelection(null);
        setPillVisible(false);
        return;
      }
      const el = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as Element | null);
      if (el?.closest('input, textarea, [contenteditable="true"], [data-dictionary-popup="true"]')) {
        setSelection(null);
        setPillVisible(false);
        return;
      }
      try {
        if (sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        setSelection({ text, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } });
        setPillVisible(true);
        lastWordRef.current = text; // persist for mobile tap reliability
      } catch {
        /* rangeCount can throw in some edge cases */
      }
    };

    const schedule = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(check);
    };

    // mouseup + keyup = end of user-initiated selection (desktop)
    document.addEventListener("mouseup", schedule);
    document.addEventListener("keyup", schedule);
    // selectionchange = mobile long-press + selection-handle dragging
    document.addEventListener("selectionchange", schedule);

    // Any scroll invalidates the cached rect — hide the pill.
    const onScroll = () => {
      setSelection(null);
      setPillVisible(false);
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("mouseup", schedule);
      document.removeEventListener("keyup", schedule);
      document.removeEventListener("selectionchange", schedule);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  /* ── Load recent lookups on mount ── */
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  /* ── Core lookup function ── */
  const lookup = useCallback(async (word: string) => {
    const w = word.trim();
    if (!w) return;
    // Abort any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setQuery(w);
    setResult(null);
    setStatus("loading");
    setErrorMsg("");
    setSuggestion(undefined);
    setPlayedOnce(false);
    setOpen(true);
    setSelection(null);
    setPillVisible(false);
    // Clear the native selection so it doesn't visually persist behind the modal
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      /* ignore */
    }
    // Unlock TTS audio on this user gesture (mobile Safari requirement)
    unlockTTS();

    try {
      const res = await fetch(`/api/dictionary?word=${encodeURIComponent(w)}`, {
        signal: ctrl.signal,
      });
      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        setStatus("notfound");
        setSuggestion(body.suggestion);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setStatus("error");
        setErrorMsg(body.error || `Lookup failed (HTTP ${res.status}).`);
        return;
      }
      const data = (await res.json()) as DictResult;
      setResult(data);
      setStatus("ok");
      saveRecent(data.word || w);
      setRecent(loadRecent());
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setStatus("error");
      setErrorMsg("Couldn't reach the dictionary service. Check your connection and try again.");
    }
  }, []);

  /* ── Close modal ── */
  const close = useCallback(() => {
    abortRef.current?.abort();
    setOpen(false);
    setResult(null);
    setStatus("idle");
    setQuery("");
    setErrorMsg("");
    setSuggestion(undefined);
    setPlayedOnce(false);
  }, []);

  /* ── Open modal empty (no pre-filled word) — used by the header
   *  dictionary button. Opens straight to a searchable state showing
   *  recent lookups so the user can type or tap a recent word. ── */
  const openEmpty = useCallback(() => {
    abortRef.current?.abort();
    setResult(null);
    setStatus("idle");
    setQuery("");
    setErrorMsg("");
    setSuggestion(undefined);
    setPlayedOnce(false);
    setSelection(null);
    setPillVisible(false);
    setOpen(true);
    unlockTTS();
    // Focus the search input shortly after the modal mounts
    setTimeout(() => inputRef.current?.focus(), 120);
  }, []);

  /* ── Listen for global "open-dictionary" events (from the header
   *  dictionary button). Supports an optional detail.word to look up
   *  immediately, or no detail to open empty. ── */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as { word?: string } | undefined;
      if (detail?.word) {
        lookup(detail.word);
      } else {
        openEmpty();
      }
    };
    window.addEventListener("accentai:open-dictionary", onOpen as EventListener);
    return () => window.removeEventListener("accentai:open-dictionary", onOpen as EventListener);
  }, [lookup, openEmpty]);

  /* ── Body scroll lock + Esc-to-close while modal is open ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    // Focus the cancel button for keyboard users (after the entrance anim)
    const t = setTimeout(() => cancelBtnRef.current?.focus(), 120);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, close]);

  /* ── Click on the floating pill ── */
  const onPillClick = useCallback(() => {
    // Prefer live selection; fall back to the ref in case the native
    // selection collapsed on mobile between touchstart and click.
    const word = selection?.text || lastWordRef.current;
    if (word) lookup(word);
  }, [selection, lookup]);

  /* ── Play pronunciation ── */
  const playAudio = useCallback(() => {
    if (!result) return;
    setAudioLoading(true);
    setPlayedOnce(true);
    try {
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        audio.crossOrigin = "anonymous";
        audio.onended = () => setAudioLoading(false);
        audio.onerror = () => {
          // Fall back to TTS if the audio URL fails
          speakTTS(result.word, { rate: 0.9 });
          setTimeout(() => setAudioLoading(false), 600);
        };
        audio.play().catch(() => {
          // Autoplay rejection / network error → TTS fallback
          speakTTS(result.word, { rate: 0.9 });
          setTimeout(() => setAudioLoading(false), 600);
        });
      } else {
        // No native audio — use the in-app TTS with the learner's accent
        speakTTS(result.word, { rate: 0.9 });
        setTimeout(() => setAudioLoading(false), 600);
      }
    } catch {
      setAudioLoading(false);
    }
  }, [result]);

  /* ── Submit handler for the in-modal search input ── */
  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const v = query.trim();
    if (v) lookup(v);
  };

  /* ── Pill position: centered above the selection, clamped to viewport ── */
  const pillStyle = selection
    ? (() => {
        const PILL_W = 132; // estimated; pill is roughly this wide
        const PILL_H = 36;
        const gap = 8;
        let left = selection.rect.left + selection.rect.width / 2 - PILL_W / 2;
        let top = selection.rect.top - PILL_H - gap;
        // Clamp horizontally
        left = Math.max(8, Math.min(left, window.innerWidth - PILL_W - 8));
        // If too close to the top, flip below
        if (top < 8) {
          top = selection.rect.top + selection.rect.height + gap;
        }
        return { left, top };
      })()
    : { left: 0, top: 0 };

  return (
    <>
      {/* ── Floating "Dictionary" pill ── */}
      <AnimatePresence>
        {pillVisible && selection && (
          <motion.button
            key="dict-pill"
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={onPillClick}
            onPointerDown={(e) => e.preventDefault()} // don't steal focus / collapse selection (mouse + touch)
            style={{ position: "fixed", left: pillStyle.left, top: pillStyle.top, zIndex: 80, touchAction: "manipulation" }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--p)] text-white text-xs font-semibold shadow-lg hover:opacity-90 active:scale-95 transition"
            aria-label={`Look up "${selection.text}" in dictionary`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Dictionary
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Modal popup ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dict-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={close}
            data-dictionary-popup="true"
          >
            <motion.div
              key="dict-card"
              ref={modalCardRef}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Dictionary lookup for ${query}`}
              className="w-full sm:max-w-md bg-[var(--bg)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
            >
              {/* ── Header: search bar ── */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg2)]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--p)] text-white shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <form onSubmit={onSubmitSearch} className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--t3)] pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Look up a word…"
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--t1)] placeholder:text-[var(--t3)] focus:outline-none focus:border-[var(--p)] focus:ring-1 focus:ring-[var(--p)] transition"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-[var(--p)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition"
                  >
                    Go
                  </button>
                </form>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--card-h)] transition shrink-0"
                  aria-label="Close dictionary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Body: result / loading / error / idle ── */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {status === "idle" && (
                  <div className="space-y-4">
                    {/* Friendly prompt */}
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-[var(--card-h)] flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6 text-[var(--t2)]" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--t1)] mb-1">
                        Look up any word
                      </p>
                      <p className="text-xs text-[var(--t2)] max-w-xs leading-relaxed">
                        Type a word above and press <span className="font-mono font-semibold text-[var(--t1)]">Go</span>, or select any word in a lesson to see its definition, IPA, and pronunciation.
                      </p>
                    </div>

                    {/* Recent lookups */}
                    {recent.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-mono text-[var(--t3)] mb-2">
                          <History className="w-3 h-3" /> Recent lookups
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recent.map((w) => (
                            <button
                              key={w}
                              onClick={() => lookup(w)}
                              className="px-2.5 py-1 rounded-full bg-[var(--card-h)] border border-[var(--border)] text-xs text-[var(--t2)] hover:text-[var(--t1)] hover:border-[var(--p)] active:scale-95 transition"
                            >
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {status === "loading" && <LoadingSkeleton />}

                {status === "error" && (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[rgba(220,38,38,0.1)] flex items-center justify-center mb-3">
                      <AlertCircle className="w-6 h-6 text-[var(--rd)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--t1)] mb-1">Something went wrong</p>
                    <p className="text-xs text-[var(--t2)] mb-4 max-w-xs">{errorMsg}</p>
                    <button
                      onClick={() => lookup(query)}
                      className="px-4 py-2 rounded-lg bg-[var(--p)] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {status === "notfound" && (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-[rgba(217,119,6,0.1)] flex items-center justify-center mb-3">
                      <Compass className="w-6 h-6 text-[var(--yl)]" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--t1)] mb-1">
                      No entry for <span className="font-mono">“{query}”</span>
                    </p>
                    <p className="text-xs text-[var(--t2)] mb-4 max-w-xs">
                      This word isn&apos;t in the dictionary. Check the spelling or try a variant.
                    </p>
                    {suggestion && (
                      <button
                        onClick={() => lookup(suggestion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(217,119,6,0.1)] border border-[rgba(217,119,6,0.3)] text-xs font-semibold text-[var(--yl)] hover:bg-[rgba(217,119,6,0.15)] transition"
                      >
                        <Search className="w-3 h-3" /> Did you mean <span className="font-mono">{suggestion}</span>?
                      </button>
                    )}
                  </div>
                )}

                {status === "ok" && result && <ResultView result={result} onPlay={playAudio} audioLoading={audioLoading} playedOnce={playedOnce} />}
              </div>

              {/* ── Footer: Cancel button ── */}
              <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg2)] flex items-center gap-2 safe-bottom">
                {status === "ok" && result && (
                  <button
                    onClick={playAudio}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[var(--card-h)] border border-[var(--border)] text-xs font-semibold text-[var(--t1)] hover:bg-[var(--card)] hover:border-[var(--p)] active:scale-95 transition"
                  >
                    {audioLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    Pronounce
                  </button>
                )}
                <div className="flex-1" />
                <button
                  ref={cancelBtnRef}
                  onClick={close}
                  className="px-5 py-2.5 rounded-xl bg-[var(--p)] text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * Sub-components
 * ──────────────────────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* word + ipa row */}
      <div className="flex items-center gap-3">
        <div className="h-7 w-32 rounded-lg bg-[var(--card-h)]" />
        <div className="h-4 w-20 rounded bg-[var(--card-h)]" />
        <div className="h-8 w-8 rounded-full bg-[var(--card-h)] ml-auto" />
      </div>
      {/* meaning blocks */}
      {[0, 1].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-16 rounded-full bg-[var(--card-h)]" />
          <div className="h-3 w-full rounded bg-[var(--card-h)]" />
          <div className="h-3 w-4/5 rounded bg-[var(--card-h)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--card-h)]" />
        </div>
      ))}
    </div>
  );
}

function PartOfSpeechChip({ pos }: { pos: string }) {
  // Subtle color coding by part of speech — all muted to fit the minimal theme
  const palette: Record<string, { bg: string; fg: string; border: string }> = {
    noun: { bg: "rgba(8,145,178,0.08)", fg: "#0891b2", border: "rgba(8,145,178,0.2)" },
    verb: { bg: "rgba(5,150,105,0.08)", fg: "#059669", border: "rgba(5,150,105,0.2)" },
    adjective: { bg: "rgba(217,119,6,0.08)", fg: "#d97706", border: "rgba(217,119,6,0.2)" },
    adverb: { bg: "rgba(139,92,246,0.08)", fg: "#7c3aed", border: "rgba(139,92,246,0.2)" },
  };
  const c = palette[pos.toLowerCase()] || { bg: "var(--overlay-2)", fg: "var(--t2)", border: "var(--border)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border"
      style={{ background: c.bg, color: c.fg, borderColor: c.border }}
    >
      {pos}
    </span>
  );
}

function ResultView({
  result,
  onPlay,
  audioLoading,
  playedOnce,
}: {
  result: DictResult;
  onPlay: () => void;
  audioLoading: boolean;
  playedOnce: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* ── Word header ── */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-d text-2xl font-bold text-[var(--t1)] break-words leading-tight">
            {result.word}
          </h2>
          {(result.ipa || result.phonetic) && (
            <div className="font-mono text-sm text-[var(--t2)] mt-0.5">
              {result.ipa || result.phonetic}
            </div>
          )}
        </div>
        <button
          onClick={onPlay}
          className="shrink-0 w-10 h-10 rounded-full bg-[var(--p)] text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition shadow-md"
          aria-label="Play pronunciation"
        >
          {audioLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* First-visit hint to press play */}
      {!playedOnce && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-[var(--t3)] flex items-center gap-1.5"
        >
          <Volume2 className="w-3 h-3" />
          Tap the speaker to hear the word pronounced.
        </motion.div>
      )}

      {/* ── Meanings ── */}
      {result.meanings.length === 0 ? (
        <p className="text-sm text-[var(--t2)] italic">No definitions available.</p>
      ) : (
        <div className="space-y-4">
          {result.meanings.map((m, i) => (
            <motion.div
              key={`${m.partOfSpeech}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <PartOfSpeechChip pos={m.partOfSpeech} />
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <ol className="space-y-2 pl-1">
                {m.definitions.slice(0, 5).map((d, j) => (
                  <li key={j} className="text-sm leading-relaxed">
                    <div className="flex gap-2">
                      <span className="font-mono text-[var(--t3)] text-xs mt-0.5 shrink-0">
                        {j + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-[var(--t1)]">{d.definition}</p>
                        {d.example && (
                          <p className="text-[var(--t2)] italic text-xs mt-1 leading-relaxed">
                            “{d.example}”
                          </p>
                        )}
                        {d.synonyms && d.synonyms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            <span className="text-[10px] text-[var(--t3)] uppercase tracking-wider font-mono">
                              syn:
                            </span>
                            {d.synonyms.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--card-h)] border border-[var(--border)] text-[var(--t2)]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              {m.synonyms && m.synonyms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-[var(--t3)] uppercase tracking-wider font-mono">
                    synonyms:
                  </span>
                  {m.synonyms.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--card-h)] border border-[var(--border)] text-[var(--t2)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Origin (etymology) ── */}
      {result.origin && (
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--t3)] mb-1">
            Origin
          </div>
          <p className="text-xs text-[var(--t2)] leading-relaxed italic">{result.origin}</p>
        </div>
      )}

      {/* ── Source link ── */}
      {result.sourceUrl && (
        <a
          href={result.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-[var(--t3)] hover:text-[var(--t2)] transition"
        >
          <ExternalLink className="w-3 h-3" />
          Source: Wiktionary
        </a>
      )}
    </div>
  );
}
