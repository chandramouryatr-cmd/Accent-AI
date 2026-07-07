// TTS wrapper using expo-speech — the native equivalent of the web app's
// Web Speech API wrapper. Works on both iOS and Android natively.

import * as Speech from "expo-speech";
import type { Accent } from "./types";

export interface SpeakOptions {
  accent?: Accent;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  const lang = opts.accent === "uk" ? "en-GB" : "en-US";
  Speech.speak(text, {
    language: lang,
    rate: opts.rate ?? 0.95,
    pitch: opts.pitch ?? 1,
    onStart: opts.onStart,
    onDone: opts.onEnd,
    onStopped: opts.onEnd,
    onError: () => opts.onEnd?.(),
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}

export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  return Speech.getAvailableVoicesAsync();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
