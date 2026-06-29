"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { X, Download, Copy, Check, Share2, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ALL_LESSONS } from "@/lib/lessons";
import { PHASES } from "@/lib/types";

// ─── Theme config ──────────────────────────────────────────────────────────
type Theme = "aurora" | "sunset" | "mono";

const THEME_CONFIG: Record<
  Theme,
  { bg: string; name: string; emoji: string; accent: string }
> = {
  aurora: {
    bg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)",
    name: "Aurora",
    emoji: "🌌",
    accent: "#a78bfa",
  },
  sunset: {
    bg: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #8b5cf6 100%)",
    name: "Sunset",
    emoji: "🌅",
    accent: "#fb923c",
  },
  mono: {
    bg: "linear-gradient(160deg, #1f2937 0%, #111827 50%, #030712 100%)",
    name: "Mono",
    emoji: "⚫",
    accent: "#9ca3af",
  },
};

// ─── Rank computation (XP-based, per spec) ─────────────────────────────────
function computeRank(xp: number): { emoji: string; title: string } {
  if (xp >= 6000) return { emoji: "🔥", title: "Legend" };
  if (xp >= 3000) return { emoji: "👑", title: "Master" };
  if (xp >= 1500) return { emoji: "🏆", title: "Expert" };
  if (xp >= 700) return { emoji: "🎯", title: "Skilled" };
  if (xp >= 300) return { emoji: "🌟", title: "Apprentice" };
  if (xp >= 100) return { emoji: "🌱", title: "Novice" };
  return { emoji: "👶", title: "Newcomer" };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "user"
  );
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDatePretty(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Badge ID → emoji lookup (mirrors achievement-gallery badge definitions)
const BADGE_EMOJI_MAP: Record<string, string> = {
  "first-score": "🎯",
  "streak-7": "🔥",
  "50-lessons": "📚",
  "1000-xp": "💎",
};
PHASES.forEach((p, i) => {
  BADGE_EMOJI_MAP[`phase-${i + 1}`] = p.emoji;
});

// ─── Card geometry ─────────────────────────────────────────────────────────
// Logical card size — captured at pixelRatio 2 → 1080×1350 PNG (Instagram portrait)
const CARD_W = 540;
const CARD_H = 675;

// ─── Card face (forwarded ref so the modal can capture it) ─────────────────
interface ShareCardFaceProps {
  theme: Theme;
  userName: string;
  accentFlag: string;
  accentLabel: string;
  xp: number;
  streak: number;
  completedCount: number;
  totalLessons: number;
  overallPct: number;
  rankEmoji: string;
  rankTitle: string;
  badgeEmojis: string[];
  badgeCount: number;
}

const ShareCardFace = forwardRef<HTMLDivElement, ShareCardFaceProps>(
  function ShareCardFace(props, ref) {
    const {
      theme,
      userName,
      accentFlag,
      accentLabel,
      xp,
      streak,
      completedCount,
      totalLessons,
      overallPct,
      rankEmoji,
      rankTitle,
      badgeEmojis,
      badgeCount,
    } = props;

    const cfg = THEME_CONFIG[theme];

    return (
      <div
        ref={ref}
        style={{
          width: CARD_W,
          height: CARD_H,
          background: cfg.bg,
          borderRadius: 24,
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: "#ffffff",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -90,
            right: -90,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.14)",
            filter: "blur(28px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -110,
            left: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.09)",
            filter: "blur(32px)",
            pointerEvents: "none",
          }}
        />

        {/* Header: logo + accent flag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🗣️
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: -0.3,
                  lineHeight: 1,
                }}
              >
                AccentAI
              </div>
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.85,
                  marginTop: 3,
                  letterSpacing: 0.4,
                }}
              >
                My Accent Journey
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
            }}
          >
            {accentFlag} {accentLabel}
          </div>
        </div>

        {/* User name */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <div
            style={{
              fontSize: 10,
              opacity: 0.75,
              marginBottom: 4,
              letterSpacing: 1.2,
              fontWeight: 600,
            }}
          >
            SHARED BY
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: -0.6,
              lineHeight: 1.1,
              wordBreak: "break-word",
            }}
          >
            {userName}
          </div>
        </div>

        {/* Rank section */}
        <div
          style={{
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 16,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 48,
              lineHeight: 1,
              filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.3))",
            }}
          >
            {rankEmoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 9,
                opacity: 0.75,
                marginBottom: 2,
                letterSpacing: 1.2,
                fontWeight: 600,
              }}
            >
              CURRENT RANK
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.3,
                lineHeight: 1.1,
              }}
            >
              {rankTitle}
            </div>
          </div>
        </div>

        {/* Stats 2x2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 14,
            position: "relative",
          }}
        >
          <StatTile label="Total XP" value={xp.toLocaleString()} emoji="⚡" />
          <StatTile label="Day Streak" value={`${streak}d`} emoji="🔥" />
          <StatTile
            label="Lessons Done"
            value={`${completedCount}/${totalLessons}`}
            emoji="📚"
          />
          <StatTile label="Badges Earned" value={`${badgeCount}`} emoji="🏆" />
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.2 }}>
              Journey Progress
            </div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {completedCount}
              <span style={{ opacity: 0.6, fontSize: 11 }}>
                /{totalLessons}
              </span>
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.85 }}>
                {overallPct}%
              </span>
            </div>
          </div>
          <div
            style={{
              height: 8,
              background: "rgba(255,255,255,0.18)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${overallPct}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #ffffff, rgba(255,255,255,0.7))",
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        {/* Recent badges */}
        <div style={{ marginBottom: "auto", position: "relative" }}>
          <div
            style={{
              fontSize: 9,
              opacity: 0.75,
              marginBottom: 8,
              letterSpacing: 1.2,
              fontWeight: 600,
            }}
          >
            RECENT BADGES
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badgeEmojis.length === 0 ? (
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.12)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                🚀 Just getting started!
              </div>
            ) : (
              badgeEmojis.slice(0, 3).map((e, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  {e}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 10,
            opacity: 0.85,
            position: "relative",
          }}
        >
          <div>
            Generated by{" "}
            <span style={{ fontWeight: 700 }}>AccentAI</span> · accentai.app
          </div>
          <div style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatDatePretty()}
          </div>
        </div>
      </div>
    );
  }
);

function StatTile({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.13)",
        border: "1px solid rgba(255,255,255,0.16)",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 4, lineHeight: 1 }}>{emoji}</div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: -0.3,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 9,
          opacity: 0.8,
          marginTop: 4,
          letterSpacing: 0.4,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Modal shell ───────────────────────────────────────────────────────────
interface ShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCard({ open, onOpenChange }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("aurora");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);

  // Pull all stats from the store
  const userName = useAppStore((s) => s.userName);
  const accent = useAppStore((s) => s.accent);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessons = useAppStore((s) => s.lessons);
  const badges = useAppStore((s) => s.badges);

  // Derived stats
  const { completedCount, totalLessons, overallPct, rank, accentFlag, accentLabel, badgeEmojis } =
    useMemo(() => {
      const done = Object.values(lessons).filter((l) => l.completed).length;
      const total = ALL_LESSONS.length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      const r = computeRank(xp);
      const flag = accent === "usa" ? "🇺🇸" : "🇬🇧";
      const label = accent === "usa" ? "US English" : "UK English";
      const emojis = badges
        .slice(-3)
        .map((id) => BADGE_EMOJI_MAP[id])
        .filter((e): e is string => Boolean(e));
      return {
        completedCount: done,
        totalLessons: total,
        overallPct: pct,
        rank: r,
        accentFlag: flag,
        accentLabel: label,
        badgeEmojis: emojis,
      };
    }, [lessons, xp, accent, badges]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Responsive scaling — fit card inside the viewport
  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      // Leave 16px padding on each side + ~220px below for controls/header
      const maxW = Math.min(window.innerWidth - 32, CARD_W);
      const maxH = window.innerHeight - 240;
      const s = Math.min(maxW / CARD_W, maxH / CARD_H, 1);
      setScale(Math.max(0.3, s));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // ─── Capture helpers ───
  const captureBlob = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, // → 1080×1350 PNG (retina quality)
        width: CARD_W,
        height: CARD_H,
        cacheBust: true,
        style: {
          // Reset any inherited transform so the captured PNG is full-size
          transform: "none",
          margin: "0",
          borderRadius: "24px",
        },
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return blob;
    } catch (err) {
      console.error("Failed to capture share card:", err);
      return null;
    }
  }, []);

  const fileName = useMemo(
    () => `accentai-stats-${slugify(userName)}-${todayStr()}.png`,
    [userName]
  );

  const triggerDownload = useCallback(
    (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Defer revoke so the download can start
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    [fileName]
  );

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await captureBlob();
      if (!blob) return;
      triggerDownload(blob);
      setDownloaded(true);
      window.setTimeout(() => setDownloaded(false), 2000);
    } finally {
      setDownloading(false);
    }
  }, [captureBlob, triggerDownload]);

  const handleCopy = useCallback(async () => {
    setCopying(true);
    try {
      const blob = await captureBlob();
      if (!blob) return;

      // Try the async clipboard API with PNG support
      const ClipboardItemCtor =
        typeof window !== "undefined"
          ? (window as unknown as { ClipboardItem?: typeof ClipboardItem })
              .ClipboardItem
          : undefined;

      if (
        ClipboardItemCtor &&
        navigator.clipboard &&
        typeof navigator.clipboard.write === "function"
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItemCtor({ "image/png": blob }),
          ]);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
          return;
        } catch (err) {
          // Fall through to download fallback
          console.warn("Clipboard write failed, falling back to download", err);
        }
      }
      // Fallback: trigger a download
      triggerDownload(blob);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } finally {
      setCopying(false);
    }
  }, [captureBlob, triggerDownload]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 overflow-y-auto"
          style={{
            background: "rgba(2,2,12,0.78)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Share your AccentAI progress"
        >
          {/* Top bar */}
          <div className="w-full max-w-md flex items-center justify-between mb-3 shrink-0">
            <h3 className="font-d text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share My Progress
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={close}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              aria-label="Close share dialog"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Card preview */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative shrink-0"
            style={{
              width: CARD_W * scale,
              height: CARD_H * scale,
              maxWidth: "100%",
              filter: "drop-shadow(0 20px 50px rgba(0,0,0,0.45))",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* The fixed-size card. Parent applies the responsive scale;
                the card itself has no transform so html-to-image captures
                it at full 540×675 logical pixels (×2 pixelRatio = 1080×1350). */}
            <div
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <ShareCardFace
                ref={cardRef}
                theme={theme}
                userName={userName}
                accentFlag={accentFlag}
                accentLabel={accentLabel}
                xp={xp}
                streak={streak}
                completedCount={completedCount}
                totalLessons={totalLessons}
                overallPct={overallPct}
                rankEmoji={rank.emoji}
                rankTitle={rank.title}
                badgeEmojis={badgeEmojis}
                badgeCount={badges.length}
              />
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="w-full max-w-md mt-4 space-y-3 shrink-0 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Theme chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-mono text-white/55 mr-1">
                Theme
              </span>
              {(Object.keys(THEME_CONFIG) as Theme[]).map((t) => {
                const cfg = THEME_CONFIG[t];
                const active = theme === t;
                return (
                  <motion.button
                    key={t}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${
                      active
                        ? "text-white border-transparent shadow-lg"
                        : "text-white/70 border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                    style={
                      active
                        ? { background: cfg.bg, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }
                        : {}
                    }
                    aria-pressed={active}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cfg.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full h-11 text-white font-semibold relative overflow-hidden border-0 disabled:opacity-70"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.45)",
                  }}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Capturing…
                    </>
                  ) : downloaded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Downloaded ✓
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download PNG
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleCopy}
                  disabled={copying}
                  variant="outline"
                  className="h-11 px-4 bg-white/10 border-white/25 text-white hover:bg-white/20 hover:text-white disabled:opacity-70"
                >
                  {copying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Hint text */}
            <p className="text-center text-[10px] text-white/45 font-mono">
              1080×1350 PNG · Instagram-ready · accentai.app
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Convenience hook for opening the share card from anywhere ─────────────
// Components mount a single <ShareCard /> instance + use this hook to control it.
export function useShareCardState() {
  const [open, setOpen] = useState(false);
  const openShare = useCallback(() => setOpen(true), []);
  const closeShare = useCallback(() => setOpen(false), []);
  return { open, setOpen, openShare, closeShare };
}
