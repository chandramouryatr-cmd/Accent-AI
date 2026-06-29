"use client";

import { useEffect } from "react";
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

const SHORTCUT_GROUPS: Array<{ group: string; items: Array<{ keys: string; desc: string }> }> = [
  {
    group: "Navigation",
    items: [
      { keys: "1-5", desc: "Jump to Home / Journey / Practice / Progress / More" },
      { keys: "Esc", desc: "Close lesson or dialog" },
    ],
  },
  {
    group: "AI Coach",
    items: [{ keys: "⌘K", desc: "Open AccentAI Coach chat" }],
  },
  {
    group: "Help",
    items: [{ keys: "?", desc: "Toggle this shortcuts overlay" }],
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

  const close = () => {
    const el = document.getElementById("shortcuts-overlay");
    if (el) el.classList.add("hidden");
  };

  return (
    <div
      id="shortcuts-overlay"
      className="hidden fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative w-full max-w-md rounded-3xl p-6 bg-[var(--bg2)] border border-[var(--border2)] shadow-[0_8px_60px_rgba(99,102,241,0.3)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono">
              Productivity
            </div>
            <h2 className="font-d text-lg font-bold text-[var(--t1)]">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--card-h)] transition text-[var(--t2)]"
            aria-label="Close shortcuts"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((g) => (
            <div key={g.group}>
              <div className="text-[10px] uppercase tracking-wider text-[var(--p3)] font-mono mb-2">
                {g.group}
              </div>
              <div className="space-y-2">
                {g.items.map((it) => (
                  <div
                    key={it.keys}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[var(--t2)]">{it.desc}</span>
                    <kbd className="font-mono text-[11px] font-bold px-2 py-1 rounded-md bg-[var(--card)] border border-[var(--border2)] text-[var(--t1)] shadow-[0_2px_0_var(--border2)] min-w-[2.5rem] text-center">
                      {it.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-[10px] text-[var(--t3)] text-center font-mono">
          Press <kbd className="px-1 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">?</kbd> anytime to open this
        </div>
      </div>
    </div>
  );
}
