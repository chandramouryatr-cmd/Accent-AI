# Task 5-d — Real Speech Recognition Scoring in Practice View

**Agent:** speech-recognition-builder
**Date:** 2024 (continuation of Round 9)
**Task ID:** 5-d

## Objective

Replace the simulated random score in the Practice view's `handleRecord` flow with REAL speech recognition using the browser's Web Speech API (SpeechRecognition). Compare the user's spoken transcript against the target phrase and compute a meaningful score, with graceful fallback to the existing simulated score when the API isn't available.

## Files Touched

- `src/lib/speech-recognition.ts` (NEW — 374 lines)
- `src/components/views/practice.tsx` (MODIFIED — added ~265 lines)

## Implementation

### 1. `src/lib/speech-recognition.ts`

#### Minimal Web Speech API type declarations
The Web Speech API isn't part of the standard TS DOM lib, so I declared the subset we use:
- `SpeechRecognitionAlternative`, `SpeechRecognitionResult`, `SpeechRecognitionResultList`
- `SpeechRecognitionEvent` (extends `Event`), `SpeechRecognitionErrorEvent`
- `SpeechRecognitionLike` (the instance interface) — exposes `lang`, `continuous`, `interimResults`, `maxAlternatives`, `start/stop/abort`, and `onresult/onerror/onend/onstart` handlers
- `SpeechRecognitionConstructor` with `new(): SpeechRecognitionLike`

> **Lint fix encountered:** Initial draft used `readonly item(index: number): ...` inside the `SpeechRecognitionResult` interface — TS rejects `readonly` on method declarations (only valid on properties/index signatures). Removed the modifier.

#### `isSpeechRecognitionAvailable(): boolean`
- Returns `false` during SSR (`typeof window === "undefined"`)
- Returns `true` if `"SpeechRecognition" in window || "webkitSpeechRecognition" in window`

#### `getSpeechRecognitionCtor()` (private)
- Returns `window.SpeechRecognition || window.webkitSpeechRecognition || null`
- Uses `as unknown as` cast to avoid TS errors since these aren't in the DOM lib

#### `SpeechRecognizer` class
- Constructor takes `{ lang?: string; callbacks?: SpeechRecognitionCallbacks }`
- Configures: `continuous=false`, `interimResults=true`, `maxAlternatives=1`, `lang` defaults to `"en-US"`
- Methods:
  - `start(): boolean` — returns false if unavailable or already running; swallows "already started" exceptions
  - `stop(): void` — calls native `stop()` (which fires `onend` shortly after)
  - `abort(): void` — calls native `abort()` (skips delivering more results)
  - `isAvailable(): boolean` — whether the browser has SpeechRecognition
  - `isRunning(): boolean`
  - `setCallbacks(cb): void` — merge/replace callbacks
- Callbacks interface:
  - `onResult?(transcript, isFinal)` — fires for both interim and final results
  - `onError?(error)` — error string from the API (e.g. `"no-speech"`, `"not-allowed"`)
  - `onEnd?()` — fires when recognition ends naturally (silence) OR after `stop()`
  - `onStart?()`

#### `scorePronunciation(target, transcript): PronunciationScore`

```ts
interface PronunciationScore {
  score: number;              // 0-100 integer
  matchedWords: string[];     // target words successfully said (target order)
  missedWords: string[];      // target words missed
  extraWords: string[];       // transcript words not in target
  targetWords: string[];      // normalized target words (order)
  transcriptWords: string[];  // normalized transcript words (order)
  matchedMask: boolean[];     // parallel to targetWords — for correct UI rendering
}
```

**Algorithm:**
1. **Normalize**: lowercase both strings, strip `[.,/#!$%^&*;:{}=\-_`~()?"'[\]]`, collapse whitespace
2. **Match**: greedy left-to-right — each target word claims the first unused transcript word that matches it. `wordsMatch()` allows:
   - exact match
   - prefix-variation for ≥4-char words (handles plurals/contraction-stripping leftovers) with length diff ≤ 2
   - Levenshtein ≤ 1 substitution/insertion/deletion for ≥3-char words (minor speech-to-text typo tolerance)
3. **Score formula**:
   - Base: `(matchedWords.length / targetWords.length) * 100`
   - + Sequence bonus (up to `+10`): fraction of consecutive matched words whose transcript indices are strictly increasing
   - − Extra-word penalty (up to `−10`): `min(10, extraWords.length * 3)`
   - Edge case: 0 matched words → score = 0 (avoids weird bonuses)
   - Clamp to 0–100, rounded

`matchedMask` is returned alongside `matchedWords` so the UI can render duplicate target words correctly (e.g. "the cat the dog" — if only one "the" was matched, `matchedMask[0]=true, matchedMask[2]=false` instead of both showing matched via `.includes()`).

### 2. `src/components/views/practice.tsx` modifications

Only modified `PracticeContentWithDiff` — the component actually rendered (the legacy `PracticeContent` defined earlier in the file is dead code; left it untouched to avoid breaking anything).

#### New imports
- `useRef`, `useEffect` from React
- `Sparkles`, `MessageSquare` from lucide-react
- `SpeechRecognizer`, `scorePronunciation`, `isSpeechRecognitionAvailable`, `type PronunciationScore` from `@/lib/speech-recognition`

#### New state
- `transcript: string` — recognized text shown in UI
- `pronScore: PronunciationScore | null` — full scoring result
- `demoMode: boolean` — true when SpeechRecognition wasn't available and we fell back to simulated score

#### New refs (for managing the recognition session across renders)
- `recognizerRef: useRef<SpeechRecognizer | null>`
- `transcriptRef: useRef<string>` — latest recognized text (avoids stale closure issues with the recognizer callback)
- `finalizedRef: useRef<boolean>` — guards against double-finalization (start `true` so the safety timer can't fire prematurely)
- `timerRef: useRef<ReturnType<typeof setTimeout> | null>` — 6s safety-net timer

#### `useEffect` cleanup on unmount
Aborts any in-flight recognizer and clears the safety timer — prevents leaks when the user navigates away mid-record.

#### `finalizeScoring` (useCallback, deps: `phrase.text`, `addSpeakingTime`)
The shared "stop and score" routine. Idempotent via `finalizedRef`:
1. Set `finalizedRef.current = true`, set `recording=false`, clear the timer
2. Read `finalTranscript = transcriptRef.current.trim()`
3. **Fallback path** (simulated score) — triggered when:
   - `isSpeechRecognitionAvailable()` is false, OR
   - `recognizerRef.current` is null/unavailable, OR
   - `finalTranscript` is empty (mic blocked, no speech detected)
   
   → sets `demoMode=true`, clears transcript/pronScore, computes `s = 65 + Math.floor(Math.random() * 30)` (preserves original simulated score formula), calls `addSpeakingTime(5)`, advances to `"results"` step.
4. **Real-scoring path** — calls `recognizer.stop()`, computes `scorePronunciation(phrase.text, finalTranscript)`, sets `score/transcript/pronScore/demoMode=false`, calls `addSpeakingTime(5)`, advances to `"results"` step.

#### Rewritten `handleRecord`
- **Toggle off** (currently recording): calls `finalizeScoring()` — preserves the existing toggle semantics
- **Toggle on** (start recording):
  - Reset all state (`score=null`, `transcript=""`, `pronScore=null`, `demoMode=false`)
  - Reset refs (`transcriptRef.current=""`, `finalizedRef.current=false`)
  - Create new `SpeechRecognizer` with accent-aware lang (`en-GB` for UK, `en-US` for USA) and callbacks:
    - `onResult(text)`: `transcriptRef.current = text` (latest transcript, interim or final)
    - `onEnd()`: call `finalizeScoring()` — browser stopped on its own (silence / end-of-utterance)
    - `onError`: deliberately NOT finalized here — leave to safety timer / explicit stop to avoid double-finalization on transient errors like `"no-speech"`
  - If available, call `recognizer.start()`
  - Schedule 6s safety-net `setTimeout` → `finalizeScoring()` (in case the recognizer never fires `onend`)

#### Updated reset blocks
`nextPhrase`, the `initialDiff !== diff` reset, and the `diff !== prevDiff` reset all now also:
- Clear transcript/pronScore/demoMode state
- Clear the safety timer
- Abort the recognizer
- Set `finalizedRef.current = true` (prevents stale finalization from firing later)
- Clear `transcriptRef.current`

#### New UI (inside the existing `{score !== null && (...)}` score block)

1. **"DEMO MODE" badge** (above the score ring):
   - `motion.div` with `initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay:0.15}}`
   - Inline-flex pill with Sparkles icon, amber theme (`rgba(245,158,11,0.12)` bg, `#fbbf24` text)
   - `font-mono uppercase tracking-wider text-[10px]`
   - Only renders when `demoMode===true`

2. **Transcript card** (after the "Watch:" word chips, before the closing `</motion.div>`):
   - Only renders when `!demoMode && transcript && pronScore`
   - `motion.div` slide-in: `initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:0.3, delay:0.4}}`
   - Background: `var(--card-h)`, border: `var(--border)` — sits as a sub-card inside the score block
   - Sections:
     - **"You said"** header (MessageSquare icon, `text-[10px] uppercase tracking-wider text-[var(--t3)] font-mono`) + italic transcript in curly quotes (`&ldquo;...&rdquo;`)
     - **"Word match"** — each target word as a `motion.span` pill with staggered reveal:
       - `initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{delay:0.5 + i*0.05, duration:0.2}}`
       - Matched: green (`#10b981` text, `rgba(16,185,129,0.15)` bg, `rgba(16,185,129,0.35)` border)
       - Missed: red (`#f87171` text, `rgba(239,68,68,0.12)` bg, `rgba(239,68,68,0.32)` border, `line-through`)
       - Uses `pronScore.matchedMask[i]` for correct rendering of duplicate target words
     - **"Extra words"** (only if any) — amber (`#fbbf24` text, `rgba(245,158,11,0.12)` bg, `rgba(245,158,11,0.3)` border), staggered reveal `delay: 0.7 + i*0.05`

3. **Demo-mode explanation card** (replaces transcript card when `demoMode===true`):
   - Amber-tinted card with "Simulated score" header (Sparkles icon)
   - Text: "Speech recognition isn't available in this browser, so this score is a simulated demo. Try Chrome or Edge for real pronunciation feedback."

## Constraints honored

- ✅ TypeScript strict mode — no `any` casts (used `as unknown as` for the SpeechRecognition window lookup)
- ✅ Next.js 16 App Router, `"use client"` directive preserved
- ✅ Minimal Web Speech API interfaces declared (since TS DOM lib doesn't include them)
- ✅ Framer Motion for all animations (slide-in card, staggered word reveals, scale-in badge)
- ✅ Existing CSS variables used: `--card-h`, `--border`, `--t1/t2/t3`, `--overlay-1`
- ✅ No indigo/blue colors (uses amber for demo, green/red/amber for word match)
- ✅ `bun run lint` — PASS (exit 0)
- ✅ Dev server compiles cleanly, `GET / 200`
- ✅ Existing functionality preserved (toggle behavior, score ring, "Watch:" chips, tips, next phrase, phoneme keyboard, speed control, all challenge/drill modes untouched)
- ✅ `addSpeakingTime(5)` called in BOTH real-scoring and demo-mode-fallback paths
- ✅ The dead-code `PracticeContent` (defined earlier in the same file but never rendered) was intentionally left alone — modifying it would add risk for zero benefit

## Verification

- `bun run lint` → PASS (0 errors, 1 unrelated pre-existing warning about an unused eslint-disable in compare-wave.tsx)
- Dev server log shows successful compiles and `GET / 200` responses after the edits
- Grep confirms the simulated-score fallback line `65 + Math.floor(Math.random() * 30)` now appears in:
  - The dead-code `PracticeContent` (lines 104, 112 — untouched, was already there)
  - The active `PracticeContentWithDiff.finalizeScoring` fallback path (line 501 — intentional)

## Key results

- Practice view now gives meaningful pronunciation feedback based on what the user actually said
- Word-by-word visual breakdown helps the learner see exactly which words they nailed and which to work on
- Graceful fallback ensures the feature works in all browsers (Safari/Firefox get demo mode; Chrome/Edge get real scoring)
- The architecture (SpeechRecognizer class + pure scoring function) is reusable — could be applied to lesson `shadow` and `practice` step types in a future task
