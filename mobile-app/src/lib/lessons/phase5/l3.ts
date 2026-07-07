import type { Lesson } from "../../types";

// Phase 5 — Lesson 3: Elision & Assimilation
// Dropping sounds (elision) and merging sounds (assimilation): next door, got you → gotcha.
// 12 steps: intro, concept, concept, linking, example, tap-pronounce, mouth-diagram, tip, example, practice, quiz, completion.

const lesson: Lesson = {
  id: "p5l3",
  phaseId: 4,
  lessonIndex: 2,
  title: "Elision & Assimilation",
  subtitle: "When sounds disappear or merge — the chemistry of fast speech",
  duration: 11,
  xp: 160,
  objectives: [
    "Recognize elision: dropping sounds in consonant clusters (next door → /neks dɔːr/)",
    "Recognize assimilation: sounds merging (/t/ + /j/ → /tʃ/ in 'got you' → 'gotcha')",
    "Predict which sound changes occur at common word boundaries",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Elision & Assimilation",
      subtitle: "Sounds that vanish and sounds that fuse",
      description:
        "When speech speeds up, consonants at word boundaries do two things: they disappear (elision) or they morph into a new sound (assimilation). Both are predictable, rule-governed processes — not random sloppiness. Learn the rules and fast speech stops sounding like a wall of noise.",
      visual: "linking",
      emoji: "🔗",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Elision — Dropping Consonants",
      body: [
        "Elision is the loss of a sound that the spelling suggests should be there. It happens most often when three consonants meet across a word boundary — the middle one is dropped to keep the cluster pronounceable.",
        "It also happens with the /t/ or /d/ before another consonant at the end of a word, especially in fast speech. The tongue simply doesn't make the trip up to the alveolar ridge.",
      ],
      bulletPoints: [
        "next door → /neks dɔːr/ (the /t/ drops, /k/ stays)",
        "last time → /lɑːs taɪm/ (the /t/ drops)",
        "give me → /ɡɪmi/ 'gimme' (the /v/ drops)",
        "old man → /oʊl mæn/ (the /d/ drops before /m/)",
        "mostly → /ˈmoʊsli/ (the /t/ drops in the cluster /stl/)",
      ],
      visual: "linking",
      visualLabel: "Where sounds vanish",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Assimilation — Sounds That Fuse",
      body: [
        "Assimilation happens when two adjacent sounds influence each other and one (or both) changes to become more similar. The most famous case in English is the yod-coalescence: when /t/ or /d/ meets /j/ (often at 'you' /juː/), they fuse into /tʃ/ or /dʒ/.",
        "Voicing assimilation is the other big pattern: a voiced consonant becomes voiceless before a voiceless consonant ('have to' → 'hafta').",
      ],
      bulletPoints: [
        "/t/ + /j/ → /tʃ/: got you → gotcha /ˈɡɒtʃə/",
        "/d/ + /j/ → /dʒ/: did you → didja /ˈdɪdʒə/",
        "/s/ + /j/ → /ʃ/: miss you → miss ya /ˈmɪʃjə/",
        "/z/ + /j/ → /ʒ/: as you → 'azh ya' /æʒ jə/",
        "Voicing: have to → hafta, used to → /juːs tə/",
      ],
      visual: "phoneme-grid",
      visualLabel: "The four classic fusions",
    },
    {
      id: "linking-1",
      type: "linking",
      title: "Watch 'Got You' Become 'Gotcha'",
      words: ["I", "got", "you"],
      links: [
        { from: 1, to: 2, type: "consonant-consonant" },
      ],
      description:
        "The /t/ at the end of 'got' meets the /j/ at the start of 'you' and they fuse into /tʃ/. The result is 'gotcha' /ˈɡɒtʃə/ — one word phonetically, two words grammatically.",
    },
    {
      id: "example-1",
      type: "example",
      title: "Elision in Real Speech",
      phrase: "Next Friday, give me a call",
      ipa: "/neks ˈfraɪdeɪ ɡɪmi ə kɔːl/",
      highlightWords: ["Next", "Friday", "give", "call"],
      tip: "Notice: 'next' loses its /t/, 'give me' loses its /v/. The grammatical words stay — the dropped sounds are the ones the listener's brain reconstructs automatically.",
      tapWords: [
        { word: "next", ipa: "/neks/" },
        { word: "Friday", ipa: "/ˈfraɪdeɪ/" },
        { word: "gimme", ipa: "/ˈɡɪmi/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Assimilation Pairs",
      description: "Tap to hear each pair. The right column is what native speakers actually say.",
      words: [
        { word: "got you → gotcha", ipa: "/ˈɡɒtʃə/", meaning: "/t/+/j/ → /tʃ/" },
        { word: "did you → didja", ipa: "/ˈdɪdʒə/", meaning: "/d/+/j/ → /dʒ/" },
        { word: "miss you → miss ya", ipa: "/ˈmɪʃjə/", meaning: "/s/+/j/ → /ʃ/" },
        { word: "don't you → dontcha", ipa: "/ˈdoʊntʃə/", meaning: "/t/+/j/ → /tʃ/" },
        { word: "what you → whatcha", ipa: "/ˈwʌtʃə/", meaning: "/t/+/j/ → /tʃ/" },
        { word: "would you → wouldja", ipa: "/ˈwʊdʒə/", meaning: "/d/+/j/ → /dʒ/" },
      ],
    },
    {
      id: "mouth-tj",
      type: "mouth-diagram",
      title: "How /t/ + /j/ Fuses Into /tʃ/",
      description:
        "To say /t/, your tongue tip touches the alveolar ridge (just behind the upper teeth). To say /j/, the tongue body is high and forward. When they fuse into /tʃ/, the tongue stops the airflow farther back — at the postalveolar region — then releases with friction. Lips push forward slightly.",
      tonguePosition: "front-high",
      lipShape: "slightly-open",
      sound: "tʃ",
      exampleWord: "gotcha / watch / chair",
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — The Predictable Boundary",
      body: "If a word ends in /t/ or /d/ and the next word begins with /j/ (most commonly 'you' or 'your'), you can almost always coalesce them. 'Meet you' → 'meetcha', 'let you' → 'letcha', 'could you' → 'couldja'. This is not slang — it is the default pronunciation at conversational speed.",
      variant: "info",
    },
    {
      id: "example-2",
      type: "example",
      title: "A Sentence Full of Changes",
      phrase: "What are you going to do this weekend?",
      ipa: "/ˈwʌtʃə ɡənə duː ðɪs ˈwiːkend/",
      highlightWords: ["Whatcha", "gonna", "do", "weekend"],
      tip: "Four reductions and fusions in one short sentence: 'what are you' → 'whatcha', 'going to' → 'gonna'. The stressed words (DO, WEEKEND) stay clear; everything else compresses.",
      tapWords: [
        { word: "whatcha", ipa: "/ˈwʌtʃə/" },
        { word: "gonna", ipa: "/ˈɡənə/" },
        { word: "weekend", ipa: "/ˈwiːkend/" },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Say It Fast and Fused",
      phrase: "Don't you want to meet me after class?",
      ipa: "/ˈdoʊntʃə ˈwɒnə miːt mi ˈæftər klæs/",
      tip: "Fuse 'don't you' into 'dontcha'. Reduce 'want to' into 'wanna'. Drop the /v/ in 'meet me' if it feels heavy. The goal is fluid motion between stressed beats.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "What two-word phrase becomes 'whatcha' /ˈwʌtʃə/ in fast speech?",
      options: [
        "want you",
        "what are you",
        "watch you",
        "what do you",
      ],
      correct: 1,
      explanation:
        "'What are you' compresses to 'whatcha': the /t/ at the end of 'what' meets the /j/ glide at the start of 'you' (after 'are' drops its vowel to schwa-elision). The /t/+/j/ coalesces into /tʃ/. 'Want you' would be 'wancha', 'watch you' is just 'watcha' without fusion.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Elision & Assimilation Complete!",
      subtitle: "You can now predict where sounds drop and fuse at word boundaries.",
      xp: 160,
      badge: "🔗 Boundary Boss",
      nextLessonTitle: "Fast Speech Decoding",
    },
  ],
};

export default lesson;
