// ─── AccentAI Lesson Schema ───
// Every lesson is a sequence of typed steps. Each step type renders with
// a dedicated animated widget. This guarantees that EVERY lesson has
// real interactive content (no placeholders).

export type Accent = "usa" | "uk";

export type PhaseStatus = "done" | "current" | "locked";

export interface Phase {
  id: number;
  emoji: string;
  name: string;
  desc: string;
  status: PhaseStatus;
  lessons: string[]; // lesson titles
  xp: number;
  badge: string;
  color: string; // gradient css
}

// ─── Step types ───

export type StepVisual =
  | "wave"
  | "mouth"
  | "ipa-chart"
  | "vowel-chart"
  | "compare-wave"
  | "rhythm"
  | "phoneme-grid"
  | "stress-bars"
  | "linking"
  | "shadow"
  | "intonation"
  | "emoji-burst";

export interface BaseStep {
  id: string;
  type: string;
  title?: string;
}

export interface IntroStep extends BaseStep {
  type: "intro";
  title: string;
  subtitle: string;
  description: string;
  visual: StepVisual;
  emoji?: string;
}

export interface ConceptStep extends BaseStep {
  type: "concept";
  title: string;
  body: string[]; // paragraphs
  bulletPoints?: string[];
  visual: StepVisual;
  visualLabel?: string;
  /** Optional config for visual (e.g. mouth tongue position) */
  visualConfig?: Record<string, unknown>;
}

export interface ExampleStep extends BaseStep {
  type: "example";
  title?: string;
  phrase: string;
  ipa: string;
  highlightWords?: string[];
  tip?: string;
  /** words user can tap to hear individually */
  tapWords?: { word: string; ipa: string }[];
}

export interface MouthDiagramStep extends BaseStep {
  type: "mouth-diagram";
  title?: string;
  description: string;
  /** tongue position: front/central/back, high/mid-low/low */
  tonguePosition: "front-high" | "front-mid" | "front-low" | "central-mid" | "back-high" | "back-low" | "between-teeth" | "neutral";
  lipShape: "relaxed" | "rounded" | "spread" | "slightly-open";
  sound?: string; // e.g. "æ"
  exampleWord?: string;
  /** Optional path to a reference image (e.g. "/vowels/ae-trap.png") shown
   *  above the interactive SVG. When provided, the image is rendered as the
   *  primary visual and the SVG mouth cross-section is hidden. */
  image?: string;
}

export interface VowelChartStep extends BaseStep {
  type: "vowel-chart";
  title?: string;
  description: string;
  /** dots to plot on the vowel quadrilateral */
  vowels: { ipa: string; x: number; y: number; label?: string; color?: string }[];
  highlight?: string; // ipa to emphasize
}

export interface CompareStep extends BaseStep {
  type: "compare";
  title?: string;
  nativePhrase: string;
  learnerPhrase: string;
  nativeIpa: string;
  learnerIpa: string;
  description: string;
}

export interface StressBarsStep extends BaseStep {
  type: "stress-bars";
  title?: string;
  word: string;
  syllables: { text: string; stressed: boolean }[];
  description?: string;
}

export interface RhythmStep extends BaseStep {
  type: "rhythm";
  title?: string;
  phrase: string;
  /** each beat: text + duration + stressed */
  beats: { text: string; duration: number; stressed: boolean }[];
  description?: string;
}

export interface LinkingStep extends BaseStep {
  type: "linking";
  title?: string;
  words: string[];
  /** linked groups: array of word indices that link together */
  links: { from: number; to: number; type: "consonant-vowel" | "consonant-consonant" | "vowel-vowel" }[];
  description?: string;
}

export interface ShadowStep extends BaseStep {
  type: "shadow";
  title?: string;
  phrase: string;
  ipa: string;
  description: string;
}

export interface IntonationStep extends BaseStep {
  type: "intonation";
  title?: string;
  phrase: string;
  /** pitch contour points: 0-100 horizontal, 0-100 vertical */
  contour: { x: number; y: number }[];
  pattern: "rising" | "falling" | "rise-fall" | "fall-rise" | "level";
  description?: string;
}

export interface TapPronounceStep extends BaseStep {
  type: "tap-pronounce";
  title?: string;
  description?: string;
  words: { word: string; ipa: string; meaning?: string }[];
}

export interface TipStep extends BaseStep {
  type: "tip";
  title?: string;
  body: string;
  variant?: "info" | "success" | "warning";
}

export interface PracticeStep extends BaseStep {
  type: "practice";
  title?: string;
  phrase: string;
  ipa: string;
  tip?: string;
  /** minimum score (0-100) required to pass */
  passScore?: number;
}

export interface QuizStep extends BaseStep {
  type: "quiz";
  question: string;
  options: string[];
  correct: number; // index
  explanation: string;
}

export interface CompletionStep extends BaseStep {
  type: "completion";
  title: string;
  subtitle: string;
  xp: number;
  badge?: string;
  nextLessonTitle?: string;
}

export type LessonStep =
  | IntroStep
  | ConceptStep
  | ExampleStep
  | MouthDiagramStep
  | VowelChartStep
  | CompareStep
  | StressBarsStep
  | RhythmStep
  | LinkingStep
  | ShadowStep
  | IntonationStep
  | TapPronounceStep
  | TipStep
  | PracticeStep
  | QuizStep
  | CompletionStep;

export type LessonDifficulty = "easy" | "medium" | "hard";

export interface Lesson {
  id: string;
  phaseId: number;
  lessonIndex: number; // 0-3 within phase
  title: string;
  subtitle: string;
  duration: number; // minutes
  xp: number;
  objectives: string[];
  steps: LessonStep[];
  /** Optional explicit difficulty. If omitted, `getLessonDifficulty` derives it from phaseId + lessonIndex. */
  difficulty?: LessonDifficulty;
}

/**
 * Derive a lesson's difficulty from its position in the curriculum.
 *
 * Rules (phaseId is 0-indexed — 0 = Phase 1, 7 = Phase 8):
 *   • Phase 1–2 (phaseId 0–1)            → easy
 *   • Phase 3–4 (phaseId 2–3)            → medium
 *   • Phase 5–6 (phaseId 4–5)            → medium for lessons 0–1, hard for lessons 2–3
 *   • Phase 7–8 (phaseId 6–7)            → hard
 *
 * Within a phase, lessons 2–3 are treated as the "harder half" and bumped
 * up one level when the phase sits on a difficulty boundary.
 */
export function getLessonDifficulty(lesson: Pick<Lesson, "phaseId" | "lessonIndex" | "difficulty">): LessonDifficulty {
  // Allow an explicit override on the lesson itself.
  if (lesson.difficulty) return lesson.difficulty;

  const { phaseId, lessonIndex } = lesson;
  const isLaterInPhase = lessonIndex >= 2; // lessons 2–3 are the harder half

  if (phaseId <= 1) {
    // Phase 1–2: easy (bump lessons 2–3 of Phase 2 up to medium)
    return phaseId === 1 && isLaterInPhase ? "medium" : "easy";
  }
  if (phaseId <= 3) {
    // Phase 3–4: medium (bump lessons 2–3 of Phase 4 up to hard)
    return phaseId === 3 && isLaterInPhase ? "hard" : "medium";
  }
  if (phaseId <= 5) {
    // Phase 5–6: medium-hard (lessons 0–1 medium, lessons 2–3 hard)
    return isLaterInPhase ? "hard" : "medium";
  }
  // Phase 7–8: hard
  return "hard";
}

// ─── Phases master data ───

export const PHASES: Phase[] = [
  {
    id: 0,
    emoji: "👂",
    name: "Basic Sound Awareness",
    desc: "Vowels, Consonants, Mouth Positioning",
    status: "current",
    lessons: ["Vowel Sounds A–E", "Consonant Clusters", "Mouth Positioning", "Listening Recognition"],
    xp: 500,
    badge: "Sound Seeker 🔈",
    color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  },
  {
    id: 1,
    emoji: "🗣️",
    name: "Word Pronunciation",
    desc: "Common Words, Syllable Stress",
    status: "locked",
    lessons: ["100 Core Words", "Syllable Stress Rules", "Silent Letters", "Slow Repetition Drills"],
    xp: 600,
    badge: "Word Warrior 📖",
    color: "linear-gradient(135deg, #8b5cf6, #d946ef)",
  },
  {
    id: 2,
    emoji: "🎵",
    name: "Sentence Rhythm",
    desc: "Connected Speech, Native Pacing",
    status: "locked",
    lessons: ["Linking Words", "Sentence Melody", "Rhythm Patterns", "Chunking Speech"],
    xp: 700,
    badge: "Rhythm Rider 🎵",
    color: "linear-gradient(135deg, #d946ef, #ec4899)",
  },
  {
    id: 3,
    emoji: "💬",
    name: "Conversational Patterns",
    desc: "Everyday Conversations, Emotional Expression",
    status: "locked",
    lessons: ["Casual Greetings", "Expressing Emotions", "Questions & Answers", "Small Talk Mastery"],
    xp: 750,
    badge: "Chat Champion 💬",
    color: "linear-gradient(135deg, #ec4899, #f43f5e)",
  },
  {
    id: 4,
    emoji: "⚡",
    name: "Native Compression",
    desc: "Fast Speech, Reduced Sounds, Contractions",
    status: "locked",
    lessons: ["Gonna & Wanna", "Reduced Vowels", "Elision & Assimilation", "Fast Speech Decoding"],
    xp: 800,
    badge: "Speed Speaker ⚡",
    color: "linear-gradient(135deg, #f43f5e, #f97316)",
  },
  {
    id: 5,
    emoji: "🪞",
    name: "Accent Mimicking",
    desc: "Shadow Speaking, Copy Native Speakers",
    status: "locked",
    lessons: ["Shadowing Technique", "Prosody Copying", "Tone Matching", "Character Voices"],
    xp: 850,
    badge: "Mirror Master 🪞",
    color: "linear-gradient(135deg, #f97316, #f59e0b)",
  },
  {
    id: 6,
    emoji: "🏢",
    name: "Real-World Scenarios",
    desc: "Interviews, Presentations, Phone Calls",
    status: "locked",
    lessons: ["Job Interview English", "Presentation Skills", "Phone Communication", "Public Speaking"],
    xp: 900,
    badge: "World Ready 🌍",
    color: "linear-gradient(135deg, #10b981, #22d3ee)",
  },
  {
    id: 7,
    emoji: "👑",
    name: "Advanced Native Fluency",
    desc: "Near-native Mastery, Dynamic Speaking",
    status: "locked",
    lessons: ["Tone Adaptation", "Humor & Irony", "Regional Variants", "Master Performance"],
    xp: 1000,
    badge: "Accent Master 👑",
    color: "linear-gradient(135deg, #22d3ee, #6366f1)",
  },
];

export const PHASE_TITLES = PHASES.map((p) => ({
  phaseId: p.id,
  lessons: p.lessons,
}));
