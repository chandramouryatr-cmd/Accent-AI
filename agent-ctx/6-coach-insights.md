# Task ID: 6-coach-insights — Agent: coach-insights-builder

## Task
Build a "Coach Insights" AI-powered panel that uses the AI Coach backend to analyze the user's weakest phonemes from their PhonemeMastery data and generate a personalized practice plan. Renders on the Dashboard between Sound Profile and Quick Actions as a structured card with three sections: Focus Areas, Recommended Lessons, and Practice Tips.

## Context Review
- Read `/home/z/my-project/worklog.md` (847 lines) — absorbed AccentAI project context: Next.js 16 single-route SPA, 32 lessons across 8 phases, Zustand store, dark-default indigo/violet/cyan palette, Framer Motion throughout. Existing AI Coach at `/api/ai-coach` streams SSE tokens via z-ai-web-dev-sdk.
- Read `/home/z/my-project/agent-ctx/7-ai-coach-ai-coach-builder.md` — understood AI Coach backend's system-prompt design philosophy and SSE consumption pattern.
- Inspected key files: `src/app/api/ai-coach/route.ts`, `src/components/widgets/phoneme-mastery.tsx` (PHONEME_LESSONS mapping reference), `src/components/views/dashboard.tsx` (insertion point at line 694→696), `src/lib/store.ts`, `src/lib/lessons/index.ts`, `src/lib/types.ts`, `src/components/ai-coach/ai-coach-chat.tsx` (SSE pattern reference).

## Work Log

### File 1 — MODIFIED: `src/app/api/ai-coach/route.ts`
- Added `PhonemeScore` interface and extended `RequestContext` with optional `phonemeMastery?: PhonemeScore[]` field.
- Added `mode?: "chat" | "insights"` to `RequestBody`.
- Added new `buildInsightsSystemPrompt(ctx)` function — a focused system prompt that:
  - Embeds user's accent, XP, streak, completed-lesson count, and the FULL phoneme-mastery list (weakest-first) as readable bullet text
  - Embeds the entire 8-phase × 4-lesson AccentAI catalog (exact lesson titles) so the model picks real lessons
  - Specifies strict output requirements: ONLY a single valid JSON object, no markdown fences, must start with `{` and end with `}`, three exact keys (`focusAreas`, `recommendedLessons`, `tips`), constrained item shapes (phoneme without slashes, score 0-100, reason ≤ 1 sentence; phase 1-8, exact lesson title; tips ≤ 3 items, ≤ 18 words each)
  - Tells the model to pick focus areas from the user's actual weakest phonemes (fallback to /θ/, /ð/, /æ/ if no data) and to recommend next-step lessons appropriate to the learner's experience
- In `POST` handler: added `isInsights = body.mode === "insights"` check; loosened input validation so insights mode accepts an empty `messages` array (synthesize a user message inside the handler since the plan is fully derived from context, not from chat input).
- For insights mode: filter out client-supplied system messages, synthesize a user message when none provided, then build finalMessages with the insights system prompt.
- Lowered temperature to 0.45 (vs 0.7 chat) for more consistent JSON output; bumped max_tokens to 900 for richer plan content.
- Updated GET endpoint schema doc to advertise the new `mode` field, `phonemeMastery` context field, and JSON shape returned by insights mode.

### File 2 — CREATED: `src/components/widgets/coach-insights.tsx` (989 lines)
- Self-contained `<CoachInsights />` component (no props).
- **Data gathering**: reads `lessons`, `xp`, `streak`, `accent`, `setActiveLesson` from Zustand store. Derives phoneme mastery via local `derivePhonemeMastery()` helper that mirrors PhonemeMastery widget logic exactly (same PHONEME_LESSONS mapping, same avg-score + weakest-first sort). Returns top 5 weakest phonemes with example + score + count + bestLessonId.
- **API integration**: POSTs to `/api/ai-coach` with `{ mode: "insights", messages: [], context: { accent, xp, streak, completedLessons, phonemeMastery: top5 } }`. Consumes SSE stream token-by-token (same pattern as ai-coach-chat.tsx), accumulates text, then on completion attempts robust JSON parsing.
- **Robust JSON parsing** (`extractJson(text)` + `normalizePlan(raw)`): 3-tier fallback — (1) direct JSON.parse, (2) unwrap ```json…``` or ```…``` fences, (3) slice between first `{` and last `}`. Then `normalizePlan` validates/coerces each field. Returns null only if all three sections are empty → falls back to raw text rendering.
- **localStorage caching**: keyed by `accentai-coach-insights-{YYYY-MM-DD}` (date-based, fresh plan each day). On mount: tries to load today's cached entry, jumps straight to success view if found. After each successful fetch: persists `{ parsed, rawText, generatedAt, signature }`.
- **States & UX**:
  - `idle`: Animated 64px gradient orb (Sparkles icon + rotating ✨ emoji) + context-aware subtext + "Get AI Insights" gradient button (Zap icon)
  - `loading`: Rotating gradient orb with blurred glow + pulsing center Sparkles + 3-dot bouncing animation (staggered 0/0.15/0.3s delay) + "Analyzing your progress…" headline + "Reading phoneme scores · picking lessons · crafting tips" subtext
  - `error`: Red AlertTriangle icon + friendly error message + "Try again" button
  - `success` (parsed JSON): Three sections with staggered entrance animations:
    1. **🎯 Your Focus Areas** — grid of cards (1 col mobile, 2 col sm+), each card has: phoneme symbol in colored tile (red/amber/green based on score), animated SVG ScoreRing (stroke-dashoffset + drop-shadow glow + score number in center), 1-sentence reason text
    2. **📚 Recommended Lessons** — vertical stack of clickable cards. Each: phase pill (e.g. "P1"), lesson title (bold), 1-sentence reason, BookOpen icon in gradient tile, ChevronRight that animates on hover. Clicking opens the lesson via `setActiveLesson(lesson.id)` — uses `ALL_LESSONS.find(l => l.title === rec.lesson)` for title→ID lookup with fuzzy fallback
    3. **💡 Practice Tips** — bullet list with amber Lightbulb icons in circular badges, staggered slide-in from left
    Footer: "✨ Generated by AccentAI Coach · regenerate" with inline regenerate button
  - `success` (raw text fallback, when JSON parsing fails): Single "Coach Advice" section with the raw AI text — graceful degradation so user always sees something useful
- **Refresh button** in header (top-right) — visible only in success state
- **Visual style**: Animated mesh gradient border (4-stop indigo→violet→cyan→indigo, backgroundPosition animates over 8s infinite). Inner card uses glass morphism (`backdrop-filter: blur(16px)`, dark gradient bg). Two floating radial orbs (violet top-right + cyan bottom-left, scale/opacity pulse on different timings).
- **Framer Motion**: All transitions spring-based (stiffness 280, damping 24 for cards) with staggered delays. Hover: cards lift -2px. Tap: scale 0.98. AnimatePresence mode="wait" between view states for smooth crossfade.
- **Mobile-first responsive**: Single column mobile, 2-col grid focus areas on sm+. Cards have proper min-w-0 + truncate for long content.
- **Accessibility**: `<motion.section aria-label="Coach Insights">`, all buttons have aria-labels, background orbs aria-hidden, t1/t2/t3 token contrast maintained.
- **AbortController + 30s first-token timeout** for clean cancellation.

### File 3 — MODIFIED: `src/components/views/dashboard.tsx`
- Added import: `import { CoachInsights } from "@/components/widgets/coach-insights";`
- Inserted `<CoachInsights />` between "Your Sound Profile" section and "Quick Actions" section (line 697→699), wrapped with comment `{/* Coach Insights — AI-powered personalized practice plan */}`. No other dashboard changes.

### File 4 — FIXED PRE-EXISTING LINT ERROR: `src/components/lesson/lesson-modal.tsx`
- `bun run lint` initially surfaced a pre-existing `react-hooks/set-state-in-effect` error at line 126 (`setShowSpaceHint(false)` and `setShowSpaceHint(true)` called synchronously inside the "Press Space to play" hint useEffect). This was blocking the lint check.
- Applied the same "adjust state during render" pattern used elsewhere in this file (the prevStepIdx pattern): moved `setShowSpaceHint(!!getPrimaryAudioText(lesson.steps[stepIdx]))` into the existing render-time stepIdx-change adjustment block. Replaced the effect with a minimal auto-hide timer that only fires when `showSpaceHint` is already true (no synchronous setState in effect body — the setTimeout callback is allowed by the rule).
- This fix is unrelated to the Coach Insights task but was necessary to make `bun run lint` exit cleanly (task requires zero lint errors).

## Verification
- `bun run lint` → EXIT 0 (zero errors, zero warnings)
- `curl -s http://localhost:3000/api/ai-coach` → HTTP 200, returns updated schema doc with `mode` field and `phonemeMastery` context field advertised
- `curl -X POST /api/ai-coach` with `mode: "insights"` + sample phoneme mastery data → returns SSE stream that reassembles into VALID JSON with all three sections (focusAreas: 3 items, recommendedLessons: 3 items, tips: 3 items). Model correctly picked the user's actual weakest phonemes (θ 58%, ð 62%, æ 71%) and recommended real AccentAI lessons ("Mouth Positioning" p1l3, "100 Core Words" p2l1, "Listening Recognition" p1l4).
- dev.log: all `✓ Compiled in XXXms`, all `GET / 200`, `POST /api/ai-coach 200` — no errors, no warnings.
- Dashboard page (`GET /`) returns HTTP 200 in ~230ms.

## Stage Summary
- **1 new file created**: `src/components/widgets/coach-insights.tsx` (989 lines, fully self-contained)
- **2 files modified**: `src/app/api/ai-coach/route.ts` (added `mode: "insights"` branch + `buildInsightsSystemPrompt` + `PhonemeScore` type + relaxed validation), `src/components/views/dashboard.tsx` (1 import + 1 component render line)
- **1 pre-existing lint error fixed**: `src/components/lesson/lesson-modal.tsx` (refactored `setShowSpaceHint` from setState-in-effect to render-time adjustment pattern)
- **Lint: PASS (exit 0). Dev server: HTTP 200. AI Coach insights mode: live-tested with real LLM call returning valid structured JSON.**
- Feature is fully functional: dashboard now shows the CoachInsights panel between Sound Profile and Quick Actions. Clicking "Get AI Insights" triggers analysis of the user's phoneme mastery data, shows a loading state with animated dots, then renders a beautifully formatted 3-section card with focus areas (phoneme + score ring + reason), recommended lessons (clickable to open the lesson), and practice tips (bulleted). Caches the result in localStorage keyed by date so subsequent same-day renders skip the API call. Refresh button regenerates on demand.

## Notes for Future Agents
- The `extractJson` function is deliberately permissive (3-tier fallback). If you ever change the system prompt to be more rigid, you can simplify this — but the permissiveness is a feature: it gracefully handles models that wrap JSON in markdown fences or add stray text.
- The localStorage key is date-keyed (`accentai-coach-insights-2026-03-05`). If you want to add a "monthly archive" view of past insights, just iterate over all keys with the prefix.
- The `PhonemeScore` type is defined in both `coach-insights.tsx` (frontend) and `route.ts` (backend). They're intentionally not shared because the API and client may evolve independently.
- The lesson-title → lesson-ID lookup uses exact match first, then fuzzy fallback (phase match + first 8 chars of title). If you rename lessons in the catalog, you may need to regenerate the cached insights (use the Refresh button).
