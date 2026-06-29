import type { Lesson } from "../../types";

// Phase 2 — Lesson 3: Silent Letters
// English spelling is a fossil record of medieval pronunciation. Many letters
// were once pronounced but went silent over centuries. Knowing which letters
// are silent — and why — prevents both pronunciation errors and spelling
// mistakes. The pattern is more predictable than it looks.

const lesson: Lesson = {
  id: "p2l3",
  phaseId: 1,
  lessonIndex: 2,
  title: "Silent Letters",
  subtitle: "Spelling fossils that no one pronounces anymore",
  duration: 8,
  xp: 125,
  objectives: [
    "Recognize the six most common silent letters: k, w, b, h, t, gh",
    "Pronounce silent-letter words correctly by skipping the silent character",
    "Understand the historical origin of common silent-letter patterns",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Silent Letters",
      subtitle: "Letters you see but never say",
      description:
        "English spelling is a 600-year-old photograph of how people used to speak. Many letters were once pronounced but went silent over the centuries — and the spellings never caught up. 'Know' used to sound like 'kuh-now'. 'Knight' used to sound like 'kuh-nikht'. The letters stayed in the spelling even after the sounds disappeared. Learn the patterns and you'll stop pronouncing letters that aren't there.",
      visual: "phoneme-grid",
      emoji: "🤫",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Six Silent Letters",
      body: [
        "Six letters go silent in predictable patterns. Once you know the pattern, you can predict the silence in new words.",
        "Silent K — at the start of words beginning with 'kn': know, knee, knife, knock, knot. The /k/ was pronounced in Old English but dropped by the 1600s. The /n/ is what you actually say.",
        "Silent W — at the start of 'wr': write, wrong, wrist, wreck, wrinkle. Also silent in some 'wh' words: who, whom, whose, whole. The /w/ disappeared from 'wr-' words around 1450.",
        "Silent B — at the end of 'mb': lamb, climb, thumb, dumb, bomb, comb. The /b/ was pronounced in Middle English but stopped by 1500. Note: the /b/ IS pronounced in 'umber' and 'number' (those aren't 'mb' endings).",
        "Silent H — at the start of certain words of French origin: hour, honest, honor, heir. The /h/ was never pronounced in these Norman French borrowings.",
        "Silent T — in the cluster '-sten' and '-ftle': listen, fasten, castle, whistle, often. (Some speakers pronounce the /t/ in 'often' but it's considered over-pronunciation.)",
        "Silent GH — used to be a harsh Germanic throat sound (like the 'ch' in Scottish 'loch'). It went silent in 'igh' words (high, sigh, light, night) and disappeared entirely in 'though', 'through', 'thought'.",
      ],
      bulletPoints: [
        "Silent K: know, knee, knife, knock, knot",
        "Silent W: write, wrong, wrist, wreck, wrinkle",
        "Silent B (final mb): lamb, climb, thumb, dumb, bomb",
        "Silent H: hour, honest, honor, heir",
        "Silent T: listen, fasten, castle, whistle",
        "Silent GH: though, through, high, light, night",
      ],
      visual: "phoneme-grid",
      visualLabel: "The six silent-letter patterns",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Why Are They Silent? — The History",
      body: [
        "English spelling was standardized in the 1400s–1500s by the printing press, just as the pronunciation was changing rapidly. The spellings froze while the sounds kept moving.",
        "The Norman Conquest of 1066 brought French scribes who re-spelled English words to match French habits. They added silent letters to make English look more Latin: 'gilt' became 'guilt', 'rat' became 'rat' but 'rate' got an 'e'.",
        "Then the Great Vowel Shift (1400–1700) completely reshaped how English vowels sounded — but the spellings didn't update. By the time dictionaries were written in the 1700s, the mismatch was locked in forever.",
        "The result: English has about 44 sounds but only 26 letters to spell them. Silent letters are the residue of older pronunciations that the spelling can't let go of.",
      ],
      bulletPoints: [
        "Old English /k/ in 'kn-' → silent by 1600s",
        "Old English /w/ in 'wr-' → silent by 1450s",
        "Middle English /b/ in final '-mb' → silent by 1500s",
        "Norman French borrowings (hour, honest) → /h/ never existed",
        "Germanic /x/ in 'gh' → silent or became /f/ (laugh, cough) by 1700s",
      ],
      visual: "wave",
      visualLabel: "Pronunciation drift since the printing press",
    },
    {
      id: "mouth-know",
      type: "mouth-diagram",
      title: "Silent K in 'know' vs /n/",
      description:
        "For 'know' /noʊ/, start with the tongue in the /n/ position — tip on the alveolar ridge behind the upper teeth. Do NOT prepare a /k/ at the back of the mouth. The /k/ spelling is a fossil; only /n/ is real. The lips round slightly for the /oʊ/ at the end.",
      tonguePosition: "front-high",
      lipShape: "slightly-open",
      sound: "n",
      exampleWord: "know / knee / knife",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap the Silent-Letter Words",
      description: "Tap each word. Notice that the silent letter contributes nothing — the IPA shows what you actually say.",
      words: [
        { word: "know", ipa: "/noʊ/", meaning: "silent k" },
        { word: "write", ipa: "/raɪt/", meaning: "silent w" },
        { word: "lamb", ipa: "/læm/", meaning: "silent b" },
        { word: "honest", ipa: "/ˈɑːnɪst/", meaning: "silent h" },
        { word: "listen", ipa: "/ˈlɪsən/", meaning: "silent t" },
        { word: "though", ipa: "/ðoʊ/", meaning: "silent gh" },
        { word: "knight", ipa: "/naɪt/", meaning: "silent k + silent gh" },
        { word: "wrist", ipa: "/rɪst/", meaning: "silent w" },
      ],
    },
    {
      id: "example-1",
      type: "example",
      title: "Silent Letters in Context",
      phrase: "The honest knight wrote a song about the wrong lamb",
      ipa: "/ði ˈɑːnɪst naɪt roʊt ə sɔːŋ əˈbaʊt ðə rɔːŋ læm/",
      highlightWords: ["honest", "knight", "wrote", "wrong", "lamb"],
      tip: "Five silent letters in one sentence: h (honest), k+gh (knight), w (wrote), w (wrong), b (lamb). The spelling suggests ten consonants that you never actually pronounce.",
      tapWords: [
        { word: "honest", ipa: "/ˈɑːnɪst/" },
        { word: "knight", ipa: "/naɪt/" },
        { word: "wrote", ipa: "/roʊt/" },
        { word: "wrong", ipa: "/rɔːŋ/" },
        { word: "lamb", ipa: "/læm/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Write-It-Backwards Test",
      body: "When you learn a new English word with a weird spelling, write it out, then cross out the silent letters and write the IPA underneath. So 'knight' becomes 'k-n-i-g-h-t' → '_n-i-_-_-_-t' → /naɪt/. Doing this for 30 silent-letter words will permanently wire your brain to skip the silent characters. You'll start seeing the silent letters as visual decoration, not pronunciation instructions.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "The whole knight climbed through the castle at midnight",
      ipa: "/ðə hoʊl naɪt klaɪmd θruː ðə ˈkæsəl ət ˈmɪdnaɪt/",
      tip: "Six silent-letter words: whole (silent w), knight (silent k, gh), climbed (silent b), through (silent gh), castle (silent t), midnight (silent gh). Strip every silent letter before you say it.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which letter is silent in the word 'honest'?",
      options: ["The 'o'", "The 'h'", "The 'n'", "The 't'"],
      correct: 1,
      explanation:
        "The 'h' in 'honest' is silent — pronounced /ˈɑːnɪst/. This is because 'honest' was borrowed from Old French 'honest' (itself from Latin 'honorem'), and the Norman French never pronounced the /h/. The same pattern applies to hour, honor, heir, and herb (in American English).",
    },
    {
      id: "completion",
      type: "completion",
      title: "Silent Letters Complete!",
      subtitle: "You can now see through the spelling fossils and pronounce only what's actually there.",
      xp: 125,
      badge: "🤫 Silent Solver",
      nextLessonTitle: "Slow Repetition Drills",
    },
  ],
};

export default lesson;
