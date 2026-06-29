import type { Lesson } from "../../types";

// Phase 2 — Lesson 2: Syllable Stress Rules
// Stress the wrong syllable and even a perfectly pronounced word becomes
// incomprehensible to a native ear. English has predictable stress rules
// based on suffixes and word class. Learn them and you nail 90% of words.

const lesson: Lesson = {
  id: "p2l2",
  phaseId: 1,
  lessonIndex: 1,
  title: "Syllable Stress Rules",
  subtitle: "Stress the wrong syllable, lose the word",
  duration: 10,
  xp: 135,
  objectives: [
    "Apply the five core English stress rules (word class, suffixes, compounds)",
    "Hear how the same root shifts stress: PHOtograph, phoTOgraphy, photoGRAPHic",
    "Self-correct stress on unfamiliar words using suffix patterns",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Syllable Stress Rules",
      subtitle: "Where the beat falls changes everything",
      description:
        "Stress is the heartbeat of an English word. Put it on the wrong syllable and a native listener won't even recognize the word — 'phoTOgraphy' sounds like a completely different word than 'phoTOgraphy' vs 'PHOtograph'. The good news: English stress follows predictable rules. Learn the rules and you can stress almost any new word correctly on the first try.",
      visual: "stress-bars",
      emoji: "📊",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Five Stress Rules",
      body: [
        "English doesn't stress randomly. Five rules cover the vast majority of words:",
        "RULE 1 — Noun vs Verb: Two-syllable noun-verb pairs stress the FIRST syllable as a noun and the SECOND as a verb. RE-cord (noun) vs re-CORD (verb). PRE-sent (noun) vs pre-SENT (verb).",
        "RULE 2 — Suffix attracts stress: Suffixes like '-ic', '-tion', '-sion', '-ity', '-ical', '-ian' pull the stress to the syllable immediately BEFORE them. pho-TO-graph-IC, in-for-MA-tion, eco-NOM-ic.",
        "RULE 3 — Suffix neutral (stress stays on root): Suffixes like '-ness', '-ly', '-ful', '-less', '-ment' don't change the stress. HAPPY → HAPPIness, SUDden → SUDdenly.",
        "RULE 4 — Compound nouns: Stress the FIRST element. BLACKboard, POSTman, BASEball. Compound adjectives (adjective + noun) also stress first: BLACKbird.",
        "RULE 5 — Compound verbs/phrasal: Stress the SECOND element (the particle). un-DERstand, look-UP, give-IN.",
      ],
      bulletPoints: [
        "Noun→first, Verb→second: RE-cord vs re-CORD",
        "Stress-attracting suffixes: -ic, -tion, -sion, -ity, -ical, -ian",
        "Neutral suffixes: -ness, -ly, -ful, -less, -ment, -er",
        "Compound noun → first: BLACKboard",
        "Phrasal verb → particle: look-UP, give-IN",
      ],
      visual: "stress-bars",
      visualLabel: "Stress shifts in word families",
    },
    {
      id: "stress-bars-photo",
      type: "stress-bars",
      title: "PHOtograph",
      word: "photograph",
      syllables: [
        { text: "PHO", stressed: true },
        { text: "to", stressed: false },
        { text: "graph", stressed: false },
      ],
      description:
        "The base noun stresses the first syllable: /ˈfoʊtəɡræf/. The unstressed syllables reduce to schwa — 'to' becomes /tə/ and 'graph' (with /æ/) is unstressed but not schwa here because it's the final syllable.",
    },
    {
      id: "stress-bars-photography",
      type: "stress-bars",
      title: "phoTOgraphy",
      word: "photography",
      syllables: [
        { text: "pho", stressed: false },
        { text: "TO", stressed: true },
        { text: "gra", stressed: false },
        { text: "phy", stressed: false },
      ],
      description:
        "Add the '-y' suffix and the stress jumps to the second syllable: /fəˈtɑːɡrəfi/. The first syllable 'pho' reduces to /fə/. Notice how the SAME root word 'photo' sounds completely different in each form.",
    },
    {
      id: "stress-bars-photographic",
      type: "stress-bars",
      title: "photoGRAPHic",
      word: "photographic",
      syllables: [
        { text: "pho", stressed: false },
        { text: "to", stressed: false },
        { text: "GRAPH", stressed: true },
        { text: "ic", stressed: false },
      ],
      description:
        "The '-ic' suffix pulls stress to the syllable before it: /ˌfoʊtəˈɡræfɪk/. Now the stress is on the THIRD syllable. Three forms of the same root, three different stress patterns — this is what makes English stress so important to master.",
    },
    {
      id: "example-1",
      type: "example",
      title: "Stress in a Real Sentence",
      phrase: "The photographer took a photographic record of the event",
      ipa: "/ðə fəˈtɑːɡrəfər tʊk ə ˌfoʊtəˈɡræfɪk ˈrɛkərd əv ði ɪˈvɛnt/",
      highlightWords: ["photographer", "photographic", "record", "event"],
      tip: "'Photographer' stresses the second syllable (TO); 'photographic' stresses the third (GRAPH); 'record' as a noun stresses the first (RE); 'event' stresses the second (VENT). Each word has its own beat.",
      tapWords: [
        { word: "photographer", ipa: "/fəˈtɑːɡrəfər/" },
        { word: "photographic", ipa: "/ˌfoʊtəˈɡræfɪk/" },
        { word: "record", ipa: "/ˈrɛkərd/" },
        { word: "event", ipa: "/ɪˈvɛnt/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Noun vs Verb Pairs",
      description: "Tap each word and feel how the stress — not the spelling — flips the meaning. Same letters, different word.",
      words: [
        { word: "record (noun)", ipa: "/ˈrɛkərd/", meaning: "RE-cord" },
        { word: "record (verb)", ipa: "/rɪˈkɔːrd/", meaning: "re-CORD" },
        { word: "present (noun)", ipa: "/ˈprɛzənt/", meaning: "PRE-sent" },
        { word: "present (verb)", ipa: "/prɪˈzɛnt/", meaning: "pre-SENT" },
        { word: "object (noun)", ipa: "/ˈɑːbdʒɛkt/", meaning: "OB-ject" },
        { word: "object (verb)", ipa: "/əbˈdʒɛkt/", meaning: "ob-JECT" },
        { word: "produce (noun)", ipa: "/ˈproʊduːs/", meaning: "PRO-duce" },
        { word: "produce (verb)", ipa: "/prəˈduːs/", meaning: "pro-DUCE" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Hum Test",
      body: "When you're not sure which syllable to stress, hum the word instead of saying it: 'mmm-mmm-mmm'. Your voice will naturally rise on the stressed syllable — it's almost impossible to hum a word without revealing the stress. This is the same trick singers use to learn lyrics. Hum the word first, then speak it with the same beat.",
      variant: "info",
    },
    {
      id: "practice",
      type: "practice",
      title: "Now You Try",
      phrase: "The economic situation demanded immediate attention",
      ipa: "/ði ˌɛkəˈnɑːmɪk ˌsɪtʃuˈeɪʃən dɪˈmændɪd ɪˈmiːdiət əˈtɛnʃən/",
      tip: "Four stress-attracting suffixes in one sentence: -ic (e-co-NOM-ic), -tion (si-tu-A-tion), -ate suffix on 'immediate' (im-ME-diate), and -tion again on 'attention' (at-TEN-tion). Land each stressed syllable clearly.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which syllable is stressed in the word 'photography'?",
      options: ["First: PHO-to-gra-phy", "Second: pho-TO-gra-phy", "Third: pho-to-GRAPH-y", "Fourth: pho-to-gra-PHY"],
      correct: 1,
      explanation:
        "The '-y' suffix (and other stress-attracting suffixes like -ical, -ity) places the stress on the antepenultimate (third-from-last) syllable. In 'pho-TO-gra-phy', that's the second syllable: /fəˈtɑːɡrəfi/. Compare with PHOtograph (noun, no suffix) and photoGRAPHic (-ic suffix).",
    },
    {
      id: "completion",
      type: "completion",
      title: "Syllable Stress Rules Complete!",
      subtitle: "You can now apply the five core stress rules to almost any English word.",
      xp: 135,
      badge: "📊 Stress Strategist",
      nextLessonTitle: "Silent Letters",
    },
  ],
};

export default lesson;
