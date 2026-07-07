import type { Lesson } from "../../types";

// Phase 8 — Lesson 4: Master Performance (Capstone)
// Integrate everything from phases 1–8 into a full 4–6 sentence monologue.
// Performance mindset: warm up, mark script, rehearse aloud, record, iterate.
// 12 steps: intro, concept, concept, shadow, rhythm, intonation, compare,
// example, tap-pronounce, tip, practice, quiz, completion.

const lesson: Lesson = {
  id: "p8l4",
  phaseId: 7,
  lessonIndex: 3,
  title: "Master Performance",
  subtitle: "Put it all together — perform a full monologue with native-level mastery",
  duration: 15,
  xp: 250,
  objectives: [
    "Integrate vowel precision, stress, rhythm, linking, reduction, tone, and humor into a single performance",
    "Mark a script for stress, linking, and pauses before delivery",
    "Warm up the voice, rehearse aloud, record, and iterate",
    "Deliver a 4–6 sentence monologue with full prosodic control",
  ],
  steps: [
    {
      id: "intro",
      type: "intro",
      title: "Master Performance",
      subtitle: "The capstone — every skill you've learned, on one stage",
      description:
        "This is the capstone of AccentAI. Everything you've trained across eight phases — vowel precision from Phase 1, stress and rhythm from Phases 2–3, conversational prosody from Phase 4, native compression from Phase 5, mimicry from Phase 6, real-world delivery from Phase 7, tone and humor and regional awareness from Phase 8 — converges here. The test of mastery is not isolated drills. It is whether you can deliver a complete 4–6 sentence monologue with full prosodic control: every vowel in place, every stress landing, every linking seamless, every reduction natural, every contour emotionally right. This lesson teaches the PERFORMANCE mindset — warm up the voice, mark the script, rehearse aloud, record and review, iterate — and gives you a real monologue to perform.",
      visual: "shadow",
      emoji: "👑",
    },
    {
      id: "concept-1",
      type: "concept",
      title: "The Five-Step Performance Protocol",
      body: [
        "Native-level performance is not improvised — it is rehearsed. Every actor, broadcaster, and TED speaker follows a version of the same five-step protocol before stepping on stage. (1) WARM UP the voice: hum softly through your range, stretch your jaw, tongue-twist on 'unique New York' and 'red leather yellow leather' to loosen articulators. Two minutes is enough. (2) MARK THE SCRIPT: before you perform, go through your text and underline stressed words, draw linking arcs between words that fuse, mark pauses with slashes, and annotate emotional peaks with arrows. A marked script is a performance map. (3) REHEARSE ALOUD: read the marked script out loud at half speed, then at full speed, paying attention to each annotation. (4) RECORD AND REVIEW: record yourself, then listen back with eyes closed. (5) ITERATE: identify the two weakest moments, drill them in isolation, then re-record the whole monologue. Three iterations is usually enough to lock in mastery.",
        "Learners skip these steps because they feel mechanical — they want to 'just speak naturally.' But naturalness is the product of rehearsal, not the absence of it. Native speakers who sound effortless have usually rehearsed the same material dozens of times until it became automatic. The protocol above compresses what they do unconsciously into a deliberate process. Follow it for every important performance — interview, presentation, speech, story — and your delivery will sound native within weeks.",
      ],
      bulletPoints: [
        "1. WARM UP — hum, stretch jaw, tongue-twisters (2 min)",
        "2. MARK SCRIPT — underline stress, draw linking arcs, mark pauses",
        "3. REHEARSE ALOUD — half-speed then full-speed with annotations",
        "4. RECORD & REVIEW — listen with eyes closed, identify weak spots",
        "5. ITERATE — drill two weakest moments, re-record whole piece",
      ],
      visual: "phoneme-grid",
      visualLabel: "Five-step performance protocol",
    },
    {
      id: "concept-2",
      type: "concept",
      title: "What 'Mastery' Sounds Like — Integration Tells",
      body: [
        "A master performance is recognizable not by any single feature but by the seamless integration of all features. The tells of mastery are: vowel precision even at fast tempo (no /æ/ collapsing to /ə/ under speed), correct stress on every content word (no stress drift to function words), rhythm that swings between heavy and light beats (not metronomic, not choppy), linking that fuses words across boundaries (no glottal stops between vowels unless deliberate), reductions on the right function words (gonna, wanna, 'em, 'cause) but never on content words, tone that matches the emotional arc of the monologue, and pauses placed at structural boundaries (between clauses, before punchlines, after rhetorical questions).",
        "The opposite of mastery is the 'reading aloud' voice — flat rhythm, equal stress on every word, no linking, no reduction, monotone pitch, pauses in the wrong places. Many learners deliver a monologue this way because they are concentrating on pronunciation, not performance. The fix is to shift attention: once your vowels and stress are automatic (which they should be by Phase 8), redirect your attention to the MEANING and EMOTION of the words. Speak the meaning, not the words. When you do, prosody takes care of itself — because prosody is how meaning sounds.",
      ],
      bulletPoints: [
        "VOWELS — precise even at fast tempo, no /æ/→/ə/ collapse",
        "STRESS — content words heavy, function words light, no drift",
        "RHYTHM — swings between heavy and light, not metronomic",
        "LINKING — words fuse across boundaries, no unwanted glottal stops",
        "REDUCTION — on function words only (gonna, 'em, 'cause), never on content",
        "PAUSES — at clause boundaries, before punchlines, after rhetorical questions",
      ],
      visual: "rhythm",
      visualLabel: "Master rhythm swings between heavy and light",
    },
    {
      id: "shadow-monologue",
      type: "shadow",
      title: "Shadow the Master Monologue",
      phrase: "So there I was, third day on the job, and the CEO walks in. Looks me up and down, doesn't say a word. Walks over to the coffee machine, pours a cup, takes one sip — and just hands it to me. 'You look like you need this more than I do,' he says. I laughed so hard I forgot to be nervous. Been working there six years now.",
      ipa: "/soʊ ðɛr aɪ wʌz θɜrd deɪ ɑn ðə dʒɑb ænd ðə siː-oʊ-iː wɔks ɪn lʊks miː ʌp ænd daʊn dʌznt seɪ ə wɜrd wɔks oʊvər tuː ðə ˈkɔfi məˈʃin pɔrz ə kʌp teɪks wʌn sɪp ænd dʒʌst hændz ɪt tuː miː juː lʊk laɪk juː niːd ðɪs mɔr ðæn aɪ duː hiː sɛz aɪ læft soʊ hɑrd aɪ fərˈɡɒt tuː biː ˈnɜrvəs bɪn ˈwɜrkɪŋ ðɛr sɪks jɪrz naʊ/",
      description:
        "This six-sentence monologue integrates every skill you've learned. Notice: the casual opener 'So there I was' with reduced 'there' (/ðɛr/ not /ðɛər/), the linking across 'walks in' and 'pours a cup', the stress peaks on 'CEO', 'coffee', 'sip', 'hands', 'need', 'laughed', 'forgot', the parenthetical pause before 'and just hands it to me', the quoted CEO line in a slightly different tone (deeper, more measured), the punchline 'I laughed so hard I forgot to be nervous' with rising comic energy, and the dry resolution 'Been working there six years now' delivered low and falling. Shadow this at half speed first, then full speed. Feel the rhythm swing.",
    },
    {
      id: "rhythm-key",
      type: "rhythm",
      title: "Beat Map — The Monologue's Climax",
      phrase: "I laughed so hard I forgot to be nervous.",
      beats: [
        { text: "I", duration: 0.4, stressed: false },
        { text: "LAUGHED", duration: 1.8, stressed: true },
        { text: "so", duration: 0.5, stressed: false },
        { text: "HARD", duration: 1.6, stressed: true },
        { text: "I", duration: 0.4, stressed: false },
        { text: "for-", duration: 0.8, stressed: false },
        { text: "GOT", duration: 1.4, stressed: true },
        { text: "to", duration: 0.4, stressed: false },
        { text: "be", duration: 0.4, stressed: false },
        { text: "NER-", duration: 1.6, stressed: true },
        { text: "vous.", duration: 0.9, stressed: false },
      ],
      description:
        "This is the comic climax of the monologue. The rhythm pattern is the engine of the joke: light-LAUGHED-light-HARD-light-light-GOT-light-light-NER-vous. Three heavy beats ('LAUGHED', 'HARD', 'GOT') land in sequence, each separated by fast light beats — this creates a rolling comedic momentum. 'NER-' is the fourth heavy beat, the surprise landing where the joke reveals its meaning. The unstressed 'vous' trails off softly, the comic resolution. Without this heavy-light-heavy-light-heavy-light-heavy-light pattern, the line would fall flat. Practice beating it out on a table — feel the swing.",
    },
    {
      id: "intonation-peak",
      type: "intonation",
      title: "Pitch Contour — Emotional Peak",
      phrase: "You look like you need this more than I do.",
      contour: [
        { x: 5, y: 35 },
        { x: 12, y: 48 },
        { x: 20, y: 42 },
        { x: 28, y: 38 },
        { x: 36, y: 55 },
        { x: 44, y: 60 },
        { x: 52, y: 70 },
        { x: 60, y: 78 },
        { x: 68, y: 65 },
        { x: 76, y: 50 },
        { x: 84, y: 38 },
        { x: 92, y: 28 },
        { x: 96, y: 22 },
      ],
      pattern: "rise-fall",
      description:
        "This is the CEO's line — the monologue's emotional peak. The contour is a rise-fall that builds across 'You look like you need' (y 35→60), peaks on 'this' (y 78 — the highest point, the offer of the coffee), then falls steadily through 'more than I do' (y 78→22). The peak on 'this' is the generosity of the gesture; the long fall after is the casual delivery that makes it land as warm humor rather than awkward grandstanding. A master performer shapes this contour deliberately — the rise-fall is what makes the CEO sound both kind and confident.",
    },
    {
      id: "compare-flat-vs-master",
      type: "compare",
      title: "Flat Reading vs Master Performance",
      nativePhrase: "Master performance — same monologue, integrated prosody",
      learnerPhrase: "Flat reading — same words, no integration",
      nativeIpa: "/soʊ ðɛr aɪ wʌz θɜrd deɪ ɑn ðə dʒɑb ænd ðə siː-oʊ-iː wɔks ɪn/",
      learnerIpa: "/soʊ ðɛər aɪ wʌz θɜːd deɪ ɒn ðə dʒɒb ænd ðə siː-oʊ-iː wɔːks ɪn/",
      description:
        "The difference is integration. The flat reading (learner side) has full vowels on every word, no reductions, no linking, equal stress, monotone pitch — technically correct English that sounds robotic. The master performance (native side) reduces 'there' to /ðɛr/, links 'walks in', swings rhythm between heavy and light, and the pitch rises on 'CEO'. Same words — different performance. The master version sounds like a person telling a story; the flat version sounds like a textbook reading it. Your goal in Phase 8 is to cross from the flat version to the master version. The crossing is integration: letting each skill flow into the next without conscious effort.",
    },
    {
      id: "example-integrated",
      type: "example",
      title: "Integrated Skills — Every Word Tells",
      phrase: "So there I was, third day on the job — and the CEO walks in.",
      ipa: "/soʊ ðɛr aɪ wʌz θɜrd deɪ ɑn ðə dʒɑb ænd ðə siː-oʊ-iː wɔks ɪn/",
      highlightWords: ["So", "there", "was", "third", "day", "job", "CEO", "walks", "in"],
      tip: "Look at the integrated skills in one sentence: (1) REDUCTION — 'there' is /ðɛr/ not /ðɛər/, 'on the' fuses to /ɑn ðə/. (2) LINKING — 'walks in' links consonant-to-vowel as /wɔks ɪn/, no glottal stop. (3) STRESS — content words 'third', 'day', 'CEO' get heavy beats; function words 'on the', 'and the' stay light. (4) VOWEL PRECISION — /ɜrd/ in 'third' is the Phase 1 /ɜː/ + /d/ cluster, /oʊ-iː/ in 'CEO' is two Phase 1 vowels back-to-back. (5) TONE — the sentence opens low and casual, rises on 'CEO' (the surprise arrival). Five phases of training in one sentence. That's integration.",
      tapWords: [
        { word: "there", ipa: "/ðɛr/" },
        { word: "third", ipa: "/θɜrd/" },
        { word: "CEO", ipa: "/ˌsiː-iː-ˈoʊ/" },
        { word: "walks", ipa: "/wɔks/" },
      ],
    },
    {
      id: "tap-pronounce-key",
      type: "tap-pronounce",
      title: "Key Words From the Monologue",
      description: "Tap each word. These are the integrated-skill tells from the monologue — each one demonstrates a different phase of training coming together in performance.",
      words: [
        { word: "there (reduced)", ipa: "/ðɛr/", meaning: "Phase 5 — reduction, not /ðɛər/" },
        { word: "third", ipa: "/θɜrd/", meaning: "Phase 1 — /θ/ + /ɜr/ + /d/ cluster" },
        { word: "CEO", ipa: "/ˌsiː-iː-ˈoʊ/", meaning: "Phase 1 — three vowels in sequence" },
        { word: "walks in", ipa: "/wɔks ɪn/", meaning: "Phase 3 — consonant-to-vowel linking" },
        { word: "pours a", ipa: "/pɔrz ə/", meaning: "Phase 5 — function-word /ə/ reduction" },
        { word: "forgot", ipa: "/fərˈɡɒt/", meaning: "Phase 2 — stress on second syllable" },
        { word: "nervous", ipa: "/ˈnɜrvəs/", meaning: "Phase 1 — /ɜr/ + schwa ending" },
        { word: "six years", ipa: "/sɪks jɪrz/", meaning: "Phase 1 — final /ks/ + /j/ glide" },
      ],
    },
    {
      id: "tip-1",
      type: "tip",
      title: "💡 Master Trick — Listen With Your Eyes Closed",
      body: "Record yourself performing the full monologue, then listen back with your eyes closed. If it sounds like a stranger speaking — someone you don't recognize — you have hit native-level performance. Your own voice should surprise you. Why? Because the speaker you hear is shaped by your performance choices (rhythm, tone, reductions) rather than your self-image, and when those choices are native-shaped, the result sounds like a different person. If instead the recording sounds like 'you reading English' — your native accent bleeding through, your careful school-trained vowels — then you have not yet crossed into mastery. Iterate: identify the two moments where 'you' most clearly comes through, drill those moments in isolation, re-record. Within three iterations you should hear a stranger. That stranger is your native English voice.",
      variant: "success",
    },
    {
      id: "practice",
      type: "practice",
      title: "Perform the Monologue",
      phrase: "So there I was, third day on the job, and the CEO walks in. Looks me up and down, doesn't say a word. Walks over to the coffee machine, pours a cup, takes one sip — and just hands it to me. 'You look like you need this more than I do,' he says. I laughed so hard I forgot to be nervous. Been working there six years now.",
      ipa: "/soʊ ðɛr aɪ wʌz θɜrd deɪ ɑn ðə dʒɑb ænd ðə siː-oʊ-iː wɔks ɪn lʊks miː ʌp ænd daʊn dʌznt seɪ ə wɜrd wɔks oʊvər tuː ðə ˈkɔfi məˈʃin pɔrz ə kʌp teɪks wʌn sɪp ænd dʒʌst hændz ɪt tuː miː juː lʊk laɪk juː niːd ðɪs mɔr ðæn aɪ duː hiː sɛz aɪ læft soʊ hɑrd aɪ fərˈɡɒt tuː biː ˈnɜrvəs bɪn ˈwɜrkɪŋ ðɛr sɪks jɪrz naʊ/",
      tip: "Follow the five-step protocol: (1) Warm up with two minutes of humming and tongue-twisters. (2) Mark the script — underline 'CEO', 'coffee', 'sip', 'hands', 'need', 'laughed', 'forgot', 'six years'; draw linking arcs under 'walks in' and 'pours a cup'; mark a pause before 'and just hands it to me'. (3) Rehearse at half speed, then full speed. (4) Record yourself. (5) Listen back with eyes closed — does it sound like a stranger? If yes, you've performed at native level. If not, drill the two weakest moments and re-record.",
      passScore: 85,
    },
    {
      id: "quiz",
      type: "quiz",
      question: "You have to deliver a 4-minute monologue at a friend's wedding toast tomorrow. Which of these is the MOST important thing to do before you stand up to speak?",
      options: [
        "Memorize the words perfectly so you don't have to look at notes",
        "Mark the script for stress, linking, pauses, and emotional peaks — then rehearse aloud at least three times and record yourself once to review",
        "Drink warm tea with honey to soothe your throat right before going up",
        "Read the script silently one more time to make sure you understand every word",
      ],
      correct: 1,
      explanation:
        "Option 2 is correct — the marked-script-plus-rehearse-aloud-plus-record protocol is the single highest-leverage preparation for any spoken performance. Memorization alone (option 1) produces a flat, robotic delivery because the brain is occupied with recall, not meaning. Warm tea (option 3) helps the voice physically but does nothing for prosodic preparation — it's a comfort, not a technique. Silent reading (option 4) is the lowest-value preparation possible because prosody only emerges when you speak aloud. The marked script forces you to decide in advance where stress, linking, and pauses fall — so under pressure you don't have to improvise them. Rehearsing aloud trains the motor memory. Recording and reviewing catches the weak spots before the real audience does. This is the master-level protocol and it works for any spoken performance — interview, presentation, toast, or story.",
    },
    {
      id: "completion",
      type: "completion",
      title: "Master Performance Complete — You Did It!",
      subtitle: "You have completed the capstone of AccentAI. You can now deliver a full monologue with integrated mastery — vowel precision, stress, rhythm, linking, reduction, tone, and humor all working as one. Your English voice is no longer a learned skill. It's a voice you own.",
      xp: 250,
      badge: "👑 Accent Master",
      nextLessonTitle: "You've completed AccentAI! Revisit any lesson to keep your skills sharp.",
    },
  ],
};

export default lesson;
