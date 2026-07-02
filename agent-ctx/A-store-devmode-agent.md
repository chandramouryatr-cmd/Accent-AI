# Task A — Store DevMode Agent

## Task
Add `devMode` boolean to the Zustand store (interface, initial state, setter, and free-grant logic in all `buy*` + `spendXP`), then wire it to the Journey view (unlock all phases) and the XP Shop (bypass cost, show "FREE"/"Unlock FREE").

## Files Touched
1. `src/lib/store.ts` — devMode field, setDevMode action, free-grant in spendXP + 4 buy* functions
2. `src/components/views/journey.tsx` — phaseInfo useMemo unlocks all phases when devMode
3. `src/components/widgets/xp-shop.tsx` — bypass affordability check, "FREE"/"Unlock FREE" button labels, FREE toast subtitle

## Work Log
- Read worklog.md, store.ts, journey.tsx, xp-shop.tsx for full context.
- Discovered that `devMode` field / `setDevMode` action / `devMode: false` initial state / `setDevMode` impl / `devMode` in partialize had ALREADY been added to `store.ts` by a prior/parallel agent (concurrent edit). My initial MultiEdit therefore produced duplicate declarations.
- Cleaned up the duplicates I introduced (removed my redundant `devMode: boolean;`, `setDevMode` interface line, `devMode: false,` initial state, and `setDevMode` impl), keeping the pre-existing single declarations. Final state has exactly one of each.
- Added the actual devMode BEHAVIOR (the missing piece the task is about) to:
  - `spendXP`: `if (get().devMode) return true;` at the very start — any amount spendable for free.
  - `buyStreakFreeze`: devMode branch grants +1 streakFreeze without deducting XP.
  - `buyDoubleXP`: devMode branch sets doubleXP=true (still returns false if already owned — unique item guard preserved).
  - `buyCustomTheme`: devMode branch sets customTheme=true (still returns false if already owned).
  - `buyLessonRetry`: devMode branch grants +1 lessonRetry without deducting XP.
- Wired `devMode` into `journey.tsx`:
  - `const devMode = useAppStore((s) => s.devMode);`
  - In `phaseInfo` useMemo: `unlocked.push(prevDone || devMode);` so every phase after phase 0 is unlocked in dev mode.
  - Added `devMode` to the useMemo dependency array.
  - Result: `isUnlocked` is true for all phases → no Lock icon, phases are clickable/expandable. (The "DEV" badge was optional and skipped to avoid touching visual styling, per constraints.)
- Wired `devMode` into `xp-shop.tsx`:
  - `const devMode = useAppStore((s) => s.devMode);`
  - `canAfford = devMode || xp >= item.cost;` — buttons always enabled in dev mode.
  - `handleBuy` early-return guard: `if (xp < item.cost && !devMode) return;`
  - Button label: when `devMode && !owned && !purchasing`, shows `⚡ Unlock FREE` (unique items) or `⚡ Get FREE` (non-unique) instead of `Buy · {cost} XP`.
  - Toast subtitle: `FREE · {name} is now active` when devMode (instead of `−{cost} XP · ...`).
  - `xpDelta` animation: `to: devMode ? prevXP : prevXP - item.cost` so no false XP-drop animation in dev mode.
  - Added `devMode` to handleBuy useCallback dependency array.

## Constraints Honored
- No visual styling changes — only logic/labels.
- No existing functionality removed (unique-item guard, owned state, purchase animation all preserved).
- Store persistence preserved; `devMode` is in the `partialize` allowlist so it persists across reloads (as the task notes is fine).

## Verification
- `bun run lint` → clean, no errors/warnings.
- `rg devMode src/lib/store.ts` → 10 hits, all single-declaration (no duplicates).
- Dev server compiles cleanly (dev.log shows successful incremental compiles).

## Stage Summary
- `devMode` is now a fully functional toggle in the store. When ON:
  - All Journey phases are unlocked & clickable (Lock icon hidden).
  - All XP Shop items are purchasable for free; buttons read "Unlock FREE"/"Get FREE"; toast confirms "FREE".
  - `spendXP` always succeeds.
  - `buyStreakFreeze`/`buyLessonRetry` increment counts for free; `buyDoubleXP`/`buyCustomTheme` set true for free (unique-item guard still prevents redundant "purchases").
- A separate UI toggle (e.g. in the More view) to flip `setDevMode(true/false)` is the natural next step — outside this task's scope.
