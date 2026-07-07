// ─── AccentAI Lesson Registry ───
// Central index that imports all 32 lessons (8 phases × 4 lessons) and
// exposes lookup helpers used across the app:
//   - ALL_LESSONS        : Lesson[]            (every lesson, in phase/index order)
//   - ALL_LESSON_IDS     : string[]            (just the ids, in the same order)
//   - getLesson(id)      : Lesson | undefined
//   - getLessonsForPhase(phaseId): Lesson[]    (sorted by lessonIndex)
//   - lessonIdFor(phaseId, lessonIndex): string   e.g. lessonIdFor(0,0) => "p1l1"

import type { Lesson } from "../types";

// Phase 1 — Basic Sound Awareness
import p1l1 from "./phase1/l1";
import p1l2 from "./phase1/l2";
import p1l3 from "./phase1/l3";
import p1l4 from "./phase1/l4";

// Phase 2 — Word Pronunciation
import p2l1 from "./phase2/l1";
import p2l2 from "./phase2/l2";
import p2l3 from "./phase2/l3";
import p2l4 from "./phase2/l4";

// Phase 3 — Sentence Rhythm
import p3l1 from "./phase3/l1";
import p3l2 from "./phase3/l2";
import p3l3 from "./phase3/l3";
import p3l4 from "./phase3/l4";

// Phase 4 — Conversational Patterns
import p4l1 from "./phase4/l1";
import p4l2 from "./phase4/l2";
import p4l3 from "./phase4/l3";
import p4l4 from "./phase4/l4";

// Phase 5 — Native Compression
import p5l1 from "./phase5/l1";
import p5l2 from "./phase5/l2";
import p5l3 from "./phase5/l3";
import p5l4 from "./phase5/l4";

// Phase 6 — Accent Mimicking
import p6l1 from "./phase6/l1";
import p6l2 from "./phase6/l2";
import p6l3 from "./phase6/l3";
import p6l4 from "./phase6/l4";

// Phase 7 — Real-World Scenarios
import p7l1 from "./phase7/l1";
import p7l2 from "./phase7/l2";
import p7l3 from "./phase7/l3";
import p7l4 from "./phase7/l4";

// Phase 8 — Advanced Native Fluency
import p8l1 from "./phase8/l1";
import p8l2 from "./phase8/l2";
import p8l3 from "./phase8/l3";
import p8l4 from "./phase8/l4";

export const ALL_LESSONS: Lesson[] = [
  p1l1, p1l2, p1l3, p1l4,
  p2l1, p2l2, p2l3, p2l4,
  p3l1, p3l2, p3l3, p3l4,
  p4l1, p4l2, p4l3, p4l4,
  p5l1, p5l2, p5l3, p5l4,
  p6l1, p6l2, p6l3, p6l4,
  p7l1, p7l2, p7l3, p7l4,
  p8l1, p8l2, p8l3, p8l4,
];

export const ALL_LESSON_IDS: string[] = ALL_LESSONS.map((l) => l.id);

const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.id, l])
);

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID[id];
}

export function getLessonsForPhase(phaseId: number): Lesson[] {
  return ALL_LESSONS.filter((l) => l.phaseId === phaseId).sort(
    (a, b) => a.lessonIndex - b.lessonIndex
  );
}

export function lessonIdFor(phaseId: number, lessonIndex: number): string {
  return `p${phaseId + 1}l${lessonIndex + 1}`;
}
