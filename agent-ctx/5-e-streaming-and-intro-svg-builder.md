# Task ID: 5-e — Agent: streaming-and-intro-svg-builder

## Task
Add two features to the AccentAI app: (1) AI Coach streaming responses (refine the existing SSE pipeline + add a Stop button to the chat UI) and (2) animated SVG illustrations for lesson intro steps.

## Work Log
- Read `worklog.md` (full project context), the existing `src/app/api/ai-coach/route.ts` (already returned an SSE stream), `src/components/ai-coach/ai-coach-chat.tsx` (already consumed the stream with AbortController + typing indicator), `src/components/lesson/lesson-modal.tsx` (`IntroStepView`), and `src/lib/types.ts` (`StepVisual` union) to ground the work.
- Refined `src/app/api/ai-coach/route.ts`:
  - Hoisted the upstream SDK reader into an outer scope.
  - Added an explicit `cancel()` handler on the transform `ReadableStream` that calls `upstreamReader.cancel()` so client disconnects (user Stop, navigate, close) release the upstream SDK connection instead of consuming tokens until natural completion.
  - All existing logic preserved: `{ messages, context, mode }` validation, dual `chat`/`insights` system prompts, OpenAI-style chunk parsing, `simulateStreamFromFullText` fallback, GET metadata endpoint.
- Updated `src/components/ai-coach/ai-coach-chat.tsx`:
  - Imported `Square` icon from lucide-react.
  - Added `userAbortedRef` to distinguish user Stop from first-token timeout (both throw `AbortError`).
  - Refactored catch-block AbortError branch: user-stop mid-stream keeps partial text with no error UI; timeout mid-stream keeps "⚠️ Response interrupted" + Retry; user-stop pre-first-token shows `"⏹ Stopped..."` (no error); timeout pre-first-token shows `"⚠️ Request timed out..."`.
  - Added `handleStop` callback that sets `userAbortedRef` then aborts.
  - Replaced the Send button with a Stop button (Square icon, `fill="currentColor"`) when `loading` is true — effectively disables Send during streaming. Textarea already had `disabled={loading}`.
  - IPA rendering already runs on streaming text (`renderWithIPA(message.content, !!isStreaming)`) — blink cursor visible only while `streaming:true`. No change needed.
- Created `src/components/widgets/intro-illustration.tsx` (new file, ~670 lines):
  - Exports `IntroIllustration({ visual, emoji?, size=120 })` — picks one of six looping animated SVG variants based on the `StepVisual` field.
  - All variants use `viewBox="0 0 120 120"` and palette from existing CSS vars (`--p`, `--p2`, `--p3`, `--c`, `--c2`).
  - **Wave** (`wave`/`compare-wave`/`linking`/`intonation`): 4 concentric rings pulsing outward + radial-gradient core + 4 N/E/S/W frequency ticks.
  - **Mouth** (`mouth`): upper lip (static), animated mouth opening via path `d` morphing, lower lip morphs in sync, tongue ellipse rises, 3 cyan sound particles float upward.
  - **Vowel quadrilateral** (`ipa-chart`/`vowel-chart`): classic IPA trapezoid with `front/back/high/low` labels, 4 colored dots wandering inside with pulse rings.
  - **Rhythm** (`rhythm`/`stress-bars`): 4 beat circles (2 heavy/2 light) with pulse rings + glow halos, dashed baseline, metronome sweep line rotating -32°↔32° pivoting at (60,90).
  - **Emoji burst** (`emoji-burst`): 8 particles flying outward radially, central gradient orb, optional emoji as SVG `<text>` or 4-pointed sparkle.
  - **Gradient orb** (default + `phoneme-grid`/`shadow`): rotating glow ring (strokeDasharray "60 200", 360° over 5s), pulse halo, core orb, rotating sparkle.
  - Used `transformBox: "fill-box"` + `transformOrigin: "center"` for circle scaling; explicit pixel `transformOrigin: "60px 90px"` for the metronome line pivot.
  - Wrapped in `<div aria-hidden="true">` so the SVG is decorative.
- Integrated into `IntroStepView` in `src/components/lesson/lesson-modal.tsx`:
  - Added `import { IntroIllustration } from "@/components/widgets/intro-illustration";`.
  - Replaced the previous `text-7xl` emoji block with a flex-column wrapper containing the 120×120 IntroIllustration (inside the existing `animate-gentle-float` div) and, if `step.emoji` is defined, a smaller `text-2xl` emoji below it.
  - Preserved spring entrance, eyebrow, gradient title, subtitle, description, waveform canvas, "Hear the title" button, TTS speed control.
- Verified `bun run lint` → EXIT 0 after each round.
- Verified dev.log shows clean compiles and `GET / 200`. The one-off "Fast Refresh had to perform a full reload" warning is a known limitation when editing `lesson-modal.tsx` (which exports many internal step-view components) and resolved itself on the next compile — no runtime errors.
- Verified `GET /api/ai-coach` still returns metadata JSON (200) with `streaming: true`.

## Stage Summary
- **AI Coach streaming**: API route now has a proper `cancel()` handler that releases the upstream SDK reader on client disconnect. Chat UI now ships a Stop button (Square icon, replaces Send while streaming) wired to `AbortController.abort()`; `userAbortedRef` differentiates explicit user stops from first-token timeouts. User stops mid-stream preserve partial text with NO error UI; timeouts keep the existing interrupted + Retry banner. Send is effectively disabled while streaming (replaced by Stop). IPA rendering continues to work on streaming text with the blink cursor.
- **Intro illustrations**: New `intro-illustration.tsx` renders a 120×120 looping animated SVG based on the IntroStep's `visual` field — six distinct variants (wave, mouth, vowel quadrilateral, rhythm, emoji burst, gradient orb) covering all 12 StepVisual values. All animations use Framer Motion and the indigo/violet/cyan palette from existing CSS variables. `IntroStepView` now renders the illustration above the title with an auxiliary emoji below (when defined), replacing the previous emoji-only hero.
- `bun run lint` PASS (exit 0). Dev server compiles cleanly, all routes return HTTP 200, no runtime errors in dev.log. No existing functionality broken; no other files modified.
