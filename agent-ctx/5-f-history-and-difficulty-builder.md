# Task 5-f — Practice History Sparkline + Lesson Difficulty Badges

**Agent:** history-and-difficulty-builder
**Task ID:** 5-f
**Scope:** Add two features to AccentAI:
1. Practice History with Sparkline Charts (Progress view)
2. Lesson Difficulty Badges (Journey view + Lesson intro step)

## Files Touched

### New files
- `src/components/widgets/practice-history.tsx` — `PracticeHistory` sparkline widget
- `src/components/widgets/difficulty-badge.tsx` — reusable `DifficultyBadge` widget

### Modified files
- `src/lib/types.ts` — added `LessonDifficulty` type, optional `difficulty` field on `Lesson`, and `getLessonDifficulty(lesson)` helper
- `src/components/views/progress.tsx` — imported + rendered `<PracticeHistory />` between Phoneme Mastery and Recent Activity
- `src/components/views/journey.tsx` — added `DifficultyBadge` to both flat search list and phase-grouped lesson list (near duration/XP info)
- `src/components/lesson/lesson-modal.tsx` — added `lesson` prop to `StepRendererProps` + `IntroStepView`; renders `DifficultyBadge` next to "Lesson Introduction" eyebrow on intro step

## Key Design Decisions

### Practice History sparkline
- Reads `history` (newest-first, capped at 50 in store), reverses, takes last 20.
- SVG `viewBox="0 0 320 130"` with `w-full h-auto` so it scales responsively.
- **Smooth curve**: `buildSmoothPath()` uses quadratic bezier segments between consecutive midpoints — each data point becomes a control handle. No straight lines.
- **Animated draw**: Framer Motion `motion.path` with `pathLength: 0 → 1` over 1.2s easeInOut.
- **Gradient fill**: indigo 38% → 12% → 0% vertical gradient under the line; violet→indigo horizontal gradient on the stroke.
- **Hover dots**: invisible r=11 hit circles + visible r=3 white-filled circles (r=5 on hover) with color-coded stroke + soft glow halo. HTML tooltip overlay (absolutely positioned, percentage-based mapping from SVG coords) shows "Session N · date", score (color-coded), truncated lesson title. `onTouchStart` for mobile.
- **Stats**: Min (red) / Max (green) / Avg (violet) + Trend box. Trend compares avg of first quarter to last quarter (needs ≥4 sessions); ±5 pt threshold → ↑ Improving (green) / ↓ Declining (red) / → Stable (violet).
- **X-axis**: 3 labels (first/middle/last) as short dates; switches to session indices when n > 12.
- **Empty state**: "📈 Score Trend — No practice history yet — complete a lesson to see your trend!".

### Difficulty derivation
`getLessonDifficulty(lesson)` in types.ts (phaseId is 0-indexed — 0 = Phase 1, 7 = Phase 8):
- Phase 1–2 (phaseId 0–1) → easy (Phase 2 lessons 2–3 bumped to medium)
- Phase 3–4 (phaseId 2–3) → medium (Phase 4 lessons 2–3 bumped to hard)
- Phase 5–6 (phaseId 4–5) → medium for lessons 0–1, hard for lessons 2–3
- Phase 7–8 (phaseId 6–7) → hard

Within a phase, lessons 2–3 are treated as the harder half. Honors an explicit `lesson.difficulty` override if set.

### DifficultyBadge
- Three sizes: `xs` (8px text), `sm` (9px, default), `md` (11px).
- Colors: Easy = green #10b981, Medium = amber #f59e0b, Hard = red #ef4444.
- Spring-in animation optional (`animate` prop, default true) — disabled in Journey lists since the parent already animates.
- Renders as `<motion.span>` pill with bg/border/dot styling and `aria-label="Difficulty: X"`.

## Verification
- `bun run lint` → exit 0, 0 errors (only one pre-existing unused eslint-disable warning in compare-wave.tsx, untouched).
- Dev server compiles cleanly across all changes.
- All 32 lesson files continue to type-check (optional `difficulty` field, derived via helper).

## What other agents can reuse
- `DifficultyBadge` — importable from `@/components/widgets/difficulty-badge`. Accepts `lesson` (or any `{ phaseId, lessonIndex, difficulty? }`), `size`, `animate` props.
- `getLessonDifficulty(lesson)` — importable from `@/lib/types`. Returns `"easy" | "medium" | "hard"`. Accepts `Pick<Lesson, "phaseId" | "lessonIndex" | "difficulty">` so you can pass a partial.
- `PracticeHistory` — importable from `@/components/widgets/practice-history`. Self-contained (reads from Zustand store), no props.
- `StepRenderer` and `IntroStepView` in lesson-modal.tsx now expect a `lesson` prop — future step-rendering work should preserve this.
