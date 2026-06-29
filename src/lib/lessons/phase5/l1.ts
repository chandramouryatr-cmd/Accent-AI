import type { Lesson } from "../../types";

// Phase 5 — Lesson 1: Gonna & Wanna
// Native compression: going to → gonna, want to → wanna, got to → gotta, have to → hafta.
// 11 steps: intro, concept, concept, example, tap-pronounce, rhythm, tip, example, practice, quiz, completion.

const lesson: Lesson = {
  id: "p5l1",
  phaseId: 4,
  lessonIndex: 0,
  title: "Gonna & Wanna",
  subtitle: "Turn careful 'going to' into native 'gonna' — and 3 more reductions",
  duration: 9,
  xp: 150,
  objectives: [
    "Produce the four core reductions: gonna /ɡənə/, wanna /wɒnə/, gotta /ˈɡɒdə/, hafta /ˈhæftə/",
    "Know when reductions are appropriate (casual) and when they are not (formal)",
    "Hear the difference between written 'going to' and spoken 'gonna'",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Gonna & Wanna",
      subtitle: "The sound of casual English",
      description:
        "Native speakers almost never say 'going to' or 'want to' in full — they compress these into 'gonna' and 'wanna'. This lesson trains your ear and mouth to use the four core reductions that make speech flow at native speed.",
      visual: "wave",
      emoji: "⚡",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Native Speech Compresses",
      body: [
        "English is a stress-timed language: stressed syllables come at roughly equal intervals, and the unstressed spaces between them shrink. To keep the rhythm moving, native speakers squash function-word clusters into single reduced units.",
        "These reductions are not slang or laziness — they are the default pronunciation in casual conversation. Saying 'I am going to go' in full sounds robotic and overly careful to a native ear.",
      ],
      bulletPoints: [
        "going to → gonna /ˈɡənə/ (the /ŋ/ becomes /n/)",
        "want to → wanna /ˈwɒnə/ (the /t/ is dropped)",
        "got to → gotta /ˈɡɒdə/ (the /t/ becomes a flap /d/)",
        "have to → hafta /ˈhæftə/ (the /v/ becomes /f/ before voiceless /t/)",
      ],
      visual: "ipa-chart",
      visualLabel: "The four core reductions",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "When to Reduce — and When Not To",
      body: [
        "Reductions signal register. Use them freely with friends, family, and informal colleagues. They say: 'we are relaxed together.'",
        "Avoid them in job interviews, legal testimony, academic presentations, and any context where precision and formality matter. In those settings, the full form 'going to' or 'have to' carries authority.",
      ],
      bulletPoints: [
        "✅ Casual: 'I'm gonna grab coffee — you wanna come?'",
        "✅ Friendly workplace: 'We've gotta wrap this up by five.'",
        "❌ Formal: 'I am going to submit the report on Friday.'",
        "❌ Legal/academic: 'The defendant has to appear in court.'",
      ],
      visual: "phoneme-grid",
      visualLabel: "Register match: tone ↔ reduction",
    },
    {
      id: "example-1",
      type: "example",
      title: "Gonna in a Real Sentence",
      phrase: "I'm gonna call you back in a minute",
      ipa: "/aɪm ˈɡənə kɔːl juː ˈbæk ɪn ə ˈmɪnɪt/",
      highlightWords: ["gonna", "call", "back", "minute"],
      tip: "The stress falls on call, back, minute — the verbs and nouns. 'Gonna' itself is unstressed and quick.",
      tapWords: [
        { word: "gonna", ipa: "/ˈɡənə/" },
        { word: "call", ipa: "/kɔːl/" },
        { word: "back", ipa: "/ˈbæk/" },
        { word: "minute", ipa: "/ˈmɪnɪt/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Hear Each Reduction",
      description: "Tap each pair. Notice how the right side fuses two words into one smooth unit.",
      words: [
        { word: "going to → gonna", ipa: "/ˈɡənə/", meaning: "future intention" },
        { word: "want to → wanna", ipa: "/ˈwɒnə/", meaning: "desire" },
        { word: "got to → gotta", ipa: "/ˈɡɒdə/", meaning: "necessity" },
        { word: "have to → hafta", ipa: "/ˈhæftə/", meaning: "obligation" },
        { word: "got you → gotcha", ipa: "/ˈɡɒtʃə/", meaning: "I understand / I caught you" },
        { word: "out of → outta", ipa: "/ˈaʊtə/", meaning: "from / leaving" },
      ],
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "The Rhythm of a Reduced Sentence",
      phrase: "What are you going to do tonight?",
      beats: [
        { text: "Whatcha", duration: 1, stressed: false },
        { text: "gonna", duration: 1, stressed: false },
        { text: "do", duration: 1, stressed: true },
        { text: "to", duration: 0.5, stressed: false },
        { text: "NIGHT", duration: 2, stressed: true },
      ],
      description:
        "Two long stressed beats (DO, NIGHT) carry the meaning. Everything else compresses into short, equal-length unstressed beats. That contrast is the heartbeat of native English.",
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — The Flap T",
      body: "Inside 'gotta', the double-t is not pronounced /t/ — it becomes a flap /d/, the same sound as the 'dd' in 'ladder'. Touch the tongue to the ridge behind your upper teeth for just a flicker of a second. That tiny tap is what makes 'gotta' sound American instead of careful.",
      variant: "info",
    },
    {
      id: "example-2",
      type: "example",
      title: "Wanna, Gotta, Hafta Together",
      phrase: "You wanna leave now? I gotta finish this, but I hafta be home by eight.",
      ipa: "/jə ˈwɒnə liːv naʊ aɪ ˈɡɒdə ˈfɪnɪʃ ðɪs bʌt aɪ ˈhæftə biː hoʊm baɪ eɪt/",
      highlightWords: ["wanna", "leave", "gotta", "finish", "hafta", "home", "eight"],
      tip: "Three reductions in one breath — that is what natural English actually sounds like.",
      tapWords: [
        { word: "wanna", ipa: "/ˈwɒnə/" },
        { word: "gotta", ipa: "/ˈɡɒdə/" },
        { word: "hafta", ipa: "/ˈhæftə/" },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Say It Like a Native",
      phrase: "I'm gonna have to wanna do it",
      ipa: "/aɪm ˈɡənə ˈhæftə ˈwɒnə duː ɪt/",
      tip: "Chain the four reductions together smoothly. Keep your jaw relaxed — reductions are made with minimal mouth movement.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which reduction turns 'I have to go' into casual spoken English?",
      options: [
        "I'm gonna go",
        "I hafta go",
        "I gotta go",
        "I wanna go",
      ],
      correct: 1,
      explanation:
        "'Have to' reduces to 'hafta' /ˈhæftə/ — the /v/ assimilates to /f/ before the voiceless /t/. 'Gonna' is 'going to', 'gotta' is 'got to', and 'wanna' is 'want to'.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Gonna & Wanna Complete!",
      subtitle: "You can now produce the four core reductions and know when to use them.",
      xp: 150,
      badge: "⚡ Reduction Rookie",
      nextLessonTitle: "Reduced Vowels",
    },
  ],
};

export default lesson;
