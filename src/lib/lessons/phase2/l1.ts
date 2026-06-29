import type { Lesson } from "../../types";

// Phase 2 — Lesson 1: 100 Core Words
// The 100 most common English words cover ~50% of all speech. Most are
// function words (the, of, and, to, a). They almost never get their
// 'dictionary' pronunciation in real speech — they reduce to schwa. Master
// these and you instantly sound more native than 90% of learners.

const lesson: Lesson = {
  id: "p2l1",
  phaseId: 1,
  lessonIndex: 0,
  title: "100 Core Words",
  subtitle: "The 100 words that make up half of all English speech",
  duration: 9,
  xp: 130,
  objectives: [
    "Recognize and produce the strong (citation) form of the 8 most frequent English words",
    "Reduce function words to schwa /ə/ in connected speech",
    "Link function words naturally to the content words that follow them",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "100 Core Words",
      subtitle: "Half of every English sentence",
      description:
        "Just 100 words make up roughly 50% of everything spoken in English. Eight of them — the, of, and, to, a, in, that, have — appear in almost every sentence. These words have two forms: a 'strong' citation form for emphasis, and a 'weak' reduced form for everyday speech. Using the wrong form is the single biggest tell of a non-native accent.",
      visual: "phoneme-grid",
      emoji: "📖",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Function vs Content Words",
      body: [
        "English splits its words into two classes. CONTENT words (nouns, verbs, adjectives, adverbs) carry meaning and get stressed. FUNCTION words (articles, prepositions, pronouns, auxiliaries) carry grammar and usually reduce.",
        "When a function word is unstressed — which is most of the time — its vowel collapses to /ə/ (schwa) or /ɪ/. The word 'of' /ʌv/ becomes /əv/. The word 'to' /tuː/ becomes /tə/. The word 'and' /ænd/ becomes /ən/ or even just /n/.",
        "Learners who pronounce every word in its strong form sound choppy, robotic, and slow. Native speech is a stream of reduced function words punctuated by clear content words.",
      ],
      bulletPoints: [
        "CONTENT words: nouns, verbs, adjectives, adverbs — keep full vowel, get stressed",
        "FUNCTION words: articles, prepositions, pronouns, auxiliaries — reduce to schwa",
        "Strong form: used for emphasis, isolation, or before a pause",
        "Weak form: used everywhere else — the default in connected speech",
      ],
      visual: "phoneme-grid",
      visualLabel: "The 8 most frequent English words",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "The Schwa Rule",
      body: [
        "The schwa /ə/ is the most common vowel in English — about one in every three vowel sounds is a schwa. It's a neutral, mid-central vowel with the tongue completely relaxed.",
        "Any unstressed vowel in English can become schwa. 'About' /əˈbaʊt/, 'today' /təˈdeɪ/, 'photograph' /ˈfoʊtəɡræf/ — the unstressed syllables all collapse to /ə/.",
        "Once you accept that 'the' has two pronunciations (/ðiː/ before vowels, /ðə/ before consonants) and 'a' is almost always /ə/, your speech immediately sounds 50% more native.",
      ],
      bulletPoints: [
        "/ðə/ — the (before consonants): the cat",
        "/ðiː/ — the (before vowels): the apple",
        "/ə/ — a, an (always weak)",
        "/əv/ — of (always weak, never /ʌv/ in speech)",
        "/tə/ — to (before consonants): to sleep",
        "/tuː/ — to (before vowels): to eat",
        "/ən/ or /n/ — and in fast speech",
      ],
      visual: "wave",
      visualLabel: "Waveform: 'the cat' (weak) vs 'THE cat' (strong)",
    },
    {
      id: "example-1",
      type: "example",
      title: "The Same Sentence, Two Ways",
      phrase: "I have to go to the store and get a cup of coffee",
      ipa: "/aɪ hæv tə ɡoʊ tə ðə stɔːr ən ɡɛt ə kʌp əv kɑːfi/",
      highlightWords: ["have", "go", "store", "get", "cup", "coffee"],
      tip: "Notice that every highlighted word is a content word — it keeps its full vowel. Every other word is a function word that reduces to schwa /ə/. That's the rhythm of native English.",
      tapWords: [
        { word: "to", ipa: "/tə/" },
        { word: "the", ipa: "/ðə/" },
        { word: "and", ipa: "/ən/" },
        { word: "a", ipa: "/ə/" },
        { word: "of", ipa: "/əv/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "The Big 8 in Strong Form",
      description: "Tap each word to hear its strong (citation) form — used only for emphasis or before a pause.",
      words: [
        { word: "the", ipa: "/ðiː/", meaning: "strong / before vowel" },
        { word: "of", ipa: "/ʌv/", meaning: "strong (emphasis only)" },
        { word: "and", ipa: "/ænd/", meaning: "strong (emphasis only)" },
        { word: "to", ipa: "/tuː/", meaning: "strong / before vowel" },
        { word: "a", ipa: "/eɪ/", meaning: "strong (naming the letter)" },
        { word: "in", ipa: "/ɪn/", meaning: "strong (emphasis only)" },
        { word: "that", ipa: "/ðæt/", meaning: "strong / demonstrative" },
        { word: "have", ipa: "/hæv/", meaning: "strong (emphasis only)" },
      ],
    },
    {
      id: "linking-1",
      type: "linking",
      title: "How Function Words Link",
      description: "Function words almost always link to the next word. Consonant-ending function words glide straight into vowel-starting content words; vowel-ending function words get a connecting /j/ or /w/.",
      words: ["an", "apple", "the", "end", "to", "eat", "go", "out"],
      links: [
        { from: 0, to: 1, type: "consonant-vowel" },
        { from: 2, to: 3, type: "consonant-vowel" },
        { from: 4, to: 5, type: "consonant-vowel" },
        { from: 6, to: 7, type: "vowel-vowel" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Rubber Band",
      body: "Imagine a rubber band stretched between content words. The content words are the anchors — they get full vowels, full length, full stress. Between them, the function words compress like a snapped rubber band: short, schwa-filled, almost mumbled. Practice by over-exaggerating: stretch the content words to 3x their normal length and squeeze the function words to nothing. Then dial back to natural speech. The contrast will stick.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "He said that he had to take a look at the book",
      ipa: "/hiː sɛd ðət hiː hæd tə teɪk ə lʊk ət ðə bʊk/",
      tip: "Five function words reduce: that, to, a, at, the. Three content words anchor: said, take, look, book. Feel the rubber band stretch and snap.",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "In fast native speech, the sentence 'I am going to get a cup of tea' contains how many schwa /ə/ sounds in the function words?",
      options: ["2 — in 'a' and 'of'", "3 — in 'am', 'a', and 'of'", "4 — in 'am', 'to', 'a', and 'of'", "5 — in 'I', 'am', 'to', 'a', and 'of'"],
      correct: 2,
      explanation:
        "Four function words reduce to schwa: 'am' /əm/, 'to' /tə/, 'a' /ə/, and 'of' /əv/. The pronoun 'I' /aɪ/ is a content word (it carries the meaning) and keeps its full vowel. The verb 'going' /ˈɡoʊɪŋ/ keeps its strong form because it's the main verb.",
    },
    {
      id: "completion",
      type: "completion",
      title: "100 Core Words Complete!",
      subtitle: "You can now reduce function words like a native. Half of every English sentence just got easier.",
      xp: 130,
      badge: "📖 Word Warrior",
      nextLessonTitle: "Syllable Stress Rules",
    },
  ],
};

export default lesson;
