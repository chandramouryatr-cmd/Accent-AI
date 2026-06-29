"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "How do I pronounce 'three'?",
  "What's the difference between /ɪ/ and /iː/?",
  "Tips for American 'r' sound",
  "Help me with word stress",
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! 👄 I'm your AccentAI Coach. Ask me about any English sound, word, or pronunciation challenge — I'll break it down with IPA and give you concrete practice tips. 🎯",
};

/**
 * Renders text while wrapping IPA notation in monospace <code> tags.
 * Detects: /phoneme/ and [narrow] patterns, but NOT URLs (// in https://).
 */
function renderWithIPA(text: string) {
  // Match /x/ or [x] where x is 1-8 chars (letters, diacritics, length marks)
  const pattern = /(^|[^\w/])(\/[^\s/]{1,10}\/|\[[^\s\]]{1,10}\])(?=$|[^\w/])/g;
  const parts: Array<{ type: "text" | "code"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const prefix = match[1] || "";
    const ipa = match[2];
    const matchStart = match.index + prefix.length;

    if (matchStart > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, matchStart) });
    }
    if (prefix) {
      parts.push({ type: "text", value: prefix });
    }
    parts.push({ type: "code", value: ipa });
    lastIndex = matchStart + ipa.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.map((p, i) =>
    p.type === "code" ? (
      <code
        key={i}
        className="font-mono px-1 py-0.5 rounded bg-[rgba(34,211,238,0.12)] text-[var(--c2)] border border-[rgba(34,211,238,0.25)] text-[0.95em]"
      >
        {p.value}
      </code>
    ) : (
      <span key={i}>{p.value}</span>
    )
  );
}

export function AICoachChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accent = useAppStore((s) => s.accent);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessons = useAppStore((s) => s.lessons);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or loading change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus input on open (after the slide-up animation)
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setShowSuggestions(false);
      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      // Build completed lessons list from store
      const completedLessons = Object.entries(lessons)
        .filter(([, p]) => p?.completed)
        .map(([id]) => id);

      try {
        const res = await fetch("/api/ai-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
            context: {
              accent,
              xp,
              streak,
              completedLessons,
            },
          }),
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

        const data = await res.json();
        const reply: string =
          typeof data?.reply === "string" && data.reply.trim()
            ? data.reply
            : "Hmm, I didn't quite catch that. Could you rephrase? 🤔";

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⚠️ " +
              msg +
              "\n\nPlease try again in a moment. I'm here to help with your pronunciation! 🎯",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, lessons, accent, xp, streak]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className="relative w-full sm:max-w-md md:max-w-lg h-[88vh] sm:h-[80vh] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col bg-[var(--bg2)] border border-[var(--border2)] shadow-[0_0_60px_rgba(99,102,241,0.25)] safe-bottom"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="AccentAI Coach chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[rgba(99,102,241,0.06)] safe-top">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--p)] via-[var(--p2)] to-[var(--c)] shrink-0 shadow-[0_0_16px_rgba(99,102,241,0.5)]">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-d font-bold text-sm text-[var(--t1)] truncate flex items-center gap-1.5">
                    AccentAI Coach
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--t3)]">
                    <span className="relative flex items-center justify-center w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <span>Online · here to help</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close chat"
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--card-h)] transition text-[var(--t2)] hover:text-[var(--t1)] shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-3 no-scrollbar"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {loading && (
                <motion.div
                  className="flex items-start gap-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--p)] to-[var(--p2)] shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-md bg-[var(--card)] border border-[var(--border)]">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2].map((dot) => (
                        <motion.span
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--p3)]"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                          transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            delay: dot * 0.15,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Suggested prompts */}
            <AnimatePresence>
              {showSuggestions && messages.length <= 1 && !loading && (
                <motion.div
                  className="px-3 pb-2 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-[11px] px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--t2)] hover:text-[var(--t1)] hover:border-[rgba(99,102,241,0.4)] hover:bg-[rgba(99,102,241,0.08)] transition max-w-full text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner (compact) */}
            {error && (
              <div className="px-3 pb-1 text-[10px] text-amber-400/80 font-mono">
                Tip: press Enter to retry
              </div>
            )}

            {/* Input */}
            <div className="border-t border-[var(--border)] bg-[var(--bg2)] px-3 py-3">
              <div className="flex items-end gap-2 bg-[var(--card)] border border-[var(--border2)] rounded-2xl px-3 py-2 focus-within:border-[rgba(99,102,241,0.5)] transition">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a sound, word, or tip…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-[var(--t1)] placeholder:text-[var(--t3)] resize-none outline-none max-h-28 disabled:opacity-50"
                  aria-label="Message AccentAI Coach"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--p)] to-[var(--p2)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-[0_0_14px_rgba(99,102,241,0.4)] shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-[var(--t3)] text-center mt-1.5">
                AccentAI Coach can make mistakes. Verify phonetic advice with practice.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--p)] to-[var(--p2)] shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-gradient-to-br from-[var(--p)] to-[var(--p2)] text-white rounded-2xl rounded-br-md shadow-[0_4px_18px_rgba(99,102,241,0.35)]"
            : "bg-[var(--card)] border border-[var(--border)] text-[var(--t1)] rounded-2xl rounded-tl-md"
        }`}
      >
        {isUser ? message.content : renderWithIPA(message.content)}
      </div>
    </motion.div>
  );
}
