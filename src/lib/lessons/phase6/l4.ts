import type { Lesson } from "../../types";

// Phase 6 — Lesson 4: Character Voices
// Adopting different speaker profiles: news anchor, casual friend, business professional.
// 12 steps: intro, concept, shadow, example, intonation, tap-pronounce, tip, example, practice, quiz, completion.

const lesson: Lesson = {
  id: "p6l4",
  phaseId: 5,
  lessonIndex: 3,
  title: "Character Voices",
  subtitle: "Become a news anchor, a casual friend, or a business pro on command",
  duration: 12,
  xp: 175,
  objectives: [
    "Adopt three distinct speaker profiles: news anchor, casual friend, business professional",
    "Identify which register fits a given context",
    "Switch register mid-conversation without breaking flow",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Character Voices",
      subtitle: "Every context has a different native voice",
      description:
        "A news anchor, a casual friend, and a business professional all speak native English — but they sound nothing alike. Pitch range, tempo, vocabulary, and pausing all shift with the role. The most fluent speakers can switch register on demand. This lesson teaches you three character voices to inhabit.",
      visual: "shadow",
      emoji: "🎬",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Three Register Profiles",
      body: [
        "Register is the level of formality and style a speaker adopts for a context. Native speakers shift register constantly — they do not speak to their boss the way they speak to their sibling. Learners who master register feel natural in every situation; learners who don't sound stuck in one register regardless of context.",
        "Each register has a characteristic pitch range, tempo, articulation crispness, and use of reductions. The casual friend uses maximum reductions and wide pitch swings; the news anchor uses minimal reductions, narrow controlled pitch, and crisp articulation; the business professional sits between — clear but conversational.",
      ],
      bulletPoints: [
        "NEWS ANCHOR — narrow pitch, slow tempo, crisp consonants, zero reductions, formal vocabulary",
        "CASUAL FRIEND — wide pitch swings, fast tempo, full reductions, contractions everywhere",
        "BUSINESS PRO — moderate pitch, moderate tempo, occasional reductions, precise vocabulary",
        "The SAME sentence sounds completely different in each register",
      ],
      visual: "phoneme-grid",
      visualLabel: "Three character profiles",
    },
    {
      id: "shadow-anchor",
      type: "shadow",
      title: "Shadow a News Anchor",
      phrase: "Good evening. Tonight, breaking news from the capital as lawmakers prepare to vote on the new legislation.",
      ipa: "/ɡʊd ˈiːvnɪŋ təˈnaɪt ˈbreɪkɪŋ njuːz frɒm ðə ˈkæpɪtl æz ˈlɔːmeɪkərz prɪˈpɛər tuː voʊt ɒn ðə njuː ˌlɛdʒɪsˈleɪʃən/",
      description:
        "News anchors speak with measured tempo, near-zero reductions (every word is fully pronounced), narrow pitch variation, and crisp consonants. Shadow this slowly — no 'gonna', no dropped /t/. The authority comes from control.",
    },
    {
      id: "example-anchor",
      type: "example",
      title: "News Anchor Example",
      phrase: "We turn now to our correspondent in the field.",
      ipa: "/wiː tɜːrn naʊ tuː aʊər ˌkɒrɪˈspɒndənt ɪn ðə fiːld/",
      highlightWords: ["turn", "now", "correspondent", "field"],
      tip: "Every word is fully articulated: 'our' is /ˈaʊər/ not /ɑːr/, 'to' is /tuː/ not /tə/. No reductions. The pitch stays in a narrow band — no big swings. Authority comes from control, not energy.",
      tapWords: [
        { word: "correspondent", ipa: "/ˌkɒrɪˈspɒndənt/" },
        { word: "field", ipa: "/fiːld/" },
        { word: "our", ipa: "/ˈaʊər/" },
      ],
    },
    {
      id: "intonation-friend",
      type: "intonation",
      title: "Casual Friend Contour",
      phrase: "Dude, you're not gonna believe what just happened!",
      contour: [
        { x: 5, y: 50 },
        { x: 15, y: 75 },
        { x: 30, y: 60 },
        { x: 45, y: 85 },
        { x: 60, y: 70 },
        { x: 75, y: 95 },
        { x: 90, y: 80 },
        { x: 100, y: 65 },
      ],
      pattern: "rise-fall",
      description:
        "Wide swings — from 50 up to 95 and back down. The peak hits 'believe' and 'happened'. Casual register uses big pitch variation to convey emotional engagement. News anchor would never swing this wide.",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Same Idea, Three Registers",
      description: "Tap each version. Same core meaning, three completely different delivery styles.",
      words: [
        { word: "I think we should leave now.", ipa: "/aɪ θɪŋk wiː ʃʊd liːv naʊ/", meaning: "business pro — measured" },
        { word: "We gotta head out.", ipa: "/wi ˈɡɒdə hɛd aʊt/", meaning: "casual friend — reduced" },
        { word: "It is advisable that we depart.", ipa: "/ɪt ɪz ədˈvaɪzəbəl ðæt wiː dɪˈpɑːrt/", meaning: "formal/news — full" },
        { word: "Let's wrap this up, yeah?", ipa: "/lɛts ræp ðɪs ʌp jɛə/", meaning: "casual workplace" },
        { word: "We should conclude at this juncture.", ipa: "/wiː ʃʊd kənˈkluːd æt ðɪs ˈdʒʌŋktʃər/", meaning: "formal business" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Mimicry Is a Skill, Not a Personality",
      body: "Mimicry is not about being fake — it is the same skill actors use. When you adopt a register, you are choosing the voice that fits the room. Watch one YouTube clip of a CNN anchor, then one of a casual vlogger, then one of a TED speaker. Shadow each for two minutes. Your mouth will learn the three character voices faster than your brain can describe them. Motor memory beats theory every time.",
      variant: "success",
    },
    {
      id: "example-friend",
      type: "example",
      title: "Casual Friend Example",
      phrase: "I dunno man, maybe we should just grab food or whatever",
      ipa: "/aɪ dəˈnoʊ mæn ˈmeɪbi wi ʃʊd dʒʌst ɡræb fuːd ɔːr wɒtˈɛvər/",
      highlightWords: ["dunno", "maybe", "grab", "whatever"],
      tip: "Three reductions in one breath: 'dunno' (don't know), 'maybe' (probably), 'whatever' (anything). Pitch swings wide on 'maybe' and 'whatever'. End on a level note — casual sentences rarely fall cleanly.",
      tapWords: [
        { word: "dunno", ipa: "/dəˈnoʊ/" },
        { word: "maybe", ipa: "/ˈmeɪbi/" },
        { word: "whatever", ipa: "/wɒtˈɛvər/" },
      ],
    },
    {
      id: "practice",
      type: "practice",
      title: "Switch Register — Same Phrase",
      phrase: "I think it's a good idea",
      ipa: "/aɪ θɪŋk ɪts ə ɡʊd aɪˈdiːə/",
      tip: "Say it three ways: (1) news anchor — slow, no contraction 'it is', narrow pitch; (2) casual friend — 'I think it's a good idea, y'know?' with rising tail; (3) business pro — measured, slight contraction, even tempo.",
      passScore: 78,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "You're invited to a corporate board meeting to present quarterly results. Which register fits best?",
      options: [
        "News anchor — zero reductions, narrow pitch, fully articulated",
        "Casual friend — full reductions, wide pitch swings, contractions everywhere",
        "Business professional — moderate tempo, occasional reductions, precise vocabulary",
        "Stand-up comedian — exaggerated pitch, stretched vowels, sarcasm",
      ],
      correct: 2,
      explanation:
        "A board meeting sits between formal and conversational. News anchor would feel stiff and theatrical; casual friend would be unprofessional; comedian is wildly inappropriate. The business professional register — clear but not robotic, with occasional reductions — projects competence and approachability simultaneously. That is what the room expects.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Character Voices Complete!",
      subtitle: "You can now adopt news anchor, casual friend, and business pro registers and switch between them on demand.",
      xp: 175,
      badge: "🎬 Voice Chameleon",
      nextLessonTitle: "Job Interview English",
    },
  ],
};

export default lesson;
