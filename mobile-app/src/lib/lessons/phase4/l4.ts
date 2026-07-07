import type { Lesson } from "../../types";

// Phase 4 — Lesson 4: Small Talk Mastery
// Weather, weekend, sports — the social lubricant of English conversation.
// Reduced forms, fillers (so, yeah, you know, like), and active listening
// cues (mm-hmm, right) that signal you're engaged without saying much.

const lesson: Lesson = {
  id: "p4l4",
  phaseId: 3,
  lessonIndex: 3,
  title: "Small Talk Mastery",
  subtitle: "Weather, weekend, sports — and the fillers that hold it together",
  duration: 11,
  xp: 160,
  objectives: [
    "Run a full small talk exchange with reduced forms and fillers",
    "Use fillers 'so,' 'yeah,' 'you know,' 'like' naturally — not as crutches",
    "Produce active listening cues 'mm-hmm,' 'right,' 'oh yeah' on the right beat",
    "Chain three classic topics — weather, weekend, sports — without awkward silence",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Small Talk Mastery",
      subtitle: "The social glue of English conversation",
      description:
        "Small talk is the warm-up before real conversation — weather, weekend plans, last night's game. It feels trivial, but it's a skill: native speakers use reduced forms, fillers, and listening cues to keep the rhythm flowing. This lesson trains the phrases, the fillers, and the back-channel cues that make small talk feel effortless.",
      visual: "shadow",
      emoji: "💬",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Three Topics, One Rhythm",
      body: [
        "English small talk rotates through a small set of safe topics: weather, weekend plans, and sports (or recent shared events like a holiday or a TV show). These topics are deliberately low-stakes — no politics, no religion, no personal questions. The point isn't the content; it's the rhythm of mutual engagement before moving to real business.",
        "Small talk runs on reduced forms and fillers. 'What did you do this weekend?' compresses to 'Whaddaya do this weekend?' /wəˈdɑːjə duː/. 'I'm going to' becomes 'I'm gonna' /aɪmˈɡənə/. Fillers — 'so,' 'yeah,' 'you know,' 'like' — buy thinking time and keep the floor. Listening cues — 'mm-hmm,' 'right,' 'oh yeah' — tell the speaker you're tracking without interrupting.",
      ],
      bulletPoints: [
        "Weather: 'Crazy weather, huh?' / 'Supposed to clear up later.'",
        "Weekend: 'Any plans for the weekend?' / 'How was your weekend?'",
        "Sports: 'Did you catch the game last night?' / 'They blew it.'",
        "Fillers: so, yeah, you know, like, I mean, right",
        "Listening cues: mm-hmm, right, oh yeah, uh-huh, wow",
        "Reduced: 'going to' → 'gonna', 'want to' → 'wanna', 'got to' → 'gotta'",
      ],
      visual: "rhythm",
      visualLabel: "Small talk = steady beat with filler cushion",
    },
    {
      id: "example-exchange",
      type: "example",
      title: "A Full Small Talk Exchange",
      phrase:
        "Hey! How was your weekend? — Oh, pretty good. Just chilled, you know. You? — Yeah, not bad. Went hiking Saturday. — Oh nice. — So, crazy weather lately, huh? — I know, right? Supposed to clear up though.",
      ipa: "/heɪ | haʊ wəz jʊər ˈwiːkɛnd | oʊ ˈprɪti ɡʊd | dʒʌst tʃɪld juː noʊ | juː | jɛə | nɒt bæd | wɛnt ˈhaɪkɪŋ ˈsætərdeɪ | oʊ naɪs | soʊ | ˈkreɪzi ˈwɛðər ˈleɪtli hʌ | aɪ noʊ rait | səˈpoʊzd tuː klɪr ʌp ðoʊ/",
      highlightWords: ["weekend", "good", "chilled", "bad", "hiking", "nice", "crazy", "weather", "know", "clear"],
      tip: "Reduced forms everywhere: 'your' → /jʊər/, 'to' → /tə/, 'supposed to' → /səˈpoʊstə/. The filler 'you know' /juː noʊ/ softens 'just chilled.' The listening cue 'Oh nice' /oʊ naɪs/ lands on the beat right after 'Saturday.' 'I know, right?' is the canonical agreement move — rising tag, friendly.",
      tapWords: [
        { word: "How was your weekend?", ipa: "/haʊ wəz jʊər ˈwiːkɛnd/" },
        { word: "Just chilled, you know", ipa: "/dʒʌst ˈtʃɪld juː noʊ/" },
        { word: "I know, right?", ipa: "/aɪ noʊ rait/" },
        { word: "Supposed to clear up though", ipa: "/səˈpoʊzd tuː klɪr ʌp ðoʊ/" },
      ],
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Fillers Are Feature, Not Bug",
      body: [
        "Learners often try to eliminate fillers — 'so,' 'yeah,' 'you know,' 'like' — thinking they sound unprofessional. But native speakers use them constantly, even in business settings, because they serve real functions. 'So' opens a topic. 'Yeah' acknowledges before disagreeing. 'You know' invites shared understanding. 'Like' introduces an example or quote. Used sparingly, fillers make you sound fluent; overused, they become verbal tics.",
        "The line is rhythm. A filler on the beat — filling the gap where you'd otherwise pause awkwardly — sounds natural. A filler every three words sounds anxious. Aim for one filler per 8-10 content words. Active listening cues follow the same rule: 'mm-hmm' or 'right' once every few sentences signals attention; saying it every sentence sounds robotic.",
      ],
      bulletPoints: [
        "'So' — opens a topic or transition: 'So, how was your weekend?'",
        "'Yeah' — softens a response, often before 'but': 'Yeah, but it was raining.'",
        "'You know' — invites shared understanding, fills thinking time",
        "'Like' — introduces example or quote: 'It was, like, freezing.'",
        "'I mean' — reframes or corrects: 'It was good. I mean, not amazing.'",
        "'Right?' — seeks light agreement, often rising at end",
      ],
      visual: "shadow",
      visualLabel: "Fillers cushion the rhythm; cues keep it alive",
    },
    {
      id: "shadow-exchange",
      type: "shadow",
      title: "Shadow the Full Exchange",
      phrase:
        "Hey! How was your weekend? — Oh, pretty good. Just chilled, you know. You?",
      ipa: "/heɪ | haʊ wəz jʊər ˈwiːkɛnd | oʊ ˈprɪti ɡʊd | dʒʌst tʃɪld juː noʊ | juː/",
      description:
        "Listen, then echo in the same rhythm. Land 'weekend' on the beat, soften 'your' to /jʊər/, drop the 'd' in 'chilled' before 'you.' The filler 'you know' should sound throwaway — pitch lowers slightly on 'know.' Bounce 'You?' back at the same pitch as 'weekend' — a clean handoff.",
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap the Filler Words",
      description:
        "Fillers look simple but their prosody is specific. Tap each one — most are short, low-pitched, and unstressed. They shouldn't pop out of the sentence; they should blend in.",
      words: [
        { word: "so", ipa: "/soʊ/", meaning: "low, opener — 'So, how's it going?'" },
        { word: "yeah", ipa: "/jɛə/", meaning: "soft agreement, often low" },
        { word: "you know", ipa: "/juː noʊ/", meaning: "throwaway, slight fall on 'know'" },
        { word: "like", ipa: "/laɪk/", meaning: "short, unstressed before an example" },
        { word: "I mean", ipa: "/aɪ miːn/", meaning: "reframe, slight stress on 'mean'" },
        { word: "right?", ipa: "/rait/", meaning: "rising tag, seeks agreement" },
        { word: "mm-hmm", ipa: "/m̩ˈhʌm/", meaning: "listening cue — low, quick" },
      ],
    },
    {
      id: "rhythm-fillers",
      type: "rhythm",
      title: "Filler Rhythm — Beat vs Cushion",
      phrase: "So, yeah, I went hiking this weekend, you know?",
      beats: [
        { text: "So", duration: 1, stressed: false },
        { text: "yeah", duration: 1, stressed: false },
        { text: "I", duration: 0.5, stressed: false },
        { text: "WENT", duration: 2, stressed: true },
        { text: "hiking", duration: 1.5, stressed: false },
        { text: "this", duration: 0.5, stressed: false },
        { text: "WEEKend", duration: 2, stressed: true },
        { text: "you know?", duration: 1, stressed: false },
      ],
      description:
        "Fillers and function words get the short unstressed beats; content words 'went' and 'weekend' get the long stressed beats. The fillers 'so' and 'yeah' open with two quick low beats — they're runway, not cargo. 'You know?' at the end is a soft landing, low and falling.",
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Back-Channel Nod",
      body: "Active listening in English runs on back-channel cues — 'mm-hmm,' 'right,' 'oh yeah,' 'uh-huh' — spoken on the beat while the other person talks. The trick: pair each cue with a small nod. Say 'mm-hmm' low and quick every 3-5 seconds while the speaker holds the floor. It signals 'I'm tracking, keep going' without interrupting. Silence reads as disengagement; over-nodding reads as fake. One small nod per cue, one cue per few sentences — that's the native rhythm.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Run the Weather Opener",
      phrase: "So, crazy weather lately, huh? — I know, right? Supposed to clear up though.",
      ipa: "/soʊ | ˈkreɪzi ˈwɛðər ˈleɪtli hʌ | aɪ noʊ rait | səˈpoʊzd tuː klɪr ʌp ðoʊ/",
      tip: "Open low on 'So,' jump to 'crazy' and 'weather' as the stressed pair. The tag 'huh' /hʌ/ is short and rising. 'I know, right?' lands on the beat — 'right' rises slightly. 'Supposed to' reduces to /səˈpoʊzdə/; 'though' /ðoʊ/ at the end is the soft landing.",
      passScore: 72,
    },
    {
      id: "quiz",
      type: "quiz",
      question:
        "A coworker you barely know says 'How was your weekend?' at the coffee machine. Which response is the BEST small talk move?",
      options: [
        "'Terrible. My car broke down and I had to call a tow truck, and then…' (full story)",
        "'Fine.' (one word, then silence)",
        "'Pretty good — went hiking. You?' (brief, positive, bounces back)",
        "'I don't really want to talk about it.' (closes off)",
      ],
      correct: 2,
      explanation:
        "Small talk rules: brief, positive, and bounce the question back. Option 3 gives one concrete detail ('went hiking') and returns the floor with 'You?' — inviting the coworker to share. Option 1 overloads a stranger with negative detail; small talk isn't the venue. Option 2 reads as cold or disengaged. Option 4 actively shuts down the social ritual. The sweet spot is 5-10 words, one detail, one return question.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Small Talk Mastery Complete!",
      subtitle: "You can now run weather, weekend, and sports exchanges with reduced forms, natural fillers, and active listening cues. Phase 4 — Conversational Patterns — is complete.",
      xp: 160,
      badge: "💬 Chat Champion",
      nextLessonTitle: "Gonna & Wanna",
    },
  ],
};

export default lesson;
