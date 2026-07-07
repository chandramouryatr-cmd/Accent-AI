import type { Lesson } from "../../types";

// Phase 7 — Lesson 3: Phone Communication
// Phone-specific clarity, NATO phonetic alphabet, /s/ vs /f/ mouth diagram, confirming spelling.
// 11 steps: intro, concept, concept, mouth-diagram, example, tap-pronounce, example, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p7l3",
  phaseId: 6,
  lessonIndex: 2,
  title: "Phone Communication",
  subtitle: "Be understood when nobody can see your mouth",
  duration: 11,
  xp: 165,
  objectives: [
    "Adapt speech for phone audio: slower tempo, sharper consonants, exaggerated vowels",
    "Master the NATO phonetic alphabet for spelling names, codes, and addresses",
    "Distinguish /s/ from /f/ and /θ/ on bad phone connections",
    "Run a complete phone exchange: greeting, message, confirmation, close",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Phone Communication",
      subtitle: "Speak through the worst speaker in the room",
      description:
        "Phone audio strips away 70% of the cues that make speech intelligible: no lip reading, no facial expression, no gestures, no eye contact. The audio is compressed, often delayed, and frequently distorted. Native speakers automatically shift to a 'phone register' — slower, sharper, more articulated, with strategic use of the NATO phonetic alphabet to confirm letters. This lesson teaches you to be the voice that comes through clearly even on a bad connection.",
      visual: "wave",
      emoji: "📞",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "Why Phone Audio Breaks Speech",
      body: [
        "Phones compress audio to save bandwidth. They typically cut frequencies above 3400 Hz — which is exactly where the high-frequency energy of consonants like /s/, /f/, /θ/, /t/, /k/ lives. Vowels, which live below 2000 Hz, come through fine. So on a phone, 's' starts to sound like 'f', 'th' can disappear entirely, and 't' can vanish into a following consonant.",
        "The native speaker's adaptation is to over-articulate consonants (especially sibilants and stops), slow down by about 20%, and stretch vowels slightly so the word shape remains recognizable even when consonants blur. They also avoid soft onsets — instead of starting with a vowel ('I'm calling about...'), they often start with a clear consonant ('Hello, this is...').",
      ],
      bulletPoints: [
        "PHONES CUT >3400 Hz — sibilants (/s/, /ʃ/, /f/, /θ/) lose energy",
        "SLOW DOWN ~20% — gives the listener time to decode",
        "OVER-ARTICULATE consonants — especially /s/, /t/, /k/, /θ/, /f/",
        "STRETCH vowels slightly — preserves word shape",
        "AVOID starting with a vowel — start with a consonant when possible",
        "SPELL anything ambiguous — names, codes, addresses, emails",
      ],
      visual: "wave",
      visualLabel: "Phone frequency cutoff at ~3400 Hz",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "The NATO Phonetic Alphabet",
      body: [
        "When a letter could be misheard (B vs P, M vs N, S vs F), native professionals use the NATO phonetic alphabet — Alpha, Bravo, Charlie, and so on. Each word is chosen so that even on a degraded connection, the first consonant is unmistakable. 'Bravo' and 'Papa' would never be confused because the words themselves sound nothing alike even at low fidelity.",
        "You do not need to memorize all 26 today. But you should know the high-confusion pairs: B/Bravo, P/Papa, M/Mike, N/November, S/Sierra, F/Foxtrot. And the ones used constantly: A/Alpha, C/Charlie, D/Delta, T/Tango. Use them every time you spell a name or email — it is what every receptionist, dispatcher, and air traffic controller does as reflex.",
      ],
      bulletPoints: [
        "A = Alpha (æl-fə) — clear /æ/ vowel, no confusion",
        "B = Bravo (brə-VOH) — /br/ onset distinguishes from P",
        "M = Mike (maɪk) — diphthong /aɪ/ is unmistakable",
        "N = November (no-VEM-ber) — three syllables, distinct from M",
        "S = Sierra (si-ER-ə) — /s/ onset, contrast with F",
        "F = Foxtrot (FOKS-trot) — /f/ onset, contrast with S",
        "P = Papa (PAH-pah) — distinct from B/Bravo",
        "T = Tango (TANG-go) — distinct from D/Delta",
      ],
      visual: "phoneme-grid",
      visualLabel: "NATO alphabet high-confusion pairs",
    },
    {
      id: "mouth-diagram-s-vs-f",
      type: "mouth-diagram",
      title: "/s/ vs /f/ on the Phone",
      description:
        "On a phone, /s/ and /f/ sound almost identical because their high-frequency hiss gets clipped. The fix is to articulate them more sharply. For /s/, the tongue tip is up behind the upper teeth, creating a narrow groove that the air hisses through. For /f/, the upper teeth rest on the lower lip — no tongue involved. Exaggerate both positions on phone calls.",
      tonguePosition: "front-high",
      lipShape: "spread",
      sound: "s",
      exampleWord: "Sierra",
    },
    {
      id: "example-phone-exchange",
      type: "example",
      title: "Phone Greeting & Identity",
      phrase: "Hello, this is Alex Chen calling from Acme Industries. May I speak with Jordan, please?",
      ipa: "/həˈloʊ ðɪs ɪz ˈælɛks ˈtʃɛn ˈkɔːlɪŋ frɒm ˈækmi ˈɪndəstriz meɪ aɪ spiːk wɪð ˈdʒɔːrdən pliːz/",
      highlightWords: ["Hello", "Alex", "Chen", "Acme", "Jordan", "please"],
      tip: "Each name gets a slight pause after it: 'Hello... Alex Chen... Acme Industries... Jordan, please?' The pauses give the listener time to write the name down. Stress the surnames: CHEN, JOR-dan. Avoid contractions on phone introductions — 'this is' not 'this's', 'I am' not 'I'm' for first identification.",
      tapWords: [
        { word: "Hello", ipa: "/həˈloʊ/" },
        { word: "Alex Chen", ipa: "/ˈælɛks ˈtʃɛn/" },
        { word: "Acme Industries", ipa: "/ˈækmi ˈɪndəstriz/" },
        { word: "Jordan", ipa: "/ˈdʒɔːrdən/" },
      ],
    },
    {
      id: "tap-pronounce-nato",
      type: "tap-pronounce",
      title: "NATO Phonetic Alphabet — Key Words",
      description: "Tap each word. These are the workhorses of phone spelling — say them at moderate tempo, with crisp initial consonants.",
      words: [
        { word: "Alpha", ipa: "/ˈælfə/", meaning: "letter A" },
        { word: "Bravo", ipa: "/brəˈvoʊ/", meaning: "letter B — distinct from P/Papa" },
        { word: "Charlie", ipa: "/ˈtʃɑːrli/", meaning: "letter C" },
        { word: "Delta", ipa: "/ˈdɛltə/", meaning: "letter D" },
        { word: "Foxtrot", ipa: "/ˈfɒkstrɒt/", meaning: "letter F — distinct from S/Sierra" },
        { word: "Mike", ipa: "/maɪk/", meaning: "letter M — distinct from N/November" },
        { word: "November", ipa: "/noʊˈvɛmbər/", meaning: "letter N" },
        { word: "Papa", ipa: "/pəˈpɑː/", meaning: "letter P — distinct from B/Bravo" },
        { word: "Sierra", ipa: "/siˈɛrə/", meaning: "letter S — distinct from F/Foxtrot" },
        { word: "Tango", ipa: "/ˈtæŋɡoʊ/", meaning: "letter T" },
      ],
    },
    {
      id: "example-spelling",
      type: "example",
      title: "Confirming a Spelling",
      phrase: "That's Chen — C as in Charlie, H as in Hotel, E as in Echo, N as in November.",
      ipa: "/ðæts ˈtʃɛn siː æz ɪn ˈtʃɑːrli eɪtʃ æz ɪn hoʊˈtɛl iː æz ɪn ˈɛkoʊ ɛn æz ɪn noʊˈvɛmbər/",
      highlightWords: ["Chen", "Charlie", "Hotel", "Echo", "November"],
      tip: "The pattern is: letter name, 'as in', NATO word. So 'C as in Charlie, H as in Hotel...'. Pause briefly between letter groups so the listener can write. The phrase 'as in' /æz ɪn/ reduces to almost /əz ən/ in fast speech — that's fine, the NATO word carries the meaning.",
      tapWords: [
        { word: "C as in Charlie", ipa: "/siː æz ɪn ˈtʃɑːrli/" },
        { word: "H as in Hotel", ipa: "/eɪtʃ æz ɪn hoʊˈtɛl/" },
        { word: "E as in Echo", ipa: "/iː æz ɪn ˈɛkoʊ/" },
        { word: "N as in November", ipa: "/ɛn æz ɪn noʊˈvɛmbər/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Smile Into the Phone",
      body: "Your listener cannot see your face, but they can hear it. When you smile while speaking, the shape of your mouth changes — vowels brighten, consonants sharpen, and pitch rises slightly. The result on the listener's end is a voice that sounds warmer, more engaged, and more confident. Customer service agents are explicitly trained to smile before every call. Try it: call a friend with a deliberate smile on your face and ask if you sound different. You will. The reverse is also true — a frown or a tired face bleeds through the phone as flat or annoyed, even when your words are polite.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Full Phone Exchange",
      phrase: "Hi, this is Maria Lopez calling. I'm trying to reach someone about my account — the number is seven seven three, two one nine, four five eight zero.",
      ipa: "/haɪ ðɪs ɪz məˈriːə ˈloʊpɛz ˈkɔːlɪŋ aɪm ˈtraɪɪŋ tuː riːtʃ ˈsʌmwʌn əˈbaʊt maɪ əˈkaʊnt ðə ˈnʌmbər ɪz ˈsɛvən ˈsɛvən ˈθriː tuː wʌn naɪn fɔːr faɪv eɪt ˈzɪəroʊ/",
      tip: "Phone numbers are spoken in groups of three or four digits, with a slight rise on each group except the last, which falls. 'Seven seven THREE ↑ / two one NINE ↑ / four five eight ZERO ↓'. Stretch each digit slightly — never rush a phone number. If the listener misses one digit, the whole number is useless.",
      passScore: 80,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "On a bad phone connection, a caller asks you to repeat a letter and you're not sure if they said 'S' or 'F'. What is the best response?",
      options: [
        "Just say 'S' louder — volume fixes everything on a phone",
        "Say 'S, like Sierra' to confirm using the NATO alphabet",
        "Say 'S as in snake' — informal analogies work better than NATO",
        "Ask them to email the spelling instead — phones are unreliable",
      ],
      correct: 1,
      explanation:
        "Using the NATO phonetic alphabet ('S as in Sierra', 'F as in Foxtrot') is the universal native-professional move. The NATO words were specifically chosen because their initial consonants remain distinguishable even on degraded audio. Option 1 — just louder — does nothing; /s/ and /f/ both live in the same clipped high-frequency range, so volume cannot separate them. Option 3 — informal analogies ('snake', 'frank') — works in casual calls but is non-standard, slower, and ambiguous (snake could be S or C, frank could be F or R in some accents). Option 4 — abandon phone for email — wastes time and signals you cannot handle basic phone communication. 'Sierra' vs 'Foxtrot' is universal and instant.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Phone Communication Complete!",
      subtitle: "You can now speak clearly on a phone, spell names with the NATO alphabet, and run a complete phone exchange. The voice comes through.",
      xp: 165,
      badge: "📞 Phone Pro",
      nextLessonTitle: "Public Speaking",
    },
  ],
};

export default lesson;
