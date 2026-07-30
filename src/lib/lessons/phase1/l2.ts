import type { Lesson } from "../../types";

// Phase 1 — Lesson 2: Consonant Clusters
// English packs two or three consonants together with no vowel between them.
// Most languages insert a vowel (es-treet instead of street). This lesson
// trains the tongue to glide through clusters without breaking them.

const lesson: Lesson = {
  id: "p1l2",
  phaseId: 0,
  lessonIndex: 1,
  title: "Consonant Clusters",
  subtitle: "Stack consonants like a native — no extra vowels allowed",
  duration: 9,
  xp: 120,
  objectives: [
    "Produce common onset clusters /st/, /sp/, /sk/, /str/, /spl/, /θr/, /tw/ cleanly",
    "Avoid inserting a vowel before or inside a cluster (no 'es-treet')",
    "Position the tongue for the /θ/ in clusters like 'three' and 'through'",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Consonant Clusters",
      subtitle: "Two or three sounds, one breath",
      description:
        "A consonant cluster is what happens when English squashes two or three consonants together with no vowel in between — 'street', 'splash', 'three'. Your tongue must transition smoothly from one position to the next without inserting an 'uh' sound. This is one of the biggest tells of a non-native accent.",
      visual: "wave",
      emoji: "🎯",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "What Is a Consonant Cluster?",
      body: [
        "A consonant cluster is a group of consonants pronounced in a row inside the same syllable — like the /str/ at the start of 'street' or the /mpl/ at the end of 'sample'.",
        "Most languages don't allow clusters this complex, so speakers instinctively break them up by inserting a tiny vowel: 'es-treet', 'su-ku-ru'. English ears hear that vowel as a glitch.",
        "The fix is mechanical: pre-position your tongue for the SECOND consonant before you finish the FIRST. The transition becomes silent and smooth.",
      ],
      bulletPoints: [
        "/st/ as in STAY — tongue already on /t/ ridge while /s/ hisses",
        "/sp/ as in SPY — lips close for /p/ during the /s/",
        "/sk/ as in SKY — back of tongue lifts for /k/ during /s/",
        "/str/ as in STREET — /s/ flows directly into /tr/",
        "/spl/ as in SPLASH — three consonants, one glide",
        "/θr/ as in THREE — tongue between teeth, then curl for /r/",
        "/tw/ as in TWIN — /t/ releases straight into rounded /w/",
      ],
      visual: "phoneme-grid",
      visualLabel: "Common onset clusters in English",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "Why Clusters Break Accents",
      body: [
        "When your native language doesn't permit a cluster, your mouth adds an 'escape vowel' — usually /ə/ or /ɪ/. This is called vowel epenthesis and it's the #1 reason 'street' becomes 'es-treet'.",
        "The reverse also happens at word ends: 'hand' becomes 'han' (deleting the /d/) or 'hands' becomes 'han-duz' (inserting a vowel to separate /ndz/).",
        "Native speakers keep the cluster tight by holding the articulators (tongue, lips, velum) in a chain — each one ready before the previous sound finishes.",
      ],
      bulletPoints: [
        "Epenthesis — adding a vowel inside a cluster (es-treet)",
        "Elision — deleting a consonant from a cluster (han' for hand)",
        "Assimilation — changing a consonant to match its neighbor (n → m before p: in-possible → impossible)",
      ],
      visual: "wave",
      visualLabel: "Waveform of a clean /str/ vs a broken /ə-strə/",
    },
    {
      id: "mouth-thr",
      type: "mouth-diagram",
      title: "The /θr/ in 'three'",
      description:
        "For the /θ/ in 'three', push the tip of your tongue just past your upper front teeth — visible between the teeth — and blow. Then immediately curl the tongue back for the /r/. The tongue never leaves the mouth interior between the two sounds.",
      tonguePosition: "between-teeth",
      lipShape: "slightly-open",
      sound: "θr",
      exampleWord: "three / through / throw",
    },
    {
      id: "mouth-str",
      type: "mouth-diagram",
      title: "The /str/ in 'street'",
      description:
        "For /str/, start the /s/ with the tongue tip near the alveolar ridge (the bumpy ridge behind your upper teeth). Hold that /s/ while the tongue slides into position for /t/, then curl for /r/. Lips are relaxed and slightly rounded through the whole cluster.",
      tonguePosition: "front-mid",
      lipShape: "relaxed",
      sound: "str",
      exampleWord: "street / strong / stripe",
    },
    {
      id: "example-1",
      type: "example",
      title: "Clusters in a Real Sentence",
      phrase: "Three small children splash through the stream",
      ipa: "/θriː smɔːl tʃɪldrən splæʃ θruː ðə striːm/",
      highlightWords: ["Three", "small", "splash", "through", "stream"],
      tip: "Notice how 'three', 'splash', and 'stream' each pack two or three consonants into a single syllable — the mouth barely moves between them.",
      tapWords: [
        { word: "three", ipa: "/θriː/" },
        { word: "small", ipa: "/smɔːl/" },
        { word: "splash", ipa: "/splæʃ/" },
        { word: "through", ipa: "/θruː/" },
        { word: "stream", ipa: "/striːm/" },
      ],
    },
    {
      id: "tap-pronounce",
      type: "tap-pronounce",
      title: "Tap to Hear the Clusters",
      description: "Tap each word. Listen for the absence of a vowel at the start — the cluster begins on a hiss or click, not on 'uh'.",
      words: [
        { word: "street", ipa: "/striːt/", meaning: "/str/" },
        { word: "splash", ipa: "/splæʃ/", meaning: "/spl/" },
        { word: "three", ipa: "/θriː/", meaning: "/θr/" },
        { word: "twin", ipa: "/twɪn/", meaning: "/tw/" },
        { word: "school", ipa: "/skuːl/", meaning: "/sk/" },
        { word: "spy", ipa: "/spaɪ/", meaning: "/sp/" },
        { word: "stay", ipa: "/steɪ/", meaning: "/st/" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Native Trick: The Silent Setup",
      body: "Before you say 'street', silently put your tongue in the /t/ position and your lips in the /r/ position. THEN start the /s/. Because your articulators are already pre-positioned, the cluster comes out perfectly tight. Practicing the silent setup 5 times before each cluster rewires the muscle memory in days, not months.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Drill the Clusters",
      phrase: "Strange students splash through streams",
      ipa: "/streɪndʒ studənts splæʃ θruː striːmz/",
      tip: "Five clusters in one sentence: /str/ (strange), /st/ (students), /spl/ (splash), /θr/ (through), /str/ (streams). Go slow — accuracy first, speed second.",
      passScore: 75,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "Which consonant cluster is hardest for most non-native speakers because it requires the tongue between the teeth AND a curl for /r/?",
      options: ["/st/ as in 'stay'", "/sp/ as in 'spy'", "/θr/ as in 'three'", "/tw/ as in 'twin'"],
      correct: 2,
      explanation:
        "/θr/ combines the interdental /θ/ (tongue between teeth) with the retroflex /r/ (tongue curled back). The transition between these two extreme tongue positions is what makes 'three' and 'through' so difficult — most learners substitute /tr/ (tree) or /dr/ (dree).",
    },
    {
      id: "completion",
      type: "completion",
      title: "Consonant Clusters Complete!",
      subtitle: "You can now stack consonants without inserting escape vowels.",
      xp: 120,
      badge: "🎯 Cluster Crusher",
      nextLessonTitle: "Mouth Positioning",
    },
  ],
};

export default lesson;
