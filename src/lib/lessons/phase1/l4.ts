import type { Lesson } from "../../types";

// Phase 1 — Lesson 4: Listening Recognition
// You cannot produce a sound you cannot hear. This lesson trains minimal-pair
// discrimination — the perceptual skill that lets a learner distinguish
// /iː/ from /ɪ/, /æ/ from /e/, etc. Production follows perception.

const lesson: Lesson = {
  id: "p1l4",
  phaseId: 0,
  lessonIndex: 3,
  title: "Listening Recognition",
  subtitle: "Hear the difference before you can say the difference",
  duration: 10,
  xp: 130,
  objectives: [
    "Discriminate the four critical minimal pairs: /iː/-/ɪ/, /æ/-/e/, /ɑː/-/ʌ/, /uː/-/ʊ/",
    "Map perceptual differences onto vowel-chart coordinates",
    "Self-correct by comparing your own production to the native model",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Listening Recognition",
      subtitle: "Train the ear, the mouth will follow",
      description:
        "Your brain filters out sound distinctions your native language doesn't use. That's why 'sheep' and 'ship' can sound identical to a learner — until you retrain the perceptual map. This lesson rebuilds that map using minimal pairs: words that differ by exactly one sound.",
      visual: "compare-wave",
      emoji: "👂",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "What Is a Minimal Pair?",
      body: [
        "A minimal pair is two words that differ in exactly one sound — like 'sheep' /ʃiːp/ vs 'ship' /ʃɪp/, or 'bad' /bæd/ vs 'bed' /bed/. Because everything else is identical, your ear is forced to focus on the one difference.",
        "This is the most powerful tool in pronunciation training. Studies show that 20 minutes of minimal-pair listening per day for two weeks can rewire the brain's perceptual categories — even before you try to say the words.",
        "The four pairs in this lesson cover the most common confusions for learners from any language background: tense vs lax /iː/-/ɪ/, open vs mid /æ/-/e/, back vs central /ɑː/-/ʌ/, and tense vs lax /uː/-/ʊ/.",
      ],
      bulletPoints: [
        "/iː/ vs /ɪ/ — sheep vs ship, beat vs bit, feel vs fill",
        "/æ/ vs /e/ — bad vs bed, man vs men, sat vs set",
        "/ɑː/ vs /ʌ/ — caught vs cot, heart vs hut, calm vs come",
        "/uː/ vs /ʊ/ — pool vs pull, food vs foot, fool vs full",
      ],
      visual: "compare-wave",
      visualLabel: "Waveforms of a minimal pair",
    },
    {
      id: "compare-sheep-ship",
      type: "compare",
      title: "Sheep vs Ship — /iː/ vs /ɪ/",
      nativePhrase: "sheep",
      learnerPhrase: "ship",
      nativeIpa: "/ʃiːp/",
      learnerIpa: "/ʃɪp/",
      description:
        "The native /iː/ is longer and brighter — the tongue is high and forward, lips spread wide. The learner /ɪ/ is shorter and more relaxed — the tongue sits a bit lower and further back. The waveform of /iː/ shows a longer, more stable vowel segment.",
    },
    {
      id: "compare-bad-bed",
      type: "compare",
      title: "Bad vs Bed — /æ/ vs /e/",
      nativePhrase: "bad",
      learnerPhrase: "bed",
      nativeIpa: "/bæd/",
      learnerIpa: "/bed/",
      description:
        "Native /æ/ drops the jaw lower than learners expect — almost biting into an apple. /e/ (as in 'bed') keeps the tongue higher and more central. Learners typically merge both into something like /e/, losing the openness of /æ/.",
    },
    {
      id: "vowel-chart",
      type: "vowel-chart",
      title: "See the Minimal Pairs on the Chart",
      description:
        "Notice how each pair sits at a different HEIGHT on the vowel chart. The tense vowel (/iː/, /uː/) is higher and longer than its lax partner (/ɪ/, /ʊ/). The open vowel (/æ/) is lower than the mid (/e/).",
      vowels: [
        { ipa: "iː", x: 18, y: 18, label: "sheep", color: "#22d3ee" },
        { ipa: "ɪ", x: 30, y: 38, label: "ship", color: "#6366f1" },
        { ipa: "e", x: 36, y: 50, label: "bed", color: "#a78bfa" },
        { ipa: "æ", x: 22, y: 80, label: "bad", color: "#f59e0b" },
        { ipa: "ʌ", x: 52, y: 60, label: "hut", color: "#ec4899" },
        { ipa: "ɑː", x: 82, y: 82, label: "cot", color: "#ef4444" },
        { ipa: "ʊ", x: 75, y: 38, label: "pull", color: "#8b5cf6" },
        { ipa: "uː", x: 88, y: 22, label: "pool", color: "#06b6d4" },
      ],
      highlight: "iː",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Minimal-Pair Drill",
      description: "Tap each pair, alternating between the two. Close your eyes and try to predict which one you'll hear before you tap.",
      words: [
        { word: "sheep", ipa: "/ʃiːp/", meaning: "vs ship" },
        { word: "ship", ipa: "/ʃɪp/", meaning: "vs sheep" },
        { word: "bad", ipa: "/bæd/", meaning: "vs bed" },
        { word: "bed", ipa: "/bed/", meaning: "vs bad" },
        { word: "caught", ipa: "/kɔːt/", meaning: "vs cot" },
        { word: "cot", ipa: "/kɑːt/", meaning: "vs caught" },
        { word: "pool", ipa: "/puːl/", meaning: "vs pull" },
        { word: "pull", ipa: "/pʊl/", meaning: "vs pool" },
      ],
    },
    {
      id: "example-1",
      type: "example",
      title: "Minimal Pairs in a Sentence",
      phrase: "She saw sheep on the ship and pulled a fool from the pool",
      ipa: "/ʃiː sɔː ʃiːp ɒn ðə ʃɪp ænd pʊld ə fuːl frəm ðə puːl/",
      highlightWords: ["sheep", "ship", "pulled", "fool", "pool"],
      tip: "Three minimal pairs in one sentence. Listen for the length difference: the tense vowels /iː/ and /uː/ are clearly longer than the lax /ɪ/ and /ʊ/.",
      tapWords: [
        { word: "sheep", ipa: "/ʃiːp/" },
        { word: "ship", ipa: "/ʃɪp/" },
        { word: "pulled", ipa: "/pʊld/" },
        { word: "fool", ipa: "/fuːl/" },
        { word: "pool", ipa: "/puːl/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Length Test",
      body: "Tense vowels (/iː/, /uː/, /eɪ/, /aɪ/, /ɔː/) are physically 1.5 to 2 times longer than lax vowels (/ɪ/, /ʊ/, /e/, /ʌ/). When in doubt, clap once on the vowel: if you can fit a full clap, it's tense; if the clap gets cut short, it's lax. This single test resolves 80% of minimal-pair confusion.",
      variant: "info",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "The sheep in the ship felt the fool pull the pool",
      ipa: "/ðə ʃiːp ɪn ðə ʃɪp fɛlt ðə fuːl pʊl ðə puːl/",
      tip: "Slow down. Stretch the tense vowels (/iː/, /uː/) and clip the lax ones (/ɪ/, /ʊ/). The contrast should be obvious.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which pair is NOT a minimal pair (i.e., the two words differ by more than one sound)?",
      options: [
        "sheep / ship",
        "bad / bed",
        "caught / cot",
        "school / pool",
      ],
      correct: 3,
      explanation:
        "'School' /skuːl/ and 'pool' /puːl/ differ in TWO sounds: the initial consonant (/sk/ vs /p/) AND no vowel change. A true minimal pair must differ by exactly ONE sound. The other three options each differ in only the vowel.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Listening Recognition Complete!",
      subtitle: "Your ear can now split fine vowel distinctions. Phase 1 finished — you are a Sound Seeker.",
      xp: 130,
      badge: "👂 Sound Seeker",
      nextLessonTitle: "100 Core Words",
    },
  ],
};

export default lesson;
