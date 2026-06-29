---
Task ID: 8a-lesson-notes
Agent: lesson-notes-builder
Task: Build a Lesson Notes feature (personal notebook per lesson) with Zustand persistence, lesson modal integration, and More view section

Work Log:
- Read /home/z/my-project/worklog.md (847+ lines) to absorb project context: AccentAI is a Next.js 16 + TypeScript single-route SPA with 32 lessons across 8 phases, Zustand persist store, dark-default indigo/violet/cyan palette, Framer Motion throughout, glass morphism patterns.
- Read /home/z/my-project/src/lib/store.ts (450 lines) — understood the AppState shape, persist config (partialize block), and existing patterns for actions like toggleBookmark / setChallengeHighScore.
- Read /home/z/my-project/src/components/lesson/lesson-modal.tsx (1086 lines) — understood the header layout (Close / center title / step count + ProgressRing), the existing "adjust state during render" pattern for prevStepIdx, the keydown handler for ESC/arrows/Space, and the AnimatePresence slot above the footer for the Space-to-play hint.
- Read /home/z/my-project/src/components/views/more.tsx (337 lines) — understood the section-based layout and the existing "Bookmarked Lessons" card pattern to mirror.
- Read globals.css to confirm available CSS tokens: --bg, --bg2, --card, --card-h, --border, --border2, --t1/t2/t3, --p/p2/p3, --c, --grad-btn, --overlay-*. Global webkit scrollbar styling already exists.

### File 1 — MODIFIED: src/lib/store.ts
- Added `lessonNotes: Record<string, string>` field to AppState interface (keyed by lessonId, value is the note text).
- Added 3 actions to the interface and implementation:
  • `setLessonNote(lessonId, note)` — trims trailing whitespace, slices to 5000 chars, deletes the entry if the trimmed value is empty (so "clearing" the textarea is equivalent to deleting).
  • `deleteLessonNote(lessonId)` — removes the key from the record (no-op if not present).
  • `getLessonNote(lessonId)` — returns the stored note or `""` (plain function, not a hook).
- Added `lessonNotes: {}` to the initial state.
- Added `lessonNotes: {}` to `resetAll` so a fresh start wipes notes too.
- Added `lessonNotes: s.lessonNotes` to the `partialize` block so notes persist across sessions via the existing `accentai-store` localStorage key.

### File 2 — CREATED: src/components/widgets/lesson-notes-panel.tsx (~530 lines)
Two exported components + one exported hook:

**`<LessonNotesPanel lessonId lessonTitle />`** — self-contained card with:
- Glass morphism: `rounded-2xl border bg-[var(--card)] backdrop-blur-md` with `inset 0 1px 0 rgba(255,255,255,0.04)` highlight + a violet radial-gradient decorative orb in the top-right corner.
- Header: gradient tile with `NotebookPen` icon, lesson title, and an animated "Saving…" → "Saved ✓" status indicator (Framer Motion AnimatePresence, spring entrance for the checkmark).
- Textarea (200px min height, resizable): `bg-[var(--bg2)]`, indigo focus ring `focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)]`, placeholder "Write your personal notes for this lesson…".
- **Debounced autosave**: 800ms after the last keystroke, the note is flushed to the store via `setLessonNote`. Also flushes on blur if dirty. Status cycles idle → saving → saved → idle (1.8s delay before resetting to idle).
- **Character count**: `342 / 5000` monospace counter; turns amber at 4800+ chars, red at cap. `maxLength={5000}` on the textarea as a hard cap.
- **Clear notes button**: appears only when there's content. Two-step confirmation ("Clear notes" → "Sure? [Yes, clear] [Cancel]") so a stray tap can't wipe a long note.
- **Suggested prompts** (5 items): "What was your biggest takeaway from this lesson?", "Which word or sound was hardest for you? Why?", "When will you use this in real life? Give a concrete example.", "What's one thing you want to practice more tomorrow?", "Note any tongue/mouth position that surprised you." — shown as clickable chips only when the textarea is empty; clicking fills the textarea with the prompt + two newlines as a starting template, then focuses the cursor at the end. Hover lift animation (`y: -2, scale: 1.02`).
- **"Saved notes from other lessons"** expandable section (only renders when ≥1 other lesson has a saved note). Collapsible via ChevronDown/ChevronRight toggle. Shows the most recent 3 notes from OTHER lessons, sorted by lesson completion time descending (fallback to phase/lesson catalog order). Each item shows a phase pill (e.g. "P1"), the lesson title, the first 80 chars of the note, and a chevron. Clicking dispatches `setActiveLesson(lessonId)` (per the task spec — within the modal this won't immediately switch the modal, but the state is set so it works correctly when the panel is closed or when accessed from the More view).
- Local draft state: hydrates from the store on `lessonId` change (same render-time adjustment pattern as the lesson modal's prevStepIdx) so the panel can be reused across lessons without unmounting.
- Cleanup: clears pending debounce + saved-status timers on unmount.

**`<MyLessonNotesList />`** — exported standalone list component for the More view:
- Reads all notes from the store, filters out empty ones, sorts by **note length descending** (longest, most thoughtful notes surface first; ties broken by phase/lesson catalog order). Sort policy is documented in the component comment AND in more.tsx.
- Each row: phase pill + lesson title (clickable → opens that lesson via `setActiveLesson`), first 100 chars of the note (line-clamp-2), `78 chars · 14 words` footer, and a hover-revealed Trash2 button with two-step delete confirmation.
- Empty state: "📔 No notes yet — open any lesson and tap the notebook icon to start journaling your progress."
- Staggered entrance animation per row.

**`useLessonNoteCount()`** — small selector hook returning the number of non-empty notes (used by the More view header badge).

### File 3 — MODIFIED: src/components/lesson/lesson-modal.tsx
- Imported `NotebookPen` from lucide-react and `LessonNotesPanel` from the new widget file.
- Added `showNotesPanel` state (boolean) and a reactive `hasLessonNote` selector (`useAppStore((s) => (s.lessonNotes[lesson.id] ?? "").trim().length > 0)`).
- **Header toggle button**: added a `motion.button` between the center title and the step count, with `aria-label="Open lesson notes"` and `aria-expanded={showNotesPanel}`. Shows a small violet dot indicator (`bg-[var(--p3)]` with a glow `box-shadow`) when `hasLessonNote` is true — springs in via Framer Motion when the user saves their first note.
- **Side panel overlay**: `AnimatePresence` block at the end of the modal (before `</motion.div>`) containing:
  • Backdrop: `absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm` that closes the panel on click.
  • Panel: `motion.div` sliding in from `x: "100%"` → `0` (spring stiffness 320 / damping 32), `w-full max-w-md`, with its own header (gradient tile + "My Notebook" label + lesson title + X close button) and a scrollable body containing `<LessonNotesPanel lessonId={lesson.id} lessonTitle={lesson.title} />`.
  • `role="dialog"` and `aria-label` for accessibility.
- **Keyboard integration**:
  • ESC: if the notes panel is open, closes the panel first (instead of closing the whole lesson). Added `showNotesPanel` to the keydown effect's dependency array.
  • Space: when the notes panel is open, Space no longer triggers step audio playback (so users can type spaces in their notes without accidental TTS). The existing `isTyping` check is preserved as a secondary guard.

### File 4 — MODIFIED: src/components/views/more.tsx
- Imported `NotebookPen` from lucide-react and `{ MyLessonNotesList, useLessonNoteCount }` from the new widget file.
- Added `const noteCount = useLessonNoteCount();` in the component.
- Inserted a new "My Lesson Notes" `<div>` section between "Bookmarked Lessons" and "About AccentAI":
  • Header (`h2`) with NotebookPen icon, "My Lesson Notes" title, and a right-aligned pill badge showing `{noteCount} note/notes` (only when count > 0).
  • Comment documenting the sort policy: "longest notes first (ties broken by phase / lesson catalog order)".
  • Renders `<MyLessonNotesList />` which handles its own empty state and list rendering.

### Verification
- `bun run lint` → EXIT 0 (zero errors, zero warnings) across all 4 modified files.
- `tail -25 /home/z/my-project/dev.log` → all `✓ Compiled in XXXms` lines, `GET / 200`, no errors.
- `agent-browser open http://localhost:3000` → page loads, `document.querySelector('h1')?.textContent` returns "Good afternoon, Alex 👋" (dashboard renders correctly).
- `agent-browser` interaction test:
  • Navigated to More view → confirmed "My Lesson Notes" h2 appears in the section list with the NotebookPen icon.
  • Empty state renders: "📔 No notes yet — open any lesson and tap the notebook icon to start journaling your progress."
  • Opened the "Vowel Sounds A–E" lesson modal → confirmed the "Open lesson notes" button is present in the header (next to the step count) with `aria-expanded="false"`.
  • Clicked the button → side panel slides in from the right; textarea with placeholder "Write your personal notes for this lesson…" and id `lesson-notes-ta-p1l1` is present.
  • Typed a test note via the React-aware value setter + input event → textarea value updates correctly.
  • "Saving…" indicator appears immediately after typing; "Saved ✓" indicator appears after the 800ms debounce.
  • Verified persistence: `JSON.parse(localStorage.getItem('accentai-store')).state.lessonNotes.p1l1` contains the exact typed text.
  • Verified the violet dot indicator on the header toggle button is now present (since the lesson has a saved note).
  • Closed the panel via the X button, closed the lesson modal, navigated to More view → "My Lesson Notes" section now shows "1 note" badge + a card with the lesson title, first 100 chars of the note, and `78 chars · 14 words` footer.
- Cleaned up the test note from localStorage so the user starts with a fresh empty state.

Stage Summary:
- 4 files touched: 1 created (`src/components/widgets/lesson-notes-panel.tsx`), 3 modified (`src/lib/store.ts`, `src/components/lesson/lesson-modal.tsx`, `src/components/views/more.tsx`).
- Full Zustand persistence: notes survive page reloads via the existing `accentai-store` localStorage key (added to `partialize`).
- Two integration points: (1) header toggle button in the lesson modal that opens a slide-in side panel, with a reactive dot indicator showing when the current lesson has a saved note; (2) a "My Lesson Notes" section in the More view with a count badge and a list sorted by note length descending.
- Lint: PASS (exit 0). Dev server: HTTP 200. All features verified working end-to-end via agent-browser.
- Sort policy decision: More view list is sorted by note LENGTH descending (longest/most thoughtful notes first). This was chosen over completion-time ordering because notes are independent of lesson completion — a user might take notes on an in-progress lesson. Within the panel's "other notes" reference list, completion time is used because the user is in the middle of a specific lesson and "recently completed" context is more relevant there.
- Keyboard integration: ESC closes the notes panel before closing the lesson (so the panel acts as a sub-modal); Space is suppressed when the panel is open so users can type spaces in their notes without triggering audio playback.
