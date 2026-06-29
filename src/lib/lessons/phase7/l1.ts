import type { Lesson } from "../../types";

// Phase 7 — Lesson 1: Job Interview English
// Professional register, model interview answers, syllable stress on multi-syllable words.
// 11 steps: intro, concept, concept, stress-bars, stress-bars, example, tap-pronounce, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p7l1",
  phaseId: 6,
  lessonIndex: 0,
  title: "Job Interview English",
  subtitle: "Sound competent, calm, and credible from the first 'hello'",
  duration: 11,
  xp: 160,
  objectives: [
    "Adopt the professional interview register: measured tempo, narrow pitch, full articulation",
    "Stress multi-syllable professional vocabulary correctly (experience, qualification, responsibility)",
    "Replace filler sounds with professional buying-time phrases",
    "Deliver a model 'Tell me about yourself' response with confident pacing",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Job Interview English",
      subtitle: "Speak like the candidate they want to hire",
      description:
        "An interview is a high-stakes speech act: thirty minutes to project competence, warmth, and trust. Native speakers use a specific register for this — slower than casual, faster than news, with full articulation of professional vocabulary and zero filler sounds. In this lesson you build the voice that says 'hire me' before you've even answered the question.",
      visual: "shadow",
      emoji: "💼",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Interview Register",
      body: [
        "The interview register sits between casual conversation and formal broadcast. It is slower and more articulated than talking with a friend, but warmer and more flexible than reading the news. The goal is to sound competent and confident without sounding robotic or rehearsed.",
        "Three acoustic features define it: a narrowed pitch range (you stay within a fifth, an octave at most), a tempo of about 140–160 words per minute (slower than casual, faster than a speech), and full articulation of content words — especially multi-syllable professional terms like 'experience', 'qualification', and 'responsibility'. These words are the credentials you wear on your breath.",
      ],
      bulletPoints: [
        "TEMPO: 140–160 wpm — slower than casual, faster than broadcast",
        "PITCH: narrow band, no dramatic swings — authority comes from control",
        "ARTICULATION: every syllable of every content word is pronounced",
        "BREATH: low and steady, shoulders relaxed — never chest-raised",
        "ENDING: statements fall cleanly; only genuine questions rise",
      ],
      visual: "wave",
      visualLabel: "Steady interview pitch contour",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Replacing Filler with Professional Bridges",
      body: [
        "Filler sounds ('um', 'uh', 'like', 'you know') leak into speech when the brain is searching for the next word. In an interview they read as uncertainty. Native professional speakers replace them with bridge phrases that sound deliberate — buying the same thinking time, but framed as composure rather than confusion.",
        "The trick is that the bridge phrase itself takes about as long as an 'um' but signals control. 'Let me think about that for a moment' is two seconds of pure thinking time that sounds professional. 'That's a great question' resets the rhythm and lets you breathe. 'To give you the short answer' signals structure.",
      ],
      bulletPoints: [
        "REPLACE 'um...' → 'Let me think about that for a moment.'",
        "REPLACE 'uh...' → 'That's a great question.'",
        "REPLACE 'like...' → 'For example...' or 'To give you an example...'",
        "REPLACE 'you know...' → 'As I mentioned...' or 'To put it simply...'",
        "AVOID: 'hopefully', 'kind of', 'sort of', 'basically' — all hedge words that drain authority",
      ],
      visual: "phoneme-grid",
      visualLabel: "Filler → professional bridge mapping",
    },
    {
      id: "stress-bars-experience",
      type: "stress-bars",
      title: "Stress in 'experience'",
      word: "experience",
      syllables: [
        { text: "ex", stressed: false },
        { text: "PE", stressed: true },
        { text: "ri", stressed: false },
        { text: "ence", stressed: false },
      ],
      description:
        "Four syllables, primary stress on the second: ex-PE-ri-ence. The unstressed syllables collapse toward schwa: /ɪkˈspɪriəns/ in American English, /ɪkˈspɪəriəns/ in British. Learners often say 'EX-pe-ri-ence' (wrong) — placing stress on the first syllable marks you instantly as non-native in a professional setting.",
    },
    {
      id: "stress-bars-qualification",
      type: "stress-bars",
      title: "Stress in 'qualification'",
      word: "qualification",
      syllables: [
        { text: "QUAL", stressed: true },
        { text: "i", stressed: false },
        { text: "fi", stressed: false },
        { text: "ca", stressed: false },
        { text: "tion", stressed: false },
      ],
      description:
        "Five syllables, primary stress on the first: QUAL-i-fi-ca-tion. The 'i-fi-ca' stretch all reduces to schwas: /ˌkwɒlɪfɪˈkeɪʃən/. The 'tion' is /ʃən/, never /ʃɒn/. Hit QUAL hard, let the rest flow softly — this is the rubber-band stretch on the stressed syllable.",
    },
    {
      id: "example-tell-me",
      type: "example",
      title: "Model 'Tell Me About Yourself' Answer",
      phrase: "I'm a product manager with five years of experience leading cross-functional teams in the fintech space.",
      ipa: "/aɪm ə ˈprɒdʌkt ˈmænɪdʒər wɪð faɪv jɪrz ʌv ɪkˈspɪriəns ˈliːdɪŋ krɒs-ˈfʌŋkʃənəl tiːmz ɪn ðə ˈfɪntɛk speɪs/",
      highlightWords: ["product", "manager", "experience", "leading", "cross-functional", "fintech"],
      tip: "The content words — product, manager, experience, leading, cross-functional, fintech — get the stress. Everything else reduces: 'I'm' /aɪm/, 'a' /ə/, 'with' /wɪð/, 'of' /ʌv/, 'in the' /ɪn ðə/. End on a clean fall on 'space' to signal a complete thought.",
      tapWords: [
        { word: "product manager", ipa: "/ˈprɒdʌkt ˈmænɪdʒər/" },
        { word: "experience", ipa: "/ɪkˈspɪriəns/" },
        { word: "cross-functional", ipa: "/krɒs-ˈfʌŋkʃənəl/" },
        { word: "fintech", ipa: "/ˈfɪntɛk/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Interview Vocabulary",
      description: "Tap each word to hear it. These are the words that pay the rent — get every syllable right.",
      words: [
        { word: "experience", ipa: "/ɪkˈspɪriəns/", meaning: "ex-PE-ri-ence — primary stress on 2nd syllable" },
        { word: "qualification", ipa: "/ˌkwɒlɪfɪˈkeɪʃən/", meaning: "QUAL-i-fi-ca-tion — primary stress on 1st" },
        { word: "responsibility", ipa: "/rɪˌspɒnsəˈbɪlɪti/", meaning: "re-spon-si-BIL-i-ty — primary stress on 4th" },
        { word: "opportunity", ipa: "/ˌɒpərˈtuːnɪti/", meaning: "op-por-TU-ni-ty — primary stress on 3rd" },
        { word: "collaboration", ipa: "/kəˌlæbəˈreɪʃən/", meaning: "col-lab-o-RA-tion — primary stress on 4th" },
        { word: "accomplishment", ipa: "/əˈkʌmplɪʃmənt/", meaning: "a-CCOM-plish-ment — primary stress on 2nd" },
        { word: "initiative", ipa: "/ɪˈnɪʃɪtɪv/", meaning: "i-NI-ti-a-tive — primary stress on 2nd" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — The Two-Second Pause",
      body: "When a hard question lands, do not rush. Pause — physically — for a full two seconds before answering. To you it feels like an eternity. To the interviewer it sounds like thoughtfulness. Native candidates who answer instantly sound rehearsed; native candidates who pause and then answer with structure sound considered. The pause is a feature, not a gap. Pair it with a slow inhale through the nose and a brief 'That's a great question.' — you will project the calm that interviewers are actually scoring.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Strength & Weakness Response",
      phrase: "My greatest strength is my attention to detail. My greatest weakness is that I can be too hard on myself when a project doesn't go perfectly.",
      ipa: "/maɪ ˈɡreɪtɪst strɛŋθ ɪz maɪ əˈtɛnʃən tuː ˈdiːteɪl maɪ ˈɡreɪtɪst ˈwiːknəs ɪz ðæt aɪ kæn biː tuː hɑːrd ɒn maɪˈsɛlf wɛn ə ˈprɒdʒɛkt ˈdʌzənt ɡoʊ ˈpɜːrfɪktli/",
      tip: "Stress: GREATEST, STRENGTH, ATTENTION, DETAIL on the first clause. Pause one beat. Then GREATEST, WEAKNESS, TOO HARD, MYSELF, PERFECTLY on the second. The word 'weakness' itself falls to show you mean it. Don't rush the transition — the pause between strength and weakness is where confidence lives.",
      passScore: 78,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Midway through an answer, you realize you need a moment to think. What is the best way to fill that gap?",
      options: [
        "Say 'um... uh... let me think...' — interviewers expect this",
        "Stay silent for as long as you need — silence shows confidence",
        "Say 'Let me think about that for a moment.' — controlled, deliberate, professional",
        "Repeat the question back verbatim — buys time and confirms understanding",
      ],
      correct: 2,
      explanation:
        "A brief professional bridge phrase ('Let me think about that for a moment' or 'That's a great question') is the native-speaker move. Option 1 leaks filler and reads as uncertainty. Option 2 — pure silence — can feel awkward in video interviews and reads as freezing up if it runs longer than three seconds. Option 4 is awkward and time-wasting when repeated. The bridge phrase occupies the same thinking window but signals composure: the interviewer hears 'this person is thinking carefully,' not 'this person is lost.'",
    },
    {
      id: "completion",
      type: "completion",
      title: "Job Interview English Complete!",
      subtitle: "You can now deliver a model interview answer with professional register, correct syllable stress, and bridge phrases instead of filler. The voice says 'hire me' before the answer is even finished.",
      xp: 160,
      badge: "💼 Interview Ready",
      nextLessonTitle: "Presentation Skills",
    },
  ],
};

export default lesson;
