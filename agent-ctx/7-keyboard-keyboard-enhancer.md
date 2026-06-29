# Task ID: 7-keyboard — Agent: keyboard-enhancer

## Task
Enhance the AccentAI keyboard shortcuts system:
1. Add Space key to play the current lesson step's primary audio.
2. Show a transient "⌨ Press Space to play" visual hint above the footer when a step with audio loads.
3. Reorganize the keyboard shortcuts overlay into 4 groups (Navigation / In Lesson / AI Coach / Help) with a new "In Lesson" section documenting Space, Arrow keys, and Esc.

## Files Modified
- `src/components/lesson/lesson-modal.tsx` — Space handler + visual hint
- `src/components/widgets/keyboard-shortcuts.tsx` — reorganized overlay

## Work Log
- Read worklog.md and previous agent-ctx records (4a/4b/4c/6/7-ai-coach) for full project context.
- Inspected `src/lib/types.ts` to map every step type's primary audio field, and `src/lib/tts.ts` to confirm the `speak()` signature. Inspected `src/components/ai-coach/ai-coach-fab.tsx` + `ai-coach-chat.tsx` to confirm the chat modal renders with `aria-label="AccentAI Coach chat"` only while open (via AnimatePresence), giving a reliable DOM signal for "is the coach open?".
- `src/components/lesson/lesson-modal.tsx`:
  - Added a top-level helper `getPrimaryAudioText(step: LessonStep | undefined): string | null` that returns the primary spoken text per step type:
    - `intro` → `step.title`
    - `example` → `step.phrase`
    - `mouth-diagram` → `step.exampleWord` (nullable)
    - `compare` → `step.nativePhrase`
    - `stress-bars` → `step.word`
    - `rhythm` → `step.phrase`
    - `linking` → `step.words.join(" ")`
    - `shadow` / `intonation` / `practice` → `step.phrase`
    - `concept`, `vowel-chart`, `tap-pronounce`, `tip`, `quiz`, `completion` → `null` (no auto-play)
  - Added `showSpaceHint` state, reset inside the existing "adjust state during render" block (`if (stepIdx !== prevStepIdx)`) so it stays in sync with step changes WITHOUT triggering `react-hooks/set-state-in-effect` (same pattern the file already uses for quiz/practice state).
  - Added a thin `useEffect` that only manages the 3-second auto-hide timer (setState inside `setTimeout` callback — allowed by the lint rule).
  - Extended the existing keydown handler to also handle Space (`e.key === " " || e.code === "Space"`). Guards, in order:
    1. Skip when typing in INPUT / TEXTAREA / contentEditable.
    2. Skip when the AI Coach chat modal is open (detected via `document.querySelector('[aria-label="AccentAI Coach chat"]')`).
    3. Skip when the ShortcutsOverlay is visible (`#shortcuts-overlay` lacks the `hidden` class).
    4. Skip when a BUTTON / A / `[role="button"]` is focused so native Space-to-click keeps working for keyboard users.
    5. Otherwise call `getPrimaryAudioText(step)`; if non-null, `e.preventDefault()` (prevents page scroll) and `handleSpeak(text)`.
  - Added a Framer Motion `<AnimatePresence>` block above the footer nav: a pill-shaped toast with `⌨` glyph + `<kbd>Space</kbd>` + "Press Space to play" text. Spring entrance (opacity + y + scale), `pointer-events-none` so it never blocks taps. Positioned `absolute bottom-24 left-1/2 -translate-x-1/2 z-10` so it floats just above the footer.
- `src/components/widgets/keyboard-shortcuts.tsx`:
  - Imported `Keyboard` and `X` from `lucide-react`.
  - Rewrote `SHORTCUT_GROUPS` as a typed `ShortcutGroup[]` with 4 groups, each carrying an `icon` emoji + `accent` color var:
    - **Navigation** (🧭, `var(--p)`) — `1 – 5` → Home · Journey · Practice · Progress · More
    - **In Lesson** (🎓, `var(--p2)`) — `Space` (Play current step's audio), `←` `→` (Previous / Next step), `Esc` (Close lesson)
    - **AI Coach** (✨, `var(--p3)`) — `⌘` `K` (Open AccentAI Coach chat)
    - **Help** (❓, `var(--c)`) — `?` (Toggle this shortcuts overlay)
  - Redesigned the overlay panel:
    - Header now has a gradient `Keyboard` icon tile next to the title.
    - Each group is a rounded card with subtle border + the group icon + accent-colored title.
    - Each shortcut row renders a flex row of `<kbd>` chips (so `⌘ K` and `← →` show as separate keys) using the existing `kbd` visual style.
    - Footer hint unchanged (Press `?` anytime).
    - Bumped z-index from `z-[70]` to `z-[300]` so the overlay is visible ABOVE the lesson modal (z-[200]) — lets users open the overlay with `?` while inside a lesson to see the In-Lesson shortcuts.
    - Added an Escape keydown listener inside `ShortcutsOverlay` that hides the overlay (works whether or not a lesson is open underneath).
    - Added `max-h-[90vh] overflow-y-auto` to the panel for safety on short screens.

## Verification
- `bun run lint` → EXIT 0 (no errors, no warnings). The one pre-existing `coach-insights.tsx` warning about an unused eslint-disable directive is unrelated to this task.
- `bunx tsc --noEmit` → no errors in the two modified files. (Pre-existing TS errors in `examples/`, `skills/`, `onboarding.tsx`, `mic-waveform.tsx` are unrelated.)
- `dev.log` shows clean compiles (`✓ Compiled in ...`) and `GET / 200` responses; no compile errors after the changes.

## Behaviour Summary
- Pressing Space inside an open lesson plays the current step's primary audio (title / phrase / word / nativePhrase depending on step type). Steps with no audio (concept, vowel-chart, tap-pronounce, tip, quiz, completion) do nothing.
- Space is suppressed when typing in any input/textarea, when the AI Coach chat is open, when the ShortcutsOverlay is open, or when a button/link is focused (so native Space-activation of focused controls still works).
- A subtle `⌨ Space · Press Space to play` pill appears just above the footer nav for 3 seconds every time a step WITH audio loads, then fades out. It does not reappear until the step changes.
- The `?` overlay now opens above the lesson (z-[300]) and is closeable with Escape; it documents all 4 shortcut groups including the new In-Lesson cluster.
- Existing shortcuts (Cmd+K, 1–5, ?, Esc, Arrow Left/Right) are unchanged.

## Design Notes
- Dark-theme-first; uses the project's indigo/violet/cyan palette via `var(--p)`, `var(--p2)`, `var(--p3)`, `var(--c)`, `var(--grad-btn)`.
- Framer Motion for all animations (spring entrance for the hint pill, no layout animation on the overlay to keep it lightweight).
- Mobile-first: the hint pill is centered and `pointer-events-none` so it never blocks the footer buttons; the overlay panel scrolls if needed on short screens.
