import type { Lesson } from "../../types";

// Phase 3 — Lesson 4: Chunking Speech
// Grouping words into meaning units, pausing at natural boundaries,
// breathing at the right places. This is what makes long sentences
// understandable — and what keeps speakers from running out of air.

const lesson: Lesson = {
  id: "p3l4",
  phaseId: 2,
  lessonIndex: 3,
  title: "Chunking Speech",
  subtitle: "Break long sentences into breath-sized pieces",
  duration: 9,
  xp: 145,
  objectives: [
    "Group words into meaning units (chunks) of 4-7 words",
    "Pause at syntactic boundaries (commas, conjunctions, clauses)",
    "Breathe at chunk boundaries, not in the middle of phrases",
    "Use chunking to make complex sentences easy to follow",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Chunking Speech",
      subtitle: "Bite-sized meaning",
      description:
        "Native speakers never say a long sentence in one breath. They break it into chunks — small groups of words — and pause briefly between them. Chunking makes you sound clear, calm, and in control, even with complex ideas.",
      visual: "rhythm",
      emoji: "✂️",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "What Is a Chunk?",
      body: [
        "A chunk is a group of words that belong together as a single meaning unit — usually 4 to 7 words. Within a chunk, words link smoothly with no pauses. Between chunks, you take a tiny break (50-200 milliseconds) and often a breath.",
        "Chunks follow syntax: a subject and verb form a chunk, a prepositional phrase is a chunk, a clause is a chunk. If you read punctuation marks as pause cues, you're already chunking correctly.",
      ],
      bulletPoints: [
        "Chunk by meaning, not by word count — a chunk = one idea",
        "Pause at commas, periods, dashes, and conjunctions (and, but, because)",
        "Pause between clauses (when X happened, Y occurred)",
        "Pause before and after long prepositional phrases",
        "A chunk should be short enough to say in one comfortable breath",
      ],
      visual: "rhythm",
      visualLabel: "Vertical bars mark chunk boundaries",
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "Chunked Sentence with Pauses",
      phrase: "After the meeting | we decided | to take a break | before lunch.",
      beats: [
        { text: "After", duration: 1, stressed: false },
        { text: "MEETing", duration: 2, stressed: true },
        { text: "⏸", duration: 2, stressed: false },
        { text: "we", duration: 1, stressed: false },
        { text: "deCIDed", duration: 2, stressed: true },
        { text: "⏸", duration: 2, stressed: false },
        { text: "to", duration: 1, stressed: false },
        { text: "take", duration: 1, stressed: false },
        { text: "a", duration: 1, stressed: false },
        { text: "BREAK", duration: 2, stressed: true },
        { text: "⏸", duration: 2, stressed: false },
        { text: "before", duration: 1, stressed: false },
        { text: "LUNCH", duration: 2, stressed: true },
      ],
      description:
        "Three pauses split the sentence into four chunks. Each chunk carries one idea: (1) when it happened, (2) who did what, (3) the action, (4) the time. Without pauses, listeners struggle to parse meaning. With pauses, it's effortless.",
    },
    {
      id: "rhythm-2",
      type: "rhythm",
      title: "Wrong vs Right Chunking",
      phrase: "Wrong: After the meeting we | decided to take | a break before lunch.",
      beats: [
        { text: "After", duration: 1, stressed: false },
        { text: "the", duration: 1, stressed: false },
        { text: "MEETing", duration: 2, stressed: true },
        { text: "we", duration: 1, stressed: false },
        { text: "⏸", duration: 2, stressed: false },
        { text: "deCIDed", duration: 2, stressed: true },
        { text: "to", duration: 1, stressed: false },
        { text: "take", duration: 1, stressed: false },
        { text: "⏸", duration: 2, stressed: false },
        { text: "a", duration: 1, stressed: false },
        { text: "BREAK", duration: 2, stressed: true },
        { text: "before", duration: 1, stressed: false },
        { text: "LUNCH", duration: 2, stressed: true },
      ],
      description:
        "Pausing in the middle of phrases ('meeting we' / 'a break before') splits meaning across chunks. Listeners have to work harder to reassemble the idea. Wrong chunking feels choppy and confusing.",
    },
    {
      id: "example-1",
      type: "example",
      title: "A Long Sentence, Properly Chunked",
      phrase: "Although it was raining, | we decided to walk home, | because the bus was late | and we were tired.",
      ipa: "/ɔːlˈðoʊ ɪt wəz ˈreɪnɪŋ | wiː dɪˈsaɪdɪd tə wɔːk hoʊm | bɪˈkəz ðə bʌs wəz leɪt | ənd wiː wər ˈtaɪərd/",
      highlightWords: ["raining", "walk", "home", "bus", "late", "tired"],
      tip: "Four chunks, each ending with a comma or conjunction. Each chunk is one clause — one complete mini-thought. Read it aloud, pausing briefly at each ' | '. Notice how easy it is to understand.",
      tapWords: [
        { word: "Although it was raining", ipa: "/ɔːlˈðoʊ ɪt wəz ˈreɪnɪŋ/" },
        { word: "we decided to walk home", ipa: "/wiː dɪˈsaɪdɪd tə wɔːk hoʊm/" },
        { word: "because the bus was late", ipa: "/bɪˈkəz ðə bʌs wəz leɪt/" },
        { word: "and we were tired", ipa: "/ənd wiː wər ˈtaɪərd/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Each Chunk",
      description:
        "Each item is a single chunk. Tap and notice the brief pause after each one — that's where you breathe and where listeners process.",
      words: [
        { word: "On my way home,", ipa: "/ɒn maɪ weɪ hoʊm/", meaning: "chunk 1 (intro)" },
        { word: "I stopped at the store", ipa: "/aɪ stɒpt ət ðə stɔːr/", meaning: "chunk 2 (action)" },
        { word: "to buy some milk.", ipa: "/tə baɪ səm mɪlk/", meaning: "chunk 3 (purpose)" },
        { word: "When I got there,", ipa: "/wɛn aɪ ɡɒt ðɛr/", meaning: "chunk 1 (time clause)" },
        { word: "it was already closed.", ipa: "/ɪt wəz ɔːlˈrɛdi kloʊzd/", meaning: "chunk 2 (result)" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Comma Breath",
      body: "Whenever you see a comma, period, dash, or conjunction (and, but, because, so), take a small breath — even if you don't need the air. This forces a natural pause and creates chunk boundaries automatically. You'll sound more deliberate and easier to follow. Run-on speech happens when you skip these breaths.",
      variant: "info",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Why Chunking Matters",
      body: [
        "Listeners process speech in real time. Their working memory holds about 4-7 words before needing a pause to digest. If you deliver 15 words without a break, they lose the beginning before they hear the end.",
        "Chunking isn't just about clarity — it's about authority. News anchors, politicians, and TED speakers chunk deliberately. The pause signals 'I know what I'm saying, and I want you to absorb each piece.'",
      ],
      bulletPoints: [
        "Working memory holds 4-7 words at a time — chunk accordingly",
        "Pauses let listeners catch up and predict what's next",
        "Pauses project confidence and authority",
        "Chunking gives you time to think about your next words",
        "Even native speakers who speak fast still chunk — they just chunk quickly",
      ],
      visual: "shadow",
      visualLabel: "Each chunk ends with a tiny reset",
    },
    {
      id: "practice",
      type: "practice",
      title: "Chunk a Complex Sentence",
      phrase: "When you get to the airport, | call me from the gate | so I know you're safe.",
      ipa: "/wɛn juː ɡɛt tə ði ˈɛrpɔːrt | kɔːl miː frəm ðə ɡeɪt | soʊ aɪ noʊ jʊər seɪf/",
      tip: "Three chunks. Pause briefly at each ' | '. Take a small breath at the comma and at 'so.' Don't rush — the pauses are part of the meaning.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Where is the BEST place to pause in this sentence: 'I went to the store to buy milk because we were out'?",
      options: [
        "After 'went' — I went / to the store to buy milk because we were out",
        "After 'store' and after 'milk' — I went to the store / to buy milk / because we were out",
        "After 'I' and after 'we' — I / went to the store to buy milk because we / were out",
        "No pause — say the whole sentence in one breath",
      ],
      correct: 1,
      explanation:
        "Pausing after 'store' and 'milk' breaks the sentence into three meaning chunks: (1) the action, (2) the purpose, (3) the reason. Each chunk is one clause. Pausing mid-phrase (like after 'went' or 'I') splits meaning awkwardly. Saying it in one breath exhausts the listener's working memory.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Chunking Speech Complete!",
      subtitle: "You can now break long sentences into clear, breath-sized chunks that listeners easily follow.",
      xp: 145,
      badge: "✂️ Chunk Master",
      nextLessonTitle: "Casual Greetings",
    },
  ],
};

export default lesson;
