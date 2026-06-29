"use client";

// Web Speech API wrapper for pronunciation playback.
// Uses the browser's built-in speechSynthesis (no API key, works offline).
// Falls back gracefully if unavailable.

let voicesCache: SpeechSynthesisVoice[] = [];

export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      resolve([]);
      return;
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      voicesCache = existing;
      resolve(existing);
      return;
    }
    const handler = () => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    setTimeout(() => {
      voicesCache = window.speechSynthesis.getVoices();
      resolve(voicesCache);
    }, 250);
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

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!isTTSAvailable()) {
    opts.onEnd?.();
    return;
  }
  // cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  const lang = opts.lang || (opts.accent === "uk" ? "en-GB" : "en-US");
  utter.lang = lang;
  utter.rate = opts.rate ?? 1;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = opts.volume ?? 1;

  // try to pick a matching voice
  const voices = voicesCache.length > 0 ? voicesCache : window.speechSynthesis.getVoices();
  const match =
    voices.find((v) => v.lang === lang) ||
    voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ||
    voices.find((v) => v.lang.startsWith("en"));
  if (match) utter.voice = match;

  utter.onstart = () => opts.onStart?.();
  utter.onend = () => opts.onEnd?.();
  utter.onerror = () => opts.onEnd?.();

  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (isTTSAvailable()) window.speechSynthesis.cancel();
}
