# Task 7 — App Shell Minimal Redesign Agent

## Goal
Redesign `src/components/app-shell.tsx` (header + bottom nav) to a clean minimal white/black aesthetic, removing all indigo/violet/cyan/amber glows, gradients, and pulse animations.

## What I read first
- `/home/z/my-project/worklog.md` — project context (single `/` SPA, dark default theme with indigo/violet/cyan palette being progressively stripped for minimalism).
- `/home/z/my-project/src/components/app-shell.tsx` — the existing shell with gradient orb, gradient-text logo, glowing streak/XP pills, emoji XP-shop button, animated gradient tab indicator + glowing dot.
- `/home/z/my-project/src/app/globals.css` — confirmed design tokens (`--bg`, `--t1`, `--t2`, `--t3`, `--p`, `--card`, `--card-h`, `--border`, etc.) and that `bg-[var(--bg)]/95` is already used elsewhere (e.g. dashboard.tsx) so the opacity modifier works in Tailwind v4.
- `/home/z/my-project/src/components/views/more.tsx` — confirmed XP Shop is already rendered inside the "More" tab, so the header XP-shop emoji button can be safely removed without losing functionality.

## Changes made to `src/components/app-shell.tsx`

### Imports
- Removed `Flame`, `Zap` from lucide imports (no longer used).
- Kept `Moon`, `Sun`, `AnimatePresence`, `motion`, `useMemo`.

### Root wrapper
- Removed `overflow-hidden` (no longer needed since gradient orb is gone).

### Removed entirely
- The `motion.div` gradient orb behind the header (radial-gradient `rgba(99,102,241,0.2)` → `rgba(139,92,246,0.1)` with pulsing scale/opacity).
- `animate-gradient-text` class + gradient `backgroundImage` on the "AccentAI" logo.
- Animated cyan `#22d3ee` dot next to the logo.
- `animate-pill-glow-amber` streak pill with `rgba(245,158,11,…)` bg/border + `Flame` icon in `#f59e0b`.
- `animate-pill-glow-violet` XP pill with `rgba(99,102,241,…)` bg/border + `Zap` icon in `#a78bfa`.
- Standalone XP-shop `🛍️` motion.button (More tab already hosts the shop).
- Animated gradient `bg-[rgba(99,102,241,0.15)]` tab indicator background.
- Glowing top accent line on active tab (`var(--grad-btn)` + `boxShadow` `rgba(99,102,241,0.6)`).
- `whileHover={{ scale: 1.08 }}` / `whileTap={{ scale: 0.95 }}` on tab buttons.
- `animate={{ scale: [1, 1.15, 1] }}` pulse on active tab icon.
- Glowing `boxShadow: "0 0 8px rgba(167,139,250,0.6)"` on the active-tab dot.
- Heavy `backdrop-blur-xl` + `bg-[rgba(7,7,15,0.85)]` / `bg-[rgba(7,7,15,0.95)]` on header/footer.

### Header (new, minimal)
```
<header className="sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)] safe-top">
  <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
    <div className="font-d text-lg font-bold text-[var(--t1)]">AccentAI</div>
    <div className="flex items-center gap-2">
      {/* streak pill */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--card)] text-xs text-[var(--t2)]">
        <span aria-hidden="true">🔥</span>
        <span className="font-mono font-medium">{streak}</span>
      </div>
      {/* xp pill */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--card)] text-xs text-[var(--t2)]">
        <span aria-hidden="true">⚡</span>
        <span className="font-mono font-medium">{xp}</span>
      </div>
      {/* accent badge */}
      <div className="px-2 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--t2)]">
        {accent === "usa" ? "🇺🇸" : "🇬🇧"} {accent.toUpperCase()}
      </div>
      {/* theme toggle */}
      <button onClick={toggleTheme}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--card-h)] transition-colors"
        aria-label="Toggle theme">
        {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
    </div>
  </div>
</header>
```

### Bottom nav (new, minimal)
- Plain `<button>` (not `motion.button`) — no scale animations.
- `hover:bg-[var(--card-h)] transition-colors` for subtle hover.
- Active indicator: `motion.div` with `layoutId="tab-indicator"` and `bg-[var(--card-h)]` (kept the spring layoutId transition; replaced gradient/glow with a single subtle surface tint).
- Active label: `text-[var(--t1)]`. Inactive label: `text-[var(--t3)]`. Inactive icon: `opacity-50`. (Removed `var(--p3)` active label color.)
- Active-tab dot kept as `layoutId="tab-dot"` 1×1px `bg-[var(--p)]` — no glow.
- Added `aria-label` and `aria-current={isActive ? "page" : undefined}` for accessibility.

### Main content
- Unchanged structurally: `max-w-3xl mx-auto px-4 py-5 pb-28 relative z-10` + `AnimatePresence mode="wait"` opacity/y view transition (kept; it's already subtle).

## Verification
- `bun run lint` → passes with no warnings.
- `dev.log` → `GET / 200` and `✓ Compiled in …` confirm the page renders cleanly.

## Files touched
- `src/components/app-shell.tsx` — full rewrite (237 → 211 lines).
- `/home/z/my-project/worklog.md` — appended Task 7 entry.

## Notes for downstream agents
- The global CSS still defines indigo tokens (`--p: #6366f1`, etc.) and many `animate-*` glow keyframes. These are untouched to avoid breaking other components. If a future agent wants a true black primary, `--p` should be redefined globally (it would cascade to all components, not just the shell).
- Header right side is intentionally compact; if more icons need to be added later, the simple pill + icon-button pattern established here is the convention to follow.
