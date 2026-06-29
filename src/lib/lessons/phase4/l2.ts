import type { Lesson } from "../../types";

// Phase 4 — Lesson 2: Expressing Emotions
// How prosody — pitch, range, loudness, and contour — carries emotion.
// Same words, different melody, different feeling.

const lesson: Lesson = {
  id: "p4l2",
  phaseId: 3,
  lessonIndex: 1,
  title: "Expressing Emotions",
  subtitle: "Same words, different melody — let prosody do the feeling",
  duration: 10,
  xp: 150,
  objectives: [
    "Map four core emotions — excitement, sadness, anger, sarcasm — to prosodic patterns",
    "Produce a rising wide-range contour for excitement /aɪ kænt bɪˈliːv ɪt/",
    "Produce a low narrow contour for sadness and a sharp falling contour for anger",
    "Use the fall-rise contour to signal sarcasm and irony",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Expressing Emotions",
      subtitle: "Words are 30%, melody is 70%",
      description:
        "Say 'I can't believe it' four different ways — excited, sad, angry, sarcastic — and the words stay identical but the feeling flips completely. Native speakers hear emotion from pitch, loudness, range, and rhythm long before they parse the words. This lesson trains the prosody of feeling.",
      visual: "emoji-burst",
      emoji: "🎭",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Emotion Lives in Prosody, Not Words",
      body: [
        "The same sentence can mean four opposite things. 'Great.' said flat and low means 'this is terrible.' 'Great!' said high and rising means 'this is wonderful.' The words carry the proposition; the prosody carries the stance. Learners who nail the words but flatten the melody sound robotic — or worse, seem rude or uninterested when they mean to be warm.",
        "English maps each emotion to a recognizable prosodic signature. Excitement raises average pitch, widens the pitch range, and speeds up slightly. Sadness lowers pitch, narrows range, and slows down. Anger adds stress, loudness, and sharp falls. Sarcasm uses the fall-rise — a drop then a bounce — to mark that the literal meaning is not the real meaning.",
      ],
      bulletPoints: [
        "Excitement: high pitch, wide range, faster tempo, rising contour",
        "Sadness: low pitch, narrow range, slower tempo, gentle falls",
        "Anger: loud stress, sharp falls, staccato rhythm, often low-to-mid pitch",
        "Sarcasm: fall-rise contour, exaggerated length on key words, nasal drawl",
        "Surprise: very high onset, sharp rise then fall, breathy voice",
        "Neutrality: mid pitch, narrow range, level contour — what learners default to",
      ],
      visual: "intonation",
      visualLabel: "Four contours, four emotions — same words",
    },
    {
      id: "intonation-excitement",
      type: "intonation",
      title: "Excitement Contour",
      phrase: "I can't believe it!",
      contour: [
        { x: 0, y: 45 },
        { x: 15, y: 80 },
        { x: 30, y: 65 },
        { x: 50, y: 90 },
        { x: 70, y: 70 },
        { x: 85, y: 85 },
        { x: 100, y: 60 },
      ],
      pattern: "rise-fall",
      description:
        "Excitement jumps up early and stays high. Pitch range is wide — peaks near 90, valleys near 45. The accented words 'can't' and 'believe' get the highest points. Slight overshoot on 'believe' /bɪˈliːv/ — stretch the vowel /iː/. Tempo is a touch faster than neutral.",
    },
    {
      id: "example-happy",
      type: "example",
      title: "Excited — 'I Can't Believe It!'",
      phrase: "I can't believe it! This is amazing!",
      ipa: "/aɪ kænt bɪˈliːv ɪt | ðɪs ɪz əˈmeɪzɪŋ/",
      highlightWords: ["can't", "believe", "amazing"],
      tip: "Pitch jumps up on 'can't,' climbs higher on 'believe' (stretch /iː/), then peaks on the stressed syllable of 'amazing' /əˈmeɪzɪŋ/. Loudness tracks pitch — louder on the peaks. Don't articulate the 't' in 'it' cleanly; let it become a glottal stop /ʔ/ or vanish before 'this.'",
      tapWords: [
        { word: "can't", ipa: "/kænt/" },
        { word: "believe", ipa: "/bɪˈliːv/" },
        { word: "amazing", ipa: "/əˈmeɪzɪŋ/" },
      ],
    },
    {
      id: "compare-happy-sad",
      type: "compare",
      title: "Excited vs Sad — Same Words",
      nativePhrase: "I can't believe it. (excited — high, wide)",
      learnerPhrase: "I can't believe it. (sad — low, narrow)",
      nativeIpa: "/aɪ ˈkænt bɪˈliːv ɪt/  [pitch 80→90→85]",
      learnerIpa: "/aɪ kænt bɪˈliːv ɪt/  [pitch 25→30→20]",
      description:
        "Excited version jumps to pitch ~80 and peaks at ~90 on 'believe.' Sad version stays low at ~25 with tiny movement — pitch barely moves 10 Hz. Sadness also slows tempo by ~30% and softens loudness. Same IPA, completely different feeling — prosody is doing 100% of the emotional work.",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Anger and Sarcasm — Two Falling Shapes",
      body: [
        "Anger compresses rhythm into hard, loud, evenly-spaced beats. Pitch starts mid and falls sharply on stressed words — like hammering. 'I TOLD you NOT to do THAT.' Each stressed word is a blow. Loudness spikes on the stressed syllable, then drops instantly.",
        "Sarcasm uses the opposite trick — it stretches a key word and bends the pitch down then up: the fall-rise. 'Oh, GREAT.' said with a low fall on 'great' then a slow rise signals the exact opposite of 'great.' Sarcasm often adds a nasal, drawled quality and a slight smile-shape to the lips — physically incompatible with genuine feeling.",
      ],
      bulletPoints: [
        "Anger: sharp falls, hard stress, staccato, loud — 'I TOLD you NO.'",
        "Sarcasm: fall-rise on a stretched word — 'Oh, GREAaat.'",
        "Sarcasm cue: vowel lengthening on the sarcastic word",
        "Sarcasm cue: nasal or breathy voice quality",
        "Anger cue: hard glottal stops, punched consonants",
        "Both can start mid-pitch; the contour shape tells them apart",
      ],
      visual: "compare-wave",
      visualLabel: "Anger falls hard and fast; sarcasm falls then rises",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear Emotion Words",
      description:
        "Each word below changes shape with emotion. Tap to hear the default neutral version — then in your head, replay each one excited, sad, angry, and sarcastic. The word is the same; only the melody changes.",
      words: [
        { word: "Amazing!", ipa: "/əˈmeɪzɪŋ/", meaning: "excited — wide rise on -maz-" },
        { word: "Awesome.", ipa: "/ˈɔːsəm/", meaning: "flat low = sarcastic disappointment" },
        { word: "Great…", ipa: "/ɡreɪt/", meaning: "fall-rise = sarcasm, not praise" },
        { word: "Whatever.", ipa: "/wɒtˈɛvər/", meaning: "flat falling = dismissive" },
        { word: "Seriously?", ipa: "/ˈsɪriəsli/", meaning: "high rising = disbelief" },
        { word: "Oh my god!", ipa: "/oʊ maɪ ɡɒd/", meaning: "excited surprise — wide range" },
        { word: "Wow.", ipa: "/waʊ/", meaning: "low flat = unimpressed sarcasm" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Smile Test",
      body: "Your face changes your prosody. Smile genuinely while saying 'amazing' and pitch rises automatically, vowels brighten, range widens — you sound excited even without trying. Drop your face to neutral and the same word sounds flat or sarcastic. Record yourself saying 'This is great' with a real smile, then with a flat face. The pitch difference is often 30+ Hz. Trick your prosody by tricking your face first.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Perform Four Emotions",
      phrase: "I can't believe it! — excited version",
      ipa: "/aɪ ˈkænt bɪˈliːv ɪt/",
      tip: "Jump up on 'can't' (pitch ~85), climb higher on 'believe' (stretch /iː/ to ~90), then land 'it' lower (~60). Smile while you record. Loudness tracks pitch — louder on the high peaks. Aim for the widest pitch range you can produce.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question:
        "A friend tells you they got the job. You want to sound genuinely excited. Which prosody signals excitement?",
      options: [
        "Low pitch, narrow range, slow tempo, gentle falls",
        "Mid pitch, level contour, even rhythm, breathy voice",
        "High pitch, wide range, slightly faster, rising peaks on stressed words",
        "Sharp falls, hard stress, loud and staccato",
      ],
      correct: 2,
      explanation:
        "Excitement = high pitch, wide range, faster tempo, and rising peaks on stressed words. Option 1 describes sadness; option 2 describes neutrality or boredom; option 4 describes anger. Only option 3 — high, wide, fast, with rises on 'got' and 'job' — reads as genuine excitement.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Emotion Prosody Unlocked!",
      subtitle: "You can now make the same words mean four different feelings — excitement, sadness, anger, and sarcasm — by changing pitch, range, loudness, and contour.",
      xp: 150,
      badge: "🎭 Emotion Coder",
      nextLessonTitle: "Questions & Answers",
    },
  ],
};

export default lesson;
