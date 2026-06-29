# Task ID: 6-features — Agent: feature-adder-2

## Task
Add 2 features to AccentAI:
1. Streak Calendar Heatmap (Progress view)
2. Tip of the Day (Dashboard view)

## Work Log
- Read worklog.md, store.ts, progress.tsx, dashboard.tsx for full context
- Updated `src/lib/store.ts`:
  - Added `practiceCalendar: Record<string, number>` to AppState interface
  - Initialized `practiceCalendar: {}` in store
  - Updated `completeLesson` to increment `practiceCalendar[today]` on first-time completions only
  - Added `practiceCalendar` to `resetAll`
  - Added `practiceCalendar` to `partialize` for persistence
- Created `src/lib/tips.ts`:
  - Defined `TipCategory` and `Tip` types
  - Exported `CATEGORY_COLORS` mapping (vowel=indigo, consonant=violet, rhythm=pink, intonation=amber, linking=cyan, general=emerald)
  - Wrote 35 genuine, actionable pronunciation tips across all 6 categories
  - Added `getTipOfDay()` helper using day-of-year for deterministic selection
- Updated `src/components/views/progress.tsx`:
  - Added `PracticeCalendarHeatmap` component (defined before `ProgressView`)
  - 12-week × 7-day grid (84 cells) using Sunday-aligned columns
  - Color intensity: 0=dim, 1-2=light, 3-4=medium, 5+=bright (violet)
  - Current day has pulsing border + glow shadow
  - Month labels along top (Jan, Feb, ...) with overflow-visible for narrow boxes
  - Day labels along left (M, W, F only)
  - Tooltip via `title` attribute on each cell
  - Legend at bottom: "Less [dim][light][medium][bright] More"
  - Staggered fade-in animation via Framer Motion (delay based on cell index)
  - Empty state: "Start practicing to fill your calendar! 🔥" when no practice data
  - Wrapped in `overflow-x-auto` for horizontal scroll on narrow screens
  - Inserted `<PracticeCalendarHeatmap />` between rank ladder and stats summary
- Updated `src/components/views/dashboard.tsx`:
  - Imported `TIPS` and `CATEGORY_COLORS` from `@/lib/tips`
  - Added `dayOfYearTipIndex()` helper (deterministic, same tip all day)
  - Added `TipOfTheDay` component:
    - Card with gradient background matching category color
    - Shimmer sweep animation on mount (diagonal slide-in)
    - Top row: "💡 Tip of the Day" label (left) + category badge (right)
    - Large emoji (left) with spring drop-shadow glow + rotate animation
    - Title + body (right) with slide-left/fade transition via AnimatePresence
    - "Next tip →" button cycles to next tip with smooth animation
  - Inserted `<TipOfTheDay />` between AI Recommendations and Your Sound Profile
- Ran `bun run lint`: ZERO errors in modified files (all 11 errors are pre-existing in widget files I didn't touch: compare-wave.tsx, mouth-diagram.tsx, rhythm-beats.tsx, linking-diagram.tsx)
- Verified dev log: all "✓ Compiled in Xms", no errors

## Stage Summary
- 2 fully functional features added:
  1. **Streak Calendar Heatmap** (Progress): GitHub-style 12-week contribution grid with 4 intensity levels, today pulse, month/day labels, hover tooltips, legend, empty state, horizontal scroll on mobile, staggered fade-in
  2. **Tip of the Day** (Dashboard): 35-tip rotating card with deterministic daily pick, category-colored gradient bg, shimmer animation, slide-left transitions, "Next tip" cycling button
- Store updated with `practiceCalendar` state, completeLesson integration, persistence, reset support
- `src/lib/tips.ts` created with 35 real pronunciation tips + category color map + day-of-year selector
- Lint clean for all modified files; dev server compiles successfully
