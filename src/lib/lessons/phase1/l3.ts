import type { Lesson } from "../../types";

// Phase 1 — Lesson 3: Mouth Positioning
// Vowels are not 'sounds you make' — they are positions you HOLD. Every vowel
// is a coordinate in three physical dimensions: high-low, front-back,
// rounded-spread. Master the geometry and the vowels appear by themselves.

const lesson: Lesson = {
  id: "p1l3",
  phaseId: 0,
  lessonIndex: 2,
  title: "Mouth Positioning",
  subtitle: "Vowels are coordinates — learn the 3D map of your mouth",
  duration: 9,
  xp: 125,
  objectives: [
    "Locate any vowel on the high-low × front-back grid using tongue position",
    "Coordinate jaw, tongue, and lips as a single articulatory system",
    "Distinguish rounded vowels (/uː/, /oʊ/) from spread vowels (/iː/, /æ/)",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Mouth Positioning",
      subtitle: "Geometry of the vowel tract",
      description:
        "Your mouth is a 3D resonant chamber. Every vowel is just a snapshot of where your tongue, jaw, and lips happen to be. Learn the three dimensions — high/low, front/back, rounded/spread — and you can produce any vowel in any language on demand.",
      visual: "mouth",
      emoji: "👄",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Three Dimensions of a Vowel",
      body: [
        "Phoneticians describe every vowel using three coordinates. Once you know them, you can move from any vowel to any other vowel by adjusting one axis at a time — like steering a spaceship.",
        "HIGH–LOW is how close the tongue is to the roof of the mouth. High vowels (/iː/, /uː/) feel tight and bright. Low vowels (/æ/, /ɑː/) feel open and dark.",
        "FRONT–BACK is whether the tongue body bulges forward (toward the teeth) or back (toward the throat). Front vowels (/iː/, /æ/) sound bright; back vowels (/uː/, /ɑː/) sound hollow.",
        "ROUNDED–SPREAD is the lip shape. Rounded lips (/uː/, /oʊ/) lengthen the vocal tract and lower the pitch. Spread lips (/iː/, /æ/) shorten it and raise the perceived pitch.",
      ],
      bulletPoints: [
        "High → tongue near the palate (/iː/, /uː/)",
        "Low → jaw dropped, tongue at floor (/æ/, /ɑː/)",
        "Front → tongue body forward (/iː/, /æ/)",
        "Back → tongue body retracted (/uː/, /ɑː/)",
        "Rounded → lips form a circle (/uː/, /oʊ/, /ɔː/)",
        "Spread → lips pulled sideways (/iː/, /æ/)",
      ],
      visual: "vowel-chart",
      visualLabel: "The 3D vowel space",
    },
    {
      id: "mouth-ee",
      type: "mouth-diagram",
      title: "/iː/ — Front-High, Spread",
      description:
        "For /iː/ (as in 'see'), raise the front of your tongue toward the hard palate — almost touching. Push your lips sideways into a wide smile. The jaw is nearly closed. This is the highest, most forward vowel in English.",
      tonguePosition: "front-high",
      lipShape: "spread",
      sound: "iː",
      exampleWord: "see / green / machine",
    },
    {
      id: "mouth-ae",
      type: "mouth-diagram",
      title: "/æ/ — Front-Low, Spread",
      description:
        "For /æ/ (as in 'cat'), drop your jaw low and push the tongue forward and down — flat against the floor of the mouth. Lips spread wide, almost a grimace. This is the lowest front vowel; the openness gives American English its signature brightness.",
      tonguePosition: "front-low",
      lipShape: "spread",
      sound: "æ",
      exampleWord: "cat / bad / apple",
    },
    {
      id: "mouth-uu",
      type: "mouth-diagram",
      title: "/uː/ — Back-High, Rounded",
      description:
        "For /uː/ (as in 'blue'), raise the back of your tongue toward the soft palate while pushing your lips forward into a tight circle. The jaw is nearly closed — same height as /iː/ — but the tongue is BACK and the lips are ROUNDED. This is the highest back vowel.",
      tonguePosition: "back-high",
      lipShape: "rounded",
      sound: "uː",
      exampleWord: "blue / food / who",
    },
    {
      id: "mouth-aa",
      type: "mouth-diagram",
      title: "/ɑː/ — Back-Low, Relaxed",
      description:
        "For /ɑː/ (as in 'father'), drop your jaw fully open and pull the tongue body back and down. Lips are relaxed and slightly open — neither rounded nor spread. This is the lowest back vowel; it sounds deep and open.",
      tonguePosition: "back-low",
      lipShape: "relaxed",
      sound: "ɑː",
      exampleWord: "father / hot / calm",
    },
    {
      id: "vowel-chart",
      type: "vowel-chart",
      title: "The Vowel Quadrilateral",
      description:
        "The IPA vowel chart is literally a map of your mouth. The left edge is the front (teeth), the right edge is the back (throat), the top is high (jaw closed), the bottom is low (jaw open). Tap each dot to feel where the tongue goes.",
      vowels: [
        { ipa: "iː", x: 18, y: 18, label: "FLEECE", color: "#22d3ee" },
        { ipa: "ɪ", x: 28, y: 32, label: "KIT", color: "#6366f1" },
        { ipa: "eɪ", x: 30, y: 30, label: "FACE", color: "#6366f1" },
        { ipa: "æ", x: 22, y: 80, label: "TRAP", color: "#f59e0b" },
        { ipa: "ə", x: 50, y: 50, label: "SCHWA", color: "#94a3b8" },
        { ipa: "ʌ", x: 55, y: 65, label: "STRUT", color: "#a78bfa" },
        { ipa: "ɑː", x: 82, y: 82, label: "FATHER", color: "#ef4444" },
        { ipa: "ɔː", x: 78, y: 60, label: "THOUGHT", color: "#f97316" },
        { ipa: "oʊ", x: 78, y: 42, label: "GOAT", color: "#10b981" },
        { ipa: "uː", x: 88, y: 22, label: "GOOSE", color: "#06b6d4" },
      ],
      highlight: "uː",
    },
    {
      id: "example-1",
      type: "example",
      title: "Feel the Coordinates Shift",
      phrase: "She saw a blue cat in the cool stream",
      ipa: "/ʃiː sɔː ə bluː kæt ɪn ðə kuːl striːm/",
      highlightWords: ["She", "saw", "blue", "cat", "cool"],
      tip: "Walk through the vowel positions in order: /iː/ (front-high), /ɔː/ (back-mid), /uː/ (back-high), /æ/ (front-low), /uː/ (back-high). The jaw and lips move a lot — that's correct.",
      tapWords: [
        { word: "she", ipa: "/ʃiː/" },
        { word: "saw", ipa: "/sɔː/" },
        { word: "blue", ipa: "/bluː/" },
        { word: "cat", ipa: "/kæt/" },
        { word: "cool", ipa: "/kuːl/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap Each Position",
      description: "Tap each word and notice where your tongue and lips land. Cover all four corners of the vowel space.",
      words: [
        { word: "see", ipa: "/siː/", meaning: "front-high, spread" },
        { word: "cat", ipa: "/kæt/", meaning: "front-low, spread" },
        { word: "blue", ipa: "/bluː/", meaning: "back-high, rounded" },
        { word: "father", ipa: "/ˈfɑːðər/", meaning: "back-low, relaxed" },
        { word: "goat", ipa: "/ɡoʊt/", meaning: "back-mid, rounded" },
        { word: "face", ipa: "/feɪs/", meaning: "front-mid, spread" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Mirror Test",
      body: "Stand in front of a mirror and say 'see — cat — blue — father'. Your lips should travel through a full square: spread (see), wider spread (cat), tight circle (blue), relaxed open (father). If your lips barely move, you're pronouncing every vowel with the same neutral mouth — that's the giveaway that gives you a 'flat' accent. Exaggerate the lip motion for 2 weeks; it will naturally tone down once the muscle memory is built.",
      variant: "info",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "Beat the bad cat in the back booth",
      ipa: "/biːt ðə bæd kæt ɪn ðə bæk buːθ/",
      tip: "Bounce between front-high /iː/ (beat), front-low /æ/ (bad, cat, back), and back-high /uː/ (booth). Feel the jaw drop on /æ/ and the lips round for /uː/.",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which vowel requires the lips to be tightly rounded into a circle AND the back of the tongue raised high?",
      options: ["/iː/ as in 'see'", "/æ/ as in 'cat'", "/uː/ as in 'blue'", "/ɑː/ as in 'father'"],
      correct: 2,
      explanation:
        "/uː/ is a back-high vowel with rounded lips — the back of the tongue lifts toward the soft palate while the lips push forward into a tight circle. /iː/ is high but spread; /æ/ is low and spread; /ɑː/ is low with relaxed lips.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Mouth Positioning Complete!",
      subtitle: "You can now place any vowel in 3D mouth space.",
      xp: 125,
      badge: "👄 Mouth Mechanic",
      nextLessonTitle: "Listening Recognition",
    },
  ],
};

export default lesson;
