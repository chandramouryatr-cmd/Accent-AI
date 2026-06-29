import type { Lesson } from "../../types";

// Phase 8 — Lesson 3: Regional Variants
// Recognize and produce the four major regional accents of English:
// General American, Southern US, NYC, Standard British (RP).
// 12 steps: intro, concept, concept, compare, vowel-chart, example,
// tap-pronounce, mouth-diagram, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p8l3",
  phaseId: 7,
  lessonIndex: 2,
  title: "Regional Variants",
  subtitle: "Switch between General American, Southern, NYC, and Standard British on demand",
  duration: 13,
  xp: 200,
  objectives: [
    "Identify the 2–3 signature phonetic tells of each of the four major English accents",
    "Produce the trap-bath split, non-rhotic R, Southern /aɪ/ monophthongization, and NYC raised /ɔː/",
    "Recognize any accent within the first three words of an utterance",
    "Pick one accent as your default and avoid mid-sentence switching",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Regional Variants",
      subtitle: "The map of English — four accents, twelve tells",
      description:
        "English is not one accent — it is dozens. But four regional standards dominate global media and conversation: General American (the US default you hear in most Hollywood films), Southern US (the drawl of the American South), New York City (the accent of Brooklyn and the Bronx), and Standard British / RP (the accent of BBC news and prestige drama). Each accent has only 2–3 signature phonetic tells — master those tells and you can both recognize any accent within three words and produce a convincing version on demand. This lesson maps all four accents, contrasts them side by side, and trains you to switch between them. You don't need to perfect all four — but you do need to recognize them, and you should pick ONE as your default.",
      visual: "vowel-chart",
      emoji: "🗺️",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Four Accents and Their Signature Tells",
      body: [
        "Each major English accent has a small set of phonetic features that uniquely identify it. General American is rhotic (every written R is pronounced), keeps the BATH vowel as flat /æ/ (dance = /dæns/), and uses a flap T between vowels (water = /ˈwɔɾər/). Southern US monophthongizes the /aɪ/ diphthong into a long /aː/ (time = /taːm/), merges pen and pin into the same vowel, and uses a slower drawl with elongated vowels. New York City is variably non-rhotic (car = /kɑː/), raises the THOUGHT vowel /ɔː/ into a diphthong (coffee = /ˈkɔəfi/), and uses intrusive R between vowel-final words (idea of = /aɪˈdiər əv/). Standard British / RP is non-rhotic (car = /kɑː/), splits the BATH vowel to broad /ɑː/ (dance = /dɑːns/), and uses a clear L plus dark L contrast.",
        "These tells are the diagnostic fingerprints. When a native speaker hears the word 'dance' as /dɑːns/, they instantly tag the speaker as British. When they hear 'time' as /taːm/, they tag Southern. When they hear 'coffee' as /ˈkɔəfi/, they tag NYC. Learners often produce a mixed accent — British vowels with American R, or American vowels with occasional broad-A words — and the result sounds confused, like the speaker doesn't know who they are. The fix is deliberate: pick ONE accent as your default, learn its three tells cold, and stick to it. Then optionally learn the tells of the others so you can recognize them.",
      ],
      bulletPoints: [
        "GEN AMERICAN — rhotic, /æ/ in BATH, flap T (water → /ˈwɔɾər/)",
        "SOUTHERN US — /aɪ/ → /aː/ (time → /taːm/), pen/pin merger, slow drawl",
        "NYC — variably non-rhotic, raised /ɔː/ (coffee → /ˈkɔəfi/), intrusive R",
        "STANDARD BRITISH / RP — non-rhotic, BATH /ɑː/ (dance → /dɑːns/), clear+dark L",
        "Rule — pick ONE default, never switch mid-sentence",
      ],
      visual: "phoneme-grid",
      visualLabel: "Four accents, twelve diagnostic tells",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Rhoticity — The Single Biggest Divider",
      body: [
        "The single most reliable divider across English accents is rhoticity — whether the written R is pronounced after a vowel. Rhotic accents (General American, Scottish, Irish) pronounce every R: 'car' = /kɑr/, 'hard' = /hɑrd/, 'water' = /ˈwɔtər/. Non-rhotic accents (RP, Australian, NYC-variable) drop the post-vocalic R: 'car' = /kɑː/, 'hard' = /hɑːd/, 'water' = /ˈwɔːtə/. This single feature accounts for the bulk of the perceived difference between American and British English — a learner who pronounces every R sounds American; a learner who drops them sounds British.",
        "The trap for learners is consistency. If you say 'car' as /kɑː/ (British) but 'hard' as /hɑrd/ (American) in the same sentence, native ears hear a confused speaker. Pick one strategy and apply it to every R. Note that even non-rhotic speakers have rules: they DO pronounce the R when the next word starts with a vowel (linking R: 'far away' = /fɑːr əˈweɪ/), and they insert an R between two vowel-final words even when none is written (intrusive R: 'idea of' = /aɪˈdiər əv/). Rhoticity is not just 'drop the R' — it is a system, and the system has to be applied consistently to sound native.",
      ],
      bulletPoints: [
        "RHOTIC — pronounce every R (GenAm, Scottish, Irish): car /kɑr/, hard /hɑrd/",
        "NON-RHOTIC — drop post-vocalic R (RP, Australian, NYC): car /kɑː/, hard /hɑːd/",
        "LINKING R — non-rhotic speakers DO pronounce R before a vowel: far away /fɑːr əˈweɪ/",
        "INTRUSIVE R — non-rhotic speakers add R between vowels: idea of /aɪˈdiər əv/",
        "MIXING rhotic and non-rhotic in one sentence = 'confused speaker' tell",
      ],
      visual: "compare-wave",
      visualLabel: "Rhotic vs non-rhotic on the same word",
    },
    {
      id: "compare-dance",
      type: "compare",
      title: "GenAm vs RP — 'dance'",
      nativePhrase: "dance (General American)",
      learnerPhrase: "dance (Standard British RP)",
      nativeIpa: "/dæns/",
      learnerIpa: "/dɑːns/",
      description:
        "The BATH split is the tell. General American keeps the vowel short and flat — /æ/, tongue low and forward, jaw dropped. Standard British stretches it into a long open back vowel — /ɑː/, tongue low and back, jaw dropped but mouth more open and rounder. The difference is small phonetically but enormous socially: it is THE feature that marks you as American or British within the first three words. Practice alternating: /dæns/ /dɑːns/ /dæns/ /dɑːns/ — feel your tongue slide forward (American) then back (British) on the same word.",
    },
    {
      id: "vowel-chart-bath",
      type: "vowel-chart",
      title: "BATH Vowel — Same Lexical Set, Four Regions",
      description:
        "The same BATH lexical set (dance, bath, ask, chance) maps to three different vowels across accents. General American keeps it as front-low /æ/ (top-left). Southern US often raises and lengthens it slightly toward /æː/ or even /ɛə/. Standard British RP backs it to long /ɑː/ (bottom-back). NYC sits between. Tap each dot — the same word, three different tongue positions.",
      vowels: [
        { ipa: "æ", x: 22, y: 78, label: "GenAm BATH", color: "#22d3ee" },
        { ipa: "æː", x: 32, y: 70, label: "Southern BATH (raised)", color: "#f59e0b" },
        { ipa: "ɑː", x: 70, y: 80, label: "RP BATH (broad A)", color: "#8b5cf6" },
        { ipa: "ɑ", x: 60, y: 75, label: "NYC BATH (intermediate)", color: "#ec4899" },
        { ipa: "aː", x: 50, y: 85, label: "Southern PRICE → monophthong", color: "#10b981" },
      ],
      highlight: "ɑː",
    },
    {
      id: "example-southern",
      type: "example",
      title: "Southern Drawl in Action",
      phrase: "Well, I tell you what — I been thinkin' 'bout it a long time, and I just ain't sure.",
      ipa: "/wɛl aɪ tɛl juː wʌt aɪ bɪn ˈθɪŋkɪn baʊt ɪt ə lɔːŋ taːm ænd aɪ dʒʌst eɪnt ʃʊr/",
      highlightWords: ["I", "what", "thinkin'", "'bout", "long", "time", "ain't", "sure"],
      tip: "Three Southern tells in one sentence. (1) 'time' is monophthongized to /taːm/ — the /aɪ/ diphthong becomes a long flat /aː/, the signature drawl. (2) Final G is dropped: 'thinkin'' not 'thinking' — /ˈθɪŋkɪn/ — Southern, AAVE-influenced, and casual American generally. (3) Vowels are elongated: 'long' becomes /lɔːŋ/, stretched out — the drawl is not just about which vowels you use, but how long you hold them. Southern English is SLOWER than General American, with each vowel given more time.",
      tapWords: [
        { word: "thinkin'", ipa: "/ˈθɪŋkɪn/" },
        { word: "'bout", ipa: "/baʊt/" },
        { word: "long", ipa: "/lɔːŋ/" },
        { word: "time", ipa: "/taːm/" },
        { word: "ain't", ipa: "/eɪnt/" },
      ],
    },
    {
      id: "tap-pronounce-regions",
      type: "tap-pronounce",
      title: "Same Word, Four Accents",
      description: "Tap each pair. Same English word — different regional vowel or R treatment. Train your ear to identify the accent from a single word.",
      words: [
        { word: "car (GenAm)", ipa: "/kɑr/", meaning: "rhotic — R pronounced" },
        { word: "car (RP)", ipa: "/kɑː/", meaning: "non-rhotic — R dropped, long vowel" },
        { word: "dance (GenAm)", ipa: "/dæns/", meaning: "flat /æ/ BATH vowel" },
        { word: "dance (RP)", ipa: "/dɑːns/", meaning: "broad /ɑː/ BATH vowel" },
        { word: "coffee (GenAm)", ipa: "/ˈkɔfi/", meaning: "standard /ɔ/" },
        { word: "coffee (NYC)", ipa: "/ˈkɔəfi/", meaning: "raised diphthong /ɔə/" },
        { word: "time (GenAm)", ipa: "/taɪm/", meaning: "full /aɪ/ diphthong" },
        { word: "time (Southern)", ipa: "/taːm/", meaning: "monophthongized to /aː/" },
      ],
    },
    {
      id: "mouth-nyc-thought",
      type: "mouth-diagram",
      title: "NYC Raised THOUGHT — 'coffee'",
      description:
        "The NYC 'coffee' /ˈkɔəfi/ raises the THOUGHT vowel into a diphthong. The tongue starts slightly higher than standard /ɔ/ (back-mid) and glides up and forward into a schwa-like offglide — /ɔə/. The lips round more tightly than in General American. This single feature — the raised, diphthongized THOUGHT vowel — is the most recognizable NYC tell. When you hear 'coffee' pronounced /ˈkɔəfi/ instead of /ˈkɔfi/, you are listening to a New Yorker.",
      tonguePosition: "back-high",
      lipShape: "rounded",
      sound: "ɔə",
      exampleWord: "coffee / talk / walk / New York",
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick — Pick ONE Default, Learn the Rest by Ear",
      body: "Pick ONE accent as your default and commit to it for every conversation — General American is the safest global default because it's the most widely understood and the most neutral in business contexts. Once your default is solid, learn the 2–3 signature tells of the other three accents so you can RECOGNIZE them even if you don't produce them. Why? Because switching accents mid-sentence — British vowel here, American R there — is the single most common learner mistake, and it instantly reads as 'I am not sure who I am.' A consistent American-accented speaker sounds confident; a mixed-accent speaker sounds lost. Commit to one. If you eventually want to learn a second accent, learn it as a complete separate system you can switch into wholesale — never blend.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Produce Two Accents — Same Phrase",
      phrase: "Park the car in the Harvard yard.",
      ipa: "/pɑrk ðə kɑr ɪn ðə ˈhɑrvərd jɑrd/",
      tip: "Say this phrase TWICE, in two complete accents — never blended. (1) GENERAL AMERICAN — rhotic, every R pronounced: /pɑrk ðə kɑr ɪn ðə ˈhɑrvərd jɑrd/. (2) STANDARD BRITISH RP — non-rhotic, all R's dropped and BATH vowels broadened: /pɑːk ðə kɑː ɪn ðə ˈhɑːvəd jɑːd/. Record both — the American version should have crisp R's at the end of 'park', 'car', 'Harvard', 'yard'; the British version should have no R sound at all and longer open vowels. Do NOT switch mid-sentence. Each version is internally consistent.",
      passScore: 82,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "You hear a speaker pronounce 'pen' and 'pin' as identical — both sound like /pɪn/. Which regional accent does this speaker most likely have?",
      options: [
        "General American — pen/pin merger is standard across the US",
        "Southern US — the pen/pin merger is a signature Southern tell",
        "New York City — NYC speakers merge pen and pin before nasal consonants",
        "Standard British RP — RP speakers do not distinguish /e/ and /ɪ/ before /n/",
      ],
      correct: 1,
      explanation:
        "Option 2 is correct — the pen/pin merger (where /e/ and /ɪ/ collapse into /ɪ/ before nasal consonants) is a signature tell of Southern US English. A Southerner will say 'pen' and 'pin' identically as /pɪn/, and 'ten' and 'tin' identically as /tɪn/. General American (option 1) keeps these distinct — /pɛn/ vs /pɪn/. NYC (option 3) does not have this merger; NYC's signature tells are non-rhoticity and the raised THOUGHT vowel in 'coffee'. Standard British RP (option 4) also keeps pen and pin distinct. The pen/pin merger is one of the fastest ways to identify a Southern US accent — combined with the /aɪ/ → /aː/ monophthongization in 'time', it's diagnostic.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Regional Variants Complete!",
      subtitle: "You can now recognize the four major English accents from their signature tells, produce the trap-bath split, non-rhotic R, Southern /aɪ/ monophthongization, and NYC raised THOUGHT vowel, and you've committed to ONE default accent while learning the rest by ear.",
      xp: 200,
      badge: "🗺️ Accent Cartographer",
      nextLessonTitle: "Master Performance",
    },
  ],
};

export default lesson;
