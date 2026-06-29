# Task 5 — Lesson Modal Bug Fixes + Minimal Visual Style

**Agent:** Lesson Modal Fix + Minimal Agent
**Task:** Fix scroll/TTS/continue bugs + simplify lesson modal to minimal style
**File modified:** `src/components/lesson/lesson-modal.tsx` (1533 lines after edits)
**Companion file:** `src/lib/tts.ts` (already had `unlockTTS`, `isSpeaking`, `onSpeakingChange` — no changes needed)

---

## Bugs Fixed

### Bug 1 — "if i click on continue it starting in a end of the screen"
**Root cause:** The step content scroll container (`<div className="flex-1 overflow-y-auto relative">`) had no ref, so when the user scrolled down on step N and clicked Continue, step N+1 opened already scrolled to the bottom.

**Fix:**
- Added `const scrollContainerRef = useRef<HTMLDivElement>(null);`
- Attached `ref={scrollContainerRef}` to the scroll container div
- Added a `useEffect` with `[stepIdx]` dependency that resets `scrollContainerRef.current.scrollTop = 0` whenever the step changes

**Location:** lines 162–165 (ref declaration), 185–192 (effect), 518 (ref attachment)

### Bug 2 — "i cant click on continue button to start my lesson"
**Root cause:** The footer nav div had no explicit z-index, so it sat at the default stacking level. The `StepTransitionOverlay` (z-[5], `pointer-events-none`) was OK, but the "Press Space" hint at `z-10` and the step content could visually overlap the footer in some layouts. More importantly, the footer lacked a `relative` positioning context, so its z-index wasn't being applied in the flex column.

**Fix:**
- Added `relative z-20` to the footer nav div — ensures it's stacked above the step content (z-10) and the transition overlay (z-5)
- Changed footer background from `bg-[var(--bg2)]/95 backdrop-blur` to solid `bg-[var(--bg)]` — removes the translucent blur that could let content show through
- Changed the "Press Space" hint z-index from `z-10` to `z-30` and kept `pointer-events-none` — it floats above the footer visually but never blocks clicks
- The hint is positioned at `bottom-24` (96px from bottom), which sits above the footer (~56px tall) — no overlap

**Location:** lines 580 (hint z-30), 592–593 (footer z-20 + solid bg)

### Bug 3 — "i cant hear any sound"
**Root cause:** Mobile Safari / Chrome Android block `speechSynthesis.speak()` until a user gesture occurs. The modal only called `loadVoices()` on mount but never "unlocked" the audio session. Additionally, there was no visual feedback when TTS was active, so users couldn't tell if audio was playing.

**Fix:**
- Imported `unlockTTS`, `isSpeaking`, `onSpeakingChange` from `@/lib/tts` (these were already exported — the TTS agent or a prior pass added them)
- Added `const rootRef = useRef<HTMLDivElement>(null);` and attached it to the modal root `motion.div`
- Added a `useEffect` (mount-only) that attaches a one-time `pointerdown` listener to the modal root. On the first interaction, it calls `unlockTTS()` (which speaks a silent empty utterance to satisfy the browser's user-gesture requirement) and then removes itself
- Added `const [speaking, setSpeaking] = useState(false);` and a `useEffect` that subscribes to `onSpeakingChange` — keeps the UI in sync with actual TTS playback state
- Added a visual "speaking" indicator in the header: a small pill with a pulsing indigo dot (Framer Motion `scale: [1, 1.5, 1]` + `opacity: [1, 0.4, 1]` on a 0.9s loop) + a `Volume2` icon. Only renders when `speaking === true`.

**Location:** lines 8 (imports), 154–155 (speaking state), 163–165 (rootRef), 194–215 (unlock + subscribe effects), 388 (rootRef on motion.div), 437–450 (speaking indicator in header)

---

## Visual Simplification (Minimal White/Black)

### 1. Step transition distance reduced
- `stepVariants.enter.x`: `direction * 80` → `direction * 30`
- `stepVariants.exit.x`: `direction * -80` → `direction * -30`
- `scale`: `0.97` → `0.99` (subtler)
- Opacity transitions kept

### 2. Category tint/glow system removed entirely
- Removed `StepCategory` type, `getStepCategory()` function, `CATEGORY_TINT` object, `CATEGORY_GLOW` object
- Removed `currentCategory`, `currentTint`, `currentGlow` variable assignments
- Removed the animated radial-gradient background tint `motion.div` (was `absolute inset-0` with `radial-gradient(ellipse at 50% 0%, ${currentTint} 0%, transparent 70%)`)
- Modal background is now solid `var(--bg)` throughout

### 3. Progress bar simplified
**Before:** 44px-tall bar with gradient connecting track, animated gradient fill (`linear-gradient(90deg, var(--p), var(--p2))` + `boxShadow: 0 0 8px rgba(99,102,241,0.4)`), infinite shimmer sweep, and step dots with gradient backgrounds, glow boxShadow, pulsing glow rings, spring scale animations, whileHover/whileTap.

**After:** 32px-tall bar with:
- Thin 2px gray track (`bg-[var(--border)]`)
- Solid 2px indigo fill (`bg-[var(--p)]`) with `transition-all duration-300` — no glow, no gradient
- Plain `<button>` dots (not `motion.button`): current = solid `var(--p)` (26px), past = solid `var(--t2)` gray (20px), upcoming = outline `1px solid var(--border2)` (20px)
- Removed: shimmer sweep div, pulsing glow ring on current dot, gradient fills, boxShadow glows, spring scale animations
- Kept: hover tooltip, click-to-navigate, hover:scale-110 / active:scale-95 via CSS transitions

### 4. Header cleaned
- `bg-[var(--bg2)]/80 backdrop-blur` → solid `bg-[var(--bg)]`
- Timer pill: removed `bg-[var(--card)]/60` (now just border)
- Added speaking indicator (pulsing dot + Volume2 icon) between notes button and timer

### 5. Step-type chip simplified
- Removed `px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border2)]` — now plain text with `text-[var(--t3)]` uppercase mono
- Still shows emoji icon + step type + "Step X of Y"

### 6. Footer simplified
- `bg-[var(--bg2)]/95 backdrop-blur` → solid `bg-[var(--bg)]`
- Added `relative z-20` (Bug 2 fix)
- Continue/Finish/Next Lesson buttons: `bg-[var(--grad-btn)]` (gradient) → `bg-[var(--p)]` (solid indigo)
- Back button: kept as ghost (transparent, `hover:bg-[var(--card-h)]`)

### 7. "Press Space" hint simplified
- Removed spring animation → simple 0.2s opacity+y fade
- Removed `backdrop-blur-md`, heavy `shadow-[0_6px_24px_rgba(0,0,0,0.45)]`, ⌨ emoji
- Now: simple `bg-[var(--bg2)] border border-[var(--border)]` pill with a `<kbd>Space</kbd>` + text
- z-index `z-10` → `z-30` (above footer, still `pointer-events-none`)

### 8. Notes panel header simplified
- `bg-[var(--bg2)]/80 backdrop-blur` → solid `bg-[var(--bg)]`
- Icon badge: `background: var(--grad-btn)` → `var(--p)` (solid)

### What was KEPT (functionality intact)
- All 16 step type renderers (IntroStepView, ConceptStepView, ExampleStepView, etc.) — left exactly as-is
- Step navigation (dots are clickable)
- Notes panel (slide-in, full functionality)
- TTS speed controls
- Timer
- Progress ring
- Keyboard shortcuts (Space, arrows, ESC)
- Quiz, practice, completion logic
- Confetti
- StepTransitionOverlay (pointer-events-none fade)

---

## Verification
- `bun run lint` → PASS (0 errors, 0 warnings)
- Dev server: clean compiles (`✓ Compiled in 144ms`), `GET / 200`
- No remaining references to removed symbols (`getStepCategory`, `CATEGORY_TINT`, `CATEGORY_GLOW`, `currentCategory`, `currentTint`, `currentGlow`, `StepCategory`)
- `grad-btn` only remains in step renderer internals (per task scope: "leave step renderers mostly intact")
