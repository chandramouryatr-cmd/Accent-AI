import type { Lesson } from "../../types";

// Phase 6 — Lesson 1: Shadowing Technique
// The shadowing method: listen, repeat immediately, match everything.
// 11 steps: intro, concept, concept, shadow, example, rhythm, tap-pronounce, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p6l1",
  phaseId: 5,
  lessonIndex: 0,
  title: "Shadowing Technique",
  subtitle: "Listen, repeat, match — the fastest path to native-like speech",
  duration: 10,
  xp: 160,
  objectives: [
    "Master the three-step shadowing cycle: listen → echo → match",
    "Understand why shadowing builds motor memory faster than reading aloud",
    "Shadow a real phrase with attention to rhythm, pitch, and linking",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Shadowing Technique",
      subtitle: "Speak on the heels of the native voice",
      description:
        "Shadowing is the technique polyglots swear by: you listen to a native speaker and speak along with them — slightly behind, like a shadow. Not after, not before, but overlapping. This forces your brain to map sound to motor output in real time, which is exactly how a child learns their first language.",
      visual: "shadow",
      emoji: "🪞",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Shadowing Works",
      body: [
        "Reading a transcript and then repeating is slow: you engage the visual system, decode text, then translate to sound. Shadowing cuts out the visual middleman. The sound goes in your ear and comes out your mouth in one continuous loop.",
        "This builds motor memory — the same kind of memory that lets you ride a bike without thinking. After enough shadowing repetitions, your mouth knows the shape of English phrases the way your hands know the shape of a doorknob.",
        "The secret is simultaneity. If you wait until the sentence ends to repeat, you are using short-term memory and you will simplify. If you echo while the native is still speaking, you are forced to match their exact rhythm and reductions in real time.",
      ],
      bulletPoints: [
        "Ear-to-mouth loop bypasses text and translation",
        "Builds motor memory for English sound shapes",
        "Forces real-time rhythm matching (no slowing down)",
        "Trains breath, pausing, and intonation simultaneously",
      ],
      visual: "shadow",
      visualLabel: "The shadowing loop",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "The Three-Step Cycle",
      body: [
        "Effective shadowing is not random echoing. It is a structured three-step cycle that you repeat for each phrase until it flows.",
        "First, listen — passively, twice through, just to absorb the melody. Then echo — speak along with the native, slightly behind, matching everything you can. Finally, match — record yourself shadowing and compare to the original. Iterate until they align.",
      ],
      bulletPoints: [
        "Step 1 — LISTEN: hear the phrase 2 times, no speaking",
        "Step 2 — ECHO: speak along with the native, half a beat behind",
        "Step 3 — MATCH: record and compare; refine the gaps",
        "Repeat each phrase 5–10 times before moving on",
      ],
      visual: "phoneme-grid",
      visualLabel: "Listen → Echo → Match",
    },
    {
      id: "shadow-1",
      type: "shadow",
      title: "Shadow This Phrase",
      phrase: "I was thinking we could grab lunch sometime this week",
      ipa: "/aɪ wəz ˈθɪŋkɪn wi kəd ɡræb ˈlʌntʃ ˈsʌmtaɪm ðɪs wiːk/",
      description:
        "Play the audio and start speaking about half a second behind the native voice. Don't read the text — let your ear drive your mouth. Match the rhythm peaks on THINKING, GRAB, LUNCH, SOMETIME, WEEK.",
    },
    {
      id: "example-1",
      type: "example",
      title: "What Good Shadowing Sounds Like",
      phrase: "I was thinking we could grab lunch sometime this week",
      ipa: "/aɪ wəz ˈθɪŋkɪn wi kəd ɡræb ˈlʌntʃ ˈsʌmtaɪm ðɪs wiːk/",
      highlightWords: ["thinking", "grab", "lunch", "sometime", "week"],
      tip: "Note the reductions: 'thinking' loses its /g/, 'could' reduces to /kəd/, 'sometime' is one smooth unit. Your shadow must match all of these.",
      tapWords: [
        { word: "thinking", ipa: "/ˈθɪŋkɪn/" },
        { word: "could", ipa: "/kəd/" },
        { word: "lunch", ipa: "/ˈlʌntʃ/" },
      ],
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "The Beat Grid to Match",
      phrase: "I was thinking we could grab lunch",
      beats: [
        { text: "I", duration: 0.5, stressed: false },
        { text: "was", duration: 0.5, stressed: false },
        { text: "THINK", duration: 1.5, stressed: true },
        { text: "ing", duration: 0.5, stressed: false },
        { text: "we", duration: 0.5, stressed: false },
        { text: "could", duration: 0.5, stressed: false },
        { text: "GRAB", duration: 1, stressed: true },
        { text: "LUNCH", duration: 1.5, stressed: true },
      ],
      description:
        "Three strong beats (THINK, GRAB, LUNCH) with the same time gap between them. The unstressed syllables fold into the gaps. Match these peaks first; the rest follows.",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Shadow-Friendly Short Phrases",
      description: "Start with these short phrases. Tap to hear, then shadow immediately. Five reps each before moving on.",
      words: [
        { word: "I dunno, maybe", ipa: "/aɪ dəˈnoʊ ˈmeɪbi/", meaning: "casual hesitation" },
        { word: "Yeah, sounds good", ipa: "/jɛə ˈsaʊndz ɡʊd/", meaning: "agreement" },
        { word: "Let me think", ipa: "/ˈlemi ˈθɪŋk/", meaning: "buying time" },
        { word: "That's awesome", ipa: "/ðæts ˈɔːsəm/", meaning: "enthusiasm" },
        { word: "Hold on a sec", ipa: "/ˈhoʊld ɒn ə sɛk/", meaning: "pause request" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Earphones, Not Speakers",
      body: "Shadow with earphones, not speakers. With earphones, the native voice lives inside your head alongside your own voice — you can hear the gap between them and adjust in real time. With speakers, your own voice bounces off the room and you lose the fine-grained feedback. One earphone in, one out is the sweet spot: native voice in one ear, your own voice in the other.",
      variant: "info",
    },
    {
      id: "practice",
      type: "practice",
      title: "Shadow and Record",
      phrase: "What do you mean by that?",
      ipa: "/ˈwʌtʃə juː ˈmiːn baɪ ðæt/",
      tip: "Shadow this 5 times, then record yourself on the 6th. Compare to the original. The gap you hear is the gap you'll close next week.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "What is the correct shadowing sequence for one phrase?",
      options: [
        "Echo → Listen → Match",
        "Listen → Echo → Match",
        "Match → Listen → Echo",
        "Listen → Match → Echo",
      ],
      correct: 1,
      explanation:
        "Listen first (absorb the melody without speaking), then echo (speak along with the native, half a beat behind), then match (record and compare to find the gaps). Skipping the listen phase makes you guess; skipping the match phase means you never know what to fix.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Shadowing Technique Complete!",
      subtitle: "You can now use the listen–echo–match cycle to build native-like motor memory.",
      xp: 160,
      badge: "🪞 Shadow Apprentice",
      nextLessonTitle: "Prosody Copying",
    },
  ],
};

export default lesson;
