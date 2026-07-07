import type { Lesson } from "../../types";

// Phase 3 — Lesson 3: Rhythm Patterns
// English is stress-timed: stressed syllables fall at regular intervals,
// and unstressed syllables compress to fit. This is what makes English
// sound like English, and not French, Spanish, or Japanese.

const lesson: Lesson = {
  id: "p3l3",
  phaseId: 2,
  lessonIndex: 2,
  title: "Rhythm Patterns",
  subtitle: "The beat that makes English sound English",
  duration: 10,
  xp: 150,
  objectives: [
    "Understand the difference between stress-timed and syllable-timed languages",
    "Identify content words (stressed) vs function words (reduced)",
    "Compress unstressed syllables into schwa /ə/",
    "Produce the equal-spacing beat of native English rhythm",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Rhythm Patterns",
      subtitle: "The pulse of English",
      description:
        "English doesn't treat every syllable equally. It has a heartbeat — strong beats spaced evenly, with weak syllables squeezed between them. This stress-timed rhythm is the single biggest difference between a learner accent and a native one.",
      visual: "rhythm",
      emoji: "🥁",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Stress-Timed vs Syllable-Timed",
      body: [
        "In syllable-timed languages (Spanish, French, Japanese, Korean), every syllable takes roughly the same time. The rhythm comes from counting syllables.",
        "In stress-timed languages (English, German, Russian, Arabic), stressed syllables arrive at regular time intervals — regardless of how many unstressed syllables squeeze between them. More unstressed syllables? They get faster. Fewer? They stretch out.",
        "This is why 'CAT sat on the MAT' and 'the ELEphant sat on the MATtress' take about the same time to say. The stressed beats (CAT, MAT / ELE, MAT) are equally spaced.",
      ],
      bulletPoints: [
        "Stress-timed: English, German, Dutch, Russian, Arabic",
        "Syllable-timed: Spanish, French, Italian, Japanese, Korean",
        "Mora-timed: Japanese (a third category, syllable-weight based)",
        "If your native language is syllable-timed, English rhythm will feel unnatural at first",
      ],
      visual: "rhythm",
      visualLabel: "Stressed beats stay evenly spaced; weak syllables compress",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Content Words vs Function Words",
      body: [
        "English decides what to stress by word type. Content words carry meaning — they get stressed. Function words carry grammar — they get compressed into weak forms (usually schwa /ə/).",
        "If you stress a function word, you sound emphatic or surprised. 'I AM going' (stressed 'am') means something different from 'I'm going.' Native speakers stress function words only on purpose.",
      ],
      bulletPoints: [
        "Content words (STRESSED): nouns, main verbs, adjectives, adverbs, question words",
        "Function words (REDUCED): articles, pronouns, prepositions, conjunctions, auxiliary verbs",
        "Stressed syllable = longer, louder, higher pitch, full vowel",
        "Unstressed syllable = shorter, softer, lower pitch, often /ə/ (schwa)",
      ],
      visual: "stress-bars",
      visualLabel: "Stress falls on the words that carry meaning",
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "The Equal-Beat Pattern",
      phrase: "The CAT sat ON the MAT.",
      beats: [
        { text: "The", duration: 1, stressed: false },
        { text: "CAT", duration: 2, stressed: true },
        { text: "sat", duration: 1, stressed: false },
        { text: "on", duration: 1, stressed: false },
        { text: "the", duration: 1, stressed: false },
        { text: "MAT", duration: 2, stressed: true },
      ],
      description:
        "Two stressed beats (CAT, MAT) fall at regular intervals. The function words 'The, on, the' compress between them. Tap your finger in time with CAT and MAT — that steady beat is the heartbeat of English.",
    },
    {
      id: "rhythm-2",
      type: "rhythm",
      title: "Same Beat, More Syllables",
      phrase: "The ELEphant sat on the MATtress.",
      beats: [
        { text: "The", duration: 1, stressed: false },
        { text: "ELE", duration: 2, stressed: true },
        { text: "phant", duration: 1, stressed: false },
        { text: "sat", duration: 1, stressed: false },
        { text: "on", duration: 1, stressed: false },
        { text: "the", duration: 1, stressed: false },
        { text: "MAT", duration: 2, stressed: true },
        { text: "tress", duration: 1, stressed: false },
      ],
      description:
        "Same two beats (ELE, MAT) — but now there are more unstressed syllables between them. They squeeze in faster to keep the beat. Both sentences take almost the same time. This is stress-timing in action.",
    },
    {
      id: "example-1",
      type: "example",
      title: "Hear the Schwa Machine",
      phrase: "I'm going to the store to buy some milk",
      ipa: "/aɪm ˈɡoʊənə ðə ˈstɔːr tə ˈbaɪ səm ˈmɪlk/",
      highlightWords: ["going", "store", "buy", "milk"],
      tip: "Only four words carry stress: GOing, STORE, BUY, MILK. Everything else compresses: 'to the' → /təðə/, 'to' → /tə/, 'some' → /səm/. The schwa /ə/ is the most common vowel in English because of this rhythm.",
      tapWords: [
        { word: "going to", ipa: "/ˈɡoʊənə/" },
        { word: "to the", ipa: "/təðə/" },
        { word: "store to", ipa: "/ˈstɔːrtə/" },
        { word: "some milk", ipa: "/səmˈmɪlk/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Strong vs Weak",
      description:
        "Each word shows the strong (stressed) form first, then the weak (reduced) form. Notice how vowels change to /ə/ in the weak form.",
      words: [
        { word: "CAN (strong)", ipa: "/kæn/", meaning: "stressed — 'Yes I CAN'" },
        { word: "can (weak)", ipa: "/kən/", meaning: "reduced — 'I can go'" },
        { word: "TO (strong)", ipa: "/tuː/", meaning: "stressed — 'Where TO?'" },
        { word: "to (weak)", ipa: "/tə/", meaning: "reduced — 'go to school'" },
        { word: "FOR (strong)", ipa: "/fɔːr/", meaning: "stressed — 'What FOR?'" },
        { word: "for (weak)", ipa: "/fər/", meaning: "reduced — 'for you'" },
        { word: "AND (strong)", ipa: "/ænd/", meaning: "stressed — 'AND?'" },
        { word: "and (weak)", ipa: "/ən/", meaning: "reduced — 'bread and butter'" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Finger Tap",
      body: "Tap your finger on a table in a steady beat — once per second. Each tap is a stressed syllable. Now say a sentence and make sure each stressed word lands exactly on a tap. Squeeze the unstressed words between taps as fast as needed. This physical anchor is the fastest way to internalize English rhythm.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Find the Beat",
      phrase: "She wanted to remember his telephone number",
      ipa: "/ʃiː ˈwɒntɪd tə rɪˈmɛmbər hɪz ˈtɛləfoʊn ˈnʌmbər/",
      tip: "Stress falls on WANT, MEM, PHONE, NUM. The rest compress. Tap your finger on those four words in equal time — that's the heartbeat. Everything else squeezes in.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "In the sentence 'The dog ran quickly across the field,' which words should be STRESSED?",
      options: [
        "The, dog, ran, quickly, across, the, field (all words equally)",
        "The, across, the (function words only)",
        "dog, ran, quickly, field (content words)",
        "dog, field (only the nouns)",
      ],
      correct: 2,
      explanation:
        "Content words — nouns (dog, field), main verbs (ran), adverbs (quickly) — carry meaning and get stressed. Function words (the, across, the) reduce to weak forms. Adjectives and adverbs count as content words because they add specific meaning, so 'quickly' is stressed too.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Rhythm Patterns Complete!",
      subtitle: "You can now feel the heartbeat of English and compress unstressed syllables like a native.",
      xp: 150,
      badge: "🥁 Beat Keeper",
      nextLessonTitle: "Chunking Speech",
    },
  ],
};

export default lesson;
