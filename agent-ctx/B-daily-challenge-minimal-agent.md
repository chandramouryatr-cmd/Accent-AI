---
Task ID: B
Agent: Daily Challenge Minimal Agent
Task: Redesign Daily Challenge card to minimal white/black

Work Log:
- Read worklog.md and the existing daily-challenge-card.tsx to understand the heavy gradient/orb design that needed to be stripped.
- Confirmed CSS tokens (var(--card), --card-h, --bg2, --border, --border2, --t1, --t2, --t3, --p) exist in globals.css for both light & dark themes.
- Rewrote daily-challenge-card.tsx with minimal design:
  * Card: bg-[var(--card)] border border-[var(--border)] rounded-xl — solid white, thin gray border.
  * Removed the linear-gradient card background style and the two animated radial-gradient motion.div orbs entirely.
  * Header: kept emoji + "Daily Challenge" mono uppercase t3 label + "Master the {focus}" t1 title.
  * Difficulty badge: replaced colored accent badge with monochrome pill — t3 text on card-h bg with thin border. DIFFICULTY_COLORS map kept in code but unused.
  * Phrase box: bg-[var(--bg2)] border border-[var(--border)] rounded-lg p-3 — light gray bg. Phrase in t1, IPA in t3 mono.
  * Tip: removed amber-tinted box; replaced with left-border accent (border-l-2 border-[var(--border2)] pl-3) with t2 text. Kept the 💡 emoji.
  * Action buttons (3, same size, rounded-lg py-2 text-xs font-semibold):
    - "Hear it": solid bg-[var(--p)] text-white.
    - "Slow": ghost — border border-[var(--border2)] text-[var(--t1)] hover:bg-[var(--card-h)].
    - "Mark Done": when not done — outline border-[var(--p)] text-[var(--p)] hover:bg-[var(--card-h)]. When done — solid bg-[var(--p)] text-white with Check icon.
  * Footer: removed emoji-heavy text; plain t3 mono "New challenge every day · N total" + status.
- Preserved all functionality: speak(), handlePlay, handlePlaySlow, handleComplete (with setActiveTab("practice") when already done), completed state with localStorage, pushToast on completion.
- Ran `bun run lint` — clean, no errors. Dev server log shows successful compilation.

Stage Summary:
- Daily Challenge card is now minimal white/black monochrome, consistent with the rest of the AccentAI minimal redesign.
- All gradient backgrounds, animated orbs, hardcoded rgba(99,102,241/139,92,246/34,211,238) colors, amber tip tint, and backdrop effects have been removed.
- The card uses only the global CSS token system so it adapts automatically to light/dark themes.
- No functionality was lost; only visual presentation changed.
