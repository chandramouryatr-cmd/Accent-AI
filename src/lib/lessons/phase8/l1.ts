import type { Lesson } from "../../types";

// Phase 8 — Lesson 1: Tone Adaptation
// Switching tone between contexts. Two intonation steps for same phrase. Shadow practice.
// 12 steps: intro, concept, concept, intonation, intonation, example, shadow, tap-pronounce, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p8l1",
  phaseId: 7,
  lessonIndex: 0,
  title: "Tone Adaptation",
  subtitle: "Same words, different voice — switch tone on demand",
  duration: 12,
  xp: 180,
  objectives: [
    "Distinguish casual, formal, serious, and light tones by their acoustic features",
    "Switch tone mid-utterance without breaking flow",
    "Map tone contour shapes to social contexts",
    "Calibrate tone to the room within the first five seconds",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Tone Adaptation",
      subtitle: "The voice that fits the room — every time",
      description:
        "Tone is the emotional color of speech — the difference between 'oh great' as a celebration and 'oh great' as dread. Native speakers shift tone constantly: serious with a client, light with a colleague, formal with a boss, casual with a friend — sometimes all in the same conversation. Learners who master tone adaptation feel native in any context; learners who don't sound monotonous or socially tone-deaf. This lesson teaches you to read the room and match its tone within seconds.",
      visual: "intonation",
      emoji: "🎭",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "What Tone Actually Is",
      body: [
        "Tone is not mood and it is not emotion — it is the prosodic shape you give to words to signal your stance toward them. The four primary tones in English are: casual (relaxed, low pitch, fast tempo), formal (controlled, narrow pitch, slower tempo), serious (low pitch, falling contours, minimal variation), and light (high pitch, rising contours, wide variation). The same sentence in four tones means four different things.",
        "The acoustic features that define tone are: average pitch (high = light, low = serious), pitch range (wide = casual/light, narrow = formal/serious), tempo (fast = casual, slow = formal), and pitch direction (rising = open/light, falling = closed/serious). Native speakers read these features subconsciously in milliseconds — they know instantly whether someone is being serious or sarcastic, formal or casual, even when the words themselves are identical.",
      ],
      bulletPoints: [
        "CASUAL — low average pitch, wide range, fast tempo, many reductions",
        "FORMAL — mid pitch, narrow range, slow tempo, full articulation",
        "SERIOUS — low pitch, falling contours, minimal variation, deliberate",
        "LIGHT — high pitch, rising contours, wide variation, bouncy",
        "SARCASTIC — fall-rise contour, exaggerated stress, lengthened vowels",
      ],
      visual: "phoneme-grid",
      visualLabel: "Four primary tones and their acoustic signatures",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "The Same Sentence, Four Tones",
      body: [
        "Consider the sentence 'That's interesting.' In a casual tone, it means genuine curiosity — pitch rises on 'in-TER-esting' and falls gently. In a formal tone, it means polite acknowledgment — pitch is flat, tempo is measured, the word 'interesting' is fully articulated. In a serious tone, it means 'this is important' — low pitch, falling contour, slow. In a sarcastic tone, it means the opposite — pitch falls then rises (fall-rise), the vowel in 'interesting' is stretched exaggeratedly.",
        "Native speakers produce these four tones automatically because they have heard them thousands of times. Learners often produce only one tone (usually the formal one they learned in school) and wonder why their English sounds flat. The fix is deliberate practice: take one sentence and produce it in all four tones, paying attention to the contour shape each one requires. Once your mouth knows the four shapes, switching becomes automatic.",
      ],
      bulletPoints: [
        "CASUAL 'That's interesting.' — rise on TER, gentle fall, /ˈɪntrəstɪŋ/",
        "FORMAL 'That's interesting.' — flat, /ˈɪntərɛstɪŋ/, no reduction",
        "SERIOUS 'That's interesting.' — low, falling, /ˈɪntərɛstɪŋ/, slow",
        "SARCASTIC 'That's interesting.' — fall-rise, /ˈɪn-tɜːr-ɛs-tɪŋ/, stretched",
        "The words are identical — only the prosody changes",
      ],
      visual: "intonation",
      visualLabel: "Four contour shapes over the same words",
    },
    {
      id: "intonation-casual",
      type: "intonation",
      title: "Casual Tone — 'See you later'",
      phrase: "See you later — yeah, sounds good!",
      contour: [
        { x: 5, y: 45 },
        { x: 15, y: 65 },
        { x: 25, y: 55 },
        { x: 35, y: 70 },
        { x: 45, y: 50 },
        { x: 55, y: 75 },
        { x: 65, y: 60 },
        { x: 75, y: 80 },
        { x: 85, y: 70 },
        { x: 95, y: 85 },
      ],
      pattern: "rise-fall",
      description:
        "Casual tone bounces — it swings between y 45 and y 85, never settling. The pitch rises on 'yeah' (curiosity/enthusiasm), then dips on 'sounds', then rises sharply on 'good' (a light upward tail typical of casual affirmations). Wide range + bouncy direction = casual. There is no dramatic fall because casual speech rarely closes off — it leaves the door open for the conversation to continue.",
    },
    {
      id: "intonation-formal",
      type: "intonation",
      title: "Formal Tone — Same Phrase",
      phrase: "I will see you later. That sounds acceptable.",
      contour: [
        { x: 5, y: 50 },
        { x: 15, y: 52 },
        { x: 25, y: 50 },
        { x: 35, y: 48 },
        { x: 45, y: 50 },
        { x: 55, y: 45 },
        { x: 65, y: 47 },
        { x: 75, y: 42 },
        { x: 85, y: 38 },
        { x: 95, y: 30 },
      ],
      pattern: "falling",
      description:
        "Formal tone is controlled — pitch stays in a narrow band (y 30–52) and trends gently downward. There are no dramatic rises. The contour is almost flat with a slow descent, ending in a clean fall on 'acceptable'. Narrow range + downward trend + clean fall = formal. This is the voice of a lawyer, a newscaster, or a senior executive making a measured statement.",
    },
    {
      id: "example-tone-shift",
      type: "example",
      title: "Mid-Conversation Tone Shift",
      phrase: "So I told him, 'Listen, we need this done by Friday' — and he just laughed at me. Can you believe that?",
      ipa: "/soʊ aɪ toʊld hɪm ˈlɪsən wiː niːd ðɪs dʌn baɪ ˈfraɪdeɪ ænd hiː dʒʌst læft æt miː kæn juː bɪˈliːv ðæt/",
      highlightWords: ["told", "Listen", "need", "Friday", "laughed", "believe"],
      tip: "Notice the tone shift mid-utterance: the quoted part 'Listen, we need this done by Friday' is FORMAL (boss voice, narrow pitch, falling). The frame 'So I told him... and he just laughed at me. Can you believe that?' is CASUAL (bouncy pitch, rising on 'believe'). Native speakers shift between quoted and framing voices automatically — it signals 'this is what I said' vs 'this is my reaction'.",
      tapWords: [
        { word: "Listen", ipa: "/ˈlɪsən/" },
        { word: "Friday", ipa: "/ˈfraɪdeɪ/" },
        { word: "laughed", ipa: "/læft/" },
        { word: "believe", ipa: "/bɪˈliːv/" },
      ],
    },
    {
      id: "shadow-shift",
      type: "shadow",
      title: "Shadow the Tone Shift",
      phrase: "Hey, what's up? — Oh, nothing much, just the same old thing. You?",
      ipa: "/heɪ wɒts ʌp oʊ ˈnʌθɪŋ mʌtʃ dʒʌst ðə seɪm oʊld θɪŋ juː/",
      description:
        "This single utterance contains three tones. 'Hey, what's up?' is CASUAL (bouncy, rising on 'up'). 'Oh, nothing much' shifts to LEVEL/DEADPAN (low, flat, disengaged). 'Just the same old thing' stays low and falls. 'You?' rises sharply back to CASUAL (engagement returns). Shadow this slowly — feel the three shifts in your mouth. The tone changes carry more meaning than the words.",
    },
    {
      id: "tap-pronounce-pairs",
      type: "tap-pronounce",
      title: "Tone-Shift Pairs",
      description: "Tap each pair. Same words, two tones. Notice how the prosody changes the meaning.",
      words: [
        { word: "Right. (serious — agreement)", ipa: "/raɪt/", meaning: "low, falling, decisive" },
        { word: "Right? (casual — seeking confirmation)", ipa: "/raɪt/", meaning: "rising, light, open" },
        { word: "Sure. (formal — polite agreement)", ipa: "/ʃʊr/", meaning: "flat, measured, controlled" },
        { word: "Sure! (enthusiastic — excited yes)", ipa: "/ʃʊr/", meaning: "high, peaked, bouncy" },
        { word: "Okay. (formal — acceptance)", ipa: "/oʊˈkeɪ/", meaning: "flat, falling on 'kay'" },
        { word: "Okaaay. (sarcastic — reluctant)", ipa: "/oʊˈkeɪ/", meaning: "lengthened, fall-rise on 'kay'" },
        { word: "Fine. (casual — agreement)", ipa: "/faɪn/", meaning: "short, falling, neutral" },
        { word: "FINE. (sarcastic — annoyed agreement)", ipa: "/faɪn/", meaning: "stressed, lengthened, low-falling" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Read the Room in Five Seconds",
      body: "Before you speak in any new context — a meeting, a party, a phone call — listen for five seconds. Listen to the average pitch (high = light mood, low = serious), the tempo (fast = casual, slow = formal), and the pitch range (wide = relaxed, narrow = tense). Then match those three features in your first sentence. This is what native speakers do subconsciously: they calibrate before they contribute. If you start with the wrong tone — too casual in a serious meeting, too formal at a party — you will spend the rest of the interaction recovering. Calibrate first, then speak, and you will sound native from the first word.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Switch Tones — One Phrase",
      phrase: "I don't think that's a good idea.",
      ipa: "/aɪ doʊnt θɪŋk ðæts ə ɡʊd aɪˈdiːə/",
      tip: "Say this phrase three ways: (1) FORMAL — 'I do not think that is a good idea.' (full words, flat contour, falling end). (2) CASUAL — 'I dunno, that's... not a great idea.' (reductions, bouncy pitch, hesitation). (3) SARCASTIC — 'Oh, THAT'S a great idea.' (fall-rise, stressed THAT'S, lengthened vowel). Record all three — your mouth should feel different each time.",
      passScore: 80,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "You walk into a meeting and the room is silent, people are looking at papers, and the previous speaker ended on a low falling note. What tone should you adopt for your opening sentence?",
      options: [
        "Light and bouncy — break the tension with energy",
        "Casual and quick — pretend the heaviness is normal",
        "Serious and measured — match the low pitch, slow tempo, and falling contours already in the room",
        "Sarcastic — use humor to release the pressure",
      ],
      correct: 2,
      explanation:
        "Tone matching is the most important social-prosody skill. When a room is serious — low pitch, slow tempo, falling contours — the native move is to match those features in your first sentence. This signals 'I am reading the room, I am part of this moment.' Option 1 (light/bouncy) reads as tone-deaf or insensitive to whatever just happened. Option 2 (casual/quick) reads as dismissive of the weight. Option 4 (sarcastic) is wildly inappropriate in a professional setting unless you are a known comedian. Serious matches serious; you can shift to lighter tones later once the mood has been acknowledged.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Tone Adaptation Complete!",
      subtitle: "You can now distinguish four primary tones by their acoustic features, switch tone mid-utterance, and calibrate to the room in five seconds. Your voice fits every context.",
      xp: 180,
      badge: "🎭 Tone Shifter",
      nextLessonTitle: "Humor & Irony",
    },
  ],
};

export default lesson;
