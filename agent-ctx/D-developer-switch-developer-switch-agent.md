# Task ID: D — Developer Switch Agent

## Task
Add a Developer Mode toggle to the More view (`src/components/views/more.tsx`) so the user can flip a switch and unlock all locked features (phases, lessons, XP shop). Also simplify the More view's styling to match the minimal theme (remove gradient text, glow halos, and boxShadows).

## Files Read
- `/home/z/my-project/worklog.md` — project context (AccentAI English learning app, Zustand store, Next.js 16)
- `/home/z/my-project/src/components/views/more.tsx` — original 633-line More view
- `/home/z/my-project/src/lib/store.ts` — Zustand store (devMode/setDevMode did NOT exist → added them)
- `/home/z/my-project/agent-ctx/` — confirmed previous agent work records exist (8a lesson-notes, 8 dashboard redesign, 7 app-shell redesign, 7 keyboard, etc.)

## Changes Made

### 1. `src/lib/store.ts` — added devMode state
- Added `devMode: boolean` field to `AppState` interface (in the ui/section, before `activeTab`).
- Added `setDevMode: (v: boolean) => void` action signature to `AppState`.
- Initialized `devMode: false` in the store factory.
- Implemented `setDevMode: (v) => set({ devMode: v })`.
- Added `devMode: s.devMode` to the persist `partialize` block so the preference survives reloads.
- Deliberately did NOT touch `resetAll` — devMode is a user/test preference, not progress, so a reset shouldn't wipe the developer's flag mid-session.

### 2. `src/components/views/more.tsx` — added Developer Mode section + DevToggle + DEV badge + simplified styling

**New imports** (line 5):
- Added `Terminal` and `Check` to the existing `lucide-react` import.

**New `DevToggle` helper component** (after `SelectedCheck`, lines 86–102):
- A simple inline `<button role="switch" aria-checked={on}>` with `w-11 h-6 rounded-full`.
- Background: `bg-[var(--p)]` when on (black), `bg-[var(--card-h)] border border-[var(--border)]` when off (gray).
- Thumb: a `<motion.div>` 5×5 white circle, spring-animated `left: 22 | 2`.
- No shadcn import — kept minimal as requested.

**DEV badge in header** (lines 145–152):
- When `devMode` is true, shows `<span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--p)] text-white align-middle">DEV</span>` next to the "More" title.

**Developer Mode Section** (lines 521–554, index 8):
- Card with `bg-[var(--card)] border border-[var(--border)] rounded-xl p-4`.
- Header row: `<Terminal>` icon + "Developer Mode" title (`text-[var(--t1)]`), `<DevToggle>` on the right.
- Description in `text-[var(--t2)] text-xs`: "Unlocks all phases, lessons, and XP shop items for free. For testing and exploration."
- When `devMode` is ON, shows an `Unlocked` status panel with a 2×2 grid of checkmarks: All 8 Phases, All 32 Lessons, Free XP Shop, Unlimited XP. Each uses `<Check className="w-3 h-3 text-[var(--p)]" />`.
- Inserted BEFORE the Reset section, with a `<Divider />` between them.

**Reset section shifted from index 8 → index 9** (line 559).

### 3. Simplified styling changes (per task spec)

| # | Element | Before | After |
|---|---|---|---|
| 1 | "More" heading | `animate-gradient-text` + linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee, #6366f1) wrapped in `<span>` | Plain `<h1>` with `text-[var(--t1)]` |
| 2 | Profile avatar | `animate-pulse-glow` radial halo + `animate-gradient-ring` conic ring + `bg-[var(--grad-btn)]` | Single `bg-[var(--p)] text-white rounded-full` avatar div (removed halo + ring entirely) |
| 2b | Profile "Save" button | `bg-[var(--grad-btn)]` | `bg-[var(--p)]` |
| 3 | Accent selector | `style={{ boxShadow: "0 0 20px rgba(99,102,241,0.2)" }}` when selected | Removed inline `style` — kept `border-[var(--p)]` Tailwind class |
| 4 | Theme selector (dark + light) | Same `boxShadow` inline style | Removed inline `style` — kept `border-[var(--p)]` Tailwind class |
| 5 | About section "AccentAI" | `animate-gradient-text` + linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee, #a78bfa, #6366f1) | Plain `<span className="text-[var(--t1)]">AccentAI</span>` |
| 6 | Share button | `style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 6px 20px rgba(99,102,241,0.4)" }}` | `className="bg-[var(--p)]"` (no shadow, no inline style) |
| 7 | Phase overview progress bars | `bg-[var(--grad-btn)]` | `bg-[var(--p)]` |
| 8 | Bookmarked empty-state ⭐ | `rotate: [0, -10, 10, -10, 0]` + `scale: [1, 1.1, 1]` with `repeatDelay: 3` | Subtle bounce: `y: [0, -4, 0]` + `scale: [1, 1.08, 1]` with `repeatDelay: 2.5`, `ease: "easeInOut"` |
| 9 | Notes count badge | `bg-[rgba(99,102,241,0.12)] text-[var(--p3)]` | `bg-[var(--card-h)] text-[var(--t2)]` |
| — | `SelectedCheck` boxShadow | `shadow-[0_2px_8px_rgba(99,102,241,0.5)]` | Removed (just `bg-[var(--p)]` rounded badge) |

### Preserved (all functional logic intact)
- Section/Divider/SelectedCheck helper components (only simplified SelectedCheck's boxShadow).
- Name editing (input + Save button).
- Accent switching (USA/UK).
- Theme switching (Dark/Light).
- XP Shop widget.
- Phase overview with progress bars.
- Bookmarked lessons list (with max-h-96 overflow-y-auto + custom scrollbar via globals.css).
- My Lesson Notes list with count badge.
- About card with version pill + Share My Stats button.
- ShareCard modal.
- Reset flow (warning glow + confirm cancel/yes-reset).
- All framer-motion entrance animations (`Section`, `motion.div` avatars, etc.) — only the gradient/glow decorations were removed.

## Verification
- `bun run lint` → EXIT 0, zero errors, zero warnings.
- `tail /home/z/my-project/dev.log` → "✓ Compiled" repeatedly, no compile errors, GET / 200.

## Result
- The More view now has a Developer Mode section between About (index 7) and Reset (now index 9) with a working toggle.
- The toggle is wired to `useAppStore(s => s.devMode)` and `useAppStore(s => s.setDevMode)`, persisted via Zustand `persist` middleware.
- When devMode is ON, the "More" title shows a small black `DEV` badge and the Developer Mode card expands to show a 2×2 grid of unlocked features.
- The view's overall look is now minimal — no gradient text, no glow halos, no indigo boxShadows — matching the same minimal theme used by the recently redesigned AppShell and Dashboard.
