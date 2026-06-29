# Task 8 — Dashboard Minimal Redesign Agent

## Task
Redesign `src/components/views/dashboard.tsx` to a minimal white/black aesthetic. Remove all floating gradient orbs, gradient text, glow/pulse animations, hardcoded indigo/cyan/violet rgba colors, and heavy box-shadows. Replace with clean cards (white bg + thin border + rounded-xl), solid near-black primary buttons, grayscale sparklines/bars, and var(--t1/t2/t3) typography.

## Work Log
1. Read `worklog.md` and the full `dashboard.tsx` (871 lines) to understand current structure.
2. Inspected `globals.css` — confirmed a previous palette agent had already converted `:root` (light) and `.dark` tokens to a minimal white/black scheme (`--p: #18181b` light / `#fafafa` dark, `--bg`/`--card` pure white or near-black, etc.). No globals.css edits needed.
3. Inspected `theme-provider.tsx` — app defaults to **light** theme, so `bg-[var(--p)] text-white` works in default mode. Used `text-[var(--primary-foreground)]` on primary buttons so they remain readable if the user toggles to dark mode (where `--p` flips to white).
4. Updated `src/components/widgets/progress-ring.tsx`:
   - Track stroke `rgba(255,255,255,0.08)` → `var(--border)`
   - Non-gradient progress stroke `#6366f1` → `var(--p)`
   - Gradient stops `#6366f1`/`#22d3ee` → `var(--p)`/`var(--p3)` (still used only when `gradient=true`)
5. Rewrote `src/components/views/dashboard.tsx` (871 → 524 lines):
   - **Removed**: 3 floating `radial-gradient` orbs (indigo/cyan/violet), greeting floating particles, `animate-gradient-text` greeting, `grad-text` classes, waving 👋 emoji animation, "AI Coach Active" pulsing green dot, `shimmer-sweep` on phase card, `animate-pulse-glow` ring wrapper, gradient phase-card background (`linear-gradient(135deg, rgba(99,102,241,...)`), shimmer overlay, green glow on completed daily goal, colored left-borders on stat cards, colored stat value text, colored stat sparklines, gradient chart bars (`linear-gradient(180deg, #6366f1, #8b5cf6, #22d3ee)`), animated boxShadow glow on today's bar, amber average-line color, colored AI-recommendation left border + icon bg tint, TipOfTheDay gradient background + shimmer sweep + emoji drop-shadow, colored phoneme tile backgrounds + box-shadow hover glow.
   - **Removed unused import** `WaveformCanvas` and `CATEGORY_COLORS` (TipOfTheDay no longer uses category color).
   - **Greeting**: clean date label (`var(--t3)` mono), solid `var(--t1)` heading, `var(--t2)` subtitle. No gradient, no particles, no waving emoji.
   - **Daily Goal**: clean `bg-[var(--card)] border rounded-xl` card, ProgressRing with `gradient={false}`, removed green glow when complete. Goal picker modal: `bg-[var(--p)] text-[var(--primary-foreground)]` for active number + Done button (was `bg-[var(--grad-btn)]`).
   - **Stats row**: removed colored left borders, background tints, colored value text, colored sparklines. Now: clean white cards, `var(--t1)` value, grayscale sparkline (`var(--t1)` for active days at full opacity, 0.4 for past days, `var(--border)` for zero days).
   - **Phase card**: removed gradient bg, shimmer sweep, radial orb, pulse-glow ring. Clean `bg-[var(--card)] border rounded-xl`. Progress bar track `var(--border)`, fill `var(--p)`. ProgressRing `gradient={false}`. Button: `bg-[var(--p)] text-[var(--primary-foreground)]` (was `bg-[var(--grad-btn)]`), removed arrow bounce animation.
   - **Weekly chart**: bars now solid `var(--p)` for today, `var(--t3)` for past active days, `var(--border)` for zero days. Removed animated boxShadow glow. Average line: dashed `var(--border2)` with `var(--t3)` label. Grid lines: `var(--border)`.
   - **AI Recommendations**: removed indigo left border and indigo icon bg tint. Clean icon container `bg-[var(--card-h)]`.
   - **TipOfTheDay**: removed gradient bg, shimmer sweep, emoji drop-shadow, colored Next button. Clean card with `var(--t3)` category badge (border-only), 3xl emoji (no glow), `var(--t1)` title, `var(--t2)` body, ghost Next button.
   - **Sound Profile**: removed colored tile backgrounds and hover glow. Clean tiles with `border border-[var(--border)] hover:border-[var(--border2)]`. Kept semantic status dot colors via `var(--rd)`/`var(--yl)`/`var(--gr)`/`var(--border2)` (CSS vars, no hardcoded rgba).
   - **Quick Actions**: removed indigo hover boxShadow. Clean ghost buttons with `hover:border-[var(--border2)] hover:bg-[var(--card-h)]`.
6. Ran `bun run lint` — passed with no errors. Dev log shows `GET / 200` responses and successful compiles after the edits.

## Stage Summary
- `dashboard.tsx` reduced from 871 → 524 lines, fully minimal.
- All `radial-gradient` orbs, `grad-text`, `animate-gradient-text`, `animate-pulse-glow`, `shimmer-sweep`, hardcoded `rgba(99,102,241,...)` / `rgba(34,211,238,...)` / `rgba(139,92,246,...)` colors and heavy box-shadows removed from the dashboard.
- All functionality preserved: store hooks (`useAppStore`, `usePhaseProgress`, `useOverallProgress`), `setActiveLesson`, `handleContinue`, daily-goal picker, all `useMemo` data derivations (current phase, next lesson, sparklines, weekData, accuracy, phoneme mastery), and all sub-widgets (`RecentLessonsCarousel`, `DailyChallengeCard`, `CoachInsights`) render unchanged.
- `progress-ring.tsx` updated to use `var(--p)` / `var(--border)` so rings inherit the minimal palette (benefits all views using ProgressRing).
- Primary buttons use `bg-[var(--p)] text-[var(--primary-foreground)]` to stay readable in both light (default) and dark themes.
- Cards use consistent `bg-[var(--card)] border border-[var(--border)] rounded-xl` with `hover:border-[var(--border2)]` for interactive affordance.
- Lint clean; dev server compiles successfully.
