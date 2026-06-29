# Task ID: 7-ai-coach — Agent: ai-coach-builder

## Task
Build an "AI Pronunciation Coach" — a floating action button (FAB) on the bottom-right of the app that opens a chat modal. The coach gives personalized pronunciation advice, answers questions about English phonetics, and helps users with their accent learning journey.

## Work Log
- Read worklog.md to absorb context from previous agents (project overview, tech stack, existing store/widgets/views, completed phases of work)
- Inspected store.ts, app-shell.tsx, globals.css, types.ts, page.tsx, lesson-modal.tsx patterns and the z-ai-web-dev-sdk type definitions (ChatMessage, completions.create signature)
- Created `src/app/api/ai-coach/route.ts`:
  - POST endpoint accepting `{ messages, context }` with validation, sanitization, and 20-message cap
  - Builds a detailed system prompt positioning the AI as "AccentAI Coach" with 8 core principles (IPA notation, tactile mouth guidance, word breakdowns, encouraging tone, scannable 2-4 paragraph responses, GenAm vs RP distinction, off-topic steering)
  - Injects user context (accent, XP, streak, completed lesson IDs) into the prompt naturally
  - Calls `zai.chat.completions.create({ messages, temperature: 0.7, max_tokens: 800 })`
  - Robust reply extraction supporting both OpenAI-style `{choices:[{message:{content}}]}` and string/plain-object fallbacks
  - Graceful error handling: 400 for bad input, 500 with friendly message on SDK failure (dev detail included)
  - GET endpoint returns schema info for discoverability
- Created `src/components/ai-coach/ai-coach-chat.tsx`:
  - Full chat modal with `AnimatePresence` backdrop blur and spring slide-up animation
  - Header: gradient orb avatar with Sparkles icon, "AccentAI Coach" title, pulsing emerald online dot, close button
  - Message bubbles: user (right-aligned, indigo→violet gradient, rounded-2xl), assistant (left-aligned, card bg with subtle border, rounded-2xl with corner tail)
  - IPA renderer: regex detects `/phoneme/` and `[narrow]` patterns, wraps in `<code>` with cyan-tinted monospace styling; preserves prefix context so URLs aren't matched
  - Loading state: 3-dot typing indicator with staggered opacity/y bounce animation
  - Suggested prompt chips on first open (4 chips: "How do I pronounce 'three'?", "/ɪ/ vs /iː/", "American 'r' tips", "Word stress") with AnimatePresence exit
  - Auto-grow textarea with Enter-to-send (Shift+Enter for newline), send button with gradient + glow
  - Auto-scroll to bottom on new messages
  - Reads `accent`, `xp`, `streak`, `lessons` from Zustand store and passes as context to API
  - Escape key closes modal, input autofocus on open
  - Mobile-friendly: full-height (88vh on mobile, 80vh on sm+), rounded-t-3xl on mobile / rounded-3xl on desktop, safe-top + safe-bottom padding
  - Disclaimer footer: "AccentAI Coach can make mistakes…"
- Created `src/components/ai-coach/ai-coach-fab.tsx`:
  - Floating action button positioned `fixed bottom-20 right-4 z-40` (above bottom nav)
  - 56px round button with conic-gradient orb (indigo→violet→cyan), inner glass circle with Sparkles icon
  - Pulsing glow ring (radial gradient, scale 1→1.25→1, opacity pulse) for attention
  - Rotating sheen overlay (8s linear rotation, diagonal highlight sweep)
  - Reads `activeLessonId` from store — when set, the entire FAB is hidden via AnimatePresence (spring exit)
  - Onboarding tooltip "Ask me anything! 💬" appears after 1.4s delay on first visit (localStorage flag `accentai-coach-onboarding-seen`); hidden on mobile (sm:flex), disappears on first click
  - Hover scale 1.06, tap scale 0.94 micro-interactions
  - Renders `<AICoachChat open onClose />` alongside the FAB
- Integrated into `src/components/app-shell.tsx`:
  - Added `import { AICoachFAB } from "@/components/ai-coach/ai-coach-fab";`
  - Rendered `<AICoachFAB />` after the LessonModal AnimatePresence block, still inside the main container
- Verified end-to-end:
  - `bun run lint` → EXIT 0 (no errors, no warnings)
  - dev.log shows clean compiles, `GET / 200`, `GET /api/ai-coach 200`, `POST /api/ai-coach 200 in 2.5s`
  - Tested real LLM call: POST with `{"messages":[{"role":"user","content":"How do I pronounce three?"}],"context":{"accent":"usa","xp":120,"streak":3,"completedLessons":["p1-l1"]}}` returned a properly formatted coach response with IPA `/θriː/`, syllable breakdown, tactile practice tips ("place tip of tongue between teeth"), and emojis — exactly matching the system prompt spec
- Did NOT modify any other files; did NOT change the Zustand store; did NOT remove existing functionality

## Stage Summary
- 3 new files created (`route.ts`, `ai-coach-fab.tsx`, `ai-coach-chat.tsx`) and 1 file edited (`app-shell.tsx` for 2-line import + render)
- AI Coach is fully functional: FAB with animated gradient orb + pulsing glow appears bottom-right, hidden during lessons; clicking opens a spring slide-up chat modal with IPA-aware message rendering, suggested prompt chips, typing indicator, and auto-scroll
- Backend uses z-ai-web-dev-sdk's `chat.completions.create` with a detailed system prompt embedding user progress (accent/XP/streak/completed lessons) — tested live and returns pronunciation coaching with IPA notation, syllable breakdowns, and tactile mouth-position tips
- Lint passes cleanly (exit 0); dev server compiles successfully with no errors; all routes return HTTP 200
- Design respects existing palette (indigo/violet/cyan from --p/--p2/--p3/--c variables), uses Framer Motion for all animations, Lucide icons (Sparkles, Send, X), dark-theme-first, mobile-safe
