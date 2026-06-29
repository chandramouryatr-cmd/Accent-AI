import type { Lesson } from "../../types";

// Phase 4 — Lesson 3: Questions & Answers
// Rising vs falling intonation, wh- questions, echo questions, and the
// subtle politics of tag questions ("You're coming, aren't you?").

const lesson: Lesson = {
  id: "p4l3",
  phaseId: 3,
  lessonIndex: 2,
  title: "Questions & Answers",
  subtitle: "Rise to ask, fall to confirm — and the politics of tag questions",
  duration: 10,
  xp: 150,
  objectives: [
    "Produce rising intonation on yes/no questions /juː ˈkʌmɪŋ təˈnaɪt↗/",
    "Produce falling intonation on wh- questions /ˈwɛr iz ʃi↘/",
    "Use tag questions and pick rising (uncertain) vs falling (confident)",
    "Build echo questions to confirm what you just heard",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Questions & Answers",
      subtitle: "Pitch direction is the question mark you can hear",
      description:
        "In writing, every question ends with '?'. In speech, the question mark is in the melody — a rising pitch at the end signals 'I'm asking.' This lesson trains the rising contour for yes/no questions, the falling contour for wh- questions, and the subtle politics of tag questions like 'You're coming, aren't you?'",
      visual: "intonation",
      emoji: "❓",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Two Question Types, Two Contours",
      body: [
        "English questions sort into two families. Yes/no questions — 'Are you coming?' — rise at the end, signaling openness: the answer could go either way. Wh- questions — 'Where is she?' — fall at the end, because the speaker assumes the answer exists; they're just retrieving it. The pitch direction tells the listener which kind of question it is before the words are fully processed.",
        "Tag questions add a mini-question to a statement: 'You're coming, aren't you?' The tag's contour carries the social meaning. A rising tag ('aren't you↗?') means 'I'm not sure, please confirm' — genuine uncertainty. A falling tag ('aren't you↘?') means 'I'm sure, I just want you to agree' — pushing for confirmation. Same words, opposite social force.",
      ],
      bulletPoints: [
        "Yes/no question: rises at end — 'Are you ready↗?'",
        "Wh- question: falls at end — 'What time is it↘?'",
        "Tag question, rising tag: genuine uncertainty — 'It's cold, isn't it↗?'",
        "Tag question, falling tag: seeking agreement — 'Beautiful day, isn't it↘?'",
        "Echo question: repeat with rising pitch to confirm — 'She's WHAT↗?'",
        "Choice question: rise on each option, fall on last — 'Tea↗, coffee↗, or water↘?'",
      ],
      visual: "intonation",
      visualLabel: "Rise = open question; fall = closed retrieval",
    },
    {
      id: "intonation-rising",
      type: "intonation",
      title: "Rising Contour — Yes/No Question",
      phrase: "Are you coming tonight?",
      contour: [
        { x: 0, y: 35 },
        { x: 25, y: 40 },
        { x: 50, y: 45 },
        { x: 70, y: 55 },
        { x: 85, y: 70 },
        { x: 100, y: 85 },
      ],
      pattern: "rising",
      description:
        "Pitch starts around 35, stays low through 'Are you coming,' then climbs steadily on 'to-night' — the rise is the audible question mark. The last stressed syllable 'night' /naɪt/ gets the steepest climb. Without this rise, 'Are you coming tonight' sounds like a flat statement.",
    },
    {
      id: "example-tag",
      type: "example",
      title: "Tag Question — Real Exchange",
      phrase: "You're coming, aren't you? — Yeah, of course I am.",
      ipa: "/jʊər ˈkʌmɪŋ | ˈɑːrnt juː | jɛə | əvˈkɔːrs aɪ æm/",
      highlightWords: ["coming", "aren't", "Yeah", "course"],
      tip: "Stress 'coming' on the statement half. The tag 'aren't you' /ˈɑːrnt juː/ often reduces to /ˈɑːrn(t)ʃu/ — the 't' and 'y' fuse into /tʃ/. For uncertainty, rise on 'you.' For confidence, fall. The answer 'Yeah, of course I am' falls on 'course' — fully confident.",
      tapWords: [
        { word: "You're coming", ipa: "/jʊər ˈkʌmɪŋ/" },
        { word: "aren't you", ipa: "/ˈɑːrnt juː/" },
        { word: "of course", ipa: "/əvˈkɔːrs/" },
      ],
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Tag Questions — The Politics of Confirmation",
      body: [
        "Tag questions look small but carry heavy social weight. 'It's a lovely day, isn't it?' with a falling tag is a friendly invitation to agree — the speaker already knows the answer. The same sentence with a rising tag is a genuine question — the speaker is checking. Misread the contour and you misread the relationship: a rising tag answered with confident agreement feels pushy; a falling tag answered with 'I'm not sure' feels argumentative.",
        "Common tag forms follow the auxiliary: positive statement → negative tag ('You like it, don't you?'), negative statement → positive tag ('You don't smoke, do you?'). Irregular verbs 'be' and 'have' carry their own tags ('I'm late, aren't I?'). The tag's polarity is grammatical; the contour is social.",
      ],
      bulletPoints: [
        "Positive + negative tag: 'She's here, isn't she?'",
        "Negative + positive tag: 'He doesn't know, does he?'",
        "Modal tags: 'You can swim, can't you?' / 'We should go, shouldn't we?'",
        "First-person 'be': 'I'm next, aren't I?' (irregular — 'am' tags as 'aren't')",
        "Imperative tag: 'Open the door, will you?' (request softener)",
        "Let's tag: 'Let's go, shall we?' (invitation)",
      ],
      visual: "shadow",
      visualLabel: "Tags turn statements into social moves",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap the Question Words",
      description:
        "Wh- words carry the question's center of gravity. They get the strongest stress and the steadiest pitch. Tap each one — notice how the stressed syllable lands clearly, then the rest of the question falls away from it.",
      words: [
        { word: "who", ipa: "/huː/", meaning: "rising-falling — 'Who is that↘?'" },
        { word: "what", ipa: "/wʌt/", meaning: "strong onset — 'What do you want↘?'" },
        { word: "where", ipa: "/wɛər/", meaning: "stretch the vowel — 'Where are we↘?'" },
        { word: "when", ipa: "/wɛn/", meaning: "short and sharp — 'When is it↘?'" },
        { word: "why", ipa: "/waɪ/", meaning: "diphthong climb — 'Why did you↘?'" },
        { word: "how", ipa: "/haʊ/", meaning: "open diphthong — 'How does it work↘?'" },
        { word: "which", ipa: "/wɪtʃ/", meaning: "comparing options — 'Which one↘?'" },
      ],
    },
    {
      id: "rhythm-echo",
      type: "rhythm",
      title: "Echo Question Rhythm",
      phrase: "She's WHAT?",
      beats: [
        { text: "She's", duration: 1, stressed: false },
        { text: "WHAT", duration: 2, stressed: true },
      ],
      description:
        "Echo questions repeat a key word with explosive rising pitch to confirm what you just heard. 'She's WHAT↗?' The stressed word gets double duration and a sharp climb — pitch can jump from 50 to 95. The unstressed 'She's' /ʃiːz/ is quick and low. Loudness spikes on the echoed word.",
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Up-Nod of Uncertainty",
      body: "When native speakers ask a genuine yes/no question, the eyebrows often lift and the head tilts slightly up at the end — mirroring the rising pitch. When they ask a wh- question with falling intonation, the head often drops slightly at the end. Pair your contour with the matching body motion: lift the chin on a rising tag, drop it on a falling tag. The body reinforces the pitch and the listener reads both signals at once.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Ask a Real Tag Question",
      phrase: "You're coming, aren't you?",
      ipa: "/jʊər ˈkʌmɪŋ | ˈɑːrnt juː/",
      tip: "Stress 'coming' on the statement half, then rise on 'you' for genuine uncertainty. Reduce 'aren't you' to /ˈɑːrn tʃu/ — fuse the /t/ and /j/ into /tʃ/. Keep the rhythm loose; the tag is lighter than the statement.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question:
        "Your friend says 'It's freezing, isn't it?' with a FALLING tag. What does the falling contour signal?",
      options: [
        "Genuine uncertainty — they want to know if you're cold",
        "Confidence — they already know it's cold and want you to agree",
        "Confusion — they didn't hear the temperature",
        "Anger — they're upset about the weather",
      ],
      correct: 1,
      explanation:
        "A falling tag means 'I'm stating something I'm sure of, and I expect you to agree.' It's not a real question — it's a social ritual of shared experience. A RISING tag would signal genuine uncertainty ('I'm not sure, are you cold?'). Confusing the two can make you sound either pushy (falling when you should rise) or evasive (rising when you should fall).",
    },
    {
      id: "completion",
      type: "completion",
      title: "Question Prosody Mastered!",
      subtitle: "You can now rise for yes/no, fall for wh-, and pick the right tag contour to signal uncertainty or confidence.",
      xp: 150,
      badge: "❓ Question Pro",
      nextLessonTitle: "Small Talk Mastery",
    },
  ],
};

export default lesson;
