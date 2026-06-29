import type { Lesson } from "../../types";

// Phase 2 — Lesson 4: Slow Repetition Drills
// Slow practice builds muscle memory. Going 4x slower than normal forces the
// articulators (tongue, lips, jaw) to take the FULL path of every sound,
// eliminating shortcuts that produce accent errors. Speed comes later.

const lesson: Lesson = {
  id: "p2l4",
  phaseId: 1,
  lessonIndex: 3,
  title: "Slow Repetition Drills",
  subtitle: "Slow it down to 4x — accuracy first, speed follows",
  duration: 8,
  xp: 130,
  objectives: [
    "Master tongue-twister drills at slow tempo before attempting normal speed",
    "Use rhythmic beat training to time articulator movements precisely",
    "Build muscle memory through deliberate, exaggerated slow repetition",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Slow Repetition Drills",
      subtitle: "Slow is smooth, smooth is fast",
      description:
        "Speed hides errors. When you talk fast, your mouth takes shortcuts — and shortcuts are what produce accent. The fix feels counterintuitive: slow DOWN to 4x normal speed. At that pace, you can't cheat. Every vowel gets its full tongue position, every consonant its full release, every cluster its full glide. Build the muscle memory at slow speed, and native speed arrives for free.",
      visual: "rhythm",
      emoji: "🐢",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Slow Practice Works",
      body: [
        "Every physical skill — piano, martial arts, surgery, accent — is learned the same way: slow perfect repetition, then gradual speed-up. The brain builds neural pathways for each movement; sloppy fast practice wires in the sloppiness.",
        "When you speak at normal speed, your articulators skip micro-movements. The tongue doesn't quite reach the palate for /iː/. The lips don't quite round for /uː/. The result is a 'flat' vowel that sounds slightly off. You can't hear the error because it happens too fast.",
        "At 4x slow speed, every micro-movement becomes visible — and audible. You can hear exactly which vowel is collapsing, which consonant is being skipped. You correct it, repeat it slowly until it's perfect, then gradually bring the speed back up. This is the same method classical musicians use to master difficult passages.",
      ],
      bulletPoints: [
        "Slow = full articulator path, no shortcuts",
        "Slow = audible errors you can actually hear and fix",
        "Slow repetition = neural pathway myelination",
        "Perfect slow → automatic fast (muscle memory)",
        "Aim for 20 perfect slow reps before any speed-up",
      ],
      visual: "rhythm",
      visualLabel: "Rhythm grid: slow beats vs normal beats",
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "Beat the Tongue Twister Slowly",
      phrase: "She sells seashells by the seashore",
      beats: [
        { text: "She", duration: 3, stressed: true },
        { text: "sells", duration: 2, stressed: false },
        { text: "sea-", duration: 2, stressed: true },
        { text: "shells", duration: 3, stressed: false },
        { text: "by", duration: 1, stressed: false },
        { text: "the", duration: 1, stressed: false },
        { text: "sea-", duration: 2, stressed: true },
        { text: "shore", duration: 3, stressed: false },
      ],
      description:
        "Each beat is held for 2-3x normal duration. Stressed beats (She, sea-, sea-) get extra length and a higher pitch. The slow tempo forces your tongue to fully form the /ʃ/ in 'she' and 'shells' before releasing into the next vowel.",
    },
    {
      id: "example-1",
      type: "example",
      title: "The Classic: She Sells Seashells",
      phrase: "She sells seashells by the seashore",
      ipa: "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/",
      highlightWords: ["She", "sells", "seashells", "seashore"],
      tip: "The /ʃ/ sound (as in 'sh') appears four times — she, shells, sea-, shore. Each one needs the tongue blade flat against the alveolar ridge with the lips slightly pushed forward. At slow speed, you can feel each /ʃ/ fully form before the next vowel.",
      tapWords: [
        { word: "she", ipa: "/ʃiː/" },
        { word: "sells", ipa: "/sɛlz/" },
        { word: "seashells", ipa: "/ˈsiːʃɛlz/" },
        { word: "seashore", ipa: "/ˈsiːʃɔːr/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tongue Twister Sampler",
      description: "Tap each phrase to hear it at slow speed. Notice how every consonant gets its full release — no slurring, no shortcuts.",
      words: [
        { word: "Peter Piper", ipa: "/ˈpiːtər ˈpaɪpər/", meaning: "/p/ practice" },
        { word: "picked a peck", ipa: "/pɪkt ə pɛk/", meaning: "/p/ + /k/" },
        { word: "of pickled peppers", ipa: "/əv ˈpɪkəld ˈpɛpərz/", meaning: "/p/ cluster" },
        { word: "Red leather", ipa: "/rɛd ˈlɛðər/", meaning: "/l/ + /ð/" },
        { word: "yellow leather", ipa: "/ˈjɛloʊ ˈlɛðər/", meaning: "/j/ + /l/" },
        { word: "Unique New York", ipa: "/juːˈniːk nuː jɔːrk/", meaning: "/juː/ + /n/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The 4-2-1 Ladder",
      body: "Practice any difficult phrase at three speeds — 4x slow, 2x slow, then 1x normal. Do 5 perfect reps at 4x before moving to 2x. Do 5 perfect reps at 2x before moving to 1x. If you stumble at any speed, drop back down. This '4-2-1 ladder' is what actors use to learn difficult accents for film roles. Most learners skip the slow stages and never understand why their accent doesn't improve.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Drill: Peter Piper",
      phrase: "Peter Piper picked a peck of pickled peppers",
      ipa: "/ˈpiːtər ˈpaɪpər pɪkt ə pɛk əv ˈpɪkəld ˈpɛpərz/",
      tip: "Start at 4x slow — about one word every 2 seconds. Land every /p/ with a clean release (you should feel a tiny puff of air on your hand). Don't speed up until you can do 5 perfect reps at slow speed.",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Why does slow repetition build better accent muscle memory than fast practice?",
      options: [
        "Slow practice burns more calories, strengthening the tongue",
        "Slow practice forces full articulator movement and reveals audible errors",
        "Slow practice tricks the brain into thinking it has more time",
        "Slow practice is easier, so learners do it more often",
      ],
      correct: 1,
      explanation:
        "At slow speed, every articulator (tongue, lips, jaw) takes the FULL path of each sound — no shortcuts. You can actually hear errors that fast speech hides. Repeated perfect slow reps myelinate the neural pathways, so when you speed up, the correct movement pattern is already automatic. Fast practice wires in shortcuts.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Slow Repetition Drills Complete!",
      subtitle: "You can now build any pronunciation skill through deliberate slow practice. Phase 2 finished — you are a Word Warrior.",
      xp: 130,
      badge: "🐢 Drill Master",
      nextLessonTitle: "Linking Words",
    },
  ],
};

export default lesson;
