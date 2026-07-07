import type { Lesson } from "../../types";

// Phase 5 — Lesson 4: Fast Speech Decoding
// Train the ear to decode native-speed English by comparing slow vs fast versions.
// 12 steps: intro, concept, compare, example, rhythm, tap-pronounce, tip, example, shadow, practice, quiz, completion.

const lesson: Lesson = {
  id: "p5l4",
  phaseId: 4,
  lessonIndex: 3,
  title: "Fast Speech Decoding",
  subtitle: "Train your ear to hear what native speakers actually say",
  duration: 11,
  xp: 165,
  objectives: [
    "Decode the gap between written English and spoken English at native speed",
    "Map reduced phrases back to their full forms (whatcha gonna do → what are you going to do)",
    "Use rhythm and stress anchors to track meaning through compressed speech",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Fast Speech Decoding",
      subtitle: "What did they actually say?",
      description:
        "Native speech sounds fast because it is fast — but it is also full of holes. Sounds vanish, vowels reduce, words fuse. This lesson trains your ear to fill those holes by anchoring on the stressed words and reconstructing the rest from context and pattern.",
      visual: "compare-wave",
      emoji: "👂",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Fast Speech Sounds Like One Word",
      body: [
        "When a native speaker says 'What are you going to do?' at conversational speed, the result is 'Whatcha gonna do?' — about 1.2 seconds. The written sentence has 24 letters and 6 words; the spoken sentence has roughly 4 syllables and almost no word breaks.",
        "Your ear fails not because the words are missing, but because the boundaries are missing. To decode fast speech, you must learn to anchor on the stressed syllables — those are the meaning-carrying peaks — and let the unstressed valleys fill in automatically.",
      ],
      bulletPoints: [
        "Stressed words carry meaning: nouns, verbs, adjectives, adverbs",
        "Unstressed words carry grammar: articles, prepositions, auxiliaries",
        "Your brain predicts the unstretched grammar from the stressed content",
        "Train the ear by repeatedly hearing slow → fast versions of the same phrase",
      ],
      visual: "compare-wave",
      visualLabel: "Slow form vs fast form",
    },
    {
      id: "compare-1",
      type: "compare",
      title: "Slow Careful vs Fast Native",
      nativePhrase: "Whatcha gonna do?",
      learnerPhrase: "What are you going to do?",
      nativeIpa: "/ˈwʌtʃə ˈɡənə duː/",
      learnerIpa: "/wʌt ɑːr juː ˈɡoʊɪŋ tuː duː/",
      description:
        "The native version is less than half the length. 'What are you' compresses to 'whatcha' /ˈwʌtʃə/, and 'going to' compresses to 'gonna' /ˈɡənə/. The stressed word 'do' carries the question's meaning.",
    },
    {
      id: "example-1",
      type: "example",
      title: "A Fast Sentence",
      phrase: "Whatcha gonna do about it?",
      ipa: "/ˈwʌtʃə ˈɡənə duː əˈbaʊt ɪt/",
      highlightWords: ["Whatcha", "gonna", "do", "about"],
      tip: "Four content anchors: WHATCHA, GONNA, DO, ABOUT. The 'it' is almost swallowed. If you can pick out those four, your brain reconstructs the rest.",
      tapWords: [
        { word: "whatcha", ipa: "/ˈwʌtʃə/" },
        { word: "gonna", ipa: "/ˈɡənə/" },
        { word: "do", ipa: "/duː/" },
        { word: "about", ipa: "/əˈbaʊt/" },
      ],
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "Compressed Beats",
      phrase: "I don't know what you're talking about",
      beats: [
        { text: "I", duration: 0.5, stressed: false },
        { text: "don't", duration: 1, stressed: true },
        { text: "know", duration: 1, stressed: true },
        { text: "whatcher", duration: 0.5, stressed: false },
        { text: "talkin", duration: 1, stressed: true },
        { text: "'bout", duration: 1.5, stressed: true },
      ],
      description:
        "Three long stressed beats — DON'T, KNOW, TALKIN — and the rest is compressed tissue. The stressed beats are where you anchor your ear.",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Match the Reduced to the Original",
      description: "Tap to hear the reduced form. Say the full form silently in your head — your brain should connect them automatically.",
      words: [
        { word: "kinda", ipa: "/ˈkaɪndə/", meaning: "← kind of" },
        { word: "sorta", ipa: "/ˈsɔːrtə/", meaning: "← sort of" },
        { word: "outta", ipa: "/ˈaʊtə/", meaning: "← out of" },
        { word: "coulda", ipa: "/ˈkʊdə/", meaning: "← could have" },
        { word: "shoulda", ipa: "/ˈʃʊdə/", meaning: "← should have" },
        { word: "gimme", ipa: "/ˈɡɪmi/", meaning: "← give me" },
        { word: "lemme", ipa: "/ˈlemi/", meaning: "← let me" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Anchor on Stressed Peaks",
      body: "When you lose the thread of fast speech, stop trying to catch every word. Listen only for the stressed peaks — usually 2 to 4 per sentence. Those peaks are the nouns, verbs, and adjectives. Once you have those, the grammar words (the, of, going to) fill themselves in because English grammar is highly predictable.",
      variant: "success",
    },
    {
      id: "example-2",
      type: "example",
      title: "Decoding a Real Question",
      phrase: "How're you doing with that project?",
      ipa: "/ˈhaʊər jə ˈduːɪn wɪð ðæt ˈprɒdʒekt/",
      highlightWords: ["How're", "doing", "project"],
      tip: "'How are' → 'How're' /ˈhaʊər/. 'You' → 'ya' /jə/. 'Doing' loses its final /g/. The three stressed peaks — HOW, DOING, PROJECT — carry the entire question.",
      tapWords: [
        { word: "How're", ipa: "/ˈhaʊər/" },
        { word: "doing", ipa: "/ˈduːɪn/" },
        { word: "project", ipa: "/ˈprɒdʒekt/" },
      ],
    },
    {
      id: "shadow-1",
      type: "shadow",
      title: "Shadow a Fast Sentence",
      phrase: "I dunno, maybe we could go grab something to eat",
      ipa: "/aɪ dəˈnoʊ ˈmeɪbi wi kəd ɡoʊ ɡræb ˈsʌmθɪŋ tə iːt/",
      description:
        "Listen to the audio, then speak along with it — not after, but at the same time. Match the rhythm exactly: three stressed peaks (MAYBE, GRAB, EAT) and everything else compressed.",
    },
    {
      id: "practice",
      type: "practice",
      title: "Decode and Repeat",
      phrase: "Whatcha gonna do this weekend?",
      ipa: "/ˈwʌtʃə ˈɡənə duː ðɪs ˈwiːkend/",
      tip: "Stress DO and WEEKEND heavily. Compress 'whatcha gonna' into a single quick unit. Aim for under 1.5 seconds total.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which full phrase is the original form of 'coulda' /ˈkʊdə/?",
      options: [
        "could do",
        "could to",
        "could have",
        "could of",
      ],
      correct: 2,
      explanation:
        "'Coulda' comes from 'could have' — the /h/ drops and the /æv/ reduces to /ə/. 'Could of' is the common misspelling that mirrors how it sounds, but the grammatical original is 'could have'. The same pattern gives 'shoulda' (should have) and 'woulda' (would have).",
    },
    {
      id: "completion",
      type: "completion",
      title: "Fast Speech Decoding Complete!",
      subtitle: "You can now anchor on stressed peaks and decode compressed native speech.",
      xp: 165,
      badge: "⚡ Speed Decoder",
      nextLessonTitle: "Shadowing Technique",
    },
  ],
};

export default lesson;
