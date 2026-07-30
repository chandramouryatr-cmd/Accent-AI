# AccentAI

> Master Native-Level English — a mobile-first pronunciation learning app with 32 interactive lessons across 8 phases.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

## Overview

AccentAI is a production-grade, mobile-first web application for learning English pronunciation and accent. Built around a structured **8-phase, 32-lesson curriculum**, it takes learners from basic sound awareness to native-level performance mastery — with real IPA, interactive mouth diagrams, vowel charts, intonation contours, rhythm beat maps, microphone recording + scoring, and an AI coach.

## Features

- **32 interactive lessons** across 8 phases (Sound Foundations → Mastery)
- **16 step types**: intro, concept, example, mouth-diagram, vowel-chart, compare, stress-bars, rhythm, linking, shadow, intonation, tap-pronounce, tip, practice, quiz, completion
- **Dictionary lookup** — long-press any word anywhere → floating pill → modal with definition, IPA, audio, synonyms
- **AI Coach** — LLM-powered chat for pronunciation Q&A
- **Pronunciation practice** — microphone recording with scoring
- **Progress tracking** — XP, daily streaks, 8 capstone badges, phoneme mastery, rank ladder
- **Daily goals** with auto-reset, lesson bookmarks, search & filter
- **Dark/light theme** with premium glass-morphism UI + Framer Motion animations
- **PWA-ready** — service worker, manifest, offline page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| State | Zustand (persisted) + TanStack Query |
| Animation | Framer Motion 12 |
| Audio | Web Speech API (TTS) + Web Audio API + MediaRecorder |
| Theme | next-themes (dark default) |
| Database | Prisma ORM + SQLite |
| AI | z-ai-web-dev-sdk (LLM, VLM, TTS, ASR, Web Search) |

## Getting Started

```bash
# Install dependencies
bun install

# Start the dev server
bun run dev

# Open http://localhost:3000
```

### Other commands

```bash
bun run lint        # ESLint
bun run db:push     # Push Prisma schema to SQLite
bun run db:generate # Generate Prisma client
```

## Project Structure

```
src/
├── app/                    # Next.js App Router (single "/" route)
│   ├── api/                # Dictionary proxy + AI coach routes
│   ├── globals.css         # CSS tokens, keyframes, theme variables
│   └── layout.tsx          # Fonts + ThemeProvider
├── components/
│   ├── views/              # dashboard, journey, practice, progress, more
│   ├── lesson/             # LessonModal + step renderers
│   ├── widgets/            # 40+ animated SVG/Canvas widgets
│   ├── ai-coach/           # FAB + chat panel
│   ├── onboarding/         # Accent picker
│   └── ui/                 # Full shadcn/ui component set
└── lib/
    ├── lessons/            # 8 phases × 4 lessons = 32 files
    ├── types.ts            # Lesson schema (16 step types)
    ├── store.ts            # Zustand store (progress, XP, streaks, badges)
    ├── tts.ts              # Web Speech API wrapper
    └── speech-recognition.ts
```

## Curriculum

| Phase | Theme | Capstone Badge |
|-------|-------|----------------|
| 1 | Sound Foundations | 🎤 Sound Pioneer |
| 2 | Core Vocabulary | 📖 Word Warrior |
| 3 | Rhythm & Flow | 🎵 Rhythm Rider |
| 4 | Conversational | 💬 Chat Champion |
| 5 | Native Compression | ⚡ Speed Speaker |
| 6 | Intonation & Shadowing | 🪞 Mirror Master |
| 7 | Real-World Scenarios | 🏆 Scenario Pro |
| 8 | Mastery | 👑 Accent Master |

## License

MIT
