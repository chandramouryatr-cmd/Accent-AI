// Phoneme data for the Phoneme Drill mode.
//
// Two datasets live here:
//
//  1. PHONEME_LESSONS — maps each tracked phoneme to the AccentAI lessons
//     that train it. Reused (with permission) from
//     src/components/widgets/phoneme-mastery.tsx so the drill can read the
//     user's mastery score straight from the Zustand `lessons` history.
//
//  2. PHONEME_DRILL_DATA — the actual drill content: for each of the 12
//     phonemes the drill targets, a list of 8 target words (each containing
//     the phoneme) plus 2-3 minimal-pair distractors per word. Distractors
//     are real English words that sound similar but do NOT contain the
//     target phoneme — they differ from the target word by exactly one
//     phoneme, so the ear is forced to discriminate.

export interface DrillWord {
  word: string;
  distractors: string[];
}

export interface PhonemeEntry {
  /** Display symbol WITHOUT slashes — e.g. "θ". */
  phoneme: string;
  /** Short example blurb for the selector grid. */
  example: string;
  /** 8 target words each with 2-3 minimal-pair distractors. */
  words: DrillWord[];
}

// Maps phonemes → AccentAI lesson IDs that train them.
// Copied verbatim from phoneme-mastery.tsx (which keeps it private).
export const PHONEME_LESSONS: Record<string, { ids: string[]; example: string }> = {
  ð: { ids: ["p1l2", "p1l3", "p1l4"], example: "the, this, mother" },
  θ: { ids: ["p1l2", "p1l3", "p1l4"], example: "think, three, bath" },
  æ: { ids: ["p1l1", "p1l4", "p2l1"], example: "cat, bad, ask" },
  ŋ: { ids: ["p1l2", "p2l1", "p2l3"], example: "sing, going, think" },
  ɪ: { ids: ["p1l1", "p2l1", "p2l4"], example: "ship, sit, bit" },
  ʊ: { ids: ["p1l1", "p2l1", "p2l4"], example: "book, put, good" },
  "ɜː": { ids: ["p1l1", "p2l1", "p5l2"], example: "bird, work, learn" },
  ʒ: { ids: ["p1l2", "p2l1", "p5l3"], example: "measure, vision" },
  "ɑː": { ids: ["p1l1", "p2l1"], example: "father, car" },
  "iː": { ids: ["p1l1", "p1l4"], example: "see, sheep, eat" },
  "uː": { ids: ["p1l1", "p1l4"], example: "food, pool, two" },
  r: { ids: ["p1l3", "p4l1"], example: "red, around, very" },
};

// The 12 phonemes the drill targets (with their minimal-pair content).
export const PHONEME_DRILL_DATA: PhonemeEntry[] = [
  {
    phoneme: "θ",
    example: "think, three, bath",
    words: [
      { word: "think", distractors: ["sink", "tin", "sing"] },
      { word: "thought", distractors: ["taught", "sought", "dot"] },
      { word: "three", distractors: ["tree", "free", "dee"] },
      { word: "thumb", distractors: ["some", "sum", "dumb"] },
      { word: "thread", distractors: ["tread", "dread", "dead"] },
      { word: "bath", distractors: ["bass", "bat", "boss"] },
      { word: "math", distractors: ["mass", "mat", "moss"] },
      { word: "tooth", distractors: ["tool", "toot", "tenth"] },
    ],
  },
  {
    phoneme: "ð",
    example: "this, that, mother",
    words: [
      { word: "this", distractors: ["dis", "sis", "den"] },
      { word: "that", distractors: ["dat", "tat", "sat"] },
      { word: "those", distractors: ["doze", "dose", "toes"] },
      { word: "brother", distractors: ["brudder", "brooder", "bother"] },
      { word: "mother", distractors: ["mutter", "mudder", "moder"] },
      { word: "breathe", distractors: ["breed", "bead", "brede"] },
      { word: "smooth", distractors: ["sooth", "smooch", "soothe"] },
      { word: "bathe", distractors: ["base", "bead", "bade"] },
    ],
  },
  {
    phoneme: "æ",
    example: "cat, bad, dance",
    words: [
      { word: "cat", distractors: ["cot", "cut", "ket"] },
      { word: "hat", distractors: ["hot", "hut", "head"] },
      { word: "bad", distractors: ["bed", "bud", "bod"] },
      { word: "apple", distractors: ["opal", "uppel", "ipple"] },
      { word: "dance", distractors: ["dense", "dunce", "dents"] },
      { word: "last", distractors: ["lost", "lest", "lust"] },
      { word: "fast", distractors: ["fest", "fist", "fost"] },
      { word: "class", distractors: ["cless", "closs", "glass"] },
    ],
  },
  {
    phoneme: "eɪ",
    example: "cake, rain, day",
    words: [
      { word: "cake", distractors: ["cack", "cock", "cuke"] },
      { word: "make", distractors: ["mack", "mock", "muck"] },
      { word: "take", distractors: ["tack", "tock", "tech"] },
      { word: "rain", distractors: ["ran", "ren", "ron"] },
      { word: "day", distractors: ["dye", "dey", "da"] },
      { word: "play", distractors: ["plea", "ply", "plow"] },
      { word: "name", distractors: ["gnam", "nem", "norm"] },
      { word: "game", distractors: ["gem", "gam", "goom"] },
    ],
  },
  {
    phoneme: "aɪ",
    example: "time, like, night",
    words: [
      { word: "time", distractors: ["tim", "tame", "tom"] },
      { word: "like", distractors: ["lick", "lack", "look"] },
      { word: "bike", distractors: ["bick", "back", "book"] },
      { word: "light", distractors: ["lit", "lat", "lot"] },
      { word: "night", distractors: ["nit", "knat", "not"] },
      { word: "ride", distractors: ["rid", "red", "rod"] },
      { word: "find", distractors: ["fined", "fond", "fund"] },
      { word: "mind", distractors: ["mint", "mend", "mond"] },
    ],
  },
  {
    phoneme: "iː",
    example: "see, tree, sheep",
    words: [
      { word: "see", distractors: ["say", "sigh", "sue"] },
      { word: "tree", distractors: ["tray", "try", "true"] },
      { word: "green", distractors: ["gren", "grin", "grain"] },
      { word: "three", distractors: ["thray", "through", "threw"] },
      { word: "eat", distractors: ["at", "it", "et"] },
      { word: "meal", distractors: ["mill", "mall", "mole"] },
      { word: "sheep", distractors: ["ship", "shop", "shape"] },
      { word: "deep", distractors: ["dip", "dop", "dap"] },
    ],
  },
  {
    phoneme: "uː",
    example: "food, moon, blue",
    words: [
      { word: "food", distractors: ["fond", "fund", "fed"] },
      { word: "moon", distractors: ["mun", "mon", "men"] },
      { word: "blue", distractors: ["blow", "blah", "blew"] },
      { word: "shoe", distractors: ["show", "shaw", "she"] },
      { word: "true", distractors: ["trough", "tray", "tree"] },
      { word: "room", distractors: ["rum", "rom", "ram"] },
      { word: "soon", distractors: ["sun", "son", "sin"] },
      { word: "cool", distractors: ["cull", "call", "coll"] },
    ],
  },
  {
    phoneme: "ɑː",
    example: "car, far, park",
    words: [
      { word: "car", distractors: ["cur", "core", "care"] },
      { word: "far", distractors: ["fur", "for", "fair"] },
      { word: "hard", distractors: ["herd", "hoard", "heard"] },
      { word: "park", distractors: ["perk", "pork", "pick"] },
      { word: "dark", distractors: ["derk", "dork", "dirk"] },
      { word: "arm", distractors: ["erm", "orm", "um"] },
      { word: "farm", distractors: ["firm", "form", "fem"] },
      { word: "star", distractors: ["stir", "store", "stare"] },
    ],
  },
  {
    phoneme: "ɔː",
    example: "law, saw, call",
    words: [
      { word: "law", distractors: ["low", "lie", "lee"] },
      { word: "saw", distractors: ["so", "sow", "sue"] },
      { word: "call", distractors: ["cull", "cell", "coll"] },
      { word: "ball", distractors: ["bell", "bull", "bill"] },
      { word: "fall", distractors: ["fell", "full", "fill"] },
      { word: "talk", distractors: ["tock", "tick", "took"] },
      { word: "walk", distractors: ["work", "wok", "wake"] },
      { word: "more", distractors: ["mere", "mire", "moor"] },
    ],
  },
  {
    phoneme: "ʌ",
    example: "cup, but, sun",
    words: [
      { word: "cup", distractors: ["cap", "cop", "cope"] },
      { word: "but", distractors: ["bat", "bot", "bet"] },
      { word: "love", distractors: ["laugh", "loaf", "leave"] },
      { word: "come", distractors: ["comb", "calm", "cam"] },
      { word: "sun", distractors: ["son", "sin", "soon"] },
      { word: "run", distractors: ["ran", "rein", "rone"] },
      { word: "fun", distractors: ["fan", "fin", "fone"] },
      { word: "jump", distractors: ["jamp", "jomp", "jeump"] },
    ],
  },
  {
    phoneme: "ə",
    example: "about, sofa, today",
    words: [
      { word: "about", distractors: ["abate", "abbot", "abeam"] },
      { word: "sofa", distractors: ["soda", "sofa-bed", "sopra"] },
      { word: "pencil", distractors: ["pensil", "pencel", "pensile"] },
      { word: "around", distractors: ["arond", "arund", "arind"] },
      { word: "today", distractors: ["toe-day", "tiday", "taday"] },
      { word: "away", distractors: ["owi", "iway", "awey"] },
      { word: "open", distractors: ["opin", "opun", "opan"] },
      { word: "taken", distractors: ["takun", "takon", "takin"] },
    ],
  },
  {
    phoneme: "ʃ",
    example: "she, ship, fish",
    words: [
      { word: "she", distractors: ["see", "say", "sigh"] },
      { word: "ship", distractors: ["sip", "tip", "chip"] },
      { word: "fish", distractors: ["fiss", "fit", "fitch"] },
      { word: "wish", distractors: ["wiss", "wit", "wich"] },
      { word: "push", distractors: ["put", "puss", "putch"] },
      { word: "wash", distractors: ["watch", "watt", "wass"] },
      { word: "sharp", distractors: ["sarp", "tarp", "harp"] },
      { word: "sheep", distractors: ["seep", "sap", "sop"] },
    ],
  },
];

// Total rounds per drill session.
export const DRILL_ROUNDS_TOTAL = 10;

// Combo multiplier ladder (keyed by current streak length).
export function comboMultiplier(streak: number): 1 | 2 | 3 | 5 {
  if (streak >= 10) return 5;
  if (streak >= 6) return 3;
  if (streak >= 3) return 2;
  return 1;
}

// Combo "level" — used for XP calc (5 XP per level reached).
// Level 1 = ×1, Level 2 = ×2, Level 3 = ×3, Level 4 = ×5.
export function comboLevel(multiplier: 1 | 2 | 3 | 5): number {
  if (multiplier === 5) return 4;
  if (multiplier === 3) return 3;
  if (multiplier === 2) return 2;
  return 1;
}

// Mastery color thresholds (per drill spec): red <60, amber 60-80, green >80.
export type MasteryTier = "untracked" | "low" | "mid" | "high";

export interface MasteryInfo {
  score: number | null; // 0-100 or null when untracked
  tier: MasteryTier;
  color: string; // hex
  label: string;
}

export function masteryTierFromScore(score: number | null): MasteryInfo {
  if (score === null) {
    return { score: null, tier: "untracked", color: "#6b7280", label: "Untracked" };
  }
  if (score >= 80) {
    return { score, tier: "high", color: "#10b981", label: "Mastered" };
  }
  if (score >= 60) {
    return { score, tier: "mid", color: "#f59e0b", label: "Progressing" };
  }
  return { score, tier: "low", color: "#ef4444", label: "Needs work" };
}

export interface LessonProgressLite {
  completed: boolean;
  score: number;
}

/**
 * Derive the user's mastery score for a single phoneme, given a lessons map.
 * Returns null when no relevant lessons have been completed.
 */
export function deriveMastery(
  phoneme: string,
  lessons: Record<string, LessonProgressLite | undefined>
): number | null {
  const meta = PHONEME_LESSONS[phoneme];
  if (!meta) return null;
  const relevant = meta.ids
    .map((id) => lessons[id])
    .filter((l): l is LessonProgressLite => !!l?.completed);
  if (relevant.length === 0) return null;
  const sum = relevant.reduce((s, l) => s + l.score, 0);
  return Math.round(sum / relevant.length);
}
