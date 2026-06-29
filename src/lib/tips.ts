// Pronunciation tips — genuine, actionable insights across all categories.
// Used by the Dashboard "Tip of the Day" feature.

export type TipCategory =
  | "vowel"
  | "consonant"
  | "rhythm"
  | "intonation"
  | "linking"
  | "general";

export interface Tip {
  emoji: string;
  title: string;
  body: string;
  category: TipCategory;
}

export const CATEGORY_COLORS: Record<TipCategory, string> = {
  vowel: "#6366f1",
  consonant: "#8b5cf6",
  rhythm: "#ec4899",
  intonation: "#f59e0b",
  linking: "#22d3ee",
  general: "#10b981",
};

export const TIPS: Tip[] = [
  // ── Vowels ──────────────────────────────────────────────────────────────
  {
    emoji: "👅",
    title: "Tongue Position",
    body: "For /θ/, place your tongue tip lightly between your upper and lower teeth. Don't bite down — just rest it there.",
    category: "consonant",
  },
  {
    emoji: "🎵",
    title: "Stress Matters",
    body: "In English, unstressed syllables reduce to schwa /ə/. 'Photograph' becomes /ˈfoʊtəɡræf/ — the second 'o' disappears.",
    category: "rhythm",
  },
  {
    emoji: "🔗",
    title: "Link Words",
    body: "Native speakers link consonant-to-vowel: 'an apple' sounds like 'a-napple'. Practice flowing words together.",
    category: "linking",
  },
  {
    emoji: "😮",
    title: "Open for /æ/",
    body: "The /æ/ in 'cat' needs a wide jaw drop. Smile slightly and lower your jaw more than you would in your native language.",
    category: "vowel",
  },
  {
    emoji: "🌊",
    title: "The Schwa /ə/",
    body: "The most common English vowel is the schwa /ə/ — a relaxed, neutral sound. Master it and your speech will sound instantly more native.",
    category: "vowel",
  },
  {
    emoji: "🫧",
    title: "Round for /uː/",
    body: "For /uː/ as in 'food', round your lips tightly forward. The tongue is high and back. Avoid spreading your lips.",
    category: "vowel",
  },
  {
    emoji: "🌀",
    title: "Diphthong Glide",
    body: "Diphthongs like /eɪ/ in 'day' glide from one vowel to another. Don't hold the first sound — let it move.",
    category: "vowel",
  },
  {
    emoji: "🪞",
    title: "Mirror Practice",
    body: "Watch your mouth in a mirror while practicing. If your lips aren't moving much, you're probably not articulating English vowels clearly.",
    category: "general",
  },
  // ── Consonants ──────────────────────────────────────────────────────────
  {
    emoji: "🌬️",
    title: "Aspirated Stops",
    body: "Initial /p/, /t/, /k/ in English are aspirated — a puff of air follows. Hold a tissue in front of your mouth; it should flutter.",
    category: "consonant",
  },
  {
    emoji: "🦷",
    title: "Voiced vs Voiceless",
    body: "Touch your throat while saying /s/ then /z/. The buzz you feel on /z/ is voicing. Same mouth shape, different vibration.",
    category: "consonant",
  },
  {
    emoji: "💧",
    title: "Light /l/ vs Dark /l/",
    body: "Word-final /l/ (like in 'ball') is 'dark' — the back of your tongue rises. Word-initial /l/ (like in 'light') is 'light' and clear.",
    category: "consonant",
  },
  {
    emoji: "🎵",
    title: "Tap that /t/",
    body: "In American English, /t/ between vowels becomes a quick flap /ɾ/. 'Water' sounds like 'wah-der'. Let your tongue tap once.",
    category: "consonant",
  },
  {
    emoji: "👃",
    title: "Nasal Release",
    body: "For /m/, /n/, /ŋ/, air exits through your nose. Hold the sound and feel the vibration in your nasal cavity.",
    category: "consonant",
  },
  {
    emoji: "🎯",
    title: "Final Consonant",
    body: "Don't drop word-final consonants! 'Cat' is not 'ca'. Lightly touch the final /t/ — release a tiny puff of air.",
    category: "consonant",
  },
  // ── Rhythm ──────────────────────────────────────────────────────────────
  {
    emoji: "🥁",
    title: "Stress-Timed",
    body: "English is stress-timed. Stressed syllables come at regular intervals — the unstressed ones compress to fit. Practice with a metronome.",
    category: "rhythm",
  },
  {
    emoji: "📈",
    title: "Lengthen Stressed",
    body: "Stressed syllables are longer, louder, and higher in pitch. Exaggerate the length: say 'im-POR-tant' with a long 'POR'.",
    category: "rhythm",
  },
  {
    emoji: "⏱️",
    title: "Compress Unstressed",
    body: "Unstressed syllables should be quick and reduced. 'Banana' → 'buh-NAH-nuh'. Don't give every syllable equal time.",
    category: "rhythm",
  },
  {
    emoji: "🎬",
    title: "Noun + Verb Stress",
    body: "Many word pairs shift stress with function: 're-CORD' (verb) vs 'REC-ord' (noun). Stress the second syllable for verbs.",
    category: "rhythm",
  },
  {
    emoji: "🌊",
    title: "Content vs Function",
    body: "Stress content words (nouns, verbs, adjectives). Reduce function words (the, a, of, to). This creates the natural English wave.",
    category: "rhythm",
  },
  // ── Intonation ──────────────────────────────────────────────────────────
  {
    emoji: "📉",
    title: "Falling Statements",
    body: "Statements end with falling pitch. The voice drops on the last stressed word: 'I'm going HOME ↘'.",
    category: "intonation",
  },
  {
    emoji: "📈",
    title: "Rising Questions",
    body: "Yes/no questions rise at the end: 'Are you ready ↗?'. Wh- questions fall: 'Where are you ↘?'. Listen for the difference.",
    category: "intonation",
  },
  {
    emoji: "🎭",
    title: "List Intonation",
    body: "In lists, rise on each item except the last: 'apples ↗, bananas ↗, and cherries ↘'. This signals 'more to come'.",
    category: "intonation",
  },
  {
    emoji: "💡",
    title: "Pitch for Emphasis",
    body: "Raise pitch on the word you want to emphasize. 'I didn't say HE stole it' vs 'I didn't say he STOLE it' — meaning changes entirely.",
    category: "intonation",
  },
  {
    emoji: "🎯",
    title: "Tag Question Tones",
    body: "Tag questions can rise (real question) or fall (expecting agreement). 'It's cold, isn't it ↗?' vs 'It's cold, isn't it ↘.'",
    category: "intonation",
  },
  {
    emoji: "🌈",
    title: "Range & Expression",
    body: "Native speakers use a wide pitch range. Don't speak in a flat monotone — let your voice rise and fall to express emotion.",
    category: "intonation",
  },
  // ── Linking / Connected Speech ──────────────────────────────────────────
  {
    emoji: "🪄",
    title: "Consonant-to-Vowel",
    body: "When a word ends in a consonant and the next starts with a vowel, link them: 'an apple' → 'a-napple', 'stop it' → 'sto-pit'.",
    category: "linking",
  },
  {
    emoji: "🌊",
    title: "Smooth Vowel-to-Vowel",
    body: "Link vowels across words with a tiny /j/ or /w/: 'see it' → 'see-yit', 'do it' → 'do-wit'. Your tongue glides smoothly.",
    category: "linking",
  },
  {
    emoji: "🤝",
    title: "Same Consonant Merge",
    body: "When the same consonant ends one word and starts the next, merge into one longer sound: 'bad dog' → 'ba-ddog'.",
    category: "linking",
  },
  {
    emoji: "💨",
    title: "Elision",
    body: "Native speakers drop sounds in fast speech: 'next door' → 'nex door', 'give me' → 'gimme'. Don't pronounce every letter.",
    category: "linking",
  },
  {
    emoji: "🔀",
    title: "Assimilation",
    body: "Sounds change next to each other: /t/ + /j/ → /tʃ/ ('got you' → 'gotcha'), /d/ + /j/ → /dʒ/ ('did you' → 'didja').",
    category: "linking",
  },
  // ── General ─────────────────────────────────────────────────────────────
  {
    emoji: "🐌",
    title: "Slow Down First",
    body: "Practice new sounds slowly and accurately before speeding up. Speed comes from muscle memory, not rushing.",
    category: "general",
  },
  {
    emoji: "👂",
    title: "Listen Actively",
    body: "Spend 10 minutes a day listening to native speakers and shadowing (repeating immediately after them). Train your ear first.",
    category: "general",
  },
  {
    emoji: "🎙️",
    title: "Record Yourself",
    body: "Record yourself speaking, then compare to a native speaker. You can't fix what you can't hear — recording reveals the gap.",
    category: "general",
  },
  {
    emoji: "📖",
    title: "Learn the IPA",
    body: "Mastering the International Phonetic Alphabet unlocks accurate pronunciation from any dictionary. It's a one-time investment.",
    category: "general",
  },
  {
    emoji: "🔥",
    title: "Daily Micro-Practice",
    body: "Five minutes every day beats an hour once a week. Consistency builds the muscle memory your mouth needs for new sounds.",
    category: "general",
  },
  {
    emoji: "🌍",
    title: "Pick One Accent",
    body: "Choose US or UK and stick with it while learning. Mixing accents creates confusion and slows mastery of either.",
    category: "general",
  },
];

/**
 * Deterministic "Tip of the Day" — same tip all day, rotates at midnight.
 * Uses day-of-year so the selection is stable across reloads within a day.
 */
export function getTipOfDay(): Tip {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000
  );
  return TIPS[dayOfYear % TIPS.length];
}
