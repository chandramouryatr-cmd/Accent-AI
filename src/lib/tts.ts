"use client";

// Web Speech API wrapper for pronunciation playback.
// Uses the browser's built-in speechSynthesis (no API key, works offline).
// Falls back gracefully if unavailable.
//
// Robustness features:
// - Async voice loading via `voiceschanged` event + 1000ms fallback timeout
// - Module-level voice cache, refreshed whenever the browser emits
//   voiceschanged (voices can load asynchronously after first call)
// - `unlockTTS()` to satisfy browsers that require a user gesture before
//   audio playback (mobile Safari, Chrome on Android). Auto-invoked on the
//   first `speak()` call if not already unlocked.
// - Chrome "pause after ~15s" bug workaround: periodic `resume()` while
//   speaking to keep long utterances alive.
// - Speaking-state subscription so UI can reflect whether TTS is active.
// - "Speak with retry" — if `onstart` doesn't fire within 500ms, cancel and
//   retry once (some browsers silently fail to start the first attempt).

let voicesCache: SpeechSynthesisVoice[] = [];
let speakingState = false;
const speakingListeners = new Set<() => void>();
let unlocked = false;
let voicesChangedWired = false;

function setSpeaking(v: boolean) {
  if (speakingState === v) return;
  speakingState = v;
  speakingListeners.forEach((l) => {
    try {
      l();
    } catch {
      // listener errors must not break the state machine
    }
  });
}

/** Whether TTS is currently producing sound. */
export function isSpeaking(): boolean {
  return speakingState;
}

/**
 * Subscribe to speaking-state changes. The callback is invoked whenever TTS
 * starts or stops. Returns an unsubscribe function.
 */
export function onSpeakingChange(cb: () => void): () => void {
  speakingListeners.add(cb);
  return () => {
    speakingListeners.delete(cb);
  };
}

export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Some browsers (notably mobile Safari and Chrome on Android) block
 * speechSynthesis.speak() until a user gesture has occurred. Calling this
 * function with an empty, silent utterance "unlocks" the audio context.
 *
 * Safe to call multiple times — no-ops after the first successful unlock.
 * Recommended to call on the first user interaction (pointerdown / keydown)
 * so subsequent programmatic speak() calls work without delay.
 */
export function unlockTTS(): void {
  if (!isTTSAvailable() || unlocked) return;
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    u.rate = 1;
    window.speechSynthesis.speak(u);
    unlocked = true;
  } catch {
    // swallow — unlock is best-effort
  }
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      if (typeof console !== "undefined") {
        console.warn("[tts] speechSynthesis not available — TTS disabled");
      }
      resolve([]);
      return;
    }

    // Wire a persistent voiceschanged listener once so the cache stays
    // fresh even when voices load asynchronously after the initial call.
    if (!voicesChangedWired) {
      voicesChangedWired = true;
      try {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            voicesCache = window.speechSynthesis.getVoices();
          } catch {
            // ignore
          }
        };
      } catch {
        // ignore
      }
    }

    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      voicesCache = existing;
      resolve(existing);
      return;
    }

    let settled = false;
    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      if (voices.length > 0) voicesCache = voices;
      resolve(voicesCache);
    };

    // One-shot listener for THIS loadVoices() call. The persistent
    // onvoiceschanged handler above keeps the cache fresh long-term; this
    // listener just resolves the promise as soon as voices arrive.
    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) finish(v);
    };
    try {
      window.speechSynthesis.addEventListener("voiceschanged", handler);
    } catch {
      // ignore — fallback timeout below will still resolve
    }

    // Fallback timeout — never leave the caller hanging.
    setTimeout(() => {
      try {
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
      } catch {
        // ignore
      }
      finish(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

export interface SpeakOptions {
  lang?: string; // e.g. "en-US"
  rate?: number; // 0.1 - 10, default 1
  pitch?: number; // 0 - 2, default 1
  volume?: number; // 0 - 1, default 1
  accent?: "usa" | "uk";
  onEnd?: () => void;
  onStart?: () => void;
}

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  let voices: SpeechSynthesisVoice[] = voicesCache;
  if (voices.length === 0 && isTTSAvailable()) {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) voicesCache = voices;
  }
  if (voices.length === 0) return undefined;
  const base = lang.split("-")[0];
  return (
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang.startsWith(lang)) ||
    voices.find((v) => v.lang.startsWith(base)) ||
    voices.find((v) => v.lang.startsWith("en"))
  );
}

function speakInternal(
  text: string,
  opts: SpeakOptions,
  isRetry: boolean
): void {
  if (!isTTSAvailable()) {
    if (typeof console !== "undefined") {
      console.warn("[tts] speechSynthesis not available — cannot speak");
    }
    // call onEnd so UI doesn't hang waiting for a never-coming end event
    opts.onEnd?.();
    return;
  }

  // Auto-unlock on first speak (best-effort if a user gesture already
  // happened, e.g. the speak call itself was triggered by a click).
  if (!unlocked) unlockTTS();

  // Cancel any ongoing speech before starting a new utterance.
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }

  const utter = new SpeechSynthesisUtterance(text);
  const lang = opts.lang || (opts.accent === "uk" ? "en-GB" : "en-US");
  utter.lang = lang;
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = opts.volume ?? 1;

  const match = pickVoice(lang);
  if (match) utter.voice = match;

  // Chrome bug: speechSynthesis pauses after ~15s. Periodically call resume()
  // while speaking to keep long utterances alive.
  let resumeInterval: ReturnType<typeof setInterval> | null = null;
  let startTimer: ReturnType<typeof setTimeout> | null = null;
  let finished = false;
  let started = false;

  const cleanup = () => {
    if (resumeInterval) {
      clearInterval(resumeInterval);
      resumeInterval = null;
    }
    if (startTimer) {
      clearTimeout(startTimer);
      startTimer = null;
    }
  };

  utter.onstart = () => {
    started = true;
    if (startTimer) {
      clearTimeout(startTimer);
      startTimer = null;
    }
    setSpeaking(true);
    opts.onStart?.();
    // Begin the resume watchdog once speaking actually starts.
    resumeInterval = setInterval(() => {
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        } else if (resumeInterval) {
          clearInterval(resumeInterval);
          resumeInterval = null;
        }
      } catch {
        // ignore
      }
    }, 5000);
  };

  utter.onend = () => {
    if (finished) return;
    finished = true;
    cleanup();
    setSpeaking(false);
    opts.onEnd?.();
  };

  utter.onerror = () => {
    if (finished) return;
    // If onstart never fired and we haven't retried yet, retry once.
    // This catches the silent-no-start failure mode some browsers exhibit.
    if (!started && !isRetry) {
      cleanup();
      setSpeaking(false);
      setTimeout(() => speakInternal(text, opts, true), 60);
      return;
    }
    finished = true;
    cleanup();
    setSpeaking(false);
    // call onEnd so UI doesn't hang
    opts.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utter);
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn("[tts] speak() threw:", err);
    }
    cleanup();
    setSpeaking(false);
    opts.onEnd?.();
    return;
  }

  // "Speak with retry" — if onstart doesn't fire within 500ms, cancel and
  // retry once. Some browsers silently fail to start the first attempt
  // (especially before any user gesture); the retry usually works.
  if (!isRetry) {
    startTimer = setTimeout(() => {
      startTimer = null;
      if (finished || started) return;
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      cleanup();
      setSpeaking(false);
      setTimeout(() => speakInternal(text, opts, true), 60);
    }, 500);
  }
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  speakInternal(text, opts, false);
}

export function stopSpeaking(): void {
  if (isTTSAvailable()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
  setSpeaking(false);
}
