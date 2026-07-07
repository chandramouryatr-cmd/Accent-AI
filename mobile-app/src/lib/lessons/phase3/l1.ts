import type { Lesson } from "../../types";

// Phase 3 — Lesson 1: Linking Words
// Connected speech: consonant-to-vowel, consonant-to-consonant, vowel-to-vowel
// (with /w/ and /j/ glides). This is what separates word-by-word learners
// from fluid native speakers.

const lesson: Lesson = {
  id: "p3l1",
  phaseId: 2,
  lessonIndex: 0,
  title: "Linking Words",
  subtitle: "Make words flow together like a native speaker",
  duration: 9,
  xp: 140,
  objectives: [
    "Link consonant endings to vowel beginnings (an apple → /əˈnæpl/)",
    "Insert /w/ and /j/ glides between vowels (go on → /ɡoʊwɒn/)",
    "Blend identical or similar consonants across word boundaries",
    "Hear the difference between careful and connected speech",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Linking Words",
      subtitle: "The glue of native speech",
      description:
        "Native speakers don't pause between words — they glide them together. 'An apple' becomes 'a-napple.' 'Go on' becomes 'go-won.' This lesson teaches the three rules of linking that turn choppy speech into fluid English.",
      visual: "linking",
      emoji: "🔗",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Words Link Together",
      body: [
        "English is a stress-timed language built for speed. When one word ends and the next begins, the mouth doesn't reset — it carries sound forward. This creates the smooth, continuous stream you hear from native speakers.",
        "Linking is not sloppy speech. It is the rule, not the exception. Newscasters, teachers, and actors all link. The only time words don't link is when a speaker deliberately pauses for emphasis.",
      ],
      bulletPoints: [
        "Rule 1 — Consonant → Vowel: the consonant 'jumps' to the next word (an apple → a-napple)",
        "Rule 2 — Vowel → Vowel: insert a /w/ or /j/ glide between them (go on → go-won)",
        "Rule 3 — Consonant → Consonant: similar sounds merge or hold (black cat → bla-ckat)",
      ],
      visual: "linking",
      visualLabel: "Three linking patterns in English",
    },
    {
      id: "linking-cv",
      type: "linking",
      title: "Consonant → Vowel Linking",
      words: ["an", "apple"],
      links: [{ from: 0, to: 1, type: "consonant-vowel" }],
      description:
        "The /n/ at the end of 'an' attaches to the vowel start of 'apple.' Native speakers hear it as one syllable: 'a-napple' /əˈnæpl/. Try saying it both ways — the linked version sounds natural; the separated version sounds robotic.",
    },
    {
      id: "linking-vv",
      type: "linking",
      title: "Vowel → Vowel with /w/ Glide",
      words: ["go", "on"],
      links: [{ from: 0, to: 1, type: "vowel-vowel" }],
      description:
        "When 'go' /ɡoʊ/ meets 'on' /ɒn/, the lips round for /oʊ/ and stay rounded into the next vowel. A /w/ glide appears naturally between them: /ɡoʊwɒn/. You don't force it — your mouth shape creates it.",
    },
    {
      id: "linking-jj",
      type: "linking",
      title: "Vowel → Vowel with /j/ Glide",
      words: ["see", "it"],
      links: [{ from: 0, to: 1, type: "vowel-vowel" }],
      description:
        "After a front vowel like /iː/ (lips spread), the tongue is already high and forward. Moving into the next vowel naturally produces a /j/ glide: 'see it' → /siːjɪt/. This is the same /j/ as in 'yes' — invisible on paper, audible in speech.",
    },
    {
      id: "example-1",
      type: "example",
      title: "Hear the Flow",
      phrase: "I saw an old apple on the table",
      ipa: "/aɪ sɔːrənoʊldæplən ðə teɪbl̩/",
      highlightWords: ["saw", "an", "old", "apple", "on"],
      tip: "Five linking points in one short sentence. 'Saw an' links /r/+/ə/, 'an old' links /n/+/oʊ/, 'old apple' links /d/+/æ/, 'apple on' links /l/+/ɒ/. The whole middle becomes one continuous sound.",
      tapWords: [
        { word: "saw an", ipa: "/sɔːrən/" },
        { word: "an old", ipa: "/ənoʊld/" },
        { word: "old apple", ipa: "/oʊldæpl/" },
        { word: "apple on", ipa: "/æplən/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Linked Pairs",
      description:
        "Each pair is two words. Tap and listen for the smooth join — there is no gap between them.",
      words: [
        { word: "an apple", ipa: "/əˈnæpl/", meaning: "consonant → vowel" },
        { word: "go on", ipa: "/ˈɡoʊwɒn/", meaning: "vowel → vowel /w/" },
        { word: "see it", ipa: "/ˈsiːjɪt/", meaning: "vowel → vowel /j/" },
        { word: "black cat", ipa: "/ˈblækæt/", meaning: "consonant → consonant" },
        { word: "turn off", ipa: "/ˈtɜːrnɒf/", meaning: "consonant → vowel" },
        { word: "they are", ipa: "/ˈðeɪjər/", meaning: "vowel → vowel /j/" },
        { word: "do it", ipa: "/ˈduːwɪt/", meaning: "vowel → vowel /w/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: Hold the Last Sound",
      body: "When practicing linking, don't think about the next word — instead, hold the last sound of the current word slightly longer than feels comfortable. That extra length is what naturally bridges into the next word. 'Annnn—apple' becomes 'a-napple' without trying.",
      variant: "info",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Linking Changes Spelling Sounds",
      body: [
        "Linking can change how a written letter actually sounds in connected speech. The letter 't' in 'meet at' becomes a flap /ɾ/ in fast American English, sounding almost like 'd'.",
        "The letter 'r' at the end of 'car' is silent in British English but pronounced in American — and crucially, Americans always pronounce it when the next word starts with a vowel ('car engine' → /kɑːrˈɛndʒɪn/).",
      ],
      bulletPoints: [
        "Flap T: 'meet at' → /miːɾət/ (sounds like 'meed-at')",
        "Linking R: 'car engine' → /kɑːrˈɛndʒɪn/ (American English)",
        "Intrusive R: 'law and order' → /lɔːrəndɔːrdər/ (informal)",
        "Yod coalescence: 'did you' → /dɪdʒu/ ('didja')",
      ],
      visual: "wave",
      visualLabel: "Waveform shows no gaps in connected speech",
    },
    {
      id: "practice",
      type: "practice",
      title: "Link It Together",
      phrase: "Pick up an orange and an apple",
      ipa: "/pɪkʌpənɒrɪndʒənənæpl/",
      tip: "Every word boundary here has a link. 'Pick up' = /pɪkʌp/, 'up an' = /ʌpən/, 'an orange' = /ənɒrɪndʒ/, 'orange and' = /ɒrɪndʒən/, 'and an' = /ənən/, 'an apple' = /ənæpl/. Aim for zero gaps.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "When you say 'see it' at natural speed, what sound appears between the two words?",
      options: [
        "A /w/ glide, producing /siːwɪt/",
        "A /j/ glide, producing /siːjɪt/",
        "Nothing — there's a clean break /siː ɪt/",
        "An /h/ sound, producing /siːhɪt/",
      ],
      correct: 1,
      explanation:
        "After the front vowel /iː/ (lips spread, tongue high and forward), moving to another vowel naturally produces a /j/ glide — the same sound as in 'yes.' So 'see it' becomes /siːjɪt/. The /w/ glide appears after back rounded vowels like /oʊ/ or /uː/.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Linking Words Complete!",
      subtitle: "You can now connect words the way native speakers do — no gaps, full flow.",
      xp: 140,
      badge: "🔗 Link Master",
      nextLessonTitle: "Sentence Melody",
    },
  ],
};

export default lesson;
