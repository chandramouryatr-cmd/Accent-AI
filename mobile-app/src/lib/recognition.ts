// Speech recognition wrapper using expo-speech-recognition.
// Uses the ExpoSpeechRecognitionModule native module — SFSpeechRecognizer on iOS,
// Android SpeechRecognizer on Android.
//
// NOTE: On iOS, recognition is capped at ~60 seconds per session by Apple.
// For longer audio, chunk recognition or use a cloud ASR service (e.g. the
// z-ai ASR skill via the Next.js backend).

import {
  ExpoSpeechRecognitionModule,
  addSpeechRecognitionListener,
} from "expo-speech-recognition";
import type {
  ExpoSpeechRecognitionResultEvent,
  ExpoSpeechRecognitionErrorEvent,
} from "expo-speech-recognition";
import type { Accent } from "./types";

export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

export interface RecognitionHandlers {
  onResult: (result: RecognitionResult) => void;
  onError?: (err: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  /**
   * Request microphone + speech recognition permissions.
   * Returns true if both are granted.
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const speech = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!speech.granted) return false;
      const mic = await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
      return mic.granted;
    } catch {
      return false;
    }
  }

  /**
   * Whether speech recognition is available on this device.
   */
  isAvailable(): boolean {
    try {
      // supportsRecording is a safe proxy — if the device can't record audio,
      // speech recognition definitely won't work either.
      return ExpoSpeechRecognitionModule.supportsRecording();
    } catch {
      return false;
    }
  }

  /**
   * Start listening for speech. Returns a stop function.
   * The native recognizer is single-shot — call stop() to finalize.
   */
  start(handlers: RecognitionHandlers, accent: Accent = "usa"): () => void {
    const lang = accent === "uk" ? "en-GB" : "en-US";

    const subStart = addSpeechRecognitionListener("start", () => {
      handlers.onStart?.();
    });
    const subResult = addSpeechRecognitionListener("result", (event: ExpoSpeechRecognitionResultEvent) => {
      const alt = event.results?.[0];
      if (alt) {
        handlers.onResult({
          transcript: alt.transcript,
          confidence: alt.confidence ?? 0,
        });
      }
    });
    const subEnd = addSpeechRecognitionListener("end", () => {
      handlers.onEnd?.();
    });
    const subError = addSpeechRecognitionListener("error", (event: ExpoSpeechRecognitionErrorEvent) => {
      handlers.onError?.(event?.error ?? "unknown");
    });

    try {
      ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
      });
    } catch (err) {
      handlers.onError?.(String(err));
    }

    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch { /* noop */ }
      try { subStart.remove(); } catch { /* noop */ }
      try { subResult.remove(); } catch { /* noop */ }
      try { subEnd.remove(); } catch { /* noop */ }
      try { subError.remove(); } catch { /* noop */ }
    };
  }

  stop(): void {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch { /* noop */ }
  }
}

export const speechRecognition = new SpeechRecognitionService();
