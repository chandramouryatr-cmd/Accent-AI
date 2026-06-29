"use client";

import { useEffect } from "react";
import { Keyboard, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

/**
 * useKeyboardShortcuts — Global keyboard handler for productivity shortcuts.
 *
 * Shortcuts:
 *   Cmd/Ctrl + K  → Open AI Coach chat (toggles the coach open state)
 *   1, 2, 3, 4, 5 → Switch to Dashboard / Journey / Practice / Progress / More
 *   Escape        → Close active lesson (the LessonModal already handles this,
 *                   but we also clear it as a fallback when modal not focused)
 *   ?             → Show shortcuts help (broadcasts a custom event the help
 *                   overlay listens to)
 *
 * Ignores shortcuts when the user is typing in an input/textarea/contenteditable.
 */
export function useKeyboardShortcuts() {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setActiveLesson = useAppStore((s) => s.setActiveLesson);
  const activeLessonId = useAppStore((s) => s.activeLessonId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Cmd/Ctrl + K — always available (even when typing)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        // Broadcast event the AI Coach FAB listens to
        window.dispatchEvent(new CustomEvent("accentai:toggle-coach"));
        return;
      }

      // Don't trigger other shortcuts while typing
      if (isTyping) return;

      // Number keys → switch tabs
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const tabs: Array<"dashboard" | "journey" | "practice" | "progress" | "more"> = [
          "dashboard",
          "journey",
          "practice",
          "progress",
          "more",
        ];
        const idx = parseInt(e.key, 10) - 1;
        if (idx >= 0 && idx < tabs.length) {
          e.preventDefault();
          setActiveTab(tabs[idx]);
        }
        return;
      }

      // Escape — close lesson modal if open (fallback for LessonModal's own handler)
      if (e.key === "Escape" && activeLessonId) {
        setActiveLesson(null);
        return;
      }

      // ? — show shortcuts help overlay
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("accentai:toggle-shortcuts"));
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setActiveTab, setActiveLesson, activeLessonId]);
}

type ShortcutItem = { keys: string[]; desc: string };

interface ShortcutGroup {
  group: string;
  /** Emoji glyph shown next to the group title. */
  icon: string;
  /** CSS color (var(--…) or hex) for the group title accent. */
  accent: string;
  items: ShortcutItem[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    group: "Navigation",
    icon: "🧭",
    accent: "var(--p)",
    items: [
      { keys: ["1", "–", "5"], desc: "Home · Journey · Practice · Progress · More" },
    ],
  },
  {
    group: "In Lesson",
    icon: "🎓",
    accent: "var(--p2)",
    items: [
      { keys: ["Space"], desc: "Play current step's audio" },
      { keys: ["←", "→"], desc: "Previous / Next step" },
      { keys: ["Esc"], desc: "Close lesson" },
    ],
  },
  {
    group: "AI Coach",
    icon: "✨",
    accent: "var(--p3)",
    items: [{ keys: ["⌘", "K"], desc: "Open AccentAI Coach chat" }],
  },
  {
    group: "Help",
    icon: "❓",
    accent: "var(--c)",
    items: [{ keys: ["?"], desc: "Toggle this shortcuts overlay" }],
  },
];

/**
 * ShortcutsOverlay — Listens for `accentai:toggle-shortcuts` events and
 * shows/hides the keyboard shortcuts help dialog.
 */
export function ShortcutsOverlay() {
  useEffect(() => {
    const toggle = () => {
      const el = document.getElementById("shortcuts-overlay");
      if (el) el.classList.toggle("hidden");
    };
    window.addEventListener("accentai:toggle-shortcuts", toggle);
    return () => window.removeEventListener("accentai:toggle-shortcuts", toggle);
  }, []);

  // Escape closes the overlay (works whether or not a lesson is open underneath).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const el = document.getElementById("shortcuts-overlay");
      if (el && !el.classList.contains("hidden")) {
        el.classList.add("hidden");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => {
    const el = document.getElementById("shortcuts-overlay");
    if (el) el.classList.add("hidden");
  };

  return (
    <div
      id="shortcuts-overlay"
      className="hidden fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-md rounded-3xl p-6 bg-[var(--bg2)] border border-[var(--border2)] shadow-[0_8px_60px_rgba(99,102,241,0.3)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--grad-btn)] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
                Productivity
              </div>
              <h2 className="font-d text-lg font-bold text-[var(--t1)]">
                Keyboard Shortcuts
              </h2>
            </div>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--card-h)] transition text-[var(--t2)] hover:text-[var(--t1)]"
            aria-label="Close shortcuts"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped shortcut cards */}
        <div className="space-y-3">
          {SHORTCUT_GROUPS.map((g) => (
            <div
              key={g.group}
              className="rounded-2xl p-3.5 bg-[var(--card)]/60 border border-[var(--border)]"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base leading-none" aria-hidden="true">
                  {g.icon}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider font-mono font-bold"
                  style={{ color: g.accent }}
                >
                  {g.group}
                </span>
              </div>
              <div className="space-y-2">
                {g.items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[var(--t2)] leading-tight">
                      {it.desc}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {it.keys.map((k, j) => (
                        <kbd
                          key={j}
                          className="font-mono text-[11px] font-bold px-2 py-1 rounded-md bg-[var(--bg2)] border border-[var(--border2)] text-[var(--t1)] shadow-[0_2px_0_var(--border2)] min-w-[2rem] text-center leading-none"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-5 text-[10px] text-[var(--t3)] text-center font-mono">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">
            ?
          </kbd>{" "}
          anytime to open this
        </div>
      </div>
    </div>
  );
}
