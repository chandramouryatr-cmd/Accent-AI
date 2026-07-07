// API client for the AccentAI backend.
// Hits the existing Next.js /api/ai-coach endpoint (SSE streaming).
//
// Configure the backend URL via the API_BASE_URL env var (see .env.example).
// For local dev, set it to your machine's LAN IP, e.g.:
//   API_BASE_URL=http://192.168.1.5:3000
// The phone must be on the same WiFi as the dev machine.

import Constants from "expo-constants";
import { useAppStore } from "./store";

const API_BASE_URL =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://accentai.example.com";

export interface CoachContext {
  accent?: string;
  xp?: number;
  streak?: number;
  completedLessons?: string[];
}

export interface CoachMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Stream a chat completion from the AccentAI AI coach endpoint.
 * Calls onToken for every token chunk, returns the full text on completion.
 */
export async function streamCoachReply(
  messages: CoachMessage[],
  onToken: (token: string) => void,
  context?: CoachContext
): Promise<string> {
  const url = `${API_BASE_URL}/api/ai-coach`;

  const state = useAppStore.getState();
  const fullContext: CoachContext = {
    accent: state.accent,
    xp: state.xp,
    streak: state.streak,
    completedLessons: Object.values(state.lessons)
      .filter((l) => l.completed)
      .map((l) => l.lessonId),
    ...context,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ messages, context: fullContext, mode: "chat" }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Coach request failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const dataStr = trimmed.slice(5).trim();
      if (dataStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.token) {
          fullText += parsed.token;
          onToken(parsed.token);
        }
      } catch {
        // skip non-JSON
      }
    }
  }

  return fullText;
}

export const API_URL = API_BASE_URL;
