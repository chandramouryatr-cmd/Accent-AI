import type { Lesson } from "../../types";

// Phase 6 — Lesson 3: Tone Matching
// Matching tone: friendly, serious, sarcastic, enthusiastic.
// 12 steps: intro, concept, intonation, intonation, example, tap-pronounce, tip, intonation, example, practice, quiz, completion.

const lesson: Lesson = {
  id: "p6l3",
  phaseId: 5,
  lessonIndex: 2,
  title: "Tone Matching",
  subtitle: "Same words, four tones — and only one fits the moment",
  duration: 11,
  xp: 170,
  objectives: [
    "Identify the four primary tones of conversational English: friendly, serious, sarcastic, enthusiastic",
    "Read a pitch contour and predict which tone it expresses",
    "Produce the same phrase in multiple tones by adjusting pitch and tempo",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Tone Matching",
      subtitle: "The same sentence, four completely different meanings",
      description:
        "'Oh, great' can mean 'I'm thrilled' or 'this is the worst news possible' — the words are identical, the tone decides everything. Tone is the emotional coloring painted on top of prosody, and matching it is what separates functional English from convincing English.",
      visual: "intonation",
      emoji: "🎭",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Four Primary Tones",
      body: [
        "Every conversational utterance carries one of four emotional tones — sometimes more than one in sequence. Learning to hear and produce these four is the foundation of tone control.",
        "Friendly tone is medium pitch with gentle variation; it invites. Serious tone is lower, flatter, slower; it carries weight. Sarcastic tone exaggerates the opposite of the literal meaning — pitch rises where it should fall, or stretches words that should be quick. Enthusiastic tone is high, fast, and wide-ranging; it radiates energy.",
      ],
      bulletPoints: [
        "Friendly — medium pitch, gentle rise, warm tempo",
        "Serious — low pitch, narrow range, slow tempo, deliberate pauses",
        "Sarcastic — exaggerated pitch swings, stretched vowels, often rising where it should fall",
        "Enthusiastic — high pitch, wide range, fast tempo, sharp peaks",
      ],
      visual: "phoneme-grid",
      visualLabel: "Four tones, four contours",
    },
    {
      id: "intonation-friendly",
      type: "intonation",
      title: "Friendly Tone",
      phrase: "Hey, how's it going?",
      contour: [
        { x: 5, y: 55 },
        { x: 25, y: 65 },
        { x: 45, y: 60 },
        { x: 60, y: 70 },
        { x: 80, y: 75 },
        { x: 95, y: 70 },
      ],
      pattern: "rising",
      description:
        "A gentle upward arc on 'going?' — the pitch rises but not dramatically. The peak is in the upper-middle range, the curve is smooth. This is the contour of a warm, casual greeting.",
    },
    {
      id: "intonation-serious",
      type: "intonation",
      title: "Serious Tone",
      phrase: "We need to talk about this.",
      contour: [
        { x: 5, y: 45 },
        { x: 20, y: 50 },
        { x: 40, y: 48 },
        { x: 60, y: 42 },
        { x: 80, y: 35 },
        { x: 95, y: 25 },
      ],
      pattern: "falling",
      description:
        "Low start, narrow range, steady fall to a low final note. No big peaks, no jumps. The flatness itself signals gravity — pitch variation would dilute the seriousness.",
    },
    {
      id: "example-1",
      type: "example",
      title: "One Phrase, Three Tones",
      phrase: "Oh, great — thanks a lot",
      ipa: "/oʊ ɡreɪt θæŋks ə lɒt/",
      highlightWords: ["great", "thanks", "lot"],
      tip: "Said with rising pitch and a smile → genuine gratitude. Said flat and low → resigned disappointment. Said with stretched vowels and exaggerated falling pitch → sarcastic complaint. The words do not change; the tone rewrites the meaning.",
      tapWords: [
        { word: "great", ipa: "/ɡreɪt/" },
        { word: "thanks", ipa: "/θæŋks/" },
        { word: "a lot", ipa: "/ə lɒt/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tone Carriers — Tap and Identify",
      description: "Tap each phrase. Identify the tone before the answer reveals it. Train your ear first, your mouth second.",
      words: [
        { word: "Oh, wonderful.", ipa: "/oʊ ˈwʌndərfəl/", meaning: "could be sincere OR sarcastic" },
        { word: "Right. Sure. Okay.", ipa: "/raɪt ʃʊər oʊˈkeɪ/", meaning: "flat = dismissal" },
        { word: "No way!", ipa: "/noʊ weɪ/", meaning: "rising = excitement" },
        { word: "I see.", ipa: "/aɪ siː/", meaning: "low flat = acknowledgment" },
        { word: "Yeah, right.", ipa: "/jɛə raɪt/", meaning: "sarcastic disbelief" },
        { word: "That's amazing!", ipa: "/ðæts əˈmeɪzɪŋ/", meaning: "genuine enthusiasm" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Stretch the Vowel for Sarcasm",
      body: "Sarcasm in English is signaled by stretching the vowel of the stressed word well beyond its normal length. 'Great' becomes 'greaaat' /ɡreːt/. 'Thanks' becomes 'thaaanks'. The pitch usually rises where the literal meaning would fall. If you stretch the vowel and exaggerate the pitch, your sarcasm will land every time — even with imperfect grammar.",
      variant: "info",
    },
    {
      id: "intonation-enthusiastic",
      type: "intonation",
      title: "Enthusiastic Tone",
      phrase: "That's amazing — I love it!",
      contour: [
        { x: 5, y: 65 },
        { x: 20, y: 85 },
        { x: 35, y: 90 },
        { x: 50, y: 70 },
        { x: 65, y: 80 },
        { x: 80, y: 95 },
        { x: 95, y: 80 },
      ],
      pattern: "rise-fall",
      description:
        "High peaks throughout, sharp swings between high and mid. The contour zigzags energetically — that volatility IS the enthusiasm. A flat contour cannot sound enthusiastic no matter how loud you get.",
    },
    {
      id: "example-2",
      type: "example",
      title: "Sarcastic 'Great'",
      phrase: "Oh, great — another meeting",
      ipa: "/oʊ ɡreːt əˈnʌðər ˈmiːtɪŋ/",
      highlightWords: ["great", "another", "meeting"],
      tip: "Stretch 'great' to twice its normal length, push the pitch up where it should fall, then drop flat on 'another meeting'. The contrast between exaggerated 'great' and deadpan delivery is the sarcasm.",
      tapWords: [
        { word: "great (sarcastic)", ipa: "/ɡreːt/" },
        { word: "another", ipa: "/əˈnʌðər/" },
        { word: "meeting", ipa: "/ˈmiːtɪŋ/" },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Switch Tones on Command",
      phrase: "Are you coming with us?",
      ipa: "/ɑːr juː ˈkʌmɪŋ wɪθ ʌs/",
      tip: "Say it three times: (1) friendly — gentle rise, (2) serious — low and flat with a small rise, (3) enthusiastic — high peak on 'coming'. Same IPA, three completely different impressions.",
      passScore: 78,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "A speaker says 'Great, just great' with stretched vowels, exaggerated rising pitch on 'great', and a flat drop on 'just great'. What tone are they expressing?",
      options: [
        "Genuine enthusiasm",
        "Friendly greeting",
        "Sarcastic complaint",
        "Serious instruction",
      ],
      correct: 2,
      explanation:
        "The stretched vowels and exaggerated pitch swings are the classic signature of sarcasm. The literal words ('great') say positive but the prosody says negative — that contradiction IS sarcasm. Genuine enthusiasm uses wide pitch swings but high peaks; serious uses narrow range and low pitch; friendly uses gentle rises.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Tone Matching Complete!",
      subtitle: "You can now produce the same phrase in four distinct tones and identify them by ear.",
      xp: 170,
      badge: "🎭 Tone Tactician",
      nextLessonTitle: "Character Voices",
    },
  ],
};

export default lesson;
