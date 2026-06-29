# Task 4 — TTS Fix Agent

## Goal
Fix "i cant hear any sound" — make `src/lib/tts.ts` reliable across browsers.

## Files Modified
- `src/lib/tts.ts` — full rewrite (~290 lines), preserved public API
- `src/app/page.tsx` — added `unlockTTS()` on first user gesture (pointerdown/keydown/touchstart)

## Public API (unchanged signatures)
- `speak(text: string, opts?: SpeakOptions): void`
- `stopSpeaking(): void`
- `loadVoices(): Promise<SpeechSynthesisVoice[]>`
- `isTTSAvailable(): boolean`
- `interface SpeakOptions`

## New Exports
- `isSpeaking(): boolean` — current speaking state
- `onSpeakingChange(cb: () => void): () => void` — subscribe to speaking-state changes; returns unsubscribe
- `unlockTTS(): void` — speak a silent empty utterance to satisfy user-gesture requirement; idempotent

## Reliability Improvements
1. **Voice loading** — persistent `onvoiceschanged` listener refreshes module cache; `loadVoices()` uses one-shot `addEventListener` + 1000ms fallback timeout (up from 250ms).
2. **User-gesture unlock** — `unlockTTS()` creates a volume-0 empty utterance. Auto-called in `speak()` if not unlocked. Wired in `page.tsx` on first pointerdown/keydown/touchstart.
3. **Chrome ~15s pause bug** — 5s `setInterval` calls `speechSynthesis.resume()` while speaking; self-clears when speaking stops.
4. **Speak-with-retry** — 500ms `startTimer`; if `onstart` doesn't fire, cancel + retry once (60ms delay). Same retry-once on `onerror` if `!started && !isRetry`.
5. **Error handling** — `console.warn` when unavailable; `onEnd` always called on failure/throw so UI never hangs.
6. **Speaking state** — `setSpeaking(v)` internal mutator notifies subscribers via `Set<() => void>`; `stopSpeaking()` also resets state.

## Verification
- `bun run lint` → EXIT 0 (no errors, no warnings)
- dev.log: `✓ Compiled in 188ms`, `GET / 200 in 291ms` — no runtime errors
- No consumer files modified — all 20+ `speak()` call sites, 2 `loadVoices()` sites, and the `stopSpeaking()` cleanup in lesson-modal continue to work unchanged
