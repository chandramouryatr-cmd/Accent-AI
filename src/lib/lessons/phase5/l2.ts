import type { Lesson } from "../../types";

// Phase 5 — Lesson 2: Reduced Vowels
// The schwa /ə/ — the most common vowel in English. Vowel reduction in unstressed syllables.
// 11 steps: intro, concept, vowel-chart, mouth-diagram, example, stress-bars, tap-pronounce, tip, example, practice, quiz, completion.

const lesson: Lesson = {
  id: "p5l2",
  phaseId: 4,
  lessonIndex: 1,
  title: "Reduced Vowels",
  subtitle: "Meet the schwa /ə/ — the most common sound in English",
  duration: 10,
  xp: 155,
  objectives: [
    "Recognize and produce the schwa /ə/ — the central neutral vowel",
    "Reduce vowels in unstressed syllables (PHO-to-graph-ic → /fəˈtɒɡrəfɪk/)",
    "Understand why vowel reduction is the key to sounding native, not robotic",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Reduced Vowels",
      subtitle: "The schwa is the secret of native rhythm",
      description:
        "Every stressed syllable in English is loud and clear. Every unstressed syllable collapses toward a single neutral sound: the schwa /ə/. Master the schwa and your speech instantly stops sounding like word-by-word recitation and starts flowing like a native's.",
      visual: "vowel-chart",
      emoji: "ə",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Schwa /ə/ — King of English Vowels",
      body: [
        "The schwa /ə/ is the most frequent vowel in spoken English. Roughly one in every three vowel sounds you produce is a schwa — even though it never appears in the spelling.",
        "It is not a 'lazy' sound; it is the engine of stress-timed rhythm. By collapsing unstressed syllables to schwa, native speakers create the contrast that lets the stressed syllables pop out.",
        "The schwa lives in the dead center of the mouth: tongue neutral, jaw half-closed, lips relaxed. It is the position your mouth returns to between words.",
      ],
      bulletPoints: [
        "/ə/ appears in: a-bout, the, sof-a, doc-tor, pho-to-graph",
        "Written as: a, e, i, o, u — any vowel letter can become schwa",
        "Always unstressed — there is no stressed schwa",
        "The sister sound /ɪ/ appears in unstressed final position (happy, coffee)",
      ],
      visual: "vowel-chart",
      visualLabel: "Schwa sits at the very center",
    },
    {
      id: "vowel-chart",
      type: "vowel-chart",
      title: "The Schwa at the Center",
      description:
        "Look at the vowel quadrilateral: every other vowel lives on the outer edge. The schwa /ə/ sits dead center — neutral tongue, neutral jaw. Tap the dots to hear the contrast between a clear vowel and the reduced schwa.",
      vowels: [
        { ipa: "iː", x: 18, y: 18, label: "FLEECE", color: "#22d3ee" },
        { ipa: "uː", x: 82, y: 22, label: "GOOSE", color: "#10b981" },
        { ipa: "æ", x: 22, y: 80, label: "TRAP", color: "#f59e0b" },
        { ipa: "ɑː", x: 78, y: 80, label: "FATHER", color: "#ec4899" },
        { ipa: "ə", x: 50, y: 52, label: "SCHWA", color: "#fbbf24" },
        { ipa: "ʌ", x: 50, y: 65, label: "STRUT", color: "#a78bfa" },
      ],
      highlight: "ə",
    },
    {
      id: "mouth-schwa",
      type: "mouth-diagram",
      title: "The Neutral Mouth of /ə/",
      description:
        "For the schwa, your tongue floats in the middle of your mouth — not high, not low, not forward, not back. Lips are completely relaxed. This is the 'rest position' of English speech.",
      tonguePosition: "central-mid",
      lipShape: "relaxed",
      sound: "ə",
      exampleWord: "uh (the hesitation sound)",
    },
    {
      id: "example-1",
      type: "example",
      title: "Watch Vowels Reduce",
      phrase: "PHO-to-graph-ic — pho-TO-graph-er",
      ipa: "/fəˈtɒɡrəfɪk/ — /fəˈtɒɡrəfər/",
      highlightWords: ["PHO", "TO", "graph", "ic", "er"],
      tip: "Same root, but the stress moves and unstressed vowels collapse to schwa. The first syllable 'PHO' is /fə/ in both — not /foʊ/. That is reduction at work.",
      tapWords: [
        { word: "photograph", ipa: "/ˈfoʊtəɡræf/" },
        { word: "photography", ipa: "/fəˈtɒɡrəfi/" },
        { word: "photographic", ipa: "/ˌfoʊtəˈɡræfɪk/" },
      ],
    },
    {
      id: "stress-bars",
      type: "stress-bars",
      title: "Where the Schwa Hides",
      word: "photography",
      syllables: [
        { text: "pho", stressed: false },
        { text: "TOG", stressed: true },
        { text: "ra", stressed: false },
        { text: "phy", stressed: false },
      ],
      description:
        "Only TOG is stressed — the other three syllables all reduce toward schwa: /fəˈtɒɡrəfi/. The unstressed 'phy' becomes /fi/ (with the close sister /ɪ/).",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap Each Word — Find the Schwa",
      description: "Tap and listen for the weak, neutral vowel in the unstressed syllable. That is the schwa.",
      words: [
        { word: "about", ipa: "/əˈbaʊt/", meaning: "schwa on 1st syllable" },
        { word: "sofa", ipa: "/ˈsoʊfə/", meaning: "schwa on 2nd syllable" },
        { word: "doctor", ipa: "/ˈdɒktər/", meaning: "schwa on 2nd syllable" },
        { word: "support", ipa: "/səˈpɔːrt/", meaning: "schwa on 1st syllable" },
        { word: "banana", ipa: "/bəˈnænə/", meaning: "schwa on 1st & 3rd" },
        { word: "communication", ipa: "/kəˌmjuːnɪˈkeɪʃən/", meaning: "schwa on 1st & last" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — The Rest Position",
      body: "When you hesitate mid-sentence, the sound that comes out is 'uh' /ə/. That is not an accident — it is your mouth's natural resting vowel. Practise saying 'uh' between every word for 30 seconds, then start inserting real words into that stream. The schwa will become your default connective tissue.",
      variant: "success",
    },
    {
      id: "example-2",
      type: "example",
      title: "A Sentence Full of Schwa",
      phrase: "I was going to tell her about it tomorrow",
      ipa: "/aɪ wəz ˈɡənə ˈtel ər əˈbaʊt ɪt təˈmɒroʊ/",
      highlightWords: ["going", "tell", "about", "tomorrow"],
      tip: "Count the schwas: was, to, her, about, it, tomorrow — six out of nine words contain a schwa. That is normal English density.",
      tapWords: [
        { word: "was", ipa: "/wəz/" },
        { word: "to", ipa: "/tə/" },
        { word: "her", ipa: "/ər/" },
        { word: "about", ipa: "/əˈbaʊt/" },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Reduce the Unstressed",
      phrase: "A banana and a tomato for the doctor",
      ipa: "/ə bəˈnænə ənd ə təˈmeɪtoʊ fər ðə ˈdɒktər/",
      tip: "Hammer the stressed syllables (NAN, MAY, DOC) and let everything else collapse into a soft /ə/. Resist the urge to pronounce every vowel clearly.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "In the word 'communication' /kəˌmjuːnɪˈkeɪʃən/, which syllables contain a schwa /ə/?",
      options: [
        "Only the first syllable 'com'",
        "Only the last syllable 'tion'",
        "The first syllable 'com' and the last syllable 'tion'",
        "All four unstressed syllables",
      ],
      correct: 2,
      explanation:
        "The schwa appears in the unstressed 'com' /kə/ at the start and the unstressed 'tion' /ʃən/ at the end. The stressed syllable 'CA' /keɪ/ and the clear /mjuːnɪ/ are not reduced. Two schwas, not four.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Reduced Vowels Complete!",
      subtitle: "You can now produce the schwa and reduce unstressed syllables like a native.",
      xp: 155,
      badge: "ə Schwa Specialist",
      nextLessonTitle: "Elision & Assimilation",
    },
  ],
};

export default lesson;
