// ─── Pronunciation Challenge Data ─────────────────────────────────────
// Minimal pairs, stress words, and discrimination pairs for the
// Pronunciation Challenge game mode.

export type ChallengeType = "minimal-pair" | "speed-stress" | "sound-discrimination";

export interface MinimalPair {
  word1: string;
  word2: string;
  ipa1: string;
  ipa2: string;
  phoneme1: string;
  phoneme2: string;
  category: string;
}

export interface StressWord {
  word: string;
  ipa: string;
  syllables: string[];
  stressedIndex: number; // 0-based index of stressed syllable
}

export interface DiscriminationPair {
  word1: string;
  word2: string;
  ipa1: string;
  ipa2: string;
  same: boolean; // true if the two words are the same phonetically
  category: string;
}

// ─── Minimal Pairs (7 categories × 3 pairs = 21) ────────────────────────

export const MINIMAL_PAIRS: MinimalPair[] = [
  // /θ/ vs /s/
  { word1: "think", word2: "sink", ipa1: "/θɪŋk/", ipa2: "/sɪŋk/", phoneme1: "θ", phoneme2: "s", category: "θ vs s" },
  { word1: "three", word2: "see", ipa1: "/θriː/", ipa2: "/siː/", phoneme1: "θ", phoneme2: "s", category: "θ vs s" },
  { word1: "thick", word2: "sick", ipa1: "/θɪk/", ipa2: "/sɪk/", phoneme1: "θ", phoneme2: "s", category: "θ vs s" },

  // /ð/ vs /d/
  { word1: "they", word2: "day", ipa1: "/ðeɪ/", ipa2: "/deɪ/", phoneme1: "ð", phoneme2: "d", category: "ð vs d" },
  { word1: "this", word2: "diss", ipa1: "/ðɪs/", ipa2: "/dɪs/", phoneme1: "ð", phoneme2: "d", category: "ð vs d" },
  { word1: "there", word2: "dare", ipa1: "/ðɛr/", ipa2: "/dɛr/", phoneme1: "ð", phoneme2: "d", category: "ð vs d" },

  // /æ/ vs /e/
  { word1: "bat", word2: "bet", ipa1: "/bæt/", ipa2: "/bɛt/", phoneme1: "æ", phoneme2: "ɛ", category: "æ vs ɛ" },
  { word1: "cat", word2: "kettle", ipa1: "/kæt/", ipa2: "/ˈkɛtl/", phoneme1: "æ", phoneme2: "ɛ", category: "æ vs ɛ" },
  { word1: "sat", word2: "set", ipa1: "/sæt/", ipa2: "/sɛt/", phoneme1: "æ", phoneme2: "ɛ", category: "æ vs ɛ" },

  // /ɪ/ vs /iː/
  { word1: "sit", word2: "seat", ipa1: "/sɪt/", ipa2: "/siːt/", phoneme1: "ɪ", phoneme2: "iː", category: "ɪ vs iː" },
  { word1: "fill", word2: "feel", ipa1: "/fɪl/", ipa2: "/fiːl/", phoneme1: "ɪ", phoneme2: "iː", category: "ɪ vs iː" },
  { word1: "hit", word2: "heat", ipa1: "/hɪt/", ipa2: "/hiːt/", phoneme1: "ɪ", phoneme2: "iː", category: "ɪ vs iː" },

  // /ʃ/ vs /tʃ/
  { word1: "shoe", word2: "chew", ipa1: "/ʃuː/", ipa2: "/tʃuː/", phoneme1: "ʃ", phoneme2: "tʃ", category: "ʃ vs tʃ" },
  { word1: "share", word2: "chair", ipa1: "/ʃɛr/", ipa2: "/tʃɛr/", phoneme1: "ʃ", phoneme2: "tʃ", category: "ʃ vs tʃ" },
  { word1: "shop", word2: "chop", ipa1: "/ʃɑːp/", ipa2: "/tʃɑːp/", phoneme1: "ʃ", phoneme2: "tʃ", category: "ʃ vs tʃ" },

  // /v/ vs /w/
  { word1: "vet", word2: "wet", ipa1: "/vɛt/", ipa2: "/wɛt/", phoneme1: "v", phoneme2: "w", category: "v vs w" },
  { word1: "vine", word2: "wine", ipa1: "/vaɪn/", ipa2: "/waɪn/", phoneme1: "v", phoneme2: "w", category: "v vs w" },
  { word1: "vest", word2: "west", ipa1: "/vɛst/", ipa2: "/wɛst/", phoneme1: "v", phoneme2: "w", category: "v vs w" },

  // /l/ vs /r/
  { word1: "light", word2: "right", ipa1: "/laɪt/", ipa2: "/raɪt/", phoneme1: "l", phoneme2: "r", category: "l vs r" },
  { word1: "fly", word2: "fry", ipa1: "/flaɪ/", ipa2: "/fraɪ/", phoneme1: "l", phoneme2: "r", category: "l vs r" },
  { word1: "lead", word2: "read", ipa1: "/liːd/", ipa2: "/riːd/", phoneme1: "l", phoneme2: "r", category: "l vs r" },
];

// ─── Stress Words ─────────────────────────────────────────────────────────

export const STRESS_WORDS: StressWord[] = [
  { word: "photograph", ipa: "/ˈfoʊtəɡræf/", syllables: ["pho", "to", "graph"], stressedIndex: 0 },
  { word: "photography", ipa: "/fəˈtɑːɡrəfi/", syllables: ["pho", "tog", "ra", "phy"], stressedIndex: 1 },
  { word: "important", ipa: "/ɪmˈpɔːrtnt/", syllables: ["im", "por", "tant"], stressedIndex: 1 },
  { word: "beautiful", ipa: "/ˈbjuːtɪfl/", syllables: ["beau", "ti", "ful"], stressedIndex: 0 },
  { word: "information", ipa: "/ˌɪnfərˈmeɪʃn/", syllables: ["in", "for", "ma", "tion"], stressedIndex: 2 },
  { word: "understand", ipa: "/ˌʌndərˈstænd/", syllables: ["un", "der", "stand"], stressedIndex: 2 },
  { word: "comfortable", ipa: "/ˈkʌmftəbl/", syllables: ["com", "for", "ta", "ble"], stressedIndex: 0 },
  { word: "development", ipa: "/dɪˈvɛləpmənt/", syllables: ["de", "vel", "op", "ment"], stressedIndex: 1 },
  { word: "education", ipa: "/ˌɛdʒuˈkeɪʃn/", syllables: ["ed", "u", "ca", "tion"], stressedIndex: 2 },
  { word: "communication", ipa: "/kəˌmjuːnɪˈkeɪʃn/", syllables: ["com", "mu", "ni", "ca", "tion"], stressedIndex: 3 },
  { word: "technology", ipa: "/tɛkˈnɑːlədʒi/", syllables: ["tech", "nol", "o", "gy"], stressedIndex: 1 },
  { word: "environment", ipa: "/ɪnˈvaɪrənmənt/", syllables: ["en", "vi", "ron", "ment"], stressedIndex: 1 },
  { word: "experience", ipa: "/ɪkˈspɪriəns/", syllables: ["ex", "pe", "ri", "ence"], stressedIndex: 1 },
  { word: "refrigerator", ipa: "/rɪˈfrɪdʒəreɪtər/", syllables: ["re", "frig", "er", "a", "tor"], stressedIndex: 1 },
];

// ─── Discrimination Pairs ─────────────────────────────────────────────────

export const DISCRIMINATION_PAIRS: DiscriminationPair[] = [
  // Same
  { word1: "ship", word2: "ship", ipa1: "/ʃɪp/", ipa2: "/ʃɪp/", same: true, category: "same" },
  { word1: "cat", word2: "cat", ipa1: "/kæt/", ipa2: "/kæt/", same: true, category: "same" },
  { word1: "bed", word2: "bed", ipa1: "/bɛd/", ipa2: "/bɛd/", same: true, category: "same" },
  { word1: "light", word2: "light", ipa1: "/laɪt/", ipa2: "/laɪt/", same: true, category: "same" },
  { word1: "think", word2: "think", ipa1: "/θɪŋk/", ipa2: "/θɪŋk/", same: true, category: "same" },
  { word1: "vest", word2: "vest", ipa1: "/vɛst/", ipa2: "/vɛst/", same: true, category: "same" },
  { word1: "they", word2: "they", ipa1: "/ðeɪ/", ipa2: "/ðeɪ/", same: true, category: "same" },

  // Different — minimal pairs reused
  { word1: "ship", word2: "sheep", ipa1: "/ʃɪp/", ipa2: "/ʃiːp/", same: false, category: "ɪ vs iː" },
  { word1: "bat", word2: "bet", ipa1: "/bæt/", ipa2: "/bɛt/", same: false, category: "æ vs ɛ" },
  { word1: "think", word2: "sink", ipa1: "/θɪŋk/", ipa2: "/sɪŋk/", same: false, category: "θ vs s" },
  { word1: "they", word2: "day", ipa1: "/ðeɪ/", ipa2: "/deɪ/", same: false, category: "ð vs d" },
  { word1: "vet", word2: "wet", ipa1: "/vɛt/", ipa2: "/wɛt/", same: false, category: "v vs w" },
  { word1: "light", word2: "right", ipa1: "/laɪt/", ipa2: "/raɪt/", same: false, category: "l vs r" },
  { word1: "shoe", word2: "chew", ipa1: "/ʃuː/", ipa2: "/tʃuː/", same: false, category: "ʃ vs tʃ" },
  { word1: "sit", word2: "seat", ipa1: "/sɪt/", ipa2: "/siːt/", same: false, category: "ɪ vs iː" },
  { word1: "fill", word2: "feel", ipa1: "/fɪl/", ipa2: "/fiːl/", same: false, category: "ɪ vs iː" },
  { word1: "share", word2: "chair", ipa1: "/ʃɛr/", ipa2: "/tʃɛr/", same: false, category: "ʃ vs tʃ" },
  { word1: "vine", word2: "wine", ipa1: "/vaɪn/", ipa2: "/waɪn/", same: false, category: "v vs w" },
  { word1: "fly", word2: "fry", ipa1: "/flaɪ/", ipa2: "/fraɪ/", same: false, category: "l vs r" },
  { word1: "thick", word2: "sick", ipa1: "/θɪk/", ipa2: "/sɪk/", same: false, category: "θ vs s" },
];

// ─── Challenge Config ─────────────────────────────────────────────────────

export const CHALLENGE_CONFIG = {
  roundsPerGame: 10,
  timePerRound: 5, // seconds
  maxCombo: 4,
  basePoints: 10,
  timeBonusThreshold: 2, // seconds remaining to get time bonus
  timeBonusPoints: 5,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Shuffle an array (Fisher-Yates), returns a new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick N random items from an array */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Generate a round for minimal pair blitz */
export function generateMinimalPairRound() {
  const pair = MINIMAL_PAIRS[Math.floor(Math.random() * MINIMAL_PAIRS.length)];
  // Randomly decide which word to play
  const playWord1 = Math.random() < 0.5;
  const correctPhoneme = playWord1 ? pair.phoneme1 : pair.phoneme2;
  return {
    pair,
    playWord: playWord1 ? pair.word1 : pair.word2,
    playIpa: playWord1 ? pair.ipa1 : pair.ipa2,
    correctPhoneme,
    options: [
      { label: `/${pair.phoneme1}/`, value: pair.phoneme1, displayWord: pair.word1 },
      { label: `/${pair.phoneme2}/`, value: pair.phoneme2, displayWord: pair.word2 },
    ],
  };
}

/** Generate a round for speed stress */
export function generateStressRound() {
  const word = STRESS_WORDS[Math.floor(Math.random() * STRESS_WORDS.length)];
  return {
    word,
    options: word.syllables.map((syl, i) => ({
      label: syl,
      value: i,
      isStressed: i === word.stressedIndex,
    })),
  };
}

/** Generate a round for sound discrimination */
export function generateDiscriminationRound() {
  const pair = DISCRIMINATION_PAIRS[Math.floor(Math.random() * DISCRIMINATION_PAIRS.length)];
  return {
    pair,
    options: [
      { label: "Same", value: true },
      { label: "Different", value: false },
    ],
  };
}
