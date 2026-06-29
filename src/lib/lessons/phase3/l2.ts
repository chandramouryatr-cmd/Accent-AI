import type { Lesson } from "../../types";

// Phase 3 — Lesson 2: Sentence Melody
// Intonation: rising (questions), falling (statements), rise-fall (lists,
// surprise). The same words can mean totally different things depending
// on the pitch contour.

const lesson: Lesson = {
  id: "p3l2",
  phaseId: 2,
  lessonIndex: 1,
  title: "Sentence Melody",
  subtitle: "Use pitch to signal meaning, not just words",
  duration: 9,
  xp: 145,
  objectives: [
    "Produce a falling contour for statements and wh-questions",
    "Produce a rising contour for yes/no questions and uncertainty",
    "Use rise-fall for lists, surprise, and emphasis",
    "Hear how the same sentence changes meaning with melody",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Sentence Melody",
      subtitle: "Pitch is meaning",
      description:
        "The words 'You're coming' can be a statement, a question, or an expression of disbelief — all with the same letters. The difference is melody: the rise and fall of pitch across the sentence. Master intonation and your meaning becomes unmistakable.",
      visual: "intonation",
      emoji: "🎵",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Three Core Contours",
      body: [
        "English intonation is built on three primary pitch movements. Each one carries a different meaning, and native listeners decode them unconsciously — even children react to intonation before they understand words.",
        "Pitch is measured relative to your own voice baseline. A 'high' pitch for you may be lower than someone else's 'low' pitch. What matters is the direction and shape of the movement, not the absolute frequency.",
      ],
      bulletPoints: [
        "Falling ↘ — certainty, statements, wh-questions ('Where are you going?')",
        "Rising ↗ — uncertainty, yes/no questions, polite requests ('Are you coming?')",
        "Rise-Fall ↗↘ — surprise, lists, strong emotion ('You did WHAT?!')",
        "Fall-Rise ↘↗ — hesitation, implication, reservations ('It's... okay.')",
      ],
      visual: "intonation",
      visualLabel: "Pitch contours tell the listener how to interpret the words",
    },
    {
      id: "intonation-statement",
      type: "intonation",
      title: "Statement — Falling Contour",
      phrase: "You're coming.",
      contour: [
        { x: 5, y: 55 },
        { x: 25, y: 60 },
        { x: 50, y: 58 },
        { x: 70, y: 45 },
        { x: 90, y: 22 },
      ],
      pattern: "falling",
      description:
        "Pitch starts at mid-level and drops clearly at the end. This signals 'I am telling you a fact.' The downward movement gives the sentence finality and certainty. Try saying it like you're confirming a plan.",
    },
    {
      id: "intonation-question",
      type: "intonation",
      title: "Yes/No Question — Rising Contour",
      phrase: "You're coming?",
      contour: [
        { x: 5, y: 40 },
        { x: 25, y: 38 },
        { x: 50, y: 45 },
        { x: 70, y: 60 },
        { x: 90, y: 82 },
      ],
      pattern: "rising",
      description:
        "Pitch starts lower and rises sharply at the end. This signals 'I am asking, not telling.' The upward movement invites the listener to respond. Same words, completely different meaning — purely through melody.",
    },
    {
      id: "intonation-surprise",
      type: "intonation",
      title: "Surprise — Rise-Fall Contour",
      phrase: "You're coming?!",
      contour: [
        { x: 5, y: 35 },
        { x: 25, y: 65 },
        { x: 50, y: 90 },
        { x: 70, y: 75 },
        { x: 90, y: 20 },
      ],
      pattern: "rise-fall",
      description:
        "Pitch jumps up high and then crashes down — a wide pitch range. This signals shock or disbelief. The bigger the swing, the stronger the emotion. Notice how the contour goes much higher than the other two.",
    },
    {
      id: "example-1",
      type: "example",
      title: "Same Words, Three Meanings",
      phrase: "She's leaving.",
      ipa: "/ʃiːz ˈliːvɪŋ/",
      highlightWords: ["leaving"],
      tip: "Say this three ways. (1) Falling on 'leaving' = statement of fact. (2) Rising on 'leaving' = asking for confirmation. (3) Rise-fall on 'leaving' = shocked disbelief. The IPA is identical — only pitch changes.",
      tapWords: [
        { word: "She's", ipa: "/ʃiːz/" },
        { word: "leaving", ipa: "/ˈliːvɪŋ/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Compare Contours",
      description:
        "Each phrase uses the same vowels and consonants but a different pitch pattern. Tap and listen for the rise or fall at the end.",
      words: [
        { word: "Ready. (statement)", ipa: "/ˈrɛdi ↘/", meaning: "falling — confirmed" },
        { word: "Ready? (question)", ipa: "/ˈrɛdi ↗/", meaning: "rising — asking" },
        { word: "Ready?! (surprise)", ipa: "/ˈrɛdi ↗↘/", meaning: "rise-fall — shocked" },
        { word: "Okay. (accepting)", ipa: "/oʊˈkeɪ ↘/", meaning: "falling — agreement" },
        { word: "Okay... (hesitant)", ipa: "/oʊˈkeɪ ↘↗/", meaning: "fall-rise — reservation" },
        { word: "Okay?! (shocked)", ipa: "/oʊˈkeɪ ↗↘/", meaning: "rise-fall — disbelief" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: Exaggerate the Last Word",
      body: "When learning intonation, exaggerate the pitch movement on the final stressed word. Move it higher or lower than feels natural. Native speakers do this subtly, but the movement is always there. Practicing the exaggerated version wires the muscle memory — then you can dial it back.",
      variant: "success",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "List Intonation: Rise, Rise, Fall",
      body: [
        "Lists have a specific melody: each item rises except the last, which falls. This tells the listener 'there's more coming' versus 'this is the end.'",
        "Saying 'apples, oranges, and bananas' with rise-rise-fall signals completion. Saying it with rise-rise-rise leaves the listener waiting for more — a useful trick when you want to sound like you have more to add.",
      ],
      bulletPoints: [
        "Apples ↗ (more coming)",
        "Oranges ↗ (more coming)",
        "And bananas ↘ (finished)",
        "Wh-questions (what, where, why) fall — even though they're questions",
        "Yes/no questions rise — even though they're complete sentences",
      ],
      visual: "rhythm",
      visualLabel: "Each item in a list has its own pitch target",
    },
    {
      id: "practice",
      type: "practice",
      title: "Sing the Question",
      phrase: "Are you going to the party tonight?",
      ipa: "/ɑːr juː ˈɡoʊɪŋ tə ðə ˈpɑːrti təˈnaɪt ↗/",
      tip: "Hold 'tonight' and let the pitch climb. The question mark in speech comes from the rise, not the words. If your pitch falls on 'tonight,' it sounds like a statement.",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which intonation pattern signals a yes/no question in English?",
      options: [
        "Falling pitch at the end of the sentence",
        "Rising pitch at the end of the sentence",
        "Flat, level pitch throughout",
        "Rise-fall on every word",
      ],
      correct: 1,
      explanation:
        "Yes/no questions use a rising contour — pitch climbs at the end to signal 'I want an answer.' Statements and wh-questions (who, what, where) use a falling contour. The rise is what makes 'You're coming?' a question rather than a fact.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Sentence Melody Complete!",
      subtitle: "You can now shape meaning with pitch — turning statements into questions, surprise, or hesitation.",
      xp: 145,
      badge: "🎵 Melody Maker",
      nextLessonTitle: "Rhythm Patterns",
    },
  ],
};

export default lesson;
