"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, X, RotateCw, Square } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** True while this assistant message is still streaming */
  streaming?: boolean;
  /** True if streaming ended with an error */
  streamError?: boolean;
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

/** 30-second timeout for receiving first token */
const FIRST_TOKEN_TIMEOUT_MS = 30_000;

/**
 * Renders text while wrapping IPA notation in monospace <code> tags.
 * Detects: /phoneme/ and [narrow] patterns, but NOT URLs (// in https://).
 */
function renderWithIPA(text: string, showCursor: boolean) {
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

  return (
    <>
      {parts.map((p, i) =>
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
      )}
      {showCursor && (
        <span className="inline-block w-[2px] h-[1.1em] bg-[var(--c2)] ml-0.5 align-middle animate-blink-cursor" />
      )}
    </>
  );
}

export function AICoachChat({ open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  /** True while we're waiting for the first token (show typing indicator) */
  const [waitingFirstToken, setWaitingFirstToken] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accent = useAppStore((s) => s.accent);
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const lessons = useAppStore((s) => s.lessons);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  /** Abort controller for cancelling in-flight requests */
  const abortRef = useRef<AbortController | null>(null);
  /** Last user message text for retry */
  const lastUserTextRef = useRef<string>("");
  /** Set to true when the user explicitly clicks Stop — distinguishes a
   *  user-initiated abort from a first-token timeout. */
  const userAbortedRef = useRef<boolean>(false);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, waitingFirstToken, open]);

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

  // Cleanup: abort any in-flight stream when component unmounts or closes
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      setShowSuggestions(false);
      lastUserTextRef.current = trimmed;
      const userMsg: ChatMessage = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);
      setWaitingFirstToken(true);

      // Build completed lessons list from store
      const completedLessons = Object.entries(lessons)
        .filter(([, p]) => p?.completed)
        .map(([id]) => id);

      // Abort any previous request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Timeout for first token
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, FIRST_TOKEN_TIMEOUT_MS);

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

        // We now expect a text/event-stream response
        if (!res.body) {
          throw new Error("No response body received.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let firstTokenReceived = false;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

            const dataStr = trimmedLine.slice(5).trim();
            if (dataStr === "[DONE]") {
              // Streaming complete
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);

              // Check for error token from backend
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (typeof parsed.token === "string") {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  clearTimeout(timeoutId);
                  setWaitingFirstToken(false);
                  // Create the assistant message with first token
                  accumulatedText = parsed.token;
                  setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: accumulatedText, streaming: true },
                  ]);
                } else {
                  // Append token to the last assistant message
                  accumulatedText += parsed.token;
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIdx = updated.length - 1;
                    if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
                      updated[lastIdx] = {
                        ...updated[lastIdx],
                        content: accumulatedText,
                        streaming: true,
                      };
                    }
                    return updated;
                  });
                }
              }
            } catch (parseErr) {
              // If it's our thrown error, re-throw
              if (parseErr instanceof Error && parseErr.message !== "Unexpected token") {
                throw parseErr;
              }
              // Otherwise skip malformed JSON lines
            }
          }
        }

        // Mark streaming as complete
        if (!firstTokenReceived) {
          clearTimeout(timeoutId);
          setWaitingFirstToken(false);
          // No tokens received at all — show fallback
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Hmm, I didn't quite catch that. Could you rephrase? 🤔",
              streaming: false,
            },
          ]);
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                streaming: false,
                content: updated[lastIdx].content || WELCOME_MESSAGE.content,
              };
            }
            return updated;
          });
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setWaitingFirstToken(false);

        const wasUserStop = userAbortedRef.current;
        userAbortedRef.current = false;

        if (err instanceof DOMException && err.name === "AbortError") {
          // User clicked Stop OR first-token timeout fired
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            // If we already started streaming, finalize the partial message
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && updated[lastIdx].streaming) {
              const partialContent = updated[lastIdx].content;
              if (wasUserStop) {
                // User stopped — keep whatever text we have, no error UI
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: partialContent || "",
                  streaming: false,
                  streamError: false,
                };
              } else {
                // Timeout mid-stream — show interrupted UI
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: partialContent || "",
                  streaming: false,
                  streamError: true,
                };
              }
              return updated;
            }
            // No streaming started yet — show a fresh message
            const stopContent = wasUserStop
              ? "⏹ Stopped. Type another question whenever you're ready! 🎯"
              : "⚠️ Request timed out — the coach took too long to respond. Please try again. 🔄";
            return [
              ...updated,
              {
                role: "assistant",
                content: stopContent,
                streamError: !wasUserStop,
              },
            ];
          });
          setError(wasUserStop ? null : "Request timed out. Try again.");
        } else {
          const msg = err instanceof Error ? err.message : "Something went wrong.";
          setError(msg);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            // If we already started streaming, mark the partial message as error
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant" && updated[lastIdx].streaming) {
              updated[lastIdx] = {
                ...updated[lastIdx],
                streaming: false,
                streamError: true,
              };
              return updated;
            }
            return [
              ...updated,
              {
                role: "assistant",
                content:
                  "⚠️ " +
                  msg +
                  "\n\nPlease try again in a moment. I'm here to help with your pronunciation! 🎯",
                streamError: true,
              },
            ];
          });
        }
      } finally {
        setLoading(false);
        setWaitingFirstToken(false);
        abortRef.current = null;
      }
    },
    [loading, messages, lessons, accent, xp, streak]
  );

  /** User-initiated stop — abort the in-flight stream and mark partial
   *  message as finalized (not errored). */
  const handleStop = useCallback(() => {
    userAbortedRef.current = true;
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastUserTextRef.current) {
      // Remove the last error assistant message
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant" && updated[updated.length - 1].streamError) {
          updated.pop();
        }
        // Also remove the last user message since sendMessage will add it
        if (updated.length > 0 && updated[updated.length - 1].role === "user") {
          updated.pop();
        }
        return updated;
      });
      setError(null);
      // Small delay to let state settle
      setTimeout(() => sendMessage(lastUserTextRef.current), 50);
    }
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (error && lastUserTextRef.current) {
        handleRetry();
      } else {
        sendMessage(input);
      }
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
                    <span>{loading ? "Thinking…" : "Online · here to help"}</span>
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
                <MessageBubble key={i} message={msg} onRetry={handleRetry} />
              ))}

              {/* Typing indicator — only while waiting for first token */}
              {waitingFirstToken && (
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

            {/* Error banner with retry */}
            {error && (
              <div className="px-3 pb-1 flex items-center gap-2">
                <span className="text-[10px] text-amber-400/80 font-mono flex-1">
                  Something went wrong. Press Enter or click retry.
                </span>
                <button
                  onClick={handleRetry}
                  className="text-[10px] text-[var(--c2)] hover:text-[var(--c)] font-mono flex items-center gap-1 transition"
                >
                  <RotateCw className="w-3 h-3" />
                  Retry
                </button>
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
                {loading ? (
                  <button
                    onClick={handleStop}
                    aria-label="Stop generating"
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--card-h)] border border-[var(--border2)] text-[var(--t1)] hover:bg-[rgba(239,68,68,0.18)] hover:border-[rgba(239,68,68,0.5)] hover:text-red-300 transition shrink-0"
                  >
                    <Square className="w-4 h-4" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (error && lastUserTextRef.current) {
                        handleRetry();
                      } else {
                        sendMessage(input);
                      }
                    }}
                    disabled={!input.trim() && !error}
                    aria-label="Send message"
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--p)] to-[var(--p2)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition shadow-[0_0_14px_rgba(99,102,241,0.4)] shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
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

function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: () => void;
}) {
  const isUser = message.role === "user";
  const isStreaming = message.streaming;
  const hasStreamError = message.streamError;

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
        {isUser ? (
          message.content
        ) : (
          <>
            {message.content ? renderWithIPA(message.content, !!isStreaming) : null}
            {hasStreamError && (
              <div className="mt-2 pt-2 border-t border-[rgba(255,180,0,0.2)] flex items-center gap-2">
                <span className="text-[11px] text-amber-400/90">
                  ⚠️ Response interrupted
                </span>
                <button
                  onClick={onRetry}
                  className="text-[10px] text-[var(--c2)] hover:text-[var(--c)] flex items-center gap-1 transition"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                  Retry
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
