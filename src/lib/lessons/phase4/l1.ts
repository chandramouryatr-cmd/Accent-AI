import type { Lesson } from "../../types";

// Phase 4 — Lesson 1: Casual Greetings
// How's it going?, What's up?, How are ya? — the reduced forms, the flap T
// in "water", the casual rhythm that signals friendship.

const lesson: Lesson = {
  id: "p4l1",
  phaseId: 3,
  lessonIndex: 0,
  title: "Casual Greetings",
  subtitle: "Sound friendly, relaxed, and native from the first word",
  duration: 9,
  xp: 140,
  objectives: [
    "Use casual greetings like 'How's it going?' and 'What's up?'",
    "Reduce function words: 'How are you' → 'How are ya' /haʊərjə/",
    "Produce the American flap T /ɾ/ (water → 'wader')",
    "Match the right greeting to the right social context",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Casual Greetings",
      subtitle: "First impressions in two seconds",
      description:
        "The first thing you say sets the tone. A stiff 'How do you do?' sounds formal and distant. A relaxed 'How's it going?' instantly signals you're friendly and approachable. This lesson teaches the sounds and rhythm of casual English greetings.",
      visual: "wave",
      emoji: "👋",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Formal vs Casual Register",
      body: [
        "English speakers shift register constantly — formal at a job interview, casual with friends. The greeting is the first signal. Using a formal greeting with a friend feels cold; using a casual greeting with a stranger can feel too familiar.",
        "Casual greetings use reduced forms: shorter words, swallowed syllables, schwa /ə/ everywhere. 'How are you' compresses to 'How are ya' /haʊərjə/. 'What is up' becomes 'Whaddup' /wəˈdʌp/. These reductions signal ease and familiarity.",
      ],
      bulletPoints: [
        "Formal: 'Good morning.' / 'How do you do?' / 'Pleased to meet you.'",
        "Neutral: 'How are you?' / 'Nice to meet you.' / 'Hello.'",
        "Casual: 'How's it going?' / 'What's up?' / 'How are ya?'",
        "Very casual: 'Hey!' / 'Yo!' / 'Whaddup?' / 'How's tricks?'",
        "Match the register to the relationship — too casual feels rude, too formal feels cold",
      ],
      visual: "compare-wave",
      visualLabel: "Casual speech compresses; formal speech articulates",
    },
    {
      id: "example-1",
      type: "example",
      title: "A Real Casual Exchange",
      phrase: "Hey! How's it going? — Not bad, you? — Pretty good. What's up?",
      ipa: "/heɪ | haʊzɪt ˈɡoʊɪŋ | nɒt bæd juː | ˈprɪti ɡʊd | wʌtsʌp/",
      highlightWords: ["How's", "going", "bad", "good", "What's", "up"],
      tip: "'How's it going' blurs into /haʊzɪtˈɡoʊɪŋ/ — three words become one beat. 'What's up' compresses to /wʌtsʌp/. The rhythm is loose and friendly, not sharp. Stress 'bad,' 'good,' and 'up' lightly.",
      tapWords: [
        { word: "How's it going", ipa: "/haʊzɪtˈɡoʊɪŋ/" },
        { word: "Not bad, you?", ipa: "/nɒtbæd juː/" },
        { word: "Pretty good", ipa: "/ˈprɪtiɡʊd/" },
        { word: "What's up", ipa: "/wʌtsʌp/" },
      ],
    },
    {
      id: "mouth-flap-t",
      type: "mouth-diagram",
      title: "The American Flap T /ɾ/",
      description:
        "In American English, a 't' between two vowels often becomes a flap /ɾ/ — the tongue quickly taps the alveolar ridge once, sounding almost like a fast /d/. 'Water' becomes 'wader' /ˈwɑːɾər/. 'Better' becomes 'bedder.' The tongue barely touches — much lighter than a full /t/ or /d/.",
      tonguePosition: "front-mid",
      lipShape: "relaxed",
      sound: "ɾ",
      exampleWord: "water / better / city / party",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Greeting Variants",
      description:
        "Each greeting has a formal version and a casual version. Tap to hear how the casual form compresses and reduces.",
      words: [
        { word: "How are you?", ipa: "/haʊ ɑːr juː/", meaning: "neutral — clear" },
        { word: "How are ya?", ipa: "/ˈhaʊərjə/", meaning: "casual — reduced" },
        { word: "How's it going?", ipa: "/ˈhaʊzɪtɡoʊɪŋ/", meaning: "casual — linked" },
        { word: "What's up?", ipa: "/wʌtsˈʌp/", meaning: "very casual" },
        { word: "Whaddup?", ipa: "/wəˈdʌp/", meaning: "slang — fully reduced" },
        { word: "Good morning.", ipa: "/ɡʊd ˈmɔːrnɪŋ/", meaning: "formal" },
        { word: "Morning!", ipa: "/ˈmɔːrnɪn/", meaning: "casual — dropped 'good'" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Head Nod",
      body: "Casual greetings come with body language. A small upward head nod (chin lifts) signals familiarity and warmth — used between friends. A small downward nod (chin drops) signals respect — used with strangers or superiors. Pair 'How's it going?' with an upward nod and you'll sound instantly native.",
      variant: "success",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Common Greeting Responses",
      body: [
        "Casual greetings have stock answers. You don't answer 'How's it going?' with a full report — you say 'Good, you?' or 'Not bad.' These are social rituals, not information exchanges.",
        "The unspoken rule: keep it short, keep it positive, and bounce the question back. Detailed answers are reserved for close friends or when the greeter clearly wants to talk.",
      ],
      bulletPoints: [
        "'How's it going?' → 'Good, you?' / 'Not bad.' / 'Pretty good.'",
        "'What's up?' → 'Not much.' / 'Nothing much.' / 'Just chillin'.'",
        "'How are ya?' → 'Good, how about you?'",
        "Never respond with a long list of complaints in a casual greeting",
        "Returning the question ('you?') signals interest without commitment",
      ],
      visual: "shadow",
      visualLabel: "Greetings are rhythmic call-and-response",
    },
    {
      id: "practice",
      type: "practice",
      title: "Greet Like a Native",
      phrase: "Hey! How's it going? — Pretty good, you? — Not bad.",
      ipa: "/heɪ | haʊzɪt ˈɡoʊɪŋ | ˈprɪtiɡʊd juː | nɒtbæd/",
      tip: "Keep the rhythm loose. Don't articulate every word. Let 'How's it going' run together. The flap T in 'pretty' (/ˈprɪɾi/) sounds almost like 'priddy.'",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "You walk into your office and see a coworker you chat with daily. Which greeting is MOST appropriate?",
      options: [
        "'Good morning. How do you do?'",
        "'Hey! How's it going?'",
        "'Whaddup?'",
        "(silent nod only)",
      ],
      correct: 1,
      explanation:
        "'How's it going?' is the perfect casual-but-professional greeting for a familiar coworker. 'How do you do?' is too formal — sounds stiff and old-fashioned. 'Whaddup?' is too casual for most workplaces. Silence is fine for passing strangers, but for someone you chat with daily, a quick 'How's it going?' shows warmth without overstepping.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Casual Greetings Complete!",
      subtitle: "You can now greet anyone in casual English with the right rhythm, reductions, and body language.",
      xp: 140,
      badge: "👋 Greeting Pro",
      nextLessonTitle: "Expressing Emotions",
    },
  ],
};

export default lesson;
