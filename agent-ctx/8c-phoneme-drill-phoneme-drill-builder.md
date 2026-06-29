# Task 8c-phoneme-drill — Agent: phoneme-drill-builder

## Goal
Build a Phoneme Drill Mode for AccentAI — focused, rapid-fire single-phoneme practice with minimal-pair drills, combo multiplier, and 10-round sessions. Embedded as a new tab in the Practice view.

## Pre-Work Inspection
- Read `/home/z/my-project/worklog.md` to understand project state (8 phases, 32 lessons, dark-default indigo/violet/cyan palette, Zustand store, Framer Motion).
- Read `src/lib/store.ts` — confirmed existing actions: `completeLesson` (awards XP via lessons), `setChallengeHighScore` (used by PronunciationChallenge). No existing `addXP` action for non-lesson XP awards.
- Read `src/lib/tts.ts` — confirmed `speak(text, opts)` API with `accent`, `rate`, `onEnd` options.
- Read `src/components/widgets/phoneme-mastery.tsx` — found private `PHONEME_LESSONS` map (12 phonemes → lesson IDs) + `levelColor` helper. Map covers: ð, θ, æ, ŋ, ɪ, ʊ, ɜː, ʒ, ɑː, iː, uː, r.
- Read `src/components/views/practice.tsx` — confirmed `PracticeMode` type, tab system uses `layoutId="diff-pill"` for animated transitions between Easy/Medium/Hard/Challenge.

## Design Decisions

### Phoneme List (12 target phonemes for the drill)
Per task spec: θ, ð, æ, eɪ, aɪ, iː, uː, ɑː, ɔː, ʌ, ə, ʃ. Note that 6 of these (eɪ, aɪ, ɔː, ʌ, ə, ʃ) aren't in the existing `PHONEME_LESSONS` map, so for those phonemes the mastery ring shows "untracked" until lessons are completed. The other 6 (θ, ð, æ, iː, uː, ɑː) reuse the existing map for mastery derivation.

### Word Data Structure
For each phoneme, 8 target words (containing the phoneme) × 2-3 minimal-pair distractors per word. Distractors are real English words that differ from the target word by exactly one phoneme — forcing ear discrimination. Examples:
- /θ/ "think" → [sink, tin, sing]
- /θ/ "bath" → [bass, bat, boss]
- /æ/ "cat" → [cot, cut, ket]
- /iː/ "sheep" → [ship, shop, shape]

### Combo Multiplier Ladder
- 0-2 streak = ×1
- 3-5 streak = ×2
- 6-9 streak = ×3
- 10+ streak = ×5

### XP Calculation
- 10 XP base (for completing)
- 5 XP per combo level reached (×1→L1=0, ×2→L2=5, ×3→L3=10, ×5→L4=15)
- 20 XP bonus for perfect 10/10
- Max possible: 10 + 15 + 20 = 45 XP

### Mastery Ring Color Thresholds (per task spec)
- Red: <60
- Amber: 60-80
- Green: >80
- Gray: untracked (no lesson data)

## Implementation

### File 1 — CREATED: `src/lib/phoneme-data.ts`
- Exported `PHONEME_LESSONS` (copied from phoneme-mastery.tsx so it can be imported by both the drill widget and any future consumer without breaking the existing widget's private copy).
- Exported `PHONEME_DRILL_DATA: PhonemeEntry[]` — the 12 phonemes with their 8 words × 2-3 distractors each.
- Exported `DRILL_ROUNDS_TOTAL = 10`.
- Exported helpers: `comboMultiplier(streak)`, `comboLevel(mult)`, `masteryTierFromScore(score)`, `deriveMastery(phoneme, lessons)`.
- Exported types: `PhonemeEntry`, `DrillWord`, `MasteryInfo`, `MasteryTier`, `LessonProgressLite`.

### File 2 — MODIFIED: `src/lib/store.ts`
- Added `addXP: (amount: number, source?: string) => void` to the `AppState` interface.
- Implemented the action: bumps `xp` by amount (no-op if ≤ 0), dispatches a `accentai:xp-awarded` CustomEvent on `window` with `{ amount, source }` detail so the existing toast-watcher (per worklog task 4 records) can react to non-lesson XP awards. Source defaults to `"drill"`.
- Used by the PhonemeDrill results screen to award XP after a 10-round session.

### File 3 — CREATED: `src/components/widgets/phoneme-drill.tsx`
- Self-contained `<PhonemeDrill onDone?>` component with three phases: `setup`, `drill`, `results`.
- **Setup phase** (`<PhonemeSelector>`):
  - Hero with gradient `Target` icon tile, "Phoneme Drill" title (gradient "Drill" word), subtitle.
  - "Surprise me" amber-gradient button — picks the user's weakest phoneme by reading `useAppStore.getState().lessons` and running `deriveMastery` against all 12 phonemes; if all untracked, picks random. Randomizes among ties for the weakest score.
  - Grid: `grid-cols-3 sm:grid-cols-4 lg:grid-cols-6` — each card is an `aspect-square` rounded tile with the IPA symbol large, example word small, and a 36px SVG `MasteryRing` in the top-right corner.
  - `MasteryRing` uses SVG `<circle>` with `stroke-dasharray` + animated `stroke-dashoffset` via Framer Motion. Color and animation driven by `masteryTierFromScore`. If score is null, ring shows just the gray track + a small dot to indicate "untracked".
  - Weakest phoneme (if tracked) gets a pulsing "Weakest" badge in the top-left.
  - Each card shows the numeric mastery score (e.g., "58%") or "untracked" label below the example word.
  - Helper text below the grid explains the drill flow.
- **Drill phase** (`<DrillHeader>` + `<RoundCard>`):
  - `<DrillHeader>`: target phoneme in a gradient tile (left), "change phoneme" link below, score chip in the middle (correct/total), combo multiplier pill on the right (animated via `AnimatePresence mode="popLayout"` so each multiplier change springs in), exit X button.
  - The combo pill has 3 visual states: ×1 (subtle card style), ×2/×3 (violet gradient with glow), ×5 (max — strongest glow). The streak counter (🔥N) sits inline.
  - `<RoundCard>`: glass-morphism card with gradient border (when no feedback), full-card green/red flash when answered (using `linear-gradient(...)` on background-image + `border` color swap + `boxShadow` glow).
    - Round meta line at top: "Round N / 10" + "/θ/ drill" label.
    - Progress bar with `linear-gradient(90deg, var(--p), var(--p2), var(--c))` fill, animated width via Framer Motion.
    - Large gradient "Listen" button — uses `speak()` from `@/lib/tts` with `accent` + `rate: 0.95`. Button shows "Playing…" + pulse animation while TTS is active (tracks `isPlaying` state via `onStart`/`onEnd` callbacks).
    - Options: `grid-cols-1 sm:grid-cols-2` of word buttons. After answering: correct option turns green with `Check` icon, wrong-selected option turns red with `X` icon, others dim to tertiary color.
    - Correct feedback: green strip "Correct! Next word…" + "auto-advance" hint. Schedules `setTimeout(800ms)` to advance to the next round (or finish on round 10).
    - Incorrect feedback: red strip "Not quite — the word was 'X'" + "Tap to continue →" button (no auto-advance — user controls pace so they can read).
    - "Hear it again" re-listen link appears after answering (small, below feedback strip).
  - `min-h-[52px]` on each option button for ≥44px touch target compliance.
- **Results phase** (`<ResultsScreen>`):
  - Glass card with indigo→cyan gradient border + glow.
  - Trophy icon tile (gold gradient if perfect, indigo gradient otherwise).
  - Headline varies by accuracy: "Flawless run! 🎉" / "Solid drill! 💪" / "Keep at it 🔁" / "Tough one — try again!".
  - Big `{correct}/{total}` display with color-coded correct number (green if perfect, violet if ≥70%, amber otherwise).
  - 2-col stats grid: Max combo (Zap icon + ×N + 🔥N streak) and XP earned (Sparkles + animated `+N` with gradient text fill via `WebkitBackgroundClip`).
  - XP breakdown line: "10 base + X combo bonus [+ 20 perfect bonus]".
  - 10 confetti particles fall across the card on perfect runs (staggered delays, varied colors, drift + rotate animations).
  - 3 action buttons: "Drill again" (gradient primary, calls `startDrill(target)` with same phoneme), "Try different" (secondary, returns to setup), "Done" (secondary, returns to setup + calls `onDone()` if provided).
- **Logic**:
  - `makeRound(phoneme)`: picks random word from the phoneme's 8 words, takes 2-3 distractors, shuffles `[word, ...distractors]` into the options array.
  - `handleSelect(opt)`: if correct, increments correct + streak + maxComboStreak, sets green feedback, schedules 800ms auto-advance to next round (or `finishDrill` on round 10). If incorrect, sets red feedback, resets streak to 0 (maxComboStreak preserved).
  - `handleContinue()`: manual continue after incorrect — advances to next round (or `finishDrill` on round 10).
  - `finishDrill(correct, maxStreak)`: computes XP via `calcXP`, calls `addXP(xp, "phoneme-drill")`, transitions to results.
  - `handleSurprise()`: reads `useAppStore.getState().lessons` directly (no reactive subscription needed since it's a one-shot click), sorts tracked phonemes by score ascending, picks among ties for the weakest.
  - `autoAdvanceTimer` ref + cleanup `useEffect` so the timeout is cleared on unmount or phase change.
  - `finishDrill` declared as `useCallback` BEFORE `handleSelect`/`handleContinue` to satisfy the `react-hooks/immutability` lint rule (no use-before-define).
- All transitions via Framer Motion `AnimatePresence mode="wait"` for smooth setup→drill→results crossfades.
- All interactive elements have `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`.
- Mobile-first: 3-col grid on mobile, 44px+ touch targets, full-width buttons stack cleanly.
- Accessibility: `<motion.section aria-label>` not needed (embedded in view), all buttons have `aria-label`s where icon-only (e.g., "Exit drill", "Play the word and listen"), phoneme selector cards have descriptive aria-labels including mastery state.

### File 4 — MODIFIED: `src/components/views/practice.tsx`
- Added `Target` to Lucide imports.
- Added `import { PhonemeDrill } from "@/components/widgets/phoneme-drill"`.
- Extended `PracticeMode` type: `"easy" | "medium" | "hard" | "challenge" | "phoneme-drill"`.
- Added a 5th tab "Drill" between "Hard" and "Challenge" with `isDrill: true` flag, cyan Target icon.
- Tab styling: drill pill gets `linear-gradient(135deg, #22d3ee, #6366f1)` (cyan→indigo) background + cyan glow when active; tab text is `var(--c)` (cyan) when inactive. This visually distinguishes the drill mode from the standard Easy/Medium/Hard indigo gradient and the Challenge amber gradient.
- Updated subtitle to show "Targeted practice for stubborn sounds" when in phoneme-drill mode.
- Added a third `AnimatePresence` branch: when `mode === "phoneme-drill"`, renders `<PhonemeDrill />` inside a `motion.div` with the same enter/exit transitions as the other modes.

## Verification

### Lint
- `bun run lint` → EXIT 0 (zero errors, zero warnings).
- First lint pass surfaced 2 issues:
  1. Two unused `// eslint-disable-next-line react-hooks/exhaustive-deps` directives in `handleSelect` / `handleContinue` — removed (the deps arrays were already correct).
  2. `react-hooks/immutability` error: `finishDrill` was a regular function declared after the `useCallback`s that called it. Fixed by converting `finishDrill` to a `useCallback` and declaring it BEFORE `handleSelect` / `handleContinue`, then adding it to those callbacks' deps arrays.
- Final lint pass: clean.

### Dev Server
- `dev.log` shows continuous `✓ Compiled in XXXms` lines and `GET / 200` responses with no errors or warnings.
- Latest entries: `✓ Compiled in 162ms`, `GET / 200 in 319ms`.

### agent-browser Smoke Test
1. `agent-browser open http://localhost:3000` → HTTP 200, page title "AccentAI — Master Native-Level English".
2. Completed onboarding (Try Demo → USA English → Begin Journey).
3. Clicked "🎙️ Practice" nav → practice view rendered with 5 tabs: Easy / Medium / Hard / **Drill** / Challenge (Drill tab visible between Hard and Challenge, cyan-colored when inactive).
4. Clicked "Drill" tab → setup phase rendered:
   - "Phoneme Drill" heading + "Targeted practice for stubborn sounds" subtitle
   - "Surprise me — pick a random phoneme" button
   - All 12 phonemes shown as cards: θ, ð, æ, eɪ, aɪ, iː, uː, ɑː, ɔː, ʌ, ə, ʃ
   - Each card showed the IPA symbol, example word, and "UNTRACKED" label (correct — fresh demo account has no lesson history)
   - Helper text at the bottom explaining the drill flow
5. Clicked /θ/ card → drill phase rendered:
   - Header: θ phoneme tile, "change phoneme" link, Score 0/1, ×1 combo with 🔥0, Exit button
   - Round card: "ROUND 1 / 10", "/θ/ DRILL", Listen button, 4 options (bat / bath / boss / bass — bath is correct, others are minimal-pair distractors)
6. Clicked correct answer "bath" → green flash, score updated to 1/2, streak to 🔥1, auto-advanced to Round 2 after ~800ms with new word "thumb" + distractors [some, dumb, sum]
7. Clicked wrong answer "some" → red flash, streak reset to 🔥0, options disabled, "Not quite — the word was 'thumb'" message + "Tap to continue →" button + "Hear it again" link (no auto-advance as specified)

All flows verified working end-to-end.

## Stage Summary
- Built a complete, self-contained Phoneme Drill Mode with 3 phases (setup → drill → results), 12 phonemes × 8 words × 2-3 minimal-pair distractors each, animated combo multiplier (×1/×2/×3/×5), full-card correct/incorrect feedback flashes, 10-round sessions, XP awards via the new `addXP` store action (10 base + 5×combo level + 20 perfect bonus), and a celebration confetti animation on perfect runs.
- Embedded as a new "Drill" tab in the Practice view (between Hard and Challenge) with a distinct cyan→indigo gradient to visually separate it from the standard difficulty tabs.
- Files created: `src/lib/phoneme-data.ts`, `src/components/widgets/phoneme-drill.tsx`
- Files modified: `src/lib/store.ts` (added `addXP` action), `src/components/views/practice.tsx` (added Drill tab + render branch)
- Lint: PASS (exit 0). Dev server: HTTP 200. All drill flows verified working via agent-browser.
