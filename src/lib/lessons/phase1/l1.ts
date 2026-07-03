import type { Lesson } from "../../types";

// Phase 1 — Lesson 1: Vowel Sounds A–E
// Gold-standard example: 8 steps covering intro, concept, mouth diagram,
// vowel chart, examples, tap-pronounce, practice, quiz, completion.

const lesson: Lesson = {
  id: "p1l1",
  phaseId: 0,
  lessonIndex: 0,
  title: "Vowel Sounds A–E",
  subtitle: "Master the 5 core vowel sounds that shape American English",
  duration: 8,
  xp: 120,
  objectives: [
    "Recognize the 5 core vowel sounds /eɪ/ /iː/ /aɪ/ /oʊ/ /æ/",
    "Position your tongue and lips correctly for each",
    "Hear the difference between tense and lax vowels",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Vowel Sounds A–E",
      subtitle: "The foundation of every accent",
      description:
        "Vowels are the musical heart of speech. Before consonants, before rhythm — your brain must map the 5 core American vowels. This lesson rewires that mapping through physical triggers and auditory contrast.",
      visual: "wave",
      emoji: "🔤",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The 5 Core Vowels",
      body: [
        "American English has roughly 14 vowel sounds, but 5 of them — the 'long' A, E, I, O, U — appear in almost every word you speak.",
        "Each vowel is defined by where your tongue sits: HIGH or LOW, FRONT or BACK. Get the tongue position right and the sound follows naturally.",
      ],
      bulletPoints: [
        "/eɪ/ as in FACE — front-high, gliding",
        "/iː/ as in FLEECE — front-high, tense",
        "/aɪ/ as in PRICE — center-low to front-high",
        "/oʊ/ as in GOAT — back-mid, rounded",
        "/æ/ as in TRAP — front-low, spread lips",
      ],
      visual: "vowel-chart",
      visualLabel: "The IPA vowel quadrilateral",
    },
    {
      id: "vowel-chart",
      type: "vowel-chart",
      title: "The Vowel Map",
      description:
        "Tap any dot to hear the sound. Notice how /iː/ sits top-front (tongue high and forward) while /oʊ/ sits back-mid (tongue retracted, lips rounded).",
      vowels: [
        { ipa: "iː", x: 18, y: 18, label: "FLEECE", color: "#22d3ee" },
        { ipa: "eɪ", x: 32, y: 32, label: "FACE", color: "#6366f1" },
        { ipa: "æ", x: 22, y: 78, label: "TRAP", color: "#f59e0b" },
        { ipa: "aɪ", x: 50, y: 80, label: "PRICE", color: "#ec4899" },
        { ipa: "oʊ", x: 78, y: 42, label: "GOAT", color: "#10b981" },
      ],
      highlight: "iː",
    },
    {
      id: "mouth-ee",
      type: "mouth-diagram",
      title: "Mouth Position for /iː/",
      description:
        "For the /iː/ sound (as in 'see'), push your tongue forward and up — almost touching the roof of your mouth. Lips spread into a slight smile. This is the most 'forward' vowel.",
      tonguePosition: "front-high",
      lipShape: "spread",
      sound: "iː",
      exampleWord: "see / sheep / machine",
      image: "/vowels/ii-fleece.png",
    },
    {
      id: "mouth-ei",
      type: "mouth-diagram",
      title: "Mouth Position for /eɪ/",
      description:
        "For the /eɪ/ sound (as in 'face'), start with your tongue in a front-mid position, then glide upward toward /ɪ/. Lips stay slightly spread. It's a diphthong — two sounds blending into one smooth motion.",
      tonguePosition: "front-mid",
      lipShape: "spread",
      sound: "eɪ",
      exampleWord: "face / say / play",
      image: "/vowels/ei-face.png",
    },
    {
      id: "mouth-ai",
      type: "mouth-diagram",
      title: "Mouth Position for /aɪ/",
      description:
        "For the /aɪ/ sound (as in 'price'), drop your jaw and start with the tongue low and central, then glide up to a high front position. Lips are open and relaxed throughout. Feel the jaw close as the tongue rises.",
      tonguePosition: "central-mid",
      lipShape: "slightly-open",
      sound: "aɪ",
      exampleWord: "price / time / my",
      image: "/vowels/ai-price.png",
    },
    {
      id: "mouth-ou",
      type: "mouth-diagram",
      title: "Mouth Position for /oʊ/",
      description:
        "For the /oʊ/ sound (as in 'goat'), pull your tongue back to mid-height and round your lips into a small 'O' shape. The lips protrude slightly forward. This is the most 'back' of the 5 core vowels.",
      tonguePosition: "back-low",
      lipShape: "rounded",
      sound: "oʊ",
      exampleWord: "goat / go / boat",
      image: "/vowels/ou-goat.png",
    },
    {
      id: "mouth-ae",
      type: "mouth-diagram",
      title: "Mouth Position for /æ/",
      description:
        "For /æ/ (as in 'cat'), drop your jaw and flatten your tongue low and forward. Lips spread wider than for /e/. This is the sound that gives American English its characteristic openness.",
      tonguePosition: "front-low",
      lipShape: "spread",
      sound: "æ",
      exampleWord: "cat / bad / apple",
      image: "/vowels/ae-trap.png",
    },
    {
      id: "example-1",
      type: "example",
      title: "Hear It in Action",
      phrase: "She sees the green sheep near the stream",
      ipa: "/ʃiː siːz ðə ɡriːn ʃiːp nɪr ðə striːm/",
      highlightWords: ["She", "sees", "green", "sheep", "stream"],
      tip: "Every stressed word here contains /iː/. Listen for that bright, forward quality.",
      tapWords: [
        { word: "she", ipa: "/ʃiː/" },
        { word: "sees", ipa: "/siːz/" },
        { word: "green", ipa: "/ɡriːn/" },
        { word: "sheep", ipa: "/ʃiːp/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Each Vowel",
      description: "Tap each word to hear the vowel. Pay attention to your tongue — it should move noticeably between them.",
      words: [
        { word: "face", ipa: "/feɪs/", meaning: "/eɪ/" },
        { word: "fleece", ipa: "/fliːs/", meaning: "/iː/" },
        { word: "price", ipa: "/praɪs/", meaning: "/aɪ/" },
        { word: "goat", ipa: "/ɡoʊt/", meaning: "/oʊ/" },
        { word: "trap", ipa: "/træp/", meaning: "/æ/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick",
      body: "Most learners pronounce /æ/ too close to /e/. Drop your jaw LOWER than feels natural — almost like you're about to bite an apple. That extra space is what makes it sound American.",
      variant: "info",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "Pat met Kate at the gate",
      ipa: "/pæt mɛt keɪt æt ðə ɡeɪt/",
      tip: "Alternate between /æ/ (Pat, at) and /eɪ/ (Kate, gate). Feel the jaw drop on /æ/.",
      passScore: 70,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which vowel sound requires the LOWEST tongue position in the front of the mouth?",
      options: ["/iː/ as in 'see'", "/eɪ/ as in 'face'", "/æ/ as in 'cat'", "/oʊ/ as in 'goat'"],
      correct: 2,
      explanation:
        "/æ/ is a front-low vowel — the tongue sits at the bottom of the mouth, pushed forward. /iː/ is front-high, /eɪ/ is front-mid, and /oʊ/ is back-mid.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Vowel Sounds A–E Complete!",
      subtitle: "You can now identify and produce the 5 core American vowels.",
      xp: 120,
      badge: "🔊 Vowel Pioneer",
      nextLessonTitle: "Consonant Clusters",
    },
  ],
};

export default lesson;
