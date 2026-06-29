import type { Lesson } from "../../types";

// Phase 6 — Lesson 2: Prosody Copying
// Copying pitch, volume, speed, pauses — not just sounds.
// 11 steps: intro, concept, intonation, example, rhythm, tap-pronounce, tip, shadow, practice, quiz, completion.

const lesson: Lesson = {
  id: "p6l2",
  phaseId: 5,
  lessonIndex: 1,
  title: "Prosody Copying",
  subtitle: "Pitch, volume, speed, pauses — the music beneath the words",
  duration: 10,
  xp: 165,
  objectives: [
    "Identify the four elements of prosody: pitch, volume, tempo, pauses",
    "Copy an intonation contour from a native speaker",
    "Match the rhythm and pause pattern of a real spoken phrase",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Prosody Copying",
      subtitle: "The music beneath the words",
      description:
        "Two speakers can say the same words with the same vowels and consonants and sound completely different. The difference is prosody: the rising and falling of pitch, the swelling and shrinking of volume, the speeding and slowing of tempo, and the strategic placement of pauses. Prosody is where accent actually lives.",
      visual: "intonation",
      emoji: "🎵",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Four Pillars of Prosody",
      body: [
        "Prosody means 'the song' of speech. It has four independent dimensions you can copy from a native speaker — even when you can't yet pronounce every consonant.",
        "Pitch is how high or low your voice moves on a musical scale. Volume is how loud or soft each word is. Tempo is how fast or slow stretches of speech flow. Pauses are the silent gaps — and where you place them changes meaning entirely.",
        "Beginners fixate on sounds. Advanced learners fixate on prosody. If your vowels are imperfect but your prosody is native, listeners will accept you as fluent. The reverse is rarely true.",
      ],
      bulletPoints: [
        "PITCH — the melody line; rises for questions, falls for statements",
        "VOLUME — stress amplifies key words, not every word",
        "TEMPO — slow for emphasis, fast for transitions",
        "PAUSES — silence is meaning; misplaced pauses break comprehension",
      ],
      visual: "intonation",
      visualLabel: "The prosody wave",
    },
    {
      id: "intonation-1",
      type: "intonation",
      title: "Copy This Pitch Contour",
      phrase: "I really didn't expect that",
      contour: [
        { x: 5, y: 50 },
        { x: 20, y: 65 },
        { x: 35, y: 80 },
        { x: 50, y: 55 },
        { x: 65, y: 40 },
        { x: 80, y: 30 },
        { x: 95, y: 20 },
      ],
      pattern: "fall-rise",
      description:
        "The contour rises through 'really' (peaking at 'REAL'), dips on 'didn't', then falls steadily through 'expect that'. The high peak signals surprise. Copy the shape, not the exact notes — your pitch range may differ from the native's.",
    },
    {
      id: "example-1",
      type: "example",
      title: "An Emotionally Rich Phrase",
      phrase: "Are you seriously going to do that right now?",
      ipa: "/ɑːr juː ˈsɪərəsli ˈɡənə duː ðæt raɪt naʊ/",
      highlightWords: ["seriously", "going", "do", "right", "now"],
      tip: "Prosody carries the disbelief here. 'Seriously' rises sharply, 'do' peaks, 'right now' falls with finality. The words alone would sound flat; the prosody makes it incredulous.",
      tapWords: [
        { word: "seriously", ipa: "/ˈsɪərəsli/" },
        { word: "do", ipa: "/duː/" },
        { word: "right now", ipa: "/raɪt naʊ/" },
      ],
    },
    {
      id: "rhythm-1",
      type: "rhythm",
      title: "Tempo and Pause Pattern",
      phrase: "Okay... so here's the thing. We need to talk.",
      beats: [
        { text: "O", duration: 0.5, stressed: false },
        { text: "kay", duration: 0.5, stressed: false },
        { text: "[pause]", duration: 1, stressed: false },
        { text: "so", duration: 0.5, stressed: false },
        { text: "here's", duration: 0.5, stressed: false },
        { text: "the", duration: 0.5, stressed: false },
        { text: "THING", duration: 1.5, stressed: true },
        { text: "[pause]", duration: 1, stressed: false },
        { text: "We", duration: 0.5, stressed: false },
        { text: "NEED", duration: 1, stressed: true },
        { text: "to", duration: 0.5, stressed: false },
        { text: "talk", duration: 1, stressed: true },
      ],
      description:
        "Two pauses frame the sentence. The first pause (after 'okay') signals hesitation — the speaker is gathering courage. The second pause (after 'thing') is dramatic — it separates the setup from the message. Remove the pauses and the phrase loses its weight entirely.",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Prosody Markers to Practice",
      description: "Each phrase showcases one prosody dimension. Tap, listen, and identify which pillar is most prominent.",
      words: [
        { word: "Really?", ipa: "/ˈriːli/", meaning: "rising pitch = surprise" },
        { word: "I mean it.", ipa: "/aɪ ˈmiːn ɪt/", meaning: "falling pitch = finality" },
        { word: "Wow. Just... wow.", ipa: "/waʊ dʒʌst waʊ/", meaning: "long pauses = shock" },
        { word: "I told you so.", ipa: "/aɪ toʊld juː soʊ/", meaning: "slow tempo = smugness" },
        { word: "Get. Out. Now.", ipa: "/ɡɛt aʊt naʊ/", meaning: "staccato volume = anger" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Record Just the Melody",
      body: "To isolate prosody, hum the melody of a sentence without the words. Just 'mmm-mm-mm-mmm' following the pitch contour. If your hum matches the native's hum, your prosody is right — even if your consonants are still imperfect. Prosody is the skeleton; sounds are the flesh. Build the skeleton first.",
      variant: "success",
    },
    {
      id: "shadow-1",
      type: "shadow",
      title: "Shadow with Full Prosody",
      phrase: "Look, I get it — you're tired, and honestly, so am I.",
      ipa: "/lʊk aɪ ɡɛt ɪt jɔːr ˈtaɪərd ænd ˈɒnɪstli soʊ æm aɪ/",
      description:
        "Shadow this sentence paying attention only to prosody: where does the pitch rise, where does it fall, where are the pauses? Don't worry about individual sounds — match the music first. The sounds will follow.",
    },
    {
      id: "practice",
      type: "practice",
      title: "Copy the Prosody",
      phrase: "Okay, fine — but you owe me one.",
      ipa: "/oʊˈkeɪ faɪn bʌt juː oʊ miː wʌn/",
      tip: "Pause after 'okay' and 'fine'. Lift the pitch on 'fine' and 'owe'. Drop the pitch on 'one' for finality. The words are simple; the prosody is everything.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which of the following is NOT one of the four pillars of prosody?",
      options: [
        "Pitch (high/low melody)",
        "Volume (loud/soft stress)",
        "Phonemes (consonants and vowels)",
        "Tempo (fast/slow stretches)",
      ],
      correct: 2,
      explanation:
        "Phonemes are the building blocks of sounds — they are not prosody. Prosody is the music that rides on top of phonemes: pitch (melody), volume (loudness), tempo (speed), and pauses (silence). You can copy prosody perfectly even when your phonemes are still imperfect.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Prosody Copying Complete!",
      subtitle: "You can now hear and reproduce pitch, volume, tempo, and pauses like a native.",
      xp: 165,
      badge: "🎵 Prosody Prodigy",
      nextLessonTitle: "Tone Matching",
    },
  ],
};

export default lesson;
